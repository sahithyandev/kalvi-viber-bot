console.log("started");


require("dotenv").config();
const path = require("path");
const express = require("express");
const ngrok = require("./getPublicUrls");
const winston = require("winston");

const ViberBot = require("viber-bot").Bot;
const BotEvents = require("viber-bot").Events;

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const IS_PRODUCTION = process.env.IS_PRODUCTION;

const VIBER_BOT_ROUTE = "/viber";

const bot = new ViberBot({
  logger: IS_PRODUCTION
    ? undefined
    : new winston.createLogger({
        level: IS_PRODUCTION ? "info" : "debug",
      }),
  authToken: API_KEY,
  name: "BoyTest",
  avatar: "https://static.botsrv2.com/website/img/quriobot_favicon.1727b193.png",
});

bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
  console.log("message-received", message);
  response.send(message);
});

app.use(express.static(path.join(__dirname, "public")));
app.use(VIBER_BOT_ROUTE, bot.middleware());

app.listen(PORT, () => {
  (async () => {
    if (IS_PRODUCTION) {
      return `https://${process.env.VERCEL_URL}${VIBER_BOT_ROUTE}`;
    } else {
      const ngrokUrl = await ngrok.getPublicUrl();
      return `${ngrokUrl}${VIBER_BOT_ROUTE}`;
    }
  })()
    .then((webhookUrl) => {
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
