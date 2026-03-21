"use client";

import { useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useVerifyInvoice } from "@/hooks/data/useInvoices";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Info } from "@/pages/Invoices/detail-invoice";

interface VerifyInvoiceModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	invoice: any;
}

/* ================= Schema ================= */

const VerifyInvoiceSchema = z.object({
	meterReadings: z.array(
		z.object({
			feeTypeId: z.number(),
			newIndex: z.number().min(0, "Chỉ số phải >= 0"),
		}),
	),
});

type VerifyInvoiceFormValues = z.infer<typeof VerifyInvoiceSchema>;

/* ================= Component ================= */

const VerifyInvoiceModal = ({
	open,
	setOpen,
	invoice,
}: VerifyInvoiceModalProps) => {
	console.log(invoice);
	const { mutate: verifyInvoice, isPending } = useVerifyInvoice();

	const form = useForm<VerifyInvoiceFormValues>({
		resolver: zodResolver(VerifyInvoiceSchema),
		defaultValues: {
			meterReadings: [],
		},
	});

	/* Init form when modal opens */
	useEffect(() => {
		if (open && invoice?.id) {
			// For client invoices with meterReadings
			if (invoice?.meterReadings && Array.isArray(invoice.meterReadings)) {
				form.reset({
					meterReadings: invoice.meterReadings.map((reading: any) => ({
						feeTypeId: reading.feeTypeId,
						newIndex: reading.newIndex || 0,
					})),
				});
			}
			// For invoices with invoiceDetails (traditional structure)
			else if (invoice?.invoiceDetails) {
				const waterDetail = invoice.invoiceDetails.find(
					(d: any) => d.feeTypeName === "Tiền nước",
				);
				const electricityDetail = invoice.invoiceDetails.find(
					(d: any) => d.feeTypeName === "Tiền điện",
				);

				const meterReadings = [];
				if (waterDetail) {
					meterReadings.push({
						feeTypeId: waterDetail.feeTypeId,
						newIndex: Number(waterDetail.amount) || 0,
					});
				}
				if (electricityDetail) {
					meterReadings.push({
						feeTypeId: electricityDetail.feeTypeId,
						newIndex: Number(electricityDetail.amount) || 0,
					});
				}

				form.reset({
					meterReadings,
				});
			}
		}
	}, [open, invoice, form]);

	const handleClose = () => {
		setOpen(false);
		form.reset();
	};

	function onSubmit(values: VerifyInvoiceFormValues) {
		if (!invoice?.id) return;

		const data: {
			invoiceId: number;
			meterReadings: {
				feeTypeId: number;
				newIndex: number;
			}[];
		} = {
			invoiceId: invoice.id,
			meterReadings: values.meterReadings,
		};

		verifyInvoice(data, {
			onSuccess: () => {
				toast.success("Xác nhận chỉ số thành công");
				handleClose();
			},
			onError: (err: any) => {
				toast.error(err?.message || "Có lỗi xảy ra");
			},
		});
	}

	return (
		<Modal
			showFooter={!invoice?.meterReadingsVerified}
			open={open}
			setOpen={setOpen}
			title="Xác nhận chỉ số hóa đơn"
			submitText="Xác nhận"
			onSubmit={form.handleSubmit(onSubmit)}
			onLoading={isPending}
		>
			<Form {...form}>
				<form className="space-y-4">
					{/* Invoice Info */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 border p-4 rounded-lg bg-gray-50   ">
						<Info label="Mã hóa đơn" value={invoice?.invoiceCode} />
						<Info label="ID căn hộ" value={invoice?.period} />
					</div>

					{/* Ảnh */}
					{invoice?.imageUrl && (
						<div className="space-y-2">
							<Label>Ảnh chỉ số từ người dùng</Label>
							<img
								src={invoice.imageUrl}
								alt="meter"
								className="w-full max-h-80 object-contain border rounded-lg"
							/>
						</div>
					)}
					{/* Danh sách chỉ số */}
					<div className="space-y-3">
						{form.watch("meterReadings").length > 0 ? (
							form.watch("meterReadings").map((reading: any, index: number) => {
								// Find fee type name from the original invoice data
								const feeTypeName =
									invoice?.meterReadings?.find(
										(m: any) => m.feeTypeId === reading.feeTypeId,
									)?.feeType?.name || `Loại phí ${reading.feeTypeId}`;

								const labelMap: { [key: string]: string } = {
									"Tiền nước": "Chỉ số nước (m³)",
									"Tiền điện": "Chỉ số điện (kWh)",
								};

								const label = labelMap[feeTypeName] || feeTypeName;

								return (
									<FormField
										key={index}
										disabled={isPending || invoice.meterReadingsVerified}
										control={form.control}
										name={`meterReadings.${index}.newIndex`}
										render={({ field }) => (
											<FormItem className="space-y-1.5">
												<FormLabel isRequired>{label}</FormLabel>
												<FormControl>
													<Input
														disabled={
															isPending || invoice.meterReadingsVerified
														}
														type="number"
														placeholder={`Nhập ${label.toLowerCase()}`}
														value={field.value ?? ""}
														onChange={(e) =>
															field.onChange(Number(e.target.value))
														}
													/>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>
								);
							})
						) : (
							<div className="text-sm text-gray-500">
								Không có chỉ số để xác nhận
							</div>
						)}
					</div>
				</form>
			</Form>
		</Modal>
	);
};

export default VerifyInvoiceModal;
