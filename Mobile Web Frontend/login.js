// if(process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }

//NOTE: NEED NODE VERSION 16 TO WORK (brew install node@16)

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
const email_js = require('./email.js');
const { join, resolve } = require("path");
const { start } = require("repl");
const QRCode = require("qrcode");
const e = require("express");

const port = 5000;
const url = 'www.winmytourney.com';

const mail = email_js.email;

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
    password: "mytOUrnEysql2003$",
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
    else console.log(`Connected to database successfully. Open port ${port}`);
});

app.get("/register", checkNotAuthenticatedReg, function(req, res){
    res.render('register.ejs', {reg_error: registration_error});
})


app.get("/home", checkAuthenticated, function(req, res){
    let tourneys;
    
    if(req.query.lat && req.query.lon){
        home_coords = [req.query.lat, req.query.lon];
        req.cookies.coords = home_coords;
        // console.log('Dynamic Lat: ' + req.query.lat);
    }else if(req.cookies.coords){
        home_coords = req.cookies.coords
    }else{
        home_coords = [27.648909,-97.390611];
    }
    //This allows me to extract mysql query results to use as variable
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

    getTourneys()
    .then(function(results){
        sorted_tourneys = SortTourneysByDistance(results)
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

    const user_id = req.cookies.id;

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

    async function runQuery(user_id){
        try {
            const results = await getUserById(user_id);
            res.render('profile_player.ejs', {user: results,
                                                profile_path: profile_path});
        } catch (error) {
            console.error(error)
        }
        
    }

    runQuery(user_id);
})


app.get("/host", checkAuthenticated, function(req, res){
    var user_id = req.cookies.id

    checkHost = function(user_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM tourney_hosts WHERE users_user_id = ?",
                user_id,
                function(err,rows){
                    if(rows === undefined){
                        reject(false)
                    }else{
                        resolve(rows)
                    }
                }
            )
        })
    }
    
    getHostedTourneys = function(user_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM tourneys WHERE (hosts_users_user_id = ? && status != 'ended')",
                user_id,
                function(err,rows){
                    if(rows === undefined){
                        reject(new Error("Error rows undefined getHostedTourneys"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    async function runQuery(user_id){
        try {
            var check = await checkHost;
            if(check == false){
                res.redirect('/host_signup');
            }else{
                var tourneys = await getHostedTourneys(user_id);
                // console.log(tourneys[0])
                res.render('host_home.ejs', {
                    tourneys: tourneys,
                    tourney_path: venue_path+'/'
                })
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    runQuery(user_id);
    
})
app.get("/balance", checkAuthenticated, function(req, res){
    const user_id = req.cookies.id;

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

    async function runQuery(user_id){
        try {
            const results = await getUserById(user_id);
            res.render('balance.ejs', {user: results});
        } catch (error) {
            console.error(error)
        }
        
    }

    runQuery(user_id);
})
app.get("/host_signup", checkAuthenticated, function(req, res){
    res.render('host_signup.ejs');
})


app.get("/leaderboard", checkAuthenticated, function(req, res){
    const selection = req.query.selection;
    const search_low = parseInt(req.query.rankings_from);
    const search_high = parseInt(req.query.rankings_to);
    const search_amount = parseInt(search_high - search_low + 1);

    function rankByPoints(selection, lower, amount){
        return new Promise(function(resolve, reject){
            if(selection == 'teams'){
                connection.query(
                    'SELECT * FROM ' + selection + ' ORDER BY team_points DESC LIMIT ' + lower + ',' + amount,
                    function(err, rows){                                                
                        if(rows === undefined){
                            reject(new Error("Error rows is undefined"));
                      }else{
                            resolve(rows);
                      }
                  }
              )}
            else{
                connection.query(
                    'SELECT * FROM ' + selection + ' ORDER BY points DESC LIMIT ' + lower + ',' + amount,
                    function(err, rows){                                                
                        if(rows === undefined){
                            reject(new Error("Error rows is undefined"));
                      }else{
                            resolve(rows);
                      }
                  }
              )}
            }
            
        )}

        function allResults(selection){
            return new Promise(function(resolve, reject){
                if(selection == 'teams'){
                    connection.query(
                        'SELECT * FROM ' + selection,
                        function(err, rows){                                                
                            if(rows === undefined){
                                reject(new Error("Error rows is undefined"));
                          }else{
                                resolve(rows);
                          }
                      }
                  )}
                else{
                    connection.query(
                        'SELECT * FROM ' + selection,
                        function(err, rows){                                                
                            if(rows === undefined){
                                reject(new Error("Error rows is undefined"));
                          }else{
                                resolve(rows);
                          }
                      }
                  )}
                }
                
            )}
    
    async function runQuery(selection, lower, amount){
        try {
            const ranked_results = await rankByPoints(selection,  lower, amount)
            const all = await allResults(selection)
            const total_num = all.length
            const indexer = []
            if(search_low > 0){
                for (i=search_low-1; i<search_high; i++){
                    indexer.push(i)
                }
            }else{
                for (i=search_low; i<search_high; i++){
                    indexer.push(i)
                }
            }
            
            // console.log(indexer)
            // console.log(ranked_results)
            res.render('leaderboard.ejs', {results: ranked_results,
                                            option: selection,
                                            search_amount: search_amount,
                                            search_high: search_high,
                                            search_low: search_low,
                                            indexer: indexer,
                                            profile_path: profile_path,
                                            team_path: team_path,
                                            total_num: total_num})
        } catch (error) {
            console.error(error)
            res.redirect('/')
        }
    }

    runQuery(selection, search_low, search_amount);
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

app.get('/manage', encoder, function(req, res){
    var tourney_id = req.query.id;
    var host_user_id = req.cookies.id;
    var teams;

    getTeamInfo = function(sql_search){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM teams WHERE " +
                sql_search, 
                function(err, rows){                                                
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                  }else{
                        resolve(rows);
                }
            }
        )}
    )}

    function generateSQLSearch(team_ids){
        if(team_ids != undefined){
            var sql_search;
            sql_search = '('
            for(var i=0; i < team_ids.length; i++){
                if(i==team_ids.length-1){
                    sql_search = sql_search + `teams_id = ${team_ids[i]})`
                }else{
                    sql_search = sql_search + `teams_id = ${team_ids[i]} || `
                }
            }
            return sql_search;
        }else{
            console.log('NOT ENOUGH TEAMS')
        }
    }

    function addTBD(rows){
        var TBD = []
        if(rows.length == 0){
            TBD.push(0);
            TBD.push(0);
            return TBD;
        }else if(rows.length == 1){
            TBD.push(rows[0]);
            TBD.push(0);
            return TBD;
        }else{
            return rows;
        }
    }

    async function blastThem(){
        var team_count = req.query.team_count;
        var matches;
        if(team_count != undefined){
            switch(parseInt(team_count)){
                case 6:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var s1_rows = await getTeamInfo(generateSQLSearch(s1));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 7:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 8:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 9:
                    var p1 = req.query.p1.split('-');
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var p1_rows = await getTeamInfo(generateSQLSearch(p1));
                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = addTBD(await getTeamInfo(generateSQLSearch(g4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        p1: p1_rows,
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 10:
                    var p1 = req.query.p1.split('-');
                    var p2 = req.query.p2.split('-');
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var p1_rows = await getTeamInfo(generateSQLSearch(p1));
                    var p2_rows = await getTeamInfo(generateSQLSearch(p2));
                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = addTBD(await getTeamInfo(generateSQLSearch(g3)));
                    var g4_rows = addTBD(await getTeamInfo(generateSQLSearch(g4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        p1: p1_rows,
                        p2: p2_rows,
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 11:
                    var p1 = req.query.p1.split('-');
                    var p2 = req.query.p2.split('-');
                    var p3 = req.query.p3.split('-');
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var p1_rows = await getTeamInfo(generateSQLSearch(p1));
                    var p2_rows = await getTeamInfo(generateSQLSearch(p2));
                    var p3_rows = await getTeamInfo(generateSQLSearch(p3));
                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = addTBD(await getTeamInfo(generateSQLSearch(g2)));
                    var g3_rows = addTBD(await getTeamInfo(generateSQLSearch(g3)));
                    var g4_rows = addTBD(await getTeamInfo(generateSQLSearch(g4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        p1: p1_rows,
                        p2: p2_rows,
                        p3: p3_rows,
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 12:
                    var p1 = req.query.p1.split('-');
                    var p2 = req.query.p2.split('-');
                    var p3 = req.query.p3.split('-');
                    var p4 = req.query.p4.split('-');
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var p1_rows = await getTeamInfo(generateSQLSearch(p1));
                    var p2_rows = await getTeamInfo(generateSQLSearch(p2));
                    var p3_rows = await getTeamInfo(generateSQLSearch(p3));
                    var p4_rows = await getTeamInfo(generateSQLSearch(p4));
                    var g1_rows = addTBD(await getTeamInfo(generateSQLSearch(g1)));
                    var g2_rows = addTBD(await getTeamInfo(generateSQLSearch(g2)));
                    var g3_rows = addTBD(await getTeamInfo(generateSQLSearch(g3)));
                    var g4_rows = addTBD(await getTeamInfo(generateSQLSearch(g4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        p1: p1_rows,
                        p2: p2_rows,
                        p3: p3_rows,
                        p4: p4_rows,
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 13:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var g5 = req.query.g5.split('-');
                    var q1 = req.query.q1.split('-');
                    var q2 = req.query.q2.split('-');
                    var q3 = req.query.q3.split('-');
                    var q4 = req.query.q4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var g5_rows = await getTeamInfo(generateSQLSearch(g5));
                    var q1_rows = addTBD(await getTeamInfo(generateSQLSearch(q1)));
                    var q2_rows = addTBD(await getTeamInfo(generateSQLSearch(q2)));
                    var q3_rows = addTBD(await getTeamInfo(generateSQLSearch(q3)));
                    var q4_rows = addTBD(await getTeamInfo(generateSQLSearch(q4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        g5: g5_rows,
                        q1: q1_rows,
                        q2: q2_rows,
                        q3: q3_rows,
                        q4: q4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 14:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var g5 = req.query.g5.split('-');
                    var g6 = req.query.g6.split('-');
                    var q1 = req.query.q1.split('-');
                    var q2 = req.query.q2.split('-');
                    var q3 = req.query.q3.split('-');
                    var q4 = req.query.q4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var g5_rows = await getTeamInfo(generateSQLSearch(g5));
                    var g6_rows = await getTeamInfo(generateSQLSearch(g6));
                    var q1_rows = addTBD(await getTeamInfo(generateSQLSearch(q1)));
                    var q2_rows = addTBD(await getTeamInfo(generateSQLSearch(q2)));
                    var q3_rows = addTBD(await getTeamInfo(generateSQLSearch(q3)));
                    var q4_rows = addTBD(await getTeamInfo(generateSQLSearch(q4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        g5: g5_rows,
                        g6: g6_rows,
                        q1: q1_rows,
                        q2: q2_rows,
                        q3: q3_rows,
                        q4: q4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 15:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var g5 = req.query.g5.split('-');
                    var g6 = req.query.g6.split('-');
                    var g7 = req.query.g7.split('-');
                    var q1 = req.query.q1.split('-');
                    var q2 = req.query.q2.split('-');
                    var q3 = req.query.q3.split('-');
                    var q4 = req.query.q4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var g5_rows = await getTeamInfo(generateSQLSearch(g5));
                    var g6_rows = await getTeamInfo(generateSQLSearch(g6));
                    var g7_rows = await getTeamInfo(generateSQLSearch(g7));
                    var q1_rows = addTBD(await getTeamInfo(generateSQLSearch(q1)));
                    var q2_rows = addTBD(await getTeamInfo(generateSQLSearch(q2)));
                    var q3_rows = addTBD(await getTeamInfo(generateSQLSearch(q3)));
                    var q4_rows = addTBD(await getTeamInfo(generateSQLSearch(q4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        g5: g5_rows,
                        g6: g6_rows,
                        g7: g7_rows,
                        q1: q1_rows,
                        q2: q2_rows,
                        q3: q3_rows,
                        q4: q4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 16:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var g5 = req.query.g5.split('-');
                    var g6 = req.query.g6.split('-');
                    var g7 = req.query.g7.split('-');
                    var g8 = req.query.g8.split('-');
                    var q1 = req.query.q1.split('-');
                    var q2 = req.query.q2.split('-');
                    var q3 = req.query.q3.split('-');
                    var q4 = req.query.q4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var g5_rows = await getTeamInfo(generateSQLSearch(g5));
                    var g6_rows = await getTeamInfo(generateSQLSearch(g6));
                    var g7_rows = await getTeamInfo(generateSQLSearch(g7));
                    var g8_rows = await getTeamInfo(generateSQLSearch(g8));
                    var q1_rows = addTBD(await getTeamInfo(generateSQLSearch(q1)));
                    var q2_rows = addTBD(await getTeamInfo(generateSQLSearch(q2)));
                    var q3_rows = addTBD(await getTeamInfo(generateSQLSearch(q3)));
                    var q4_rows = addTBD(await getTeamInfo(generateSQLSearch(q4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        g5: g5_rows,
                        g6: g6_rows,
                        g7: g7_rows,
                        g8: g8_rows,
                        q1: q1_rows,
                        q2: q2_rows,
                        q3: q3_rows,
                        q4: q4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                default:
                    res.render('manage_tourney.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: 0,
                        matches: 0
                    })
                    break;
            }
        }else{
            res.render('manage_tourney.ejs',{
                tourney: tourney_id,
                host: host_user_id,
                team_count: 0,
                matches: 0
            })
        }
    }

    blastThem();
})

app.get('/summary', encoder, function(req, res){
    var tourney_id = req.query.id;
    var host_user_id = req.query.host_id;
    var winner = req.query.winner;
    var teams;

    getTeamInfo = function(sql_search){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM teams WHERE " +
                sql_search, 
                function(err, rows){                                                
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                  }else{
                        resolve(rows);
                }
            }
        )}
    )}

    function generateSQLSearch(team_ids){
        if(team_ids != undefined){
            var sql_search;
            sql_search = '('
            for(var i=0; i < team_ids.length; i++){
                if(i==team_ids.length-1){
                    sql_search = sql_search + `teams_id = ${team_ids[i]})`
                }else{
                    sql_search = sql_search + `teams_id = ${team_ids[i]} || `
                }
            }
            return sql_search;
        }else{
            console.log('NOT ENOUGH TEAMS')
        }
    }

    function addTBD(rows){
        var TBD = []
        if(rows.length == 0){
            TBD.push(0);
            TBD.push(0);
            return TBD;
        }else if(rows.length == 1){
            TBD.push(rows[0]);
            TBD.push(0);
            return TBD;
        }else{
            return rows;
        }
    }

    async function blastThem(){
        var team_count = req.query.team_count;
        var matches;
        if(team_count != undefined){
            switch(parseInt(team_count)){
                case 6:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var s1_rows = await getTeamInfo(generateSQLSearch(s1));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`teams_id = ${winner}`);

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 7:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 8:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 9:
                    var p1 = req.query.p1.split('-');
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var p1_rows = await getTeamInfo(generateSQLSearch(p1));
                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = addTBD(await getTeamInfo(generateSQLSearch(g4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        p1: p1_rows,
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 10:
                    var p1 = req.query.p1.split('-');
                    var p2 = req.query.p2.split('-');
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var p1_rows = await getTeamInfo(generateSQLSearch(p1));
                    var p2_rows = await getTeamInfo(generateSQLSearch(p2));
                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = addTBD(await getTeamInfo(generateSQLSearch(g3)));
                    var g4_rows = addTBD(await getTeamInfo(generateSQLSearch(g4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        p1: p1_rows,
                        p2: p2_rows,
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 11:
                    var p1 = req.query.p1.split('-');
                    var p2 = req.query.p2.split('-');
                    var p3 = req.query.p3.split('-');
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var p1_rows = await getTeamInfo(generateSQLSearch(p1));
                    var p2_rows = await getTeamInfo(generateSQLSearch(p2));
                    var p3_rows = await getTeamInfo(generateSQLSearch(p3));
                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = addTBD(await getTeamInfo(generateSQLSearch(g2)));
                    var g3_rows = addTBD(await getTeamInfo(generateSQLSearch(g3)));
                    var g4_rows = addTBD(await getTeamInfo(generateSQLSearch(g4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        p1: p1_rows,
                        p2: p2_rows,
                        p3: p3_rows,
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 12:
                    var p1 = req.query.p1.split('-');
                    var p2 = req.query.p2.split('-');
                    var p3 = req.query.p3.split('-');
                    var p4 = req.query.p4.split('-');
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var p1_rows = await getTeamInfo(generateSQLSearch(p1));
                    var p2_rows = await getTeamInfo(generateSQLSearch(p2));
                    var p3_rows = await getTeamInfo(generateSQLSearch(p3));
                    var p4_rows = await getTeamInfo(generateSQLSearch(p4));
                    var g1_rows = addTBD(await getTeamInfo(generateSQLSearch(g1)));
                    var g2_rows = addTBD(await getTeamInfo(generateSQLSearch(g2)));
                    var g3_rows = addTBD(await getTeamInfo(generateSQLSearch(g3)));
                    var g4_rows = addTBD(await getTeamInfo(generateSQLSearch(g4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        p1: p1_rows,
                        p2: p2_rows,
                        p3: p3_rows,
                        p4: p4_rows,
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 13:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var g5 = req.query.g5.split('-');
                    var q1 = req.query.q1.split('-');
                    var q2 = req.query.q2.split('-');
                    var q3 = req.query.q3.split('-');
                    var q4 = req.query.q4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var g5_rows = await getTeamInfo(generateSQLSearch(g5));
                    var q1_rows = addTBD(await getTeamInfo(generateSQLSearch(q1)));
                    var q2_rows = addTBD(await getTeamInfo(generateSQLSearch(q2)));
                    var q3_rows = addTBD(await getTeamInfo(generateSQLSearch(q3)));
                    var q4_rows = addTBD(await getTeamInfo(generateSQLSearch(q4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        g5: g5_rows,
                        q1: q1_rows,
                        q2: q2_rows,
                        q3: q3_rows,
                        q4: q4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 14:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var g5 = req.query.g5.split('-');
                    var g6 = req.query.g6.split('-');
                    var q1 = req.query.q1.split('-');
                    var q2 = req.query.q2.split('-');
                    var q3 = req.query.q3.split('-');
                    var q4 = req.query.q4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var g5_rows = await getTeamInfo(generateSQLSearch(g5));
                    var g6_rows = await getTeamInfo(generateSQLSearch(g6));
                    var q1_rows = addTBD(await getTeamInfo(generateSQLSearch(q1)));
                    var q2_rows = addTBD(await getTeamInfo(generateSQLSearch(q2)));
                    var q3_rows = addTBD(await getTeamInfo(generateSQLSearch(q3)));
                    var q4_rows = addTBD(await getTeamInfo(generateSQLSearch(q4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        g5: g5_rows,
                        g6: g6_rows,
                        q1: q1_rows,
                        q2: q2_rows,
                        q3: q3_rows,
                        q4: q4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 15:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var g5 = req.query.g5.split('-');
                    var g6 = req.query.g6.split('-');
                    var g7 = req.query.g7.split('-');
                    var q1 = req.query.q1.split('-');
                    var q2 = req.query.q2.split('-');
                    var q3 = req.query.q3.split('-');
                    var q4 = req.query.q4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var g5_rows = await getTeamInfo(generateSQLSearch(g5));
                    var g6_rows = await getTeamInfo(generateSQLSearch(g6));
                    var g7_rows = await getTeamInfo(generateSQLSearch(g7));
                    var q1_rows = addTBD(await getTeamInfo(generateSQLSearch(q1)));
                    var q2_rows = addTBD(await getTeamInfo(generateSQLSearch(q2)));
                    var q3_rows = addTBD(await getTeamInfo(generateSQLSearch(q3)));
                    var q4_rows = addTBD(await getTeamInfo(generateSQLSearch(q4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        g5: g5_rows,
                        g6: g6_rows,
                        g7: g7_rows,
                        q1: q1_rows,
                        q2: q2_rows,
                        q3: q3_rows,
                        q4: q4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                case 16:
                    var g1 = req.query.g1.split('-');
                    var g2 = req.query.g2.split('-');
                    var g3 = req.query.g3.split('-');
                    var g4 = req.query.g4.split('-');
                    var g5 = req.query.g5.split('-');
                    var g6 = req.query.g6.split('-');
                    var g7 = req.query.g7.split('-');
                    var g8 = req.query.g8.split('-');
                    var q1 = req.query.q1.split('-');
                    var q2 = req.query.q2.split('-');
                    var q3 = req.query.q3.split('-');
                    var q4 = req.query.q4.split('-');
                    var s1 = req.query.s1.split('-');
                    var s2 = req.query.s2.split('-');
                    var f = req.query.f.split('-');

                    var g1_rows = await getTeamInfo(generateSQLSearch(g1));
                    var g2_rows = await getTeamInfo(generateSQLSearch(g2));
                    var g3_rows = await getTeamInfo(generateSQLSearch(g3));
                    var g4_rows = await getTeamInfo(generateSQLSearch(g4));
                    var g5_rows = await getTeamInfo(generateSQLSearch(g5));
                    var g6_rows = await getTeamInfo(generateSQLSearch(g6));
                    var g7_rows = await getTeamInfo(generateSQLSearch(g7));
                    var g8_rows = await getTeamInfo(generateSQLSearch(g8));
                    var q1_rows = addTBD(await getTeamInfo(generateSQLSearch(q1)));
                    var q2_rows = addTBD(await getTeamInfo(generateSQLSearch(q2)));
                    var q3_rows = addTBD(await getTeamInfo(generateSQLSearch(q3)));
                    var q4_rows = addTBD(await getTeamInfo(generateSQLSearch(q4)));
                    var s1_rows = addTBD(await getTeamInfo(generateSQLSearch(s1)));
                    var s2_rows = addTBD(await getTeamInfo(generateSQLSearch(s2)));
                    var f_rows = addTBD(await getTeamInfo(generateSQLSearch(f)));
                    var winning_team = await getTeamInfo(`WHERE teams_id = ${winner}`);

                    matches = {
                        g1: g1_rows,
                        g2: g2_rows,
                        g3: g3_rows,
                        g4: g4_rows,
                        g5: g5_rows,
                        g6: g6_rows,
                        g7: g7_rows,
                        g8: g8_rows,
                        q1: q1_rows,
                        q2: q2_rows,
                        q3: q3_rows,
                        q4: q4_rows,
                        s1: s1_rows,
                        s2: s2_rows,
                        f: f_rows
                    }
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: team_count,
                        matches: matches,
                        team_path: team_path,
                        winner: winning_team[0]
                        // NOTE: FOR MATCHES, CALL THE TEAM LIKE matches[0].team_name and matches[1].team_name
                    })
                    break;
                default:
                    res.render('summary.ejs',{
                        tourney: tourney_id,
                        host: host_user_id,
                        team_count: 0,
                        matches: 0,
                        winning_team: 0
                    })
                    break;
            }
        }else{
            res.render('summary.ejs',{
                tourney: tourney_id,
                host: host_user_id,
                team_count: 0,
                matches: 0,
                winning_team: 0
            })
        }
    }

    blastThem();
})

app.get('/match',encoder, function(req,res){
    var tourney_id = req.query.id;
    var match_type = req.query.code;
    var team1_id = req.query.team1;
    var team2_id = req.query.team2;

    getTeamById = function(team_id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM teams WHERE teams_id=?",
              team_id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    checkMatchmaking = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM matchmaking WHERE tourney_id=?",
                tourney_id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        resolve(false);
                  }else if(rows != undefined){
                        resolve(rows);
                  }else{
                      reject(new Error('Error blow up checkMAtchmaking'))
                  }
              }
          )}
        )}

        function getQueryVariable(q,variable) {
            var query = q.substring(1)
            var vars = query.split('&')
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=')
                if (decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1])
                }
            }
            return 0;
        }

    async function runQueries(team1, team2){
        try {
            teams = []
            teams.push(await getTeamById(team1));
            teams.push(await getTeamById(team2));
            // console.log(teams);
            stored_query = await checkMatchmaking(tourney_id);
            get_expected_query = getQueryVariable(stored_query[0].tourney_query, match_type);
            if(get_expected_query != `${team1}-${team2}`){
                console.log('CODES DO NOT MATCH');
                res.redirect(`/manage?id=${tourney_id}${stored_query[0].tourney_query}`);
            }else{
                console.log('CODES MATCH');
                res.render('match_score.ejs',{
                    teams: teams,
                    team_path: team_path
                })
            }
        } catch (e) {
            console.error(e);
        }
    }

    runQueries(team1_id, team2_id);
})

app.post("/post_listing", upload_venue.single('venue'), encoder, function(req, res){
    const file_name = req.file != null ? req.file.filename : null;
    var cookie_user_id = req.cookies.id;
    console.log("COOKIE USER ID: " + cookie_user_id);
    connection.query("select * from tourney_hosts where users_user_id=?",req.cookies.id, function(error, results, fields){
        var cookie_user_id = req.cookies.id;
        console.log("COOKIE USER ID: " + cookie_user_id);
        // console.log("QUERY RESULTS: " + results[0])
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
            var date = new Date(req.body.start_time);
            var start_time = date;
            console.log(start_time)

            // Convert duration from minutes to milliseconds
            var ms = req.body.duration * 60000
            var duration_time = ms;

            //Duration in ms
            // var duration_time = 600000;

            api_req = "https://nominatim.openstreetmap.org/?addressdetails=1&q=" + street + "%2C+" + zip + "%2C+" + state + "&format=json"
                    
            let url = api_req.replace(/ /g, "+");
            // console.log(url)

            request({
                url: url,
                headers: {'User-Agent': 'ibrahim'},
                json: true
            }, (err, response, body) => {
                // console.log(response);
                
                if(body[0].lat){
                    // console.log('REQUESTS: ' + body[0])
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
                        current_participants: 0,
                        start_time: start_time
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

    getTeamInfo = function(team_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM teams WHERE teams_id=?",
                team_id, 
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
        const user_result = await getUserById(req.cookies.id);
        if(user_result[0].team_id > 0){
            const team_result = await getTeamInfo(user_result[0].team_id)
            results = {tourney_result: tourney_result,
                host_result: host_result}

            res.render('tourney_details.ejs',
                {id: id,
                tourney: results.tourney_result,
                host: results.host_result,
                user: user_result,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: null,
                team: team_result,
                url: url})
        }else{
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
                join_error: null,
                team: null,
                url: url})
        }
         
        } catch(error){
        console.log(error)
        }
        }
    
    sequentialQueries();
    

})

app.get("/host_listing", function(req, res){
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

    getJoinedTeamIds = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM teams_entered_in_tourney WHERE tourneys_tourneys_id=?",
                tourney_id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                  }else{
                        resolve(rows);
                  }
              }
          )}
        )}

    getTeamInfo = function(team_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM teams WHERE teams_id=?",
                team_id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined getTeamInfo"));
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

    checkMatchmaking = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM matchmaking WHERE tourney_id=?",
                tourney_id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        resolve(false);
                  }else if(rows != undefined){
                        resolve(rows);
                  }else{
                      reject(new Error('Error blow up checkMAtchmaking'))
                  }
              }
          )}
        )}

    function randomNoRepeats(array) {
        var copy = array.slice(0);
        return function() {
          if (copy.length < 1) { copy = array.slice(0); }
          var index = Math.floor(Math.random() * copy.length);
          var item = copy[index];
          copy.splice(index, 1);
          return item;
        };
    }

    saveQuery = function(tourney_id, query){
        var vals = {
            tourney_query: query,
            tourney_id: tourney_id
        }
        return new Promise(function(resolve, reject){
            connection.query(
                "INSERT INTO matchmaking SET ?",
                vals, 
                function(err, rows){                                                
                    if(rows === undefined){
                        resolve(false);
                  }else if(rows != undefined){
                        resolve(rows);
                  }else{
                      reject(new Error('Error blow up saveQuery'))
                  }
              }
          )}
        )}

    
    function matchmaking(teams){
        return new Promise(function(resolve, reject){
            var chosen_teams = [];
            var chooser = randomNoRepeats(teams);
            for(team of teams){
                chosen_teams.push(chooser());
            }
            if(chosen_teams != null){
                resolve(chosen_teams);
            }else{
                reject(new Error("Error chosen_teams null"))
            }
        })
        
    }

    updateStatus = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE tourneys SET status='in-progress' WHERE tourneys_id=?",
                tourney_id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        resolve(false);
                  }else if(rows != undefined){
                        resolve(rows);
                  }else{
                      reject(new Error('Error blow up saveQuery'))
                  }
              }
          )}
        )}

    async function sequentialQueries () {
 
        try{
            const tourney_result = await getTourneyById(id);
            const host_result = await getUserById(tourney_result[0].hosts_users_user_id);
            const teams_entered = await getJoinedTeamIds(id);
            var teams = [];
            for(var team of teams_entered){
                var team = await getTeamInfo(team.teams_teams_id);
                teams.push(team)
            }

            var team_count = teams.length;

            var query;
            var ch = false;
            if(team_count > 0){
                ch = await checkMatchmaking(id);
            }

            if(ch != false){
                console.log("TOURNEY ALREADY GENERATED!")
                query = ch[0].tourney_query;
            }else{
                var matchedteams = await matchmaking(teams);
                var matchids = []
                for(match of matchedteams){
                    matchids.push(match[0].teams_id);
                }
                switch(team_count){
                    case 6:
                        query = `&gen=1&team_count=6&g1=${matchids[0]}-${matchids[1]}&g2=${matchids[2]}-${matchids[3]}&s1=${matchids[4]}-${matchids[5]}`+
                                `&s2=0-0&f=0-0`;
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 7:
                        query = `&gen=1&team_count=7&g1=${matchids[0]}-${matchids[1]}&g2=${matchids[2]}-${matchids[3]}&g3=${matchids[4]}-${matchids[5]}`+
                                `&s1=${matchids[6]}-0&s2=0-0&f=0-0`;
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 8:
                        query = `&gen=1&team_count=8&g1=${matchids[0]}-${matchids[1]}&g2=${matchids[2]}-${matchids[3]}&g3=${matchids[4]}-${matchids[5]}`+
                                `&g4=${matchids[6]}-${matchids[7]}&s1=0-0&s2=0-0&f=0-0`;
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 9:
                        query = `&gen=1&team_count=9&p1=${matchids[0]}-${matchids[1]}&g1=${matchids[2]}-${matchids[3]}&g2=${matchids[4]}-${matchids[5]}&g3=${matchids[6]}-${matchids[7]}`+
                                `&g4=${matchids[8]}-0&s1=0-0&s2=0-0&f=0-0`;
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 10:
                        query = `&gen=1&team_count=10&p1=${matchids[0]}-${matchids[1]}&p2=${matchids[2]}-${matchids[3]}&g1=${matchids[4]}-${matchids[5]}`+
                                `&g2=${matchids[6]}-${matchids[7]}&g3=${matchids[8]}-0&g4=${matchids[9]}-0&s1=0-0&s2=0-0&f=0-0`
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 11:
                        query = `&gen=1&team_count=11&p1=${matchids[0]}-${matchids[1]}&p2=${matchids[2]}-${matchids[3]}`+
                                `&p3=${matchids[4]}-${matchids[5]}&g1=${matchids[6]}-${matchids[7]}`+
                                `&g2=${matchids[8]}-0&g3=${matchids[9]}-0&g4=${matchids[10]}&s1=0-0&s2=0-0&f=0-0`
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 12:
                        query = `&gen=1&team_count=12&p1=${matchids[0]}-${matchids[1]}&p2=${matchids[2]}-${matchids[3]}`+
                                `&p3=${matchids[4]}-${matchids[5]}&p4=${matchids[6]}-${matchids[7]}`+
                                `&g1=${matchids[8]}-0&g2=${matchids[9]}-0&g3=${matchids[10]}&g4=${matchids[11]}-0&s1=0-0&s2=0-0&f=0-0`
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 13:
                        query = `&gen=1&team_count=13&g1=${matchids[0]}-${matchids[1]}&g2=${matchids[2]}-${matchids[3]}`+
                                `&g3=${matchids[4]}-${matchids[5]}&g4=${matchids[6]}-${matchids[7]}`+
                                `&g5=${matchids[8]}-${matchids[9]}&q1=${matchids[10]}-0&q2=${matchids[11]}-0&q3=${matchids[12]}-0`+
                                `&q4=0-0&s1=0-0&s2=0-0&f=0-0`
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 14:
                        query = `&gen=1&team_count=14&g1=${matchids[0]}-${matchids[1]}&g2=${matchids[2]}-${matchids[3]}`+
                                `&g3=${matchids[4]}-${matchids[5]}&g4=${matchids[6]}-${matchids[7]}`+
                                `&g5=${matchids[8]}-${matchids[9]}&g6=${matchids[10]}-${matchids[11]}`+
                                `&q1=${matchids[12]}-0&q2=${matchids[13]}-0&q3=0-0&q4=0-0&s1=0-0&s2=0-0&f=0-0`
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 15:
                        query = `&gen=1&team_count=15&g1=${matchids[0]}-${matchids[1]}&g2=${matchids[2]}-${matchids[3]}`+
                                `&g3=${matchids[4]}-${matchids[5]}&g4=${matchids[6]}-${matchids[7]}`+
                                `&g5=${matchids[8]}-${matchids[9]}&g6=${matchids[10]}-${matchids[11]}`+
                                `&g7=${matchids[12]}-${matchids[13]}&q1=${matchids[14]}-0&q2=0-0&q3=0-0&q4=0-0&s1=0-0&s2=0-0&f=0-0`
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    case 16:
                        query = `&gen=1&team_count=16&g1=${matchids[0]}-${matchids[1]}&g2=${matchids[2]}-${matchids[3]}`+
                                `&g3=${matchids[4]}-${matchids[5]}&g4=${matchids[6]}-${matchids[7]}`+
                                `&g5=${matchids[8]}-${matchids[9]}&g6=${matchids[10]}-${matchids[11]}`+
                                `&g7=${matchids[12]}-${matchids[13]}&g8=${matchids[14]}-${matchids[15]}`+
                                `&q1=0-0&q2=0-0&q3=0-0&q4=0-0&s1=0-0&s2=0-0&f=0-0`
                        await saveQuery(parseInt(id), query);
                        await updateStatus(id);
                        break;
                    default:
                        query = '&gen=0';
                        console.log('NOT ENOUGH TEAMS, TOURNEY NOT GENERATED!')
                        break;
                }
            }


            res.render('host_tourney_details.ejs',
                {id: id,
                tourney: tourney_result,
                host: host_result,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                team_path: team_path+'/',
                teams: teams,
                matchedteams: matchedteams,
                managelink: query,
                url: url})
         
        } catch(error){
        console.log(error)
        }
        }
    
    sequentialQueries(id);
    

})

app.post('/remove_tourney', encoder, function(req,res){
    var tourney_id = req.query.tourney_id;
    console.log(`REMOVE TOURNEY ${tourney_id}`);

    getTourneyById = function(id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM tourneys WHERE tourneys_id=?",
              id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined getTourneybyId"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    getTeamsEnteredInTourney = function(tourney_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "SELECT * FROM teams_entered_in_tourney WHERE tourneys_tourneys_id = ?",
                tourney_id,
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined getTeamsEnteredInTourney"));
                    }else{
                        resolve(rows);
                    }
                }
            )}
        )}

    removeTransaction = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                'DELETE FROM transactions WHERE tourneys_tourneys_id=?',
                tourney_id,
                function(err, rows){
                if(rows === undefined){
                    reject(new Error("Error rows is undefined logPurchase"));
                }else{
                    resolve(rows);
                }}
                )}
        )}

    getTeamMembers = function(team_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "SELECT * FROM users WHERE team_id=?",
                team_id,
                function(err,rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                    }else{
                        resolve(rows);
                    }
                }
            )}
        )}

    getTeamById = function(team_id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM teams WHERE teams_id=?",
              team_id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined getTeambyId"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    refundTeam = function(price, team_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE teams SET team_balance = team_balance + ? WHERE teams_id = ?",
                [price, team_id],
                function(err,rows){
                    if(rows===undefined){
                        reject(new Error("Error rows undefined deductBalance"));
                    }else{
                        resolve(rows);
                    }
                }
            )}
        )}

    refundUser = function(price, user_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE users SET balance = balance + ? WHERE user_id = ?",
                [price, user_id],
                function(err,rows){
                    if(rows===undefined){
                        reject(new Error("Error rows undefined deductBalance"));
                    }else{
                        resolve(rows);
                    }
                }
            )}
        )}

    eraseTourney = function(id){
        return new Promise(function(resolve, reject){
            connection.query(
                "DELETE FROM tourneys WHERE tourneys_id=?",
                id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined getTourneybyId"));
                  }else{
                        resolve(rows);
                  }
            }
          )}
    )}

    async function deleteTourney(tourney_id){
        try {
            var tourney = await getTourneyById(tourney_id);
            if(tourney[0].status == 'recruiting'){
                var teams_entered_in_tourney = await getTeamsEnteredInTourney(tourney_id);
                var user_price = tourney[0].entry_fee;
                var team_id;
                for (team_entered of teams_entered_in_tourney){
                    team_id = team_entered.teams_teams_id;
                    var team = await getTeamById(team_id);
                    var team_price = tourney[0].entry_fee * team[0].member_count;
                    var team_members = await getTeamMembers(team_id);
                    for (member of team_members){
                        await refundUser(user_price, member.user_id);
                    }
                    await refundTeam(team_price, team_id);
                }
                await eraseTourney(tourney_id);
            }else{
                console.log('YOU CANNOT DELETE A TOURNEY WITH THIS STATUS: ' + tourney[0].status)
            }
            res.redirect('/host');

        } catch (e) {
            console.error(e);
        }
    }

    deleteTourney(tourney_id);
})





