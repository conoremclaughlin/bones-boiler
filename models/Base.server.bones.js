var util = require('util')
  , debug = require('debug')('bones-boiler:base');

model = models.Base;

model.prototype.dbSchema = model.dbSchema = {};

model.augment({
    initialize: function(parent) {
        parent.call(this);
        if (!Bones.plugin.db) debug('initialize - no backend available.');
        if (Bones.plugin.mongooseModels) {
            this.db = Bones.plugin.mongooseModels[this.constructor.title];
        }

        return this;
    },

    validate: function(parent, req, res, next) {
        var errors = parent ? parent.call(this) : true;
       /*
        * Example use of express-validator in model.validate()
        *
        req.assert('postparam', 'Invalid postparam').notEmpty().isInt();
        req.assert('getparam', 'Invalid getparam').isInt();
        req.assert('urlparam', 'Invalid urlparam').isAlpha();

        req.sanitize('postparam').toBoolean();

        errors = errors && req.validationErrors();
        if (errors) {
          res.send('There have been validation errors: ' + util.inspect(errors), 500);
          return;
        }
        // else
        return next();
        */
        return errors;
    },

    permissions: {
        'get':      {},
        'post':     {},
        'put':      {},
        'delete':   {}
    }
});
