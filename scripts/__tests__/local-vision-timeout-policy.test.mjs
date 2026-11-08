import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const engine = source("mobile/app/modules/local-vision/ios/local-vision-engine.swift");
const start = engine.indexOf("private func enqueueRecognition(");
const end = engine.indexOf("private static func perform(", start);
const enqueue = engine.slice(start, end);

test("recognition watchdog precedes worker/decode and never releases its gate on timeout", () => {
  const timer = enqueue.indexOf(
    "deadline.setEventHandler { delivery.resolve(.failure(.timeout)) }",
  );
  const worker = enqueue.indexOf("worker.async");
  assert.ok(timer >= 0 && timer < worker);
  assert.ok(enqueue.indexOf("inFlight = false") > enqueue.indexOf("let outcome = autoreleasepool"));
  assert.ok(enqueue.indexOf("inFlight = false") > worker);
  assert.match(enqueue, /delivery\.resolve\(onTime \? outcome : \.failure\(\.timeout\)\)/);
  assert.match(engine, /completion = nil\s*lock\.unlock\(\)\s*callback\?\(result\)/);
});

test("decode, request cancellation and supplemental prediction share one monotonic deadline", () => {
  const perform = engine.slice(end, engine.indexOf("private static func decodeJPEG", end));
  assert.match(
    engine,
    /let deadlineAt = ProcessInfo\.processInfo\.systemUptime \+ Self\.deadlineSeconds/,
  );
  assert.match(perform, /let remaining = deadlineAt - ProcessInfo\.processInfo\.systemUptime/);
  assert.match(perform, /deadline\.schedule\(deadline: \.now\(\) \+ remaining\)/);
  assert.doesNotMatch(perform, /deadline\.schedule\(deadline: \.now\(\) \+ deadlineSeconds\)/);
  assert.ok([...perform.matchAll(/systemUptime < deadlineAt/gu)].length >= 4);
  assert.match(perform, /requests\.cancel\(\)/);
});

test("native typed timeout reaches existing localized mobile recovery and no-image lifecycle QA", () => {
  const mobile = source("mobile/app/src/features/local-vision/recognizer.ts");
  assert.match(mobile, /ERR_LOCAL_VISION_TIMEOUT[\s\S]*?\? "timeout"/);
  assert.match(engine, /recognitionLifecycleSelfTest/);
  assert.match(engine, /late_success_suppressed_once/);
  assert.match(engine, /recognition_gate_retained_after_timeout/);
  const cli = source("scripts/qa/local-vision/main.swift");
  assert.match(cli, /--recognition-self-test/);
  assert.match(cli, /imageRequestsPerformed": 0/);
});
