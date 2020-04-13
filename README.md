Streaming Bot - Last Twitter Post
==================================
Simple scraper for Twitter which returns the users last post. This post is stripped and sent to the global chat channel. Can be configured to repost the same message every time or only post new messages. By default it scrapes every 60 seconds.

I know there's a Twitter API to do this but Twitter demand you subscribe to it and demand you fill in a ridiculous form. I'd rather just scrape the page. This doesn't use any fancy libraries, it's a simple text stripping.

This was originally written for Mixer then ported to Twitch. The coding is nearly identical. The big differences are connection methods and messaging.

Twitch doesn't fully support whispers, Mixer does. I created a new Twitch account and 3 days later I was still unable to send whispers. Apparently this is intentional as some form of anti-spam? It's ridiculous and greatly reduces the viability of this game. There's a Twitch script regardless.

There are 2 versions available in the folders:
- 'Single'
  - Updates from a single Twitter account (a little simpler to follow)
  - Change the following variables at the top of the script:
    - PersonNameToPublish = ""; -> Name of acount as you want it announced in chat
    - TwitterAccountName = ""; -> twitter account name to scrape
  - I've pre-loaded with Trump. Enjoy.
- Multi
  - Updates from multiple Twitter accounts
  -  Change the following variables at the top of the script:
    - The same as single, but everything is held in an array - ArrayOfTweeters
    - Add as many as you like
  - As noted in the script, update times are kind of dynamic. The total time is divided by the number of accounts so they aren't all spammed at the same time when an update is found
  - I've pre-loaded with Trump, Crowder and Metacritic. One of them is a joke.
  - No reason this couldn't be used for a single account, just put 1 account in the array
  

LEGAL STUFF:
============
You do not have permission to use or modify any of the content in this reprository if...

...you are an e-beggar, tit streamer or someone who can't be bothered to try at real job and provide some worth to society. If you're the kind of person who is featured on the Mixer homepage then this is not for you. If you spend your time in the 'just chatting' portion of Twitch or have a pre-stream, this is not for you.

If in doubt, mail me with a link to verify your societal status.

If this breaks something or you get banned for using it, that's your problem not mine.


REQUIREMENTS:
=============
Each scripts is intended to run from an account, either Twitch or Mixer. You can create a new account or use your host account.

Scripts can be run from any machine. They don't need to be on the hosting computer and should work on Windows or Linux as they're Node.js scripts.

An external package is required; 'request'. This is for easily downloading the web page body. Install with;
- npm install request


MIXER:
======
It's assumed users have followed the installation on the dev sites...
Ref: https://dev.mixer.com/guides/chat/introduction
Ref: https://dev.mixer.com/guides/chat/chatbot

Search the script for '<replace_me>' and replace the details as they're found:

- access: <replace_me>,
-- This can be found on the '/chatbot' link above by clicking the link in the matching code (simplest way of finding it)

- const targetChannelID = <replace_me>
-- This can be found: https://mixer.com/api/v1/channels/<channel_name>?fields=id
-- Obviously change 'channel_name' to the name of the channel you want to join

Run the script: node LastTwitterPost_mixer.js


TWITCH:
=======
It's assumed users have followed the installation on the dev sites...
Ref: https://dev.mixer.com/guides/chat/introduction


Search the script for '<replace_me>' and replace the details as they're found:

- username: <replace_me>
-- Name of the bot account

- password: <replace_me>
-- When logged in to the Twitch bot account, go to this page and connect:
--- https://twitchapps.com/tmi/
-- The entire string: 'oauth:oauth:jnmki23o9278h4kjhe9w843vew9ewaa7'

- channels: [ <replace_me> ]
-- Name of the channel to join as it appears in a browser such as: https://www.mixer.com/replace_me


Run the script: node LastTwitterPost_twitch.js


CONFIGURATION:
==============
Hopefully the comments in the code make some sense.

'PersonNameToPublish' is the name of the Twitter account as it appears in chat. Some people have weird Twitter names so this allows us to make them cleaner.

'TwitterAccountName' is the actual account name in Twitter of the person to follow. it can be found on the URL as: https://twitter.com/realdonaldtrump

'DuplicateTweets' dictates whether only new Tweets should be messaged out. Some duplciated tweets may still appear due to re-formatting by the post on Twitter or if the user removes/edits a post.

Set the scrape times on the 'ReadLatestPost' function calls. Defaults to 60 seconds (60,000ms).


LIVE DEMO:
==========
Available on request. I have a Mixer and Twitch demo channel used for developing and testing stream tools:
- https://mixer.com/1738_Creations
- https://www.twitch.tv/1738_creations

...the bots only run when I stream. If you'd like a demo then send a request (1738creations@gmail.com) with the stream name and I'll set them up.



======================

Shout out Sean Ranklin

Pig-ups Liquid Richard.


Covid19 isn't a threat. The numbers don't lie, people do. Stop using social media and supporting mainstream fake news. The WHO are corrupt.
