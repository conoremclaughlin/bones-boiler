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



app.post('/:urlparam', function(req, res) {

    req.assert('postparam', 'Invalid postparam').notEmpty().isInt();
    req.assert('getparam', 'Invalid getparam').isInt();
    req.assert('urlparam', 'Invalid urlparam').isAlpha();

    req.sanitize('postparam').toBoolean();

    var errors = req.validationErrors();
    if (errors) {
      res.send('There have been validation errors: ' + util.inspect(errors), 500);
      return;
    }
    res.json({
      urlparam: req.param('urlparam'),
      getparam: req.param('getparam'),
      postparam: req.param('postparam')
    });
  });

// Speed up permissions use.
model.prototype.permissions = function(object) {
    _

};(['get', 'put', 'delete']);


Bones.sync = function(req, res, next) {


    switch(req.method) {
    case 'GET':
        break;
    case 'POST':
    case 'PUT':
        // filter out keys we don't want in our model.
        _.pick(req.model, req.model.schema);
        break;
    case 'DELETE':
        break;
    default:
        throw new Error('Unknown request method.');
    }

    return next();
};