var Commands = [];
var ConfigFile = require("../config.json");
//var ripple = new rippleapi.Api(0);
var Datastore = require('nedb');
var osuapi = require('osu-api');
var osu = new osuapi.Api(ConfigFile.osu_api_key);
//var rippleapi = require('ripple-api')
var osudb = require("./osu_rt.js")
var permissions = require("./permissions.js")
var serverdb = require("./serverdb_rt.js")
var userdb = require("./userdb_rt.js")
var twitchdb = require("./twitch_rt.js")
var openrecdb = require("./openrec_rt.js")
var customcomdb = require("./customcom_rt.js")
var cleverbot = require("cleverbot.io"),
cbot = new cleverbot(ConfigFile.cleverbot_api_user, ConfigFile.cleverbot_api_key);
var unirest = require("unirest")
var request = require("request")
var xml2js = require("xml2js")
var ent = require('entities')
var Discord = require("discord.js");

Commands.ow = {
	name: "ow",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (suffix.indexOf("#") < 0) {
			msg.channel.sendMessage(`You must specify your entire name including the # and numbers. Example:`)
			msg.channel.sendFile(`http://i.imgur.com/WusnJdj.png`)
			return;
		}
		//name platform region
		if (suffix.split(" ").length != 4) {
			msg.channel.sendMessage(`Incorrect message format. Here is an example of how to use the **!ow** command.\n **!ow zelda101#11351 qp pc us**`)
			return;
		}
		console.log("hi")
		var username = suffix.split(" ")[0].replace(`#`, `-`)
		if (suffix.split(" ")[1].toLowerCase() === "qp") {
			var mode = `qp`
		}
		else if (suffix.split(" ")[1].toLowerCase() === "comp" || suffix.split(" ")[2].toLowerCase() === "competitive") {
			var mode = `comp`
		}
		else {
			msg.channel.sendMessage(`Incorrect message format. Here is an example of how to use the **!ow** command.\n **!ow zelda101#11351 qp pc us**`)
			return;
		}
		if (suffix.split(" ")[2].toLowerCase() === 'xbox' || suffix.split(" ")[2].toLowerCase() === `xbl` || suffix.split(" ")[2].toLowerCase() === `xbone` || suffix.split(" ")[2].toLowerCase() === `xboner` || suffix.split(" ")[2].toLowerCase() === `xb1`) {
			var platform = `xbl`
		}
		else if (suffix.split(" ")[2].toLowerCase() === `ps` || suffix.split(" ")[2].toLowerCase() === `playstation` || suffix.split(" ")[2].toLowerCase() === `ps4` || suffix.split(" ")[2].toLowerCase() === `psn`) {
			var platform = `psn`
		}
		else if (suffix.split(" ")[2].toLowerCase() === `pc` || suffix.split(" ")[2].toLowerCase() === `computer` || suffix.split(" ")[2].toLowerCase() === `pcmr` || suffix.split(" ")[2].toLowerCase() === `glorious`) {
			var platform = `pc`
		}
		else {
			msg.channel.sendMessage(`Incorrect message format. Here is an example of how to use the **!ow** command.\n **!ow zelda101#11351 qp pc us**`)
			return;
		}
		if (suffix.split(" ")[3].toLowerCase() === `us` || suffix.split(" ")[3].toLowerCase() === `usa` || suffix.split(" ")[3].toLowerCase() === `america` || suffix.split(" ")[3].toLowerCase() === `americas` || suffix.split(" ")[3].toLowerCase() === `na`) {
			var region = `us`
		}
		else if (suffix.split(" ")[3].toLowerCase() === `eu` || suffix.split(" ")[3].toLowerCase() === `europe`) {
			var region = `eu`
		}
		else if (suffix.split(" ")[3].toLowerCase() === "kr" || suffix.split(" ")[3].toLowerCase() === "korea" || suffix.split(" ")[3].toLowerCase() === `korean`) {
			var region = `kr`
		}
		else if (suffix.split(" ")[3].toLowerCase() === `cn` || suffix.split(" ")[3].toLowerCase() === `china` || suffix.split(" ")[3].toLowerCase() === `asia`) {
			var region = `cn`
		}
		else if (suffix.split(" ")[3].toLowerCase() === `global`) {
			var region = `global`
		}
		else {
			msg.channel.sendMessage(`Incorrect message format. Here is an example of how to use the **!ow** command.\n **!ow zelda101#11351 qp pc us**`)
			return;
		}
		var url = `https://api.lootbox.eu/${platform}/${region}/${username}/profile`
		request(url, function (error, response, profile) {
			profile = JSON.parse(profile)
			if (profile.statusCode === 404) {
				msg.channel.sendMessage(`Player not found. Please note that your name is case sensitive.`)
				return;
			}
			profile = profile.data
			var url2 = `https://api.lootbox.eu/${platform}/${region}/${username}/achievements`

			var obj = new Discord.RichEmbed(obj)
			obj.setTitle(`Overwatch stats for ${profile.username}`)
			obj.setURL(`http://masteroverwatch.com/profile/${platform}/${region}/${username}`)
			obj.setThumbnail(`${profile.avatar}`)
			request(url2, function (error, response, achievements) {
				achievements = JSON.parse(achievements)
				obj.addField(`General`, `**Level**: ${profile.level}\n**Achievements Earned**: ${achievements.finishedAchievements.replace(/ /g, "")}\n**Total Playtime**: ${parseInt(profile.playtime.quick) + parseInt(profile.playtime.competitive)} hours`, true)
				if(parseInt(profile.competitive.rank) < 1500) {
					profile.competitive.rank = `${profile.competitive.rank} (Bronze)`
				}
				else if (parseInt(profile.competitive.rank) < 2000) {
					profile.competitive.rank = `${profile.competitive.rank} (Silver)`
				}
				else if (parseInt(profile.competitive.rank) < 2500) {
					profile.competitive.rank = `${profile.competitive.rank} (Gold)`
				}
				else if (parseInt(profile.competitive.rank) < 3000) {
					profile.competitive.rank = `${profile.competitive.rank} (Platinum)`
				}
				else if (parseInt(profile.competitive.rank) < 3500) {
					profile.competitive.rank = `${profile.competitive.rank} (Diamond)`
				}
				else if (parseInt(profile.competitive.rank) < 4000) {
					profile.competitive.rank = `${profile.competitive.rank} (Master)`
				}
				else if (parseInt(profile.competitive.rank) > 4000) {
					profile.competitive.rank = `${profile.competitive.rank} (Grandmaster)`
				}
				if (profile.competitive.rank == null) {
					obj.addField(`Competitive stats`, `**Rank**: Not Placed\n**Games Played**: Unknown\n**Games Won**: Unknown\n**Games Lost**: Unknown`, true)
				}
				else {
					obj.addField(`Competitive stats`, `**Rank**: ${profile.competitive.rank}\n**Games Played**: ${profile.games.competitive.played}\n**Games Won**: ${profile.games.competitive.wins}\n**Games Lost**: ${profile.games.competitive.lost}`, true)
				}
				var hero1 = new Discord.RichEmbed(hero1)
				if (mode === "qp") {
					var url3 = `https://api.lootbox.eu/${platform}/${region}/${username}/quickplay/heroes`
					request(url3, function (error, response, heroesplaytime) {
						heroesplaytime = JSON.parse(heroesplaytime)
						var url4 = `https://api.lootbox.eu/${platform}/${region}/${username}/quickplay/hero/${heroesplaytime[0].name.replace("L&#xFA;cio", "Lucio").replace("Torbj&#xF6;rn", "Torbjoern")}/`
						console.log(url4)
						request(url4, function (error, response, hero1stats) {
							hero1stats = JSON.parse(hero1stats)
							console.log(hero1stats)
							var hero1name = heroesplaytime[0].name.replace("L&#xFA;cio", "Lucio").replace("Torbj&#xF6;rn", "Torbjoern")
							hero1.setTitle(`**Most Played Hero**: ${heroesplaytime[0].name.replace("L&#xFA;cio", "Lúcio").replace("Torbj&#xF6;rn", "Torbjörn")}`)
							console.log("hi2")
							hero1.addField(`Eliminations Stats`, `**Total Elims**: ${hero1stats[Object.keys(hero1stats)[0]].Eliminations}\n**Total Deaths**: ${hero1stats[Object.keys(hero1stats)[0]].Deaths}`)
							console.log("hi3")
							hero1.setThumbnail(heroesplaytime[0].image)
							msg.channel.sendEmbed(hero1)
						})
					})
				}
				msg.channel.sendEmbed(obj)
			})
		})
	}
};

Commands.addrole = {
	name: "addrole",
	usage: "<wtf is this>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild)return;
		if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			msg.channel.sendMessage("You don't have the permission `Manage Roles`! You must have this permission to use `!addrole`");
			return;
		}
		if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			msg.channel.sendMessage("I don't have the permission `Manage Roles`! I must have this permission for `!addrole` to function correctly!");
			return;
		}

		if (!suffix) {
			msg.channel.sendMessage("You didn't tell me what role to add to a user!");
			return;
		}
		if (msg.mentions.users.array().length != 1) {
			msg.channel.sendMessage("You must mention exactly 1 user!");
			return;
		}
		msg.mentions.users.array().map((user) => {
			if (suffix.split(" ")[0] === "<@" + msg.mentions.users.array()[0].id + ">") {
				suffix = suffix.replace("<@" + msg.mentions.users.array()[0].id + ">", "").substring(1);
			}
			else if (suffix.split(" ")[0] === "<@!" + msg.mentions.users.array()[0].id + ">") {
				suffix = suffix.replace("<@!" + msg.mentions.users.array()[0].id + ">", "").substring(1);
			}
			else {
				if (suffix.indexOf("<@!") > -1){
					suffix = suffix.replace("<@!" + msg.mentions.users.array()[0].id + ">", "").trim();
				}
				else {
					suffix = suffix.replace("<@" + msg.mentions.users.array()[0].id + ">", "").trim();
				}
			}
			var role = msg.guild.roles.find("name", suffix);
			if (!role) {
				msg.channel.sendMessage("Role not found.");
				return;
			}
			var hasrole = msg.guild.member(user).roles.find("id", role.id);
			if (hasrole) {
				msg.channel.sendMessage(user + " already has that role!");
				return;
			}
			msg.guild.member(user).addRole(role)
			msg.channel.sendMessage("Successfully gave `" + user.username + "` the role `" + role.name + "` !");
		});
	}
}; //works - basic check

Commands.alias = {
	name: "alias",
	help: "Allows for creating quick custom commands on the fly!",
	level: 5,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		var args = suffix.split(" ");
		var name = args.shift();
		if (!name) {
			return;
		}
		else if (Commands[name] || name === "help") {
			msg.channel.sendMessage("Overwriting commands with aliases is not allowed!");
		}
		else {
			var command = args.shift();
			aliases[name] = [command, args.join(" ")];
			fs.writeFileSync("./runtime/alias.json", JSON.stringify(aliases, null, 2), null);
			msg.channel.sendMessage("Created alias " + name);
		}
	}
};

Commands.anime = {
	name: "anime",
	usage: "<anime name>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (suffix) {
			var USER = ConfigFile.maluser;
			var PASS = ConfigFile.malpass;
			if (!USER || !PASS) {
				msg.channel.sendMessage( "MAL login not configured by bot owner")
				return;
			}
			msg.channel.startTyping();
			var tags = suffix.split(" ").join("+");
			var rUrl = "http://myanimelist.net/api/anime/search.xml?q=" + tags;
			request(rUrl, {
				"auth": {
					"user": USER,
					"pass": PASS,
					"sendImmediately": false
				}
			}, function(error, response, body) {
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
							msg.channel.sendMessage("**" + title + " / " + english + "**\n**Type:** " + type + " **| Episodes:** " + ep + " **| Status:** " + status + " **| Score:** " + score + "\n" + synopsis);
						}, 2000);
						msg.channel.sendFile(picture, '', '');
					});
				}
				else {
					msg.channel.sendMessage("\"" + suffix + "\" not found")
				}
			});
			msg.channel.stopTyping();
		}
	}
}; //works //works - basic check

Commands.announce = {
	name: "announce",
	description: "",
	extendedhelp: "",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		serverdb.getServerData(msg.guild.id, function(results) {
			if (results[0].announceChannels.indexOf(msg.channel.id) < 0) {
				serverdb.setAnnounceChannels(msg.guild.id, msg.channel.id, "push")
				msg.channel.sendMessage(`I will now send a message in ${msg.channel} when someone has joined, left, or been banned.`);
			}
			if (results[0].announceChannels.indexOf(msg.channel.id) >= 0) {
				serverdb.setAnnounceChannels(msg.guild.id, msg.channel.id, "pull")
				msg.channel.sendMessage(`I will no longer send a message in ${msg.channel} when someone has joined, left, or been banned.`);			}
		});
	}
}; //works

