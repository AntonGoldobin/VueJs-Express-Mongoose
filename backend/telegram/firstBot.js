const Telegraf = require('telegraf')
const token = '842833050:AAE550CqYmhAxeNObikicc_jA9aZYfJPhUc'
const axios = require('axios'); // add axios
require('babel-core/register');
const OtherThemes = require("../db/models/OtherThemes")
var _ = require('lodash');

const OtherThemesId = '@SkyTanuki'

let isLoaded = false

function isLoadedFalse(){
  console.log('yay')
  isLoaded = false
}

function startBot(){

  const otherThemes = new Telegraf(token)
  otherThemes.command('clearData', (ctx) => {
    clearData()
    ctx.reply('Данные уникальных id теперь пусты :3')
  })
  otherThemes.on('message', (ctx) => {
    // GET the data from Reddit API
    ctx.reply('got it')
    //if loading process is continued, do nothing
    postContent(ctx).then();

    //starting bot every day
    setInterval(postContent, 1000 * 60 * 60 * 24, ctx)
  })
  function test(){
    console.log('test')
  }

  otherThemes.launch()

  async function postContent(ctx){
    console.log(isLoaded)
    if(isLoaded === true){
      return
    }

    isLoaded = true

    await axios.get(`https://reddit.com/r/${ctx.message.text}/top.json?limit=100`)
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
    const otherThemes = new OtherThemes({id: id});
    otherThemes.save(function(err){
      if(err) return console.log(err);
    });
  }

  async function checkUniqAndReturn(data){
    const herokuUrl = 'https://sky-tanuki.herokuapp.com' + '/otherThemes'
    const localUrl = 'http://localhost:3000/otherThemes'
    //get ids from db
    const uniqPosts = await axios.get(herokuUrl)
      .then( resDB => {
        //get ids from new reddit posts
        const dataIds = data.children.map(post => post.data.id)
        //get ids from db
        const boobsIds = resDB.data.map(item => item.id)
        // mix ids and get only unique
        const uniqIds = _.difference(dataIds, boobsIds)
        // return all uniq posts from reddit
        const uniqPostsForReturn = uniqIds.map(id => data.children.find(post => post.data.id === id))
        return uniqPostsForReturn
      })
      // if there's any error in request
      .catch(err => console.log(err));
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
      // console.log(gifUrl)
      ctx.telegram.sendAnimation(OtherThemesId, gifUrl)
      addIdToData(post.data.id)
    }
    else{
      ctx.telegram.sendPhoto(OtherThemesId, postUrl)
      addIdToData(post.data.id)
    }
  }
  //clear array with photos id from db
  function clearData(){
    OtherThemes.deleteMany({}, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }

}


module.exports.startBot = startBot