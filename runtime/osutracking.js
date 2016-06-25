apicalls = 0;

exports.osutrack = function(osu, bot, currentInactive){
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var modeText = ""
	var dataText = ""
	var inactive = 0
	var accChange = ""
	var osu1 = new osuapi.Api(ConfigFile.api_keys.osu_api_key, osu.mode);
	osu.accuracy = parseFloat(osu.accuracy).toFixed(2)
	switch (osu.mode) {
		case 0:
			modeText = "**osu!**"
			dataText = "(osu!)"
			break;
		case 1:
			modeText = "**Taiko**"
			dataText = "(Taiko)"
			break;
		case 2:
			modeText = "**Catch the Beat**"
			dataText = "(Catch the Beat)"
			break;
		case 3:
			modeText = "**osu!mania**"
			dataText = "(osu!mania)"
			break;
	}

	var filename = __dirname + "/osutracking/db.json";
	if (osu === null) return;
	osu1.getUser(osu.username, function(err, data) {
		if (data === undefined) {
			trackedchannels.items.splice(index, 1);
			fs.writeFileSync(filename, JSON.stringify(trackedchannels, null, 4));
			return;
		}
		var osuAccuracy = parseFloat(data.accuracy).toFixed(2)
		apicalls++
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
				}
			}
			if (osu.accuracy != osuAccuracy) {
				if (osu.accuracy > osuAccuracy) {
					accChange = " **-"+parseFloat(osu.accuracy - osuAccuracy).toFixed(2)+"% accuracy**"
				}
				else if (osu.accuracy < osuAccuracy.accuracy) {
					accChange = " **+"+parseFloat(osuAccuracy.accuracy - osu.osuAccuracy).toFixed(2)+"% accuracy**"
				}
			}
			if (parseFloat(osupp) > parseFloat(osu.pp) + 1) { 
				if (parseInt(osu.rank - osurank) < 0) {
					for (var i = 0; i < osu.channel.split(", ").length; i++) {
						bot.sendMessage(osu.channel.split(", ")[i], "**"+osu.username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** but lost **"+parseInt(osurank - osu.rank)+" rank(s)**! "+accChange+" Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: "+modeText)
					}					
					if (osu.recent != recent && mapid) {
						if (data.events[0].display_html.indexOf(dataText) > -1) {
							if (data.username != undefined) {
								topplays(osu, data, mapid, mode, bot);
							}
						}
					}
					osu.rank = osurank;
					osu.pp = osupp;
					require("fs").writeFile(filename,JSON.stringify(trackedchannels,null,2), null);
					return;
				}
				for (var i = 0; i < osu.channel.split(", ").length; i++) {
					bot.sendMessage(osu.channel.split(", ")[i], "**"+osu.username+"** gained **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** and gained **"+parseInt(osu.rank - osurank)+" rank(s)**! "+accChange+" Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: "+modeText)
				}		
				if (osu.recent != recent && mapid) {
					if (data.events[0].display_html.indexOf(dataText) > -1) {
						if (data.username != undefined) {
							topplays(osu, data, mapid, mode, bot);
						}
					}
				}
			}
			else if (parseFloat(osupp) < parseFloat(osu.pp) - 1) { 
				if (osu.channel === "118689714319392769") {
					if (parseInt(osu.rank - osurank) < 0) {
						for (var i = 0; i < osu.channel.split(", ").length; i++) {
							bot.sendMessage(osu.channel.split(", ")[i], "**"+osu.username+"** lost **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** and lost **"+parseInt(osurank - osu.rank)+" rank(s)**! "+accChange+" Current Rank: **"+osurank+"** Current pp: **"+osupp+"**  Mode: "+modeText)
						}
						if (osu.recent != recent && mapid) {
							if (data.events[0].display_html.indexOf(dataText) > -1) {
								if (data.username != undefined) {
									topplays(osu, data, mapid, mode, bot);
								}
							}
						}
						osu.rank = osurank;
						osu.pp = osupp;
						require("fs").writeFile(filename,JSON.stringify(trackedchannels,null,2), null);
						return;
					}
					if (osu.recent != recent && mapid) {
						if (data.events[0].display_html.indexOf(dataText) > -1) {
							if (data.username != undefined) {
								topplays(osu, data, mapid, mode, bot);
							}
						}
					}
					for (var i = 0; i < osu.channel.split(", ").length; i++) {
						bot.sendMessage(osu.channel.split(", ")[i], "**"+osu.username+"** lost **"+parseFloat(osupp - osu.pp).toFixed(2)+"pp** and gained **"+parseInt(osu.rank - osurank)+" rank(s)**! "+accChange+" Current Rank: **"+osurank+"** Current pp: **"+osupp+"** Mode: "+modeText)
					}
				}
			}
			else if (parseFloat(osupp) === parseFloat(osu.pp)) {
				inactive++
			}
			if (osu.recent === "" || osu.recent === "." && data.events[0] != undefined) {
				if (data.events[0] != undefined) {
					if (data.events[0].display_html.indexOf(dataText) > -1) {
						osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
					}
					else {
						inactive++
					}
				}
				else {
					inactive++
				}
			}
			else if (recent != osu.recent && data.events[0] != undefined) {
				if (data.events[0] != undefined) {
					if (data.events[0].display_html.indexOf(dataText) > -1) {
						top250regex = /\#\d+/
						if (recent.match(top250regex)) {
							istop250 = recent.match(top250regex)[0].substring(1)
						}
						if (istop250 && istop250 <= 250) {
							for (var i = 0; i < osu.channel.split(", ").length; i++) {
								bot.sendMessage(osu.channel.split(", ")[i], recent)
							}
						}
						osu.recent = data.events[0].display_html.replace(/<(?:.|\n)*?>/gm, '').trim();
					}
				}
			}
			else {
				inactive++
			}
			if (inactive >= 2) {
				if (osu.inactivity < 5) {
					osu.inactivity = currentInactive + 1
				}
			}
			else {
				osu.inactivity = 0
			}
			osu.accuracy = parseFloat(data.accuracy).toFixed(2)
			osu.rank = osurank;
			osu.pp = osupp;
			require("fs").writeFile(filename,JSON.stringify(trackedchannels,null,2), null);
		}
	})
}

