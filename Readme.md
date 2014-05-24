# moko-mongo
mongo adapter for [moko](http://github.com/mokojs/moko).

## Installation

```
npm install moko-mongo
```

## Usage Example

```js
var mongo = require('moko-mongo');

db = yield mongo('mongodb://localhost:27017/test') // opens a connection
User.use(db);

var bob = yield new User({name: 'Bob'});
yield bob.save();
console.log(bob._id);
```

## Configuration

`moko-mongo` will use `Model.modelName` for the collection. For example:

```js
var mongo = yield require('moko-mongo')(connectString);
var User = moko('User').attr('_id').attr('name');
User.use(mongo) // uses 'User' for collection
```

If you would like to specify a different collection name, you can do so by
passing it as an argument to the plugin.

```js
User.use(mongo('People'));
```

## Full Documentation

#### Model.db

Raw [Kongo](http://github.com/rschmukler/kongo) collection that you can work
with directly.

#### Model.all(query, [options])

Queries for all models in the collection given the query. Additional options can
be passed in.

Returns an array of instances that match, or an empty array if nothing matched.

```js
var confirmedUsers = yield User.all({confirmed: true}, { sort: {confirmedAt: -1}, limit: 10});
```

#### Model.find/get(query, [options])

Queries for a specific model in the collection. Returns the first instance to
match the query. Additional options can be passed in.

Also supports taking a `String` for the query for the `_id`.

If no documents match, returns false.

```js
var user = yield User.get('536b8b39e7449b020000000b'); // Look up via string
    user = yield User.get({_id: '536b8b39e7449b020000000b'}); // Look up via string
    user = yield User.get({age: 30}, {sort: {createdAt: -1}}); // Look up via string
```

#### Model.removeAll(query, [options])

Removes all documents that match the query. Returns the number of documents
removed

```js
var removed = yield User.removeAll({deleted: true});
console.log("%d user accounts were removed", removed);
```

#### Model.index(fields, [options])

Alias to `Model.db.ensureIndex`. Lets you make indexes!

### Model.query()

Returns a wrapped instances of `mquery`. See [mquery support](#mquery-support) below.

### Model.aggregate(bool)

Returns a wrapped instances of `maggregate`. See [maggregate support](#maggregate-support) below.

Optionally, if don't want it to return `Model` instances, you can use `Model.aggregate(true)` to skip wrapping the instances.

## mquery support

`moko-mongo` provides a wrapped version of the wonderful [mquery](https://github.com/aheckmann/mquery) 
query builder. To get it, simply call `Model.query()`.
This allows you to build readable and robust queries easily. When approprirate,
modella-mongo will return instances of `modella` models, instead of just
documents. Aside from that, it follows the `mquery` API completely.

### Example with mquery

```js
  var bob = yield User.query().findOne().where({username: 'Bob'})
```

## maggregate support

`moko-mongo` uses the [maggregate](https://github.com/rschmukler/maggregate) 
aggregation builder. To use it, simply call `Model.aggregate()`.

This allows you to build readable aggregations easily. By default it wraps
responses in `Model` instances, but can be disabled by passing `skipWrap` as
`true`. It also follows the `maggregate` api completely.

### Example with maggregate

```js
var skipWrapping = true;
locations = yield User.aggregate(skipWrapping)
  .group({_id: '$location', userCount: {$sum: 1}});

locations.forEach(function(location) {
  console.log("%s has %d users", location._id, userCount);
});
```
