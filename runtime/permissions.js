Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/permission',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.checkPermissions = function(userid, serverid, callback) {
  db.find({ uid: userid, sid: serverid }, function (err, results){
    if (results.length < 1) {
      var temp = {
        uid: userid,
        sid: serverid,
        punishLevel: 0,
        punishReason: [],
        punishTimestamp: "",
        muted: false,
        mutedTimestamp: 0,
        mutedLength: 0,
        level: 0
      }
      db.insert(temp)
      callback(0)
    }
    else {
      callback(results[0])
    }
  })
}

exports.setPermissions = function(userid, serverid, permlevel) {
  db.update({ uid: userid, sid: serverid }, { $set: { level: permlevel } }, {})
}

exports.setPunishLevel = function(userid, serverid, pl, reason, timestamp) {
  if (!reason && !timestamp) {
    db.update({ uid: userid, sid: serverid }, { $set: { punishLevel: pl} }, {}, function(err,numReplaced) {
      if (numReplaced == "0" || numReplaced == 0) {
        var temp = {
          uid: userid,
          sid: serverid,
          punishLevel: pl,
          punishReason: [reason],
          punishTimestamp: timestamp,
          muted: false,
          mutedTimestamp: 0,
          mutedLength: 0,
          sendMessagesTrue: [],
          sendMessagesFalse: [],
          level: 0
        }
        db.insert(temp)
      }
    })
  }
  else {
    db.update({ uid: userid, sid: serverid }, { $set: { punishLevel: pl, punishTimestamp: timestamp }, $push: { punishReason: reason } }, {}, function(err,numReplaced) {
      if (numReplaced == "0" || numReplaced == 0) {
        var temp = {
          uid: userid,
          sid: serverid,
          punishLevel: pl,
          punishReason: [reason],
          punishTimestamp: timestamp,
          muted: false,
          mutedTimestamp: 0,
          mutedLength: 0,
          level: 0
        }
        db.insert(temp)
      }
    })
  }
}

exports.setMuted = function(userid, serverid, status, timestamp, length, allowed, denied) {
  db.update({ uid: userid, sid: serverid }, { $set: { muted: status, mutedTimestamp: timestamp, mutedLength: length, sendMessagesTrue: allowed, sendMessagesFalse: denied } })
}

exports.getAll = function(callback) {
  db.find({}, function (err, docs) {
    callback(docs)
  });
}
