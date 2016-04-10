// DougBot 2.0 beta
// Define variables first
Discord = require("discord.js");
var bot = new Discord.Client({forceFetchUsers: true});
ConfigFile = require("./config.json");
Logger = require("./runtime/logger.js").Logger;
Debug = require("./runtime/debugging.js");
ChatLogger = require("./runtime/logger.js").ChatLog;
Commands = require("./runtime/commands.js").Commands;
Permissions = require("./runtime/permissions.js");
VersionChecker = require("./runtime/versionchecker.js");
var aliases;
Defaulting = require("./runtime/serverdefaulting.js");
TimeOut = require("./runtime/timingout.js");
Ignore = require("./runtime/ignoring.js");
changeLog = "\nAnyone can now check their own punish level with `!status` in #bot";
osuapi = require('osu-api');
newmember = [];
ripmember = [];
banmember = [];
unbanmember = [];
twitchStreamers = require("./runtime/streamers.json")
customcommands = require("./runtime/ccommands.json")
customcomresponse = false;
customcomcom = false;
offlineStreamers = [];
onlineStreamers = [];
unirest = require('unirest');
osutracking = require("./runtime/osutracking.js");
osutracker = require("./runtime/osutracker.json");
taikotracker = require("./runtime/taikotracker.json");
ctbtracker = require("./runtime/ctbtracker.json");
maniatracker = require("./runtime/maniatracker.json");
bannedcommands = require("./runtime/bannedcommands.json");
var keymetrics;
pmx = require("pmx");
probe = pmx.probe();
var usercount;
var channelcount;
var servercount;
var comcount;
var mescount; // PMX vars
l = 4
command1 = 
// Start debug mode, if needed
Debug.prepareDebug();

// Declare aliasses
try {
	aliases = require("./runtime/alias.json");
} catch(e) {
	//No aliases defined
	aliases = {};
}

try {
	cccoms = require("./runtime/ccommands.json");
} catch(e) {
	//No aliases defined
	cccoms = {};
}

// Declare if Keymetrics analytics is needed
if (ConfigFile.bot_settings.keymetrics === true) {
  keymetrics = true;
} else {
  keymetrics = false;
}


// Error logger
bot.on("error", function(error) {
  Logger.error("Encounterd an error, please report this to the author of this bot, include any log files present in the logs folder.");
  Debug.debuglogSomething("Discord.js", "Encountered an error with discord.js most likely, got error: " + error, "error");
});
	
function newmember1(server, user) {
	if (i === undefined) {
		i = 0;
	}
	if (i < 0) {
		i = undefined;
		return;
	}
	if (newmember.length === 0) {
		i === undefined
		return;
	}
	if (newmember[i] === undefined) {
		i === undefined
		newmember = [];
		return;
	}
	var channeltest = newmember[i];
	joinmessage(i, channeltest, user, server)
	
	i++
	newmember1(server, user)
}

function joinmessage(i, channeltest, user, server) {
	Permissions.GetAnnounce(newmember[i], function(err, reply) {
		if (reply === "on") {
			Permissions.GetAnnounceJoinMessage(server.id, function(err, reply) {
				if (reply === "none") {
					bot.sendMessage(channeltest, user+" has joined!")
				}
				else {
					if (reply.indexOf("%user%") > -1) {
						reply = reply.replace("%user%", `${user}`)
					}
					if (reply.indexOf("%server%") > -1 ) {
						reply = reply.replace("%server%", `${server.name}`)
					}
					bot.sendMessage(channeltest, reply);
				}
			})
			}	
		})
}

function leavemessage(i, channeltest, user, server) {
	Permissions.GetAnnounce(newmember[i], function(err, reply) {
		if (reply === "on") {
			Permissions.GetAnnounceLeaveMessage(server.id, function(err, reply) {
				if (reply === "none") {
					bot.sendMessage(channeltest, user+" has left!")
				}
				else {
					if (reply.indexOf("%user%") > -1) {
						reply = reply.replace("%user%", `${user}`)
					}
					if (reply.indexOf("%server%") > -1 ) {
						reply = reply.replace("%server%", `${server.name}`)
					}
					bot.sendMessage(channeltest, reply);
				}
			})
			}	
		})
}
	
