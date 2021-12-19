class Match{
    constructor(team1, team2){
        this.team1 = team1;
        this.team2 = team2;
        this.team1_goals = 0;
        this.team2_goals = 0;
    }

    get winner(){
        return this.winner();
    }

    get team1_points(){
        return this.team1_points();
    }
    
    get team2_points(){
        return this.team2_points();
    }

    winner() {
        if(this.team1_goals > this.team2_goals){
            return this.team1
        }else{
            return this.team2
        }
    }

    team1_points() {
        var points = 0;
        points = goals;
        if(this.team2_goals == 0){
            points += 3;
        }
        return points;
    }

    team2_points() {
        var points = 0;
        points = goals;
        if(this.team1_goals == 0){
            points += 3;
        }
        return points;
    }
}


const g1 = new Match(team1, team2);
const g2 = new Match(team3, team4);
const g3 = new Match(team5, team6);


function startMatch(duration){
    var countdown_date = new Date().getTime() + duration;

    var x = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();
          
        // Find the distance between now and the count down date
        var distance = countdown_date - now;
          
        // Time calculations for days, hours, minutes and seconds
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
        // Output the result in an element with id="demo"
        document.getElementById("timer").textContent = minutes + "m " + seconds + "s ";
          
        // If the count down is over, write some text 
        if (distance < 0) {
          clearInterval(x);
          document.getElementById("timer").textContent = "GAME OVER";
        }
      }, 1000);
}