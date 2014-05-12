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
  }
};
