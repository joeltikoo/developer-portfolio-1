# Portfolio OS

An interactive personal portfolio built as a desktop-style operating system interface using plain HTML, CSS, and JavaScript.

The site presents portfolio content inside movable app windows such as Intro, About, Projects, Skills, and Contact. On desktop screens it behaves like a lightweight window manager, while on smaller screens it adapts into a more mobile-friendly experience.

Live Demo: ![https://joelt.vercel.app](https://joelt.vercel.app)

## Features

- Desktop-inspired portfolio UI with custom SVG icons
- Draggable windows in desktop mode
- Bottom-right resize handle on windows in desktop mode
- Window controls for minimize, maximize, and close
- Toggleable tiling layout for open windows
- Responsive device modes for desktop, tablet, and mobile
- Project cards that open GitHub repositories in a new tab
- Wallpaper styling with a Pusheen image and layered background effects

## Sections

- Intro
- About
- Projects
- Skills
- Contact

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript

## Project Structure

```text
Portfolio/
|-- assets/
|-- index.html
|-- styles.css
|-- script.js
`-- README.md
```

## How To Run

This project does not require a build step or package installation.

1. Clone or download the repository.
2. Open `index.html` directly in a browser.

For a smoother local development workflow, use a simple static server such as VS Code Live Server.

## Window Behavior

### Desktop mode

- Windows can be opened from desktop icons, the start menu, taskbar buttons, and launcher buttons.
- Windows can be dragged by the title bar.
- Windows can be resized from the bottom-right handle.
- Tiling mode arranges visible windows automatically.

### Tablet and mobile modes

- The layout switches automatically based on screen size and aspect ratio.
- Tiling is disabled.
- The interface becomes more compact and app-like.

## Projects Included

- GitHub Data Analysis
- Habitarium
- News Oversimplifier CLI Tool

Each project tile links to its source repository on GitHub.

## Customization

You can personalize the site by editing the following:

- `index.html` for content, section text, and project links
- `styles.css` for colors, layout, responsive behavior, and window styling
- `script.js` for window management, tiling, dragging, maximizing, and device mode behavior
- `assets/` for images such as the wallpaper cat

## Notes

- This is a static front-end project with no backend.
- Google Fonts is used for typography.
- The interface is designed to feel playful and desktop-native rather than like a conventional portfolio landing page.

## Future Improvements

- Add keyboard shortcuts for window actions
- Add more project metadata such as live demos and tech details
- Improve window resizing to support all edges cleanly
- Add theme presets or wallpapers

## License

This project is for personal portfolio use.
