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
