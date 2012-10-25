/*!
 * Generic DataService to abstract away database related calls.
 * Infrastructure pieces are also included along.
 */

var poolModule = require('generic-pool'),
  mongoDb = require('mongodb'),
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

/**
 * Prepare a Pool of mongodb connections
 * As soon as the module is loaded
 */
var pool = poolModule.Pool({
  name: 'mongodb',
  /**
   * Creating a connection
   */
  create: function(callback) {
    //var db = new Db(mongo.db, new Server(mongo.hostname, mongo.port, {safe: true, auto_reconnect: true}, {strict: true}));
    var db = new Db('test',new Server('localhost', 27017), {safe:true,auto_reconnect : true});
    db.open(function(err, connection) {
      callback(null, connection);
    });
  },

  destroy: function(connection) {
    if (connection !== null) {
      connection.close();
    }
  },
  max: 10,
  min: 2,
  idleTimeoutMillis: 3000,
  log: false
});

exports.service = function() {
  return {
    pool: function() {
      return pool;
    },
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
    findOneById : function(collectionName,_id,callBack){
      pool.acquire(function(err, connection) {
        if (err) {
          console.log("Error obtaining connection");
        } else {
          connection.collection(collectionName, function(err, collection) {
            collection.findOne({"_id": ObjectID(_id)}, function(err, doc) {
              if (doc !== null) {
                callBack(doc);
              } else {
                // no matching record is found
              }
            });

          })
        }
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
     * object literal needs to be passed as the criteria
     */
    findByCriteria: function(collectionName,criteria,callBack){
      pool.acquire(function(err, connection) {
        if (err) {
          console.log("Error obtaining connection");
        } else {
          connection.collection(collectionName, function(err, collection) {
            collection.find(criteria,function(err, cursor) {
              console.log("Criteria --- ",JSON.stringify(criteria));
              cursor.toArray(function(err, docs) {
                if (docs !== null) {
                  console.log("  Docs " + JSON.stringify(docs));
                  callBack(docs); // return all the subscriptions
                } else {
                  // cursor didn't returned any records
                }
              });
            });
          })
        }
      });
    }
  };
};