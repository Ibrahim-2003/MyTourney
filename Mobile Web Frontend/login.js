const mysql = require("mysql");

const express = require("express");
const e = require("express");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();

const app = express();
app.set('view-engine', 'ejs');
app.use(express.static(__dirname));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
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

//net start MYSQL80
//Database (USER TABLE): user_name, user_pass, user_email, user_first, user_gender, age, bio, photo, points, tourneys_played, tourneys_won, tourneys_lost, games_played, games_lost, goals_for, goals_against, shots, saves, shutouts
//Need to add team many-to-many relationship, games_won, and user_last
app.post("/login",encoder, function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    connection.query("select * from users where user_email = ? and user_pass = ?",[email, password], function(error, results, fields){
        if (results.length > 0){
            res.redirect("/home");
        }else {
            res.redirect("/login");
        }
        res.end();
    })
})

//When login is success
app.get("/home", function(req, res){
    res.render('home.ejs');
})

app.post("/register", function(req,res){
    
})
//16:31
//'168.5.180.127' || 'localhost'
// Start mysql server: "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld" --console
app.listen(4500);