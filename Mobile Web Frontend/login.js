const mysql = require("mysql");

const express = require("express");

const app = express();
app.set('view-engine', 'ejs')
app.use(express.static(__dirname));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "mytourney"
});

//Connect to database
connection.connect(function(error){
    if (error) throw error
    else console.log("Connected to database successfully")
});

app.get("/register", function(req, res){
    res.render('register.ejs');
})
app.get("/home", function(req, res){
    res.render('home.ejs');
})
app.get("/login", function(req, res){
    res.render('login.ejs');
})
app.get("/friends", function(req, res){
    res.render('friends.ejs');
})
app.get("/profile_player", function(req, res){
    res.render('profile_player.ejs');
})
app.get("/balance", function(req, res){
    res.render('balance.ejs');
})
app.get("/team_player", function(req, res){
    res.render('team_player.ejs');
})

app.get("/", function(req, res){
    res.render('home.ejs');
})

app.post("/register", function(req,res){

})
//8:30
//'168.5.180.127' || 'localhost'
app.listen(4500);