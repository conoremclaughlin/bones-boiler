// *************************** REGRESSION ***************************
// 1. test if Bones.sync has been set from Bones.plugins.backends.Mongoose.sync
// 2.


// ***************************** TESTS ******************************

process.env.NODE_ENV = 'test';

require('./fixture');

var _ = require('underscore');
var bonesTest = require('bones-test');

// TODO: change how to require server.
var server = bonesTest.server();
// Write to a test database.
// TODO: write an uninstall method for the test database.
server.plugin.config.mongoName += '-test';

describe('Mongoose', function() {
    before(function(done) {
        server.start(done);
    });

    after(function(done) {
        server.on('close', done);
        try { server.close(); }
        catch (err) { done();  } // server already closed.
    });

    it('should be a backend', function(done) {
        server.plugin.backends.should.be.a('object');
        server.plugin.backends.should.have.property('Mongoose');
        done();
    });

    it('should initialize and store db models in plugin.app', function(done) {
        server.plugin.should.have.property('app').should.be.a('object');
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
});