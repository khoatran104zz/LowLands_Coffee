import { Product, Category } from "@/types";

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Cà Phê", status: "active" },
  { id: 2, name: "Trà", status: "active" },
  { id: 3, name: "Freeze", status: "active" },
  { id: 4, name: "Khác", status: "active" }
];

export const MOCK_PRODUCTS: Product[] = [
  // Cà Phê (categoryId: 1)
  {
    id: 1,
    categoryId: 1,
    name: "Phin Sữa Đá",
    description: "Cà phê Robusta đậm đặc pha phin truyền thống kết hợp sữa đặc ngọt ngào.",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 101, productId: 1, size: "S", price: 29000, status: "active" },
      { id: 102, productId: 1, size: "M", price: 35000, status: "active" },
      { id: 103, productId: 1, size: "L", price: 39000, status: "active" }
    ],
    toppings: [
      { id: 1, name: "Thạch Cà Phê", price: 6000, status: "active" },
      { id: 2, name: "Trân Châu Trắng", price: 8000, status: "active" }
    ]
  },
  {
    id: 2,
    categoryId: 1,
    name: "Phin Đen Đá",
    description: "Cà phê đen phin đậm vị truyền thống dành cho người sành cà phê.",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 201, productId: 2, size: "S", price: 25000, status: "active" },
      { id: 202, productId: 2, size: "M", price: 29000, status: "active" },
      { id: 203, productId: 2, size: "L", price: 35000, status: "active" }
    ]
  },
  {
    id: 3,
    categoryId: 1,
    name: "Bạc Xỉu",
    description: "Cà phê phin hòa quyện cùng sữa tươi và sữa đặc béo ngậy cho vị ngọt dịu nhẹ.",
    imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 301, productId: 3, size: "S", price: 29000, status: "active" },
      { id: 302, productId: 3, size: "M", price: 35000, status: "active" },
      { id: 303, productId: 3, size: "L", price: 39000, status: "active" }
    ]
  },
  {
    id: 4,
    categoryId: 1,
    name: "PhinĐi Hạnh Nhân",
    description: "Sự kết hợp mới mẻ giữa cà phê phin, hạnh nhân béo ngậy và thạch giòn sần sật.",
    imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 401, productId: 4, size: "S", price: 39000, status: "active" },
      { id: 402, productId: 4, size: "M", price: 45000, status: "active" },
      { id: 403, productId: 4, size: "L", price: 49000, status: "active" }
    ]
  },
  
  // Trà (categoryId: 2)
  {
    id: 6,
    categoryId: 2,
    name: "Trà Sen Vàng",
    description: "Trà Ô Long thơm ngát kết hợp cùng hạt sen bùi ngậy và thạch củ năng giòn ngọt.",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 601, productId: 6, size: "S", price: 39000, status: "active" },
      { id: 602, productId: 6, size: "M", price: 49000, status: "active" },
      { id: 603, productId: 6, size: "L", price: 55000, status: "active" }
    ],
    toppings: [
      { id: 3, name: "Thạch Củ Năng", price: 8000, status: "active" },
      { id: 4, name: "Hạt Sen", price: 10000, status: "active" }
    ]
  },
  {
    id: 7,
    categoryId: 2,
    name: "Trà Thạch Đào",
    description: "Trà đào thơm lừng kết hợp những miếng đào thật ngâm giòn ngọt và thạch đào thanh mát.",
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 701, productId: 7, size: "S", price: 39000, status: "active" },
      { id: 702, productId: 7, size: "M", price: 49000, status: "active" },
      { id: 703, productId: 7, size: "L", price: 55000, status: "active" }
    ]
  },
  {
    id: 8,
    categoryId: 2,
    name: "Trà Thanh Đào",
    description: "Trà đào thanh mát với sự kết hợp tuyệt vời của đào chín ngọt và hương sả nồng nàn.",
    imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 801, productId: 8, size: "S", price: 39000, status: "active" },
      { id: 802, productId: 8, size: "M", price: 49000, status: "active" },
      { id: 803, productId: 8, size: "L", price: 55000, status: "active" }
    ]
  },

  // Freeze (categoryId: 3)
  {
    id: 9,
    categoryId: 3,
    name: "Freeze Trà Xanh",
    description: "Matcha trà xanh xay mịn kết hợp kem béo ngậy, kèm thạch trà xanh thơm mát và đậu đỏ bùi ngọt.",
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 901, productId: 9, size: "S", price: 49000, status: "active" },
      { id: 902, productId: 9, size: "M", price: 59000, status: "active" },
      { id: 903, productId: 9, size: "L", price: 65000, status: "active" }
    ]
  },
  {
    id: 10,
    categoryId: 3,
    name: "Freeze Cà Phê Phin",
    description: "Cà phê phin xay đá béo ngậy kèm thạch cà phê dai giòn ngon tuyệt hảo.",
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 1001, productId: 10, size: "S", price: 49000, status: "active" },
      { id: 1002, productId: 10, size: "M", price: 59000, status: "active" },
      { id: 1003, productId: 10, size: "L", price: 65000, status: "active" }
    ]
  },

  // Khác (categoryId: 4)
  {
    id: 12,
    categoryId: 4,
    name: "Bánh Mì Que Pate",
    description: "Bánh mì que giòn tan với nhân pate béo ngậy đặc trưng miền Trung.",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 1201, productId: 12, size: "S", price: 19000, status: "active" }
    ]
  },
  {
    id: 13,
    categoryId: 4,
    name: "Bánh Phô Mai Việt Quất",
    description: "Bánh phô mai nướng mịn màng phủ xốt quả việt quất chua ngọt đậm đà.",
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 1301, productId: 13, size: "M", price: 35000, status: "active" }
    ]
  },
  {
    id: 14,
    categoryId: 4,
    name: "Cà Phê Phin Giấy Lowlands",
    description: "Hộp cà phê phin giấy tiện lợi đóng gói sẵn từ Lowlands Coffee.",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
    status: "active",
    variants: [
      { id: 1401, productId: 14, size: "M", price: 95000, status: "active" }
    ]
  }
];