Commands.avatar = {
	name: "avatar",
	level: 0,
	fn: function(bot, msg, suffix) {
		suffix = suffix.trim()
		if (msg.mentions.users.array().length < 1) {
			if (!suffix) {
				var user = msg.author
			}
			else {
				var usersArray = []
				for (i = 0; i < msg.guild.members.array().length; i++) {
					if (usersArray.length === suffix.split(" ").length) break;
					for (j = 0; j < suffix.split(" ").length; j++) {
						if (msg.guild.members.array()[i].user.username.toLowerCase().includes(suffix.split(" ")[j].toLowerCase())) {
							if (usersArray.indexOf(msg.guild.members.array()[i].user) < 0) usersArray.push(msg.guild.members.array()[i].user);
						}
						else if (msg.guild.members.array()[i].nickname != null) {
							if (msg.guild.members.array()[i].nickname.toLowerCase().includes(suffix.split(" ")[j].toLowerCase())) {
								if (usersArray.indexOf(msg.guild.members.array()[i].user) < 0) usersArray.push(msg.guild.members.array()[i].user);
							}
						}
					}
				}
				var sent = 0
				usersArray.map(function(user) {
					if (user.avatarURL === null) {
						msg.channel.sendMessage(`${user.username} doesn't have an avatar.`);
						return;
					}
					else {
						var data = new Discord.RichEmbed(data);
						data.setAuthor(`${user.username}'s avatar`)
						if (user.avatar.startsWith("a_")) data.setImage(`https://images.discordapp.net/avatars/${user.id}/${user.avatar}.gif`);
						else data.setImage(`https://images.discordapp.net/avatars/${user.id}/${user.avatar}.jpg`);
						msg.channel.sendEmbed(data)
						sent++
						if (sent === usersArray.length) return;
					}
				});
				return;
			}
			if (user.avatarURL === null) {
				msg.channel.sendMessage(`${user.username} doesn't have an avatar.`);
				return;
			}
			else {
				var data = new Discord.RichEmbed(data);
				data.setAuthor(`${user.username}'s avatar`)
				if (user.avatar.startsWith("a_")) data.setImage(`https://images.discordapp.net/avatars/${user.id}/${user.avatar}.gif`);
				else data.setImage(`https://images.discordapp.net/avatars/${user.id}/${user.avatar}.jpg`);
				msg.channel.sendEmbed(data)
			}
		}
		msg.mentions.users.map(function(user) {
			if (user.avatarURL === null) {
				msg.channel.sendMessage(`${user.username} doesn't have an avatar.`);
				return;
			}
			else {
				var data = new Discord.RichEmbed(data);
				data.setAuthor(`${user.username}'s avatar`)
				if (user.avatar.startsWith("a_")) data.setImage(`https://images.discordapp.net/avatars/${user.id}/${user.avatar}.gif`);
				else data.setImage(`https://images.discordapp.net/avatars/${user.id}/${user.avatar}.jpg`);
				msg.channel.sendEmbed(data)
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
		if (!msg.channel.guild) return;
		if (!msg.channel.permissionsFor(msg.author).hasPermission("BAN_MEMBERS")) {
			msg.channel.sendMessage("You don't have the permission **Ban Members**! You must have this permission to use **!ban**");
			return;
		}
		if (!msg.channel.permissionsFor(bot.user).hasPermission("BAN_MEMBERS")) {
			msg.channel.sendMessage("I don't have the permission **Ban Members**! I must have this permission for **!ban** to function correctly!");
			return;
		}
		if (msg.mentions.users.array().length < 1) {
			msg.channel.sendMessage("You must mention the user you want to ban!");
			return;
		}
		if (msg.mentions.users.array().length > 1) {
			msg.channel.sendMessage("You can only ban 1 person at a time!");
			return;
		}
		msg.mentions.users.array().forEach(function(user) {
			if (msg.author === user) {
				msg.channel.sendMessage("You can't ban yourself, idiot.");
				return;
			}
			msg.guild.ban(user).then(function(gm, u, string) {}).catch(function(err) {
				if (err.status === 403) {
					msg.channel.sendMessage(`I was unable to ban ${user}! Their power exceeds my own!`)
				}
				else {
					msg.channel.sendMessage(`An error occured. Status code: ${err.status}`)
				}
				return;
			})
			serverdb.getServerData(msg.guild.id, function(results) {
				if (results[0].stafflogChannel != "") {
					var reason = suffix.replace("<@" + user.id + ">", "");
					if (reason === "" || reason === " ") {
						reason = "No reason was provided.";
					}
					var array = [];
					array.push(user + " has been banned");
					array.push("Reason: " + reason);
					array.push("Banned by: " + msg.author);
					var channel = bot.channels.find("id", results[0].stafflogChannel)
					channel.sendMessage(array);
				}
			});
			return;
		});
	}
}; //works

Commands.botstatus = {
	name: "botstatus",
	help: "I'll get some info about me, like uptime and currently connected servers.",
	level: 0,
	fn: function(bot, msg, suffix) {
		var msgArray = [];
		msgArray.push("Hello, I'm " + bot.user + ", nice to meet you!");
		msgArray.push("I'm used in " + bot.guilds.array().length + " servers, in " + bot.channels.array().length + " channels and by " + bot.users.array().length + " users.");
		msgArray.push("My uptime is " + (Math.round(bot.uptime / (1000 * 60 * 60))) + " hours, " + (Math.round(bot.uptime / (1000 * 60)) % 60) + " minutes, and " + (Math.round(bot.uptime / 1000) % 60) + " seconds.");
		msgArray.push("Memory Usage: " + Math.round(process.memoryUsage().rss / 1024 / 1000) + "MB");
		msg.channel.sendMessage(msgArray);
	}
}; //works //works

Commands.cleverbot = {
	name: "cleverbot",
	help: "I'll act as Cleverbot when you execute this command, remember to enter a message as suffix.",
	usage: "<message>",
	level: 0,
	fn: function(bot, msg, suffix) {
		msg.channel.startTyping();
		cbot.create(function (err, response) {
			cbot.ask(suffix.trim(), function (err, response) {
			  msg.channel.sendMessage(response);
				msg.channel.stopTyping();
			});
		});
	}
}; //works  //works

Commands.coloruser = {
	name: "coloruser",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.guild) return;
		if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			msg.channel.sendMessage("I don't have the permission `Manage Roles`! I must have this permission for `!coloruser` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			serverdb.getServerData(msg.guild.id, function(results) {
				if (results[0].colorUser === "on") {
					if (msg.mentions.users.array().length > 0) {
						msg.channel.sendMessage("You don't have the permission `Manage Roles`! You cannot change another users color!");
						return;
					}
					if (suffix.toLowerCase().indexOf("random") > -1) {
						suffix = "000000".replace(/0/g, function() {
							return (~~(Math.random() * 16)).toString(16);
						});
					}
					var suffixtest = /^#[a-f0-9]{6}$/i.test(suffix);
					if (suffix.length === 7 && !suffixtest) {
						msg.channel.sendMessage("That doesn't appear to be a valid hex color.");
						return;
					}
					suffixtest = /^[a-f0-9]{6}$/i.test(suffix);
					if (suffix.length === 6 && !suffixtest) {
						msg.channel.sendMessage("That doesn't appear to be a valid hex color.");
						return;
					}
					if (suffix.length < 6 || suffix.length > 7) {
						msg.channel.sendMessage("That doesn't appear to be a valid hex color.");
						return;
					}
					user = msg.author;
					suffix = suffix.replace("#", "");
					var role = msg.guild.roles.find("name", "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase());
					var roleExists = false;
					if (role) {
						roleExists = true;
					}
					msg.guild.member(user).roles.array().map((r) => {
						if (r) {
							if (/^CColour - [a-f0-9]{6}$/i.test(r.name)) {
								msg.guild.member(user).removeRole(r)
							}
							else if (/^CColour - #[a-f0-9]{6}$/i.test(r.name)) {
								msg.guild.member(user).removeRole(r)
							}
						}
					});
					if (roleExists) {
						setTimeout(function() {
							msg.guild.member(user).addRole(role)
						}, 500);
					}
					else {
						msg.guild.createRole({
							color: parseInt(suffix.replace(/(.*) #?/, ""), 16),
							hoist: false,
							permissions: [],
							name: "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase()
						})
							.then(role => {
							roleExists = true;
							msg.guild.member(user).addRole(role)
							msg.channel.sendMessage("Successfully set!");
						})
					}
					return;
				}
				else {
					msg.channel.sendMessage("Changing your own color is currently disabled on this server.");
					return;
				}
			});
			return;
		}
		if (suffix.trim() == "clean") {
			var count = 0;
			msg.guild.roles.array().map((role) => {
				if (/^CColour - [a-f0-9]{6}$/i.test(role.name)) {
					var i = 0
					msg.guild.members.array().forEach(function(user){
						user.roles.array().map(r => {
							if (r.name === role.name) {
								i++
							}
						})
					})
					if (i < 1) {
						count++;
						role.delete(role)
					}
				}
			});
			msg.channel.sendMessage("Removed " + count + " colors with no users");
			return;
		}
		if (msg.mentions.users.array().length < 1) {
			msg.channel.sendMessage("You must mention the users you want to change the color of!");
			return;
		}
		if (suffix.indexOf("random") > -1) {
			suffix = "000000".replace(/0/g, function() {
				return (~~(Math.random() * 16)).toString(16);
			});
		}
		msg.mentions.users.array().forEach(mention => {
			suffix = suffix.replace("!", "").replace("@", "").replace(mention.id, "").replace("<", "").replace(">", "").trim()
		})
		var suffixtest = /^#[a-f0-9]{6}$/i.test(suffix);
		if (suffix.length === 7 && !suffixtest) {
			msg.channel.sendMessage("That doesn't appear to be a valid hex color.");
			return;
		}
		suffixtest = /^[a-f0-9]{6}$/i.test(suffix);
		if (suffix.length === 6 && !suffixtest) {
			msg.channel.sendMessage("That doesn't appear to be a valid hex color.");
			return;
		}
		if (suffix.length < 6 || suffix.length > 7) {
			msg.channel.sendMessage("That doesn't appear to be a valid hex color.");
			return;
		}
		suffix = suffix.replace("#", "");
		var role = msg.guild.roles.find("name", "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase());
		var roleExists = false;
		if (role) {
			roleExists = true;
		}
		msg.mentions.users.array().map((user) => {
			msg.guild.member(user).roles.array().map((r) => {
				if (r) {
					if (/^CColour - [a-f0-9]{6}$/i.test(r.name)) {
						msg.guild.member(user).removeRole(r)
					}
					else if (/^CColour - #[a-f0-9]{6}$/i.test(r.name)) {
						msg.guild.member(user).removeRole(r)
					}
				}
			});
			if (roleExists) {
				setTimeout(function() {
					msg.guild.member(user).addRole(role)
				}, 500);
			}
			else {
				msg.guild.createRole({
					color: parseInt(suffix.replace(/(.*) #?/, ""), 16),
					hoist: false,
					permissions: [],
					name: "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase()
				})
					.then(role => {
					roleExists = true;
					msg.guild.member(user).addRole(role)
					msg.channel.sendMessage("Successfully set!");
				})
			}
		});
	}
}
//works

Commands.createcommand = {
	name: "createcommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (!suffix) {
			msg.channel.sendMessage("Syntax error. Correct usage: `!createcommand <command name> | <text>`. Command name cannot contain spaces.");
			return;
		}
		var customcom = suffix.split(" ")[0].toLowerCase().trim()
		if (suffix.trim().split(" ")[1] != "|") {
				msg.channel.sendMessage("Custom commands can't contain spaces!")
			return;
		}
		var customresponse = suffix.replace(customcom + " | ", "").trim();
		if (Commands[customcom] || customcom === "help") {
			msg.channel.sendMessage("Overwriting commands with custom commands is not allowed!");
			return;
		}
		customcomdb.exists(msg.guild.id, customcom, function(results) {
			if (results.length < 1) {
				var commandexists = false
			}
			else if (results.length === 1) {
				var commandexists = true
			}
			if (suffix.indexOf(" | ") < 0) {
				msg.channel.sendMessage("Syntax error. Correct usage: `!createcommand <command name> | <text>`. Command name cannot contain spaces.");
				return;
			}
			if (customresponse === undefined) {
					msg.channel.sendMessage("Syntax error. Correct usage: `!createcommand <command name> | <text>`. Command name cannot contain spaces.");
				return;
			}
			if (commandexists) {
					msg.channel.sendMessage("Command `" + customcom + "` updated with new response: " + customresponse);
			}
			else {
					msg.channel.sendMessage("Command `" + customcom + "` created with response: " + customresponse);
			}
			var data = {
				"command": customcom,
				"sid": msg.channel.guild.id,
				"response": customresponse
			};
			if (commandexists === true) {
				customcomdb.update(data)
			}
			else {
				customcomdb.create(data)
			}
		})
	}
}; //works, basic check

Commands.customcommands = {
	"name": "customcommands",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		customcomdb.getCustomCommands(msg.guild.id, function(results) {
			var msgcustomcom = [];
			var i = 1
			results.forEach(function(com) {
				if (com) {
					if (com.sid === msg.guild.id) {
						if (com.response != "" || com.response != " ") {
							msgcustomcom.push(`${i}. **!${com.command}**`);
							i++
						}
					}
				}
			});
			msgcustomcom = msgcustomcom.join("\n");
			if (msgcustomcom === "" || msgcustomcom === " ") {
				msg.channel.sendMessage("No custom commands on this server.");
				return;
			}
			else {
				msg.channel.sendMessage("Sending list of commands in a PM.")
				msg.author.sendMessage("Commands on this server: \n" + msgcustomcom);
				return;
			}
		})
	}
}; //works

Commands.deletecommand = {
	name: "deletecommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (!suffix) {
			msg.channel.sendMessage("You didn't specify a command for me to delete.");
			return;
		}
		var customcom = suffix.split(" ")[0].toLowerCase();
		customcomdb.exists(msg.guild.id, customcom, function(results) {
			if (results.length === 1) {
				customcomdb.delete(results[0])
				msg.channel.sendMessage("Deleted command **" + results[0].command + "**");
			}
			else {
				msg.channel.sendMessage("That command doesn't exist!");
			}
		})
	}
}; //works, basic check

