import type { TabItem } from "@/types";
import { cn } from "@/lib/utils";

type TabSize = "sm" | "md" | "lg";

interface TabNavigationProps {
	tabs: TabItem[];
	activeTab: string;
	onChange: (id: string) => void;
	size?: TabSize;
	className?: string;
}

const sizeClasses: Record<TabSize, string> = {
	sm: "px-3 py-1.5 text-xs",
	md: "px-4 py-2 text-sm",
	lg: "px-5 py-2.5 text-base",
};

export const TabNavigation = ({
	tabs,
	activeTab,
	onChange,
	size = "md",
	className,
}: TabNavigationProps) => {
	return (
		<div
			className={cn(
				"inline-flex flex-wrap items-center p-1 border border-main rounded-md bg-white",
				className,
			)}
		>
			{tabs.map((tab) => {
				const isActive = activeTab === tab.id;

				return (
					<button
						key={tab.id}
						type="button"
						onClick={() => onChange(tab.id)}
						className={cn(
							"flex items-center gap-2 font-medium rounded-md transition-all duration-200 ease-in-out whitespace-nowrap",
							sizeClasses[size],
							isActive
								? "bg-main text-white shadow-sm"
								: "text-main hover:bg-main/10",
						)}
					>
						<span>{tab.label}</span>

						{tab.count !== undefined && (
							<span className="opacity-90">({tab.count})</span>
						)}
					</button>
				);
			})}
		</div>
	);
};
