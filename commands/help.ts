exports.run = (client, message, args) => {
message.channel.send({embed: {
color: 2552550,
author: {
name: message.member.name,
icon_url: message.guild.splashURL,
},
fields: [
{
    name: "!iam",
    value: '**you dont need b3 for the !iam commands** \r **add**-Allows you to join any roles currently allowed by the server, for help on setting up these roles, use the command adminhelp \r **leave**-Allows you to leave any roles currently allowed by the server \r **roles**- shows what roles are currently available '
  },
{
  name: "Miscellaneous",
  value: 'group- creates and invite link for the channel you are currently in\r **party**- creates two parties at random from the voicechannel you are currently in \r  '
},
{
  name: "Statistics",
  value:"**past week**- Shows voice usage on server in the past week\r **selfcheck**- shows your personal voice stats from the start of when the bot was added to the server\r **check user**- shows someone else's all time voice stats, works off id eg 'check user 19823123'\r **channel survey**- shows all time usage for every voicechannel\r **rolecheck**- counts up the amount of people with each role\r**usercount**- displays the total time of the top 30 users on the server  "
},

],
timestamp: new Date(),
footer: {
icon_url: client.user.avatarURL,
text: "© BetterBots"
}
}
})
}
