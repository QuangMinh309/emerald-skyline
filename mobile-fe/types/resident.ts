export interface Block {
  id: number;
  name: string;
}

export interface Apartment {
  id: number;
  name: string;
  floor: number;
  type: string;
  area: number;
  block: Block;
  isActive: boolean;
  createdAt: string;
}

export interface ResidentApartment {
  apartment: Apartment;
  relationship: string;
}

export interface ResidentResponse {
  id: number;
  accountId: number;
  fullName: string;
  citizenId: string;
  imageUrl: string | null;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phoneNumber: string;
  email?: string;
  nationality: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string | null;
  isActive: boolean;
  apartments: ResidentApartment[];
}

export interface UpdateResidentPayload {
  fullName?: string;
  citizenId?: string;
  dob?: string;
  gender?: string;
  phoneNumber?: string;
  province?: string;
  ward?: string;
  district?: string; // chuỗi rỗng
  detailAddress?: string;
  image?: any;
}
