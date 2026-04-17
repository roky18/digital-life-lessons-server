# 🌱 Digital Life Lessons (Server Side)

🔗 **Live API Link:** [https://digital-life-lessons-server.vercel.app](https://digital-life-lessons-server.vercel.app)

## 📖 Project Overview

This is the backend server for the **Digital Life Lessons** platform. It provides a secure and scalable API to manage users, life lessons, premium subscriptions via Stripe, and administrative controls. Built with **Node.js**, **Express.js**, and **MongoDB**.

The server ensures that premium content is protected and only accessible to authorized users while managing real-time interactions like likes, comments, and reports.

---

## ✨ Key Features

- 🔐 **Secure API:** Powered by Firebase Admin SDK for server-side authentication.
- 💳 **Stripe Integration:** Handles secure one-time payments for premium access.
- 📂 **CRUD Operations:** Manage lessons, user profiles, and community interactions.
- 👮 **Admin Controls:** Secure routes for managing reported content and user roles.
- 🛡️ **Data Security:** Protected environment variables and CORS configuration.
- 📊 **Analytics Ready:** Endpoints to provide data for the user and admin dashboards.

---

## 🛠️ Technologies Used

### Backend & DB
- Node.js & Express.js
- MongoDB (Database)
- Firebase Admin SDK (Security & Auth)
- Stripe API (Payment Gateway)
- Cors & Dotenv

---

## ⚙️ Server Side Setup (Backend)

Follow these steps to run the server locally:

1. **Clone the Repo:**
   ```bash
   git clone [https://github.com/roky18/digital-life-lessons-server.git](https://github.com/roky18/digital-life-lessons-server.git)
   cd digital-life-lessons-server
```
```
2. Install dependencies:

Bash
```
npm install
```
3. Environment Variables:
Create a .env file in the root directory and add the following keys:

Code snippet
```
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
STRIPE_KEY=your_stripe_secret_key
SITE_DOMAIN=your_site_domain
FB_SERVICE_KEY=your_firebase_service_key_json
```
  4. Run the server:

Bash
```
node index.js
```
👤 Author
MD RAKIBUL ISLAM ROKY

✨ Digital Life Lessons — Preserve wisdom. Learn from life. Grow together.
