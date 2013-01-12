var Bones = require(global.__BonesPath__ || 'bones');
var Backbone = Bones.Backbone;
var _ = require('underscore');
var debug = require('debug')('bones-boiler:backend');
var util = require('util');

module.exports = Backend;

function Backend(plugin, callback) {
    this.initialize(plugin, callback);
};

Backend.augment = Backbone.Router.augment;
Backend.extend = Backbone.Router.extend;

Backend.toString = function() {
    return '<Backend ' + this.title + '>';
};

/**
 * includePre
 *
 * @requires shared/utils.js
 * @param {Mixed} collection pointer or string name of a collection
 * @param {Object} collections
 * @returns
 */
// Use cases:
// 1. use it in the initialize method and just include the functionality once it's available;
// 2. use at your own discretion.  can fail at run-time.
// XXX: chicken and the egg problem. How to deal with initializing a db connection and using it.
// XXX: oh shit.  Backbone copies 'static' methods and properties to the new object.
// XXX: maybe the problem here is there should be a strict abstraction between backends (mongoose) and backbone
// TODO: should this kind of method be on the client-side as well?  For example, if a client-side model wants to retrieve the latest of its
// statistics, use something similar to the include.  Some form of query (http method) instead.
// TODO: consider a one-to-one mapping between a backend and some form of enumerable client-side object.
// TODO: should the next step be to just initialize mongoose models with
// we shouldn't force someone to use mongoose as a backend, though.. what if they
// want to use mysql or couchdb or anything else?  Redis? yeah, we can't explicitly do away with backbone models and just favor
// mongoose.  The question is, what do you use to compliment your backbone models with server-side capabilities
// without creating leaky memory footprints from populating a collection when all you need to do is query a collection
// and get, format, and send a set of records (json, etc.?). tricky. tricky.
// XXX: is this just redundant with the plugin architecture of mongoose?
// TODO: should this be called augment or extend?
Backend.extendWithPre = function(destination, source, pre) {
    var wrapped = {};

    // wrap only functions
    _.each(source, function(property, key) {
        if (_.isFunction(property)) {
            wrapped[key] = _.wrap(property, pre);
        }
    });
    destination = _.extend(destination, source, wrapped);
    return _.extend(source, wrapped);
};

/**
 *********************** All the stuff below this is brainstorming to be changed! *********************************
 */
Backend.prototype.initialize = function(plugin, callback) {};

/**
 * What else does a backend commonly need? A method to create a query (whitelisting, blacklisting, JSON parsing?, defaults)
 * TODO: Change the naming, but keeping it for now for legacy reasons.
 */
Backend.prototype.query = function(query) {

};

/**
 * A method to execute a query and call the backend driver.
 * TODO: Throw error or something if not implemented, keeping as mixin for legacy reasons.
 */
Backend.prototype.sync = function(req, res, next) {

};

/**
 * A method to parse and render the results for returning to the server and/or client (items, _.pick, timestamp, etc.).
 * TODO: Same.  Keeping for legacy reasons until a better solution can be found.
 */
Backend.prototype.parse = function(result) {

};

