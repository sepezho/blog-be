require("dotenv/config");
const pool = require("../utilities/mysql.js").pool;
const fs = require("fs");

const load = async () => {
	const backup = JSON.parse(
		await fs.readFileSync(`/${process.env.root}/src/static/json/backup.json`)
	);

	backup.forEach((e) => {
		pool.query(
			`INSERT INTO NFTs (ID, Status, Wallet, Hash, Time,Image,Username,Text, Link) VALUES (${e.ID},'${e.Status}','${e.Wallet}','${e.Hash}',${e.Time},'${e.Image}','${e.Username}','${e.Text}','${e.Link}');`,
			console.log
		);
	});
};

// load();
