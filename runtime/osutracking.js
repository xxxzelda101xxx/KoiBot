osutracker = require("./osutracker.json");
taikotracker = require("./taikotracker.json");
ctbtracker = require("./ctbtracker.json");
maniatracker = require("./maniatracker.json");

exports.osutrack = function(osu, bot){
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu1 = new osuapi.Api(APIKEY);
	if (osu === null) return;
	osu1.getUser(osu.Username, function(err, data) {
		if (data) {
			var osurank = data.pp_rank;
			var osupp = data.pp_raw;
			if (data.events[0] != undefined) {
				var rawevent = data.events[0].display_html
				var rawregex = /\/b\/\d+\?\m\=\d/
				var recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
				if (rawevent.match(rawregex) != null) {
					var mode = rawevent.match(rawregex)[0].slice(-1)
					var mapid = rawevent.match(rawregex)[0].substring(3).slice(0, -4)
					//console.log(mode +" "+ mapid)
				}
			}
			if (parseFloat(osupp) > parseFloat(osu.pp) + 1) { 
				if (parseInt(osu.Rank - osurank) < 0) {
					bot.sendMessage(osu.channel, "**"+osu.Username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** but lost **"+parseInt(osurank - osu.Rank)+" rank(s)**! Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: **osu!**")
					topplays(osu, data, mapid, mode, bot);
					osu.Rank = osurank;
					osu.pp = osupp;
					require("fs").writeFile("./runtime/osutracker.json",JSON.stringify(osutracker,null,2), null);
					return;
				}
				topplays(osu, data, mapid, mode, bot);
				bot.sendMessage(osu.channel, "**"+osu.Username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** and gained **"+parseInt(osu.Rank - osurank)+" rank(s)**! Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: **osu!**")
			}
			if (osu.recent === "" && data.events[0] != undefined) {
				if (data.events[0].display_html.indexOf("(osu!)") > -1) {
					osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
				}
			}
			else if (recent != osu.recent && data.events[0] != undefined) {
				//console.log("hi")
				if (data.events[0].display_html.indexOf("(osu!)") > -1) {
					//console.log("hi")
					top250regex = /\#\d+/
					if (recent.match(top250regex) != null) {
						//console.log("hi")
						istop250 = recent.match(top250regex)[0].substring(1)
						if (istop250 <= 250) {
							//console.log("hi")
							setTimeout(function(){ bot.sendMessage(osu.channel, recent) }, 400)
						}
					}
					osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
				}
			}
			osu.Rank = osurank;
			osu.pp = osupp;
			require("fs").writeFile("./runtime/osutracker.json",JSON.stringify(osutracker,null,2), null);
		}
	})
}

exports.taikotrack = function(osu, bot){
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu1 = new osuapi.Api(APIKEY, 1);
	if (osu === null) return;
	osu1.getUser(osu.Username, function(err, data) {
		if (data) {
		var osurank = data.pp_rank;
		var osupp = data.pp_raw;
		if (data.events[0] != undefined) {
			var rawevent = data.events[0].display_html
			var rawregex = /\/b\/\d+\?\m\=\d/
			var recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			if (rawevent.match(rawregex) != null) {
				var mode = rawevent.match(rawregex)[0].slice(-1)
				var mapid = rawevent.match(rawregex)[0].substring(3).slice(0, -4)
				//console.log(mode +" "+ mapid)
			}
		}
		if (parseFloat(osupp) > parseFloat(osu.pp) + 1) {
			if (parseInt(osu.Rank - osurank) < 0) {
				bot.sendMessage(osu.channel, "**"+osu.Username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** but lost **"+parseInt(osurank - osu.Rank)+" rank(s)**! Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: **Taiko**")
				topplays(osu, data, mapid, mode, bot);
				osu.Rank = osurank;
				osu.pp = osupp;
				require("fs").writeFile("./runtime/taikotracker.json",JSON.stringify(taikotracker,null,2), null);
				return;
			}
			topplays(osu, data, mapid, mode, bot);
			bot.sendMessage(osu.channel, "**"+osu.Username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** and gained **"+parseInt(osu.Rank - osurank)+" rank(s)**! Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: **Taiko**")
		}
		if (osu.recent === "" && data.events[0] != undefined) {
			if (data.events[0].display_html.indexOf("(Taiko)") > -1) {
				osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			}
		}
		else if (recent != osu.recent && data.events[0] != undefined) {
			if (data.events[0].display_html.indexOf("(Taiko)") > -1) {
				top250regex = /\#\d+/
				istop250 = recent.match(top250regex)[0].substring(1)
				if (istop250 <= 250) {
					bot.sendMessage(osu.channel, recent)
				}
				osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			}
		}
		osu.Rank = osurank;
		osu.pp = osupp;
		require("fs").writeFile("./runtime/taikotracker.json",JSON.stringify(taikotracker,null,2), null);
		}
	})
}

exports.ctbtrack = function(osu, bot){
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu1 = new osuapi.Api(APIKEY, 2);
	if (osu === null) return;
	osu1.getUser(osu.Username, function(err, data) {
		if (data) {
		var osurank = data.pp_rank;
		var osupp = data.pp_raw;
		if (data.events[0] != undefined) {
			var rawevent = data.events[0].display_html
			var rawregex = /\/b\/\d+\?\m\=\d/
			var recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			if (rawevent.match(rawregex) != null) {
				var mode = rawevent.match(rawregex)[0].slice(-1)
				var mapid = rawevent.match(rawregex)[0].substring(3).slice(0, -4)
				//console.log(mode +" "+ mapid)
			}
		}
		if (parseFloat(osupp) > parseFloat(osu.pp) + 1) {
			if (parseInt(osu.Rank - osurank) < 0) {
				bot.sendMessage(osu.channel, "**"+osu.Username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** but lost **"+parseInt(osurank - osu.Rank)+" rank(s)**! Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: **Catch the Beat**")
				topplays(osu, data, mapid, mode, bot);
				osu.Rank = osurank;
				osu.pp = osupp;
				require("fs").writeFile("./runtime/ctbtracker.json",JSON.stringify(ctbtracker,null,2), null);
				return;
			}
			topplays(osu, data, mapid, mode, bot);
			bot.sendMessage(osu.channel, "**"+osu.Username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** and gained **"+parseInt(osu.Rank - osurank)+" rank(s)**! Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: **Catch the Beat**")
		}
		if (osu.recent === "" && data.events[0] != undefined) {
			if (data.events[0].display_html.indexOf("(Catch the Beat)") > -1) {
				osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			}
		}
		else if (recent != osu.recent && data.events[0] != undefined) {
			if (data.events[0].display_html.indexOf("(Catch the Beat)") > -1) {
				top250regex = /\#\d+/
				istop250 = recent.match(top250regex)[0].substring(1)
				if (istop250 <= 250) {
					bot.sendMessage(osu.channel, recent)
				}
				osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			}
		}
		osu.Rank = osurank;
		osu.pp = osupp;
		require("fs").writeFile("./runtime/ctbtracker.json",JSON.stringify(ctbtracker,null,2), null);
		}
	})
}

exports.maniatrack = function(osu, bot){
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu1 = new osuapi.Api(APIKEY, 3);
	if (osu === null) return;
	osu1.getUser(osu.Username, function(err, data) {
		if (data) {
		var osurank = data.pp_rank;
		var osupp = data.pp_raw;
		if (data.events[0] != undefined) {
			var rawevent = data.events[0].display_html
			var rawregex = /\/b\/\d+\?\m\=\d/
			var recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			if (rawevent.match(rawregex) != null) {
				var mode = rawevent.match(rawregex)[0].slice(-1)
				var mapid = rawevent.match(rawregex)[0].substring(3).slice(0, -4)
				//console.log(mode +" "+ mapid)
			}
		}
		if (parseFloat(osupp) > parseFloat(osu.pp) + 1) {
			if (parseInt(osu.Rank - osurank) < 0) {
				bot.sendMessage(osu.channel, "**"+osu.Username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** but lost **"+parseInt(osurank - osu.Rank)+" rank(s)**! Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: **osu!mania**")
				topplays(osu, data, mapid, mode, bot);
				osu.Rank = osurank;
				osu.pp = osupp;
				require("fs").writeFile("./runtime/maniatracker.json",JSON.stringify(maniatracker,null,2), null);
				return;
			}
			topplays(osu, data, mapid, mode, bot);
			bot.sendMessage(osu.channel, "**"+osu.Username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** and gained **"+parseInt(osu.Rank - osurank)+" rank(s)**! Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: **osu!mania**")
		}
		if (osu.recent === "" && data.events[0] != undefined) {
			if (data.events[0].display_html.indexOf("(osu!mania)") > -1) {
				osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			}
		}
		else if (recent != osu.recent && data.events[0] != undefined) {
			if (data.events[0].display_html.indexOf("(osu!mania)") > -1) {
				top250regex = /\#\d+/
				istop250 = recent.match(top250regex)[0].substring(1)
				if (istop250 <= 250) {
					bot.sendMessage(osu.channel, recent)
				}
				osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
			}
		}
		osu.Rank = osurank;
		osu.pp = osupp;
		require("fs").writeFile("./runtime/maniatracker.json",JSON.stringify(maniatracker,null,2), null);
		}
	})
}

function topplays(osu, data, mapid, mode, bot) {
	console.log(mode)
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu1 = new osuapi.Api(APIKEY);
	osu1.getScoresRaw({ b: mapid, m: mode, u: data.user_id, type: "id" }, function(err, data1) {
		console.log(data1[0])
		var pp = data1[0].pp
		if (pp === null) {
			var pp = 0
		}
		var rank = data1[0].rank.replace("SH", "S").replace("X", "SS").replace("XH", "SS")
		var count50 = data1[0].count50
		var count100 = data1[0].count100
		var count300 = data1[0].count300
		var miss = data1[0].countmiss
		var rawmods = data1[0].enabled_mods
		var modsInt = parseInt(rawmods);
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
		osu1.getUserBestRaw({ u: data.user_id, m: mode, limit: 100, type: "id" }, function (err, data2) {
			for (var i = 0; i < data2.length; i++) {
				if (parseFloat(pp) > parseFloat(data2[i].pp)) {
					var topscore = i
					break;
				}
				if (i === 99) {
					return;
				}
			}
			setTimeout(function(){ bot.sendMessage(osu.channel, "**#"+topscore+"** top play! Rank: **"+rank+"** pp: **"+pp+"** Mods: **"+modds1+"**") }, 200)
			//console.log("**#"+topscore+"** top play! PP: **"+pp+"** Mods: **"+modds1+"**")
        });
	})
}
