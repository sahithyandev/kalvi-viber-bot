import FSEntry from "./FSEntry";
import FileObj from "./FileObj";

class FolderObj extends FSEntry {
	content: (FileObj | FolderObj)[];

	constructor(path: string) {
		super({
			path,
		});
		this.type = "folder";

		const fs = require("fs-extra");

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

	get files() {
		console.log("files under", this.name, this.content);
		return this.content.filter((entry) => {
			return entry.type === "file";
		}) as FileObj[];
	}

	get fileNames() {
		return this.files.map((file) => file.name);
	}

	get subfolders() {
		return this.content.filter((entry) => {
			return entry.type === "folder";
		}) as FolderObj[];
	}

	get subfolderNames() {
		return this.subfolders.map((folder) => folder.name);
	}

	subfolder(subfolderName: string): FolderObj {
		return (
			this.subfolders.find((folder) => folder.name === subfolderName) || null
		);
	}
}

export default FolderObj;
