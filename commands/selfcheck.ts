const Enmap = require("enmap");
var guildMap = new Enmap({
      name: "guilds",
      autoFetch: true,
      fetchAll: true,
  });
  
  class channelUseTime {
      channelName: string;
      channelTime: number;
  }
let botFunctions = require("./other/botFunctions.js")
exports.run = (client, message, args) => {
  let authorid = message.member.id.toString();
  let channels = message.guild.channels.array();
  channels = channels.filter(function(channel) {
      return channel.type === "voice"
  })

  guildMap.defer.then(() => {
      let channelsSorted = []
      let messageArray = []
      let userLogs = guildMap.get(message.guild.id)
      userLogs = userLogs.guildLogs


      userLogs = userLogs.filter(function(id) {
          return id.userid === authorid;
      })

      for (var i of channels) {
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
      channelsSorted = channelsSorted.sort(function(a, b) {
          return b.channelTime - a.channelTime
      })
      for (var channel of channelsSorted) {
          messageArray.push("**" + channel.channelName + "** : " + channel.channelTime + " \r")

      }
      botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageArray, "Heres your activity!",client)
  })
}
