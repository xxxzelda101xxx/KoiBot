var osudb = require("./osu_rt.js")
var userdb = require("./userdb_rt.js")
var twitchdb = require("./twitch_rt.js")
var osutracking = require("./osutracker.js")
var openrecdb = require("./openrec_rt.js")
var request = require('request');
var serverdb = require("./serverdb_rt.js")
var permissions = require("./permissions.js")
var osuapi = require('osu-api');
var ConfigFile = require("../config.json");
var osu = new osuapi.Api(ConfigFile.osu_api_key);
var Discord = require("discord.js");
const exec = require('child_process').exec;
const path = require('path');

exports.startIRC = function(bot) {
  if (ConfigFile.osuname === "" && ConfigFile.osu_irc_password === "") {
    return;
  }
  var irc = require('irc');
  var client = new irc.Client('irc.ppy.sh', ConfigFile.osuname, {
      channels: ['#announce'],
      password: ConfigFile.osu_irc_password
  });
  client.on('message', (nick, to, text, message) => {
    if (message.args[1].indexOf("achieved rank #1") > -1) {
      channel = bot.channels.get("220811738965213185")
      var messcomp = message.args[1].split(" ")
      var url = messcomp[0].replace("[http://osu.ppy.sh/u/", "")
      url = parseInt(url)
      osu.getUser(url, function(err, data) {
        userlength = data.username.split(" ").length
        username = data.username
        messcomp.splice(0, userlength + 1)
        messcomp.unshift(username)
        var maplink = messcomp[5].replace("[", "")
        messcomp.splice(5,1)
        messcomp.splice(messcomp.length - 1, 1)
        messcomp[messcomp.length - 1] = messcomp[messcomp.length - 1].substring(0, messcomp[messcomp.length - 1].length - 1);
        osu.getScoresRaw({ b: maplink.replace("http://osu.ppy.sh/b/", "").slice(0,-4), u: data.user_id, m: 0, type: "id"}, function(errorr, data2) {
          var totalPoints = (parseInt(data2[0].count300) * 300) + (parseInt(data2[0].count100) * 100) + (parseInt(data2[0].count50) * 50) + (parseInt(data2[0].countmiss) * 0)
          var totalHits = (parseInt(data2[0].count300) + parseInt(data2[0].count100) + parseInt(data2[0].count50) + parseInt(data2[0].countmiss))
          accuracy = (((totalPoints / totalHits) / 300) * 100).toFixed(2)
          osu.getBeatmap(maplink.replace("http://osu.ppy.sh/b/", "").slice(0,-4), function(err, mapdata) {
            var minutesDrain = Math.floor(mapdata.hit_length / 60)
            var secondsDrain = mapdata.hit_length - minutesDrain * 60
            if (secondsDrain < 10) secondsDrain = `0${secondsDrain}`
            var minutesTotal = Math.floor(mapdata.total_length / 60)
            var secondsTotal = mapdata.total_length - minutesTotal * 60
            if (secondsTotal < 10) secondsTotal = `0${secondsTotal}`
            var mods = parseInt(data2[0].enabled_mods, 10);
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
            if ((mods & ModsEnum.Easy) == ModsEnum.Easy) returnString += "EZ";
            if ((mods & ModsEnum.Hidden) == ModsEnum.Hidden) returnString += "HD";
            if ((mods & ModsEnum.HardRock) == ModsEnum.HardRock) returnString += "HR";
            if ((mods & ModsEnum.DoubleTime) == ModsEnum.DoubleTime) {
                if ((mods & ModsEnum.Nightcore) == ModsEnum.Nightcore) returnString += "NC";
                else returnString += "DT";
            }
            if ((mods & ModsEnum.Flashlight) == ModsEnum.Flashlight) returnString += "FL";
            if ((mods & ModsEnum.HalfTime) == ModsEnum.HalfTime) returnString += "HT";
            if ((mods & ModsEnum.NoFail) == ModsEnum.NoFail) returnString += "NF";
            if ((mods & ModsEnum.Perfect) == ModsEnum.Perfect) returnString += "PF";
            if ((mods & ModsEnum.SuddenDeath) == ModsEnum.SuddenDeath) returnString += "SD";
            if ((mods & ModsEnum.SpunOut) == ModsEnum.SpunOut) returnString += "SpunOut ";
            returnString = returnString.trim();
          	if (returnString === "") {
          		returnString = "None"
          	}
            if (returnString.indexOf("HR") > -1 || returnString.indexOf("DT") > -1 || returnString.indexOf("HT") > -1 || returnString.indexOf("EZ") > -1) {
              oppaiDir = path.resolve(__dirname, "../oppai/oppai")
              exec(`curl https://osu.ppy.sh/osu/${maplink.replace("http://osu.ppy.sh/b/", "").slice(0,-4)} | ${oppaiDir} - +${returnString}`, (error, stdout, stderr) => {
                var stars = stdout.split("stars")
                var starrating = stars[0].substr(stars[0].length - 7).trim()
                mapdata.difficultyrating = starrating
                newNumberOneMessage (channel, messcomp, accuracy, data2, mapdata, minutesDrain, secondsDrain, minutesTotal, secondsTotal, returnString, maplink, data)
              });
            }
            else {
              newNumberOneMessage (channel, messcomp, accuracy, data2, mapdata, minutesDrain, secondsDrain, minutesTotal, secondsTotal, returnString, maplink, data)
            }
          })
        })
      })
    }
    else if (message.args[1].indexOf("has just been qualified") > -1) {
      channel = bot.channels.get("220811738965213185")
      var messcomp = message.args[1].split(" ")
      var maplink = messcomp[0].replace("[http://osu.ppy.sh/s/", "")
      osu.getBeatmapSet(maplink, function(err, mapdata) {
        var mapperid = message.args[1].match(/[[](http:\/\/osu\.ppy\.sh\/u\/[0-9]{0,})/g)
        mapperid[0] = mapperid[0].replace("[http://osu.ppy.sh/u/", "")
        osu.getUser(parseInt(mapperid[0]), function(err, data) {
          var qualifiedInfo = `${mapdata[0].artist} - ${mapdata[0].title} by ${data.username} has just been qualified!`
          var mapDiffs = []
          for (var i = 0; i < mapdata.length; i++) {
            mapDiffs.push(mapdata[i].difficultyrating)
          }
          var mapDiffs2 = mapDiffs
          var hardestDiff = Math.max.apply(Math, mapDiffs)
          for (var j = 0; j < mapdata.length; j++) {
            if (mapdata[j].difficultyrating === hardestDiff.toString()) {
              hardestDiff = mapdata[j]
              break;
            }
          }
          var minutesDrain = Math.floor(mapdata[0].hit_length / 60)
          var secondsDrain = mapdata[0].hit_length - minutesDrain * 60
          if (secondsDrain < 10) secondsDrain = `0${secondsDrain}`
          var minutesTotal = Math.floor(mapdata[0].total_length / 60)
          var secondsTotal = mapdata[0].total_length - minutesTotal * 60
          if (secondsTotal < 10) secondsTotal = `0${secondsTotal}`
          var totalDrain = `${minutesDrain}:${secondsDrain}`
          var totalLength = `${minutesTotal}:${secondsTotal}`
          newQualifiedMap (qualifiedInfo, maplink, channel, hardestDiff, mapdata, totalDrain, totalLength)
        })
      })
    }
  })
}

function newQualifiedMap (qualifiedInfo, maplink, channel, hardestDiff, mapdata, totalDrain, totalLength) {
  var data = new Discord.RichEmbed(data);
  data.setURL(`http://osu.ppy.sh/s/${maplink}`)
  data.setTitle(qualifiedInfo)
  data.setColor(16711935)
  data.addField(`Drain/Length`, `${totalDrain}/${totalLength}`, true)
  data.addField(`# of difficulties`, `${mapdata.length}`, true)
  data.addField(`Hardest Difficulty (${hardestDiff.difficultyrating.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]}*):`, `Max Combo: ${hardestDiff.max_combo}\nOD${hardestDiff.diff_overall}, CS${hardestDiff.diff_size}, AR${hardestDiff.diff_approach}, HP${hardestDiff.diff_drain}`, true)
  data.addField(`BPM`, hardestDiff.bpm, true)
  data.setThumbnail(`https://b.ppy.sh/thumb/${maplink}l.jpg`)
  channel.sendEmbed(data)
}

function newNumberOneMessage (channel, messcomp, accuracy, data2, mapdata, minutesDrain, secondsDrain, minutesTotal, secondsTotal, returnString, maplink, data1) {
  if (returnString === "None") {
    redditMods = "Nomod"
  }
  else {
    redditMods = `+${returnString}`
  }
  var data = new Discord.RichEmbed(data);
  data.setColor(16711935)
  data.setTitle(messcomp.toString().replace(/,/g, " "))
  data.setURL(maplink)
  data.addField(`Accuracy`, `${accuracy}%`, true)
  data.addField(`Combo`, `${data2[0].maxcombo}/${mapdata.max_combo}`, true)
  if (data2[0].pp === null) {
    data.addField(`pp`, `0 (Qualified)`, true)
  }
  else {
    data.addField(`pp`, data2[0].pp.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0], true)
  }
  if (mapdata.difficultyrating.toString().match(/^-?\d+(?:\.\d{0,2})?/) != null) {
    data.addField(`Star Rating`, mapdata.difficultyrating.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0], true)
  }
  else {
    data.addField(`Star Rating`, `Null`, true)
  }
  data.addField(`Drain/Length`, `${minutesDrain}:${secondsDrain}/${minutesTotal}:${secondsTotal}`, true)
  data.addField(`Mods`, returnString, true)
  if (data2[0].pp === null) {
    data.addField(`Reddit Formatting`, `${data1.username} | ${mapdata.artist} - ${mapdata.title} ${redditMods} #1 | ${accuracy}% | 0pp (Qualified) ${data2[0].maxcombo}/${mapdata.max_combo} combo`, false)
  }
  else {
    data.addField(`Reddit Formatting`, `${data1.username} | ${mapdata.artist} - ${mapdata.title} ${redditMods} #1 | ${accuracy}% | ${data2[0].pp.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]}pp ${data2[0].maxcombo}/${mapdata.max_combo} combo`, false)
  }
  data.setThumbnail(`https://a.ppy.sh/${data1.user_id}_1.png`)
  channel.sendEmbed(data)
}

