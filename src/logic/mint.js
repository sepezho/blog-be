require("dotenv/config");
const TonWeb = require("tonweb");
const pool = require("../utilities/mysql.js").pool;
const { NftCollection, NftItem } = TonWeb.token.nft;
const { drawImages } = require("../utilities/drawImages.js");
const { paidCell, mintedCell } = require("../helpers/cells.js");
const mainnet = process.env.network === "mainnet";

const mintPublicKey = Uint8Array.from(process.env.mintPublicKey);
const mintSecretKey = Uint8Array.from(process.env.mintSecretKey);
const royaltyPublicKey = Uint8Array.from(process.env.royaltyPublicKey);

const TONAPIKEY = mainnet
	? "3cb4d4625d129371c869ab603a3523e22c6a7507307380bf1de59b32be2630ec"
	: "a8d8e24af2a27066b01f6362f513a29b2adacd6586a9a22af0abdecb4c9332aa";

const toncenter = mainnet ? "toncenter" : "testnet.toncenter";

const tonweb = new TonWeb(
	new TonWeb.HttpProvider(`https://${toncenter}.com/api/v2/jsonRPC`, {
		apiKey: TONAPIKEY,
	})
);

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

let deletedOnce = false;

//TODO refactor everything below
const getItemNumber = (nftCollection, oldItemNum, id) =>
	new Promise(async (resolve) => {
		let counter = 0;
		let whileGo = true;
		while (whileGo) {
			counter++;
			await sleep(100);
			let itemNumber = false;

			try {
				itemNumber = (await nftCollection.getCollectionData()).nextItemIndex;
			} catch (e) {
				itemNumber = false;
			}

			console.log("Minted NFTs: ", itemNumber);
			console.log("Marked as minted in DB: ", oldItemNum);

			if (counter > 600) {
				if (!deletedOnce) {
					pool.query(
						"UPDATE `NFTs` SET Status='Paid', Image='" +
							paidCell +
							"', Hash='NONE',Time='" +
							Date.now() +
							"' ORDER BY Time DESC LIMIT 1;",
						(a, b) => {
							console.log("DONE DELETE after 1min");
							counter = 0;
							oldItemNum--;
							deletedOnce = true;
						}
					);
				} else {
					console.log("COUNTER ERR 1 min timeout");
					return process.exit();
				}
			}

			const checkOff = 0;

			if ((itemNumber === oldItemNum && id) || checkOff === 1) {
				let i = itemNumber;
				const idsArr = [];
				while (i >= itemNumber - 5) {
					await sleep(100);
					let data = {};
					try {
						const nftItem = new NftItem(tonweb.provider, {
							address: await nftCollection.getNftItemAddressByIndex(i - 1),
						});
						data = await nftCollection.methods.getNftItemContent(nftItem);
					} catch (e) {}

					if (data.contentUri) {
						idsArr.push(
							Number(data.contentUri.split("/").slice(-1)[0].split(".")[0])
						);

						if (!idsArr.filter((e) => e === id)[0] && i === itemNumber - 5) {
							whileGo = false;
							resolve(itemNumber);
						} else if (idsArr.filter((e) => e === id)[0]) {
							console.log("IDs REPETED!", JSON.stringify(idsArr));
							return process.exit();
						} else {
							console.log("LAST 5 MINTED IDs: ", JSON.stringify(idsArr));
						}
						i--;
					}
				}
			}
		}
	});

