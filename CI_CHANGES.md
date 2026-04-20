# CI Changes Summary

Ngay cap nhat: 2026-04-20

Tai lieu nay tong hop cac thay doi CI/CD da duoc ap dung trong ngay hom nay.

## Thay doi da ap dung

### 1) Cap nhat ignore cho mobile artifacts

- Da bo sung cac rule sau trong [.gitignore](.gitignore):
  - `mobile-fe/android/`
  - `mobile-fe/ios/`
  - `*.apk`
  - `*.aab`
  - `*.ipa`
  - `*.jar`
- Da xoa dong `.kotlin/` bi trung lap sau khi chen block moi.

Reference:

- [.gitignore](.gitignore)

### 2) Tach block Docker report lap lai thanh reusable composite action

- Da tao composite action moi tai [.github/actions/docker-report/action.yml](.github/actions/docker-report/action.yml).
- Da thay 2 step report trong workflow:
  - `build-backend`
  - `build-ai`
- Muc tieu: giam duplication va gom logic report image size/build duration/cache proxy vao 1 noi.

Reference:

- [.github/actions/docker-report/action.yml](.github/actions/docker-report/action.yml)
- [.github/workflows/ci.yml](.github/workflows/ci.yml)

### 3) Tach block DORA metrics lap lai thanh reusable composite action

- Da tao composite action moi tai [.github/actions/dora-report/action.yml](.github/actions/dora-report/action.yml).
- Da thay 2 block script DORA trong:
  - `deploy-backend`
  - `deploy-frontend`
- Da bo step `Record deploy start` vi khong con duoc su dung sau khi truu tuong hoa.

Reference:

- [.github/actions/dora-report/action.yml](.github/actions/dora-report/action.yml)
- [.github/workflows/ci.yml](.github/workflows/ci.yml)

### 4) Lam sach workflow va bo emoji trong code CI

- Da chuan hoa thong diep status trong Step Summary sang text thuong (PASS/FAIL/WARNING), khong dung emoji.
- Da cap nhat noi dung thong bao Slack failure trong workflow de khong dung emoji.

Reference:

- [.github/workflows/ci.yml](.github/workflows/ci.yml)

## Luu y van hanh

- Cac composite action moi su dung shell `bash` va ghi report qua `$GITHUB_STEP_SUMMARY`.
- Workflow van phu thuoc cac secret sau:
  - `RENDER_BE_DEPLOY_HOOK`
  - `VERCEL_DEPLOY_HOOK`
  - `SLACK_WEBHOOK_URL`
  - `GITHUB_TOKEN`
- Build report/frontend-mobile van can cac utility co san tren Ubuntu runner: `bc`, `gzip`, `find`, `awk`, `du`.

## Tac dong maintainability (du kien)

- Giam do lap lai o cac block report Docker va DORA metrics.
- `ci.yml` gon hon, de review va bao tri hon.
- Logic bao cao duoc gom vao cac action co the tai su dung va test doc lap.
