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
  const passingTests = totalTests;
  const passRate =
    totalTests > 0
      ? ((passingTests / (passingTests + failedTests)) * 100).toFixed(0)
      : '0';

  const passingColor = failedTests === 0 ? 'brightgreen' : 'yellow';
  const failingColor = failedTests === 0 ? 'brightgreen' : 'red';

  let readme = fs.readFileSync(README_PATH, 'utf-8');

  const codecovBadge =
    '![codecov](https://img.shields.io/codecov/c/github/airqo-platform/AirQo-frontend?label=codecov&style=flat-square)';
  const passingBadge = `![passing](https://img.shields.io/badge/passing-${passingTests}%20%E2%80%94%20${passRate}%25-${passingColor}?style=flat-square)`;
  const failingBadge = `![failing](https://img.shields.io/badge/failing-${failedTests}-${failingColor}?style=flat-square)`;

  readme = readme.replace(
    /!\[codecov\]\(https:\/\/img\.shields\.io\/codecov\/.*?\)/,
    codecovBadge
  );
  readme = readme.replace(
    /!\[passing\]\(https:\/\/img\.shields\.io\/badge\/passing-.*?\)/,
    passingBadge
  );
  readme = readme.replace(
    /!\[failing\]\(https:\/\/img\.shields\.io\/badge\/failing-.*?\)/,
    failingBadge
  );

  fs.writeFileSync(README_PATH, readme, 'utf-8');

  console.log(
    `Badges updated: ${passingTests} passing (${passRate}%), ${failedTests} failing`
  );
};

updateBadges().catch(err => {
  console.error('Failed to update badges:', err.message);
  process.exit(1);
});
