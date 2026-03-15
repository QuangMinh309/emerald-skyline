import { cn } from "@/lib/utils";

interface RequiredLabelProps {
	children: React.ReactNode;
	isRequired?: boolean;
	className?: string;
}

export const RequiredLabel = ({
	children,
	isRequired,
	className,
}: RequiredLabelProps) => {
	return (
		<label
			className={cn(
				"text-sm font-medium leading-none text-foreground",
				className,
			)}
		>
			{children}
			{isRequired && <span className="text-red-500 ml-1">*</span>}
		</label>
	);
};
