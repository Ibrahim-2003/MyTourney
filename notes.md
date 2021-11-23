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
    -> Work on making terms and conditions agreement
    -> Work on making waiver removing liability for injuries incurred at tourneys

## Creating Forms
    -> Form for users to edit profile
    -> Form for users to create team and adjust team members
    -> Form for users to join tournament
        //IDEAS
            -The tourneys on the home screen will link to a URL page with the tourney ID as a query parameter. When the GET request for that URL is made, the page updates with that tourney's detailed info. A button will show up that allows a team member to start the enter process. Other members will receive a notification if they want to join. The notification will link to the payment screen.

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