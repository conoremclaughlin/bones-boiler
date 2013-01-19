require('./fixture');

var Bones = require(global.__BonesPath__ || 'bones')
  , bonesTest = require('bones-test')
  , server = bonesTest.server()
  , should = require('should')
  , debug = require('debug')('bones-boiler:Rendering.mocha')
  , $ = Bones.$
  , util = require('util');

var tests = [
    { _id: 5, name: 'uno' },
    { _id: 6, name: 'dos' }
];

var testModels = [];

describe('Templating and rendering', function() {

    before(function(done) {
        server.start(done);
    });

    after(function(done) {
        try { server.close(done); }
        catch (err) { } // server already closed.
    });

    describe('.partial', function() {
        it('should create a placeholder element', function(done) {
            var html = Bones.utils.partial('test');
            html.should.equal('<div data-view="test"></div>');
            done();
        });

        it('should create a store with makeStore', function(done) {
            var store = Bones.utils.makeStore();
            store.should.be.a('object');
            store.should.have.property('nextId');
            store.nextId().should.be.a('number').and.equal(0);
            store.nextId().should.be.a('number').and.equal(1);
            done();
        });

        it('should store data in a store given a store', function(done) {
            var store = Bones.utils.makeStore();
            var html = Bones.utils.partial('test', {
                model: 'hello'
            }, store);
            var element = $(html);
            $(element).attr('data-view').should.equal('test');
            $(element).attr('data-model').should.equal('hello');
            $(element).attr('data-id').should.equal('0');
            should.exist(store[0]);
            store[0].should.be.a('object');
            store[0].should.have.property('model');
            store[0].model.should.equal('hello');
            done();
        });

        it('should wrap partial with makePartialHelperWithStore', function(done) {
            var store = Bones.utils.makeStore();
            var partial = Bones.utils.makePartialHelperWithStore(store);
            partial('test', {
                model: 'hello'
            });
            should.exist(store[0]);
            store[0].should.be.a('object');
            store[0].should.have.property('model');
            store[0].model.should.equal('hello');
            done();
        });
    });

    describe('.templateSubviews', function() {
        var html = ''
          , element
          , store;

        it('should replace all partial placeholders with rendered html', function(done) {
            store = Bones.utils.makeStore();
            html = server.plugin.templates.Lorems({
                data: tests,
                partial: Bones.utils.makePartialHelperWithStore(store)
            });
            element = $('<div/>').html(html);
            $('div[data-view^=""]', element).length.should.equal(2);
            html = Bones.utils.templateSubviews(html, store);
            element = $('<div/>').html(html);
            $('div[data-view^=""]', element).length.should.equal(2);
            $('div[data-view^=""]', element).each(function() {
                $(this).html().should.not.equal('');
            });
            done();
        });

        it('should replace the data-id for the temporary object with a model.id', function(done) {
            var i = 5;
            $('div[data-view^=""]', element).each(function() {
                $(this).attr('data-id').should.equal(i + '');
                i++;
            });
            done();
        });
    });

    describe('.templateAll', function() {
        var html = '';

        it('should recursively template a view and its subviews', function(done) {
            html = Bones.utils.templateAll('Lorems', { data: tests });
            var element = $('<div/>').html(html);
            $('div[data-view^=""]', element).length.should.equal(2);
            $('div[data-view^=""]', element).each(function() {
                $(this).html().should.not.equal('');
            });
            done();
       });
    });

    describe('.renderSubviews', function() {
        var html = ''
          , rendered = ''
          , views = {}
          , renderedElement = {};

        before(function() {
            _.each(tests, function(test) {
                testModels.push(new server.plugin.models['Lorem'](test));
            });
        });

        it('should return an object of views it has attached to prerendered placeholders given a jquery element', function(done) {
            var index = 5;
            var rendered = '';
            html = Bones.utils.templateAll('Lorems', { data: tests });
            var element = $('<div/>').html(html);
            views = Bones.utils.renderSubviews(element);

            _.keys(views).length.should.equal(1);
            _.each(views, function(typeViews) {
                _.each(typeViews, function(view) {
                    view.model.id.should.equal(index);
                    rendered = view.$el.html();
                    view.model = new server.models['Lorem']({ _id: 7, name: 'good-bye' });
                    view.render();
                    // find the view's element within the original element and check it's rerendered
                    $(view.$el, element).html().should.not.equal(rendered);
                    index++;
                });
            });
            done();
        });

        it('should replace placeholders with view elements if shouldReplace is undefined or default (true)', function(done) {
            var index = 5;
            var rendered = '';
            html = Bones.utils.templateAll('Lorems', { data: tests });
            var element = $('<div/>').html(html);
            $('div[data-view^=""]', element).length.should.equal(2);
            views = Bones.utils.renderSubviews(element);
            $('div[data-view^=""]', element).length.should.equal(0);
            done();
        });

        it('should not replace placeholders with view elements if shouldReplace is false', function(done) {
            var index = 5;
            var rendered = '';
            html = Bones.utils.templateAll('Lorems', { data: tests });
            var element = $('<div/>').html(html);
            $('div[data-view^=""]', element).length.should.equal(2);
            views = Bones.utils.renderSubviews(element, null, false);
            $('div[data-view^=""]', element).length.should.equal(2);
            done();
        });

        it('should replace all partial placeholders with rendered html given an element and store', function(done) {
            var store = Bones.utils.makeStore();
            html = server.plugin.templates.Lorems({
                data: testModels,
                partial: Bones.utils.makePartialHelperWithStore(store)
            });
            renderedElement = $('<div/>').html(html);
            $('div[data-view^=""]', renderedElement).length.should.equal(2);
            views = Bones.utils.renderSubviews(renderedElement, store);
            $('div[data-view^=""]', renderedElement).length.should.equal(0);
            done();
        });

        it('should replace the data-id for the temporary object with a model.id', function(done) {
            var i = 5;
            $('div[data-view^=""]', renderedElement).each(function() {
                $(this).attr('data-id').should.equal(i + '');
                i++;
            });
            done();
        });
    });

    describe('#renderAll', function() {
       it('should recursively render the view and its subviews', function(done) {
           var view = new server.plugin.views['Lorems'](new server.plugin.models['Lorems']({ collection: tests }));
           view.renderAll();
           $('div[data-view^=""]', view.$el).length.should.equal(0);
           $('div', view.$el).each(function() {
               $(this).html().should.not.equal('');
           });
           done();
       });
    });
});
