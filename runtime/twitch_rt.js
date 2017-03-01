var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/twitch',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.twitchUserExists = function(twitchuser, callback) {
  db.find({ name: twitchuser },  function (err, docs) {
      callback(docs)
  })
}

exports.create = function(data) {
  db.insert(data)
}

exports.newTwitchUser = function (twitchuser, channelid) {
  var data = {
    name: twitchuser,
    channels: [channelid],
    status: false,
    info: {}
  }
  db.insert(data, function (err, docs) {})
}

exports.updateTwitchUser = function(twitchuser, channelid, method) {
  if (method === "push") {
    db.update({ name: twitchuser }, { $push: { channels: channelid } }, { upsert: true })
  }
  else if (method === "pull") {
    db.update({ name: twitchuser }, { $pull: { channels: channelid } }, {})
  }
}

exports.findAll = function(callback){
  db.find({}, function (err, docs) {
    callback(docs)
  })
}

exports.updateStatus = function(twitchuser, status) {
  db.update({ name: twitchuser }, { $set: { status: status } }, {})
}

exports.updateStats = function(twitchuser, stats) {
  db.update({ name: twitchuser }, { $set: { info: stats } }, {})
}
