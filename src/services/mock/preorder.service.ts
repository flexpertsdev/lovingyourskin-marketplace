
import { Product } from "../../types";

const preorderProducts: Product[] = [
  {
    id: "preorder-1",
    name: {
      en: "Exclusive Preorder Product 1",
      ko: "독점 선주문 제품 1",
      zh: "独家预购产品 1",
    },
    description: {
      en: "This is an exclusive product available for preorder.",
      ko: "이것은 선주문할 수 있는 독점 제품입니다.",
      zh: "这是一款可供预购的独家产品。",
    },
    price: {
      item: 75.0,
      box: 750.0,
      carton: 7500.0,
    },
    images: ["/assets/thecelllab/blue_01.jpg"],
    brandId: "the-cell-lab",
    categoryId: "sunscreens",
    category: "Sunscreens",
    inStock: true,
    stockLevel: "in" as const,
    featured: true,
    moq: 10,
    moqUnit: "items" as const,
    itemsPerCarton: 24,
    packSize: "24",
    volume: "50ml",
    leadTime: "3-5 days",
    certifications: ["VEGAN", "CRUELTY_FREE"],
    active: true,
  },
  {
    id: "preorder-2",
    name: {
      en: "Exclusive Preorder Product 2",
      ko: "독점 선주문 제품 2",
      zh: "独家预购产品 2",
    },
    description: {
      en: "Another exclusive product available for preorder.",
      ko: "선주문할 수 있는 또 다른 독점 제품입니다.",
      zh: "另一款可供预购的独家产品。",
    },
    price: {
      item: 85.0,
      box: 850.0,
      carton: 8500.0,
    },
    images: ["/assets/thecelllab/blue_05.jpg"],
    brandId: "the-cell-lab",
    categoryId: "sunscreens",
    category: "Sunscreens",
    inStock: true,
    stockLevel: "in" as const,
    featured: true,
    moq: 10,
    moqUnit: "items" as const,
    itemsPerCarton: 24,
    packSize: "24",
    volume: "50ml",
    leadTime: "3-5 days",
    certifications: ["CPNP_EU", "DERMATOLOGIST_TESTED"],
    active: true,
  },
];

export const getPreorderProducts = () => {
  return preorderProducts;
};

export const getPreorderProduct = (id: string) => {
  return preorderProducts.find((p) => p.id === id);
};
