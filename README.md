# Jellywalk Legal Website

This repository builds the public legal-document website for Jellywalk by Topundred Inc.

- **Live site:** https://jellywalk-legal.vercel.app/
- **Privacy Policy:** https://jellywalk-legal.vercel.app/privacy-policy/
- **Terms of Service:** https://jellywalk-legal.vercel.app/terms-of-service/
- **Source repository:** https://github.com/fbtopg/jellywalk-legal

The site is intentionally static: Markdown is rendered at build time, the published pages require no client-side JavaScript, and PDF versions remain available as downloads.

## Local development

Requirements: Node.js 20 or newer.

```bash
npm ci
npm run build
npm run check
npx --yes serve dist
```

Edit `privacy-policy.md` or `terms-of-service.md`, regenerate their matching HTML/PDF publication artifacts when their content changes, and rebuild. Generated website files in `dist/` are not committed.

## Release and rollback

1. Run `npm ci`, `npm run build`, and `npm run check` before release.
2. Push the reviewed commit to `main`.
3. Deploy production with `vercel deploy --yes --prod --logs` and wait for the deployment to report `Ready`.
4. Validate `/`, `/privacy-policy/`, `/terms-of-service/`, both PDF downloads, and the security headers on the production URL.
5. To roll back, promote the preceding known-good Vercel deployment with `vercel rollback <deployment-url> --yes`, then repeat the route and header checks. The Git commit and Vercel deployment history provide the recovery points.

## Source documents

This directory contains publication-ready English drafts for JellyWalk:

- `privacy-policy.md` and its rendered HTML/PDF versions
- `terms-of-service.md` and its rendered HTML/PDF versions

The drafts use the company identity maintained by the Seoul Sheet Buddy project:

- **Legal name:** Topundred Inc.
- **Business registration number:** 230-86-03029
- **Address:** 501-A110, 5F, 61, Daehak-ro 12-gil, Jongno-gu, Seoul, 03086, Republic of Korea
- **Contact:** info@topundred.com

## Drafting outline

The Privacy Policy covers the service scope, information collected, on-device processing, account and profile data, step and health data, precise location and route data, gameplay and reward records, public leaderboard fields, purposes and legal grounds, service providers and overseas processing, retention and deletion, user rights, children's privacy, security, automatic collection, policy changes, and Korean privacy remedies.

The Terms of Service cover eligibility, accounts, service features, health and walking safety, location-based service terms, profile and leaderboard visibility, user content, prohibited conduct and anti-cheat rules, virtual rewards, purchases and refunds, beta features, intellectual property, third-party services, termination, consumer protections, liability, governing law, app-store provisions, and changes to the terms.

## Publication checklist

These documents are drafted from the product's current source code and current official Korean privacy and location-information guidance. Before treating them as final legal notices, Topundred Inc. should complete the following operational review:

1. **Legal review and Korean version.** Have Korean counsel review the documents, confirm which Korean statutes apply to the live launch, and publish a Korean version. If language versions differ, state clearly which one controls to the extent permitted by law.
2. **Privacy and location manager details.** Designate the responsible individual or formally named department, and add any telephone number or other details required for a privacy officer and location information manager. The drafts currently identify the Privacy & Location Information Team and the shared company email.
3. **Location-business status.** Confirm whether JellyWalk must report or register as a location-based service provider, complete any required filing, and ensure the location terms remain directly accessible before consent and from the app's settings.
4. **Deletion implementation.** Reconcile the backend with the retention promises before publication. The present account-deletion path soft-deletes several records but does not visibly remove every related daily-step, session, leaderboard, reward-history, item, mission, or stored profile-image record. The app's separate “delete all workout records” control is also marked as coming soon.
5. **Processor and transfer register.** Confirm the contracted legal entities, configured cloud regions, destination countries, transfer mechanisms, frequency, and retention periods for Auth0/Okta, Google/Firebase/Google Cloud/Google Analytics, CARTO, infrastructure hosting, logging, and support tools. Update the Privacy Policy if the production configuration differs from the draft.
6. **Android analytics controls.** The Android build directly includes Google Analytics for Firebase. Confirm the intended production configuration, set user-level event retention to no more than 14 months, disable advertising personalization and unnecessary identifier collection, avoid health/route data in event parameters, and either implement required consent/withdrawal controls or remove/disable the SDK before launch.
7. **Consent records.** Version and timestamp acceptance of the Privacy Policy, Terms of Service, and location terms. Keep optional marketing consent separate, and make withdrawal as easy as consent.
8. **Product links.** Connect the sign-up review links and settings links to the hosted documents. Replace the older Notion Terms URL after the new versions are approved and hosted.
9. **App-store disclosures.** Reconcile Apple App Privacy and Google Play Data safety responses with the approved policy, including precise location, health/fitness, identifiers, app analytics, user content, diagnostics, deletion, and optional marketing.
10. **Feature launch review.** Add separate, feature-specific terms before enabling paid purchases, cash redemption, cryptocurrency, blockchain/NFT functionality, third-party reward fulfillment, advertising, or new sharing of location data.

## Principal drafting references

- Personal Information Protection Commission, 2026 Privacy Policy Drafting Guidelines: https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&nttId=12018
- Personal Information Protection Act, including Article 30: https://www.law.go.kr/법령/개인정보보호법
- Act on the Protection and Use of Location Information: https://www.law.go.kr/법령/위치정보의보호및이용등에관한법률
- Act on the Consumer Protection in Electronic Commerce, Etc.: https://www.law.go.kr/법령/전자상거래등에서의소비자보호에관한법률
- Google Analytics default data collection: https://support.google.com/analytics/answer/11593727
- Apple App Review Guidelines, including HealthKit and sensitive-data rules: https://developer.apple.com/app-store/review/guidelines/

## Status

Version 1.0 drafts, effective July 21, 2026. They should be reviewed again whenever JellyWalk changes its data flows, providers, reward model, public features, or commercial offering.
