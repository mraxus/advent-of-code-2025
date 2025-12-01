const fs = require('fs');
const path = require('path');
const axios = require('axios').default;

const packagePath = path.join(__dirname, '..', 'package.json');

function fetch(url) {
  const session = process.env.ADVENT_OF_CODE_SESSION;

  return axios
    .get(url, { headers: { cookie: `session=${session}` } })
    .then(({ data }) => data)
    .catch((ex) => {
      throw new Error(ex.message + ` when fetching ${url}`);
    });
}

module.exports = {
  getProblemInput: async (year, day) => fetch(`https://adventofcode.com/${year}/day/${day}/input`),
  getProblemDetails: async (year, day) => {
    const data = await fetch(`https://adventofcode.com/${year}/day/${day}`);

    const nameRegex = new RegExp(`<h2>--- Day ${day}: (.+) ---</h2>`);
    const authorRegex = new RegExp(/class="user">([a-zA-Z0-9_-]+)/);
    const starsRegex = new RegExp(/<span class="star-count">(\d*)/);

    const name = data.match(nameRegex, 'g')[1];
    const author = data.match(authorRegex, 'g')[1];
    const stars = (data.match(starsRegex, 'g') || [])[1] || 0;

    return {
      name,
      author,
      stars: +(stars || 0),
    };
  },
  getSession: () => {
    const packageWithSession = path.join(__dirname, '..', '..', 'package.json');
    const { secret } = require(packageWithSession);

    return secret;
  },
  runIfMain: (problemModule, input, part1, part2) => {
    if (require.main === problemModule) {
      console.log(`Part 1${part1.desc ? ` (${part1.desc})` : ''}:`, part1(input, true));
      const p2 = part2(input, true);
      if (p2 !== null) {
        console.log(`Part 2${part2.desc ? ` (${part2.desc})` : ''}:`, p2);
      }
    }
  },
  runTests: ({ withInput = false, latest = false }) => {
    const problemFiles = fs
      .readdirSync('.')
      .filter((file) => file.match(/\d\d\.js/))
      .reduce((all, file) => (latest ? [file] : [...all, file]), []);

    problemFiles.forEach((file) => {
      const { part1, part2 } = require(`../${file}`);
      const day = parseInt(file);

      if (!part1 || !part1.tests) return;

      describe(`Day ${day}`, () => {
        [part1, part2].forEach((part, index) => {
          if (!part || !part.tests) return;
          const desc = part.desc ? ` (${part.desc})` : '';

          part.tests.forEach((resultOrTest, index) => {
            if (Array.isArray(resultOrTest)) {
              const len = resultOrTest.length
              part.tests[index] = {
                input: len === 1 ? part1.tests[index].input : resultOrTest[0],
                result: resultOrTest[len === 1 ? 0 : 1],
              };
            } else if (typeof resultOrTest !== 'object') {
              part.tests[index] = {
                input: part1.tests[index].input,
                result: resultOrTest,
              };
            }
          });

          const answers = part.tests.map(({ input, result }) => {
            const inputDesc = withInput ? ` with input "${input}"` : '';
            const actual = part(input);
            test(`Part ${index + 1}${desc}${inputDesc} to be ${result}`, () => {
              expect(actual).toEqual(result);
            });
            return actual === result;
          });
          if (latest && answers.length && answers.reduce((a, b) => a && b)) {
            const assignment = require(`../${`${day}`.padStart(2, '0')}`);
            const answer = assignment[`part${index + 1}`](assignment.input, true);
            test(`\x1b[38;2;255;255;255m${`Personal answer for part ${
              index + 1
            }: ${answer}`}\x1b[0m`, () => {});
          }
        });
      });
    });
  },

  createDayFile: (day, input, force = false) => {
    const zeroDay = `${day}`.padStart(2, '0');
    const templateFilename = path.join(__dirname, 'templates', `sync-day.js`);
    const dayFilename = path.join(__dirname, '..', `${zeroDay}.js`);

    if (fs.existsSync(dayFilename)) {
      if (force) {
        fs.unlinkSync(dayFilename);
      } else {
        throw new Error(`Day file ${dayFilename} exists. Remove it manually to overwrite`);
      }
    }

    const content = fs
      .readFileSync(templateFilename)
      .toString()
      .replace('const input = 0;', `const input = \`${input.trimEnd()}\`;`);

    fs.writeFileSync(dayFilename, content);

    return dayFilename;
  },

  getAocPackageYear: () => require(packagePath).aoc.year || [],
  getAocPackageDays: () => require(packagePath).aoc.days || [],
  updateAocPackage: (author, days, stars) => {
    const pack = require(packagePath);

    pack.aoc = {
      ...pack.aoc,
      author,
      stars,
      days,
    };
    fs.writeFileSync(packagePath, JSON.stringify(pack, null, '  '));
  },
};
