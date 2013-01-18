var mongoose = require('mongoose')
  , debug = require('debug')('bones-boiler:MonEnumerable');

backend = backends.Mongoose.extend();

/**
 * Gets the latest of a mongodb collection based on the field 'created.'
 *
 * @param {Object} collection connection to execute the query on.
 * @param {number} skip number of documents in sorted order.
 * @param {number} limit number of documents to return.
 * @param {Function} callback to execute upon completion of the query.
 * @returns {boolean} query executed?
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