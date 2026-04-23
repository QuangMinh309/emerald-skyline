"use client";

import { Modal } from "@/components/common/Modal";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/common/DatePicker";
import { useCreateResident } from "@/hooks/data/useResidents";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useProvinces, useProvinceDetails } from "@/hooks/useLocation";
import { GenderTypeOptions } from "@/constants/genderType";
import { UploadImages } from "@/components/common/UploadImages";
import { readIdentity } from "@/services/ai.service";
import { Button } from "@/components/ui/button";
import { Scan, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
}

// 1. Schema với thông báo lỗi thân thiện
const CreateResidentSchema = z.object({
	email: z.string().email("Email không hợp lệ"),
	fullName: z.string().min(1, "Vui lòng nhập họ tên"),
	citizenId: z.string().min(1, "Vui lòng nhập CCCD"),
	dob: z.date({
		message: "Vui lòng chọn ngày sinh",
	}),
	gender: z.string().min(1, "Vui lòng chọn giới tính"),
	phoneNumber: z.string().min(1, "Vui lòng nhập số điện thoại"),
	nationality: z.string().min(1, "Vui lòng nhập quốc tịch"),
	ward: z.string().min(1, "Vui lòng nhập phường/xã"),
	province: z.string().min(1, "Vui lòng nhập tỉnh/thành phố"),
	detailAddress: z.string().optional(),
	image: z.instanceof(File).optional(),
});

type ResidentFormValues = z.infer<typeof CreateResidentSchema>;

