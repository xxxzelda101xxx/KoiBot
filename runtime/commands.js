var ConfigFile = require("../config.json"),
	Logger = require("./logger.js").Logger,
	Permissions = require("./permissions.js"),
	Cleverbot = require('cleverbot-node'),
	cleverbot = new Cleverbot(),
	unirest = require('unirest'),
	aliases = require("./alias.json"),
	osuapi = require('osu-api'),
	request = require('request'),
	xml2js = require('xml2js'),
	ent = require('entities'),
	fs = require('fs'),
	exec = require('child_process').exec,
	http = require('http'),
	confirmCodes = [],
	announceMessages = [],
	twitchStreamers = require("./streamers.json"),
	customcommands = require("./ccommands.json"),
	trackedchannels = require("./osutracking/db.json"),
	taikotracker = require("./taikotracker.json"),
	ctbtracker = require("./ctbtracker.json"),
	maniatracker = require("./maniatracker.json"),
	allchannels = require('require-all')(__dirname + '/osutracking'),
	bannedcommands = require("./bannedcommands.json"),
	mutemessage = [],
	unmutemessage = [],
	mentions = [],
	v = 0,
	z = 0,
	attempts = 0,
	lll = 0,
	jjj = 0;
var osu = new osuapi.Api(ConfigFile.api_keys.osu_api_key);
var Commands = [];

Commands.temporary = {
	"name": "temporary",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		var doomsserver = bot.servers.get("id", msg.channel.server.id);
		var role1 = doomsserver.roles.get("name", "Discord Mod");
		if (role1) {
			if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles") && msg.channel.server.membersWithRole(role1).indexOf(msg.author) < 0) {
				bot.sendMessage(msg, "You don't have permission to use this command.");
				return;
			}
			if (msg.mentions.length < 1) {
				bot.sendMessage(msg.channel, "You didn't mention any users!");
				return;
			}
			msg.mentions.map(function(user) {
				var doomsserver = bot.servers.get("id", msg.channel.server.id);
				var role = doomsserver.roles.get("name", "Temporary");
				var d = new Date();
				var miliseconds = d.getTime();
				var testing1234 = {
					"userid": user.id,
					"serverid": msg.channel.server.id,
					"joined": miliseconds
				};
				doomsday.items.push(testing1234);
				fs.writeFileSync("./runtime/doomsday.json", JSON.stringify(doomsday, null, 2), null);
				bot.addMemberToRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg, "An error occured. Try again.");
						console.log(e);
					}
					else {
						bot.sendMessage(msg, "Granted " + user + " 24 hours of temporary access!");
					}
				});
			});
		}
		else {
			bot.sendMessage(msg.channel, "An error occured.");
		}
	}
};

Commands.disablecommand = {
	name: "disablecommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!suffix) {
			bot.sendMessage(msg.channel, "You didn't specify a command to disable!");
			return;
		}
		suffix = suffix.trim();
		if (suffix.split(" ").length > 1) {
			bot.sendMessage(msg.channel, "There are no spaces in a command name!");
			return;
		}
		if (suffix === "disablecommand" || suffix === "help" || suffix === "enablecommand") {
			bot.sendMessage(msg.channel, "You cannot disable that command!");
			return;
		}
		if (!Commands[suffix]) {
			suffix = suffix.substring(1);
			if (!Commands[suffix]) {
				bot.sendMessage(msg.channel, "That command doesn't exist!");
				return;
			}
		}
		var searchTerm = suffix;
		var index = -1;
		for (var i = 0; i < bannedcommands.items.length; i++) {
			if (bannedcommands.items[i].command === searchTerm) {
				if (bannedcommands.items[i].server === msg.channel.server.id) {
					index = i;
					break;
				}
			}
		}
		if (index > -1) {
			bot.sendMessage(msg.channel, "!" + suffix + " is no longer disabled.");
			return;
		}
		bot.sendMessage(msg.channel, "!" + suffix + " is now disabled.");
		var command = {
			"command": suffix,
			"server": msg.channel.server.id
		};
		bannedcommands.items.push(command);
		fs.writeFileSync("./runtime/bannedcommands.json", JSON.stringify(bannedcommands, null, 2), null);
	}
};

Commands.enablecommand = {
	name: "enablecommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!suffix) {
			bot.sendMessage(msg.channel, "You didn't specify a command to enable!");
			return;
		}
		suffix = suffix.trim();
		if (suffix.split(" ").length > 1) {
			bot.sendMessage(msg.channel, "There are no spaces in a command name!");
			return;
		}
		if (!Commands[suffix]) {
			suffix = suffix.substring(1);
			if (!Commands[suffix]) {
				bot.sendMessage(msg.channel, "That command doesn't exist!");
				return;
			}
		}
		var searchTerm = suffix;
		var index = -1;
		for (var i = 0; i < bannedcommands.items.length; i++) {
			if (bannedcommands.items[i].command === searchTerm) {
				if (bannedcommands.items[i].server === msg.channel.server.id) {
					index = i;
					break;
				}
			}
		}
		if (index > -1) {
			bot.sendMessage(msg.channel, "!" + suffix + " is now enabled.");
			bannedcommands.items.splice(index, 1);
			fs.writeFileSync("./runtime/bannedcommands.json", JSON.stringify(bannedcommands, null, 2), null);
			return;
		}
		bot.sendMessage(msg.channel, "!" + suffix + " is already enabled.");
	}
};

Commands.track = {
	"name": "track",
	level: 0,
	fn: function(bot, msg, suffix) {
		switch (suffix.split(" ")[0].toLowerCase()) {
			case "taiko":
				osu.setMode(1);
				break;
			case "ctb":
				osu.setMode(2);
				break;
			case "mania":
				osu.setMode(3);
				break;
		}
		if (typeof trackedchannels[msg.channel] === 'undefined') {
			trackedchannels[msg.channel] = {
				items: []
			};
		}
		var path = `./osutracking/db.json`;
		try {
			fs.accessSync(path, fs.F_OK);
		}
		catch (e) {
			fs.closeSync(fs.openSync(`${__dirname}/osutracking/db.json`, 'w'));
			var obj = {
				"items": []
			};
			filename = `${__dirname}/osutracking/db.json`;
			fs.writeFileSync(filename, JSON.stringify(obj, null, 4));
		}
		var filename = `${__dirname}/osutracking/db.json`;
		var trackedchannel = trackedchannels[msg.channel];
		var mode = String(osu.mode).replace('0', 'osu!').replace('1', 'Taiko').replace('2', 'Catch The Beat').replace('3', 'Mania');
		if (!suffix.split(" ")[1]) {
			var currentOsu = [];
			trackedchannel.items.forEach(function(osu) {
				if (osu) {
					if (osu.channel === msg.channel.id) {
						currentOsu.push(osu.Username);
					}
				}
			});
			currentOsu = currentOsu.join(", ");
			if (currentOsu === "" || currentOsu === " ") {
				bot.sendMessage(msg.channel, `Not currently tracking any ${mode} players in ${msg.channel}`);
				return;
			}
			else {
				bot.sendMessage(msg.channel, `Currently tracking the following ${mode} players in ${msg.channel}:${currentOsu}`);
				return;
			}
		}
		suffix = suffix.substring(4);
		osu.getUser(suffix, function(err, data) {
			if (err) console.error(err);
			if (!data) {
				bot.sendMessage(msg.channel, "User not found.");
				return;
			}
			if (data) {
				var searchTerm = data.username.toLowerCase();
				var index = -1;
				for (var i = 0; i < trackedchannel.items.length; i++) {
					if (trackedchannel.items[i] === null) i++;
					if (trackedchannel.items[i].Username.toLowerCase() === searchTerm) {
						if (trackedchannel.items[i].channel === msg.channel.id) {
							index = i;
							break;
						}
					}
				}
				if (index > -1) {
					bot.sendMessage(msg.channel, `No longer tracking **${mode}** gains for **${trackedchannel.items[index].Username}** in ${msg.channel}`);
					trackedchannel.items.splice(index, 1);
					fs.writeFileSync(filename, JSON.stringify(trackedchannels, null, 4));
					return;
				}
				bot.sendMessage(msg.channel, `Now tracking **${mode}** gains for **${data.username}** in ${msg.channel}`);
				var user = {
					"username": data.username,
					"rank": data.pp_rank,
					"pp": data.pp_raw,
					"channel": msg.channel.id,
					"mode": osu.mode,
					"recent": ""
				};
				trackedchannels.items.forEach(function(command) {
					osusearch(user, msg, command);
					if (jjj === 1) return;
				});
			}
			if (jjj != 1) {
				trackedchannels[msg.channel].items.push(user);
			}
			fs.writeFileSync(filename, JSON.stringify(trackedchannels, null, 4));
			jjj = 0;
		});
	}
};

Commands.customcommands = {
	"name": "customcommands",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		var msgcustomcom = [];
		customcommands.items.forEach(function(com) {
			if (com) {
				if (com.server === msg.channel.server.id) {
					if (com.response != "" || com.response != " ") {
						console.log(com.command);
						msgcustomcom.push("!" + com.command);
					}
				}
			}
		});
		msgcustomcom = msgcustomcom.join("\n");
		if (msgcustomcom === "" || msgcustomcom === " ") {
			bot.sendMessage(msg.channel, "No custom commands on this server.");
			return;
		}
		else {
			bot.sendMessage(msg.author, "Commands on this server: \n" + msgcustomcom);
			return;
		}
	}
};

function osusearch(user, msg, command) {
	for (var i = 0; i < trackedchannels[msg.channel].items.length; i++) {
		if (trackedchannels[msg.channel].items[i] === null) return;
		if (trackedchannels[msg.channel].items[i].channel === user.channel) {
			if (trackedchannels[msg.channel].items[i].Username === user.username) {
				//delete cccoms.items[i]
				trackedchannels[msg.channel].items[i].Username = user.username;
				trackedchannels[msg.channel].items[i].channel = user.channel;
				trackedchannels[msg.channel].items[i].Rank = user.rank;
				trackedchannels[msg.channel].items[i].pp = user.pp;
				jjj = 1;
			}
		}
	}
}

Commands.setstafflog = {
	"name": "setstafflog",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		var channeltocheck = suffix.split(" ")[0].replace("<", "").replace(">", "").replace("#", "");
		var stafflog = msg.channel.server.channels.get("id", channeltocheck);
		if (stafflog) {
			Permissions.SetStafflog(msg.channel.server.id, stafflog.id, function(err, allow) {
				if (err) {
					bot.sendMessage(msg.channel, "Error setting Staff Log channel. Try again later.");
				}
				else {
					bot.sendMessage(msg.channel, stafflog + " has been set as the Staff Log channel.");
				}
			});
		}
		else {
			bot.sendMessage(msg.channel, "Channel not found.");
		}
	}
};

Commands.contact = {
	"name": "contact",
	level: 3,
	fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "Please join my support server if you are having issues with Koi. http://discord.gg/0vAsDJGEnPOcdmHX");
	}
};

Commands.botservers = {
	"name": "botservers",
	level: 5,
	fn: function(bot, msg, suffix) {
		var botservers = [];
		for (var i = 0; i < bot.servers.length; i++) {
			botservers.push("Server name: `" + bot.servers[i].name + "` Members: `" + bot.servers[i].members.length + "`");
		}
		bot.sendMessage(msg.channel, botservers);
	}
};

Commands.lastmention = {
	"name": "lastmention",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		v = 0;
		z = 0;
		attempts = 0;
		var mentionchannel = "";
		var channeltocheck = suffix.split(" ")[0].replace("<", "").replace(">", "").replace("#", "");
		if (channeltocheck != "") {
			mentionchannel = msg.channel.server.channels.get("id", channeltocheck);
		}
		if (!mentionchannel) {
			mentionchannel = msg.channel;
		}
		bot.getChannelLogs(mentionchannel, 100, function(error, messages) {
			if (error) {
				bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
				return;
			}
			else {
				var userid = msg.author.id;
				for (var i = 0; i < 100; i++) {
					if (messages[i].content.indexOf(userid) > -1) {
						if (messages[i].author.id != "125841801797042177") {
							bot.getChannelLogs(mentionchannel, 4, {
								before: messages[i]
							}, function(error, prevmessages) {
								if (error) {
									bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
									return;
								}
								else {
									var timestamp1 = discordtimestamp(prevmessages[3].timestamp);
									var timestamp2 = discordtimestamp(prevmessages[2].timestamp);
									var timestamp3 = discordtimestamp(prevmessages[1].timestamp);
									var timestamp4 = discordtimestamp(prevmessages[0].timestamp);
									var timestamp5 = discordtimestamp(messages[i].timestamp);
									bot.sendMessage(msg.channel, "Latest mention in " + mentionchannel + ": \n" + timestamp1 + " UTC **" + prevmessages[3].author.username + "**: " + prevmessages[3].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ") + "\n" + timestamp2 + " UTC **" + prevmessages[2].author.username + "**: " + prevmessages[2].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ") + "\n" + timestamp3 + " UTC **" + prevmessages[1].author.username + "**: " + prevmessages[1].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ") + "\n" + timestamp4 + " UTC **" + prevmessages[0].author.username + "**: " + prevmessages[0].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ") + "\n" + timestamp5 + " UTC **" + messages[i].author.username + "**: " + messages[i].content.replace(/@everyone/gi, " ").replace(/@here/gi, " "));
								}
							});
							break;
						}
					}
					if (i === 99) {
						z = messages[i];
						attempts++;
						lastmention(bot, msg, suffix, v, z, attempts, mentionchannel);
					}
				}
			}
		});
	}
};

function discordtimestamp(timestamp) {
	var date = new Date(timestamp);
	var hours = date.getUTCHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

function lastmention(bot, msg, suffix, v, z, attempts, mentionchannel) {
	if (attempts < 50) {
		bot.getChannelLogs(mentionchannel, 100, {
			before: z
		}, function(error, messages) {
			if (error) {
				bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
				return;
			}
			else {
				var userid = msg.author.id;
				for (var i = 0; i < 100; i++) {
					if (messages[i].content.indexOf(userid) > -1) {
						if (messages[i].author.id != "125841801797042177") {
							bot.getChannelLogs(mentionchannel, 4, {
								before: messages[i]
							}, function(error, prevmessages) {
								if (error) {
									bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
									return;
								}
								else {
									var timestamp1 = discordtimestamp(prevmessages[3].timestamp);
									var timestamp2 = discordtimestamp(prevmessages[2].timestamp);
									var timestamp3 = discordtimestamp(prevmessages[1].timestamp);
									var timestamp4 = discordtimestamp(prevmessages[0].timestamp);
									var timestamp5 = discordtimestamp(messages[i].timestamp);
									bot.sendMessage(msg.channel, "Latest mention in " + mentionchannel + ": \n" + timestamp1 + " UTC **" + prevmessages[3].author.username + "**: " + prevmessages[3].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ") + "\n" + timestamp2 + " UTC **" + prevmessages[2].author.username + "**: " + prevmessages[2].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ") + "\n" + timestamp3 + " UTC **" + prevmessages[1].author.username + "**: " + prevmessages[1].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ") + "\n" + timestamp4 + " UTC **" + prevmessages[0].author.username + "**: " + prevmessages[0].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ") + "\n" + timestamp5 + " UTC **" + messages[i].author.username + "**: " + messages[i].content.replace(/@everyone/gi, " ").replace(/@here/gi, " "));
								}
							});
							break;
						}
					}
					if (i === 99) {
						z = messages[i];
						attempts++;
						lastmention(bot, msg, suffix, v, z, attempts, mentionchannel);
					}
				}
			}
		});
	}
	else {
		bot.sendMessage(msg.channel, "Couldn't find a mention in the last 5000 messages.");
	}
}

Commands.names = {
	name: "names",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.mentions.length != 1) {
			bot.sendMessage(msg.channel, "You must mention exactly 1 user!");
		}
		msg.mentions.map((user) => {
			Permissions.GetPreviousName(user.id, function(err, reply) {
				if (err) console.error(err);
				console.log(reply);
				var testreply = reply.replace(/[,]+/g, "").trim();
				console.log(testreply);
				if (reply === "none") {
					bot.sendMessage(msg.channel, "No previous names found for " + user);
				}
				else if (reply === ", " + testreply + ",") {
					bot.sendMessage(msg.channel, "Previous names for " + user);
					setTimeout(function() {
						bot.sendMessage(msg.channel, testreply);
					}, 200);
				}
				else {
					bot.sendMessage(msg.channel, "Previous names for " + user);
					setTimeout(function() {
						bot.sendMessage(msg.channel, reply.replace(", ", "").slice(0, -1));
					}, 200);
				}
			});
		});
	}
};

