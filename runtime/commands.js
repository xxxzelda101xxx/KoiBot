var ConfigFile = require("../config.json"),
  Logger = require("./logger.js").Logger,
  Permissions = require("./permissions.js"),
  imgDirectory = require("../config.json").image_folder,
  Giphy = require("./giphy.js"),
  Cleverbot = require('cleverbot-node'),
  cleverbot = new Cleverbot(),
  yt = require("./youtube_plugin"),
  youtube_plugin = new yt(),
  version = require("../package.json").version,
  unirest = require('unirest'),
  Debug = require("./debugging.js"),
  Defaulting = require("./serverdefaulting.js"),
  DJ = require("./djlogic.js"),
  aliases = require("./alias.json"),
  ignore = require("./ignoring.js");
  osuapi = require('osu-api');
  request = require('request');
  xml2js = require('xml2js');
  ent = require('entities');
  fs = require('fs');
  exec = require('child_process').exec;
  http = require('http');
  email = ConfigFile.discord.email;
  confirmCodes = [];
  announceMessages = [];
  twitchStreamers = require("./streamers.json");
  customcommands = require("./ccommands.json");
  osutracker = require("./osutracker.json");
  taikotracker = require("./taikotracker.json");
  ctbtracker = require("./ctbtracker.json");
  maniatracker = require("./maniatracker.json");
  //gm = require('gm').subClass({imageMagick: true});
  mutemessage = [];
  unmutemessage = [];
  mentions = [];
  v = 0;
  z = 0;
  attempts = 0;
  lll = 0;
  jjj = 0;
  var Commands = [];
/*
Commands.play = {
  "name": "play",
  level: 5,
  fn: function(bot, msg, suffix) {
	if (bot.voiceConnections.length === 0) {
		bot.sendMessage(msg.channel, "I'm not in a voice channel!")
		return
	}
	for (var i = 0; i < bot.voiceConnections.length; ++i) {
		console.log(bot.voiceConnections[i].voiceChannel.server.id)
		if (bot.voiceConnections[i].voiceChannel.server.id === msg.channel.server.id) {
			var musicchannel = bot.voiceConnections[i]
			break;
		}
		else {
			bot.sendMessage(msg.channel, "I'm not in a voice channel!")
			return
		}
	}
	musicchannel.playFile('./z.mp3')
  }
}
		
Commands.leavevoice = {
  "name": "leavevoice",
  level: 5,
  fn: function(bot, msg, suffix) {
	delchannel = "";
	var s = suffix.split(" ")[0].toLowerCase();
	var sp = s.split("");
	for (var i = 0, l = 1 << s.length; i < l; i++) {
		for (var j = i, k = 0; j; j >>= 1, k++) {
			sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
		}
		var st = sp.join("");
		//console.log(st)
		delchannel = msg.channel.server.channels.get("name", st);
		if (delchannel) {
			delchannel = msg.channel.server.channels.get("name", st);
			break;
		}
	}
	if (delchannel) {
		if (bot.voiceConnections.length === 0) {
			bot.sendMessage(msg.channel, "I cannot leave a voice channel that I'm not in!")
			return
		}
		for (var i = 0; i < bot.voiceConnections.length; ++i) {
			if (i === bot.voiceConnections.length) {
				if (bot.voiceConnections[i].id === delchannel.id) {}
				else {
					bot.sendMessage(msg.channel, "I cannot leave a voice channel that I'm not in!")
					return
				}
			}
		}
		bot.leaveVoiceChannel(delchannel)
		bot.sendMessage(msg.channel, "Left **"+delchannel.name+"**")
	}
  }
}
		
Commands.joinvoice = {
  "name": "joinvoice",
  level: 5,
  fn: function(bot, msg, suffix) {
	delchannel = "";
	var s = suffix.split(" ")[0].toLowerCase();
	var sp = s.split("");
	for (var i = 0, l = 1 << s.length; i < l; i++) {
		for (var j = i, k = 0; j; j >>= 1, k++) {
			sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
		}
		var st = sp.join("");
		//console.log(st)
		delchannel = msg.channel.server.channels.get("name", st);
		if (delchannel) {
			delchannel = msg.channel.server.channels.get("name", st);
			break;
		}
	}
	
	if (delchannel) {
		for (var i = 0; i < bot.voiceConnections.length; ++i) {
			if (bot.voiceConnections[i].id === delchannel.id) {
				bot.sendMessage(msg.channel, "I've already joined **"+delchannel.name+"**!")
				return;
			}
		}
		bot.joinVoiceChannel(delchannel, function(err, connection) {
			if (err) {
				bot.sendMessage(msg.channel, err)
			}
			if (connection) {
				bot.sendMessage(msg.channel, "Joined **"+delchannel.name+"**")
				console.log(bot.voiceConnections[0])
				//bot.voiceConnections[0].playFile('./z.mp3')
			}
		})
	}
  }
}*/
		
Commands.track = {
  "name": "track",
  level: 1,
  fn: function(bot, msg, suffix) {
	if (suffix.split(" ")[0].toLowerCase() === "osu") {
		var APIKEY = ConfigFile.api_keys.osu_api_key;
		var osu = new osuapi.Api(APIKEY);
		if (!suffix.split(" ")[1]) {
			currentOsu = [];
			osutracker.items.forEach( function (osu) {
				if (osu === null) {}
				else {
					if (osu.channel === msg.channel.id) {
						currentOsu.push(osu.Username)
					}
				}
  	      });
			currentOsu = currentOsu.join(", ")
			if (currentOsu === "" || currentOsu === " ") {
				bot.sendMessage(msg.channel, "Not currently tracking any osu! players in "+msg.channel)
				return;
			}
			else {
				bot.sendMessage(msg.channel, "Currently tracking the following osu! players in "+msg.channel+": "+currentOsu)
				return;
			}
		}
		suffix = suffix.substring(4)
		osu.getUser(suffix, function(err, data) {
			if (!data) { 
				bot.sendMessage(msg.channel, "User not found.") 
				return;
			}
			if (data) {
				var searchTerm = data.username.toLowerCase();
				index = -1;
				for(var i = 0, len = osutracker.items.length; i < len; i++) {
					if (osutracker.items[i] === null) i++;
					//console.log(i)
					if (osutracker.items[i].Username.toLowerCase() === searchTerm) {
						if (osutracker.items[i].channel === msg.channel.id) {
							index = i;
							break;
						}
					}
				}
				if (index > -1) {
					testing1234 = osutracker.items[index]
					bot.sendMessage(msg.channel, "No longer tracking **osu!** gains for **"+testing1234.Username+"** in "+msg.channel)
					osutracker.items.splice(index, 1)
					require("fs").writeFile("./runtime/osutracker.json",JSON.stringify(osutracker,null,2), null);
					return
				}
				bot.sendMessage(msg.channel, "Now tracking **osu!** gains for **"+data.username+"** in "+msg.channel)
				var osuname = data.username;
				var osurank = data.pp_rank;
				var osupp = data.pp_raw;
				var testing1234 = {"Username": osuname, "Rank": osurank, "pp": osupp, "channel": msg.channel.id, "recent": ""}
				osutracker.items.forEach( function (command) {
					osusearch(testing1234, msg, command);
					if  (jjj === 1) return;
				});
			}
			if (jjj != 1) {
				osutracker.items.push(testing1234)
			}
			require("fs").writeFile("./runtime/osutracker.json",JSON.stringify(osutracker,null,2), null);
			jjj = 0;  
		})
	}
	else if (suffix.split(" ")[0].toLowerCase() === "taiko") {
		var APIKEY = ConfigFile.api_keys.osu_api_key;
		var osu = new osuapi.Api(APIKEY, 1);
		if (!suffix.split(" ")[1]) {
			currentTaiko = [];
			taikotracker.items.forEach( function (osu) {
				if (osu === null) {}
				else {
					if (osu.channel === msg.channel.id) {
						currentTaiko.push(osu.Username)
					}
				}
			});
			currentTaiko = currentTaiko.join(", ")
			if (currentTaiko === "" || currentTaiko === " ") {
				bot.sendMessage(msg.channel, "Not currently tracking any Taiko players in "+msg.channel)
				return;
			}
			else {
				bot.sendMessage(msg.channel, "Currently tracking the following Taiko players in "+msg.channel+": "+currentTaiko)
				return;
			}
		}
		suffix = suffix.substring(6)
		osu.getUser(suffix, function(err, data) {
			if (!data) { 
				bot.sendMessage(msg.channel, "User not found.") 
				return;
			}
			if (data) {
				var searchTerm = data.username.toLowerCase();
				index = -1;
				for(var i = 0, len = taikotracker.items.length; i < len; i++) {
					if (taikotracker.items[i] === null) i++;
					//console.log(i)
					if (taikotracker.items[i].Username.toLowerCase() === searchTerm) {
						if (taikotracker.items[i].channel === msg.channel.id) {
							index = i;
							break;
						}
					}
				}
				if (index > -1) {
					testing1234 = taikotracker.items[index]
					bot.sendMessage(msg.channel, "No longer tracking **Taiko** gains for **"+testing1234.Username+"** in "+msg.channel)
					taikotracker.items.splice(index, 1)
					require("fs").writeFile("./runtime/taikotracker.json",JSON.stringify(taikotracker,null,2), null);
					return
				}
				bot.sendMessage(msg.channel, "Now tracking **Taiko** gains for **"+data.username+"** in "+msg.channel)
				var osuname = data.username;
				var osurank = data.pp_rank;
				var osupp = data.pp_raw;
				var testing1234 = {"Username": osuname, "Rank": osurank, "pp": osupp, "channel": msg.channel.id, "recent": ""}
				taikotracker.items.forEach( function (command) {
					taikosearch(testing1234, msg, command);
					if  (jjj === 1) return;
				});
			}
			if (jjj != 1) {
				taikotracker.items.push(testing1234)
			}
			require("fs").writeFile("./runtime/taikotracker.json",JSON.stringify(taikotracker,null,2), null);
			jjj = 0;  
		})
	}
	else if (suffix.split(" ")[0].toLowerCase() === "ctb") {
		var APIKEY = ConfigFile.api_keys.osu_api_key;
		var osu = new osuapi.Api(APIKEY, 2);
		if (!suffix.split(" ")[1]) {
			currentCtb = [];
			ctbtracker.items.forEach( function (osu) {
				if (osu === null) {}
				else {
					if (osu.channel === msg.channel.id) {
						currentCtb.push(osu.Username)
					}
				}
			});
			currentCtb = currentCtb.join(", ")
			if (currentCtb === "" || currentCtb === " ") {
				bot.sendMessage(msg.channel, "Not currently tracking any Catch the Beat players in "+msg.channel)
				return;
			}
			else {
				bot.sendMessage(msg.channel, "Currently tracking the following Catch the Beat players in "+msg.channel+": "+currentCtb)
				return;
			}
		}
		suffix = suffix.substring(4)
		osu.getUser(suffix, function(err, data) {
			if (!data) { 
				bot.sendMessage(msg.channel, "User not found.") 
				return;
			}
			if (data) {
				var searchTerm = data.username.toLowerCase();
				index = -1;
				for(var i = 0, len = ctbtracker.items.length; i < len; i++) {
					if (ctbtracker.items[i] === null) i++;
					//console.log(i)
					if (ctbtracker.items[i].Username.toLowerCase() === searchTerm) {
						if (ctbtracker.items[i].channel === msg.channel.id) {
							index = i;
							break;
						}
					}
				}
				if (index > -1) {
					testing1234 = ctbtracker.items[index]
					bot.sendMessage(msg.channel, "No longer tracking **Catch the Beat** gains for **"+testing1234.Username+"** in "+msg.channel)
					ctbtracker.items.splice(index, 1)
					require("fs").writeFile("./runtime/ctbtracker.json",JSON.stringify(ctbtracker,null,2), null);
					return
				}
				bot.sendMessage(msg.channel, "Now tracking **Catch the Beat** gains for **"+data.username+"** in "+msg.channel)
				var osuname = data.username;
				var osurank = data.pp_rank;
				var osupp = data.pp_raw;
				var testing1234 = {"Username": osuname, "Rank": osurank, "pp": osupp, "channel": msg.channel.id, "recent": ""}
				ctbtracker.items.forEach( function (command) {
					ctbsearch(testing1234, msg, command);
					if  (jjj === 1) return;
				});
			}
			if (jjj != 1) {
			ctbtracker.items.push(testing1234)
			}
			require("fs").writeFile("./runtime/ctbtracker.json",JSON.stringify(ctbtracker,null,2), null);
			jjj = 0;  
		})
	}
	else if (suffix.split(" ")[0].toLowerCase() === "mania") {
		var APIKEY = ConfigFile.api_keys.osu_api_key;
		var osu = new osuapi.Api(APIKEY, 3);
		if (!suffix.split(" ")[1]) {
			currentMania = [];
			maniatracker.items.forEach( function (osu) {
				if (osu === null) {}
				else {
					if (osu.channel === msg.channel.id) {
						currentMania.push(osu.Username)
					}
				}
			});
			currentMania = currentMania.join(", ")
			if (currentMania === "" || currentMania === " ") {
				bot.sendMessage(msg.channel, "Not currently tracking any osu!mania players in "+msg.channel)
				return;
			}
			else {
				bot.sendMessage(msg.channel, "Currently tracking the following osu!mania players in "+msg.channel+": "+currentMania)
				return;
			}
		}
		suffix = suffix.substring(6)
		osu.getUser(suffix, function(err, data) {
			if (!data) { 
				bot.sendMessage(msg.channel, "User not found.") 
				return;
			}
			if (data) {
				var searchTerm = data.username.toLowerCase();
				index = -1;
				for(var i = 0, len = maniatracker.items.length; i < len; i++) {
					if (maniatracker.items[i] === null) i++;
					//console.log(i)
					if (maniatracker.items[i].Username.toLowerCase() === searchTerm) {
						if (maniatracker.items[i].channel === msg.channel.id) {
							index = i;
							break;
						}
					}
				}
				if (index > -1) {
					testing1234 = maniatracker.items[index]
					bot.sendMessage(msg.channel, "No longer tracking **osu!mania** gains for **"+testing1234.Username+"** in "+msg.channel)
					maniatracker.items.splice(index, 1)
					require("fs").writeFile("./runtime/maniatracker.json",JSON.stringify(maniatracker,null,2), null);
					return
				}
				bot.sendMessage(msg.channel, "Now tracking **osu!mania** gains for **"+data.username+"** in "+msg.channel)
				var osuname = data.username;
				var osurank = data.pp_rank;
				var osupp = data.pp_raw;
				var testing1234 = {"Username": osuname, "Rank": osurank, "pp": osupp, "channel": msg.channel.id, "recent": ""}
				maniatracker.items.forEach( function (command) {
					maniasearch(testing1234, msg, command);
					if  (jjj === 1) return;
				});
			}
			if (jjj != 1) {
				maniatracker.items.push(testing1234)
			}
			require("fs").writeFile("./runtime/maniatracker.json",JSON.stringify(maniatracker,null,2), null);
			jjj = 0;  
		})
	}
  }
}
  
Commands.customcommands = {
  "name": "customcommands",
  level: 3,
  fn: function(bot, msg, suffix) {
	msgcustomcom = [];
	customcommands.items.forEach( function (com) {
		if (com === null) {}
		else {
			if (com.server === msg.channel.server.id) {
				if (com.response != "" || com.response != " ") {
					console.log(com.command)
					msgcustomcom.push("!"+com.command)
				}
			}
		}
       });
	msgcustomcom = msgcustomcom.join("\n")
	if (msgcustomcom === "" || msgcustomcom === " ") {
		bot.sendMessage(msg.channel, "No custom commands on this server.")
		return;
	}
	else {
		bot.sendMessage(msg.author, "Commands on this server: \n"+msgcustomcom)
		return;
	}
  }
}
  
Commands.trackosu = {
  name: "trackosu",
  level: 1,
  fn: function(bot, msg, suffix) {
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu = new osuapi.Api(APIKEY);
	if (!suffix) {
		currentOsu = [];
		osutracker.items.forEach( function (osu) {
			if (osu === null) {}
			else {
				if (osu.channel === msg.channel.id) {
					currentOsu.push(osu.Username)
				}
			}
        });
		currentOsu = currentOsu.join(", ")
		if (currentOsu === "" || currentOsu === " ") {
			bot.sendMessage(msg.channel, "Not currently tracking any osu! players in "+msg.channel)
			return;
		}
		else {
			bot.sendMessage(msg.channel, "Currently tracking the following osu! players in "+msg.channel+": "+currentOsu)
			return;
		}
	}
	osu.getUser(suffix, function(err, data) {
		if (!data) { 
			bot.sendMessage(msg.channel, "User not found.") 
			return;
		}
		if (data) {
			var searchTerm = data.username.toLowerCase();
			index = -1;
			for(var i = 0, len = osutracker.items.length; i < len; i++) {
				if (osutracker.items[i] === null) i++;
				//console.log(i)
				if (osutracker.items[i].Username.toLowerCase() === searchTerm) {
					if (osutracker.items[i].channel === msg.channel.id) {
						index = i;
						break;
					}
				}
			}
			if (index > -1) {
				testing1234 = osutracker.items[index]
				bot.sendMessage(msg.channel, "No longer tracking **osu!** gains for **"+testing1234.Username+"** in "+msg.channel)
				osutracker.items.splice(index, 1)
				require("fs").writeFile("./runtime/osutracker.json",JSON.stringify(osutracker,null,2), null);
				return
			}
			bot.sendMessage(msg.channel, "Now tracking **osu!** gains for **"+data.username+"** in "+msg.channel)
			var osuname = data.username;
			var osurank = data.pp_rank;
			var osupp = data.pp_raw;
			var testing1234 = {"Username": osuname, "Rank": osurank, "pp": osupp, "channel": msg.channel.id, "recent": ""}
			osutracker.items.forEach( function (command) {
				osusearch(testing1234, msg, command);
				if  (jjj === 1) return;
			});
		}
		if (jjj != 1) {
			osutracker.items.push(testing1234)
		}
		require("fs").writeFile("./runtime/osutracker.json",JSON.stringify(osutracker,null,2), null);
		jjj = 0;  
	})
  }
}

function osusearch (testing1234, msg, command) {
	for (var i = 0; i < osutracker.items.length; i++) {
		if (osutracker.items[i] === null) return
		if (osutracker.items[i].channel === testing1234.channel) {
			if (osutracker.items[i].Username === testing1234.Username) {
				//delete cccoms.items[i]
				osutracker.items[i].Username = testing1234.Username
				osutracker.items[i].channel = testing1234.channel
				osutracker.items[i].Rank = testing1234.Rank
				osutracker.items[i].pp = testing1234.pp
				jjj = 1;
			}
		}
	}
}

Commands.tracktaiko = {
  name: "tracktaiko",
  level: 1,
  fn: function(bot, msg, suffix) {
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu = new osuapi.Api(APIKEY, 1);
	if (!suffix) {
		currentTaiko = [];
		taikotracker.items.forEach( function (osu) {
			if (osu === null) {}
			else {
				if (osu.channel === msg.channel.id) {
					currentTaiko.push(osu.Username)
				}
			}
        });
		currentTaiko = currentTaiko.join(", ")
		if (currentTaiko === "" || currentTaiko === " ") {
			bot.sendMessage(msg.channel, "Not currently tracking any Taiko players in "+msg.channel)
			return;
		}
		else {
			bot.sendMessage(msg.channel, "Currently tracking the following Taiko players in "+msg.channel+": "+currentTaiko)
			return;
		}
	}
	osu.getUser(suffix, function(err, data) {
		if (!data) { 
			bot.sendMessage(msg.channel, "User not found.") 
			return;
		}
		if (data) {
			var searchTerm = data.username.toLowerCase();
			index = -1;
			for(var i = 0, len = taikotracker.items.length; i < len; i++) {
				if (taikotracker.items[i] === null) i++;
				//console.log(i)
				if (taikotracker.items[i].Username.toLowerCase() === searchTerm) {
					if (taikotracker.items[i].channel === msg.channel.id) {
						index = i;
						break;
					}
				}
			}
			if (index > -1) {
				testing1234 = taikotracker.items[index]
				bot.sendMessage(msg.channel, "No longer tracking **Taiko** gains for **"+testing1234.Username+"** in "+msg.channel)
				taikotracker.items.splice(index, 1)
				require("fs").writeFile("./runtime/taikotracker.json",JSON.stringify(taikotracker,null,2), null);
				return
			}
			bot.sendMessage(msg.channel, "Now tracking **Taiko** gains for **"+data.username+"** in "+msg.channel)
			var osuname = data.username;
			var osurank = data.pp_rank;
			var osupp = data.pp_raw;
			var testing1234 = {"Username": osuname, "Rank": osurank, "pp": osupp, "channel": msg.channel.id, "recent": ""}
			taikotracker.items.forEach( function (command) {
				taikosearch(testing1234, msg, command);
				if  (jjj === 1) return;
			});
		}
		if (jjj != 1) {
			taikotracker.items.push(testing1234)
		}
		require("fs").writeFile("./runtime/taikotracker.json",JSON.stringify(taikotracker,null,2), null);
		jjj = 0;  
	})
  }
}

function taikosearch (testing1234, msg, command) {
	for (var i = 0; i < taikotracker.items.length; i++) {
		if (taikotracker.items[i] === null) return
		if (taikotracker.items[i].channel === testing1234.channel) {
			if (taikotracker.items[i].Username === testing1234.Username) {
				//delete cccoms.items[i]
				taikotracker.items[i].Username = testing1234.Username
				taikotracker.items[i].channel = testing1234.channel
				taikotracker.items[i].Rank = testing1234.Rank
				taikotracker.items[i].pp = testing1234.pp
				jjj = 1;
			}
		}
	}
}

