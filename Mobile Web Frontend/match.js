

function submitFinalize(){
    var team1_score = document.getElementById("home_team_score").textContent;
    var team1_goals = parseInt(team1_score.split('\n')[1].split('SCORE: ')[1]);
    var team2_score = document.getElementById("away_team_score").textContent;
    var team2_goals = parseInt(team2_score.split('\n')[1].split('SCORE: ')[1]);
    console.log(`TEAM 1 (${team1_goals}) - TEAM 2 (${team2_goals})`)
    var team1_id = parseInt(getQueryVariable('team1'));
    var team2_id = parseInt(getQueryVariable('team2'));
    var tourney_id = parseInt(getQueryVariable('id'));
    var match_type = getQueryVariable('code');
    post(team1_id,team1_goals,team2_id,team2_goals, tourney_id, match_type);
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1])
        }
    }
    console.log('Query variable %s not found', variable)
}

function post(team1_id, team1_score, team2_id, team2_score, tourney_id, match_type) {
    var winner = checkWinner(team1_id, team1_score, team2_id, team2_score);
    var timestamp = new Date();
    console.log(winner);
    console.log(tourney_id);
    console.log(match_type);
    console.log(timestamp);

    var pointcalc = allocatePoints(team1_id, team1_score, team2_id, team2_score);
    console.log(pointcalc);

    var query = `/finalize_match?id=${tourney_id}&team1=${team1_id}&team1_goals=${team1_score}&team1_points=${pointcalc.team1_points}`+
                `&team2=${team2_id}&team2_goals=${team2_score}&team2_points=${pointcalc.team2_points}&code=${match_type}&winner=${winner}`;

    if(winner != 0){
        submitQuery(query);
    }else{
        console.log('...Redirecting to penalties');
        document.getElementById('pen-msg').style.display = 'block';
        document.getElementById('home_team').style.display = 'none';
        document.getElementById('away_team').style.display = 'none';
        document.getElementById('submit-match-score').style.display = 'none';
    }
    
}

function submitQuery(query){
    var form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', query);
    form.style.display = 'hidden';
    document.body.appendChild(form)
    form.submit();
}

function pensHomeWin(){
    var team1_score = document.getElementById("home_team_score").textContent;
    var team1_goals = parseInt(team1_score.split('\n')[1].split('SCORE: ')[1]);
    var team2_score = document.getElementById("away_team_score").textContent;
    var team2_goals = parseInt(team2_score.split('\n')[1].split('SCORE: ')[1]);
    console.log(`TEAM 1 (${team1_goals}) - TEAM 2 (${team2_goals})`)
    var team1_id = parseInt(getQueryVariable('team1'));
    var team2_id = parseInt(getQueryVariable('team2'));
    var tourney_id = parseInt(getQueryVariable('id'));
    var match_type = getQueryVariable('code');
    var winner = team1_id;
    var timestamp = new Date();
    console.log(winner);
    console.log(tourney_id);
    console.log(match_type);
    console.log(timestamp);

    var pointcalc = allocatePoints(team1_id, team1_goals, team2_id, team2_goals);
    console.log(pointcalc);

    var query = `/finalize_match?id=${tourney_id}&team1=${team1_id}&team1_goals=${team1_goals}&team1_points=${pointcalc.team1_points}`+
                `&team2=${team2_id}&team2_goals=${team2_goals}&team2_points=${pointcalc.team2_points}&code=${match_type}&winner=${winner}`;

    submitQuery(query);
}

function pensAwayWin(){
    var team1_score = document.getElementById("home_team_score").textContent;
    var team1_goals = parseInt(team1_score.split('\n')[1].split('SCORE: ')[1]);
    var team2_score = document.getElementById("away_team_score").textContent;
    var team2_goals = parseInt(team2_score.split('\n')[1].split('SCORE: ')[1]);
    console.log(`TEAM 1 (${team1_goals}) - TEAM 2 (${team2_goals})`)
    var team1_id = parseInt(getQueryVariable('team1'));
    var team2_id = parseInt(getQueryVariable('team2'));
    var tourney_id = parseInt(getQueryVariable('id'));
    var match_type = getQueryVariable('code');
    var winner = team2_id;
    var timestamp = new Date();
    console.log(winner);
    console.log(tourney_id);
    console.log(match_type);
    console.log(timestamp);

    var pointcalc = allocatePoints(team1_id, team1_goals, team2_id, team2_goals);
    console.log(pointcalc);

    var query = `/finalize_match?id=${tourney_id}&team1=${team1_id}&team1_goals=${team1_goals}&team1_points=${pointcalc.team1_points}`+
                `&team2=${team2_id}&team2_goals=${team2_goals}&team2_points=${pointcalc.team2_points}&code=${match_type}&winner=${winner}`;

    submitQuery(query);
}

function checkWinner(team1_id, team1_score, team2_id, team2_score){
    if(team1_score > team2_score){
        return team1_id;
    }else if(team2_score > team1_score){
        return team2_id;
    }else{
        return 0;
    }
}

function allocatePoints(team1_id, team1_score, team2_id, team2_score){
    var team1_points = team1_score;
    var team2_points = team2_score;
    if(team2_score == 0 && team1_score > 0){
        team1_points = team1_points + 3;
    }
    if(team1_score == 0 && team2_score > 0){
        team2_points = team2_points + 3;
    }
    if(team1_points == team2_points){
        team1_points = team1_points + 1;
        team2_points = team2_points + 1;
    }
    if(team1_points > 6){
        team1_points = 6;
    }
    if(team2_points > 6){
        team2_points = 6;
    }
    return {team1_id: team1_id,
            team1_points: team1_points,
            team2_id: team2_id,
            team2_points: team2_points}
        
}

function addPointsHome(){
    var team1_score = document.getElementById("home_team_score").textContent;
    var team1_goals = parseInt(team1_score.split('\n')[1].split('SCORE: ')[1]);
    team1_goals = team1_goals + 1;
    if(team1_goals<0){
        team1_goals = 0;
    }
    var new_score = team1_score.replace(/-?\d+/g, team1_goals);
    document.getElementById("home_team_score").textContent = new_score;
}

function subtractPointsHome(){
    var team1_score = document.getElementById("home_team_score").textContent;
    var team1_goals = parseInt(team1_score.split('\n')[1].split('SCORE: ')[1]);
    team1_goals = team1_goals - 1;
    if(team1_goals<0){
        team1_goals = 0;
    }
    var new_score = team1_score.replace(/-?\d+/g, team1_goals);
    document.getElementById("home_team_score").textContent = new_score;
}

function addPointsAway(){
    var team2_score = document.getElementById("away_team_score").textContent;
    var team2_goals = parseInt(team2_score.split('\n')[1].split('SCORE: ')[1]);
    team2_goals = team2_goals + 1;
    if(team2_goals<0){
        team2_goals = 0;
    }
    var new_score = team2_score.replace(/-?\d+/g, team2_goals);
    document.getElementById("away_team_score").textContent = new_score;
}

function subtractPointsAway(){
    var team2_score = document.getElementById("away_team_score").textContent;
    var team2_goals = parseInt(team2_score.split('\n')[1].split('SCORE: ')[1]);
    team2_goals = team2_goals - 1;
    if(team2_goals<0){
        team2_goals = 0;
    }
    var new_score = team2_score.replace(/-?\d+/g, team2_goals);
    document.getElementById("away_team_score").textContent = new_score;
}