function ripmember1(server, user) {
	if (i === undefined) {
		i = 0;
	}
	if (i < 0) {
		i = undefined;
		return;
	}
	if (newmember.length === 0) {
		i === undefined
		return;
	}
	if (newmember[i] === undefined) {
		i === undefined
		newmember = [];
		return;
	}
	var channeltest = newmember[i];
	leavemessage(i, channeltest, user, server)
	i++
	ripmember1(server, user)
}	

function banmember1(server, user) {
	if (i === undefined) {
		i = 0;
	}
	if (i < 0) {
		i = undefined;
		return;
	}
	if (newmember.length === 0) {
		i === undefined
		return;
	}
	if (newmember[i] === undefined) {
		i === undefined
		newmember = [];
		return;
	}
	var channeltest = newmember[i];
	Permissions.GetAnnounce(newmember[i], function(err, reply) {
		if (reply === "off") {
		}
		if (reply === "on") {
			bot.sendMessage(channeltest, user.username+" has been banned!")
		}
	})
	i++
	banmember1(server, user)
}	

function unbanmember1(server, user) {
	if (i === undefined) {
		i = 0;
	}
	if (i < 0) {
		i = undefined;
		return;
	}
	if (newmember.length === 0) {
		i === undefined
		return;
	}
	if (newmember[i] === undefined) {
		i === undefined
		newmember = [];
		return;
	}
	var channeltest = newmember[i];
	Permissions.GetAnnounce(newmember[i], function(err, reply) {
		if (reply === "off") {
		}
		if (reply === "on") {
			bot.sendMessage(channeltest, user.username+" has been unbanned!")
		}
	})
	i++
	unbanmember1(server, user)
}	

function startPolling () {
    setInterval (function () {
        twitchStreamers.items.forEach( function (stream) {
            pollStream(stream);
        });
    }, 60000);
}

function startOsuTrack () {
    setInterval (function () {
        osutracker.items.forEach( function (osu) {
            osutracking.osutrack(osu, bot);
        });
    }, 60000);
}

function startTaikoTrack () {
    setInterval (function () {
        taikotracker.items.forEach( function (osu) {
            osutracking.taikotrack(osu, bot);
        });
    }, 60000);
}

function startCtbTrack () {
    setInterval (function () {
        ctbtracker.items.forEach( function (osu) {
            osutracking.ctbtrack(osu, bot);
        });
    }, 60000);
}

function startManiaTrack () {
    setInterval (function () {
        maniatracker.items.forEach( function (osu) {
            osutracking.maniatrack(osu, bot);
        });
    }, 60000);
}

function startPunishDown () {
    setInterval (function () {
        bot.users.forEach( function (user) {
			bot.servers.forEach( function (server) {
				punishDown(user, server)
			})
        });
    }, 3600000);
}

function punishDown (user, server) {
	Permissions.GetPunishLevel((server.id + user.id), function(err, reply) {
		if (reply.slice(0,1).indexOf("0") > -1) {}
		else if (reply.slice(0,1).indexOf("1") > -1 || reply.slice(0,1).indexOf("2") > -1 || reply.slice(0,1).indexOf("3") > -1 || reply.slice(0,1).indexOf("4") > -1 || reply.slice(0,1).indexOf("5") > -1 || reply.slice(0,1).indexOf("6") > -1) {
			punishTimestamp = reply.slice(-13);
			currentTimestamp = Date.now();
			if (reply.substring(1,2) === " ") {
				var punishlevel = reply.substring(0,1)
				var lastwarning = reply.substring(2).slice(0, -13)
			}
			else {
				var punishlevel = reply.substring(0,1)
				var lastwarning = reply.substring(1).slice(0, -13)
			}
			twoweeks = parseInt(currentTimestamp) - parseInt(punishTimestamp)
			if (twoweeks > 1209600000) {
				Permissions.SetPunishLevel((server.id + user.id), parseInt(punishlevel - 1)+" "+lastwarning+currentTimestamp, function(err, allow) {
					if (err) {
						if (server.id === "118689714319392769") {
							bot.reply("132526096750084097", "An error occured.");
							return;
						}
						else {
							return;
						}
					}
					if (allow === parseInt(punishlevel - 1)+" "+lastwarning+currentTimestamp) {
						if (server.id === "118689714319392769") {
							bot.sendMessage("132526096750084097", user+"'s punish level has decreased from "+punishlevel+" to "+allow.slice(0,1))
						}
					}
					else {
						if (server.id === "118689714319392769") {
							bot.reply("132526096750084097", "An error occured.");
							return;
						}
					}
				});
			}
		}
	})
}

