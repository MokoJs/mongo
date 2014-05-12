var Kongo = require('kongo');

module.exports = function *(connectionString) {
  var db = yield Kongo.Client.connect(connectionString);
  return function(Model) {
    return typeof Model == 'string' ? plugin.bind(null, Model) : plugin(Model.modelName, Model);
  };

  function plugin(collection, Model) {
    Model.db = db.collection(collection);

    Model.save = function*() { };
    Model.update = function*() { };
    Model.remove = function*() { };
  }
};
