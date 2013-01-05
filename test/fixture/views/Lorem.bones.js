view = views.Base.extend({
    events: {
        'click a': 'test'
    },

    test: function() {
        alert('clicked.');
    }
});