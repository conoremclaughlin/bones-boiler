server = servers.Base.extend({});

// A boilerplate server you can either use or rip apart
// ruthlessly copying-and-pasting how you will.
server.prototype.initialize = function(app) {
    // parse and update the static method permissions for each model definition.
    _.each(models, function(model) {
        if (model !== models.Permissions) {
            models.Permissions.parsePermissions(model);
        }
    });
    this.initializeModelsAndCollections();
    this.use(new servers['Page']);
    return this;
};

server.prototype.initializeModelsAndCollections = function(app) {
    if (app.config['disableDefaultApi']) { return ; }
    this.models = app.models;
    _.each(this.models, function(model) {
        this.initializeBackboneApi(model);
    }.bind(this));

    // fresh collection function map for readibility.
    _.each(app.collections, function(collection) {
        this.initializeBackboneApi(collection);
    }.bind(this));
};

server.prototype.initializeBackboneApi = function(model, options) {
    options = options || {};

    var url = '';
        apiHandlers = {},
        model = new model(),
        build, // fn
        validate, // fn
        sanetize = (model.sanetize || Bones.sanetize),
        sync = (model.sync || Bones.sync),
        format = (model.format || Bones.format),

    // IMPORTANT: build DOES NOT allocate a new Backbone model.
    // enhance as a factory-like method to keep it as fast as possible.
    build = model.build || function(req, res, next) {
        req.model.id = req.params.id;
        if (req.method === 'PUT' || req.method === 'POST') {
            req.model.data = req.body ? req.body : {};
        }
        return next();
    };

    // if server-side validate (3 arguments) defined, use it.
    // if only client-side validate exists (attr - 1 argument), create a wrapper for it.
    if (model.validate) {
        validate = model.validate.length === 3 ? model.validate : function(req, res, next) {
            if (model.validate(req.model.data)) {
                return next();
            } else {
                return next(new Error.HTTP('Something is wrong with the submitted information. Please correct or try again later.', 500));
            }
        };
    } else {
        validate = function(req, res, next) { return next(); };
    }

    // expose functions as usable server handlers.
    this.prototype.build = build;
    this.prototype.validate = validate;

    url = Bones.utils.getUrl(model);
    apiHandlers = {
        get: [build, validate, sanetize, sync, format],
        post: [build, validate, sanetize, sync, format],
        put: [build, validate, sanetize, sync, format],
        del: [build, validate, sync]
    };
    // doesn't matter if apiHandlers is null or empty with extend.
    apiHandlers = apiHandlers.extend(model.apiHandlers)
                             .extend(options.apiHandlers);

    // bind each array of handlers to the proper method.
    _.each(_.keys(model.apiHandlers), function(method) {
        if (method !== 'post') {
            url += '/:id';
        }
        this[method](url, model.apiHandlers[method]);
    }.bind(this));
};

server.prototype.format = function(req, res, next) {
    console.log('debug.format req.method: ', req.method);
    if (req.method === 'GET') {
        req.model = Permissions.filter(req.model, req.model.schema, req.method);
    }
    return next();
};

server.prototype.sanetize = function(req, res, next) {
    console.log('debug.sanetize req.method: ', req.method);
    if (req.method === 'POST' || req.method === 'PUT') {
        req.model = Permissions.filter(req.model, req.model.schema, req.method);
    }
    return next();
};