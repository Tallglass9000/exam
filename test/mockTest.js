describe('mock', function () {

  var a = [];

  it('mocks and unmocks properties that exist', function () {
    mock(console, {
      log: mock.concat()
    });
    console.log('hello');
    is(console.log.value, 'hello');
    unmock(console);
  });

  it('mocks and unmocks properties that do not exist', function () {
    mock(console, {
      blah: mock.concat()
    });
    console.blah('hello');
    is(console.blah.value, 'hello');
    unmock(console);
    is.undefined(console.blah);
  });

  it('mocks and unmocks prototype properties', function () {
    Array.prototype.something = function () {};
    mock(a, {
      something: mock.count()
    });
    a.something();
    is(a.something.value, 1);
    unmock(a);
  });

  it('mocks again', function () {
    mock(a, {
      join: mock.count()
    });
    mock(a, {
      push: mock.count()
    });
    a.join();
    a.push();
    is(a.join.value, 1);
    is(a.push.value, 1);
    unmock(a);
  });

  it('ignores duplicate unmocking', function () {
    mock(a, {
      join: mock.count()
    });
    unmock(a);
    unmock(a);
  });

  it('ignores unnecessary unmocking', function () {
    unmock({});
  });

  describe('.count', function () {
    it('counts calls', function () {
      mock(a, {
        join: mock.count()
      });
      is(a.join.value, 0);
      a.join();
      is(a.join.value, 1);
      a.join();
      is(a.join.value, 2);
      unmock(a);
    });
  });

  describe('.concat', function () {
    it('concatenates strings', function () {
      mock(a, {
        join: mock.count()
      });
      is(a.join.value, 0);
      a.join();
      is(a.join.value, 1);
      a.join();
      is(a.join.value, 2);
      unmock(a);
    });
    it('supports delimiters', function () {
      mock(a, {
        push: mock.concat(',')
      });
      is(a.push.value, '');
      a.push(1);
      is(a.push.value, '1');
      a.push(2);
      is(a.push.value, '1,2');
      a.push(3);
      is(a.push.value, '1,2,3');
      unmock(a);
    });
  });

  describe('.args', function () {
    it('stores arguments', function () {
      mock(a, {
        push: mock.args()
      });
      a.push(1);
      is.same(a.push.value, [{0:1}]);
      a.push(2);
      is.same(a.push.value, [{0: 1}, {0: 2}]);
      a.push(1, 2);
      is.same(a.push.value, [{0: 1}, {0: 2}, {0: 1, 1: 2}]);
      unmock(a);
    });
    it('stores indexed arguments', function () {
      mock(a, {
        push: mock.args(0)
      });
      a.push(1);
      is.same(a.push.value, [1]);
      a.push(2);
      is.same(a.push.value, [1, 2]);
      a.push(1, 2);
      is.same(a.push.value, [1, 2, 1]);
      unmock(a);
    });
  });

  describe('.fs', function () {
    it('creates files and directories', function (done) {
      var fs = mock.fs({'/tmp/file.txt': 'FILE_CONTENT'});
      fs.readFile('/tmp/file.txt', function (err, content) {
        is(content.toString(), 'FILE_CONTENT');
        unmock(fs);
        done();
      });
    });
    it('is unmockable', function (done) {
      var fs = mock.fs({'/tmp/file.txt': 'FILE_CONTENT'});
      var content = fs.readFileSync('/tmp/file.txt');
      is(content.toString(), 'FILE_CONTENT');
      unmock(fs);
      fs.readFile('/tmp/file.txt', function (err) {
        is.error(err);
        done();
      });
    });
    it('can leave Node\'s built-in fs alone', function (done) {
      var fs = require('fs');
      mock.fs({'a.txt': 'A'}, true);
      fs.readFile('a.txt', function (err) {
        is.error(err);
        done();
      });
    });
  });

  describe('.file', function () {
    it('creates a file', function () {
      var fs = mock.fs({
        'gid.txt': mock.file({
          content: 'GROUP:1234',
          gid: 1234
        })
      });
      var stat = fs.statSync('gid.txt');
      is(stat.gid, 1234);
    });
  });

});
