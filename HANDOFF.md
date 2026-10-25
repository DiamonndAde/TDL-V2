# Handoff notes — TDL website v2

Operational rules for whoever runs the site after the build. The build record is in `docs/`; demo imagery and its
guard are in `PLACEHOLDERS.md`.

## Brochure QR code

- The contact page's QR code encodes the stable address `/brochure`, which redirects (307) to the current brochure
  PDF. Replace the brochure by saving the new PDF over `public/brochure.pdf` and rebuilding; the QR code does not
  change. `/brochure` must keep working for as long as anything printed carries it.
- **Never print a QR code from a demo build.** A demo build's code encodes the demo deployment's own `/brochure`, so
  a printed copy dies with the demo. Print it only from the live site (`totaldatalimited.com/contact-us`). The page
  carries no demo note (owner, 2026-10-25), so check which site you are on before printing.
