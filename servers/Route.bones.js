var env = process.env.NODE_ENV || 'development'
  , debug = require('debug')('bones-boiler:Route')
  , fs = require('fs')
  , path = require('path')
  , _ = require('underscore');

servers.Route.augment({

    /**
     * Route now allows more flexibility and control over what
     * assets are sent to the client and how. Assets can now be
     * modified by augmented Route servers and also provide
     * plugins.js and main.js for html5bp structure.
     */

    assets: {
        vendor:     [],
        core:       [],
        models:     [],
        views:      [],
        routers:    [],
        templates:  [],
        plugins:    []
    },

    initialize : function(parent, app) {
        _.bindAll(this, 'exposeClientPlugin', 'exposeClientVendor', 'exposeClientCore', 'loadClientPlugin', 'loadClientPlugins');

        // Reset our assets with each initialize if testing (starting and stopping server)
        // TODO: this is annoying and fragile, find some way to reload Plugin.
        if (env === 'TEST' || env === 'test') {
            this.assets = { vendor: [], core: [], models: [], views: [], routers: [], templates: [], plugins: [] };
        }

        this.exposeClientVendor('backbone-forms/distribution/backbone-forms');
        this.exposeClientCore('../client/utils');
        this.loadClientPlugin(path.join(__dirname, '..'));

        parent.call(this, app);
        this.use(new servers['Boiler'](app));
        this.use(new servers['Jekyll'](app));
    },

    /**
     * Takes all the arrays of mirrors/filepaths in assets and
     * converts them into a mirrors exposed at assets/<mirror>.<type>.
     * Summary of primary mirrors:
     *   all.js - all assets in one mirror
     *   main.js - application code: models, templates, views, routers
     *   plugin.js - plugins interacting directly with Bones or application code (ie. most files in a client folder).
     *   core.js - core functionality on client for Bones, receives no wrapping beyond closure.
     *   vendor.js - files that do not know of bones at all.
     *
     * @see bones/servers/Route for all mirror urls
     * @param {Function} parent to call.
     * @param {Object} app plugin used by Bones.
     */
    initializeAssets: function(parent, app) {
        var options = {
            type: '.js',
            wrapper: Bones.utils.wrapClientFile,
            sort: Bones.utils.sortByLoadOrder
        };
        var bonesPath = path.dirname(require.resolve(global.__BonesPath__ || 'bones'));

        // Unshift the core and vendor requirements because jquery, underscore,
        // and backbone are needed by most everything and thus should come first.
        this.assets.vendor = [
            require.resolve(path.join(bonesPath, 'assets/jquery')),
            require.resolve('underscore'),
            require.resolve('backbone')
        ].concat(this.assets.vendor);
        this.assets.core = [
            require.resolve(path.join(bonesPath, 'shared/utils')),
            require.resolve(path.join(bonesPath, 'client/utils')),
            require.resolve(path.join(bonesPath, 'shared/backbone')),
            require.resolve(path.join(bonesPath, 'client/backbone'))
        ].concat(this.assets.core);

        // If not in production, throw on some developer helpers.
        if (env === 'development') {
            this.assets.core.unshift(require.resolve(path.join(bonesPath, 'assets/debug')));
        }

        // Swap mirror for arrays of resolved paths
        _.extend(this.assets, {
            vendor:     new mirror(this.assets.vendor, { type: '.js' }),
            core:       new mirror(this.assets.core, { type: '.js' }),
            plugins:    new mirror(this.assets.plugins, { type: '.js', wrapper: Bones.utils.wrapClientPlugin }),
            models:     new mirror(this.assets.models, options),
            views:      new mirror(this.assets.views, options),
            routers:    new mirror(this.assets.routers, options),
            templates:  new mirror(this.assets.templates, options),
        });

        // Application code is going to change more often than vendor dependencies. Offer a main.js
        this.assets.main = new mirror([
            this.assets.models,
            this.assets.views,
            this.assets.routers,
            this.assets.templates
        ], { type: '.js' });

        // Serves all dependencies and application code in a single js file.
        this.assets.all = new mirror([
            this.assets.vendor,
            this.assets.core,
            this.assets.main,
            this.assets.plugins
        ], { type: '.js' });

        this.get('/assets/bones/main.js', this.assets.main.handler);
        this.get('/assets/bones/plugins.js', this.assets.plugins.handler);
        parent.call(this, app);
    },

    /**
     * Registers a file to be compiled into assets/core.js.
     *
     * @param {Function} parent to call.
     * @param {String} filename used as an argument to node's require(filename)
     */
    exposeClientCore: function(parent, filename) {
        this.assets.core.push(require.resolve(filename));
    },

    /**
     * Registers a file to be compiled into assets/plugins.js.
     *
     * @param {Function} parent to call.
     * @param {String} filename used as an argument to node's require(filename)
     */
    exposeClientPlugin: function(parent, filename) {
        this.assets.plugins.unshift(require.resolve(filename));
    },

    /**
     * Registers a file to be compiled into assets/vendor.js.
     *
     * @param {Function} parent to call.
     * @param {String} filename used as an argument to node's require(filename)
     */
    exposeClientVendor: function(parent, filename) {
        this.assets.vendor.unshift(require.resolve(filename));
    },

    /**
     * For a single module directory - load, wrap, and
     * expose all files within <module>/client and <module>/shared.
     * Wraps files with utils.wrapClientPlugin by default, which
     * exposes models, routers, templates, views and a Bones pointer
     * to the file sent and executed.
     *
     * @param {Function} parent to call.
     * @param {String} dir path of module to load.
     * @returns {Boolean} of successful execution.
     */
    loadClientPlugin: function(parent, dir) {
        if (!dir) return false;
        var that = this
          , folders = ['shared', 'client']
          , files = [];

        // read directory and filter out non-files, prefixes/suffixes, and non-wrapped core files.
        folders.forEach(function(folder) {
            var folderPath = path.join(dir, folder);
            if (!fs.existsSync(folderPath)) return;
            files = fs.readdirSync(folderPath);
            files = _.each(files, function(file) {
                var filePath = require.resolve(path.join(folderPath, file));
                var reject = fs.statSync(filePath).isDirectory();
                reject = reject || file.match(/^(.+)\.(prefix|suffix)\.js$/);
                reject = reject || (_.indexOf(that.assets.core, filePath) !== -1);
                if (!reject) {
                    that.exposeClientPlugin(filePath);
                }
            });
        });
    },

    /**
     * For all module directories loaded by Bones - load, wrap,
     * and expose all client-side files within <module>/client
     * and <module>/shared.
     *
     * @param {Function} parent to call.
     * @param {Object} app plugin used by Bones.
     * @returns {Boolean} of successful execution.
     */
    loadClientPlugins: function(parent, app) {
        if (!app) return false;
        app.directories.forEach(function(dir) {
            if (path.basename(dir).match(/bones$/)) return false;
            this.loadClientPlugin(dir);
        }).bind(this);
        return true;
    },

    /**
     * Overridden to do nothing.
     */
    initializeModels: function(parent, app) {
        // Do nothing. servers/Boiler handles model and collection API initialization now.
    },

});