import { describe, expect, it } from "vitest";
import { isAppStorageKey } from "../storage";

describe("local data deletion boundary", () => {
  it("selects every KierrätysAppi key without touching another app's storage", () => {
    expect(isAppStorageKey("@kierratysappi/history/v1")).toBe(true);
    expect(isAppStorageKey("@kierratysappi/feedback-drafts/v1")).toBe(true);
    expect(isAppStorageKey("@another-app/history/v1")).toBe(false);
    expect(isAppStorageKey("kierratysappi/history/v1")).toBe(false);
  });
});
