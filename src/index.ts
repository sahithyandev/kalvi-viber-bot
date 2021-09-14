import * as ngrok from "./getPublicUrls";
import * as utils from "./utils";
import * as helpers from "./helpers";
import * as models from "./models";
import { PublicContentType, PublicGrade } from "./types";

console.log("started");

require("dotenv").config();
const express = require("express");
const winston = require("winston");

const viberBotPackage = require("viber-bot");
const ViberBot = viberBotPackage.Bot;
const BotEvents = viberBotPackage.Events;

const app = express();
const path = require("path");
app.use("/public", express.static(path.join(__dirname, "../public")));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const IS_PRODUCTION = process.env.IS_PRODUCTION === "true";

const VIBER_BOT_ROUTE = "/viber";

let hostUrl = "";
const bot = new ViberBot({
	logger: IS_PRODUCTION
		? undefined
		: new winston.createLogger({
				level: IS_PRODUCTION ? "info" : "debug",
		  }),
	authToken: API_KEY,
	name: process.env.BOT_NAME,
	avatar:
		"https://static.botsrv2.com/website/img/quriobot_favicon.1727b193.png",
});

async function sendPdfMessage(fileLocation: string) {
	async function getPdfSize(filename) {
		const fs = require("fs/promises");
		let file;
		try {
			file = await fs.open(filename, "r");

			const stat = await file.stat();
			await file.close();

			return stat.size;
		} catch (err) {
			console.log("ERR", err);
		}
	}

	const fileSize = await getPdfSize(fileLocation);
	const filename = fileLocation.split("/").reverse()[0];

	console.log("pdf", { hostUrl, fileLocation, filename, fileSize });

	return new viberBotPackage.Message.File(
		`${hostUrl}/${fileLocation}`,
		fileSize,
		filename
	);
}

const folderStructure = new models.FolderObj("public");
console.log("folderStructure loaded");

bot.onTextMessage(/^!start$/i, (message, response) => {
	response.send([
		new viberBotPackage.Message.Text("What type of content do you want?"),
		new viberBotPackage.Message.Keyboard(
			helpers.viberKeyboardOptions({
				buttonSize: {
					width: 2,
					height: 1,
				},
				buttons: folderStructure.subfolderNames.map((contentType) => ({
					action: `!type ${contentType}`,
					text: utils.dashedToNormal(contentType),
				})),
			})
		),
	]);
});

interface ListenerObj {
	messageRoute: RegExp;
	messageListener: (
		message,
		response,
		messageRegexMatched: RegExpMatchArray
	) => Promise<void>;
}

