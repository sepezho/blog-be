const mysql = require("mysql");

const optionsMysql = {
	password: "password",
	host: "127.0.0.1",
	port: "3306",
	user: "root",
	database: 'Blog',
};

const pool = mysql.createPool(optionsMysql);

exports.pool = pool;
