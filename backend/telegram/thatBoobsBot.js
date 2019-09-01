const Telegraf = require('telegraf')
const token = '932862565:AAGvB5FMFlC4O2oVS5JajXmA4-GtPytpto0'
const axios = require('axios'); // add axios
require('babel-core/register');
const ThatBoobs = require("../db/models/ThatBoobs")
var _ = require('lodash');

const thatBoobsId = '@thatBoobs'


function startBot(){
  const boobsBot = new Telegraf(token)
  boobsBot.command('clearData', (ctx) => {
    clearData()
    ctx.reply('Данные уникальных id теперь пусты :3')
  })
  boobsBot.command('start', (ctx) => {
    // GET the data from Reddit API
    postContent(ctx)
  })

  boobsBot.launch()

  async function postContent(ctx){
    await console.log('start again')
    await axios.get(`https://reddit.com/r/boobs/top.json?limit=5`)
      .then(res => {
        // data recieved from Reddit
        const data = res.data.data;

        // if subbreddit does not exist
        if (data.children.length < 1){
          return ctx.reply('The subreddit couldn\'t be found.');
        }

        ctx.reply('Поняль ;)');

        postUnicPosts(data, ctx)
      })

      // if there's any error in request
      .catch(err => console.log(err));
  }

  async function postUnicPosts(data, ctx) {
    // get unique ids
    const uniqPosts = await checkUniqAndReturn(data)
    await sendUniqPosts(ctx, uniqPosts)
  }

  //add id to db for unique content
  function addIdToData(id) {
    const thatBoobs = new ThatBoobs({id: id});
    thatBoobs.save(function(err){
    if(err) return console.log(err);
    });
  }

  async function checkUniqAndReturn(data){
    const url = 'https://sky-tanuki.herokuapp.com' + '/thatBoobs'
    //get ids from db
    const uniqPosts = await axios.get(url)
      .then( resDB => {
        //get ids from new reddit posts
        const dataIds = data.children.map(post => post.data.id)
        //get ids from db
        const boobsIds = resDB.data.map(item => item.id)
        // mix ids and get only unique
        const uniqIds = _.difference(dataIds, boobsIds)
        // return all uniq posts from reddit
        return uniqIds.map(id => data.children.find(post => post.data.id === id))
      })
    return uniqPosts
  }
  function sendUniqPosts(ctx, uniqPosts) {
    // post image every 5 seconds
    uniqPosts.forEach( (post, index) => setTimeout(sendPhotoOrGif, (index + 1) * 1000 * 5,post.data.url, ctx, post) )
  }
  function sendPhotoOrGif(postUrl, ctx, post) {
    if(postUrl.includes('gfycat')) {
      const gifUrl = postUrl + '.gif'
      console.log(gifUrl)
      ctx.telegram.sendAnimation(thatBoobsId, gifUrl)
      addIdToData(post.data.id)
    }
    else{
      ctx.telegram.sendPhoto(thatBoobsId, postUrl)
      addIdToData(post.data.id)
    }
  }
  //clear array with photos id from db
  function clearData(){
    ThatBoobs.deleteMany({}, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }

}


module.exports.startBot = startBot