server = Bones.Server.extend();

/**
 * Render and send views to the client with everything the boilerplate needs.
 */
server.prototype.send = function(req, res) {
    // Use requested root template or default to templates.App. No need to
    // allocate view object on the server for the wrapper template.
    var options = res.locals.options || {};
    var template = res.locals.template || templates.App;
    var initialize = res.locals.initialize || function(models, views, routers, templates) {};

    // TODO: this is unreadable. change it.
    options.main = res.locals.main
                    || (res.locals.view
                    ? (res.locals.view.outerHtml
                    ? res.locals.view.render().outerHtml()
                    : res.locals.view.render().html())
                    : 'Loading');

    // options.main takes precedence over view in case no need to render, only attach on the client.
    options = _.defaults(options, {
        version: Date.now(),
        title: 'electriculture',
        startup: '(function() { Bones.initialize(' + initialize.toString() + '); Bones.start(); })();'
    });

    // Send the page to the client.
    res.send(template(options));
};

server.prototype.sendJson = function(req, res) {
    if (!res.locals.model) console.error('[error base.sendJson] no response model!');
    var json = res.locals.model.toJSON ? res.locals.model.toJSON() : res.locals.model;
    return res.json(json);
};

server.prototype.sendPage = function(req, res) {
    // TODO: set logged-in user or whatever.
    res.locals.template = templates.Page;
    return server.prototype.send(req, res);
};

/**
 * Create and render a form view for a model and its schema.
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