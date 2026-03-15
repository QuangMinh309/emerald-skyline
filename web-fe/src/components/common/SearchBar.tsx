import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBar = ({
	placeholder = "Tìm kiếm...",
	onSearch,
}: {
	placeholder?: string;
	onSearch: (v: string) => void;
}) => (
	<div className="relative w-full">
		<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
		<Input
			placeholder={placeholder}
			className="pl-10 h-10 w-full border-black bg-white"
			onChange={(e) => onSearch(e.target.value)}
		/>
	</div>
);
