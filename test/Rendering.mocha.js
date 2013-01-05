require('./fixture');
var bonesTest = require('bones-test');
var server = bonesTest.server();

var tests = [
    { id: 5, name: 'uno' },
    { _id: 6, name: 'dos' }
];

describe('Templating and rendering', function() {
    bonesTest.utils.initStart(server);

    describe('partial templating', function() {
        it('should create a placeholder element', function(done) {
            var html = server.utils.partial('test');
            html.should.equal('<div data-view="test"></div>');
            done();
        });

        it('should be able to create a store with makeStore', function(done) {
            var id = '';
            var store = server.utils.makeStore();
            store.should.be.a('object');
            store.should.have.a.property('nextId');
            store.nextId().should.be.a('number').should.equal(0);
            store.nextId().should.be.a('number').should.equal(1);
            done();
        });

        it('should store data in a store given a store', function(done) {
            var store = server.utils.makeStore();
            var html = server.utils.partial('test', {
                model: 'hello'
            }, store);
            var element = $(html);
            $(element).attr('data-view').should.equal('test');
            $(element).attr('data-model').should.equal('hello');
            $(element).attr('data-id').should.equal('0');
            store[0].be.a('object');
            store[0].should.have.a.property('model');
            store[0].model.should.equal('hello');
            done();
        });

        it('should add a store to the namespace of makePartialHelper', function(done) {
            var store = server.utils.makeStore();
            var func = server.utils.makePartialHelper(store);
            func('test', {
                model: 'hello'
            });
            store[0].be.a('object');
            store[0].should.have.a.property('model');
            store[0].model.should.equal('hello');
            done();
        });
    });

    describe('templateSubviews', function() {
        var html = '';

        it('should replace all partial placeholders with rendered html', function() {
            html = templates.test({
                data: tests,
                partial: server.utils.makePartialHelper(server.utils.makeStore())
            });
            var element = $(html);
            $(element, 'div[data-view^=""]').length().should.equal(2);
            html = templateSubviews(html);
            element = $(html);
            $(element, 'div[data-view^=""]').length().should.equal(2);
            $(element, 'div[data-view^=""]').forEach(function() {
                $(this).html().should.not.equal('');
            });
            done();
        });

        it('should replace the data-id for the temporary object with a model.id', function() {
            var i = 5;
            $(element, 'div[data-view^=""]').forEach(function() {
                $(this).attr('data-id').should.equal(i);
                i++;
            });
            done();
        });
    });

    describe('templateAll', function() {
        var html = '';

        it('should recursively template the view and its subviews', function() {
            html = server.utils.templateAll('test', { data: tests });
            var element = $(html);
            $(element, 'div[data-view^=""]').length().should.equal(2);
            $(element, 'div[data-view^=""]').forEach(function() {
                $(this).html().should.not.equal('');
            });
            done();
       });
    });

    describe('renderSubviews', function() {
        var html = '',
            views = [],
            rendered = '';

        it('should attach views to pre-rendered placeholders', function() {
            html = server.utils.templateAll('test', { data: tests });
            views = server.utils.renderSubviews(html);
            views[0].model.id.should.equal(5);
            rendered = views[0].html();
            views[0].model = new server.models['Base']({ _id: 7, name: good-bye });
            views = server.utils.renderSubviews(views[0].html());
            views[0].html().should.not.equal(rendered);
            done();
        });

        it('should replace placeholders with rendered views if shouldReplace is true', function() {
            done('implement me');
        });

        it('should replace the data-id with a model id if a model argument is given', function() {
            done('implement me');
        });
    });

    describe('renderAll', function() {
       it('should recursively render the view and its subviews', function() {
           done('implement me');
       });
    });
});
