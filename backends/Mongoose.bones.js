var mongoose = require('mongoose')
  , debug = require('debug')('bones-boiler:mongoose');

backend = Bones.Backend.extend();

backend.sync = function(req, res, next) {
    if (!req.model) return next(new Error.HTTP('Error occured. No model to sync. Please try again later.', 500));

    switch(req.method) {
    case 'get':
    case 'GET':
        req.model.db.findById(req.model.id, function(err, document) {
            if (err) return next(new Error.HTTP(err, 500));
            if (!document) return next(new Error.HTTP(err, 404));
            res.locals.model = document.toObject();
            return next(); // got!
        });
        break;
    case 'post':
    case 'POST':
        // I'd rather use db.create to be consistent
        // but it initializes a document anyway.
        var document = new req.model.db(req.body);
        document.save(function(err, document) {
            if (err) return next(new Error.HTTP(err, 500));
            res.locals.model = document.toObject();
            return next(); // saved!
        });

        break;
    case 'put':
    case 'PUT':
        // XXX: Bug in mongoose so findByIdAndUpdate
        // fails at this time if document is not initialized.
        // TODO: Check again when we bump versions.
        if (req.body._id) delete req.body._id;
        req.model.db.update({ _id: req.model.id }, req.body, function(err, document) {
            if (err) return next(new Error.HTTP(err, 500));
            return next(); // updated!
        });
        break;
    case 'delete':
    case 'DELETE':
        req.model.db.findByIdAndRemove(req.model.id, function(err) {
            if (err) return next(new Error(err));
            res.locals.model = { id: null };
            return next(); // deleted!
        });
        break;
    default:
        return res.send(new Error.HTTP('Unknown request method: ' + req.method, 500));
    }
};

/**
 * .
 */
backend.dropDatabase = function(url, callback) {
    var mongoose = require('mongoose');
    mongoose.connect(url, function(err) {
        mongoose.connection.db.dropDatabase();
        callback && callback(err);
    });
};

/**
 * .
 */
backend.makeGetConnection = function(collection) {
    var getConnection = ''
       , queries = {};

    if (_.isString(collection)) {
        getConnection = function() {
            return Bones.plugin.mongooseModels[collection];
        };
    } else if (_.isObject(collection)) {
        getConnection = function() {
            return collection;
        };
    } else {
        return false;
    }

    return function(parent) {
        var args = Array.prototype.slice.call(arguments, 1);
        args = [ getConnection() ].concat(args);
        parent.apply(this, args);
    };
};

/**
 * .
 */
backend.mixinQueries = function(collection) {
    var title = collection.title || collection.constructor.title;
    if (!title) return false;
    title = Bones.utils.singularize(title);
    Bones.Backend.extendWithPre(collection, this.prototype, backend.makeGetConnection(title));
};

/**
 * Mixs in a backend object's queries into a collection's prototype
 * with a pre function to fetch a connection.
 *
 * TODO: No tests yet, waiting to complete when decided on more
 * concrete collection/query structure.
 */
backend.mixinPrototypeQueries = function(collection, pre) {
    pre = pre ? pre : function() {
        if (this.db) {
            return this.db;
        } else {
            return false;
        }
    };
    collection.prototype.getConnection = pre;
    Bones.Backend.extendWithPre(collection.prototype, this.collection, pre);
};

