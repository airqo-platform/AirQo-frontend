#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');

const readStdin = () =>
  new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });

const updateBadges = async () => {
  const output = await readStdin();

  const testMatch = output.match(/Tests:.*?(\d+)\s+passed/);
  const failTestMatch = output.match(/Tests:.*?(\d+)\s+failed/);

  const totalTests = testMatch ? parseInt(testMatch[1], 10) : 0;
  const failedTests = failTestMatch ? parseInt(failTestMatch[1], 10) : 0;
  const passRate =
    totalTests > 0
      ? ((totalTests / (totalTests + failedTests)) * 100).toFixed(0)
      : '0';

  const isPassing = failedTests === 0;
  const label = isPassing ? 'passing' : 'failing';
  const color = isPassing ? 'brightgreen' : 'red';

  let readme = fs.readFileSync(README_PATH, 'utf-8');

  const testsBadge = `![tests](https://img.shields.io/badge/tests-${label}-${color}?style=flat-square)`;

  readme = readme.replace(
    /!\[tests\]\(https:\/\/img\.shields\.io\/badge\/tests-.*?\)/,
    testsBadge
  );

  fs.writeFileSync(README_PATH, readme, 'utf-8');

  console.log(
    `Badges updated: ${totalTests} passing (${passRate}%), ${failedTests} failing`
  );
};

updateBadges().catch(err => {
  console.error('Failed to update badges:', err.message);
  process.exit(1);
});
