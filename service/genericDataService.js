/*!
 * Generic DataService to abstract away database related calls.
 * Infrastructure pieces are also included along.
 */

var mongoDb = require('mongodb'),
  Db = mongoDb.Db,
  ObjectID = require('mongodb').ObjectID;
Server = mongoDb.Server;

if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
} else {
  var mongo = {
    "hostname": "localhost",
    "port": 27017,
    "username": "",
    "password": "",
    "name": "",
    "db": "kino"
  }
}

var db = new Db('test', new Server('localhost', 27017), {safe: true, auto_reconnect: true});

var pConnection = null;
/**
 * Here is where the nodejs really shines.
 * We need not prepare a connection pool, MongoDB driver internally manages the
 * connection pool for us. Eventually anything we query, would be associated with
 * a callback which would be eventually called once the query returns result and
 * is pushed into the event-callback-queue.
 */
db.open(function(err, connection) {
  pConnection = connection; // let there be a single connection.... mongodb-driver manages the connection pool internally
});

exports.service = function() {
  return {
    getObjectId: function() {
      return ObjectID;
    },
    /**
     *
     * @param collectionName
     * @param _id
     * @param callBack
     *
     * @returns Returns the obtained doc
     */
    findOneById: function(collectionName, _id, callBack) {
      pConnection.collection(collectionName, function(err, collection) {
        collection.findOne({"_id": ObjectID(_id)}, function(err, doc) {
          if (!err) {
            callBack(doc);
          }
        });
      });
    },
    /**
     *
     * @param collectionName
     * @param criteria
     * @param callBack
     *
     * @returns a single doc on the basis of the criteria
     */
    findOneByCriteria: function(collectionName, criteria, callBack) {
      pConnection.collection(collectionName, function(err, collection) {
        collection.findOne(criteria, function(err, doc) {
          if (!err) {
            callBack(doc);
          }
        });
      });
    },
    /**
     *
     * @param collectionName
     * @param criteria
     * @param callBack
     *
     * @returns an array of documents, matching the criteria from a collection
     *
     * If all records need to returned from a collection, then an empty
     * object literal {}  needs to be passed as the criteria
     */
    findByCriteria: function(collectionName, criteria, callBack) {
      pConnection.collection(collectionName, function(err, collection) {
        collection.find(criteria, function(err, cursor) {
          cursor.toArray(function(err, docs) {
            if (!err) {
              callBack(docs);
            }
          });
        });
      });
    }
  };
};