Commands.trackctb = {
  name: "trackctb",
  level: 1,
  fn: function(bot, msg, suffix) {
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu = new osuapi.Api(APIKEY, 2);
	if (!suffix) {
		currentCtb = [];
		ctbtracker.items.forEach( function (osu) {
			if (osu === null) {}
			else {
				if (osu.channel === msg.channel.id) {
					currentCtb.push(osu.Username)
				}
			}
        });
		currentCtb = currentCtb.join(", ")
		if (currentCtb === "" || currentCtb === " ") {
			bot.sendMessage(msg.channel, "Not currently tracking any Catch the Beat players in "+msg.channel)
			return;
		}
		else {
			bot.sendMessage(msg.channel, "Currently tracking the following Catch the Beat players in "+msg.channel+": "+currentCtb)
			return;
		}
	}
	osu.getUser(suffix, function(err, data) {
		if (!data) { 
			bot.sendMessage(msg.channel, "User not found.") 
			return;
		}
		if (data) {
			var searchTerm = data.username.toLowerCase();
			index = -1;
			for(var i = 0, len = ctbtracker.items.length; i < len; i++) {
				if (ctbtracker.items[i] === null) i++;
				//console.log(i)
				if (ctbtracker.items[i].Username.toLowerCase() === searchTerm) {
					if (ctbtracker.items[i].channel === msg.channel.id) {
						index = i;
						break;
					}
				}
			}
			if (index > -1) {
				testing1234 = ctbtracker.items[index]
				bot.sendMessage(msg.channel, "No longer tracking **Catch the Beat** gains for **"+testing1234.Username+"** in "+msg.channel)
				ctbtracker.items.splice(index, 1)
				require("fs").writeFile("./runtime/ctbtracker.json",JSON.stringify(ctbtracker,null,2), null);
				return
			}
			bot.sendMessage(msg.channel, "Now tracking **Catch the Beat** gains for **"+data.username+"** in "+msg.channel)
			var osuname = data.username;
			var osurank = data.pp_rank;
			var osupp = data.pp_raw;
			var testing1234 = {"Username": osuname, "Rank": osurank, "pp": osupp, "channel": msg.channel.id, "recent": ""}
			ctbtracker.items.forEach( function (command) {
				ctbsearch(testing1234, msg, command);
				if  (jjj === 1) return;
			});
		}
		if (jjj != 1) {
			ctbtracker.items.push(testing1234)
		}
		require("fs").writeFile("./runtime/ctbtracker.json",JSON.stringify(ctbtracker,null,2), null);
		jjj = 0;  
	})
  }
}

function ctbsearch (testing1234, msg, command) {
	for (var i = 0; i < ctbtracker.items.length; i++) {
		if (ctbtracker.items[i] === null) return
		if (ctbtracker.items[i].channel === testing1234.channel) {
			if (ctbtracker.items[i].Username === testing1234.Username) {
				//delete cccoms.items[i]
				ctbtracker.items[i].Username = testing1234.Username
				ctbtracker.items[i].channel = testing1234.channel
				ctbtracker.items[i].Rank = testing1234.Rank
				ctbtracker.items[i].pp = testing1234.pp
				jjj = 1;
			}
		}
	}
}

Commands.trackmania = {
  name: "trackmania",
  level: 1,
  fn: function(bot, msg, suffix) {
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu = new osuapi.Api(APIKEY, 3);
	if (!suffix) {
		currentMania = [];
		maniatracker.items.forEach( function (osu) {
			if (osu === null) {}
			else {
				if (osu.channel === msg.channel.id) {
					currentMania.push(osu.Username)
				}
			}
        });
		currentMania = currentMania.join(", ")
		if (currentMania === "" || currentMania === " ") {
			bot.sendMessage(msg.channel, "Not currently tracking any osu!mania players in "+msg.channel)
			return;
		}
		else {
			bot.sendMessage(msg.channel, "Currently tracking the following osu!mania players in "+msg.channel+": "+currentMania)
			return;
		}
	}
	osu.getUser(suffix, function(err, data) {
		if (!data) { 
			bot.sendMessage(msg.channel, "User not found.") 
			return;
		}
		if (data) {
			var searchTerm = data.username.toLowerCase();
			index = -1;
			for(var i = 0, len = maniatracker.items.length; i < len; i++) {
				if (maniatracker.items[i] === null) i++;
				//console.log(i)
				if (maniatracker.items[i].Username.toLowerCase() === searchTerm) {
					if (maniatracker.items[i].channel === msg.channel.id) {
						index = i;
						break;
					}
				}
			}
			if (index > -1) {
				testing1234 = maniatracker.items[index]
				bot.sendMessage(msg.channel, "No longer tracking **osu!mania** gains for **"+testing1234.Username+"** in "+msg.channel)
				maniatracker.items.splice(index, 1)
				require("fs").writeFile("./runtime/maniatracker.json",JSON.stringify(maniatracker,null,2), null);
				return
			}
			bot.sendMessage(msg.channel, "Now tracking **osu!mania** gains for **"+data.username+"** in "+msg.channel)
			var osuname = data.username;
			var osurank = data.pp_rank;
			var osupp = data.pp_raw;
			var testing1234 = {"Username": osuname, "Rank": osurank, "pp": osupp, "channel": msg.channel.id, "recent": ""}
			maniatracker.items.forEach( function (command) {
				maniasearch(testing1234, msg, command);
				if  (jjj === 1) return;
			});
		}
		if (jjj != 1) {
			maniatracker.items.push(testing1234)
		}
		require("fs").writeFile("./runtime/maniatracker.json",JSON.stringify(maniatracker,null,2), null);
		jjj = 0;  
	})
  }
}

function maniasearch (testing1234, msg, command) {
	for (var i = 0; i < maniatracker.items.length; i++) {
		if (maniatracker.items[i] === null) return
		if (maniatracker.items[i].channel === testing1234.channel) {
			if (maniatracker.items[i].Username === testing1234.Username) {
				//delete cccoms.items[i]
				maniatracker.items[i].Username = testing1234.Username
				maniatracker.items[i].channel = testing1234.channel
				maniatracker.items[i].Rank = testing1234.Rank
				maniatracker.items[i].pp = testing1234.pp
				jjj = 1;
			}
		}
	}
}

Commands.setstafflog = {
  "name": "setstafflog",
  level: 3,
  fn: function(bot, msg, suffix) {
	channeltocheck = suffix.split(" ")[0].replace("<", "").replace(">", "").replace("#", "")
	stafflog = msg.channel.server.channels.get("id", channeltocheck);
	if (stafflog) {
		//console.log(stafflog)
		Permissions.SetStafflog(msg.channel.server.id, stafflog.id, function(err, allow) {
			if (err) {
				bot.sendMessage(msg.channel, "Error setting Staff Log channel. Try again later.")
			}
			else {
				bot.sendMessage(msg.channel, stafflog+" has been set as a Staff Log channel.")
			}
		})
	}
	else {
		bot.sendMessage(msg.channel, "Channel not found.")
	}
  }
}

Commands.contact = {
  "name": "contact",
  level: 3,
  fn: function(bot, msg, suffix) {
	bot.sendMessage(msg.channel, "Please join my support server if you are having issues with Koi. http://discord.gg/0vAsDJGEnPOcdmHX")
  }
}
  
Commands.invite = {
  "name": "invite",
  level: 3,
  fn: function(bot, msg, suffix) {
	  bot.createInvite(msg.channel, {"maxUses" : 1}, (err, res) => {
		if (res) {
			bot.sendMessage(msg.channel, "Here is a single use invite link: "+res)
		}
		else {
			bot.sendMessage(msg.channel, "Error: "+err)
		}
	  })
  }
}

Commands.botservers = {
  "name": "botservers",
  level: 5,
  fn: function(bot, msg, suffix) {
	for (var i = 0; i < bot.servers.length; i++) {
		bot.sendMessage(msg.channel, "Server name: `"+bot.servers[i].name+"` Members: `"+bot.servers[i].members.length+"`")
		//console.log(bot.servers[1])
	}
  }
}

Commands.lastmention = {
  "name": "lastmention",
  level: 0,
  fn: function(bot, msg, suffix) {
	v = 0;
	z = 0;
	attempts = 0;
	mentionchannel = "";
	channeltocheck = suffix.split(" ")[0].replace("<", "").replace(">", "").replace("#", "")
	//console.log(channeltocheck)
	if (channeltocheck != "") {
		mentionchannel = msg.channel.server.channels.get("id", channeltocheck);
	}
	if (!mentionchannel) {
		mentionchannel = msg.channel
	}
	bot.getChannelLogs(mentionchannel, 100, function(error, messages) {
		if (error) {
			bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
			return;
		} 
		else {
				userid = msg.author.id
				for (var i = 0; i < 100; i++) {
					if(messages[i].content.indexOf(userid) > -1) {
						//console.log(messages[i].author.id != "125841801797042177")
						if (messages[i].author.id != "125841801797042177") {
							//console.log("hi")1459902989447
							//else if (i === 5000) bot.sendMessage(msg.channel, "Couldn't find a mention in the last 5000 messages.");
							bot.getChannelLogs(mentionchannel, 4, { before: messages[i] }, function(error, prevmessages) {
								if (error) {
									bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
									return;
								} 
								else {
									var timestamp1 = discordtimestamp(prevmessages[3].timestamp)
									var timestamp2 = discordtimestamp(prevmessages[2].timestamp)
									var timestamp3 = discordtimestamp(prevmessages[1].timestamp)
									var timestamp4 = discordtimestamp(prevmessages[0].timestamp)
									var timestamp5 = discordtimestamp(messages[i].timestamp)
									bot.sendMessage(msg.channel, "Latest mention in "+ mentionchannel +": \n" + timestamp1 + " UTC **" + prevmessages[3].author.username + "**: " + prevmessages[3].cleanContent + "\n" + timestamp2 + " UTC **" + prevmessages[2].author.username + "**: " + prevmessages[2].cleanContent + "\n" + timestamp3 + " UTC **" + prevmessages[1].author.username + "**: " + prevmessages[1].cleanContent + "\n" + timestamp4 + " UTC **" + prevmessages[0].author.username + "**: " + prevmessages[0].cleanContent + "\n" + timestamp5 + " UTC **" + messages[i].author.username + "**: " + messages[i]);
								}
							})
							break;
						}
					}
					if (i === 99) {
						z = messages[i]
						attempts++
						lastmention(bot, msg, suffix, v, z, attempts, mentionchannel)
					}
				}
		}
		});
  }
}

function discordtimestamp(timestamp) {
	var date = new Date(timestamp);
	var hours = date.getUTCHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

function lastmention (bot, msg, suffix, v, z, attempts, mentionchannel) {
	//console.log(attempts)
	if (attempts < 50) {
		bot.getChannelLogs(mentionchannel, 100, {before: z}, function(error, messages) {
			if (error) {
				bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
				return;
			} 
			else {
				userid = msg.author.id
				for (var i = 0; i < 100; i++) {
					if(messages[i].content.indexOf(userid) > -1) {
						if (messages[i].author.id != "125841801797042177") {
							bot.getChannelLogs(mentionchannel, 4, { before: messages[i] }, function(error, prevmessages) {
								if (error) {
									bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
									return;
								} 
								else {
									var timestamp1 = discordtimestamp(prevmessages[3].timestamp)
									var timestamp2 = discordtimestamp(prevmessages[2].timestamp)
									var timestamp3 = discordtimestamp(prevmessages[1].timestamp)
									var timestamp4 = discordtimestamp(prevmessages[0].timestamp)
									var timestamp5 = discordtimestamp(messages[i].timestamp)
									bot.sendMessage(msg.channel, "Latest mention in "+ mentionchannel +": \n" + timestamp1 + " UTC **" + prevmessages[3].author.username + "**: " + prevmessages[3].cleanContent + "\n" + timestamp2 + " UTC **" + prevmessages[2].author.username + "**: " + prevmessages[2].cleanContent + "\n" + timestamp3 + " UTC **" + prevmessages[1].author.username + "**: " + prevmessages[1].cleanContent + "\n" + timestamp4 + " UTC **" + prevmessages[0].author.username + "**: " + prevmessages[0].cleanContent + "\n" + timestamp5 + " UTC **" + messages[i].author.username + "**: " + messages[i]);
								}
							})
							break;
						}
					}
					if (i === 99) {
						z = messages[i]
						attempts++;
						lastmention(bot, msg, suffix, v, z, attempts, mentionchannel)
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
		bot.sendMessage(msg.channel, "You must mention exactly 1 user!")
	}
	msg.mentions.map((user) => {
		Permissions.GetPreviousName(user.id, function(err, reply) {
			console.log(reply)
			var testreply = reply.replace(/[,]+/g, "").trim()
			console.log(testreply)
			if (reply === "none") {
				bot.sendMessage(msg.channel, "No previous names found for "+user)
			}
			else if (reply === ", "+testreply+",") {
				bot.sendMessage(msg.channel, "Previous names for "+user)
				setTimeout(function(){ bot.sendMessage(msg.channel, testreply) }, 200)
			}
			else {
				bot.sendMessage(msg.channel, "Previous names for "+user)
				setTimeout(function(){ bot.sendMessage(msg.channel, reply.replace(", ", "").slice(0,-1)) }, 200)
			}
		})
    })
  }
}

Commands.mention = {
  name: "mention",
  level: 3,
  fn: function(bot, msg, suffix) {
	role = msg.channel.server.roles.get("name", suffix);
	if (role) {
		for (var i = 0; i < msg.channel.server.members.length; i++) {
			var mention = bot.memberHasRole(msg.channel.server.members[i], role)
			if (mention) {
				bot.sendMessage(msg.channel, msg.channel.server.members[i])
			}
		}
		return;
	}
	else {
		console.log("hi")
		role = "";
		var s = suffix.toLowerCase();
		var sp = s.split("");
		for (var i = 0, l = 1 << s.length; i < l; i++) {
			for (var j = i, k = 0; j; j >>= 1, k++) {
				sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
			}
			var st = sp.join("");
			//console.log(st)
			role = msg.channel.server.roles.get("name", st);
			if (role) {
				role = msg.channel.server.roles.get("name", st);
				break;
			}
		}
	}
	//console.log(role)
	  //var role = msg.channel.server.roles.get("name", suffix);
	  if (role) {
		for (var i = 0; i < msg.channel.server.members.length; i++) {
			var mention = bot.memberHasRole(msg.channel.server.members[i], role)
			if (mention) {
				bot.sendMessage(msg.channel, msg.channel.server.members[i])
			}
		}
	  }
  }
}

Commands.avatar = {
  name: "avatar",
  level: 0,
  fn: function(bot, msg, suffix) {
	msg.mentions.map(function(user) {
		if (user.avatarURL === null) {
			bot.sendMessage(msg.channel, user+" doesn't appear to have an avatar.")
			return;
        } 
		else {
          bot.sendMessage(msg.channel, "Avatar for "+ user.name +":");
		  bot.sendFile(msg.channel, user.avatarURL)
        }
	})
  }
}

Commands.punish = {
  name: "punish",
  level: 3,
  fn: function(bot, msg, suffix) {
	if (msg.mentions.length === 0) {
		bot.sendMessage(msg.channel, "You didn't tell me who to punish!")
		return;
	}
	if (msg.mentions.length > 1) {
		bot.sendMessage(msg.channel, "You can only punish one person at a time.")
		return;
	}
	msg.mentions.map((user) => {
		//if (user.id === msg.author.id) {
		//	bot.sendMessage(msg.channel, "You can't punish yourself!")
		//	return;
		//}
		Permissions.GetPunishLevel((msg.channel.server.id + user.id), function(err, reply) {
			console.log(reply.slice(0,1))
			if (reply.slice(0,1).indexOf("0") > -1) {
				Permissions.SetPunishLevel((msg.channel.server.id + user.id), "1"+suffix.replace("<@"+user.id+">", "")+msg.timestamp, function(err, allow) {
					//console.log("hi: "+allow)
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "1"+suffix.replace("<@"+user.id+">", "")+msg.timestamp) {
						var reason = suffix.replace("<@"+user.id+">", "")
						if (reason === "" || reason === " ") {
							reason = "No reason was provided."
						}
						var reason1 = reason.replace("0", "")
						bot.sendMessage(msg.channel, user+", this is your first warning.")
						Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
							if (reply === "none") {}
							else {
							setTimeout(function(){ bot.sendMessage(reply, user+ " has been warned for the 1st time."); }, 100)
							setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
							setTimeout(function(){ bot.sendMessage(reply, "Current punish level: 1"); }, 300)
							}
						})
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
			if (reply.slice(0,1).indexOf("1") > -1) {
				Permissions.SetPunishLevel((msg.channel.server.id + user.id), "2"+suffix.replace("<@"+user.id+">", "")+msg.timestamp, function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "2"+suffix.replace("<@"+user.id+">", "")+msg.timestamp) {
						bot.sendMessage(msg.channel, user+", this is your second and final warning.")
						var reason = suffix.replace("<@"+user.id+">", "")
						if (reason === "" || reason === " ") {
							reason = "No reason was provided."
						}
						var reason1 = reason.replace("0", "")
						Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
							if (reply === "none") {}
							else {
							setTimeout(function(){ bot.sendMessage(reply, user+ " has been warned for the 2nd time."); }, 100)
							setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
							setTimeout(function(){ bot.sendMessage(reply, "Current punish level: 2"); }, 300)
							}
						})
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
			if (reply.slice(0,1).indexOf("2") > -1) {
				if (!msg.channel.permissionsOf(msg.author).hasPermission("managePermissions")) {
					bot.sendMessage(msg.channel, "I don't have the correct permissions to mute!")
					return;
				}
				Permissions.SetPunishLevel((msg.channel.server.id + user.id), "3"+suffix.replace("<@"+user.id+">", "")+msg.timestamp, function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "3"+suffix.replace("<@"+user.id+">", "")+msg.timestamp) {
						bot.sendMessage(msg.channel, user+", you have been silenced for 5 minutes.")
						var reason = suffix.replace("<@"+user.id+">", "")
						if (reason === "" || reason === " ") {
							reason = "No reason was provided."
						}
						var reason1 = reason.replace("0", "")
						Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
							if (reply === "none") {}
							else {
							setTimeout(function(){ bot.sendMessage(reply, user+ " has been muted for the 1st time."); }, 100)
							setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
							setTimeout(function(){ bot.sendMessage(reply, "Current punish level: 3"); }, 300)
							}
						})
						for (var i = 0, len = msg.channel.server.channels.length; i < len; i++) {
							var channame = msg.channel.server.channels[i]
							//var user = bot.users.get("name", msg.author.username)
							bot.overwritePermissions(channame, user, { "sendMessages" : false, "managePermissions" : false }, (e) => {
								if (e) {
									bot.sendMessage(msg.channel, "Error overwriting permissions. `"+e+"`")
								}
							})
						}
						setTimeout(function(){ unmute(msg, bot, suffix); }, parseInt(5 * 60000))
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
			if (reply.slice(0,1).indexOf("3") > -1) {
				if (!msg.channel.permissionsOf(msg.author).hasPermission("managePermissions")) {
					bot.sendMessage(msg.channel, "I don't have the correct permissions to mute!")
					return;
				}
				Permissions.SetPunishLevel((msg.channel.server.id + user.id), "4"+suffix.replace("<@"+user.id+">", "")+msg.timestamp, function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "4"+suffix.replace("<@"+user.id+">", "")+msg.timestamp) {
						bot.sendMessage(msg.channel, user+", you have been silenced for 15 minutes.")
						var reason = suffix.replace("<@"+user.id+">", "")
						if (reason === "" || reason === " ") {
							reason = "No reason was provided."
						}
						var reason1 = reason.replace("0", "")
						Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
							if (reply === "none") {}
							else {
							setTimeout(function(){ bot.sendMessage(reply, user+ " has been muted for the 2nd time."); }, 100)
							setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
							setTimeout(function(){ bot.sendMessage(reply, "Current punish level: 4"); }, 300)
							}
						})
						for (var i = 0, len = msg.channel.server.channels.length; i < len; i++) {
							var channame = msg.channel.server.channels[i]
							//var user = bot.users.get("name", msg.author.username)
							bot.overwritePermissions(channame, user, { "sendMessages" : false, "managePermissions" : false }, (e) => {
								if (e) {
									bot.sendMessage(msg.channel, "Error overwriting permissions. `"+e+"`")
								}
							})
						}
						setTimeout(function(){ unmute(msg, bot, suffix); }, parseInt(15 * 60000))
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
			if (reply.slice(0,1).indexOf("4") > -1) {
				if (!msg.channel.permissionsOf(msg.author).hasPermission("kickMembers")) {
					bot.sendMessage(msg.channel, "I don't have the correct permissions to kick!")
					return;
				}
				Permissions.SetPunishLevel((msg.channel.server.id + user.id), "5"+suffix.replace("<@"+user.id+">", "")+msg.timestamp, function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "5"+suffix.replace("<@"+user.id+">", "")+msg.timestamp) {
						bot.sendMessage(msg.channel, user+", has been kicked.")
						var reason = suffix.replace("<@"+user.id+">", "")
						if (reason === "" || reason === " ") {
							reason = "No reason was provided."
						}
						var reason1 = reason.replace("0", "")
						Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
							if (reply === "none") {}
							else {
							setTimeout(function(){ bot.sendMessage(reply, user+ " has been kicked"); }, 100)
							setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
							setTimeout(function(){ bot.sendMessage(reply, "Current punish level: 5"); }, 300)
							}
						})
						bot.sendMessage(user, "You have been kicked. If you commit one more offense, you will be banned.")
						setTimeout(function(){ bot.sendMessage(user, "The reason you were kicked: "+reason) }, 500)
						bot.createInvite(msg.channel, {"maxUses" : 1}, (err, res) => {
							if (res) {
								bot.sendMessage(user, "Here is an invite link to rejoin: "+res)
							}
						})
						bot.kickMember(user, msg.channel.server)
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				})
			}
			if (reply.slice(0,1).indexOf("5") > -1) {
				if (!msg.channel.permissionsOf(msg.author).hasPermission("banMembers")) {
					bot.sendMessage(msg.channel, "I don't have the correct permissions to ban!")
					return;
				}
				Permissions.SetPunishLevel((msg.channel.server.id + user.id), "5"+suffix.replace("<@"+user.id+">", "")+msg.timestamp, function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "5"+suffix.replace("<@"+user.id+">", "")+msg.timestamp) {
						bot.banMember(user, msg.channel.server)
						bot.sendMessage(msg.channel, user+", has been banned.")
						bot.sendMessage(user, "You have been banned from "+msg.channel.server.name+".")
						var reason = suffix.replace("<@"+user.id+">", "")
						if (reason === "" || reason === " ") {
							reason = "No reason was provided."
						}
						var reason1 = reason.replace("0", "")
						Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
							if (reply === "none") {}
							else {
							setTimeout(function(){ bot.sendMessage(reply, user+ " has been banned."); }, 100)
							setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
							setTimeout(function(){ bot.sendMessage(reply, "Current punish level: 6"); }, 300)
							}
						})
						setTimeout(function(){ bot.sendMessage(user, "The reason you were banned: "+reason) }, 500)

					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				})
			}
		})
	})
  }
}

