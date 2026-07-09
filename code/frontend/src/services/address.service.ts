export interface Province {
  code: number;
  name: string;
  districts: District[];
}

export interface District {
  code: number;
  name: string;
  wards: Ward[];
}

export interface Ward {
  code: number;
  name: string;
}

// Minimal fallback data with major cities to ensure offline safety
export const FALLBACK_PROVINCES: Province[] = [
  {
    code: 79,
    name: "Thành phố Hồ Chí Minh",
    districts: [
      {
        code: 760,
        name: "Quận 1",
        wards: [
          { code: 26734, name: "Phường Bến Nghé" },
          { code: 26737, name: "Phường Bến Thành" },
          { code: 26740, name: "Phường Cầu Kho" },
          { code: 26743, name: "Phường Cầu Ông Lãnh" },
          { code: 26746, name: "Phường Cô Giang" },
          { code: 26749, name: "Phường Đa Kao" },
          { code: 26752, name: "Phường Nguyễn Thái Bình" },
          { code: 26755, name: "Phường Nguyễn Cư Trinh" },
          { code: 26758, name: "Phường Phạm Ngũ Lão" },
          { code: 26761, name: "Phường Tân Định" }
        ]
      },
      {
        code: 769,
        name: "Quận 2 (Thành phố Thủ Đức)",
        wards: [
          { code: 26863, name: "Phường An Khánh" },
          { code: 26866, name: "Phường An Lợi Đông" },
          { code: 26869, name: "Phường An Phú" },
          { code: 26872, name: "Phường Bình An" },
          { code: 26875, name: "Phường Bình Khánh" },
          { code: 26878, name: "Phường Bình Trưng Đông" },
          { code: 26881, name: "Phường Bình Trưng Tây" },
          { code: 26884, name: "Phường Cát Lái" },
          { code: 26887, name: "Phường Thạnh Mỹ Lợi" },
          { code: 26890, name: "Phường Thảo Điền" }
        ]
      },
      {
        code: 778,
        name: "Quận 9 (Thành phố Thủ Đức)",
        wards: [
          { code: 27139, name: "Phường Long Bình" },
          { code: 27142, name: "Phường Long Phước" },
          { code: 27145, name: "Phường Long Thạnh Mỹ" },
          { code: 27148, name: "Phường Long Trường" },
          { code: 27151, name: "Phường Phú Hữu" },
          { code: 27154, name: "Phường Phước Bình" },
          { code: 27157, name: "Phường Phước Long A" },
          { code: 27160, name: "Phường Phước Long B" },
          { code: 27163, name: "Phường Tân Phú" },
          { code: 27166, name: "Phường Tăng Nhơn Phú A" },
          { code: 27169, name: "Phường Tăng Nhơn Phú B" },
          { code: 27172, name: "Phường Trường Thạnh" }
        ]
      },
      {
        code: 770,
        name: "Quận 3",
        wards: [
          { code: 26893, name: "Phường Võ Thị Sáu" },
          { code: 26899, name: "Phường 1" },
          { code: 26902, name: "Phường 2" },
          { code: 26905, name: "Phường 3" },
          { code: 26908, name: "Phường 4" },
          { code: 26911, name: "Phường 5" },
          { code: 26920, name: "Phường 9" },
          { code: 26923, name: "Phường 10" },
          { code: 26926, name: "Phường 11" },
          { code: 26929, name: "Phường 12" },
          { code: 26932, name: "Phường 13" },
          { code: 26935, name: "Phường 14" }
        ]
      },
      {
        code: 771,
        name: "Quận 4",
        wards: [
          { code: 26941, name: "Phường 1" },
          { code: 26944, name: "Phường 2" },
          { code: 26947, name: "Phường 3" },
          { code: 26950, name: "Phường 4" },
          { code: 26953, name: "Phường 6" },
          { code: 26956, name: "Phường 8" },
          { code: 26959, name: "Phường 9" },
          { code: 26962, name: "Phường 10" },
          { code: 26965, name: "Phường 13" },
          { code: 26968, name: "Phường 14" },
          { code: 26971, name: "Phường 15" },
          { code: 26974, name: "Phường 16" },
          { code: 26977, name: "Phường 18" }
        ]
      },
      {
        code: 772,
        name: "Quận 5",
        wards: [
          { code: 26983, name: "Phường 1" },
          { code: 26986, name: "Phường 2" },
          { code: 26989, name: "Phường 3" },
          { code: 26992, name: "Phường 4" },
          { code: 26995, name: "Phường 5" },
          { code: 26998, name: "Phường 6" },
          { code: 27001, name: "Phường 7" },
          { code: 27004, name: "Phường 8" },
          { code: 27007, name: "Phường 9" },
          { code: 27010, name: "Phường 10" },
          { code: 27013, name: "Phường 11" },
          { code: 27016, name: "Phường 12" },
          { code: 27019, name: "Phường 13" },
          { code: 27022, name: "Phường 14" }
        ]
      },
      {
        code: 773,
        name: "Quận 6",
        wards: [
          { code: 27031, name: "Phường 1" },
          { code: 27034, name: "Phường 2" },
          { code: 27037, name: "Phường 3" },
          { code: 27040, name: "Phường 4" },
          { code: 27043, name: "Phường 5" },
          { code: 27046, name: "Phường 6" },
          { code: 27049, name: "Phường 7" },
          { code: 27052, name: "Phường 8" },
          { code: 27055, name: "Phường 9" },
          { code: 27058, name: "Phường 10" },
          { code: 27061, name: "Phường 11" },
          { code: 27064, name: "Phường 12" },
          { code: 27067, name: "Phường 13" },
          { code: 27070, name: "Phường 14" }
        ]
      },
      {
        code: 774,
        name: "Quận 7",
        wards: [
          { code: 27079, name: "Phường Bình Thuận" },
          { code: 27082, name: "Phường Phú Mỹ" },
          { code: 27085, name: "Phường Phú Thuận" },
          { code: 27088, name: "Phường Tân Hưng" },
          { code: 27091, name: "Phường Tân Kiểng" },
          { code: 27094, name: "Phường Tân Phong" },
          { code: 27097, name: "Phường Tân Phú" },
          { code: 27100, name: "Phường Tân Quy" },
          { code: 27103, name: "Phường Tân Thuận Đông" },
          { code: 27106, name: "Phường Tân Thuận Tây" }
        ]
      },
      {
        code: 775,
        name: "Quận 8",
        wards: [
          { code: 27115, name: "Phường 1" },
          { code: 27118, name: "Phường 2" },
          { code: 27121, name: "Phường 3" },
          { code: 27124, name: "Phường 4" },
          { code: 27127, name: "Phường 5" },
          { code: 27130, name: "Phường 6" },
          { code: 27133, name: "Phường 7" },
          { code: 27136, name: "Phường 8" },
          { code: 27144, name: "Phường 9" },
          { code: 27147, name: "Phường 10" },
          { code: 27150, name: "Phường 11" },
          { code: 27153, name: "Phường 12" },
          { code: 27156, name: "Phường 13" },
          { code: 27159, name: "Phường 14" },
          { code: 27162, name: "Phường 15" },
          { code: 27165, name: "Phường 16" }
        ]
      },
      {
        code: 776,
        name: "Quận 10",
        wards: [
          { code: 27181, name: "Phường 1" },
          { code: 27184, name: "Phường 2" },
          { code: 27187, name: "Phường 4" },
          { code: 27190, name: "Phường 5" },
          { code: 27193, name: "Phường 6" },
          { code: 27196, name: "Phường 7" },
          { code: 27199, name: "Phường 8" },
          { code: 27202, name: "Phường 9" },
          { code: 27205, name: "Phường 10" },
          { code: 27208, name: "Phường 11" },
          { code: 27211, name: "Phường 12" },
          { code: 27214, name: "Phường 13" },
          { code: 27217, name: "Phường 14" },
          { code: 27220, name: "Phường 15" }
        ]
      },
      {
        code: 777,
        name: "Quận 11",
        wards: [
          { code: 27226, name: "Phường 1" },
          { code: 27229, name: "Phường 2" },
          { code: 27232, name: "Phường 3" },
          { code: 27235, name: "Phường 4" },
          { code: 27238, name: "Phường 5" },
          { code: 27241, name: "Phường 6" },
          { code: 27244, name: "Phường 7" },
          { code: 27247, name: "Phường 8" },
          { code: 27250, name: "Phường 9" },
          { code: 27253, name: "Phường 10" },
          { code: 27256, name: "Phường 11" },
          { code: 27259, name: "Phường 12" },
          { code: 27262, name: "Phường 13" },
          { code: 27265, name: "Phường 14" },
          { code: 27268, name: "Phường 15" },
          { code: 27271, name: "Phường 16" }
        ]
      },
      {
        code: 761,
        name: "Quận 12",
        wards: [
          { code: 26767, name: "Phường An Phú Đông" },
          { code: 26770, name: "Phường Đông Hưng Thuận" },
          { code: 26773, name: "Phường Hiệp Thành" },
          { code: 26776, name: "Phường Tân Chánh Hiệp" },
          { code: 26779, name: "Phường Tân Hưng Thuận" },
          { code: 26782, name: "Phường Tân Thới Hiệp" },
          { code: 26785, name: "Phường Tân Thới Nhất" },
          { code: 26788, name: "Phường Thạnh Lộc" },
          { code: 26791, name: "Phường Thạnh Xuân" },
          { code: 26794, name: "Phường Thới An" },
          { code: 26797, name: "Phường Trung Mỹ Tây" }
        ]
      },
      {
        code: 764,
        name: "Quận Gò Vấp",
        wards: [
          { code: 26803, name: "Phường 1" },
          { code: 26806, name: "Phường 3" },
          { code: 26809, name: "Phường 4" },
          { code: 26812, name: "Phường 5" },
          { code: 26815, name: "Phường 6" },
          { code: 26818, name: "Phường 7" },
          { code: 26821, name: "Phường 8" },
          { code: 26824, name: "Phường 9" },
          { code: 26827, name: "Phường 10" },
          { code: 26830, name: "Phường 11" },
          { code: 26833, name: "Phường 12" },
          { code: 26836, name: "Phường 13" },
          { code: 26839, name: "Phường 14" },
          { code: 26842, name: "Phường 15" },
          { code: 26845, name: "Phường 16" },
          { code: 26848, name: "Phường 17" }
        ]
      },
      {
        code: 765,
        name: "Quận Bình Thạnh",
        wards: [
          { code: 26851, name: "Phường 1" },
          { code: 26854, name: "Phường 2" },
          { code: 26857, name: "Phường 3" },
          { code: 26860, name: "Phường 5" },
          { code: 26863, name: "Phường 6" },
          { code: 26866, name: "Phường 7" },
          { code: 26869, name: "Phường 11" },
          { code: 26872, name: "Phường 12" },
          { code: 26875, name: "Phường 13" },
          { code: 26878, name: "Phường 14" },
          { code: 26881, name: "Phường 15" },
          { code: 26884, name: "Phường 17" },
          { code: 26887, name: "Phường 19" },
          { code: 26890, name: "Phường 21" },
          { code: 26893, name: "Phường 22" },
          { code: 26896, name: "Phường 24" },
          { code: 26899, name: "Phường 25" },
          { code: 26902, name: "Phường 26" },
          { code: 26905, name: "Phường 27" },
          { code: 26908, name: "Phường 28" }
        ]
      },
      {
        code: 766,
        name: "Quận Tân Bình",
        wards: [
          { code: 26911, name: "Phường 1" },
          { code: 26914, name: "Phường 2" },
          { code: 26917, name: "Phường 3" },
          { code: 26920, name: "Phường 4" },
          { code: 26923, name: "Phường 5" },
          { code: 26926, name: "Phường 6" },
          { code: 26929, name: "Phường 7" },
          { code: 26932, name: "Phường 8" },
          { code: 26935, name: "Phường 9" },
          { code: 26938, name: "Phường 10" },
          { code: 26941, name: "Phường 11" },
          { code: 26944, name: "Phường 12" },
          { code: 26947, name: "Phường 13" },
          { code: 26950, name: "Phường 14" },
          { code: 26953, name: "Phường 15" }
        ]
      },
      {
        code: 767,
        name: "Quận Tân Phú",
        wards: [
          { code: 26959, name: "Phường Hiệp Tân" },
          { code: 26962, name: "Phường Hòa Thạnh" },
          { code: 26965, name: "Phường Phú Thạnh" },
          { code: 26968, name: "Phường Phú Thọ Hòa" },
          { code: 26971, name: "Phường Phú Trung" },
          { code: 26974, name: "Phường Sơn Kỳ" },
          { code: 26977, name: "Phường Tân Quý" },
          { code: 26980, name: "Phường Tân Sơn Nhì" },
          { code: 26983, name: "Phường Tân Thành" },
          { code: 26986, name: "Phường Tân Thới Hòa" },
          { code: 26989, name: "Phường Tây Thạnh" }
        ]
      },
      {
        code: 768,
        name: "Quận Phú Nhuận",
        wards: [
          { code: 26995, name: "Phường 1" },
          { code: 26998, name: "Phường 2" },
          { code: 27001, name: "Phường 3" },
          { code: 27004, name: "Phường 4" },
          { code: 27007, name: "Phường 5" },
          { code: 27010, name: "Phường 7" },
          { code: 27013, name: "Phường 8" },
          { code: 27016, name: "Phường 9" },
          { code: 27019, name: "Phường 10" },
          { code: 27022, name: "Phường 11" },
          { code: 27025, name: "Phường 13" },
          { code: 27028, name: "Phường 15" },
          { code: 27031, name: "Phường 17" }
        ]
      },
      {
        code: 785,
        name: "Quận Bình Tân",
        wards: [
          { code: 27244, name: "Phường An Lạc" },
          { code: 27247, name: "Phường An Lạc A" },
          { code: 27250, name: "Phường Bình Hưng Hòa" },
          { code: 27253, name: "Phường Bình Hưng Hòa A" },
          { code: 27256, name: "Phường Bình Hưng Hòa B" },
          { code: 27259, name: "Phường Bình Trị Đông" },
          { code: 27262, name: "Phường Bình Trị Đông A" },
          { code: 27265, name: "Phường Bình Trị Đông B" },
          { code: 27268, name: "Phường Tân Tạo" },
          { code: 27271, name: "Phường Tân Tạo A" }
        ]
      }
    ]
  },
  {
    code: 1,
    name: "Thành phố Hà Nội",
    districts: [
      {
        code: 1,
        name: "Quận Ba Đình",
        wards: [
          { code: 1, name: "Phường Cống Vị" },
          { code: 4, name: "Phường Điện Biên" },
          { code: 7, name: "Phường Đội Cấn" },
          { code: 10, name: "Phường Giảng Võ" },
          { code: 13, name: "Phường Kim Mã" },
          { code: 16, name: "Phường Liễu Giai" },
          { code: 19, name: "Phường Ngọc Hà" },
          { code: 22, name: "Phường Ngọc Khánh" },
          { code: 25, name: "Phường Nguyễn Trung Trực" },
          { code: 28, name: "Phường Phúc Xá" },
          { code: 31, name: "Phường Quán Thánh" },
          { code: 34, name: "Phường Thành Công" },
          { code: 37, name: "Phường Trúc Bạch" },
          { code: 40, name: "Phường Vĩnh Phúc" }
        ]
      },
      {
        code: 2,
        name: "Quận Hoàn Kiếm",
        wards: [
          { code: 43, name: "Phường Chương Dương" },
          { code: 46, name: "Phường Cửa Đông" },
          { code: 49, name: "Phường Cửa Nam" },
          { code: 52, name: "Phường Đồng Xuân" },
          { code: 55, name: "Phường Hàng Bạc" },
          { code: 58, name: "Phường Hàng Bài" },
          { code: 61, name: "Phường Hàng Bồ" },
          { code: 64, name: "Phường Hàng Bông" },
          { code: 67, name: "Phường Hàng Buồm" },
          { code: 70, name: "Phường Hàng Đào" },
          { code: 73, name: "Phường Hàng Gai" },
          { code: 76, name: "Phường Hàng Mã" },
          { code: 79, name: "Phường Hàng Trống" },
          { code: 82, name: "Phường Lý Thái Tổ" },
          { code: 85, name: "Phường Phan Chu Trinh" },
          { code: 88, name: "Phường Phúc Tân" },
          { code: 91, name: "Phường Tràng Tiền" }
        ]
      },
      {
        code: 3,
        name: "Quận Tây Hồ",
        wards: [
          { code: 94, name: "Phường Bưởi" },
          { code: 97, name: "Phường Nhật Tân" },
          { code: 100, name: "Phường Phú Thượng" },
          { code: 103, name: "Phường Quảng An" },
          { code: 106, name: "Phường Thụy Khuê" },
          { code: 109, name: "Phường Tứ Liên" },
          { code: 112, name: "Phường Xuân La" },
          { code: 115, name: "Phường Yên Phụ" }
        ]
      },
      {
        code: 5,
        name: "Quận Cầu Giấy",
        wards: [
          { code: 145, name: "Phường Dịch Vọng" },
          { code: 148, name: "Phường Dịch Vọng Hậu" },
          { code: 151, name: "Phường Mai Dịch" },
          { code: 154, name: "Phường Nghĩa Đô" },
          { code: 157, name: "Phường Nghĩa Tân" },
          { code: 160, name: "Phường Quan Hoa" },
          { code: 163, name: "Phường Trung Hòa" },
          { code: 166, name: "Phường Yên Hòa" }
        ]
      },
      {
        code: 6,
        name: "Quận Đống Đa",
        wards: [
          { code: 169, name: "Phường Cát Linh" },
          { code: 172, name: "Phường Hàng Bột" },
          { code: 175, name: "Phường Khâm Thiên" },
          { code: 178, name: "Phường Khương Thượng" },
          { code: 181, name: "Phường Kim Liên" },
          { code: 184, name: "Phường Láng Hạ" },
          { code: 187, name: "Phường Láng Thượng" },
          { code: 190, name: "Phường Nam Đồng" },
          { code: 193, name: "Phường Ngã Tư Sở" },
          { code: 196, name: "Phường Ô Chợ Dừa" },
          { code: 199, name: "Phường Phương Liên" },
          { code: 202, name: "Phường Phương Mai" },
          { code: 205, name: "Phường Quang Trung" },
          { code: 208, name: "Phường Quốc Tử Giám" },
          { code: 211, name: "Phường Thịnh Quang" },
          { code: 214, name: "Phường Thổ Quan" },
          { code: 217, name: "Phường Trung Liệt" },
          { code: 220, name: "Phường Trung Phụng" },
          { code: 223, name: "Phường Trung Tự" },
          { code: 226, name: "Phường Văn Chương" },
          { code: 229, name: "Phường Văn Miếu" }
        ]
      },
      {
        code: 7,
        name: "Quận Hai Bà Trưng",
        wards: [
          { code: 232, name: "Phường Bạch Đằng" },
          { code: 235, name: "Phường Bách Khoa" },
          { code: 238, name: "Phường Bạch Mai" },
          { code: 241, name: "Phường Cầu Dền" },
          { code: 244, name: "Phường Đống Mác" },
          { code: 247, name: "Phường Đồng Nhân" },
          { code: 250, name: "Phường Đồng Tâm" },
          { code: 253, name: "Phường Lê Đại Hành" },
          { code: 256, name: "Phường Minh Khai" },
          { code: 259, name: "Phường Nguyễn Du" },
          { code: 262, name: "Phường Phạm Đình Hổ" },
          { code: 265, name: "Phường Phố Huế" },
          { code: 268, name: "Phường Quỳnh Lôi" },
          { code: 271, name: "Phường Quỳnh Mai" },
          { code: 274, name: "Phường Thanh Lương" },
          { code: 277, name: "Phường Thanh Nhàn" },
          { code: 280, name: "Phường Trương Định" },
          { code: 283, name: "Phường Vĩnh Tuy" }
        ]
      },
      {
        code: 8,
        name: "Quận Hoàng Mai",
        wards: [
          { code: 286, name: "Phường Đại Kim" },
          { code: 289, name: "Phường Định Công" },
          { code: 292, name: "Phường Giáp Bát" },
          { code: 295, name: "Phường Hoàng Liệt" },
          { code: 298, name: "Phường Hoàng Văn Thụ" },
          { code: 301, name: "Phường Lĩnh Nam" },
          { code: 304, name: "Phường Mai Động" },
          { code: 307, name: "Phường Tân Mai" },
          { code: 310, name: "Phường Thanh Trì" },
          { code: 313, name: "Phường Thịnh Liệt" },
          { code: 316, name: "Phường Trần Phú" },
          { code: 319, name: "Phường Tương Mai" },
          { code: 322, name: "Phường Vĩnh Hưng" },
          { code: 325, name: "Phường Yên Sở" }
        ]
      },
      {
        code: 9,
        name: "Quận Thanh Xuân",
        wards: [
          { code: 328, name: "Phường Hạ Đình" },
          { code: 331, name: "Phường Khương Đình" },
          { code: 334, name: "Phường Khương Mai" },
          { code: 337, name: "Phường Khương Trung" },
          { code: 340, name: "Phường Kim Giang" },
          { code: 343, name: "Phường Nhân Chính" },
          { code: 346, name: "Phường Phương Liệt" },
          { code: 349, name: "Phường Thanh Xuân Bắc" },
          { code: 352, name: "Phường Thanh Xuân Nam" },
          { code: 355, name: "Phường Thanh Xuân Trung" },
          { code: 358, name: "Phường Thượng Đình" }
        ]
      }
    ]
  },
  {
    code: 68,
    name: "Tỉnh Lâm Đồng",
    districts: [
      {
        code: 672,
        name: "Thành phố Đà Lạt",
        wards: [
          { code: 24820, name: "Phường 1" },
          { code: 24823, name: "Phường 2" },
          { code: 24826, name: "Phường 3" },
          { code: 24829, name: "Phường 4" },
          { code: 24832, name: "Phường 5" },
          { code: 24835, name: "Phường 6" },
          { code: 24838, name: "Phường 7" },
          { code: 24841, name: "Phường 8" },
          { code: 24844, name: "Phường 9" },
          { code: 24847, name: "Phường 10" },
          { code: 24850, name: "Phường 11" },
          { code: 24853, name: "Phường 12" },
          { code: 24856, name: "Xã Tà Nung" },
          { code: 24859, name: "Xã Trạm Hành" },
          { code: 24862, name: "Xã Đất Mới" },
          { code: 24865, name: "Xã Xuân Thọ" },
          { code: 24868, name: "Xã Xuân Trường" }
        ]
      },
      {
        code: 673,
        name: "Thành phố Bảo Lộc",
        wards: [
          { code: 24871, name: "Phường 1" },
          { code: 24874, name: "Phường 2" },
          { code: 24877, name: "Phường B'lao" },
          { code: 24880, name: "Phường Lộc Phát" },
          { code: 24883, name: "Phường Lộc Sơn" },
          { code: 24886, name: "Phường Lộc Tiến" },
          { code: 24889, name: "Xã Đại Lào" },
          { code: 24892, name: "Xã Lộc Châu" },
          { code: 24895, name: "Xã Lộc Nga" },
          { code: 24898, name: "Xã Lộc Thanh" },
          { code: 24901, name: "Xã Đam B'ri" }
        ]
      }
    ]
  },
  {
    code: 48,
    name: "Thành phố Đà Nẵng",
    districts: [
      {
        code: 490,
        name: "Quận Liên Chiểu",
        wards: [
          { code: 20194, name: "Phường Hòa Hiệp Bắc" },
          { code: 20197, name: "Phường Hòa Hiệp Nam" },
          { code: 20200, name: "Phường Hòa Khánh Bắc" },
          { code: 20203, name: "Phường Hòa Khánh Nam" },
          { code: 20206, name: "Phường Hòa Minh" }
        ]
      },
      {
        code: 491,
        name: "Quận Thanh Khê",
        wards: [
          { code: 20209, name: "Phường Tam Thuận" },
          { code: 20212, name: "Phường Xuân Hà" },
          { code: 20215, name: "Phường Tân Chính" },
          { code: 20218, name: "Phường Chính Gián" },
          { code: 20221, name: "Phường Vĩnh Trung" },
          { code: 20224, name: "Phường Thạc Gián" },
          { code: 20227, name: "Phường An Khê" },
          { code: 20230, name: "Phường Hòa Khê" },
          { code: 20233, name: "Phường Thanh Khê Đông" },
          { code: 20236, name: "Phường Thanh Khê Tây" }
        ]
      },
      {
        code: 492,
        name: "Quận Hải Châu",
        wards: [
          { code: 20239, name: "Phường Thanh Bình" },
          { code: 20242, name: "Phường Thuận Phước" },
          { code: 20245, name: "Phường Thạch Thang" },
          { code: 20248, name: "Phường Hải Châu I" },
          { code: 20251, name: "Phường Hải Châu II" },
          { code: 20254, name: "Phường Phước Ninh" },
          { code: 20257, name: "Phường Hòa Thuận Tây" },
          { code: 20260, name: "Phường Hòa Thuận Đông" },
          { code: 20263, name: "Phường Nam Dương" },
          { code: 20266, name: "Phường Bình Hiên" },
          { code: 20269, name: "Phường Bình Thuận" },
          { code: 20272, name: "Phường Hòa Cường Bắc" },
          { code: 20275, name: "Phường Hòa Cường Nam" }
        ]
      },
      {
        code: 493,
        name: "Quận Sơn Trà",
        wards: [
          { code: 20278, name: "Phường Thọ Quang" },
          { code: 20281, name: "Phường Mân Thái" },
          { code: 20284, name: "Phường An Hải Bắc" },
          { code: 20287, name: "Phường An Hải Tây" },
          { code: 20290, name: "Phường An Hải Đông" },
          { code: 20293, name: "Phường Phước Mỹ" },
          { code: 20296, name: "Phường Nại Hiên Đông" }
        ]
      },
      {
        code: 494,
        name: "Quận Ngũ Hành Sơn",
        wards: [
          { code: 20299, name: "Phường Mỹ An" },
          { code: 20302, name: "Phường Khuê Mỹ" },
          { code: 20305, name: "Phường Hòa Quý" },
          { code: 20308, name: "Phường Hòa Hải" }
        ]
      }
    ]
  }
];

// Fetch and cache dynamic Vietnam address data, falling back to local list on failure
export async function getVietnamProvinces(): Promise<Province[]> {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Using local fallback address data", error);
    return FALLBACK_PROVINCES;
  }
}
