import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider);
const CONTRACT_ADDRESS = "0x1519a85Cf476F243c5869827dCde0829d652D1c4";

export const contract = new web3.eth.Contract(
	require("./ABI.json"),
	CONTRACT_ADDRESS
);
