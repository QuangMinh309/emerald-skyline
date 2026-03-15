import type { BlockStatusType } from "@/constants/blockStatus";

export interface Block {
	id: number;
	buildingName: string;
	status: BlockStatusType;
	totalFloors: number;
	managerName: string;
	managerPhone: string;
	totalRooms: number;
	roomDetails: {
		studio: number;
		oneBedroom: number;
		twoBedroom: number;
		penthouse: number;
	};
}

export interface BlockDetail {
	id: number;
	buildingName: string;
	status: BlockStatusType;
	totalFloors: number;
	managerName: string;
	managerPhone: string;
	totalRooms: number;
	apartments: {
		hasResidents: boolean;
		id: number;
		roomName: string;
		type: string;
		area: string;
		floor: number;
	}[];
}
