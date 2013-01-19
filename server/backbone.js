var Bones = require(global.__BonesPath__ || 'bones')
  , Backbone = Bones.Backbone;

/**
 * Allows use of Backbone.sync on the server by wrapping
 * and formatting arguments for Bones.
 *
 * TODO: finish implementation and write tests.
 *
 * @see backbone for prototype documentation.
 */
Backbone.sync = function(method, model, options) {
    options || (options = {});

    var req = {
        method: Bones.utils.methodMap[method],
        options: options
    };
    var res = {};

    // Create a route handler wrapper to call success or error.
    var next = function(req, res) {
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

/**
 * Override Bones.sync or model.sync with a backend solution.
 * Must implement if you don't like errors.
 */
Bones.sync = Bones.sync || function(req, res, next) {
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