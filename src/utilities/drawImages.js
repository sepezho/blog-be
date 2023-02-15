const pool = require("../utilities/mysql.js").pool;
const fs = require("fs");
const Jimp = require("jimp");
const mergeImages = require("merge-images");
const { Canvas, Image } = require("canvas");
const { pixelsArr } = require("../helpers/pixelsArr");
const { hexToRgba } = require("../helpers/hexToRgba");
const { whiteCell } = require("../helpers/cells.js");
const { multiplyer, customMultiplyer } = require("../helpers/multiplyer.js");

const createCell = (colors, number) =>
	new Promise((res) => {
		const pixels = [];
		const pixelsMatrix = [];
		let j = 0;
		const getcolor = (hex) =>
			Jimp.rgbaToInt(
				hexToRgba(hex)[0],
				hexToRgba(hex)[1],
				hexToRgba(hex)[2],
				hexToRgba(hex)[3]
			);

		colors.forEach((e) => {
			pixels.push(getcolor("#" + e));
			j++;
			if (j === 256) {
				for (let i = 0; i < 16; i++) {
					pixelsMatrix.push(pixels.slice(i * 16, (i + 1) * 16));

					if (pixelsMatrix.length === 16) {
						new Jimp(16, 16, function (err, image) {
							pixelsMatrix.forEach((row, y) => {
								row.forEach((color, x) => {
									image.setPixelColor(color, x, y);
								});
							});

							image.write(
								`/${process.env.root}/src/static/img/cell/#${number}.png`,
								(err) => {
									console.log("done");
									res(true);
								}
							);
						});
					}
				}
			}
		});
	});

const createMap = (title) => {
	pool.query("SELECT * FROM `NFTs` ORDER BY `ID`", (err1, resultsCom) => {
		const pixels = [];
		const pixelsMatrix = [];
		let j = 0;
		let resarr = [];

		for (let i = 0; i <= 25; i++) {
			resarr.push(...pixelsArr.map((e) => e.map((e) => e + 400 * i)));

			if (i === 25) {
				const arr = resarr.map((arr) => arr.map((e) => resultsCom[e - 1]));

				arr.forEach((e) => {
					e.forEach((earr) => {
						if (earr) {
							let color = Jimp.rgbaToInt(255, 255, 255, 255);
							if (
								earr["Status"] === "Reserved" &&
								title !== "minted" &&
								title !== "free"
							)
								color = Jimp.rgbaToInt(255, 0, 0, 255);
							if (earr["Status"] === "Minted" && title !== "free")
								color = Jimp.rgbaToInt(0, 255, 0, 255);
							if (
								earr["Status"] === "Paid" &&
								title !== "minted" &&
								title !== "free"
							)
								color = Jimp.rgbaToInt(0, 0, 255, 255);
							if (earr["Status"] === "Free" && title === "free")
								color = Jimp.rgbaToInt(0, 255, 0, 255);

							pixels.push(...multiplyer(color, 16));
							j++;
							if (resultsCom.length === j) {
								for (let i = 0; i < 1600; i++) {
									pixelsMatrix.push(...customMultiplyer(pixels, i, 16));
								}

								new Jimp(1600, 1600, function (err, image) {
									pixelsMatrix.forEach((row, y) => {
										row.forEach((color, x) => {
											image.setPixelColor(color, x, y);
										});
									});

									image.write(
										`/${process.env.root}/src/static/img/map/${title}.png`,
										() => {}
									);
								});
							}
						}
					});
				});
			}
		}
	});
};

const createArea = async (z) =>
	new Promise((res) => {
		let arrways = [];

		for (let i = 0; i < 16; i++) {
			arrways.push({
				src: `/${process.env.root}/src/static/img/cell/#${z * 16 + i}.png`,
				x: (i % 4) * 16,
				y: ((i / 4) >> 0) * 16,
			});

			if (i === 15) {
				mergeImages(arrways, {
					Canvas: Canvas,
					Image: Image,
					width: 64,
					height: 64,
				}).then((b64) => {
					fs.writeFile(
						`/${process.env.root}/src/static/img/area/#${z}.png`,
						b64.replace(/^data:image\/png;base64,/, ""),
						"base64",
						function (err) {
							res();
						}
					);
				});
			}
		}
	});

// GENERATE 10k CELL 625 AREAS 4 MAP AND 1 TIMELAPS MAP
const drawImages = () => {
	createMap("original");
	createMap("free");
	createMap("minted");

	let numberPic = 0;

	pool.query("SELECT * FROM `NFTs` ORDER BY `ID`", async (err1, resultsCom) => {
		for (const e of resultsCom) {
			await createCell(
				(e.Image[0] ? e.Image : whiteCell).slice(1).split("#"),
				e.ID - 1
			);
			numberPic++;

			if (numberPic === 10000) {
				for (let z = 0; z < 625; z++) {
					await createArea(z);
				}

				const arrways = [];
				for (let z = 0; z < 625; z++) {
					await arrways.push({
						src: `/${process.env.root}/src/static/img/area/#${z}.png`,
						x: (z % 25) * 64,
						y: ((z / 25) >> 0) * 64,
					});

					if (z === 624) {
						mergeImages(arrways, {
							Canvas: Canvas,
							Image: Image,
							width: 1600,
							height: 1600,
						}).then((b64) => {
							fs.readdir(
								`/${process.env.root}/src/static/img/timelaps`,
								(err, files) => {
									fs.writeFile(
										`/${process.env.root}/src/static/img/map/edited.png`,
										b64.replace(/^data:image\/png;base64,/, ""),
										"base64",
										function (err) {
											console.log("DONE PIC");
										}
									);
									fs.writeFile(
										`/${process.env.root}/src/static/img/timelaps/#${
											files.length + 1
										}.png`,
										b64.replace(/^data:image\/png;base64,/, ""),
										"base64",
										function (err) {
											console.log("DONE PIC");
										}
									);
								}
							);
						});
					}
				}
			}
		}
	});
};

exports.drawImages = drawImages;
exports.createCell = createCell;
//drawImages();
