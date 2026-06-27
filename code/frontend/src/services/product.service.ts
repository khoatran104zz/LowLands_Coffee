import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/mock/products";
import { Product, Category } from "@/types";

export interface ProductFilterParams {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const getProducts = async (params?: ProductFilterParams): Promise<Product[]> => {
  return INITIAL_PRODUCTS.filter((product) => {
    const matchesCategory = params?.categoryId ? product.categoryId === params.categoryId : true;
    const matchesSearch = params?.search
      ? product.name.toLowerCase().includes(params.search.toLowerCase())
      : true;
    const minPrice = params?.minPrice ?? 0;
    const maxPrice = params?.maxPrice ?? Number.MAX_SAFE_INTEGER;
    const firstPrice = product.variants?.[0]?.price ?? 0;
    const matchesPrice = firstPrice >= minPrice && firstPrice <= maxPrice;

    return matchesCategory && matchesSearch && matchesPrice;
  });
};

export const getProductById = async (id: number): Promise<Product> => {
  const product = INITIAL_PRODUCTS.find((item) => item.id === id);
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

export const getCategories = async (): Promise<Category[]> => {
  return INITIAL_CATEGORIES;
};
