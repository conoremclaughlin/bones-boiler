view = Backbone.View.extend({
    // TODO: THIS IS IN THE WRONG PLACE *facepalm*
    renderAll: function() {
        if (!this.render) return false;
        return this.render().renderSubviews();
    },

    outerHtml: function() {
        var elem = this.$el;
        var div, temp;

        // check for existence of outerHTML, if it doesn't exist create wrapping div and output innerHtml
        // TODO: benchmark difference between allocating new div and concatenating raw html strings.
        return !elem ? null
            : typeof ( temp = elem.outerHTML ) === 'string' ? temp
            : ( div = div || $('<div/>') ).html( this.$el.eq(0).clone() ).html();
    }
});