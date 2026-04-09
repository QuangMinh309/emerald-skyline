import { FeeData } from "@/types/fee";
import { api } from "./api";

const BASE = "fees";

export const getFeeDetail = async (id: number): Promise<FeeData> => {
  try {
    const response = await api.get(`${BASE}/${id}`);
    return response.data.data;
  } catch (err) {
    throw err;
  }
};
