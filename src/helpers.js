// @ts-check

const { Subject } = require("./models");
const { range } = require("./utils");

/**
 * @param {number} grade
 *
 * @returns {Subject[]} Array of subjects for the given grade
 */
function getSubjects(grade) {
	if (range(1, 5).includes(grade)) {
		return ["environmental-studies", "maths", "saivaneri", "tamil"].map(
			(subject) => new Subject(subject)
		);
	}
	if (range(6, 9).includes(grade)) {
		// TODO
		return [];
	}
	if ([10, 11].includes(grade)) {
		// TODO
		return [];
	}
	if ([12, 13].includes(grade)) {
		// TODO
		return [];
	}

	return [];
}

/**
 *
 * @param {import("./utils").KeyboardOptions} keyboardOptions
 */
function viberKeyboardOptions(keyboardOptions) {
	const buttons = keyboardOptions.buttons.map((button) => {
		return {
			Columns: keyboardOptions.buttonSize.width,
			Rows: keyboardOptions.buttonSize.height,
			ActionType: "reply",
			ActionBody: button.action,
			Text: button.text,
		};
	});

	return {
		Type: "keyboard",
		Revision: 1,
		Buttons: buttons,
	};
}

module.exports = {
	viberKeyboardOptions,
	getSubjects,
};
