const args = process.argv.slice(2);
const withInput = args.includes('-i=') || args.includes('--input=');
const latest = args.includes('-l=') || args.includes('--latest=');

require('./lib').runTests({ withInput, latest });
