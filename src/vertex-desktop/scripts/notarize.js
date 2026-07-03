// @ts-check
const { notarize } = require('@electron/notarize');

/**
 * electron-builder afterSign hook — notarizes the macOS .app with Apple.
 * Skips silently when Apple credentials are absent (local/non-CI builds).
 *
 * Required env vars (set in CI by maintainers):
 *   APPLE_ID                   — developer Apple ID email
 *   APPLE_APP_SPECIFIC_PASSWORD — app-specific password for that Apple ID
 *   APPLE_TEAM_ID              — 10-character Apple Developer Team ID
 */
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') return;

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    if (process.env.CI) {
      throw new Error(
        'Notarization failed: APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, and APPLE_TEAM_ID ' +
        'must all be set in CI. An unnotarized macOS build would be blocked by Gatekeeper.'
      );
    }
    console.log('Skipping notarization: Apple credentials not configured (local build).');
    return;
  }

  const appName = context.packager.appInfo.productName;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appPath}...`);

  await notarize({
    tool: 'notarytool',
    appPath,
    appleId,
    appleIdPassword,
    teamId,
  });

  console.log(`Notarization complete for ${appName}.`);
};
