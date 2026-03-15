export const normalizeString = (
	str: string | number | null | undefined,
): string => {
	if (str === null || str === undefined) return "";
	return String(str)
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.trim();
};
