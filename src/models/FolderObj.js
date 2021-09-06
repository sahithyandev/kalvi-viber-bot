const FSEntry = require("./FSEntry");
const FileObj = require("./FileObj");

class FolderObj extends FSEntry {
	/**
	 * @param {string} path
	 */
	constructor(path) {
		super({
			path,
			type: "folder",
		});

		const fs = require("fs-extra");
		/**
		 * @type {(FileObj | FolderObj)[]}
		 */
		this.content = fs.readdirSync(path).map((content) => {
			const contentPath = require("path").join(path, content);

			if (content.match(/\w+\.\w+/)) {
				// file
				return new FileObj(contentPath);
			} else {
				// folder
				return new FolderObj(contentPath);
			}
		});
	}
}

module.exports = FolderObj;
