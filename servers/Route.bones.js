var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var express = require('express');
var yaml = require('yaml');
var env = process.env.NODE_ENV || 'development';

// TODO: add the app object and some easy way to apply the default template
// (some way to specify it as a root?)
// If webapps will be embedded in a page like google maps, hmm......

// Override this to add
servers.Route.prototype.initializeStaticDir = function(link, path) {
    // Add static handler if page marked as complete.
    this.get(link, express['static'](path, {
        maxAge : env === 'production' ? 3600 * 1000 : 0
    }));
};

// Apply the application boilerplate.
servers.Route.prototype.boiler = function(path) {
    var page = require(path);
    var view = new Views.App();
    view.template({
        page : page
    });
    return function(req, res, next) {
        res.send(view.render().html());
    };
};

// TODO: create a command to initialize new paths while the server is running.
// Override this for custom directory structures.
servers.Route.prototype.initializeStaticPages = function(app) {
    // Grab everything before and after the YAML front matter.
    var regex = /^(\s*---([\s\S]+)---\s*)/gi;

    app.directories.forEach(function(dir) {
        // only can use sync version here at initialization (blocking).
        // read the directories with a default base path of _site (else
        // check options)
        var fileList = fs.readdirSync(dir);
        fileList = _.reject(fileList, function(file) {
            return fs.statSync(file, function(err, stats) {
                return stats.isDirectory();
            });
        });

        _.each(fileList, function(file) {
            var page = fs.readFileSync(file, 'utf8');
            var match = regex.exec(page);

            // TODO: remove yaml parsing and just regex for needed
            // properties.
            if (match && match.length > 0) {
                var yamlAttributes = match[2].replace(/^\s+|\s+$/g, '');
                var attributes = yaml.eval(yamlAttributes);
                // Must specify standard Jekyll permalink for now.
                if (attributes.permalink && attributes.render) {
                    // add the jekyll permalink url as a path. check whether it
                    // needs to be added as static or processed through the base
                    // template.
                    // no idea if this will work or not......
                    this.get(attributes.permalink, this.boiler(page));
                    // if return a page before it hits the static serving of the
                    // root directory.
                }
            }
        });

    }, this);
    // read whether the
};

// TODO: add a check to see if any conflicts between dynamic and static
// handlers.

// Augment to add static pages availability from the root path.
servers.Route.augment({
    initialize : function(parent, app) {
        parent.call(this, app);
        this.initializeStaticPages(app);
        this.initializeStaticDir('/', '/_site');
    }
});