Commands.disablecommand = {
	name: "disablecommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		suffix = suffix.toLowerCase()
		if (!msg.channel.guild) return;
		if (!suffix) {
			msg.channel.sendMessage("You didn't specify a command to disable!");
			return;
		}
		suffix = suffix.trim();
		if (suffix.split(" ").length > 1) {
			msg.channel.sendMessage("There are no spaces in a command name!");
			return;
		}
		if (suffix === "disablecommand" || suffix === "help" || suffix === "enablecommand") {
			msg.channel.sendMessage("You cannot disable that command!");
			return;
		}
		if (!Commands[suffix]) {
			suffix = suffix.substring(1);
			if (!Commands[suffix]) {
				msg.channel.sendMessage("That command doesn't exist!");
				return;
			}
		}
		serverdb.getServerData(msg.guild.id, function(results) {
			if (results[0].disabledCommands.length < 1) {
				serverdb.updateBannedCommands(msg.guild.id, suffix.toLowerCase(), "push")
				msg.channel.sendMessage(`**!${suffix}** is now disabled.`)
				return;
			}
			for (var i = 0; i < results[0].disabledCommands.length; i++) {
				if (results[0].disabledCommands[i] === suffix) {
					msg.channel.sendMessage(`**!${suffix}** is already disabled!`)
					return;
				}
			}
			serverdb.updateBannedCommands(msg.guild.id, suffix.toLowerCase(), "push")
			msg.channel.sendMessage(`**!${suffix}** is now disabled.`)
			return;
		})
	}
}; //works, basic check

Commands.enablecommand = {
	name: "enablecommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		suffix = suffix.toLowerCase()
		if (!msg.channel.guild) return;
		if (!suffix) {
			msg.channel.sendMessage("You didn't specify a command to enable!");
			return;
		}
		suffix = suffix.trim();
		if (suffix.split(" ").length > 1) {
			msg.channel.sendMessage("There are no spaces in a command name!");
			return;
		}
		if (!Commands[suffix]) {
			suffix = suffix.substring(1);
			if (!Commands[suffix]) {
				msg.channel.sendMessage("That command doesn't exist!");
				return;
			}
		}
		serverdb.getServerData(msg.guild.id, function(results) {
			if (results[0].disabledCommands < 1) {
				msg.channel.sendMessage(`**!${suffix}** wasn't disabled in the first place!`)
				return;
			}
			for (var i = 0; i < results[0].disabledCommands.length; i++) {
				if (results[0].disabledCommands[i] === suffix) {
					serverdb.updateBannedCommands(msg.guild.id, suffix.toLowerCase(), "pull")
					msg.channel.sendMessage(`**!${suffix}** has been enabled!`)
					return;
				}
					msg.channel.sendMessage(`**!${suffix}** wasn't disabled in the first place!`)
			}
		})
	}
}; //works, basic check

Commands.forcecheck = {
	"name": "forcecheck",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			msg.channel.sendMessage(`You didn't tell me who to check!`)
			return;
		}
		else {
				osudb.getosuPlayers(suffix.trim().toLowerCase(), null, null, function (results) {
					for (var i = 0; i < results.length; i++) {
						results[i].inactivity = 0;
						osudb.updateosuPlayer(null, results[i])
					}
				})
				msg.channel.sendMessage(`Forcing a check...`)
		}
	}
}; //function not implemented

Commands.ignore = {
	name: "ignore",
	help: "This changes if the channel allows commands.",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		serverdb.getServerData(msg.guild.id, function(results) {
			if (!suffix) {
				var channel = bot.channels.find("id", msg.channel.id)
			}
			else {
				var channel = bot.channels.find("id", msg.mentions.channels.array()[0].id)
			}
			for (var i = 0; i < results[0].ignoredChannels.length; i++) {
				if (results[0].ignoredChannels[i] === channel.id) {
					msg.channel.sendMessage(`${channel} is already being ignored!`)
					return;
				}
			}
			serverdb.updateIgnoreChannels(msg.guild.id, channel.id, "push")
			msg.channel.sendMessage(`${channel} is now being ignored!`)
		})
	}
}; //works, basic check

Commands.joinmessage = {
	name: "joinmessage",
	description: "Gives a link to a list of songs",
	extendedhelp: "Gives a link to a list of songs",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (!suffix) {
			msg.channel.sendMessage("The join message cannot be blank. If you wish to disable join messages, use `!announce` in the channel you want to disable join/leave/ban announce messages.");
		}
		else if (suffix === "current") {
			serverdb.getServerData(msg.guild.id, function(results) {
				if (results[0].joinMessage === "") {
					msg.channel.sendMessage("The current join message is: %user% has joined!");
				}
				else {
					msg.channel.sendMessage("The current join message is: " + results[0].joinMessage);
				}
			});
		}
		else {
			serverdb.setJoinMessage(msg.guild.id, suffix)
				msg.channel.sendMessage("The join message has been set to: " + suffix);
		}
	}
}; //works //works

Commands["join-server"] = {
	name: "join-server",
	help: "I'll join the server you've requested me to join, as long as the invite is valid and I'm not banned of already in the requested server.",
	usage: "<bot-username> <instant-invite>",
	level: 0,
	fn: function(bot, msg, suffix) {
		suffix = suffix.split(" ");
		var array = [];
		array.push("Please click this link, login if needed, and select which server you want me to join! " + ConfigFile.oauth_url);
		array.push("Note that you **MUST** have the permission to **Manage Server** on the server you wish to invite me too.");
		array.push("I request to have most permissions, however you can select which permissions I am given.");
		array.push("Please make sure to use `!setowner` after I have joined. If you need any other help, please use `!support` or contact my owner directly. zelda101#1379");
		msg.channel.sendMessage(array);
		return;
	}
}; //works //works

Commands.kick = {
	name: "kick",
	level: 0,
	fn: function(bot, msg, suffix) {
		var a = 0;
		if (!msg.channel.guild) return;
		if (!msg.channel.permissionsFor(msg.author).hasPermission("KICK_MEMBERS")) {
			msg.channel.sendMessage("You don't have the permission `Kick Members`! You must have this permission to use `!kick`");
			return;
		}
		if (!msg.channel.permissionsFor(bot.user).hasPermission("KICK_MEMBERS")) {
			msg.channel.sendMessage("I don't have the permission `Kick Members`! I must have this permission for `!kick` to function correctly!");
			return;
		}
		if (msg.mentions.users.array().length < 1) {
			msg.channel.sendMessage("You must mention the user you want to kick!");
			return;
		}
		msg.mentions.users.array().forEach(function(user) {
			if (msg.author === user) {
				msg.channel.sendMessage("You can't kick yourself, idiot.");
				return;
			}
			else {
				msg.guild.member(user).kick().catch(err => {
					if (err.status === 403) {
						msg.channel.sendMessage(`I was unable to kick ${user}! Their power exceeds my own!`)
					}
				})
			}
		});
	}
}; //works

Commands.konachan = {
	name: "konachan",
	help: "You're looking at it right now.",
	level: 0,
	nsfw: true,
	fn: function(bot, msg, suffix) {
		if (suffix.split(" ").length > 5) {
			msg.channel.sendMessage("Konachan only supports upto 6 tags.");
			return;
		}
		unirest.post("https://konachan.net/post/index.json?limit=500&tags=" + suffix)
			.end(function(result) {
				if (result.body.length < 1) {
					msg.channel.sendMessage("Sorry, nothing found.");
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
					msg.channel.sendMessage("You've searched for `" + suffix + "`. Sending images in a pm...");
					user.sendFile(kona, '', '');
					user.sendFile(kona1, '', '');
					user.sendFile(kona2, '', '');
				}
				else {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var kona = result.body[count].file_url;
					var kona1 = result.body[count1].file_url;
					var kona2 = result.body[count2].file_url;
					if (result.body.length <= 2) {
						msg.channel.sendMessage("There were less than 3 results for `" + suffix + "` :(");
						if (result.body.length === 1) {
							kona = result.body[0].file_url;
							msg.channel.sendFile(kona, '', '');
							return;
						}
						if (result.body.length === 2) {
							kona = result.body[0].file_url;
							kona1 = result.body[1].file_url;
							msg.channel.sendFile(kona, '', '');
							msg.channel.sendFile(kona1, '', '');
							return;
						}
					}
					msg.channel.sendMessage("You've searched for ` " + suffix + " ` . There are `" + result.body.length + "` results that contain those tags.\nSending `3` random images of those `" + result.body.length + "` results.");
					msg.channel.sendFile(kona, '', '');
					msg.channel.sendFile(kona1, '', '');
					msg.channel.sendFile(kona2, '', '');
				}
			});
	}
}; //works //works

Commands.lastmention = {
	"name": "lastmention",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		z = 0;
		attempts = 0;
		var mentionchannel = "";
		if (msg.mentions.channels.array().length > 1) {
			msg.channel.sendMessage("You must mention exactly 1 channel!")
			return;
		}
		if (msg.mentions.channels.array().length === 0) {
			var mentionchannel = msg.channel
		}
		else {
			var mentionchannel = msg.mentions.channels.array()[0]
		}
		var channelaccess = mentionchannel.permissionsFor(msg.author).serialize()
		if (channelaccess.READ_MESSAGES != true) {
			msg.channel.sendMessage("You don't have access to that channel.")
			return;
		}
		var mentionchannelnsfw = "1"
		var currentnsfw = "1"
		serverdb.getServerData(msg.guild.id, function(results) {
			if (results[0].nsfwChannels.indexOf(mentionchannel.id) > -1) {
				mentionchannelnsfw = "true"
			}
			else {
				mentionchannelnsfw = "false"
			}
			if (results[0].nsfwChannels.indexOf(msg.channel.id) > -1) {
				currentnsfw = "true"
			}
			else {
				currentnsfw = "false"
			}
		})
		setTimeout(function() {
			if (mentionchannelnsfw === "true" && currentnsfw === "false") {
				msg.channel.sendMessage("I can't do that for uhhh.... lewd reasons.")
				return
			}
			msg.channel.fetchMessages({ limit: 100 })
			.then(messages => {
					var userid = msg.author.id;
					for (var i = 0; i < 100; i++) {
						if (messages.array()[i].content.indexOf(userid) > -1) {
							if (messages.array()[i].author.id != bot.user.id) {
								msg.channel.fetchMessages({ limit: 4, before: messages.array()[i].id })
								.then(prevmessages => {
										var timestamp1 = discordtimestamp(prevmessages.array()[3].createdTimestamp);
										var timestamp2 = discordtimestamp(prevmessages.array()[2].createdTimestamp);
										var timestamp3 = discordtimestamp(prevmessages.array()[1].createdTimestamp);
										var timestamp4 = discordtimestamp(prevmessages.array()[0].createdTimestamp);
										var timestamp5 = discordtimestamp(messages.array()[i].createdTimestamp);
										msg.channel.sendMessage(`Latest mention in ${mentionchannel}: \n ${timestamp1} UTC ** ${prevmessages.array()[3].author.username}**: ${prevmessages.array()[3].cleanContent}\n ${timestamp2} UTC ** ${prevmessages.array()[2].author.username}**: ${prevmessages.array()[2].cleanContent}\n ${timestamp3} UTC **${prevmessages.array()[1].author.username}` +
										`**: ${prevmessages.array()[1].cleanContent}\n ${timestamp4} UTC ** ${prevmessages.array()[0].author.username}**: ${prevmessages.array()[0].cleanContent}\n ${timestamp5} UTC ** ${messages.array()[i].author.username}**: ${messages.array()[i].content}`);
										return
									})
									break
								}
							}
							if (i === 99) {
								z = messages.array()[i].id;
								attempts++;
								lastmention(bot, msg, suffix, z, attempts, mentionchannel);
							}
						}
					})
		}, 500);
	}
}; //works //works basic check

