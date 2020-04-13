// For connecting to Twitch
const tmi = require('tmi.js');

// Tweet specifics
var PreviousTweetBody = ""; // Leave blank
var CurrentTweetBody = ""; // Leave blank
var PersonNameToPublish = "Trump"; // How to announce this account in chat, can be anything
var TwitterAccountName = "realdonaldtrump"; // name of the Twitter account: https://twitter.com/realdonaldtrump
var TweetOrRetweet = "Tweet"; // Could be a boolean, but using text in case users want to exten beyond tweets and retweets

// If 'true', this will repeat the last message if it's a duplicate
// If 'false', only new messages are posted to chat (some duplciates still come through)
const DuplicateTweets = false;

// This is an ongoing list of weird characters found in Twitter
// We could get more technical, but this will do for a first release
var ArrayOfWeirdCharacters = [
["&amp;", "&"],
["&#10;", " "],
["&quot;", "\""],
["&lt;", "<"],
["&gt;", ">"],
["&#39;","'"]
];


// Twitch
// Define configuration options
const opts = {
	identity: {
		username: <replace_me>, // Name of the bot account, example: username: 'accountname'
		password: <replace_me> // Auth token of the bot account, example: password: 'oauth:4seeee33535ewer35tewrw334'
	},
	channels: [
		<replace_me> // Name of channel to join, example: 'channel_name'
	]
};

// Twitch
// Create a client with our options
const client = new tmi.client(opts);

// Twitch
// Register our event handlers (defined below)
client.on('connected', onConnectedHandler);
client.on('message', onMessageHandler);

// Twitch
// Connect the bot to Twitch
client.connect();


// No Twitch functions below this lineHeight
// ------------------------------------


// When was the tweet made (according to twitter)
// More text stripping and manipulation
function GetTweetTime(TweetTime) {
	TweetTime = TweetTime.substring(TweetTime.indexOf("<td class=\"timestamp\">")+25);
	TweetTime = TweetTime.substring(TweetTime.indexOf(">")+1);
	TweetTime = TweetTime.substring(0,TweetTime.indexOf("<"));
	TweetTime = TweetTime.trim();

	return TweetTime;
}

// Whether to announce a tweet or retweet
// Text returned is directly used in chat message
function CheckIfRetweet(HTMLData) {
	// Further extracts some text from the response body
	var StringShredder = HTMLData.substring(0,HTMLData.indexOf("<div class=\"tweet-text\""));
	
	// Check if a Tweet or Retweet
	if (StringShredder.includes('retweeted</span>') == true)
	{
		TweetOrRetweet = "Retweet";
	}
	else
	{
		TweetOrRetweet = "Tweet";
	}
}

// Remove all* ridiculous Twitter (un)formatting
// (unlikely to ever get all of it)
function StripLinksInText(InputString) {
	var theInputString = InputString;
	
	// Iterate throught he code, trying to remove anything with an <a></a> tag
	do {
		// These get the opening tags
		var StartString = theInputString.substring(0,theInputString.indexOf("<a"));
		var EndString = theInputString.substring(theInputString.indexOf(">")+1);
		// This kills the null
		var MidString = "";

		// Person tag - @
		if (EndString.charAt(0) == "@") {
			theInputString = StartString + EndString;
			theInputString = theInputString.replace('</a>','');
		}
		// Hash tag - #
		else if (EndString.charAt(0) == "#") {
			theInputString = StartString + EndString;
			theInputString = theInputString.replace('</a>','');
		}
		// HTML link - replaces with the custom text '[link]'
		// We don't want to spam chat with links. We don't know what they are and chat may not support them
		else {
			MidString = EndString.substring(EndString.indexOf("</a>")+4);
			theInputString = StartString + "[link]" + MidString;
		}

	} while (theInputString.includes("<a "));

	theInputString = theInputString.trim();

	return theInputString;
}

// Download the page - returns the body text
function ReadLatestPost() {
	
	// This is required for downloading the web page
	var request = require("request");
	
	// As we're keeping this as low profile as possible, things may break
	// This is some alerting text so we know coding of the Twitter page has changed
	var s_FinalText = "If you can see this, I'm broken.";
	
	request(
		{ uri: "https://mobile.twitter.com/" + TwitterAccountName },
		function(error, response, body)
		{
			// Process the body response
			ProcessLatestPost(body);
		}
	);
}


