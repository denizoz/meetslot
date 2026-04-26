# MeetSlot 📅

> Find when everyone's free — effortlessly.

A self-hosted, free alternative to Doodle/When2meet. Organizers pick possible
dates, share a link, friends vote on their availability, and the best slot is
auto-detected.

---

## Free Deployment (15 minutes)

### What you need
| Service | What for | Free tier |
|---|---|---|
| [GitHub](https://github.com) | Host code | Always free |
| [Vercel](https://vercel.com) | Hosting + API | Always free |
| [Upstash](https://upstash.com) | Redis storage | 10k req/day, 256 MB |

---

### Step 1 — Get the code on GitHub

1. Create a new repository on github.com (click **+** → **New repository**)
2. Upload the contents of this zip (or push via git):
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR_USERNAME/meetslot.git
   git push -u origin main
   ```

---

### Step 2 — Create an Upstash Redis database

1. Go to [console.upstash.com](https://console.upstash.com) and sign up (free)
2. Click **Create Database**
   - Name: `meetslot`
   - Region: pick the one closest to your users
   - Type: **Regional** (free)
3. Click the database → scroll to **REST API** section
4. Copy the **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**

---

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free, use GitHub login)
2. Click **Add New → Project** → import your GitHub repo
3. Before deploying, click **Environment Variables** and add:
   ```
   UPSTASH_REDIS_REST_URL     = https://your-endpoint.upstash.io
   UPSTASH_REDIS_REST_TOKEN   = your_token_here
   ```
4. Click **Deploy** — done! Vercel gives you a URL like `meetslot.vercel.app`

---

### Local development

```bash
npm install
cp .env.local.example .env.local   # fill in your Upstash credentials
npm run dev                         # → http://localhost:3000
```

---

## How it works

1. **Organizer** creates a meeting → picks dates + time slots → gets a shareable link
2. **Friends** open the link → enter their name → click available slots → submit
3. **Results** show a heatmap — darker = more people free — and highlight the best slot

Meeting data is stored in Upstash Redis with a 30-day TTL (auto-deleted after a month).

---

## Free tier limits

- **Vercel free**: 100 GB/month bandwidth, unlimited deploys, serverless functions included
- **Upstash free**: 10,000 Redis commands/day, 256 MB storage
  - Each meeting view = ~2 commands, each vote = ~2 commands
  - Plenty for hundreds of meetings per day

---

## Customisation ideas

- Add email notifications when someone responds (use Resend.com — free tier)
- Add a "Confirm meeting" button that locks the result
- Add time zone support per participant
- Restrict voting to a password so random people can't vote

---

MIT License
