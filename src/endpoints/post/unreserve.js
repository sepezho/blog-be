const pool = require("../../utilities/mysql.js").pool;
const { drawImages } = require("../../utilities/drawImages.js");

const unreserve = (app) => {
	app.post("/api/unreserve", function (req, res) {
		const data = req.body;
		try {
			pool.query(
				"UPDATE `NFTs` SET Status='Free', Image='', Time='" +
					Date.now() +
					"' WHERE `ID` IN ('" +
					data.ids.join("', '") +
					"');",
				() => {
					drawImages();
					res.send(JSON.stringify({ status: "ok" }));
				}
			);
		} catch (e) {
			res.send(JSON.stringify({ status: "error" }));
		}
	});
};

module.exports = unreserve;
