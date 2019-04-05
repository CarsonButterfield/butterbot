assignEmojiRoles:function(message,thisGuild) {


    let msgReactions = message.reactions.array()
    msgReactions = msgReactions.filter(function(reaction) {
        return emoji.indexOf(reaction.name)
    })
    for (let msgEmoji of msgReactions) {

        let thisRole = thisGuild.emojiRoles.find(function(role){
          return role.emoji === msgEmoji.emoji.name
        })


                  let theseUsers = msgEmoji.fetchUsers()
            .then((theseUsers) => {
                theseUsers = theseUsers.array()
                theseUsers = theseUsers.filter(function(user) {
                    return user.id !== '233458197338390528'
                })
                for (let thisUser of theseUsers) {
                let emojiMember =  message.guild.members.get(thisUser.id)
                emojiMember.addRole(thisRole.role)
                    msgEmoji.remove(thisUser)
                }
            })

    }
},
emojiMenu:function(botMessage,thisGuild) {

  let messageEdit = []

  for(let emoji of thisGuild.emojiRoles){
    botMessage.react(emoji.emoji)
    messageEdit.push(emoji.name+" : "+emoji.emoji+"\r")
  }
let  messageToSend = messageEdit.toString()
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
  })


  let collector = botMessage.createReactionCollector(emojiFilter, {});


  collector.on('collect', (reaction, collector) => {
     assignEmojiRoles(botMessage)
  });
  collector.on('end', collected => {
    console.log(`collected ${collected.size} reactions`);
  });
},
