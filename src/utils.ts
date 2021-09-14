export function capitalize(string = "") {
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
export function range(start = 1, end = 10) {
	let num = [];
	for (let i = start; i <= end; i++) {
		num.push(i);
	}
	return num;
}

/**
 * @example dashedToNormal("dashed-to-normal") == "Dashed To Normal"
 */
export function dashedToNormal(str: string) {
	return str
		.split("-")
		.map((word) => capitalize(word))
		.join(" ");
}
