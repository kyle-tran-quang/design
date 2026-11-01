# Designed by Kyle — Local Development & Runner Guide

This directory contains the production-ready static export of the portfolio website **Designed by Kyle** (originally on `kyletran.framer.website`). It is designed to be fully self-hosted, badge-free, and deployable to any static hosting provider (e.g., GitHub Pages, Vercel, Netlify) with zero external runtime dependencies.

---

## 🚀 How to Run & Test Locally

To experience the interactive horizontal scrolling, physics-based canvas animations, and the newly added custom glassmorphic navigation hover dropdown, you can serve the directory using a static web server.

### Option A: Using `npx` (No Setup Required)
From the root of this repository, simply run:
```bash
npx serve output/kyletran
```
Or, if you are already inside this directory (`output/kyletran`), run:
```bash
npx serve .
```
This spins up a local server and prints a local URL (e.g., `http://localhost:3000`).

### Option B: Using Built-In Scripts
If you prefer using `npm` commands, navigate into this directory and start the server:
```bash
cd output/kyletran
npm run start
```

---

## 🛠 Features & Systems Guide

### 1. Custom Hover Dropdown (The Back/Nav Button)
On any case study (work) page, hovering over the circular rotating icon opens an elegant, glassmorphic dropdown list of all project pages.
* **Figma Spec Mapping:** Built from Figma Node `#530:14895`.
* **Design & Feel:** Uses background blur (`backdrop-filter: blur(12px)`), standard text color (`#ADA9A3`), and primary orange brand highlights (`#FA680C`) on background-color fills (`#D0D0D0`).
* **Active State:** Automatically highlights your current location on the list.

### 2. Scroll Models
* **Homepage (`index.html`):** Full-height native **horizontal scroll** (`>= 1200px`) using trackpad horizontal swipe, mouse wheel translation, and keyboard directional arrows. 
* **Case Study Pages (`work/*.html`):** Standard **vertical scrolling** document layouts.

---

## 📦 Asset Architecture
This project is 100% independent of Framer's CDN:
* **Assets Location:** All assets (scripts, CSS, fonts, and images) live locally inside `/assets`.
* **CDNs Removed:** No third-party network requests are made, guaranteeing lightning-fast load times and infinite uptime.
* **Badge-Free:** All Framer branding blocks and elements have been removed.

---

## 📊 Verification Commands

To check the file syntax, run this command from the root directory:
```bash
node -c output/kyletran/assets/js/toplevel-deps.js
```
A clean, silent output verifies that there are zero parse-time syntax errors.

To update the local architectural maps and indices, run:
```bash
graphify update output/kyletran
```
