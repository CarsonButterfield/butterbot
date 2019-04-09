exports.run = (client, message, args) => {
   let messageToSend = []
   let rolesNotAdded = [];
   let myRole = message.guild.roles.find(function(roles) {
       return roles.name === "roletab"
   });
   let thisMember = message.member;
   if (myRole) {
         rolesToCheck = rolesToCheck.substring(rolesToCheck.indexOf("ADD") + 4).split(", ")


       for (var x of rolesToCheck) {
           let currentRole = message.guild.roles.find(function(roles) {
               return roles.name.toUpperCase() === x
           });
           if (currentRole) {
               if (myRole.comparePositionTo(currentRole) > 0) {
                   thisMember.addRole(currentRole)
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
                       name: "Roles Added",
                       value: '- ' + messageToSend
                   },
                   {
                       name: "Roles not Added",
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
   } else {
       message.channel.send('You dont have the finder role, make sure you have a role named "roletab" above the roles you want to have self added!')
   }
}
