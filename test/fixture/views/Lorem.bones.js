view = views.Base.extend({
    events: {
        'click a': 'test'
    },

    test: function() {
        return 'clicked';
    },

    render: function() {
        this.$el.html(templates['Lorem']({ model: this.model.toJSON() }));
        return this;
    }
});