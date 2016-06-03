Discord = require("discord.js");
var bot = new Discord.Client({forceFetchUsers: true});
ConfigFile = require("./config.json");
Logger = require("./runtime/logger.js").Logger;
ChatLogger = require("./runtime/logger.js").ChatLog;
Commands = require("./runtime/commands.js").Commands;
Permissions = require("./runtime/permissions.js");
var aliases;
osuapi = require('osu-api');
twitchStreamers = require("./runtime/streamers.json")
customcommands = require("./runtime/ccommands.json")
customcomresponse = false;
customcomcom = false;
offlineStreamers = [];
onlineStreamers = [];
unirest = require('unirest');
osutracking = require("./runtime/osutracking.js");
taikotracker = require("./runtime/taikotracker.json");
ctbtracker = require("./runtime/ctbtracker.json");
maniatracker = require("./runtime/maniatracker.json");
bannedcommands = require("./runtime/bannedcommands.json");
var functions = require("./runtime/functions.js");
trackedchannels = require("./runtime/osutracking/db.json");
events = require("./runtime/events.json");
command1 = "";


try {
	aliases = require("./runtime/alias.json");
} 
catch(e) {
	aliases = {};
}

try {
	cccoms = require("./runtime/ccommands.json");
} 
catch(e) {
	cccoms = {};
}

bot.on("ready", function() {
  Logger.info("Ready to start!");
  Logger.info("Logged in as " + bot.user.username + ".");
  Logger.info("Serving " + bot.users.length + " users, in " + bot.servers.length + " servers.");
  bot.setStatus("online", "!help for commands") 
  functions.startPolling(bot);
  functions.startPunishDown(bot);
  functions.startOsuTrack(bot);
  functions.startTaikoTrack(bot);
  functions.startCtbTrack(bot);
  functions.startManiaTrack(bot);
  functions.eventAnnounce(bot)
});

bot.on("serverNewMember", function(server, user) {
	functions.newMember(bot, server, user)
});

bot.on("serverMemberRemoved", function(server, user) {
	functions.ripMember(bot, server, user)
});

bot.on("userBanned", function(user, server) {
    functions.banMember(bot, server, user)
});

bot.on("userUnbanned", function(user, server) {
    functions.unbanMember(bot, server, user)
});

bot.on("disconnected", function() {
  Logger.warn("Disconnected, if this wasn't a connection issue or on purpose, report this issue to the author of the bot.");
});

bot.on("presence", function(oldUser, newUser) {
	functions.memberPresence(bot, oldUser, newUser)
});

