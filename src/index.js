console.log("started");

require("dotenv").config();
const express = require("express");
const ngrok = require("./getPublicUrls");
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

async function getPdfSize(filename) {
  const fs = require("fs/promises");
  let file;
  try {
    file = await fs.open(filename, "r");
    const stat = await file.stat();
    return stat.size;
  } catch {
    await file.close();
  }
}

bot.on(BotEvents.MESSAGE_RECEIVED, async (message, response) => {
  console.log("message-received", message);

  if (message.text === "pdf") {
    const filename = "quantum.pdf";
    const fileLocation = "public/quantum.pdf";
    const fileSize = await getPdfSize(fileLocation);

    response.send(
      new viberBotPackage.Message.File(
        `${hostUrl}/${fileLocation}`,
        fileSize,
        filename
      )
    );
    return;
  }

  response.send(message);
});

app.use(VIBER_BOT_ROUTE, bot.middleware());

app.get("/", (req, res) => {
  res.send("running");
});

app.listen(PORT, () => {
  console.log("listening");
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
