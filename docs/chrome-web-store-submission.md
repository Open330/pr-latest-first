# Chrome Web Store Submission

This document is the submission copy for PR Latest First v0.2.0.

## Store Listing

### Name

PR Latest First

### Summary

Read the latest GitHub pull request comments first, or open the Conversation at
the bottom.

### Detailed Description

PR Latest First makes long GitHub pull request Conversation pages easier to
scan when reviews, bots, and coding agents add a lot of feedback.

Choose the reading mode that fits the pull request:

- Latest comments first moves loaded comment and review-comment entries above
  older timeline activity, with the newest loaded comment first.
- Start at bottom keeps GitHub timeline order and opens new Conversation visits
  near the composer and newest activity.

Optional top and bottom jump buttons make long pull request pages faster to
navigate. The extension only runs on GitHub pull request Conversation pages.
Commits, Checks, and Files changed views are left alone.

PR Latest First does not send pull request data, comment content, GitHub URLs,
or analytics events to a server. Its settings stay in Chrome extension storage.

## Privacy Practices

### Single Purpose

Improve reading and navigation on GitHub pull request Conversation pages by
changing the selected entry behavior and adding optional page jump controls.

### Permission Justification

#### storage

Stores the user's selected pull request Conversation mode and whether optional
top and bottom jump controls are shown.

### Host Access Explanation

The content script match pattern is limited to GitHub pull request URLs so the
extension can read and reorder rendered Conversation timeline items locally in
the browser and add the optional jump controls.

### Remote Code

No. PR Latest First does not execute remote code.

### Data Collection

Select no collected data categories. The extension does not collect or transmit
user data, browsing activity, GitHub URLs, repository information, pull request
content, comment content, analytics, or telemetry.

### Privacy Policy URL

Use:

`https://github.com/Open330/pr-latest-first/blob/main/PRIVACY.md`

## Store Assets

Required upload assets prepared in `store-assets/`:

- `promo-small-440x280.png`
- `screenshot-options-1280x800.png`

The extension ZIP already includes the required 128x128 PNG icon declared in
`manifest.json`.

## Dashboard Checklist

1. Upload `store-assets/pr-latest-first-web-store-v0.2.0.zip`.
2. Paste the listing name, summary, and detailed description above.
3. Upload the small promotional image and screenshot.
4. Use the single purpose and storage permission justification above.
5. Select that the extension does not use remote code.
6. Keep data collection disclosures consistent with `PRIVACY.md`.
7. Set the privacy policy URL to the public `PRIVACY.md` page.
