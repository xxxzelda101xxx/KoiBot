var ConfigFile = require("./config.json");
var Discord = require("discord.js");
var bot = new Discord.Client({ fetch_all_members: true, disable_everyone: true});
var CommandsFile = require("./runtime/commands.js").Commands;
var permissions = require("./runtime/permissions.js")
var osutracking = require("./runtime/osutracker.js")
var serverdb = require("./runtime/serverdb_rt.js")
var userdb = require("./runtime/userdb_rt.js")
var functions = require("./runtime/functions.js")
var customcomdb = require("./runtime/customcom_rt.js")
var colors = require('colors');
functions.startIRC(bot)
functions.startTwitchPolling(bot)
functions.checkMuted(bot)
try {
	aliases = require("./runtime/alias.json");
}
catch(e) {
	aliases = {};
}
bot.login(ConfigFile.token);

bot.on("error", function(error) {
	console.log(error)
})

bot.on("ready", function() {
  console.log(`Logged in as ${colors.green(bot.user.username)}`);
  console.log(`Currently in ${colors.green(bot.guilds.array().length)} servers with ${colors.green(bot.users.array().length)} users`);
  var ConfigFile = require("./config.json");
	bot.user.setStatus("online")
	bot.user.setGame(":thinking:")
  //functions.startOsuTrack(bot, client, channels)
	//functions.startopenrecPolling(bot)
})

bot.on("guildCreate", function(guild) {
  serverdb.serverExists(guild, function(err){})
})

bot.on('presenceUpdate', (oldUser, newUser) => {
  functions.updateNames(oldUser, newUser)
});

bot.on('guildMemberAdd', (member) => {
  functions.newMember(bot, member.guild, member)
	userdb.userExists(member, results =>{})
});

bot.on('guildMemberRemove', (member) => {
  functions.ripMember(bot, member.guild, member)
});

bot.on('guildBanAdd', (guild, member) => {
	functions.banMember(bot, guild, member)
});

bot.on('guildBanRemove', (guild, member) => {
	functions.unbanMember(bot, guild, member)
});

bot.on("message", function (msg) {
	if (!msg.guild) return;
  if (msg.author.id === bot.user.id) return;+
  userdb.userExists(msg.author, function() {
		permissions.checkPermissions(msg.author.id, msg.channel.guild.id, function (level) {//checks users level
			level = level.level
			if (msg.guild.ownerID === msg.author.id) {
				level = 4
			}
			if (msg.author.id === ConfigFile.owner) {
				level = 6
			}
			serverdb.getServerData(msg.guild.id, function(results) {
				if (!results[0]) {
					results[0] = {name: msg.guild.name,id: msg.guild.id,owner: msg.guild.ownerID,stafflogChannel: "",nsfwChannels: [],announceChannels: [],joinMessage: "",leaveMessage: "",colorUser: "off",ignoredChannels: [],disabledCommands: []}
					serverdb.serverExists(msg.guild, function(err){})
				}
		    var prefix = ConfigFile.prefix; //set prefix from config.json
		    var command = msg.content.substr(prefix.length).toLowerCase().split(" ")[0]; //removes prefix and everything else after the first space
				customcomdb.getCustomCommands(msg.guild.id, function(data) {
					data.forEach(function(customcommand) {
						if (customcommand.command === command && msg.content.indexOf(prefix) === 0) {
							if (results[0].ignoredChannels.indexOf(msg.channel.id) < 0) {
								msg.channel.sendMessage(`${customcommand.response}`)
							}
							else if (results[0].ignoredChannels.indexOf(msg.channel.id) > -1 && level >= 3) {
								msg.channel.sendMessage(`${customcommand.response}`)
							}
							return;
						}
					})
				})
		    if (CommandsFile[command]) {
		      userdb.increment(msg.author, true)
		    }
		    else {
		      userdb.increment(msg.author, null)
		    }
		    if (msg.content.indexOf(prefix) === 0) { // activates if message begins with prefix.
					if (results[0].disabledCommands.indexOf(command) > -1) {
						msg.channel.sendMessage(`**!${command}** is disabled on this server.`)
						return;
					}
		      var suffix = msg.content.substring(command.length + (prefix.length + 1)); //everything after prefix + command is stored here
		      alias = aliases[command];
		      if (alias) {
		  			command = alias[0];
		  			if (alias[1]) {
		  				suffix = alias[1] + " " + suffix;
		  			}
		  			else {
		  				suffix = suffix
		  			}
		  		}
		      if (CommandsFile[command]) { //checks to see if command exists
	          if ((level >= CommandsFile[command].level && !CommandsFile[command].nsfw && results[0].ignoredChannels.indexOf(msg.channel.id) < 0) || level >= 3 && !CommandsFile[command].nsfw && results[0].ignoredChannels.indexOf(msg.channel.id) > -1) {// if level > commands level OR the owner of the bot uses a command, execute command.
	            try {
	              console.log(`Executing <${colors.green(msg.cleanContent)}> from ${colors.green(msg.author.username)}`);
	              CommandsFile[command].fn(bot, msg, suffix);
	            }
	            catch (e) {
	              console.log(`${colors.red("ERROR:")} ${e}`)
	            }
	          }
						else if ((level >= CommandsFile[command].level && CommandsFile[command].nsfw && results[0].ignoredChannels.indexOf(msg.channel.id) < 0) || level >= 3 && CommandsFile[command].nsfw && results[0].ignoredChannels.indexOf(msg.channel.id) > -1) {
							if (results[0].nsfwChannels.indexOf(msg.channel.id) > -1) {
								try {
		              console.log(`Executing <${colors.green(msg.cleanContent)}> from ${colors.green(msg.author.username)}`);
		              CommandsFile[command].fn(bot, msg, suffix);
		            }
		            catch (e) {
		              console.log(`${colors.red("ERROR:")} ${e}`)
		            }
							}
							else {
								msg.channel.sendMessage(`NSFW commands are disabled for ${msg.channel}`)
							}
						}
		      }
		    }
			})
		})
  })
})
