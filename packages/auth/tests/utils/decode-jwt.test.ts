import { describe, it, expect } from "vitest";

import { decodeJWT } from "../../src/utils/decode-jwt";

function makeJWT(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  // Encode UTF-8 properly: convert to bytes first, then base64
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const body = btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `${header}.${body}.fake-signature`;
}

describe("decodeJWT", () => {
  it("should decode a valid JWT and return the payload", () => {
    const payload = { sub: "1234567890", name: "Test User", iat: 1516239022 };
    const token = makeJWT(payload);

    expect(decodeJWT(token)).toEqual(payload);
  });

  it("should handle base64url characters (- and _)", () => {
    // Characters that produce + and / in standard base64 become - and _ in base64url
    const payload = { data: "subjects?_d" }; // chosen to produce base64url chars
    const token = makeJWT(payload);

    expect(decodeJWT(token)).toEqual(payload);
  });

  it("should handle UTF-8 characters in payload", () => {
    const payload = { name: "테스트 사용자", emoji: "🔑" };
    const token = makeJWT(payload);

    expect(decodeJWT(token)).toEqual(payload);
  });

  it("should return null for a token with fewer than 3 parts", () => {
    expect(decodeJWT("only-two.parts")).toBeNull();
  });

  it("should return null for a token with more than 3 parts", () => {
    expect(decodeJWT("a.b.c.d")).toBeNull();
  });

  it("should return null for an empty string", () => {
    expect(decodeJWT("")).toBeNull();
  });

  it("should return null for invalid base64 in payload", () => {
    expect(decodeJWT("header.!!!invalid!!!.signature")).toBeNull();
  });

  it("should return null for valid base64 but invalid JSON", () => {
    const notJson = btoa("not valid json");
    expect(decodeJWT(`header.${notJson}.signature`)).toBeNull();
  });
});