// Strips the body text to info we're interested in
// Posts to chat then sets a timeout (delay) to reading Tweets again
function ProcessLatestPost(body) {
	// We're going old school with a lightweight approach for editing
	// No external libraries, just stripping text in chunks
	
	// General text stripping
	s_FinalText = body.substring(body.indexOf("<div class=\"timeline\">") + 1);

	// Strip the time
	var TweetTime = GetTweetTime(s_FinalText);

	// Check if retweet
	CheckIfRetweet(s_FinalText);

	// Strip the remaining HTML to get the latest tweet body
	s_FinalText = s_FinalText.substring(s_FinalText.indexOf("<div class=\"tweet-text\"") + 1);
	s_FinalText = s_FinalText.substring(s_FinalText.indexOf("<div") + 1);
	s_FinalText = s_FinalText.substring(s_FinalText.indexOf(">") + 1);

	s_FinalText = s_FinalText.substring(0, s_FinalText.indexOf('</div>'));
	s_FinalText = s_FinalText.trim();

	// We have the body text, now to remove any links (strip @, replace <a>)
	if (s_FinalText.includes("<a ") == true) {
		s_FinalText = StripLinksInText(s_FinalText);
	}

	// Replace weird characters from the Tweet with our (better) text
	// Iterate through the array at the top of the script
	ArrayOfWeirdCharacters.forEach(function(WeirdCharacter) {
		// We need to convert the werid Twitter text to a regex
		const replacer = new RegExp(WeirdCharacter[0], 'g') // 'g' so it replaces all instances, otherwise it would only be the first
		// Perform the text replacement
		s_FinalText = s_FinalText.replace(replacer, WeirdCharacter[1]);
	});

	// Remove all non-ascii characters (bit dangerous but Twitter shouldn't allow these!)
	s_FinalText = s_FinalText.replace(/[^\x00-\x7F]/g, "");

	// Let's remove all long spaces to save some characters (Twitch limited to 160)
	s_FinalText = s_FinalText.replace(/  /g,' ');

	// If our text still has HTML it means the page hasn't loaded correctly or something else has broken
	// From experience, the '<tr>' is a very reliable check
	if (s_FinalText.includes('<tr>') == true)
	{
		console.log("Page hasn't loaded properly! This will be picked up next refresh.");
	}

	// If no HTML is present, the message should be good to announce to chat
	else
	{
		// This is the text we check each time the page is scraped to verify whether it's a new Tweet/Retweet
		CurrentTweetBody = "\"" + s_FinalText + "\"";
		
		// This builds our complete final message
		s_FinalText = (PersonNameToPublish + ' ' + TweetOrRetweet + ': [' + TweetTime + '] ' + s_FinalText);

		if (DuplicateTweets == true)
		{
			// Mixer will only accept messages of 160 characters
			// Twitch limit is around 500(!) as IRC standards, which is far more than twitter

			// Post to global chat
			client.say(opts.channels[0], "/me " + s_FinalText);
			
			// Also log the message to the console so we can inspect later, optional
			console.log(s_FinalText);

			// Set the previous Tweet to the current Tweet for comparing on next scrape
			PreviousTweetBody = CurrentTweetBody;
		}
		else
		{
			// Only post to chat if it's a new message
			// Same commands as above 
			if (PreviousTweetBody !== CurrentTweetBody){
				client.say(opts.channels[0], "/me " + s_FinalText);
				console.log(s_FinalText);
				PreviousTweetBody = CurrentTweetBody;
			}
		}
	}

	// Scrape the page again after this amount of time...
	setTimeout(ReadLatestPost, 60000); // 1 minute (60000)
}


// This event is fired whenever you receive a chat, action or whisper message
// Trump bot only cares about whispers
// We could expand this to only listen to whispers from the host by checking for the username in 'msg'
function onMessageHandler (channel, userstate, msg, self) {
	
	// Ignore messages from the bot
	if (self) { return; }

	// Check for different types of messages
    switch(userstate["message-type"]) {
        case "action":
            // This is an action message... we don't need it
            break;
        case "chat":
            // This is a chat message... we don't need it
            break;
        case "whisper":
			// Remove any blank spaces or carriage returns from the message
			const commandName = msg.trim();
			// If we receive this command the bot will repeat the last Tweet
			// ...would be better as a whisper, but Twitter hates whispers and we're trying to keep these scripts consistent
			if (commandName === '!TrumpBotReset') {
				// Reset the Tweet text so the bot thinks everything is new
				PreviousTweetBody = "";
			}
            break;
        default:
            // Should never get here
			console.log('Should never get here');
            break;
    }

}


// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
	console.log("Connected to " + addr + ", port: " + port);
	
	// Read the first Twitter post
	// Subsequent reads are triggered at the end of the read function
	ReadLatestPost();
}