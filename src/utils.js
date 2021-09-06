/**
 * @typedef ButtonSizeObj
 * @property {number} width
 * @property {number} height
 *
 * @typedef Button
 * @property {string} text
 * @property {string} action
 *
 * @typedef KeyboardOptions
 * @property {ButtonSizeObj} buttonSize
 * @property {Button[]} buttons
 */

function capitalize(string = "") {
	return string
		.split(" ")
		.map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}

/**
 * @returns {number[]} the array of integers from `start` to `end`
 *
 */
function range(start = 1, end = 10) {
	let num = [];
	for (let i = start; i <= end; i++) {
		num.push(i);
	}
	return num;
}

module.exports = {
	capitalize,
	range,
};
