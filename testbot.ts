//fs is needed for the import/export of files
const Discord = require('discord.js');
const fs = require('fs')
//for scheduling log exports
const mongoose = require("mongoose")
const schedule = require('node-schedule');
//these 3 are dependensies for node-schedule
const mongodb = require('mongodb')
const client = new Discord.Client();
var Enmap = require("enmap");
var usersActive = [];
var botFunctions = require("./commands/other/botFunctions.js");
const config = require("./config.json");
client.config = config;

var finishedVoiceLogs = [];
//the location of the voiceLogs
var voiceLogDir = './botfiles/voicelogs/'
//broken voiceLogfiles
var brokenFiles: Array < string > = [];

//not broken voicelog files
var voiceLogNames: Array < string > = [];
var guilds: Array < guildObject > = [];
//enmap is a SQLite library
var guildMap = new Enmap({
    name: "guilds",
    autoFetch: true,
    fetchAll: true,
});
var mClient

module.exports.guildMap = guildMap

// this object class containts the info of people who are currently active in a voice channel
class userInVoiceChannel {
    userName: string;
    id: string;
    voiceChannel: string;
    voiceChannelid: string;
    timeJoin: number;
    guildid: string;


}

class party {
    id: string;
    members = []
}


class completeLog {
    userName: string;
    userid: string;
    voiceChannel: string;
    voiceChannelid: string;
    timeJoin: number;
    timeLeave: number;
    totalTime = this.timeLeave - this.timeJoin;
    guild: string;

}
//represents each guild
class guildObject {
    guildid: string;
    guildLogs = [];
    emojiRoles = []
    messageLogs = []

}
class emojiRole {
    emoji: any;
    role: string;
    name: string;
}
class messageLog {
    guild: string;
    time: number;
    channel: number;
    user: number;
    mentions = []
}

//automatically exports/imports voiceLogs using node-scheduler
var exportImport = schedule.scheduleJob('*/1 * * * *', function() {
    moveLogsToDB()
});

function checkOfflineVoice(guild) {
    let guildMembers = guild.members
    for (let thisMember of guildMembers) {
        if (thisMember.voiceChannel) {
            createPartialLog(thisMember)
        }
    }
}

//finds the join log of a member that goes offline, returns the log and removes it from the online user list
function findMatchingLog(id) {
    return usersActive.splice(usersActive.indexOf(usersActive.find(function(user) {
        return user.id === id
    })), 1)
}
//takes the partial log and converts to a complete log
function createFinalLog(smallLog) {
    if (smallLog) {
      let otherLog = smallLog[0]

        let time = new Date()
        let timeMili = time.getTime();


        let finalLog = new completeLog;

        finalLog.userid = otherLog.id;
        finalLog.voiceChannel = otherLog.voiceChannel;
        finalLog.voiceChannelid = otherLog.voiceChannelid;
        finalLog.timeJoin = otherLog.timeJoin;
        finalLog.guild = otherLog.guildid;
        finalLog.userName = otherLog.userName;
        finalLog.timeLeave = timeMili;
        console.log(finalLog)
        let thisGuild = guilds.find(function(guild) {
            return guild.guildid === finalLog.guild
        })


        thisGuild.guildLogs.push(finalLog)
        console.log(thisGuild.guildLogs.length)
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
        } else {
            return 2
        }
    } else {
        return 3
    }
}

function createPartialLog(newMember) {
    let thisLog = new userInVoiceChannel
    let time = new Date()
    thisLog.userName = newMember.userName;
    thisLog.id = newMember.id;
    thisLog.voiceChannel = newMember.voiceChannel.name;
    thisLog.voiceChannelid = newMember.voiceChannel.id;
    thisLog.timeJoin = time.getTime();
    thisLog.guildid = newMember.guild.id;
    usersActive.push(thisLog)


}
//fetches list of all members to check for anyone online as of the bot turning on
function getAllUsers() {
    let allGuilds = client.guilds.array();

    for (let x of allGuilds) {
        let currentGuild = x;
        currentGuild.fetchMembers('', 10000)
            .then(Guild => checkOfflineVoice(Guild))
            .catch(console.error)


    }
}
function connectToMongo(){
  var MongoClient = require('mongodb').MongoClient;

   mClient = new MongoClient(config.uri, {
      useNewUrlParser: true
  });
  mClient.connect(function(err){
    if(err){throw err}
  })
}
//moves the logs from the temporary memory to remote mongodb
function moveLogsToDB() {




        for (let guild of guilds) {
            let dbo = mClient.db(guild.guildid)
            if (guild.guildLogs.length > 0) {

                dbo.collection("voiceLogs").insertMany(guild.guildLogs, function(err, res) {
                    if (err) throw err;
                    console.log(`inserted ${res.insertedCount} voiceLogs`);


                })
                guild.guildLogs = []
            }
            if (guild.messageLogs.length > 0) {
                dbo.collection("messageLogs").insertMany(guild.messageLogs, function(err, res) {
                    if (err) throw err;
                    console.log(`inserted ${res.insertedCount} messageLogs`);

                })
            }
            guild.messageLogs = []

        }

}
//creates the guild objects on startup
function createGuildObjects() {
    var guildArray = client.guilds.array();
    for (let x of guildArray) {
        var newGuild = new guildObject;
        newGuild.guildid = x.id;
        guilds.push(newGuild)

    }

}

function createMessageLog(message) {
    let mentions = []
    let thisLog = new messageLog;
    thisLog.time = message.createdTimestamp;
    thisLog.user = message.author.id
    thisLog.channel = message.channel.id

    thisLog.guild = message.guild.id;
    let mentionObjs = message.mentions.roles.array()
    if (mentionObjs) {
        for (let mention of mentionObjs) {
            mentions.push(mention.name)
        }
    }
    thisLog.mentions = mentions
    let thisGuild = guilds.find(function(guild) {
        return guild.guildid === thisLog.guild
    })
    thisGuild.messageLogs.push(thisLog)
}
client.config = config;

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
    });
});
client.login(config.token);
//startup procedures
client.on('ready', () => {
    console.log('we in')
    connectToMongo()
    getAllUsers();
    createGuildObjects();


})
//EVENTS
client.on('guildCreate', (guildCreate) => {
    var newGuild = new guildObject;
    newGuild.guildid = guildCreate.id;
    guilds.push(newGuild)
})
//checks what kind of change happens on a VSU and reacts appropriately. Codes are at checkChange
client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (checkChange(oldMember, newMember) === 1) {
        createFinalLog(findMatchingLog(oldMember.id))
        createPartialLog(newMember)

    } else if (checkChange(oldMember, newMember) === 2) {
        createFinalLog(findMatchingLog(oldMember.id))
    } else if (checkChange(oldMember, newMember) === 3) {
        createPartialLog(newMember)
    }
})
//COMMANDS
client.on('message', message => {
        createMessageLog(message);
    }

)
