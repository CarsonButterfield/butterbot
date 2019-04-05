exports.run = (client, message, args) => {
//counts all the roles on the server below Roletab and orders them
   class roleCount {
       role: string;
       count: number;
   }
   let botFunctions = require("./other/botFunctions.js")
   let roleObjects = [];
   let messageToSend = [];
   let roles = message.guild.roles.array()
   let roleTab = message.guild.roles.find(function(role) {
       return role.name === "roletab"
   });
   roles = roles.filter(function(role) {
       return roleTab.comparePositionTo(role) > 0
   })
   roles = roles.filter(function(role) {
       return role.name !== "@everyone"
   })
   for (let role of roles) {
       let thisRole = new roleCount
       thisRole.role = role.name
       thisRole.count = message.guild.roles.get(role.id).members.array().length
       roleObjects.push(thisRole)

   }
   roleObjects = roleObjects.sort(function(a, b) {
       return b.count - a.count
   })
   for (let role of roleObjects) {
       messageToSend.push(role.role + " : " + role.count + "\r")
   }
   botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageToSend, "**Most Popular Self-Assigned Roles**",client)
}
