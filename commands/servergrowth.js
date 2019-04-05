exports.run = function (client, message, args) {
    var botFunctions = require("./other/botFunctions.js");
    var monthCount = /** @class */ (function () {
        function monthCount() {
            this.count = 1;
        }
        return monthCount;
    }());
    var messageToSend = [];
    var messageGuild = message.guild.fetchMembers('', 10000)
        .then(function () {
        var guildMembers = message.guild.members.array();
        var times = [];
        for (var _i = 0, guildMembers_1 = guildMembers; _i < guildMembers_1.length; _i++) {
            var thisMember = guildMembers_1[_i];
            times.push(thisMember.joinedTimestamp);
        }
        times = times.sort(function (time, time2) {
            return time - time2;
        });
        var time = new Date().getTime();
        //get the milliseconds between the first person joining and current day
        time -= times[0];
        //convert to months
        time = time / 2592000000;
        //round to 2 digits
        var joinRate = time / times.length;
        joinRate = Math.round(joinRate * 100) / 100;
        var currentMonth;
        var currentMonthObj;
        var months = [];
        for (var _a = 0, times_1 = times; _a < times_1.length; _a++) {
            var joinTime = times_1[_a];
            var thisLogsDate = new Date(joinTime);
            if (thisLogsDate.getMonth() != currentMonth) {
                var newMonthObj = new monthCount;
                newMonthObj.monthYear = thisLogsDate.getMonth() + "/" + thisLogsDate.getFullYear();
                newMonthObj.time = joinTime;
                if (currentMonthObj) {
                    months.push(currentMonthObj);
                }
                console.log(currentMonth + " : " + thisLogsDate.getMonth());
                currentMonthObj = newMonthObj;
                currentMonth = thisLogsDate.getMonth();
            }
            else {
                currentMonthObj.count += 1;
            }
        }
        console.log(months[0] + " " + months.length);
        for (var _b = 0, months_1 = months; _b < months_1.length; _b++) {
            var month = months_1[_b];
            messageToSend.push(month.monthYear + ": **" + (month.count + 1) + "** Members \r");
        }
        botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageToSend, "Average Growth is " + joinRate + " Members", client);
    });
};
