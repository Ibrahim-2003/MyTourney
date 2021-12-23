
function removeMember(user_id, team_id){
    var query = `/remove_team_member?team_id=${parseInt(team_id)}&user_id=${parseInt(user_id)}`
    submitQuery(query);
}

function removeTourney(tourney_id){
    var query = `/remove_tourney?tourney_id=${parseInt(tourney_id)}`
    console.log(`REMOVE ${tourney_id}: ${query}`);
    submitQuery(query);
}

function submitQuery(query){
    var form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', query);
    form.style.display = 'hidden';
    document.body.appendChild(form)
    form.submit();
}