# MyTourney
MyTourney was a mobile web application which connects soccer players to tournaments nearby to compete for monetary prizes. Hosts can create accounts and upload tournaments to the application for the players to view. Players can make teams with their friends and join the tournaments together. Players pay an entry fee, which are all pooled together and distributed between the host (30%), the MyTourney business (15%), and the winning team (55%).

---
## How to Run on Local Machine
1) Ensure the database is running the ```mytourney_db.sql``` (I recommend using MySQL workbench to set up)
2) Check the database password in the ```login.js``` matches your local MySQL workbench password
3) cd into the ```Mobile Web Frontend``` folder and run the following command:
```
npm run devStart
```