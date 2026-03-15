export const getViewUrl = (url: string, fileName?: string) => {
	const name = fileName || url;

	const isOfficeFile = /\.(docx?|xlsx?|pptx?)$/i.test(name);

	return isOfficeFile
		? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
		: url;
};
