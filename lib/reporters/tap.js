var doNothing = function () {};
var stream = process.stdout;

module.exports = {

  start: doNothing,
  skip: doNothing,
  stub: doNothing,
  pass: doNothing,
  fail: doNothing,

  run: function (run) {
    var output = [];
    var passed = 0;
    var failed = [];
    var dive = function (node) {
      if (node.name) {
        var title = node.name;
        var suite = node.parent;
        while (suite && suite.title) {
          title = suite.title + ' ' + title;
          suite = suite.parent;
        }
        title = title.replace(/\n/g, ' ');
        var err = node.error;
        if (err) {
          failed.push(err);
        }
        else {
          passed++;
        }
        output.push(title + (err ? '\n' + err.trace : ''));
      }
      else {
        node.children.forEach(function (child) {
          dive(child);
        });
      }
    };
    run.failed.forEach(function (fail) {
      fail.errors.forEach(function (error) {
        output.push(fail.title + '\n' + error.trace);
        failed.push(error);
      });
    });
    dive(run);
    return {
      output: output,
      passed: passed,
      failed: failed,
      hasOnly: run.hasOnly,
      skipped: run.skipped
    };
  },

  all: function (outputs, passed, failed, skipped, stubbed, time) {
    var lines = [];
    outputs.forEach(function (output) {
      output.forEach(function (line) {
        lines.push(line);
      });
    });
    stream.write(1 + '...' + lines.length + '\n');
    lines.forEach(function (line, index) {
      var text = line.replace(/\n/g, '\n  ');
      var prefix = text.length > line.length ? 'not ok ' : 'ok ';
      stream.write(prefix + (index + 1) + ' ' + text + '\n');
    });
    stream.write('# tests ' + lines.length + '\n');
    stream.write('# pass ' + passed + '\n');
    stream.write('# fail ' + failed.length + '\n');
  }

};
