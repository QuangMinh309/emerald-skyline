import { Button } from "@/components/ui/button";
import { useCreateBlock } from "@/hooks/data/useBlocks";
import { BlockCard } from "@/pages/Blocks/view-blocks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { handleStepThree } from "@/store/slices/actionBlockSlice";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StepThreeProps {
	setStep: (step: number) => void;
}
const StepThree = ({ setStep }: StepThreeProps) => {
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
	const { mutate: createBlock, isPending } = useCreateBlock();
	const handleCreate = () => {
		createBlock(
			{
				apartments: value.apartments,
				buildingName: value.buildingName,
				managerName: value.managerName,
				managerPhone: value.managerPhone,
				status: value.status,
			},
			{
				onSuccess: () => {
					toast.success("Tòa nha đã được tạo thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || "Lỗi khi tạo tòa nhà");
				},
			},
		);
	};
	return (
		<div>
			<div className="flex justify-center">
				<BlockCard
					block={{
						id: 0,
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
				<Button onClick={handleCreate} disabled={isPending}>
					{isPending && <LoaderCircle className="animate-spin" />}
					Thêm tòa
				</Button>
			</div>
		</div>
	);
};
export default StepThree;
