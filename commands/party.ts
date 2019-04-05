exports.run = (client, message, args) => {
  class party {
    id:string;
    members = []
  }
  let botFunctions = require("./other/botFunctions.js")
//makes sure that the member is in a voicechannel, so that it has people to split up
   if (message.member.voiceChannel) {


       let teamSize
       let subStringInd = 9;
       let teams = []
       let messageString = []
       let totalPeople = message.member.voiceChannel.members.array()
       //partyadmin is for when the person sending the command doesnt want to be sorted into a team
       if (message.content.includes("partyadmin")) {
           totalPeople = totalPeople.filter(function(user) {
                   return user.id !== message.member.id
               }

           )
           subStringInd = 14
       }

       let substring = message.content.substring(subStringInd)

       //check if they want to customize the teamSize
       if (isNaN(substring) === false && substring > 0) {
           teamSize = substring

       } else(teamSize = totalPeople.length / 2)


       let totalPeopleString = [];
       for (let member of totalPeople) {
           totalPeopleString.push(member.displayName)
       }
       totalPeopleString = botFunctions.shuffle(totalPeopleString);
       let teamCount = Math.ceil(totalPeopleString.length / teamSize);
       let loopCount = 0
       while (loopCount < teamCount) {
           let thisTeamFormatted = []
           let thisTeam = totalPeopleString.splice(0, teamSize)


           let newTeam = new party
           newTeam.members = thisTeam
           newTeam.id = "**Party " + (loopCount + 1) + "**\r"
           loopCount++
           teams.push(newTeam)

       }

       for (let team of teams) {
           messageString.push(team.id + team.members + "\r")
       }
       if (!substring) {
           botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageString, "Parties", client)
       } else(botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageString, teamSize + " Man Parties"))
   } else(message.channel.send("you have to be in a voice channel"))}
