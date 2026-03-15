import clsx from "clsx";

interface StepperProps {
	steps: number[];
	currentStep: number;
}

const Stepper = ({ steps, currentStep }: StepperProps) => {
	return (
		<div className="flex items-center justify-between w-full relative">
			{/* Line nền */}
			<div className="absolute top-1/2 left-0 h-[2px] bg-gray-300  transition-all w-full" />
			<div
				className="absolute top-1/2 left-0 h-[2px] bg-green-800  transition-all "
				style={{
					width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
				}}
			/>
			{steps.map((step) => {
				const isActive = step === currentStep;
				const isCompleted = step < currentStep;

				return (
					<div
						key={step}
						className="flex flex-col items-center z-10 cursor-pointer"
					>
						<div
							className={clsx(
								"w-10 h-10 rounded-full flex items-center justify-center font-semibold",
								isActive || isCompleted
									? "bg-green-800 text-white"
									: "bg-gray-200 text-gray-600",
							)}
						>
							{step}
						</div>
					</div>
				);
			})}
		</div>
	);
};
export default Stepper;
