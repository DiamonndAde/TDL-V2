# Handoff notes — TDL website v2

Operational rules for whoever runs the site after the build. The build record is in `docs/`; demo imagery and its
guard are in `PLACEHOLDERS.md`.

## Brochure QR code

- The contact page's QR code encodes the stable address `/brochure`, which redirects (307) to the current brochure
  PDF. Replace the brochure by saving the new PDF over `public/brochure.pdf` and rebuilding; the QR code does not
  change. `/brochure` must keep working for as long as anything printed carries it.
- Compress a new brochure before committing it (the 20-page version went from 3.0 MB to 1.25 MB, text and fonts
  unchanged): `python -m pip install --target <tmp>/pdflib pymupdf fonttools`, then
  `python scripts/shrink-pdf.py <tmp>/pdflib new.pdf public/brochure.pdf 1.1 55`, and look at a photo page and a
  text page at 100%. The "Download our brochure" buttons read the file's size at build time.
- **Never print a QR code from a demo build.** A demo build's code encodes the demo deployment's own `/brochure`, so
  a printed copy dies with the demo. Print it only from the live site (`totaldatalimited.com/contact-us`). The page
  carries no demo note (owner, 2026-10-25), so check which site you are on before printing.