Commands.status = {
  name: "status",
  level: 0,
  fn: function(bot, msg, suffix) {
	if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
		if (msg.mentions.length > 0) {
			bot.sendMessage(msg.channel, "You cannot check another users punish level.")
			return;
		}
		else {
			Permissions.GetPunishLevel((msg.channel.server.id + msg.author.id), function(err, reply) {
				if (reply.substring(1,2) === " ") {
					var punishlevel = reply.substring(0,1)
					var lastwarning = reply.substring(2).slice(0, -13)
				}
				else {
					var punishlevel = reply.substring(0,1)
					var lastwarning = reply.substring(1).slice(0, -13)
				}
				bot.sendMessage(msg.channel, "Current status for "+msg.author)
				setTimeout(function(){ bot.sendMessage(msg.channel, "Punish level: "+punishlevel) }, 100)
				if (lastwarning) {
					setTimeout(function(){ bot.sendMessage(msg.channel, "Reason for latest punishment: "+lastwarning)}, 200)
				}
				else {
					setTimeout(function(){ bot.sendMessage(msg.channel, "Reason for latest punishment: None provided.")}, 200)
				}
			})
			return;
		}
	}
	if (msg.mentions.length != 1) {
		bot.sendMessage(msg.channel, "You must mention exactly 1 user!")
		return;
	}
	msg.mentions.map((user) => {
		Permissions.GetPunishLevel((msg.channel.server.id + user.id), function(err, reply) {
			if (reply.substring(1,2) === " ") {
				var punishlevel = reply.substring(0,1)
				var lastwarning = reply.substring(2).slice(0, -13)
			}
			else {
				var punishlevel = reply.substring(0,1)
				var lastwarning = reply.substring(1).slice(0, -13)
			}
			bot.sendMessage(msg.channel, "Current status for "+user)
			setTimeout(function(){ bot.sendMessage(msg.channel, "Punish level: "+punishlevel)}, 100)
			if (lastwarning) {
				setTimeout(function(){ bot.sendMessage(msg.channel, "Reason for latest punishment: "+lastwarning)}, 200)
			}
			else {
				setTimeout(function(){ bot.sendMessage(msg.channel, "Reason for latest punishment: None provided.")}, 200)
			}
		})
	})
  }
}

Commands.punishlevel = {
  name: "punishlevel",
  level: 3,
  fn: function(bot, msg, suffix) {
	if (msg.mentions.length != 1) {
		bot.sendMessage(msg.channel, "You must mention exactly 1 user!")
		return;
	}
	if (!isNaN(suffix.split(" ")[1])) {
		suffix = parseInt(suffix.split(" ")[1])
	}
	else {
		bot.sendMessage(msg.channel, "Incorrect usage. Example: `!punishlevel <user> <level>`")
		return;
	}
	if (suffix < 0 || suffix > 5) {
		bot.sendMessage(msg.channel, "You cannot set a punish level to be lower than 0 or higher than 5!")
		return;
	}
	msg.mentions.map((user) => {
		Permissions.SetPunishLevel((msg.channel.server.id + user.id), suffix, function(err, allow) {
			if (err) {
			bot.reply(msg.channel, "An error occured.");
			return;
			}
			if (allow === suffix) {
			bot.sendMessage(msg.channel, user+"'s punish level set to: "+allow)
			}
			else {
				bot.reply(msg.channel, "An error occured.");
				return;
			}
		})
	});
  }
}

Commands.mute = {
  name: "mute",
  level: 0,
  fn: function(bot, msg, suffix) {
	if (msg.channel.isPrivate) {
		bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
		return;
	}
	if (!msg.channel.permissionsOf(bot.user).hasPermission("manageChannels")) { 
		bot.sendMessage(msg, "I don't have the permission `Manage Channels`! I must have this permission for `!mute` to function correctly!")
		return;
	}
	if (!msg.channel.permissionsOf(msg.author).hasPermission("manageChannels")) { 
		bot.sendMessage(msg, "You don't have the permission `Manage Channels`! You must have this permission to use `!mute`")
		return;
	}
	if (msg.mentions.length > 1) {
		bot.sendMessage(msg, "You can only mute 1 person at a time.")
		return;
	}
	if (msg.mentions.length === 0) {
		bot.sendMessage(msg, "You didn't mention a user to mute!")
		return;
	}
	msg.mentions.map((user) => {
		if (user.id === msg.author.id) {
			bot.sendMessage(msg.channel, "You can't mute yourself!")
			return;
		}
		for (var i = 0, len = msg.channel.server.channels.length; i < len; i++) {
			var channame = msg.channel.server.channels[i]
			//var user = bot.users.get("name", msg.author.username)
			bot.overwritePermissions(channame, user, { "sendMessages" : false, "managePermissions" : false }, (e) => {
				if (e) {
					//bot.sendMessage(msg.channel, "Error overwriting permissions. `"+e+"`")
					bot.sendMessage(msg.channel, "Couldn't mute "+user+" in "+channame)
				}
				else {
				}
			})
		}
	})
	msg.mentions.map((user) => {
		if (user.id === msg.author.id) {
			//bot.sendMessage(msg.channel, "You can't mute yourself!")
			return;
		}
		bot.sendMessage(msg.channel, "Successfully muted "+user)
	})
	if (!isNaN(suffix.split(" ")[1])) {
		msg.mentions.map((user) => {
			if (user.id === msg.author.id) {
				//bot.sendMessage(msg.channel, "You can't mute yourself!")
				return;
			}
			bot.sendMessage(msg.channel, user+" will be automatically unmuted in "+suffix.split(" ")[1]+" minutes.")
			setTimeout(function(){
				unmute(msg, bot, suffix);
			}, parseInt(suffix.split(" ")[1] * 60000))
		})
	}
	if (!isNaN(suffix.split(" ")[0])) {
		msg.mentions.map((user) => {
			if (user.id === msg.author.id) {
				//bot.sendMessage(msg.channel, "You can't mute yourself!")
				return;
			}
			bot.sendMessage(msg.channel, user+" will be automatically unmuted in "+suffix.split(" ")[0]+" minutes.")
			setTimeout(function(){
				unmute(msg, bot, suffix);
			}, parseInt(suffix.split(" ")[0] * 60000))
		})
	}
  }
}

Commands.unmute = {
  name: "unmutetest",
  level: 0,
  fn: function(bot, msg, suffix) {
	if (msg.channel.isPrivate) {
		bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
		return;
	}
	if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!unmute` to function correctly!")
		return;
	}
	if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!unmute`")
		return;
	}
	if (msg.mentions.length > 1) {
		bot.sendMessage(msg, "You can only unmute 1 person at a time.")
		return;
	}
	if (msg.mentions.length === 0) {
		bot.sendMessage(msg, "You didn't mention a user to unmute!")
		return;
	}
	msg.mentions.map((user) => {
		for (var i = 0, len = msg.channel.server.channels.length; i < len; i++) {
			var channame = msg.channel.server.channels[i]
			//var user = bot.users.get("name", msg.author.username)
			var asdfasdf = msg.channel.server.channels.get("name", msg.channel.server.channels[i].name)
			bot.overwritePermissions(channame, user, false)
		}
	})
	msg.mentions.map((user) => {
		bot.sendMessage(msg.channel, user+" has been unmuted.")
	})
  }
}

function unmute (msg, bot, suffix) {
	msg.mentions.map((user) => {
		for (var i = 0, len = msg.channel.server.channels.length; i < len; i++) {
			var channame = msg.channel.server.channels[i]
			//var user = bot.users.get("name", msg.author.username)
			var asdfasdf = msg.channel.server.channels.get("name", msg.channel.server.channels[i].name)
			bot.overwritePermissions(channame, user, false)
		}
	})
	msg.mentions.map((user) => {
		bot.sendMessage(msg.channel, user+" has been unmuted.")
	})
}

Commands.announcement = {
	//desc: "Send a PM to all users in a server. Admin only",
	//deleteCommand: false, usage: "<message>", cooldown: 1,
	name: "announcement",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!suffix && msg.author.id == ConfigFile.permissions.masterUser) { 
			bot.sendMessage(msg.channel, "You must specify a message to announce")
			return;
		}
		if (msg.channel.isPrivate && msg.author.id == ConfigFile.permissions.masterUser) {
			if (/^\d+$/.test(suffix)) {
				var index = confirmCodes.indexOf(parseInt(suffix));
				if (index == -1) { bot.sendMessage(msg, "Code not found", function(erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				bot.sendMessage(msg, "Announcing to all servers, this may take a while...");
				bot.servers.forEach((svr) => {
					setTimeout(() => {
						Permissions.GetAnnouncement(svr.id, function(err, reply) { 
							if (reply === "on") {
								bot.sendMessage(svr.defaultChannel, "📣 " + announceMessages[index] + " - from " + msg.author.username);
								bot.sendMessage(svr.defaultChannel, "If you don't want to receive announcements, please use the command `!announcement off`.");
							}
						})
					}, 1000);
				});
			} else {
				announceMessages.push(suffix);
				var code = Math.floor(Math.random() * 100000);
				confirmCodes.push(code);
				bot.sendMessage(msg, "⚠ This will send a message to **all** servers where I can speak in general. If you're sure you want to do this say `!announcement " + code + "`");
			}
		}
		else {
			if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageServer")) {
				bot.sendMessage(msg.channel, "You must have the permission `Manage Server` to turn announcements on or off.")
				return;
			}
			if (msg.author.id != "98621941119750144" && msg.channel.permissionsOf(msg.sender).hasPermission("manageServer")) {
				if (suffix === "off") {
					Permissions.SetAnnouncement(msg.channel.server.id, "off", function(err, allow) {
						if (err) {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
						if (allow === "off") {
							bot.sendMessage(msg.channel, "I will no longer send announcements to this server."); 
						}
						else {
							bot.reply(msg.channel, "An error occured.");
							return;
						}
					});
				}
			if (suffix === "on") {
				Permissions.SetAnnouncement(msg.channel.server.id, "on", function(err, allow) {
					if (err) {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
					if (allow === "on") {
						bot.sendMessage(msg.channel, "I will now send announcements on this server."); 
					}
					else {
						bot.reply(msg.channel, "An error occured.");
						return;
					}
				});
			}
			return;
		}
	}
  }
},

Commands.twitchalert = {
	name: "twitchalert",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			bot.sendMessage(msg.channel, "You didn't specify a twitch name!")
			return;
		}
		if (suffix.split(" ").length > 1) {
			bot.sendMessage(msg.channel, "Names of twitch streamers don't contain spaces!")
			return;
		}
		if (suffix.indexOf("twitch.tv") > -1) {
			bot.sendMessage(msg.channel, "Please supply a twitch name, not a twitch url.")
			return;
		}
		//streams = suffix+", "+msg.channel.id;
		var searchTerm = suffix.toLowerCase(),
		index = -1;
		for(var i = 0, len = twitchStreamers.items.length; i < len; i++) {
			if (twitchStreamers.items[i].stream === searchTerm) {
				if (twitchStreamers.items[i].channel === msg.channel.id) {
					index = i;
					break;
				}
			}
		}
		if (index > -1) {
			bot.sendMessage(msg.channel, "I will no longer notify you when "+suffix.toLowerCase()+" goes live.")
			twitchStreamers.items.splice(index, 1)
			require("fs").writeFile("./runtime/streamers.json",JSON.stringify(twitchStreamers,null,2), null);
		}
		if (index === -1) {
			var url = 'https://api.twitch.tv/kraken/streams/' + suffix.toLowerCase();
			request(url, function (error, response, data) {
				if (!error && response.statusCode == 200) {
					var parsedData = JSON.parse(data);
					bot.sendMessage(msg.channel, "I will now notify you in "+msg.channel+" when "+suffix.toLowerCase()+" goes live.")
					var testing123 = {"stream": suffix.toLowerCase(), "channel": msg.channel.id, "status": false}
					twitchStreamers.items.push(testing123)
					require("fs").writeFile("./runtime/streamers.json",JSON.stringify(twitchStreamers,null,2), null);
				}
				else {
					bot.sendMessage(msg.channel, "That name doesn't exist.");
					return;
				}
			})
		}
	}
}

Commands.createcommand = {
	name: "createcommand",
	level: 3,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			bot.sendMessage(msg.channel, "Syntax error. Correct usage: `!createcommand <command name> | <text>`. Command name cannot contain spaces.")
			return;
		}
		customcom = suffix.split(" ")[0].toLowerCase();
		customresponse = suffix.replace(customcom+ " | ", "").trim();
		if(Commands[customcom] || customcom === "help"){
			bot.sendMessage(msg.channel,"Overwriting commands with custom commands is not allowed!");
			return;
		}
		if(suffix.indexOf(" | ") < 0) {
			customresponse = ""
		}
		if (customresponse === undefined) {
			customresponse = ""
		}
		if (customresponse === "") {
			bot.sendMessage(msg.channel, "Command `"+customcom+"` has been deleted.")
		}
		else {
			bot.sendMessage(msg.channel, "Command `"+customcom+"` created with response: "+customresponse)
		}
		var testing1234 = {"command": customcom, "server": msg.channel.server.id, "response": customresponse}
		cccoms.items.forEach( function (command) {
			customsearch(testing1234, msg, command);
			if  (lll === 1) return;
		});
		//console.log(lll)
		if (lll != 1) {
			customcommands.items.push(testing1234)
		}
		require("fs").writeFile("./runtime/ccommands.json",JSON.stringify(customcommands,null,2), null);
		lll = 0;
	}
}

function customsearch (testing1234, msg, command) {
	for (var i = 0; i < cccoms.items.length; i++) {
		if (cccoms.items[i].server === testing1234.server) {
			if (cccoms.items[i].command === testing1234.command) {
				//delete cccoms.items[i]
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
			var args = suffix.split(" ");
			var name = args.shift();
			if(!name){
				return;
			} else if(Commands[name] || name === "help"){
				bot.sendMessage(msg.channel,"Overwriting commands with aliases is not allowed!");
			} else {
				var command = args.shift();
				aliases[name] = [command, args.join(" ")];
				//now save the new alias
				require("fs").writeFile("./runtime/alias.json",JSON.stringify(aliases,null,2), null);
				bot.sendMessage(msg.channel,"Created alias " + name);
			}
		}
};

Commands.announce = {
  name: "announce",
  description: "",
  extendedhelp: "",
  level: 3,
  fn: function(bot, msg, suffix) {
	Permissions.GetAnnounce(msg.channel.id, function(err, reply) {
		if (reply === "off") {
			Permissions.SetAnnounce(msg.channel.id, "on", function(err, allow) {
			if (err) {
				bot.reply(msg.channel, "An error occured.");
				return;
			}
			if (allow === "on") {
				bot.sendMessage(msg.channel, "I will now send a message in "+msg.channel+" when someone has joined, left, or been banned."); 
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
				bot.sendMessage(msg.channel, "I will no longer send a message in "+msg.channel+" when someone has joined, left, or been banned."); 
			}
			else {
				bot.reply(msg.channel, "An error occured.");
				return;
			}
			});
		}
	})
    }
  },
  
Commands.joinmessage = {
  name: "joinmessage",
  description: "Gives a link to a list of songs",
  extendedhelp: "Gives a link to a list of songs",
  level: 3,
  fn: function(bot, msg, suffix) {
      if (!suffix) {
		  bot.sendMessage(msg.channel, "The join message cannot be blank. If you wish to disable join messages, use `!announce` in the channel you want to disable join/leave/ban announce messages.")
	  }
	  else if (suffix === "current") {
		  Permissions.GetAnnounceJoinMessage(msg.channel.server.id, function(err, reply) {
			if (reply === "none") {
				bot.sendMessage(msg.channel, "The current join message is: %user% has joined!")
			}
			else {
				bot.sendMessage(msg.channel, "The current join message is: "+reply);
			}
		})
	  }
	  else {
		  Permissions.SetAnnounceJoinMessage(msg.channel.server.id, suffix, function(err, allow) {
			if (err) {
				bot.reply(msg.channel, "An error occured.");
				return;
			}
			if (allow === suffix) {
				bot.sendMessage(msg.channel, "The join message has been set to: "+suffix); 
			}
			else {
				bot.reply(msg.channel, "An error occured.");
				return;
			}
			});
	  }
    }
  },
  
/*Commands.imgtest = {
  name: "imgtest",
  level: 0,
  fn: function(bot, msg, suffix) {
	  console.log("hi")
	var size = 240 - (suffix.length * 4.5);
	gm('/root/WildBeast-master/runtime/lewd.png')
	.font('/root/WildBeast-master/runtime/animeace.ttf', size)
	.gravity('Center')
	//.fill("#143A47")
	.stroke("#043656", 10)
    .drawText(-140, 440, suffix)
	.write('/root/WildBeast-master/runtime/lewd1.png', function (err) {
		console.log(err)
		if (!err) bot.sendFile(msg.channel, '/root/WildBeast-master/runtime/lewd1.png')
	});
　　}
}

Commands.nobully = {
  name: "nobully",
  level: 0,
  fn: function(bot, msg, suffix) {
	  console.log("hi")
	var size = 240 - (suffix.length * 4.5);
	gm('/root/WildBeast-master/runtime/nobully.png')
	.font('/root/WildBeast-master/runtime/calibri.ttf', size)
	.gravity('Center')
	//.fill("#143A47")
	.fill("white")
	.stroke("#043656", 5)
    .drawText(-140, 440, suffix)
	.write('/root/WildBeast-master/runtime/nobully1.png', function (err) {
		console.log(err)
		if (!err) bot.sendFile(msg.channel, '/root/WildBeast-master/runtime/nobully1.png')
	});
　　}
}*/
  
Commands.leavemessage = {
  name: "leavemessage",
  description: "Gives a link to a list of songs",
  extendedhelp: "Gives a link to a list of songs",
  level: 3,
  fn: function(bot, msg, suffix) {
      if (!suffix) {
		  bot.sendMessage(msg.channel, "The leave message cannot be blank. If you wish to disable leave messages, use `!announce` in the channel you want to disable join/leave/ban announcements.")
	  }
	  else if (suffix === "current") {
		  Permissions.GetAnnounceLeaveMessage(msg.channel.server.id, function(err, reply) {
			if (reply === "none") {
				bot.sendMessage(msg.channel, "The current leave message is: %user% has left!")
			}
			else {
				bot.sendMessage(msg.channel, "The current leave message is: "+reply);
			}
		})
	  }
	  else {
		  Permissions.SetAnnounceLeaveMessage(msg.channel.server.id, suffix, function(err, allow) {
			if (err) {
				bot.reply(msg.channel, "An error occured.");
				return;
			}
			if (allow === suffix) {
				bot.sendMessage(msg.channel, "The leave message has been set to: "+suffix); 
			}
			else {
				bot.reply(msg.channel, "An error occured.");
				return;
			}
			});
	  }
    }
  },
  
Commands.pmmentions = {
  name: "pmmentions",
  description: "",
  extendedhelp: "",
  level: 0,
  fn: function(bot, msg, suffix) {
	if (msg.channel.isPrivate) { 
		bot.sendMessage(msg, "Use this command on the server you want to stop receiving pmmentions from!")
		return;
	}
	Permissions.GetPmMentions((msg.channel.server.id + msg.author.id), function(err, reply) {
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
	})
    }
  },

Commands.pls = {
  name: "pls",
  level: 0,
  fn: function(bot, msg, suffix) {
      bot.sendMessage(msg.channel, "pls rember that wen u feel scare or frigten\nnever forget ttimes wen u feeled happy\n\nwen day is dark alway rember happy day");
	  return;
	  }
    }
	
Commands.setname = {
	name: "setname",
	level: 5,
	fn: function(bot, msg, suffix) {
		if (!suffix) {
			bot.sendMessage(msg.channel, "You didn't give me a name to change to!");
			return;
		}
		var newUsername = suffix
		bot.updateDetails({username:newUsername}, (e) => { 
			if (e) {
				bot.sendMessage(msg.channel, "Error settings username. `"+e+"`");
			}
			else {
			bot.sendMessage(msg.channel, "Username changed to: " + newUsername);
			}
		})
	}
}

Commands.addchannel = {
	name: "addchannel",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageChannels")) { 
			bot.sendMessage(msg, "You don't have the permission `Manage Channels`! You must have this permission to use `!addchannel`")
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageChannels")) { 
			bot.sendMessage(msg, "I don't have the permission `Manage Channels`! I must have this permission for `!addchannel` to function correctly!")
			return;
		}
		var channame = suffix.split(" ")[0];
		var chantype = suffix.split(" ")[1];
		if (suffix.split(" ").length > 2) {
			bot.sendMessage(msg.channel, "Couldn't create channel. Please note that channel names cannot have spaces. Correct usage: `!addchannel gaming text`.")
			return;
		}
		if (chantype != "text" && chantype != "voice") {
			bot.sendMessage(msg.channel, "Channel type must either be text or voice. Please note that channel names cannot have spaces. Correct usage: `!addchannel gaming text`.")
			return;
		}
		bot.createChannel(msg.channel.server.id, channame, chantype, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "Error creating channel. `"+e+"`")
			}
			else {
				bot.sendMessage(msg.channel, "Created a `"+chantype+"` channel named `"+channame+"`!")
			}
		})
	}
}

