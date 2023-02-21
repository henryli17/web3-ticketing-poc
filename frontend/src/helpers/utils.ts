import Web3 from "web3";

export const prettyDate = (time: string | number) => {
	const date = new Date(time);
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	return [
		date.getDate(),
		months[date.getMonth()],
		date.getFullYear()
	].map(n => String(n).padStart(2, '0')).join(" ");
};


export const range = (start: number, end: number) => {
	return Array(end - start + 1).fill(start).map((x, y) => x + y);
};

export const gweiToEth = (gwei: number | string) => Web3.utils.fromWei(gwei.toString(), "gwei");
export const gweiToWei = (gwei: number | string) => Web3.utils.toWei(gwei.toString(), "gwei");
export const ethToGwei = (eth: number) => eth * Math.pow(10, 9);
