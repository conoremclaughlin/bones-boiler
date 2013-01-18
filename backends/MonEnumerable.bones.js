var mongoose = require('mongoose')
  , debug = require('debug')('bones-boiler:MonEnumerable');

backend = backends.Mongoose.extend();

// TODO: Create some form of closure where the name of a collection can be passed. Custom mix-in method?
// TODO: Take a look at the plugin architecture of Mongoose and make use of it (adding support for created as a property,
// for example.
// Looking for a way to define static methods I guess.  Statics object like in Mongoose Collections?
// Options:
// 1. write a mixin method that takes a
/**
 * Requires a db connection to access mongooseModels.
 * @param lt - must be less than
 * @param gt -
 * @param callback - what next?
 * @api public
 */
backend.prototype.getLatest = function(connection, skip, limit, callback) {
    callback = callback || _.last(arguments);
    if (!callback || !_.isFunction(callback)) return false;
    skip = skip || 0;
    limit = limit || 10;
    connection
        .find()
        .sort('-created')
        .skip(skip)
        .limit(limit)
        .exec(callback);
    return true;
};



