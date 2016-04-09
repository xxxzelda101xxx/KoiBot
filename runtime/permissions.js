var ConfigFile = require("../config.json"),
  LevelUP = require("levelup"),
  Logger = require("./logger.js").Logger;

var db = LevelUP('./runtime/databases/discord_permissions');

exports.GetLevel = function(sum, user, callback) {
  if (user === ConfigFile.permissions.masterUser) {
    return callback(null, 9); // Return a massive value if the user is the master user
  }
  if (user == ConfigFile.permissions.level1) {
    return callback(null, 1); // Hardcoded reply if user has a global permission
  }
  if (user == ConfigFile.permissions.level2) {
    return callback(null, 2); // Hardcoded reply if user has a global permission
  }
  if (user == ConfigFile.permissions.level3) {
    return callback(null, 3); // Hardcoded reply if user has a global permission
  }
  // Else, connect to LevelUP and fetch the user level
  db.get("auth_level:" + sum, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, 0); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, parseInt(value));
    }
  });
};

exports.GetNSFW = function(channel, callback) {
  db.get("auth_nsfw:" + channel, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "off"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.GetIgnore = function(channel, callback) {
  db.get("auth_ignore:" + channel, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "no"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.GetIgnore = function(channel, callback) {
  db.get("auth_ignore:" + channel, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "no"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.GetAnnounce = function(channel, callback) {
  db.get("auth_announce:" + channel, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "off"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.GetOsu = function(msg, callback) {
  db.get("auth_osu:" + msg.author.id, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "no"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.SetLevel = function(sum, level, callback) {
  db.put("auth_level:" + sum, parseInt(level), function(err) {
    if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, parseInt(level));
    }
  });
};

exports.SetNSFW = function(channel, allow, callback) {
  db.put("auth_nsfw:" + channel, allow, function(err) {
    if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow);
    }
  });
};

exports.SetIgnore = function(channel, allow1, callback) {
  db.put("auth_ignore:" + channel, allow1, function(err) {
    if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow1);
    }
  });
};

exports.SetOsu = function(msg, allow2, callback) {
  db.put("auth_osu:" + msg.author.id, allow2, function(err) {
    if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow2);
    }
  });
};

exports.SetAnnounce = function(channel, allow2, callback) {
  db.put("auth_announce:" + channel, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.SetPmMentions = function(user, allow2, callback) {
  db.put("auth_pmmentions:" + user, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.GetPmMentions = function(user, callback) {
  db.get("auth_pmmentions:" + user, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "off"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.SetPreviousName = function(user, allow2, callback) {
  db.put("auth_names:" + user, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.GetPreviousName = function(user, callback) {
  db.get("auth_names:" + user, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "none"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.SetAnnouncement = function(server, allow2, callback) {
  db.put("auth_announcement:" + server, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.GetAnnouncement = function(server, callback) {
  db.get("auth_announcement:" + server, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "on"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.GetAnnounceJoinMessage = function(server, callback) {
  db.get("auth_announcejoinmessage:" + server, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "none"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, "none");
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.SetAnnounceJoinMessage = function(server, allow2, callback) {
  db.put("auth_announcejoinmessage:" + server, allow2, function(err) {
	if (err) {
		console.log(err)
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.GetPunishLevel = function(user, callback) {
  db.get("auth_punishlevel:" + user, function(err, value) {
    if (err) {
		//console.log(err)
      if (err.notFound) {
        callback(null, "0"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, "none");
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};


exports.SetPunishLevel = function(user, allow2, callback) {
  db.put("auth_punishlevel:" + user, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.GetAnnounceLeaveMessage = function(server, callback) {
  db.get("auth_announceleavemessage:" + server, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "none"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, "none");
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.SetPrincipe = function(server, allow2, callback) {
  db.put("auth_principe:" + server, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, 0);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.GetPrincipe = function(server, callback) {
  db.get("auth_principe:" + server, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, 1); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.Setsnek = function(server, allow2, callback) {
  db.put("auth_snek:" + server, allow2, function(err) {
  if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, 0);
    }
    if (!err) {
      callback(null, allow2);
    return;
    }
  });
};

exports.Getsnek = function(server, callback) {
  db.get("auth_snek:" + server, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, 1); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.SetSpeechless = function(server, allow2, callback) {
  db.put("auth_Speechless:" + server, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, 0);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.GetSpeechless = function(server, callback) {
  db.get("auth_Speechless:" + server, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, 1); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.SetStafflog = function(server, allow2, callback) {
  db.put("auth_Stafflog:" + server, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, "none");
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.GetStafflog = function(server, callback) {
  db.get("auth_Stafflog:" + server, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "none"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};

exports.SetAnnounceLeaveMessage = function(server, allow2, callback) {
  db.put("auth_announceleavemessage:" + server, allow2, function(err) {
	if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, allow2);
	  return;
    }
  });
};

exports.SetOsuRank = function(osuname, osurank, callback) {
  db.put("auth_osutest:" + osuname, osurank, function(err) {
    if (err) {
      Logger.error("LevelUP error! " + err);
      callback(err, -1);
    }
    if (!err) {
      callback(null, osurank);
    }
  });
};


exports.GetOsuRank = function(osuname, callback) {
  db.get("auth_osutest:" + osuname, function(err, value) {
    if (err) {
      if (err.notFound) {
        callback(null, "no"); // Return 0 if no value present in LevelUP
        return;
      } else {
        Logger.error("LevelUP error! " + err);
        callback(err, -1);
      }
    }
    if (value) {
      return callback(null, value);
    }
  });
};