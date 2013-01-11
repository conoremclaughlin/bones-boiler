// Demonstrate a model that builds the ID from its name.
model = Backbone.Model.extend({
    initialize: function(attributes) {
        this.setID();
    },
    setID: function() {
        if (!this.id && this.has('name')) {
            this.set({
                id: this.buildID(this.get('name'))
            }, {
                silent: true
            });
        }
        return this.id;
    },
    buildID: function(name) {
        return name.toLowerCase().replace(/ +/g, '_').replace(/[^_\w]/g, '');
    },
    url: function() {
        if (_(this.id).isUndefined()) {
            return '/api/Dolor';
        }
        return '/api/Dolor/' + encodeURIComponent(this.id);
    }
});
