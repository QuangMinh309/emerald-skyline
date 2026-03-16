import {
	AlertDialog,
	// AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
interface PopConfirmProps {
	title: string;
	open: boolean;
	setOpen: (value: boolean) => void;
	handleConfirm: () => void;
	submitText?: string;
	children: React.ReactNode;
	onLoading?: boolean;
	titleClassName?: string;
	buttonClassName?: string;
}
const PopConfirm = ({
	open,
	setOpen,
	handleConfirm,
	title,
	submitText = "Tiếp tục",
	children,
	onLoading = false,
	titleClassName,
	buttonClassName,
}: PopConfirmProps) => {
	return (
		<>
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent className="w-auto p-0">
					<p
						className={`font-bold p-4 pb-0 ${titleClassName || "text-[#c91616]"}`}
					>
						{title}
					</p>
					<div className="w-full h-[1px] bg-[#D9D9D9]" />
					<div className="px-4">{children}</div>
					<div className="w-full h-[0.5px] bg-[#D9D9D9]" />

					<AlertDialogFooter className="px-4 pb-4">
						{/* 3. AlertDialogCancel sẽ tự động gọi setIsOpen(false) */}
						<AlertDialogCancel disabled={onLoading}>Hủy</AlertDialogCancel>

						{/* Nếu muốn tự xử lý logic rồi mới đóng, dùng Button hoặc onClick vào Action */}
						{/* <AlertDialogAction onClick={handleConfirm}>{submitText}</AlertDialogAction> */}
						<Button
							onClick={(e) => {
								e.preventDefault();
								handleConfirm();
							}}
							disabled={onLoading}
							className={
								buttonClassName ||
								"bg-destructive text-destructive-foreground hover:bg-destructive/90"
							}
						>
							{onLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{submitText}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
export default PopConfirm;
