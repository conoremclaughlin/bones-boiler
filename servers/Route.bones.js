servers.Route.augment({
    initialize : function(parent, app) {
        parent.call(this, app);
        this.use(new servers.Page(app));
    }
});