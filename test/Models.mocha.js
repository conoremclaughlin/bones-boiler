process.env.NODE_ENV = 'test';
require('./fixture');
var debug = require('debug')('bones-boiler:Models.mocha');
var bonesTest = require('bones-test');

// TODO: change how to require server.
var server = bonesTest.server();
server.plugin.config.mongoName += '-test';

// Test data.
var data = {
    name: 'First'
};

describe('Models', function() {
    describe('base models', function() {
        before(function(done) {
            server.start(done);
        });

        after(function(done) {
            try { server.close(done); }
            catch (err) { } // server already closed.
        });

        var model = new server.plugin.models.Base();

        it('should have a url /api/<title> with no id', function(done) {
            model.url().should.be.equal('/api/base');
            done();
        });

        it('should have a url /api/<title>/:id with a set id', function(done) {
            model.id = 'cool';
            model.url().should.be.equal('/api/base/cool');
            done();
        });

        bonesTest.testModel(server, 'Lorem');
    });

    describe('base collections', function() {

        it('should have db as a property', function(done) {
            var collection = new server.plugin.models.BaseCollection();
            collection.should.have.property('db').and.be.a('function');
            done();
        });
    });

});

describe('Models HTTP', function() {
    bonesTest.testModelCRUDHTTP(server, 'Lorem', data, {
        name: 'another name'
    });
});