Commands.avatar = {
	name: "avatar",
	level: 0,
	fn: function(bot, msg, suffix) {
		msg.mentions.map(function(user) {
			if (user.avatarURL === null) {
				bot.sendMessage(msg.channel, user + " doesn't appear to have an avatar.");
				return;
			}
			else {
				bot.sendMessage(msg.channel, "Avatar for " + user.name + ":");
				bot.sendFile(msg.channel, user.avatarURL);
			}
		});
	}
};

Commands.punish = {
	name: "punish",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (msg.mentions.length === 0) {
			bot.sendMessage(msg.channel, "You didn't tell me who to punish!");
			return;
		}
		if (msg.mentions.length > 1) {
			bot.sendMessage(msg.channel, "You can only punish one person at a time.");
			return;
		}
		msg.mentions.map((user) => {
			if (user.id === msg.author.id) {
				bot.sendMessage(msg.channel, "You can't punish yourself!");
				return;
			}
			Permissions.GetPunishLevel((msg.channel.server.id + user.id), function(err, reply) {
				if (err) console.error(err);
				console.log(reply.slice(0, 1));
				if (reply.slice(0, 1).indexOf("0") > -1) {
					Permissions.SetPunishLevel((msg.channel.server.id + user.id), "1" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp, function(err, allow) {
						if (err) {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
						if (allow === "1" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp) {
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							var reason1 = reason.replace("0", "");
							bot.sendMessage(msg.channel, user + ", this is your first warning.");
							Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
								if (err) console.error(err);
								if (reply != "none") {
									var array = [];
									array.push(user + " has been warned for the 1st time.");
									array.push("Reason: " + reason);
									array.push("Current punish level: 1");
									array.push("Punished by: " + msg.author);
									bot.sendMessage(reply, array);
								}
							});
						}
						else {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
					});
				}
				if (reply.slice(0, 1).indexOf("1") > -1) {
					Permissions.SetPunishLevel((msg.channel.server.id + user.id), "2" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp, function(err, allow) {
						if (err) {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
						if (allow === "2" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp) {
							bot.sendMessage(msg.channel, user + ", this is your second and final warning.");
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							var reason1 = reason.replace("0", "");
							Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
								if (err) console.error(err);
								if (reply != "none") {
									var array = [];
									array.push(user + " has been warned for the 2nd time.");
									array.push("Reason: " + reason);
									array.push("Current punish level: 2");
									array.push("Punished by: " + msg.author);
									bot.sendMessage(reply, array);
								}
							});
						}
						else {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
					});
				}
				if (reply.slice(0, 1).indexOf("2") > -1) {
					if (!msg.channel.permissionsOf(bot.user).hasPermission("managePermissions")) {
						bot.sendMessage(msg.author, "I don't have the correct permissions to mute. For `!punish` (and other commands) to work correctly, please give me the correct permissions. I recommend you give me all permissions and move the role I'm in to the top of the roles list.");
						return;
					}
					Permissions.SetPunishLevel((msg.channel.server.id + user.id), "3" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp, function(err, allow) {
						if (err) {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
						if (allow === "3" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp) {
							bot.sendMessage(msg.channel, user + ", you have been silenced for 5 minutes.");
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							var reason1 = reason.replace("0", "");
							Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
								if (err) console.error(err);
								if (reply != "none") {
									var array = [];
									array.push(user + " has been muted for the 1st time.");
									array.push("Reason: " + reason);
									array.push("Current punish level: 3");
									array.push("Punished by: " + msg.author);
									bot.sendMessage(reply, array);
								}
							});
							for (var i = 0; i < msg.channel.server.channels.length; i++) {
								var channame = msg.channel.server.channels[i];
								bot.overwritePermissions(channame, user, {
									"sendMessages": false,
									"managePermissions": false
								}, (e) => {
									if (e) {
										bot.sendMessage(msg.channel, "Error overwriting permissions. `" + e + "`");
									}
								});
							}
							setTimeout(function() {
								unmute(msg, bot, suffix);
							}, parseInt(5 * 60000, 10));
						}
						else {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
					});
				}
				if (reply.slice(0, 1).indexOf("3") > -1) {
					if (!msg.channel.permissionsOf(bot.user).hasPermission("managePermissions")) {
						bot.sendMessage(msg.author, "I don't have the correct permissions to mute. For `!punish` (and other commands) to work, please give me the correct permissions. I recommend you give me all permissions and move the role I'm in to the top of the roles list.");
						return;
					}
					Permissions.SetPunishLevel((msg.channel.server.id + user.id), "4" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp, function(err, allow) {
						if (err) {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
						if (allow === "4" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp) {
							bot.sendMessage(msg.channel, user + ", you have been silenced for 15 minutes.");
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							var reason1 = reason.replace("0", "");
							Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
								if (err) console.error(err);
								if (reply != "none") {
									var array = [];
									array.push(user + " has been muted for the 2nd time.");
									array.push("Reason: " + reason);
									array.push("Current punish level: 4");
									array.push("Punished by: " + msg.author);
									bot.sendMessage(reply, array);
								}
							});
							for (var i = 0; i < msg.channel.server.channels.length; i++) {
								var channame = msg.channel.server.channels[i];
								bot.overwritePermissions(channame, user, {
									"sendMessages": false,
									"managePermissions": false
								}, (e) => {
									if (e) {
										bot.sendMessage(msg.channel, "Error overwriting permissions. `" + e + "`");
									}
								});
							}
							setTimeout(function() {
								unmute(msg, bot, suffix);
							}, parseInt(15 * 60000, 10));
						}
						else {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
					});
				}
				if (reply.slice(0, 1).indexOf("4") > -1) {
					if (!msg.channel.permissionsOf(bot.user).hasPermission("kickMembers")) {
						bot.sendMessage(msg.author, "I don't have the correct permissions to kick. For `!punish` (and other commands) to work, please give me the correct permissions. I recommend you give me all permissions and move the role I'm in to the top of the roles list.");
						return;
					}
					Permissions.SetPunishLevel((msg.channel.server.id + user.id), "5" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp, function(err, allow) {
						if (err) {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
						if (allow === "5" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp) {
							bot.kickMember(user, msg.channel.server, function(err) {
								if (err) {
									bot.sendMessage(msg.author, "Couldn't kick " + user + "\nIt is likely i couldn't kick them successfully because my highest role is not above " + user + "'s highest role. I recommend you move my role to the top of the role list to avoid any further issues.");
									return;
								}
							});
							bot.sendMessage(msg.channel, user + ", has been kicked.");
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							var reason1 = reason.replace("0", "");
							Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
								if (err) console.error(err);
								if (reply != "none") {
									var array = [];
									array.push(user + " has been kicked");
									array.push("Reason: " + reason);
									array.push("Current punish level: 5");
									array.push("Punished by: " + msg.author);
									bot.sendMessage(reply, array);
								}
							});
							var array = [];
							array.push("You have been kicked. If you commit one more offense, you will be banned.");
							array.push("Reason: " + reason);
							array.push("The reason you were kicked: " + reason);
							bot.sendMessage(user, array);
							bot.createInvite(msg.channel, {
								"maxUses": 1
							}, (err, res) => {
								if (err) console.error(err);
								if (res) {
									bot.sendMessage(user, "Here is an invite link to rejoin: " + res);
								}
							});
						}
						else {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
					});
				}
				if (reply.slice(0, 1).indexOf("5") > -1) {
					if (!msg.channel.permissionsOf(bot.user).hasPermission("banMembers")) {
						bot.sendMessage(msg.author, "I don't have the correct permissions to ban. For `!punish` (and other commands) to work, please give me the correct permissions. I recommend you give me all permissions and move the role I'm in to the top of the roles list.");
						return;
					}
					Permissions.SetPunishLevel((msg.channel.server.id + user.id), "5" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp, function(err, allow) {
						if (err) {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
						if (allow === "5" + suffix.replace("<@" + user.id + ">", "") + msg.timestamp) {
							bot.banMember(user, msg.channel.server, function(err) {
								if (err) {
									bot.sendMessage(msg.author, "Couldn't ban " + user + "\nIt is likely i couldn't ban them successfully because my highest role is not above " + user + "'s highest role. I recommend you move my role to the top of the role list to avoid any further issues.");
									return;
								}
							});
							bot.sendMessage(msg.channel, user + ", has been banned.");
							bot.sendMessage(user, "You have been banned from " + msg.channel.server.name + ".");
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							var reason1 = reason.replace("0", "");
							Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
								if (err) console.error(err);
								if (reply != "none") {
									var array = [];
									array.push(user + " has been banned.");
									array.push("Reason: " + reason);
									array.push("Current punish level: 5");
									array.push("Punished by: " + msg.author);
									bot.sendMessage(reply, array);
								}
							});
							setTimeout(function() {
								bot.sendMessage(user, "The reason you were banned: " + reason);
							}, 500);

						}
						else {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
					});
				}
			});
		});
	}
};

Commands.status = {
	name: "status",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			if (msg.mentions.length > 0) {
				bot.sendMessage(msg.channel, "You cannot check another users punish level.");
				return;
			}
			else {
				Permissions.GetPunishLevel((msg.channel.server.id + msg.author.id), function(err, reply) {
					if (err) console.error(err);
					if (reply.substring(1, 2) === " ") {
						var punishlevel = reply.substring(0, 1);
						var lastwarning = reply.substring(2).slice(0, -13);
					}
					else {
						var punishlevel = reply.substring(0, 1);
						var lastwarning = reply.substring(1).slice(0, -13);
					}
					var array = [];
					array.push("Current status for " + msg.author);
					array.push("Punish level: " + punishlevel);
					if (lastwarning) {
						array.push("Reason for latest punishment: " + lastwarning);
					}
					else {
						array.push("Reason for latest punishment: None provided.");
					}
					bot.sendMessage(msg.channel, array);
				});
				return;
			}
		}
		if (msg.mentions.length != 1) {
			bot.sendMessage(msg.channel, "You must mention exactly 1 user!");
			return;
		}
		msg.mentions.map((user) => {
			Permissions.GetPunishLevel((msg.channel.server.id + user.id), function(err, reply) {
				if (err) console.error(err);
				if (reply.substring(1, 2) === " ") {
					var punishlevel = reply.substring(0, 1);
					var lastwarning = reply.substring(2).slice(0, -13);
				}
				else {
					var punishlevel = reply.substring(0, 1);
					var lastwarning = reply.substring(1).slice(0, -13);
				}
				var array = [];
				array.push("Current status for " + msg.author);
				array.push("Punish level: " + punishlevel);
				if (lastwarning) {
					array.push("Reason for latest punishment: " + lastwarning);
				}
				else {
					array.push("Reason for latest punishment: None provided.");
				}
				bot.sendMessage(msg.channel, array);
			});
		});
	}
};

Commands.punishlevel = {
	name: "punishlevel",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.mentions.length != 1) {
			bot.sendMessage(msg.channel, "You must mention exactly 1 user!");
			return;
		}
		if (!isNaN(suffix.split(" ")[1])) {
			suffix = parseInt(suffix.split(" ")[1], 10);
		}
		else {
			bot.sendMessage(msg.channel, "Incorrect usage. Example: `!punishlevel <user> <level>`");
			return;
		}
		if (suffix < 0 || suffix > 5) {
			bot.sendMessage(msg.channel, "You cannot set a punish level to be lower than 0 or higher than 5!");
			return;
		}
		msg.mentions.map((user) => {
			Permissions.SetPunishLevel((msg.channel.server.id + user.id), suffix, function(err, allow) {
				if (err) {
					bot.reply(msg.channel, "An error occured.");
					return;
				}
				if (allow === suffix) {
					bot.sendMessage(msg.channel, user + "'s punish level set to: " + allow);
				}
				else {
					bot.reply(msg.channel, "An error occured.");
					return;
				}
			});
		});
	}
};

