const fs = require("fs");
const pool = require("../../utilities/mysql.js").pool;

const area = (app) => {
	app.get("/api/list", function(req, res) {
		const page = req.query.page;
		console.log(page)
		pool.query("SELECT * FROM `POST` ORDER BY `Id` DESC LIMIT " + (page * 5) + ", " + 5 + ";", (_, resultsCom) => {
			console.log(resultsCom)
			resultsCom.map(e => {
				if (e.Text.split('#')[0] !== "undefined") {
					e.Video = e.Text.split('#')[0]
				}
				if (e.Text.split('#')[1] !== "undefined") {
					e.Thumbnail = e.Text.split('#')[1]
				}
				if (e.Text.split('#')[2] !== "undefined") {
					e.Photo = e.Text.split('#')[2]
				}
				e.Text = e.Text.split('#')[3]
			})
			res.send(JSON.stringify({ status: "ok", data: resultsCom }));
		});
	});
};

module.exports = area;
