const pool = require("../../utilities/mysql.js").pool;
const { drawImages, createCell } = require("../../utilities/drawImages.js");
const TonWeb = require("tonweb");
const { exec } = require("child_process");
const { mintedCell, whiteCell } = require("../helpers/cells.js");
const { asciiToHex } = require("../helpers/asciiToHex");

const checkSign = (signature, publicKey, wallet, id) =>
	TonWeb.utils.nacl.sign.detached.verify(
		TonWeb.utils.hexToBytes(
			asciiToHex(`Edit Cell #${id.join(", #")} by ${wallet} wallet`)
		),
		TonWeb.utils.hexToBytes(signature),
		TonWeb.utils.hexToBytes(publicKey)
	);

const update = (app) => {
	app.post("/api/update", function (req, res) {
		const data = req.body;
		if (checkSign(data.signature, data.publicKey, data.wallet, data.ids)) {
			try {
				pool.query(
					"SELECT * FROM `NFTs` WHERE `ID` IN ('" +
						data.ids.join("', '") +
						"');",
					(_, resultsInf) => {
						const result = resultsInf.map((e) => e["Status"]);
						if (
							result.filter((e) => e === "Minted").length === data.ids.length
						) {
							pool.query(
								"UPDATE `NFTs` SET Image='" +
									(data.image && data.image !== whiteCell
										? data.image
										: mintedCell) +
									"', Username='" +
									data.username +
									"', Text='" +
									data.text +
									"',Link='" +
									data.link +
									"',Time='" +
									Date.now() +
									"' WHERE `ID` IN ('" +
									data.ids.join("', '") +
									"');",
								async () => {
									await createCell(data.image.slice(1).split("#"), data.ids[0]);
									exec(
										`python3 /${process.env.root}/src/utilities/twitter.py '👋🤖 Hey, @toncells. Cell ${data.ids[0]} just has been edited!\n\nYou can take a look at: https://app.toncells.org/${data.ids[0]}\n\n#toncells #toncellsEdit' /${process.env.root}/src/static/img/cell/#${data.ids[0]}.png`,
										(error, stdout, stderr) => {}
									);
									drawImages();
									res.send(JSON.stringify({ status: "ok" }));
								}
							);
						} else {
							pool.query(
								"UPDATE `NFTs` SET Status='Free',Time='" +
									Date.now() +
									"' WHERE `ID` IN ('" +
									data.ids.join("', '") +
									"');",
								() => {
									drawImages();
									res.send(
										JSON.stringify({ status: "error not in whitelist" })
									);
								}
							);
						}
					}
				);
			} catch (e) {
				res.send(JSON.stringify({ status: "error" }));
			}
		}
	});
};

module.exports = update;
