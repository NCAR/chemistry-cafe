import { describe, expect, it } from "vitest";
import {
  validateUsernameFormat,
  USERNAME_REGEX,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from "../src/helpers/userValidation";

describe("userValidation helper", () => {
  it("enforces valid username characters with USERNAME_REGEX", () => {
    expect(USERNAME_REGEX.test("valid_user-123")).toBe(true);
    expect(USERNAME_REGEX.test("validUsername")).toBe(true);
    expect(USERNAME_REGEX.test("user@name")).toBe(false);
    expect(USERNAME_REGEX.test("user name")).toBe(false);
    expect(USERNAME_REGEX.test("user!name")).toBe(false);
    expect(USERNAME_REGEX.test("user.name")).toBe(false);
  });

  it("validates username format, length, and non-empty", () => {
    expect(validateUsernameFormat("").valid).toBe(false);
    expect(validateUsernameFormat("   ").valid).toBe(false);
    expect(validateUsernameFormat("ab").valid).toBe(false); // below min
    expect(validateUsernameFormat("a".repeat(51)).valid).toBe(false); // above max
    expect(validateUsernameFormat("invalid user").valid).toBe(false);

    expect(validateUsernameFormat("abc").valid).toBe(true); // min length (3)
    expect(validateUsernameFormat("a".repeat(50)).valid).toBe(true); // max length (50)
    expect(validateUsernameFormat("valid_username-99").valid).toBe(true);
  });
});
