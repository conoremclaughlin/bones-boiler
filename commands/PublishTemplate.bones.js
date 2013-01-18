var path = require('path')
  , fs = require('fs')
  , debug = require('debug')('bones-boiler:PublishTemplate');

command = Bones.Command.extend();

command.description = 'Write a template file for a model and view.';

command.options['view'] = {
    'title': 'view=[viewName]',
    'description': 'Backbone view to be rendered.',
};

command.options['model'] = {
    'title': 'model=[modelName]',
    'description': 'Name of the model to be used for rendering.',
};

command.options['directory'] = {
    'title': 'directory=[path]',
    'description': 'Directory to write the template.',
    'default': './templates'
};

/**
 * Great for creating static templates like forms from model schemas.
 */
command.prototype.initialize = function(plugin, callback) {
    var err = {};
    var html = '';
    var options = command.extractOptions(command, plugin);
    var model = new plugin.models[options.model]();
    var view = new plugin.views[options.view]({ model: model });

    view.renderAll ? view.renderAll() : view.render();
    html = view.outerHtml ? view.outerHTML() : view.html();
    err = fs.writeFileSync(path.resolve(path.join(options.directory, options.view + options.model + '._')), html);
    if (err) console.error('Failed to write: ', err);
    return callback && callback(err);
};
