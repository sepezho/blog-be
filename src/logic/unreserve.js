const pool = require("../utilities/mysql.js").pool;
const { drawImages } = require("../../utilities/drawImages.js");

// NEED TO START IT WITH CRONTAB EWERY 30 MIN
pool.getConnection((err, con) => {
	con.query(
		"UPDATE `NFTs` SET Status='Free', Image='', Time='" +
			Date.now() +
			"' WHERE Status='Reserved' AND Time<'" +
			(Date.now() - 30 * 60 * 1000) +
			"';",
		(errora, resultsInf1) => {
			drawImages();
		}
	);
});
