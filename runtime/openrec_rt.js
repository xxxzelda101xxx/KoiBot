///var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/openrec',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.openrecUserExists = function(openrecuser, callback) {
  db.find({ name: openrecuser },  function (err, docs) {
      callback(docs)
  })
}

exports.newopenrecUser = function (openrecuser, channelid) {
  var data = {
    name: openrecuser,
    channels: [channelid],
    status: false
  }
  db.insert(data, function (err, docs) {})
}

exports.updateopenrecUser = function(openrecuser, channelid, method) {
  if (method === "push") {
    db.update({ name: openrecuser }, { $push: { channels: channelid } }, { upsert: true })
  }
  else if (method === "pull") {
    db.update({ name: openrecuser }, { $pull: { channels: channelid } }, {})
  }
}

exports.findAll = function(callback){
  db.find({}, function (err, docs) {
    callback(docs)
  })
}

exports.updateStatus = function(openrecuser, status) {
  db.update({ name: openrecuser }, { $set: { status: status } }, {})
}
