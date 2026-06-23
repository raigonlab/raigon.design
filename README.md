# Rai Gonçalves — Portfolio Website

Personal portfolio website for **Rai Gonçalves**, UX/UI & Graphic Designer based in Zürich, Switzerland.

Live at → **[raigon.design](https://raigonlab.github.io/raigon.design/)** *(coming soon)*

---

## About

This is the source code for my personal portfolio — built from scratch with plain HTML, CSS and JavaScript. No frameworks, no dependencies, no build tools. Just clean, maintainable code that I own completely.

Mobile-first by design: the site is a full-screen, scroll-snapped experience with four sections — **Home, Work, About and Contact** — each its own rounded card floating over a light canvas, navigated through a fixed glassmorphism bottom bar.

---

## Structure

```
raigon.design/
│
├── index.html              ← Main page (HTML only)
├── assets/
│   ├── style.css           ← All styles
│   ├── js/
│   │   └── script.js       ← All scripts
│   └── images/             ← Project images (not tracked in git yet)
└── README.md
```

---

## Sections

- **Home** — vertical scroll-snap slide track with 3 full-screen slides (intro, positioning, name).
- **Work** — each project is a card with vertical scroll-snap between projects and horizontal scroll-snap inside a project (cover → details → extra panel). Only the first 2 projects show by default; the rest unlock behind a **"See more projects"** trigger. A bottom-right dot indicator hints horizontal content, and a bouncing down-arrow hints the next project.
- **About** — bio, CV download and a single-column "Tools & Skills" list, plus a link to the full LinkedIn profile.
- **Contact** — email, LinkedIn and phone, each as a full-width link row.

---

## Navigation

A single fixed bottom bar (`.main-nav`) handles navigation on every section:

- A **Home** button (`.nav-home`) is always present.
- A **toggle button** (`.nav-toggle`) expands the bar to reveal **Work / About / Contact** links plus a close icon.
- The menu stays open after a link is clicked — it only collapses when the toggle is pressed again.

Scrolling between sections (and between slides/projects inside Home and Work) uses CSS `scroll-snap-type: y mandatory`. A small JS helper in `assets/js/script.js` hands the scroll off to the next/previous section once an inner track (Home or Work) hits its edge, so the page never gets stuck mid-section.

---

## Features

- Full-screen scroll-snap experience, no half-visible cards
- Nested vertical + horizontal scroll-snap inside Work, with manual scroll chaining via JS
- Fixed glassmorphism bottom nav with animated menu/close icon
- Collapsible "see more" project list (progressive disclosure, no extra page/route)
- Responsive, mobile-first — desktop breakpoints to be added later
- No frameworks or libraries — pure HTML, CSS and JS
- Google Fonts: Cormorant Garamond + Inter
- Respects `prefers-reduced-motion`
- Semantic HTML and accessible markup (`aria-expanded`, `aria-controls`, `aria-hidden`)

---

## Adding a Project

Open `index.html` and duplicate a `<article class="work-project ...">` block inside `#workTrack` (or inside `#workHidden` if it shouldn't show by default):

```html
<article class="work-project p-yourproject" id="project-yourproject">
  <div class="work-project-main">
    <div class="project-bg"></div>
    <div class="project-overlay"></div>
    <div class="project-info">
      <p class="project-category">Category · Type</p>
      <h3 class="project-name">Project Name</h3>
    </div>
    <span class="work-project-down" aria-hidden="true">⌄</span>
    <div class="work-project-dots" aria-hidden="true">
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="work-project-arrow">›</span>
    </div>
  </div>
  <div class="work-project-details">
    <p class="project-desc">Short description of the project.</p>
    <div class="project-tags">
      <span class="project-tag">Tag 1</span>
      <span class="project-tag">Tag 2</span>
    </div>
  </div>
  <div class="work-project-extra"></div>
</article>
```

Then give it a cover image in `assets/style.css`:

```css
.p-yourproject .project-bg {
  background-image: url('images/yourproject.jpg');
}
```

---

## Customising Colours

All colours are CSS variables defined at the top of `assets/style.css`:

```css
:root {
  --bg:     #EEF1F4;  /* page canvas behind the cards */
  --card:   #FAFBFC;  /* card surface (Home/Work/About/Contact) */
  --ink:    #14171A;  /* text / headings */
  --mid:    #767C82;  /* secondary text */
  --warm:   #B8A898;  /* accent — italic headings */
  --line:   #E2E6EA;  /* dividers / borders */
  --white:  #FFFFFF;
  --nav-h:  64px;      /* bottom nav height */
  --page-m: 0.75rem;   /* gap between cards and screen edge */
  --radius: 28px;      /* card corner radius */
}
```

Note: the Work card and its panels currently use flat placeholder colours (set directly in `assets/style.css`, marked `/* TEMP */`) standing in for real project imagery — replace them once final visuals are ready.

---

## Deployment

The site is deployed on **GitHub Pages** — no build step required.

To deploy your own fork:

1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, root folder
4. Your site will be live at `https://yourusername.github.io/raigon.design`

To use a custom domain (e.g. `raigon.design`):

1. Add a `CNAME` file to the root with your domain:
   ```
   raigon.design
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

- [ ] Real project imagery replacing the placeholder colours in Work
- [ ] Animated dot indicator that tracks horizontal scroll position per project
- [ ] Desktop breakpoints (site is currently mobile-first only)
- [ ] Home slide content/imagery for slides 2 and 3
- [ ] Contact form
- [ ] `raigon.design` domain live

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styles | CSS3 (custom properties, flexbox, scroll snap) |
| Scripts | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (Cormorant Garamond, Inter) |
| Hosting | GitHub Pages |
| Domain | `raigon.design` *(pending)* |

---

## Contact

**Rai Gonçalves** — UX/UI & Graphic Designer
📍 Zürich, Switzerland
✉️ create@raigonlab.com
🌐 [raigon.design](https://raigon.design)
💼 [linkedin.com/in/railson-goncalves](https://linkedin.com/in/railson-goncalves)

---

*Built with care in Zürich, 2026.*
