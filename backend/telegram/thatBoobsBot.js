const Telegraf = require('telegraf')
const token = '932862565:AAGvB5FMFlC4O2oVS5JajXmA4-GtPytpto0'
const axios = require('axios'); // add axios
require('babel-core/register');
const ThatBoobs = require("../db/models/ThatBoobs")
var _ = require('lodash');

const thatBoobsId = '@thatBoobs'

let isLoaded = false

function isLoadedFalse(){
  console.log('yay')
  isLoaded = false
}

function startBot(){

  const boobsBot = new Telegraf(token)
  boobsBot.command('clearData', (ctx) => {
    clearData()
    ctx.reply('Данные уникальных id теперь пусты :3')
  })
  boobsBot.command('start', (ctx) => {
    // GET the data from Reddit API
    ctx.reply('Starting...')
    //if loading process is continued, do nothing
    postContent(ctx).then();

    //starting bot every day
    setInterval(postContent, 1000 * 60 * 60 * 24, ctx)
  })

  boobsBot.launch()

  async function postContent(ctx){
    console.log(isLoaded)
    if(isLoaded === true){
      return
    }

    isLoaded = true

    await console.log('start again')
    await axios.get(`https://reddit.com/r/boobs/top.json?limit=100`)
      .then(res => {
        // data recieved from Reddit
        const data = res.data.data;

        // if subbreddit does not exist
        if (data.children.length < 1){
          return ctx.reply('The subreddit couldn\'t be found.');
        }
        postUnicPosts(data, ctx).then();
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
    const herokuUrl = 'https://sky-tanuki.herokuapp.com' + '/thatBoobs'
    const localUrl = 'http://localhost:3000/thatBoobs'
    //get ids from db
    //TODO change url for local server
    const uniqPosts = await axios.get(herokuUrl)
      .then( resDB => {
        //get ids from new reddit posts
        const dataIds = data.children.map(post => post.data.id)
        //get ids from db
        const boobsIds = resDB.data.map(item => item.id)
        // mix ids and get only unique
        const uniqIds = _.difference(dataIds, boobsIds)
        // return all uniq posts from reddit
        const uniqPosts = uniqIds.map(id => data.children.find(post => post.data.id === id))
        return uniqPosts
      })
      .catch(error => {
        console.log(error.response)
      });
    return uniqPosts
  }
  function sendUniqPosts(ctx, uniqPosts) {
    // post image every 5 seconds
    uniqPosts.forEach( async (post, index) => {
      await setTimeout(sendPhotoOrGif, (index + 1) * 1000 * 60 * 10 ,post.data.url, ctx, post)
    })
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