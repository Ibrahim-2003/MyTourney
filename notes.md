# Jobs completed:
    -> Setup the profile page, team page, and friends (work in progress) page
    -> Login completed, database setup and API setup done
    -> Registration completed
    -> Authentication completed
    -> Finished connecting node.js backend and mysql database
    -> Finished working on creating registration forms
    -> Created form for users to register and login
    -> Created form for host to post tournament
    -> Setup the Host page
    -> Fixed the coordinate JSON get request and the host_id issue

# To do next:
    -> Make dynamic listings (ie. show the images updating, detailed views, etc.)
    -> Setup the leaderboards page
    -> Setup the detailed view for the tourney from the player perspective
    -> Add search, filter, sort functions to tourney listings
        *Sort by:
            -Location - use geolocation API to extract the user's current location and sort nearest by using haversine formula (https://www.movable-type.co.uk/scripts/latlong.html)
            -Entry fee - highest and lowest entry fee sorting
            -Max participants
            -Name (alphabetical)
        *Filter:
            -Gender
            -Team size
            -Distance (only show tourneys x miles from location)
            -Age Group (youth (3-14), high school (14-18),  adult (19+))
    -> Setup history page and balance page for players and hosts
    -> Put an add members button to team page
        //IDEAS
            -The team page will have the team id in the url. Add a share button that copies the url of the team id and allows the users to join their friend's team.
    -> Add payment system (Stripe, Apple Pay, Samsung Pay, Google Pay)
        //NOTES
            -Important to consider the order in which the users get paid. (ie. I get paid everything, then I pay the host, and I also pay the winning team)

    //Not essential for MVP
    -> Work on making bracket screen

## Creating Forms
    -> Form for users to edit profile
    -> Form for users to create team and adjust team members
    -> Form for users to join tournament
        //IDEAS
            -The tourneys on the home screen will link to a URL page with the tourney ID as a query parameter. When the GET request for that URL is made, the page updates with that tourney's detailed info. A button will show up that allows a team member to start the enter process. Other members will receive a notification if they want to join. The notification will link to the payment screen.