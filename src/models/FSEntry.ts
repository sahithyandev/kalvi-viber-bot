type FSEntryType = "file" | "folder";

interface Options {
	path: string;
}

class FSEntry implements Options {
	path: string;
	name: string;
	type: FSEntryType;

	constructor(options: Options) {
		this.path = options.path;
		this.name = this.path.split("/").reverse()[0];
	}
}

export default FSEntry;
