servers.Route.augment({
    initialize : function(parent, app) {
        parent.call(this, app);

        this.use(new servers.Boiler(app));
    },
    /*initializeModels: function(parent, app) {
        server.prototype.initializeModels = function(app) {
            this.models = app.models;
            _.bindAll(this, 'loadModel', 'accessModel','getModel', 'fillModel', 'saveModel', 'delModel', 'loadCollection', 'accessCollection', 'getCollection');
            this.get('/api/:model/:id', this.loadModel, this.fillModel, this.accessModel, this.getModel);
            this.post('/api/:model', this.loadModel, this.accessModel, this.saveModel);
            this.put('/api/:model/:id', this.loadModel, this.fillModel, this.accessModel, this.saveModel);
            this.del('/api/:model/:id', this.loadModel, this.fillModel, this.accessModel, this.delModel);
            this.get('/api/:collection', this.loadCollection, this.accessCollection, this.getCollection);
        };
    },
    exposeModel: function(parent, app) {


    }*/
});