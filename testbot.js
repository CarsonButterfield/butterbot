//fs is needed for the import/export of files
var Discord = require('discord.js');
var fs = require('fs');
var lodash = require('lodash');
//for scheduling log exports
var schedule = require('node-schedule');
//these 3 are dependensies for node-schedule
var sorted = require('sorted-array-functions');
var parser = require('cron-parser');
var lt = require('long-timeout');
//
var emojiFilter = function (reaction, user) { return reaction.emoji.name === "❤" || "💛" || '💚' || "💙" || "💜" || "💖"; };
var emoji = ["❤", "💛", '💚', "💙", "💜", "💖"];
var fsmi = require('fs-minipass');
var MiniPass = require('minipass');
var yallist = require('yallist');
var mkdirp = require('mkdirp');
var fsm = require('fs-minipass');
var Pool = require("better-sqlite-pool").Pool;
var Buffersafe = require('safe-buffer').Buffer;
var client = new Discord.Client();
var Enmap = require("enmap");
var usersActive = [];
var config = require("./config.json");
client.config = config;
var Integer = require('integer');
var finishedVoiceLogs = [];
//the location of the voiceLogs
var voiceLogDir = './botfiles/voicelogs/';
//broken voiceLogfiles
var brokenFiles = [];
//not broken voicelog files
var voiceLogNames = [];
var guilds = [];
//enmap is a SQLite library
var guildMap = new Enmap({
    name: "guilds",
    autoFetch: true,
    fetchAll: true
});
function replaceMe() {
    message.channel.send("boop");
}
function createMessageLog(message) {
    var mentions = [];
    var thisLog = new messageLog;
    thisLog.time = message.createdTimestamp;
    thisLog.user = message.author.id;
    thisLog.channel = message.channel.id;
    thisLog.guild = message.guild.id;
    var mentionObjs = message.mentions.roles.array();
    if (mentionObjs) {
        for (var _i = 0, mentionObjs_1 = mentionObjs; _i < mentionObjs_1.length; _i++) {
            var mention = mentionObjs_1[_i];
            mentions.push(mention.name);
        }
    }
    thisLog.mentions = mentions;
    sortmessageLogsIntoGuildObject(thisLog);
}
module.exports.guildMap = guildMap;
// this object class containts the info of people who are currently active in a voice channel
var userInVoiceChannel = /** @class */ (function () {
    function userInVoiceChannel() {
    }
    return userInVoiceChannel;
}());
var party = /** @class */ (function () {
    function party() {
        this.members = [];
    }
    return party;
}());
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
var completeLog = /** @class */ (function () {
    function completeLog() {
        this.totalTime = this.timeLeave - this.timeJoin;
    }
    return completeLog;
}());
//represents each guild
var guildObject = /** @class */ (function () {
    function guildObject() {
        this.guildLogs = [];
        this.emojiRoles = [];
        this.messageLogs = [];
    }
    return guildObject;
}());
var emojiRole = /** @class */ (function () {
    function emojiRole() {
    }
    return emojiRole;
}());
var messageLog = /** @class */ (function () {
    function messageLog() {
        this.mentions = [];
    }
    return messageLog;
}());
//automatically exports/imports voiceLogs using node-scheduler
var exportImport = schedule.scheduleJob('0 58 * * * *', function () {
    moveLogsToDB(guilds);
});
function findOverlap(log1, log2) {
    if (log2.timeJoin > log1.timeJoin && log2.timeJoin < log1.timeLeave && log1.channelid === log2.channelid && log1.userid != log2.userid) {
        return true;
    }
    else if (log1.timeJoin > log2.timeJoin && log1.timeJoin < log2.timeLeave && log1.channelid === log2.channelid && log1.userid != log2.userid) {
        return true;
    }
    else {
        return false;
    }
}
//call this function after guildMap has already been loaded or it will not work
function getFriends(id, guildid) {
    var timeLog = /** @class */ (function () {
        function timeLog() {
        }
        return timeLog;
    }());
    //a list of users already sorted into megaLogs
    var alreadyMatched = [];
    //the logs of individual overlaps
    var miniLogs = [];
    //logs of the total overlap time for each member the person has playeed with
    var megaLogs = [];
    var thisGuild = guildMap.get(guildid);
    var logsToFilter = thisGuild.guildLogs;
    //find all the logs for the user you are checking
    var thisUsersLogs = logsToFilter.filter(function (log) {
        return log.userid === id;
    });
    var _loop_1 = function (log) {
        //find any logs that overlap with the currently checked log
        var logsWithOverlap = logsToFilter.filter(function (log2) {
            return findOverlap(log, log2);
        });
        //for each log with overlap, calculate the time in channel together and make a minilog
        for (var _i = 0, logsWithOverlap_1 = logsWithOverlap; _i < logsWithOverlap_1.length; _i++) {
            var overLapLog = logsWithOverlap_1[_i];
            var overLapStart = void 0, overlapEnd = void 0;
            if (log.timeJoin >= overLapLog.timeJoin) {
                overLapStart = log.timeJoin;
            }
            else {
                overLapStart = overLapLog.timeJoin;
            }
            if (log.timeLeave <= overLapLog.timeLeave) {
                overlapEnd = log.timeLeave;
            }
            else {
                overlapEnd = overLapLog.timeLeave;
            }
            var thisMinilog = new timeLog;
            thisMinilog.user = overLapLog.userid;
            thisMinilog.time = overlapEnd - overLapStart;
            miniLogs.push(thisMinilog);
        }
    };
    //check all the logs
    for (var _i = 0, thisUsersLogs_1 = thisUsersLogs; _i < thisUsersLogs_1.length; _i++) {
        var log = thisUsersLogs_1[_i];
        _loop_1(log);
    }
    var _loop_2 = function (log3) {
        if (alreadyMatched.indexOf(log3.user) > -1) {
            var thisTime = 0;
            alreadyMatched.push(log3.user);
            var matchingLogs = miniLogs.filter(function (log2) {
                return log3.user === log2.user;
            });
            for (var _i = 0, matchingLogs_1 = matchingLogs; _i < matchingLogs_1.length; _i++) {
                var matchedLog = matchingLogs_1[_i];
                thisTime += matchedLog.time;
            }
            var newMegaLog = new timeLog;
            newMegaLog.time = convertToHours(thisTime);
            newMegaLog.user = log3.user;
            megaLogs.push(newMegaLog);
        }
    };
    //add all minilogs of the same user together
    for (var _a = 0, miniLogs_1 = miniLogs; _a < miniLogs_1.length; _a++) {
        var log3 = miniLogs_1[_a];
        _loop_2(log3);
    }
    megaLogs = megaLogs.sort(function (a, b) {
        return b.time - a.time;
    });
    return megaLogs;
}
function shuffle(array) {
    var m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}
