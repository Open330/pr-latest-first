<p align="center">
  <img src="./assets/icon-source.svg" width="112" height="112" alt="PR Latest First icon">
</p>

<h1 align="center">PR Latest First</h1>

<p align="center">
  A small Chrome extension that brings the latest GitHub pull request comments
  to the top of the Conversation timeline.
</p>

<p align="center">
  <img alt="Manifest V3" src="https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white">
  <img alt="GitHub PRs" src="https://img.shields.io/badge/GitHub-Pull%20Requests-24292F?style=for-the-badge&logo=github&logoColor=white">
  <img alt="Zero dependencies" src="https://img.shields.io/badge/Dependencies-Zero-1F883D?style=for-the-badge">
</p>

## Why

Agent reviews can turn a pull request Conversation page into a long feed.
GitHub appends recent comments near the bottom, so reading the latest feedback
often means scrolling through earlier activity first.

PR Latest First keeps the pull request description and comment box in place,
then raises loaded comment and review-comment entries above older timeline
activity. The newest loaded comment appears first.

| GitHub default | With PR Latest First |
| --- | --- |
| Pull request description | Pull request description |
| Earlier timeline activity | **Latest comment** |
| Older comments and reviews | **Newer review comment** |
| Latest agent feedback | Older comments and reviews |
| Comment composer | Other timeline activity |
|  | Comment composer |

## Highlights

| | |
| --- | --- |
| Latest first | Sorts loaded PR comments and review comments by their timestamps. |
| Open modes | Switch between latest-first ordering and GitHub order with bottom entry. |
| Conversation only | Leaves Commits, Checks, and Files changed pages untouched. |
| GitHub aware | Watches for timeline nodes GitHub inserts after the initial page load. |
| Page jumps | Optionally show top and bottom buttons on the Conversation page. |
| Lightweight | Uses one Manifest V3 content script and no build step. |

## Quickstart for Agents

<div><img src="https://quickstart-for-agents.vercel.app/api/header.svg?theme=codex&title=Install+PR+Latest+First&lang=Agents" width="100%" alt="Quickstart for Agents terminal header"></div>

```text
Install PR Latest First from https://github.com/Open330/pr-latest-first.

Clone the repository, inspect its Manifest V3 files, and help me load it as an
unpacked Chrome extension in Chrome. Do not publish or change the extension
unless I ask. Tell me which cloned directory to select in chrome://extensions,
then explain how to verify that latest comments move to the top on a GitHub pull
request Conversation page.
```

<div><img src="https://quickstart-for-agents.vercel.app/api/footer.svg?theme=codex&project=pr-latest-first&agent=Agents" width="100%" alt="Quickstart for Agents terminal footer"></div>

## Install From Release

1. Download `pr-latest-first-v0.2.0.zip` from the latest GitHub Release.
2. Unzip it to a local directory.
3. Open `chrome://extensions` in Chrome.
4. Enable Developer mode.
5. Select Load unpacked.
6. Choose the unzipped `pr-latest-first` directory.
7. Reload a GitHub pull request Conversation page.

## Install From Source

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable Developer mode.
4. Select Load unpacked.
5. Choose the repository directory.
6. Reload a GitHub pull request Conversation page.

## How It Works

The content script is scoped to GitHub pull request URLs. On the exact
Conversation route, it:

1. Finds GitHub timeline items under the pull request discussion.
2. Detects timeline items that contain comments or review comments.
3. Reads the latest timestamp inside each loaded comment item.
4. Moves comment items above other timeline activity in latest-first order.
5. Repeats the sort when GitHub updates the timeline DOM.

The extension options page can keep GitHub timeline order and start new
Conversation visits at the bottom instead. It also controls whether fixed page
jump buttons are shown.

## Files

| Path | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 extension metadata and GitHub content script scope. |
| `content.js` | Timeline detection, sorting, and DOM update observation. |
| `content.css` | Fixed jump control styling on pull request Conversation pages. |
| `options.*` | Mode and controller settings page. |
| `assets/` | Source icon and Chrome extension PNG icons. |

## Limits

- GitHub can change its private PR page markup. If the timeline selectors move,
  update `content.js`.
- The extension sorts items that GitHub has already loaded into the page. Items
  loaded later are sorted when they enter the DOM.
- The pull request description stays above the reordered timeline by design.

## Development

There is no dependency install or build command.

```bash
node --check content.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"
```

After changing extension files, reload PR Latest First from
`chrome://extensions` and refresh the GitHub PR page.

## License

MIT

## Privacy

PR Latest First does not include analytics or transmit GitHub pull request
data. The full policy is in [`PRIVACY.md`](./PRIVACY.md).
