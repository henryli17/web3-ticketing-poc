import Web3 from "web3";
import { getContract } from "./api";

const web3 = new Web3(Web3.givenProvider);
const w = window as any;

enum EthNetwork {
    GOERLI = "Goerli",
    GANACHE = "Ganache",
}

export const ETH_NETWORK =
    process.env.NODE_ENV === "production"
        ? EthNetwork.GOERLI
        : EthNetwork.GANACHE;

export const CHAIN_ID = ETH_NETWORK === EthNetwork.GANACHE ? 1337 : 5;

export type ResaleToken = {
    owner: string;
    sold: boolean;
};

export const isCorrectNetwork = (chainId: string | number) =>
    Number(chainId) === CHAIN_ID;

export const switchNetwork = () => {
    return w.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(CHAIN_ID) }],
    });
};

export const getInstance = async () => {
    const contract = await getContract();
    return new web3.eth.Contract(contract.ABI, contract.address);
};

export const getResaleTokens = async (
    eventId: number,
): Promise<ResaleToken[]> => {
    const instance = await getInstance();
    const resaleTokens = await instance.methods.getResaleTokens(eventId).call();

    return resaleTokens.map((resaleToken: any) => {
        return {
            owner: resaleToken.owner,
            sold: resaleToken.sold,
        };
    });
};