function discordtimestamp(timestamp) {
	var date = new Date(timestamp);
	var hours = date.getUTCHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
} //works //works basic check

function lastmention(bot, msg, suffix, z, attempts, mentionchannel) {
	if (attempts < 50) {
		msg.channel.fetchMessages({ limit: 100, before: z })
		.then(messages => {
				var userid = msg.author.id;
				for (var i = 0; i < 100; i++) {
					if (messages.array()[i].content.indexOf(userid) > -1) {
						if (messages.array()[i].author.id != bot.user.id) {
							msg.channel.fetchMessages({ limit: 4, before: messages.array()[i].id })
							.then(prevmessages => {
									var timestamp1 = discordtimestamp(prevmessages.array()[3].createdTimestamp);
									var timestamp2 = discordtimestamp(prevmessages.array()[2].createdTimestamp);
									var timestamp3 = discordtimestamp(prevmessages.array()[1].createdTimestamp);
									var timestamp4 = discordtimestamp(prevmessages.array()[0].createdTimestamp);
									var timestamp5 = discordtimestamp(messages.array()[i].createdTimestamp);
									msg.channel.sendMessage(`Latest mention in ${mentionchannel}: \n ${timestamp1} UTC ** ${prevmessages.array()[3].author.username}**: ${prevmessages.array()[3].cleanContent}\n ${timestamp2} UTC ** ${prevmessages.array()[2].author.username}**: ${prevmessages.array()[2].cleanContent}\n ${timestamp3} UTC **${prevmessages.array()[1].author.username}` +
									`**: ${prevmessages.array()[1].cleanContent}\n ${timestamp4} UTC ** ${prevmessages.array()[0].author.username}**: ${prevmessages.array()[0].cleanContent}\n ${timestamp5} UTC ** ${messages.array()[i].author.username}**: ${messages.array()[i].content}`);
									return
								})
								break
							}
						}
						if (i === 99) {
							z = messages.array()[i].id;
							attempts++;
							lastmention(bot, msg, suffix, z, attempts, mentionchannel);
						}
					}
				})
	}
	else {
		msg.channel.sendMessage("Couldn't find a mention in the last 5000 messages.");
	}
} //works //works basic check

Commands.leave = {
	name: "leave",
	help: "I'll leave the server in which the command is executed, you'll need the *Manage server* permission in your role to use this command.",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.permissionsFor(msg.author).hasPermission("BAN_MEMBERS") || (!msg.channel.permissionsFor(msg.author).hasPermission("KICK_MEMBERS"))) {
			msg.channel.sendMessage("You must have either the **Kick Members** or **Ban Members** permission to use **!leave**");
			return;
		}
		if (msg.channel.guild) {
			msg.channel.sendMessage("Alright, see ya!");
			msg.guild.leave()
			return;
		}
		else {
			msg.channel.sendMessage("I can't leave a DM!");
			return;
		}
	}
} //works

Commands.leavemessage = {
	name: "leavemessage",
	description: "Gives a link to a list of songs",
	extendedhelp: "Gives a link to a list of songs",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (!suffix) {
			msg.channel.sendMessage("The leave message cannot be blank. If you wish to disable leave messages, use `!announce` in the channel you want to disable join/leave/ban announce messages.");
		}
		else if (suffix === "current") {
			serverdb.getServerData(msg.guild.id, function(results) {
				if (results[0].leaveMessage === "") {
					msg.channel.sendMessage("The current leave message is: %user% has left!");
				}
				else {
					msg.channel.sendMessage("The current leave message is: " + results[0].leaveMessage);
				}
			});
		}
		else {
			serverdb.setLeaveMessage(msg.guild.id, suffix)
				msg.channel.sendMessage("The leave message has been set to: " + suffix);
		}
	}
}; //works

Commands.manga = {
	name: "manga",
	usage: "<manga/novel name>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (suffix) {
			var USER = ConfigFile.maluser;
			var PASS = ConfigFile.malpass;
			if (!USER || !PASS) {
				msg.channel.sendMessage("MAL login not configured by bot owner")
				return;
			}
			msg.channel.startTyping();
			var tags = suffix.split(" ").join("+");
			var rUrl = "http://myanimelist.net/api/manga/search.xml?q=" + tags;
			request(rUrl, {
				"auth": {
					"user": USER,
					"pass": PASS,
					"sendImmediately": false
				}
			}, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					xml2js.parseString(body, function(err, result) {
						if (err) console.error(err);
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
							msg.channel.sendMessage("**" + title + " / " + english + "**\n**Type:** " + type + " **| Chapters:** " + chapters + " **| Volumes: **" + volumes + " **| Status:** " + status + " **| Score:** " + score + "\n" + synopsis);
						}, 2000);
						msg.channel.sendFile(picture, '', '');
					});
				}
				else {
					msg.channel.sendMessage("\"" + suffix + "\" not found")
				}
			});
			msg.channel.stopTyping();
		}
	}
}, //works

Commands.mute = {
	name: "mute",
	level: 0,
	fn: function(bot, msg, suffix) {
		suffix = suffix.trim()
		if (!msg.channel.guild) return;
		if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_CHANNELS")) {
			msg.channel.sendMessage("I don't have the permission `Manage Channels`! I must have this permission for `!mute` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_CHANNELS")) {
			msg.channel.sendMessage("You don't have the permission `Manage Channels`! You must have this permission to use `!mute`");
			return;
		}
		if (msg.mentions.users.array().length > 1) {
			msg.channel.sendMessage("You can only mute 1 person at a time.");
			return;
		}
		if (msg.mentions.users.array().length === 0) {
			msg.channel.sendMessage("You didn't mention a user for me mute!");
			return;
		}
		msg.mentions.users.array().map((user) => {
			if (user.id === msg.author.id) {
				msg.channel.sendMessage("You can't mute yourself!");
				//return;
			}
			var prevPermsTrue = []
			var prevPermsFalse = []
			for (var i = 0; i < msg.channel.guild.channels.array().length; i++) {
				var channame = msg.channel.guild.channels.array()[i];
				var channelaccess = channame.permissionsFor(user).serialize()
				if (channelaccess.READ_MESSAGES === true && channame.type === "text") {
					if (channame.permissionOverwrites.array().length === 0) {
						denyData = 2048
						channame.overwritePermissions(user, {}, allowData, denyData)
					}
					for (var j = 0; j < channame.permissionOverwrites.array().length; j++) {
						if (channame.permissionOverwrites.array()[j].id === user.id) {
 							var allowData = channame.permissionOverwrites.array()[j].allowData
							var denyData = channame.permissionOverwrites.array()[j].denyData
							if ((allowData & 2048) == 2048) {
								prevPermsTrue.push(channame.id)
								allowData = allowData - 2048
								denyData = denyData + 2048
							}
							else if ((denyData & 2048) == 2048) {
								prevPermsFalse.push(channame.id)
							}
							else {
								denyData = denyData + 2048
							}
							channame.overwritePermissions(user, {}, allowData, denyData)
							break;
						}
						if (j === channame.permissionOverwrites.array().length - 1) {
							denyData = 2048
							channame.overwritePermissions(user, {}, allowData, denyData)
						}
					}
				}
				else if (channelaccess.CONNECT === true && channame.type === "voice") {
					console.log(channame.permissionOverwrites.array().length)
					if (channame.permissionOverwrites.array().length === 1) {
						denyData = 2097152
						channame.overwritePermissions(user, {}, allowData, denyData)
					}
					console.log("hi")
						for (var j = 0; j < channame.permissionOverwrites.array().length; j++) {
							if (channame.permissionOverwrites.array()[j].id === user.id) {
								console.log("hi2")
								var allowData = channame.permissionOverwrites.array()[j].allowData
								var denyData = channame.permissionOverwrites.array()[j].denyData
								console.log(allowData + " " + denyData)
								if ((allowData & 2097152) == 2097152) {
									prevPermsTrue.push(channame.id)
									allowData = allowData - 2097152
									denyData = denyData + 2097152
								}
								else if ((denyData & 2097152) == 2097152) {
									prevPermsFalse.push(channame.id)
								}
								else {
									denyData = denyData + 2097152
								}
								channame.overwritePermissions(user, {}, allowData, denyData)
							}
						}
				}
			}
			if (!isNaN(suffix.split(" ")[1])) {
				permissions.setMuted(user.id, msg.guild.id, true, msg.createdTimestamp, suffix.split(" ")[1] * 60000, prevPermsTrue, prevPermsFalse)
				msg.channel.sendMessage(`${user} will be automatically unmuted in ${suffix.split(" ")[1]} minutes.`);
			}
			else if (!isNaN(suffix.split(" ")[0])) {
				permissions.setMuted(user.id, msg.guild.id, true, msg.createdTimestamp, suffix.split(" ")[0] * 60000, prevPermsTrue, prevPermsFalse)
				msg.channel.sendMessage(`${user} will be automatically unmuted in ${suffix.split(" ")[0]} minutes.`);
			}
			else {
				permissions.setMuted(user.id, msg.guild.id, true, msg.createdTimestamp, 0, prevPermsTrue, prevPermsFalse)
				msg.channel.sendMessage(`Successfully muted ${user}`);
			}
		});
	}
}; //works

Commands.names = {
	name: "names",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.mentions.users.array().length === 1) {
			user = msg.mentions.users.array()[0]
		}
		else {
			msg.channel.sendMessage(`You must mention exactly 1 person!`)
			return;
		}
		userdb.userExists(user, function(results) {
			if (results[0].names.length < 1) {
				msg.channel.sendMessage(`No previous names found for ${user.username}`)
			}
			else {
				msgArray = []
				msgArray.push(`Previous known names for ${user.username}`)
				msgArray.push(results[0].names.join(", "))
				msg.channel.sendMessage(msgArray)
			}
		})
	}
}; //works basic check

Commands.pmmentions = {
	name: "pmmentions",
	description: "",
	extendedhelp: "",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) return;
		userdb.userExists(msg.author, function(results) {
			if (results[0].pmMentions === true) {
				userdb.setPmMentions(msg.author.id, false)
				msg.channel.sendMessage("I will no longer PM you when you are mentioned while idle or offline on this server.");
			}
			if (results[0].pmMentions === false) {
				userdb.setPmMentions(msg.author.id, true)
				msg.channel.sendMessage("I will now send you a PM when you are mentioned while idle or away on this server.");
			}
		});
	}
}; //function not implemented

