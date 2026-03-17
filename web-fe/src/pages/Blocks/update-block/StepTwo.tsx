import { Button } from "@/components/ui/button";
import { UpdateApartmentMatrix } from "@/pages/Blocks/update-block/UpdateApartmentMatrix";
import type {
	Apartment,
	ApartmentType,
} from "@/pages/Blocks/update-block/UpdateApartmentMatrix";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { handleStepTwo } from "@/store/slices/actionBlockSlice";
import { useState, useCallback, useEffect } from "react";

interface StepTwoProps {
	setStep: (step: number) => void;
	blockId: number;
}

const StepTwo = ({ setStep }: StepTwoProps) => {
	const value = useAppSelector((state) => state.actionBlock);
	const dispatch = useAppDispatch();
	const [apartments, setApartments] = useState<Apartment[]>([]);

	// Initialize apartments from Redux state
	useEffect(() => {
		if (value.apartments.length > 0) {
			const mappedApartments: Apartment[] = value.apartments.map((apt) => ({
				id: apt.id || crypto.randomUUID(),
				code: apt.roomName,
				type: apt.type as ApartmentType,
				area: apt.area,
				floor: apt.floor,
				index: Number(apt.roomName.split(".")[1]) || 1,
				hasResidents: apt.hasResidents || false, // Use actual value from API
			}));
			setApartments(mappedApartments);
		}
	}, [value.apartments]);

	const handleApartmentsChange = useCallback((newApartments: Apartment[]) => {
		setApartments(newApartments);
	}, []);

	const handleContinue = () => {
		const data: {
			id?: number;
			roomName: string;
			type: string;
			area: number;
			floor: number;
		}[] = apartments.map((apt) => ({
			id: typeof apt.id === "number" ? apt.id : undefined,
			roomName: apt.code,
			type: apt.type,
			area: apt.area,
			floor: apt.floor,
		}));
		dispatch(handleStepTwo({ apartments: data }));
		setStep(3);
	};

	const handlePrevious = () => {
		setStep(1);
	};

	return (
		<div>
			<UpdateApartmentMatrix
				apartmentsPerFloor={value.apartmentsPerFloor}
				areasPerApartment={value.areasPerApartment}
				totalFloors={value.totalFloors}
				typesOfApartment={value.typesOfApartment as ApartmentType}
				blockName={value.buildingName}
				onApartmentsChange={handleApartmentsChange}
				existingApartments={apartments}
				hasResidents={value.hasResidents}
			/>
			<div className="flex items-center justify-end gap-[10px] mt-4">
				<Button variant="outline" onClick={handlePrevious}>
					Trước đó
				</Button>
				<Button onClick={handleContinue}>Tiếp theo</Button>
			</div>
		</div>
	);
};

export default StepTwo;
