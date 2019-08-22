const express = require("express");
const mongoose = require("mongoose");
const app = express();
const jsonParser = express.json();
const User = require("./db/models/Users")

mongoose.connect("mongodb+srv://bloodsacrifice:FgupgpybSuH8a79J@cluster0-lyyb5.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true }, function(err){
    if(err) return console.log(err);
    app.listen(3001, function(){
        console.log("Сервер ожидает подключения...");
    });
});


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