Commands.punish = {
	name: "punish",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (msg.mentions.users.array().length === 0) {
			msg.channel.sendMessage("You didn't tell me who to punish!");
			return;
		}
		if (msg.mentions.users.array().length > 1) {
			msg.channel.sendMessage("You can only punish one person at a time.");
			return;
		}
		msg.mentions.users.array().map((user) => {
			if (user.id === msg.author.id) {
				msg.channel.sendMessage("You can't punish yourself!");
				//return;
			}
			permissions.checkPermissions(user.id, msg.guild.id, function(results) {
				if (results.punishLevel === 0) {
					permissions.setPunishLevel(user.id, msg.guild.id, 1, suffix.replace("<@" + user.id + ">", "").trim(), msg.createdTimestamp)
							var reason = suffix.replace("<@" + user.id + ">", "").trim();
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							msg.channel.sendMessage(`${user}, this is your first warning.`);
							serverdb.getServerData(msg.guild.id, function(results1) {
								if (results1[0].stafflogChannel != "") {
									var channel = bot.channels.find("id", results1[0].stafflogChannel)
									var array = [];
									array.push(`${user} has been warned for the 1st time.`);
									array.push(`Reason: ${reason}`);
									array.push("Current punish level: 1");
									array.push(`Punished by: ${msg.author}`);
									channel.sendMessage(array);
								}
							})
						}
				else if (results.punishLevel === 1) {
					permissions.setPunishLevel(user.id, msg.guild.id, 2, suffix.replace("<@" + user.id + ">", "").trim(), msg.createdTimestamp)
							var reason = suffix.replace("<@" + user.id + ">", "").trim();
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							msg.channel.sendMessage(`${user}, this is your second and final warning.`);
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							serverdb.getServerData(msg.guild.id, function(results1) {
								if (results1[0].stafflogChannel != "") {
									var channel = bot.channels.find("id", results1[0].stafflogChannel)
									var array = [];
									array.push(`${user} has been warned for the 2nd time.`);
									array.push(`Reason: ${reason}`);
									array.push("Current punish level: 2");
									array.push(`Punished by: ${msg.author}`);
									channel.sendMessage(array);
								}
							})
					}
				else if (results.punishLevel === 2) {
					if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
						msg.author.sendMessage("I don't have the correct permissions to mute. For `!punish` (and other commands) to work correctly, please give me the correct permissions. I recommend you give me all permissions and move the role I'm in to the top of the roles list.");
						return;
					}
					permissions.setPunishLevel(user.id, msg.guild.id, 3, suffix.replace("<@" + user.id + ">", "").trim(), msg.createdTimestamp)
							msg.channel.sendMessage(`${user}, you have been silenced for 5 minutes.`);
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							serverdb.getServerData(msg.guild.id, function(results1) {
								if (results1[0].stafflogChannel != "") {
									var channel = bot.channels.find("id", results1[0].stafflogChannel)
									var array = [];
									array.push(`${user} has been muted for the 1st time.`);
									array.push(`Reason: ${reason}`);
									array.push("Current punish level: 3");
									array.push(`Punished by: ${msg.author}`);
									channel.sendMessage(array);
								}
							});
							for (var i = 0; i < msg.guild.channels.array().length; i++) {
								var channame = msg.guild.channels.array()[i];
								var channelaccess = channame.permissionsFor(user).serialize()
								if (channelaccess.READ_MESSAGES === true && channame.type === "text") {
									channame.overwritePermissions(user, { "SEND_MESSAGES": false })
								}
								else if (channelaccess.CONNECT === true && channame.type === "voice") {
									channame.overwritePermissions(user, { "SPEAK": false })
								}
							}
							permissions.setMuted(user.id, msg.guild.id, true, msg.createdTimestamp, 300000)
				}
				else if (results.punishLevel === 3) {
					if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
						msg.author.sendMessage("I don't have the correct permissions to mute. For `!punish` (and other commands) to work correctly, please give me the correct permissions. I recommend you give me all permissions and move the role I'm in to the top of the roles list.");
						return;
					}
					permissions.setPunishLevel(user.id, msg.guild.id, 4, suffix.replace("<@" + user.id + ">", "").trim(), msg.createdTimestamp)
							msg.channel.sendMessage(`${user}, you have been silenced for 15 minutes.`);
							var reason = suffix.replace("<@" + user.id + ">", "");
							if (reason === "" || reason === " ") {
								reason = "No reason was provided.";
							}
							serverdb.getServerData(msg.guild.id, function(results1) {
								if (results1[0].stafflogChannel != "") {
									var channel = bot.channels.find("id", results1[0].stafflogChannel)
									var array = [];
									array.push(`${user} has been muted for the 2nd time.`);
									array.push(`Reason: ${reason}`);
									array.push("Current punish level: 4");
									array.push(`Punished by: ${msg.author}`);
									channel.sendMessage(array);
								}
							});
							for (var i = 0; i < msg.guild.channels.array().length; i++) {
								var channame = msg.guild.channels.array()[i];
								var channelaccess = channame.permissionsFor(user).serialize()
								if (channelaccess.READ_MESSAGES === true && channame.type === "text") {
									channame.overwritePermissions(user, { "SEND_MESSAGES": false })
								}
								else if (channelaccess.CONNECT === true && channame.type === "voice") {
									channame.overwritePermissions(user, { "SPEAK": false })
								}
							}
							permissions.setMuted(user.id, msg.guild.id, true, msg.createdTimestamp, 900000)
				}
				else if (results.punishLevel === 4) {
					if (!msg.channel.permissionsFor(bot.user).hasPermission("KICK_MEMBERS")) {
						msg.author.sendMessage("I don't have the correct permissions to kick. For `!punish` (and other commands) to work, please give me the correct permissions. I recommend you give me all permissions and move the role I'm in to the top of the roles list.");
						return;
					}
					permissions.setPunishLevel(user.id, msg.guild.id, 5, suffix.replace("<@" + user.id + ">", "").trim(), msg.createdTimestamp)
					msg.channel.sendMessage(`${user} has been kicked.`);
					var reason = suffix.replace("<@" + user.id + ">", "");
					if (reason === "" || reason === " ") {
						reason = "No reason was provided.";
					}
					msg.guild.member(user).kick()
					serverdb.getServerData(msg.guild.id, function(results1) {
						if (results1[0].stafflogChannel != "") {
							var channel = bot.channels.find("id", results1[0].stafflogChannel)
							var array = [];
							array.push(`${user} has been kicked.`);
							array.push(`Reason: ${reason}`);
							array.push("Current punish level: 5");
							array.push(`Punished by: ${msg.author}`);
							channel.sendMessage(array);
						}
					});
					var array = [];
					array.push("You have been kicked. If you commit one more offense, you will be banned.");
					array.push("The reason you were kicked: " + reason);
					user.sendMessage(array);
					msg.channel.createInvite({ "maxUses": 1 }).then(invite => user.sendMessage(`Here is an invite link to rejoin: ${invite}`))
				}
				else if (results.punishLevel === 5) {
					if (!msg.channel.permissionsFor(bot.user).hasPermission("BAN_MEMBERS")) {
						msg.author.sendMessage("I don't have the correct permissions to ban. For `!punish` (and other commands) to work, please give me the correct permissions. I recommend you give me all permissions and move the role I'm in to the top of the roles list.");
						return;
					}
					permissions.setPunishLevel(user.id, msg.guild.id, 5, suffix.replace("<@" + user.id + ">", "").trim(), msg.createdTimestamp)
					msg.channel.sendMessage(`${user} has been banned.`);
					var reason = suffix.replace("<@" + user.id + ">", "");
					if (reason === "" || reason === " ") {
						reason = "No reason was provided.";
					}
					msg.guild.ban(user)
					serverdb.getServerData(msg.guild.id, function(results1) {
						if (results1[0].stafflogChannel != "") {
							var channel = bot.channels.find("id", results1[0].stafflogChannel)
							var array = [];
							array.push(`${user} has been banned.`);
							array.push(`Reason: ${reason}`);
							array.push("Current punish level: 5");
							array.push(`Punished by: ${msg.author}`);
							channel.sendMessage(array);
						}
					});
					var array = [];
					array.push(`You have been banned from **${msg.guild.name}**.`);
					array.push("The reason you were banned: " + reason);
					user.sendMessage(array);
				}
			});
		});
	}
}; //works

Commands.punishlevel = {
	name: "punishlevel",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (msg.mentions.users.array().length != 1) {
			msg.channel.sendMessage(`You must mention exactly 1 user!`);
			return;
		}
		if (!isNaN(suffix.split(" ")[1])) {
			suffix = parseInt(suffix.split(" ")[1], 10);
		}
		else {
			msg.channel.sendMessage(`Incorrect usage. Example: **!punishlevel <user> <level>**`);
			return;
		}
		if (suffix < 0 || suffix > 5) {
			msg.channel.sendMessage(`You cannot set a punish level to be lower than 0 or higher than 5!`);
			return;
		}
		msg.mentions.users.array().map((user) => {
			permissions.setPunishLevel(user.id, msg.guild.id, suffix)
			msg.channel.sendMessage(`${user}'s punish level has been set to: ${suffix}`);
		});
	}
}; //works

Commands.purge = {
	name: "purge",
	help: "I'll delete a certain ammount of messages.",
	usage: "<number-of-messages-to-delete>",
	level: 0,
	fn: function(bot, msg, suffix) {
		var username;
		if (!msg.channel.guild) return;
		if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_MESSAGES")) {
			msg.channel.sendMessage("You don't have the permission `Manage Messages`! You must have this permission to use `!purge`");
			return;
		}
		if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_MESSAGES")) {
			msg.channel.sendMessage("I don't have the permission `Manage Messages`! I must have this permission for `!purge` to function correctly!");
			return;
		}
		if (msg.mentions.users.array().length === 1 && !isNaN(suffix.split(" ")[1])) {
			msg.channel.fetchMessages({ limit: 100 }).then(messages => {
					uid = msg.mentions.users.array()[0].id
					var todo = parseInt(suffix.split(" ")[1], 10);
					if (todo >= 100) todo = 99
					var delcount = 0;
					var messagestodelete = [];
					for (var i = 0; i < 100; i++) {
						if (todo <= 0) {
							if (messagestodelete.length === 1) {
								msg.delete(messagestodelete[0]);
							}
							else {
								msg.channel.bulkDelete(messagestodelete);
							}
							msg.channel.sendMessage("Deleted " + delcount + " of " + msg.mentions.users.array()[0].username + "'s messages");
							return;
						}
						else {
							if (messages.array()[i].author.id == uid) {
								messagestodelete.push(messages.array()[i]);
								delcount++;
								todo--;
							}
						}
					}
			});
			return;
		}
		if (msg.mentions.users.array().length === 1 && !isNaN(suffix.split(" ")[0])) {
			msg.channel.fetchMessages({ limit: 100 }).then(messages => {
					uid = msg.mentions.users.array()[0].id
					var todo = parseInt(suffix.split(" ")[0], 10);
					if (todo >= 100) todo = 99
					var delcount = 0;
					var messagestodelete = [];
					for (var i = 0; i < 100; i++) {
						if (todo <= 0) {
							if (messagestodelete.length === 1) {
								msg.delete(messagestodelete[0]);
							}
							else {
								msg.channel.bulkDelete(messagestodelete);
							}
							msg.channel.sendMessage("Deleted " + delcount + " of " + msg.mentions.users.array()[0].username + "'s messages.");
							return;
						}
						else {
							if (messages.array()[i].author.id == uid) {
								messagestodelete.push(messages.array()[i]);
								delcount++;
								todo--;
							}
						}
					}
			});
			return;
		}
		if (!suffix || isNaN(suffix)) {
			msg.channel.sendMessage("Please define an amount of messages for me to delete!");
			return;
		}
		if (suffix > 100) {
			msg.channel.sendMessage("The maximum is 100.");
			return;
		}
		msg.channel.fetchMessages({ limit: 100 }).then(messages => {
				var todo = parseInt(suffix.split(" ")[0], 10);
				if (todo >= 100) todo = 99
				var delcount = 0;
				var messagestodelete = [];
				for (var i = 0; i < 100; i++) {
					if (todo <= 0) {
						if (messagestodelete.length === 1) {
							msg.delete(messagestodelete[0]);
						}
						else {
							msg.channel.bulkDelete(messagestodelete);
						}
						msg.channel.sendMessage("Deleted " + delcount + " messages.");
						return;
					}
					else {
						messagestodelete.push(messages.array()[i]);
						delcount++;
						todo--;
					}
				}
		});
	}
}; //works  //works basic check

