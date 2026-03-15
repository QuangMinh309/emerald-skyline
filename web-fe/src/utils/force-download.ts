export const forceDownload = async (url: string, fileName: string) => {
	const res = await fetch(url);
	const blob = await res.blob();

	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = fileName;
	document.body.appendChild(a);
	a.click();

	URL.revokeObjectURL(a.href);
	a.remove();
};
