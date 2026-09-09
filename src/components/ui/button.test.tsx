import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("applies size and variant classes", () => {
    render(
      <Button variant="outline" size="sm">
        X
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveClass("border", "h-8");
  });

  it("renders as a child element when asChild", () => {
    render(
      <Button asChild>
        <a href="/x">ir</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "ir" });
    expect(link).toHaveAttribute("href", "/x");
  });
});
