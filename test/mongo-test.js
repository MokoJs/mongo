var moko = require('moko'),
    expect = require('expect.js'),
    Kongo = require('kongo'),
    mongo = require('../');

describe('Moko mongo', function() {
  var User = moko('User').attr('_id').attr('name').attr('age'),
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

  describe('save', function() {
    it('saves the record', function*() {
      var bob = yield new User({name: 'Bob'});
      yield bob.save();
      expect(bob._id).to.be.ok();
      expect(yield col.findOne({name: 'Bob'})).to.be.ok();
    });
  });

  describe('update', function() {
    it('updates the record', function*() {
      var bob = yield new User({name: 'Bob'});
      yield bob.save();
      expect(bob._id).to.be.ok();
      bob.name = 'Steve';
      yield bob.save();
      expect(yield col.findOne({name: 'Steve'})).to.be.ok();
    });
  });

  describe('remove', function() {
    it('removes the record', function*() {
      var phil = yield new User({name: 'Phil'});
      yield phil.save();
      yield phil.remove();
      expect(yield col.findOne({name: 'Phil'})).to.not.be.ok();
    });
  });


  describe('query methods', function() {
    var larry, moe, curly;
    before(function*() {
      larry = yield new User({name: 'Larry', age: 30});
      moe   = yield new User({name: 'Moe'});
      curly = yield new User({name: 'Curly'});
      yield [larry.save(), moe.save(), curly.save()]
    });

    describe('all', function() {
      it('returns an empty array if no records match', function*() {
        var users = yield User.all({name: 'Boeboe'});
        expect(users).to.be.an(Array);
        expect(users).to.have.length(0);
      });

      it('returns an array of instances', function*() {
        var users = yield User.all({name: 'Larry'});
        expect(users).to.be.an(Array);
        expect(users).to.have.length(1);
        expect(users[0]).to.be.a(User);
      });

      it('forwards options', function*() {
        var users = yield User.all({name: { $in: ['Larry', 'Moe', 'Curly'] }}, { limit: 2});
        expect(users).to.have.length(2);
      });
    });

    describe('get', function() {
      it('aliases to Model.find', function() {
        expect(User.get).to.be(User.find);
      });

      it('returns false if the model does not exist', function*() {
        expect(yield User.find({name: 'Princess'})).to.be(false);
      });

      it('returns an instance of the model', function*() {
        expect(yield User.find({name: 'Larry'})).to.be.a(User);
      });

      it('works with a string as a first argument', function*() {
        expect(yield User.find(larry.primary().toString())).to.be.a(User);
      });

      it('works with a string in _id', function*() {
        expect(yield User.find({_id: larry.primary().toString()})).to.be.a(User);
      });

      it('returns false if undefined is passed in', function*() {
        expect(yield User.find(undefined)).to.be(false);
      });

      it('forwards options', function*() {
        var newLarry = yield new User({name: 'Larry', age: 60});
        yield newLarry.save();
        expect(yield User.find({name: 'Larry'}, {sort: {age: -1}})).to.have.property('age', 60);
        expect(yield User.find({name: 'Larry'}, {sort: {age:  1}})).to.have.property('age', 30);
      });
    });
  });
});
