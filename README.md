# Rai Gonçalves — Portfolio Website

Personal portfolio website for **Rai Gonçalves**, UX/UI & Graphic Designer based in Zürich, Switzerland.

Live at → **[raigon.design](https://raigon.design)** *(coming soon)*

---

## About

This is the source code for my personal portfolio — built from scratch with plain HTML, CSS and JavaScript. No frameworks, no dependencies, no build tools. Just clean, maintainable code that I own completely.

The site showcases selected work in UX/UI design, brand identity and web design, alongside an about section, notes/blog and contact.

---

## Structure

```
raigonlab/
│
├── index.html          ← Main page (HTML only)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← All scripts
├── images/             ← Project images (not tracked in git)
└── README.md
```

---

## Features

- Fullscreen horizontal scroll gallery with drag support and keyboard navigation
- Responsive — mobile, tablet and desktop
- No frameworks or libraries — pure HTML, CSS and JS
- Google Fonts: Cormorant Garamond + Inter
- Respects `prefers-reduced-motion`
- Semantic HTML and accessible markup

---

## Adding a Project

Open `index.html` and duplicate an `<article class="project-slide ...">` block:

```html
<article class="project-slide p-yourproject">
  <div class="project-bg"></div>
  <div class="project-overlay"></div>
  <div class="project-info">
    <p class="project-category">Category · Type</p>
    <h3 class="project-name">Project Name</h3>
    <p class="project-desc">Short description of the project.</p>
    <div class="project-tags">
      <span class="project-tag">Tag 1</span>
      <span class="project-tag">Tag 2</span>
    </div>
  </div>
</article>
```

Then add a background in `css/style.css`:

```css
.p-yourproject .project-bg {
  background-image: url('../images/yourproject.jpg');
}
```

And update the dot count in `index.html`:

```html
<span class="work-count">06 projects</span> <!-- increment by 1 -->
```

And add one more dot in `#projectsDots`:

```html
<div class="dot"></div>
```

---

## Adding a Blog Post

In `index.html`, find the `#blog` section and duplicate a `.blog-card`:

```html
<div class="blog-card">
  <p class="blog-date">Month Year</p>
  <h3 class="blog-card-title">Your title here</h3>
  <p class="blog-card-text">A short paragraph about the topic.</p>
</div>
```

---

## Customising Colours

All colours are CSS variables defined at the top of `css/style.css`:

```css
:root {
  --bg:    #F5F4F0;  /* background */
  --ink:   #0F0F0E;  /* text / headings */
  --mid:   #7A7774;  /* secondary text */
  --warm:  #B8A898;  /* accent — italic headings, lines */
  --line:  #E0DED9;  /* dividers / borders */
  --white: #FAFAF8;  /* near-white for hover states */
}
```

Change `--warm` to update the accent colour across the whole site.

---

## Deployment

The site is deployed on **GitHub Pages** — no build step required.

To deploy your own fork:

1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, root folder
4. Your site will be live at `https://yourusername.github.io/raigonlab`

To use a custom domain (e.g. `railson.design`):

1. Add a `CNAME` file to the root with your domain:
   ```
   railson.design
   ```
2. Point your domain's DNS to GitHub Pages:
   ```
   A     185.199.108.153
   A     185.199.109.153
   A     185.199.110.153
   A     185.199.111.153
   ```

---

## Roadmap

- [ ] Individual case study pages (inxfitness, Arca_Vault, kerart)
- [ ] Project images added to `/images`
- [ ] Contact form with Formspree
- [ ] Dark mode toggle
- [ ] `railson.design` domain live

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styles | CSS3 (custom properties, grid, flexbox, scroll snap) |
| Scripts | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (Cormorant Garamond, Inter) |
| Hosting | GitHub Pages |
| Domain | `railson.design` *(pending)* |

---

## Contact

**Railson Gonçalves** — UX/UI & Graphic Designer  
📍 Zürich, Switzerland · Permit B  
✉️ create@raigonlab.com  
🌐 [railson.design](https://railson.design)  
💼 [linkedin.com/in/railson-goncalves](https://linkedin.com/in/railson-goncalves)

---

*Built with care in Zürich, 2026.*