bot.on("message", function(msg) {
	if (ConfigFile.bot_settings.log_chat === true && msg.channel.server) {
		var d = new Date();
		var n = d.toUTCString();
		ChatLogger.info(n + ": " + msg.channel.server.name + ", " + msg.channel.name + ": " + msg.author.username + " said <" + msg + ">");
	}
	if (msg.mentions.length === 1) {
		functions.pmMessages(bot, msg)
	}
	if (msg.author.equals(bot.user)) {
		return;
	}
	if (msg.channel.isPrivate && msg.content.indexOf('https://discord.gg/') === 0) {
		Commands['join-server'].fn(bot, msg, msg.content);
	}
	var prefix;
	if (ConfigFile.bot_settings.cmd_prefix != "mention") {
		prefix = ConfigFile.bot_settings.cmd_prefix;
	} 
	else if (ConfigFile.bot_settings.cmd_prefix === "mention") {
		prefix = bot.user + " ";
	}
	if (msg.content.indexOf(prefix) === 0) {
		var step = msg.content.substr(prefix.length).toLowerCase();
		var chunks = step.split(" ");
		var command = chunks[0];
		command1 = command;
		alias = aliases[command];
		var suffix = msg.content.substring(command.length + (prefix.length + 1));
		if (alias) {
			command = alias[0];
			if (alias[1]) {
				suffix = alias[1] + " " + suffix;
			}
			else {
				suffix = suffix
			}
		}
		cccoms.items.forEach( function (command) {
			functions.customSearch(msg, command, suffix);
			if (customcomresponse) {
				return
			}
		});
		if (customcomcom === command) {
			Permissions.GetIgnore(msg.channel, function(err, reply) {
				if (reply === "no") {
					bot.sendMessage(msg.channel, customcomresponse)
					customcomresponse = false;
					customcomcom = false;
					return;
				}
				else if (reply === "yes") {
					Permissions.GetLevel((msg.channel.server.id + msg.author.id), msg.author.id, function(err, level) {
						if (level >= 3) {
						  if (msg.channel.server.id != "118689714319392769") return;
						  bot.sendMessage(msg.channel, customcomresponse)
						  customcomresponse = false;
						  customcomcom = false;
						  return;
						}
					})
				}
			})
		}
		for (var i = 0; i < bannedcommands.items.length; i++) {
			if (command != "" && Commands[command]) {
				if (bannedcommands.items[i].command === Commands[command].name) {
					if (bannedcommands.items[i].server === msg.channel.server.id) {
						bot.sendMessage(msg.channel, "That command has been disabled on this server.")
						return;
					}
				}
			}
		}
		if (Commands[command]) {
			Logger.info("Executing <" + msg.cleanContent + "> from " + msg.author.username);
			if (msg.channel.server) {
				Permissions.GetLevel((msg.channel.server.id + msg.author.id), msg.author.id, function(err, level) {
					if (err) {
						Logger.debug("An error occured!");
						return;
					}
					if (msg.channel.server) {
						Permissions.GetIgnore(msg.channel, function(err, reply) {
							if (err) {
								Logger.debug("Got an error! <" + err + ">");
								bot.sendMessage(msg.channel, "Sorry, an error occured, try again later.");
								return;
							}
							if (msg.content === "!setignore yes" || msg.content === "!setignore no") {
								if (level >= Commands["setignore"].level) {
									Commands["setignore"].fn(bot, msg, suffix);
									return;
								}
							}
							else if (reply === "yes") {
								if (msg.channel.id === "118689714319392769") {
									if (msg.content === "!lastmention") {
										Commands["lastmention"].fn(bot, msg, suffix);
										return;
									}
								}
								if (level >= 3) {
									if (!Commands[command].nsfw) {
										if (level >= Commands[command].level) {
											if (msg.channel.server.id != "118689714319392769") return;
											Commands[command].fn(bot, msg, suffix);
											return;
										}
									}
								}
							}
							else if (reply === "no") {
								if (level >= Commands[command].level) {
									if (!Commands[command].nsfw) {
										if (msg.content.toLowerCase() === "!botstatus") {
											Commands["botstatus"].fn(bot, msg, suffix);
										}
										else {
											Commands[command].fn(bot, msg, suffix);
										}
									return;
									} 
									else {
										Permissions.GetNSFW(msg.channel, function(err, reply) {
											if (err) {
												Logger.debug("Got an error! <" + err + ">");
												bot.sendMessage(msg.channel, "Sorry, an error occured, try again later.");
												return;
											}
											if (reply === "on") {
												Commands[command].fn(bot, msg, suffix);
												return;
											}
											else {
											bot.sendMessage(msg.channel, "You cannot use NSFW commands in this channel!");
											}
										})
									}
								} 
								else {
									return;
								}
							}
						});
					}
				});
			} 
			else {
				Permissions.GetLevel(0, msg.author.id, function(err, level) {
					if (err) {
						Logger.debug("An error occured!");
						return;
					}
					if (level >= Commands[command].level) {
						Commands[command].fn(bot, msg, suffix);
						return;
					} 
					else {
						bot.sendMessage(msg.channel, "Only global permissions apply in DM's, your server specific permissions do nothing here!");
					}
				});
			}
		}
	}
});

if (ConfigFile.discord.token_mode === true) {
  bot.loginWithToken(ConfigFile.discord.token)
} else if (ConfigFile.discord.token_mode === false) {
  bot.login(ConfigFile.discord.email, ConfigFile.discord.password)
}