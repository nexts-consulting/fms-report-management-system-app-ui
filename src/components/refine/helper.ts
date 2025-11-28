// Helper functions để convert codes thành labels
export const getBrandLabel = (code: string): string => {
  const brandMapping: Record<string, string> = {
    "1": "Probi",
    "2": "Yakult",
    "3": "Betagen",
    "4": "TH Probiotics",
    "5": "Nuvi",
    "99": "Đang không dùng các sản phẩm sữa chua uống men sống",
  };
  return brandMapping[code] || code;
};

export const getFlavorLabel = (code: string): string => {
  const flavorMapping: Record<string, string> = {
    "vi-co-duong": "Vị Có đường",
    "vi-it-duong": "Vị Ít đường",
    "vi-khong-duong": "Vị Không đường",
    "vi-trai-cay": "Vị trái cây",
  };
  return flavorMapping[code] || code;
};

export const getGameLabel = (code: string): string => {
  const gameMapping: Record<string, string> = {
    "me-cung-tieu-hoa": "Mê Cung Tiêu Hóa",
    "biet-doi-danh-bay-cam-cum": "Biệt đội đánh bay cảm cúm",
    "duong-loi-khuan-khong-lo": "Đường Lợi khuẩn khổng lồ",
  };
  return gameMapping[code] || code;
};

export const getGenderLabel = (code: string): string => {
  const genderMapping: Record<string, string> = {
    "1": "Nam",
    "2": "Nữ",
    "0": "Không muốn ghi nhận",
  };
  return genderMapping[code] || code;
};

export const getMaritalStatusLabel = (code: string): string => {
  const maritalMapping: Record<string, string> = {
    "1": "Chưa lập gia đình",
    "2": "Đã lập gia đình và có con",
    "3": "Đã lập gia đình và chưa có con",
  };
  return maritalMapping[code] || code;
};
