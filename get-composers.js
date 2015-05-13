var MongoClient = require('mongodb').MongoClient;
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/classical';


var findComposers = function(db, callback) {
  a=0;
  var cursor =db.collection('composers').find( );
  cursor.each(function(err, doc) {
    console.log(a);
    a++;
    assert.equal(err, null);
    if (doc != null) {
       console.dir(doc);
    } else {
       callback();
    }
  });
};

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  findComposers(db, function() {
      db.close();
  });
});