exports.run = (client, message, args) => {
  let botFunctions = require("./other/botFunctions.js")
class monthCount {
   monthYear: string;
   time: number;
   count = 1;
}
let messageToSend = []
let messageGuild = message.guild.fetchMembers('', 10000)
   .then(function() {
       let guildMembers = message.guild.members.array()
       let times = []
       for (let thisMember of guildMembers) {
           times.push(thisMember.joinedTimestamp)

       }

       times = times.sort(function(time, time2) {
           return time - time2
       })
       let time = new Date().getTime()
       //get the milliseconds between the first person joining and current day
       time -= times[0]
       //convert to months
       time = time / 2592000000
       //round to 2 digits


       let joinRate = time / times.length
       joinRate = Math.round(joinRate * 100) / 100
       let currentMonth
       let currentMonthObj
       let months = []
       for (let joinTime of times) {
           let thisLogsDate = new Date(joinTime);
           if (thisLogsDate.getMonth() != currentMonth) {
               let newMonthObj = new monthCount
               newMonthObj.monthYear = thisLogsDate.getMonth() + "/" + thisLogsDate.getFullYear()
               newMonthObj.time = joinTime
               if (currentMonthObj) {
                   months.push(currentMonthObj)
               }
               console.log(currentMonth + " : " + thisLogsDate.getMonth())
               currentMonthObj = newMonthObj
               currentMonth = thisLogsDate.getMonth()

           } else {
               currentMonthObj.count += 1
           }
       }
       console.log(months[0] + " " + months.length)
       for (let month of months) {
           messageToSend.push(month.monthYear + ": **" + (month.count+1)+"** Members \r")

       }
       botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageToSend, "Average Growth is " + joinRate + " Members",client)
   })}
