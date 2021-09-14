import FSEntry from "./FSEntry";

class FileObj extends FSEntry {
	constructor(path: string) {
		super({
			path,
		});
		this.type = "file";
	}
}

export default FileObj;