Commands.mute = {
	name: "mute",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageChannels")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Channels`! I must have this permission for `!mute` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageChannels")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Channels`! You must have this permission to use `!mute`");
			return;
		}
		if (msg.mentions.length > 1) {
			bot.sendMessage(msg, "You can only mute 1 person at a time.");
			return;
		}
		if (msg.mentions.length === 0) {
			bot.sendMessage(msg, "You didn't mention a user for me mute!");
			return;
		}
		msg.mentions.map((user) => {
			if (user.id === msg.author.id) {
				bot.sendMessage(msg.channel, "You can't mute yourself!");
				return;
			}
			var array = [];
			for (var i = 0; i < msg.channel.server.channels.length; i++) {
				var channame = msg.channel.server.channels[i];
				bot.overwritePermissions(channame, user, {
					"sendMessages": false
				}, (e) => {
					if (e) {
						array.push("Couldn't mute " + user + " in " + channame);
					}
				});
			}
			if (array != []) {
				bot.sendMessage(msg.author, array);
			}
		});
		msg.mentions.map((user) => {
			if (user.id === msg.author.id) {
				bot.sendMessage(msg.channel, "You can't mute yourself!");
				return;
			}
			bot.sendMessage(msg.channel, "Successfully muted " + user);
		});
		if (!isNaN(suffix.split(" ")[1])) {
			msg.mentions.map((user) => {
				if (user.id === msg.author.id) {
					bot.sendMessage(msg.channel, "You can't mute yourself!");
					return;
				}
				bot.sendMessage(msg.channel, user + " will be automatically unmuted in " + suffix.split(" ")[1] + " minutes.");
				setTimeout(function() {
					unmute(msg, bot, suffix);
				}, parseInt(suffix.split(" ")[1] * 60000, 10));
			});
		}
		if (!isNaN(suffix.split(" ")[0])) {
			msg.mentions.map((user) => {
				if (user.id === msg.author.id) {
					bot.sendMessage(msg.channel, "You can't mute yourself!");
					return;
				}
				bot.sendMessage(msg.channel, user + " will be automatically unmuted in " + suffix.split(" ")[0] + " minutes.");
				setTimeout(function() {
					unmute(msg, bot, suffix);
				}, parseInt(suffix.split(" ")[0] * 60000, 10));
			});
		}
	}
};

Commands.unmute = {
	name: "unmutetest",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!unmute` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!unmute`");
			return;
		}
		if (msg.mentions.length > 1) {
			bot.sendMessage(msg, "You can only unmute 1 person at a time.");
			return;
		}
		if (msg.mentions.length === 0) {
			bot.sendMessage(msg, "You didn't mention a user to unmute!");
			return;
		}
		msg.mentions.map((user) => {
			for (var i = 0; i < msg.channel.server.channels.length; i++) {
				var channame = msg.channel.server.channels[i];
				var asdfasdf = msg.channel.server.channels.get("name", msg.channel.server.channels[i].name);
				bot.overwritePermissions(channame, user, false);
			}
		});
		msg.mentions.map((user) => {
			bot.sendMessage(msg.channel, user + " has been unmuted.");
		});
	}
};

function unmute(msg, bot, suffix) {
	msg.mentions.map((user) => {
		for (var i = 0; i < msg.channel.server.channels.length; i++) {
			var channame = msg.channel.server.channels[i];
			var asdfasdf = msg.channel.server.channels.get("name", msg.channel.server.channels[i].name);
			bot.overwritePermissions(channame, user, false);
		}
	});
	msg.mentions.map((user) => {
		bot.sendMessage(msg.channel, user + " has been unmuted.");
	});
}

Commands.twitchalert = {
	name: "twitchalert",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			bot.sendMessage(msg.channel, "You didn't specify a twitch name!");
			return;
		}
		if (suffix.split(" ").length > 1) {
			bot.sendMessage(msg.channel, "Names of twitch streamers don't contain spaces!");
			return;
		}
		if (suffix.indexOf("twitch.tv") > -1) {
			bot.sendMessage(msg.channel, "Please supply a twitch name, not a twitch url.");
			return;
		}
		//streams = suffix+", "+msg.channel.id;
		var searchTerm = suffix.toLowerCase(),
			index = -1;
		for (var i = 0; i < twitchStreamers.items.length; i++) {
			if (twitchStreamers.items[i].stream === searchTerm) {
				if (twitchStreamers.items[i].channel === msg.channel.id) {
					index = i;
					break;
				}
			}
		}
		if (index > -1) {
			bot.sendMessage(msg.channel, "I will no longer notify you when " + suffix.toLowerCase() + " goes live in " + msg.channel);
			twitchStreamers.items.splice(index, 1);
			fs.writeFileSync("./runtime/streamers.json", JSON.stringify(twitchStreamers, null, 2), null);
		}
		if (index === -1) {
			var url = 'https://api.twitch.tv/kraken/streams/' + suffix.toLowerCase();
			request(url, function(error, response, data) {
				if (!error && response.statusCode == 200) {
					var parsedData = JSON.parse(data);
					bot.sendMessage(msg.channel, "I will now notify you in " + msg.channel + " when " + suffix.toLowerCase() + " goes live.");
					var testing123 = {
						"stream": suffix.toLowerCase(),
						"channel": msg.channel.id,
						"status": false
					};
					twitchStreamers.items.push(testing123);
					fs.writeFileSync("./runtime/streamers.json", JSON.stringify(twitchStreamers, null, 2), null);
				}
				else {
					bot.sendMessage(msg.channel, "That name doesn't exist.");
					return;
				}
			});
		}
	}
};

Commands.createcommand = {
	name: "createcommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!suffix) {
			bot.sendMessage(msg.channel, "Syntax error. Correct usage: `!createcommand <command name> | <text>`. Command name cannot contain spaces.");
			return;
		}
		var customcom = suffix.split(" ")[0].toLowerCase();
		var customresponse = suffix.replace(customcom + " | ", "").trim();
		if (Commands[customcom] || customcom === "help") {
			bot.sendMessage(msg.channel, "Overwriting commands with custom commands is not allowed!");
			return;
		}
		for (var i = 0; i < cccoms.items.length; i++) {
			if (cccoms.items[i].server === msg.channel.server.id) {
				if (cccoms.items[i].command === customcom) {
					var commandexists = true;
				}
			}
		}
		if (suffix.indexOf(" | ") < 0) {
			bot.sendMessage(msg.channel, "Syntax error. Correct usage: `!createcommand <command name> | <text>`. Command name cannot contain spaces.");
			return;
		}
		if (customresponse === undefined) {
			bot.sendMessage(msg.channel, "Syntax error. Correct usage: `!createcommand <command name> | <text>`. Command name cannot contain spaces.");
			return;
		}
		if (commandexists) {
			bot.sendMessage(msg.channel, "Command `" + customcom + "` updated with new response: " + customresponse);
		}
		else {
			bot.sendMessage(msg.channel, "Command `" + customcom + "` created with response: " + customresponse);
		}
		var testing1234 = {
			"command": customcom,
			"server": msg.channel.server.id,
			"response": customresponse
		};
		cccoms.items.forEach(function(command) {
			customsearch(testing1234, msg, command);
			if (lll === 1) return;
		});
		if (lll != 1) {
			customcommands.items.push(testing1234);
		}
		fs.writeFileSync("./runtime/ccommands.json", JSON.stringify(customcommands, null, 2), null);
		lll = 0;
	}
};

Commands.deletecommand = {
	name: "deletecommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!suffix) {
			bot.sendMessage(msg.channel, "You didn't specify a command for me to delete.");
			return;
		}
		var customcom = suffix.split(" ")[0].toLowerCase();
		for (var i = 0; i < cccoms.items.length; i++) {
			if (cccoms.items[i].server === msg.channel.server.id) {
				if (cccoms.items[i].command === customcom) {
					var commandexists = true;
					break;
				}
			}
		}
		if (!commandexists) {
			bot.sendMessage(msg.channel, "That command doesn't exist!");
			return;
		}
		else {
			var testing1234 = cccoms.items[i]
			bot.sendMessage(msg.channel, "Deleted command **" + testing1234.command + "**");
			cccoms.items.splice(i, 1);
			fs.writeFileSync("./runtime/ccommands.json", JSON.stringify(customcommands, null, 2), null);
			return;
		}
	}
};

function customsearch(testing1234, msg, command) {
	for (var i = 0; i < cccoms.items.length; i++) {
		if (cccoms.items[i].server === testing1234.server) {
			if (cccoms.items[i].command === testing1234.command) {
				cccoms.items[i].command = testing1234.command
				cccoms.items[i].server = testing1234.server
				cccoms.items[i].response = testing1234.response
				lll = 1;
			}
		}
	}
}

Commands.alias = {
	name: "alias",
	help: "Allows for creating quick custom commands on the fly!",
	level: 5,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		var args = suffix.split(" ");
		var name = args.shift();
		if (!name) {
			return;
		}
		else if (Commands[name] || name === "help") {
			bot.sendMessage(msg.channel, "Overwriting commands with aliases is not allowed!");
		}
		else {
			var command = args.shift();
			aliases[name] = [command, args.join(" ")];
			//now save the new alias
			fs.writeFileSync("./runtime/alias.json", JSON.stringify(aliases, null, 2), null);
			bot.sendMessage(msg.channel, "Created alias " + name);
		}
	}
};

Commands.announce = {
	name: "announce",
	description: "",
	extendedhelp: "",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		Permissions.GetAnnounce(msg.channel.id, function(err, reply) {
			if (err) console.error(err);
			if (reply === "off") {
				Permissions.SetAnnounce(msg.channel.id, "on", function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "on") {
						bot.sendMessage(msg.channel, "I will now send a message in " + msg.channel + " when someone has joined, left, or been banned.");
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
			if (reply === "on") {
				Permissions.SetAnnounce(msg.channel.id, "off", function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "off") {
						bot.sendMessage(msg.channel, "I will no longer send a message in " + msg.channel + " when someone has joined, left, or been banned.");
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
		});
	}
};

Commands.joinmessage = {
	name: "joinmessage",
	description: "Gives a link to a list of songs",
	extendedhelp: "Gives a link to a list of songs",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!suffix) {
			bot.sendMessage(msg.channel, "The join message cannot be blank. If you wish to disable join messages, use `!announce` in the channel you want to disable join/leave/ban announce messages.");
		}
		else if (suffix === "current") {
			Permissions.GetAnnounceJoinMessage(msg.channel.server.id, function(err, reply) {
				if (err) console.error(err);
				if (reply === "none") {
					bot.sendMessage(msg.channel, "The current join message is: %user% has joined!");
				}
				else {
					bot.sendMessage(msg.channel, "The current join message is: " + reply);
				}
			});
		}
		else {
			Permissions.SetAnnounceJoinMessage(msg.channel.server.id, suffix, function(err, allow) {
				if (err) {
					bot.reply(msg.channel, "An error occured.");
					return;
				}
				if (allow === suffix) {
					bot.sendMessage(msg.channel, "The join message has been set to: " + suffix);
				}
				else {
					bot.reply(msg.channel, "An error occured.");
					return;
				}
			});
		}
	}
};

Commands.leavemessage = {
	name: "leavemessage",
	description: "Gives a link to a list of songs",
	extendedhelp: "Gives a link to a list of songs",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!suffix) {
			bot.sendMessage(msg.channel, "The leave message cannot be blank. If you wish to disable leave messages, use `!announce` in the channel you want to disable join/leave/ban announcements.");
		}
		else if (suffix === "current") {
			Permissions.GetAnnounceLeaveMessage(msg.channel.server.id, function(err, reply) {
				if (err) console.error(err);
				if (reply === "none") {
					bot.sendMessage(msg.channel, "The current leave message is: %user% has left!");
				}
				else {
					bot.sendMessage(msg.channel, "The current leave message is: " + reply);
				}
			});
		}
		else {
			Permissions.SetAnnounceLeaveMessage(msg.channel.server.id, suffix, function(err, allow) {
				if (err) {
					bot.reply(msg.channel, "An error occured.");
					return;
				}
				if (allow === suffix) {
					bot.sendMessage(msg.channel, "The leave message has been set to: " + suffix);
				}
				else {
					bot.reply(msg.channel, "An error occured.");
					return;
				}
			});
		}
	}
};

Commands.pmmentions = {
	name: "pmmentions",
	description: "",
	extendedhelp: "",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		Permissions.GetPmMentions((msg.channel.server.id + msg.author.id), function(err, reply) {
			if (err) console.error(err);
			if (reply === "on") {
				Permissions.SetPmMentions((msg.channel.server.id + msg.author.id), "off", function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "off") {
						bot.sendMessage(msg.channel, "I will no longer PM you when you are mentioned while idle or offline on this server.");
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
			if (reply === "off") {
				Permissions.SetPmMentions((msg.channel.server.id + msg.author.id), "on", function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "on") {
						bot.sendMessage(msg.channel, "I will now send you a PM when you are mentioned while idle or away on this server.");
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
		});
	}
};

Commands.pls = {
	name: "pls",
	level: 0,
	fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "pls rember that wen u feel scare or frigten\nnever forget ttimes wen u feeled happy\n\nwen day is dark alway rember happy day");
		return;
	}
};

Commands.addchannel = {
	name: "addchannel",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageChannels")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Channels`! You must have this permission to use `!addchannel`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageChannels")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Channels`! I must have this permission for `!addchannel` to function correctly!");
			return;
		}
		var channame = "";
		var chantype = "";
		var suffixlen = suffix.split(" ").length;
		for (var i = 0; i < suffixlen; i++) {
			if (i === suffixlen - 1) {
				chantype = suffix.split(" ")[i];
				break;
			}
			else {
				channame = channame + " " + suffix.split(" ")[i];
			}
		}
		channame = channame.trim();
		chantype = chantype.trim();
		if (suffix.split(" ").length > 2 && chantype === "text") {
			bot.sendMessage(msg.channel, "Couldn't create channel. Please note that text channel names cannot have spaces. Correct usage: `!addchannel gaming text`.");
			return;
		}
		if (chantype != "text" && chantype != "voice") {
			bot.sendMessage(msg.channel, "Channel type must either be text or voice. Please note that text channel names cannot have spaces. Correct usage: `!addchannel gaming text`.");
			return;
		}
		if (channame.length > 100) {
			bot.sendMessage(msg.channel, "The maximum length of a voice channel name is 100 characters!");
			return;
		}
		bot.createChannel(msg.channel.server.id, channame, chantype, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "Error creating channel. `" + e + "`");
			}
			else {
				bot.sendMessage(msg.channel, "Created a `" + chantype + "` channel named `" + channame + "`!");
			}
		});
	}
};

Commands.topic = {
	name: "topic",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageChannels")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Channels`! You must have this permission to use `!topic`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageChannels")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Channels`! I must have this permission for `!topic` to function correctly!");
			return;
		}
		var chantopic = suffix;
		if (chantopic.length > 1024) {
			bot.sendMessage(msg.channel, "The max length of a topic is 1024 characters!");
			return;
		}
		bot.setChannelTopic(msg.channel, chantopic, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "Error setting channel topic. `" + e + "`");
			}
			else {
				bot.sendMessage(msg.channel, "Changed topic to `" + suffix + "`.");
			}
		});
	}
};

Commands.delchannel = {
	name: "delchannel",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageChannels")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Channels`! You must have this permission to use `!delchannel`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageChannels")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Channels`! I must have this permission for `!delchannel` to function correctly!");
			return;
		}
		var delchannel = "";
		var s = suffix.toLowerCase();
		var sp = s.split("");
		for (var i = 0, l = 1 << s.length; i < l; i++) {
			for (var j = i, k = 0; j; j >>= 1, k++) {
				sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
			}
			var st = sp.join("");
			delchannel = msg.channel.server.channels.get("name", st);
			if (delchannel) {
				delchannel = msg.channel.server.channels.get("name", st);
				break;
			}
		}
		if (!delchannel) {
			bot.sendMessage(msg.channel, "Couldn't find channel.");
			return;
		}
		bot.deleteChannel(delchannel, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "Error deleting channel. `" + e + "`");
			}
			else {
				bot.sendMessage(msg.channel, "Successfully deleted `" + suffix + "`");
			}
		});
	}
};

Commands.add2dnsfw = {
	name: "add2dnsfw",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		var role;
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!addnsfw` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			if (msg.mentions.length > 0) {
				bot.sendMessage(msg.channel, "You mentioned another user. Since you don't have the permission `Manage Roles`, you can't change other users roles!");
				return;
			}
			user = msg.author.id;
			role = msg.channel.server.roles.get("name", "Channel Role - 2D NSFW");
			if (role) {
				bot.addMemberToRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error adding <@" + user + "> to `Channel Role - 2D NSFW`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg.channel, "Successfully gave <@" + user + "> the `Channel Role - 2D NSFW`!");
					}
				});
			}
			else {
				bot.sendMessage(msg.channel, "The role `Channel Role - 2D NSFW` doesn't exist!");
			}
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You must mention the users you want to add the NSFW role to!");
			return;
		}
		role = msg.channel.server.roles.get("name", "Channel Role - 2D NSFW");
		if (role) {
			msg.mentions.map((user) => {
				bot.addMemberToRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error adding " + user + " to `Channel Role - 2D NSFW`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg.channel, "Successfully gave " + user + " `Channel Role - 2D NSFW`!");
					}
				});
			});
		}
		else {
			var msgArray = [];
			msgArray.push("The role `Channel Role - NSFW` doesn't exist!");
			msgArray.push("This command doesn't do anything if it doesn't exist.");
			msgArray.push("If you just want a public #nsfw text channel, just use `!setnsfw on` in that text channel.");
			msgArray.push("");
			msgArray.push("Create this role and then give it the permission to `Read Messages` in a text channel. http://i.imgur.com/LpzIr7b.png");
			msgArray.push("Remember to remove the permission `Read Messages` from everyone so they can't the text channel!! http://i.imgur.com/i0dzFoU.png");
			bot.sendMessage(msg.author, msgArray);
		}
	}
};

Commands.add3dnsfw = {
	name: "add3dnsfw",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		var role;
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!addnsfw` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			if (msg.mentions.length > 0) {
				bot.sendMessage(msg.channel, "You mentioned another user. Since you don't have the permission `Manage Roles`, you can't change other users roles!");
				return;
			}
			user = msg.author.id;
			role = msg.channel.server.roles.get("name", "Channel Role - 3D NSFW");
			if (role) {
				bot.addMemberToRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error adding <@" + user + "> to `Channel Role - 3D NSFW`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg.channel, "Successfully gave <@" + user + "> the `Channel Role - 3D NSFW`!");
					}
				});
			}
			else {
				bot.sendMessage(msg.channel, "The role `Channel Role - 3D NSFW` doesn't exist!");
			}
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You must mention the users you want to add the 3D NSFW role to!");
			return;
		}
		role = msg.channel.server.roles.get("name", "Channel Role - 3D NSFW");
		if (role) {
			msg.mentions.map((user) => {
				bot.addMemberToRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error adding " + user + " to `Channel Role - 3D NSFW`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg.channel, "Successfully gave " + user + " `Channel Role - 3D NSFW`!");
					}
				});
			});
		}
		else {
			var msgArray = [];
			msgArray.push("The role `Channel Role - 3D NSFW` doesn't exist!");
			msgArray.push("This command doesn't do anything if it doesn't exist.");
			msgArray.push("If you just want a public #nsfw text channel, just use `!setnsfw on` in that text channel.");
			msgArray.push("");
			msgArray.push("Create this role and then give it the permission to `Read Messages` in a text channel. http://i.imgur.com/LpzIr7b.png");
			msgArray.push("Remember to remove the permission `Read Messages` from everyone so they can't the text channel!! http://i.imgur.com/i0dzFoU.png");
			bot.sendMessage(msg.author, msgArray);
		}
	}
};

Commands.addhg = {
	name: "addhg",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You must mention the users you want to add the Hunger Games role to!");
			return;
		}
		var role = msg.channel.server.roles.get("name", "Channel Role - Hunger Games");
		if (role) {
			msg.mentions.map((user) => {
				bot.addMemberToRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error adding " + user + " to `Channel Role - Hunger Games`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg.channel, "Successfully gave " + user + " `Channel Role - Hunger Games`!");
					}
				});
			});
		}
		else {
			return;
		}
	}
};

Commands.addbgo = {
	name: "addbgo",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You must mention the users you want to add the Board Game Online role to!");
			return;
		}
		var role = msg.channel.server.roles.get("name", "Channel Role - BGO");
		if (role) {
			msg.mentions.map((user) => {
				bot.addMemberToRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error adding " + user + " to `Channel Role - BGO`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg.channel, "Successfully gave " + user + " `Channel Role - BGO`!");
					}
				});
			});
		}
		else {
			return;
		}
	}
};

