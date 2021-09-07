import { capitalize } from "../utils";

class Subject {
	name: string;

	/**
	 * @param subjectName formatted like this "subject-name"
	 */
	constructor(subjectName: string) {
		this.name = subjectName;
	}

	get displayName(): string {
		return this.name
			.split("-")
			.map((word) => capitalize(word))
			.join(" ");
	}
}

export default Subject;
