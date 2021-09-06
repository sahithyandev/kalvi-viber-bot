const FSEntry = require("./FSEntry");

class FileObj extends FSEntry {
	/**
	 * @param {string} path
	 */
	constructor(path) {
		super({
			path,
			type: "file",
		});
	}
}

module.exports = FileObj;