const listeners: ListenerObj[] = [
	{
		messageRoute: /!type (?<type>\w+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const type: PublicContentType = messageRegexMatched.groups
				.type as PublicContentType;

			if (["papers", "teachers-guides"].includes(type)) {
				const AVAILABLE_GRADES = folderStructure
					.subfolder(type)
					.content.filter((entry) => entry.type === "folder")
					.map((folder) => {
						return folder.name;
					}) as PublicGrade[];

				response.send([
					new viberBotPackage.Message.Text("Select the grade you want"),
					new viberBotPackage.Message.Keyboard(
						helpers.viberKeyboardOptions({
							buttonSize: {
								width: 2,
								height: 1,
							},
							buttons: AVAILABLE_GRADES.map((grade) => {
								return {
									action: `!${type} ${grade}`,
									text: `Grade ${grade}`,
								};
							}),
						})
					),
				]);
			}
		},
	},
	{
		// type papers
		// response to the selected grade -> show available subjects
		messageRoute: /!papers (?<grade>\w+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const grade: PublicGrade = messageRegexMatched.groups
				.grade as PublicGrade;

			console.log("grade-selected", messageRegexMatched.groups);

			// available subjects
			const availableSubjects = folderStructure
				.subfolder("papers")
				.subfolder(grade).subfolderNames;

			// show subjects
			response.send([
				new viberBotPackage.Message.Text("Select the subject you want"),
				new viberBotPackage.Message.Keyboard(
					helpers.viberKeyboardOptions({
						buttonSize: {
							width: 2,
							height: 1,
						},
						buttons: availableSubjects.map((subject) => {
							return {
								text: new models.Subject(subject).displayName,
								action: `!papers_${grade} ${subject}`,
							};
						}),
					})
				),
			]);
		},
	},
	{
		messageRoute: /!papers_(?<grade>\d+) (?<subject>\w+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const { grade, subject } = messageRegexMatched.groups;
			console.log("subject selected", messageRegexMatched.groups);

			// show available paper types
			const availablePaperTypes = folderStructure
				.subfolder("papers")
				.subfolder(grade)
				.subfolder(subject).subfolderNames;

			response.send([
				new viberBotPackage.Message.Text("What kind of papers do you want?"),
				new viberBotPackage.Message.Keyboard(
					helpers.viberKeyboardOptions({
						buttonSize: {
							width: 6,
							height: 1,
						},
						buttons: availablePaperTypes.map((paperType) => {
							return {
								action: `!papers_${grade}_${subject} ${paperType}`,
								text: utils.dashedToNormal(paperType),
							};
						}),
					})
				),
			]);
		},
	},
	{
		messageRoute:
			/!papers_(?<grade>\d+)_(?<subject>\w+) (?<paperType>[\w\-]+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const { grade, subject, paperType } = messageRegexMatched.groups;

			console.log("paper-type-selected", messageRegexMatched.groups);

			const availablePapers = folderStructure
				.subfolder("papers")
				.subfolder(grade)
				.subfolder(subject)
				.subfolder(paperType).files;

			response.send([
				new viberBotPackage.Message.Text("Select one"),
				new viberBotPackage.Message.Keyboard(
					helpers.viberKeyboardOptions({
						buttonSize: {
							width: 6,
							height: 1,
						},
						buttons: availablePapers.map((paper) => ({
							action: `!file ${paper.path}`,
							text: paper.name,
						})),
					})
				),
			]);
		},
	},
	{
		messageRoute: /!file (?<fileName>[\w\/\-\.]+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const fileName = messageRegexMatched.groups.fileName;
			console.log("file download", fileName);
			const s = await sendPdfMessage(fileName);

			console.log(s);
			response.send([new viberBotPackage.Message.Text("Here"), s]);
		},
	},
	{
		messageRoute: /!teachers-guide (?<grade>\w+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const grade = messageRegexMatched.groups.grade as PublicGrade;

			// show the available files
			const availableFiles = folderStructure
				.subfolder("teachers-guides")
				.subfolder(grade).fileNames;

			response.send([
				new viberBotPackage.Message.Text("Select the subject you want"),
				new viberBotPackage.Message.Keyboard(
					helpers.viberKeyboardOptions({
						buttonSize: {
							width: 6,
							height: 1,
						},
						buttons: availableFiles.map((subjectFile) => ({
							text: subjectFile,
							action: `!teachers-guide_${grade} ${subjectFile}`,
						})),
					})
				),
			]);
		},
	},
	{
		messageRoute: /!teachers-guide_(?<grade>\w+) (?<subject>\w+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const { grade, subject } = messageRegexMatched.groups;

			response.send([
				new viberBotPackage.Message.Text("Here is the file"),
				sendPdfMessage(`teachers-guide/${grade}/${subject}.pdf`),
			]);
		},
	},
];

for (const listenerObj of listeners) {
	bot.onTextMessage(listenerObj.messageRoute, (message, response) => {
		return listenerObj.messageListener.apply(null, [
			message,
			response,
			message.text.match(listenerObj.messageRoute),
		]);
	});
}

bot.onTextMessage(/.*/i, (message, response) => {
	response.send(new viberBotPackage.Message.Text("Send !start to get started"));
});

bot.on(
	BotEvents.CONVERSATION_STARTED,
	(userProfile, isSubscribed, context, onFinish) => {
		console.log("conversation-started", {
			userProfile,
			isSubscribed,
			context,
			onFinish,
		});
	}
);

app.use(VIBER_BOT_ROUTE, bot.middleware());

app.get("/", (req, res) => {
	res.send("running");
});

app.listen(PORT, () => {
	(async () => {
		console.log("is prod", IS_PRODUCTION);
		if (IS_PRODUCTION) {
			return `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
		} else {
			const ngrokUrl = await ngrok.getPublicUrls();
			return ngrokUrl;
		}
	})()
		.then((_hostUrl) => {
			hostUrl = _hostUrl;
			const webhookUrl = `${_hostUrl}${VIBER_BOT_ROUTE}`;
			console.log("adding webhook", webhookUrl);
			bot
				.setWebhook(webhookUrl)
				.then(() => {
					console.log("webhook added");
				})
				.catch((err) => {
					console.warn("error while adding webhook", err);
				});
		})
		.catch((error) => {
			console.log("Can not connect to ngrok server. Is it running?");
			console.error(error);
		});
});
