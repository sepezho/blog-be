const mysql = require("mysql");

const optionsMysql = {
	user: "usr",
	password: "pass",
	database: 'db',
};

const pool = mysql.createPool(optionsMysql);

exports.pool = pool;
