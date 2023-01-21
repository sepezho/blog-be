const fs = require("fs");
const pool = require("../../utilities/mysql.js").pool;

const area = (app) => {
	app.post("/api/post", function(req, res) {
		const id = req.body.id;
		console.log(req);
		pool.query("SELECT * FROM `POST` WHERE `Id` = " + id + ";", (_, resultsCom) => {
			pool.query("UPDATE `POST` SET `Views`=" + Number(resultsCom[0].Views ? Number(resultsCom[0].Views) + 1 : 1) + " WHERE `Id` = " + id + ";", (_1, __) => {
				res.send(JSON.stringify({ status: "ok", data: resultsCom }));
			});
		});
	});
};

module.exports = area;
