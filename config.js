const config = {
    TOKEN: "xoxc-xxxx",
    COOKIE: "xoxd-xxxx",
    TEAM_ID: "workspacename",
    CHANNEL: "C1234D4567S",
    CLAUDE_USER: "U1234A568BC",

    // The final message we send with an @Claude ping to trigger his response.
    // Can be whatever you want it to be but keep in mind that it might result in unpredictable responses.
    // Anything we put here will eat into our max available tokens so keep it brief. Anything above ~12000 characters will get cut off by Slack
    PING_MESSAGE: "Assistant:",

    PORT: 5004
}

export default config;