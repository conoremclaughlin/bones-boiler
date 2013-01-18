var middleware = require(global.__BonesPath__ || 'bones').middleware;

servers.Middleware.augment({

    /**
     * Removing validateCSRFToken to replace with connect's csrf middleware.
     * Double CSRF protection makes dealing with static forms difficult by default.
     */
    initialize: function(parent, app) {
        this.use(middleware.sanitizeHost(app));
        this.use(middleware.bodyParser());
        this.use(middleware.cookieParser());
        this.use(middleware.fragmentRedirect());
    }

});