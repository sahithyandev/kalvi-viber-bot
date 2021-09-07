import { FolderObj, Subject } from "./models";
import { range } from "./utils";

interface ButtonSizeObj {
	width: number;
	height: number;
}

interface Button {
	text: string;
	action: string;
}

interface KeyboardOptions {
	buttonSize: ButtonSizeObj;
	buttons: Button[];
}

export function viberKeyboardOptions(keyboardOptions: KeyboardOptions) {
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
