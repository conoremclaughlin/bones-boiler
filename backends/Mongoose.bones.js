var mongoose = require('mongoose');
var debug = require('debug')('bones-boiler:mongoose');
backend = Bones.Backend.extend();

backend.sync = function(req, res, next) {
    if (!req.model) return next(new Error.HTTP('Error occured. No model to sync. Please try again later.', 500));

    switch(req.method) {
    case 'get':
    case 'GET':
        req.model.db.findById(req.model.id, function(err, document) {
            if (err) return next(new Error.HTTP(err, 500));
            if (!document) return next(new Error.HTTP(err, 404));
            res.locals.model = document.toObject();
            return next(); // got!
        });
        break;
    case 'post':
    case 'POST':
        // I'd rather use db.create to be consistent
        // but it initializes a document anyway.
        var document = new req.model.db(req.body);
        document.save(function(err, document) {
            if (err) return next(new Error.HTTP(err, 500));
            res.locals.model = document.toObject();
            return next(); // saved!
        });

        break;
    case 'put':
    case 'PUT':
        // XXX: Bug in mongoose so findByIdAndUpdate
        // fails at this time if document is not initialized.
        // TODO: Check again when we can bump versions.
        if (req.body._id) delete req.body._id;
        req.model.db.update({ _id: req.model.id }, req.body, function(err, document) {
            if (err) return next(new Error.HTTP(err, 500));
            return next(); // updated!
        });
        break;
    case 'delete':
    case 'DELETE':
        req.model.db.findByIdAndRemove(req.model.id, function(err) {
            if (err) return next(new Error(err));
            res.locals.model = { id: null };
            return next(); // deleted!
        });
        break;
    default:
        return res.send(new Error.HTTP('Unknown request method: ' + req.method, 500));
    }
};