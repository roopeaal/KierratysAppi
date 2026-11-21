# External blockers

- A broad Finnish offline barcode-to-packaging expansion still needs a
  source with verified bulk reuse rights and coverage. The manually reviewed
  single-GTIN observation and online Open Food Facts lookup do not depend on it.

- Physical Samsung acceptance is unperformed: no device available. Emulator
  evidence does not certify its camera, permissions, accessibility or performance.
- Public production hosting, store accounts/submission and applicable privacy/
  operational approvals are not completed. No production GO is asserted.
- A production-signed physical device verification is still open. The owner
  verified the light appearance and Overview shortcut on development build 29.
  Roope/operator must select TLS hosting/domain, enforce generated web headers,
  restrict secrets/log access and define retention/recovery. Current local image
  server is not a public authenticated service; see ../security.md for exact gates.
- Recognition generalization and memory/energy work remain engineering tasks,
  not resolved by repository cleanup. Evidence limits: ../testing.md.
