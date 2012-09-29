var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var middleware = require('express');
var env = process.env.NODE_ENV || 'development';

server = Bones.Server.extend({});
// TODO: add the app object and some easy way to apply the default template
// (some way to specify it as a root?)
// If webapps will be embedded in a page like google maps, hmm......

// TODO: create a command to initialize new paths while the server is running.
// Override this for custom directory structures.
servers.Route.prototype.initializeStaticPages = function(app) {
    // Grab everything before and after the YAML front matter.
    var yaml = require('yaml');
    var regex = /^(\s*---([\s\S]+)---\s*)/gi;

    app.directories.forEach(function(dir) {
        // only can use sync version here at initialization (blocking).
        // read the directories with a default base path of _site (else
        // check
        // options)
        var page = fs.readFileSync(path.join(dir, 'package.json'), 'utf8');
        var match = regex.exec(data);

        // TODO: remove yaml parsing and just regex for needed
        // properties.
        if (match && match.length > 0) {
            var yamlAttributes = match[2].replace(/^\s+|\s+$/g, '');
            var attributes = yaml.eval(yamlAttributes);
            // Must specify standard Jekyll permalink for now.
            if (_.has(attributes, 'permalink')) {
                // add the jekyll permalink url as a path. check whether it
                // needs to
                // be added as static or processed through the base template.
                var maxAge = attributes.maxAge || (env === 'production' ? 3600 * 1000 : 0); // custom/one-hour/0
                if (_.has(attributes, 'complete') && attributes.complete) {
                    this.use(attributes.permalink, middleware['static'](path.join(dir, path.basename(attributes.permalink)), {
                        maxAge : maxAge
                    }));
                } else {
                    // TODO: How to handle this base template....?
                    this.use(attributes.permalink, );
                }
            }
        }

    }, this);
    // read whether the
};

// Augment to add static pages to directory.
servers.Route.augment({
    initialize : function(parent, app) {
        parent.call(this, app);
        this.initializeStaticPages(app);
    }
});