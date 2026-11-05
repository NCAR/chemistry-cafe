export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 50;

export function validateUsernameFormat(username: string): {
  valid: boolean;
  message?: string;
} {
  const trimmed = username.trim();
  if (!trimmed) {
    return { valid: false, message: "Username is required." };
  }
  if (
    trimmed.length < MIN_USERNAME_LENGTH ||
    trimmed.length > MAX_USERNAME_LENGTH
  ) {
    return {
      valid: false,
      message: `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters.`,
    };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      message:
        "Username may only contain letters, numbers, underscores, and hyphens.",
    };
  }
  return { valid: true };
}
