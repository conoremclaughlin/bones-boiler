servers.Route.augment({
    initialize : function(parent, app) {
        parent.call(this, app);

        this.use(new servers.Boiler(app));
    },
    initializeModels: function(parent, app) {
        // Do nothing. Boiler handles model and collection API initialization now.
    }
});