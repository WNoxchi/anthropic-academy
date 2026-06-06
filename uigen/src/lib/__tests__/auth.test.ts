// @vitest-environment node
// auth.ts is server-only; node avoids jsdom's cross-realm Uint8Array breaking jose
import { test, expect, vi, beforeEach } from "vitest";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import {
  createSession,
  getSession,
  deleteSession,
  verifySession,
} from "@/lib/auth";

vi.mock("server-only", () => ({}));

const mockCookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

// Must match the fallback secret in src/lib/auth.ts (JWT_SECRET is unset in tests)
const SECRET = new TextEncoder().encode("development-secret-key");
const COOKIE_NAME = "auth-token";

beforeEach(() => {
  vi.clearAllMocks();
});

async function signToken(
  payload: Record<string, unknown>,
  options: { secret?: Uint8Array; expiresIn?: string } = {}
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(options.expiresIn ?? "7d")
    .setIssuedAt()
    .sign(options.secret ?? SECRET);
}

// createSession

test("createSession sets an httpOnly cookie with a verifiable JWT", async () => {
  await createSession("user-1", "test@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
  const [name, token, options] = mockCookieStore.set.mock.calls[0];

  expect(name).toBe(COOKIE_NAME);
  expect(options).toMatchObject({
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  const { payload } = await jwtVerify(token, SECRET);
  expect(payload.userId).toBe("user-1");
  expect(payload.email).toBe("test@example.com");
});

test("createSession sets the cookie to expire in 7 days", async () => {
  await createSession("user-1", "test@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const delta = options.expires.getTime() - Date.now();

  expect(delta).toBeGreaterThan(sevenDays - 5000);
  expect(delta).toBeLessThanOrEqual(sevenDays);
});

// getSession

test("getSession returns the session payload for a valid token", async () => {
  const token = await signToken({ userId: "user-1", email: "test@example.com" });
  mockCookieStore.get.mockReturnValue({ value: token });

  const session = await getSession();

  expect(mockCookieStore.get).toHaveBeenCalledWith(COOKIE_NAME);
  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("test@example.com");
});

test("getSession returns null when no cookie is present", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  expect(await getSession()).toBeNull();
});

test("getSession returns null for a malformed token", async () => {
  mockCookieStore.get.mockReturnValue({ value: "not-a-jwt" });

  expect(await getSession()).toBeNull();
});

test("getSession returns null for a token signed with the wrong secret", async () => {
  const token = await signToken(
    { userId: "user-1", email: "test@example.com" },
    { secret: new TextEncoder().encode("attacker-secret") }
  );
  mockCookieStore.get.mockReturnValue({ value: token });

  expect(await getSession()).toBeNull();
});

test("getSession returns null for an expired token", async () => {
  const token = await signToken(
    { userId: "user-1", email: "test@example.com" },
    { expiresIn: "0s" }
  );
  mockCookieStore.get.mockReturnValue({ value: token });

  expect(await getSession()).toBeNull();
});

// deleteSession

test("deleteSession deletes the auth cookie", async () => {
  await deleteSession();

  expect(mockCookieStore.delete).toHaveBeenCalledWith(COOKIE_NAME);
});

// verifySession

test("verifySession returns the payload for a request with a valid cookie", async () => {
  const token = await signToken({ userId: "user-1", email: "test@example.com" });
  const request = new NextRequest("http://localhost:3000/api/projects", {
    headers: { cookie: `${COOKIE_NAME}=${token}` },
  });

  const session = await verifySession(request);

  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("test@example.com");
});

test("verifySession returns null for a request without a cookie", async () => {
  const request = new NextRequest("http://localhost:3000/api/projects");

  expect(await verifySession(request)).toBeNull();
});

test("verifySession returns null for a request with an invalid token", async () => {
  const request = new NextRequest("http://localhost:3000/api/projects", {
    headers: { cookie: `${COOKIE_NAME}=garbage` },
  });

  expect(await verifySession(request)).toBeNull();
});
