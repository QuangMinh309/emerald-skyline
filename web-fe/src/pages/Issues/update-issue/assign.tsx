import PopConfirm from "@/components/common/PopConfirm";

interface Props {
	open: boolean;
	setOpen: (v: boolean) => void;
	onConfirm: () => void;
	isLoading: boolean;
	issueTitle?: string;
}

export const AssignTechnicianConfirm = ({
	open,
	setOpen,
	onConfirm,
	isLoading,
	issueTitle,
}: Props) => {
	return (
		<PopConfirm
			open={open}
			setOpen={setOpen}
			title="Xác nhận chuyển bộ phận"
			handleConfirm={onConfirm}
			onLoading={isLoading}
			submitText="Chuyển ngay"
			titleClassName="text-[#244B35]"
			buttonClassName="bg-[#244B35] hover:bg-[#16382b] text-white"
		>
			<div>
				Bạn có chắc chắn muốn chuyển phản ánh <strong>"{issueTitle}"</strong>{" "}
				cho bộ phận kỹ thuật xử lý?
			</div>
		</PopConfirm>
	);
};
