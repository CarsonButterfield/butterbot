var Enmap = require("enmap");
var guildMap = new Enmap({
    name: "guilds",
    autoFetch: true,
    fetchAll: true
});
var channelUseTime = /** @class */ (function () {
    function channelUseTime() {
    }
    return channelUseTime;
}());
var botFunctions = require("./other/botFunctions.js");
exports.run = function (client, message, args) {
    var authorid = message.member.id.toString();
    var channels = message.guild.channels.array();
    channels = channels.filter(function (channel) {
        return channel.type === "voice";
    });
    guildMap.defer.then(function () {
        var channelsSorted = [];
        var messageArray = [];
        var userLogs = guildMap.get(message.guild.id);
        userLogs = userLogs.guildLogs;
        userLogs = userLogs.filter(function (id) {
            return id.userid === authorid;
        });
        for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
            var i = channels_1[_i];
            var channelTime = 0;
            var globalChannelid = i.id.toString();
            var thisChannelsLogs = userLogs.filter(function (log) {
                return log.voiceChannelid === globalChannelid;
            });
            for (var _a = 0, thisChannelsLogs_1 = thisChannelsLogs; _a < thisChannelsLogs_1.length; _a++) {
                var k = thisChannelsLogs_1[_a];
                var timeSpent = k.timeLeave - k.timeJoin;
                channelTime += timeSpent;
            }
            var newObj = new channelUseTime;
            channelTime = botFunctions.convertToHours(channelTime);
            newObj.channelName = i.name;
            newObj.channelTime = channelTime;
            channelsSorted.push(newObj);
        }
        channelsSorted = channelsSorted.sort(function (a, b) {
            return b.channelTime - a.channelTime;
        });
        for (var _b = 0, channelsSorted_1 = channelsSorted; _b < channelsSorted_1.length; _b++) {
            var channel = channelsSorted_1[_b];
            messageArray.push("**" + channel.channelName + "** : " + channel.channelTime + " \r");
        }
        botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageArray, "Heres your activity!", client);
    });
};
