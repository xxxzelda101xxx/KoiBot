exports.newMember = function(bot, server, user) {
	for (var i = 0; i < server.channels.length; i++) {
		if (server.channels[i] != undefined) {
			Permissions.GetAnnounce(server.channels[i].id, function(err, reply) {
				if (reply === "on") {
					Permissions.GetAnnounceJoinMessage(server.id, function(err, reply) {
						if (reply === "none") {
							bot.sendMessage(server.channels[i], user+" has joined!")
						}
						else {
							if (reply.indexOf("%user%") > -1) {
								reply = reply.replace("%user%", `${user}`)
							}
							if (reply.indexOf("%server%") > -1 ) {
								reply = reply.replace("%server%", `${server.name}`)
							}
							bot.sendMessage(server.channels[i], reply);
						}
					})
				}	
			})
		}
	}
}

exports.ripMember = function(bot, server, user) {
	for (var i = 0; i < server.channels.length; i++) {
		if (server.channels[i] != undefined) {
			Permissions.GetAnnounce(server.channels[i].id, function(err, reply) {
				if (reply === "on") {
					Permissions.GetAnnounceLeaveMessage(server.id, function(err, reply) {
						if (reply === "none") {
							bot.sendMessage(server.channels[i], user+" has left!")
						}
						else {
							if (reply.indexOf("%user%") > -1) {
								reply = reply.replace("%user%", `${user}`)
							}
							if (reply.indexOf("%server%") > -1 ) {
								reply = reply.replace("%server%", `${server.name}`)
							}
							bot.sendMessage(server.channels[i], reply);
						}
					})
				}	
			})
		}
	}
}

exports.banMember = function(bot, server, user) {
	for (var i = 0; i < server.channels.length; i++) {
		if (server.channels[i] != undefined) {
			Permissions.GetAnnounce(server.channels[i], function(err, reply) {
				if (reply === "on") {
					bot.sendMessage(server.channels[i], user+" has been banned!")
				}
			})
		}
	}
}

exports.unbanMember = function(bot, server, user) {
	for (var i = 0; i < server.channels.length; i++) {
		if (server.channels[i] != undefined) {
			Permissions.GetAnnounce(server.channels[i], function(err, reply) {
				if (reply === "on") {
					bot.sendMessage(server.channels[i], user+" has been unbanned!")
				}
			})
		}
	}
}

exports.memberPresence = function(bot, oldUser, newUser) {
	if (oldUser.username != newUser.username) {
		var oldname = oldUser.username;
		var testing = ", "+oldname+",";
		Permissions.GetPreviousName(oldUser.id, function(err, reply) {
			if (reply === "none") {
				Permissions.SetPreviousName(oldUser.id, ", "+oldname+",", function(err, allow) {})
			}
			else {
				if (reply.indexOf(testing) > -1) {
					return;
				}
				if (reply.split(",").length - 1 === 2) {
					Permissions.SetPreviousName(oldUser.id, ", "+oldname+""+reply, function(err, allow) {})
					return;
				}
				Permissions.SetPreviousName(oldUser.id, ", "+oldname+""+reply, function(err, allow) {})
			}
		})
	}
}

exports.pmMessages = function(bot, msg) {
	if (msg.channel.isPrivate) {
		return;
	}
	msg.mentions.map((user) => {
		if (user.status === "offline" || user.status === "idle") {
			if (user.id) {
				Permissions.GetPmMentions((msg.channel.server.id + user.id), function(err, reply) {
					if (reply === "on") {
						bot.getChannelLogs(msg.channel, 5, function(error, messages) {
							if (msg.channel.id === "120323989410152448") return;
							if (msg.channel.id === "132526096750084097") return;
							var array = [];
							array.push("`------------------------------`")
							array.push("You were mentioned in a message by "+msg.author+" in "+msg.channel+" while you were gone.")
							for (var i = 0; i < messages.length; i++) {
								if (messages[i].attachments.length > 0) {
									if (messages[i].content) {
										array.push(messages[i].author + ": " +messages.content + "  <" + messages[i].attachments[0].url + ">")
									}
									else {
										array.push(messages[i].author + ":  <" + messages[i].attachments[0].url + ">")
									}
								}
								else {
									if (messages[i].author != undefined) {
										var test = messages[i].content.split(" ");
										for (var i = 0; i < test.length; i++) {
											if (test[i].indexOf("http://") || test[i].indexOf("https://")) {
												array.push(messages[i].author + ": <"+messages[i].content+">");
											}
											else {
												array.push(messages[i].author + ": "+messages[i].content);
											}
										}
									}
								}
							}
							array.push("If you no longer want to receive these PM's, use `!pmmentions` in the server that you want to ignore.")
							bot.sendMessage(user, array)
						});
					}
				})
			}
		}
	})
}

exports.startPolling = function(bot) {
    setInterval (function () {
        twitchStreamers.items.forEach( function (stream) {
            pollStream(stream, bot);
        });
    }, 60000);
}

exports.startPunishDown = function(bot) {
    setInterval (function () {
        bot.users.forEach( function (user) {
			bot.servers.forEach( function (server) {
				punishDown(user, server, bot)
			})
        });
    }, 3600000);
}

exports.startOsuTrack = function(bot) {
    setInterval (function () {
		allchannels = require('require-all')(__dirname + '/osutracking');
		fs.readdir(__dirname + "/osutracking/", function (err, files) { 
			if (!err) {
				asdfasdf = files
			}
		});
		for (var i = 0; i < asdfasdf.length; i++) {
			var currentdata = allchannels[asdfasdf[i].slice(0,-5)]
			testfunc(currentdata, bot)
		}
    }, 60000);
}

exports.startTaikoTrack = function(bot) {
    setInterval (function () {
        taikotracker.items.forEach( function (osu) {
            osutracking.taikotrack(osu, bot);
        });
    }, 60000);
}

exports.startCtbTrack = function(bot) {
    setInterval (function () {
        ctbtracker.items.forEach( function (osu) {
            osutracking.ctbtrack(osu, bot);
        });
    }, 60000);
}

exports.startManiaTrack = function(bot) {
    setInterval (function () {
        maniatracker.items.forEach( function (osu) {
            osutracking.maniatrack(osu, bot);
        });
    }, 60000);
}

exports.customSearch = function(msg, command, suffix) {
    if (command != null) {
		if (!msg.channel.isPrivate) {
			if (command.server === msg.channel.server.id) {
				if (command.command === command1) {
					customcomcom = command.command;
					customcomresponse = command.response.replace("%user%", `${msg.author}`).replace("%username%", `${msg.author.username}`).replace("%userid%", `${msg.author.id}`).replace("%channelid%", `${msg.channel.id}`).replace("%channelname%", `${msg.channel}`).replace("%servername%", `${msg.channel.server.name}`).replace("%serverid%", `${msg.channel.server.id}`).replace("%input%", suffix.replace(/@everyone/gi, " ").replace(/@here/gi, " ").replace("!!!!", "test").replace(/everyone/gi, " ").replace(/here/gi, " "))
				}
			}
		}
	}
}

function pollStream (stream, bot) {
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

function punishDown (user, server, bot) {
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

function testfunc (data, bot) {
	if (!data) return;
	for (var i = 0; i < data.items.length; i++) {
		osutracking.osutrack(data.items[i], bot)
	}
}