Commands.osu = {
	name: "osu",
	level: 0,
	usage: "<sig/user/best/recent> [username] [hex color for sig]",
	fn: function(bot, msg, suffix) {
		if (!suffix) return;
		var username;
		msg.author.suffix = suffix
		userdb.userExists(msg.author, function(results, suffix) {
			if (results[0].osuUsername != "" && !suffix.trim()) {
				username = results[0].osuUsername;
			}
			else {
				if (suffix.split(" ")[0] === "standard" || suffix.split(" ")[0] === "taiko" || suffix.split(" ")[0] === "mania" || suffix.split(" ")[0] === "ctb") {
					username = suffix.trim().split(" ").slice(1).toString().replace(/,/g, "_")
				}
				else {
					username = suffix.trim().split(" ").slice(2).toString()
					if (username === "" || username === " " && results[0].osuUsername != "") {
						username = results[0].osuUsername;
					}
				}
			}
				if (suffix.split(" ")[0] === "sig") {
					var color = "ff66aa",
					suffix = suffix.split(" ");
					if (suffix.length <= 1) {
						msg.channel.sendMessage("You didn't specify a username or hex color! Usage: `!signature <username> <hexcolor>`");
						return;
					}
					else if (suffix.length === 2) {
						msg.channel.sendMessage("Invalid usage! Usage: `!signature <username> <hexcolor>`");
						return;
					}
					else if (suffix.length >= 4) {
						msg.channel.sendMessage("Invalid usage! Usage: `!signature <username> <hexcolor>`");
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
							msg.channel.sendMessage("Here's your osu signature " + username + "!");
							msg.channel.sendFile(body, 'sig.png', '', '');
						})
				}
				else if (suffix.split(" ")[0] == "standard" || suffix.split(" ")[0] == "mania" || suffix.split(" ")[0] == "taiko" || suffix.split(" ")[0] == "ctb") {
          switch (suffix.split(" ")[0]) {
            case "standard":
              osu.setMode(0);
              modeText = "osu!";
              break;
            case "taiko":
              osu.setMode(1);
              modeText = "Taiko";
              break;
            case "ctb":
              osu.setMode(2);
              modeText = "CtB";
              break;
            case "mania":
              osu.setMode(3);
              modeText = "osu!mania";
              break;
          }
					osu.getUser(username, function(err, data) {
						if (!data) {
							msg.channel.sendMessage(":warning: User not found")
							return;
						}
						var avatar = data.user_id;
						var data1 = new Discord.RichEmbed(data1);
						var totalPoints = (parseInt(data.count300) * 300) + (parseInt(data.count100) * 100) + (parseInt(data.count50) * 50)
						var totalHits = (parseInt(data.count300) + parseInt(data.count100) + parseInt(data.count50))
						var accuracy = (((totalPoints / totalHits) / 300) * 100).toFixed(2)
						var levelWhole = data.level.split(".")[0]
						var levelPercent = data.level.split(".")[1].substring(0,2)
						var url = `https://osu.ppy.sh/pages/include/profile-general.php?u=${data.user_id}`
						request(url, function (error, response, body) {
						  if (!error && response.statusCode == 200) {
						    //console.log(body.replace(/<(?:.|\n)*?>/gm, '')) // Show the HTML for the Google homepage.
								body = body.replace(/<(?:.|\n)*?>/gm, '')
								var playtime = body.split("Play Time")[1].substring(2).split("hours")[0]
								data1.setTitle(`${modeText} stats for ${data.username}:`)
								data1.setURL(`http://osu.ppy.sh/u/${data.user_id}`)
								data1.setThumbnail(`http://a.ppy.sh/${avatar}_1.png`)
								data1.addField(`General Stats`, `\n**Accuracy**: ${data.accuracy.toString().substring(0, data.accuracy.toString().split(".")[0].length + 3)}%\n**Play Count**: ${data.playcount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n**Play Time**: ${playtime} hours\n**Total Score**: ${data.total_score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n**Ranked Score**: ${data.ranked_score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n**Level**: ${levelWhole}(${levelPercent}%)`, true)
								data1.addField(`Ranking`, `${data.pp_raw.toString().split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")}pp\n#${data.pp_rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (#${data.pp_country_rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} :flag_${data.country.toLowerCase()}:)\n${data.count_rank_ss.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} SS\n${data.count_rank_s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} S\n${data.count_rank_a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} A`, true)
								data1.addField(`Hits`, `**300s**: ${data.count300.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n**100s**: ${data.count100.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n**50s**: ${data.count50.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, true)
								msg.channel.sendEmbed(data1)
						  }
						})
					});
				}
				else if (suffix.split(" ")[0] === "best") {
          switch (suffix.split(" ")[1]) {
            case "standard":
              osu.setMode(0);
              modeText = "osu!";
              break;
            case "taiko":
              osu.setMode(1);
              modeText = "Taiko";
              break;
            case "ctb":
              osu.setMode(2);
              modeText = "CtB";
              break;
            case "mania":
              osu.setMode(3);
              modeText = "osu!mania";
              break;
          }
					osu.getUserBest(username, function(err, data) {
						if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) {
							msg.channel.sendMessage(":warning: User not found or user doesn't have 5 plays")
							return;
						}
						osu.getUser(username, function(err, data1) {
							var msgArray = [];
							msgArray.push(`Top 5 ${modeText} scores for: **${data1.username}**:`);
							msgArray.push("----------------------------------");
							osu.getBeatmap(data[0].beatmap_id, function(err, map1) {
								osu.getUserScore(data[0].beatmap_id, data[0].user_id, function(err, mod1) {
									var mods1 = getMods(mod1.enabled_mods);
									msgArray.push("**1.** *" + map1.title + "* *(☆" + map1.difficultyrating.toString().substring(0, map1.difficultyrating.toString().split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[0].pp.toString().split(".")[0]) + " **| Score:** " + data[0].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[0].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[0].countmiss + " ** | Mods:** " + mods1);
									osu.getBeatmap(data[1].beatmap_id, function(err, map2) {
										osu.getUserScore(data[1].beatmap_id, data[1].user_id, function(err, mod2) {
											var mods2 = getMods(mod2.enabled_mods);
											msgArray.push("**2.** *" + map2.title + "* *(☆" + map2.difficultyrating.toString().substring(0, map2.difficultyrating.toString().split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[1].pp.toString().split(".")[0]) + " **| Score:** " + data[1].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[1].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[1].countmiss + " **| Mods:** " + mods2);
											osu.getBeatmap(data[2].beatmap_id, function(err, map3) {
												osu.getUserScore(data[2].beatmap_id, data[2].user_id, function(err, mod3) {
													var mods3 = getMods(mod3.enabled_mods);
													msgArray.push("**3.** *" + map3.title + "* *(☆" + map3.difficultyrating.toString().substring(0, map3.difficultyrating.toString().split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[2].pp.toString().split(".")[0]) + " **| Score:** " + data[2].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[2].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[2].countmiss + " **| Mods:** " + mods3);
													osu.getBeatmap(data[3].beatmap_id, function(err, map4) {
														osu.getUserScore(data[3].beatmap_id, data[3].user_id, function(err, mod4) {
															var mods4 = getMods(mod4.enabled_mods);
															msgArray.push("**4.** *" + map4.title + "* *(☆" + map4.difficultyrating.toString().substring(0, map4.difficultyrating.toString().split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[3].pp.toString().split(".")[0]) + " **| Score:** " + data[3].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[3].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[3].countmiss + " **| Mods:** " + mods4);
															osu.getBeatmap(data[4].beatmap_id, function(err, map5) {
																osu.getUserScore(data[4].beatmap_id, data[4].user_id, function(err, mod5) {
																	var mods5 = getMods(mod5.enabled_mods);
																	msgArray.push("**5.** *" + map5.title + "* *(☆" + map5.difficultyrating.toString().substring(0, map5.difficultyrating.toString().split(".")[0].length + 3) + ")*: **PP:** " + Math.round(data[4].pp.toString().split(".")[0]) + " **| Score:** " + data[4].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[4].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[4].countmiss + " **| Mods:** " + mods5);
																	msg.channel.sendMessage(msgArray);
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
						})
					});
				}
				else if (suffix.split(" ")[0] === "recent") {
					if (suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
						username = suffix.substring(7);
					}
					osu.getUserRecent(username, function(err, data) {
						if (!data || !data[0]) {
							msg.channel.sendMessage(":warning: User not found or no recent plays")
							return;
						}
						var msgArray = [];
						msgArray.push("5 most recent plays for: **" + username + "**:");
						msgArray.push("----------------------------------");
						osu.getBeatmap(data[0].beatmap_id, function(err, map1) {
							if (err) console.error(err);
							msgArray.push("**1.** *" + map1.title + "* *(☆" + map1.difficultyrating.toString().substring(0, map1.difficultyrating.toString().split(".")[0].length + 3) + ")*: **Score:** " + data[0].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[0].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[0].countmiss);
							if (!data[1]) {
								msg.channel.sendMessage(msgArray);
								return;
							}
							osu.getBeatmap(data[1].beatmap_id, function(err, map2) {
								if (err) console.error(err);
								msgArray.push("**2.** *" + map2.title + "* *(☆" + map2.difficultyrating.toString().substring(0, map2.difficultyrating.toString().split(".")[0].length + 3) + ")*: **Score:** " + data[1].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[1].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[1].countmiss);
								if (!data[2]) {
									msg.channel.sendMessage(msgArray);
									return;
								}
								osu.getBeatmap(data[2].beatmap_id, function(err, map3) {
									if (err) console.error(err);
									msgArray.push("**3.** *" + map3.title + "* *(☆" + map3.difficultyrating.toString().substring(0, map3.difficultyrating.toString().split(".")[0].length + 3) + ")*: **Score:** " + data[2].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[2].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[2].countmiss);
									if (!data[3]) {
										msg.channel.sendMessage(msgArray);
										return;
									}
									osu.getBeatmap(data[3].beatmap_id, function(err, map4) {
										if (err) console.error(err);
										msgArray.push("**4.** *" + map4.title + "* *(☆" + map4.difficultyrating.toString().substring(0, map4.difficultyrating.toString().split(".")[0].length + 3) + ")*: **Score:** " + data[3].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[3].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[3].countmiss);
										if (!data[4]) {
											msg.channel.sendMessage( msgArray);
											return;
										}
										osu.getBeatmap(data[4].beatmap_id, function(err, map5) {
											if (err) console.error(err);
											msgArray.push("**5.** *" + map5.title + "* *(☆" + map5.difficultyrating.toString().substring(0, map5.difficultyrating.toString().split(".")[0].length + 3) + ")*: **Score:** " + data[4].score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Max Combo:** " + data[4].maxcombo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " **| Misses:** " + data[4].countmiss);
											msg.channel.sendMessage(msgArray);
										});
									});
								});
							});
						});
					});

				}
				else {}
		});
	}
}; //works //works basic check

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
	}
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
	if (returnString === "") {
		returnString = "None"
	}
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

/*
Commands.ripple = {
	name: "ripple",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			msg.channel.sendMessage("You didn't specify a username!")
			return
		}
		ripple.getUser(suffix.trim(), 0, function(err, data){
			var aaa = data.count300;
			var bbb = data.count100;
			var ccc = data.count50;
			var ddd = parseInt(aaa, 10) + parseInt(bbb, 10) + parseInt(ccc, 10);
			var eee = ddd.toString();
			var avatar = data.user_id;
				var msgArray = [];
				msgArray.push(`osu! stats for: **${data.username}**:`);
				msgArray.push("----------------------------------");
				msgArray.push("**Profile Link**: <https://ripple.moe/index.php?u=" + data.user_id + ">");
				msgArray.push("**Play Count**: " + data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Ranked Score**: " + data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Total Score**: " + data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Level**: " + data.level.substring(0, data.level.split(".")[0].length + 3));
				msgArray.push("**PP**: " + data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Rank**: #" + data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " | **Accuracy**: " + data.accuracy.substring(0, data.accuracy.split(".")[0].length + 3) + "%");
				msgArray.push("");
				msg.channel.sendMessage(msgArray);
				msg.channel.sendFile("https://a.ripple.moe/" + data.user_id, 'avatar.jpg', '');
			})
	}
}
*/

Commands.removerole = {
	name: "addrole",
	usage: "<wtf is this>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			msg.channel.sendMessage("You don't have the permission `Manage Roles`! You must have this permission to use `!addrole`");
			return;
		}
		if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			msg.channel.sendMessage("I don't have the permission `Manage Roles`! I must have this permission for `!addrole` to function correctly!");
			return;
		}

		if (!suffix) {
			msg.channel.sendMessage("You didn't tell me what role to delete!");
			return;
		}
		if (msg.mentions.users.array().length != 1) {
			msg.channel.sendMessage("You must mention exactly 1 user!");
			return;
		}
		msg.mentions.users.array().map((user) => {
			if (suffix.split(" ")[0] === "<@" + user.id + ">") {
				suffix = suffix.replace("<@" + user.id + ">", "").substring(1);
			}
			else {
				suffix = suffix.replace("<@" + user.id + ">", "").trim();
			}

			role = msg.guild.roles.find("name", suffix);
			if (!role) {
				msg.channel.sendMessage("Role not found.");
				return;
			}
			var hasrole = msg.guild.member(user).roles.find("id", role.id)
			if (!hasrole) {
				msg.channel.sendMessage(user + " doesn't have that role!");
				return;
			}
			msg.guild.member(user).removeRole(role)
			msg.channel.sendMessage("Successfully removed `" + user.username + "` from `" + role.name + "` !");
		})
	}
} //works

Commands.roll = {
	"name": "roll",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			var randomint = Math.floor((Math.random() * 100) + 1)
			msg.channel.sendMessage(`**${msg.author.username}** rolled **${randomint}**!`)
		}
		else {
			if (isNaN(suffix)) {
				var randomint = Math.floor((Math.random() * 100) + 1)
				msg.channel.sendMessage(`**${msg.author.username}** rolled **${randomint}**!`)
			}
			else {
				var randomint = Math.floor((Math.random() * suffix) + 1)
				var numbtosend = parseInt(randomint)
				if (numbtosend <= 0) {
					numbtosend = 1
				}
				if (numbtosend > 999999999999999999) {
					numbtosend = 999999999999999999
				}
				msg.channel.sendMessage(`**${msg.author.username}** rolled **${numbtosend}**!`)
			}
		}
	}
}; //works //works

Commands["server-info"] = {
	name: "server-info",
	help: "I'll tell you some information about the server you're currently in.",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.guild) {
			var data = new Discord.RichEmbed(data);
			data.setTitle(`${msg.guild.name} (${msg.guild.id})`)
			data.addField("Members", msg.guild.members.array().length, true)
			data.addField("Roles", msg.guild.roles.array().length, true)
			data.addField("Region", msg.guild.region, true)
			data.addField("Server Created", `${msg.guild.createdAt.getUTCDate()}/${msg.guild.createdAt.getUTCMonth()}/${msg.guild.createdAt.getUTCFullYear()}`, true)
			data.addField("Server Owner", `${msg.guild.owner.user.username}#${msg.guild.owner.user.discriminator}`, true)
 			data.addField("Channels", msg.guild.channels.array().length, true);
			if (msg.guild.iconURL != null) data.setThumbnail(msg.guild.iconURL);
			if (msg.guild.emojis.array().lenght === 0) data.addField("Server Emojis", "None", true);
			else {
				var emojis = []
				var emojis2 = []
				msg.guild.emojis.array().map(function(emoje) {
					if (emojis.join(" ").length <= 950) emojis.push(`${emoje}`);
					else (emojis2.push(`${emoje}`))
				})
				console.log(emojis.join(" ").length)
				data.addField("Server Emojis", emojis.join(" "), true);
				if (emojis2.length > 0) data.addField("​", emojis2.join(" "));
			}
			msg.channel.sendEmbed(data)
		}
	}
};

Commands.setcoloruser = {
	name: "setcoloruser",
	help: "This changes if the channel allows NSFW commands.",
	usage: "<on | off>",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			msg.channel.sendMessage("You must have the permission **Manage Roles** to use this command!");
			return;
		}
		suffix = suffix.trim().toLowerCase()
		if (suffix === "on" || suffix === "off") {
			serverdb.updateColorUser(msg.guild.id, suffix)
			if (suffix === "on") {
				msg.channel.sendMessage("Anyone can now change their color with **!coloruser** on this server.")
			}
			else {
				msg.channel.sendMessage("Only members with **Manage Roles** can change their color with `!coloruser` now.");
			}
		}
	}
};  //works //works basic check

Commands.setgame = {
	name: "setgame",
	help: "This will change my current status to something else.",
	usage: "<online / away> [playing status]",
	level: 6,
	fn: function(bot, msg, suffix) {
		var game = ""
		var stream = ""
		for (var i = 0; i < suffix.split(" ").length; i++) {
			if (suffix.split(" ")[i].indexOf("http://www.twitch") > -1 || suffix.split(" ")[i].indexOf("https://twitch") > -1 || suffix.split(" ")[i].indexOf("http://www.twitch") > -1 || suffix.split(" ")[i].indexOf("https://www.twitch") > -1) {
				stream = suffix.split(" ")[i]
			}
			else {
				game = game + " " + suffix.split(" ")[i]
			}
		}
		game = game.toString().replace(",", " ").trim()
		console.log(game)
		console.log(stream)
		if (stream === "") {
			bot.user.setGame(game)
			msg.channel.sendMessage(`Set game to **${game}**`)
		}
		else {
			bot.user.setGame(game, stream)
			msg.channel.sendMessage(`Set game to **${game}** and stream to **${stream}**`)
		}
	}
};

Commands.setlevel = {
	name: "setlevel",
	help: "This changes the permission level of an user.",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (isNaN(suffix[0])) {
			msg.channel.sendMessage("your first parameter is not a number!");
			return;
		}
		if (suffix[0] > 3) {
			msg.channel.sendMessage("Setting a level higher than 3 is not allowed.");
			return;
		}
		if (msg.mentions.users.array().length === 0) {
			msg.channel.sendMessage("please mention the user(s) you want to set the permission level of.");
			return;
		}
		permissions.checkPermissions(msg.author.id, msg.guild.id, function(level) {
			if (msg.guild.ownerID === msg.author.id) {
				level = 4
			}
			if (suffix[0] > level) {
				msg.channel.sendMessage("you can't set a user's permissions higher than your own!");
				return;
			}
		})
		msg.mentions.users.array().map(function(user) {
			permissions.setPermissions(msg.author.id, msg.guild.id, suffix[0])
			msg.channel.sendMessage("The permission levels have been set successfully!");
		})
	}
} //works //works basic check

Commands.setnsfw = {
	name: "setnsfw",
	help: "This changes if the channel allows NSFW commands.",
	usage: "<on | off>",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		suffix = suffix.trim().toLowerCase()
		serverdb.getServerData(msg.guild.id, function(results) {
			if (suffix === "on") {
				for (var i = 0; i < results[0].nsfwChannels.length; i++) {
					if (results[0].nsfwChannels[i] === msg.channel.id) {
						msg.channel.sendMessage(`NSFW commands are now allowed in ${msg.channel}`);
						return
					}
				}
				serverdb.updateNsfw(msg.guild.id, msg.channel.id, "push")
				msg.channel.sendMessage(`NSFW commands are now allowed in ${msg.channel}`);
			}
			else if (suffix === "off") {
				serverdb.updateNsfw(msg.guild.id, msg.channel.id, "pull")
				msg.channel.sendMessage(`NSFW commands are now disallowed in ${msg.channel}`);
			}
		})
	}
}; //works //works basic check

Commands.setstafflog = {
	"name": "setstafflog",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		var channeltocheck = suffix.split(" ")[0].replace("<", "").replace(">", "").replace("#", "");
		var stafflog = msg.guild.channels.find("id", channeltocheck);
		if (stafflog) {
			serverdb.setStaffLog(msg.channel.guild.id, stafflog.id)
			msg.channel.sendMessage(stafflog + " has been set as the Staff Log channel.");
		}
		else {
			msg.channel.sendMessage("Channel not found.");
		}
	}
}; //works //works basic check

Commands.setstatus = {
	name: "setstatus",
	help: "This will change my current status to something else.",
	usage: "<online / away> [playing status]",
	level: 6,
	fn: function(bot, msg, suffix) {
		var status = suffix.trim().toLowerCase()
		if (status === "online" || status === "green") {
			bot.user.setStatus("online")
			msg.channel.sendMessage(`Set status to 'Online'`)
		}
		else if (status === "idle" || status === "yellow" || status === "away") {
			bot.user.setStatus("idle")
			msg.channel.sendMessage(`Set status to 'Idle'`)
		}
		else if (status === "invisible" || status === "offline" || status === "gray" || status === "black") {
			bot.user.setStatus("invisible")
			msg.channel.sendMessage(`Set status to 'Invisible'`)
		}
		else if (status === "dnd" || status === "do not disturb" || status === "red") {
			bot.user.setStatus("dnd")
			msg.channel.sendMessage(`Set status to 'DnD'`)
		}
	}
};

Commands.status = {
	name: "status",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			if (msg.mentions.users.array().length > 0) {
				if (msg.mentions.users.array()[0].id != msg.author.id) {
					msg.channel.sendMessage(`You do not have permission to check another users status.`);
					return;
				}
			}
			else {
				permissions.checkPermissions(msg.author.id, msg.guild.id, function(results) {
					var array = [];
					array.push(`Current status for **${msg.author.username}**`);
					array.push(`Punish level: ${results.punishLevel}`);
					array.push(`Reason for latest punishment: ${results.punishReason[results.punishReason.length - 1]}`);
					msg.channel.sendMessage(array);
				});
				return;
			}
		}
		if (msg.mentions.users.array().length > 1) {
			msg.channel.sendMessage(`You must mention exactly 1 user!`)
			return;
		}
		else if (msg.mentions.users.array().length === 1) {
			user = msg.mentions.users.array()[0]
		}
		else if (msg.mentions.users.array().length === 0) {
			user = msg.author
		}
		permissions.checkPermissions(user.id, msg.guild.id, function(results) {
			var array = [];
			array.push(`Current status for **${user.username}**`);
			array.push(`Punish level: ${results.punishLevel}`);
			array.push(`Reason for latest punishment: ${results.punishReason[results.punishReason.length - 1]}`);
			msg.channel.sendMessage(array);
		});
	}
}; //works //works basic check
/*
Commands.track = {
	"name": "track",
	level: 4,
	fn: function(bot, msg, suffix) {
		switch (suffix.split(" ")[0].toLowerCase()) {
			case "osu":
				osu.setMode(0);
				break;
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

		var mode = String(osu.mode).replace('0', 'osu!').replace('1', 'Taiko').replace('2', 'Catch The Beat').replace('3', 'Mania');

		if (!suffix.split(" ")[1]) {
			var currentlyTracked = []
			osudb.getosuPlayers(null, msg.channel.id, null, function (results) {
				for (var i = 0; i < results.length; i++) {
					currentlyTracked.push(results[i].username)
				}
				currentlyTracked = currentlyTracked.join(", ")
				if (currentlyTracked === "" || currentlyTracked === " ") {
					msg.channel.sendMessage(`Not currently tracking any ${mode} players in ${msg.channel}`);
					return;
				}
				else {
					msg.channel.sendMessage(`Currently tracking the following ${mode} players in ${msg.channel}: ${currentlyTracked}`);
					return;
				}
			})
		}
		else {
			if (suffix.split(" ")[0] === "osu" || suffix.split(" ")[0] === "ctb") {
				suffix = suffix.substring(4);
			}
			else if (suffix.split(" ")[0] === "taiko" || suffix.split(" ")[0] === "mania") {
				suffix = suffix.substring(6);
			}
			osu.getUser(suffix, function(err, data) {
				if (err) console.error(err);
				if (!data) {
					msg.channel.sendMessage(`User not found.`);
					return;
				}
				if (data) {
					osudb.getosuPlayers(data.username, null, osu.mode, function (results) {
						if (results.length < 1) {
							var temp = {
								username: data.username,
								rank: data.pp_rank,
								country: data.country,
								countryrank: data.pp_country_rank,
								pp: data.pp_raw,
								channel: [msg.channel.id],
								mode: osu.mode,
								accuracy: data.accuracy,
								recent: "",
								inactivity: 0
							}
							osudb.createosuPlayer(temp, function (err) {
								if (err) {
									msg.channel.sendMessage(`An error occured, please try again later.`);
									return;
								}
								else {
									msg.channel.sendMessage(`Now tracking **${mode}** gains for **${data.username}** in ${msg.channel}`);
								}
							})
						}
						else if (results.length === 1) {
							if (results[0].channel.indexOf(msg.channel.id) > -1) {
								if (results[0].channel.length < 2) {
									osudb.removeosuPlayer(null, null, null, results[0]._id)
								}
								else {
									osudb.updateosuPlayerChannels(msg.channel.id.toString(), results[0]._id, true)
								}
								msg.channel.sendMessage(`No longer tracking **${mode}** gains for **${data.username}** in ${msg.channel}`);
							}
							else if (results[0].channel.indexOf(msg.channel.id) < 0) {
								osudb.updateosuPlayerChannels(msg.channel.id.toString(), results[0]._id, false)
								msg.channel.sendMessage(`Now tracking **${mode}** gains for **${data.username}** in ${msg.channel}`);
							}
						}
					})
				}
			});
		}
	}
};

Commands.openrec = {
	name: "openrec",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			msg.channel.sendMessage("You didn't specify an openrec name!");
			return;
		}
		if (suffix.split(" ").length > 1) {
			msg.channel.sendMessage("Names of openrec streamers don't contain spaces!");
			return;
		}
		if (suffix.indexOf("openrec.tv") > -1) {
			msg.channel.sendMessage("Please supply a twitch name, not a twitch url.");
			return;
		}
		var openrecuser = suffix.trim().toLowerCase()
		var options = {
			url: 'https://www.openrec.tv/live/' + openrecuser
		};
		var options1 = {
			url: 'https://www.openrec.tv/user/' + openrecuser
		};
		request(options, function(error, response, data) {
			request(options1, function(error1, response1, data1){
				openrecdb.openrecUserExists(openrecuser, function(results) {
					if (error || error1) {
						return
					}
					if (data1.indexOf("404 NOT FOUND") > -1) {
						msg.channel.sendMessage("User not found.")
						return
					}
					else {
							if (results.length < 1) {
								openrecdb.newopenrecUser(openrecuser, msg.channel.id)
								msg.channel.sendMessage(`I will now notify you in ${msg.channel} when ${openrecuser} goes live.`)
							}
							else if (results[0].channels.indexOf(msg.channel.id) > -1) {
								openrecdb.updateopenrecUser(openrecuser, msg.channel.id, "pull")
								msg.channel.sendMessage(`I will no longer notify you when ${openrecuser} goes live in ${msg.channel}`);
							}
							else if (results[0].channels.indexOf(msg.channel.id) < 0) {
								openrecdb.updateopenrecUser(openrecuser, msg.channel.id, "push")
								msg.channel.sendMessage(`I will now notify you in ${msg.channel} when ${openrecuser} goes live.`);
							}
					}
				})
			})
		})
	}
}; //works basic check
*/

