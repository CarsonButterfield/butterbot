//fs is needed for the import/export of files
const Discord = require('discord.js');
const fs = require('fs')
const lodash = require('lodash');
//for scheduling log exports
const schedule = require('node-schedule');
//these 3 are dependensies for node-schedule
const sorted = require('sorted-array-functions');
const parser = require('cron-parser');
const lt = require('long-timeout')
//
const emojiFilter = (reaction, user) => reaction.emoji.name === "❤"||"💛"||'💚'||"💙"||"💜"||"💖";
var emoji = ["❤","💛",'💚',"💙","💜","💖"]
const fsmi = require('fs-minipass')
const MiniPass = require('minipass')
const yallist = require('yallist')
const mkdirp = require('mkdirp');
const fsm = require('fs-minipass')
const {Pool} = require("better-sqlite-pool");
const Buffersafe = require('safe-buffer').Buffer
const client = new Discord.Client();

var usersActive = [];

const config = require("./config.json");
client.config = config;
var Integer = require('integer');
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
  id:string;
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
    guildid: string;

}
//represents each guild
class guildObject {
    guildid: string;
    guildLogs = [];
    emojiRoles = []
    messageLogs = []

}
class emojiRole{
  emoji:any;
  role:string;
  name:string;
}
class messageLog {
  guild:number;
  time:number;
  channel:number;
  user:number;
  mentions = []
}

//automatically exports/imports voiceLogs using node-scheduler
var exportImport = schedule.scheduleJob('0 58 * * * *', function() {
    moveLogsToDB(guilds)
});


//finds the join log of a member that goes offline, returns the log and removes it from the online user list
function findMatchingLog(id) {
    for (let x in usersActive) {
        let splicespot = 0;
        if (usersActive[x].id === id) {

            let logToReturn = usersActive[x];
            let discard = usersActive.splice(splicespot, 1)
            return logToReturn;
        }
        splicespot++
    }
}
//takes the partial log and converts to a complete log
function createFinalLog(partialLog) {
  if(partialLog){
    let time = new Date()
    let timeMili = time.getTime();
    let log = new completeLog;
    log.userid = partialLog.id;
    log.voiceChannel = partialLog.voiceChannel;
    log.voiceChannelid = partialLog.voiceChannelid;
    log.timeJoin = partialLog.timeJoin;
    log.guildid = partialLog.guildid;
    log.userName = partialLog.userName;
    log.timeLeave = timeMili;
    sortLogsIntoGuildObject(log);
}}
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
//used by getAllUsers

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
//moves the logs from the temporary memory to SQLite map
function moveLogsToDB(guildArray) {
    guildMap.defer.then(() => {
        for (var x of guildArray) {
            let fetchid = x.guildid;
            let offlineLogs = x.guildLogs;
            let offlineMessageLogs = x.messageLogs

            //this line is to trick the typescript compiler because it bugs out ignore it
            let guildLogs

            let currentDBGuild = guildMap.get(fetchid)



            currentDBGuild.guildLogs = currentDBGuild.guildLogs.concat(offlineLogs)
            currentDBGuild.messageLogs = currentDBGuild.messageLogs.concat(offlineMessageLogs)
            guildMap.set(fetchid, currentDBGuild)
            x.guildLogs = []
            x.messageLogs = []
        }
    })
}
//creates the guild objects on startup
createGuildObjects function createGuildObjects() {
    var guildArray = client.guilds.array();
    for (let x of guildArray) {
        var newGuild = new guildObject;
        newGuild.guildid = x.id;
        guilds.push(newGuild)

    }

},
function createMessageLog(message){
  let mentions = []
  let thisLog = new messageLog;
  thisLog.time = message.createdTimestamp;
  thisLog.user = message.author.id
  thisLog.channel = message.channel.id

  thisLog.guild = message.guild.id;
  let mentionObjs = message.mentions.roles.array()
  if(mentionObjs){
    for(let mention of mentionObjs){
      mentions.push(mention.name)
    }
  }
  thisLog.mentions = mentions
 sortmessageLogsIntoGuildObject(thisLog)
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
client.login(config.testtoken);
//startup procedures
client.on('ready', () => {
    console.log('we in')
    getAllUsers();
    createGuildObjects();
    guildMap.defer.then(() => {
        for (var x of guilds) {
            var stringid = x.guildid.toString()


            if (!guildMap.has(stringid)) {
                console.log('new guild in db')
                guildMap.set(stringid, x);
            } // works
            var guildList = guildMap.get(stringid); // also works
            console.log("guild:"+guildList.guildLogs.length)


        }
    });

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
    if (message.author.bot) {
        return
    }

    }

)
