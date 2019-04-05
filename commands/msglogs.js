const Enmap = require("enmap");

exports.run = (client, message, args) => {
var guildMap = new Enmap({
      name: "guilds",
      autoFetch: true,
      fetchAll: true,
  });
  let botFunctions = require("./other/botFunctions.js")

guildMap.defer.then(() => {
 let guild = guildMap.get(message.guild.id)
 let uniqueAuthors = botFunctions.groupUnique("user",guild.messageLogs)
 let uniqueChannels = botFunctions.groupUnique("channel",guild.messageLogs)

 for(let unique of uniqueAuthors){
   let length = unique.matchingLogs.length
   message.guild.fetchMember(unique.uniqueProp)
   .then(function(user){console.log(`${user.displayName} : ${length}`)})
   .catch(console.error)

 }
 for(let unique of uniqueChannels){
   let length = unique.matchingLogs.length

   console.log(`${unique.uniqueProp} : ${length}`)}



})
}
