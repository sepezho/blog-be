require("dotenv/config");
const fs = require("fs");
const pool = require("../utilities/mysql.js").pool;

pool.query("SELECT * FROM `NFTs` ORDER BY `ID`", (_, resultsCom) => {
	fs.writeFile(
		`/${process.env.root}/src/static/json/backup.json`,
		JSON.stringify(resultsCom),
		console.log
	);
});
