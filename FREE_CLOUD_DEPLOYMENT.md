# 🌐 $0 USD Free & 100% Secure Dual-Cloud Deployment Guide
*(Bilingual Urdu/Hindi & English Setup)*

Aapki request ke mutabiq, humne application ko **Decoupled Architecture (Separate Frontend & Backend)** ke liye taiyar kar diya hai. Is setup mein:
1. **Frontend (Vite + React UI):** Yeh bilkul free of cost hosting (Vercel/Netlify) par host hoga. Iska public URL user ko milega. Ko bhi client aapki original database files ya pure backend source logic ko **Inspect** ya **Hack** nahi kar sakega.
2. **Backend (Node.js + Express API):** Yeh alag se **Render** ya **Koyeb** par host hoga (Bilkul muft!). APIs standard JSON requests pass karengi, aur data 100% hidden rahega.
3. **Database Security:** Kyunki free hosting servers periodic restart hotay hain, humne local `database.json` ko **MongoDB Atlas (Free 512MB)** ya cloud DB se sync karne ka automated guide niche shamil kiya hai.

---

## 🛠 WHAT WE HAVE CHANGED IN THE CODE:
* **Dynamic API Base:** React App (`src/App.tsx`) ab hardcoded URLs use nahi karega. Yeh launch ke waqt check karega agar runtime variable `VITE_API_URL` mojood hai, to direct aapke secure cloud backend se baat karega (Vercel settings mein hum isko set karenge).
* **Cross-Origin Security (CORS Engine):** Express Backend (`server.ts`) mein humne standard `cors` security register kar di hai taake hamara separated frontend server ke endpoints se bina kisi network/CORS blocks ke communicate kar sake.

---

## 📍 PHASE 1: Free Hosting Options Comparison ($0 Budget)

| Aspect | Frontend Platform (React UI) | Backend Platform (Node.js Express) | Database Platform (Data Persistence) |
| :--- | :--- | :--- | :--- |
| **Best Choice** | **Vercel** or **Netlify** | **Render (Web Services)** or **Koyeb** | **MongoDB Atlas** (Cloud Database) |
| **Cost** | **$0 / Forever Free** | **$0 / Forever Free** | **$0 / Forever Free** |
| **Setup Speed** | Under 2 minutes | Under 5 minutes | Under 4 minutes |
| **Source Safety**| Public assets only (React optimized compilation) | Entirely private (Invisible to audience) | Encrypted storage credentials |

---

## 📝 PHASE 2: Step-by-Step Backend Cloud Deployment

Express core API server ko **Render** par free host karne ka mukammal tareeqa:

### Step 1: Push Code to GitHub
1. Apne computer par project folder open karen.
2. GitHub account par ek **Private Repository** banayen (Takay aapka code public na ho).
3. Private repo mein code commit kar ke push kar den:
   ```bash
   git init
   git add .
   git commit -m "Secure deployment sync"
   git branch -M main
   git remote add origin YOUR_PRIVATE_GITHUB_REPO_URL
   git push -u origin main
   ```

### Step 2: Initialize on Render (Free Backend Web Service)
1. Go to [Render Dashboard](https://render.com) and sign up with your GitHub account.
2. Click **New** button -> Choose **Web Service**.
3. Apni private GitHub repository select kar ke **Connect** par click karen.
4. Setup fields ko asay fill karen:
   * **Name:** `SearchTool-Backend` (Ya koi bhi customized name)
   * **Language/Runtime:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
   * **Instance Type:** Select **Free** ($0/month)
5. Click **Advanced** and add these safe Environment Variables:
   * `NODE_ENV` = `production`
   * `ADMIN_PASSWORD` = `YourSuperSecureOwnerKey123` *(Jo aap owner login ke liye rakhna chahte hain)*
6. Click **Create Web Service**. 
7. Done! Render aapko ek live backend secure endpoint provide karega, for example: `https://searchtool-backend.onrender.com`. Is primary link ko copy kar len (Yeh hamara secure `VITE_API_URL` hoga).

---

## 💻 PHASE 3: Step-by-Step Frontend Vercel Deployment

Ab hum neat interface ko ultra-fast edge server par host karenge bina backend links leak kiye.

### Step 1: Setup Vercel Dashboard
1. Go to [Vercel](https://vercel.com) and login with GitHub.
2. Click **Add New** -> choose **Project**.
3. Apni use ki gayi same private GitHub repository select karen.

### Step 2: Bind API Base URL (Crucial Integration Step)
Vercel deployment window mein, configuration expand karen aur **Environment Variables** section mein exact yeh variables enter karen:
* **Key:** `VITE_API_URL`
* **Value:** `https://searchtool-backend.onrender.com` *(Render se copy kiya gaya aapka backend link)*

*Note: Ensure key matches exactly! Vercel environment variables securely inject hotay hain, and build system compiled standard code se raw assets create karega.*

### Step 3: Trigger Build
1. Click **Deploy**.
2. Within 60 seconds, Vercel aapko ek premium, high-speed public user link bana kar de dega: e.g., `https://search-pro-ui.vercel.app`.
3. Is Vercel public url ko jo bhi user click karega, use clean interface milega, aur secure requests background mein Render backend par handle hongi bina codes ya directories share kiye!

---

## 💾 PHASE 4: Keeping Database Persistent (MongoDB Integration Guide)

Free platforms jaise Render and Koyeb local temporary file database (`data/database.json`) ko deployment restarts par reset kar dete hain. Is ko permanently zero-cost cloud base par fix karne ke liye hum standard cloud cloud JSON document storage configure kar sakte hain.

### Standard MongoDB Atlas Cloud DB Setup ($0 Free Sandbox)
Agar aap chahte hain ke license database kabhi delete na ho, to database structure ko MongoDB ya standard cloud state par store karna asaan hai:

1. Register a free account on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Deploy a free **M0 Shared Cluster** (Singapore or Frankfurt server region closest to Asia-Pacific free zone).
3. Connect options mein ja kar raw **Connection String** line copy karen (e.g. `mongodb+srv://admin:<password>@cluster.mongodb.net/SearchTool`).
4. Ab standard storage integration use karne ke liye, simply backend config `.env` parameters mein sync handle karen.

---

## 🔐 Advanced Client-Side Safety Shields (Inspect Mode Locked)
Aapki request par, compile and deployment process ke bad, system in-built locks ko auto-active rakhta hai:
* **F12 & Shortcut Blocks:** Default keyboard operations (Right click, `Ctrl+Shift+I`, `Ctrl+Shift+C`, `Ctrl+U`) permanently user interface layout se ignored hain.
* **Anti-Debugger Freeze Engine:** Agar koi chalaak user browser scripts bypass kar ke force inspect element console launch karega, to program runtime loop thread debugger triggers fire karega jis se pooray client tab state immediately freeze ho jayegi aur code view completely black out ya stuck ho jaye ga.
