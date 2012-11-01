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
    this.initializeModels();
    this.use(new servers['Page']);
    return this;
};

server.prototype.initializeModels = function(app) {
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
    var url = '',
        apiHandlers;

    model = new model();
    url = Bones.utils.getUrl(model);
    apiHandlers = {
        get: [(model.validate || Bones.validate), (model.sync || Bones.sync)],
        post: [(model.validate || Bones.validate), (model.sync || Bones.sync)],
        put: [(model.validate || Bones.validate), (model.sync || Bones.sync)], // only overwrite fields in Bones.sync
        del: [(model.validate || Bones.validate), (model.sync || Bones.sync)]
    };
    // doesn't matter if apiHandlers is null or empty with extend.
    apiHandlers.extend(model.apiHandlers)
               .extend(options.apiHandlers);

    if (model.apiHandlers) {
        apiHandlers.extend(model.apiHandlers);
    }
    // bind each array of handlers to the proper method.
    _.each(_.keys(model.apiHandlers), function(method) {
        if (method !== 'post') {
            url += '/:id';
        }
        this[method](url, model.apiHandlers[method]);
    }.bind(this));
};