const fs = require("fs");
const pool = require("../../utilities/mysql.js").pool;

const area = (app) => {
	app.get("/api/image", function(req, res) {
		const page = req.query.image;
		console.log(page)
		var img = fs.readFileSync(
			`/Users/sepezho/Work/blog/Blog/telegram1/${page}`
		);
		res.writeHead(200, { "Content-Type": "image/gif" });
		res.end(img, "binary");
	});
};

module.exports = area;
