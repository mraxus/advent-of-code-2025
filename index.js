const { spawn } = require('child_process');
const fs = require('fs').promises;

const args = process.argv.slice(2);
const latestOnly = args.includes('-l') || args.includes('--latest');

const {
  aoc: { year, stars, author, days },
} = require('./package.json');
const latestDay = [[...days].reverse()[0]];

const assignments = (latestOnly ? latestDay :days)
  .map(({ day, name }) => ({ filename: `${day}`.padStart(2, '0') + '.js', title: `Day ${day}: ${name}`}))
const white = (text) => `\x1b[38;2;255;255;255m${text}\x1b[0m`;
const gray = (text) => `\x1b[38;2;178;178;178m${text}\x1b[0m`;
const yellow = (text) => `\x1b[38;2;255;255;106m${text}\x1b[0m`;
const orange = (text) => `\x1b[38;2;255;153;0m${text}\x1b[0m`;
const darkGreen = (text) => `\x1b[38;2;0;153;0m${text}\x1b[0m`;
const brightGreen = (text) => `\x1b[38;2;0;204;0m${text}\x1b[0m`;

const aoc = brightGreen(`Advent of Code ${year}`);

function formatTime([sec, nanosec]) {
  const ms = Math.round((sec * 1e9 + nanosec) / 1e6);

  if (ms < 1000) {
    return brightGreen(`${ms} ms`);
  } else if (ms < 1500) {
    return darkGreen(`${ms} ms`);
  } else {
    return darkGreen(`${ms / 1e3} sec`);
  }
}

function executeAssignment({ filename, title }, index) {
  return new Promise(async (res, rej) => {
    filename = filename || `${index + 1}`.padStart(2, '0') + '.js';
    const fileExists = await fs
      .access(filename)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) return res();
    const child = spawn('node', [`./${filename}`]);
    let output = '';
    let dots = '';

    const time = process.hrtime();
    process.stdout.write(`${title} ${dots}`);

    title = white(title);

    let tmrID = setInterval(() => {
      dots += '.';
      process.stdout.write(`\r${title} ${dots}`);
    }, 1000);

    child.stdout.on('data', (data) => (output += data));
    child.on('error', (err) => rej(err));
    child.on('close', () => {
      clearInterval(tmrID);

      console.log(`\r${title}  [${formatTime(process.hrtime(time))}]`);
      console.log(
        output
          .split('\n')
          .filter((x) => x)
          .map((line) => {
            const [desc, answer] = line.split(':');
            return `  ${gray(desc)}:${yellow(answer)}`;
          })
          .join('\n') + '\n'
      );
      res();
    });
  });
}

const startedAt = process.hrtime();

assignments
  .reduce(
    (p, assignment, index) => p.then(() => executeAssignment(assignment, index)),
    Promise.resolve()
  )
  .then(() => {
    const [sec, nanosec] = process.hrtime(startedAt);
    const totalTime = darkGreen(sec + '.' + Math.round(nanosec / 1e6));

    console.log(`${orange(author || '')} completed ${stars || 0} star${stars > 1 ? 's' : ''} in ${aoc}.`);
    console.log(`All assignments computed in ${totalTime} seconds`);
  });