Commands.topic = {
	name: "topic",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageChannels")) { 
			bot.sendMessage(msg, "You don't have the permission `Manage Channels`! You must have this permission to use `!topic`")
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageChannels")) { 
			bot.sendMessage(msg, "I don't have the permission `Manage Channels`! I must have this permission for `!topic` to function correctly!")
			return;
		}
		var chantopic = suffix;
		bot.setChannelTopic(msg.channel, chantopic, (e) => { 
			if (e) {
				bot.sendMessage(msg.channel, "Error setting channel topic. `"+e+"`") 
			}
			else {
				bot.sendMessage(msg.channel, "Changed topic to `" +suffix+"`.")
			}
		})
	}
}

Commands.delchannel = {
	name: "delchannel",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageChannels")) { 
			bot.sendMessage(msg, "You don't have the permission `Manage Channels`! You must have this permission to use `!delchannel`")
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageChannels")) { 
			bot.sendMessage(msg, "I don't have the permission `Manage Channels`! I must have this permission for `!delchannel` to function correctly!")
			return;
		}
		delchannel = "";
		var s = suffix.split(" ")[0].toLowerCase();
		var sp = s.split("");
		for (var i = 0, l = 1 << s.length; i < l; i++) {
			for (var j = i, k = 0; j; j >>= 1, k++) {
				sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
			}
			var st = sp.join("");
			//console.log(st)
			delchannel = msg.channel.server.channels.get("name", st);
			if (delchannel) {
				delchannel = msg.channel.server.channels.get("name", st);
				break;
			}
		}			
			if(suffix.split(" ").length > 1) {
				bot.sendMessage(msg.channel, "Channel names don't contain spaces.")
				return;
			}
			if (!delchannel) {
				bot.sendMessage(msg.channel, "Couldn't find channel.")
				return;
			}
			bot.deleteChannel(delchannel, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "Error deleting channel. `"+e+"`")
			}
			else {
			bot.sendMessage(msg.channel, "Successfully deleted "+suffix.split(" ")[0])
			}
		})
	}
}

Commands.color = {
	name: "color",
	level: 0,
	fn: function(bot, msg, suffix) {
			if (msg.channel.isPrivate) { 
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
			}
			if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
				bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!color`")
				return;
			}
			if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
				bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!color` to function correctly!")
				return;
			}
			var role1 = suffix.replace("_", " ").replace(/ #?[a-f0-9]{6}/i, "");
			if (role1.indexOf("_") > -1) {
				role1 = role1.replace("_", " ")
			}
			if (role1.indexOf("_") > -1) {
				role1 = role1.replace("_", " ")
			}
			if (role1.indexOf("_") > -1) {
				role1 = role1.replace("_", " ")
			}
			if (role1.indexOf("_") > -1) {
				role1 = role1.replace("_", " ")
			}
			if (role1.indexOf("_") > -1) {
				role1 = role1.replace("_", " ")
			}
			if (role1.indexOf("_") > -1) {
				role1 = role1.replace("_", " ")
			}
			var role2 = role1.slice(0, -7);
			var suffix1 = suffix.split(" ")[1]
			var suffix2 = suffix.split(" ")[2]
			var suffix3 = suffix.split(" ")[3]
			var suffix4 = suffix.split(" ")[4]
			var suffix5 = suffix.split(" ")[5]
			var suffix6 = suffix.split(" ")[6]
			var suffix7 = suffix.split(" ")[7]
			if (/^#[0-9A-F]{6}$/i.test(suffix1)) {
				suffix = suffix1;
			}
			else if (/^#[0-9A-F]{6}$/i.test(suffix2)) {
				suffix = suffix2;
			}
			else if (/^#[0-9A-F]{6}$/i.test(suffix3)) {
				suffix = suffix3;
			}
			else if (/^#[0-9A-F]{6}$/i.test(suffix4)) {
				suffix = suffix4;
			}
			else if (/^#[0-9A-F]{6}$/i.test(suffix5)) {
				suffix = suffix5;
			}
			else if (/^#[0-9A-F]{6}$/i.test(suffix6)) {
				suffix = suffix6;
			}
			else if (/^#[0-9A-F]{6}$/i.test(suffix7)) {
				suffix = suffix7;
			}
			else if (/^[0-9A-F]{6}$/i.test(suffix1)) {
				suffix = suffix1;
			}
			else if (/^[0-9A-F]{6}$/i.test(suffix2)) {
				suffix = suffix2;
			}
			else if (/^[0-9A-F]{6}$/i.test(suffix3)) {
				suffix = suffix3;
			}
			else if (/^[0-9A-F]{6}$/i.test(suffix4)) {
				suffix = suffix4;
			}
			else if (/^[0-9A-F]{6}$/i.test(suffix5)) {
				suffix = suffix5;
			}
			else if (/^[0-9A-F]{6}$/i.test(suffix6)) {
				suffix = suffix6;
			}
			else if (/^[0-9A-F]{6}$/i.test(suffix7)) {
				suffix = suffix7;
			}
			if (suffix[0] === "#") {
				suffix = suffix.replace("#", "")
			}
			if (suffix.split(" ").length != 1) {
				bot.sendMessage(msg.channel,  "That doesn't appear to be a hexadecimal color!")
				return;
			}
			if (suffix.length != 6) {
				bot.sendMessage(msg.channel, "That doesn't appear to be a hexadecimal color.")
				return;
			}
			role = "";
			var s = role1.toLowerCase();
			var sp = s.split("");
			for (var i = 0, l = 1 << s.length; i < l; i++) {
				for (var j = i, k = 0; j; j >>= 1, k++) {
					sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
				}
				var st = sp.join("");
				//console.log(st)
				role = msg.channel.server.roles.get("name", st);
				if (role) {
					role = msg.channel.server.roles.get("name", st);
					break;
				}
			}
			if (role) { 
				bot.updateRole(role, {color: parseInt(suffix.replace(/(.*) #?/, ""), 16)}, (e) => {
					if (e) {
						bot.sendMessage(msg.channel, "Error changing role color. `"+e+"`")
					}
					else {
						bot.sendMessage(msg, "Successfully changed `"+role.name+"`'s color to `"+suffix+"`")
					}
			}) 
			}
			else { 
			bot.sendMessage(msg, "Role \"" + role1 + "\" not found")
			}
}
}

Commands.add2dnsfw = {
	name: "add2dnsfw",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
				bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!addnsfw` to function correctly!")
				return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
			if (msg.mentions.length > 0) { 
				bot.sendMessage(msg.channel, "You mentioned another user. Since you don't have the permission `Manage Roles`, you can't change other users roles!")
				return;
			}
			user = msg.author.id;
			var role = msg.channel.server.roles.get("name", "Channel Role - 2D NSFW");
			if (role) {
				bot.addMemberToRole(user, role, (e) => { 
					if (e) { 
						bot.sendMessage(msg.channel, "Error adding <@"+user+"> to `Channel Role - 2D NSFW`!` "+e+"`") 
					}
					else {
						bot.sendMessage(msg.channel, "Successfully gave <@"+user+"> the `Channel Role - 2D NSFW`!")
					}
				})
			}
			else {
				bot.sendMessage(msg.channel, "The role `Channel Role - 2D NSFW` doesn't exist!")
			}
			return;
			}
		if (msg.mentions.length < 1) { 
			bot.sendMessage(msg.channel, "You must mention the users you want to add the NSFW role to!")
			return;
		}
		var role = msg.channel.server.roles.get("name", "Channel Role - 2D NSFW");
		if (role) {
		msg.mentions.map((user) => {
			bot.addMemberToRole(user, role, (e) => { 
				if (e) { 
					bot.sendMessage(msg.channel, "Error adding "+user+" to `Channel Role - 2D NSFW`!` "+e+"`") 
				}
				else {
					bot.sendMessage(msg.channel, "Successfully gave "+user+" `Channel Role - 2D NSFW`!")
				}
			})
		})
		}
		else {
			var msgArray = [];
			msgArray.push("The role `Channel Role - NSFW` doesn't exist!")
			msgArray.push("This command doesn't do anything if it doesn't exist.")
			msgArray.push("If you just want a public #nsfw text channel, just use `!setnsfw on` in that text channel.")
			msgArray.push("")
			msgArray.push("Create this role and then give it the permission to `Read Messages` in a text channel. http://i.imgur.com/LpzIr7b.png")
			msgArray.push("Remember to remove the permission `Read Messages` from everyone so they can't the text channel!! http://i.imgur.com/i0dzFoU.png")
			bot.sendMessage(msg.author, msgArray)
			}
}
}

Commands.add3dnsfw = {
	name: "add3dnsfw",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
				bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!addnsfw` to function correctly!")
				return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
			if (msg.mentions.length > 0) { 
				bot.sendMessage(msg.channel, "You mentioned another user. Since you don't have the permission `Manage Roles`, you can't change other users roles!")
				return;
			}
			user = msg.author.id;
			var role = msg.channel.server.roles.get("name", "Channel Role - 3D NSFW");
			if (role) {
				bot.addMemberToRole(user, role, (e) => { 
					if (e) { 
						bot.sendMessage(msg.channel, "Error adding <@"+user+"> to `Channel Role - 3D NSFW`!` "+e+"`") 
					}
					else {
						bot.sendMessage(msg.channel, "Successfully gave <@"+user+"> the `Channel Role - 3D NSFW`!")
					}
				})
			}
			else {
				bot.sendMessage(msg.channel, "The role `Channel Role - 3D NSFW` doesn't exist!")
			}
			return;
			}
		if (msg.mentions.length < 1) { 
			bot.sendMessage(msg.channel, "You must mention the users you want to add the 3D NSFW role to!")
			return;
		}
		var role = msg.channel.server.roles.get("name", "Channel Role - 3D NSFW");
		if (role) {
		msg.mentions.map((user) => {
			bot.addMemberToRole(user, role, (e) => { 
				if (e) { 
					bot.sendMessage(msg.channel, "Error adding "+user+" to `Channel Role - 3D NSFW`!` "+e+"`") 
				}
				else {
					bot.sendMessage(msg.channel, "Successfully gave "+user+" `Channel Role - 3D NSFW`!")
				}
			})
		})
		}
		else {
			var msgArray = [];
			msgArray.push("The role `Channel Role - 3D NSFW` doesn't exist!")
			msgArray.push("This command doesn't do anything if it doesn't exist.")
			msgArray.push("If you just want a public #nsfw text channel, just use `!setnsfw on` in that text channel.")
			msgArray.push("")
			msgArray.push("Create this role and then give it the permission to `Read Messages` in a text channel. http://i.imgur.com/LpzIr7b.png")
			msgArray.push("Remember to remove the permission `Read Messages` from everyone so they can't the text channel!! http://i.imgur.com/i0dzFoU.png")
			bot.sendMessage(msg.author, msgArray)
			}
}
}

Commands.addhg = {
	name: "addhg",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
			return;
			}
		if (msg.mentions.length < 1) { 
			bot.sendMessage(msg.channel, "You must mention the users you want to add the Hunger Games role to!")
			return;
		}
		var role = msg.channel.server.roles.get("name", "Channel Role - Hunger Games");
		if (role) {
		msg.mentions.map((user) => {
			bot.addMemberToRole(user, role, (e) => { 
				if (e) { 
					bot.sendMessage(msg.channel, "Error adding "+user+" to `Channel Role - Hunger Games`!` "+e+"`") 
				}
				else {
					bot.sendMessage(msg.channel, "Successfully gave "+user+" `Channel Role - Hunger Games`!")
				}
			})
		})
		}
		else {
			return;
			}
}
}

Commands.addbgo = {
	name: "addbgo",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
			return;
			}
		if (msg.mentions.length < 1) { 
			bot.sendMessage(msg.channel, "You must mention the users you want to add the Board Game Online role to!")
			return;
		}
		var role = msg.channel.server.roles.get("name", "Channel Role - BGO");
		if (role) {
		msg.mentions.map((user) => {
			bot.addMemberToRole(user, role, (e) => { 
				if (e) { 
					bot.sendMessage(msg.channel, "Error adding "+user+" to `Channel Role - BGO`!` "+e+"`") 
				}
				else {
					bot.sendMessage(msg.channel, "Successfully gave "+user+" `Channel Role - BGO`!")
				}
			})
		})
		}
		else {
			return;
			}
}
}

Commands.delnsfw = {
	name: "delnsfw",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
				bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!delnsfw` to function correctly!")
				return;
			}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
			if (msg.mentions.length > 0) { 
				bot.sendMessage(msg.channel, "You mentioned another user. Since you don't have the permission to edit roles, you can't change other users roles!")
				return;
			}
			user = msg.author.id;
			var role = msg.channel.server.roles.get("name", "Channel Role - NSFW");
			if (role) {
				bot.removeMemberFromRole(user, role, (e) => { 
					if (e) { 
						bot.sendMessage(msg.channel, "Error removing "+user+" from `Channel Role - NSFW`!` "+e+"`") 
					}
					else {
						bot.sendMessage(msg.channel, "Successfully removed <@"+user+"> from `Channel Role - NSFW`!")
					}
				})
			}
			else {
			bot.sendMessage(msg, "The `Channel Role - NSFW` role doesn't exist!")
			}
			return;}
		if (msg.mentions.length < 1) { 
			bot.sendMessage(msg.channel, "You must mention the users you want to add the NSFW to!")
			return;
		}
		var role = msg.channel.server.roles.get("name", "Channel Role - NSFW");
		if (role) {
		msg.mentions.map((user) => {
				bot.removeMemberFromRole(user, role, (e) => { if (e) { 
				bot.sendMessage(msg, "Error removing "+user+" from `Channel Role - NSFW`!` "+e+"`") }
				else {
				bot.sendMessage(msg, "Successfully removed "+user+" from `Channel Role - NSFW`!")
				}
			})
		})
		}
		else {
			var msgArray = [];
			msgArray.push("The role `Channel Role - NSFW` doesn't exist!")
			msgArray.push("This command doesn't do anything if it doesn't exist.")
			msgArray.push("If you just want a public #nsfw text channel, just use `!setnsfw on` in that text channel.")
			msgArray.push("")
			msgArray.push("Create this role and then give it the permission to `Read Messages` in a text channel. http://i.imgur.com/LpzIr7b.png")
			msgArray.push("Remember to remove the permission `Read Messages` from everyone so they can't the text channel!! http://i.imgur.com/i0dzFoU.png")
			bot.sendMessage(msg.author, msgArray)
			}
}
}

Commands.coloruser = {
	name: "coloruser",
	level: 0,
	fn: function(bot, msg, suffix, user) {
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
			bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!coloruser` to function correctly!")
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
			if (msg.mentions.length > 0) {
				bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You cannot change another users color!")
				return;
			}
			if (suffix.toLowerCase().indexOf("random") > -1) {
				suffix = "000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
			}
			suffixtest = /^#[a-f0-9]{6}$/i.test(suffix);
			if (suffix.length === 7 && !suffixtest) {
				bot.sendMessage(msg.channel, "That doesn't appear to be a valid hex color.")
				return;
			}
			suffixtest = /^[a-f0-9]{6}$/i.test(suffix);
			//console.log(suffixtest)
			if (suffix.length === 6 && !suffixtest) {
				bot.sendMessage(msg.channel, "That doesn't appear to be a valid hex color.")
				return;
			}
			if (suffix.length < 6 || suffix.length > 7) {
					bot.sendMessage(msg.channel, "That doesn't appear to be a valid hex color.")
					return;
			}
			user = msg.author;
			suffix = suffix.replace("#", "");
			var role = msg.channel.server.roles.get("name", "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase() );
			var roleExists = false;
			if (role) { roleExists = true; }
			msg.channel.server.rolesOfUser(user).map((r) => {
				if (r) {
					if (/^CColour - [a-f0-9]{6}$/i.test(r.name)) {
						removerole(user, r, suffix, bot, msg)
					}
					else if (/^CColour - #[a-f0-9]{6}$/i.test(r.name)) {
						removerole(user, r, suffix, bot, msg)
					}
				}
			});
			if (roleExists) {
				 setTimeout(function() { bot.addMemberToRole(user, role, (e) => { 
					if (e) { 
						bot.sendMessage(msg, "Error giving member role.` "+e+"`") 
					}
					else {
						bot.sendMessage(msg, "Successfully set!")
					}
				});  }, 500);
			} 
			else {
				msg.channel.server.createRole({color: parseInt(suffix.replace(/(.*) #?/, ""), 16), hoist: false, permissions: [], name: "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase() }, (e, rl) => {
					if (e) { bot.sendMessage(msg, "Error creating role. `"+e+"`"); return; }
					role = rl;
					roleExists = true;
					bot.addMemberToRole(user, role, (e) => { 
						if (e) { 
							bot.sendMessage(msg, "Error giving member role. `"+e+"`"); 
						}
						else {
							bot.sendMessage(msg, "Successfully set!")
						}
						});
				});
			}
			return;
		}
		if (msg.mentions.length < 1) { 
			bot.sendMessage(msg, "You must mention the users you want to change the color of!")
			return;
		}
		if (suffix.indexOf("random") > -1) {
			suffix = "000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
		}
		var role = msg.channel.server.roles.get("name", "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase() );
		var roleExists = false;
		if (role) { roleExists = true; }
		msg.mentions.map((user) => {
			msg.channel.server.rolesOfUser(user).map((r) => {
				if (r) {
					if (/^CColour - [a-f0-9]{6}$/i.test(r.name)) {
						removerole(user, r, suffix, bot, msg)
					}
					else if (/^CColour - #[a-f0-9]{6}$/i.test(r.name)) {
						removerole(user, r, suffix, bot, msg)
					}
				}
			});
			if (roleExists) {
				 setTimeout(function() { bot.addMemberToRole(user, role, (e) => { 
					if (e) { 
						bot.sendMessage(msg, "Error giving member role.` "+e+"`") 
					}
					else {
						bot.sendMessage(msg, "Successfully set!")
					}
				});  }, 500);
			} 
			else {
				msg.channel.server.createRole({color: parseInt(suffix.replace(/(.*) #?/, ""), 16), hoist: false, permissions: [], name: "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase() }, (e, rl) => {
					if (e) { bot.sendMessage(msg, "Error creating role. `"+e+"`"); return; }
					role = rl;
					roleExists = true;
					bot.addMemberToRole(user, role, (e) => { 
						if (e) { 
							bot.sendMessage(msg, "Error giving member role. `"+e+"`"); 
						}
						else {
							bot.sendMessage(msg, "Successfully set!")
						}
						});
				});
			}
		});
	}
}

function removerole (user, r, suffix, bot, msg) {
	if (r.name.indexOf("CColour") > -1 && r.name != "CColour - " + suffix.replace(/(.*) #?/, "").toLowerCase()) { 
		//console.log("hi"); 
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "error: "+e)
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name)
			}
		})
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "error: "+e)
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name)
			}
		})
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "error: "+e)
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name)
			}
		})
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				bot.sendMessage(msg.channel, "error: "+e)
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name)
			}
		})
		bot.removeMemberFromRole(user, r, (e) => {
			if (e) {
				//bot.sendMessage(msg.channel, "error: "+e)
			}
			else {
				//bot.sendMessage(msg.channel, "Deleted role: "+r.name)
			}
		})
	}
}

Commands.createrole = {
  name: "createrole",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
	if (msg.channel.isPrivate) { 
		bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
		return;
	}
	if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!createrole`")
		return;
		}
	if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!createrole` to function correctly!")
		return;
	}
	if (!suffix) {
		bot.sendMessage(msg, "You didn't specify a name for the role!")
		return;
	}
	msg.channel.server.createRole({hoist: false, permissions: [], name: suffix }, (e, rl) => {
		if (e) { bot.sendMessage(msg, "Error creating role. `"+e+"`"); return; }
		else { bot.sendMessage(msg, "Successfully created role: `"+suffix+"`") }
	});
  }
},  

Commands.delrole = {
  name: "delrole",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
	if (msg.channel.isPrivate) { 
		bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
		return;
	}
	if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!deleterole`")
		return;
		}
	if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!deleterole` to function correctly!")
		return;
	}
	if (!suffix) {
		bot.sendMessage(msg, "You didn't tell me what role to delete!")
		return;
	}
	role = "";
	var s = suffix.toLowerCase();
	var sp = s.split("");
	for (var i = 0, l = 1 << s.length; i < l; i++) {
		for (var j = i, k = 0; j; j >>= 1, k++) {
			sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
		}
		var st = sp.join("");
		//console.log(st)
		role = msg.channel.server.roles.get("name", st);
		if (role) {
			role = msg.channel.server.roles.get("name", st);
			break;
		}
	}
	//suffix = suffix.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
	if (role) {
		bot.deleteRole(role, (e) => { 
			if (e) { 
				bot.sendMessage(msg, "Error deleting role: " + e)
			}
			else {
				bot.sendMessage(msg, "Successfully deleted role: `" + role.name+ "`")
			}
	})
	}
	else {
		bot.sendMessage(msg, "That role doesn't exist!")
		return;
	}
  }
},  

Commands.addrole = {
  name: "addrole",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
	if (msg.channel.isPrivate) { 
		bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
		return;
	}
	if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!addrole`")
		return;
		}
	if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!addrole` to function correctly!")
		return;
	}
	
	if (!suffix) {
		bot.sendMessage(msg, "You didn't tell me what role to add to a user!")
		return;
	}
	if (msg.mentions.length != 1) { 
			bot.sendMessage(msg, "You must mention exactly 1 user!")
			return;
	}
		msg.mentions.map((user) => {
			if (suffix.split(" ")[0] === "<@"+user.id+">") {
				suffix = suffix.replace("<@"+user.id+">", "").substring(1)
			}
			else {
				suffix = suffix.replace("<@"+user.id+">", "").trim()
			}
			role = "";
			var s = suffix.toLowerCase();
			var sp = s.split("");
			for (var i = 0, l = 1 << s.length; i < l; i++) {
				for (var j = i, k = 0; j; j >>= 1, k++) {
					sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
				}
				var st = sp.join("");
				//console.log(st)
				role = msg.channel.server.roles.get("name", st);
				if (role) {
					role = msg.channel.server.roles.get("name", st);
					break;
				}
			}
			if (!role || role === "") {
				bot.sendMessage(msg, "Role not found.")
				return;
			}
			var hasrole = bot.memberHasRole(user, role)
			if (hasrole) {
				bot.sendMessage(msg.channel, user+" already has that role!")
				return;
			}
			bot.addMemberToRole(user, role, (e) => { 
				if (e) { 
					bot.sendMessage(msg, "Error giving member role. `"+e+"`") 
				}
				else {
					bot.sendMessage(msg, "Successfully gave `"+user.name+"` the role `"+role.name+"` !" )
				}
			})
		})
  }
},  

