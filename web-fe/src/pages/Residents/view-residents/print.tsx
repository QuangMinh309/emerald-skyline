import type { Resident } from "@/types/resident";

interface PrintableResidentListProps {
	data: Resident[];
}

export const PrintableResidentList = ({ data }: PrintableResidentListProps) => {
	const mainColor = "#244B35";
	const currentDate = new Date();

	return (
		<div
			className="hidden print:block p-8 bg-white text-black"
			style={{ fontFamily: '"Times New Roman", Times, serif' }}
		>
			<div className="flex flex-col items-center mb-6">
				<h1
					className="text-xl font-bold uppercase mb-2"
					style={{ color: mainColor }}
				>
					Danh Sách Cư Dân
				</h1>
				<p className="text-base font-medium italic text-gray-700">
					Ngày in: {currentDate.toLocaleDateString("vi-VN")} -{" "}
					{currentDate.toLocaleTimeString("vi-VN")}
				</p>
			</div>

			<table className="w-full border-collapse border border-black text-sm">
				<thead>
					<tr className="bg-gray-200 print:bg-gray-200 font-bold">
						<th className="border border-black p-2 text-center w-12">STT</th>
						<th className="border border-black p-2 text-left">Họ và tên</th>
						<th className="border border-black p-2 text-center">CCCD</th>
						<th className="border border-black p-2 text-center">Ngày sinh</th>
						<th className="border border-black p-2 text-center">Giới tính</th>
						<th className="border border-black p-2 text-center">
							Số điện thoại
						</th>
						<th className="border border-black p-2 text-left">Email</th>
					</tr>
				</thead>
				<tbody>
					{data.length > 0 ? (
						data.map((item, index) => {
							// format giới tính
							let genderLabel = "Khác";
							if (item.gender === "FEMALE") genderLabel = "Nữ";
							if (item.gender === "MALE") genderLabel = "Nam";

							// format ngày sinh
							const dobString = new Date(item.dob).toLocaleDateString("vi-VN", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							});

							return (
								<tr key={item.id} className="break-inside-avoid">
									<td className="border border-black p-2 text-center">
										{index + 1}
									</td>
									<td className="border border-black p-2 font-medium">
										{item.fullName}
									</td>
									<td className="border border-black p-2 text-center">
										{item.citizenId}
									</td>
									<td className="border border-black p-2 text-center">
										{dobString}
									</td>
									<td className="border border-black p-2 text-center">
										{genderLabel}
									</td>
									<td className="border border-black p-2 text-center">
										{item.phoneNumber}
									</td>
									<td className="border border-black p-2 text-left">
										{item.account.email}
									</td>
								</tr>
							);
						})
					) : (
						<tr>
							<td
								colSpan={7}
								className="border border-black p-4 text-center italic"
							>
								Không có dữ liệu hiển thị
							</td>
						</tr>
					)}
				</tbody>
			</table>

			<div className="flex justify-between mt-12 px-8 break-inside-avoid">
				<div className="text-center">
					<p className="font-bold mb-16">Người lập biểu</p>
					<p className="italic text-sm">(Ký, họ tên)</p>
				</div>
				<div className="text-center">
					<p className="font-bold mb-16">Ban quản lý</p>
					<p className="italic text-sm">(Ký, họ tên, đóng dấu)</p>
				</div>
			</div>
		</div>
	);
};
