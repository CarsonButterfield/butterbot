module.exports = {
//function to group objects based on a property of your choosing, indexed by the unique property
groupUnique:function(propertyName, objArray) {
//the list of unique objs
    let unique = [];
    class objGroup {
        uniqueProp: string;
        matchingLogs = []
    }
    //iterate through all the objects provided as argument
    for (var obj of objArray) {
    //see if theres already an objGroup that matches the unique property of this obj
        let thisGroup = unique.find(function(group) {
            return group["uniqueProp"] === obj[propertyName]
        })
        //if there is push this log into the objGroup
        if (thisGroup) {
            thisGroup.matchingLogs.push(obj)
        //otherwise create a new objGroup with this log in it and add it to the unique list
        } else {
            let newGroup = new objGroup
            newGroup.uniqueProp = obj[propertyName]
            newGroup.matchingLogs = [obj]
            unique.push(newGroup)
        }
    }
    //return the list
return unique
},

findOverlap:function(log1,log2){
if(log2.timeJoin > log1.timeJoin && log2.timeJoin < log1.timeLeave && log1.channelid === log2.channelid && log1.userid != log2.userid){return true}
else if (log1.timeJoin > log2.timeJoin && log1.timeJoin < log2.timeLeave && log1.channelid === log2.channelid && log1.userid != log2.userid){return true}
else{return false}
},
//call this function after guildMap has already been loaded or it will not work
getFriends:function (id,guildid,thisGuild) {
        class timeLog {
            user: string;

            time: number;
        }
        //a list of users already sorted into megaLogs
        let alreadyMatched = []
        //the logs of individual overlaps
        let miniLogs = []
        //logs of the total overlap time for each member the person has playeed with
        let megaLogs = []

        let logsToFilter = thisGuild.guildLogs;
        //find all the logs for the user you are checking
        let thisUsersLogs = logsToFilter.filter(function(log) {
            return log.userid === id
        })
        //check all the logs
        for (let log of thisUsersLogs) {

          //find any logs that overlap with the currently checked log
            let logsWithOverlap = logsToFilter.filter(function(log2) {
                return  module.exports.findOverlap(log,log2)
            })
            //for each log with overlap, calculate the time in channel together and make a minilog
            for (let overLapLog of logsWithOverlap) {
                let overLapStart, overlapEnd;

                if (log.timeJoin >= overLapLog.timeJoin) {
                    overLapStart = log.timeJoin
                } else{overLapStart = overLapLog.timeJoin}
                if (log.timeLeave <= overLapLog.timeLeave) {
                    overlapEnd = log.timeLeave
                } else{overlapEnd = overLapLog.timeLeave}
                let thisMinilog = new timeLog
                thisMinilog.user = overLapLog.userid

                thisMinilog.time = overlapEnd - overLapStart
                miniLogs.push(thisMinilog)
            }


        }
        //add all minilogs of the same user together
        for (let log3 of miniLogs) {
            if (alreadyMatched.indexOf(log3.user)>-1) {
                let thisTime = 0
                alreadyMatched.push(log3.user)
                let matchingLogs = miniLogs.filter(function(log2) {
                    return log3.user === log2.user
                })

                for (let matchedLog of matchingLogs) {
                    thisTime += matchedLog.time


                }
                let newMegaLog = new timeLog
                newMegaLog.time = module.exports.convertToHours(thisTime)
                newMegaLog.user = log3.user
                megaLogs.push(newMegaLog)
            }
        }
        megaLogs = megaLogs.sort(function(a,b){
          return b.time - a.time
        })

        return megaLogs

},
shuffle:function (array) {
    var m = array.length,
        t, i;

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
filterLogs:function (logs, timeFrame, user, channel) {
    if (timeFrame) {
        let time = new Date().getTime();
        logs = logs.filter(function(log) {
            return time - log.timeJoin < timeFrame
        })
    }
    if (user) {
        logs = logs.filter(function(log) {
            return log.userid === user
        })
    }
    if (channel) {
        logs = logs.filter(function(log) {
            return log.voiceChannelid === channel
        })
    }

    return logs;
},
//converts milliseconds to hours and rounds to 2 decimal places
convertToHours:function (miliseconds) {
    miliseconds = miliseconds / 3600000
    let hours = Math.round(miliseconds * 100) / 100
    return hours
},

//this function lets the bot send fancy embeded messages without having to write it out each time
sendEmbed:function(guildName, channel, array, title, client) {
    let stringMessage = array.join()

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
    })


}


}
