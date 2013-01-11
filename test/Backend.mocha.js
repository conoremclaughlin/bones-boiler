require('./fixture');
var bonesTest = require('bones-test');
var server = bonesTest.server();

describe('Backend', function() {
    var plugin = server.plugin;

    before(function(done) {
        server.start(done);
    });

    after(function(done) {
        server.on('close', done);
        try { server.close(); }
        catch (err) { done();  } // server already closed.
    });

    it('should be in plugin', function(done) {
        plugin.should.have('Backend').should.be.a('Object');
        done();
    });

    it('should have a static extendWithPre function', function(done) {
        plugin.Backend.should.have('extendWithPre').should.be.a('Function');
        done();
    });

    it('should have a static toString function', function(done) {
        plugin.Backend.should.have('toString');
        done();
    });

    it('should have no toString method in the prototype', function(done) {
        plugin.Backend.prototype.should.not.have('toString');
        done();
    });

    describe('extendWithPre', function() {
        var test = [1, 2];
        var pre = function(parent) {
            parent.call(test);
        };
        var hello = function(micCheck) {
            return micCheck;
        };
        var encore = function(micCheck) {
            return micCheck.append(3);
        };
        var queries = {
            after: after,
            pre: pre
        };

        it('should wrap all functions in an object with a "pre" function', function(done) {
            var queriesAfter = plugin.Backend.extendWithPre(test);
            queriesAfter.hello().should.be.a('Array').should.have.length(2);
            queriesAfter.encore().should.be.a('Array').should.have.length(3);
            done();
        });
    });
});
