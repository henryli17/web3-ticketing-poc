import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";

const config = {
	projectId: "d054222c82ce4f2995f8e3ee2c514f90",
	mnemonic: "blind labor taste cage calm neck ridge habit sea fine alone divert",
	address: "0xADa95D02B0DAb0d52CCDDa4b9fDFa1a6d068EcF1"
}

const provider: any = new HDWalletProvider(
	config.mnemonic,
	"https://goerli.infura.io/v3/" + config.projectId
);

const web3 = new Web3(provider);

const contract = new web3.eth.Contract(
	require("./ABI.json"),
	"0x3830Dc9f529987f2cB373F48304baF9EE6789a19"
);

// const res = await contract
// 	.methods
// 	.createEvent(
// 		1,
// 		"Test1",
// 		1708033774,
// 		1000000,
// 		50
// 	)
// 	.call({ from: config.address })
// ;

(async function () {
	try {
		const res = await contract
			.methods
			.events(
				1
			)
			.call({ from: config.address })
			// .send({ from: config.address })
		;
		console.log(res);
	} catch (e: any) {
		console.error(e);
	}

	process.exit();
})();