Commands.twitchalert = {
	name: "twitchalert",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			msg.channel.sendMessage("You didn't specify a twitch name!");
			return;
		}
		if (suffix.split(" ")[0] === "list") {
			var array = []
			var i = 1
			if (msg.mentions.channels.array().length === 1) {
				var channel = msg.mentions.channels.array()[0]
			}
			else {
				var channel = msg.channel
			}
			array.push(`Here is a list of twitch streamers that i announce to #${channel.name}:\n`)
			twitchdb.findAll(results => {
				results.forEach(data => {
					if (data.channels.indexOf(channel.id) > -1) {
						array.push(`**${i}**. ${data.name}`)
						console.log(array)
						i++
					}
				})
				if (array.length > 1) {
					msg.author.sendMessage(array)
					return;
				}
				else {
					msg.channel.sendMessage(`I'm not currently announcing any twitch streamers to ${channel}`)
					return;
				}
			})
			return;
		}
		if (suffix.split(" ").length > 1) {
			msg.channel.sendMessage("Names of twitch streamers don't contain spaces!");
			return;
		}
		if (suffix.indexOf("twitch.tv") > -1) {
			suffix = suffix.replace("https://www.twitch.tv/", "").replace("http://www.twitch.tv/", "")
		}
		var twitchuser = suffix.trim().toLowerCase()
		var exists;
		var options = {
			  url: 'https://api.twitch.tv/kraken/streams/' + twitchuser,
			  headers: {
				'Client-ID': ConfigFile.twitch_client_id
			  }
			};
			request(options, function(error, response, data) {
				if (!error && response.statusCode == 200) {
					twitchdb.twitchUserExists(twitchuser, function(results) {
						if (results.length < 1) {
							twitchdb.newTwitchUser(twitchuser, msg.channel.id)
							msg.channel.sendMessage(`I will now notify you in ${msg.channel} when ${twitchuser} goes live.`);
						}
						else if (results[0].channels.indexOf(msg.channel.id) > -1) {
							twitchdb.updateTwitchUser(twitchuser, msg.channel.id, "pull")
							msg.channel.sendMessage(`I will no longer notify you when ${twitchuser} goes live in ${msg.channel}`);
						}
						else if (results[0].channels.indexOf(msg.channel.id) < 0) {
							twitchdb.updateTwitchUser(twitchuser, msg.channel.id, "push")
							msg.channel.sendMessage(`I will now notify you in ${msg.channel} when ${twitchuser} goes live.`);
						}
					})
				}
				else {
					msg.channel.sendMessage("That name doesn't exist.");
					return;
				}
			});
	}
}; //works //works basic check

