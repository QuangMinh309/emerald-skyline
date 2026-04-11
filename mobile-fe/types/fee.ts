export interface FeeTier {
  id: number;
  name: string; // bậc 1,...
  fromValue: number;
  toValue: number | null;
  unitPrice: number;
}

export interface FeeData {
  id: number;
  name: string; // tiền điện, tiền nước
  unit: string; // kwh
  type: string;
  description: string;
  tiers: FeeTier[];
}
