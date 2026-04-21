import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const summaryPath = resolve(process.env.METRIC_SUMMARY_FILE || "artifacts/cicd-metrics/metrics-summary.json");
const outputPath = resolve(process.env.METRIC_TEST_OUTPUT || "artifacts/cicd-metrics/metric-test-report.md");
const outputJsonPath = resolve(process.env.METRIC_TEST_OUTPUT_JSON || "artifacts/cicd-metrics/metric-test-report.json");
const strict = String(process.env.METRIC_TEST_STRICT || "false").toLowerCase() === "true";

const ensureDir = (filePath) => {
  mkdirSync(dirname(filePath), { recursive: true });
};

const parseSummary = () => {
  const raw = readFileSync(summaryPath, "utf8");
  return JSON.parse(raw);
};

const evaluate = (summary) => {
  const m = summary.metrics;
  const checks = [];

  const push = (id, metric, value, target, status, evidence) => {
    checks.push({ id, metric, value, target, status, evidence });
  };

  const valueOrNA = (value) => (value === null || value === undefined ? "N/A" : value);

  const leadP50 = m.D1_pipeline_speed.M1_2_lead_time_seconds_p50;
  if (leadP50 == null) {
    push("M1.2", "Lead Time for Changes (p50)", "N/A", "< 3600s", "N/A", "No deploy job data in analysis window");
  } else {
    push(
      "M1.2",
      "Lead Time for Changes (p50)",
      leadP50,
      "< 3600s",
      leadP50 < 3600 ? "PASS" : "FAIL",
      "Forsgren 2018 Elite threshold",
    );
  }

  const cfr = m.D2_code_quality.M2_1_change_failure_rate_percent;
  if (cfr == null) {
    push("M2.1", "Change Failure Rate", "N/A", "< 5%", "N/A", "No deploy outcome data in analysis window");
  } else {
    push("M2.1", "Change Failure Rate", cfr, "< 5%", cfr < 5 ? "PASS" : "FAIL", "Forsgren 2018 Elite threshold");
  }

  push(
    "M2.3",
    "Test Coverage Gate",
    valueOrNA(m.D2_code_quality.M2_3_test_coverage_gate_enabled),
    "Enabled + cov-fail-under >=80",
    m.D2_code_quality.M2_3_test_coverage_gate_enabled ? "PASS" : "FAIL",
    "Zampetti 2020 testing bad smells",
  );

  push(
    "M2.4",
    "Static Analysis Hard Gate",
    valueOrNA(m.D2_code_quality.M2_4_static_analysis_gate_enabled),
    "Enabled + no --exit-zero",
    m.D2_code_quality.M2_4_static_analysis_gate_enabled ? "PASS" : "FAIL",
    "Zampetti 2020 build bad smells",
  );

  push(
    "M2.5",
    "Pipeline Config Smell Linter",
    valueOrNA(m.D2_code_quality.M2_5_pipeline_smell_lint_enabled),
    "Enabled",
    m.D2_code_quality.M2_5_pipeline_smell_lint_enabled ? "PASS" : "FAIL",
    "Vassallo 2020",
  );

  const successRate = m.D3_pipeline_stability.M3_2_build_success_rate_percent;
  if (successRate == null) {
    push("M3.2", "Build Success Rate", "N/A", ">= 95%", "N/A", "No workflow run data in analysis window");
  } else {
    push("M3.2", "Build Success Rate", successRate, ">= 95%", successRate >= 95 ? "PASS" : "FAIL", "Zampetti 2020 + Shahin 2018");
  }

  const flakyRate = m.D3_pipeline_stability.M3_3_flaky_job_rate_proxy_percent;
  if (flakyRate == null) {
    push("M3.3", "Flaky Job Rate (Proxy)", "N/A", "< 2%", "N/A", "No workflow run data in analysis window");
  } else {
    push("M3.3", "Flaky Job Rate (Proxy)", flakyRate, "< 2%", flakyRate < 2 ? "PASS" : "FAIL", "Zampetti 2020");
  }

  push(
    "M3.4",
    "Failure Notification Latency Readiness",
    valueOrNA(m.D3_pipeline_stability.M3_4_failure_notification_configured),
    "Slack failure notification enabled",
    m.D3_pipeline_stability.M3_4_failure_notification_configured ? "PASS" : "FAIL",
    "Shahin 2018 fast feedback",
  );

  const cacheHit = m.D4_artifact_optimization.M4_5_docker_cache_hit_rate_proxy_percent;
  if (cacheHit == null) {
    push("M4.5", "Docker Cache Hit Rate (Proxy)", "N/A", ">= 70%", "N/A", "No Docker build data in analysis window");
  } else {
    push("M4.5", "Docker Cache Hit Rate (Proxy)", cacheHit, ">= 70%", cacheHit >= 70 ? "PASS" : "FAIL", "Amor 2022 + Rosa 2025");
  }

  push(
    "M5.1",
    "Path-based Change Detection",
    valueOrNA(m.D5_pipeline_maintainability.M5_1_path_based_change_detection_enabled),
    "Enabled",
    m.D5_pipeline_maintainability.M5_1_path_based_change_detection_enabled ? "PASS" : "FAIL",
    "Trase 2018 monorepo selective build",
  );

  const hardcodedCount = m.D5_pipeline_maintainability.M5_4_hardcoded_version_string_count;
  push(
    "M5.4",
    "Hardcoded Version String Count",
    valueOrNA(hardcodedCount),
    "0",
    hardcodedCount === 0 ? "PASS" : "FAIL",
    "Dipenta 2021 + Vassallo 2020",
  );

  return checks;
};

const toMarkdown = (summary, checks) => {
  const lines = [];
  lines.push("# CI/CD Metric Test Report");
  lines.push("");
  lines.push(`- Generated at: ${summary.metadata.generatedAt}`);
  lines.push(`- Repository: ${summary.metadata.repository}`);
  lines.push(`- Window: ${summary.metadata.periodDays} days`);
  lines.push(`- Runs analyzed: ${summary.metadata.runCount}`);
  lines.push("");
  lines.push("| Metric ID | Metric | Value | Target | Status | Evidence Source |");
  lines.push("| :--- | :--- | :--- | :--- | :--- | :--- |");
  for (const c of checks) {
    lines.push(`| ${c.id} | ${c.metric} | ${c.value} | ${c.target} | ${c.status} | ${c.evidence} |`);
  }
  lines.push("");

  const passCount = checks.filter((c) => c.status === "PASS").length;
  const failCount = checks.filter((c) => c.status === "FAIL").length;
  const naCount = checks.filter((c) => c.status === "N/A").length;
  lines.push(`- PASS: ${passCount}`);
  lines.push(`- FAIL: ${failCount}`);
  lines.push(`- N/A: ${naCount}`);
  lines.push(`- Strict mode: ${strict}`);

  return lines.join("\n");
};

const main = () => {
  const summary = parseSummary();
  const checks = evaluate(summary);

  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      strict,
      summaryFile: summaryPath,
    },
    checks,
  };

  const markdown = toMarkdown(summary, checks);

  ensureDir(outputPath);
  ensureDir(outputJsonPath);
  writeFileSync(outputPath, `${markdown}\n`, "utf8");
  writeFileSync(outputJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const failCount = checks.filter((c) => c.status === "FAIL").length;

  console.log(`[run-metric-tests] Report: ${outputPath}`);
  console.log(`[run-metric-tests] JSON: ${outputJsonPath}`);
  console.log(`[run-metric-tests] Fail count: ${failCount}`);

  if (strict && failCount > 0) {
    process.exit(1);
  }
};

main();