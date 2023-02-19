import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider);
const CONTRACT_ADDRESS = "0x3830Dc9f529987f2cB373F48304baF9EE6789a19";

export const contract = new web3.eth.Contract(
	require("./ABI.json"),
	CONTRACT_ADDRESS
);
