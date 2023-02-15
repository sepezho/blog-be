const fs = require("fs");
const pool = require("../../utilities/mysql.js").pool;

const area = (app) => {
	// app.post("/api/post", function(req, res) {
	// 	const id = req.body.id;
	// 	console.log(req);

	const json = fs.readFileSync('../../../../telegram1/result.json')
	console.log(json.length)
	// res.send(JSON.stringify({ status: "ok", data: resultsCom }));
	// });
};

module.exports = area;
