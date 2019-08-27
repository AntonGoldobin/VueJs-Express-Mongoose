const express = require("express");
const mongoose = require("mongoose");
const app = express();
const jsonParser = express.json();
const User = require("./db/models/Users")
const favicon = require('serve-favicon');
const path = require('path')
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); // add axios

const token = '842833050:AAE550CqYmhAxeNObikicc_jA9aZYfJPhUc'


mongoose.connect("mongodb+srv://bloodsacrifice:FgupgpybSuH8a79J@cluster0-lyyb5.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true }, function(err){
    if(err) return console.log(err);
    app.listen(process.env.PORT || 3000, function(){
        console.log("Сервер ожидает подключения...");
    });
});

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // * => allow all origins
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Accept'); // add remove headers according to your needs
    next()
})

app.get("/users", function(req, res){

    User.find({}, function(err, users){

        if(err) return console.log(err);
        res.send(users)
    });
});
app.delete('/users', function(req, res){
    User.remove({}, function (err, result) {
        mongoose.disconnect();

        if(err) return console.log(err);

        console.log(result);
    })
})

app.post("/users", jsonParser, function(req, res){
    if(!req.body) return res.sendStatus(400);

    const userName = req.body.name;
    const userAge = req.body.age;
    const user = new User({name: userName, age: userAge});

    user.save(function(err){
        if(err) return console.log(err);
        res.send(user);
    });
})

var notes = [];

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const chanelId = '@SkyTanuki'


bot.onText(/создай (.+) с возрастом (.+)/, function (msg, match) {
    var userId = msg.from.id;
    var text = match[1];
    var time = match[2];

    notes.push({ 'uid': userId, 'time': time, 'text': text });
    console.log(notes)

    bot.sendMessage(userId, 'Создам, если не сдохну :)');
    const userName = text;
    const userAge = time;
    const user = new User({name: userName, age: userAge});
        user.save(function(err){
        if(err) return console.log(err);
        });
});

bot.onText(/show (.+)/, function (msg, match) {
    var userId = msg.from.id;
    const subreddit = match[1];

    // GET the data from Reddit API
        axios.get(`https://reddit.com/r/${subreddit}/top.json?limit=100`)
          .then(res => {
              // data recieved from Reddit
              const data = res.data.data;

              // if subbreddit does not exist
              if (data.children.length < 1){
                  return bot.sendMessage(userId, 'The subreddit couldn\'t be found.');
              }

              bot.sendMessage(userId, 'got it :)');

              data.children.forEach(post => {
                  const postUrl = post.data.url

                  if(postUrl.includes('gfycat')){
                      sendGif(post, postUrl)
                  }
                  else{
                      sendPic(post, postUrl)
                  }


              })

          })

          // if there's any error in request
          .catch(err => console.log(err));
});

function sendGif(post, postUrl){
    const gifUrl = postUrl + '.gif'
    console.log(gifUrl)
    bot.sendAnimation(chanelId, 'https://gfycat.com/wearyidenticalislandcanary.gif');
}

function sendPic(post, postUrl) {
    console.log(postUrl + 'pic')
    bot.sendPhoto(chanelId, postUrl, {caption: post.data.title});

}