var fs = require('fs');
var debug = require('debug')('bones-boiler:Route');
var path = require('path');
var env = process.env.NODE_ENV || 'development';
var _ = require('underscore');

servers.Route.augment({

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
        // Add backbone-forms as a vendor serving.
        // @see Bones/servers/Route for mirror urls
        _.bindAll(this, 'exposeClientPlugin', 'exposeClientVendor', 'exposeClientCore', 'loadClientPlugin', 'loadClientPlugins');
        this.exposeClientVendor('backbone-forms/distribution/backbone-forms');
        this.exposeClientCore('../client/utils');
        this.loadClientPlugin(path.join(__dirname, '..'));
        parent.call(this, app);
        this.use(new servers['Boiler'](app));
        this.use(new servers['Jekyll'](app));
    },

    /**
     * TODO: change to a more flexible structure with perhaps augment, _.each,
     * and non-hard-coded options and paths, i.e. assets.vendor = { paths: [], options: {} }
     * or something along those lines. This is a quick and ugly fix for now.
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
        // TODO: need bonesPath now?
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
        debug('parent: ', parent);
        parent.call(this, app);

        console.log('this.assets.all: ', this.assets.all);
    },

    exposeClientCore: function(parent, filename) {
        this.assets.core.push(require.resolve(filename));
    },

    exposeClientPlugin: function(parent, filename) {
        this.assets.plugins.unshift(require.resolve(filename));
    },

    exposeClientVendor: function(parent, filename) {
        this.assets.vendor.unshift(require.resolve(filename));
    },

    makeMirror: function(parent, filename, wrapper, sort) {
        wrapper = wrapper || Bones.utils.wrapClientPlugin;
        // TODO: find a default for sort.
        return new mirror([ require.resolve(filename) ], {
            type: '.js',
            wrapper: wrapper
        });
    },

    // TODO: generalize to take a list of folders to scan and enact a callback on
    loadClientPlugin: function(parent, dir) {
        if (!dir) return false;
        var that = this;
        var folders = ['shared', 'client'];
        var files = [];

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

    // TODO: generalize to take a list of folders to scan and enact a callback on
    loadClientPlugins: function(parent, app) {
        if (!app) return false;
        var that = this;
        app.directories.forEach(function(dir) {
            if (path.basename(dir).match(/bones$/)) return false;
            this.loadClientPlugin(dir);
        }).bind(this);
    },

    initializeModels: function(parent, app) {
        // Do nothing. Boiler handles model and collection API initialization now.
    },

});