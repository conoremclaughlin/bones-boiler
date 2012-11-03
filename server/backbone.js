var Bones = require(global.__BonesPath__ || 'bones');
var Backbone = Bones.Backbone;

Backbone.sync = function(method, model, options) {
    // Default options, unless specified.
    options || (options = {});

    var req = {
        method: Bones.utils.methodMap[method],
        options: options
    };
    var res = {};

    // Create a route handler wrapper to call success or error.
    var next = function(req, res) {
        // TODO: finish implementation after Bones.sync succeeds.
        if (res.locals.success) {
            options.success(model, response);
        } else {
            options.error(model, response);
        }
    };

    // Ensure that we have a URL.
    if (!options.url) {
        req.url = Bones.utils.getUrl(model);
    }

    return Bones.sync(req, res, next);
};

Bones.sync = function(req, res, next) {
    /*
     * CRUD backend execution needs to happen here.
     *
    switch(req.method) {
    case 'GET':
        db.read(req.model.id, next);
        break;
    case 'POST':
        db.write(req.model, next);
        break;
    case 'PUT':
        // filter out keys we don't want in our model.
        db.append(req.model.id, req.model, next);
        break;
    case 'DELETE':
        db.deleteRecord(req.model.id, next);
        break;
    default:
        throw new Error('Unknown request method.');
    }
    */
    throw new Error('No default Bones.sync. You need to get your data from somewhere :)');
};