const mint = () => {
	pool.query(
		"SELECT * FROM `NFTs` WHERE `Status` = 'Paid'",
		async (_, resultsStatusPaidasd) => {
			for await (const resultsStatusPaid of resultsStatusPaidasd.slice(0, 1)) {
				const id = resultsStatusPaid["ID"];
				console.log("START " + id);
				if (resultsStatusPaid["Wallet"] === "") {
					return;
				}
				const WalletClass = tonweb.wallet.all["v3R1"];
				const wallet = new WalletClass(tonweb.provider, {
					publicKey: mintPublicKey,
					wc: 0,
				});
				const walletAddress = await wallet.getAddress();
				const rwallet = new WalletClass(tonweb.provider, {
					publicKey: royaltyPublicKey,
					wc: 0,
				});

				const rwalletAddress = await rwallet.getAddress();
				const wallet2add = new TonWeb.utils.Address(
					resultsStatusPaid["Wallet"]
				);
				const nftCollection = new NftCollection(tonweb.provider, {
					ownerAddress: walletAddress,
					royalty: 0.05,
					royaltyAddress: rwalletAddress,
					collectionContentUri:
						"https://gateway.pinata.cloud/ipfs/QmdCAbKPnW64M916k5Ci2Sys1ArDELQ8unnjKGnakpfb28",
					nftItemContentBaseUri:
						"https://gateway.pinata.cloud/ipfs/QmQcJLVvLMfs9yhyUHRGiAy6ABJD33sxZo76yfcDkv1EZQ/",
					nftItemCodeHex: NftItem.codeHex,
				});

				//------- TO DEPLOY NEW COLLECTION USE CODE BELOW:
				// const nftCollectionAddress = await nftCollection.getAddress();
				// console.log(nftCollectionAddress.toString(true, true, true));
				// console.log(
				// 	await wallet.methods
				// 		.transfer({
				// 			secretKey: mintSecretKey,
				// 			toAddress: nftCollectionAddress.toString(true, true, true),
				// 			amount: TonWeb.utils.toNano(0.1),
				// 			seqno: (await wallet.methods.seqno().call()) || 0,
				// 			payload: null,
				// 			sendMode: 3,
				// 			stateInit: (await nftCollection.createStateInit()).stateInit,
				// 		})
				// 		.send()
				// );
				// return process.exit();
				// -------

				pool.query(
					"SELECT * FROM `NFTs` WHERE `Status` = 'Minted' ORDER BY Time DESC",
					async (_, resultsStatusPaidasd) => {
						const seqno = (await wallet.methods.seqno().call()) || 0;
						const itemNumber = await getItemNumber(
							nftCollection,
							resultsStatusPaidasd.length,
							id
						);

						const res = await mintTONNFT(
							id,
							nftCollection,
							wallet,
							wallet2add,
							itemNumber,
							seqno
						);

						console.log("HASH: ", res);

						pool.query(
							"UPDATE `NFTs` SET Status='Minted', Image='" +
								mintedCell +
								"', Hash='" +
								res +
								"',Time='" +
								Date.now() +
								"' WHERE `ID`='" +
								id +
								"';",
							async (a, b) => {
								await sleep(15000);
								console.log("DONE");
								drawImages();
								return false;
							}
						);
					}
				);
			}
		}
	);
};

const mintTONNFT = async (
	id,
	nftCollection,
	wallet,
	wallet2add,
	itemNumber,
	seqno
) => {
	try {
		const metaHash = `${id}.json`;
		const amount = TonWeb.utils.toNano(0.01);
		const item = await nftCollection.createMintBody({
			amount,
			itemIndex: itemNumber,
			itemOwnerAddress: wallet2add,
			itemContentUri: metaHash,
		});

		const nftCollectionAddress = await nftCollection.getAddress();

		await wallet.methods
			.transfer({
				secretKey: mintSecretKey,
				toAddress: nftCollectionAddress.toString(true, true, true),
				amount: amount,
				seqno: seqno,
				payload: item,
				sendMode: 3,
			})
			.send();

		const resadd = (
			await nftCollection.getNftItemAddressByIndex(itemNumber)
		).toString(true, true, true);

		return resadd;
	} catch (e) {
		await sleep(1000);
		return await mintTONNFT(
			id,
			nftCollection,
			wallet,
			wallet2add,
			itemNumber,
			seqno
		);
	}
};

mint();
