exports.run = (client, message, args) => {

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
  //this command is a bit outdated, needs to be cleaned up
  let guild = message.guild.id;
  let voiceChannelObjs = [];
  let finalObjs = [];
  let messageToSend = []
  let combinedTimes = 0;
  guildMap.defer.then(() => {
      let guildLogs = guildMap.get(guild)
      guildLogs = guildLogs.guildLogs; // I need more names for things...
      console.log("guildLogs:" + guildLogs.length)
      guildLogs = botFunctions.filterLogs(guildLogs, 604800000, false, false)

      let guildChannels = message.guild.channels.array()

      //collects currently existing channels
      for (var i of guildChannels) {
          if (i.type === "voice") {
              let logObj = new channelToAnalyse
              logObj.channelid = i.id.toString();
              logObj.channelName = i.name
              voiceChannelObjs.push(logObj)
          }

      }
      for (var obj of voiceChannelObjs) {
          let thisChannelsLogs = [];
          for (var log of guildLogs) {

              if (log.voiceChannelid === obj.channelid) {

                  thisChannelsLogs.push(log)
              }



          }



          obj.channelLogs = thisChannelsLogs;
      }


      for (var i of voiceChannelObjs) {

          let channelTime = 0
          for (var x of i.channelLogs) {

              let useTime = x.timeLeave - x.timeJoin
              channelTime += useTime;

          }
          let newObj = new channelUseTime
          newObj.channelName = i.channelName

          newObj.channelTime = botFunctions.convertToHours(channelTime)
          finalObjs.push(newObj)
      }
      finalObjs.sort(function(a, b) {
          return b.channelTime - a.channelTime
      })

      for (var log of finalObjs) {
          messageToSend.push("**" + log.channelName + "** : " + log.channelTime + " Hours \r")
      }
      botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageToSend, "Voice Use in the Past Week",client)
  })

}
