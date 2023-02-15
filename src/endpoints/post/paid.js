const pool = require("../../utilities/mysql.js").pool;
const { drawImages } = require("../../utilities/drawImages.js");
// const whiteList = fs.readFileSync("/${process.env.root}/logic/whiteList.json");
const { paidCell } = require("../../helpers/cells.js");

const paid = (app) => {
	app.post("/api/paid", function (req, res) {
		const data = req.body;
		try {
			pool.query(
				"SELECT * FROM `NFTs` WHERE `ID` IN ('" + data.ids.join("', '") + "');",
				(_, resultsInf) => {
					const result = resultsInf.map((e) => e["Status"]);
					if (
						result.filter((e) => e === "Reserved").length === data.ids.length
					) {
						// if (
						// 	result.filter((e) => e === "Reserved").length === data.ids.length &&
						// 	!!JSON.parse(whiteList).filter((e) => e.wallet === data.wallet)[0]
						// ) {
						pool.query(
							"UPDATE `NFTs` SET Status='Paid', Image='" +
								paidCell +
								"', Wallet='" +
								data.wallet +
								"', Hash='" +
								data.hash +
								"',Time='" +
								Date.now() +
								"' WHERE `ID` IN ('" +
								data.ids.join("', '") +
								"');",
							() => {
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
								res.send(JSON.stringify({ status: "error not in whitelist" }));
							}
						);
					}
				}
			);
		} catch (e) {
			res.send(JSON.stringify({ status: "error" }));
		}
	});
};

module.exports = paid;
