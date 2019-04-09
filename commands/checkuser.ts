exports.run = (client, message, args) => {
console.log(message)
const Enmap = require("enmap");
class channelToAnalyse {
    channelid: string;
    channelName: string;
    channelLogs = []
}
class channelUseTime {
    channelName: string;
    channelTime: number;
}


var guildMap = new Enmap({
      name: "guilds",
      autoFetch: true,
      fetchAll: true,
  });
  let botFunctions = require("./other/botFunctions.js")
 //gets the lifetime voice use of a member based on ID
 message.guild.fetchMembers('', 10000)
 .then(function(){
   let userid = message.content.substring(13)
   let thisUser = message.guild.members.get(userid)


   //gets the users name from the guild and also the current voice channels to check, we have the logs of unused voicechannels but are not including them at this time for better readablity
   if (thisUser) {
       userid = thisUser.id
       let userName = thisUser.displayName
       let channels = message.guild.channels.array();
       channels = channels.filter(function(channel) {
           return channel.type === "voice"
       })

       guildMap.defer.then(() => {
         let thisGuild = guildMap.get(message.guild.id)
         let userLogs = thisGuild.guildLogs
           let thisUsersFriends = botFunctions.getFriends(userid,message.guild.id,thisGuild);
           let channelsSorted = []
           let messageArray = []


           //gets all the logs for this member
           userLogs = userLogs.filter(function(id) {
               return id.userid === userid;
           })

           for (var i of channels) {
             //sorts users logs into objects for each channel
               let channelTime = 0;
               var globalChannelid = i.id.toString()

               let thisChannelsLogs = userLogs.filter(function(log) {
                   return log.voiceChannelid === globalChannelid

               })

               for (var k of thisChannelsLogs) {

                   let timeSpent = k.timeLeave - k.timeJoin;

                   channelTime += timeSpent
               }
               let newObj = new channelUseTime

               channelTime = botFunctions.convertToHours(channelTime)

               newObj.channelName = i.name;
               newObj.channelTime = channelTime;

               channelsSorted.push(newObj)
           }
           //sorts the channel objects by usetime
           channelsSorted = channelsSorted.sort(function(a, b) {
               return b.channelTime - a.channelTime
           })
           //converts objects into formatted string for sending
           messageArray.push("**Best Friends**\r")
           for(let friend of thisUsersFriends){
             if (messageArray.length > 3){break}

             let thisMember =   message.guild.members.get(friend.user);

               if(thisMember){
                 let thisName = thisMember.user.username
                 messageArray.push(thisName+" : "+friend.time+" hours \r")}




         }
           for (let channel of channelsSorted) {
               messageArray.push("**" + channel.channelName + "** : " + channel.channelTime + " \r")

           }
           botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageArray, userName + "'s activity",client)
       })
   } else(message.channel.send("sorry I dont see that user"))
  
})}