app.post('/finalize_match', encoder, function(req,res){
    var tourney_id = req.query.id;
    var team1_id = req.query.team1;
    var match_code = req.query.code;
    console.log(match_code);
    var team2_id = req.query.team2;
    var team1_goals = req.query.team1_goals;
    var team2_goals = req.query.team2_goals;
    var team1_points = req.query.team1_points;
    var team2_points = req.query.team2_points;
    var winner = req.query.winner;
    var loser;
    var winner_points;
    var winner_goals;
    var loser_points;
    var loser_goals;

    if(winner == team1_id){
        loser = team2_id;
        loser_points = team2_points;
        loser_goals = team2_goals;
        winner_points = team1_points;
        winner_goals = team1_goals;
    }else{
        loser = team1_id;
        loser_points = team1_points;
        loser_goals = team1_goals;
        winner_points = team2_points;
        winner_goals = team2_goals;
    }
    var finalize_query = {
        tourney_id: tourney_id,
        match_code: match_code,
        winner: winner,
        loser: loser,
        winner_points: winner_points,
        winner_goals: winner_goals,
        loser_points: loser_points,
        loser_goals: loser_goals
    };

    saveQuery = function(tourney_id, query){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE matchmaking SET tourney_query = ? WHERE tourney_id = ?",
                [query, tourney_id], 
                function(err, rows){                                                
                    if(rows === undefined){
                        resolve(false);
                  }else if(rows != undefined){
                        resolve(rows);
                  }else{
                      reject(new Error('Error blow up saveQuery'))
                  }
              }
          )}
        )}

    function getQueryVariable(q,variable) {
        var query = q.substring(1)
        var vars = query.split('&')
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=')
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1])
            }
        }
        return 0;
    }

    getOriginalQuery = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM matchmaking WHERE tourney_id=?",
                tourney_id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        resolve(false);
                  }else if(rows != undefined){
                        resolve(rows);
                  }else{
                      reject(new Error('Error blow up checkMAtchmaking'))
                  }
              }
        )}
    )}

    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
          return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
          return uri + separator + key + "=" + value;
        }
      }

    updateWinningTeamPoints = function(team_id, team_points, goals_for, goals_against){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE teams SET games_played = games_played + 1, games_won = games_won + 1, team_points = team_points + ?, goals_for = goals_for + ?,"+
                "goals_against = goals_against + ? WHERE teams_id = ?",
                [team_points, goals_for, goals_against, team_id],
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined updateTeamStats"))
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    updateLosingTeamPoints = function(team_id, team_points, goals_for, goals_against){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE teams SET games_played = games_played + 1, games_lost = games_lost + 1, team_points = team_points + ?, goals_for = goals_for + ?, goals_against = goals_against + ? WHERE teams_id = ?",
                [team_points, goals_for, goals_against, team_id],
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined updateTeamStats"))
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }
    
    async function perform(tourney_id, finalize_query){
        try {
            var orc = await getOriginalQuery(tourney_id);
            var orc = orc[0].tourney_query;
            var team_count = parseInt(getQueryVariable(orc,'team_count'));
            var finalize_matchcode = finalize_query.match_code;
            var manage_link = `/manage?id=${tourney_id}`;
            var winner = finalize_query.winner;
            var loser = finalize_query.loser;
            var winner_points = finalize_query.winner_points;
            var winner_goals = finalize_query.winner_goals;
            var loser_points = finalize_query.loser_points;
            var loser_goals = finalize_query.loser_goals;
            switch(team_count){
                case 6:
                    switch(finalize_matchcode){
                        case 'g1':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 7:
                    switch(finalize_matchcode){
                        case 'g1':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 8:
                    switch(finalize_matchcode){
                        case 'g1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 9:
                    switch(finalize_matchcode){
                        case 'p1':
                            var opponent = getQueryVariable(orc,'g4').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g4', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 10:
                    switch(finalize_matchcode){
                        case 'p1':
                            var opponent = getQueryVariable(orc,'g3').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g3', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'p2':
                            var opponent = getQueryVariable(orc,'g4').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g4', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 11:
                    switch(finalize_matchcode){
                        case 'p1':
                            var opponent = getQueryVariable(orc,'g2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'p2':
                            var opponent = getQueryVariable(orc,'g3').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g3', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'p3':
                            var opponent = getQueryVariable(orc,'g4').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g4', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 12:
                    switch(finalize_matchcode){
                        case 'p1':
                            var opponent = getQueryVariable(orc,'g1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'p2':
                            var opponent = getQueryVariable(orc,'g2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'p3':
                            var opponent = getQueryVariable(orc,'g3').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g3', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                        case 'p4':
                            var opponent = getQueryVariable(orc,'g4').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'g4', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                        case 'g1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 13:
                    switch(finalize_matchcode){
                        case 'g1':
                            var opponent = getQueryVariable(orc,'q1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'q2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var opponent = getQueryVariable(orc,'q3').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q3', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var new_query = updateQueryStringParameter(orc,'q4', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g5':
                            var opponent = getQueryVariable(orc,'q4').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q4', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 14:
                    switch(finalize_matchcode){
                        case 'g1':
                            var opponent = getQueryVariable(orc,'q1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'q2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var new_query = updateQueryStringParameter(orc,'q3', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var opponent = getQueryVariable(orc,'q3').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q3', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g5':
                            var new_query = updateQueryStringParameter(orc,'q4', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g6':
                            var opponent = getQueryVariable(orc,'q4').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q3', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 15:
                    switch(finalize_matchcode){
                        case 'g1':
                            var opponent = getQueryVariable(orc,'q1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var new_query = updateQueryStringParameter(orc,'q2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var opponent = getQueryVariable(orc,'q2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var new_query = updateQueryStringParameter(orc,'q3', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g5':
                            var opponent = getQueryVariable(orc,'q3').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q3', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g6':
                            var new_query = updateQueryStringParameter(orc,'q4', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g7':
                            var opponent = getQueryVariable(orc,'q4').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q4', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                case 16:
                    switch(finalize_matchcode){
                        case 'g1':
                            var new_query = updateQueryStringParameter(orc,'q1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g2':
                            var opponent = getQueryVariable(orc,'q1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g3':
                            var new_query = updateQueryStringParameter(orc,'q2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g4':
                            var opponent = getQueryVariable(orc,'q2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g5':
                            var new_query = updateQueryStringParameter(orc,'q3', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g6':
                            var opponent = getQueryVariable(orc,'q3').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q3', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g7':
                            var new_query = updateQueryStringParameter(orc,'q4', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'g8':
                            var opponent = getQueryVariable(orc,'q4').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'q4', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q1':
                            var new_query = updateQueryStringParameter(orc,'s1', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q2':
                            var opponent = getQueryVariable(orc,'s1').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s1', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q3':
                            var new_query = updateQueryStringParameter(orc,'s2', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'q4':
                            var opponent = getQueryVariable(orc,'s2').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'s2', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's1':
                            var new_query = updateQueryStringParameter(orc,'f', `${winner}-0`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 's2':
                            var opponent = getQueryVariable(orc,'f').split('-')[0];
                            var new_query = updateQueryStringParameter(orc,'f', `${opponent}-${winner}`);
                            console.log(`${new_query}`);
                            await saveQuery(tourney_id, new_query);
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(`${manage_link}${new_query}`);
                            break;
                        case 'f':
                            var new_query = `/tourney_end?id=${tourney_id}&winner=${winner}`;
                            await updateLosingTeamPoints(loser, loser_points, loser_goals, winner_goals);
                            await updateWinningTeamPoints(winner, winner_points, winner_goals, loser_goals);
                            res.redirect(new_query);
                            break;
                        default:
                            console.log(`Error with finalize_matchcode ${finalize_matchcode}`);
                            break;
                    }
                    break;
                default:
                    console.log("Error with team_count");
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    }

    perform(tourney_id, finalize_query);

})

app.get("/tourney_end",encoder,function(req, res){
    var winner = req.query.winner;
    var tourney_id = req.query.id;

    getTeamById = function(team_id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM teams WHERE teams_id=?",
              team_id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined getTeambyId"));
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

    getTeamMembers = function(team_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "SELECT * FROM users WHERE team_id=?",
                team_id,
                function(err,rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    getTourneyById = function(id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM tourneys WHERE tourneys_id=?",
              id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined getTourneybyId"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    updateWinTeamStats = function(team_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE teams SET tourneys_won = tourneys_won + 1, tourneys_played = tourneys_played + 1, team_points = team_points + 1 WHERE teams_id=?",
                team_id,
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined updateTeamStats"))
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    updateLossTeamStats = function(team_ids){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE teams SET tourneys_lost = tourneys_lost + 1, tourneys_played = tourneys_played + 1 WHERE teams_id=?",
                team_ids,
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined updateTeamStats"))
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    getTeamsEnteredInTourney = function(tourney_id, winner){
        return new Promise(function(resolve,reject){
            connection.query(
                "SELECT * FROM teams_entered_in_tourney WHERE (tourneys_tourneys_id = ? && teams_teams_id != ?)",
                [tourney_id, winner],
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined getTeamsEnteredInTourney"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    endTourneyStatus = function(tourney_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "UPDATE tourneys SET status = 'ended' WHERE tourneys_id = ?",
                tourney_id,
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined getTeamsEnteredInTourney"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    checkMatchmaking = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM matchmaking WHERE tourney_id=?",
                tourney_id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        resolve(false);
                  }else if(rows != undefined){
                        resolve(rows);
                  }else{
                      reject(new Error('Error blow up checkMAtchmaking'))
                  }
              }
          )}
        )}

    async function perform(winner, tourney_id, url){
        try {
            var team = await getTeamById(winner);
            var users = await getTeamMembers(winner);
            var tourney = await getTourneyById(tourney_id);
            var earnings = (tourney[0].team_sizes * tourney[0].entry_fee * tourney[0].current_participants)*0.55;
            var individual_earnings = tourney[0].entry_fee * tourney[0].current_participants*0.55

            await updateWinTeamStats(winner);
            var teams_entered = await getTeamsEnteredInTourney(tourney_id, winner);
            var loser_mail_list = []
            for(team of teams_entered){
                await updateLossTeamStats(team.teams_teams_id);
                var losers = await getTeamMembers(team.teams_teams_id);
                for(loser of losers){
                    console.log(`LOSER: ${loser.user_id}`);
                    loser_mail_list.push(loser.user_email);
                }
            }
            var weaser = await checkMatchmaking(tourney_id);
            var weasel = `${url}/summary?id=${tourney_id}${weaser[0].tourney_query}&host_id=${req.cookies.id}&winner=${winner}`;
            loser_email_contents = {
                recipient: loser_mail_list,
                subject: `${tourney[0].name} Results`,
                message: "You'll Get Them Next Time!\n"+
                            '✔ You can review the tourney summary at this '+' link:'.link(`${weasel}`)+
                            `💸 Your team has lost!\n`+
                            '🔥 Although your team did not win, I hope you had fun!\n'+
                            '🔥 You can still play again to try to win another Tourney!',
                html: `<h1 style="text-align: center;">
                        You'll Get Them Next Time!
                        </h1><br>
                        <div style="align-items: center; display: flex;">
                            <ul style="list-style: none; margin: auto;">
                            <li>✔ You can review the tourney summary at this <a href="https://${weasel}">link</a></li>
                            <li>💸 Your team has lost!</li>
                            <li>🔥 Although your team did not win, I hope you had fun!</li>
                            <li>🔥 You can still play again to try to win another Tourney!</li>
                            </ul>
                        </div>`}
                        mail(loser_email_contents.recipient, loser_email_contents.subject, loser_email_contents.message, loser_email_contents.html);
            
            

            var formatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD',});
            for(user of users){
                console.log(`WINNERS: ${user.user_id}`);
            }
            var winner_mail_list = []
            for(user of users){
                winner_mail_list.push(user.user_email);
            }
            email_contents = {
                recipient: winner_mail_list,
                subject: `${tourney[0].name} Results`,
                message: 'Congratulations, you won!\n'+
                            '✔ You can view your trophy at this '+' link:'.link(`${url}/winner?id=${tourney_id}&earnings_team=${earnings}`)+
                            `💸 Your team has won ${formatter.format(earnings)} (${formatter.format(individual_earnings)} per player)\n`+
                            '🔥 I hope you had fun!\n'+
                            `👀 You can view the Tourney summary at this link: `.link(`${weasel}`) +
                            '🔥 You can withdraw your winnings once your account has reached $100.00 in earnings.',
                html: `<h1 style="text-align: center;">
                        Congratulations, you won!
                        </h1><br>
                        <div style="align-items: center; display: flex;">
                            <ul style="list-style: none; margin: auto;">
                            <li>✔ You can view your trophy at <a href="https://${url}/winner?id=${tourney_id}&earnings_team=${earnings}">link</a></li>
                            <li>💸 Your team has won ${formatter.format(earnings)} (${formatter.format(individual_earnings)} per player)</li>
                            <li>🔥 I hope you had fun! Come and play in another Tourney sometime soon!</li>
                            <li>👀 You can view the Tourney summary at this <a href="https://${weasel}">link</a></li>
                            <li>🔥 You can withdraw your individual winnings once your user balance has reached $100.00 in earnings.</li>
                            </ul>
                        </div>`
            }
            mail(email_contents.recipient, email_contents.subject, email_contents.message, email_contents.html);
            // console.log(email_contents);

            await endTourneyStatus(tourney_id);

            res.redirect('/host');
        } catch (e) {
            console.error(e);
        }
    }
    
    perform(winner, tourney_id, url);
})

app.post('/remove_team_member',encoder,function(req,res){
    var user_id = req.query.user_id;
    var team_id = req.query.team_id;

    getUserById = function(user_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "SELECT * FROM users WHERE user_id=?",
                user_id,
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined removeMemberCount"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    removeMemberCount = function(user_balance, team_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "UPDATE teams SET member_count = member_count - ?, team_balance = team_balance - ? WHERE teams_id = ?",
                [1, user_balance, team_id],
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined removeMemberCount"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    adjustUserDetails = function(user_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "UPDATE users SET team_id = 0 WHERE user_id = ?",
                user_id,
                function(error,rows){
                    if(rows == undefined){
                        reject(new Error("Error rows undefined removeMemberCount"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    async function commence(user_id, team_id){
        try {
            var user = await getUserById(user_id);
            var user_balance = user[0].balance;
            console.log(team_id);
            await adjustUserDetails(user_id);
            console.log(await removeMemberCount(user_balance, team_id));
            res.redirect('/team_player');
        } catch (e) {
            console.error(e);
        }
    }

    commence(user_id, team_id);

})

app.get('/winner', encoder, function(req,res){
    var tourney_id = req.query.id;

    checkMatchmaking = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM matchmaking WHERE tourney_id=?",
                tourney_id, 
                function(err, rows){                                                
                    if(rows === undefined){
                        resolve(false);
                  }else if(rows != undefined){
                        resolve(rows);
                  }else{
                      reject(new Error('Error blow up checkMAtchmaking'))
                  }
              }
          )}
        )}


    async function blast(tourney_id){
        try {
            var query = await checkMatchmaking(tourney_id);
            var link = query[0].tourney_query;
            var suffix = `summary?id=${tourney_id}`
            link = suffix+link
            var formatter = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD',});
            var earnings = formatter.format(req.query.earnings_team);
            res.render('winner.ejs',{
                earnings: earnings,
                link: link
            })
        } catch (e) {
            console.error(e);
        }
    }

    blast(tourney_id);
})

app.get("/add_tourney", checkAuthenticated, function(req, res){
    res.render('add_tourney.ejs', {add_error: add_tourney_error});
})
app.get("/team_player", checkAuthenticated, function(req, res){
    var user_id = req.cookies.id;

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

    getTeamById = function(team_id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM teams WHERE teams_id=?",
              team_id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    getTeamMembers = function(team_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "SELECT * FROM users WHERE team_id=?",
                team_id,
                function(err,rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    async function runQuery(user_id){
        try {
            const results = await getUserById(user_id);
            if(results[0].team_id > 0){
                const team = await getTeamById(results[0].team_id);
                const members = await getTeamMembers(results[0].team_id);
                function getAge(birthday) {
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
                res.render('team_player.ejs', {team: team,
                                                members: members,
                                                team_path: team_path,
                                                profile_path: profile_path,
                                                getAge: getAge,
                                                user_id: user_id,
                                                url: url});
            }else{
                res.render('no_team.ejs');
            }
            
        } catch (error) {
            console.error(error)
        }
        
    }

    runQuery(user_id);
})

app.get("/create_team", checkAuthenticated, function(req, res){
    res.render('create_team.ejs');
})

app.get("/join_team", checkAuthenticated, function(req, res){

    const user_id = req.cookies.id;

    joinTeam = function(team_id, user_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "UPDATE users SET team_id = ? WHERE user_id = ?",
                [team_id, user_id],
                function(err,rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

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

    addMember = function(team_id, user_balance){
        return new Promise(function(resolve,reject){
            connection.query(
                "UPDATE teams SET member_count = member_count + 1, team_balance = team_balance + ? WHERE teams_id = ?",
                [user_balance,team_id],
                function(err,rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    async function runQuery(team_id, user_id){
        await joinTeam(team_id, user_id);
        const user = await getUserById(user_id);
        await addMember(team_id, user[0].balance);
    }

    if(req.query.team_id){
        const team_id = req.query.team_id;
        runQuery(team_id, user_id);
        res.redirect('/team_player')
    }else{
        res.render('join_team.ejs');
    }
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



app.post("/edit_profile_pic", upload_profile.single('profpic'), encoder, function(req,res){
    const file_name = req.file != null ? req.file.filename : null;
    var user_id = req.cookies.id;

    editProfilePic = function(user_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "UPDATE users SET photo = ? WHERE user_id = ?",
                [file_name, user_id],
                function(err,rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined linkTeamId"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    async function runQuery(user_id){
        try {
            await editProfilePic(user_id);
            res.redirect('/profile_player');
        } catch (e) {
            console.error(e);
            res.redirect('/profile_player');
        }
    }

    runQuery(user_id);
})


app.post("/create_team",upload_team.single('teamlogo'), encoder, function(req, res){
    const file_name = req.file != null ? req.file.filename : null;
    console.log(file_name)
    var team_name = req.body.teamname;
    var user_id = req.cookies.id;

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

    createTeam = function(team_name, team_logo, user_id, user_name, user_balance){
        return new Promise(function(resolve, reject){
            var vals = {
                team_name: team_name,
                team_logo: team_logo,
                team_leader: user_name,
                users_user_id: user_id,
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
                team_points: 0,
                member_count: 1,
                team_balance: user_balance
            }
            connection.query(
                'INSERT INTO teams SET ?',
                vals,
                function(err, rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined createTeam"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    linkTeamId = function(team_id, user_id){
        return new Promise(function(resolve, reject){
            connection.query(
                'UPDATE users SET team_id = ? WHERE user_id = ?;',
                [team_id, user_id],
                function(err, rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined linkTeamId"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    getTeamOfUser = function(user_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM teams WHERE users_user_id = ?",
                user_id,
                function(err, rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined getTeamofUser"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    async function runQuery(user_id, team_name, file_name){
        try {
            const user = await getUserById(user_id);
            await createTeam(team_name, file_name, user_id,user[0].user_name,user[0].balance);
            const team = await getTeamOfUser(user_id);
            console.log(`Team ID: ${team[0].teams_id}`)
            await(linkTeamId(team[0].teams_id, user_id));
            res.redirect('/team_player');
        } catch (error) {
            console.error(error);
            res.redirect('/team_player')
        }
    }
    
    runQuery(user_id, team_name, file_name);
})

app.post("/login",encoder, function(req,res){
    var email = req.body.email;
    var password = req.body.password;

    checkPass = function(email){
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


    async function check(email){
        try {
            var chek = await checkPass(email);
            var verification_check = await checkVerification(chek[0].user_id);
            console.log(verification_check[0].verified)
            if(verification_check[0].verified == 1){
                if(chek != false){
                    if(await bcrypt.compare(req.body.password, chek[0].user_pass)){
                        authcode = true;
                        my_user_id = chek[0].user_id;
                        res.clearCookie('id');
                        res.cookie('id', my_user_id);
                        console.log(req.cookies.id)
                        res.redirect("/home");
                    }else{
                        res.redirect("/login");
                    }
            }}else{
                res.redirect('/unverified');
            }
            
                
        } catch (e) {
            console.error(e);
        }
    }

    check(email);
    
})
app.post("/verified_login",encoder, function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    var code = req.query.code;
    if(!code){
        code = req.body.code;
    }
    

    getUserById = function(user_id, password){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM users WHERE user_id=?",
              user_id, 
              function(err, rows){                              
                const check_pass = bcrypt.compare(password, rows[0].user_pass);
                if(rows === undefined || check_pass == false){
                      reject(new Error("Error rows is undefined"));
                }else{
                    authcode = true;
                    my_user_id = rows[0].user_id;
                    res.clearCookie('id')
                    res.cookie('id', my_user_id);
                    console.log(req.cookies.id);
                    resolve(rows)
                }
            }
        )}
    )}

    checkPassword = function(email){
        return new Promise(function(resolve, reject){
          connection.query(
            "SELECT * FROM users WHERE user_email = ?",
              email, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    verifyUser = function(user_id){
        return new Promise(function(resolve, reject){
          var q = connection.query(
              "UPDATE users SET verified = 1 WHERE user_id = ?",
              user_id)          
                if(q === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(q);
                }
            }
        )}


    async function runQuery(code, email, password){
        try {
            const users = await checkPassword(email);
            const user_id = users[0].user_id;
            const results = await getUserById(user_id, password);
            if (bcrypt.compare(code, results[0].verification_code)){
                await verifyUser(user_id);
                console.log('Your account has been verified');
                res.redirect('/')
            }else{
                console.log('WRONG VERIFICATION CODE')
            }
        } catch (error) {
            console.error(error);
            res.redirect(`/verify_login`)
        }
    }

    runQuery(code, email, password);

    // connection.query("select * from users where user_email = ?", email, function(error, results, fields){
    //     console.log(results);
    //     if (results.length > 0){
    //         if (bcrypt.compare(password, results[0].user_pass)){
    //             authcode = true;
    //             my_user_id = results[0].user_id;
    //             res.clearCookie('id')
    //             res.cookie('id', my_user_id);
    //             console.log(req.cookies.id);
    //             runQuery(code, my_user_id);
    //             res.redirect("/home");
    //         }
    //     }else {
    //         res.redirect(`/verified_login?code=${code}`);
    //     }
    //     res.end();
    // })
})

app.get("/verified_login", function(req, res){
    res.render('verify_login.ejs', {code: req.query.code})
})

app.post("/join",encoder,checkAuthenticated, function(req, res){
    var tourney_id = req.query.id;
    var user_id = req.cookies.id;
    var id = req.query.id;

    getUserById = function(user_id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM users WHERE user_id=?",
              user_id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined getUserbyId"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    getTeamById = function(team_id){
        return new Promise(function(resolve, reject){
          connection.query(
              "SELECT * FROM teams WHERE teams_id=?",
              team_id, 
              function(err, rows){                                                
                  if(rows === undefined){
                      reject(new Error("Error rows is undefined getTeambyId"));
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
                      reject(new Error("Error rows is undefined getTourneybyId"));
                }else{
                      resolve(rows);
                }
            }
        )}
    )}

    getTeamOfUser = function(team_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM teams WHERE teams_id = ?",
                team_id,
                function(err, rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined getTeamofUser"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    joinTourney = function(tourney_id, team_id, host_id, host_user_id, team_leader_user_id){
        return new Promise(function(resolve, reject){
            var vals = {
                teams_teams_id: team_id,
                teams_users_user_id: team_leader_user_id,
                tourneys_tourneys_id: tourney_id,
                tourneys_hosts_hosts_id: host_id,
                tourneys_hosts_users_user_id: host_user_id
            }
            connection.query(
                'INSERT INTO teams_entered_in_tourney SET ?',
                vals,
                function(err, rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined joinTOurney"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    logPurchase = function(price,
                            tourneys_tourneys_id,
                            tourneys_hosts_hosts_id,
                            tourneys_hosts_users_user_id,
                            users_user_id,
                            entity_id){
        return new Promise(function(resolve, reject){
            var timestamp = new Date();
            var direction = 'team-host';
            var entity = 'team';
            var vals = {
                price: price,
                timestamp: timestamp,
                direction: direction,
                tourneys_tourneys_id: tourneys_tourneys_id,
                tourneys_hosts_hosts_id: tourneys_hosts_hosts_id,
                tourneys_hosts_users_user_id: tourneys_hosts_users_user_id,
                users_user_id: users_user_id,
                entity: entity,
                entity_id: entity_id
            }
            console.log(vals)
            connection.query(
                'INSERT INTO transactions SET ?',
                vals,
                function(err, rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined logPurchase"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    registerTeamTourney = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE tourneys SET current_participants = current_participants + 1 WHERE tourneys_id=?",
                tourney_id,
                function(err,rows){
                    if(rows===undefined){
                        reject(new Error("Error rows is undefined registerTeamTourney"))
                    }else{
                        resolve(rows)
                    }
                }
            )
        })
    }

    makepurchase = function(price){
        return new Promise(function(resolve,reject){
            var purchase = 'SUCCESS ' + '$' + price.toFixed(2);
            if(purchase){
                resolve(purchase);
            }else{
                reject(new Error('FAILURE'));
            }
        })
    }

    getTourneyLogistics = function(tourney_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "SELECT * FROM teams_entered_in_tourney WHERE tourneys_tourneys_id = ?",
                tourney_id,
                function(err,rows){
                    if(rows===undefined){
                        reject(new Error("Error rows undefined getTourneyLogistics"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    deductTeamBalance = function(team_id, price){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE teams SET team_balance = team_balance - ? WHERE teams_id = ?",
                [price, team_id],
                function(err,rows){
                    if(rows===undefined){
                        reject(new Error("Error rows undefined deductBalance"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    getTeamMembers = function(team_id){
        return new Promise(function(resolve,reject){
            connection.query(
                "SELECT * FROM users WHERE team_id=?",
                team_id,
                function(err,rows){
                    if(rows === undefined){
                        reject(new Error("Error rows is undefined"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    deductUserBalance = function(price, user_id){
        return new Promise(function(resolve, reject){
            connection.query(
                "UPDATE users SET balance = balance - ? WHERE user_id = ?",
                [price, user_id],
                function(err,rows){
                    if(rows===undefined){
                        reject(new Error("Error rows undefined deductBalance"));
                    }else{
                        resolve(rows);
                    }
                }
            )
        })
    }

    async function runQueries(user_id, tourney_id){
        try {
            const user_results = await getUserById(user_id);
            const tourney_results = await getTourneyById(tourney_id);
            const host_results = await getUserById(tourney_results[0].hosts_users_user_id);
            const team_results = await getTeamOfUser(user_results[0].team_id);
            const tourney_logs = await getTourneyLogistics(tourney_id);
            const team_members = await getTeamMembers(user_results[0].team_id);
            var paying_user_count = 0;
            for(member of team_members){
                if(member.balance > tourney_results[0].entry_fee){
                    paying_user_count = paying_user_count + 1;
                }
            }
            var tourney_log_team_id = null;
            if(tourney_logs.length > 0){
                tourney_log_team_id = tourney_logs[0].teams_teams_id;
            }

            if(tourney_results[0].hosts_users_user_id == user_id){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'YOU CANNOT ENTER A TOURNAMENT YOU ARE HOSTING! PLEASE JOIN ANOTHER TOURNAMENT!',
                user: user_results,
                team: team_results})
            }else if(team_results[0].users_user_id != user_id){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'ONLY TEAM CAPTAIN CAN ENTER TEAM INTO TOURNEY! PLEASE CONTACT YOUR TEAM CAPTAIN TO JOIN!',
                user: user_results,
                team: team_results})
            }else if(team_results.length <= 0){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'YOU CANNOT JOIN WITHOUT A TEAM! PLEASE CREATE A TEAM OR JOIN A TEAM TO ENTER A TOURNAMENT!',
                user: user_results,
                team: null})
            }else if(team_results[0].team_balance < tourney_results[0].entry_fee * team_results[0].member_count){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'YOUR TEAM HAS INSUFFICIENT FUNDS! PLEASE ADD FUNDS AND TRY AGAIN!',
                user: user_results,
                team: team_results})
            }else if(paying_user_count != team_members.length){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'NOT ALL PLAYERS HAVE INSUFFICIENT FUNDS! PLEASE ADD FUNDS TO RESPECTIVE ACCOUNTS AND TRY AGAIN!',
                user: user_results,
                team: team_results})
            }else if(tourney_results[0].current_participants == tourney_results[0].max_participants){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'TEAM QUOTA REACHED! PLEASE TRY JOINING A DIFFERENT TOURNEY!',
                user: user_results,
                team: team_results})
            }else if(tourney_results[0].team_sizes > team_results[0].member_count){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'NOT ENOUGH PLAYERS ON YOUR TEAM! PLEASE INVITE MORE MEMBERS AND TRY AGAIN!',
                user: user_results,
                team: team_results})
            }else if(tourney_log_team_id != null && tourney_log_team_id == user_results[0].team_id){
                res.render('tourney_details.ejs',
                {id: id,
                tourney: tourney_results,
                host: host_results,
                venue_path: venue_path+'/',
                profile_path: profile_path+'/',
                join_error: 'YOU HAVE ALREADY REGISTERED FOR THIS TOURNEY!',
                user: user_results,
                team: team_results})
            }else{
                const team = await getTeamById(user_results[0].team_id);
                var team_id = team_results[0].teams_id;
                var team_leader_user_id = team[0].users_user_id;
                var host_user_id = tourney_results[0].hosts_users_user_id;
                var tourney_id = tourney_results[0].tourneys_id;
                var host_id = tourney_results[0].hosts_hosts_id;
                var team_price = tourney_results[0].entry_fee * team_results[0].member_count;
                var user_price = tourney_results[0].entry_fee;
                var purchase = await makepurchase(team_price);
                console.log(purchase)
                await logPurchase(team_price, tourney_id, host_id, host_user_id, user_id, team_id);
                for(member of team_members){
                    await deductUserBalance(user_price, member.user_id);
                }
                await deductTeamBalance(team_results[0].teams_id, price);
                // var tourney_qr_id = makeid(6);
                // var tourney_qr = await bcrypt.hash(tourney_qr_id, 10);
                await joinTourney(tourney_id, team_id, host_id, host_user_id, team_leader_user_id);
                await registerTeamTourney(tourney_id);
                console.log('JOINED TOURNEY');
                email_contents = {
                    recipient: user_results[0].user_email,
                    subject: 'MyTourney Team Registration',
                    message: `Your team ${team[0].team_name} been registered to join ${tourney_results[0].tourney_name}!\n`+
                                '💸 You can win cash prizes by winning Tourneys.\n'+
                                'Have fun at your Tourney!',
                    html: `<h1 style="text-align: center;">
                                You have been registered to join ${tourney_results[0].tourney_name}!
                            </h1><br>
                            <div style="align-items: center; display: flex;">
                                <ul style="list-style: none; margin: auto;">
                                <li>💸 You can win cash prizes by winning Tourneys.</li>
                                <li>🔥 I hope to see you crush the competition, and most importantly have fun!</li>
                                </ul>
                            </div>`
                }
                mail(email_contents.recipient, email_contents.subject, email_contents.message, email_contents.html);
                res.redirect('/home');
            }
        } catch (error) {
            console.error(error)
        }
    }

    runQueries(user_id,tourney_id);


})

//When login is success
app.get("/home_verify", checkAuthenticated, function(req, res){
    var user_id = req.cookies.id;
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

    async function run(user_id){
        try {
            var user_check = await checkVerification(user_id);
            console.log(user_check[0].verified)
            if(user_check[0].verified == 0){
                res.redirect('/unverified');
            }else{
                res.redirect('/home');
            }
        } catch (e) {
            console.error(e);
        }
    }

    run(user_id);
})

app.get('/unverified', function(req,res){
    res.render('unverified.ejs');
})

app.get('/verify', function(req,res){
    var code = req.query.code;
    var user_id = req.cookies.id;

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

    verifyUser = function(user_id){
        return new Promise(function(resolve, reject){
          var q = connection.query(
              "UPDATE users SET verified = 1 WHERE user_id = ?",
              user_id)          
                if(q === undefined){
                      reject(new Error("Error rows is undefined"));
                }else{
                      resolve(q);
                }
            }
        )}


    async function runQuery(code, user_id){
        try {
            const results = await getUserById(user_id);
            if (bcrypt.compare(code, results[0].verification_code)){
                await verifyUser(user_id);
                console.log('Your account has been verified');
                res.redirect('/')
            }
        } catch (error) {
            console.error(error);
            
        }
    }

    console.log(user_id)

    if(user_id>0){
        runQuery(code, user_id);
    }else{
        let link = `/verified_login?code=${code}`
        console.log(`Redirecting... ${link}`)
        res.redirect(link)
    }
    

})

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


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

        async function runQuery(){
            try {
                const results = await checkCreatedUser(email);
                console.log(results);
                if (results.length > 0){
                    console.log("USER REGISTERED");
                    // authcode = true;
                    my_user_id = results[0].user_id;
                    //Expires after 1800000 ms (30 minutes) from the time it is set.
                    // res.cookie('id', my_user_id, {expire: 1800000 + Date.now()});
                    registration_error = ""
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
                    res.redirect("/verified_login");
                }else {
                    registration_error = "A USER WITH THAT EMAIL ALREADY EXISTS"
                    res.redirect("/register");
                }res.end();
            } catch (error) {
                console.error(error)
                res.redirect("/register");
            }
        }

        runQuery();

    //     connection.query("select * from users where user_email = ? and user_pass = ?",[email, password], function(error, results, fields){
    //         if (results.length > 0){
    //             console.log("USER REGISTERED");
    //             authcode = true;
    //             my_user_id = results[0].user_id;
    //             //Expires after 1800000 ms (30 minutes) from the time it is set.
    //             res.cookie('id', my_user_id, {expire: 1800000 + Date.now()});
    //             registration_error = ""
    //             email_contents = {
    //                 recipient: email,
    //                 subject: 'MyTourney Registration',
    //                 message: 'Welcome to MyTourney! Find a team or create one to get started and join a tourney. You can win cash prizes by winning Tourneys. I hope to see you crush the competition, and most importantly have fun!'
    //             }
    //             email(email_contents.recipient, email_contents.subject, email_contents.message);
    //             res.redirect("/home");
    //         }else {
    //             registration_error = "A USER WITH THAT EMAIL ALREADY EXISTS"
    //             res.redirect("/register");
    //         }
    //         res.end();
    //     })
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
app.listen(5000, "0.0.0.0");
