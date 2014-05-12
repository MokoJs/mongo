var moko = require('moko'),
    expect = require('expect.js'),
    Kongo = require('kongo'),
    mongo = require('../');

describe('Moko mongo', function() {
  var User = moko('User').attr('_id').attr('name'),
      db;

  before(function*() {
    db = yield mongo('mongodb://localhost:27017/moko-mongo');
    User.use(db);
  });

  var col;

  before(function*() {
    var db = yield Kongo.Client.connect('mongodb://localhost:27017/moko-mongo');
    col = db.collection('User');
    yield col.remove({});
  });

  it('is a sync layer plugin', function() {
    expect(User.save).to.be.a(Function);
    expect(User.update).to.be.a(Function);
    expect(User.remove).to.be.a(Function);
  });

  describe('collection name', function() {
    it('sets the collection name', function() {
      expect(User.db._collection.collectionName).to.be('User');
    });

    it('allows for custom collection names', function() {
      User.use(db('Person'));
      expect(User.db._collection.collectionName).to.be('Person');
      User.use(db('User'));
    });
  });
});
