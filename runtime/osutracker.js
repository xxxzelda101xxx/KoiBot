var osudb = require("./osu_rt.js")
var ConfigFile = require("../config.json");
var osuapi = require('osu-api');
exports.osutrack = function(osu, bot, currentInactive) {
	var APIKEY = ConfigFile.osu_api_key;
	var modeText = ""
	var dataText = ""
	var inactive = 0
	var accChange = ""
	var osu1 = new osuapi.Api(ConfigFile.osu_api_key, osu.mode);
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
	osu1.getUser(osu.username, function(err, data) {
		if (err) {
			console.log(err)
		}
		if (data === undefined) {
			osudb.removeosuPlayer(osu.username, null, null, null)
			return;
		}
		var osuAccuracy = parseFloat(data.accuracy).toFixed(2)

		if (data) {
			if (data.pp_raw > (osu.pp + 1)) {
				osu1.getUserRecent(osu.username, function(error, data1) {
					for (var i = 0; i < data1.length; i++) {
						if (data1[i].rank != "F")
						break;
					}
					osu1.getScoresRaw({ b: data1[i].beatmap_id, u: data.user_id, m: osu.mode, type: "id"}, function(errorr, data2) {
						if (data2[0].pp === null) {
							console.log("pp is null")
							osudb.updateosuPlayer(data, osu)
							return;
						}
						var num = parseInt(osu.rank) - data.pp_rank
						if (num > 0) {
							num = "+" + num
						}
						else if (num === 0) {
							num = "unchanged"
						}
						for (var j = 0; j < osu.channel.length; j++) {
							bot.sendMessage(osu.channel[j], `**${osu.username}** set a new score!\n` +
																							`Rank #${data.pp_rank} (${num}) 🔹 `
							)
						}
					})

				})
			}
		}
	})
}
