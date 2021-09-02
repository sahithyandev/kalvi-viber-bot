require("dotenv").config();
const path = require("path");
const express = require("express");
const ViberBot = require("viber-bot").Bot;
const BotEvents = require("viber-bot").Events;

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const VIBER_BOT_ROUTE = "/viber";

const bot = new ViberBot({
	authToken: API_KEY,
	name: "BoyTest",
	avatar: path.join(process.env.VERCEL_URL, "/public/profile.jpg")
});

console.log(process.env);

bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
	response.send(message);
});

app.use(express.static(path.join(__dirname, 'public')))
app.use(VIBER_BOT_ROUTE, bot.middleware());

app.listen(PORT, () => {
	const webhookUrl = path.join(process.env.VERCEL_URL, VIBER_BOT_ROUTE);
	bot.setWebhook(webhookUrl);
});
