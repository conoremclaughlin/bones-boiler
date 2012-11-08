backend = Bones.Backend.extend();

backend.prototype.sync = backend.sync = function(req, res, next) {
    if (!req.model) return next(new Error.HTTP('Error occured. No model for sync. Please try again later.', 500));
    var model = req.model;

    switch(req.method) {
    case 'GET':
        model.db.findById(req.model.id, function (err, model) {
            if (err) return handleError(err);
            req.model = model;
            return next();
        });
        break;
    case 'POST':
        model.db.create(req.model.data, function (err, model) {
            if (err) return handleError(err);
            req.model = model;
            return next();
        });
        break;
    case 'PUT':
        model.db.findByIdAndUpdate(req.model.id, req.model.data, function(err) {
            if (err) return handleError(err);
            return next(); // saved!
        });
        break;
    case 'DELETE':
        model.db.findByIdAndRemove(req.model.id, function(err) {
            if (err) return handleError(err);
            return next(); // deleted!
        });
        break;
    default:
        res.send(new Error.HTTP('Unknown request method.', 500));
    }
};