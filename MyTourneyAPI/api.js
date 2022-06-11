//بسم الله الرحمن الرحيم

//NOTE: NEED NODE VERSION 16 TO WORK (brew install node@16)

const mysql = require("mysql");
const express = require("express");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const multer = require('multer');
const request = require('request');
const fs = require('fs');
const util = require('util');
const path = require('path');
const email_js = require('../Mobile Web Frontend/email.js');
const { join, resolve } = require("path");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const e = require("express");
const { application } = require("express");
// const { upload,download, deleteFile } = require('../Mobile Web Frontend/spaces.js');
//Port should be 5000 on production
const port = 3000;
const url = 'www.winmytourney.com';

const mail = email_js.email;

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg'];

venue_path = "../Mobile Web Frontend/uploads/venues";
profile_path = "../Mobile Web Frontend/uploads/profiles";
team_path = "../Mobile Web Frontend/uploads/teams";

const upload_venue = multer({
    dest: venue_path,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

const upload_profile = multer({
    dest: profile_path,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

const upload_team = multer({
    dest: team_path,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

const unlinkFile = util.promisify(fs.unlink);

//Location API: https://nominatim.org/release-docs/latest/api/Search/



const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    //port: "3306",
    password: "password",
    // password: "password",
    database: "mytourney_db",
    timezone: 'utc'
});

distance = function(lat1, lon1, lat2, lon2){
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d
}

connection.connect(function(error){
    if (error) throw error
    else console.log(`Connected to database successfully. Open port ${port}`);
});

getUserById = function(user_id){
    return new Promise(function(resolve, reject){
      connection.query(
          "SELECT * FROM users WHERE user_id=?",
          user_id, 
          function(err, rows){                                                
              if(rows === undefined){
                  reject(new Error("Error rows is undefined"));
            }else{
                  resolve(rows);
            }
        }
    )}
)}

mailListSignUp = function(email){
    return new Promise(function(resolve,reject){
        connection.query(
            "INSERT INTO mail_list SET email=?",
            email,
            function(err,rows){
                if(rows === undefined){
                    reject (new Error('ERROR rows undefined email'))
                }else{
                    resolve(rows)
                }
            })
    })
}

getTourneys = function(){
    return new Promise(function(resolve, reject){
      connection.query(
          "SELECT * FROM tourneys WHERE status = 'recruiting'", 
          function(err, rows){                                                
              if(rows === undefined){
                  reject(new Error("Error rows is undefined"));
            }else{
                  resolve(rows);
            }
        }
    )}
)}

sortingAlgo = function(results){
    var coords = [];
    if (results.length > 0){
        var i;
            for (var i = 0; i < results.length; i++){
            coords.push({Lat: results[i]['lat_coord'], 
                    Lon: results[i]['lon_coord'],
                    Distance: distance(home_coords[0], home_coords[1], results[i]['lat_coord'], results[i]['lon_coord']),
                    Id: results[i]['tourneys_id']})
            // console.log(home_coords)
        }
        // console.log(coords)
        coords.sort((a,b) => {
            return a.Distance - b.Distance
        })
        // console.log(coords)
        return coords
        // console.log(coords)
    }else {
        console.log("NO TOURNEYS")
    }
}

sortTourneyByLocation = function(){
    getTourneys.then(function(results){
        sorted_tourneys = sortingAlgo(results)
        // console.log(sorted_tourneys)
        let tourney_json = [];
        for(i=0; i<sorted_tourneys.length; i++){
            tourney_json.push(results.filter(element => element.tourneys_id == sorted_tourneys[i]['Id']))
        }
        // console.log('FINALLY: ')
        // console.log(tourney_json)
        res.render('home.ejs', {tourneys: tourney_json,
                                tourney_path: venue_path+'/'})
    })
    .catch(function(err){
        console.log("Promise rejection error: " + err);
    })
}

checkPassword = function(email){
    return new Promise(function(resolve,reject){
        connection.query("SELECT * FROM users WHERE user_email = ?",[email],function(error,rows){
            if(rows == undefined){
                reject(false);
            }else{
                resolve(rows);
            }
        })
    })
}

getAge = function(birthday) {
    var today = new Date();
    var thisYear = 0;
    if (today.getMonth() < birthday.getMonth()) {
        thisYear = 1;
    } else if ((today.getMonth() == birthday.getMonth()) && today.getDate() < birthday.getDate()) {
        thisYear = 1;
    }
    var age = today.getFullYear() - birthday.getFullYear() - thisYear;
    return age;
}

checkVerification = function(user_id){
    return new Promise(function(resolve,reject){
        connection.query(
            "SELECT * FROM users WHERE user_id=?",
            user_id,
            function(err,rows){
                if(rows == undefined){
                    reject(new Error(`ERROR NO USER WITH THIS ID ${user_id}`));
                }else{
                    resolve(rows);
                }
            }
        )
    })
}

verifyLogin = async function(email, password, req, res){
    try {
        var chek = await checkPassword(email);
        var verification_check = await checkVerification(chek[0].user_id);
        if(verification_check[0].verified == 1){
            if(chek != false){
                if(await bcrypt.compare(password, chek[0].user_pass)){
                    authcode = true;
                    my_user_id = chek[0].user_id;
                    result = {message: "SUCCESS",
                            user_id: my_user_id,
                            user_name: chek[0].user_name,
                            age: getAge(chek[0].age),
                            gender: chek[0].user_gender,
                            details: "The user successfully logged in."}
                    res.json(result);
                }else{
                    result = {message: "FAIL",
                            details: "Wrong password was entered!"}
                    res.json(result);
                }
        }}else{
            result = {message: "FAIL"}
            res.json(result);
        }
        
            
    } catch (e) {
        console.error(e);
    }
}

checkCreatedUser = function(email){
    return new Promise(function(resolve, reject){
        connection.query(
            "select * from users where user_email = ?",email,
            function(err, rows){
                if(rows === undefined){
                    reject(new Error("Error rows is undefined"));
                }else{
                    resolve(rows);
                }
            }
        )
    })
}

createUser = async function(username, password, email, first, last, gender, birth){
    try{
        var password = await bcrypt.hash(password, 10);
            var verify_code = makeid(10)
            var verification_code = await bcrypt.hash(verify_code, 10);

            var vals = {user_name: username,
                user_pass: password,
                user_email: email,
                user_first: first,
                user_last: last,
                user_gender: gender,
                age: birth,
                balance: 0.00,
                points: 0,
                earnings: 0.00,
                withdrawals: 0.00,
                losses: 0.00,
                tourneys_played: 0,
                tourneys_lost: 0,
                tourneys_won: 0,
                games_played: 0,
                games_won: 0,
                games_lost: 0,
                goals_for: 0,
                goals_against: 0,
                shots: 0,
                saves: 0,
                shutouts: 0,
                verification_code: verification_code,
                verified: 0,
                team_contribution: 0};

            //Columns: "user_name", "user_pass", "user_email", "user_first", "user_last", "user_gender", "age", "bio", "photo", "points", "tourneys_played", "tourneys_won", "tourneys_lost", "games_played", "games_won", "games_lost", "goals_for", "goals_against", "shots", "saves", "shutouts"
            var query = connection.query('INSERT INTO users SET ?',vals, function (error, results, fields){
                // console.log(query);
                // console.log(vals);
                
            })

            const results = await checkCreatedUser(email);
                if (results.length > 0){
                    my_user_id = results[0].user_id;
                    email_contents = {
                        recipient: email,
                        subject: 'MyTourney Registration',
                        message: 'Welcome to MyTourney!\n'+
                                    '✔ Please verify your account by following this'+' link:'.link(`${url}/verify?code=${verify_code}`)+
                                    '✔ Find a team or create one to get started and join a tourney.\n'+
                                    '💸 You can win cash prizes by winning Tourneys.\n'+
                                    '🔥 I hope to see you crush the competition, and most importantly have fun!',
                        html: `<h1 style="text-align: center;">
                                Welcome to MyTourney!
                                </h1><br>
                                <div style="align-items: center; display: flex;">
                                    <ul style="list-style: none; margin: auto;">
                                    <li>✔ Please verify your account by following this <a href="http://${url}/verify?code=${verify_code}">link</a></li>
                                    <li>✔ Your verification code is ${verify_code}
                                    <li>✔ Find a team or create one to get started and join a tourney.</li>
                                    <li>💸 You can win cash prizes by winning Tourneys.</li>
                                    <li>🔥 I hope to see you crush the competition, and most importantly have fun!</li>
                                    </ul>
                                </div>`
                    }
                    mail(email_contents.recipient, email_contents.subject, email_contents.message, email_contents.html);
                    result = {message: "SUCCESS",
                            details: "The user successfully registered."}
                    res.json(result);
                }else {
                    result = {message: "FAIL",
                            details: "A user with that email already exists."}
                    res.json(result);
                }
        }catch (error) {
            console.error(error)
            result = {message: "FAIL"}
            res.json(result);
        }
}

apiKeyPreamble = async function(api_key, req, res){
    try{
        if (await bcrypt.compare(api_key, "$2a$12$KRUCyQFZAY6uIi6HIajK3.djbVgLZwLuWc5JcZw6LBGE5g15HiYJq")){
            console.log('API KEY VERIFIED')
        }else{
            res.json({message: "WRONG"})
        }
    } catch(e) {
        res.json({message: "FAIL"})
    }
}

app.get('/api/:api_key/login', function(req, res){
    apiKeyPreamble(req.params.api_key, req, res);
    verifyLogin(req.body.email, req.body.password, req, res);
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})