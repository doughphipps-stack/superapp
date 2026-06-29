# Life Track

A personal life management app built with React.

## Features

- **To Do**: Multi-column task management (Daily Habits, Personal, Work tasks)
- **Calendar**: Google Calendar integration
- **Nutrition**: Track meals and macros
- **Fitness**: Log runs, lifts, and weight
- **Reading**: Track books and ratings
- **Comedy**: Store and organize comedy bits

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view in your browser.

### Build for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Deployment

### GitHub Pages

```bash
npm run deploy
```

Your app will be live at: **https://doughphipps-stack.github.io/superapp**

## Data Storage

All data is stored locally in your browser using `localStorage`. Nothing is sent to a server.

## Google Calendar Setup

To use the Calendar feature:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create an OAuth 2.0 Client ID (Web application)
5. Add your app URL to Authorized JavaScript origins
6. Copy the Client ID and paste it in the app

## License

MIT
