const multiplyer = (item, number) => {
	const obj = [];
	while (number > 0) {
		obj.push(item);
		number--;
	}
	return obj;
};

const customMultiplyer = (pixels, i, number) => {
	pixels.slice(i * 1600, (i + 1) * 1600);
	const obj = [];
	while (number > 0) {
		obj.push(item);
		number--;
	}
	return obj;
};

exports.customMultiplyer = customMultiplyer;
exports.multiplyer = multiplyer;
