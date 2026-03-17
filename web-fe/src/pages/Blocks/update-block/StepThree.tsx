import { Button } from "@/components/ui/button";
import { useUpdateBlock } from "@/hooks/data/useBlocks";
import { BlockCard } from "@/pages/Blocks/view-blocks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { handleStepThree } from "@/store/slices/actionBlockSlice";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StepThreeProps {
	setStep: (step: number) => void;
	blockId: number;
}

const StepThree = ({ setStep, blockId }: StepThreeProps) => {
	const router = useNavigate();
	const dispatch = useAppDispatch();
	const value = useAppSelector((state) => state.actionBlock);
	const studio = value.apartments.filter((apt) => apt.type === "STUDIO").length;
	const oneBedroom = value.apartments.filter(
		(apt) => apt.type === "ONE_BEDROOM",
	).length;
	const twoBedroom = value.apartments.filter(
		(apt) => apt.type === "TWO_BEDROOM",
	).length;
	const penthouse = value.apartments.filter(
		(apt) => apt.type === "PENTHOUSE",
	).length;

	const handlePrevious = () => {
		setStep(2);
	};

	const handleClose = () => {
		router("/blocks");
		dispatch(handleStepThree());
	};

	const { mutate: updateBlock, isPending } = useUpdateBlock();

	const handleUpdate = () => {
		const apartments = value.apartments.map((apt) => ({
			roomName: apt.roomName,
			type: apt.type,
			area: apt.area,
			floor: apt.floor,
		}));
		updateBlock(
			{
				id: blockId,
				data: {
					apartments: apartments,
					buildingName: value.buildingName,
					managerName: value.managerName,
					managerPhone: value.managerPhone,
					status: value.status,
				},
			},
			{
				onSuccess: () => {
					toast.success("Tòa nhà đã được cập nhật thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || "Lỗi cập nhật tòa nhà");
				},
			},
		);
	};

	return (
		<div>
			<div className="flex justify-center">
				<BlockCard
					block={{
						id: blockId,
						buildingName: value.buildingName,
						managerName: value.managerName,
						managerPhone: value.managerPhone,
						totalFloors: value.totalFloors,
						totalRooms: value.apartments.length,
						status: value.status,
						roomDetails: {
							studio: studio,
							oneBedroom: oneBedroom,
							twoBedroom: twoBedroom,
							penthouse: penthouse,
						},
					}}
				/>
			</div>
			<div className="flex items-center justify-end gap-[10px] mt-4">
				<Button variant="outline" onClick={handlePrevious} disabled={isPending}>
					Trước đó
				</Button>
				<Button onClick={handleUpdate} disabled={isPending}>
					{isPending && <LoaderCircle className="animate-spin" />}
					Cập nhật tòa
				</Button>
			</div>
		</div>
	);
};

export default StepThree;