//function to group objects based on a property of your choosing, indexed by the unique property
function groupUnique(propertyName, objArray) {
    //the list of unique objs
    var unique = [];
    var objGroup = /** @class */ (function () {
        function objGroup() {
            this.matchingLogs = [];
        }
        return objGroup;
    }());
    //iterate through all the objects provided as argument
    for (var _i = 0, objArray_1 = objArray; _i < objArray_1.length; _i++) {
        var obj = objArray_1[_i];
        //see if theres already an objGroup that matches the unique property of this obj
        var thisGroup = unique.find(function (group) {
            return group["uniqueProp"] === obj[propertyName];
        });
        //if there is push this log into the objGroup
        if (thisGroup) {
            thisGroup.matchingLogs.push(obj);
            //otherwise create a new objGroup with this log in it and add it to the unique list
        }
        else {
            var newGroup = new objGroup;
            newGroup.uniqueProp = obj[propertyName];
            newGroup.matchingLogs = [obj];
            unique.push(newGroup);
        }
    }
    //return the list
    return unique;
}
//last step of the emoji menu process
function assignEmojiRoles(message) {
    guildMap.defer.then(function () {
        var thisGuild = guildMap.get(message.guild.id);
        var msgReactions = message.reactions.array();
        msgReactions = msgReactions.filter(function (reaction) {
            return emoji.indexOf(reaction.name);
        });
        var _loop_3 = function (msgEmoji) {
            var thisRole = thisGuild.emojiRoles.find(function (role) {
                return role.emoji === msgEmoji.emoji.name;
            });
            var theseUsers = msgEmoji.fetchUsers()
                .then(function (theseUsers) {
                theseUsers = theseUsers.array();
                theseUsers = theseUsers.filter(function (user) {
                    return user.id !== '233458197338390528';
                });
                for (var _i = 0, theseUsers_1 = theseUsers; _i < theseUsers_1.length; _i++) {
                    var thisUser = theseUsers_1[_i];
                    var emojiMember = message.guild.members.get(thisUser.id);
                    emojiMember.addRole(thisRole.role);
                    msgEmoji.remove(thisUser);
                }
            });
        };
        for (var _i = 0, msgReactions_1 = msgReactions; _i < msgReactions_1.length; _i++) {
            var msgEmoji = msgReactions_1[_i];
            _loop_3(msgEmoji);
        }
    });
}
//second step of Emojimenu
function emojiMenu(botMessage) {
    guildMap.defer.then(function () {
        var messageEdit = [];
        var thisGuild = guildMap.get(botMessage.guild.id);
        for (var _i = 0, _a = thisGuild.emojiRoles; _i < _a.length; _i++) {
            var emoji_1 = _a[_i];
            botMessage.react(emoji_1.emoji);
            messageEdit.push(emoji_1.name + " : " + emoji_1.emoji + "\r");
        }
        var messageToSend = messageEdit.toString();
        messageToSend = messageToSend.replace(/,/g, " ");
        botMessage.edit({
            embed: {
                color: 3447003,
                title: "Use these Reactions to assing roles!",
                description: messageToSend,
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "© BetterBots"
                }
            }
        });
    });
    var collector = botMessage.createReactionCollector(emojiFilter, {});
    collector.on('collect', function (reaction, collector) {
        assignEmojiRoles(botMessage);
    });
    collector.on('end', function (collected) {
        console.log("collected " + collected.size + " reactions");
    });
}
//a log filter with multiple options
function filterLogs(logs, timeFrame, user, channel) {
    if (timeFrame) {
        var time_1 = new Date().getTime();
        logs = logs.filter(function (log) {
            return time_1 - log.timeJoin < timeFrame;
        });
    }
    if (user) {
        logs = logs.filter(function (log) {
            return log.userid === user;
        });
    }
    if (channel) {
        logs = logs.filter(function (log) {
            return log.voiceChannelid === channel;
        });
    }
    return logs;
}
//converts milliseconds to hours and rounds to 2 decimal places
function convertToHours(miliseconds) {
    miliseconds = miliseconds / 3600000;
    var hours = Math.round(miliseconds * 100) / 100;
    return hours;
}
//creates the guild objects on startup
function createGuildObjects() {
    var guildArray = client.guilds.array();
    for (var _i = 0, guildArray_1 = guildArray; _i < guildArray_1.length; _i++) {
        var x = guildArray_1[_i];
        var newGuild = new guildObject;
        newGuild.guildid = x.id;
        guilds.push(newGuild);
    }
}
//could use just a find function but hey it works
//needs update
function sortLogsIntoGuildObject(log) {
    for (var _i = 0, guilds_1 = guilds; _i < guilds_1.length; _i++) {
        var x = guilds_1[_i];
        if (x.guildid === log.guildid) {
            x.guildLogs.push(log);
            break;
        }
    }
}
function sortmessageLogsIntoGuildObject(log) {
    for (var _i = 0, guilds_2 = guilds; _i < guilds_2.length; _i++) {
        var x = guilds_2[_i];
        if (x.guildid === log.guild) {
            x.messageLogs.push(log);
            break;
        }
    }
}
//finds the people who are online as of the bot turning on
function checkOfflineVoice(guild) {
    var members = guild.members.array();
    for (var _i = 0, members_1 = members; _i < members_1.length; _i++) {
        var x = members_1[_i];
        if (x.voiceChannel) {
            createPartialLog(x);
        }
    }
}
//first half of a finished log, created when a member is detected going online
function createPartialLog(newMember) {
    var log = new userInVoiceChannel;
    var time = new Date();
    var timeMili = time.getTime();
    log.userName = newMember.displayName;
    log.id = newMember.id;
    log.guildid = newMember.guild.id;
    log.voiceChannel = newMember.voiceChannel.name;
    log.voiceChannelid = newMember.voiceChannelID;
    log.timeJoin = timeMili;
    usersActive.push(log);
}
//finds the join log of a member that goes offline, returns the log and removes it from the online user list
function findMatchingLog(id) {
    for (var x in usersActive) {
        var splicespot = 0;
        if (usersActive[x].id === id) {
            var logToReturn = usersActive[x];
            var discard = usersActive.splice(splicespot, 1);
            return logToReturn;
        }
        splicespot++;
    }
}
//takes the partial log and converts to a complete log
function createFinalLog(partialLog) {
    if (partialLog) {
        var time = new Date();
        var timeMili = time.getTime();
        var log = new completeLog;
        log.userid = partialLog.id;
        log.voiceChannel = partialLog.voiceChannel;
        log.voiceChannelid = partialLog.voiceChannelid;
        log.timeJoin = partialLog.timeJoin;
        log.guildid = partialLog.guildid;
        log.userName = partialLog.userName;
        log.timeLeave = timeMili;
        sortLogsIntoGuildObject(log);
    }
}
//checks whether its a user coming online or going offline, returns 0-3 depending on the change
//0 is a mute/unmute, should be ignored
//1 is a channel change
//2 is going offline
//3 is coming online
function checkChange(oldMember, newMember) {
    if (oldMember.voiceChannel) {
        if (newMember.voiceChannel) {
            //if the channelID's are the same it means it was just a mute/unmute
            if (oldMember.voiceChannelID === newMember.voiceChannelID) {
                return 0;
            }
            //this checks if they changed channels but are still online
            else if (oldMember.voiceChannelID != newMember.voiceChannelID) {
                return 1;
            }
        }
        else {
            return 2;
        }
    }
    else {
        return 3;
    }
}
//used by getAllUsers
//fetches list of all members to check for anyone online as of the bot turning on
function getAllUsers() {
    var allGuilds = client.guilds.array();
    for (var _i = 0, allGuilds_1 = allGuilds; _i < allGuilds_1.length; _i++) {
        var x = allGuilds_1[_i];
        var currentGuild = x;
        currentGuild.fetchMembers('', 10000)
            .then(function (Guild) { return checkOfflineVoice(Guild); })["catch"](console.error);
    }
}
//moves the logs from the temporary memory to SQLite map
function moveLogsToDB(guildArray) {
    guildMap.defer.then(function () {
        for (var _i = 0, guildArray_2 = guildArray; _i < guildArray_2.length; _i++) {
            var x = guildArray_2[_i];
            var fetchid = x.guildid;
            var offlineLogs = x.guildLogs;
            var offlineMessageLogs = x.messageLogs;
            //this line is to trick the typescript compiler because it bugs out ignore it
            var guildLogs = void 0;
            var currentDBGuild = guildMap.get(fetchid);
            currentDBGuild.guildLogs = currentDBGuild.guildLogs.concat(offlineLogs);
            currentDBGuild.messageLogs = currentDBGuild.messageLogs.concat(offlineMessageLogs);
            guildMap.set(fetchid, currentDBGuild);
            x.guildLogs = [];
            x.messageLogs = [];
        }
    });
}
//this function lets the bot send fancy embeded messages without having to write it out each time
function sendEmbed(guildName, channel, array, title) {
    var stringMessage = array.join();
    stringMessage = stringMessage.replace(/,/g, " ");
    stringMessage = stringMessage.replace(",", "");
    stringMessage = stringMessage.replace("@everyone", "");
    client.channels.get(channel).send({
        embed: {
            color: 3447003,
            author: {
                name: guildName,
                icon_url: client.user.avatarURL
            },
            title: title,
            description: stringMessage,
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "© BetterBots"
            }
        }
    });
}
client.config = config;
fs.readdir("./events/", function (err, files) {
    if (err)
        return console.error(err);
    files.forEach(function (file) {
        var event = require("./events/" + file);
        var eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});
client.commands = new Enmap();
fs.readdir("./commands/", function (err, files) {
    if (err)
        return console.error(err);
    files.forEach(function (file) {
        if (!file.endsWith(".js"))
            return;
        var props = require("./commands/" + file);
        var commandName = file.split(".")[0];
        console.log("Attempting to load command " + commandName);
        client.commands.set(commandName, props);
    });
});
client.login(config.testtoken);
//startup procedures
client.on('ready', function () {
    console.log('we in');
    getAllUsers();
    createGuildObjects();
    guildMap.defer.then(function () {
        for (var _i = 0, guilds_3 = guilds; _i < guilds_3.length; _i++) {
            var x = guilds_3[_i];
            var stringid = x.guildid.toString();
            if (!guildMap.has(stringid)) {
                console.log('new guild in db');
                guildMap.set(stringid, x);
            } // works
            var guildList = guildMap.get(stringid); // also works
            console.log("guild:" + guildList.guildLogs.length);
        }
    });
});
//EVENTS
client.on('guildCreate', function (guildCreate) {
    var newGuild = new guildObject;
    newGuild.guildid = guildCreate.id;
    guilds.push(newGuild);
});
//checks what kind of change happens on a VSU and reacts appropriately. Codes are at checkChange
client.on('voiceStateUpdate', function (oldMember, newMember) {
    if (checkChange(oldMember, newMember) === 1) {
        createFinalLog(findMatchingLog(oldMember.id));
        createPartialLog(newMember);
    }
    else if (checkChange(oldMember, newMember) === 2) {
        createFinalLog(findMatchingLog(oldMember.id));
    }
    else if (checkChange(oldMember, newMember) === 3) {
        createPartialLog(newMember);
    }
});
//COMMANDS
client.on('message', function (message) {
    createMessageLog(message);
    if (message.author.bot) {
        return;
    }
});
