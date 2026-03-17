import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ApartmentTypeOptions } from "@/constants/apartmentType";
import { BlockStatusOption } from "@/constants/blockStatus";
import { useGetBlockById } from "@/hooks/data/useBlocks";
import { hasResidentsInBlock } from "@/services/blocks.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	handleStepOne,
	setHasResidents,
	initializeUpdateBlock,
} from "@/store/slices/actionBlockSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileDown, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const StepOneSchema = z.object({
	buildingName: z.string().min(1, "Vui lòng nhập tên khối nhà"),
	managerName: z.string().min(1, "Vui lòng nhập tên quản lý"),
	managerPhone: z.string().min(1, "Vui lòng nhập số điện thoại"),
	status: z.string().min(1, "Vui lòng nhập trạng thái"),
	totalFloors: z.number().min(1, "Số tầng phải lớn hơn hoặc bằng 1"),
	apartmentsPerFloor: z
		.number()
		.min(1, "Số căn hộ mỗi tầng phải lớn hơn hoặc bằng 1"),
	areasPerApartment: z
		.number()
		.min(1, "Diện tích mỗi căn hộ phải lớn hơn hoặc bằng 1"),
	typesOfApartment: z.string().min(1, "Vui lòng nhập loại căn hộ"),
});

type StepOneFormValues = z.infer<typeof StepOneSchema>;

interface StepOneProps {
	setStep: (step: number) => void;
	blockId: number;
}

