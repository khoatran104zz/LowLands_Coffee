import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders correctly with text content", () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText("Click me");
    expect(buttonElement).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByText("Delete");
    // shadcn/ui uses text-destructive or bg-destructive/10 for modern designs
    expect(buttonElement).toHaveClass("text-destructive");
  });
});
