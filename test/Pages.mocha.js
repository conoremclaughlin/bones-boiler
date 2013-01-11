require('./fixture');
var bonesTest = require('bones-test');
var server = bonesTest.server();

describe('Pages', function() {
    var plugin = server.plugin;

    before(function(done) {
        server.start(done);
    });

    after(function(done) {
        server.on('close', done);
        try { server.close(); }
        catch (err) { done();  } // server already closed.
    });

    it('should read plugin directories', function(done) {
        done('implement me.');
    });

    it('should read files within and their frontmatter', function(done) {
        done('implement me.');
    });

    it('should create a get handler for the page from the url frontmatter property', function(done) {
        done('implement me.');
    });
});