const StepOne = ({ setStep, blockId }: StepOneProps) => {
	const value = useAppSelector((state) => state.actionBlock);
	const dispatch = useAppDispatch();
	const [isCheckingResidents, setIsCheckingResidents] = useState(false);

	const { data: blockData, isLoading } = useGetBlockById(blockId);

	const form = useForm<StepOneFormValues>({
		resolver: zodResolver(StepOneSchema),
		defaultValues: {
			buildingName: "",
			managerName: "",
			managerPhone: "",
			status: "",
			totalFloors: 1,
			apartmentsPerFloor: 1,
			areasPerApartment: 1,
			typesOfApartment: "",
		},
	});

	// Initialize form with block data when loaded
	useEffect(() => {
		if (blockData && blockData.apartments.length > 0) {
			// Calculate apartments per floor and area from existing data
			const floorApartments = blockData.apartments.filter(
				(apt) => apt.floor === 1,
			);
			const apartmentsPerFloor = floorApartments.length || 1;
			const areasPerApartment = blockData.apartments[0]?.area
				? Number(blockData.apartments[0].area)
				: 1;
			const typesOfApartment = blockData.apartments[0]?.type || "";

			const formData = {
				buildingName: blockData.buildingName || "",
				managerName: blockData.managerName || "",
				managerPhone: blockData.managerPhone || "",
				status: blockData.status || "",
				totalFloors: blockData.totalFloors || 1,
				apartmentsPerFloor,
				areasPerApartment,
				typesOfApartment,
			};

			form.reset(formData);

			// Initialize Redux with block data including hasResidents from API
			dispatch(
				initializeUpdateBlock({
					...formData,
					apartments: blockData.apartments.map((apt) => ({
						id: apt.id,
						roomName: apt.roomName,
						type: apt.type,
						area: Number(apt.area),
						floor: apt.floor,
						hasResidents: apt.hasResidents || false, // Use actual value from API
					})),
				}),
			);

			// Check if any apartment has residents
			const hasAnyResidents = blockData.apartments.some(
				(apt) => apt.hasResidents,
			);
			dispatch(setHasResidents(hasAnyResidents));
		}
	}, [blockData, dispatch, form]);

	// Check if block has residents
	useEffect(() => {
		const checkResidents = async () => {
			setIsCheckingResidents(true);
			try {
				const result = await hasResidentsInBlock(blockId);
				dispatch(setHasResidents(result.hasResidents));
			} catch (error) {
				console.error("Error checking residents:", error);
				dispatch(setHasResidents(false));
			} finally {
				setIsCheckingResidents(false);
			}
		};

		// Only call this if we couldn't get hasResidents from API (fallback)
		if (!blockData || blockData.apartments.length === 0) {
			checkResidents();
		}
	}, [blockId, dispatch, blockData]);

	// Sync form with Redux state
	useEffect(() => {
		if (value.buildingName) {
			form.reset({
				buildingName: value.buildingName || "",
				managerName: value.managerName || "",
				managerPhone: value.managerPhone || "",
				status: value.status || "",
				totalFloors: value.totalFloors || 1,
				apartmentsPerFloor: value.apartmentsPerFloor || 1,
				areasPerApartment: value.areasPerApartment || 1,
				typesOfApartment: value.typesOfApartment || "",
			});
		}
	}, [value, form]);

	const onSubmit = (data: StepOneFormValues) => {
		console.log("Step One Data:", data);
		dispatch(handleStepOne(data));
		setStep(2);
	};

	if (isLoading || isCheckingResidents) {
		return (
			<div className="flex items-center justify-center p-12">
				<LoaderCircle className="animate-spin w-8 h-8 text-main" />
			</div>
		);
	}

	const hasResidents = value.hasResidents;

	return (
		<>
			<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
				{hasResidents && (
					<div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mx-6 mt-6">
						<p className="text-amber-800 text-sm font-medium">
							⚠️ Tòa nhà đã có người ở. Bạn chỉ có thể chỉnh sửa: Tên tòa, SDT
							trưởng tòa, Trưởng tòa.
						</p>
						<p className="text-amber-700 text-xs mt-1">
							Chỉ có thể xóa các tầng chưa có người ở ở bước tiếp theo.
						</p>
					</div>
				)}

				<Form {...form}>
					<form className="space-y-4">
						<div className="grid grid-cols-2 gap-x-4 gap-y-4 p-6">
							<FormField
								control={form.control}
								name="buildingName"
								render={({ field }) => (
									<FormItem className="space-y-1.5">
										<FormLabel isRequired>Tên khối nhà</FormLabel>
										<FormControl>
											<Input placeholder="Nhập tên khối nhà" {...field} />
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem className="space-y-1.5">
										<FormLabel isRequired>Trạng thái</FormLabel>
										<Select
											key={field.value}
											defaultValue={field.value}
											onValueChange={field.onChange}
											value={field.value || ""}
											disabled={hasResidents}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Chọn trạng thái" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{BlockStatusOption?.map((status) => (
													<SelectItem key={status.value} value={status.value}>
														{status.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="managerName"
								render={({ field }) => (
									<FormItem className="space-y-1.5">
										<FormLabel isRequired>Tên quản lý</FormLabel>
										<FormControl>
											<Input placeholder="Nhập tên quản lý" {...field} />
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="managerPhone"
								render={({ field }) => (
									<FormItem className="space-y-1.5">
										<FormLabel isRequired>Số điện thoại quản lý</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Nhập số điện thoại quản lý"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>
						<div className="w-full bg-gray-200 h-[1px]"></div>
						<div className="p-6 pt-2">
							<Label>
								Danh sách phòng (nhập để tạo danh sách các tầng, phòng)
							</Label>
							<div className="w-fit cursor-pointer ml-auto flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg hover:bg-main/90 transition-colors text-sm font-medium">
								<FileDown className="w-4 h-4" /> Import
							</div>
							<div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-4">
								<FormField
									control={form.control}
									name="totalFloors"
									render={({ field }) => (
										<FormItem className="space-y-1.5">
											<FormLabel isRequired>Tổng số tầng</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Nhập tổng số tầng"
													value={field.value}
													onChange={(e) =>
														field.onChange(Number(e.target.value) || 0)
													}
													disabled={hasResidents}
												/>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="areasPerApartment"
									render={({ field }) => (
										<FormItem className="space-y-1.5">
											<FormLabel isRequired>Diện tích mỗi căn hộ(m²)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Nhập diện tích mỗi căn hộ"
													value={field.value}
													onChange={(e) =>
														field.onChange(Number(e.target.value) || 0)
													}
													disabled={hasResidents}
												/>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="apartmentsPerFloor"
									render={({ field }) => (
										<FormItem className="space-y-1.5">
											<FormLabel isRequired>Số căn hộ mỗi tầng</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Nhập số căn hộ mỗi tầng"
													value={field.value}
													onChange={(e) =>
														field.onChange(Number(e.target.value) || 0)
													}
													disabled={hasResidents}
												/>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="typesOfApartment"
									render={({ field }) => (
										<FormItem className="space-y-1.5">
											<FormLabel isRequired>Loại căn hộ</FormLabel>
											<Select
												key={field.value}
												defaultValue={field.value}
												onValueChange={field.onChange}
												value={field.value || ""}
												disabled={hasResidents}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Chọn loại căn hộ" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{ApartmentTypeOptions?.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</form>
				</Form>
			</div>
			<div className="flex items-center justify-end gap-[10px] mt-4">
				<Button variant="outline" onClick={() => form.reset()}>
					Hủy
				</Button>
				<Button onClick={form.handleSubmit(onSubmit)}>Tiếp theo</Button>
			</div>
		</>
	);
};

export default StepOne;
