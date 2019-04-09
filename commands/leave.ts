exports.run = (client, message, args) =>{
  let botFunctions = require("./other/botFunctions.js")
   let messageToSend = []
   let rolesNotAdded = [];
   let myRole = message.guild.roles.find(function(roles) {
       return roles.name === "roletab"
   });

   let thisMember = message.member;
   if (myRole) {
       if (message.content.indexOf('leave all!!') !==-1) {
           let thisMember = message.member;
           let thisMemberRoles = thisMember.roles.array();
           let rolesLeft = [];
           for (var x of thisMemberRoles) {

               if (myRole.comparePositionTo(x) > 0) {
                   thisMember.removeRole(x)
                   rolesLeft.push(x.name + '\r')
               }

           }
           botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, rolesLeft, "Removed These Roles",client)
       } else {
         let rolesToCheck = message.content.toUpperCase();
         //removes the testprefix text


         //seperates the roles
        rolesToCheck = rolesToCheck.substring(rolesToCheck.indexOf("LEAVE") + 6).split(", ")







           for (var x of rolesToCheck) {
               let currentRole = message.guild.roles.find(function(roles) {
                   return roles.name.toUpperCase() === x
               });
               if (currentRole) {
                   if (myRole.comparePositionTo(currentRole) > 0) {
                       thisMember.removeRole(currentRole)
                       messageToSend.push(currentRole.name)
                   } else(rolesNotAdded.push(x))
               } else(rolesNotAdded.push(x))
           }
           let rolesNotAddedToSend = rolesNotAdded.toString();
           rolesNotAddedToSend = rolesNotAddedToSend.replace(/,/g, " ")
           rolesNotAddedToSend = rolesNotAddedToSend.replace('@everyone', "")
           let messageToSendForReal = messageToSend.toString();
           messageToSendForReal = messageToSendForReal.replace(/,/g, " ");
           messageToSendForReal = messageToSendForReal.replace('@everyone', "")
           message.channel.send({
               embed: {
                   color: 2552550,
                   author: {
                       name: message.member.name,
                       icon_url: message.guild.splashURL,
                   },
                   fields: [{
                           name: "Roles Removed",
                           value: '- ' + messageToSend
                       },
                       {
                           name: "Roles not Removed",
                           value: '- ' + rolesNotAdded
                       },

                   ],
                   timestamp: new Date(),
                   footer: {
                       icon_url: client.user.avatarURL,
                       text: "© BetterBots"
                   }
               }
           })
       }
   } else {
       message.channel.send('You dont have the finder role, make sure you have a role named "roletab" above the roles you want to have self added!')
   }
}