Commands.removerole = {
  name: "addrole",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
	if (msg.channel.isPrivate) { 
		bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
		return;
	}
	if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!addrole`")
		return;
		}
	if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
		bot.sendMessage(msg, "I don't have the permission `Manage Roles`! I must have this permission for `!addrole` to function correctly!")
		return;
	}
	
	if (!suffix) {
		bot.sendMessage(msg, "You didn't tell me what role to delete!")
		return;
	}
	if (msg.mentions.length != 1) { 
			bot.sendMessage(msg, "You must mention exactly 1 user!")
			return;
	}
		msg.mentions.map((user) => {
			if (suffix.split(" ")[0] === "<@"+user.id+">") {
				suffix = suffix.replace("<@"+user.id+">", "").substring(1)
			}
			else {
				suffix = suffix.replace("<@"+user.id+">", "").trim()
			}
			role = "";
			var s = suffix.toLowerCase();
			var sp = s.split("");
			for (var i = 0, l = 1 << s.length; i < l; i++) {
				for (var j = i, k = 0; j; j >>= 1, k++) {
					sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
				}
				var st = sp.join("");
				//console.log(st)
				role = msg.channel.server.roles.get("name", st);
				if (role) {
					role = msg.channel.server.roles.get("name", st);
					break;
				}
			}
			if (!role) {
				bot.sendMessage(msg, "Role not found.")
				return;
			}
			var hasrole = bot.memberHasRole(user, role)
			if (!hasrole) {
				bot.sendMessage(msg.channel, user+" doesn't have that role!")
				return;
			}
			bot.removeMemberFromRole(user, role, (e) => { 
				if (e) { 
					bot.sendMessage(msg, "Error removing role. `"+e+"`") 
				}
				else {
					bot.sendMessage(msg, "Successfully removed `"+user.name+"` from `"+role.name+"` !" )
				}
			})
		})
  }
},  
  
/*Commands.mute = {
	name: "mute",
	level: 0,
	fn: function(bot, msg, suffix) {
		var mutedTime;
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
			bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!mute`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
			bot.sendMessage(msg, "I don't have the required permissions to manage roles!");
			return;
		}
		if (msg.mentions.length < 1) { 
			bot.sendMessage(msg, "You must mention the users you want to mute!");
			return;
		}
		var role = msg.channel.server.roles.get("name", "Muted");
		if (role) {
			msg.mentions.map((user) => {
				bot.addMemberToRole(user, role, (e) => { 
					if (e) { 
					bot.sendMessage(msg, "Error muting "+user+"!` "+e+"`") 
					}
					else {
						bot.sendMessage(msg, "Successfully muted "+user+"!")
					}
				})
			})
		}
		else {
			var msgArray = [];
			msgArray.push("The `Muted` role doesn't exist!")
			msgArray.push("This command will do nothin if it doesn't exist.")
			msgArray.push("Create the `Muted` role and then remove the `Send Messages` permission from each individual text channel")
			msgArray.push("http://i.imgur.com/gxjfj72.png")
			msgArray.push("http://i.imgur.com/U3o18Gq.png")
			bot.sendMessage(msg.author, msgArray)
		}
		//if(mutedTime) {
		//	
		//}
}}
Commands.unmute = {
	name: "unmute",
	level: 0,
	fn: function(bot, msg, suffix) {
		if (msg.channel.isPrivate) {
			bot.sendMessage(msg, "This command must be used on a server and not in a PM!")
			return;
		}
		if (!msg.channel.permissionsOf(msg.author).hasPermission("manageRoles")) { 
			bot.sendMessage(msg, "You don't have the permission `Manage Roles`! You must have this permission to use `!unmute`");
			return;
		}
		if (!msg.channel.permissionsOf(bot.user).hasPermission("manageRoles")) { 
			bot.sendMessage(msg, "I don't have the required permissions to manage roles!");
			return;
		}
		if (msg.mentions.length < 1) { 
			bot.sendMessage(msg, "You must mention the users you want to unmute!");
			return;
		}
		var role = msg.channel.server.roles.get("name", "Muted");
		if (role) {
			msg.mentions.map((user) => {
				bot.removeMemberFromRole(user, role, (e) => { 
					if (e) { 
					bot.sendMessage(msg, "Error unmuting "+user+"!` "+e+"`") 
					}
					else {
					bot.sendMessage(msg, "Successfully unmuted "+user+"!")
					}
				})
			})
		}
		else {
			var msgArray = [];
			msgArray.push("The `Muted` role doesn't exist!")
			msgArray.push("This command will do nothin if it doesn't exist.")
			msgArray.push("Create the `Muted` role and then remove the `Send Messages` permission from each individual text channel")
			msgArray.push("http://i.imgur.com/gxjfj72.png")
			msgArray.push("http://i.imgur.com/U3o18Gq.png")
			bot.sendMessage(msg.author, msgArray)
		}
}
}*/

Commands.songlist = {
  name: "songlist",
  description: "Gives a link to a list of songs",
  extendedhelp: "Gives a link to a list of songs",
  level: 0,
  fn: function(bot, msg, suffix) {
      bot.sendMessage(msg.channel, "Here is the list of songs, " + msg.sender + ": http://puu.sh/o5lMa/3d80bc1a87.txt");
    }
  },

Commands.timpreorderedblackops3 = {
  name: "timpreorderedblackops3",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "https://www.reddit.com/r/josegasc/comments/3rpud4/breaking_news_tim_preordered_black_ops_iii_but/");
	}
  },

Commands.gidz = {
  name: "gidz",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
		bot.sendFile(msg.channel, "http://i.imgur.com/pJTsjZq.png");
	}
  },  
  
Commands.doomschamp = {
  name: "doomschamp",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
		bot.sendFile(msg.channel, "https://cdn.discordapp.com/attachments/118689714319392769/152692510647517185/3.png");
	}
  }, 

Commands.brainpower = {
  name: "brainpower",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "​​`O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A- JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA`")
	}
  }, 
  
Commands.oraoraora = {
  name: "oraoraora",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "`ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA ORA`")
	}
  },  
  
Commands.farmer = {
  name: "farmer",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "⚠ `PP FARMER ALERT` ⚠")
	}
  },  
  
Commands.principe = {
  name: "principe",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "https://www.youtube.com/watch?v=TZPlFRvisgs")
  }
  },

Commands.rood = {
  name: "rood",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
		bot.sendFile(msg.channel, "http://i.imgur.com/cU6F39n.png");
  }
  },  

Commands.nevergiveup = {
  name: "nevergiveup",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
	bot.sendMessage(msg.channel, "https://www.youtube.com/watch?v=KxGRhd_iWuE");
	}
  },
  
Commands.itstimetostop = {
  name: "itstimetostop",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
	bot.sendMessage(msg.channel, "https://www.youtube.com/watch?v=2k0SmqbBIpQ");
	}
  },
  
Commands.lenny = {
  name: "lenny",
  usage: "<wtf is this>",
  level: 0,
  fn: function(bot, msg, suffix) {
	bot.sendFile(msg.channel, "http://vignette1.wikia.nocookie.net/thelennyface/images/2/24/Lenny_face.png");
	}
  },
  
