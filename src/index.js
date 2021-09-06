// @ts-check

console.log("started");

// @ts-ignore
require("dotenv").config();
const express = require("express");
const ngrok = require("./getPublicUrls");
const winston = require("winston");

const viberBotPackage = require("viber-bot");
const ViberBot = viberBotPackage.Bot;
const BotEvents = viberBotPackage.Events;

const app = express();
const path = require("path");
const { response } = require("express");
app.use("/public", express.static(path.join(__dirname, "../public")));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const IS_PRODUCTION = process.env.IS_PRODUCTION === "true";

const VIBER_BOT_ROUTE = "/viber";

let hostUrl = "";
const bot = new ViberBot({
	logger: IS_PRODUCTION
		? undefined
		: // @ts-ignore
		  new winston.createLogger({
				level: IS_PRODUCTION ? "info" : "debug",
		  }),
	authToken: API_KEY,
	name: process.env.BOT_NAME,
	avatar:
		"https://static.botsrv2.com/website/img/quriobot_favicon.1727b193.png",
});

async function sendPdfMessage(filename = "quantum.pdf") {
	async function getPdfSize(filename) {
		const fs = require("fs/promises");
		let file;
		try {
			file = await fs.open(filename, "r");
			const stat = await file.stat();
			return stat.size;
		} catch {
		} finally {
			await file.close();
		}
	}

	const fileLocation = `public/${filename}`;
	const fileSize = await getPdfSize(fileLocation);

	return new viberBotPackage.Message.File(
		`${hostUrl}/${fileLocation}`,
		fileSize,
		filename
	);
}

const utils = require("./utils");
const helpers = require("./helpers");
const models = require("./models");

const folderStructure = new models.FolderObj("public");
console.log("folderStructure loaded");

bot.onTextMessage(/^!start$/i, (message, response) => {
	const AVAILABLE_CONTENT_TYPES = folderStructure.content
		.filter((entry) => {
			return entry.type === "folder";
		})
		.map((folder) => folder.name);

	response.send([
		new viberBotPackage.Message.Text("What type of content do you want?"),
		new viberBotPackage.Message.Keyboard(
			helpers.viberKeyboardOptions({
				buttonSize: {
					width: 2,
					height: 1,
				},
				buttons: AVAILABLE_CONTENT_TYPES.map((contentType) => ({
					text: utils.capitalize(contentType),
					action: `!type ${contentType}`,
				})),
			})
		),
	]);
});

/**
 * @typedef ListenerObj
 * @property {RegExp} messageRoute
 * @property {(message, response, messageRegexMatched: RegExpMatchArray) => Promise<void>} messageListener
 */

/**
 * @type ListenerObj[]
 */
const listeners = [
	{
		messageRoute: /!type (?<type>\w+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const type = messageRegexMatched.groups.type;
			if (type === "education") {
				/**
				 * @type models.FolderObj
				 */
				// @ts-ignore
				const EDUCATION_FOLDER = folderStructure.content.find(
					(entry) => entry.name === "education" && entry.type === "folder"
				);
				const AVAILABLE_GRADES = EDUCATION_FOLDER.content
					.filter((entry) => entry.type === "folder")
					.map((folder) => {
						return folder.name;
					});

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
									action: `!grade ${grade}`,
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
		messageRoute: /!grade (?<grade>\d+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			const grade = parseInt(messageRegexMatched.groups.grade);
			const subjects = helpers.getSubjects(grade);

			response.send([
				new viberBotPackage.Message.Text("Select a subject"),
				new viberBotPackage.Message.Keyboard(
					helpers.viberKeyboardOptions({
						buttonSize: {
							width: 2,
							height: 1,
						},
						buttons: subjects.map((subject) => {
							return {
								action: `!subject ${grade}-${subject.name}`,
								text: subject.displayName,
							};
						}),
					})
				),
			]);
		},
	},
	{
		messageRoute: /!subject (?<grade>\d+)-(?<subject>[\w-]+)/i,
		messageListener: async (message, response, messageRegexMatched) => {
			console.log("sub", messageRegexMatched);
			const { grade, subject: subjectName } = messageRegexMatched.groups;
			const subject = new models.Subject(subjectName);
			// TODO
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
			const ngrokUrl = await ngrok.getPublicUrl();
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
