module.exports = (client, message) => {
  // Ignore all bots
  var args
  if (message.author.bot) return;

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(client.config.testprefix) !== 0 && message.content.indexOf(client.config.rolePrefix)!== 0) return;

  // Our standard argument/command name definition.
  if(message.content.indexOf(client.config.prefix) === 0){
   args = message.content.slice(client.config.prefix.length).trim().split(/ +/g)}
  else( args = message.content.slice(client.config.rolePrefix.length).trim().split(/ +/g))
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Run the command
//  cmd.run(client, message, args);
};
