# Task Scheduler Web App

A minimalistic task scheduler with calendar, tasks, timer, and notifications. Built with React, TypeScript, Tailwind CSS, and IndexedDB for local persistence.

## Features

- **Calendar View**: Month/week/day views with click-to-add events
- **Tasks Manager**: Create, complete, and delete tasks with local persistence
- **Pomodoro Timer**: Configurable work/break sessions with browser notifications
- **Notifications**: Browser notification support for timer alerts
- **Offline-First**: All data stored locally in IndexedDB
- **PWA Ready**: Progressive Web App with service worker support
- **Minimalistic Design**: Frosted white/clear glass aesthetic

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v7
- **State**: Zustand
- **Storage**: IndexedDB (via idb)
- **Calendar**: FullCalendar
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd web
npm install
```

### Development

```bash
cd web
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
cd web
npm run build
```

The `dist/` folder will contain the production build.

## Deployment

### Option 1: Netlify (Recommended)

1. Push this repo to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Configure build settings:
   - **Base directory**: `web`
   - **Build command**: `npm run build`
   - **Publish directory**: `web/dist`
6. Click "Deploy site"

### Option 2: Vercel

1. Push this repo to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project" and import your repo
4. Configure:
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Option 3: GitHub Pages

```bash
cd web
npm run build
# Copy dist/ contents to your GitHub Pages repo
```

### Option 4: Any Static Host

Build the app and upload the `web/dist/` folder to any static hosting service (Cloudflare Pages, AWS S3, etc.).

## Project Structure

```
task-scheduler/
├── web/                          # React app
│   ├── src/
│   │   ├── pages/               # Route pages
│   │   │   ├── Calendar.tsx     # Calendar view
│   │   │   ├── Tasks.tsx        # Tasks list
│   │   │   └── Timer.tsx        # Pomodoro timer
│   │   ├── data/
│   │   │   └── db.ts            # IndexedDB layer
│   │   ├── lib/
│   │   │   └── notifications.ts # Notification helpers
│   │   ├── App.tsx              # Main app + routing
│   │   ├── store.ts             # Zustand store
│   │   ├── types.ts             # TypeScript types
│   │   └── index.css            # Tailwind + custom styles
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Usage

### Calendar
- Click any day to add an event
- Click an event to delete it
- Switch between month/week/day views

### Tasks
- Type a task title and press Enter or click "Add"
- Check/uncheck to mark complete
- Click "Delete" to remove

### Timer
- Set work and break durations (minutes)
- Click "Start" to begin
- Click "Pause" to pause
- Click "Reset" to reset
- Enable notifications via the bell icon in the header

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Notifications require HTTPS in production (or localhost for development).

## License

MIT

## Author

Built with Cascade AI
