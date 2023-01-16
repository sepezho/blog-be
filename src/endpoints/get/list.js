const fs = require("fs");
const pool = require("../../utilities/mysql.js").pool;

const area = (app) => {
	app.get("/api/list", function(req, res) {
		pool.query("SELECT * FROM `POST`;", (_, resultsCom) => {
			res.send(JSON.stringify({ status: "ok", data: resultsCom }));
		});
	});
};

module.exports = area;
