var path = require('path');
var env = process.env.NODE_ENV || 'development';

servers.Route.augment({
    assets: {
        vendor: [],
        core: [],
        models: [],
        views: [],
        routers: [],
        templates: []
    },
    initialize : function(parent, app) {
        // Add backbone-forms as a vendor serving.
        // @see Bones/servers/Route for url
        this.assets.vendor.unshift(require.resolve('backbone-forms/distribution/backbone-forms'));

        parent.call(this, app);

        this.use(new servers['Boiler'](app));
        this.use(new servers['Page'](app));
    },
    // TODO: change to a more flexible structure with perhaps augment, _.each,
    // and non-hard-coded options and paths, i.e. assets.vendor = { paths: [], options: {} }
    // or something along those lines. This is a quick fix for now.
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

        // Initialize and swap mirror for arrays of resolved paths
        _.extend(this.assets, {
            vendor: new mirror(this.assets.vendor,{ type: '.js' }),
            core: new mirror(this.assets.core, { type: '.js' }),
            models: new mirror(this.assets.models, options),
            views: new mirror(this.assets.views, options),
            routers: new mirror(this.assets.routers, options),
            templates: new mirror(this.assets.templates, options)
        });

        // Offer an all.js mirror that serves everything.
        this.assets.all = new mirror(_.values(this.assets), { type: '.js' });

        // Call parent to set get paths.
        parent.call(this, app);
    },
    initializeModels: function(parent, app) {
        // Do nothing. Boiler handles model and collection API initialization.
    }
});