# Notion PostIt

An always-on-top desktop PostIt widget that syncs with your Notion Todo database.
Cycle task status with a single click — right from your desktop.

## Features

- **Notion sync** — Real-time integration with Notion Calendar DB (Multi-select tags)
- **View filters** — Today / Week / All
- **One-click status** — Cycle through Todo → Doing → Done (Optimistic Update)
- **Open in Notion** — Click a task title to jump to the Notion page
- **Always on Top** — Toggle pin to keep the widget above other windows
- **Opacity control** — Adjust window transparency via slider
- **Dark / Light mode** — Toggle theme from the title bar
- **System tray** — Minimize to tray, restore with click or global shortcut (`Ctrl+Shift+N`)
- **Auto refresh** — Configurable interval (default: 5 min)
- **i18n** — Korean / English UI
- **Persistent settings** — All preferences saved across restarts

## Getting Started

```bash
git clone https://github.com/YoonseongHeo/notion-postit.git
cd notion-postit
cp .env.example .env    # Enter your token and DB ID
npm install
npm run dev             # Dev mode (Vite + Electron)
```

## Build

```bash
npm run package           # Windows NSIS installer
npm run package:portable  # Portable exe
```

## Notion Setup

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and create an Integration
2. Capabilities: **Read content** + **Update content**
3. Open your Todo DB → `···` → **Connections** → Add your integration
4. Enter the token in `.env` or in the app's Settings panel (⚙)

### Expected DB Properties

| Property | Type | Description |
|----------|------|-------------|
| `Name` | Title | Task title |
| `Tag` | Multi-select | Status tags (`Todo`, `Doing`, `Done 🙌`) + category tags |
| `Date` | Date | Start / end date |
| `긴급` | Checkbox | Urgent flag |

## Project Structure

```
src/
├── main/                  # Electron Main Process
│   ├── main.js            # Entry point, IPC handlers
│   ├── notion-client.js   # Notion API wrapper (query, update, retry)
│   ├── preload.js         # contextBridge (window.api)
│   ├── store.js           # electron-store (settings, cache, bounds)
│   └── tray.js            # System tray menu
├── renderer/              # React UI (Vite)
│   ├── App.jsx            # Main app component
│   ├── components/        # TitleBar, TaskRow, Toast, Settings
│   ├── hooks/useNotion.js # Data fetch/update hook (optimistic update)
│   └── lib/date-utils.js  # Date helpers
└── shared/
    ├── constants.js       # IPC channels, status tags, defaults
    └── i18n.js            # ko/en translations
```

## License

[MIT](LICENSE)
