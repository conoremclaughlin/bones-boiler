var Bones = require(global.__BonesPath__ || 'bones')
  , Backbone = Bones.Backbone
  , _ = Bones._
  , debug = require('debug')('bones-boiler:backend')
  , util = require('util');

module.exports = Backend;

function Backend(plugin, callback) {
    this.bootstrap(plugin, function() {
        this.initialize(plugin, callback);
    }.bind(this));
};

Backend.augment = Backbone.Router.augment;
Backend.extend = Backbone.Router.extend;

Backend.toString = function() {
    return '<Backend ' + this.title + '>';
};

Backend.prototype.bootstrap = function(plugin, callback) {
    callback();
};

Backend.prototype.initialize = function(plugin, callback) {};

/**
 * Wraps all functions in a source object with a 'pre' function
 * and extends the destination object with the wrapped source.
 * Combination of Backbone and mongoose's plugin functionality.
 *
 * @param {Object} destination to extend with wrapped object.
 * @param {Object} source and its functions to wrap.
 * @param {Function} pre function to wrap all functions with.
 * @returns {Object} destionation with freshly wrapped functions.
 */
Backend.extendWithPre = function(destination, source, pre) {
    var wrapped = {};

    // wrap only functions
    _.each(source, function(property, key) {
        if (_.isFunction(property)) {
            wrapped[key] = _.wrap(property, pre);
        }
    });
    destination = _.extend(destination, source, wrapped);
    return destination;
};