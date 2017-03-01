var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/customcoms',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);


exports.exists = function(serverid, customcomname, callback) {
  db.find({ sid: serverid, command: customcomname}, function(err, results) {
    callback(results)
  });
}

exports.getCustomCommands = function(serverid, callback) {
  db.find({ sid: serverid }, function(err, results) {
    callback(results)
  });
}

exports.update = function(data) {
  db.update({ command: data.command, sid: data.sid }, { $set: { response: data.response } }, {})
}

exports.create = function(data) {
  db.insert(data)
}

exports.delete = function(data) {
  db.remove({ _id: data._id })
}
