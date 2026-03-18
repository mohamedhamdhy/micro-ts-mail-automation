# MAILSYS_v0.1 — Automated Job Application Email System

> **Bulk email automation with resume attachment, Redis job queue, real-time JARVIS dashboard, and persistent history.**
![MAILSYS Dashboard](assets/MAILSYS.png)
```

---

```
MAILSYS v0.1 INITIALIZING...
LOADING SMTP RELAY MODULE... OK
CONNECTING TO REDIS QUEUE... OK
CHECKING RESUME PAYLOAD... ARMED
ALL SYSTEMS NOMINAL. WELCOME, HAMDHY.
```

---

## Overview

MAILSYS is a local Node.js tool that automates sending job application emails in bulk. Upload a CSV of recruiter emails, and the system queues and sends each email with your resume attached — all tracked through a live JARVIS-style dashboard.

---

## Features

- **Bulk email via CSV** — upload a list of recipients, names, and companies
- **Auto resume attachment** — PDF attached to every email automatically
- **Redis + BullMQ job queue** — emails processed reliably with retry logic
- **Real-time dashboard** — live feed of sent/failed emails via Socket.IO
- **Persistent history** — sent, failed, and queue logs survive page refresh via localStorage
- **JARVIS UI** — `#00ffff` cyan hacking aesthetic with boot sequence, scanlines, and radar pulse
- **Auto browser reload** — file watcher on `public/` restarts browser on save during dev

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Server | Express.js |
| Email | Nodemailer (Gmail SMTP) |
| Queue | BullMQ + IORedis |
| Real-time | Socket.IO |
| CSV parsing | csv-parser |
| File upload | Multer |
| Dev watcher | Chokidar |
| UI | Vanilla HTML/CSS/JS |

---

## Project Structure

```
mailsys/
├── src/
│   ├── server.ts          # Express server, CSV upload, Socket.IO
│   ├── queue.ts           # BullMQ queue + worker
│   ├── emailService.ts    # Nodemailer transporter
│   └── index.ts           # Entry point
├── utils/
│   └── validator.ts       # Email validation helper
├── public/
│   ├── index.html         # JARVIS dashboard UI
│   └── style.css          # Hacking aesthetic styles
├── uploads/
│   └── Mohamed-Al-Hamdhy-Full-Stack-Developer-Resume.pdf
├── data/                  # Temp folder — CSVs deleted after parsing
├── watch.ts               # Dev auto-reload watcher (port 3001)
├── .env                   # Credentials (never commit)
├── package.json
└── tsconfig.json
```

---

## Prerequisites

- Node.js v18+
- Redis running locally (`127.0.0.1:6379`)
- Gmail account with an **App Password** (not your login password)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/mailsys.git
cd mailsys
npm install
```

### 2. Configure `.env`

```env
PORT=3000

EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

### 3. Place your resume

```
uploads/Mohamed-Al-Hamdhy-Full-Stack-Developer-Resume.pdf
```

The filename is hardcoded. Rename your PDF to match exactly, or update `RESUME_PATH` in `src/server.ts`.

### 4. Prepare your CSV

```csv
email,name,company
recruiter@google.com,Sarah,Google
hr@startup.io,James,StartupXYZ
hiring@techcorp.com,,TechCorp
```

- `email` — required
- `name` — optional (used in greeting)
- `company` — optional (used in email body)

---

## Running

### Development (with auto-reload)

```bash
npm run dev
```

Starts two processes:
- `[0]` Mail server on `http://localhost:3000`
- `[1]` File watcher on `ws://localhost:3001` — browser reloads on any `public/` change

### Production

```bash
npm start
```

---

## Usage

1. Open `http://localhost:3000`
2. Watch the boot sequence initialize
3. Upload your CSV using the drop zone
4. Click **▶ INITIATE TRANSMISSION**
5. Monitor the live feed — emails queue and send in real time

### Dashboard tabs

| Tab | Description |
|---|---|
| LIVE FEED | Real-time stream of all activity |
| SENT LOG | Persistent history of all delivered emails |
| FAILED LOG | Persistent history of all failures with error |
| QUEUE LOG | Persistent history of all CSV batch uploads |

History is stored in `localStorage` — it persists across sessions and page refreshes. Use the **WIPE** button on each tab to clear individual logs.

---

## How It Works

```
CSV Upload
    ↓
Express /upload-csv
    ↓
BullMQ emailQueue.add()  ×N jobs
    ↓
BullMQ Worker (3 attempts, exponential backoff)
    ↓
Nodemailer → Gmail SMTP
    ↓
Socket.IO → Dashboard (email-sent / email-failed)
    ↓
localStorage history
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASS` | Gmail App Password |
| `REDIS_HOST` | Redis host (default: 127.0.0.1) |
| `REDIS_PORT` | Redis port (default: 6379) |

---

## Scripts

```bash
npm run dev    # Start server + file watcher (development)
npm start      # Start server only (production)
```

---

## .gitignore

```
node_modules/
dist/
data/
uploads/
.env
```

> Never commit your `.env` or `uploads/` folder — both contain sensitive credentials and personal files.

---

## Notes

- Emails are sent from your Gmail account. Make sure "Less secure app access" is **off** and you are using an **App Password**.
- Redis must be running before starting the server. On Windows use [Memurai](https://www.memurai.com/) or WSL with Redis installed.
- The dev auto-reload script watches `public/` only. Changes to `src/` trigger `ts-node-dev` restart automatically.

---

## Author

**Mohamed Al Hamdhy** — Full Stack Developer

---
