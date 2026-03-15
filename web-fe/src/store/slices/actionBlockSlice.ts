import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ActionBlockState {
	buildingName: string;
	managerName: string;
	managerPhone: string;
	status: string;
	apartments: {
		id?: number;
		roomName: string;
		type: string;
		area: number;
		floor: number;
		hasResidents?: boolean; // Add field to store residents status
	}[];
	totalFloors: number;
	apartmentsPerFloor: number;
	areasPerApartment: number;
	typesOfApartment: string;
	hasResidents: boolean;
	isImported: boolean; // Track if data was imported from file
	importedFileName?: string; // Store the imported file name
}

const initialState: ActionBlockState = {
	buildingName: "",
	managerName: "",
	managerPhone: "",
	status: "",
	apartments: [],
	//
	totalFloors: 1,
	apartmentsPerFloor: 1,
	areasPerApartment: 1,
	typesOfApartment: "",
	hasResidents: false,
	isImported: false,
	importedFileName: undefined,
};

const actionBlockSlice = createSlice({
	name: "actionBlock",
	initialState,
	reducers: {
		// increment: (state) => {
		//   state.value += 1;
		// },
		// decrement: (state) => {
		//   state.value -= 1;
		// },
		handleStepOne: (
			state,
			action: PayloadAction<{
				buildingName: string;
				managerName: string;
				managerPhone: string;
				status: string;
				totalFloors: number;
				apartmentsPerFloor: number;
				areasPerApartment: number;
				typesOfApartment: string;
			}>,
		) => {
			state.buildingName = action.payload.buildingName;
			state.managerName = action.payload.managerName;
			state.managerPhone = action.payload.managerPhone;
			state.status = action.payload.status;
			state.totalFloors = action.payload.totalFloors;
			state.apartmentsPerFloor = action.payload.apartmentsPerFloor;
			state.areasPerApartment = action.payload.areasPerApartment;
			state.typesOfApartment = action.payload.typesOfApartment;
		},
		handleImportApartments: (
			state,
			action: PayloadAction<{
				apartments: ActionBlockState["apartments"];
				totalFloors: number;
				apartmentsPerFloor: number;
				areasPerApartment: number;
				typesOfApartment: string;
				fileName: string;
			}>,
		) => {
			state.apartments = action.payload.apartments;
			state.totalFloors = action.payload.totalFloors;
			state.apartmentsPerFloor = action.payload.apartmentsPerFloor;
			state.areasPerApartment = action.payload.areasPerApartment;
			state.typesOfApartment = action.payload.typesOfApartment;
			state.isImported = true;
			state.importedFileName = action.payload.fileName;
		},
		clearImportedData: (state) => {
			state.isImported = false;
			state.importedFileName = undefined;
			state.apartments = [];
		},
		handleStepTwo: (
			state,
			action: PayloadAction<{ apartments: ActionBlockState["apartments"] }>,
		) => {
			const totalFloors = action.payload.apartments.reduce(
				(max, apt) => Math.max(max, apt.floor),
				0,
			);
			state.totalFloors = totalFloors;
			state.apartments = action.payload.apartments;
		},
		handleStepThree: (state) => {
			(state.apartments = []),
				(state.buildingName = ""),
				(state.managerName = ""),
				(state.managerPhone = ""),
				(state.status = ""),
				(state.totalFloors = 1),
				(state.apartmentsPerFloor = 1),
				(state.areasPerApartment = 1),
				(state.typesOfApartment = ""),
				(state.hasResidents = false),
				(state.isImported = false),
				(state.importedFileName = undefined);
		},
		setHasResidents: (state, action: PayloadAction<boolean>) => {
			state.hasResidents = action.payload;
		},
		initializeUpdateBlock: (
			state,
			action: PayloadAction<{
				buildingName: string;
				managerName: string;
				managerPhone: string;
				status: string;
				totalFloors: number;
				apartmentsPerFloor: number;
				areasPerApartment: number;
				typesOfApartment: string;
				apartments: ActionBlockState["apartments"];
			}>,
		) => {
			state.buildingName = action.payload.buildingName;
			state.managerName = action.payload.managerName;
			state.managerPhone = action.payload.managerPhone;
			state.status = action.payload.status;
			state.totalFloors = action.payload.totalFloors;
			state.apartmentsPerFloor = action.payload.apartmentsPerFloor;
			state.areasPerApartment = action.payload.areasPerApartment;
			state.typesOfApartment = action.payload.typesOfApartment;
			state.apartments = action.payload.apartments;
		},
	},
});

export const {
	handleStepOne,
	handleStepTwo,
	handleStepThree,
	setHasResidents,
	initializeUpdateBlock,
	handleImportApartments,
	clearImportedData,
} = actionBlockSlice.actions;
export default actionBlockSlice.reducer;
