const pool = require("../utilities/mysql.js").pool;

const generate = () => {
	let i = 0;
	pool.getConnection((err, con) => {
		while (i < 10000) {
			i++;
			con.query(
				"INSERT INTO Toncells.NFTs (ID, Status, Wallet, Hash, Time) VALUES (" +
					i +
					", 'Free', '', '', 10);",
				console.log
			);
		}
	});
};

// generate();
