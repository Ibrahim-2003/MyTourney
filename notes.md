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
    -> Sort by distance function created (still need to work on sort UI)
        -> Flushed out and working now, so that I have the SQL query results sorted with all details
    -> Fixed file upload
        -STILL NEED TO CONNECT TO AWS S3 SERVER TO PERSIST FILES (OTHERWISE, HEROKU WILL LOSE IMAGES UPON UPDATING SERVER)
    -> Made dynamic listings (ie. show the images and details updating)
    -> Finished working on participating teams feature
        -Added number_of_teams_participating to tourneys table
    -> Completed detailed view for the tourney from the player perspective
    -> Completed native share button
    -> Set up emails and email verification
    -> Finished the leaderboards page
    -> Finished balance page
    -> Finished form for users to join tournament
    ** UPDATED MYSQL DATABASE ON MAC
    -> Fixed the create team function
    -> Fixed leaderboard errors

# To do next:
    **Note: The team captain enters the team into a tourney, and the team can sub out players between matches.
    -> Add deleting capabilities
    -> Make home_coords dynamic in node.js server
        -Idea: Make the client-side js extract ip, then pass that as query parameter and read into the server-side login.js
    -> Add join functionality
        //IDEAS
            -The team page will have the team id in the url. Add a share button that copies the url of the team id and allows the users to join their friend's team.
    -> Make host tourney screen dynamic
    -> Paginate search results
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
            -Age Group (child (3-7), youth (7-12), high school (13-18),  adult (19+))
    -> Setup history page for players
    
    -> Add payment system (Stripe, Apple Pay, Samsung Pay, Google Pay)
        //NOTES
            -Two transactions:
                1) Collect payments from players and use charge-transfer function of Stripe to keep my cut and transfer the host's cut
                2) A player can cash out their earnings once they have made $100 using the mass payouts function of Paypal API
    -> Add game-management and score update page
        -Include match-making function
        -At the start, only the team leader can initiate joining a tourney

    //Not essential for MVP
    -> Add filters to sort leaderboards (ie. most goals, most saves, etc)
    -> Add fallback for native sharing (with hidden div and buttons)
    -> Fix look on iOS
    -> Work on making bracket screen
    -> Add password length and character requirements
    -> Add errors to the forms to catch any impossible birthdates, too many max participants, too low or too high entry fee, etc.
    -> Work on making the site responsive on desktop and tablets
    -> Work on making terms and conditions agreement
    -> Work on making waiver removing liability for injuries incurred at tourneys
    -> Refactor CSS to be organized

## Creating Forms
    -> Form for users to edit profile
    -> Form for users to create team and adjust team members

## Production Cost
    <<<MVP: $28/month>>>
    -> Domain Name
        <$12/year>
        -www.winmytourney.com
        -Google Domain
        -https://devcenter.heroku.com/articles/custom-domains
        -Professional Google Workspace email address $6/month
            *Includes 30GB of Google Drive space
            *Up to 100 participants in a Google Video call
    -> Website and database will be hosted on Heroku
        <$16/month Basic Plan>
        -Database must migrate from MySQL to Postgres
        -SSL certificates provided
        -Maximum of 20 connections to database with 10 million row limit
    -> CDN will be hosted with Amazon S3
        <$5/month Basic Plan>
        -Bucketeer addon on Heroku will connect the S3 CDN to the web app
        -Use a compression algorithm to reduce filesize of images
        -Cheapest Bucketeer option includes 5GB storage
    -> Email sending
        -Start with free SMTP email linked to professional Google Workspace email (https://www.courier.com/blog/how-to-send-emails-with-node-js)
            *Can upgrade to other standalone email service later as I have more money

## Future Costs
    -> Stripe Payments -> Collect fees and transfer the hosts payment
        2.9% + $0.30 per transaction
    -> Paypal Payouts -> Pay winners
        -https://developer.paypal.com/docs/api/payments.payouts-batch/v1/
        -https://github.com/paypal/Payouts-NodeJS-SDK/blob/master/samples/createPayout.js
        2% per mass payout
    -> Marketing
        Google Ads deal = $150 credit for spending of $150
        $500 free advertising credit Google Ads
        Would like to learn more about best avenues -> Where are the people playing sports (Facebook, Insta, YouTube, etc.)
    -> Expanding Heroku pricing plan
    -> Expanding email plan

Ask people around who are interested in app -> T-shirt with logo
Divinc -> Apply to accelerator
Main Lane -> Esports How they got funding
Look for interns to help with marketing
Launchpad January 19 -> 6 weeks -> Innovators and entrepreneurs into shuttles based on industry
Turkey Run -> Target market
I have a startup I am planning to launch in spring 2022 and looking for intern unpaid to help with marketing
Rice Ventures Christa Westheimer - I am interested in Rice Ventures https://riceventures.org/ -> Startup summit sunday
https://workamericacapital.com/ -> Investor