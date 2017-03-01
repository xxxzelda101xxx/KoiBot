var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/osutracking',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.getosuPlayers = function(user, channelid, modeid, callback) {
  if (user === null && channelid !== null && modeid === null) {
    db.find({ channel: channelid }, function(err, results) {
      callback(results)
    });
  }
  else if (user === null && channelid === null && modeid === null) {
    db.find({}, function(err, results) {
      callback(results)
    });
  }
  else if (user !== null && channelid === null && modeid !== null) {
    db.find({ username: user, mode: modeid }, function(err, results) {
      callback(results)
    });
  }
  else if (user !== null && channelid === null && modeid == null) {
    db.find({ username: user }, function(err, results) {
      callback(results)
    });
  }
  else {
    console.log(user === null + "" + user)
    console.log(channelid === null + "" + channelid)
    console.log(modeid === null + "" + modeid)
  }
}

exports.createosuPlayer = function(data, callback) {
  db.insert(data, function (err, doc) {
    if (err) {
      callback(err, null)
    }
    else {
      callback(null, doc)
    }
  })
}

exports.removeosuPlayer = function(user, channelid, modeid, dbid, callback) {
  if (dbid !== null) {
    db.remove({ _id: dbid }, {}, function (err) {
    })
    return;
  }
  if (user !== null && channelid === null && modeid === null) {
    db.remove({ username: user }, { multi: true }, function (err) {
    })
    return;
  }
  else {
    db.remove({ username: user, channel: channelid, mode: modeid }, {}, function (err) {
      if (err) {
        callback(err)
      }
      else {
        callback(null)
      }
    })
  }
}

exports.updateosuPlayer = function(newdata, olddata) {
  if (newdata) {
    olddata.rank = newdata.pp_rank;
    olddata.countryrank = newdata.pp_country_rank;
    olddata.pp = newdata.pp_raw;
    olddata.accuracy = newdata.accuracy;
  }
  db.update({ username: olddata.username, channel: olddata.channel, mode: olddata.mode }, olddata)
}

exports.updateosuPlayerChannels = function(channelid, dbid, doDelete) {
  if (doDelete === true) {
    db.update({ _id: dbid }, { $pull: { channel: channelid } })
  }
  else if (doDelete === false) {
    db.update({ _id: dbid }, { $push: { channel: channelid } })
  }
}