exports.startOsuTrack = function(bot, client, channels) {
    setInterval (function () {
			osudb.getosuPlayers(null, null, null, function (results) {
        results.forEach(osu => {
          channels.forEach(channel => {
            client.names(`${channel}`, function(err, names) {
              names.forEach(user => {
                if (user.name === osu.username) {
                }
              })
            })
          })
        })
      })
    }, 5000);
} //needs testing

exports.updateNames = function(olduser, newuser) {
  if (olduser.username != newuser.username) {
    userdb.userExists(newuser, function(results) {
      if (results.length < 1) {
        return;
      }
      if (results[0].names.length < 1) {
        userdb.updateUserNames(newuser)
      }
      else {
        for (var i = 0; i < results[0].names.length; i++) {
          if (results[0].names[i] === newuser.username) {
            return
          }
        }
        userdb.updateUserNames(olduser)
      }
    })
  }
}  //works

exports.startopenrecPolling = function(bot) {
    setInterval (function () {
      openrecdb.findAll(function(results){
        results.forEach( function (stream) {
          if(stream.channels.length > 0) {
            pollopenrec(stream, bot);
          }
        });
      })
    }, 60000);
} //works

function pollopenrec (stream, bot) {
	var options = {
	  url: 'https://www.openrec.tv/live/' + stream.name
	};
	request(options, function (error, response, data) {
    for (var i = 0; i < stream.channels.length; i++) {
      var channel = bot.channels.get(stream.channels[i])
      if (!stream.status) {
        if (data.indexOf("gbl_onair_status = \"1\"") > -1) {
          channel.sendMessage(`**${stream.name}** is streaming! Link: https://www.openrec.tv/live/${stream.name}`);
          openrecdb.updateStatus(stream.name, true)
        }
      }
      else if (stream.status) {
        if (data.indexOf("gbl_onair_status = \"2\"") > -1) {
          channel.sendMessage(`**${stream.name}** has finished streaming.`);
          openrecdb.updateStatus(stream.name, false)
        }
      }
    }
	})
} //works

