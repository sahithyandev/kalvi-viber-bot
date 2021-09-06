const { capitalize } = require("./../utils");

class Subject {
	/**
	 * @param {string} subjectName formatted like this "subject-name"
	 */
	constructor(subjectName) {
		this.name = subjectName;
	}

	get displayName() {
		return this.name
			.split("-")
			.map((word) => capitalize(word))
			.join(" ");
	}
}

module.exports = Subject;
