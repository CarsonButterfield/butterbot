exports.run = (client, message, args) => {
switch (Math.floor(Math.random()*4)) {
  case 1:
  message.channel.send(`please respect my personal space, ${message.author.username}`)
    break;
  case 2:
  message.channel.send(`I have mace ${message.author.username}`)
    break;
  case 3:
  message.channel.send(`please wash your hands, ${message.author.username}`)
  default:
  message.channel.send(".......")

}
}
