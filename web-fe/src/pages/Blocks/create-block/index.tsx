import PageHeader from "@/components/common/PageHeader";
import Stepper from "@/components/common/Stepper";
import StepOne from "@/pages/Blocks/create-block/StepOne";
import StepThree from "@/pages/Blocks/create-block/StepThree";
import StepTwo from "@/pages/Blocks/create-block/StepTwo";
import { useState } from "react";
const CreateBlockPage = () => {
	const [step, setStep] = useState(1);

	return (
		<div className="p-1.5 pt-0 space-y-4">
			<PageHeader
				title="Tạo mới khối nhà"
				// subtitle="Quản lý  danh sách các dịch vụ của chung cư"
				showBack
			/>
			<div className="bg-white p-6  rounded-lg border border-gray-200 shadow-sm space-y-6">
				<div className="px-10">
					<Stepper steps={[1, 2, 3]} currentStep={step} />
				</div>
				<div>
					{step === 1 && <StepOne setStep={setStep} />}
					{step === 2 && <StepTwo setStep={setStep} />}
					{step === 3 && <StepThree setStep={setStep} />}
				</div>
			</div>
		</div>
	);
};
export default CreateBlockPage;
