
# 🌊 Pollflow Realtime

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black?style=for-the-badge&logo=socket.io)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa)

**Pollflow** is a next-generation polling platform that delivers **instant, real-time feedback** without the friction of sign-ups. Designed for speed, engagement, and accessibility, it transforms how audiences interact during events, meetings, and streams.

🌐 **Live Demo:** [pollflow.vercel.app](https://pollflow.vercel.app) (Replace with actual link if deployed)

---

## ⚡ Key Features

- **🚀 Instant & Anonymous**: No login required. Uses advanced browser fingerprinting for secure, unique voting.
- **⚡ Real-Time Updates**: Watch vote bars grow and rankings change instantly across all devices using **Socket.io**.
- **📱 PWA & Mobile First**: Installable on iOS/Android. Optimized touch targets, haptic feedback, and offline support.
- **🎨 Premium UX**:
  - **Confetti Celebrations** 🎉 on every vote.
  - **Smart Suggestions** 🪄 that auto-complete common poll options.
  - **Dynamic Visuals** shaped by `framer-motion` and smooth transitions.
- **🕵️‍♀️ Live Presence**: See exactly how many people are viewing the poll right now.
- **📊 Analytics Dashboard**: Track views, votes, and conversion rates with beautiful charts.
- **📅 Smart Scheduling**: Schedule polls to open in the future or auto-expire at a set time.
- **🔗 Universal Sharing**: QR Codes, social links, and a dedicated **Presentation Mode** for big screens.

---

## 🏗️ System Architecture

Pollflow utilizes a hybrid architecture combining **Supabase** for persistent storage and **Socket.io** for ephemeral real-time events, hosted on a custom Next.js server.

<img width="2411" height="2203" alt="system-arch" src="https://github.com/user-attachments/assets/8e4aa8ec-f356-4aaf-b0c9-22185388921e" />


---

## 🔄 User Workflow: The Voting Journey

<img width="5025" height="2011" alt="user-workflow" src="https://github.com/user-attachments/assets/b437fd05-9334-45b9-81dc-fce02569cbf5" />


---


<img width="1453" height="1139" alt="workflow-arch" src="https://github.com/user-attachments/assets/f8bec892-56ff-4c6f-ac1d-31fe178cc722" />


## 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Next.js 15 (App Router) | React Server Components, SSR, and SEO optimization. |
| **Styling** | Tailwind CSS + Shadcn UI | Rapid UI development with accessible, beautiful components. |
| **Animations** | Framer Motion | Complex layout animations and micro-interactions. |
| **Real-time** | Socket.io | Bi-directional communication for live updates. |
| **Database** | Supabase (PostgreSQL) | Reliable relational data storage. |
| **Security** | FingerprintJS | Client-side device identification for abuse prevention. |
| **PWA** | Custom Service Worker | Offline capabilities and "Add to Home Screen". |

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Anubhab-Rakshit/pollflow.git
    cd pollflow/
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in browser:**
    Navigate to `http://localhost:3000`.

---

## 📱 Mobile Experience

Pollflow is designed to feel native on your phone.
- **No Zoom**: Inputs are sized perfectly to prevent iOS auto-zoom.
- **Haptics**: Subtle vibrations when you interact (supported devices).
- **Offline**: View loaded polls even without an internet connection.

---

## ☁️ Deployment

Pollflow is optimized for **Vercel**.

### Vercel Configuration
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install`

### Environment Variables
Ensure you add these to your Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (e.g., `https://your-project.vercel.app`)

Since we use **Supabase Realtime**, no separate WebSocket server is needed. Everything works serverless! 🚀

---

> Built with ❤️ by [Your Name/Team] for [Hackathon/Project Name]
