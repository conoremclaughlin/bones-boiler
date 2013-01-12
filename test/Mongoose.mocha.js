process.env.NODE_ENV = 'test';
require('./fixture');
var _ = require('underscore'),
    bonesTest = require('bones-test'),
    server = bonesTest.server();

// Write to a test database.
// TODO: write an uninstall method for the test database.

describe('Mongoose', function() {
    before(function(done) {
        server.start(done);
    });

    after(function(done) {
        try { server.close(done); }
        catch (err) { } // server already closed.
    });

    it('should be a backend', function(done) {
        server.plugin.backends.should.be.a('object');
        server.plugin.backends.should.have.property('Mongoose');
        done();
    });

    it('should initialize and store db models in plugin', function(done) {
        server.plugin.should.have.property('mongooseModels').should.be.a('object');
        done();
    });

    it('should replace Bones.sync with Mongoose.sync', function(done) {
        var Bones = require(global.__BonesPath__ || 'bones');
        try {
            Bones.sync({}, {}, function(err) {
                // no model in req argument, so should call next with error.
                if (err) done();
            });
        } catch(err) {
            return done(err);
        }
    });

    it('should mixin queries with the getConnection plugin', function(done) {
        done('implement me');
    });
});