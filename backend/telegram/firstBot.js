const Telegraf = require('telegraf')
const token = '842833050:AAE550CqYmhAxeNObikicc_jA9aZYfJPhUc'
const axios = require('axios'); // add axios
require('babel-core/register');

const chanelId = '@SkyTanuki'


function startBot(){
  const bot = new Telegraf(token)
  bot.start((ctx) => ctx.reply('Welcome'))
  bot.help((ctx) => ctx.reply('Send me a sticker'))
  bot.on('text', (ctx) => {
    // GET the data from Reddit API
    postContent(ctx)
  })

  bot.launch()

  function postContent(ctx){
    axios.get(`https://reddit.com/r/${ctx.message.text}/top.json?limit=1`)
      .then(res => {
        // data recieved from Reddit
        const data = res.data.data;

        // if subbreddit does not exist
        if (data.children.length < 1){
          return ctx.reply('The subreddit couldn\'t be found.');
        }

        ctx.reply('got it :)');
        data.children.forEach(post => {
          const postUrl = post.data.url

          if(postUrl.includes('gfycat')) {
            const gifUrl = postUrl + '.gif'
            console.log(gifUrl)
            ctx.replyWithDocument(gifUrl)
          }
          else{
            ctx.replyWithPhoto(postUrl)
          }
        })
      })

      // if there's any error in request
      .catch(err => console.log(err));
  }

}

module.exports.startBot = startBot