import React, { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import Web3 from "web3";

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

	const connectWallet = async () => {
		w.ethereum.on('accountsChanged', (accounts: Array<string>) => {
			setAddress(accounts.length ? accounts[0] : "");
		});

		if (Web3.givenProvider) {
			try {
				const accounts = await web3.eth.requestAccounts();
				setAddress(accounts[0]);
				setLoggedOut(false);
			} catch (e) {
				setAddress("");
				setLoggedOut(true);
			}
		}
	}

	checkMetaMaskPermission().then((hasPermission) => {
		if (hasPermission && !loggedOut) {
			connectWallet();
		} else {
			setAddress("");
		}
	});

	return <Outlet context={[address, setAddress]} />;
}

export const useAddressState = () => {
	return useOutletContext<[string, React.Dispatch<React.SetStateAction<string>>]>();
}

export default Wallet;