Commands.del2dnsfw = {
	name: "del2dnsfw",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		var role;
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!delnsfw` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			if (msg.mentions.length > 0) {
				bot.sendMessage(msg.channel, "You mentioned another user. Since you don't have the permission to edit roles, you can't change other users roles!");
				return;
			}
			user = msg.author.id;
			role = msg.channel.server.roles.get("name", "Channel Role - 2D NSFW");
			if (role) {
				bot.removeMemberFromRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error removing " + user + " from `Channel Role - 2D NSFW`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg.channel, "Successfully removed <@" + user + "> from `Channel Role - 2D NSFW`!");
					}
				});
			}
			else {
				bot.sendMessage(msg, "The `Channel Role - 2D NSFW` role doesn't exist!");
			}
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You must mention the users you want to add the NSFW to!");
			return;
		}
		role = msg.channel.server.roles.get("name", "Channel Role - 2D NSFW");
		if (role) {
			msg.mentions.map((user) => {
				bot.removeMemberFromRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg, "Error removing " + user + " from `Channel Role - 2D NSFW`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg, "Successfully removed " + user + " from `Channel Role - 2D NSFW`!");
					}
				});
			});
		}
		else {
			var msgArray = [];
			msgArray.push("The role `Channel Role - 2D NSFW` doesn't exist!");
			msgArray.push("This command doesn't do anything if it doesn't exist.");
			msgArray.push("If you just want a public #nsfw text channel, just use `!setnsfw on` in that text channel.");
			msgArray.push("");
			msgArray.push("Create this role and then give it the permission to `Read Messages` in a text channel. http://i.imgur.com/LpzIr7b.png");
			msgArray.push("Remember to remove the permission `Read Messages` from everyone so they can't the text channel!! http://i.imgur.com/i0dzFoU.png");
			bot.sendMessage(msg.author, msgArray);
		}
	}
};

Commands.del3dnsfw = {
	name: "del3dnsfw",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		var role;
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!delnsfw` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			if (msg.mentions.length > 0) {
				bot.sendMessage(msg.channel, "You mentioned another user. Since you don't have the permission to edit roles, you can't change other users roles!");
				return;
			}
			user = msg.author.id;
			role = msg.channel.server.roles.get("name", "Channel Role - 3D NSFW");
			if (role) {
				bot.removeMemberFromRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error removing " + user + " from `Channel Role - 3D NSFW`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg.channel, "Successfully removed <@" + user + "> from `Channel Role - 3D NSFW`!");
					}
				});
			}
			else {
				bot.sendMessage(msg, "The `Channel Role - 3D NSFW` role doesn't exist!");
			}
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You must mention the users you want to add the NSFW to!");
			return;
		}
		role = msg.channel.server.roles.get("name", "Channel Role - 3D NSFW");
		if (role) {
			msg.mentions.map((user) => {
				bot.removeMemberFromRole(user, role, (e) => {
					if (e) {
						bot.sendMessage(msg, "Error removing " + user + " from `Channel Role - 3D NSFW`!` " + e + "`");
					}
					else {
						bot.sendMessage(msg, "Successfully removed " + user + " from `Channel Role - 3D NSFW`!");
					}
				});
			});
		}
		else {
			var msgArray = [];
			msgArray.push("The role `Channel Role - 3D NSFW` doesn't exist!");
			msgArray.push("This command doesn't do anything if it doesn't exist.");
			msgArray.push("If you just want a public #nsfw text channel, just use `!setnsfw on` in that text channel.");
			msgArray.push("");
			msgArray.push("Create this role and then give it the permission to `Read Messages` in a text channel. http://i.imgur.com/LpzIr7b.png");
			msgArray.push("Remember to remove the permission `Read Messages` from everyone so they can't the text channel!! http://i.imgur.com/i0dzFoU.png");
			bot.sendMessage(msg.author, msgArray);
		}
	}
};