function topplays(osu, data, mapid, mode, bot) {
	var APIKEY = ConfigFile.api_keys.osu_api_key;
	var osu1 = new osuapi.Api(APIKEY);
	osu1.getScoresRaw({ b: mapid, m: mode, u: data.user_id, type: "id" }, function(err, data1) {
		apicalls++
		osu1.getUserBestRaw({ u: data.user_id, m: mode, limit: 100, type: "id" }, function (err, data2) {
			apicalls++
			if (data2 === null) return;
			scoredata(data, data1, data2, bot, osu, mapid)
        });
	})
}

function scoredata(data, data1, data2, bot, osu, mapid) {
	if (data1 === undefined) return;
	if (data1 === null) {
		return;
	}
	if (data1[0].pp === null) {
		var pp = 0
	}
	else {
		var pp = data1[0].pp
	}
	var rank = data1[0].rank.replace("SH", "S").replace("X", "SS").replace("XH", "SS")
	var count50 = parseInt(data1[0].count50)
	var count100 = parseInt(data1[0].count100)
	var count300 = parseInt(data1[0].count300)
	var accuracy = ""
	var miss = parseInt(data1[0].countmiss)
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
	if (data2 === null) return;
	for (var i = 0; i < data2.length; i++) {
		if (parseFloat(pp) > parseFloat(data2[i].pp)) {
			var topscore = i
			break;
		}
		if (i === 99) {
			return;
		}
	}
	if (osu.mode === 0) {
		accuracy = ((count50 * 50 + count100 * 100 + count300 * 300) / (miss + count50 + count100 + count300)) / 300
	}
	else if (osu.mode === 1) {
		accuracy = ((count100 * 0.5 + count300 * 300 * 1) / (miss + count100 + count300)) / 300
	}
	else if (osu.mode === 2) {
		accuracy = (count50 + count100 + count300) / (miss + count50 + count100 + count300 + parseInt(data1[0].countkatu))
	}
	else if (osu.mode === 3) {
		accuracy = ((count50 * 50 + count100 * 100 + parseInt(data1[0].countkatu) * 200 + count300 * 300 + parseInt(data1[0].countgeki) * 300) / (miss + count50 + count100 + parseInt(data1[0].countkatu) + count300 + parseInt(data1[0].countgeki))) / 300
	}
	accuracy = parseFloat(accuracy*100).toFixed(2)
	setTimeout(function(){
		for (var j = 0; j < osu.channel.split(", ").length; j++) {
			bot.sendMessage(osu.channel.split(", ")[j], "**#"+topscore+"** top play! Rank: **"+rank+"** Accuracy: **"+accuracy+"%** pp: **"+pp+"** Mods: **"+modds1+"** Map link: <https://osu.ppy.sh/b/"+mapid+"&m="+osu.mode+">") 
		}
	}, 200)
}