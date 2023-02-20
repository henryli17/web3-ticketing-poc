import { getContract } from './api';
import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider);

export const instance = async () => {
	const contract = await getContract();
	return new web3.eth.Contract(contract.ABI, contract.address);
};


