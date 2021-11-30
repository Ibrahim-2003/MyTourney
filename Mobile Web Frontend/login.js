// if(process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }

const mysql = require("mysql");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const multer = require('multer');
const request = require('request');
const fs = require('fs');
const path = require('path');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg'];

venue_path = "uploads/venues";
profile_path = "uploads/profiles";
team_path = "uploads/teams";

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

//Location API: https://nominatim.org/release-docs/latest/api/Search/

var add_tourney_error = "";
var authcode;
var registration_error = "";  
var my_user_id = "";

const app = express();
app.set('view-engine', 'ejs');
app.use(express.static(__dirname));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(methodOverride('_method'))

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    //port: "3306",
    password: "password",
    database: "mytourney_db",
    timezone: 'utc'
});

//27.648909,-97.390611
//29.715646, -95.398331

tourney_coords = [29.715646, -95.398331]
home_coords = [27.648909,-97.390611]

function distance(lat1, lon1, lat2, lon2){
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

// console.log(`Distance: ${distance(home_coords[0], home_coords[1], tourney_coords[0], tourney_coords[1]).toFixed(2)}` + " m")

// function getLocation(){
//     if (navigator.geolocation) {
//         return navigator.geolocation.watchPosition(showPosition);
//     }
// }

// function showPosition(position) {
//     current_position = [position.coords.latitude, position.coords.longitude]
//     return current_position
// }

// var current_position = getLocation();

//Connect to database
connection.connect(function(error){
    if (error) throw error
    else console.log("Connected to database successfully")
});

app.get("/register", checkNotAuthenticatedReg, function(req, res){
    res.render('register.ejs', {reg_error: registration_error});
})


app.get("/home", checkAuthenticated, function(req, res){
    let tourneys;
    var coords = [];
    //This allows me to extract mysql query results to use as variable
    getTourneys = function(){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM tourneys", 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    getTourneys()
    .then(function(results){
        sorted_tourneys = SortTourneysByDistance(results)
        console.log(sorted_tourneys)
        let tourney_json = [];
        for(i=0; i<sorted_tourneys.length; i++){
            tourney_json.push(results.filter(element => element.tourneys_id == sorted_tourneys[i]['Id']))
        }
        console.log('FINALLY: ')
        console.log(tourney_json)
        res.render('home.ejs', {tourneys: tourney_json,
                                tourney_path: venue_path+'/'})
    })
    .catch(function(err){
        console.log("Promise rejection error: "+err);
    })

})
app.get("/login", checkNotAuthenticated, function(req, res){
    res.render('login.ejs');
    registration_error = "";
})
app.get("/friends", checkAuthenticated, function(req, res){
    res.render('friends.ejs');
})
app.get("/profile_player", checkAuthenticated, function(req, res){
    res.render('profile_player.ejs');
})
app.get("/host", checkAuthenticated, function(req, res){
    
    if(req.cookies.id){
        console.log(req.cookies.id)
       var search = connection.query("select * from tourney_hosts where users_user_id = ?", parseInt(req.cookies.id), function(error, results, fields){
        console.log(search)
        var res_len;
        if (results != undefined){
            res_len = results.length;
        }else{
            res_len = 0
        }
        if (res_len > 0){
            res.render('host_home.ejs');
        }
        else{
            res.redirect('/host_signup');
        }
    }); 
    }
    
    
})
app.get("/balance", checkAuthenticated, function(req, res){
    res.render('balance.ejs');
})
app.get("/host_signup", checkAuthenticated, function(req, res){
    res.render('host_signup.ejs');
})
app.get("/leaderboard", checkAuthenticated, function(req, res){
    res.render('leaderboard.ejs')
})

app.post("/register_host", encoder, function(req,res){
    var cookie_user_id = req.cookies.id;
    var vals = {
        users_user_id: cookie_user_id
    }

    var query = connection.query('INSERT INTO tourney_hosts SET ?',vals, function (error, results, fields){
        console.log(query);
        console.log('HOST ACCOUNT CREATED AND LINKED TO USER ID: ' + cookie_user_id)
        res.redirect("/host")
    })
})



app.post("/post_listing", upload_venue.single('venue'), encoder, function(req, res){
    const file_name = req.file != null ? req.file.filename : null;
    var cookie_user_id = req.cookies.id;
    console.log("COOKIE USER ID: " + cookie_user_id);
    connection.query("select * from tourney_hosts where users_user_id=?",req.cookies.id, function(error, results, fields){
        var cookie_user_id = req.cookies.id;
        console.log("COOKIE USER ID: " + cookie_user_id);
        console.log("QUERY RESULTS: " + results[0])
        if (results.length > 0){
            console.log("HOST ID: " + results[0].hosts_id)
            var host_id = results[0].hosts_id;
            var team_sizes = req.body.team_size;
            var gender = req.body.gender;
            var age_group = req.body.age_group;
            var name = req.body.tourney_name;
            var zip = req.body.zip;
            var city = req.body.city;
            var street = req.body.street;
            var state = req.body.state;
            var max_participants = req.body.max_participants;
            var entry_fee = req.body.entry_fee;
            var photo = file_name;

            // Convert duration from minutes to milliseconds
            var ms = req.body.duration * 60000
            var duration_time = ms;

            //Duration in ms
            // var duration_time = 600000;

            api_req = "https://nominatim.openstreetmap.org/?addressdetails=1&q=" + street + "%2C+" + zip + "%2C+" + state + "&format=json"
                    
            let url = api_req.replace(/ /g, "+");
            console.log(url)

            request({
                url: url,
                headers: {'User-Agent': 'ibrahim'},
                json: true
            }, (err, response, body) => {
                console.log(response);
                
                if(body[0].lat){
                    console.log('REQUESTS: ' + body[0])
                    add_tourney_error = ""
                    var vals = {
                        team_sizes: team_sizes,
                        gender: gender,
                        age_group: age_group,
                        name: name,
                        city: city,
                        lat_coord: body[0].lat,
                        lon_coord: body[0].lon,
                        duration_time: duration_time,
                        max_participants: max_participants,
                        entry_fee: entry_fee,
                        photo: photo,
                        hosts_hosts_id: host_id,
                        hosts_users_user_id: cookie_user_id,
                        current_participants: 0
                    }
    
                    connection.query('INSERT INTO tourneys SET ?',vals, function (error, results, fields){
                        // console.log(query);
                        console.log(vals);
                        console.log("TOURNEY SUCCESSFULLY CREATED");
                        res.redirect("/host");
                    })
                }else{
                    console.log('ADDRESS INVALID')
                    add_tourney_error = "The address you entered is invalid, please try again with a different address."
                    RemoveVenue(file_name);
                    res.redirect("/add_tourney")
                }
                
            })

        }else{
            console.log("No host with this user id!")
        }
            })

})

function RemoveVenue(venue){
    fs.unlink(path.join(venue_path, venue), err => {
        if (err) console.error(err)
    })
}

app.get("/listing", function(req, res){
    // console.log(req.query)
    id = req.query.tourney_id
    getTourneyById = function(id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM tourneys WHERE tourneys_id=?",
              id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}
    
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

    async function sequentialQueries () {
 
        try{
        const tourney_result = await getTourneyById(id);
        const host_result = await getUserById(tourney_result[0].hosts_users_user_id);
        const user_result = await getUserById(req.cookies.id)

        // console.log(tourney_result)
        // console.log(host_result)
         
        // here you can do something with the three results
        results = {tourney_result: tourney_result,
                host_result: host_result}

        res.render('tourney_details.ejs',
            {id: id,
            tourney: results.tourney_result,
            host: results.host_result,
            user: user_result,
            venue_path: venue_path+'/',
            profile_path: profile_path+'/',
            join_error: null})
         
        } catch(error){
        console.log(error)
        }
        }
    
    sequentialQueries();
    

})

app.get("/add_tourney", checkAuthenticated, function(req, res){
    res.render('add_tourney.ejs', {add_error: add_tourney_error});
})
app.get("/team_player", checkAuthenticated, function(req, res){
    res.render('team_player.ejs');
})

app.get("/", checkAuthenticated, function(req, res){
    let tourneys;
    var coords = [];
    //This allows me to extract mysql query results to use as variable
    getTourneys = function(){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM tourneys", 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    getTourneys()
    .then(function(results){
        sorted_tourneys = SortTourneysByDistance(results)
        console.log(sorted_tourneys)
        let tourney_json = [];
        for(i=0; i<sorted_tourneys.length; i++){
            tourney_json.push(results.filter(element => element.tourneys_id == sorted_tourneys[i]['Id']))
        }
        console.log('FINALLY: ')
        console.log(tourney_json)
        res.render('home.ejs', {tourneys: tourney_json,
                                tourney_path: venue_path+'/'})
    })
    .catch(function(err){
        console.log("Promise rejection error: "+err);
    })
})

//net start MYSQL80
// mysqld --console
//Database (USER TABLE): user_name, user_pass, user_email, user_first, user_gender, age, bio, photo, points, tourneys_played, tourneys_won, tourneys_lost, games_played, games_lost, goals_for, goals_against, shots, saves, shutouts
//Need to add team many-to-many relationship, games_won, and user_last
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'; if nodejs is showing "consider upgrading mysql client"

// Sort by distance function

function SortTourneysByDistance(results){
    var coords = [];
    if (results.length > 0){
        var i;
            for (var i = 0; i < results.length; i++){
            coords.push({Lat: results[i]['lat_coord'], 
                    Lon: results[i]['lon_coord'],
                    Distance: distance(home_coords[0], home_coords[1], results[i]['lat_coord'], results[i]['lon_coord']),
                    Id: results[i]['tourneys_id']})
            // console.log(coords)
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



    // var coords = [];
    // connection.query("select * from tourneys", function(error, results, fields){
    //     if (results.length > 0){
    //         var i;
    //             for (var i = 0; i < results.length; i++){
    //             coords.push({Lat: results[i]['lat_coord'], 
    //                     Lon: results[i]['lon_coord'],
    //                     Distance: distance(home_coords[0], home_coords[1], results[i]['lat_coord'], results[i]['lon_coord']),
    //                     Id: results[i]['tourneys_id']})
    //             // console.log(coords)
    //         }
    //         // console.log(coords)
    //         coords.sort((a,b) => {
    //             return a.Distance - b.Distance
    //         })
    //         console.log(coords)
    //         return coords
    //         // console.log(coords)
    //     }else {
    //         console.log("NO TOURNEYS")
    //     }
    // })


app.post("/login",encoder, function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    console.log(password);
    connection.query("select * from users where user_email = ?",[email, password], function(error, results, fields){
        console.log(results);
        if (results.length > 0){
            if (bcrypt.compare(password, results[0].user_pass)){
                authcode = true;
                my_user_id = results[0].user_id;
                res.clearCookie('id')
                res.cookie('id', my_user_id);
                console.log(req.cookies.id)
                res.redirect("/home");
            }
        }else {
            res.redirect("/login");
        }
        res.end();
    })
})

app.post("/join",encoder,checkAuthenticated, function(req, res){
    var tourney_id = req.query.id;
    var user_id = req.cookies.id;
    var id = req.query.id

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

    getTourneyById = function(id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM tourneys WHERE tourneys_id=?",
              id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    getTeamOfUser = function(user_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM users WHERE team_id != NULL",
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

    async function runQueries(){
        try {
            const user_results = await getUserById(user_id);
            const tourney_results = await getTourneyById(tourney_id);
            const host_results = await getUserById(tourney_results[0].hosts_users_user_id);
            const team_results = await getTeamOfUser(user_id);

            if(team_results.length <= 0){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'YOU CANNOT JOIN WITHOUT A TEAM! PLEASE CREATE A TEAM OR JOIN A TEAM TO ENTER A TOURNAMENT!'})
            }else if(user_results[0].balance < tourney_results[0].entry_fee){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'INSUFFICIENT FUNDS! PLEASE ADD FUNDS AND TRY AGAIN!'})
            }else if(tourney_results[0].current_participants == tourney_results[0].max_participants){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'TEAM QUOTA REACHED! PLEASE TRY JOINING A DIFFERENT TOURNEY!'})
            }else{
                res.redirect('/home')
            }
        } catch (error) {
            console.error(error)
        }
    }

    runQueries()


})

//When login is success
app.get("/home", checkAuthenticated, function(req, res){
    res.render('home.ejs');
})


app.post("/register", async function(req,res){
    var email = req.body.email;
    var username = req.body.username;
    var first = req.body.first;
    var last = req.body.last;
    var birth = req.body.birthdate;
    // var element = document.getElementById("gender");
    // var gender = element.value;
    var gender = req.body.gender;
    try {
        var password = await bcrypt.hash(req.body.password, 10);

        var vals = {user_name: username,
            user_pass: password,
            user_email: email,
            user_first: first,
            user_last: last,
            user_gender: gender,
            age: birth,
            balance: 0.00,
            points: 0};

        //Columns: "user_name", "user_pass", "user_email", "user_first", "user_last", "user_gender", "age", "bio", "photo", "points", "tourneys_played", "tourneys_won", "tourneys_lost", "games_played", "games_won", "games_lost", "goals_for", "goals_against", "shots", "saves", "shutouts"
        var query = connection.query('INSERT INTO users SET ?',vals, function (error, results, fields){
            console.log(query);
            console.log(vals);
            
        })
        connection.query("select * from users where user_email = ? and user_pass = ?",[email, password], function(error, results, fields){
            if (results.length > 0){
                console.log("USER REGISTERED");
                authcode = true;
                my_user_id = results[0].user_id;
                //Expires after 1800000 ms (30 minutes) from the time it is set.
                res.cookie('id', my_user_id, {expire: 1800000 + Date.now()});
                registration_error = ""
                res.redirect("/home");
            }else {
                registration_error = "A USER WITH THAT EMAIL ALREADY EXISTS"
                res.redirect("/register");
            }
            res.end();
        })
    } catch{
        console.log("CATCH")
        res.redirect("/register");
    }
})


app.get('/logout', (req, res)=>{
    authcode = false;
    res.clearCookie('id');
    res.cookie('id', -1);
    console.log(req.cookies.id);
    res.redirect('/login');
})

function checkAuthenticated(req, res, next){
    if (authcode || req.cookies.id > 0){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if (authcode || req.cookies.id > 0){
        return res.redirect('/home')
    }
    next()
}
function checkNotAuthenticatedReg(req, res, next){
    if (authcode || req.cookies.id > 0){
        return res.redirect('/home')
    }
    next()
}




//16:31
//'168.5.180.127' || 'localhost'
// Start mysql server windows: "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld" --console
// Start mysql server mac: sudo /usr/local/mysql/support-files/mysql.server start
app.listen(4500);