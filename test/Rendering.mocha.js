require('./fixture');
var bonesTest = require('bones-test');
var server = bonesTest.server();

var tests = [
    { name: 'uno' },
    { name: 'dos' }
];

describe('Templating and rendering', function() {
    bonesTest.utils.initStart(server);

    describe('partial templating', function() {
        it('should create a placeholder element', function(done) {
//            server.utils.partial('').should.equal('div');
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
            var html = func('test', {
                model: 'hello'
            });
            store[0].be.a('object');
            store[0].should.have.a.property('model');
            store[0].model.should.equal('hello');
            done();
        });
    });

    describe('templateSubviews', function() {
        it('should replace all partial placeholders with rendered html', function() {
            var html = templates.test({
                data: tests,
                partial: server.utils.makePartialHelper(server.utils.makeStore())
            });
            var element = $(html);
            $(element, 'div[data-view]').length().should.equal(2);
            html = templateSubviews(html);
            element = $(html);
            $(element, 'div[data-view]').length().should.equal(2);
            $(element, 'div[data-view]').forEach(function() {
                $(this).html().should.not.equal('');
            });
            done();
        });

        it('should replace the data-id for the temporary object with a model.id', function() {
            done('implement');
        });
    });

    describe('templateAll', function() {
        it('should use partial to render placeholders', function() {
            done('implement');
        });

        it('should recursively template the view and its subviews', function() {
           done('implement');
       });


    });

    describe('renderSubviews', function() {
        it('should replace placeholders with rendered views', function() {
            done('implement me');
        });

        it('should attach views to pre-rendered placeholders', function() {
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
