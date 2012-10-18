var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var express = require('express');
var yaml = require('yaml-front-matter');
var env = process.env.NODE_ENV || 'development';

// TODO: add the app object and some easy way to apply the default template
// (some way to specify it as a root?)
// If webapps will be embedded in a page like google maps, hmm......

server = servers.App.extend();

//TODO: add a check to see if any conflicts between dynamic and static
//handlers.
//Augment to add static pages availability from the root path.
server.prototype.initialize = function(app) {
  _.bindAll(this, 'initializeStaticPages', 'initializeStaticDir', 'pageHandler');
  this.initializeStaticPages(app, 'templates/source/pages');
  this.initializeStaticDir('/', 'templates/compiled/public');
  console.log('Page.app.routes: ', this.routes.routes.get);
  return this;
};

// Return a handler to send the rendered page.
server.prototype.pageHandler = function(page) {
    // TODO: add an app object to store the root level view.
    // TODO: app object also needs to store the Main router.
    // Render the page once.
    console.log('pageHandler called to create a handle,', page);
    return function loadPage(req, res, next) {
        res.locals.options || (res.locals.options = {});
        console.log('page called.');
        // TODO: set logged-in user or whatever.
        res.locals.template = templates.Page;
        res.locals.options.main = Bones.plugin.pages[page].content;
        next();
    };
};


// Override this to add
server.prototype.initializeStaticDir = function(link, path) {
    // Add static handler if page marked as complete.
    // TODO: switch to mirror for serving static assets
    // but we have no reverse proxy....
    this.get(link, express['static'](path, {
        maxAge : env === 'production' ? 3600 * 1000 : 0
    }));
};

// TODO: create a command to initialize new paths while the server is running.
// Override this for custom directory structures.
server.prototype.initializeStaticPages = function(app, pages) {
    // Grab everything before and after the YAML front matter.
    var self = this;
    app.directories.forEach(function(dir) {
        console.log('initializing directory: ', dir);
        // only can use sync version here at initialization (blocking).
        // read the directories with a default base path of _site (else
        // check options)
        var pagesPath = path.join(dir, pages);
        if (!fs.existsSync(pagesPath)) { return false; }
        var files = fs.readdirSync(pagesPath);
        files = _.reject(files, function(file) {
            return fs.statSync(path.join(pagesPath, file)).isDirectory();
        });

        _.each(files, function(file) {
            var front = yaml.loadFront(path.join(pagesPath, file), file);
            if (front.url) {
                self.get(front.url, self.pageHandler(path.basename(file, '.html')), self.send);
            }
        });
    });
};
