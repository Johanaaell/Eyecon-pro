import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as XLSX from 'xlsx';
import fs from "fs";
import cors from "cors";

interface LicenseKey {
  key: string;
  plan: '15days' | 'monthly' | 'quarterly' | 'sixmonth' | 'yearly';
  user: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'blocked';
  uses: number;
  activeClientId?: string;
}

const DB_PATH = path.join(process.cwd(), "data", "database.json");

// Ensure data folder and database.json file exist
function initializeDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      adminPassword: process.env.ADMIN_PASSWORD || "admin123",
      keys: []
    }, null, 2));
  }
}

function readDB() {
  initializeDB();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { adminPassword: "admin123", keys: [] };
  }
}

function writeDB(data: any) {
  initializeDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function validateLicense(licenseKey: string | undefined, clientId?: string): { valid: boolean; message: string; keyDetails?: LicenseKey } {
  if (!licenseKey) {
    return { valid: false, message: "License activation key is missing." };
  }
  const db = readDB();
  const found = db.keys.find((k: LicenseKey) => k.key === licenseKey.trim().toUpperCase());
  if (!found) {
    return { valid: false, message: "License key is invalid. Please double check characters." };
  }
  if (found.status === 'blocked') {
    return { valid: false, message: "This license key has been suspended. Contact the administrator." };
  }
  const now = new Date();
  if (new Date(found.expiresAt) < now) {
    return { valid: false, message: `Your license has expired on ${new Date(found.expiresAt).toLocaleDateString()}. Please renew subscription.` };
  }

  // Bind to single clientId (Device Lock) to prevent sharing
  if (clientId) {
    if (!found.activeClientId) {
      found.activeClientId = clientId;
    } else if (found.activeClientId !== clientId) {
      return { 
        valid: false, 
        message: "This license key is restricted and already bound/active on another device/browser. Simultaneous use is blocked." 
      };
    }
  }
  
  // Track system usage incrementally
  found.uses = (found.uses || 0) + 1;
  writeDB(db);

  return { valid: true, message: "License is active and validated.", keyDetails: found };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow cross-origin requests for detached frontend/backend hosting
  app.use(cors());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API: Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API: Verify License Status
  app.post("/api/verify-license", (req, res) => {
    const { licenseKey, clientId } = req.body;
    const resVal = validateLicense(licenseKey, clientId);
    if (resVal.valid) {
      return res.json({ 
        valid: true, 
        message: resVal.message, 
        details: {
          key: resVal.keyDetails?.key,
          plan: resVal.keyDetails?.plan,
          user: resVal.keyDetails?.user,
          createdAt: resVal.keyDetails?.createdAt,
          expiresAt: resVal.keyDetails?.expiresAt,
          status: resVal.keyDetails?.status,
          uses: resVal.keyDetails?.uses,
          activeClientId: resVal.keyDetails?.activeClientId
        }
      });
    } else {
      return res.json({ valid: false, message: resVal.message });
    }
  });

  // API: Admin Authentication
  app.post("/api/admin/auth", (req, res) => {
    const { password } = req.body;
    const db = readDB();
    if (password === db.adminPassword) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Incorrect admin password" });
    }
  });

  // API: Admin Update Password
  app.post("/api/admin/update-password", (req, res) => {
    const { password, newPassword } = req.body;
    const db = readDB();
    if (password !== db.adminPassword) {
      return res.status(401).json({ success: false, message: "Incorrect current admin password" });
    }
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: "New password must be at least 4 characters long" });
    }
    db.adminPassword = newPassword;
    writeDB(db);
    return res.json({ success: true, message: "Admin password updated successfully" });
  });

  // API: Admin List Keys
  app.post("/api/admin/keys/list", (req, res) => {
    const { password } = req.body;
    const db = readDB();
    if (password !== db.adminPassword) {
      return res.status(401).json({ success: false, message: "Unauthorized password verification failed" });
    }
    return res.json({ success: true, keys: db.keys });
  });

  // API: Admin Create Keys
  app.post("/api/admin/keys/create", (req, res) => {
    const { password, plan, user } = req.body;
    const db = readDB();
    if (password !== db.adminPassword) {
      return res.status(401).json({ success: false, message: "Unauthorized password verification failed" });
    }

    if (!plan || !user) {
      return res.status(400).json({ success: false, message: "Plan and user details are required" });
    }

    // Days calculate
    let days = 15;
    let codePlan = "15D";
    if (plan === "monthly") { days = 30; codePlan = "1M"; }
    else if (plan === "quarterly") { days = 90; codePlan = "3M"; }
    else if (plan === "sixmonth") { days = 180; codePlan = "6M"; }
    else if (plan === "yearly") { days = 365; codePlan = "1Y"; }

    const randHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    const key = `EYE-${codePlan}-${randHex()}-${randHex()}`;

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + days);

    const newKey = {
      key,
      plan,
      user,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active' as const,
      uses: 0
    };

    db.keys.push(newKey);
    writeDB(db);

    return res.json({ success: true, key: newKey });
  });

  // API: Admin Key status/delete control
  app.post("/api/admin/keys/control", (req, res) => {
    const { password, key, action } = req.body;
    const db = readDB();
    if (password !== db.adminPassword) {
      return res.status(401).json({ success: false, message: "Unauthorized password verification failed" });
    }

    const index = db.keys.findIndex((k: any) => k.key === key);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "License key not found" });
    }

    if (action === "block") {
      db.keys[index].status = "blocked";
    } else if (action === "unblock") {
      db.keys[index].status = "active";
    } else if (action === "delete") {
      db.keys.splice(index, 1);
    } else if (action === "reset_device") {
      db.keys[index].activeClientId = undefined;
    } else {
      return res.status(400).json({ success: false, message: "Invalid control action specified" });
    }

    writeDB(db);
    return res.json({ success: true, message: `Key updated with action ${action}` });
  });

  // API: Lookup single phone number
  app.post("/api/lookup", async (req, res) => {
    const { number, licenseKey, clientId } = req.body;
    const reqKey = licenseKey || req.headers["x-license-key"];
    const reqClientId = clientId || req.headers["x-client-id"];
    
    const validation = validateLicense(reqKey, reqClientId as string);
    if (!validation.valid) {
      return res.status(401).json({ error: "Unauthorized access", message: validation.message });
    }

    if (!number) {
      return res.status(400).json({ error: "Number is required" });
    }
    try {
      const name = await getEyeconData(number);
      return res.json({ number, name });
    } catch (err: any) {
      console.error("Lookup error:", err);
      return res.status(500).json({ number, name: "Error", error: err.message || "Failed" });
    }
  });

  // API: Eyecon search logic
  const HEADERS = {
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    'e-auth': "a25a051f-19c9-4d4e-b28a-ee7514093d3e",
    'e-auth-k': "PgdtSBeR0MumR7fO",
    'e-auth-v': "e1",
    'e-auth-c': "40",
    'Accept': "application/json",
  };

  async function getEyeconData(number: string): Promise<string> {
    const cleanNumber = number.replace(/\+/g, '').replace(/\s+/g, '').trim();
    const url = `https://api.eyecon-app.com/app/getnames.jsp?cli=${encodeURIComponent(cleanNumber)}&lang=en&is_callerid=true&is_ic=true&cv=vc_542_vn_4.0.542_a&requestApi=URLconnection&source=MenifaFragment`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: HEADERS,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.status === 200) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data) && data.length > 0 && data[0].name) {
            return data[0].name;
          }
        } catch {
          // JSON parsing failure, fallback to Not Found
        }
        return 'Not Found';
      }
      return `Error ${response.status}`;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return 'Timeout';
      }
      return 'Timeout/Error';
    }
  }

  // API: process batch numbers with SSE-like chunked response
  app.post('/api/process', async (req, res) => {
    const numbersInput = req.body.numbers;
    let numbers: string[] = [];
    if (Array.isArray(numbersInput)) {
      numbers = numbersInput;
    } else if (typeof numbersInput === 'string') {
      numbers = numbersInput.split('\n').map(n => n.trim()).filter(Boolean);
    }
    
    const rawDelay = parseFloat(req.body.delay);
    const delayMs = !isNaN(rawDelay) && rawDelay >= 0 ? rawDelay * 1000 : 3000;
    
    // Filter out comments and invalid entries to keep only potential phone numbers
    const processedNumbers = numbers
      .map(n => n.trim())
      .filter(n => {
        if (!n) return false;
        if (n.startsWith('#') || n.startsWith('//')) return false;
        // Must have at least some digits
        return /\d/.test(n);
      })
      .slice(0, 300);
      
    const total = processedNumbers.length;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Send initial status immediately
    res.write(`data: ${JSON.stringify({ type: 'start', total })}\n\n`);

    let clientDisconnected = false;
    req.on('close', () => {
      clientDisconnected = true;
    });

    for (let i = 0; i < total; i++) {
      if (clientDisconnected) {
        console.log("Client disconnected. Aborting batch processing.");
        break;
      }

      const num = processedNumbers[i];
      console.log(`Processing batch item ${i + 1}/${total}: ${num}`);
      const name = await getEyeconData(num);
      const progress = Math.round(((i + 1) / total) * 100);
      const remainingSeconds = (total - (i + 1)) * (delayMs / 1000);
      
      const payload = {
        type: 'update',
        count: i + 1,
        num,
        name,
        progress,
        eta: remainingSeconds,
      };
      
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      
      if (i < total - 1 && !clientDisconnected) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
    res.end();
  });

  // API: export to Excel
  app.post('/api/export', (req, res) => {
    const { records, licenseKey, clientId } = req.body;
    const reqKey = licenseKey || req.headers["x-license-key"];
    const reqClientId = clientId || req.headers["x-client-id"];
    
    const validation = validateLicense(reqKey, reqClientId as string);
    if (!validation.valid) {
      return res.status(401).send("Unauthorized: " + validation.message);
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).send("No records found to export.");
    }
    
    try {
      const wb = XLSX.utils.book_new();
      
      // Sort records by Serial/count ascending so they save from #1 to #N top-down
      const sortedRecords = [...records].sort((a: any, b: any) => {
        const serialA = a.Serial || a.count || 0;
        const serialB = b.Serial || b.count || 0;
        return serialA - serialB;
      });

      // Map columns cleanly for presentation
      const presentationRecords = sortedRecords.map((record: any) => ({
        'Serial': record.Serial || record.count || '',
        'Phone Number': record.Number || record.num || '',
        'Identified Name': record.Name || record.name || '',
        'Status': record.Status || 'Success'
      }));

      const ws = XLSX.utils.json_to_sheet(presentationRecords);
      XLSX.utils.book_append_sheet(wb, ws, "Eyecon_Data");
      
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename="Eyecon_Report.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buf);
    } catch (err) {
      console.error("Export error:", err);
      res.status(500).send("Failed to generate report.");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