function pollStream (stream) {
    var url = 'https://api.twitch.tv/kraken/streams/' + stream.stream;
	var request = require('request');
	request(url, function (error, response, data) {
		if (!error && response.statusCode == 200) {
			var parsedData = JSON.parse(data);
			if (parsedData.stream) {
				if (!stream.status) {
					bot.sendMessage(stream.channel, stream.stream + ' is streaming! Link: ' + parsedData.stream.channel.url);
					stream.status = true;
					require("fs").writeFile("./runtime/streamers.json",JSON.stringify(twitchStreamers,null,2), null);
				}
			} 
			else {
				if (stream.status) {
					setTimeout(function() {	
						request(url, function (error, response, data) {
							if (!error && response.statusCode == 200) {
								var parsedData = JSON.parse(data);
								if (parsedData.stream) {}
								else {
									if (stream.status) {
										bot.sendMessage(stream.channel, stream.stream + ' has finished streaming.');
										stream.status = false;
										require("fs").writeFile("./runtime/streamers.json",JSON.stringify(twitchStreamers,null,2), null);
									}
								}
							}
						})
					}, 300000);
				}
			}
		}
	})
}

function customsearch (msg, command, suffix) {
    if (command != null) {
		if (!msg.channel.isPrivate) {
			if (command.server === msg.channel.server.id) {
				if (command.command === command1) {
					customcomcom = command.command;
					customcomresponse = command.response.replace("%user%", `${msg.author}`).replace("%username%", `${msg.author.username}`).replace("%userid%", `${msg.author.id}`).replace("%channelid%", `${msg.channel.id}`).replace("%channelname%", `${msg.channel}`).replace("%servername%", `${msg.channel.server.name}`).replace("%serverid%", `${msg.channel.server.id}`).replace("%input%", suffix)
				}
			}
		}
	}
}

// Ready announcment
bot.on("ready", function() {
  Debug.debuglogSomething("Discord", "Ready event fired.", "info");
  if (bot.servers.length === 0) {
    Logger.warn("No servers deteted, creating default server.");
    Defaulting.create(bot);
  }
  Logger.info("Joining pre-defined servers...");
  for (var index in ConfigFile.join_on_launch) {
    bot.joinServer(ConfigFile.join_on_launch[index], function(error, server) {
      if (error) {
        Logger.warn("Couldn't join a server (" + error + ")");
      }
      if (server) {
        Logger.info("Joined " + server.name);
      }
    });
  }
  Logger.info("Ready to start!");
  Logger.info("Logged in as " + bot.user.username + ".");
  Logger.info("Serving " + bot.users.length + " users, in " + bot.servers.length + " servers.");
  bot.setStatus("online", "!help for commands")
  startPolling();
  startPunishDown();
  startOsuTrack();
  startTaikoTrack();
  startCtbTrack();
  startManiaTrack();
  var count = 0;
  if (keymetrics === false) return;
  else {
    usercount = probe.metric({
      name: 'Users',
      value: function() {
        return bot.users.length;
      }
    });
    servercount = probe.metric({
      name: 'Servers',
      value: function() {
        return bot.servers.length;
      }
    });
    channelcount = probe.metric({
      name: 'Channels',
      value: function() {
        return bot.channels.length;
      }
    });
    comcount = probe.counter({
      name: 'Commands executed'
    });
    mescount = probe.counter({
      name: 'Messages recieved'
    });
  }  
});

