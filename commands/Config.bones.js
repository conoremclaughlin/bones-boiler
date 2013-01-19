var path = require('path');

// Setting global config options, which are accessible
// from Bones.plugin.config[optionName]
Bones.Command.options['secret'] = {
    'title': 'secret=[path]',
    'description': 'Path to secret key file.',
    'default': '../config'
};

Bones.Command.options['mongoHost'] = {
    'title': 'mongoHost=[host]',
    'description': 'Mongodb host',
    'default': 'localhost'
};

Bones.Command.options['mongoPort'] = {
    'title': 'mongoPort=[port]',
    'description': 'Mongodb port',
    'default': '27017'
};

Bones.Command.options['mongoName'] = {
    'title': 'mongoName=[name]',
    'description': 'Mongodb name',
    'default': 'bb'
};