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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	handleStepOne,
	handleImportApartments,
	clearImportedData,
} from "@/store/slices/actionBlockSlice";
import {
	downloadSampleFile,
	parseImportedFile,
	type ImportedApartment,
} from "@/utils/apartmentImport";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileDown, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
}
const StepOne = ({ setStep }: StepOneProps) => {
	const value = useAppSelector((state) => state.actionBlock);
	const dispatch = useAppDispatch();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

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

	const handleDownloadSample = () => {
		try {
			downloadSampleFile();
			toast.success("Tải file mẫu thành công!");
		} catch (error) {
			toast.error("Lỗi khi tải file mẫu");
			console.error(error);
		}
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const validTypes = [
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/vnd.ms-excel",
		];
		if (!validTypes.includes(file.type)) {
			toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
			return;
		}

		setIsUploading(true);
		try {
			const result = await parseImportedFile(file);

			// Transform to format expected by Redux
			const apartments = result.apartments.map((apt) => ({
				roomName: apt.roomName,
				type: apt.type,
				area: apt.area,
				floor: apt.floor,
			}));

			// Dispatch to Redux
			dispatch(
				handleImportApartments({
					apartments,
					totalFloors: result.totalFloors,
					apartmentsPerFloor: result.apartmentsPerFloor,
					areasPerApartment: result.areasPerApartment,
					typesOfApartment: result.typesOfApartment,
					fileName: file.name,
				}),
			);

			// Update form values
			form.setValue("totalFloors", result.totalFloors);
			form.setValue("apartmentsPerFloor", result.apartmentsPerFloor);
			form.setValue("areasPerApartment", result.areasPerApartment);
			form.setValue("typesOfApartment", result.typesOfApartment);

			toast.success(
				`Import thành công ${result.totalApartments} căn hộ từ ${result.totalFloors} tầng!`,
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Lỗi khi import file",
			);
			console.error(error);
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleClearImport = () => {
		dispatch(clearImportedData());
		toast.info("Đã xóa dữ liệu import");
	};

	const onSubmit = (data: StepOneFormValues) => {
		console.log("Step One Data:", data);
		dispatch(handleStepOne(data));
		setStep(2);
		// Xử lý dữ liệu hoặc chuyển sang bước tiếp theo
	};
	useEffect(() => {
		console.log("Giá trị trong Redux thay đổi:", value);
		// Cập nhật giá trị biểu mẫu khi giá trị trong Redux thay đổi
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
	}, [value]);
	return (
		<>
			<div className="bg-white  rounded-lg border border-gray-200 shadow-sm ">
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
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Chọn trạng thái" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{BlockStatusOption.map((status) => (
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
							<div className="flex items-center justify-between mb-4">
								<Label>
									Danh sách phòng (nhập để tạo danh sách các tầng, phòng)
								</Label>
								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleDownloadSample}
										className="flex items-center gap-2"
									>
										<FileDown className="w-4 h-4" />
										Tải file mẫu
									</Button>
									<input
										ref={fileInputRef}
										type="file"
										accept=".xlsx,.xls"
										onChange={handleFileChange}
										className="hidden"
										id="apartment-file-input"
									/>
									<Button
										type="button"
										size="sm"
										onClick={() => fileInputRef.current?.click()}
										disabled={isUploading}
										className="flex items-center gap-2"
									>
										<Upload className="w-4 h-4" />
										{isUploading ? "Đang import..." : "Import"}
									</Button>
								</div>
							</div>
							{value.isImported && value.importedFileName && (
								<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="text-sm text-green-700">
											Đã import từ file:{" "}
											<span className="font-medium">
												{value.importedFileName}
											</span>
										</span>
										<span className="text-xs text-green-600">
											({value.apartments.length} căn hộ)
										</span>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={handleClearImport}
										className="h-6 w-6 p-0 text-green-700 hover:text-green-900 hover:bg-green-100"
									>
										<X className="w-4 h-4" />
									</Button>
								</div>
							)}
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
													disabled={value.isImported}
													className={
														value.isImported
															? "bg-gray-100 cursor-not-allowed"
															: ""
													}
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
													disabled={value.isImported}
													className={
														value.isImported
															? "bg-gray-100 cursor-not-allowed"
															: ""
													}
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
													disabled={value.isImported}
													className={
														value.isImported
															? "bg-gray-100 cursor-not-allowed"
															: ""
													}
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
												disabled={value.isImported}
											>
												<FormControl>
													<SelectTrigger
														className={
															value.isImported
																? "bg-gray-100 cursor-not-allowed"
																: ""
														}
													>
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
// form.handleSubmit(onSubmit);
export default StepOne;
