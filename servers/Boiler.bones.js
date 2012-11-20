var debug = require('debug')('bones-boiler:boiler');

/**
 * A boilerplate server you can either use or rip apart
 * ruthlessly copying-and-pasting how you will.
 */
server = servers.Base.extend({});

server.prototype.initialize = function(app) {
    _.bindAll(this, 'initializeBackboneApi');

    // parse and update the static method permissions for each model definition.
    _.each(models, function(model) {
        if (model !== models.Permissions) {
            models.Permissions.parsePermissions(model);
        }
    });

    // initialize model and collection api points.
    this.initializeModelsAndCollections(app);

    return this;
};

server.prototype.initializeModelsAndCollections = function(app) {
    if (app.config['disableDefaultApi']) return false;
    this.models = app.models;
    _.each(this.models, function(model) {
        this.initializeBackboneApi(model);
    }.bind(this));

    // fresh collection function map for readability.
    _.each(app.collections, function(collection) {
        this.initializeBackboneApi(collection);
    }.bind(this));
};

server.prototype.initializeBackboneApi = function(backboneModel, options) {
    options = options || {};

    var url         = '';
    var apiHandlers = {};
    var model       = new backboneModel();
    var build       = (model.build || this.makeBuildHandler(backboneModel));
    var validate    = this.makeValidateHandler(model);
    var sanetize    = (model.sanetize || this.sanetize);
    var sync        = (model.sync || Bones.sync);
    var parse       = this.makeParseHandler(model);
    var send        = (model.send || this.sendJson);

    try {
        url = Bones.utils.getUrl(model);
    } catch(error) {
        return debug('initializeBackboneApi - cannot create API point for: ', backboneModel);
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
 * Generate validate route handler.
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
 * Generate build route handler.
 * Pass any querystring parameters to the model.
 */
server.prototype.makeBuildHandler = function(model) {
    return function build(req, res, next) {
        req.model = new model({ _id: req.params.id }, req.query);
        return next();
    }.bind(this);
};

/**
 * Clean up the client-sent data (XSS, command injection, etc.)
 * TODO: Push into validate?  If looks bad, don't take anything at all?
 */
server.prototype.sanetize = function(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT') {
        req.body = models.Permissions.filter(req.body, req.model.dbSchema, req.method);
    }
    return next();
};

/**
 * Filter out passwords, etc. from model returned.
 * TODO: Change so filters for all.  POST can get in, but not out in the returned model.  Need to figure out boolean rules for that.
 */
server.prototype.makeParseHandler = function(model) {
    var parse = (model.parse && model.parse.length === 3) ? model.parse : function parse(req, res, next) {

        // Quick fix to remove the version number.
        delete res.locals.model.__v;

        // TODO: Filter response to only keys allowed for GET.
        // req.locals.model = models.Permissions.filter(res.locals.model, model.dbSchema, req.method);
        return next();
    };

    return parse;
};