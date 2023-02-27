import React, { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import Web3 from "web3";
import { isCorrectNetwork } from "../helpers/contract";

const Wallet = () => {
	const [loggedOut, setLoggedOut] = useLocalStorage("loggedOut", false);
	const [address, setAddress] = useState<string | null>(null);
	const web3 = new Web3(Web3.givenProvider);
	const w = (window as any);

	const checkMetaMaskPermission = async () => {
		if (!(w.ethereum && w.ethereum.isMetaMask)) {
			return false;
		}

		if (!(web3 && web3.currentProvider)) {
			return false;
		}

		const accounts = await web3.eth.getAccounts();

		return (accounts.length > 0);
	}

	const setupWallet = async () => {
		const disconnect = () => {
			setAddress("");
			setLoggedOut(true);
		};

		w.ethereum.on('accountsChanged', (accounts: Array<string>) => {
			setAddress(accounts.length ? accounts[0] : "");
		});

		w.ethereum.on('chainChanged', async (chainId: string) => {
			if (!isCorrectNetwork(web3.utils.toNumber(chainId))) {
				disconnect();
			}
		});

		if (Web3.givenProvider) {
			try {
				const chainId = await web3.eth.getChainId();

				if (!isCorrectNetwork(chainId)) {
					disconnect();
					return;
				}

				// Automatically login if correct network
				const accounts = await web3.eth.requestAccounts();
				setAddress(accounts[0]);
				setLoggedOut(false);
			} catch (e) {
				disconnect();
			}
		}
	};

	useEffect(() => {		
		checkMetaMaskPermission().then((hasPermission) => {
			if (hasPermission && !loggedOut) {
				setupWallet();
			} else {
				setAddress("");
			}
		});
	});

	return <Outlet context={[address, setAddress]} />;
}

export const useAddress = () => {
	return useOutletContext<[string | null, React.Dispatch<React.SetStateAction<string | null>>]>();
}

export default Wallet;
