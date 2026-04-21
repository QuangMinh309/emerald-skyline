import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ownerRepo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const workflowFile = process.env.WORKFLOW_FILE || "ci.yml";
const days = Number(process.env.METRIC_DAYS || "30");
const outputDir = resolve(process.env.METRIC_OUTPUT_DIR || "artifacts/cicd-metrics");

if (!ownerRepo) {
  throw new Error("Missing GITHUB_REPOSITORY env");
}
if (!token) {
  throw new Error("Missing GITHUB_TOKEN env");
}

const [owner, repo] = ownerRepo.split("/");
if (!owner || !repo) {
  throw new Error(`Invalid GITHUB_REPOSITORY: ${ownerRepo}`);
}

const nowMs = Date.now();
const cutoffMs = nowMs - days * 24 * 60 * 60 * 1000;

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

const toIso = (value) => new Date(value).toISOString();

const parseSeconds = (startedAt, completedAt) => {
  if (!startedAt || !completedAt) return null;
  const delta = (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000;
  if (!Number.isFinite(delta) || delta < 0) return null;
  return Math.round(delta);
};

const avg = (items) => {
  if (!items.length) return null;
  return Math.round(items.reduce((a, b) => a + b, 0) / items.length);
};

const percentile = (items, p) => {
  if (!items.length) return null;
  const sorted = [...items].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
};

const ghGet = async (url) => {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status} at ${url}\n${text}`);
  }
  return response.json();
};

const fetchWorkflowRuns = async () => {
  const runs = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/runs?per_page=100&page=${page}`;
    const data = await ghGet(url);
    const pageRuns = data.workflow_runs || [];
    if (!pageRuns.length) break;

    let shouldStop = false;
    for (const run of pageRuns) {
      const createdMs = new Date(run.created_at).getTime();
      if (createdMs < cutoffMs) {
        shouldStop = true;
        continue;
      }
      runs.push(run);
    }

    if (shouldStop) break;
    if (pageRuns.length < 100) break;
    page += 1;
  }

  return runs;
};