exports.startTwitchPolling = function(bot) {
    setInterval (function () {
      twitchdb.findAll(function(results){
        results.forEach(function(stream) {
          if(stream.channels.length > 0 && stream.status != "offline?" && stream.status != "recheck") {
            pollTwitch(stream, bot);
          }
          else if (stream.status === "offline?" && stream.channels.length > 0) {
            twitchOffline(stream, bot)
          }
        });
      })
    }, 60000);
} //works

function pollTwitch (stream, bot) {
	var options = {
	  url: 'https://api.twitch.tv/kraken/streams/' + stream.name,
	  headers: {
	    'Client-ID': ConfigFile.twitch_client_id
	  }
	};
	request(options, function (error, response, data1) {
    stream.channels.forEach(chanid => {
      var channel = bot.channels.get(chanid)
      if (!error && response.statusCode == 200) {
        var parsedData = JSON.parse(data1);
        if (parsedData.stream && channel) {
          if (!stream.info[stream.name]) stream.info[stream.name] = {}
          if (!stream.info[stream.name][channel.id]) {
            var data = new Discord.RichEmbed(data);
            data.setTitle(`${stream.name} is streaming ${parsedData.stream.game}`)
            data.setDescription(parsedData.stream.channel.status)
            data.setURL(parsedData.stream.channel.url)
            if (parsedData.stream.channel.logo != null) data.setThumbnail(parsedData.stream.channel.logo);
            data.setColor("#6441A4")
            data.addField("Viewers", parsedData.stream.viewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), true)
            data.addField("Followers", parsedData.stream.channel.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), true)
            channel.sendEmbed(data)
            .then(message => {
              stream.info[stream.name][channel.id] = {
                viewers: parsedData.stream.viewers,
                maxviewers: parsedData.stream.viewers,
                initialfollowers: parsedData.stream.channel.followers,
                followers: parsedData.stream.channel.followers,
                logo: parsedData.stream.channel.logo,
                msg_id: message.id
              }
              twitchdb.updateStatus(stream.name, true)
              twitchdb.updateStats(stream.name, stream.info)
            })
          }
          else if (stream.info[stream.name][channel.id]) {
            bot.channels.get(channel.id).fetchMessage(stream.info[stream.name][channel.id].msg_id)
            .then(message => {
              if (parseInt(parsedData.stream.viewers) > parseInt(stream.info[stream.name][channel.id].maxviewers)) stream.info[stream.name][channel.id].maxviewers = parsedData.stream.viewers;
              var data = new Discord.RichEmbed(data);
              data.setTitle(`${stream.name} is streaming ${parsedData.stream.game}`)
              data.setDescription(parsedData.stream.channel.status)
              data.setURL(`${parsedData.stream.channel.url}`)
              data.setColor("#6441A4")
              data.addField("Viewers", `${parsedData.stream.viewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (Peak: ${stream.info[stream.name][channel.id].maxviewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`,true)
              if (parsedData.stream.channel.logo != null) data.setThumbnail(parsedData.stream.channel.logo);
              if(parseInt(parsedData.stream.channel.followers) - parseInt(stream.info[stream.name][channel.id].initialfollowers) > 0) data.addField("Followers", `${parsedData.stream.channel.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (+${parseInt(parsedData.stream.channel.followers) - parseInt(stream.info[stream.name][channel.id].initialfollowers)})`, true);
              else data.addField("Followers", `${parsedData.stream.channel.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (${parseInt(parsedData.stream.channel.followers) - parseInt(stream.info[stream.name][channel.id].initialfollowers)})`, true);
              message.edit("", {embed: data})
              .then(() => {
                stream.info[stream.name][channel.id] = {
                  viewers: parsedData.stream.viewers,
                  maxviewers: stream.info[stream.name][channel.id].maxviewers,
                  initialfollowers: stream.info[stream.name][channel.id].initialfollowers,
                  followers: parsedData.stream.channel.followers,
                  msg_id: message.id,
                  game: parsedData.stream.game,
                  image: parsedData.stream.channel.logo
                }
                twitchdb.updateStatus(stream.name, true)
                twitchdb.updateStats(stream.name, stream.info)
              })
            })
          }
        }
        else if (!parsedData.stream && channel && stream.status) {
          twitchdb.updateStatus(stream.name, "offline?")
        }
      }
    })
	})
} //works

