const pool = require("../../utilities/mysql.js").pool;
const { drawImages } = require("../../utilities/drawImages.js");
const { reservedCell } = require("../helpers/cells.js");

const reserve = (app) => {
	app.post("/api/reserve", function (req, res) {
		let i = 0;
		let data = req.body;
		let result = [];
		let hash = "";
		try {
			data.ids.forEach((e) => {
				pool.query(
					"SELECT * FROM `NFTs` WHERE `ID`='" + e + "';",
					(errora, resultsInf) => {
						i++;
						result.push(resultsInf[0]["Status"]);
						if (data.ids.length === i) {
							if (
								result.filter((e) => e === "Free").length === data.ids.length
							) {
								let j = 0;
								data.ids.forEach((e) => {
									pool.query(
										"UPDATE `NFTs` SET Status='Reserved', Image='" +
											reservedCell +
											"', Wallet='" +
											"" +
											"', Hash='" +
											hash +
											"',Time='" +
											Date.now() +
											"' WHERE `ID`='" +
											e +
											"';",
										(errora, resultsInf1) => {
											j++;
											if (data.ids.length === j) {
												drawImages();
												res.send(JSON.stringify({ status: "ok" }));
											}
										}
									);
								});
							} else {
								res.send(JSON.stringify({ status: "error" }));
							}
						}
					}
				);
			});
		} catch (e) {
			res.send(JSON.stringify({ status: "error" }));
		}
	});
};

module.exports = reserve;
