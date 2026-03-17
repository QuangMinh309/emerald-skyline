import PageHeader from "@/components/common/PageHeader";
import Stepper from "@/components/common/Stepper";
import StepOne from "@/pages/Blocks/update-block/StepOne";
import StepThree from "@/pages/Blocks/update-block/StepThree";
import StepTwo from "@/pages/Blocks/update-block/StepTwo";
import { useState } from "react";
import { useParams } from "react-router-dom";

const UpdateBlockPage = () => {
	const { id } = useParams<{ id: string }>();
	const [step, setStep] = useState(1);

	if (!id) {
		return (
			<div className="p-1.5 pt-0 space-y-4">
				<div className="bg-red-50 border border-red-200 p-8 rounded text-center text-red-600">
					Không tìm thấy ID tòa nhà
				</div>
			</div>
		);
	}

	return (
		<div className="p-1.5 pt-0 space-y-4">
			<PageHeader title="Cập nhật khối nhà" showBack />
			<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
				<div className="px-10">
					<Stepper steps={[1, 2, 3]} currentStep={step} />
				</div>
				<div>
					{step === 1 && <StepOne setStep={setStep} blockId={Number(id)} />}
					{step === 2 && <StepTwo setStep={setStep} blockId={Number(id)} />}
					{step === 3 && <StepThree setStep={setStep} blockId={Number(id)} />}
				</div>
			</div>
		</div>
	);
};

export default UpdateBlockPage;
