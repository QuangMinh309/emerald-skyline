export interface MenuItem {
	id: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	path?: string;
}

export interface TabItem {
	id: string;
	label: string;
	count?: number;
}

export interface TableColumn<T> {
	key: keyof T | string;
	label: string;
	width?: string;
	align?: "left" | "center" | "right";
	sortable?: boolean;
	filterable?: boolean;
	searchable?: boolean;
	filterAccessor?: (item: T) => string;
	render?: (item: T) => React.ReactNode;
	isImage?: boolean;
}

export interface ActionOption {
	id: string;
	label: string;
	icon?: React.ReactElement;
	variant?: "default" | "danger";
	onClick: () => void;
}