const fetchRunJobs = async (runId) => {
  const jobs = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/jobs?per_page=100&page=${page}`;
    const data = await ghGet(url);
    const pageJobs = data.jobs || [];
    if (!pageJobs.length) break;
    jobs.push(...pageJobs);
    if (pageJobs.length < 100) break;
    page += 1;
  }

  return jobs;
};

const loadCiYaml = () => {
  const ciPath = resolve(".github/workflows/ci.yml");
  return readFileSync(ciPath, "utf8");
};

const staticChecks = (ciYaml) => {
  const hasActionlint = /actionlint/.test(ciYaml);
  const hasSlackFailureNotification = /Notify Slack on Failure/.test(ciYaml);
  const hasPathFilter = /dorny\/paths-filter@v3/.test(ciYaml);
  const hasCoverageGate = /--cov-fail-under=80/.test(ciYaml);
  const hasComplexityHardGate = /--max-complexity=10/.test(ciYaml) && !/--exit-zero/.test(ciYaml);

  const hardcodedVersionRegex = /(node-version|python-version|java-version):\s*["']?\d+(?:\.\d+)?["']?/g;
  const hardcodedVersionCount = (ciYaml.match(hardcodedVersionRegex) || []).length;

  const setupNodeUseCount = (ciYaml.match(/actions\/setup-node@v4/g) || []).length;
  const workflowLines = ciYaml.split("\n").length;

  return {
    hasActionlint,
    hasSlackFailureNotification,
    hasPathFilter,
    hasCoverageGate,
    hasComplexityHardGate,
    hardcodedVersionCount,
    setupNodeUseCount,
    workflowLines,
  };
};

const ensureDir = (filePath) => {
  mkdirSync(dirname(filePath), { recursive: true });
};

const writeJson = (filePath, payload) => {
  ensureDir(filePath);
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
};

const writeText = (filePath, payload) => {
  ensureDir(filePath);
  writeFileSync(filePath, payload, "utf8");
};

const main = async () => {
  console.log(`[collect-cicd-metrics] Repository: ${ownerRepo}`);
  console.log(`[collect-cicd-metrics] Window: last ${days} days`);

  const runs = await fetchWorkflowRuns();
  const runJobs = [];
  for (const run of runs) {
    const jobs = await fetchRunJobs(run.id);
    runJobs.push({ runId: run.id, jobs });
  }

  const deployJobs = [];
  const backendBuildDurations = [];
  const aiBuildDurations = [];
  const frontendBuildDurations = [];
  const leadTimes = [];

  for (const row of runJobs) {
    const run = runs.find((r) => r.id === row.runId);
    if (!run) continue;

    for (const job of row.jobs) {
      const durationSec = parseSeconds(job.started_at, job.completed_at);

      if (job.name === "Build Backend (Docker)" && durationSec !== null) {
        backendBuildDurations.push(durationSec);
      }
      if (job.name === "Build AI Service (Docker)" && durationSec !== null) {
        aiBuildDurations.push(durationSec);
      }
      if (job.name === "Build React Web" && durationSec !== null) {
        frontendBuildDurations.push(durationSec);
      }

      if (job.name === "Deploy Backend to Render" || job.name === "Deploy Frontend to Vercel") {
        deployJobs.push({
          runId: run.id,
          runNumber: run.run_number,
          branch: run.head_branch,
          sha: run.head_sha,
          deployJob: job.name,
          status: job.conclusion || "unknown",
          runCreatedAt: run.created_at,
          deployCompletedAt: job.completed_at,
        });

        if (job.completed_at) {
          const leadSec = parseSeconds(run.created_at, job.completed_at);
          if (leadSec !== null) {
            leadTimes.push(leadSec);
          }
        }
      }
    }
  }

  const runSuccessCount = runs.filter((r) => r.conclusion === "success").length;
  const runFailureCount = runs.filter((r) => r.conclusion === "failure").length;
  const rerunSuccessCount = runs.filter((r) => r.run_attempt > 1 && r.conclusion === "success").length;

  const deploySuccessCount = deployJobs.filter((j) => j.status === "success").length;
  const deployFailureCount = deployJobs.filter((j) => j.status === "failure").length;

  const dockerDurations = [...backendBuildDurations, ...aiBuildDurations];
  const dockerCacheHitProxy = dockerDurations.length
    ? (dockerDurations.filter((s) => s < 60).length / dockerDurations.length) * 100
    : null;

  const ciYaml = loadCiYaml();
  const staticResult = staticChecks(ciYaml);

  const summary = {
    metadata: {
      repository: ownerRepo,
      workflowFile,
      generatedAt: toIso(nowMs),
      periodDays: days,
      runCount: runs.length,
      deployJobCount: deployJobs.length,
    },
    metrics: {
      D1_pipeline_speed: {
        M1_1_deployment_frequency_per_day:
          days > 0 ? Number((deploySuccessCount / days).toFixed(4)) : null,
        M1_2_lead_time_seconds_avg: avg(leadTimes),
        M1_2_lead_time_seconds_p50: percentile(leadTimes, 50),
        M1_2_lead_time_seconds_p90: percentile(leadTimes, 90),
        M1_3_backend_build_seconds_avg: avg(backendBuildDurations),
        M1_3_ai_build_seconds_avg: avg(aiBuildDurations),
        M1_4_frontend_build_seconds_avg: avg(frontendBuildDurations),
      },
      D2_code_quality: {
        M2_1_change_failure_rate_percent:
          deploySuccessCount + deployFailureCount > 0
            ? Number(((deployFailureCount / (deploySuccessCount + deployFailureCount)) * 100).toFixed(2))
            : null,
        M2_3_test_coverage_gate_enabled: staticResult.hasCoverageGate,
        M2_4_static_analysis_gate_enabled: staticResult.hasComplexityHardGate,
        M2_5_pipeline_smell_lint_enabled: staticResult.hasActionlint,
      },
      D3_pipeline_stability: {
        M3_2_build_success_rate_percent:
          runs.length > 0 ? Number(((runSuccessCount / runs.length) * 100).toFixed(2)) : null,
        M3_3_flaky_job_rate_proxy_percent:
          runs.length > 0 ? Number(((rerunSuccessCount / runs.length) * 100).toFixed(2)) : null,
        M3_4_failure_notification_configured: staticResult.hasSlackFailureNotification,
      },
      D4_artifact_optimization: {
        M4_5_docker_cache_hit_rate_proxy_percent:
          dockerCacheHitProxy === null ? null : Number(dockerCacheHitProxy.toFixed(2)),
      },
      D5_pipeline_maintainability: {
        M5_1_path_based_change_detection_enabled: staticResult.hasPathFilter,
        M5_4_hardcoded_version_string_count: staticResult.hardcodedVersionCount,
        M5_6_setup_node_repetition_count: staticResult.setupNodeUseCount,
        M5_6_workflow_loc: staticResult.workflowLines,
      },
    },
  };

  const csvRows = [
    ["metric_id", "metric_name", "value", "unit", "period_days"],
    ["M1.1", "Deployment Frequency", summary.metrics.D1_pipeline_speed.M1_1_deployment_frequency_per_day ?? "", "deploy/day", days],
    ["M1.2(avg)", "Lead Time for Changes", summary.metrics.D1_pipeline_speed.M1_2_lead_time_seconds_avg ?? "", "seconds", days],
    ["M1.3(be)", "Backend Build Duration", summary.metrics.D1_pipeline_speed.M1_3_backend_build_seconds_avg ?? "", "seconds", days],
    ["M1.3(ai)", "AI Build Duration", summary.metrics.D1_pipeline_speed.M1_3_ai_build_seconds_avg ?? "", "seconds", days],
    ["M1.4", "Frontend Build Time", summary.metrics.D1_pipeline_speed.M1_4_frontend_build_seconds_avg ?? "", "seconds", days],
    ["M2.1", "Change Failure Rate", summary.metrics.D2_code_quality.M2_1_change_failure_rate_percent ?? "", "%", days],
    ["M3.2", "Build Success Rate", summary.metrics.D3_pipeline_stability.M3_2_build_success_rate_percent ?? "", "%", days],
    ["M3.3", "Flaky Job Rate (Proxy)", summary.metrics.D3_pipeline_stability.M3_3_flaky_job_rate_proxy_percent ?? "", "%", days],
    ["M4.5", "Docker Cache Hit Rate (Proxy)", summary.metrics.D4_artifact_optimization.M4_5_docker_cache_hit_rate_proxy_percent ?? "", "%", days],
    ["M5.4", "Hardcoded Version Strings", summary.metrics.D5_pipeline_maintainability.M5_4_hardcoded_version_string_count ?? "", "count", days],
    ["M5.6", "Workflow LOC", summary.metrics.D5_pipeline_maintainability.M5_6_workflow_loc ?? "", "lines", days],
  ];

  const csv = csvRows
    .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const evidenceMd = [
    "# CI/CD Metrics Evidence",
    "",
    `- Repository: ${ownerRepo}`,
    `- Workflow: ${workflowFile}`,
    `- Generated at: ${summary.metadata.generatedAt}`,
    `- Analysis window: ${days} days`,
    `- Workflow runs analyzed: ${summary.metadata.runCount}`,
    `- Deploy jobs analyzed: ${summary.metadata.deployJobCount}`,
    "",
    "## D1 Pipeline Speed",
    `- M1.1 Deployment Frequency: ${summary.metrics.D1_pipeline_speed.M1_1_deployment_frequency_per_day ?? "N/A"} deploy/day`,
    `- M1.2 Lead Time avg/p50/p90: ${summary.metrics.D1_pipeline_speed.M1_2_lead_time_seconds_avg ?? "N/A"}/${summary.metrics.D1_pipeline_speed.M1_2_lead_time_seconds_p50 ?? "N/A"}/${summary.metrics.D1_pipeline_speed.M1_2_lead_time_seconds_p90 ?? "N/A"} s`,
    `- M1.3 Backend/AI build avg: ${summary.metrics.D1_pipeline_speed.M1_3_backend_build_seconds_avg ?? "N/A"}/${summary.metrics.D1_pipeline_speed.M1_3_ai_build_seconds_avg ?? "N/A"} s`,
    `- M1.4 Frontend build avg: ${summary.metrics.D1_pipeline_speed.M1_4_frontend_build_seconds_avg ?? "N/A"} s`,
    "",
    "## D2 Code Quality",
    `- M2.1 Change Failure Rate: ${summary.metrics.D2_code_quality.M2_1_change_failure_rate_percent ?? "N/A"}%`,
    `- M2.3 Coverage gate enabled: ${summary.metrics.D2_code_quality.M2_3_test_coverage_gate_enabled}`,
    `- M2.4 Static analysis hard gate: ${summary.metrics.D2_code_quality.M2_4_static_analysis_gate_enabled}`,
    `- M2.5 Pipeline smell lint enabled: ${summary.metrics.D2_code_quality.M2_5_pipeline_smell_lint_enabled}`,
    "",
    "## D3 Pipeline Stability",
    `- M3.2 Build Success Rate: ${summary.metrics.D3_pipeline_stability.M3_2_build_success_rate_percent ?? "N/A"}%`,
    `- M3.3 Flaky Job Rate (proxy): ${summary.metrics.D3_pipeline_stability.M3_3_flaky_job_rate_proxy_percent ?? "N/A"}%`,
    `- M3.4 Failure notification configured: ${summary.metrics.D3_pipeline_stability.M3_4_failure_notification_configured}`,
    "",
    "## D4 Artifact Optimization",
    `- M4.5 Docker cache hit rate (proxy): ${summary.metrics.D4_artifact_optimization.M4_5_docker_cache_hit_rate_proxy_percent ?? "N/A"}%`,
    "",
    "## D5 Pipeline Maintainability",
    `- M5.1 Path-based change detection: ${summary.metrics.D5_pipeline_maintainability.M5_1_path_based_change_detection_enabled}`,
    `- M5.4 Hardcoded version string count: ${summary.metrics.D5_pipeline_maintainability.M5_4_hardcoded_version_string_count}`,
    `- M5.6 setup-node repetition count: ${summary.metrics.D5_pipeline_maintainability.M5_6_setup_node_repetition_count}`,
    `- M5.6 workflow LOC: ${summary.metrics.D5_pipeline_maintainability.M5_6_workflow_loc}`,
    "",
  ].join("\n");

  const runsFile = resolve(outputDir, "raw-runs.json");
  const jobsFile = resolve(outputDir, "raw-jobs.json");
  const summaryFile = resolve(outputDir, "metrics-summary.json");
  const csvFile = resolve(outputDir, "metrics-summary.csv");
  const evidenceFile = resolve(outputDir, "metrics-evidence.md");

  writeJson(runsFile, runs);
  writeJson(jobsFile, runJobs);
  writeJson(summaryFile, summary);
  writeText(csvFile, `${csv}\n`);
  writeText(evidenceFile, evidenceMd);

  console.log(`[collect-cicd-metrics] Output: ${outputDir}`);
  console.log(`[collect-cicd-metrics] Done.`);
};

main().catch((error) => {
  console.error("[collect-cicd-metrics] Failed:", error);
  process.exit(1);
});