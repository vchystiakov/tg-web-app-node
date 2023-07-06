// import Telegram-bot-api module
const TelegramBot = require('node-telegram-bot-api');
// import express for working with server
const express = require('express');
// import cors
const cors = require('cors');

// replace the value below with the Telegram token you receive from @BotFather
const token = '6348819970:AAElkPFK8DgASpj3_vkyjcN958RapUwnbnk';
// Web application which will be processes by inline_keyboard
const webAppUrl =
  'https://64a2d586c0029114028b59ae--keen-truffle-a3580c.netlify.app/';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
// creating app with using express
const app = express();

app.use(express.json());
app.use(cors());

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Event listener which react on bot starting
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  //variable user text
  const text = msg.text;

  //   Taking text from user message
  if (text === '/start') {
    // Structure of form for simple keyboard
    await bot.sendMessage(chatId, 'There will be button below,fill the form', {
      reply_markup: {
        keyboard: [
          [{ text: 'Fill the form', web_app: { url: webAppUrl + '/form' } }],
        ],
      },
    });
    await bot.sendMessage(chatId, 'Welcome to our Internet Shop', {
      //Structure of form for inline_keyboard
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Make order', web_app: { url: webAppUrl } }],
        ],
      },
    });
  }
  // data - is data from web application
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      // Async functions
      await bot.sendMessage(chatId, 'Thank you for your Feedback');
      await bot.sendMessage(chatId, 'Your Country:' + data?.Country);
      await bot.sendMessage(chatId, 'Your Street:' + data?.Street);

      setTimeout(async () => {
        await bot.sendMessage('You will get all information in this chat');
      }, 3000);
      // if there are mistakes they will be shown in console
    } catch (e) {
      console.log(e);
    }
  }
});

//method which will process request and extract data which was send from front end(client)
app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'success purchase',
      input_message_content: {
        message_text:
          'Congratulations on purchase, you bought products on total price:' +
          totalPrice,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    // if there is a mistake client will receive message
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'failed to purchase',
      input_message_content: {
        message_text:
          'Congratulations on purchase, you bought products on total price:' +
          totalPrice,
      },
    });
    return res.status(500).json({});
  }
});

const PORT = 3000;
//starts server
app.listen(PORT, 'server started on PORT 3000' + PORT);
