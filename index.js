var Kongo = require('kongo');

module.exports = function *(connectionString) {
  var db = yield Kongo.Client.connect(connectionString);
  return function(Model) {
    return typeof Model == 'string' ? plugin.bind(null, Model) : plugin(Model.modelName, Model);
  };

  function plugin(collection, Model) {
    Model.db = db.collection(collection);

    Model.save = function*() { 
      return yield Model.db.insert(this._dirty)
    };

    Model.update = function*() {
      return yield Model.db.update({_id: this.primary()}, { $set: this._dirty }, {new: true});
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
  }
};
