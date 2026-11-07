# Locked robustness decision before held-out inference — November7,2026

Selection: **none**. The preregistered16-case validation runs48 local process
executions, all observed with unchanged hashes. Current V4 baseline accepts all
ten positive forms correctly but wrongly accepts the mixed bag-and-box scene as
one box; five other controls abstain. A preserves the same10 correct/1 wrong.
B retains8 correct and still makes that1 wrong acceptance. Neither removes the
baseline error; B also loses two correct positives, exceeding the permitted one.
No candidate meets the frozen criteria. Do not deploy either algorithm.

The raw results and null selection stay unchanged:
`work/local-reliability-2026-11-07.kbWGyb/validation/summary.json`, SHA256
`fd86f9bad85d03775cfddab5edc2c79d88206f1e10ec5617defb9bb17c977ea2`.
Held-out will audit **baseline only**,32 primary/center executions, no fit calls,
no candidate/threshold selection. Do not reinterpret it as a successful test of
A/B or tune a deployed gate from it. The mixed-scene failure is evidence against
a reliable whole-image single-kind claim, not verified material/safety truth.

References are AI-reviewed/human-review-required, not independent acceptance.
This is an engineering failure retained to guide a separate future development
experiment, not a production-quality pass or a reason to lower LV-001 severity.
