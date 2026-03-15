import type React from "react";

const Spinner: React.FC = () => {
	return (
		<div className="flex items-center justify-center h-full w-full">
			<div
				className="w-12 h-12 border-4 border-main border-t-transparent border-solid rounded-full animate-spin"
				style={{ borderColor: "#244B35 transparent #244B35 #244B35" }}
			></div>
		</div>
	);
};

export default Spinner;
