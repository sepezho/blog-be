const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const pool = require("./src/utilities/mysql.js").pool;
require("dotenv/config");

// const texasft = fs.readFileSync('./telegram1/result_parsed.md')
// pool.query("INSERT INTO `POST`(`Title`, `Text`) VALUES ('" + 'sepezho.log backup' + "', '" + texasft.toString('utf8').replace(/["']/g, "") + "');", (_, resultsCom) => {
//   console.log('err:')
//   console.log(_)
//   console.log('res:')
//   console.log(resultsCom)
// })
const token = process.env.bot_token;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  console.log(chatId)
  const resp = match[1]; // the captured "whatever"
  bot.sendMessage(chatId, resp);
});

let text = ''
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(msg)
  if (chatId === 5841920686) {
    if (msg.text === 'post') {
      const title = text.includes('<body>') ? text.split('<body>')[0] : 'no title'
      const body = text.includes('<body>') ? text.split('<body>')[1] : text
      pool.query("INSERT INTO `POST`(`Title`, `Text`) VALUES ('" + title + "','" + body + "');", (_, resultsCom) => {
        console.log('err:')
        console.log(_)
        console.log('res:')
        console.log(resultsCom)
      })
      text = ''
    } else {
      text += msg.text + '<br />'
    }
    // pool.query("INSERT INTO `POST`(`Title`, `Text`) VALUES ('" + msg.text.split('<body>')[0] + "','" + msg.text.split('<body>')[1] + "');", (_, resultsCom) => {
    //   console.log(_)
    //   console.log(resultsCom)
    // })
    bot.sendMessage(chatId, 'Received your message');
  }
});