bot.on("serverNewMember", function(server, user) {
	for (i = 0; i < server.channels.length; i++) {
		if (server.channels[i] != undefined) {
			channelid = server.channels[i].id
			newmember.push(channelid)
		}
	}
	i = 0;
	this.usertest = user;
	newmember1(server, user)
});

bot.on("serverMemberRemoved", function(server, user) {
	for (i = 0; i < server.channels.length; i++) {
		if (server.channels[i] != undefined) {
			channelid = server.channels[i].id
			newmember.push(channelid)
		}
	}
	i = 0;
	this.usertest = user;
	ripmember1(server, user)
});

bot.on("userBanned", function(user, server) {
    for (i = 0; i < server.channels.length; i++) {
		if (server.channels[i] != undefined) {
			channelid = server.channels[i].id
			newmember.push(channelid)
		}
	}
	i = 0;
	this.usertest = user;
	banmember1(server, user)
});

bot.on("userUnbanned", function(user, server) {
    for (i = 0; i < server.channels.length; i++) {
		if (server.channels[i] != undefined) {
			channelid = server.channels[i].id
			newmember.push(channelid)
		}
	}
	i = 0;
	this.usertest = user;
	unbanmember1(server, user)
});

// Disconnected announcment
bot.on("disconnected", function() {
  Debug.debuglogSomething("Discord", "Disconnected from Discord.", "warn");
  Logger.warn("Disconnected, if this wasn't a connection issue or on purpose, report this issue to the author of the bot.");
  process.exit(0); // Disconnected announcments are not always an error, seeing that disconnections can be triggered by the user.
});

bot.on("presence", function(oldUser, newUser) {
	if (oldUser.username != newUser.username) {
		var oldname = oldUser.username;
		var testing = ", "+oldname+",";
		Permissions.GetPreviousName(oldUser.id, function(err, reply) {
			if (reply === "none") {
				Permissions.SetPreviousName(oldUser.id, ", "+oldname+",", function(err, allow) {
					if (allow === oldname) {
					}
				})
			}
			else {
				if (reply.indexOf(testing) > -1) {
					return;
				}
				if (reply.split(",").length - 1 === 2) {
					Permissions.SetPreviousName(oldUser.id, ", "+oldname+""+reply, function(err, allow) {
						if (allow === oldname+""+reply) {
						}
					})
					return;
				}
				Permissions.SetPreviousName(oldUser.id, ", "+oldname+""+reply, function(err, allow) {
					if (allow === oldname+", "+reply) {
						//bot.sendMessage("145853318059655168", "test message"); 
					}
				})
			}
		})
	}
	/*if (oldUser.avatar != newUser.avatar) {
		bot.sendMessage("145853318059655168", newUser.username+" Has changed their avatar from " + oldUser.avatarURL + " to " + newUser.avatarURL)
	}*/
});

