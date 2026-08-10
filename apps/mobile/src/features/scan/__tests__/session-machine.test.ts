import { GtinSchema } from "@kierratysappi/domain";
import { describe, expect, it } from "vitest";
import { isDuplicateScan, sessionReducer } from "../session-machine";

const gtin = GtinSchema.parse("3017620422003");

describe("scan session", () => {
  it("moves through loading and offline recovery without losing the GTIN", () => {
    const loading = sessionReducer({ status: "idle" }, { type: "started", gtin, source: "camera" });
    const offline = sessionReducer(loading, { type: "offline", gtin });
    expect(loading).toEqual({ status: "loading", gtin, source: "camera" });
    expect(offline).toEqual({ status: "offline", gtin });
    expect(sessionReducer(offline, { type: "reset" })).toEqual({ status: "idle" });
  });

  it("suppresses only the same GTIN within the duplicate window", () => {
    const previous = { gtin, at: 1_000 };
    expect(isDuplicateScan(previous, gtin, 2_000)).toBe(true);
    expect(isDuplicateScan(previous, gtin, 4_000)).toBe(false);
    expect(isDuplicateScan(previous, GtinSchema.parse("6410405196811"), 1_100)).toBe(false);
  });
});
