require("dotenv/config");
const TonWeb = require("tonweb");
const pool = require("../utilities/mysql.js").pool;
const { NftCollection, NftItem } = TonWeb.token.nft;
const { drawImages } = require("../../utilities/drawImages.js");

const mintPublicKey = Uint8Array.from(process.env.mintPublicKey);
const royaltyPublicKey = Uint8Array.from(process.env.royaltyPublicKey);

const mainnet = process.env.network === "mainnet";

const TONAPIKEY = mainnet
	? "862cc7e85cac385897b7a63304f422da6c6fc5656153203b4e9fc718292ac03f"
	: "a8d8e24af2a27066b01f6362f513a29b2adacd6586a9a22af0abdecb4c9332aa"; //todo change testnet api key

const toncenter = mainnet ? "toncenter" : "testnet.toncenter";

const tonweb = new TonWeb(
	new TonWeb.HttpProvider(`https://${toncenter}.com/api/v2/jsonRPC`, {
		apiKey: TONAPIKEY,
	})
);

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//TODO refacotor everything below

const call = async (voidFun) =>
	await new Promise(async (resolve) => {
		try {
			resolve(await voidFun());
		} catch (e) {
			if (e === "Invalid address") {
				process.abort();
			}
			await sleep(110);
			resolve(await call(voidFun));
		}
	});

const sync = async () => {
	const WalletClass = tonweb.wallet.all["v3R1"];
	const wallet = new WalletClass(tonweb.provider, {
		publicKey: mintPublicKey,
		wc: 0,
	});
	const walletAddress = await call(async () => await wallet.getAddress());
	const rwallet = new WalletClass(tonweb.provider, {
		publicKey: royaltyPublicKey,
		wc: 0,
	});
	const rwalletAddress = await call(async () => await rwallet.getAddress());
	const nftCollection = await call(
		() =>
			new NftCollection(tonweb.provider, {
				ownerAddress: walletAddress,
				royalty: 0.05,
				royaltyAddress: rwalletAddress,
				collectionContentUri:
					"https://gateway.pinata.cloud/ipfs/QmdCAbKPnW64M916k5Ci2Sys1ArDELQ8unnjKGnakpfb28",
				nftItemContentBaseUri:
					"https://gateway.pinata.cloud/ipfs/QmQcJLVvLMfs9yhyUHRGiAy6ABJD33sxZo76yfcDkv1EZQ/",
				nftItemCodeHex: NftItem.codeHex,
			})
	);

	const getAllData = async (hashes, n) =>
		await new Promise(async (respon) => {
			const arr1 = [];
			let i = 0;
			while (i < n) {
				console.log("data", i);

				const nftItemAddress = await call(
					async () => await new TonWeb.utils.Address(hashes[i])
				);

				const nftItem = await call(
					async () =>
						await new NftItem(tonweb.provider, {
							address: nftItemAddress,
						})
				);

				let data = await call(
					async () => await nftCollection.methods.getNftItemContent(nftItem)
				);

				arr1.push({
					id: Number(data.contentUri.split("/").slice(-1)[0].split(".")[0]),
					hash: nftItemAddress.toString(true, true, true),
					owner: new TonWeb.utils.Address(data.ownerAddress).toString(
						true,
						true,
						true
					),
				});
				i++;
				if (i === n) {
					respon(arr1);
				}
			}
		});

	const getAllHashes = async (n) =>
		await new Promise(async (respon) => {
			const arr1 = [];
			let i = 0;
			while (i < n) {
				const res = (
					await call(
						async () => await nftCollection.getNftItemAddressByIndex(i)
					)
				).toString(true, true, true);
				arr1.push(res);
				i++;
				if (i === n) {
					respon(arr1);
				}
			}
		});
	const data = await call(async () => await nftCollection.getCollectionData());
	const res = await getAllHashes(data.nextItemIndex);
	const resData = await getAllData(res, data.nextItemIndex);
	let i = 0;
	resData.forEach((e) => {
		pool.query(
			"UPDATE `NFTs` SET Status='Minted', Wallet='" +
				e.owner +
				"', Hash='" +
				e.hash +
				"' WHERE `ID`=" +
				Number(e.id) +
				";",
			async (_, resultsStatusPaidasd) => {
				i++;
				if (i === resData.length) {
					console.log("DONE");
					drawImages();
				}
			}
		);
	});
};

sync();
