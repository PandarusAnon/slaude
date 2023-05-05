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

## Starting the server and connecting to SillyTavern
It is recommended but not required to use the latest dev version of SillyTavern.

Run start.bat or start.sh depending on your system of choice or just do `npm install` and `node app.js` manually. It's not rocket science. Once the server is running you should see `Slaude is running at http://localhost:5004` if you're using the default port.

In SillyTavern, click the API connections button and switch the API to OpenAI. Enter whatever you want in the API key field. The selected model doesn't matter either.

In the AI Response Configuration, paste the above URL into the Reverse Proxy field. I recommend creating a new preset for Claude. If you already have one for Spermack that should work fine. Set the context size to something sensible. Something between 4000-5600 should be safe. Max Response Length, Temperature, Frequency Penalty and Presence Penalty are all irrelevant and will be ignored, as will most other OpenAI specific settings. Streaming should work but I personally don't use it so I didn't test it that much.

What to use for your prompts is up to personal preference. I personally don't believe Claude needs any jailbreaks and never used any. If you do decide to send the jailbreak _do not use the default SillyTavern jailbreak_.

Once all that is set up press "Connect" back in API Connections. If everything was set up correctly the dot under the button should go green and say "Valid".

If you configured everything in Slaude correctly as well and made sure to accept Claude's ToS you should now be good to start prompting.

Note that you do not need to have Slack open in your browser for this to work. Once this is set up you can in theory just never open your workspace again.

# Final note
I don't believe in names or avatars. I will be PandarusAnon on here because I needed a name for GitHub but I don't and won't use this name anywhere else.