Commands.anime = {
  name: "anime",
  usage: "<anime name>",
  level: 0,
  fn: function (bot, msg, suffix) {
			if (suffix) {
				var USER = ConfigFile.mal.user;
				var PASS = ConfigFile.mal.pass;
				if (!USER || !PASS) { bot.sendMessage(msg, "MAL login not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				bot.startTyping(msg.channel);
				var tags = suffix.split(" ").join("+");
				var rUrl = "http://myanimelist.net/api/anime/search.xml?q=" + tags;
				request(rUrl, {"auth": {"user": USER, "pass": PASS, "sendImmediately": false}}, function (error, response, body) {
					if (error) { console.log(error); }
					if (!error && response.statusCode == 200) {
						xml2js.parseString(body, function (err, result){
							//console.log(result.anime.entry[0])
							var title = result.anime.entry[0].title;
							var english = result.anime.entry[0].english;
							var ep = result.anime.entry[0].episodes;
							var score = result.anime.entry[0].score;
							var type = result.anime.entry[0].type;
							var status = result.anime.entry[0].status;
							var synopsis = result.anime.entry[0].synopsis.toString();
							var picture = result.anime.entry[0].image[0];
							synopsis = synopsis.replace(/<br \/>/g, " "); synopsis = synopsis.replace(/\[(.{1,10})\]/g, "");
							synopsis = synopsis.replace(/\r?\n|\r/g, " "); synopsis = synopsis.replace(/\[(i|\/i)\]/g, "*"); synopsis = synopsis.replace(/\[(b|\/b)\]/g, "**");
							synopsis = ent.decodeHTML(synopsis);
							//if (!msg.channel.isPrivate) {
							//	if (synopsis.length > 400) { synopsis = synopsis.substring(0, 400); synopsis += "..."; }
							//}
						setTimeout(function(){ bot.sendMessage(msg, "**" + title + " / " + english+"**\n**Type:** "+ type +" **| Episodes:** "+ep+" **| Status:** "+status+" **| Score:** "+score+"\n"+synopsis); }, 2000)
						bot.sendFile(msg.channel, picture)
						});
					} else { bot.sendMessage(msg, "\""+suffix+"\" not found", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});
				bot.stopTyping(msg.channel);
			}
		}
	},
	
Commands.osu = {
  name: "osu",
  level: 0,
  usage: "<sig/user/best/recent> [username] [hex color for sig]",
		fn: function(bot, msg, suffix, user) {
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
					if (/sig (.*) #?[A-Fa-f0-9]{6}$/.test(suffix.join(" "))){
						var username = suffix.join("%20").substring(6, suffix.join("%20").lastIndexOf("%20"));
						if (suffix[suffix.length - 1].length == 6) { color = suffix[suffix.length - 1]; }
						if (suffix[suffix.length - 1].length == 7) { color = suffix[suffix.length - 1].substring(1); }
					} else if (/sig #?[A-Fa-f0-9]{6}$/.test(suffix.join(" "))) {
						var username = msg.author.username;
						if (suffix[1].length == 6) { color = suffix[1]; }
						if (suffix[1].length == 7) { color = suffix[1].substring(1); }
					}
				}
				request({url: 'https://lemmmy.pw/osusig/sig.php?colour=hex'+color+'&uname='+username+'&pp=2&flagshadow&xpbar&xpbarhex&darktriangles', encoding: null}, function(err, response, body){
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
					else if (response.statusCode != 200) { bot.sendMessage(msg, ":warning: Got status code "+response.statusCode, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
					else { bot.sendMessage(msg, "Here's your osu signature "+msg.author.username+"!");
					bot.sendFile(msg, body, 'sig.png'); }
				});

			} 
			else if (suffix.split(" ")[0] == "standard") {

				//var username = msg.author.username;
				if(suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
					var username = suffix.substring(9)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY);
				osu.getUser(username, function(err, data){
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data) { bot.sendMessage(msg, ":warning: User not found", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					var aaa = data.count300;
					var bbb = data.count100;
					var ccc = data.count50;
					var ddd = parseInt(aaa) + parseInt(bbb) + parseInt(ccc);
					var eee = ddd.toString();
					var avatar = data.user_id;
					try {
						var msgArray = [];
						msgArray.push("osu stats for: **"+data.username+"**:");
						msgArray.push("----------------------------------");
						msgArray.push("**Profile Link**: http://osu.ppy.sh/u/" +data.user_id);
						msgArray.push("**Play Count**: "+data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Ranked Score**: "+data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Total Score**: "+data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Level**: "+data.level.substring(0, data.level.split(".")[0].length+3));
						msgArray.push("**PP**: "+data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Rank**: #"+data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Country Rank**: #"+data.pp_country_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Accuracy**: "+data.accuracy.substring(0, data.accuracy.split(".")[0].length+3)+"%");
						msgArray.push("**300**: "+data.count300.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **100**: "+data.count100.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **50**: "+data.count50.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **SS**: "+data.count_rank_ss+" | **S**: "+data.count_rank_s+" | **A**: "+data.count_rank_a.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Total Hits**: " +eee.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
						msgArray.push("");
						bot.sendMessage(msg, msgArray);
						bot.sendFile(msg.channel, 'http://a.ppy.sh/'+avatar+'_1.png')
					} catch(error) { bot.sendMessage(msg, "Error: "+error, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});

			} 
			else if (suffix.split(" ")[0] == "mania") {

				if(suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
					var username = suffix.substring(6)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY, 3);
				osu.getUser(username, function(err, data){
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data) { bot.sendMessage(msg, ":warning: User not found", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					var aaa = data.count300;
					var bbb = data.count100;
					var ccc = data.count50;
					var ddd = parseInt(aaa) + parseInt(bbb) + parseInt(ccc);
					var eee = ddd.toString();
					var avatar = data.user_id;
					try {
						var msgArray = [];
						msgArray.push("osu!mania stats for: **"+data.username+"**:");
						msgArray.push("**Profile Link**: http://osu.ppy.sh/u/" +data.user_id);
						msgArray.push("----------------------------------");
						msgArray.push("**Play Count**: "+data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Ranked Score**: "+data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Total Score**: "+data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Level**: "+data.level.substring(0, data.level.split(".")[0].length+3));
						msgArray.push("**PP**: "+data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Rank**: #"+data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Country Rank**: #"+data.pp_country_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Accuracy**: "+data.accuracy.substring(0, data.accuracy.split(".")[0].length+3)+"%");
						msgArray.push("**300**: "+data.count300.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **100**: "+data.count100.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **50**: "+data.count50.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **SS**: "+data.count_rank_ss+" | **S**: "+data.count_rank_s+" | **A**: "+data.count_rank_a.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Total Hits**: " +eee.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
						msgArray.push("");
						bot.sendMessage(msg, msgArray);
						bot.sendFile(msg.channel, 'http://a.ppy.sh/'+avatar+'_1.png')
					} catch(error) { bot.sendMessage(msg, "Error: "+error, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});

			} 
			else if (suffix.split(" ")[0] == "taiko") {

				if(suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
					var username = suffix.substring(6)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY, 1);
				osu.getUser(username, function(err, data){
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data) { bot.sendMessage(msg, ":warning: User not found", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					var aaa = data.count300;
					var bbb = data.count100;
					var ccc = data.count50;
					var ddd = parseInt(aaa) + parseInt(bbb) + parseInt(ccc);
					var eee = ddd.toString();
					var avatar = data.user_id;
					try {
						var msgArray = [];
						msgArray.push("Taiko stats for: **"+data.username+"**:");
						msgArray.push("----------------------------------");
						msgArray.push("**Profile Link**: http://osu.ppy.sh/u/" +data.user_id);
						msgArray.push("**Play Count**: "+data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Ranked Score**: "+data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Total Score**: "+data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Level**: "+data.level.substring(0, data.level.split(".")[0].length+3));
						msgArray.push("**PP**: "+data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Rank**: #"+data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Country Rank**: #"+data.pp_country_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Accuracy**: "+data.accuracy.substring(0, data.accuracy.split(".")[0].length+3)+"%");
						msgArray.push("**300**: "+data.count300.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **100**: "+data.count100.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **50**: "+data.count50.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **SS**: "+data.count_rank_ss+" | **S**: "+data.count_rank_s+" | **A**: "+data.count_rank_a.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Total Hits**: " +eee.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
						msgArray.push("");
						bot.sendMessage(msg, msgArray);
						bot.sendFile(msg.channel, 'http://a.ppy.sh/'+avatar+'_1.png')
					} catch(error) { bot.sendMessage(msg, "Error: "+error, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});

			} 
			else if (suffix.split(" ")[0] == "ctb") {

				if(suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
					var username = suffix.substring(4)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY, 2);
				osu.getUser(username, function(err, data){
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data) { bot.sendMessage(msg, ":warning: User not found", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					var aaa = data.count300;
					var bbb = data.count100;
					var ccc = data.count50;
					var ddd = parseInt(aaa) + parseInt(bbb) + parseInt(ccc);
					var eee = ddd.toString();
					var avatar = data.user_id;
					try {
						var msgArray = [];
						msgArray.push("CtB stats for: **"+data.username+"**:");
						msgArray.push("----------------------------------");
						msgArray.push("**Profile Link**: http://osu.ppy.sh/u/" +data.user_id);
						msgArray.push("**Play Count**: "+data.playcount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Ranked Score**: "+data.ranked_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Total Score**: "+data.total_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Level**: "+data.level.substring(0, data.level.split(".")[0].length+3));
						msgArray.push("**PP**: "+data.pp_raw.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Rank**: #"+data.pp_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Country Rank**: #"+data.pp_country_rank.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Accuracy**: "+data.accuracy.substring(0, data.accuracy.split(".")[0].length+3)+"%");
						msgArray.push("**300**: "+data.count300.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **100**: "+data.count100.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **50**: "+data.count50.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **SS**: "+data.count_rank_ss+" | **S**: "+data.count_rank_s+" | **A**: "+data.count_rank_a.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" | **Total Hits**: " +eee.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
						msgArray.push("");
						bot.sendMessage(msg, msgArray);
						bot.sendFile(msg.channel, 'http://a.ppy.sh/'+avatar+'_1.png')
					} catch(error) { bot.sendMessage(msg, "Error: "+error, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});

			} 
			else if (suffix.split(" ")[0] === "best" && suffix.split(" ")[1] === "mania") {

				if(suffix.split(" ").length >= 3 && suffix.split(" ")[2] != "") {
					var username = suffix.substring(11)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY, 3);
				osu.getUserBest(username, function (err, data) {
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) { bot.sendMessage(msg, ":warning: User not found or user doesn't have 5 plays", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					try {
						var msgArray = [];
						msgArray.push("Top 5 osu!mania scores for: **"+username+"**:");
						msgArray.push("----------------------------------");
						osu.getBeatmap(data[0].beatmap_id, function (err, map1) { osu.getUserScore(data[0].beatmap_id, data[0].user_id, function (err, mod1) {
							var mods1 = mod1.enabled_mods;
							var modsInt = parseInt(mods1);
								var modds1 = "";
								if (modsInt == 0) {modds1 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds1 += "SO";}
								if ((modsInt & 2) == 2) {modds1 += "EZ";}
								if ((modsInt & 1) == 1) {modds1 += "NF";}
								if ((modsInt & 8) == 8) {modds1 += "HD";}
								if ((modsInt & 256) == 256) {modds1 += "HT";}
								if ((modsInt & 512) == 512) {modds1 += "NC";}
								else if ((modsInt & 64) == 64) {modds1 += "DT";}
								if ((modsInt & 16) == 16) {modds1 += "HR";}
								if ((modsInt & 32) == 32) {modds1 += "SD";}
								if ((modsInt & 16384) == 16384) {modds1 += "PF";}
								if ((modsInt & 128) == 128) {modds1 += "RX";}
								if ((modsInt & 1024) == 1024) {modds1 += "FL";}
								if ((modsInt & 2048) == 2048) {modds1 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds1 += "AP";}
								if ((modsInt & 32768) == 32768) {modds1 += "4K";}
								if ((modsInt & 65536) == 65536) {modds1 += "5K";}
								if ((modsInt & 131072) == 131072) {modds1 += "6K";}
								if ((modsInt & 262144) == 262144) {modds1 += "7K";}
								if ((modsInt & 524288) == 524288) {modds1 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds1 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds1 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds1 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds1 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds1 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds1 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds1 += "2K";}
								}
							msgArray.push("**1.** *"+map1.title+"* *(☆"+map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[0].pp.split(".")[0])+" **| Score:** "+data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[0].countmiss+" ** | Mods:** " +modds1);	
						osu.getBeatmap(data[1].beatmap_id, function (err, map2) { osu.getUserScore(data[1].beatmap_id, data[1].user_id, function (err, mod2) {
							var mods2 = mod2.enabled_mods;
							var modsInt = parseInt(mods2);
								var modds2 = "";
								if (modsInt == 0) {modds2 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds2 += "SO";}
								if ((modsInt & 2) == 2) {modds2 += "EZ";}
								if ((modsInt & 1) == 1) {modds2 += "NF";}
								if ((modsInt & 8) == 8) {modds2 += "HD";}
								if ((modsInt & 256) == 256) {modds2 += "HT";}
								if ((modsInt & 512) == 512) {modds2 += "NC";}
								else if ((modsInt & 64) == 64) {modds2 += "DT";}
								if ((modsInt & 16) == 16) {modds2 += "HR";}
								if ((modsInt & 32) == 32) {modds2 += "SD";}
								if ((modsInt & 16384) == 16384) {modds2 += "PF";}
								if ((modsInt & 128) == 128) {modds2 += "RX";}
								if ((modsInt & 1024) == 1024) {modds2 += "FL";}
								if ((modsInt & 2048) == 2048) {modds2 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds2 += "AP";}
								if ((modsInt & 32768) == 32768) {modds2 += "4K";}
								if ((modsInt & 65536) == 65536) {modds2 += "5K";}
								if ((modsInt & 131072) == 131072) {modds2 += "6K";}
								if ((modsInt & 262144) == 262144) {modds2 += "7K";}
								if ((modsInt & 524288) == 524288) {modds2 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds2 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds2 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds2 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds2 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds2 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds2 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds2 += "2K";}
								}
							msgArray.push("**2.** *"+map2.title+"* *(☆"+map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[1].pp.split(".")[0])+" **| Score:** "+data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[1].countmiss+" **| Mods:** " +modds2);
						osu.getBeatmap(data[2].beatmap_id, function (err, map3) { osu.getUserScore(data[2].beatmap_id, data[2].user_id, function (err, mod3) {
							var mods3 = mod3.enabled_mods;
							var modsInt = parseInt(mods3);
								var modds3 = "";
								if (modsInt == 0) {modds3 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds3 += "SO";}
								if ((modsInt & 2) == 2) {modds3 += "EZ";}
								if ((modsInt & 1) == 1) {modds3 += "NF";}
								if ((modsInt & 8) == 8) {modds3 += "HD";}
								if ((modsInt & 256) == 256) {modds3 += "HT";}
								if ((modsInt & 512) == 512) {modds3 += "NC";}
								else if ((modsInt & 64) == 64) {modds3 += "DT";}
								if ((modsInt & 16) == 16) {modds3 += "HR";}
								if ((modsInt & 32) == 32) {modds3 += "SD";}
								if ((modsInt & 16384) == 16384) {modds3 += "PF";}
								if ((modsInt & 128) == 128) {modds3 += "RX";}
								if ((modsInt & 1024) == 1024) {modds3 += "FL";}
								if ((modsInt & 2048) == 2048) {modds3 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds3 += "AP";}
								if ((modsInt & 32768) == 32768) {modds3 += "4K";}
								if ((modsInt & 65536) == 65536) {modds3 += "5K";}
								if ((modsInt & 131072) == 131072) {modds3 += "6K";}
								if ((modsInt & 262144) == 262144) {modds3 += "7K";}
								if ((modsInt & 524288) == 524288) {modds3 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds3 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds3 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds3 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds3 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds3 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds3 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds3 += "2K";}
								}
							msgArray.push("**3.** *"+map3.title+"* *(☆"+map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[2].pp.split(".")[0])+" **| Score:** "+data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[2].countmiss+" **| Mods:** " +modds3);						
						osu.getBeatmap(data[3].beatmap_id, function (err, map4) { osu.getUserScore(data[3].beatmap_id, data[3].user_id, function (err, mod4) {
							var mods4 = mod4.enabled_mods;
							var modsInt = parseInt(mods4);
								var modds4 = "";
								if (modsInt == 0) {modds4 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds4 += "SO";}
								if ((modsInt & 2) == 2) {modds4 += "EZ";}
								if ((modsInt & 1) == 1) {modds4 += "NF";}
								if ((modsInt & 8) == 8) {modds4 += "HD";}
								if ((modsInt & 256) == 256) {modds4 += "HT";}
								if ((modsInt & 512) == 512) {modds4 += "NC";}
								else if ((modsInt & 64) == 64) {modds4 += "DT";}
								if ((modsInt & 16) == 16) {modds4 += "HR";}
								if ((modsInt & 32) == 32) {modds4 += "SD";}
								if ((modsInt & 16384) == 16384) {modds4 += "PF";}
								if ((modsInt & 128) == 128) {modds4 += "RX";}
								if ((modsInt & 1024) == 1024) {modds4 += "FL";}
								if ((modsInt & 2048) == 2048) {modds4 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds4 += "AP";}
								if ((modsInt & 32768) == 32768) {modds4 += "4K";}
								if ((modsInt & 65536) == 65536) {modds4 += "5K";}
								if ((modsInt & 131072) == 131072) {modds4 += "6K";}
								if ((modsInt & 262144) == 262144) {modds4 += "7K";}
								if ((modsInt & 524288) == 524288) {modds4 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds4 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds4 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds4 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds4 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds4 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds4 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds4 += "2K";}
								}
							msgArray.push("**4.** *"+map4.title+"* *(☆"+map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[3].pp.split(".")[0])+" **| Score:** "+data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[3].countmiss+" **| Mods:** " +modds4);			
						osu.getBeatmap(data[4].beatmap_id, function (err, map5) { osu.getUserScore(data[4].beatmap_id, data[4].user_id, function (err, mod5) {
							var mods5 = mod5.enabled_mods;
							var modsInt = parseInt(mods5);
								var modds5 = "";
								if (modsInt == 0) {modds5 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds5 += "SO";}
								if ((modsInt & 2) == 2) {modds5 += "EZ";}
								if ((modsInt & 1) == 1) {modds5 += "NF";}
								if ((modsInt & 8) == 8) {modds5 += "HD";}
								if ((modsInt & 256) == 256) {modds5 += "HT";}
								if ((modsInt & 512) == 512) {modds5 += "NC";}
								else if ((modsInt & 64) == 64) {modds5 += "DT";}
								if ((modsInt & 16) == 16) {modds5 += "HR";}
								if ((modsInt & 32) == 32) {modds5 += "SD";}
								if ((modsInt & 16384) == 16384) {modds5 += "PF";}
								if ((modsInt & 128) == 128) {modds5 += "RX";}
								if ((modsInt & 1024) == 1024) {modds5 += "FL";}
								if ((modsInt & 2048) == 2048) {modds5 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds5 += "AP";}
								if ((modsInt & 32768) == 32768) {modds5 += "4K";}
								if ((modsInt & 65536) == 65536) {modds5 += "5K";}
								if ((modsInt & 131072) == 131072) {modds5 += "6K";}
								if ((modsInt & 262144) == 262144) {modds5 += "7K";}
								if ((modsInt & 524288) == 524288) {modds5 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds5 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds5 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds5 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds5 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds5 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds5 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds5 += "2K";}
								}
							msgArray.push("**5.** *"+map5.title+"* *(☆"+map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[4].pp.split(".")[0])+" **| Score:** "+data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[4].countmiss+" **| Mods:** " +modds5);
						bot.sendMessage(msg, msgArray);
					});});});});});});});});});});
					} catch(error) { bot.sendMessage(msg, "Error: "+error, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});

			} 
			else if (suffix.split(" ")[0] === "best" && suffix.split(" ")[1] === "standard") {

				if(suffix.split(" ").length >= 3 && suffix.split(" ")[2] != "") {
					var username = suffix.substring(14)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY);
				osu.getUserBest(username, function (err, data) {
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) { bot.sendMessage(msg, ":warning: User not found or user doesn't have 5 plays", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					try {
						var msgArray = [];
						msgArray.push("Top 5 osu scores for: **"+username+"**:");
						msgArray.push("----------------------------------");
						osu.getBeatmap(data[0].beatmap_id, function (err, map1) { osu.getUserScore(data[0].beatmap_id, data[0].user_id, function (err, mod1) {
							var mods1 = mod1.enabled_mods;
							var modsInt = parseInt(mods1);
								var modds1 = "";
								if (modsInt == 0) {modds1 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds1 += "SO";}
								if ((modsInt & 2) == 2) {modds1 += "EZ";}
								if ((modsInt & 1) == 1) {modds1 += "NF";}
								if ((modsInt & 8) == 8) {modds1 += "HD";}
								if ((modsInt & 256) == 256) {modds1 += "HT";}
								if ((modsInt & 512) == 512) {modds1 += "NC";}
								else if ((modsInt & 64) == 64) {modds1 += "DT";}
								if ((modsInt & 16) == 16) {modds1 += "HR";}
								if ((modsInt & 32) == 32) {modds1 += "SD";}
								if ((modsInt & 16384) == 16384) {modds1 += "PF";}
								if ((modsInt & 128) == 128) {modds1 += "RX";}
								if ((modsInt & 1024) == 1024) {modds1 += "FL";}
								if ((modsInt & 2048) == 2048) {modds1 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds1 += "AP";}
								if ((modsInt & 32768) == 32768) {modds1 += "4K";}
								if ((modsInt & 65536) == 65536) {modds1 += "5K";}
								if ((modsInt & 131072) == 131072) {modds1 += "6K";}
								if ((modsInt & 262144) == 262144) {modds1 += "7K";}
								if ((modsInt & 524288) == 524288) {modds1 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds1 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds1 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds1 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds1 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds1 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds1 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds1 += "2K";}
								}
							msgArray.push("**1.** *"+map1.title+"* *(☆"+map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[0].pp.split(".")[0])+" **| Score:** "+data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[0].countmiss+" ** | Mods:** " +modds1);	
						osu.getBeatmap(data[1].beatmap_id, function (err, map2) { osu.getUserScore(data[1].beatmap_id, data[1].user_id, function (err, mod2) {
							var mods2 = mod2.enabled_mods;
							var modsInt = parseInt(mods2);
								var modds2 = "";
								if (modsInt == 0) {modds2 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds2 += "SO";}
								if ((modsInt & 2) == 2) {modds2 += "EZ";}
								if ((modsInt & 1) == 1) {modds2 += "NF";}
								if ((modsInt & 8) == 8) {modds2 += "HD";}
								if ((modsInt & 256) == 256) {modds2 += "HT";}
								if ((modsInt & 512) == 512) {modds2 += "NC";}
								else if ((modsInt & 64) == 64) {modds2 += "DT";}
								if ((modsInt & 16) == 16) {modds2 += "HR";}
								if ((modsInt & 32) == 32) {modds2 += "SD";}
								if ((modsInt & 16384) == 16384) {modds2 += "PF";}
								if ((modsInt & 128) == 128) {modds2 += "RX";}
								if ((modsInt & 1024) == 1024) {modds2 += "FL";}
								if ((modsInt & 2048) == 2048) {modds2 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds2 += "AP";}
								if ((modsInt & 32768) == 32768) {modds2 += "4K";}
								if ((modsInt & 65536) == 65536) {modds2 += "5K";}
								if ((modsInt & 131072) == 131072) {modds2 += "6K";}
								if ((modsInt & 262144) == 262144) {modds2 += "7K";}
								if ((modsInt & 524288) == 524288) {modds2 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds2 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds2 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds2 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds2 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds2 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds2 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds2 += "2K";}
								}
							msgArray.push("**2.** *"+map2.title+"* *(☆"+map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[1].pp.split(".")[0])+" **| Score:** "+data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[1].countmiss+" **| Mods:** " +modds2);
						osu.getBeatmap(data[2].beatmap_id, function (err, map3) { osu.getUserScore(data[2].beatmap_id, data[2].user_id, function (err, mod3) {
							var mods3 = mod3.enabled_mods;
							var modsInt = parseInt(mods3);
								var modds3 = "";
								if (modsInt == 0) {modds3 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds3 += "SO";}
								if ((modsInt & 2) == 2) {modds3 += "EZ";}
								if ((modsInt & 1) == 1) {modds3 += "NF";}
								if ((modsInt & 8) == 8) {modds3 += "HD";}
								if ((modsInt & 256) == 256) {modds3 += "HT";}
								if ((modsInt & 512) == 512) {modds3 += "NC";}
								else if ((modsInt & 64) == 64) {modds3 += "DT";}
								if ((modsInt & 16) == 16) {modds3 += "HR";}
								if ((modsInt & 32) == 32) {modds3 += "SD";}
								if ((modsInt & 16384) == 16384) {modds3 += "PF";}
								if ((modsInt & 128) == 128) {modds3 += "RX";}
								if ((modsInt & 1024) == 1024) {modds3 += "FL";}
								if ((modsInt & 2048) == 2048) {modds3 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds3 += "AP";}
								if ((modsInt & 32768) == 32768) {modds3 += "4K";}
								if ((modsInt & 65536) == 65536) {modds3 += "5K";}
								if ((modsInt & 131072) == 131072) {modds3 += "6K";}
								if ((modsInt & 262144) == 262144) {modds3 += "7K";}
								if ((modsInt & 524288) == 524288) {modds3 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds3 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds3 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds3 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds3 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds3 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds3 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds3 += "2K";}
								}
							msgArray.push("**3.** *"+map3.title+"* *(☆"+map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[2].pp.split(".")[0])+" **| Score:** "+data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[2].countmiss+" **| Mods:** " +modds3);						
						osu.getBeatmap(data[3].beatmap_id, function (err, map4) { osu.getUserScore(data[3].beatmap_id, data[3].user_id, function (err, mod4) {
							var mods4 = mod4.enabled_mods;
							var modsInt = parseInt(mods4);
								var modds4 = "";
								if (modsInt == 0) {modds4 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds4 += "SO";}
								if ((modsInt & 2) == 2) {modds4 += "EZ";}
								if ((modsInt & 1) == 1) {modds4 += "NF";}
								if ((modsInt & 8) == 8) {modds4 += "HD";}
								if ((modsInt & 256) == 256) {modds4 += "HT";}
								if ((modsInt & 512) == 512) {modds4 += "NC";}
								else if ((modsInt & 64) == 64) {modds4 += "DT";}
								if ((modsInt & 16) == 16) {modds4 += "HR";}
								if ((modsInt & 32) == 32) {modds4 += "SD";}
								if ((modsInt & 16384) == 16384) {modds4 += "PF";}
								if ((modsInt & 128) == 128) {modds4 += "RX";}
								if ((modsInt & 1024) == 1024) {modds4 += "FL";}
								if ((modsInt & 2048) == 2048) {modds4 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds4 += "AP";}
								if ((modsInt & 32768) == 32768) {modds4 += "4K";}
								if ((modsInt & 65536) == 65536) {modds4 += "5K";}
								if ((modsInt & 131072) == 131072) {modds4 += "6K";}
								if ((modsInt & 262144) == 262144) {modds4 += "7K";}
								if ((modsInt & 524288) == 524288) {modds4 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds4 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds4 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds4 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds4 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds4 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds4 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds4 += "2K";}
								}
							msgArray.push("**4.** *"+map4.title+"* *(☆"+map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[3].pp.split(".")[0])+" **| Score:** "+data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[3].countmiss+" **| Mods:** " +modds4);			
						osu.getBeatmap(data[4].beatmap_id, function (err, map5) { osu.getUserScore(data[4].beatmap_id, data[4].user_id, function (err, mod5) {
							var mods5 = mod5.enabled_mods;
							var modsInt = parseInt(mods5);
								var modds5 = "";
								if (modsInt == 0) {modds5 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds5 += "SO";}
								if ((modsInt & 2) == 2) {modds5 += "EZ";}
								if ((modsInt & 1) == 1) {modds5 += "NF";}
								if ((modsInt & 8) == 8) {modds5 += "HD";}
								if ((modsInt & 256) == 256) {modds5 += "HT";}
								if ((modsInt & 512) == 512) {modds5 += "NC";}
								else if ((modsInt & 64) == 64) {modds5 += "DT";}
								if ((modsInt & 16) == 16) {modds5 += "HR";}
								if ((modsInt & 32) == 32) {modds5 += "SD";}
								if ((modsInt & 16384) == 16384) {modds5 += "PF";}
								if ((modsInt & 128) == 128) {modds5 += "RX";}
								if ((modsInt & 1024) == 1024) {modds5 += "FL";}
								if ((modsInt & 2048) == 2048) {modds5 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds5 += "AP";}
								if ((modsInt & 32768) == 32768) {modds5 += "4K";}
								if ((modsInt & 65536) == 65536) {modds5 += "5K";}
								if ((modsInt & 131072) == 131072) {modds5 += "6K";}
								if ((modsInt & 262144) == 262144) {modds5 += "7K";}
								if ((modsInt & 524288) == 524288) {modds5 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds5 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds5 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds5 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds5 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds5 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds5 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds5 += "2K";}
								}
							msgArray.push("**5.** *"+map5.title+"* *(☆"+map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[4].pp.split(".")[0])+" **| Score:** "+data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[4].countmiss+" **| Mods:** " +modds5);
						bot.sendMessage(msg, msgArray);
					});});});});});});});});});});
					} catch(error) { bot.sendMessage(msg, "Error: "+error, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});

			} 
			else if (suffix.split(" ")[0] === "best" && suffix.split(" ")[1] === "ctb") {

				if(suffix.split(" ").length >= 3 && suffix.split(" ")[2] != "") {
					var username = suffix.substring(9)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY, 2);
				osu.getUserBest(username, function (err, data) {
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) { bot.sendMessage(msg, ":warning: User not found or user doesn't have 5 plays", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					try {
						var msgArray = [];
						msgArray.push("Top 5 osu scores for: **"+username+"**:");
						msgArray.push("----------------------------------");
						osu.getBeatmap(data[0].beatmap_id, function (err, map1) { osu.getUserScore(data[0].beatmap_id, data[0].user_id, function (err, mod1) {
							var mods1 = mod1.enabled_mods;
								var modsInt = parseInt(mods1);
								var modds1 = "";
								if (modsInt == 0) {modds1 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds1 += "SO";}
								if ((modsInt & 2) == 2) {modds1 += "EZ";}
								if ((modsInt & 1) == 1) {modds1 += "NF";}
								if ((modsInt & 8) == 8) {modds1 += "HD";}
								if ((modsInt & 256) == 256) {modds1 += "HT";}
								if ((modsInt & 512) == 512) {modds1 += "NC";}
								else if ((modsInt & 64) == 64) {modds1 += "DT";}
								if ((modsInt & 16) == 16) {modds1 += "HR";}
								if ((modsInt & 32) == 32) {modds1 += "SD";}
								if ((modsInt & 16384) == 16384) {modds1 += "PF";}
								if ((modsInt & 128) == 128) {modds1 += "RX";}
								if ((modsInt & 1024) == 1024) {modds1 += "FL";}
								if ((modsInt & 2048) == 2048) {modds1 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds1 += "AP";}
								if ((modsInt & 32768) == 32768) {modds1 += "4K";}
								if ((modsInt & 65536) == 65536) {modds1 += "5K";}
								if ((modsInt & 131072) == 131072) {modds1 += "6K";}
								if ((modsInt & 262144) == 262144) {modds1 += "7K";}
								if ((modsInt & 524288) == 524288) {modds1 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds1 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds1 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds1 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds1 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds1 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds1 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds1 += "2K";}
								}
							msgArray.push("**1.** *"+map1.title+"* *(☆"+map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[0].pp.split(".")[0])+" **| Score:** "+data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[0].countmiss+" ** | Mods:** " +modds1);	
						osu.getBeatmap(data[1].beatmap_id, function (err, map2) { osu.getUserScore(data[1].beatmap_id, data[1].user_id, function (err, mod2) {
							var mods2 = mod2.enabled_mods;
								var modsInt = parseInt(mods2);
								var modds2 = "";
								if (modsInt == 0) {modds2 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds2 += "SO";}
								if ((modsInt & 2) == 2) {modds2 += "EZ";}
								if ((modsInt & 1) == 1) {modds2 += "NF";}
								if ((modsInt & 8) == 8) {modds2 += "HD";}
								if ((modsInt & 256) == 256) {modds2 += "HT";}
								if ((modsInt & 512) == 512) {modds2 += "NC";}
								else if ((modsInt & 64) == 64) {modds2 += "DT";}
								if ((modsInt & 16) == 16) {modds2 += "HR";}
								if ((modsInt & 32) == 32) {modds2 += "SD";}
								if ((modsInt & 16384) == 16384) {modds2 += "PF";}
								if ((modsInt & 128) == 128) {modds2 += "RX";}
								if ((modsInt & 1024) == 1024) {modds2 += "FL";}
								if ((modsInt & 2048) == 2048) {modds2 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds2 += "AP";}
								if ((modsInt & 32768) == 32768) {modds2 += "4K";}
								if ((modsInt & 65536) == 65536) {modds2 += "5K";}
								if ((modsInt & 131072) == 131072) {modds2 += "6K";}
								if ((modsInt & 262144) == 262144) {modds2 += "7K";}
								if ((modsInt & 524288) == 524288) {modds2 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds2 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds2 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds2 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds2 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds2 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds2 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds2 += "2K";}
								}
						msgArray.push("**2.** *"+map2.title+"* *(☆"+map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[1].pp.split(".")[0])+" **| Score:** "+data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[1].countmiss+" **| Mods:** " +modds2);
						osu.getBeatmap(data[2].beatmap_id, function (err, map3) { osu.getUserScore(data[2].beatmap_id, data[2].user_id, function (err, mod3) {
							var mods3 = mod3.enabled_mods;
							var modsInt = parseInt(mods3);
								var modds3 = "";
								if (modsInt == 0) {modds3 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds3 += "SO";}
								if ((modsInt & 2) == 2) {modds3 += "EZ";}
								if ((modsInt & 1) == 1) {modds3 += "NF";}
								if ((modsInt & 8) == 8) {modds3 += "HD";}
								if ((modsInt & 256) == 256) {modds3 += "HT";}
								if ((modsInt & 512) == 512) {modds3 += "NC";}
								else if ((modsInt & 64) == 64) {modds3 += "DT";}
								if ((modsInt & 16) == 16) {modds3 += "HR";}
								if ((modsInt & 32) == 32) {modds3 += "SD";}
								if ((modsInt & 16384) == 16384) {modds3 += "PF";}
								if ((modsInt & 128) == 128) {modds3 += "RX";}
								if ((modsInt & 1024) == 1024) {modds3 += "FL";}
								if ((modsInt & 2048) == 2048) {modds3 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds3 += "AP";}
								if ((modsInt & 32768) == 32768) {modds3 += "4K";}
								if ((modsInt & 65536) == 65536) {modds3 += "5K";}
								if ((modsInt & 131072) == 131072) {modds3 += "6K";}
								if ((modsInt & 262144) == 262144) {modds3 += "7K";}
								if ((modsInt & 524288) == 524288) {modds3 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds3 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds3 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds3 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds3 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds3 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds3 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds3 += "2K";}
								}
							msgArray.push("**3.** *"+map3.title+"* *(☆"+map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[2].pp.split(".")[0])+" **| Score:** "+data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[2].countmiss+" **| Mods:** " +modds3);						
						osu.getBeatmap(data[3].beatmap_id, function (err, map4) { osu.getUserScore(data[3].beatmap_id, data[3].user_id, function (err, mod4) {
							var mods4 = mod4.enabled_mods;
							var modsInt = parseInt(mods4);
								var modds4 = "";
								if (modsInt == 0) {modds4 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds4 += "SO";}
								if ((modsInt & 2) == 2) {modds4 += "EZ";}
								if ((modsInt & 1) == 1) {modds4 += "NF";}
								if ((modsInt & 8) == 8) {modds4 += "HD";}
								if ((modsInt & 256) == 256) {modds4 += "HT";}
								if ((modsInt & 512) == 512) {modds4 += "NC";}
								else if ((modsInt & 64) == 64) {modds4 += "DT";}
								if ((modsInt & 16) == 16) {modds4 += "HR";}
								if ((modsInt & 32) == 32) {modds4 += "SD";}
								if ((modsInt & 16384) == 16384) {modds4 += "PF";}
								if ((modsInt & 128) == 128) {modds4 += "RX";}
								if ((modsInt & 1024) == 1024) {modds4 += "FL";}
								if ((modsInt & 2048) == 2048) {modds4 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds4 += "AP";}
								if ((modsInt & 32768) == 32768) {modds4 += "4K";}
								if ((modsInt & 65536) == 65536) {modds4 += "5K";}
								if ((modsInt & 131072) == 131072) {modds4 += "6K";}
								if ((modsInt & 262144) == 262144) {modds4 += "7K";}
								if ((modsInt & 524288) == 524288) {modds4 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds4 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds4 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds4 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds4 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds4 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds4 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds4 += "2K";}
								}
							msgArray.push("**4.** *"+map4.title+"* *(☆"+map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[3].pp.split(".")[0])+" **| Score:** "+data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[3].countmiss+" **| Mods:** " +modds4);			
						osu.getBeatmap(data[4].beatmap_id, function (err, map5) { osu.getUserScore(data[4].beatmap_id, data[4].user_id, function (err, mod5) {
							var mods5 = mod5.enabled_mods;
							var modsInt = parseInt(mods5);
								var modds5 = "";
								if (modsInt == 0) {modds5 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds5 += "SO";}
								if ((modsInt & 2) == 2) {modds5 += "EZ";}
								if ((modsInt & 1) == 1) {modds5 += "NF";}
								if ((modsInt & 8) == 8) {modds5 += "HD";}
								if ((modsInt & 256) == 256) {modds5 += "HT";}
								if ((modsInt & 512) == 512) {modds5 += "NC";}
								else if ((modsInt & 64) == 64) {modds5 += "DT";}
								if ((modsInt & 16) == 16) {modds5 += "HR";}
								if ((modsInt & 32) == 32) {modds5 += "SD";}
								if ((modsInt & 16384) == 16384) {modds5 += "PF";}
								if ((modsInt & 128) == 128) {modds5 += "RX";}
								if ((modsInt & 1024) == 1024) {modds5 += "FL";}
								if ((modsInt & 2048) == 2048) {modds5 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds5 += "AP";}
								if ((modsInt & 32768) == 32768) {modds5 += "4K";}
								if ((modsInt & 65536) == 65536) {modds5 += "5K";}
								if ((modsInt & 131072) == 131072) {modds5 += "6K";}
								if ((modsInt & 262144) == 262144) {modds5 += "7K";}
								if ((modsInt & 524288) == 524288) {modds5 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds5 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds5 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds5 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds5 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds5 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds5 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds5 += "2K";}
								}
							msgArray.push("**5.** *"+map5.title+"* *(☆"+map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[4].pp.split(".")[0])+" **| Score:** "+data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[4].countmiss+" **| Mods:** " +modds5);
						bot.sendMessage(msg, msgArray);
					});});});});});});});});});});
					} catch(error) { bot.sendMessage(msg, "Error: "+error, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});

			} 
			else if (suffix.split(" ")[0] === "best" && suffix.split(" ")[1] === "taiko") {

				if(suffix.split(" ").length >= 3 && suffix.split(" ")[2] != "") {
					var username = suffix.substring(11)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY, 1);
				osu.getUserBest(username, function (err, data) {
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data || !data[0] || !data[1] || !data[2] || !data[3] || !data[4]) { bot.sendMessage(msg, ":warning: User not found or user doesn't have 5 plays", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					try {
						var msgArray = [];
						msgArray.push("Top 5 osu scores for: **"+username+"**:");
						msgArray.push("----------------------------------");
						osu.getBeatmap(data[0].beatmap_id, function (err, map1) { osu.getUserScore(data[0].beatmap_id, data[0].user_id, function (err, mod1) {
							var mods1 = mod1.enabled_mods;
								var modsInt = parseInt(mods1);
								var modds1 = "";
								if (modsInt == 0) {modds1 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds1 += "SO";}
								if ((modsInt & 2) == 2) {modds1 += "EZ";}
								if ((modsInt & 1) == 1) {modds1 += "NF";}
								if ((modsInt & 8) == 8) {modds1 += "HD";}
								if ((modsInt & 256) == 256) {modds1 += "HT";}
								if ((modsInt & 512) == 512) {modds1 += "NC";}
								else if ((modsInt & 64) == 64) {modds1 += "DT";}
								if ((modsInt & 16) == 16) {modds1 += "HR";}
								if ((modsInt & 32) == 32) {modds1 += "SD";}
								if ((modsInt & 16384) == 16384) {modds1 += "PF";}
								if ((modsInt & 128) == 128) {modds1 += "RX";}
								if ((modsInt & 1024) == 1024) {modds1 += "FL";}
								if ((modsInt & 2048) == 2048) {modds1 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds1 += "AP";}
								if ((modsInt & 32768) == 32768) {modds1 += "4K";}
								if ((modsInt & 65536) == 65536) {modds1 += "5K";}
								if ((modsInt & 131072) == 131072) {modds1 += "6K";}
								if ((modsInt & 262144) == 262144) {modds1 += "7K";}
								if ((modsInt & 524288) == 524288) {modds1 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds1 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds1 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds1 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds1 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds1 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds1 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds1 += "2K";}
								}
							msgArray.push("**1.** *"+map1.title+"* *(☆"+map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[0].pp.split(".")[0])+" **| Score:** "+data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[0].countmiss+" ** | Mods:** " +modds1);	
						osu.getBeatmap(data[1].beatmap_id, function (err, map2) { osu.getUserScore(data[1].beatmap_id, data[1].user_id, function (err, mod2) {
							var mods2 = mod2.enabled_mods;
								var modsInt = parseInt(mods2);
								var modds2 = "";
								if (modsInt == 0) {modds2 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds2 += "SO";}
								if ((modsInt & 2) == 2) {modds2 += "EZ";}
								if ((modsInt & 1) == 1) {modds2 += "NF";}
								if ((modsInt & 8) == 8) {modds2 += "HD";}
								if ((modsInt & 256) == 256) {modds2 += "HT";}
								if ((modsInt & 512) == 512) {modds2 += "NC";}
								else if ((modsInt & 64) == 64) {modds2 += "DT";}
								if ((modsInt & 16) == 16) {modds2 += "HR";}
								if ((modsInt & 32) == 32) {modds2 += "SD";}
								if ((modsInt & 16384) == 16384) {modds2 += "PF";}
								if ((modsInt & 128) == 128) {modds2 += "RX";}
								if ((modsInt & 1024) == 1024) {modds2 += "FL";}
								if ((modsInt & 2048) == 2048) {modds2 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds2 += "AP";}
								if ((modsInt & 32768) == 32768) {modds2 += "4K";}
								if ((modsInt & 65536) == 65536) {modds2 += "5K";}
								if ((modsInt & 131072) == 131072) {modds2 += "6K";}
								if ((modsInt & 262144) == 262144) {modds2 += "7K";}
								if ((modsInt & 524288) == 524288) {modds2 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds2 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds2 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds2 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds2 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds2 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds2 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds2 += "2K";}
								}
						msgArray.push("**2.** *"+map2.title+"* *(☆"+map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[1].pp.split(".")[0])+" **| Score:** "+data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[1].countmiss+" **| Mods:** " +modds2);
						osu.getBeatmap(data[2].beatmap_id, function (err, map3) { osu.getUserScore(data[2].beatmap_id, data[2].user_id, function (err, mod3) {
							var mods3 = mod3.enabled_mods;
							var modsInt = parseInt(mods3);
								var modds3 = "";
								if (modsInt == 0) {modds3 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds3 += "SO";}
								if ((modsInt & 2) == 2) {modds3 += "EZ";}
								if ((modsInt & 1) == 1) {modds3 += "NF";}
								if ((modsInt & 8) == 8) {modds3 += "HD";}
								if ((modsInt & 256) == 256) {modds3 += "HT";}
								if ((modsInt & 512) == 512) {modds3 += "NC";}
								else if ((modsInt & 64) == 64) {modds3 += "DT";}
								if ((modsInt & 16) == 16) {modds3 += "HR";}
								if ((modsInt & 32) == 32) {modds3 += "SD";}
								if ((modsInt & 16384) == 16384) {modds3 += "PF";}
								if ((modsInt & 128) == 128) {modds3 += "RX";}
								if ((modsInt & 1024) == 1024) {modds3 += "FL";}
								if ((modsInt & 2048) == 2048) {modds3 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds3 += "AP";}
								if ((modsInt & 32768) == 32768) {modds3 += "4K";}
								if ((modsInt & 65536) == 65536) {modds3 += "5K";}
								if ((modsInt & 131072) == 131072) {modds3 += "6K";}
								if ((modsInt & 262144) == 262144) {modds3 += "7K";}
								if ((modsInt & 524288) == 524288) {modds3 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds3 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds3 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds3 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds3 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds3 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds3 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds3 += "2K";}
								}
							msgArray.push("**3.** *"+map3.title+"* *(☆"+map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[2].pp.split(".")[0])+" **| Score:** "+data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[2].countmiss+" **| Mods:** " +modds3);						
						osu.getBeatmap(data[3].beatmap_id, function (err, map4) { osu.getUserScore(data[3].beatmap_id, data[3].user_id, function (err, mod4) {
							var mods4 = mod4.enabled_mods;
							var modsInt = parseInt(mods4);
								var modds4 = "";
								if (modsInt == 0) {modds4 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds4 += "SO";}
								if ((modsInt & 2) == 2) {modds4 += "EZ";}
								if ((modsInt & 1) == 1) {modds4 += "NF";}
								if ((modsInt & 8) == 8) {modds4 += "HD";}
								if ((modsInt & 256) == 256) {modds4 += "HT";}
								if ((modsInt & 512) == 512) {modds4 += "NC";}
								else if ((modsInt & 64) == 64) {modds4 += "DT";}
								if ((modsInt & 16) == 16) {modds4 += "HR";}
								if ((modsInt & 32) == 32) {modds4 += "SD";}
								if ((modsInt & 16384) == 16384) {modds4 += "PF";}
								if ((modsInt & 128) == 128) {modds4 += "RX";}
								if ((modsInt & 1024) == 1024) {modds4 += "FL";}
								if ((modsInt & 2048) == 2048) {modds4 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds4 += "AP";}
								if ((modsInt & 32768) == 32768) {modds4 += "4K";}
								if ((modsInt & 65536) == 65536) {modds4 += "5K";}
								if ((modsInt & 131072) == 131072) {modds4 += "6K";}
								if ((modsInt & 262144) == 262144) {modds4 += "7K";}
								if ((modsInt & 524288) == 524288) {modds4 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds4 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds4 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds4 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds4 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds4 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds4 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds4 += "2K";}
								}
							msgArray.push("**4.** *"+map4.title+"* *(☆"+map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[3].pp.split(".")[0])+" **| Score:** "+data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[3].countmiss+" **| Mods:** " +modds4);			
						osu.getBeatmap(data[4].beatmap_id, function (err, map5) { osu.getUserScore(data[4].beatmap_id, data[4].user_id, function (err, mod5) {
							var mods5 = mod5.enabled_mods;
							var modsInt = parseInt(mods5);
								var modds5 = "";
								if (modsInt == 0) {modds5 = "None";}
								else {
								if ((modsInt & 4096) == 4096) {modds5 += "SO";}
								if ((modsInt & 2) == 2) {modds5 += "EZ";}
								if ((modsInt & 1) == 1) {modds5 += "NF";}
								if ((modsInt & 8) == 8) {modds5 += "HD";}
								if ((modsInt & 256) == 256) {modds5 += "HT";}
								if ((modsInt & 512) == 512) {modds5 += "NC";}
								else if ((modsInt & 64) == 64) {modds5 += "DT";}
								if ((modsInt & 16) == 16) {modds5 += "HR";}
								if ((modsInt & 32) == 32) {modds5 += "SD";}
								if ((modsInt & 16384) == 16384) {modds5 += "PF";}
								if ((modsInt & 128) == 128) {modds5 += "RX";}
								if ((modsInt & 1024) == 1024) {modds5 += "FL";}
								if ((modsInt & 2048) == 2048) {modds5 += "Auto";}
								if ((modsInt & 8192) == 8192) {modds5 += "AP";}
								if ((modsInt & 32768) == 32768) {modds5 += "4K";}
								if ((modsInt & 65536) == 65536) {modds5 += "5K";}
								if ((modsInt & 131072) == 131072) {modds5 += "6K";}
								if ((modsInt & 262144) == 262144) {modds5 += "7K";}
								if ((modsInt & 524288) == 524288) {modds5 += "8K";}
								if ((modsInt & 1048576) == 1048576) {modds5 += "FI";}
								if ((modsInt & 2097152) == 2097152) {modds5 += "RA";}
								if ((modsInt & 16777216) == 16777216) {modds5 += "9K";}
								if ((modsInt & 33554432) == 33554432){modds5 += "10K";}
								if ((modsInt & 67108864) == 67108864) {modds5 += "1K";}
								if ((modsInt & 134217728) == 134217728) {modds5 += "3K";}
								if ((modsInt & 268435456) == 268435456) {modds5 += "2K";}
								}
							msgArray.push("**5.** *"+map5.title+"* *(☆"+map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length+3)+")*: **PP:** "+Math.round(data[4].pp.split(".")[0])+" **| Score:** "+data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[4].countmiss+" **| Mods:** " +modds5);
						bot.sendMessage(msg, msgArray);
					});});});});});});});});});});
					} catch(error) { bot.sendMessage(msg, "Error: "+error, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
				});

			} 
			else if (suffix.split(" ")[0] === "recent") {

				if(suffix.split(" ").length >= 2 && suffix.split(" ")[1] != "") {
					var username = suffix.substring(7)
				}
				var APIKEY = ConfigFile.api_keys.osu_api_key;
				if (!APIKEY) { bot.sendMessage(msg, "Osu API key not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var osu = new osuapi.Api(APIKEY);
				osu.getUserRecent(username, function (err, data) {
					if (err) { bot.sendMessage(msg, ":warning: Error: "+err, function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					if (!data || !data[0]) { bot.sendMessage(msg, ":warning: User not found or no recent plays", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
					var msgArray = [];
					msgArray.push("5 most recent plays for: **"+username+"**:");
					msgArray.push("----------------------------------");
					osu.getBeatmap(data[0].beatmap_id, function (err, map1) {
						msgArray.push("**1.** *"+map1.title+"* *(☆"+map1.difficultyrating.substring(0, map1.difficultyrating.split(".")[0].length+3)+")*: **Score:** "+data[0].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[0].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[0].countmiss);
						if (!data[1]) { bot.sendMessage(msg, msgArray); return; }
						osu.getBeatmap(data[1].beatmap_id, function (err, map2) {
							msgArray.push("**2.** *"+map2.title+"* *(☆"+map2.difficultyrating.substring(0, map2.difficultyrating.split(".")[0].length+3)+")*: **Score:** "+data[1].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[1].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[1].countmiss);
							if (!data[2]) { bot.sendMessage(msg, msgArray); return; }
							osu.getBeatmap(data[2].beatmap_id, function (err, map3) {
								msgArray.push("**3.** *"+map3.title+"* *(☆"+map3.difficultyrating.substring(0, map3.difficultyrating.split(".")[0].length+3)+")*: **Score:** "+data[2].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[2].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[2].countmiss);
								if (!data[3]) { bot.sendMessage(msg, msgArray); return; }
								osu.getBeatmap(data[3].beatmap_id, function (err, map4) {
									msgArray.push("**4.** *"+map4.title+"* *(☆"+map4.difficultyrating.substring(0, map4.difficultyrating.split(".")[0].length+3)+")*: **Score:** "+data[3].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[3].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[3].countmiss);
									if (!data[4]) { bot.sendMessage(msg, msgArray); return; }
									osu.getBeatmap(data[4].beatmap_id, function (err, map5) {
										msgArray.push("**5.** *"+map5.title+"* *(☆"+map5.difficultyrating.substring(0, map5.difficultyrating.split(".")[0].length+3)+")*: **Score:** "+data[4].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Max Combo:** "+data[4].maxcombo.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" **| Misses:** "+data[4].countmiss);
										bot.sendMessage(msg, msgArray);
					});});});});});
				});

			} else { }
			} else { }
				})
		}
	}
	
Commands.cookiezi = {
  name: "cookiezi",
  help: "cookiezi",
  level: 0,
  fn: function emoji(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "http://www.twitch.tv/shigetora");
	}
}

Commands.lines = {
  name: "lines",
  help: "lines",
  level: 3,
  fn: function emoji(bot, msg, suffix) {
		bot.sendMessage(msg.channel, "Stop the spam. Keep your messages to a minimal amount of lines, please.");
	}
}
	
Commands.manga = {
  name: "manga",
  usage: "<manga/novel name>",
  level: 0,
  fn: function (bot, msg, suffix) {
			if (suffix) {
				var USER = ConfigFile.mal.user;
				var PASS = ConfigFile.mal.pass;
				if (!USER || !PASS) { bot.sendMessage(msg, "MAL login not configured by bot owner", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				bot.startTyping(msg.channel);
				var tags = suffix.split(" ").join("+");
				var rUrl = "http://myanimelist.net/api/manga/search.xml?q=" + tags;
				request(rUrl, {"auth": {"user": USER, "pass": PASS, "sendImmediately": false}}, function (error, response, body) {
					if (error) { console.log(error); }
					if (!error && response.statusCode == 200) {
						xml2js.parseString(body, function (err, result){
							//console.log(result)
							var title = result.manga.entry[0].title;
							var english = result.manga.entry[0].english;
							var chapters = result.manga.entry[0].chapters;
							var volumes = result.manga.entry[0].volumes;
							var score = result.manga.entry[0].score;
							var type = result.manga.entry[0].type;
							var status = result.manga.entry[0].status;
							var synopsis = result.manga.entry[0].synopsis.toString();
							var picture = result.manga.entry[0].image[0];
							synopsis = synopsis.replace(/<br \/>/g, " "); synopsis = synopsis.replace(/\[(.{1,10})\]/g, "");
							synopsis = synopsis.replace(/\r?\n|\r/g, " "); synopsis = synopsis.replace(/\[(i|\/i)\]/g, "*"); synopsis = synopsis.replace(/\[(b|\/b)\]/g, "**");
							synopsis = ent.decodeHTML(synopsis);
							setTimeout(function(){ bot.sendMessage(msg, "**" + title + " / " + english+"**\n**Type:** "+ type +" **| Chapters:** "+chapters+" **| Volumes: **"+volumes+" **| Status:** "+status+" **| Score:** "+score+"\n"+synopsis); }, 2000)
							bot.sendFile(msg.channel, picture)
						});
					} else { bot.sendMessage(msg, "\""+suffix+"\" not found", function (erro, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); }
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
        if (result.body.length < 1){
          bot.sendMessage(msg.channel, "Sorry, nothing found.");
          bot.stopTyping(msg.channel);
          return;
        } else {
          var count = Math.floor((Math.random() * result.body.length));
		  var count1 = Math.floor((Math.random() * result.body.length));
		  var count2 = Math.floor((Math.random() * result.body.length));
		  var e621 = result.body[count].file_url;
		  var e6212= result.body[count1].file_url;
		  var e6213 = result.body[count2].file_url;
          bot.sendMessage(msg.channel, "You've searched for `" + suffix + "`");
		  bot.sendFile(msg.channel, e621)
		  bot.sendFile(msg.channel, e6212)
		  bot.sendFile(msg.channel, e6213)
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
      } catch (err) {
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
        } else if (playing) {
          bot.sendMessage(msg.channel, "Okay, I'm now " + status + " and playing " + playing);
        } else {
          bot.sendMessage(msg.channel, "Okay, I'm now " + status + ".");
        }
      });
    } else {
    bot.sendMessage(msg.channel, "I can only be `online` or `away`!");
    return;
  }}
};

Commands.randomcat = {
  name: "randomcat",
  help: "I'll get a random cat image for you!",
  level: 0,
  fn: function(bot, msg, suffix) {
    bot.startTyping(msg.channel);
    unirest.get("https://nijikokun-random-cats.p.mashape.com/random")
      .header("X-Mashape-Key", ConfigFile.api_keys.mashape_key)
      .header("Accept", "application/json")
      .end(function(result) {
        bot.sendMessage(msg.channel, result.body.source);
        bot.stopTyping(msg.channel);
      });
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
      	//Replaced \\u with an invisible Unicode character, it was glitching out badly.
       // bot.sendMessage(msg.channel, response.message.replace(/|/g, "‎"));
	      //console.log(response)
		  bot.sendMessage(msg.channel, JSON.parse('"' + response.message.replace(/\|/g, "\\u")+ '"'));
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
		bot.sendMessage(msg, "You must have either the `Kick Members` or `Ban Members` permission to use `!leave`")
        return;
	}
    if (msg.channel.server) {
      bot.sendMessage(msg.channel, "Alright, see ya!");
      bot.leaveServer(msg.channel.server);
      Logger.log("info", "I've left a server on request of " + msg.sender.username + ", I'm only in " + bot.servers.length + " servers now.");
      return;
    } else {
      bot.sendMessage(msg.channel, "I can't leave a DM, dummy!");
      return;
    }
  }
};

Commands.online = {
  name: "online",
  help: "I'll change my status to online.",
  level: 5, // If an access level is set to 4 or higher, only the master user can use this
  fn: function(bot, msg) {
    bot.setStatusOnline();
    Logger.log("debug", "My status has been changed to online.");
  }
};

Commands.restart = {
  name: "restart",
  help: "This will instantly terminate all of the running instances of the bot without restarting.",
  level: 5, // If an access level is set to 4 or higher, only the master user can use this
  fn: function(bot, msg) {
      bot.sendMessage(msg.channel, "Be back in a second!")
      setTimeout(function() { bot.logout(); }, 3000);
      Logger.log("warn", "Disconnected via killswitch!");
       setTimeout(function() { process.exit(0);}, 3000);
    } //exit node.js without an error
};

Commands.monstrata = {
  name: "monstrata",
  level: 0,
  fn: function(bot, msg) {
	  bot.sendMessage(msg.channel, "thank mr monstrata")
  }
}

Commands.purge = {
  name: "purge",
  help: "I'll delete a certain ammount of messages.",
  usage: "<number-of-messages-to-delete>",
  level: 0,
  fn: function(bot, msg, suffix) {
    if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "You can't do that in a DM, dummy!");
      return;
    }
	if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageMessages")) {
      bot.sendMessage(msg, "You don't have the permission `Manage Messages`! You must have this permission to use `!purge`")
      return;
    }
    if (!msg.channel.permissionsOf(bot.user).hasPermission("manageMessages")) {
      bot.sendMessage(msg, "I don't have the permission `Manage Messages`! I must have this permission for `!purge` to function correctly!")
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
				var todo = parseInt(suffix.split(" ")[1]);
				var delcount = 0;
				for (var i = 0; i < 100; i++) {
					if (todo <= 0) {
						bot.sendMessage(msg, "Deleted " + delcount + " of " + username + "'s messages")
						return;
					}
					else {
						if(messages[i].author.username.toLowerCase() == username) {
							bot.deleteMessage(messages[i]);
							delcount++; todo--;
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
				var todo = parseInt(suffix.split(" ")[0]);
				var delcount = 0;
				for (var i = 0; i < 100; i++) {
					if (todo <= 0) {
						bot.sendMessage(msg, "Deleted " + delcount + " of " + username + "'s messages.")
						return;
					}
					else {
						if(messages[i].author.username.toLowerCase() == username) {
							bot.deleteMessage(messages[i]);
							delcount++; todo--;
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
    bot.getChannelLogs(msg.channel, suffix, function(error, messages) {
      if (error) {
        bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
        return;
      } else {
        Logger.info("Beginning purge...");
        var todo = messages.length,
          delcount = 0;
        for (msg of messages) {
          bot.deleteMessage(msg);
          todo--;
          delcount++;
          if (todo === 0) {
            bot.sendMessage(msg.channel, "Done! Deleted " + delcount + " messages.");
            Logger.info("Ending purge, deleted " + delcount + " messages.");
            return;
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
  fn: function(bot, msg, suffix){
	  var a = 0;
	if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "You can't do that in a DM, dummy!");
      return;
    }
    if (!msg.channel.permissionsOf(msg.sender).hasPermission("banMembers")) {
      bot.sendMessage(msg, "You don't have the permission `Ban Members`! You must have this permission to use `!ban`")
      return;
    }
    if (!msg.channel.permissionsOf(bot.user).hasPermission("banMembers")) {
      bot.sendMessage(msg, "I don't have the permission `Ban Members`! I must have this permission for `!ban` to function correctly!")
      return;
    }
	if (msg.author.username === "BooBot") {
		bot.sendMessage(msg.channel, "Good try, BooBot")
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
	    msg.mentions.forEach(function (user) {
				if (msg.author === user) {
					bot.sendMessage(msg.channel, "You can't ban yourself, idiot.")
					a = 2;
					return;
				}
				bot.banMember(user,msg.channel.server)
				bot.sendMessage(msg.channel, user+" has been banned from "+msg.channel.server.name);
				Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
					if (reply === "none") {}
					else {
						var reason = suffix.replace("<@"+user.id+">", "")
						if (reason === "" || reason === " ") {
							reason = "No reason was provided."
						}
						setTimeout(function(){ bot.sendMessage(reply, user+ " has been banned"); }, 100)
						setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
					}
				})
				a = 1;
				return;
})
if (a === 0) { 
bot.sendMessage(msg.channel, "Couldn't find the mentioned user!"); 
} 
}}

Commands.unban = {
  name: "unban",
  help: "I'll delete a certain ammount of messages.",
  usage: "<number-of-messages-to-delete>",
  level: 0,
  fn: function(bot, msg, suffix){
	  var a = 0;
	if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "You can't do that in a DM, dummy!");
      return;
    }
    if (!msg.channel.permissionsOf(msg.sender).hasPermission("banMembers")) {
      bot.sendMessage(msg, "You don't have the permission `Ban Members`! You must have this permission to use `!ban`")
      return;
    }
    if (!msg.channel.permissionsOf(bot.user).hasPermission("banMembers")) {
      bot.sendMessage(msg, "I don't have the permission `Ban Members`! I must have this permission for `!ban` to function correctly!")
      return;
    }
	if (msg.author.username === "BooBot") {
		bot.sendMessage(msg.channel, "Good try, BooBot")
		return;
	}
	  if (msg.mentions.length < 1) {
		  bot.sendMessage(msg.channel, "You must mention the user you want to unban!");
		  return;
	  }
	  if (msg.mentions.length > 1) {
		  bot.sendMessage(msg.channel, "You can only unban 1 person at a time!");
		  return;
	  }
	    msg.mentions.forEach(function (user) {
				if (msg.author === user) {
					bot.sendMessage(msg.channel, "How would you even unban yourself?!?!")
					a = 2;
					return;
				}
				bot.unbanMember(user,msg.channel.server)
				bot.sendMessage(msg.channel, user+" has been unbanned from "+msg.channel.server.name);
				Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
					if (reply === "none") {}
					else {
						var reason = suffix.replace("<@"+user.id+">", "")
						if (reason === "" || reason === " ") {
							reason = "No reason was provided."
						}
						setTimeout(function(){ bot.sendMessage(reply, user+ " has been unbanned"); }, 100)
						setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
					}
				})
				a = 1;
				return;
})
if (a === 0) { 
bot.sendMessage(msg.channel, "Couldn't find the mentioned user!"); 
} 
}}

Commands.kick = {
  name: "kick",
  level: 0,
  fn: function(bot, msg, suffix){
	  var a = 0;
	if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "You can't do that in a DM, dummy!");
      return;
    }
    if (!msg.channel.permissionsOf(msg.sender).hasPermission("kickMembers")) {
      bot.sendMessage(msg, "You don't have the permission `Kick Members`! You must have this permission to use `!kick`")
      return;
    }
    if (!msg.channel.permissionsOf(bot.user).hasPermission("kickMembers")) {
      bot.sendMessage(msg, "I don't have the permission `Kick Members`! I must have this permission for `!kick` to function correctly!")
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
	    msg.mentions.forEach(function (user) {
			if (msg.author === user) {
					bot.sendMessage(msg.channel, "You can't kick yourself, idiot.")
					a = 2;
					return;
				}
				bot.kickMember(user,msg.channel.server)
				bot.sendMessage(msg.channel, user+" has been kicked from "+msg.channel.server.name);
				var reason = suffix.replace("<@"+user.id+">", "")
				if (reason === "" || reason === " ") {
					reason = "No reason was provided."
				}
				Permissions.GetStafflog(msg.channel.server.id, function(err, reply) {
					if (reply === "none") {}
					else {
						setTimeout(function(){ bot.sendMessage(reply, user+ " has been kicked"); }, 100)
						setTimeout(function(){ bot.sendMessage(reply, "Reason: "+reason); }, 200)
					}
				})
				a = 1;
				return;
})
if (a === 0) { 
bot.sendMessage(msg.channel, "Couldn't find the mentioned user!"); 
} 
}}

Commands.whois = {
  name: "whois",
  help: "I'll get some information about the user you've mentioned.",
  level: 0,
  fn: function(bot, msg) {
    var UserLevel = 0;
    if (!msg.channel.server) {
      bot.sendMessage(msg.author, "I can't do that in a DM, sorry.");
      return;
    }
    if (msg.mentions.length === 0) {
      bot.sendMessage(msg.channel, "Please mention the user that you want to get information of.");
      return;
    }
    msg.mentions.map(function(user) {
      Permissions.GetLevel((msg.channel.server.id + user.id), user.id, function(err, level) {
        if (err) {
          return;
        } else {
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
        } else {
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
    if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "I can't do that in a PM!");
      return;
    }
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
    if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "NSFW commands are always allowed in DM's.");
      return;
    }
    if (suffix === "on" || suffix === "off") {
      Permissions.SetNSFW(msg.channel, suffix, function(err, allow) {
        if (err) {
          bot.reply(msg.channel, "I've failed to set NSFW flag!");
        }
        if (allow === "on") {
          bot.sendMessage(msg.channel, "NSFW commands are now allowed for " + msg.channel);
        } else if (allow === "off") {
          bot.sendMessage(msg.channel, "NSFW commands are now disallowed for " + msg.channel);
        } else {
          bot.reply(msg.channel, "I've failed to set NSFW flag!");
        }
      });
    }
  }
};

Commands.setosu = {
  name: "setosu",
  level: 0,
  fn: function(bot, msg, suffix) {
		Permissions.SetOsu(msg, suffix, function(err, allow) {
			if (err) {
			bot.reply(msg.channel, "I've failed to set your osu! name!");
			}
			if (allow != -1) {
			bot.sendMessage(msg.channel, "I have set your username to: " + allow); 
			}
			else {
			bot.reply(msg.channel, "I've failed to set your osu! name!");
			}
		});
  }
}

Commands.osutest = {
  name: "osutest",
  level: 0,
  fn: function(bot, msg, suffix) {
	  var APIKEY = ConfigFile.api_keys.osu_api_key;
	  var osu = new osuapi.Api(APIKEY);
	  osu.getUser(suffix, function(err, data) {
		  if (!data) { 
			bot.sendMessage(msg.channel, "User not found.") 
			return;
			}
		  if (data) {
			  var osuname1 = data.username;
			  var osurank = data.pp_rank;
			  var osuname = osuname1.toLowerCase();
			  console.log(osuname)
			  Permissions.SetOsuRank(osuname, osurank, function(err, allow) {
			if (err) {
			bot.reply(msg.channel, "error");
			return;
			}
			if (allow != -1) {
			bot.sendMessage(msg.channel, "I have set your username to: " + allow); 
			}
			else {
			bot.reply(msg.channel, "error");
			return;
			}
		})
		  }
	  })
  }
}

Commands.osutestget = {
  name: "osutestget",
  level: 0,
  fn: function(bot, msg, suffix) {
	  var suffix1 = suffix.toLowerCase();
	Permissions.GetOsuRank(suffix1, function(err, reply) {
		bot.sendMessage(msg.channel, "Rank: " + reply)
	})
  }
}

Commands.setignore = {
  name: "setignore",
  help: "This changes if the channel allows commands.",
  usage: "<on | off>",
  level: 3,
  fn: function(bot, msg, suffix) {
    if (!msg.channel.server) {
      bot.sendMessage(msg.channel, "Commands are always allowed in DM's.");
      return;
    }
    if (suffix === "yes" || suffix === "no") {
      Permissions.SetIgnore(msg.channel, suffix, function(err, allow1) {
        if (err) {
          bot.reply(msg.channel, "I've failed to set Ignore flag!");
        }
        if (allow1 === "no") {
          bot.sendMessage(msg.channel, "Commands are now allowed for " + msg.channel);
        } else if (allow1 === "yes") {
          bot.sendMessage(msg.channel, "Commands are now disallowed for " + msg.channel);
        } else {
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
      bot.sendMessage(msg.channel, "You need to execute this command in a server, dummy!");
      return;
    } else {
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
      msgArray.push("Server name: **" + msg.channel.server.name + "** (id: `" + msg.channel.server.id +"`)");
      msgArray.push("Owned by **" + msg.channel.server.owner.username + "** (id: `" + msg.channel.server.owner.id + "`)");
      msgArray.push("Current region: **" + msg.channel.server.region + '**.');
      msgArray.push('This server has **' + msg.channel.server.members.length + '** members, and **' + msg.channel.server.channels.length + '** channels. (Including voice channels)');
      msgArray.push('This server has **' + msg.channel.server.roles.length + '** roles registered.');
      if (msg.channel.server.icon === null) {
        msgArray.push('No server icon present.');
      } else {
        msgArray.push('Server icon: ' + msg.channel.server.iconURL);
      }
      if (msg.channel.server.afkChannel === null) {
        msgArray.push('No voice AFK-channel present.');
      } else {
        msgArray.push('Voice AFK-channel: **' + msg.channel.server.afkChannel.name + "** (id: `" + msg.channel.server.afkChannel.id + "`)");
      }
      bot.sendMessage(msg, msgArray);
    } else {
      bot.sendMessage(msg, "You can't do that in a DM, dummy!.");
    }
  }
};

Commands["join-server"] = {
  name: "join-server",
  help: "I'll join the server you've requested me to join, as long as the invite is valid and I'm not banned of already in the requested server.",
  usage: "<bot-username> <instant-invite>",
  level: 0,
  fn: function(bot, msg, suffix) {
    suffix = suffix.split(" ");
	if (ConfigFile.discord.token_mode === true) {
      bot.sendMessage(msg.channel, "Please click this link, login if needed, and select which server you want me to join! " + ConfigFile.discord.oauth_url);
	  setTimeout(function() { bot.sendMessage(msg.channel, "Note that you **MUST** have the permission to **Manage Server** on the server you wish to invite me too.") }, 200);
	  setTimeout(function() { bot.sendMessage(msg.channel, "I request to have most permissions, however you can select which permissions I am given.") }, 400);
	  setTimeout(function() { bot.sendMessage(msg.channel, "Please make sure to use `!setowner` after I have joined. If you need any other help, please use `!support` or contact my owner directly. zelda101#1379") }, 600);
      return;
    }
    if (suffix[0] === bot.user.username) {
      Logger.log("debug", bot.joinServer(suffix[1], function(error, server) {
        Logger.log("debug", "callback: " + arguments);
        if (error || !server) {
          Logger.warn("Failed to join a server: " + error);
          bot.sendMessage(msg.channel, "Something went wrong, try again.");
        } 
		else {
		  for (i = 0; i < bot.servers.length; i++) {
				if (server.id === bot.servers[i].id) {
					bot.sendMessage(msg.author, "I'm already on **"+server.name+"**!")
					return;
				}
			}
          var msgArray = [];
          msgArray.push("Greetings! I'm **" + bot.user.username + "**, " + msg.author + " invited me to this server.");
          msgArray.push("If I'm intended to be in this server, you may use **!help**, **!admin-help**, or **!nsfw-help** to see what I can do!");
          msgArray.push("If you don't want me here, you may use **!leave** to force me to leave.");
          bot.sendMessage(server.defaultChannel, msgArray);
          //msgArray = [];
          //msgArray.push("Hey " + server.owner.username + ", I've joined a server in which you're the founder.");
         // msgArray.push("I'm " + bot.user.username + ", a Discord bot.");
         // msgArray.push("If you are not keen on having me in your server, you may use `!leave` in the server I'm not welcome in.");
        //  msgArray.push("If you do want me, use `!help`, `!nsfw-help`, and `!admin-help` to see what I can do.");
       //   bot.sendMessage(server.owner, msgArray);
          bot.sendMessage(msg.channel, "I've successfully joined **" + server.name + "**");
        }
      }));
    } else {
      Logger.log("debug", "Ignoring join command meant for another bot.");
    }
  }
};//

Commands.idle = {
  name: "idle",
  help: "This will change my status to idle.",
  level: 5, // If an access level is set to 4 or higher, only the master user can use this
  fn: function(bot, msg) {
    bot.setStatusIdle();
    Logger.log("debug", "My status has been changed to idle.");
  }
};

Commands.botstatus = {
  name: "botstatus",
  help: "I'll get some info about me, like uptime and currently connected servers.",
  level: 0,
  fn: function(bot, msg, suffix, mescount, comcount) {
	var onlineMembers = 0;
	var offlineMembers = 0;
    var msgArray = [];
    msgArray.push("Hello, I'm " + bot.user + ", nice to meet you!");
    msgArray.push("I'm used in " + bot.servers.length + " servers, in " + bot.channels.length + " channels and by " + bot.users.length + " users.");
    msgArray.push("My uptime is " + (Math.round(bot.uptime / (1000 * 60 * 60))) + " hours, " + (Math.round(bot.uptime / (1000 * 60)) % 60) + " minutes, and " + (Math.round(bot.uptime / 1000) % 60) + " seconds.");
	msgArray.push("Memory Usage: " + Math.round(process.memoryUsage().rss / 1024 / 1000) + "MB");
	msgArray.push("Total messages seen since last restart: " +mescount._count);
	msgArray.push("Total commands executed since last restart: " +comcount._count)
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
	  bot.sendMessage(msg.channel, "Konachan only supports upto 6 tags.")
	  return;
	}
    unirest.post("https://konachan.net/post/index.json?limit=500&tags=" + suffix)
      .end(function(result) {
        if (result.body.length < 1){
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
		  bot.sendFile(msg.author, kona)
		  bot.sendFile(msg.author, kona1)
		  bot.sendFile(msg.author, kona2)
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
					bot.sendFile(msg.channel, kona)
					return;
			  }
			  if (result.body.length === 2) {
				  kona = result.body[0].file_url;
				  kona1 = result.body[1].file_url;
				  bot.sendFile(msg.channel, kona)
				  bot.sendFile(msg.channel, kona1)
				  return;
			  }
		  }
		  bot.sendMessage(msg.channel, "You've searched for ` " + suffix + " ` . There are `"+result.body.length+ "` results that contain those tags.\nSending `3` random images of those `"+result.body.length+"` results.");
		  bot.sendFile(msg.channel, kona)
		  bot.sendFile(msg.channel, kona1)
		  bot.sendFile(msg.channel, kona2)
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
	bot.sendMessage(msg.channel, "This command is currently unavailable. http://lolibooru.moe suffered a hardware failure and as such, the server is down. For more information, see here: http://meiling.moe/")
    unirest.post("https://lolibooru.moe/post/index.json?limit=500&tags=" + suffix)
      .end(function(result) {
        if (result.body.length < 1){
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
		  bot.sendFile(msg.author, kona)
		  bot.sendFile(msg.author, kona1)
		  bot.sendFile(msg.author, kona2)
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
					bot.sendFile(msg.channel, lolibooru)
					return;
			  }
			  if (result.body.length === 2) {
				  lolibooru = result.body[0].file_url;
				  lolibooru1 = result.body[1].file_url;
				  bot.sendFile(msg.channel, lolibooru)
				  bot.sendFile(msg.channel, lolibooru1)
				  return;
			  }
		  }
		  bot.sendMessage(msg.channel, "You've searched for `" + suffix + "` . There are `"+result.body.length+ "` results that contain those tags.\nSending `3` random images of those `"+result.body.length+"` results.");
		  bot.sendFile(msg.channel, lolibooru)
		  bot.sendFile(msg.channel, lolibooru1)
		  bot.sendFile(msg.channel, lolibooru2)
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
	//bot.sendMessage(msg.channel, "This command is currently unavailable. http://lolibooru.moe suffered a hardware failure and as such, the server is down. For more information, see here: http://meiling.moe/")
    unirest.post("https://lolibooru.moe/post/index.json?limit=500&tags=" + suffix)
      .end(function(result) {
        if (result.body.length < 1){
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
		  bot.sendFile(msg.author, kona)
		  bot.sendFile(msg.author, kona1)
		  bot.sendFile(msg.author, kona2)
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
					bot.sendFile(msg.channel, lolibooru)
					return;
			  }
			  if (result.body.length === 2) {
				  lolibooru = result.body[0].file_url;
				  lolibooru1 = result.body[1].file_url;
				  bot.sendFile(msg.channel, lolibooru)
				  bot.sendFile(msg.channel, lolibooru1)
				  return;
			  }
		  }
		  bot.sendMessage(msg.channel, "You've searched for `" + suffix + "` . There are `"+result.body.length+ "` results that contain those tags.\nSending `3` random images of those `"+result.body.length+"` results.");
		  bot.sendFile(msg.channel, lolibooru)
		  bot.sendFile(msg.channel, lolibooru1)
		  bot.sendFile(msg.channel, lolibooru2)
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
        if (result.body.length < 1){
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
		  bot.sendFile(msg.author, kona)
		  bot.sendFile(msg.author, kona1)
		  bot.sendFile(msg.author, kona2)
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
					bot.sendFile(msg.channel, yandere)
					return;
			  }
			  if (result.body.length === 2) {
				  yandere = result.body[0].file_url;
				  yandere1 = result.body[1].file_url;
				  bot.sendFile(msg.channel, yandere)
				  bot.sendFile(msg.channel, yandere1)
				  return;
			  }
		  }
		  bot.sendMessage(msg.channel, "You've searched for ` " + suffix + " ` . There are `"+result.body.length+ "` results that contain those tags.\nSending `3` random images of those `"+result.body.length+"` results.");
		  bot.sendFile(msg.channel, yandere)
		  bot.sendFile(msg.channel, yandere1)
		  bot.sendFile(msg.channel, yandere2)
      }
    });
  }
};

Commands.help = {
  name: "help",
  help: "You're looking at it right now.",
  level: 0,
  fn: function(bot, msg, suffix) {
    bot.sendMessage(msg.channel, "Here is a github link showing what my commands are and how to use them!\nhttps://github.com/xxxzelda101xxx/KoiBot/wiki/General-Commands")
}}

Commands["admin-help"] = {
  name: "admin-help",
  help: "You're looking at it right now.",
  level: 0,
  fn: function(bot, msg, suffix) {
	bot.sendMessage(msg.channel, "Here is a github link showing what my admin commands are and how to use them!\nhttps://github.com/xxxzelda101xxx/KoiBot/wiki/Admin-Commands")
}}

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
		Logger.debug("Send help via DM.");
		bot.sendMessage(msg.channel, "Ok " + msg.author + ", I've sent you a list of my radio commands via DM.");
		return;
	}
	else {
		return;
	}
}}

Commands["nsfw-help"] = {
  name: "nsfw-help",
  help: "You're looking at it right now.",
  level: 0,
  fn: function(bot, msg, suffix) {
    bot.sendMessage(msg.channel, "Here is a github link showing what my NSFW commands are and how to use them!\nhttps://github.com/xxxzelda101xxx/Koi./wiki/NSFW-Commands")
}}

exports.Commands = Commands;
