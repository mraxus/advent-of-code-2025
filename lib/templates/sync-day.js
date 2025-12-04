const { runIfMain, l } = require('./lib');

const input = 0;

function part1(input, liveRun) {
  return 0;
}

function part2(input, liveRun) {
  return null;
}

part1.desc = '';
part1.tests = [{
  input: 0,
  result: 0,
}];

part2.desc = '';
part2.tests = [];

runIfMain(module, input, part1, part2);

module.exports = {
  input,
  part1,
  part2,
};
