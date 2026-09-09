import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("normalizes email casing and whitespace", () => {
    const parsed = loginSchema.parse({
      email: "  JOAO@Teste.com ",
      password: "x",
    });
    expect(parsed.email).toBe("joao@teste.com");
  });

  it("rejects an empty password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Joao Pedro",
    email: "joao@teste.com",
    password: "senha12345",
    confirmPassword: "senha12345",
  };

  it("accepts a valid payload", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({
      ...base,
      password: "123",
      confirmPassword: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched confirmation", () => {
    const result = registerSchema.safeParse({
      ...base,
      confirmPassword: "outra-senha",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("confirmPassword");
    }
  });
});
