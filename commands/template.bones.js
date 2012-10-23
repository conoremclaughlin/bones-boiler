var path = require('path');
var fs = require('fs');

command = Bones.Command.extend();

command.description = 'Write a template file for a model and view.';

command.options['viewName'] = {
    'title': 'viewName=[view]',
    'description': 'Backbone view to be rendered.',
    'default': 'Base'
};

command.options['modelName'] = {
    'title': 'modelName=[model]',
    'description': 'Name of the model to be used for rendering.',
    'default': 'Base'
};

command.options['path'] = {
    'title': 'outputPath=[path]',
    'description': 'Path to write the template.',
    'default': './templates'
};

// Great for creating static templates like forms from model definitions.
command.prototype.initialize = function(plugin, viewName, modelName, directory, callback) {
    if (!view || !model) { console.log('Need both a model and a view name.'); }
    var err = {};
    var model = new plugin.models[modelName]();
    var view = new plugin.views[viewName]({ model: model });

    if (fs.existsSync(path)) { console.warn('Replacing file.'); }
    else { console.log('Creating new file.'); }

    if (err = fs.writeFileSync(path.join(directory, modelName + '._'), view.render().html())) {
        console.error('Failed to write.', err);
    };
    return callback && callback(err);
};
