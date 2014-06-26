var co = require('co');

var Kongo = require('kongo'),
    mquery = require('mquery'),
    maggregate = require('maggregate'),
    clone = require('moko').utils.clone;

module.exports = function *(connectionString) {
  var db = yield Kongo.Client.connect(connectionString);
  return function(Model) {
    return typeof Model == 'string' ? plugin.bind(null, Model) : plugin(Model.modelName, Model);
  };

  function plugin(collection, Model) {
    Model.db = db.collection(collection);

    Model.save = function*() {
      return yield Model.db.insert(deleteUndefinedKeys(this._dirty));
    };

    Model.update = function*() {
      return yield Model.db.update({_id: this.primary()}, buildQuery(this._dirty), {new: true});
    };

    Model.remove = function*() {
      return yield Model.db.remove({_id: this.primary()});
    };

    Model.all = function*() {
      var args = Array.prototype.slice.call(arguments),
          records = yield Model.db.find.apply(Model.db, args);

      return yield new Model(records);
    };

    Model.get = Model.find = function*() {
      var args = Array.prototype.slice.call(arguments);

      if(!args[0]) return false;
      if(typeof args[0] == 'string') args[0] = Kongo.Id(args[0]);
      else if(typeof args[0] == 'object' && args[0]._id) args[0]._id = Kongo.Id(args[0]._id);

      var result = yield Model.db.findOne.apply(Model.db, args);

      return result ? yield new Model(result) : false;
    };

    Model.removeAll = function*() {
      var args = Array.prototype.slice.call(arguments);
      return (yield Model.db.remove.apply(Model.db, args))[0];
    };

    Model.index = Model.db.ensureIndex;

    Model.query = function() {
      var query = mquery(Model.db._collection);
      var exec = query.exec;
      query.exec = function(cb) {
        exec.call(query, function(err, results) {
          co(function*() {
            if(err) throw err;
            return yield new Model(results);
          })(cb);
        });
      };
      return query;
    };

    Model.aggregate = function(skip) {
      var aggregate = maggregate(Model.db._collection),
          exec = aggregate.exec;
      aggregate.exec = function(cb) {
        exec.call(aggregate, function(err, results) {
          co(function*() {
            if(err) throw err;
            if(skip) return results;
            return yield new Model(results);
          })(cb);
        });
      };
      return aggregate;
    };
  }
};

function buildQuery(dirty) {
  var newDirty = clone(dirty);
  var query = {
    $set: {},
    $unset: {}
  };

  for(var key in newDirty) {
    if(newDirty[key] === undefined) {
      delete newDirty[key];
      query.$unset[key] = true;
    } else {
      query.$set[key] = newDirty[key];
    }
  }

  for(var key in query) {
    if(Object.keys(query[key]).length === 0) {
      delete query[key];
    }
  }

  return query;
}

function deleteUndefinedKeys(obj) {
  var newObj = clone(obj);
  for(var key in newObj) {
    if(newObj[key] === undefined) {
      delete newObj[key];
    }
  }
  return newObj;
}
