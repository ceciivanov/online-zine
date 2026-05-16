# ceci ivanov — photography portfolio

Personal photography portfolio. Plain HTML/CSS, no frameworks, no build tools.

## structure

```
ceci-ivanov-site/
├── index.html        ← the whole site
├── zine/             ← drop your photos here
│   ├── hero.jpg      ← home page photo
│   ├── digital-01.jpg
│   ├── digital-02.jpg
│   └── film-01.jpg
│   └── ...
└── README.md
```

## adding a photo

Replace any placeholder block in index.html:

```html
<!-- before -->
<div class="photo-ph landscape"> ... </div>

<!-- after -->
<div class="photo-wrap">
  <img src="zine/digital-01.jpg" alt="">
</div>
```

## deploy

Hosted on GitHub Pages. Push to main branch, enable Pages in repo settings.
