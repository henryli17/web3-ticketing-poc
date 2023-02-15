import { useState } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import ConnectWallet from "../components/ConnectWallet";
import GenrePill from "../components/GenrePill";
import { useAddressState } from "../middleware/Wallet";

const SingleEventView = () => {
	const { id } = useParams();
	const web3 = new Web3(Web3.givenProvider);
	const contract = new web3.eth.Contract(
		require("../ABI.json"),
		"0x3830Dc9f529987f2cB373F48304baF9EE6789a19"
	);

	return (
		<div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 py-20 px-10">
			<div className="grid-span-1 flex mb-16 lg:mb-0">
				<div className="my-auto">
					<img className="mx-auto shadow-lg w-10/12 md:w-8/12 lg:w-10/12 xl:w-8/12 rounded" src="https://i.imgur.com/Awaw7ni.png" alt="" />
				</div>
			</div>
			<div className="grid-span-1 flex">
				<div className="my-auto">
					<h1 className="italic uppercase font-bold mb-1">
						Taylor Swift Tour
					</h1>
					<div className="text-2xl mb-8">
						12th Feb 2023
					</div>
					<div className="text-2xl mb-8">
						The O2, London
					</div>
					<div className="text-2xl uppercase font-bold">
						Price
					</div>
					<h2 className="font-bold text-indigo-500 mb-8">
						0.01 ETH
					</h2>
					<PurchaseButton id={Number(id)} contract={contract} className="mb-8" />
					<div className="mb-8 text-lg">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</div>
					<div className="space-x-2">
						<GenrePill name="Rock" />
						<GenrePill name="Indie" />
					</div>
				</div>
			</div>
		</div>
	);
};

const PurchaseButton = (props: { className?: string, contract: any, id: number }) => {
	const [address] = useAddressState();
	const [disabled, setDisabled] = useState(false);

	if (!address) {
		return <ConnectWallet className={props.className} />;
	}

	const purchase = async () => {
		setDisabled(true);

		try {
			await props
				.contract
				.methods
				.buyToken(props.id, 1)
				.send({
					from: address,
					value: Web3.utils.toWei("1000000", "gwei") // 0.001 ETH
				})
			;
		} catch (e: any) {
			if (e.code !== 4001) {
				// TODO: error message
			}
		}

		setDisabled(false);
	};

	return (
		<button 
			type="button"
			className={"btn btn-basic w-32 " + props.className}
			onClick={() => purchase()}
			disabled={disabled}
		>
			{
				disabled &&
				<svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			}
			Purchase
		</button>
	);
};

export default SingleEventView;