Commands.coloruser = {
	name: "coloruser",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!coloruser` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			Permissions.GetColorUser(msg.channel.server.id, function(err, reply) {
				if (err) console.error(err);
				if (reply === "on") {
					if (msg.mentions.length > 0) {
						bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You cannot change another users color!");
						return;
					}
					if (suffix.toLowerCase().indexOf("random") > -1) {
						suffix = "000000".replace(/0/g, function() {
							return (~~(Math.random() * 16)).toString(16);
						});
					}
					var suffixtest = /^#[a-f0-9]{6}$/i.test(suffix);
					if (suffix.length === 7 && !suffixtest) {
						bot.sendMessage(msg.channel, "That doesn't appear to be a valid hex color.");
						return;
					}
					suffixtest = /^[a-f0-9]{6}$/i.test(suffix);
					if (suffix.length === 6 && !suffixtest) {
						bot.sendMessage(msg.channel, "That doesn't appear to be a valid hex color.");
						return;
					}
					if (suffix.length < 6 || suffix.length > 7) {
						bot.sendMessage(msg.channel, "That doesn't appear to be a valid hex color.");
						return;
					}
					user = msg.author;
					suffix = suffix.replace("#", "");
					var role = msg.channel.server.roles.get("name", "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase());
					var roleExists = false;
					if (role) {
						roleExists = true;
					}
					msg.channel.server.rolesOfUser(user).map((r) => {
						if (r) {
							if (/^CColour - [a-f0-9]{6}$/i.test(r.name)) {
								removerole(user, r, suffix, bot, msg);
							}
							else if (/^CColour - #[a-f0-9]{6}$/i.test(r.name)) {
								removerole(user, r, suffix, bot, msg);
							}
						}
					});
					if (roleExists) {
						setTimeout(function() {
							bot.addMemberToRole(user, role, (e) => {
								if (e) {
									bot.sendMessage(msg, "Error giving member role.` " + e + "`");
								}
								else {
									bot.sendMessage(msg, "Successfully set!");
								}
							});
						}, 500);
					}
					else {
						msg.channel.server.createRole({
							color: parseInt(suffix.replace(/(.*) #?/, ""), 16),
							hoist: false,
							permissions: [],
							name: "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase()
						}, (e, rl) => {
							if (e) {
								bot.sendMessage(msg, "Error creating role. `" + e + "`");
								return;
							}
							role = rl;
							roleExists = true;
							bot.addMemberToRole(user, role, (e) => {
								if (e) {
									bot.sendMessage(msg, "Error giving member role. `" + e + "`");
								}
								else {
									bot.sendMessage(msg, "Successfully set!");
								}
							});
						});
					}
					return;
				}
				else {
					bot.sendMessage(msg.channel, "Changing your own color is currently disabled on this server.");
					return;
				}
			});
			return;
		}
		if (suffix.trim() == "clean") {
			var count = 0;
			msg.channel.server.roles.map((role) => {
				if (/^CColour - [a-f0-9]{6}$/i.test(role.name)) {
					console.log("Role name: " + role.name);
					console.log("Users with role: " + msg.channel.server.usersWithRole(role));
					if (msg.channel.server.usersWithRole(role).length < 1) {
						count++;
						bot.deleteRole(role, e => {
							if (e) {
								bot.sendMessage(msg, "Error deleting role: " + e);
							}
						});
					}
				}
			});
			bot.sendMessage(msg, "Removed " + count + " colors with no users");
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg, "You must mention the users you want to change the color of!");
			return;
		}
		if (suffix.indexOf("random") > -1) {
			suffix = "000000".replace(/0/g, function() {
				return (~~(Math.random() * 16)).toString(16);
			});
		}
		var role = msg.channel.server.roles.get("name", "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase());
		var roleExists = false;
		if (role) {
			roleExists = true;
		}
		msg.mentions.map((user) => {
			msg.channel.server.rolesOfUser(user).map((r) => {
				if (r) {
					if (/^CColour - [a-f0-9]{6}$/i.test(r.name)) {
						removerole(user, r, suffix, bot, msg);
					}
					else if (/^CColour - #[a-f0-9]{6}$/i.test(r.name)) {
						removerole(user, r, suffix, bot, msg);
					}
				}
			});
			if (roleExists) {
				setTimeout(function() {
					bot.addMemberToRole(user, role, (e) => {
						if (e) {
							bot.sendMessage(msg, "Error giving member role.` " + e + "`");
						}
						else {
							bot.sendMessage(msg, "Successfully set!");
						}
					});
				}, 500);
			}
			else {
				msg.channel.server.createRole({
					color: parseInt(suffix.replace(/(.*) #?/, ""), 16),
					hoist: false,
					permissions: [],
					name: "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase()
				}, (e, rl) => {
					if (e) {
						bot.sendMessage(msg, "Error creating role. `" + e + "`");
						return;
					}
					role = rl;
					roleExists = true;
					bot.addMemberToRole(user, role, (e) => {
						if (e) {
							bot.sendMessage(msg, "Error giving member role. `" + e + "`");
						}
						else {
							bot.sendMessage(msg, "Successfully set!");
						}
					});
				});
			}
		});
	}
};

function removerole(user, r, suffix, bot, msg) {
	if (r.name.indexOf("CColour") > -1 && r.name != "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase()) {
		//console.log("hi"); 
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "error: " + e);
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name);
			}
		});
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "error: " + e);
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name);
			}
		});
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "error: " + e);
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name);
			}
		});
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "error: " + e);
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name);
			}
		});
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				//bot.sendMessage(msg.channel, "error: "+e);
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name);
			}
		});
	}
}

Commands.createrole = {
	name: "createrole",
	usage: "<wtf is this>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!createrole`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!createrole` to function correctly!");
			return;
		}
		if (!suffix) {
			bot.sendMessage(msg, "You didn't specify a name for the role!");
			return;
		}
		if (suffix.length > 32) {
			bot.sendMessage(msg.channel, "The max length of a role name is 32 characters!");
			return;
		}
		msg.channel.server.createRole({
			hoist: false,
			permissions: [],
			name: suffix
		}, (e, rl) => {
			if (e) {
				bot.sendMessage(msg, "Error creating role. `" + e + "`");
				return;
			}
			else {
				bot.sendMessage(msg, "Successfully created role: `" + suffix + "`");
			}
		});
	}
};

Commands.delrole = {
	name: "delrole",
	usage: "<wtf is this>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!deleterole`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!deleterole` to function correctly!");
			return;
		}
		if (!suffix) {
			bot.sendMessage(msg, "You didn't tell me what role to delete!");
			return;
		}
		var role = "";
		var s = suffix.toLowerCase();
		var sp = s.split("");
		for (var i = 0, l = 1 << s.length; i < l; i++) {
			for (var j = i, k = 0; j; j >>= 1, k++) {
				sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
			}
			var st = sp.join("");
			//console.log(st);
			role = msg.channel.server.roles.get("name", st);
			if (role) {
				role = msg.channel.server.roles.get("name", st);
				break;
			}
		}
		if (role) {
			bot.deleteRole(role, (e) => {
				if (e) {
					bot.sendMessage(msg, "Error deleting role: " + e);
				}
				else {
					bot.sendMessage(msg, "Successfully deleted role: `" + role.name + "`");
				}
			});
		}
		else {
			bot.sendMessage(msg, "That role doesn't exist!");
			return;
		}
	}
};

Commands.addrole = {
	name: "addrole",
	usage: "<wtf is this>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!");
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!addrole`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!addrole` to function correctly!");
			return;
		}

		if (!suffix) {
			bot.sendMessage(msg, "You didn't tell me what role to add to a user!");
			return;
		}
		if (msg.mentions.length != 1) {
			bot.sendMessage(msg, "You must mention exactly 1 user!");
			return;
		}
		msg.mentions.map((user) => {
			if (suffix.split(" ")[0] === "<@" + user.id + ">") {
				suffix = suffix.replace("<@" + user.id + ">", "").substring(1);
			}
			else {
				suffix = suffix.replace("<@" + user.id + ">", "").trim();
			}
			var role = "";
			var s = suffix.toLowerCase();
			var sp = s.split("");
			for (var i = 0, l = 1 << s.length; i < l; i++) {
				for (var j = i, k = 0; j; j >>= 1, k++) {
					sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
				}
				var st = sp.join("");
				//console.log(st);
				role = msg.channel.server.roles.get("name", st);
				if (role) {
					role = msg.channel.server.roles.get("name", st);
					break;
				}
			}
			if (!role || role === "") {
				bot.sendMessage(msg, "Role not found.");
				return;
			}
			var hasrole = bot.memberHasRole(user, role);
			if (hasrole) {
				bot.sendMessage(msg.channel, user + " already has that role!");
				return;
			}
			bot.addMemberToRole(user, role, (e) => {
				if (e) {
					bot.sendMessage(msg, "Error giving member role. `" + e + "`");
				}
				else {
					bot.sendMessage(msg, "Successfully gave `" + user.name + "` the role `" + role.name + "` !");
				}
			});
		});
	}
};

Commands.removerole = {
	name: "addrole",
	usage: "<wtf is this>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!addrole`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!addrole` to function correctly!");
			return;
		}

		if (!suffix) {
			bot.sendMessage(msg, "You didn't tell me what role to delete!");
			return;
		}
		if (msg.mentions.length != 1) {
			bot.sendMessage(msg, "You must mention exactly 1 user!");
			return;
		}
		msg.mentions.map((user) => {
			if (suffix.split(" ")[0] === "<@" + user.id + ">") {
				suffix = suffix.replace("<@" + user.id + ">", "").substring(1);
			}
			else {
				suffix = suffix.replace("<@" + user.id + ">", "").trim();
			}
			var role = "";
			var s = suffix.toLowerCase();
			var sp = s.split("");
			for (var i = 0, l = 1 << s.length; i < l; i++) {
				for (var j = i, k = 0; j; j >>= 1, k++) {
					sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
				}
				var st = sp.join("");
				//console.log(st);
				role = msg.channel.server.roles.get("name", st);
				if (role) {
					role = msg.channel.server.roles.get("name", st);
					break;
				}
			}
			if (!role) {
				bot.sendMessage(msg, "Role not found.");
				return;
			}
			var hasrole = bot.memberHasRole(user, role);
			if (!hasrole) {
				bot.sendMessage(msg.channel, user + " doesn't have that role!");
				return;
			}
			bot.removeMemberFromRole(user, role, (e) => {
				if (e) {
					bot.sendMessage(msg, "Error removing role. `" + e + "`");
				}
				else {
					bot.sendMessage(msg, "Successfully removed `" + user.name + "` from `" + role.name + "` !");
				}
			});
		});
	}
};

Commands.anime = {
	name: "anime",
	usage: "<anime name>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (suffix) {
			var USER = ConfigFile.mal.user;
			var PASS = ConfigFile.mal.pass;
			if (!USER || !PASS) {
				bot.sendMessage(msg, "MAL login not configured by bot owner", function(erro, wMessage) {
					bot.deleteMessage(wMessage, {
						"wait": 8000
					});
				});
				return;
			}
			bot.startTyping(msg.channel);
			var tags = suffix.split(" ").join("+");
			var rUrl = "http://myanimelist.net/api/anime/search.xml?q=" + tags;
			request(rUrl, {
				"auth": {
					"user": USER,
					"pass": PASS,
					"sendImmediately": false
				}
			}, function(error, response, body) {
				if (error) {
					console.log(error);
				}
				if (!error && response.statusCode == 200) {
					xml2js.parseString(body, function(err, result) {
						if (err) console.error(err);
						var title = result.anime.entry[0].title;
						var english = result.anime.entry[0].english;
						var ep = result.anime.entry[0].episodes;
						var score = result.anime.entry[0].score;
						var type = result.anime.entry[0].type;
						var status = result.anime.entry[0].status;
						var synopsis = result.anime.entry[0].synopsis.toString();
						var picture = result.anime.entry[0].image[0];
						synopsis = synopsis.replace(/<br \/>/g, " ");
						synopsis = synopsis.replace(/\[(.{1,10})\]/g, "");
						synopsis = synopsis.replace(/\r?\n|\r/g, " ");
						synopsis = synopsis.replace(/\[(i|\/i)\]/g, "*");
						synopsis = synopsis.replace(/\[(b|\/b)\]/g, "**");
						synopsis = ent.decodeHTML(synopsis);
						setTimeout(function() {
							bot.sendMessage(msg, "**" + title + " / " + english + "**\n**Type:** " + type + " **| Episodes:** " + ep + " **| Status:** " + status + " **| Score:** " + score + "\n" + synopsis);
						}, 2000);
						bot.sendFile(msg.channel, picture);
					});
				}
				else {
					bot.sendMessage(msg, "\"" + suffix + "\" not found", function(erro, wMessage) {
						bot.deleteMessage(wMessage, {
							"wait": 8000
						});
					});
				}
			});
			bot.stopTyping(msg.channel);
		}
	}
};

function getMods(mods) {
	var mods = parseInt(mods, 10);
    var returnString = "";

    var ModsEnum = {
    None: 0,
    NoFail: 1,
    Easy: 2,
    //NoVideo      = 4,
    Hidden: 8,
    HardRock: 16,
    SuddenDeath: 32,
    DoubleTime: 64,
    Relax: 128,
    HalfTime: 256,
    Nightcore: 512, // Only set along with DoubleTime. i.e: NC only gives 576
    Flashlight: 1024,
    Autoplay: 2048,
    SpunOut: 4096,
    Relax2: 8192,  // Autopilot?
    Perfect: 16384,
    Key4: 32768,
    Key5: 65536,
    Key6: 131072,
    Key7: 262144,
    Key8: 524288,
    keyMod: 32768 | 65536 | 131072 | 262144 | 524288,
    FadeIn: 1048576,
    Random: 2097152,
    LastMod: 4194304,
    FreeModAllowed: 1 | 2 | 8 | 16 | 32 | 1024 | 1048576 | 16384 | 8192 | 4096 | (32768 | 65536 | 131072 | 262144 | 524288),
    Key9: 16777216,
    Key10: 33554432,
    Key1: 67108864,
    Key3: 134217728,
    Key2: 268435456
};

    if ((mods & ModsEnum.DoubleTime) == ModsEnum.DoubleTime) {
        if ((mods & ModsEnum.Nightcore) == ModsEnum.Nightcore) returnString += "NC";
        else returnString += "DT";
    }
    if ((mods & ModsEnum.Hidden) == ModsEnum.Hidden) returnString += "HD";
    if ((mods & ModsEnum.Easy) == ModsEnum.Easy) returnString += "EZ";
    if ((mods & ModsEnum.Flashlight) == ModsEnum.Flashlight) returnString += "FL";
    if ((mods & ModsEnum.HalfTime) == ModsEnum.HalfTime) returnString += "HT";
    if ((mods & ModsEnum.HardRock) == ModsEnum.HardRock) returnString += "HR";
    if ((mods & ModsEnum.NoFail) == ModsEnum.NoFail) returnString += "NF";
    if ((mods & ModsEnum.Perfect) == ModsEnum.Perfect) returnString += "PF";
    if ((mods & ModsEnum.SuddenDeath) == ModsEnum.SuddenDeath) returnString += "SD";
    if ((mods & ModsEnum.Random) == ModsEnum.Random) returnString += "Random ";
    if ((mods & ModsEnum.LastMod) == ModsEnum.LastMod) returnString += "7K ";
    if ((mods & ModsEnum.Relax) == ModsEnum.Relax) returnString += "Relax ";
    if ((mods & ModsEnum.Relax2) == ModsEnum.Relax2) returnString += "AutoPilot ";
    if ((mods & ModsEnum.SpunOut) == ModsEnum.SpunOut) returnString += "SpunOut ";
    if ((mods & ModsEnum.Autoplay) == ModsEnum.Autoplay) returnString += "Autoplay ";
    if ((mods & ModsEnum.Key1) == ModsEnum.Key1) returnString += "1K ";
    if ((mods & ModsEnum.Key2) == ModsEnum.Key2) returnString += "2K ";
    if ((mods & ModsEnum.Key3) == ModsEnum.Key3) returnString += "3K ";
    if ((mods & ModsEnum.Key4) == ModsEnum.Key4) returnString += "4K ";
    if ((mods & ModsEnum.Key5) == ModsEnum.Key5) returnString += "5K ";
    if ((mods & ModsEnum.Key6) == ModsEnum.Key6) returnString += "6K ";
    if ((mods & ModsEnum.Key7) == ModsEnum.Key7) returnString += "7K ";
    if ((mods & ModsEnum.Key8) == ModsEnum.Key8) returnString += "8K ";
    if ((mods & ModsEnum.Key9) == ModsEnum.Key9) returnString += "9K ";
    if ((mods & ModsEnum.Key10) == ModsEnum.Key10) returnString += "10K ";

    returnString = returnString.trim();
    return returnString;
}

function getAccuracy(score, mode) {
    var accuracy;
    switch (mode) {
        case "1":
            accuracy = (((score.count100 * 0.5) + (score.count300 * 1)) * 300 / ((score.count300 + score.count100 + score.countmiss) * 300) * 100).toFixed(2);
            break;
        case "2":
            accuracy = (((score.count50 + score.count100 + score.count300) * 100) / (score.count50 + score.count100 + score.count300 + score.countmiss + score.countkatu)).toFixed(2);
            break;
        case "3":
            accuracy = (((score.countgeki * 300) + (score.count300 * 300) + (score.countkatu * 200) + (score.count100 * 100) + (score.count50 * 50)) / ((score.countgeki + score.count300 + score.countkatu + score.count100 + score.count50 + score.countmiss) * 300) * 100).toFixed(2);
            break;
        default:
            accuracy = (((score.count300 * 300) + (score.count100 * 100) + (score.count50 * 50) + (score.countmiss * 0)) / ((score.count300 + score.count100 + score.count50 + score.countmiss) * 300) * 100).toFixed(2);
            break;
    }
    return accuracy;
}

Commands.osu = {
	name: "osu",
	level: 0,
	usage: "<sig/user/best/recent> [username] [hex color for sig]",
	fn: function(bot, msg, suffix, user) {
		var username;
		Permissions.GetOsu(msg, function(err, reply) {
			if (err) {
				bot.sendMessage(msg.channel, "Sorry, an error occured, try again later.");
				return;
			}
			if (reply) {
				username = reply;
			}
			if (suffix) {
				if (suffix.split(" ")[0] === "sig") {
					var color = "ff66aa",
						username = msg.author.username;
					suffix = suffix.split(" ");
					if (suffix.length <= 1) {
						bot.sendMessage(msg, "You didn't specify a username or hex color! Usage: `!signature <username> <hexcolor>`");
						return;
					}
					else if (suffix.length === 2) {
						bot.sendMessage(msg, "Invalid usage! Usage: `!signature <username> <hexcolor>`");
						return;
					}
					else if (suffix.length >= 4) {
						bot.sendMessage(msg, "Invalid usage! Usage: `!signature <username> <hexcolor>`");
						return;
					}

					else if (suffix.length === 3) {
						if (/sig (.*) #?[A-Fa-f0-9]{6}$/.test(suffix.join(" "))) {
							username = suffix.join("%20").substring(6, suffix.join("%20").lastIndexOf("%20"));
							if (suffix[suffix.length - 1].length == 6) {
								color = suffix[suffix.length - 1];
							}
							if (suffix[suffix.length - 1].length == 7) {
								color = suffix[suffix.length - 1].substring(1);
							}
						}
						else if (/sig #?[A-Fa-f0-9]{6}$/.test(suffix.join(" "))) {
							username = msg.author.username;
							if (suffix[1].length == 6) {
								color = suffix[1];
							}
							if (suffix[1].length == 7) {
								color = suffix[1].substring(1);
							}
						}
					}
					request({
						url: 'https://lemmmy.pw/osusig/sig.php?colour=hex' + color + '&uname=' + username + '&pp=2&flagshadow&xpbar&xpbarhex&darktriangles',
						encoding: null
					}, function(err, response, body) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
						else if (response.statusCode != 200) {
							bot.sendMessage(msg, ":warning: Got status code " + response.statusCode, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
						else {
							bot.sendMessage(msg, "Here's your osu signature " + msg.author.username + "!");
							bot.sendFile(msg, body, 'sig.png');
						}
					});

				}
				else if (suffix.split(" ")[0] == "standard") {

					//var username = msg.author.username;
					if (suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
						username = suffix.substring(9);
					}
					osu.getUser(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data) {
							bot.sendMessage(msg, ":warning: User not found", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						var aaa = data.count300;
						var bbb = data.count100;
						var ccc = data.count50;
						var ddd = parseInt(aaa, 10) + parseInt(bbb, 10) + parseInt(ccc, 10);
						var eee = ddd.toString();
						var avatar = data.user_id;
						try {
							var msgArray = [];
							msgArray.push("osu stats for: **" + data.username + "**:");
							msgArray.push("----------------------------------");
							msgArray.push("**Profile Link**: http://osu.ppy.sh/u/" + data.user_id);
							msgArray.push("**Play Count**: " + data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Ranked Score**: " + data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Score**: " + data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Level**: " + data.level.substring(0, data.level.split(".")[0].length + 3));
							msgArray.push("**PP**: " + data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Rank**: #" + data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Country Rank**: #" + data.pp_country_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Accuracy**: " + data.accuracy.substring(0, data.accuracy.split(".")[0].length + 3) + "%");
							msgArray.push("**300**: " + data.count300.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **100**: " + data.count100.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **50**: " + data.count50.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **SS**: " + data.count_rank_ss + " | **S**: " + data.count_rank_s + " | **A**: " + data.count_rank_a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Hits**: " + eee.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
							msgArray.push("");
							bot.sendMessage(msg, msgArray);
							bot.sendFile(msg.channel, 'http://a.ppy.sh/' + avatar + '_1.png');
						}
						catch (error) {
							bot.sendMessage(msg, "Error: " + error, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
					});

				}
				else if (suffix.split(" ")[0] == "mania") {

					if (suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
						username = suffix.substring(6);
					}
					osu.setMode(3);
					osu.getUser(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data) {
							bot.sendMessage(msg, ":warning: User not found", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						var aaa = data.count300;
						var bbb = data.count100;
						var ccc = data.count50;
						var ddd = parseInt(aaa, 10) + parseInt(bbb, 10) + parseInt(ccc, 10);
						var eee = ddd.toString();
						var avatar = data.user_id;
						try {
							var msgArray = [];
							msgArray.push("osu!mania stats for: **" + data.username + "**:");
							msgArray.push("**Profile Link**: http://osu.ppy.sh/u/" + data.user_id);
							msgArray.push("----------------------------------");
							msgArray.push("**Play Count**: " + data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Ranked Score**: " + data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Score**: " + data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Level**: " + data.level.substring(0, data.level.split(".")[0].length + 3));
							msgArray.push("**PP**: " + data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Rank**: #" + data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Country Rank**: #" + data.pp_country_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Accuracy**: " + data.accuracy.substring(0, data.accuracy.split(".")[0].length + 3) + "%");
							msgArray.push("**300**: " + data.count300.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **100**: " + data.count100.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **50**: " + data.count50.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **SS**: " + data.count_rank_ss + " | **S**: " + data.count_rank_s + " | **A**: " + data.count_rank_a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Hits**: " + eee.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
							msgArray.push("");
							bot.sendMessage(msg, msgArray);
							bot.sendFile(msg.channel, 'http://a.ppy.sh/' + avatar + '_1.png');
						}
						catch (error) {
							bot.sendMessage(msg, "Error: " + error, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
					});

				}
				else if (suffix.split(" ")[0] == "taiko") {

					if (suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
						username = suffix.substring(6);
					}
					osu.setMode(1);
					osu.getUser(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data) {
							bot.sendMessage(msg, ":warning: User not found", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						var aaa = data.count300;
						var bbb = data.count100;
						var ccc = data.count50;
						var ddd = parseInt(aaa, 10) + parseInt(bbb, 10) + parseInt(ccc, 10);
						var eee = ddd.toString();
						var avatar = data.user_id;
						try {
							var msgArray = [];
							msgArray.push("Taiko stats for: **" + data.username + "**:");
							msgArray.push("----------------------------------");
							msgArray.push("**Profile Link**: http://osu.ppy.sh/u/" + data.user_id);
							msgArray.push("**Play Count**: " + data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Ranked Score**: " + data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Score**: " + data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Level**: " + data.level.substring(0, data.level.split(".")[0].length + 3));
							msgArray.push("**PP**: " + data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Rank**: #" + data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Country Rank**: #" + data.pp_country_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Accuracy**: " + data.accuracy.substring(0, data.accuracy.split(".")[0].length + 3) + "%");
							msgArray.push("**300**: " + data.count300.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **100**: " + data.count100.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **SS**: " + data.count_rank_ss + " | **S**: " + data.count_rank_s + " | **A**: " + data.count_rank_a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Hits**: " + eee.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
							msgArray.push("");
							bot.sendMessage(msg, msgArray);
							bot.sendFile(msg.channel, 'http://a.ppy.sh/' + avatar + '_1.png');
						}
						catch (error) {
							bot.sendMessage(msg, "Error: " + error, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
					});

				}
				else if (suffix.split(" ")[0] == "ctb") {

					if (suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
						username = suffix.substring(4);
					}
					osu.setMode(2);
					osu.getUser(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data) {
							bot.sendMessage(msg, ":warning: User not found", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						var aaa = data.count300;
						var bbb = data.count100;
						var ccc = data.count50;
						var ddd = parseInt(aaa, 10) + parseInt(bbb, 10) + parseInt(ccc, 10);
						var eee = ddd.toString();
						var avatar = data.user_id;
						try {
							var msgArray = [];
							msgArray.push("CtB stats for: **" + data.username + "**:");
							msgArray.push("----------------------------------");
							msgArray.push("**Profile Link**: http://osu.ppy.sh/u/" + data.user_id);
							msgArray.push("**Play Count**: " + data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Ranked Score**: " + data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Score**: " + data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Level**: " + data.level.substring(0, data.level.split(".")[0].length + 3));
							msgArray.push("**PP**: " + data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Rank**: #" + data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Country Rank**: #" + data.pp_country_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Accuracy**: " + data.accuracy.substring(0, data.accuracy.split(".")[0].length + 3) + "%");
							msgArray.push("**300**: " + data.count300.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **100**: " + data.count100.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **50**: " + data.count50.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **SS**: " + data.count_rank_ss + " | **S**: " + data.count_rank_s + " | **A**: " + data.count_rank_a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Hits**: " + eee.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
							msgArray.push("");
							bot.sendMessage(msg, msgArray);
							bot.sendFile(msg.channel, 'http://a.ppy.sh/' + avatar + '_1.png');
						}
						catch (error) {
							bot.sendMessage(msg, "Error: " + error, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
					});

				}
				else if (suffix.split(" ")[0] === "best" && suffix.split(" ")[1] === "mania") {

					if (suffix.split(" ").length >= 3 && suffix.split(" ")[2] != "") {
						username = suffix.substring(11);
					}
					osu.setMode(3);
					osu.getUserBest(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) {
							bot.sendMessage(msg, ":warning: User not found or user doesn't have 5 plays", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						try {
							var msgArray = [];
							msgArray.push("Top 5 osu!mania scores for: **" + username + "**:");
							msgArray.push("----------------------------------");
							osu.getBeatmap(data[0].beatmap_id, function(err, map1) {
								if (err) console.error(err);
								osu.getUserScore(data[0].beatmap_id, data[0].user_id, function(err, mod1) {
									if (err) console.error(err);
									var mods1 = getMods(mod1.enabled_mods);
									msgArray.push("**1.** *" + map1.title + "* *(☆" + map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[0].pp.split(".")[0]) + " **| Score:** " + data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[0].countmiss + " ** | Mods:** " + mods1);
									osu.getBeatmap(data[1].beatmap_id, function(err, map2) {
										if (err) console.error(err);
										osu.getUserScore(data[1].beatmap_id, data[1].user_id, function(err, mod2) {
											if (err) console.error(err);
											var mods2 = getMods(mod2.enabled_mods);
											msgArray.push("**2.** *" + map2.title + "* *(☆" + map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[1].pp.split(".")[0]) + " **| Score:** " + data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[1].countmiss + " **| Mods:** " + mods2);
											osu.getBeatmap(data[2].beatmap_id, function(err, map3) {
												if (err) console.error(err);
												osu.getUserScore(data[2].beatmap_id, data[2].user_id, function(err, mod3) {
													if (err) console.error(err);
													var mods3 = getMods(mod3.enabled_mods);
													msgArray.push("**3.** *" + map3.title + "* *(☆" + map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[2].pp.split(".")[0]) + " **| Score:** " + data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[2].countmiss + " **| Mods:** " + mods3);
													osu.getBeatmap(data[3].beatmap_id, function(err, map4) {
														if (err) console.error(err);
														osu.getUserScore(data[3].beatmap_id, data[3].user_id, function(err, mod4) {
															if (err) console.error(err);
															var mods4 = getMods(mod4.enabled_mods);
															msgArray.push("**4.** *" + map4.title + "* *(☆" + map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[3].pp.split(".")[0]) + " **| Score:** " + data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[3].countmiss + " **| Mods:** " + mods4);
															osu.getBeatmap(data[4].beatmap_id, function(err, map5) {
																if (err) console.error(err);
																osu.getUserScore(data[4].beatmap_id, data[4].user_id, function(err, mod5) {
																	if (err) console.error(err);
																	var mods5 = getMods(mod5.enabled_mods);
																	msgArray.push("**5.** *" + map5.title + "* *(☆" + map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[4].pp.split(".")[0]) + " **| Score:** " + data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[4].countmiss + " **| Mods:** " + mods5);
																	bot.sendMessage(msg, msgArray);
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						}
						catch (error) {
							bot.sendMessage(msg, "Error: " + error, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
					});

				}
				else if (suffix.split(" ")[0] === "best" && suffix.split(" ")[1] === "standard") {

					if (suffix.split(" ").length >= 3 && suffix.split(" ")[2] != "") {
						username = suffix.substring(14);
					}
					osu.getUserBest(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) {
							bot.sendMessage(msg, ":warning: User not found or user doesn't have 5 plays", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						try {
							var msgArray = [];
							msgArray.push("Top 5 osu scores for: **" + username + "**:");
							msgArray.push("----------------------------------");
							osu.getBeatmap(data[0].beatmap_id, function(err, map1) {
								if (err) console.error(err);
								osu.getUserScore(data[0].beatmap_id, data[0].user_id, function(err, mod1) {
									if (err) console.error(err);
									var mods1 = getMods(mod1.enabled_mods);
									msgArray.push("**1.** *" + map1.title + "* *(☆" + map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[0].pp.split(".")[0]) + " **| Score:** " + data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[0].countmiss + " ** | Mods:** " + mods1);
									osu.getBeatmap(data[1].beatmap_id, function(err, map2) {
										if (err) console.error(err);
										osu.getUserScore(data[1].beatmap_id, data[1].user_id, function(err, mod2) {
											if (err) console.error(err);
											var mods2 = getMods(mod2.enabled_mods);
											msgArray.push("**2.** *" + map2.title + "* *(☆" + map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[1].pp.split(".")[0]) + " **| Score:** " + data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[1].countmiss + " **| Mods:** " + mods2);
											osu.getBeatmap(data[2].beatmap_id, function(err, map3) {
												if (err) console.error(err);
												osu.getUserScore(data[2].beatmap_id, data[2].user_id, function(err, mod3) {
													if (err) console.error(err);
													var mods3 = getMods(mod3.enabled_mods);
													msgArray.push("**3.** *" + map3.title + "* *(☆" + map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[2].pp.split(".")[0]) + " **| Score:** " + data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[2].countmiss + " **| Mods:** " + mods3);
													osu.getBeatmap(data[3].beatmap_id, function(err, map4) {
														if (err) console.error(err);
														osu.getUserScore(data[3].beatmap_id, data[3].user_id, function(err, mod4) {
															if (err) console.error(err);
															var mods4 = getMods(mod4.enabled_mods);
															msgArray.push("**4.** *" + map4.title + "* *(☆" + map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[3].pp.split(".")[0]) + " **| Score:** " + data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[3].countmiss + " **| Mods:** " + mods4);
															osu.getBeatmap(data[4].beatmap_id, function(err, map5) {
																if (err) console.error(err);
																osu.getUserScore(data[4].beatmap_id, data[4].user_id, function(err, mod5) {
																	if (err) console.error(err);
																	var mods5 = getMods(mod5.enabled_mods);
																	msgArray.push("**5.** *" + map5.title + "* *(☆" + map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[4].pp.split(".")[0]) + " **| Score:** " + data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[4].countmiss + " **| Mods:** " + mods5);
																	bot.sendMessage(msg, msgArray);
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						}
						catch (error) {
							bot.sendMessage(msg, "Error: " + error, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
					});

				}
				else if (suffix.split(" ")[0] === "best" && suffix.split(" ")[1] === "ctb") {

					if (suffix.split(" ").length >= 3 && suffix.split(" ")[2] != "") {
						username = suffix.substring(9);
					}
					osu.setMode(2);
					osu.getUserBest(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) {
							bot.sendMessage(msg, ":warning: User not found or user doesn't have 5 plays", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						try {
							var msgArray = [];
							msgArray.push("Top 5 osu scores for: **" + username + "**:");
							msgArray.push("----------------------------------");
							osu.getBeatmap(data[0].beatmap_id, function(err, map1) {
								if (err) console.error(err);
								osu.getUserScore(data[0].beatmap_id, data[0].user_id, function(err, mod1) {
									if (err) console.error(err);
									var mods1 = getMods(mod1.enabled_mods);
									msgArray.push("**1.** *" + map1.title + "* *(☆" + map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[0].pp.split(".")[0]) + " **| Score:** " + data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[0].countmiss + " ** | Mods:** " + mods1);
									osu.getBeatmap(data[1].beatmap_id, function(err, map2) {
										if (err) console.error(err);
										osu.getUserScore(data[1].beatmap_id, data[1].user_id, function(err, mod2) {
											if (err) console.error(err);
											var mods2 = getMods(mod2.enabled_mods);
											msgArray.push("**2.** *" + map2.title + "* *(☆" + map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[1].pp.split(".")[0]) + " **| Score:** " + data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[1].countmiss + " **| Mods:** " + mods2);
											osu.getBeatmap(data[2].beatmap_id, function(err, map3) {
												if (err) console.error(err);
												osu.getUserScore(data[2].beatmap_id, data[2].user_id, function(err, mod3) {
													if (err) console.error(err);
													var mods3 = getMods(mod3.enabled_mods);
													msgArray.push("**3.** *" + map3.title + "* *(☆" + map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[2].pp.split(".")[0]) + " **| Score:** " + data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[2].countmiss + " **| Mods:** " + mods3);
													osu.getBeatmap(data[3].beatmap_id, function(err, map4) {
														if (err) console.error(err);
														osu.getUserScore(data[3].beatmap_id, data[3].user_id, function(err, mod4) {
															if (err) console.error(err);
															var mods4 = getMods(mod4.enabled_mods);
															msgArray.push("**4.** *" + map4.title + "* *(☆" + map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[3].pp.split(".")[0]) + " **| Score:** " + data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[3].countmiss + " **| Mods:** " + mods4);
															osu.getBeatmap(data[4].beatmap_id, function(err, map5) {
																if (err) console.error(err);
																osu.getUserScore(data[4].beatmap_id, data[4].user_id, function(err, mod5) {
																	if (err) console.error(err);
																	var mods5 = getMods(mod5.enabled_mods);
																	msgArray.push("**5.** *" + map5.title + "* *(☆" + map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[4].pp.split(".")[0]) + " **| Score:** " + data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[4].countmiss + " **| Mods:** " + mods5);
																	bot.sendMessage(msg, msgArray);
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						}
						catch (error) {
							bot.sendMessage(msg, "Error: " + error, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
					});

				}
				else if (suffix.split(" ")[0] === "best" && suffix.split(" ")[1] === "taiko") {

					if (suffix.split(" ").length >= 3 && suffix.split(" ")[2] != "") {
						username = suffix.substring(11);
					}
					osu.setMode(1);
					osu.getUserBest(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) {
							bot.sendMessage(msg, ":warning: User not found or user doesn't have 5 plays", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						try {
							var msgArray = [];
							msgArray.push("Top 5 osu scores for: **" + username + "**:");
							msgArray.push("----------------------------------");
							osu.getBeatmap(data[0].beatmap_id, function(err, map1) {
								if (err) console.error(err);
								osu.getUserScore(data[0].beatmap_id, data[0].user_id, function(err, mod1) {
									if (err) console.error(err);
									var mods1 = getMods(mod1.enabled_mods);
									msgArray.push("**1.** *" + map1.title + "* *(☆" + map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[0].pp.split(".")[0]) + " **| Score:** " + data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[0].countmiss + " ** | Mods:** " + mods1);
									osu.getBeatmap(data[1].beatmap_id, function(err, map2) {
										if (err) console.error(err);
										osu.getUserScore(data[1].beatmap_id, data[1].user_id, function(err, mod2) {
											if (err) console.error(err);
											var mods2 = getMods(mod2.enabled_mods);
											msgArray.push("**2.** *" + map2.title + "* *(☆" + map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[1].pp.split(".")[0]) + " **| Score:** " + data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[1].countmiss + " **| Mods:** " + mods2);
											osu.getBeatmap(data[2].beatmap_id, function(err, map3) {
												if (err) console.error(err);
												osu.getUserScore(data[2].beatmap_id, data[2].user_id, function(err, mod3) {
													if (err) console.error(err);
													var mods3 = getMods(mod3.enabled_mods);
													msgArray.push("**3.** *" + map3.title + "* *(☆" + map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[2].pp.split(".")[0]) + " **| Score:** " + data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[2].countmiss + " **| Mods:** " + mods3);
													osu.getBeatmap(data[3].beatmap_id, function(err, map4) {
														if (err) console.error(err);
														osu.getUserScore(data[3].beatmap_id, data[3].user_id, function(err, mod4) {
															if (err) console.error(err);
															var mods4 = getMods(mod4.enabled_mods);
															msgArray.push("**4.** *" + map4.title + "* *(☆" + map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[3].pp.split(".")[0]) + " **| Score:** " + data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[3].countmiss + " **| Mods:** " + mods4);
															osu.getBeatmap(data[4].beatmap_id, function(err, map5) {
																if (err) console.error(err);
																osu.getUserScore(data[4].beatmap_id, data[4].user_id, function(err, mod5) {
																	if (err) console.error(err);
																	var mods5 = getMods(mod5.enabled_mods);
																	msgArray.push("**5.** *" + map5.title + "* *(☆" + map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[4].pp.split(".")[0]) + " **| Score:** " + data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[4].countmiss + " **| Mods:** " + mods5);
																	bot.sendMessage(msg, msgArray);
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						}
						catch (error) {
							bot.sendMessage(msg, "Error: " + error, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
						}
					});

				}
				else if (suffix.split(" ")[0] === "recent") {

					if (suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
						username = suffix.substring(7);
					}
					osu.getUserRecent(username, function(err, data) {
						if (err) {
							bot.sendMessage(msg, ":warning: Error: " + err, function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						if (!data || !data[0]) {
							bot.sendMessage(msg, ":warning: User not found or no recent plays", function(erro, wMessage) {
								bot.deleteMessage(wMessage, {
									"wait": 8000
								});
							});
							return;
						}
						var msgArray = [];
						msgArray.push("5 most recent plays for: **" + username + "**:");
						msgArray.push("----------------------------------");
						osu.getBeatmap(data[0].beatmap_id, function(err, map1) {
							if (err) console.error(err);
							msgArray.push("**1.** *" + map1.title + "* *(☆" + map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length + 3) + ")*: **Score:** " + data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[0].countmiss);
							if (!data[1]) {
								bot.sendMessage(msg, msgArray);
								return;
							}
							osu.getBeatmap(data[1].beatmap_id, function(err, map2) {
								if (err) console.error(err);
								msgArray.push("**2.** *" + map2.title + "* *(☆" + map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length + 3) + ")*: **Score:** " + data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[1].countmiss);
								if (!data[2]) {
									bot.sendMessage(msg, msgArray);
									return;
								}
								osu.getBeatmap(data[2].beatmap_id, function(err, map3) {
									if (err) console.error(err);
									msgArray.push("**3.** *" + map3.title + "* *(☆" + map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length + 3) + ")*: **Score:** " + data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[2].countmiss);
									if (!data[3]) {
										bot.sendMessage(msg, msgArray);
										return;
									}
									osu.getBeatmap(data[3].beatmap_id, function(err, map4) {
										if (err) console.error(err);
										msgArray.push("**4.** *" + map4.title + "* *(☆" + map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length + 3) + ")*: **Score:** " + data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[3].countmiss);
										if (!data[4]) {
											bot.sendMessage(msg, msgArray);
											return;
										}
										osu.getBeatmap(data[4].beatmap_id, function(err, map5) {
											if (err) console.error(err);
											msgArray.push("**5.** *" + map5.title + "* *(☆" + map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length + 3) + ")*: **Score:** " + data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[4].countmiss);
											bot.sendMessage(msg, msgArray);
										});
									});
								});
							});
						});
					});

				}
				else {}
			}
			else {}
		});
	}
};

Commands.manga = {
		name: "manga",
		usage: "<manga/novel name>",
		level: 0,
		fn: function(bot, msg, suffix) {
			if (suffix) {
				var USER = ConfigFile.mal.user;
				var PASS = ConfigFile.mal.pass;
				if (!USER || !PASS) {
					bot.sendMessage(msg, "MAL login not configured by bot owner", function(erro, wMessage) {
						bot.deleteMessage(wMessage, {
							"wait": 8000
						});
					});
					return;
				}
				bot.startTyping(msg.channel);
				var tags = suffix.split(" ").join("+");
				var rUrl = "http://myanimelist.net/api/manga/search.xml?q=" + tags;
				request(rUrl, {
					"auth": {
						"user": USER,
						"pass": PASS,
						"sendImmediately": false
					}
				}, function(error, response, body) {
					if (error) {
						console.log(error);
					}
					if (!error && response.statusCode == 200) {
						xml2js.parseString(body, function(err, result) {
							if (err) console.error(err);
							//console.log(result);
							var title = result.manga.entry[0].title;
							var english = result.manga.entry[0].english;
							var chapters = result.manga.entry[0].chapters;
							var volumes = result.manga.entry[0].volumes;
							var score = result.manga.entry[0].score;
							var type = result.manga.entry[0].type;
							var status = result.manga.entry[0].status;
							var synopsis = result.manga.entry[0].synopsis.toString();
							var picture = result.manga.entry[0].image[0];
							synopsis = synopsis.replace(/<br \/>/g, " ");
							synopsis = synopsis.replace(/\[(.{1,10})\]/g, "");
							synopsis = synopsis.replace(/\r?\n|\r/g, " ");
							synopsis = synopsis.replace(/\[(i|\/i)\]/g, "*");
							synopsis = synopsis.replace(/\[(b|\/b)\]/g, "**");
							synopsis = ent.decodeHTML(synopsis);
							setTimeout(function() {
								bot.sendMessage(msg, "**" + title + " / " + english + "**\n**Type:** " + type + " **| Chapters:** " + chapters + " **| Volumes: **" + volumes + " **| Status:** " + status + " **| Score:** " + score + "\n" + synopsis);
							}, 2000);
							bot.sendFile(msg.channel, picture);
						});
					}
					else {
						bot.sendMessage(msg, "\"" + suffix + "\" not found", function(erro, wMessage) {
							bot.deleteMessage(wMessage, {
								"wait": 8000
							});
						});
					}
				});
				bot.stopTyping(msg.channel);
			}
		}
	},

	Commands.e621 = {
		name: "e621",
		help: "e621, the defenition of *Stop taking the Internet so seriously.*",
		usage: "<tags> multi-word tags need to be typed like: wildbeast_is_a_discord_bot",
		level: 3,
		nsfw: true,
		fn: function(bot, msg, suffix) {
			bot.startTyping(msg.channel);
			unirest.post("https://e621.net/post/index.json?limit=500&tags=" + suffix) // 
				.end(function(result) {
					if (result.body.length < 1) {
						bot.sendMessage(msg.channel, "Sorry, nothing found.");
						bot.stopTyping(msg.channel);
						return;
					}
					else {
						var count = Math.floor((Math.random() * result.body.length));
						var count1 = Math.floor((Math.random() * result.body.length));
						var count2 = Math.floor((Math.random() * result.body.length));
						var e621 = result.body[count].file_url;
						var e6212 = result.body[count1].file_url;
						var e6213 = result.body[count2].file_url;
						bot.sendMessage(msg.channel, "You've searched for `" + suffix + "`");
						bot.sendFile(msg.channel, e621);
						bot.sendFile(msg.channel, e6212);
						bot.sendFile(msg.channel, e6213);
						bot.stopTyping(msg.channel);
					}
				});
		}
	};

Commands.eval = {
	name: "eval",
	help: "Allows the execution of arbitrary Javascript code within the context of the bot.",
	level: 6, // Now 100% sure it can't be used by anyone but the master user.
	fn: function(bot, msg, suffix) {
		try {
			bot.sendMessage(msg.channel, eval(suffix));
		}
		catch (err) {
			bot.sendMessage(msg.channel, "Eval failed :(");
			bot.sendMessage(msg.channel, "```" + err + "```");
		}
	}
};

Commands.setstatus = {
	name: "setstatus",
	help: "This will change my current status to something else.",
	usage: "<online / away> [playing status]",
	level: 5,
	fn: function(bot, msg, suffix) {
		var step = suffix.split(" "),
			status = step[0],
			playingstep = step.slice(1, step.length),
			playing = playingstep.join(" ");
		if (!suffix) {
			bot.sendMessage(msg.channel, "You need a suffix, dummy!");
			return;
		}
		if (status === "online" || status === "away") {
			bot.setStatus(status, playing, function(error) {
				if (error) {
					bot.sendMessage(msg.channel, "Whoops, that doesn't work, try again.");
				}
				else if (playing) {
					bot.sendMessage(msg.channel, "Okay, I'm now " + status + " and playing " + playing);
				}
				else {
					bot.sendMessage(msg.channel, "Okay, I'm now " + status + ".");
				}
			});
		}
		else {
			bot.sendMessage(msg.channel, "I can only be `online` or `away`!");
			return;
		}
	}
};

Commands.cleverbot = {
	name: "cleverbot",
	help: "I'll act as Cleverbot when you execute this command, remember to enter a message as suffix.",
	usage: "<message>",
	level: 0,
	fn: function(bot, msg, suffix) {
		Cleverbot.prepare(function() {
			bot.startTyping(msg.channel);
			cleverbot.write(suffix, function(response) {
				bot.sendMessage(msg.channel, JSON.parse('"' + response.message.replace(/\|/g, "\\u") + '"'));
				bot.stopTyping(msg.channel);
			});
		});
	}
};

Commands.leave = {
	name: "leave",
	help: "I'll leave the server in which the command is executed, you'll need the *Manage server* permission in your role to use this command.",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.permissionsOf(msg.sender).hasPermission("banMembers") || (!msg.channel.permissionsOf(msg.sender).hasPermission("kickMembers"))) {
			bot.sendMessage(msg, "You must have either the `Kick Members` or `Ban Members` permission to use `!leave`");
			return;
		}
		if (msg.channel.server) {
			bot.sendMessage(msg.channel, "Alright, see ya!");
			bot.leaveServer(msg.channel.server);
			Logger.log("info", "I've left a server on request of " + msg.sender.username + ", I'm only in " + bot.servers.length + " servers now.");
			return;
		}
		else {
			bot.sendMessage(msg.channel, "I can't leave a DM, dummy!");
			return;
		}
	}
};

Commands.restart = {
	name: "restart",
	help: "This will instantly terminate all of the running instances of the bot without restarting.",
	level: 5, // If an access level is set to 4 or higher, only the master user can use this
	fn: function(bot, msg) {
		bot.sendMessage(msg.channel, "Be back in a second!");
		setTimeout(function() {
			bot.logout();
		}, 3000);
		Logger.log("warn", "Disconnected via killswitch!");
		setTimeout(function() {
			process.exit(0);
		}, 3000);
	}
};

Commands.copy = {
	name: "copy",
	level: 3,
	fn: function(bot, msg) {
		bot.awaitResponse(msg, "What would you like me to say?", {}, function(error, message) {
			if (error) {
				bot.sendMessage(msg.channel, error);
				return;
			}
			console.log(message);
			bot.getChannelLogs(msg.channel, 100, function(error, messages) {
				for (var i = 0; i < 100; i++) {
					if (messages[i].author.id == msg.author.id) {
						var response = messages[i].cleanContent.replace(/@everyone/gi, " ").replace(/@here/gi, " ");
						break;
					}
				}
				bot.sendMessage(msg.channel, response);
			});
		});
	}
};

Commands.purge = {
	name: "purge",
	help: "I'll delete a certain ammount of messages.",
	usage: "<number-of-messages-to-delete>",
	level: 0,
	fn: function(bot, msg, suffix) {
		var username;
		if (!msg.channel.server) return;
		if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageMessages")) {
			bot.sendMessage(msg, "You don't have the permission `Manage Messages`! You must have this permission to use `!purge`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageMessages")) {
			bot.sendMessage(msg, "I don't have the permission `Manage Messages`! I must have this permission for `!purge` to function correctly!");
			return;
		}
		if (msg.mentions.length === 1 && !isNaN(suffix.split(" ")[1])) {
			bot.getChannelLogs(msg.channel, 100, function(error, messages) {
				if (error) {
					bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
					return;
				}
				else {
					username = msg.mentions[0].username.toLowerCase();
					var todo = parseInt(suffix.split(" ")[1], 10);
					var delcount = 0;
					var messagestodelete = [];
					for (var i = 0; i < 100; i++) {
						if (todo <= 0) {
							if (messagestodelete.length === 1) {
								bot.deleteMessage(messagestodelete[0]);
							}
							else {
								bot.deleteMessages(messagestodelete);
							}
							bot.sendMessage(msg, "Deleted " + delcount + " of " + username + "'s messages");
							return;
						}
						else {
							if (messages[i].author.username.toLowerCase() == username) {
								messagestodelete.push(messages[i]);
								delcount++;
								todo--;
							}
						}
					}
				}
			});
			return;
		}
		if (msg.mentions.length === 1 && !isNaN(suffix.split(" ")[0])) {
			bot.getChannelLogs(msg.channel, 100, function(error, messages) {
				if (error) {
					bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
					return;
				}
				else {
					username = msg.mentions[0].username.toLowerCase();
					var todo = parseInt(suffix.split(" ")[0], 10);
					var delcount = 0;
					var messagestodelete = [];
					for (var i = 0; i < 100; i++) {
						if (todo <= 0) {
							if (messagestodelete.length === 1) {
								bot.deleteMessage(messagestodelete[0]);
							}
							else {
								bot.deleteMessages(messagestodelete);
							}
							bot.sendMessage(msg, "Deleted " + delcount + " of " + username + "'s messages.");
							return;
						}
						else {
							if (messages[i].author.username.toLowerCase() == username) {
								messagestodelete.push(messages[i]);
								delcount++;
								todo--;
							}
						}
					}
				}
			});
			return;
		}
		if (!suffix || isNaN(suffix)) {
			bot.sendMessage(msg.channel, "Please define an amount of messages for me to delete!");
			return;
		}
		if (msg.author.username === "BooBot") {
			bot.sendMessage(msg.channel, "Good try, BooBot");
			return;
		}
		if (suffix > 100) {
			bot.sendMessage(msg.channel, "The maximum is 100.");
			return;
		}
		bot.getChannelLogs(msg.channel, 100, function(error, messages) {
			if (error) {
				bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
				return;
			}
			else {
				var todo = parseInt(suffix.split(" ")[0], 10);
				var delcount = 0;
				var messagestodelete = [];
				for (var i = 0; i < 100; i++) {
					if (todo <= 0) {
						if (messagestodelete.length === 1) {
							bot.deleteMessage(messagestodelete[0]);
						}
						else {
							bot.deleteMessages(messagestodelete);
						}
						bot.sendMessage(msg, "Deleted " + delcount + " messages.");
						return;
					}
					else {
						messagestodelete.push(messages[i]);
						delcount++;
						todo--;
					}
				}
			}
		});
	}
};

Commands.ban = {
	name: "ban",
	help: "I'll delete a certain ammount of messages.",
	usage: "<number-of-messages-to-delete>",
	level: 0,
	fn: function(bot, msg, suffix) {
		var a = 0;
		if (!msg.channel.server) return;
		if (!msg.channel.permissionsOf(msg.sender).hasPermission("banMembers")) {
			bot.sendMessage(msg, "You don't have the permission `Ban Members`! You must have this permission to use `!ban`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("banMembers")) {
			bot.sendMessage(msg, "I don't have the permission `Ban Members`! I must have this permission for `!ban` to function correctly!");
			return;
		}
		if (msg.author.username === "BooBot") {
			bot.sendMessage(msg.channel, "Good try, BooBot");
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You must mention the user you want to ban!");
			return;
		}
		if (msg.mentions.length > 1) {
			bot.sendMessage(msg.channel, "You can only ban 1 person at a time!");
			return;
		}
		msg.mentions.forEach(function(user) {
			if (msg.author === user) {
				bot.sendMessage(msg.channel, "You can't ban yourself, idiot.");
				a = 2;
				return;
			}
			bot.banMember(user, msg.channel.server, function(err) {
				if (err) {
					bot.sendMessage(msg.author, "Couldn't ban " + user + "\nIt is likely i couldn't ban them successfully because my highest role is not above " + user + "'s highest role. I recommend you move my role to the top of the role list to avoid any further issues.");
					return;
				}
			});
			bot.sendMessage(msg.channel, user + " has been banned from " + msg.channel.server.name);
			Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
				if (err) console.error(err);
				if (reply != "none") {
					var reason = suffix.replace("<@" + user.id + ">", "");
					if (reason === "" || reason === " ") {
						reason = "No reason was provided.";
					}
					var array = [];
					array.push(user + " has been banned");
					array.push("Reason: " + reason);
					array.push("Banned by: " + msg.author);
					bot.sendMessage(reply, array);
				}
			});
			a = 1;
			return;
		});
		if (a === 0) {
			bot.sendMessage(msg.channel, "Couldn't find the mentioned user!");
		}
	}
};

Commands.unban = {
	name: "unban",
	help: "I'll delete a certain ammount of messages.",
	usage: "<number-of-messages-to-delete>",
	level: 0,
	fn: function(bot, msg, suffix) {
		var a = 0;
		if (!msg.channel.server) return;
		if (!msg.channel.permissionsOf(msg.sender).hasPermission("banMembers")) {
			bot.sendMessage(msg, "You don't have the permission `Ban Members`! You must have this permission to use `!ban`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("banMembers")) {
			bot.sendMessage(msg, "I don't have the permission `Ban Members`! I must have this permission for `!ban` to function correctly!");
			return;
		}
		if (msg.author.username === "BooBot") {
			bot.sendMessage(msg.channel, "Good try, BooBot");
			return;
		}
		if (msg.mentions.length < 1) {
			var users = bot.users.get("name", suffix.trim());
			if (users) {
				bot.unbanMember(users, msg.channel.server, function(err) {
					if (err) {
						return;
					}
					else {
						bot.sendMessage(msg.channel, users + " has been unbanned from " + msg.channel.server.name);
						return;
					}
				});
			}
			else {
				bot.sendMessage(msg.channel, "You must mention the user you want to unban!");
				return;
			}
		}
		if (msg.mentions.length > 1) {
			bot.sendMessage(msg.channel, "You can only unban 1 person at a time!");
			return;
		}
		msg.mentions.forEach(function(user) {
			if (msg.author === user) {
				bot.sendMessage(msg.channel, "How would you even unban yourself?!?!");
				a = 2;
				return;
			}
			bot.unbanMember(user, msg.channel.server);
			bot.sendMessage(msg.channel, user + " has been unbanned from " + msg.channel.server.name);
			Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
				if (err) console.error(err);
				if (reply != "none") {
					var reason = suffix.replace("<@" + user.id + ">", "");
					if (reason === "" || reason === " ") {
						reason = "No reason was provided.";
					}
					var array = [];
					array.push(user + " has been unbanned");
					array.push("Reason: " + reason);
					array.push("Unbanned by: " + msg.author);
					bot.sendMessage(reply, array);
				}
			});
			a = 1;
			return;
		});
		if (a === 0) {
			bot.sendMessage(msg.channel, "Couldn't find the mentioned user!");
		}
	}
};

Commands.kick = {
	name: "kick",
	level: 0,
	fn: function(bot, msg, suffix) {
		var a = 0;
		if (!msg.channel.server) return;
		if (!msg.channel.permissionsOf(msg.sender).hasPermission("kickMembers")) {
			bot.sendMessage(msg, "You don't have the permission `Kick Members`! You must have this permission to use `!kick`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("kickMembers")) {
			bot.sendMessage(msg, "I don't have the permission `Kick Members`! I must have this permission for `!kick` to function correctly!");
			return;
		}
		if (msg.author.username === "BooBot") {
			bot.sendMessage(msg.channel, "Good try, BooBot");
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You must mention the user you want to kick!");
			return;
		}
		if (msg.mentions.length < 1) {
			bot.sendMessage(msg.channel, "You can only kick 1 person at a time!");
			return;
		}
		msg.mentions.forEach(function(user) {
			if (msg.author === user) {
				bot.sendMessage(msg.channel, "You can't kick yourself, idiot.");
				a = 2;
				return;
			}
			bot.kickMember(user, msg.channel.server, function(err) {
				if (err) {
					bot.sendMessage(msg.author, "Couldn't kick " + user + "\nIt is likely i couldn't kick them successfully because my highest role is not above " + user + "'s highest role. I recommend you move my role to the top of the role list to avoid any further issues.");
					return;
				}
			});
			bot.sendMessage(msg.channel, user + " has been kicked.");
			var reason = suffix.replace("<@" + user.id + ">", "");
			if (reason === "" || reason === " ") {
				reason = "No reason was provided.";
			}
			Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
				if (err) console.error(err);
				if (reply != "none") {
					var array = [];
					array.push(user + " has been kicked");
					array.push("Reason: " + reason);
					array.push("Kicked by: " + msg.author);
					bot.sendMessage(reply, array);
				}
			});
			a = 1;
			return;
		});
		if (a === 0) {
			bot.sendMessage(msg.channel, "Couldn't find the mentioned user!");
		}
	}
};

Commands.whois = {
	name: "whois",
	help: "I'll get some information about the user you've mentioned.",
	level: 0,
	fn: function(bot, msg, suffix) {
		var UserLevel = 0;
		if (!msg.channel.server) return;
		if (msg.mentions.length === 0) {
			var usr = suffix.substring(3).slice(0, -1).trim();
			console.log(usr);
			var user = bot.users.get("id", usr);
			if (user) {
				Permissions.GetLevel((msg.channel.server.id + user.id), user.id, function(err, level) {
					if (err) {
						return;
					}
					else {
						UserLevel = level;
					}
					var msgArray = [];
					if (user.avatarURL === null) {
						msgArray.push("Requested user: `" + user.username + "`");
						msgArray.push("ID: `" + user.id + "`");
						msgArray.push("Status: `" + user.status + "`");
						msgArray.push("Current access level: " + UserLevel);
						bot.sendMessage(msg.channel, msgArray);
						return;
					}
					else {
						msgArray.push("Requested user: `" + user.username + "`");
						msgArray.push("ID: `" + user.id + "`");
						msgArray.push("Status: `" + user.status + "`");
						msgArray.push("Avatar: " + user.avatarURL);
						msgArray.push("Current access level: " + UserLevel);
						bot.sendMessage(msg.channel, msgArray);
					}
				});
				return;
			}
			else {
				bot.sendMessage(msg.channel, "Please mention the user that you want to get information of.");
				return;
			}
		}
		msg.mentions.map(function(user) {
			Permissions.GetLevel((msg.channel.server.id + user.id), user.id, function(err, level) {
				if (err) {
					return;
				}
				else {
					UserLevel = level;
				}
				var msgArray = [];
				if (user.avatarURL === null) {
					msgArray.push("Requested user: `" + user.username + "`");
					msgArray.push("ID: `" + user.id + "`");
					msgArray.push("Status: `" + user.status + "`");
					msgArray.push("Current access level: " + UserLevel);
					bot.sendMessage(msg.channel, msgArray);
					return;
				}
				else {
					msgArray.push("Requested user: `" + user.username + "`");
					msgArray.push("ID: `" + user.id + "`");
					msgArray.push("Status: `" + user.status + "`");
					msgArray.push("Avatar: " + user.avatarURL);
					msgArray.push("Current access level: " + UserLevel);
					bot.sendMessage(msg.channel, msgArray);
				}
			});
		});
	}
};

Commands.setlevel = {
	name: "setlevel",
	help: "This changes the permission level of an user.",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.server) return;
		if (isNaN(suffix[0])) {
			bot.reply(msg.channel, "your first param is not a number!");
			return;
		}
		if (suffix[0] > 3) {
			bot.sendMessage(msg.channel, "Setting a level higher than 3 is not allowed.");
			return;
		}
		if (msg.mentions.length === 0) {
			bot.reply(msg.channel, "please mention the user(s) you want to set the permission level of.");
			return;
		}
		Permissions.GetLevel((msg.channel.server.id + msg.author.id), msg.author.id, function(err, level) {
			if (err) {
				bot.sendMessage(msg.channel, "Help! Something went wrong!");
				return;
			}
			if (suffix[0] > level) {
				bot.reply(msg.channel, "you can't set a user's permissions higher than your own!");
				return;
			}
		});
		msg.mentions.map(function(user) {
			Permissions.SetLevel((msg.channel.server.id + user.id), suffix[0], function(err, level) {
				if (err) {
					bot.sendMessage(msg.channel, "Help! Something went wrong!");
					return;
				}
			});
		});
		bot.sendMessage(msg.channel, "Alright! The permission levels have been set successfully!");
	}
};

Commands.setnsfw = {
	name: "setnsfw",
	help: "This changes if the channel allows NSFW commands.",
	usage: "<on | off>",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.server) return;
		if (suffix === "on" || suffix === "off") {
			Permissions.SetNSFW(msg.channel, suffix, function(err, allow) {
				if (err) {
					bot.reply(msg.channel, "I've failed to set NSFW flag!");
				}
				if (allow === "on") {
					bot.sendMessage(msg.channel, "NSFW commands are now allowed for " + msg.channel);
				}
				else if (allow === "off") {
					bot.sendMessage(msg.channel, "NSFW commands are now disallowed for " + msg.channel);
				}
				else {
					bot.reply(msg.channel, "I've failed to set NSFW flag!");
				}
			});
		}
	}
};

Commands.setcoloruser = {
	name: "setcoloruser",
	help: "This changes if the channel allows NSFW commands.",
	usage: "<on | off>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.server) return;
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) {
			bot.sendMessage(msg, "You must have the permission `Manage Roles` to use this command!");
			return;
		}
		if (suffix === "on" || suffix === "off") {
			Permissions.SetColorUser(msg.channel.server.id, suffix, function(err, allow) {
				if (err) {
					bot.reply(msg.channel, "An error occured.");
				}
				if (allow === "on") {
					bot.sendMessage(msg.channel, "Anyone can now change their color with `!coloruser` on this server.");
				}
				else if (allow === "off") {
					bot.sendMessage(msg.channel, "Only members with `Manage Roles` can change their color with `!coloruser` now.");
				}
				else {
					bot.reply(msg.channel, "An error occured.");
				}
			});
		}
	}
};

Commands.setignore = {
	name: "setignore",
	help: "This changes if the channel allows commands.",
	usage: "<on | off>",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.server) return;
		if (suffix.toLowerCase().trim() === "yes" || suffix.toLowerCase().trim() === "no") {
			Permissions.SetIgnore(msg.channel, suffix, function(err, allow1) {
				if (err) {
					bot.reply(msg.channel, "I've failed to set Ignore flag!");
				}
				if (allow1 === "no") {
					bot.sendMessage(msg.channel, "Commands are now allowed for " + msg.channel);
				}
				else if (allow1 === "yes") {
					bot.sendMessage(msg.channel, "Commands are now disallowed for " + msg.channel);
				}
				else {
					bot.reply(msg.channel, "I've failed to set Ignore flag!");
				}
			});
		}
	}
};

Commands.setowner = {
	name: "setowner",
	help: "This will set the owner of the current server to level 4.",
	level: 0,
	fn: function(bot, msg) {
		if (msg.channel.isPrivate) {
			return;
		}
		else {
			Permissions.SetLevel((msg.channel.server.id + msg.channel.server.owner.id), 4, function(err, level) {
				if (err) {
					bot.sendMessage(msg.channel, "Sorry, an error occured, try again later.");
					return;
				}
				if (level === 4) {
					bot.sendMessage(msg.channel, "Okay! " + msg.channel.server.owner + " is now at level 4!");
				}
			});
		}
	}
};

Commands["server-info"] = {
	name: "server-info",
	help: "I'll tell you some information about the server you're currently in.",
	level: 0,
	fn: function(bot, msg, suffix) {
		// if we're not in a PM, return some info about the channel
		if (msg.channel.server) {
			var msgArray = [];
			msgArray.push("Information requested by " + msg.sender);
			msgArray.push("Server name: **" + msg.channel.server.name + "** (id: `" + msg.channel.server.id + "`)");
			msgArray.push("Owned by **" + msg.channel.server.owner.username + "** (id: `" + msg.channel.server.owner.id + "`)");
			msgArray.push("Current region: **" + msg.channel.server.region + '**.');
			msgArray.push('This server has **' + msg.channel.server.members.length + '** members, and **' + msg.channel.server.channels.length + '** channels. (Including voice channels)');
			msgArray.push('This server has **' + msg.channel.server.roles.length + '** roles registered.');
			if (msg.channel.server.icon === null) {
				msgArray.push('No server icon present.');
			}
			else {
				msgArray.push('Server icon: ' + msg.channel.server.iconURL);
			}
			if (msg.channel.server.afkChannel === null) {
				msgArray.push('No voice AFK-channel present.');
			}
			else {
				msgArray.push('Voice AFK-channel: **' + msg.channel.server.afkChannel.name + "** (id: `" + msg.channel.server.afkChannel.id + "`)");
			}
			bot.sendMessage(msg, msgArray);
		}
		else {
			bot.sendMessage(msg, "You can't do that in a DM, dummy!.");
		}
	}
};

/*Commands["join-server"] = {
	name: "join-server",
	help: "I'll join the server you've requested me to join, as long as the invite is valid and I'm not banned of already in the requested server.",
	usage: "<bot-username> <instant-invite>",
	level: 0,
	fn: function(bot, msg, suffix) {
		return;
		suffix = suffix.split(" ");
		if (ConfigFile.discord.token_mode === true) {
			var array = [];
			array.push("Please click this link, login if needed, and select which server you want me to join! " + ConfigFile.discord.oauth_url);
			array.push("Note that you **MUST** have the permission to **Manage Server** on the server you wish to invite me too.");
			array.push("I request to have most permissions, however you can select which permissions I am given.");
			array.push("Please make sure to use `!setowner` after I have joined. If you need any other help, please use `!support` or contact my owner directly. zelda101#1379");
			bot.sendMessage(msg.channel, array);
			return;
		}
	}
};*/

Commands.botstatus = {
	name: "botstatus",
	help: "I'll get some info about me, like uptime and currently connected servers.",
	level: 0,
	fn: function(bot, msg, suffix) {
		var onlineMembers = 0;
		var offlineMembers = 0;
		var msgArray = [];
		msgArray.push("Hello, I'm " + bot.user + ", nice to meet you!");
		msgArray.push("I'm used in " + bot.servers.length + " servers, in " + bot.channels.length + " channels and by " + bot.users.length + " users.");
		msgArray.push("My uptime is " + (Math.round(bot.uptime / (1000 * 60 * 60))) + " hours, " + (Math.round(bot.uptime / (1000 * 60)) % 60) + " minutes, and " + (Math.round(bot.uptime / 1000) % 60) + " seconds.");
		msgArray.push("Memory Usage: " + Math.round(process.memoryUsage().rss / 1024 / 1000) + "MB");
		//msgArray.push("Total messages seen since last restart: " +mescount._count);
		//msgArray.push("Total commands executed since last restart: " +comcount._count);
		bot.sendMessage(msg.channel, msgArray);
	}
};

Commands.konachan = {
	name: "konachan",
	help: "You're looking at it right now.",
	level: 0,
	nsfw: true,
	fn: function(bot, msg, suffix) {
		if (suffix.split(" ").length > 5) {
			bot.sendMessage(msg.channel, "Konachan only supports upto 6 tags.");
			return;
		}
		unirest.post("https://konachan.net/post/index.json?limit=500&tags=" + suffix)
			.end(function(result) {
				if (result.body.length < 1) {
					bot.sendMessage(msg.channel, "Sorry, nothing found.");
					return;
				}
				if (suffix.length < 1) {
					suffix = "<no tags specified>";
				}
				var suffix1 = suffix.toString().toLowerCase();
				if ((suffix1.indexOf("gaping") > -1 || suffix1.indexOf("gape") > -1) || suffix1.indexOf("prolapse") > -1 || suffix1.indexOf("toddlercon") > -1 || suffix1.indexOf("scat") > -1 || suffix1.indexOf("gore") > -1) {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var kona = result.body[count].file_url;
					var kona1 = result.body[count1].file_url;
					var kona2 = result.body[count2].file_url;
					bot.sendMessage(msg.channel, "You've searched for `" + suffix + "`. Sending images in a pm...");
					bot.sendFile(msg.author, kona);
					bot.sendFile(msg.author, kona1);
					bot.sendFile(msg.author, kona2);
				}
				else {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var kona = result.body[count].file_url;
					var kona1 = result.body[count1].file_url;
					var kona2 = result.body[count2].file_url;
					if (result.body.length <= 2) {
						bot.sendMessage(msg.channel, "There were less than 3 results for `" + suffix + "` :(");
						if (result.body.length === 1) {
							kona = result.body[0].file_url;
							bot.sendFile(msg.channel, kona);
							return;
						}
						if (result.body.length === 2) {
							kona = result.body[0].file_url;
							kona1 = result.body[1].file_url;
							bot.sendFile(msg.channel, kona);
							bot.sendFile(msg.channel, kona1);
							return;
						}
					}
					bot.sendMessage(msg.channel, "You've searched for ` " + suffix + " ` . There are `" + result.body.length + "` results that contain those tags.\nSending `3` random images of those `" + result.body.length + "` results.");
					bot.sendFile(msg.channel, kona);
					bot.sendFile(msg.channel, kona1);
					bot.sendFile(msg.channel, kona2);
				}
			});
	}
};

Commands.lolibooru = {
	name: "lolibooru",
	help: "You're looking at it right now.",
	level: 0,
	nsfw: true,
	fn: function(bot, msg, suffix) {
		if (msg.channel.server.id === "137678884022910976") {
			return;
		}
		console.log("hi");
		unirest.post("https://lolibooru.moe/post/index.json?limit=500&tags=" + suffix)
			.end(function(result) {
				if (result.body.length < 1) {
					bot.sendMessage(msg.channel, "Sorry, nothing found.");
					return;
				}
				if (suffix.length < 1) {
					suffix = "<no tags specified>";
				}
				var suffix1 = suffix.toString().toLowerCase();
				if ((suffix1.indexOf("gaping") > -1 || suffix1.indexOf("gape") > -1) || suffix1.indexOf("prolapse") > -1 || suffix1.indexOf("toddlercon") > -1 || suffix1.indexOf("dog") > -1) {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var kona = result.body[count].file_url;
					var kona1 = result.body[count1].file_url;
					var kona2 = result.body[count2].file_url;
					bot.sendMessage(msg.channel, "You've searched for ` " + suffix + " `. Sending images in a pm...");
					bot.sendFile(msg.author, kona);
					bot.sendFile(msg.author, kona1);
					bot.sendFile(msg.author, kona2);
				}
				else {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var lolibooru = result.body[count].file_url;
					var lolibooru1 = result.body[count1].file_url;
					var lolibooru2 = result.body[count2].file_url;
					if (result.body.length <= 2) {
						bot.sendMessage(msg.channel, "There were less than 3 results for `" + suffix + "` :(");
						if (result.body.length === 1) {
							lolibooru = result.body[0].file_url;
							bot.sendFile(msg.channel, lolibooru);
							return;
						}
						if (result.body.length === 2) {
							lolibooru = result.body[0].file_url;
							lolibooru1 = result.body[1].file_url;
							bot.sendFile(msg.channel, lolibooru);
							bot.sendFile(msg.channel, lolibooru1);
							return;
						}
					}
					bot.sendMessage(msg.channel, "You've searched for `" + suffix + "` . There are `" + result.body.length + "` results that contain those tags.\nSending `3` random images of those `" + result.body.length + "` results.");
					bot.sendFile(msg.channel, lolibooru);
					bot.sendFile(msg.channel, lolibooru1);
					bot.sendFile(msg.channel, lolibooru2);
				}
			});
	}
};

Commands.loli = {
	name: "loli",
	help: "You're looking at it right now.",
	level: 0,
	nsfw: true,
	fn: function(bot, msg, suffix) {
		if (msg.channel.server.id === "137678884022910976") {
			return;
		}
		console.log("hi");
		unirest.post("https://lolibooru.moe/post/index.json?limit=500&tags=" + suffix)
			.end(function(result) {
				if (result.body.length < 1) {
					bot.sendMessage(msg.channel, "Sorry, nothing found.");
					return;
				}
				if (suffix.length < 1) {
					suffix = "<no tags specified>";
				}
				var suffix1 = suffix.toString().toLowerCase();
				if ((suffix1.indexOf("gaping") > -1 || suffix1.indexOf("gape") > -1) || suffix1.indexOf("prolapse") > -1 || suffix1.indexOf("toddlercon") > -1 || suffix1.indexOf("dog") > -1) {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var kona = result.body[count].file_url;
					var kona1 = result.body[count1].file_url;
					var kona2 = result.body[count2].file_url;
					bot.sendMessage(msg.channel, "You've searched for ` " + suffix + " `. Sending images in a pm...");
					bot.sendFile(msg.author, kona);
					bot.sendFile(msg.author, kona1);
					bot.sendFile(msg.author, kona2);
				}
				else {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var lolibooru = result.body[count].file_url;
					var lolibooru1 = result.body[count1].file_url;
					var lolibooru2 = result.body[count2].file_url;
					if (result.body.length <= 2) {
						bot.sendMessage(msg.channel, "There were less than 3 results for `" + suffix + "` :(");
						if (result.body.length === 1) {
							lolibooru = result.body[0].file_url;
							bot.sendFile(msg.channel, lolibooru);
							return;
						}
						if (result.body.length === 2) {
							lolibooru = result.body[0].file_url;
							lolibooru1 = result.body[1].file_url;
							bot.sendFile(msg.channel, lolibooru);
							bot.sendFile(msg.channel, lolibooru1);
							return;
						}
					}
					bot.sendMessage(msg.channel, "You've searched for `" + suffix + "` . There are `" + result.body.length + "` results that contain those tags.\nSending `3` random images of those `" + result.body.length + "` results.");
					bot.sendFile(msg.channel, lolibooru);
					bot.sendFile(msg.channel, lolibooru1);
					bot.sendFile(msg.channel, lolibooru2);
				}
			});
	}
};

Commands.yandere = {
	name: "yandere",
	help: "You're looking at it right now.",
	level: 0,
	nsfw: true,
	fn: function(bot, msg, suffix) {
		unirest.post("https://yande.re/post/index.json?limit=500&tags=" + suffix)
			.end(function(result) {
				if (result.body.length < 1) {
					bot.sendMessage(msg.channel, "Sorry, nothing found.");
					return;
				}
				if (suffix.length < 1) {
					suffix = "<no tags specified>";
				}
				var suffix1 = suffix.toString().toLowerCase();
				if ((suffix1.indexOf("gaping") > -1 || suffix1.indexOf("gape") > -1) || suffix1.indexOf("prolapse") > -1 || suffix1.indexOf("toddlercon") > -1) {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var kona = result.body[count].file_url;
					var kona1 = result.body[count1].file_url;
					var kona2 = result.body[count2].file_url;
					bot.sendMessage(msg.channel, "You've searched for `" + suffix + "`. Sending images in a pm...");
					bot.sendFile(msg.author, kona);
					bot.sendFile(msg.author, kona1);
					bot.sendFile(msg.author, kona2);
				}
				else {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var yandere = result.body[count].file_url;
					var yandere1 = result.body[count1].file_url;
					var yandere2 = result.body[count2].file_url;
					if (result.body.length <= 2) {
						bot.sendMessage(msg.channel, "There were less than 3 results for `" + suffix + "` :(");
						if (result.body.length === 1) {
							yandere = result.body[0].file_url;
							bot.sendFile(msg.channel, yandere);
							return;
						}
						if (result.body.length === 2) {
							yandere = result.body[0].file_url;
							yandere1 = result.body[1].file_url;
							bot.sendFile(msg.channel, yandere);
							bot.sendFile(msg.channel, yandere1);
							return;
						}
					}
					bot.sendMessage(msg.channel, "You've searched for ` " + suffix + " ` . There are `" + result.body.length + "` results that contain those tags.\nSending `3` random images of those `" + result.body.length + "` results.");
					bot.sendFile(msg.channel, yandere);
					bot.sendFile(msg.channel, yandere1);
					bot.sendFile(msg.channel, yandere2);
				}
			});
	}
};

Commands.help = {
	name: "help",
	help: "You're looking at it right now.",
	level: 0,
	fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "Here is a github link showing what my commands are and how to use them!\nhttps://github.com/xxxzelda101xxx/KoiBot/wiki/General-Commands");
	}
};

Commands["admin-help"] = {
	name: "admin-help",
	help: "You're looking at it right now.",
	level: 0,
	fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "Here is a github link showing what my admin commands are and how to use them!\nhttps://github.com/xxxzelda101xxx/KoiBot/wiki/Admin-Commands");
	}
};

Commands["radio-help"] = {
	name: "radio-help",
	help: "You're looking at it right now.",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.id === "145853318059655168") {
			var msgArray = [];
			msgArray.push("Here is a list of my radio commands and how to use them! These can only be used on the `No Title` server");
			msgArray.push("`!q` shows the current songs in the queue.");
			msgArray.push("`!songlist` sends a link to the list of songs you can choose from.");
			msgArray.push("`!q <song name>` adds the song to the queue.");
			msgArray.push("`!getmap <maplink>` will download a map from osu! which can then be queued.");
			msgArray.push("`!np` shows the current song this is playing.");
			msgArray.push("`!last` shows the last song I was playing.");
			bot.sendMessage(msg.author, msgArray);
			bot.sendMessage(msg.channel, "Ok " + msg.author + ", I've sent you a list of my radio commands via DM.");
			return;
		}
		else {
			return;
		}
	}
};

Commands["nsfw-help"] = {
	name: "nsfw-help",
	help: "You're looking at it right now.",
	level: 0,
	fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "Here is a github link showing what my NSFW commands are and how to use them!\nhttps://github.com/xxxzelda101xxx/Koi./wiki/NSFW-Commands");
	}
};

exports.Commands = Commands;
