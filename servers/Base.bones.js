server = Bones.Server.extend();

/**
 * Render and send a boilerplate of views and
 * models to the client.
 */
server.prototype.send = function(req, res) {
    // Use requested root template or default to templates.App. No need to
    // allocate view object on the server for the wrapper template.
    var options = res.locals.options || {};
    var template = res.locals.template || templates.App;
    var initialize = res.locals.initialize || function(models, views, routers, templates) {};

    // precedence: options.main, view.outerHTML, view.html, default
    options.main = res.locals.main;
    if (!options.main && res.locals.view) {
        options.main = res.locals.view.outerHTML ? res.locals.view.render().outerHTML() : res.locals.view.render().html();
    }

    // options.main takes precedence over view in case no need to render, only attach on the client.
    options = _.defaults(options, {
        main: 'Loading...',
        version: Date.now(),
        title: 'bones-boiler',
        startup: '(function() { Bones.initialize(' + initialize.toString() + '); Bones.start(); })();'
    });

    // Send the page to the client.
    res.send(template(options));
};

/**
 * Send a JS object or a JSON model from
 * res.locals.model to the client.
 *
 * @param res.locals.model to or change toJSON()
 */
server.prototype.sendJson = function(req, res) {
    if (!res.locals.model) console.error('[error base.sendJson] no response model!');
    var json = res.locals.model.toJSON ? res.locals.model.toJSON() : res.locals.model;
    return res.json(json);
};

/**
 * Apply Page template to send boilerplate.
 */
server.prototype.sendPage = function(req, res) {
    // TODO: set logged-in user or whatever.
    res.locals.template = templates.Page;
    return server.prototype.send(req, res);
};

/**
 * Render a form view for a model and its schema.
 *
 * @param res.locals.model to initialize the form view with.
 */
server.prototype.formView = function(req, res, next) {
    var view;
    if (res.locals.model) {
        view = new views.Form({ model: res.locals.model, template: 'submitForm' });
        view.render().$el.attr('action', Bones.utils.getUrl(res.locals.model));
        res.locals.main = view.outerHtml();
        return next();
    } else {
        return next(new Error.HTTP('Error occured. Having trouble finding your page. Please contact us or try again later.', 500));
    }
};