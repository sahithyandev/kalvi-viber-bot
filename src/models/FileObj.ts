import FSEntry from "./FSEntry";

class FileObj extends FSEntry {
	type: "file";

	constructor(path: string) {
		super({
			path,
		});
	}
}

export default FileObj;
