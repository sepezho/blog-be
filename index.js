require("dotenv/config");

const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");

const app = express();
const port = 4646;

const status = require("./src/endpoints/get/status.js");
const post = require("./src/endpoints/get/post.js");
const list = require("./src/endpoints/get/list.js");
const image = require("./src/endpoints/get/image.js");
const video = require("./src/endpoints/get/video.js");
const workWithTg = require("./src/endpoints/get/workWithTg.js");
const audio = require("./src/endpoints/get/audio.js");

//const update = require("./src/endpoints/post/update.js");
if (process.env.deploy !== 'dev') {

	const privateKey = fs.readFileSync(
		"/home/admin/conf/web/ssl.api.blog.sepezho.com.key",
		"utf8"
	);
	const certificate = fs.readFileSync(
		"/home/admin/conf/web/ssl.api.blog.sepezho.com.crt",
		"utf8"
	);
	const ca = fs.readFileSync(
		"/home/admin/conf/web/ssl.api.blog.sepezho.com.ca",
		"utf8"
	);

	const credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca,
	};

	app.use(
		express.urlencoded({
			extended: true,
		})
	);
	app.use(express.json());

	var allowCrossDomain = function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
		res.header("Access-Control-Allow-Headers", "Content-Type");

		next();
	};
	app.use(allowCrossDomain);

	const httpsServer = https.createServer(credentials, app);

	httpsServer.listen(port, (err) => {
		if (err) {
			return console.log("something bad happened", err);
		}
		console.log("\n-------------------------------------------");
		console.log(`BLOG API server is listening on ${port}`);
		console.log("-------------------------------------------\n");
	});

} else {

	app.use(
		express.urlencoded({
			extended: true,
		})
	);
	app.use(express.json());

	var allowCrossDomain = function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
		res.header("Access-Control-Allow-Headers", "Content-Type");

		next();
	};
	app.use(allowCrossDomain);

	const httpServer = http.createServer(app);

	httpServer.listen(port, (err) => {
		if (err) {
			return console.log("something bad happened", err);
		}
		console.log("\n-------------------------------------------");
		console.log(`BLOG API server is listening on ${port}`);
		console.log("-------------------------------------------\n");
	});
}
status(app);
post(app);
list(app);
image(app);
audio(app);
video(app);
// workWithTg(app);