Commands.unignore = {
	name: "unignore",
	help: "This changes if the channel allows commands.",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		serverdb.getServerData(msg.guild.id, function(results) {
			if (!suffix) {
				var channel = bot.channels.find("id", msg.channel.id)
			}
			else {
				var channel = bot.channels.find("id", msg.mentions.channels.array()[0].id)
			}
			for (var i = 0; i < results[0].ignoredChannels.length; i++) {
				if (results[0].ignoredChannels[i] === channel.id) {
					serverdb.updateIgnoreChannels(msg.guild.id, channel.id, "pull")
					msg.channel.sendMessage(`${channel} is no longer being ignored!`)
					return;
				}
			}
			msg.channel.sendMessage(`${channel} wasnt being ignored in the first place!`)
		})
	}
}; //works basic check

Commands.unmute = {
	name: "unmute",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.guild) return;
		if (bot.user.id === msg.author.id) return;
		if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			msg.channel.sendMessage("I don't have the permission `Manage Roles`! I must have this permission for `!unmute` to function correctly!");
			return;
		}
		if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
			msg.channel.sendMessage("You don't have the permission `Manage Roles`! You must have this permission to use `!unmute`");
			return;
		}
		if (msg.mentions.users.array().length > 1) {
			msg.channel.sendMessage("You can only unmute 1 person at a time.");
			return;
		}
		if (msg.mentions.users.array().length === 0) {
			msg.channel.sendMessage("You didn't mention a user to unmute!");
			return;
		}
		msg.mentions.users.array().map((user) => {
			permissions.checkPermissions(user.id, msg.guild.id, (results) => {
				for (var i = 0; i < msg.channel.guild.channels.array().length; i++) {
					var channame = msg.channel.guild.channels.array()[i];
					var channelaccess = channame.permissionsFor(user).serialize()
					if (channelaccess.READ_MESSAGES === true && channame.type === "text") {
						for (var j = 0; j < channame.permissionOverwrites.array().length; j++) {
							if (channame.permissionOverwrites.array()[j].id === user.id) {
								var allowData = channame.permissionOverwrites.array()[j].allowData
								var denyData = channame.permissionOverwrites.array()[j].denyData
								if ((denyData & 2048) == 2048) {
									if (results.sendMessagesTrue.indexOf(channame.id) > -1) {
										denyData = denyData - 2048
										allowData = allowData + 2048
									}
									else if (results.sendMessagesFalse.indexOf(channame.id) > -1) {}
									else {
										denyData = denyData - 2048
									}
								}
								channame.overwritePermissions(user, {}, allowData, denyData)
								break;
							}
						}
					}
					else if (channelaccess.SPEAK === true && channame.type === "voice") {
						for (var j = 0; j < channame.permissionOverwrites.array().length; j++) {
							if (channame.permissionOverwrites.array()[j].id === user.id) {
								var allowData = channame.permissionOverwrites.array()[j].allowData
								var denyData = channame.permissionOverwrites.array()[j].denyData
								if ((denyData & 2097152) == 2097152) {
									if (results.sendMessagesTrue.indexOf(channame.id) > -1) {
										denyData = denyData - 2097152
										allowData = allowData + 2097152
									}
									else if (results.sendMessagesFalse.indexOf(channame.id) > -1) {}
									else {
										denyData = denyData - 2097152
									}
								}
								channame.overwritePermissions(user, {}, allowData, denyData)
								break;
							}
						}
					}
				}
			})
				permissions.setMuted(user.id, msg.guild.id, false, msg.createdTimestamp, 0, [], [])
				msg.channel.sendMessage(`${user} has been unmuted.`);
		})
	}
}; //works //works basic check

Commands.whois = {
	name: "whois",
	help: "I'll get some information about the user you've mentioned.",
	level: 0,
	fn: function(bot, msg, suffix) {
		var UserLevel = 0;
		if (!msg.channel.guild) return;
		if (msg.mentions.users.array().length === 0) {
			var user = msg.author;
			if (user) {
				permissions.checkPermissions(msg.author.id, msg.channel.guild.id, function (level) {
					UserLevel = level.level;
					var msgArray = [];
					if (user.avatarURL === null) {
						msgArray.push("Requested user: `" + user.username + "`");
						msgArray.push("ID: `" + user.id + "`");
						msgArray.push("Status: `" + user.status + "`");
						msgArray.push("Current access level: " + UserLevel);
						msg.channel.sendMessage(msgArray);
						return;
					}
					else {
						msgArray.push("Requested user: `" + user.username + "`");
						msgArray.push("ID: `" + user.id + "`");
						msgArray.push("Status: `" + user.status + "`");
						msgArray.push("Avatar: " + user.avatarURL);
						msgArray.push("Current access level: " + UserLevel);
						msg.channel.sendMessage(msgArray);
					}
				});
				return;
			}
			else {
				msg.channel.sendMessage("Please mention the user that you want to get information of.");
				return;
			}
		}
		msg.mentions.users.map(function(user) {
			permissions.checkPermissions(msg.author.id, msg.channel.guild.id, function (level) {
				UserLevel = level.level;
				var msgArray = [];
				if (user.avatarURL === null) {
					msgArray.push("Requested user: `" + user.username + "`");
					msgArray.push("ID: `" + user.id + "`");
					msgArray.push("Status: `" + user.status + "`");
					msgArray.push("Current access level: " + UserLevel);
					msg.channel.sendMessage(msgArray);
					return;
				}
				else {
					msgArray.push("Requested user: `" + user.username + "`");
					msgArray.push("ID: `" + user.id + "`");
					msgArray.push("Status: `" + user.status + "`");
					msgArray.push("Avatar: " + user.avatarURL);
					msgArray.push("Current access level: " + UserLevel);
					msg.channel.sendMessage(msgArray);
				}
			});
		});
	}
}; //works //works basic check

Commands.yandere = {
	name: "yandere",
	help: "You're looking at it right now.",
	level: 0,
	nsfw: true,
	fn: function(bot, msg, suffix) {
		unirest.post("https://yande.re/post/index.json?limit=500&tags=" + suffix)
			.end(function(result) {
				if (result.body.length < 1) {
					msg.channel.sendMessage(`Sorry, nothing found.`);
					return;
				}
				if (suffix.length < 1) {
					suffix = `<no tags specified>`;
				}
				var suffix1 = suffix.toString().toLowerCase();
				if ((suffix1.indexOf("gaping") > -1 || suffix1.indexOf("gape") > -1) || suffix1.indexOf("prolapse") > -1 || suffix1.indexOf("toddlercon") > -1) {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var kona = result.body[count].file_url;
					var kona1 = result.body[count1].file_url;
					var kona2 = result.body[count2].file_url;
					msg.channel.sendMessage("You've searched for `" + suffix + "`. Sending images in a pm...");
					user.sendFile(kona, '', '');
					user.sendFile(kona1, '', '');
					user.sendFile(kona2, '', '');
				}
				else {
					var count = Math.floor((Math.random() * result.body.length));
					var count1 = Math.floor((Math.random() * result.body.length));
					var count2 = Math.floor((Math.random() * result.body.length));
					var yandere = result.body[count].file_url;
					var yandere1 = result.body[count1].file_url;
					var yandere2 = result.body[count2].file_url;
					if (result.body.length <= 2) {
						msg.channel.sendMessage("There were less than 3 results for `" + suffix + "` :(");
						if (result.body.length === 1) {
							yandere = result.body[0].file_url;
							msg.channel.sendFile(yandere, '', '');
							return;
						}
						if (result.body.length === 2) {
							yandere = result.body[0].file_url;
							yandere1 = result.body[1].file_url;
							msg.channel.sendFile(yandere, '', '');
							msg.channel.sendFile(yandere1, '', '');
							return;
						}
					}
					msg.channel.sendMessage("You've searched for ` " + suffix + " ` . There are `" + result.body.length + "` results that contain those tags.\nSending `3` random images of those `" + result.body.length + "` results.");
					msg.channel.sendFile(yandere, '', '');
					msg.channel.sendFile(yandere1, '', '');
					msg.channel.sendFile(yandere2, '', '');
				}
			});
	}
}; // works //works basic check

exports.Commands = Commands;
