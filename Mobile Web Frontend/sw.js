self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('fox-store').then((cache) => cache.addAll([
        'images/MyTourney Logo.png',
        'images/icon.png',
        '/add_tourney.ejs',
        '/balance.ejs',
        '/create_team.ejs',
        '/friends.ejs',
        '/home.ejs',
        '/host_home.ejs',
        '/host_signup.ejs',
        '/host_tourney_details.ejs',
        '/join_team.ejs',
        '/leaderboard.ejs',
        '/login.ejs',
        '/manage_tourney.ejs',
        '/match_score.ejs',
        '/no_team.ejs',
        '/preorder.ejs',
        '/profile_player.ejs',
        '/register.ejs',
        '/signedup.ejs',
        '/summary.ejs',
        '/team_player.ejs',
        '/tourney_details.ejs',
        '/tourney_end.ejs',
        '/unverified.ejs',
        '/verify_login.ejs',
        '/winner.ejs',

      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });