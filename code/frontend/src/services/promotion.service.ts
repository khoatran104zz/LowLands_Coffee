import { Promotion } from "@/types";

const PROMOTION_BACKEND_NOT_IMPLEMENTED = "Promotion backend chua trien khai.";

export const getPromotions = async (): Promise<Promotion[]> => {
  throw new Error(PROMOTION_BACKEND_NOT_IMPLEMENTED);
};
