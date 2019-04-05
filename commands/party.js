exports.run = function (client, message, args) {
    var party = /** @class */ (function () {
        function party() {
            this.members = [];
        }
        return party;
    }());
    var botFunctions = require("./other/botFunctions.js");
    //makes sure that the member is in a voicechannel, so that it has people to split up
    if (message.member.voiceChannel) {
        var teamSize = void 0;
        var subStringInd = 9;
        var teams = [];
        var messageString = [];
        var totalPeople = message.member.voiceChannel.members.array();
        //partyadmin is for when the person sending the command doesnt want to be sorted into a team
        if (message.content.includes("partyadmin")) {
            totalPeople = totalPeople.filter(function (user) {
                return user.id !== message.member.id;
            });
            subStringInd = 14;
        }
        var substring = message.content.substring(subStringInd);
        //check if they want to customize the teamSize
        if (isNaN(substring) === false && substring > 0) {
            teamSize = substring;
        }
        else
            (teamSize = totalPeople.length / 2);
        var totalPeopleString = [];
        for (var _i = 0, totalPeople_1 = totalPeople; _i < totalPeople_1.length; _i++) {
            var member = totalPeople_1[_i];
            totalPeopleString.push(member.displayName);
        }
        totalPeopleString = botFunctions.shuffle(totalPeopleString);
        var teamCount = Math.ceil(totalPeopleString.length / teamSize);
        var loopCount = 0;
        while (loopCount < teamCount) {
            var thisTeamFormatted = [];
            var thisTeam = totalPeopleString.splice(0, teamSize);
            var newTeam = new party;
            newTeam.members = thisTeam;
            newTeam.id = "**Party " + (loopCount + 1) + "**\r";
            loopCount++;
            teams.push(newTeam);
        }
        for (var _a = 0, teams_1 = teams; _a < teams_1.length; _a++) {
            var team = teams_1[_a];
            messageString.push(team.id + team.members + "\r");
        }
        if (!substring) {
            botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageString, "Parties", client);
        }
        else
            (botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageString, teamSize + " Man Parties"));
    }
    else
        (message.channel.send("you have to be in a voice channel"));
};