const CreateResidentModal = ({ open, setOpen }: ModalProps) => {
	const { mutate: createResident, isPending } = useCreateResident();
	const [image, setImage] = useState<File[]>([]);
	const [cccdImage, setCccdImage] = useState<File | null>(null);
	const [cccdPreviewUrl, setCccdPreviewUrl] = useState<string | null>(null);
	const [isScanning, setIsScanning] = useState(false);

	useEffect(() => {
		if (!cccdImage) {
			setCccdPreviewUrl(null);
			return;
		}

		const previewUrl = URL.createObjectURL(cccdImage);
		setCccdPreviewUrl(previewUrl);

		return () => {
			URL.revokeObjectURL(previewUrl);
		};
	}, [cccdImage]);

	const form = useForm<ResidentFormValues>({
		resolver: zodResolver(CreateResidentSchema),
		defaultValues: {
			email: "",
			fullName: "",
			citizenId: "",
			dob: undefined,
			gender: "",
			phoneNumber: "",
			nationality: "Việt Nam",
			ward: "",
			province: "",
		},
	});

	// Hàm xử lý OCR CCCD
	const handleScanCCCD = async () => {
		if (!cccdImage) {
			toast.error("Vui lòng chọn ảnh căn cước trước");
			return;
		}

		setIsScanning(true);
		try {
			const result = await readIdentity(cccdImage);
			console.log("OCR result:", result);
			// Tự động điền vào form (ngoại trừ địa chỉ)
			if (result.name) {
				form.setValue("fullName", result.name);
			}
			if (result.id_number) {
				form.setValue("citizenId", result.id_number);
			}
			if (result.date_of_birth) {
				// Parse date từ format DD/MM/YYYY
				const [day, month, year] = result.date_of_birth.split("/");
				const date = new Date(
					parseInt(year),
					parseInt(month) - 1,
					parseInt(day),
				);
				form.setValue("dob", date);
			}
			if (result.gender) {
				// Map giới tính từ OCR sang giá trị form
				const genderMap: Record<string, string> = {
					Nam: "MALE",
					Nữ: "FEMALE",
					Male: "MALE",
					Female: "FEMALE",
				};
				const mappedGender = genderMap[result.gender] || result.gender;
				form.setValue("gender", mappedGender);
			}
			if (result.nationality) {
				form.setValue("nationality", result.nationality);
			}

			toast.success(
				`Đã quét thông tin thành công (độ chính xác: ${Math.round(result.overall_confidence * 100)}%)`,
			);
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Lỗi khi quét căn cước");
		} finally {
			setIsScanning(false);
		}
	};

	function onSubmit(values: ResidentFormValues) {
		console.log("images", image);
		createResident(
			{
				email: values.email,
				fullName: values.fullName,
				citizenId: values.citizenId,
				dob: values.dob.toISOString(),
				gender: values.gender,
				phoneNumber: values.phoneNumber,
				nationality: values.nationality,
				ward: values.ward,
				district: "",
				province: values.province,
				detailAddress: values.detailAddress,
				image: image[0],
			},
			{
				onSuccess: () => {
					toast.success("Cư dân đã được tạo thành công");
					handleClose();
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || "Lỗi khi tạo cư dân");
				},
			},
		);
	}
	const handleClose = () => {
		setOpen(false);
		form.reset();
		setImage([]);
		setCccdImage(null);
	};

	const selectedProvince = form.watch("province");

	// Lấy danh sách tỉnh từ API
	const { data: provinces = [], isLoading: isLoadingProvinces } =
		useProvinces();

	// Lấy code của tỉnh đã chọn
	const selectedProvinceCode = useMemo(() => {
		const province = provinces.find((p) => p.name === selectedProvince);
		return province?.code || null;
	}, [selectedProvince, provinces]);

	// Lấy chi tiết tỉnh (bao gồm danh sách wards)
	const { data: provinceDetails } = useProvinceDetails(selectedProvinceCode);

	// Lấy danh sách wards từ provinceDetails
	const wards = useMemo(() => {
		return provinceDetails?.wards || [];
	}, [provinceDetails]);

	return (
		<Modal
			open={open}
			setOpen={setOpen}
			title="Tạo cư dân mới"
			submitText="Tạo mới"
			onLoading={isPending}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<Form {...form}>
				<form className="space-y-4">
					{/* Ảnh đại diện */}
					<UploadImages
						files={image}
						onChange={(files) => {
							setImage(files);
						}}
						maxImages={1}
					/>

					{/* Upload và quét CCCD */}
					<div className="space-y-3">
						<Label>Ảnh căn cước công dân (CCCD)</Label>
						<div className="flex items-center gap-3">
							<Input
								type="file"
								accept="image/*"
								disabled={isPending || isScanning}
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										setCccdImage(file);
									} else {
										setCccdImage(null);
									}
								}}
								className="flex-1"
							/>
							<Button
								type="button"
								onClick={handleScanCCCD}
								disabled={!cccdImage || isPending || isScanning}
								className="bg-secondary hover:bg-secondary/90 text-white"
							>
								{isScanning ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Đang quét...
									</>
								) : (
									<>
										<Scan className="mr-2 h-4 w-4" />
										Quét CCCD
									</>
								)}
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Chọn ảnh CCCD rồi nhấn "Quét CCCD" để tự động điền thông tin
						</p>
						{cccdPreviewUrl && (
							<div className="space-y-2">
								<p className="text-xs font-medium">Xem trước ảnh CCCD</p>
								<div className="overflow-hidden rounded-md border bg-muted/20">
									<img
										src={cccdPreviewUrl}
										alt="Xem trước ảnh CCCD"
										className="h-48 w-full object-contain"
									/>
								</div>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-x-4 gap-y-4">
						{/* Email */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Email</FormLabel>
									<FormControl>
										<Input placeholder="Nhập email" type="email" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Họ và tên */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Họ và tên</FormLabel>
									<FormControl>
										<Input placeholder="Nhập họ và tên" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* CCCD */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="citizenId"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>CCCD</FormLabel>
									<FormControl>
										<Input placeholder="Nhập số CCCD" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Ngày sinh */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="dob"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Ngày sinh</FormLabel>
									<FormControl>
										<DatePicker value={field.value} onChange={field.onChange} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Giới tính */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="gender"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Giới tính</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn giới tính" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{GenderTypeOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Số điện thoại */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="phoneNumber"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Số điện thoại</FormLabel>
									<FormControl>
										<Input placeholder="Nhập số điện thoại" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						{/* Quốc tịch */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="nationality"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel isRequired>Quốc tịch</FormLabel>
									<FormControl>
										<Input placeholder="Nhập quốc tịch" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="province"
							render={({ field }) => (
								<FormItem>
									<FormLabel isRequired>Tỉnh / Thành phố</FormLabel>
									<Select
										value={field.value}
										onValueChange={(value) => {
											field.onChange(value);
											form.setValue("ward", "");
										}}
										disabled={isLoadingProvinces}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														isLoadingProvinces ? "Đang tải..." : "Chọn tỉnh"
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{provinces.map((p) => (
												<SelectItem key={p.code} value={p.name}>
													{p.name}
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
							name="ward"
							render={({ field }) => (
								<FormItem>
									<FormLabel isRequired>Phường / Xã</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={!selectedProvince || wards.length === 0}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Chọn phường / xã" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{wards.map((w) => (
												<SelectItem key={w.code} value={w.name}>
													{w.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							disabled={isPending}
							control={form.control}
							name="detailAddress"
							render={({ field }) => (
								<FormItem className="space-y-1.5  col-span-2">
									<FormLabel>Địa chỉ chi tiết</FormLabel>
									<FormControl>
										<Input placeholder="Nhập địa chỉ chi tiết" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
					</div>
				</form>
			</Form>
		</Modal>
	);
};

export default CreateResidentModal;
