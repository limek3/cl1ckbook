# Igra Sans setup

The project is configured to use Igra Sans everywhere through `app/globals.css` and Tailwind `font-sans`.

Place your local font file here before committing/deploying:

```txt
public/fonts/IgraSans.otf
```

Then commit and push:

```bash
git add app/globals.css public/fonts README_IGRA_SANS.md
git commit -m "use Igra Sans font"
git push origin main
```

After deploy, hard refresh the site.
