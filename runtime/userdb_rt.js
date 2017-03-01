var config = require("../config.json"),
  Datastore = require('nedb');

var db = new Datastore({
  filename: './runtime/databases/users',
  autoload: true
});

db.persistence.setAutocompactionInterval(30000);

exports.userExists = function(user, callback) {
  db.find({ uid: user.id },  function (err, docs) {
    if (docs.length < 1) {
      var data = {
        uid: user.id,
        names: [],
        osuUsername: "",
        pmMentions: false,
        messagesSent: 0,
        commandsUsed: 0
      }
      db.insert(data)
      if (user.suffix) {
        callback(docs, user.suffix)
      }
      else {
        callback(docs)
      }
    }
    else {
      if (user.suffix) {
        callback(docs, user.suffix)
      }
      else {
        callback(docs)
      }
    }
  })
}

exports.increment = function(user, command) {
  db.find({ uid: user.id },  function (err, docs) {
    if (docs.length < 1) {
      exports.userExists(user, function(docs) {
        if (command) {
          docs[0].commandsUsed = docs[0].commandsUsed + 1
          docs[0].messagesSent = docs[0].messagesSent + 1
          db.update({ uid: user.id }, docs[0])
        }
        else if (!command) {
          docs[0].messagesSent = docs[0].messagesSent + 1
          db.update({ uid: user.id }, docs[0])
        }
      })
    }
    else {
      if (command) {
        docs[0].commandsUsed = docs[0].commandsUsed + 1
        docs[0].messagesSent = docs[0].messagesSent + 1
        db.update({ uid: user.id }, docs[0])
      }
      else if (!command) {
        docs[0].messagesSent = docs[0].messagesSent + 1
        db.update({ uid: user.id }, docs[0])
      }
    }
  })
}

exports.updateUserNames = function(user) {
  db.update({ uid: user.id }, { $push: { names: user.username } }, {})
}

exports.updateUserNames1 = function(user, name) {
  db.update({ uid: user.id }, { $push: { names: name } }, {})
}

exports.setPmMentions = function(userid, status) {
  db.update({ uid: userid }, { $set: { pmMentions: status } }, {})
}
