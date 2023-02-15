import Web3 from 'web3';
import { useAddressState } from '../middleware/Wallet';
import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

const ConnectWallet = (props: { className?: string }) => {
	const [loggedOut, setLoggedOut] = useLocalStorage("loggedOut", false);
	const [address, setAddress] = useAddressState();
	const [hovering, setHovering] = useState(false);

	const connectWallet = async (e: React.MouseEvent<HTMLElement>) => {
		if (Web3.givenProvider) {
			e.preventDefault();

			// Logout
			if (!loggedOut) {
				setAddress("");
				setLoggedOut(true);
				return;
			}
	
			const web3 = new Web3(Web3.givenProvider);

			try {
				const accounts = await web3.eth.requestAccounts();
				setAddress(accounts[0]);
				setLoggedOut(false);
			} catch (e: any) {
				if (e.code && e.code === -32002) {
					// TODO: MetaMask wallet is locked - tell the user
				}
			}
		}
	}
	
	const buttonClasses = address ? "w-36 hover:text-red-700 hover:outline-red-700" : "w-44";
	const buttonText = address ? (hovering ? "Disconnect" : "Connected") : "Connect Wallet";

	return (
		<>		
			<a
				href="https://metamask.io/"
				target="_blank"
				rel="noreferrer"
				className={`btn btn-basic ${buttonClasses} ${props.className} `}
				onClick={(e) => connectWallet(e)}
				onMouseEnter={() => setHovering(true)}
				onMouseLeave={() => setHovering(false)}
			>
				<img src="../../assets/metamask.svg" className="mr-2" alt="MetaMask icon" height={20} width={20}/>
				{buttonText}
			</a>
		</>
	);
};

export default ConnectWallet;
