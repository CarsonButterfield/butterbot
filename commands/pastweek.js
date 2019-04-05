exports.run = function (client, message, args) {
    var Enmap = require("enmap");
    var channelToAnalyse = /** @class */ (function () {
        function channelToAnalyse() {
            this.channelLogs = [];
        }
        return channelToAnalyse;
    }());
    var channelUseTime = /** @class */ (function () {
        function channelUseTime() {
        }
        return channelUseTime;
    }());
    var guildMap = new Enmap({
        name: "guilds",
        autoFetch: true,
        fetchAll: true
    });
    var botFunctions = require("./other/botFunctions.js");
    //this command is a bit outdated, needs to be cleaned up
    var guild = message.guild.id;
    var voiceChannelObjs = [];
    var finalObjs = [];
    var messageToSend = [];
    var combinedTimes = 0;
    guildMap.defer.then(function () {
        var guildLogs = guildMap.get(guild);
        guildLogs = guildLogs.guildLogs; // I need more names for things...
        console.log("guildLogs:" + guildLogs.length);
        guildLogs = botFunctions.filterLogs(guildLogs, 604800000, false, false);
        var guildChannels = message.guild.channels.array();
        //collects currently existing channels
        for (var _i = 0, guildChannels_1 = guildChannels; _i < guildChannels_1.length; _i++) {
            var i = guildChannels_1[_i];
            if (i.type === "voice") {
                var logObj = new channelToAnalyse;
                logObj.channelid = i.id.toString();
                logObj.channelName = i.name;
                voiceChannelObjs.push(logObj);
            }
        }
        for (var _a = 0, voiceChannelObjs_1 = voiceChannelObjs; _a < voiceChannelObjs_1.length; _a++) {
            var obj = voiceChannelObjs_1[_a];
            var thisChannelsLogs = [];
            for (var _b = 0, guildLogs_1 = guildLogs; _b < guildLogs_1.length; _b++) {
                var log = guildLogs_1[_b];
                if (log.voiceChannelid === obj.channelid) {
                    thisChannelsLogs.push(log);
                }
            }
            obj.channelLogs = thisChannelsLogs;
        }
        for (var _c = 0, voiceChannelObjs_2 = voiceChannelObjs; _c < voiceChannelObjs_2.length; _c++) {
            var i = voiceChannelObjs_2[_c];
            var channelTime = 0;
            for (var _d = 0, _e = i.channelLogs; _d < _e.length; _d++) {
                var x = _e[_d];
                var useTime = x.timeLeave - x.timeJoin;
                channelTime += useTime;
            }
            var newObj = new channelUseTime;
            newObj.channelName = i.channelName;
            newObj.channelTime = botFunctions.convertToHours(channelTime);
            finalObjs.push(newObj);
        }
        finalObjs.sort(function (a, b) {
            return b.channelTime - a.channelTime;
        });
        for (var _f = 0, finalObjs_1 = finalObjs; _f < finalObjs_1.length; _f++) {
            var log = finalObjs_1[_f];
            messageToSend.push("**" + log.channelName + "** : " + log.channelTime + " Hours \r");
        }
        botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageToSend, "Voice Use in the Past Week", client);
    });
};
