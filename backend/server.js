const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();
const jsonParser = express.json();

const userScheme = new Schema({
    name: String,
    age: Number,
})
const User = mongoose.model("User", userScheme);

mongoose.connect("mongodb://localhost:27017/usersdb", { useNewUrlParser: true }, function(err){
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

app.get("/", function(request, response){
    response.send('{\n' +
        '  "items": [\n' +
        '    { "id": 1, "name": "Яблоки",  "price": "$2" },\n' +
        '    { "id": 2, "name": "Персики", "price": "$5" }\n' +
        '  ] \n' +
        '}')
})
