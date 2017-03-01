var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/servers',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.serverExists = function(server, callback) {
  db.find({ uid: server.id },  function (err, docs) {
    if (docs.length < 1) {
      var data = {
        name: server.name,
        id: server.id,
        owner: server.ownerID, //implemented
        stafflogChannel: "", //implemented
        nsfwChannels: [], //implemented
        announceChannels: [], //implemented
        joinMessage: "", //implemented
        leaveMessage: "", //implemented
        colorUser: "off", //implemented
        ignoredChannels: [], //implemented
        disabledCommands: []
      }
      db.insert(data, function (err, doc) {
        if (err) {
          callback(err, null)
        }
        else {
          callback(null, doc)
        }
      })
    }
    else {
      callback(docs)
    }
  })
}

exports.setStaffLog = function(serverid, stafflogid) {
  db.update({ id: serverid }, { $set: { stafflogChannel: stafflogid } }, {})
}

exports.setJoinMessage = function(serverid, message) {
  db.update({ id: serverid }, { $set: { joinMessage: message } }, {})
}

exports.setLeaveMessage = function(serverid, message) {
  db.update({ id: serverid }, { $set: { leaveMessage: message } }, {})
}

exports.getServerData = function(serverid, callback) {
  db.find({ id: serverid }, function (err, docs) {
    callback(docs)
  });
}

exports.updateBannedCommands = function(serverid, command, method) {
  if (method === "push") {
    db.update({ id: serverid }, { $push: { disabledCommands: command } }, {})
  }
  else if (method === "pull") {
    db.update({ id: serverid }, { $pull: { disabledCommands: command } }, {})
  }
}

exports.updateIgnoreChannels = function(serverid, channelid, method) {
  if (method === "push") {
    db.update({ id: serverid }, { $push: { ignoredChannels: channelid } }, {})
  }
  else if (method === "pull") {
    db.update({ id: serverid }, { $pull: { ignoredChannels: channelid } }, {})
  }
}

exports.updateColorUser = function(serverid, mode) {
  db.update({ id: serverid }, { $set: { colorUser: mode } }, {})
}

exports.updateNsfw = function(serverid, channel, method) {
  if (method === "push") {
    db.update({ id: serverid }, { $push: { nsfwChannels: channel } }, {})
  }
  else if (method === "pull") {
    db.update({ id: serverid }, { $pull: { nsfwChannels: channel } }, {})
  }
}

exports.setAnnounceChannels = function(serverid, channelid, method) {
  if (method === "push") {
    db.update({ id: serverid }, { $push: { announceChannels: channelid } }, {})
  }
  else if (method === "pull") {
    db.update({ id: serverid }, { $pull: { announceChannels: channelid } }, {})
  }
}
