const pool = require("../../utilities/mysql.js").pool;

const status = (app) => {
	app.get("/api/status", function(req, res) {
		pool.query("SELECT * FROM `POST` ORDER BY `ID`", (_, resultsCom) => {
			res.send(JSON.stringify({ status: "ok", data: resultsCom }));
		});
	});
};

module.exports = status;
