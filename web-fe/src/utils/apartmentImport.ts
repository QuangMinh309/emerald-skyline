import * as XLSX from "xlsx";

export interface ImportedApartment {
	roomName: string;
	floor: number;
	area: number;
	type: string;
}

export interface ImportSummary {
	totalApartments: number;
	totalFloors: number;
	apartments: ImportedApartment[];
	apartmentsPerFloor: number;
	areasPerApartment: number;
	typesOfApartment: string;
}

/**
 * Generate and download a sample Excel file for apartment import
 */
export function downloadSampleFile(): void {
	// Sample data
	const sampleData = [
		{
			"Mã căn hộ": "A-01.01",
			Tầng: 1,
			"Diện tích (m²)": 50,
			"Loại căn hộ": "STUDIO",
		},
		{
			"Mã căn hộ": "A-01.02",
			Tầng: 1,
			"Diện tích (m²)": 50,
			"Loại căn hộ": "STUDIO",
		},
		{
			"Mã căn hộ": "A-02.01",
			Tầng: 2,
			"Diện tích (m²)": 75,
			"Loại căn hộ": "ONE_BEDROOM",
		},
		{
			"Mã căn hộ": "A-02.02",
			Tầng: 2,
			"Diện tích (m²)": 75,
			"Loại căn hộ": "ONE_BEDROOM",
		},
		{
			"Mã căn hộ": "A-03.01",
			Tầng: 3,
			"Diện tích (m²)": 100,
			"Loại căn hộ": "TWO_BEDROOM",
		},
	];

	// Create worksheet
	const ws = XLSX.utils.json_to_sheet(sampleData);

	// Set column widths
	ws["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 18 }, { wch: 20 }];

	// Create workbook
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Danh sách căn hộ");

	// Add instruction sheet
	const instructions = [
		{
			"Hướng dẫn": "1. Mã căn hộ: Định dạng A-XX.YY (XX: tầng, YY: số thứ tự)",
		},
		{ "Hướng dẫn": "2. Tầng: Số nguyên dương (1, 2, 3, ...)" },
		{ "Hướng dẫn": "3. Diện tích: Số thập phân, đơn vị m²" },
		{
			"Hướng dẫn":
				"4. Loại căn hộ: STUDIO, ONE_BEDROOM, TWO_BEDROOM, PENTHOUSE",
		},
		{ "Hướng dẫn": "" },
		{ "Hướng dẫn": "Lưu ý:" },
		{ "Hướng dẫn": "- Không thay đổi tên các cột" },
		{ "Hướng dẫn": "- Mỗi dòng là một căn hộ" },
		{ "Hướng dẫn": "- Xóa dữ liệu mẫu và nhập dữ liệu thực tế" },
	];
	const wsInstructions = XLSX.utils.json_to_sheet(instructions);
	wsInstructions["!cols"] = [{ wch: 60 }];
	XLSX.utils.book_append_sheet(wb, wsInstructions, "Hướng dẫn");

	// Download file
	XLSX.writeFile(wb, "Mau_Danh_Sach_Can_Ho.xlsx");
}

/**
 * Parse imported Excel file and extract apartment data
 */
export async function parseImportedFile(file: File): Promise<ImportSummary> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const data = e.target?.result;
				const workbook = XLSX.read(data, { type: "binary" });

				// Get first sheet
				const sheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[sheetName];

				// Convert to JSON
				const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<{
					"Mã căn hộ": string;
					Tầng: number;
					"Diện tích (m²)": number;
					"Loại căn hộ": string;
				}>;

				if (jsonData.length === 0) {
					reject(new Error("File không có dữ liệu"));
					return;
				}

				// Validate and transform data
				const apartments: ImportedApartment[] = [];
				const floors = new Set<number>();
				const areas = new Set<number>();
				const types = new Set<string>();

				for (let i = 0; i < jsonData.length; i++) {
					const row = jsonData[i];

					// Validate required fields
					if (
						!row["Mã căn hộ"] ||
						!row["Tầng"] ||
						!row["Diện tích (m²)"] ||
						!row["Loại căn hộ"]
					) {
						reject(new Error(`Dòng ${i + 2}: Thiếu thông tin bắt buộc`));
						return;
					}

					// Validate floor is positive integer
					const floor = Number(row["Tầng"]);
					if (!Number.isInteger(floor) || floor <= 0) {
						reject(new Error(`Dòng ${i + 2}: Số tầng phải là số nguyên dương`));
						return;
					}

					// Validate area is positive number
					const area = Number(row["Diện tích (m²)"]);
					if (isNaN(area) || area <= 0) {
						reject(new Error(`Dòng ${i + 2}: Diện tích phải là số dương`));
						return;
					}

					// Validate apartment type
					const type = row["Loại căn hộ"].trim();
					const validTypes = [
						"STUDIO",
						"ONE_BEDROOM",
						"TWO_BEDROOM",
						"PENTHOUSE",
					];
					if (!validTypes.includes(type)) {
						reject(
							new Error(
								`Dòng ${i + 2}: Loại căn hộ không hợp lệ. Chỉ chấp nhận: ${validTypes.join(", ")}`,
							),
						);
						return;
					}

					apartments.push({
						roomName: row["Mã căn hộ"].trim(),
						floor,
						area,
						type,
					});

					floors.add(floor);
					areas.add(area);
					types.add(type);
				}

				// Calculate statistics
				const totalFloors = Math.max(...Array.from(floors));

				// Count apartments per floor (use mode/most common value)
				const floorCounts = new Map<number, number>();
				apartments.forEach((apt) => {
					floorCounts.set(apt.floor, (floorCounts.get(apt.floor) || 0) + 1);
				});
				const apartmentsPerFloor = Math.max(
					...Array.from(floorCounts.values()),
				);

				// Get most common area
				const areaCounts = new Map<number, number>();
				apartments.forEach((apt) => {
					areaCounts.set(apt.area, (areaCounts.get(apt.area) || 0) + 1);
				});
				const areasPerApartment = Array.from(areaCounts.entries()).sort(
					(a, b) => b[1] - a[1],
				)[0][0];

				// Get most common type
				const typeCounts = new Map<string, number>();
				apartments.forEach((apt) => {
					typeCounts.set(apt.type, (typeCounts.get(apt.type) || 0) + 1);
				});
				const typesOfApartment = Array.from(typeCounts.entries()).sort(
					(a, b) => b[1] - a[1],
				)[0][0];

				resolve({
					totalApartments: apartments.length,
					totalFloors,
					apartments,
					apartmentsPerFloor,
					areasPerApartment,
					typesOfApartment,
				});
			} catch (error) {
				reject(
					new Error(
						`Lỗi khi đọc file: ${error instanceof Error ? error.message : "Unknown error"}`,
					),
				);
			}
		};

		reader.onerror = () => {
			reject(new Error("Lỗi khi đọc file"));
		};

		reader.readAsBinaryString(file);
	});
}
