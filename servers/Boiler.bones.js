var env = process.env.NODE_ENV
  , mongoose = require('mongoose')
  , debug = require('debug')('bones-boiler:boiler');

/**
 * A boilerplate server you can either use or rip apart ruthlessly.
 * Initializes mongoose connections, models, and sets up default
 * build, validate, sanetize, sync, parse, and send structure for
 * all Backbone models that have a defined url function.
 */

server = servers.Base.extend({});

server.prototype.initialize = function(plugin) {
    _.bindAll(this, 'initializeBackends', 'initializeBackboneApi');

    Bones.sync = plugin.backends.Mongoose.sync;

    // cheap workaround for unit testing and single instances of Bones. it annoys me, too.
    if (env === 'test' || env === 'TEST') plugin.bootstrapList = [];
    plugin.bootstrapList.push(this.initializeBackends);

    // parse and update the static method permissions for each model definition.
    _.each(models, function(model) {
        if (model !== models.Permissions) {
            models.Permissions.parsePermissions(model);
        }
    });

    // initialize model and collection api points.
    this.initializeModelsAndCollections(plugin);

    return this;
};

/**
 * Initializes mongoose connection and creates mongoose models
 * for each Backbone model in Bones.plugin.mongooseModels.
 * Executes callback upon error or successful connection, recommended
 * use with the bootstrapList.
 *
 * @param next callback to execute.
 */
server.prototype.initializeBackends = function(next) {
    var config = Bones.plugin.config;
    var db;

    db = mongoose.createConnection(config.mongoHost, config.mongoName, config.mongoPort);
    db.on('error', next);
    db.once('open', function() {
        // yay! register mongoose models for semi-mixins with server-side backbone models.
        try {
            Bones.plugin.mongooseModels = {};
            _.each(models, function(model) {
                if (model && model.prototype.dbSchema) {
                    Bones.plugin.mongooseModels[model.title] = db.model(model.title, new mongoose.Schema(model.prototype.dbSchema));
                }
            });

            return next();
        } catch(err) {
            return next(new Error('warning - unable to create db.model: ' + err));
        }
    });
    Bones.plugin.db = db;
};

/**
 * Creates a default API point for all models with urls.
 *
 * @param plugin of bones with model definitions.
 */
server.prototype.initializeModelsAndCollections = function(plugin) {
    if (plugin.config['disableDefaultApi']) return false;
    this.models = plugin.models;
    _.each(this.models, function(model) {
        this.initializeBackboneApi(model);
    }.bind(this));
};

/**
 * Creates an API point for the argument Backbone model
 * with either a custom set of handlers or a default set of:
 *  build - instantiate the model
 *  validate - reject the request if anything observable malformed
 *  sanetize - sanetize and whitelist values cannot immediately confirm (command injection, for example)
 *  sync - CRUD operation of the data store
 *  parse - parse and format response from CRUD operation (remove passwords from records, etc.)
 *  send - deliver response using whatever method (JSON, return, etc.)
 *
 * Note: delete uses [build, validate, sync, send]
 *
 * @param {Object} backboneModel class definition.
 * @param {Object} [options] for defining custom api handlers.
 * @returns
 */
server.prototype.initializeBackboneApi = function(backboneModel, options) {
    options = options || {};

    var url         = ''
      , apiHandlers = {}
      , model       = new backboneModel()
      , build       = (model.build || this.makeBuildHandler(backboneModel))
      , validate    = this.makeValidateHandler(model)
      , sanetize    = (model.sanetize || this.sanetize)
      , sync        = (model.sync || Bones.sync)
      , parse       = this.makeParseHandler(model)
      , send        = (model.send || this.sendJson);

    try {
        url = Bones.utils.getUrl(model);
    } catch(error) {
        return debug('initializeBackboneApi - no url - cannot create API point for: ', backboneModel);
    };
    apiHandlers = {
        get:    [build, validate, sanetize, sync, parse, send],
        post:   [build, validate, sanetize, sync, parse, send],
        put:    [build, validate, sanetize, sync, parse, send],
        del:    [build, validate, sync, send]
    };

    // doesn't matter if apiHandlers are null or empty with extend.
    apiHandlers = _.chain(apiHandlers)
                   .extend(model.apiHandlers)
                   .extend(options.apiHandlers)
                   .value();

    // bind each array of handlers to the proper HTTP method.
    _.each(_.keys(apiHandlers), function(method) {
        apiUrl = (method === 'post') ? url : url + '/:id';
        this[method](apiUrl, apiHandlers[method]);
    }.bind(this));
};

/**
 * Make an express handler to build a model from the request.
 * Allows custom model urls, because the intended model
 * does not have to derived as a param from the url.
 *
 * @param {Object} model Backbone definition to instantiate with.
 * @returns {Function} validate handler.
 */
server.prototype.makeBuildHandler = function(model) {
    return function build(req, res, next) {
        req.model = new model({ _id: req.params.id }, req.query);
        return next();
    }.bind(this);
};

/**
 * Make an express handler that makes use of any defined validates for a model,
 * whether client-side, server-side, or both.
 *
 * @param {Object} model instance to use for validation of request.
 * @returns {Function} validate handler.
 */
server.prototype.makeValidateHandler = function(model) {

    // if server-side validate (3 arguments) defined, use it.
    // if only client-side validate exists (attr - 1 argument), create a wrapper for it.
    var validate = (model.validate && model.validate.length === 3) ? model.validate : function validate(req, res, next) {

        // if model has no validate or passes validation, next()
        if (!model.validate || model.validate(req.model.toJSON())) {
            return next();
        } else {
            return next(new Error.HTTP('Error occured. Please correct or try again later.', 403));
        }
    };

    return validate;
};

/**
 * Clean up the client-sent data (XSS, command injection, etc.)
 * difficult to reject outright. Default just white-lists data based on
 * schema.
 *
 * @param {Object} req.body containing
 * @returns {Function} validate handler.
 */
server.prototype.sanetize = function(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT') {
        req.body = models.Permissions.filter(req.body, req.model.dbSchema, req.method);
    }
    return next();
};

/**
 * Make an express handler that makes use of any defined parses
 * for a model - whether client-side, server-side, or both. Can be used
 * for filtering passwords, adding response timestamps, etc. Default
 * deletes the version hash of a mongo record.
 *
 * @param {Object} model instance to use for parsing of request.
 * @returns {Function} parse handler.
 */
server.prototype.makeParseHandler = function(model) {
    var parse = (model.parse && model.parse.length === 3) ? model.parse : function parse(req, res, next) {

        if (model.parse) {
            var response = res.locals.model.toJSON ? res.locals.model.toJSON() : res.locals.model;
            res.locals.model = model.parse(response);
        }

        // Quick fix to remove the version number from Mongo records
        delete res.locals.model.__v;
        return next();
    };

    return parse;
};