#### Summary of Changes (What does this PR do?)

- Briefly describe the desktop wrapper changes in this PR.
- Mention whether this affects:
  - [ ] `src/vertex-desktop` only
  - [ ] `src/vertex` web UI/layout
  - [ ] CI/release workflows
  - [ ] Documentation

#### Desktop Scope Checklist

- [ ] Title bar overlay behavior updated/verified (Back + Reload + branding).
- [ ] Native title bar/app content overlap handled (top offset logic).
- [ ] Windows app icon verified in:
  - [ ] Native title bar branding
  - [ ] Taskbar
  - [ ] Start Menu
  - [ ] Desktop shortcut
- [ ] App identity settings remain stable (`appId`, executable name, AppUserModelID).
- [ ] Packaging config reviewed (`nsis`, shortcuts, `extraResources`, icon paths).
- [ ] `README.md` updated for any build/release prerequisite changes.
- [ ] `CHANGELOG.md` updated using Vertex changelog format.

#### Build & Validation (Windows)

- [ ] Built installer locally with `npm run dist:win` from `src/vertex-desktop`.
- [ ] Built using Administrator terminal.
- [ ] Windows Developer Mode enabled during build.
- [ ] Installer runs and app launches successfully after install.
- [ ] Reinstall/upgrade path tested if installer behavior changed.

#### Runtime Validation

- [ ] App loads correct URL for environment (dev/prod).
- [ ] Back/Reload controls function correctly.
- [ ] Sidebar/topbar/main content are not hidden behind native title bar.
- [ ] External links open outside app as expected.
- [ ] No regression in auth/session behavior for wrapped Vertex UI.

#### Auto-Update / Release Notes

- [ ] Auto-update behavior unaffected or explicitly tested.
- [ ] Any updater/feed/channel changes are documented in PR.
- [ ] Release notes/changelog entry included.

#### How should this be manually tested?

1. From `src/vertex-desktop`, run `npm install`.
2. Run `npm run dev` and validate desktop navigation/title bar behavior.
3. Build installer with `npm run dist:win` (Administrator terminal).
4. Install and verify Start Menu + taskbar icon + title bar behavior.
5. Validate key Vertex flows (login, navigation, sidebar usage) in installed app.

#### Relevant Tickets

- Closes #<enter issue number here>
- [Jira_card_number]() (if exists)

#### Screenshots / Recording (required for desktop UI changes)

- Before:
- After:
