### Slaude is a small server serving as an interface between SillyTavern and Claude on Slack
This aims to serve as an alternative, but not a replacement, for Spermack. If Spermack works fine for you or you like its features there is no reason to use this beyond curiosity.

Credit to [Barbiariskaa/Spermack](https://github.com/Barbariskaa/Spermack) for the original idea to interface with Claude in Slack in this fashion.

The main difference to Spermack is in the way the context is sent to Slack. Instead of sending messages directly to Claude as DMs, Slaude will instead create threads in the configured Slack channel. The entire workflow is:
- Split the context into multiple parts that each fit into a single Slack message without cutoff
- Send the first part to the configured channel
- Send all other parts as replies to the original message
- Ping Claude with a final message, triggering his response

When working with threads Claude receives the entire message history of a thread as context. However, Claude will not actually respond to a thread until specifically asked to by pinging him. Claude has no knowledge of anything going on outside of the thread he's been called to with a ping.

Editing your chat history in SillyTavern is still possible with this solution as each prompt creates a new thread. The amount of message spam won't really be any different than with Spermack, it'll just happen in a different channel and collapsed into threads.

It does feel like sending the context this way has given Claude a bit more coherency but this might be entirely imagined. Feel free to try for yourself.

# Setup guide
## Creating a Slack workspace
First you will have to create a Slack workspace. You can do this for free at https://slack.com. Using an existing account and workspace is possible but very much not recommended. You'll also want to use open your workspace in a browser, not the Slack desktop app.

Once your workspace is set up, add the [Claude app](https://slack.com/apps/A04KGS7N9A8-claude) to your workspace. You will also need a channel to send the prompt message to but any of the ones that a new Slack workspace comes with by default will do.

## Setting up Slaude
Clone this repository or download it as a zip and extract it somewhere. You will also need Node and NPM installed but if you're using SillyTavern there is a good chance this is already the case so I'm not going to explain that here.

Open the `config.js` file with a text editor of your choice. You will have to fill in these values with information from your Slack workspace. The following will be described assuming you are using Chrome as a browser, but this should be possible with all of them with some minor differences.

### TOKEN
With your Slack workspace open in a browser, press F12 to open the developer tools and switch to the Network tab. With the developer tools still open, send a Slack message in any channel. You can use this opportunity to send any message to Claude which will prompt you to accept its ToS as that is required before using it. With that done, look for an entry starting with `chat.postMessage` in the Network tab, open it and click "Payload". In the Form Data you should find the token, starting with `xoxc-`.

### COOKIE
Still in the developer tools, switch from the Network tab to the Application tab. On the left look for `Cookies -> https://app.slack.com` then copy the value starting with `xoxd-`. After this we are done with the developer tools.

### TEAM_ID
This is the ID of your Slack workspace. You can find this by clicking on the name of Slack workspace in the top left. It should show your workspace URL. The part before `.slack.com` will be your TEAM_ID. For example, if the URL is `slaude-workspace.slack.com` then `slaude-workspace` is the TEAM_ID.

### CHANNEL
The ID of the channel we want to start the prompt threads in. This can be any channel, but a good fit is the default `#random` channel that comes with your workspace by default. Whatever channel you go with, open it and click the little arrow at the top next to the channel name. You can find the channel ID at the bottom of the resulting popup.

Once you've picked a channel and copied its ID, send a message anywhere in the channel that pings Claude with "@Claude". This will open a dialog asking for confirmation that Claude should be invited to the channel. Click on "Invite them" and Claude will now be able answer to your prompts in that channel.

### CLAUDE_USER
Open your Claude DMs and similarly to the above step click on the little arrow next to Claude at the top. The _Member ID_ is what we're looking for here, not the Channel ID.

### PORT
This only needs to be changed if you have anything else running on the same port already.

## Other settings
The following settings aren't required for setup and can be left on their defaults.

### MAINPROMPT_LAST
If set to true Slaude will try to move the main prompt, which is usually the block of text before the character definitions, to the bottom of the prompt we send to Slack. Can be helpful when as the context grows because this prevents the main prompt from being the first thing that falls out of memory. Both this setting and MAINPROMPT_AS_PING will break if you use double linebreaks anywhere in your main prompt or NSFW prompt as that's the only real way we have to determine where the main prompt stops and the character definition starts. That's a bit flimsier than I'd like but I'll look into other options. Single linebreaks are fine.

### MAINPROMPT_AS_PING
If set to true does the same as above, but uses the contents of the main prompt as the PING_MESSAGE instead (see below). This completely replaces the PING_MESSAGE set in the config. Using the main prompt we get from SillyTavern has the advantage that we have access to all placeholders, like `{{char}}` and `{{user}}`, and can use presets to change the PING_MESSAGE instead of having to edit the config every time. If you put an @Claude anywhere in your main prompt or NSFW prompt it will get replaced with the actual Claude ping, same as PING_MESSAGE. The jailbreak from SillyTavern is not included in this as it gets placed apart from the rest of the main prompt. If you want your jailbreak to be in the ping message too, try putting it in the main prompt or NSFW prompt instead.

### USE_BLOCKS
If set to false Slaude will send the prompt messages as plain text instead of Slack's blocks format. The result on Slack's end will be the same, though it reduces the maximum size of a single message to 4000 characters. This might not actually make any difference but turning this off might be slightly less error prone because we can just send the text as is instead of having to wrap it in blocks JSON.

### STREAMING_TIMEOUT
Sets the timeout in milliseconds for streaming the response back to SillyTavern if streaming is enabled. Default is 240000ms = 4m. After this time the stream will be force closed so SillyTavern doesn't hang forever for a response that isn't coming. Can be set to 0 to disable the timeout entirely though that is not recommended.

### PING_MESSAGE
This lets you configure what gets sent in the message that we use to ping Claude. This seems to have a pretty huge influence on his response, similar to a jailbreak. The default message is `"Assistant:"` and will prompt Claude to continue the context we sent him to the best of his abilites. If you put "@Claude" anywhere in the string that's where Slaude will put the actual ping, otherwise it will automatically be in front of the message. I would recommend to use the MAINPROMPT_AS_PING setting above instead but you can also use MAINPROMPT_LAST together with PING_MESSAGE if you want to have control over both.

## Starting the server and connecting to SillyTavern
It is recommended but not required to use the latest dev version of SillyTavern.

Run start.bat or start.sh depending on your system of choice or just do `npm install` and `node app.js` manually. It's not rocket science. Once the server is running you should see `Slaude is running at http://localhost:5004` if you're using the default port.

In SillyTavern, click the API connections button and switch the API to OpenAI. Enter whatever you want in the API key field. The selected model doesn't matter either.

In the AI Response Configuration, paste the above URL into the Reverse Proxy field. I recommend creating a new preset for Claude. If you already have one for Spermack that should work fine. Set the context size to something sensible. It's hard to tell how much context Slack actually lets us use so it's difficult to make a definite recommendation. Smaller context sizes will result in less dementia over time but also less memory. You shouldn't have to go lower than 3.5k though. Max Response Length, Temperature, Frequency Penalty and Presence Penalty are all irrelevant and will be ignored, as will most other OpenAI specific settings. Streaming should work but I personally don't use it so I didn't test it that much.

What to use for your prompts is up to personal preference. I personally don't believe Claude needs any jailbreaks and never used any. If you do decide to send the jailbreak _do not use the default SillyTavern jailbreak_.

Once all that is set up press "Connect" back in API Connections. If everything was set up correctly the dot under the button should go green and say "Valid".

If you configured everything in Slaude correctly as well and made sure to accept Claude's ToS you should now be good to start prompting.

Note that you do not need to have Slack open in your browser for this to work. Once this is set up you can in theory just never open your workspace again.

## Untested guide for running Slaude on Android with termux
Not tested if this works myself, but this guide was provided by a nice anon. This guide assumes you've already set up SillyTavern with termux.

Copy your config.js file from your desktop to your phone if you already have it set up there. Make sure you're using the same fork. If you don't have it setup then: Download the https://github.com/PandarusAnon/slaude zip off of GitHub using your phone's browser. (Use desktop mode code download zip).
Unzip the contents, open config.js file in a text editor. Edit the contents of the file following the instructions on the git page and save.
Use kiwi browser for access to developer tools. It's a hassle on mobile, just use desktop this one time copying the cookies and shit.
If you don't have a text editor (wow) use Acode or FX explorer.

termux-storage-get requires the Termux:API addon. https://wiki.termux.com/wiki/Termux-storage-get
Get it from here: https://www.f-droid.org/en/packages/com.termux.api/ and then run pkg install termux-api -y in termux.
If you don't want to install an extra app, you can learn to use a terminal text editor (look up how to use nano or vim) or follow the guide here: https://wiki.termux.com/wiki/Internal_and_external_storage to connect your termux storage to FX Explorer and edit files from there.

Now open termux and run the following:    
`termux-setup-storage` click allow storage access.  
`git clone https://github.com/PandarusAnon/slaude slaude` use the git link for whatever fork you want to use.  
`cd slaude`  
`npm install`  
`termux-storage-get config.js` Browse to the directory where you have your edited config.js file, and select the file to import it.  
Now you have installed and setup all the files necessary. To run Slaude do: `node app.js`. This step may be called something else depending on which git you selected so refer to the git page for the command to run the server.  
Now to run Silly, you need to run a separate Termux session. You can do that by pulling the sidebar from the top left. Tap and pull from the top left corner. Look up how to pull sidebars with gesture navigation on youtube if you're having trouble.  
Click on new session. You're loaded into a new session now, in the slaude directory though so you'll have to change to the silly directory. Do: `cd ~/silly_directory_name`. Now run your silly server with the regular `node server.js`. Follow the API instructions on the git page, and voila!

To run Slaude + Tavern next time, open termux like usual. In the first session do: `cd slaude && node app.js` to run slaude. Switch to a new session and `cd ~/silly_directory && node server.js`.  
\>I can't open the sidebar!  
Do: `nano ~/.termux/termux.properties`  
Type the line: `shortcut.create-session=ctrl + t` anywhere in the file, just make sure you're writing on a fresh line and press ctrl+o, enter, ctrl+x.  
Now to run a new session, simply press ctrl+t.


# Final note
I don't believe in names or avatars. I will be PandarusAnon on here because I needed a name for GitHub but I don't and won't use this name anywhere else.