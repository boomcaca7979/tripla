import { z } from "zod";

// ─── Login schema ───────────────────────────────────────────────────────────

/**
 * @schema LoginSchema
 * Validates the login form: a valid email + a non-empty password.
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Signup schema ──────────────────────────────────────────────────────────

/**
 * Password requirements (matching the strength meter):
 *  - At least 8 characters
 *  - Contains at least one letter
 *  - Contains at least one number
 */
const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/\d/, "Password must include a number");

/**
 * @schema SignupSchema
 * Validates the registration form: name, email, password + confirmation match.
 */
export const SignupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof SignupSchema>;

// ─── Password strength helper ──────────────────────────────────────────────

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

/**
 * Score a password on a 0-4 scale and bucket it into a coarse strength label.
 * Used by the strength meter shown below the password input on the signup page.
 */
export function evaluatePasswordStrength(value: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: PasswordStrength;
} {
  if (!value) return { score: 0, label: "empty" };

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  // Clamp to 0-4
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;

  let label: PasswordStrength = "weak";
  if (clamped >= 4) label = "strong";
  else if (clamped >= 2) label = "medium";

  return { score: clamped, label };
}
