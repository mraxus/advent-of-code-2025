const { runIfMain, l } = require('./lib');

const input = `385350926-385403705,48047-60838,6328350434-6328506208,638913-698668,850292-870981,656-1074,742552-796850,4457-6851,138-206,4644076-4851885,3298025-3353031,8594410816-8594543341,396-498,1558-2274,888446-916096,12101205-12154422,2323146444-2323289192,37-57,101-137,46550018-46679958,79-96,317592-341913,495310-629360,33246-46690,14711-22848,1-17,2850-4167,3723700171-3723785996,190169-242137,272559-298768,275-365,7697-11193,61-78,75373-110112,425397-451337,9796507-9899607,991845-1013464,77531934-77616074`;
const divisibles = prepDivisibles();

function prepDivisibles() {
  const divs = { 1: [] };
  for (let i = 2; i < 12; i++) {
    divs[i] = [];
    for (let d = 1; d <= i / 2; d++) {
      if ((i % d) === 0) {
        divs[i].push(d);
      }
    }
  }

  return divs;
}
function digitLen(value) {
  return Math.floor(Math.log10(value)) + 1;
}

/**
 * Naive tackle - runs same operation for every number in range
 * Checks the number to see if left half is same as right half
 */
function checkDoubleNumber(value) {
  const len = digitLen(value);

  if (len % 2) return false;

  const halfPower = Math.pow(10, len / 2);
  const right = value % halfPower;
  const left = (value - right) / halfPower;

  return right === left;
}

/**
 * Naiver tackle - runs same operation for every number in range
 */
function checkMultipleNumber(value) {
  const len = digitLen(value);
  let has = false;

  divisibles[len].forEach(div => {
    if (has) return;

    let reminder = value;
    const pow = Math.pow(10, div);

    let right = reminder % pow;
    let left;

    for (let i = 1; i < len / div; i++) {
      reminder = (reminder - right) / pow;
      left = reminder % pow;

      if (left !== right) return;

      right = left;
    }

    has = true;
  });

  return has;
}

function part1(input, liveRun) {
  let sumOfProducts = 0;

  input.split(',').forEach((range) => {
    const [from, to] = range.split('-').map(Number);

    for (let i = from; i <= to; i++) {
      if (checkDoubleNumber(i)) {
        sumOfProducts += i;
      }
    }
  });

  return sumOfProducts;
}

function part2(input, liveRun) {
  let sumOfProducts = 0;

  input.split(',').forEach((range) => {
    const [from, to] = range.split('-').map(Number);

    for (let i = from; i <= to; i++) {
      if (checkMultipleNumber(i)) {
        sumOfProducts += i;
      }
    }
  });

  return sumOfProducts;
}

part1.desc = '';
part1.tests = [
  {
    input: `11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124`,
    result: 1227775554,
  },
];

part2.desc = '';
part2.tests = [4174379265];

runIfMain(module, input, part1, part2);

module.exports = {
  input,
  part1,
  part2,
};
