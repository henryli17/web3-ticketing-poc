import Web3 from "web3";
import { getContract } from './api';

const web3 = new Web3(Web3.givenProvider);

export type ResaleToken = {
	owner: string,
	sold: boolean
};

export const getInstance = async () => {
	const contract = await getContract();
	return new web3.eth.Contract(contract.ABI, contract.address);
};

export const getResaleTokens = async (eventId: number): Promise<ResaleToken[]> => {
	const instance = await getInstance();
	const resaleTokens = await instance.methods.getResaleTokens(eventId).call();

	return resaleTokens.map((resaleToken: any) => {
		return {
			owner: resaleToken.owner,
			sold: resaleToken.sold
		};
	});
};
