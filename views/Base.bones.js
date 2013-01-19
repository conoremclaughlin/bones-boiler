view = Backbone.View.extend({
    renderAll: function() {
        if (!this.constructor.title) return false;
        return Bones.utils.renderAll(this, { data: this.collection });
    },

    outerHTML: function() {
        var elem = this.$el
          , div
          , temp;

        // if outerHTML doesn't exist, create wrapping div and output inner html
        return !elem ? null
            : typeof ( temp = elem.outerHTML ) === 'string' ? temp
            : ( div = div || $('<div/>') ).html( this.$el.eq(0).clone() ).html();
    }
});