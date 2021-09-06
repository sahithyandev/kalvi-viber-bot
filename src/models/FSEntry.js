class FSEntry {
	/**
	 *
	 * @typedef Options
	 * @property {string} path
	 * @property {"file" | "folder"} type
	 *
	 * @param {Options} options
	 */
	constructor(options) {
		this.path = options.path;
		this.type = options.type;
		this.name = this.path.split("/").reverse()[0];
	}
}

module.exports = FSEntry;
