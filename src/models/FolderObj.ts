import FSEntry from "./FSEntry";
import FileObj from "./FileObj";

class FolderObj extends FSEntry {
	type: "folder";
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

	findSubfolder(subfolderName: string): FolderObj {
		return (
			(this.content.find((entry) => {
				return entry.type === "folder" && entry.name === subfolderName;
			}) as FolderObj) || null
		);
	}
}

export default FolderObj;
