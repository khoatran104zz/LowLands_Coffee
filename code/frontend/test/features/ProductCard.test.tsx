import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Product } from "@/types";

// Mock next-intl translations hook
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "price") return "Giá";
    return key;
  },
}));

// Mock next-intl navigation
jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockProduct: Product = {
  id: 1,
  categoryId: 10,
  name: "Cà phê Sữa Đá",
  description: "Cà phê phin kết hợp sữa đặc đậm đà.",
  imageUrl: "/logo/logo-icon.svg",
  status: "active",
  variants: [
    { id: 101, productId: 1, size: "S", price: 29000, status: "active" },
    { id: 102, productId: 1, size: "M", price: 35000, status: "active" },
  ],
};

describe("ProductCard Component", () => {
  it("renders product name, description and starting price correctly", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Cà phê Sữa Đá")).toBeInTheDocument();
    expect(screen.getByText("Cà phê phin kết hợp sữa đặc đậm đà.")).toBeInTheDocument();
    // Verify it renders starting price (29.000 ₫ starting price)
    expect(screen.getByText(/29.000/)).toBeInTheDocument();
  });
});