// Command checker
bot.on("message", function(msg) {
	if (keymetrics === true) {
		if (mescount != undefined) {
			mescount.inc();
		}
	} 
	if (msg.attachments[0] != undefined && msg.attachments[0].filename === "warEbP4.gif" && msg.author.id === "115766388563378176") {
		Permissions.GetPrincipe("1", function(err, reply) {
			bot.sendMessage(msg.channel, "Principe has sent that gif " + reply + " times!")
			Permissions.SetPrincipe("1", (parseInt(reply) + 1), function(err, allow) {
				if (err) {
					bot.reply(msg.channel, "error");
					return;
				}
				if (allow != -1) {
				}
				else {
					bot.reply(msg.channel, "error");
					return;
				}
			})
		})
	}
  if (ConfigFile.bot_settings.log_chat === true && msg.channel.server) {
    var d = new Date();
    var n = d.toUTCString();
    ChatLogger.info(n + ": " + msg.channel.server.name + ", " + msg.channel.name + ": " + msg.author.username + " said <" + msg + ">");
  }
  function pmMessages(user, messages) {
	if (l === -1) { 
		l = 4;
		setTimeout(function(){ bot.sendMessage(user, "If you no longer want to receive these PM's, use `!pmmentions` in the server that you want to ignore.") }, 10000)
		return;
	}
	if (messages[l].attachments.length > 0) {
		bot.sendMessage(user, messages[l].author + ": " + "\"" + messages[l].attachments[0].url + "\"")
	}
	else {
		if (messages[l].author != undefined) {
			msgcontent = messages[l].content.replace("http://", "\"http://").replace("https://", "\"https://").replace(".jpg", ".jpg\"").replace(".jpeg", ".jpeg\"").replace(".png", ".png\"").replace(".gif", ".gif\"").replace(".tiff", ".tiff\"") + "\"";
			if (msgcontent.indexOf("\"http") > -1) {
				discordurl = msgcontent.indexOf("\"http")
				if (discordurl > -1) {
					msgcontent = msgcontent.replace(msgcontent.split(" ")[discordurl], msgcontent.split(" ")[discordurl] + "\"").substring(0 , msgcontent.length)	
					bot.sendMessage(user, messages[l].author + ": " + msgcontent.replace("\"\"", "\""))
				}
				else{}
			}
			else {
				bot.sendMessage(user, messages[l].author + ": " + messages[l])
			}
		}
    }
    l--;
    if( l > -1 ){
        setTimeout(function(){ 
			pmMessages(user, messages);
		}, 2000)
    }
	else {
		l = 4;
		setTimeout(function(){ bot.sendMessage(user, "If you no longer want to receive these PM's, use `!pmmentions` in the server that you want to ignore.") }, 10000)
	}
  }
   if (msg.mentions.length  === 1) {
	  if (msg.channel.isPrivate) {
		  return;
	  }
	  msg.mentions.map((user) => {
		if (user.status === "offline" || user.status === "idle") {
			if (user.id) {
				Permissions.GetPmMentions((msg.channel.server.id + user.id), function(err, reply) {
					if (reply === "on") {
						bot.getChannelLogs(msg.channel, 5, function(error, messages) {
							if (error) {
							} 
							else {
								if (msg.channel.id === "120323989410152448") return;
								if (msg.channel.id === "132526096750084097") return;
								bot.sendMessage(user, "`------------------------------`")
								setTimeout(function(){ bot.sendMessage(user, "You were mentioned in a message by "+msg.author+" in "+msg.channel+" while you were gone.")}, 100)
								setTimeout(function(){ 
									pmMessages(user, messages);
								}, 2000)
							}
						});
					}
					if (reply === "off") {
					}
			})
			}
		}
	})
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
  } else if (ConfigFile.bot_settings.cmd_prefix === "mention") {
    prefix = bot.user + " ";
  } else {
    Debug.debuglogSomething("DougBot", "Weird prefix detected.", "warn");
  }
  if (msg.content.indexOf(prefix) === 0) {
	if (keymetrics === true) comcount.inc();
    Logger.info("Executing <" + msg.cleanContent + "> from " + msg.author.username);
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
		customsearch(msg, command, suffix);
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
		if (bannedcommands.items[i].command === Commands[command].name) {
			if (bannedcommands.items[i].server === msg.channel.server.id) {
				bot.sendMessage(msg.channel, "That command has been disabled on this server.")
				return;
			}
		}
	}
    if (Commands[command]) {
      Debug.debuglogSomething("DougBot", "Command detected, trying to execute.", "info");
      if (msg.channel.server) {
        Permissions.GetLevel((msg.channel.server.id + msg.author.id), msg.author.id, function(err, level) {
          if (err) {
            Debug.debuglogSomething("LevelDB", "GetLevel failed, got error: " + err, "error");
            Logger.debug("An error occured!");
            return;
          }
		if (msg.channel.server) {
			Permissions.GetIgnore(msg.channel, function(err, reply) {
            Debug.debuglogSomething("DougBot", "Checking if channel allows me to respond", "info");
     			if (err) {
					Logger.debug("Got an error! <" + err + ">");
					Debug.debuglogSomething("LevelDB", "Ignore channel check failed, got error: " + err, "error");
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
                  Debug.debuglogSomething("DougBot", "Command execution failed because of channel settings.", "info");
				  if (msg.channel.id === "118689714319392769") {
					  if (msg.content === "!lastmention") {
						Commands["lastmention"].fn(bot, msg, suffix);
						return;
					  }
				  }
				  if (level >= 3) {
					  if (!Commands[command].nsfw) {
						  if (level >= Commands[command].level) {
							Commands[command].fn(bot, msg, suffix, mescount, comcount);
							return;
						  }
					  }
				  }
				}
                else if (reply === "no") {
					Debug.debuglogSomething("DougBot", "Channel allows command execution.", "info");
					if (level >= Commands[command].level) {
						Debug.debuglogSomething("DougBot", "Execution of command allowed.", "info");
						if (Commands[command].timeout) {
							TimeOut.timeoutCheck(command, msg.channel.server.id, function(reply) {
								if (reply === "yes") {
								Debug.debuglogSomething("DougBot", "Command is on cooldown, execution halted.", "info");
								bot.sendMessage(msg.channel, "Sorry, this command is on cooldown.");
								return;
								}	
							});
						}	
				if (!Commands[command].nsfw) {
					Debug.debuglogSomething("DougBot", "Safe for work command executed.", "info");
					if (msg.content.toLowerCase() === "!botstatus") {
						Commands["botstatus"].fn(bot, msg, suffix, mescount, comcount);
					}
					else {
						Commands[command].fn(bot, msg, suffix, mescount, comcount);
					}
					if (Commands[command].timeout) {
						TimeOut.timeoutSet(command, msg.channel.server.id, Commands[command].timeout, function(reply, err) {
							if (err) {
								Logger.error("Resetting timeout failed!");
							}
						});
					}
				return;
				} 
				else {
					Permissions.GetNSFW(msg.channel, function(err, reply) {
						Debug.debuglogSomething("DougBot", "Command is NSFW, checking if channel allows that.", "info");
						if (err) {
							Logger.debug("Got an error! <" + err + ">");
							Debug.debuglogSomething("LevelDB", "NSFW channel check failed, got error: " + err, "error");
							bot.sendMessage(msg.channel, "Sorry, an error occured, try again later.");
							return;
						}
						if (reply === "on") {
							Debug.debuglogSomething("DougBot", "NSFW command successfully executed.", "info");
							Commands[command].fn(bot, msg, suffix);
							return;
						}
						else {
						Debug.debuglogSomething("DougBot", "NSFW command execution failed because of channel settings.", "info");
						bot.sendMessage(msg.channel, "You cannot use NSFW commands in this channel!");
						}
					})
				}
					} 
					else {
						Debug.debuglogSomething("DougBot", "User has no permission to use that command.", "info");
						return;
					}
                }
               });
			   }
        });
      } else {
        Permissions.GetLevel(0, msg.author.id, function(err, level) { // Value of 0 is acting as a placeholder, because in DM's only global permissions apply.
          Debug.debuglogSomething("DougBot", "DM command detected, getting global perms.", "info");
          if (err) {
            Logger.debug("An error occured!");
            Debug.debuglogSomething("LevelDB", "GetLevel failed, got error: " + err, "error");
            return;
          }
          if (level >= Commands[command].level) {
            Debug.debuglogSomething("DougBot", "User has sufficient global perms.", "info");
            Commands[command].fn(bot, msg, suffix, mescount, comcount);
            return;
          } else {
            Debug.debuglogSomething("DougBot", "User does not have enough global permissions.", "info");
            bot.sendMessage(msg.channel, "Only global permissions apply in DM's, your server specific permissions do nothing here!");
          }
        });
      }
    }
  }
});

// Initial functions
function init(token) {
  Debug.debuglogSomething("Discord", "Sucessfully logged into Discord, returned token: " + token, "info");
  Debug.debuglogSomething("DougBot", "Continuing start-up sequence.", "info");
}

function err(error) {
  Debug.debuglogSomething("Discord", "Logging into Discord probably failed, got error: " + error, "error");
}
// Support direct API logins with tokens via 'token_mode'
if (ConfigFile.discord.token_mode === true) {
  bot.loginWithToken(ConfigFile.discord.token).then(init).catch(err);
} else if (ConfigFile.discord.token_mode === false) {
  bot.login(ConfigFile.discord.email, ConfigFile.discord.password).then(init).catch(err);
}