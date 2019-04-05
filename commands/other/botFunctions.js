module.exports = {
    //function to group objects based on a property of your choosing, indexed by the unique property
    groupUnique: function (propertyName, objArray) {
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
    },
    findOverlap: function (log1, log2) {
        if (log2.timeJoin > log1.timeJoin && log2.timeJoin < log1.timeLeave && log1.channelid === log2.channelid && log1.userid != log2.userid) {
            return true;
        }
        else if (log1.timeJoin > log2.timeJoin && log1.timeJoin < log2.timeLeave && log1.channelid === log2.channelid && log1.userid != log2.userid) {
            return true;
        }
        else {
            return false;
        }
    },
    //call this function after guildMap has already been loaded or it will not work
    getFriends: function (id, guildid, thisGuild) {
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
        var logsToFilter = thisGuild.guildLogs;
        //find all the logs for the user you are checking
        var thisUsersLogs = logsToFilter.filter(function (log) {
            return log.userid === id;
        });
        var _loop_1 = function (log) {
            //find any logs that overlap with the currently checked log
            var logsWithOverlap = logsToFilter.filter(function (log2) {
                return module.exports.findOverlap(log, log2);
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
                newMegaLog.time = module.exports.convertToHours(thisTime);
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
    },
    shuffle: function (array) {
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
    },
    //function to group objects based on a property of your choosing, indexed by the unique property
    //get guild from guildmap
    //a log filter with multiple options
    filterLogs: function (logs, timeFrame, user, channel) {
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
    },
    //converts milliseconds to hours and rounds to 2 decimal places
    convertToHours: function (miliseconds) {
        miliseconds = miliseconds / 3600000;
        var hours = Math.round(miliseconds * 100) / 100;
        return hours;
    },
    //this function lets the bot send fancy embeded messages without having to write it out each time
    sendEmbed: function (guildName, channel, array, title, client) {
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
};
