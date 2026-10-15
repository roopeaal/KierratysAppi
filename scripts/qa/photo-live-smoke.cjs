// Explicit opt-in only: one potentially billable request using a code-drawn test illustration.
// No user's photograph, camera, location, key or provider error body is read or printed.
if (process.argv[2] !== "--live")
  throw new Error("Pass --live to authorize one live test request.");
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    headless: true,
  });
  let jpegBase64;
  try {
    const page = await browser.newPage();
    jpegBase64 = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 960;
      canvas.height = 960;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 960, 960);
      ctx.fillStyle = "#d9e8ee";
      ctx.fillRect(280, 260, 400, 560);
      ctx.fillStyle = "#446b98";
      ctx.fillRect(280, 550, 400, 270);
      ctx.beginPath();
      ctx.moveTo(280, 260);
      ctx.lineTo(380, 140);
      ctx.lineTo(580, 140);
      ctx.lineTo(680, 260);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#172a3d";
      ctx.font = "bold 68px sans-serif";
      ctx.fillText("MILK", 380, 440);
      ctx.font = "24px sans-serif";
      ctx.fillText("TEST ILLUSTRATION", 340, 900);
      return canvas.toDataURL("image/jpeg", 0.75).split(",")[1];
    });
  } finally {
    await browser.close();
  }
  const response = await fetch(
    `${process.env.PHOTO_API_URL ?? "http://127.0.0.1:3003"}/v1/recycling/photo`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(22_000),
      body: JSON.stringify({ jpegBase64, language: "en", consentVersion: "photo-ai-v1" }),
    },
  );
  const result = await response.json();
  if (result.status !== "estimated") {
    console.log(
      JSON.stringify({ httpStatus: response.status, status: result.status, reason: result.reason }),
    );
    process.exitCode = 1;
    return;
  }
  assert.equal(response.status, 200);
  assert.equal(result.source.verificationStatus, "inferred");
  assert.equal(result.source.model, "gpt-4.1-mini-2025-04-14");
  assert.ok(["clear", "uncertain", "not_item"].includes(result.observation.status));
  assert.ok(!Object.hasOwn(result.observation, "destination"));
  console.log(
    JSON.stringify({
      liveRequest: "passed",
      model: result.source.model,
      observationStatus: result.observation.status,
      verification: result.source.verificationStatus,
      fixture: "code-drawn illustration, not product-accuracy evidence",
    }),
  );
})().catch(() => {
  console.error("Live photo smoke did not complete; no private error details logged.");
  process.exitCode = 1;
});
