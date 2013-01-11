// Demonstrate a model that uses the name as the ID.
model = Backbone.Model.extend({
    idAttribute: 'name',
    initialize: function(attributes) {
        // Bones expects an id attribute.
        if (this.id && !this.has('id')) {
            this.set({
                id: this.id
            }, {
                silent: true
            });
        }
        // And we want the name.
        if (this.has('id') && !this.id) {
            this.set({
                name: this.get('id')
            }, {
                silent: true
            });
        }
    },
    url: function() {
        if (_(this.id).isUndefined()) {
            return '/api/Ipsum';
        }
        return '/api/Ipsum/' + encodeURIComponent(this.id);
    }
});