function twitchOffline (stream, bot) {
  twitchdb.updateStatus(stream.name, "recheck")
  var options = {
    url: 'https://api.twitch.tv/kraken/streams/' + stream.name,
    headers: {
      'Client-ID': ConfigFile.twitch_client_id
    }
  }
  stream.channels.forEach(channel => {
    setTimeout(function() {
      request(options, function (error, response, data1) {
        if (!error && response.statusCode == 200) {
          var parsedData = JSON.parse(data1);
          if (!parsedData.stream) {
            if (!bot.channels.get(channel)) return;
            bot.channels.get(channel).fetchMessage(stream.info[stream.name][channel].msg_id)
            .then(message => {
              var data = new Discord.RichEmbed(data);
              data.setTitle(`${stream.name} has finished streaming.`)
              data.setURL(`https://twitch.tv/${stream.name}`)
              data.setColor("#6441A4")
              data.setThumbnail(stream.info[stream.name][channel].image);
              data.addField("Viewers", `Peak: ${stream.info[stream.name][channel].maxviewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,true)
              if (parseInt(stream.info[stream.name][channel].followers) - parseInt(stream.info[stream.name][channel].initialfollowers) > 0) data.addField("Followers", `${stream.info[stream.name][channel].followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (+${parseInt(stream.info[stream.name][channel].followers) - parseInt(stream.info[stream.name][channel].initialfollowers)})`, true);
              else data.addField("Followers", `${stream.info[stream.name][channel].followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (${parseInt(stream.info[stream.name][channel].followers) - parseInt(stream.info[stream.name][channel].initialfollowers)})`, true);
              message.edit("", {embed: data})
              .then(() => {
                twitchdb.updateStatus(stream.name, false)
                twitchdb.updateStats(stream.name, {})
              })
            })
          }
          else {
            twitchdb.updateStatus(stream.name, true)
          }
        }
      })
    }, 10000, channel);
  })
}

exports.newMember = function(bot, guild, user) {
  serverdb.getServerData(guild.id, function(results) {
    if (results[0].announceChannels.length < 1) return;
    for (var i = 0; i < results[0].announceChannels.length; i++) {
      var channel = bot.channels.get(results[0].announceChannels[i])
      if (results[0].joinMessage != "") {
        channel.sendMessage(`${results[0].joinMessage.replace(`%user%`, `${user}`).replace(`%server%`, `${guild}`)}`)
      }
      else {
        channel.sendMessage(`${user} has joined!`)
      }
    }
  })
} //needs testing //works

exports.ripMember = function(bot, guild, user) {
  serverdb.getServerData(guild.id, function(results) {
    if (results.length < 1) return;
    if (results[0].announceChannels.length < 1) return;
    for (var i = 0; i < results[0].announceChannels.length; i++) {
      var channel = bot.channels.get(results[0].announceChannels[i])
      if (results[0].leaveMessage != "") {
        channel.sendMessage(`${results[0].leaveMessage.replace(`%user%`, `${user}`).replace(`%server%`, `${guild}`)}`)
      }
      else {
        channel.sendMessage(`${user} has left!`)
      }
    }
  })
} //needs testing //works

exports.banMember = function(bot, guild, user) {
  serverdb.getServerData(guild.id, function(results) {
    if (results[0].announceChannels.length < 1) return;
    for (var i = 0; i < results[0].announceChannels.length; i++) {
      var channel = bot.channels.get(results[0].announceChannels[i])
      channel.sendMessage(`${user} has been banned!`)
    }
  })
} //needs testing //works

exports.unbanMember = function(bot, guild, user) {
  serverdb.getServerData(guild.id, function(results) {
    if (results[0].announceChannels.length < 1) return;
    for (var i = 0; i < results[0].announceChannels.length; i++) {
      var channel = bot.channels.get(results[0].announceChannels[i])
      channel.sendMessage(`${user} has been unbanned!`)
    }
  })
} //needs testing //works

exports.checkMuted = function(bot) {
  setInterval (function () {
    permissions.getAll(function(results) {
      results.forEach(function(data) {
        if (data.muted === true) {
          var d = new Date();
          var miliseconds = d.getTime();
          var totaltime = parseInt(miliseconds - (data.mutedTimestamp + data.mutedLength))
          if (totaltime > 0 && data.mutedLength != 0) {
            var server = bot.guilds.get(data.sid)
            var user = bot.users.get(data.uid)
            if (!user) return;
            if (!server) return;
            if (!server.member(user)) return
            for (var i = 0; i < server.channels.array().length; i++) {
      				var channame = server.channels.array()[i];
      				var channelaccess = channame.permissionsFor(user).serialize()
      				if (channelaccess.READ_MESSAGES === true && channame.type === "text") {
                changePerms(channame, data, user, "text", i)
      				}
      				else if (channelaccess.CONNECT === true && channame.type === "voice") {
                changePerms(channame, data, user, "voice", i)
      				}
              permissions.setMuted(user.id, server.id, false, miliseconds, 0)
      			}
          }
        }
      })
    })
  }, 5000);
} //works basic check

function changePerms(channame, data, user, type, i) {
  if (type === "text") {
    channame.overwritePermissions(user, { 'SEND_MESSAGES': undefined }).then(() => {
      for (var j = 0; j < channame.permissionOverwrites.array().length; j++) {
        if ((channame.permissionOverwrites.array()[j].denyData == 2048 || channame.permissionOverwrites.array()[j].denyData == 0) && channame.permissionOverwrites.array()[j].allowData == 0) {
          channame.permissionOverwrites.array()[j].delete().then(overwrites => {
          })
        }
      }
    })
  }
  else if (type === "voice") {
    channame.overwritePermissions(user, { 'SPEAK': undefined }).then(() => {
      for (var j = 0; j < channame.permissionOverwrites.array().length; j++) {
        if ((channame.permissionOverwrites.array()[j].denyData == 2048 || channame.permissionOverwrites.array()[j].denyData == 0) && channame.permissionOverwrites.array()[j].allowData == 0) {
          channame.permissionOverwrites.array()[j].delete().then(overwrites => {
          })
        }
      }
    })
  }
}
