export const prettyDate = (time: string | number) => {
	const date = new Date(time);
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	return [
		date.getDate(),
		months[date.getMonth()],
		date.getFullYear()
	].map(n => String(n).padStart(2, '0')).join(" ");
};
