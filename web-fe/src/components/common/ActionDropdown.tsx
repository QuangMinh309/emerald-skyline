import React from "react";
import { ChevronDown, Download } from "lucide-react";
import type { ActionOption } from "@/types";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ActionDropdownProps {
	label?: string;
	options: ActionOption[];
	sampleFileUrl?: string;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
	label = "Thao tác",
	options,
	sampleFileUrl,
}) => {
	// kiểm tra có import thì thêm file mẫu import
	const hasImport = options.some((opt) =>
		opt.id.toLowerCase().includes("import"),
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="bg-secondary text-black border-secondary hover:bg-secondary/90 hover:text-black gap-2 transition-colors font-medium shadow-sm"
				>
					{label} <ChevronDown className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56 p-2">
				{options.map((opt, _index) => {
					return (
						<React.Fragment key={opt.id}>
							<DropdownMenuItem
								onClick={opt.onClick}
								className={cn(
									"cursor-pointer gap-3 py-2.5 text-sm font-medium transition-colors rounded-md",
									"text-main focus:text-main focus:bg-main/10",
									opt.variant === "danger" &&
										"text-red-600 focus:text-red-600 focus:bg-red-50",
								)}
							>
								{opt.icon && (
									<span
										className={cn(
											"w-5 h-5 flex items-center justify-center",
											opt.variant !== "danger" && "text-main",
										)}
									>
										{React.cloneElement(opt.icon, {
											className: "w-5 h-5 stroke-[2]",
										} as React.HTMLAttributes<HTMLElement>)}
									</span>
								)}
								{opt.label}
							</DropdownMenuItem>
						</React.Fragment>
					);
				})}

				{hasImport && sampleFileUrl && (
					<>
						<DropdownMenuSeparator className="my-1 bg-gray-200" />
						<a href={sampleFileUrl} download className="block w-full">
							<DropdownMenuItem className="cursor-pointer gap-3 py-2 text-sm text-gray-500 hover:text-main focus:text-main focus:bg-gray-50">
								<span className="w-5 h-5 flex items-center justify-center">
									<Download className="w-4 h-4 stroke-[1.5]" />
								</span>
								<span className="text-sm underline-offset-2">
									Tải file mẫu import
								</span>
							</DropdownMenuItem>
						</a>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ActionDropdown;
