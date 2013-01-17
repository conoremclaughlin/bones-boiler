view = Backbone.View.extend({
    renderAll: function() {
        if (!this.constructor.title) return false;
        return Bones.utils.renderAll(this, { data: this.collection });
    },

    // TODO: capitalize Html to HTML
    outerHTML: function() {
        var elem = this.$el;
        var div, temp;

        // check for existence of outerHTML, if it doesn't exist create wrapping div and output innerHtml
        // TODO: benchmark difference between allocating new div and concatenating raw html strings.
        return !elem ? null
            : typeof ( temp = elem.outerHTML ) === 'string' ? temp
            : ( div = div || $('<div/>') ).html( this.$el.eq(0).clone() ).html();
    }
});