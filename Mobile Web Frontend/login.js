const mysql = require("mysql");

const express = require("express");
const e = require("express");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = reqiure("./passport-config");

initializePassport(
    passport,
    email => users.find(user => user.email === email)
)

const app = express();
app.set('view-engine', 'ejs');
app.use(express.static(__dirname));
app.use(express.urlencoded({extended: false}));
app.use(flash());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    //port: "3306",
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
// mysqld --console
//Database (USER TABLE): user_name, user_pass, user_email, user_first, user_gender, age, bio, photo, points, tourneys_played, tourneys_won, tourneys_lost, games_played, games_lost, goals_for, goals_against, shots, saves, shutouts
//Need to add team many-to-many relationship, games_won, and user_last
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'; if nodejs is showing "consider upgrading mysql client"
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

app.post("/register", async function(req,res){
    var email = req.body.email;
    var username = req.body.username;
    var first = req.body.first;
    var last = req.body.last;
    var birth = req.body.birthdate;
    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    var age = getAge(birth);
    // var element = document.getElementById("gender");
    // var gender = element.value;
    var gender = req.body.gender;
    console.log([username, email, first, last, gender, age, birth])
    try {
        var password = await bcrypt.hash(req.body.password, 10);

        var vals = {user_name: username,
            user_pass: password,
            user_email: email,
            user_first: first,
            user_last: last,
            user_gender: gender,
            age: age};

        //Columns: "user_name", "user_pass", "user_email", "user_first", "user_last", "user_gender", "age", "bio", "photo", "points", "tourneys_played", "tourneys_won", "tourneys_lost", "games_played", "games_lost", "goals_for", "goals_against", "shots", "saves", "shutouts"
        var query = connection.query('INSERT INTO users SET ?',vals, function (error, results, fields){
            console.log(query);
            console.log(vals)
            console.log("USER REGISTERED");
        })
        connection.query("select * from users where user_email = ? and user_pass = ?",[email, password], function(error, results, fields){
            if (results.length > 0){
                res.redirect("/home");
            }else {
                res.redirect("/register");
            }
            res.end();
        })
    } catch{
        console.log("CATCH")
        res.redirect("/register");
    }
})
//16:31
//'168.5.180.127' || 'localhost'
// Start mysql server: "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld" --console
app.listen(4500);