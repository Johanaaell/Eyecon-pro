import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Phone, 
  User, 
  Download, 
  Play, 
  Square, 
  Search, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Filter, 
  TrendingUp, 
  AlertCircle,
  Hash,
  RefreshCw,
  Sliders,
  Sparkles,
  Trash2,
  Copy,
  Plus,
  Lock,
  Unlock,
  Key,
  Shield,
  Calendar,
  Users,
  LogOut,
  Check,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecordItem {
  Serial: number;
  Number: string;
  Name: string;
  Status: 'Success' | 'Not Found' | 'Error' | 'Timeout';
  Timestamp: string;
}

export default function App() {
  const [numbersText, setNumbersText] = useState<string>(
    `923040710048\n923001122334\n923334445556\n12125550199\n442079460192`
  );
  const [delay, setDelay] = useState<number>(3); // seconds
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [eta, setEta] = useState<number>(0); // remaining seconds
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Interactive Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Not Found' | 'Error'>('All');

  const abortControllerRef = useRef<AbortController | null>(null);

  // New Subscription licensing states
  const [licenseKey, setLicenseKey] = useState<string>(localStorage.getItem('eyecon_license_key') || '');
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('');
  const [licenseDetails, setLicenseDetails] = useState<any>(null);
  const [isLicenseVerified, setIsLicenseVerified] = useState<boolean>(false);
  const [isValidatingLicense, setIsValidatingLicense] = useState<boolean>(true);
  const [licenseError, setLicenseError] = useState<string>('');

  // Device-locking footprint
  const clientId = useMemo(() => {
    let id = localStorage.getItem('eyecon_client_id');
    if (!id) {
      id = 'DEV-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      localStorage.setItem('eyecon_client_id', id);
    }
    return id;
  }, []);

  // Licensing admin view states
  const [showAdminView, setShowAdminView] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [generatedKeysList, setGeneratedKeysList] = useState<any[]>([]);
  const [newKeyUser, setNewKeyUser] = useState<string>('');
  const [newKeyPlan, setNewKeyPlan] = useState<string>('monthly');
  const [adminNotification, setAdminNotification] = useState<string>('');
  
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string>('');

  // Validate license key in localStorage on startup
  useEffect(() => {
    const checkSavedLicense = async () => {
      if (!licenseKey) {
        setIsValidatingLicense(false);
        return;
      }
      try {
        const response = await fetch('/api/verify-license', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey, clientId }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.valid) {
            setIsLicenseVerified(true);
            setLicenseDetails(data.details);
          } else {
            localStorage.removeItem('eyecon_license_key');
            setLicenseKey('');
          }
        }
      } catch (err) {
        console.error("License verification error on load:", err);
      } finally {
        setIsValidatingLicense(false);
      }
    };
    checkSavedLicense();
  }, [licenseKey, clientId]);

  // Client-Side Security Shield: Block inspect, right-click, console hotkeys, and halt devtools
  useEffect(() => {
    // 1. Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Block inspection shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I or Cmd+Opt+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J or Cmd+Opt+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C or Cmd+Opt+C (Element Selector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U or Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (Save) to prevent offline scraping
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Active Anti-Debugger Freeze Engine
    // If DevTools is opened, this active debugger loop stops the app, freezing the page immediately
    const debuggerInterval = setInterval(() => {
      (function() {
        try {
          (function preventInspection(index) {
            if (("" + index / index).length !== 1 || index % 20 === 0) {
              (function() {}.constructor("debugger")());
            } else {
              (function() {}.constructor("debugger")());
            }
            preventInspection(++index);
          })(0);
        } catch (e) {}
      })();
    }, 100);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(debuggerInterval);
    };
  }, []);

  const handleActivateLicense = async (keyInput: string) => {
    if (!keyInput.trim()) {
      setLicenseError("Please enter your activation code.");
      return;
    }
    setLicenseError('');
    setIsValidatingLicense(true);
    try {
      const response = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: keyInput.trim(), clientId }),
      });
      const data = await response.json();
      if (data.valid) {
        localStorage.setItem('eyecon_license_key', keyInput.trim().toUpperCase());
        setLicenseKey(keyInput.trim().toUpperCase());
        setLicenseDetails(data.details);
        setIsLicenseVerified(true);
        setLicenseError('');
      } else {
        setLicenseError(data.message || "Invalid license key.");
      }
    } catch (err) {
      setLicenseError("Activation server failed to respond. Please try again.");
    } finally {
      setIsValidatingLicense(false);
    }
  };

  const handleAdminLogin = async (pw: string) => {
    if (!pw) {
      setAdminError("Please verify your password.");
      return;
    }
    setAdminError('');
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (response.ok) {
        setIsAdminAuthenticated(true);
        setAdminError('');
        loadAdminLicensesList(pw);
      } else {
        const data = await response.json();
        setAdminError(data.message || "Incorrect admin credentials.");
      }
    } catch (err) {
      setAdminError("Unable to establish admin session.");
    }
  };

  const loadAdminLicensesList = async (pw: string) => {
    try {
      const response = await fetch('/api/admin/keys/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedKeysList(data.keys || []);
      }
    } catch (err) {
      console.error("Failed to fetch key database:", err);
    }
  };

  const handleCreateLicense = async () => {
    if (!newKeyUser.trim()) {
      alert("Please designate a customer name.");
      return;
    }
    try {
      const response = await fetch('/api/admin/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          plan: newKeyPlan,
          user: newKeyUser.trim()
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setNewKeyUser('');
        setAdminNotification(`Active Key generated! Copied to clipboard: ${data.key.key}`);
        loadAdminLicensesList(adminPassword);
        // Copy to system clipboard
        navigator.clipboard.writeText(data.key.key).catch(() => {});
        setTimeout(() => setAdminNotification(''), 7000);
      } else {
        const data = await response.json();
        alert(data.message || "Error registering license");
      }
    } catch (err) {
      alert("Hardware generation error.");
    }
  };

  const handleKeyControl = async (key: string, action: 'block' | 'unblock' | 'delete' | 'reset_device') => {
    if (action === 'delete' && !confirm(`Confirm deletion of license key: ${key}`)) {
      return;
    }
    if (action === 'reset_device' && !confirm(`Reset device/browser binding lock for key: ${key}?`)) {
      return;
    }
    try {
      const response = await fetch('/api/admin/keys/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          key,
          action
        }),
      });
      if (response.ok) {
        loadAdminLicensesList(adminPassword);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update listing.");
      }
    } catch (err) {
      alert("Database error.");
    }
  };

  const handleChangeAdminPassword = async () => {
    if (!newAdminPassword || newAdminPassword.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }
    try {
      const response = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          newPassword: newAdminPassword
        }),
      });
      if (response.ok) {
        setAdminPassword(newAdminPassword);
        setNewAdminPassword('');
        setPasswordChangeSuccess("Owner password successfully saved.");
        setTimeout(() => setPasswordChangeSuccess(''), 4000);
      } else {
        const data = await response.json();
        alert(data.message || "Failed password modification");
      }
    } catch (err) {
      alert("Encryption failure.");
    }
  };

  const handleDeactivateMyKey = () => {
    localStorage.removeItem('eyecon_license_key');
    setLicenseKey('');
    setIsLicenseVerified(false);
    setLicenseDetails(null);
  };

  // Format Convert helper: Convert 03xx to 923xx (local pak to international pak)
  const formatToPakStandard = () => {
    const lines = numbersText.split('\n');
    const formatted = lines.map(line => {
      let trimmed = line.trim();
      if (trimmed.startsWith('#') || trimmed.startsWith('//')) return trimmed;
      // Remove spaces, dashes, brackets, plus
      let digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, '');
      // If it starts with 03 and has 11 digits standard length, e.g. 03040710048
      if (digitsOnly.startsWith('03') && digitsOnly.length === 11) {
        return '92' + digitsOnly.substring(1); // 923040710048
      }
      // If it starts with 3 and has 10 digits (missing standard leading 0 or 92)
      if (digitsOnly.startsWith('3') && digitsOnly.length === 10) {
        return '92' + digitsOnly; // 923001122334
      }
      return trimmed;
    });
    setNumbersText(formatted.join('\n'));
  };

  // Convert with standard regex sanitation - numeric characters only
  const sanitizeDigitsOnly = () => {
    const lines = numbersText.split('\n');
    const sanitized = lines.map(line => {
      if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
        return '';
      }
      // Keep only numeric digits (no plus, spaces, brackets, or alphabetical characters)
      return line.replace(/[^0-9]/g, '');
    }).filter(Boolean);
    setNumbersText(sanitized.join('\n'));
  };

  // Smart extract numbers from random strings / paragraphs using regex
  const smartExtractNumbers = () => {
    // Look for strings of digits that resemble numbers (length 7 to 15 characters)
    // support common symbols like + , spaces, - and brackets
    const regex = /(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3}[-.\s]?\d{4,7}/g;
    const matches = numbersText.match(regex);
    if (matches && matches.length > 0) {
      const cleanedMatches = matches.map(m => {
        let clean = m.replace(/[\s\-\(\)\+]/g, '');
        // Pakistan 03xx to 923xx standard conversion
        if (clean.startsWith('03') && clean.length === 11) {
          return '92' + clean.substring(1);
        }
        return clean;
      }).filter(c => c.length >= 7 && c.length <= 15);
      
      const unique = Array.from(new Set(cleanedMatches));
      if (unique.length > 0) {
        setNumbersText(unique.join('\n'));
      } else {
        alert("No valid phone numbers found from extracting digits.");
      }
    } else {
      // Fallback searches for any long continuous sequence of numbers 7-15 digits
      const simplerRegex = /\d{7,15}/g;
      const simpleMatches = numbersText.match(simplerRegex);
      if (simpleMatches && simpleMatches.length > 0) {
        const unique = Array.from(new Set(simpleMatches));
        setNumbersText(unique.join('\n'));
      } else {
        alert("No visible phone numbers could be extracted from the active text block.");
      }
    }
  };

  // Deduplicate input list
  const deduplicateInput = () => {
    const lines = numbersText.split('\n').map(l => l.trim()).filter(Boolean);
    const unique = Array.from(new Set(lines));
    setNumbersText(unique.join('\n'));
  };

  // Append customized country prefix if it's not present
  const prependCountryCode = () => {
    const prefix = prompt("Enter country code to prepend (e.g., 92, 1, 44):", "92");
    if (!prefix) return;
    
    const lines = numbersText.split('\n');
    const prepended = lines.map(line => {
      let trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('#') || trimmed.startsWith('//')) return trimmed;
      // Strip any non-digit/non-plus characters for checking
      let digits = trimmed.replace(/[^0-9]/g, '');
      if (digits.startsWith(prefix)) {
        return trimmed;
      }
      if (digits.startsWith('0')) {
        return prefix + digits.substring(1);
      }
      return prefix + digits;
    }).filter(Boolean);
    
    setNumbersText(prepended.join('\n'));
  };

  // Demo presets loader
  const loadDemoMessyFormats = () => {
    const demoText = `# Pakistan standard formats\n03040710048\n03001122334\n\n# Messy formats with brackets and spaces\n+92 (333) 444-5556\n+1 (212) 555-0199\n\n# Copy-pasted names with numbers\nMuhammad Ali Contact: 03040710048\nSupport Line Tel: +44 207 946 0192`;
    setNumbersText(demoText);
  };

  const abortRef = useRef<boolean>(false);
  const delayTimeoutRef = useRef<any>(null);

  const startExtraction = async () => {
    if (!numbersText.trim()) {
      alert("Please enter at least one phone number.");
      return;
    }

    const rows = numbersText.split('\n')
      .map(n => n.trim())
      .filter(n => {
        if (!n) return false;
        if (n.startsWith('#') || n.startsWith('//')) return false;
        return /\d/.test(n);
      })
      .slice(0, 300);

    const total = rows.length;
    if (total === 0) {
      alert("No valid phone numbers found to process.");
      return;
    }

    // Reset State
    setRecords([]);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(total);
    setEta(total * delay);
    setIsProcessing(true);
    abortRef.current = false;

    for (let i = 0; i < total; i++) {
      if (abortRef.current) {
        break;
      }

      const num = rows[i];
      
      try {
        const response = await fetch('/api/lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ number: num, licenseKey, clientId }),
        });

        if (response.status === 401) {
          alert("License key has expired, been blocked, or is invalid. Batch processing aborted.");
          handleDeactivateMyKey();
          break;
        }

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const rawName = data.name || "Not Found";
        
        const isNotFound = rawName === 'Not Found';
        const isError = rawName.startsWith('Error') || rawName.startsWith('Timeout') || rawName.startsWith('Timeout/Error');
        
        let status: 'Success' | 'Not Found' | 'Error' | 'Timeout' = 'Success';
        if (isNotFound) status = 'Not Found';
        else if (isError) {
          if (rawName.includes('Timeout')) status = 'Timeout';
          else status = 'Error';
        }

        const newRecord: RecordItem = {
          Serial: i + 1,
          Number: num,
          Name: rawName,
          Status: status,
          Timestamp: new Date().toLocaleTimeString()
        };

        setRecords(prev => [newRecord, ...prev]);
        setProcessedCount(i + 1);
        setProgress(Math.round(((i + 1) / total) * 100));
        setEta((total - (i + 1)) * delay);

      } catch (err: any) {
        console.error(`Lookup failed for ${num}:`, err);
        const newRecord: RecordItem = {
          Serial: i + 1,
          Number: num,
          Name: "Error",
          Status: 'Error',
          Timestamp: new Date().toLocaleTimeString()
        };
        setRecords(prev => [newRecord, ...prev]);
        setProcessedCount(i + 1);
        setProgress(Math.round(((i + 1) / total) * 100));
        setEta((total - (i + 1)) * delay);
      }

      if (i < total - 1 && !abortRef.current) {
        await new Promise(resolve => {
          delayTimeoutRef.current = setTimeout(resolve, delay * 1000);
        });
      }
    }

    setIsProcessing(false);
  };

  const stopExtraction = () => {
    abortRef.current = true;
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    setIsProcessing(false);
  };

  const downloadExcel = async () => {
    if (records.length === 0) {
      alert("No data to export. Please process some numbers first.");
      return;
    }

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records, licenseKey, clientId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Eyecon_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to export Excel report.");
      }
    } catch (err: any) {
      console.error("Export error:", err);
      alert(`Export failed: ${err.message || err}`);
    }
  };

  // Compute stats on the fly
  const stats = useMemo(() => {
    const success = records.filter(r => r.Status === 'Success').length;
    const notFound = records.filter(r => r.Status === 'Not Found').length;
    const errors = records.filter(r => r.Status === 'Error').length;
    
    return {
      success,
      notFound,
      errors,
      successRate: records.length > 0 ? Math.round((success / records.length) * 100) : 0
    };
  }, [records]);

  // Handle live UI search filters
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.Number.includes(searchQuery) || 
        record.Name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Success' && record.Status === 'Success') ||
        (statusFilter === 'Not Found' && record.Status === 'Not Found') ||
        (statusFilter === 'Error' && record.Status === 'Error');
        
      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  // Format helper for remaining minutes and seconds
  const formatETA = (seconds: number) => {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  if (isValidatingLicense) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
          <Shield className="absolute inset-0 m-auto h-6 w-6 text-indigo-400 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-widest uppercase">Eyecon Pro</h2>
        <p className="text-xs text-neutral-400 mt-2 font-mono">Authenticating System Access License...</p>
      </div>
    );
  }

  if (!isLicenseVerified && !showAdminView) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 pb-6 border-b border-neutral-800/60 text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-4 shadow-inner">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Eyecon Pro Activation</h1>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-medium">
              Enter your subscription license key to access the caller identification batch extractor system.
            </p>
          </div>
          
          <div className="p-8 space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 font-mono">
                System License Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="E.g., EYE-MONTH-XXXX-YYYY"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleActivateLicense(licenseKeyInput);
                  }}
                  className="w-full text-center tracking-widest font-mono text-sm uppercase py-3.5 px-4 bg-neutral-950 text-indigo-300 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl focus:outline-hidden transition"
                />
              </div>
              {licenseError && (
                <div className="mt-2.5 flex items-start space-x-1 py-1 px-3 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{licenseError}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleActivateLicense(licenseKeyInput)}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/10 select-none cursor-pointer border-0"
            >
              <Key className="h-4 w-4" />
              <span>Activate Access License</span>
            </button>
          </div>

          <div className="p-4 bg-neutral-950/40 border-t border-neutral-800/40 flex items-center justify-between text-xs px-8">
            <button
              onClick={() => {
                setShowAdminView(true);
                setIsAdminAuthenticated(false);
                setAdminError('');
                setAdminPassword('');
              }}
              className="text-neutral-500 hover:text-neutral-300 transition flex items-center space-x-1.5 font-bold bg-transparent border-0 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Owner Dashboard</span>
            </button>
            <span className="text-neutral-600 font-bold tracking-wider text-[9px] uppercase font-mono">
              SECURE TLS-256
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (showAdminView) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200">
        <header className="border-b border-neutral-800 bg-neutral-900 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-neutral-800 rounded-lg flex items-center justify-center text-indigo-400 border border-neutral-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-widest uppercase flex items-center space-x-1.5">
                  <span>Eyecon Pro</span>
                  <span className="px-1.5 py-0.5 text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono">Owner Panel</span>
                </h1>
                <p className="text-[10px] text-neutral-400 font-mono">Licensing Database & Administration Console</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAdminView(false)}
              className="text-neutral-400 hover:text-white text-xs font-bold transition flex items-center space-x-1.5 border border-neutral-800 hover:border-neutral-700 py-1.5 px-3 bg-neutral-900 rounded-lg cursor-pointer"
            >
              <span>Back to App Client</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isAdminAuthenticated ? (
            <div className="max-w-md mx-auto my-12 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-8 pb-6 border-b border-neutral-800/60 text-center">
                <div className="mx-auto h-12 w-12 bg-neutral-800 rounded-xl flex items-center justify-center text-indigo-400 border border-neutral-700 mb-4 shadow-inner animate-pulse">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-base font-extrabold text-white tracking-tight">Authenticating Operator Security</h2>
                <p className="text-xs text-neutral-400 mt-1 font-medium">Input your admin password to view active subscriptions.</p>
              </div>
              
              <div className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 font-mono">
                    Owner Administration Credentials
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdminLogin(adminPassword);
                    }}
                    className="w-full text-center text-sm py-3 px-4 bg-neutral-950 text-indigo-200 border border-neutral-800 focus:border-indigo-500 rounded-xl focus:outline-hidden transition"
                  />
                  {adminError && (
                    <div className="mt-2 text-rose-400 text-xs font-bold flex items-center space-x-1 justify-center">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{adminError}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAdminLogin(adminPassword)}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border-0"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Verify Authorization</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    <span>Generate Activation Key</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">
                        Client / Customer Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe or Business Corp"
                        value={newKeyUser}
                        onChange={(e) => setNewKeyUser(e.target.value)}
                        className="w-full py-2.5 px-3 text-xs bg-neutral-950 text-neutral-200 border border-neutral-800 focus:border-indigo-500 rounded-lg focus:outline-hidden transition font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">
                        License Plan Duration
                      </label>
                      <select
                        value={newKeyPlan}
                        onChange={(e) => setNewKeyPlan(e.target.value)}
                        className="w-full py-2.5 px-3 text-xs bg-neutral-950 text-neutral-200 border border-neutral-800 focus:border-indigo-500 rounded-lg focus:outline-hidden transition font-bold"
                      >
                        <option value="15days">15 Days Plan</option>
                        <option value="monthly">Monthly Subscription (30 Days)</option>
                        <option value="quarterly">Quarterly Subscription (90 Days)</option>
                        <option value="sixmonth">Six Months Plan (180 Days)</option>
                        <option value="yearly">Yearly Subscription (365 Days)</option>
                      </select>
                    </div>

                    <button
                      onClick={handleCreateLicense}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer border-0"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>Generate License</span>
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-indigo-400" />
                    <span>Change Admin Password</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full py-2.5 px-3 text-xs bg-neutral-950 text-neutral-200 border border-neutral-800 focus:border-indigo-500 rounded-lg focus:outline-hidden transition font-mono"
                      />
                    </div>

                    {passwordChangeSuccess && (
                      <span className="text-xs text-emerald-400 font-bold block">{passwordChangeSuccess}</span>
                    )}

                    <button
                      onClick={handleChangeAdminPassword}
                      className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer border-0"
                    >
                      <span>Update Password</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                {adminNotification && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-between">
                    <span>{adminNotification}</span>
                    <button 
                      onClick={() => setAdminNotification('')}
                      className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/40">
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Active Keys Ledger</h3>
                      <p className="text-[10px] text-neutral-400 font-mono">Real-time status of all active, blocked, and pending subscriptions</p>
                    </div>
                    <button
                      onClick={() => loadAdminLicensesList(adminPassword)}
                      className="text-neutral-400 hover:text-white transition flex items-center bg-transparent border-0 cursor-pointer"
                      title="Sync table layout with database ledger"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-800">
                      <thead className="bg-neutral-950 text-[9px] font-extrabold text-neutral-500 uppercase tracking-widest font-mono">
                        <tr>
                          <th className="px-6 py-3 text-left">Key / Customer</th>
                          <th className="px-6 py-3 text-left">Plan details</th>
                          <th className="px-6 py-3 text-left">Expiry Target</th>
                          <th className="px-6 py-3 text-left">Hits</th>
                          <th className="px-6 py-3 text-center">Control Ledger</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 bg-neutral-900/20 text-xs font-medium">
                        {generatedKeysList.length > 0 ? (
                          generatedKeysList.map((k) => {
                            const expiresDate = new Date(k.expiresAt);
                            const now = new Date();
                            const diffSec = expiresDate.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffSec / (1000 * 60 * 60 * 24));
                            const isExpired = diffSec < 0;

                            return (
                              <tr key={k.key} className="hover:bg-neutral-800/20 transition">
                                <td className="px-6 py-3.5">
                                  <div className="flex flex-col">
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-mono text-indigo-400 font-bold select-all">{k.key}</span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(k.key);
                                          alert(`Copied key: ${k.key}`);
                                        }}
                                        className="text-neutral-500 hover:text-neutral-300 transition bg-transparent border-0 cursor-pointer"
                                        title="Copy hardware license"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <span className="text-[10px] text-neutral-400 mt-0.5 flex flex-wrap gap-1.5 items-center">
                                      <span>User: <strong className="text-neutral-200">{k.user}</strong></span>
                                      {k.activeClientId ? (
                                        <span className="px-1 text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-bold uppercase select-none" title={k.activeClientId}>
                                          Device Locked (1 Device Only)
                                        </span>
                                      ) : (
                                        <span className="px-1 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold uppercase select-none">
                                          Unbound
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-3.5">
                                  <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded font-bold uppercase">
                                    {k.plan}
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 font-mono">
                                  <div className="flex flex-col">
                                    <span>{expiresDate.toISOString().slice(0, 10)}</span>
                                    {isExpired ? (
                                      <span className="text-[9px] text-rose-500 font-bold uppercase">EXPIRED</span>
                                    ) : (
                                      <span className="text-[9px] text-emerald-400 font-bold uppercase">{diffDays} Days Left</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3.5 font-mono text-neutral-100 font-bold">
                                  {k.uses}
                                </td>
                                <td className="px-6 py-3.5 text-center">
                                  <div className="flex items-center justify-center space-x-1.5">
                                    {k.status === 'blocked' ? (
                                      <button
                                        onClick={() => handleKeyControl(k.key, 'unblock')}
                                        className="px-2 py-0.5 bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/20 rounded font-bold text-[9px] transition uppercase cursor-pointer"
                                      >
                                        Unblock
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleKeyControl(k.key, 'block')}
                                        className="px-2 py-0.5 bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-600/20 rounded font-bold text-[9px] transition uppercase cursor-pointer"
                                      >
                                        Block Key
                                      </button>
                                    )}
                                    {k.activeClientId && (
                                      <button
                                        onClick={() => handleKeyControl(k.key, 'reset_device')}
                                        className="px-2 py-0.5 bg-amber-600/15 text-amber-400 hover:bg-amber-600/30 border border-amber-600/20 rounded font-bold text-[9px] transition uppercase cursor-pointer"
                                        title={`Reset Device Lock: ${k.activeClientId}`}
                                      >
                                        Reset Device
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleKeyControl(k.key, 'delete')}
                                      className="px-2 py-0.5 bg-rose-600/15 text-rose-400 hover:bg-rose-600/30 border border-rose-600/20 rounded font-bold text-[9px] transition uppercase cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                              <span>No access license keys in the JSON ledger.</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans selection:bg-indigo-100 antialiased">
      {/* Header Banner */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-neutral-900 uppercase">Eyecon Pro</span>
                <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 font-bold rounded-full uppercase tracking-wider">v4.0.542</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">Professional Intelligence Caller ID Batch Directory</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              <span>Licensed to {licenseDetails?.user || 'User'}</span>
            </div>

            <button
              onClick={() => {
                setShowAdminView(true);
                setIsAdminAuthenticated(false);
                setAdminError('');
                setAdminPassword('');
              }}
              className="text-neutral-500 hover:text-indigo-600 transition text-xs font-bold border border-neutral-200 py-1.5 px-3 rounded-lg flex items-center space-x-1 bg-white cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Owner Dashboard</span>
            </button>

            <button
              onClick={handleDeactivateMyKey}
              className="text-neutral-400 hover:text-rose-600 transition flex items-center p-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer bg-transparent border-0"
              title="Logout Key"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Intake Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Batch configuration form */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 border border-neutral-200">
                  <Sliders className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-neutral-900">Intake Controller</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Phone Numbers List (One per line)
                  </label>
                  <div className="relative">
                    <textarea
                      id="numbersList"
                      disabled={isProcessing}
                      className="w-full h-80 text-sm font-mono p-4 border-2 border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 resize-full"
                      placeholder={`E.g.\n923040710048\n12125550199\n+442079460192`}
                      value={numbersText}
                      onChange={(e) => setNumbersText(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 shrink-0 bg-neutral-800 text-[10px] text-white font-bold py-1 px-2.5 rounded-md opacity-80 backdrop-blur-xs">
                      Max: 300 entries
                    </div>
                  </div>
                </div>

                {/* Formatting Tools Panel */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      <span>Batch Format & Clean</span>
                    </span>
                    <button
                      onClick={loadDemoMessyFormats}
                      disabled={isProcessing}
                      className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition bg-transparent border-0 cursor-pointer disabled:opacity-50"
                    >
                      Load Demo Format
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={formatToPakStandard}
                      disabled={isProcessing || !numbersText.trim()}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold select-none cursor-pointer transition disabled:opacity-50"
                      title="Convert 03xx Pakistani numbers to international 923xx format standard"
                    >
                      <span>🇵🇰 Standardize Pak</span>
                    </button>

                    <button
                      type="button"
                      onClick={smartExtractNumbers}
                      disabled={isProcessing || !numbersText.trim()}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold select-none cursor-pointer transition disabled:opacity-50"
                      title="Regex scan pasted text logs to pull out any sequences of numbers"
                    >
                      <span>🔍 Extract Numbers</span>
                    </button>

                    <button
                      type="button"
                      onClick={sanitizeDigitsOnly}
                      disabled={isProcessing || !numbersText.trim()}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-505 hover:text-neutral-700 rounded-lg text-xs font-semibold select-none cursor-pointer transition disabled:opacity-50 font-medium"
                      title="Keep digits only. Strips letters, dashes, braces, spaces"
                    >
                      <span>Purge Chars</span>
                    </button>

                    <button
                      type="button"
                      onClick={deduplicateInput}
                      disabled={isProcessing || !numbersText.trim()}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-505 hover:text-neutral-700 rounded-lg text-xs font-semibold select-none cursor-pointer transition disabled:opacity-50 font-medium"
                      title="Delete repeated phone entries to conserve API run usage"
                    >
                      <span>👥 Deduplicate</span>
                    </button>

                    <button
                      type="button"
                      onClick={prependCountryCode}
                      disabled={isProcessing || !numbersText.trim()}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-semibold col-span-2 select-none cursor-pointer transition disabled:opacity-50 font-bold"
                      title="Prepend custom country dial prefix (e.g. +92) if absent"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Prepend Country Prefix</span>
                    </button>
                  </div>
                </div>

                {/* Delay Adjustment Slider/Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Lookup Interval Delay
                    </label>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {delay} Seconds
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      disabled={isProcessing}
                      value={delay}
                      onChange={(e) => setDelay(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1.5 font-medium leading-relaxed">
                    Anti-blocking measure: A minimum of 3s delay is strongly advised to safeguard IP queries from directory rate limiters.
                  </p>
                </div>

                {/* Processing Controls */}
                <div className="pt-2 space-y-2.5">
                  {!isProcessing ? (
                    <button
                      onClick={startExtraction}
                      disabled={!numbersText.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition duration-150 border-0 cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-white text-white" />
                      <span>Execute Extraction</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopExtraction}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-100 transition duration-150 border-0 cursor-pointer"
                    >
                      <Square className="h-4 w-4 fill-white text-white" />
                      <span>Abort Processing</span>
                    </button>
                  )}

                  <button
                    onClick={downloadExcel}
                    disabled={records.length === 0}
                    className="w-full border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition duration-150 cursor-pointer bg-white"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span>Download Excel Sheet</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Quick documentation card */}
            <div className="bg-neutral-900 text-neutral-300 rounded-2xl p-5 border border-neutral-800 shadow-md">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5">Pro-Tip & Specifications</h4>
              <ul className="text-xs leading-relaxed space-y-2 text-neutral-400 font-medium font-sans">
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2 font-bold">•</span>
                  <span><strong>Format compatibility:</strong> Supports formats like +92304..., 92300... or 0300... System purges spacing automatically.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2 font-bold">•</span>
                  <span><strong>Directory limits:</strong> Maximum batch size is restricted to 300 to balance lookup speed and server safety.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2 font-bold">•</span>
                  <span><strong>Spreadsheet output:</strong> The Excel report aligns column maps immediately so exports load directly inside Excel/Sheets.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Key KPI and Dashboard list (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-3xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Processed</span>
                <span className="text-2xl font-black text-neutral-900 mt-2.5 flex items-baseline leading-none">
                  {processedCount}
                  {totalCount > 0 && (
                    <span className="text-xs font-bold text-neutral-400 ml-1">/ {totalCount}</span>
                  )}
                </span>
                <div className="mt-2.5 h-1 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (processedCount / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-3xs border-b-4 border-b-emerald-500 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Success Match</span>
                <span className="text-2xl font-black text-neutral-900 mt-2.5 leading-none">
                  {stats.success}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 mt-2.5 bg-emerald-50 px-1.5 py-0.5 rounded-sm self-start">
                  {stats.successRate}% rate
                </span>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-3xs border-b-4 border-b-amber-500 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Not Found</span>
                <span className="text-2xl font-black text-neutral-900 mt-2.5 leading-none">
                  {stats.notFound}
                </span>
                <span className="text-[10px] font-bold text-amber-600 mt-2.5 bg-amber-50 px-1.5 py-0.5 rounded-sm self-start">
                  No directory list
                </span>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-3xs border-b-4 border-b-neutral-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">ETA Remaining</span>
                <span className="text-2xl font-black text-neutral-900 mt-2.5 leading-none font-mono">
                  {formatETA(eta)}
                </span>
                <span className="text-[10px] font-bold text-neutral-500 mt-2.5 flex items-center">
                  <Clock className="h-3.5 w-3.5 text-neutral-400 mr-1" />
                  Clock estimate
                </span>
              </div>
            </div>

            {/* Main Interactive Table Panel */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              
              {/* Header section with live results status and overall progress */}
              <div className="p-6 border-b border-neutral-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Real-Time Extraction Session</h3>
                    <p className="text-xs text-neutral-500 mt-0.5 font-medium">Activity logs showing incoming verified phone registers</p>
                  </div>
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <span className="text-xs text-neutral-500 font-bold">Progress:</span>
                    <span className="bg-indigo-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-xs">
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* Main Progress bar */}
                <div className="mt-4">
                  <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isProcessing ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Filters & Control strip */}
              <div className="bg-neutral-50 p-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Status Tab buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setStatusFilter('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-0 ${
                      statusFilter === 'All' 
                        ? 'bg-neutral-800 text-white shadow-xs' 
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    All ({records.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('Success')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border-0 ${
                      statusFilter === 'Success' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span>Found ({stats.success})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('Not Found')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border-0 ${
                      statusFilter === 'Not Found' 
                        ? 'bg-amber-500 text-white shadow-xs' 
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-300"></span>
                    <span>Not Found ({stats.notFound})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('Error')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border-0 ${
                      statusFilter === 'Error' 
                        ? 'bg-rose-600 text-white shadow-xs' 
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                    <span>Failed ({stats.errors})</span>
                  </button>
                </div>

                {/* Filter Search Input */}
                <div className="relative max-w-xs w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search query list..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:border-indigo-500 focus:outline-hidden text-neutral-700 font-medium"
                  />
                </div>

              </div>

              {/* Verified records table */}
              <div className="overflow-x-auto max-h-120 overflow-y-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50 sticky top-0 z-10 border-b border-neutral-200">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        # Serial
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Phone Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Identified Caller
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Status Label
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-100">
                    <AnimatePresence>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => {
                          let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          let icon = <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
                          let stateLabel = 'Success';

                          if (record.Status === 'Not Found') {
                            badgeBg = 'bg-amber-50 text-amber-700 border-amber-100';
                            icon = <HelpCircle className="h-3.5 w-3.5 mr-1" />;
                            stateLabel = 'Not Found';
                          } else if (record.Status === 'Error') {
                            badgeBg = 'bg-rose-50 text-rose-700 border-rose-100';
                            icon = <XCircle className="h-3.5 w-3.5 mr-1" />;
                            stateLabel = 'Error';
                          }

                          return (
                            <motion.tr
                              key={record.Serial + '-' + record.Number}
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="hover:bg-neutral-50/70 transition"
                            >
                              <td className="px-6 py-3.5 whitespace-nowrap text-xs text-neutral-500 font-bold font-mono">
                                #{record.Serial}
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-xs text-neutral-900 font-bold font-mono">
                                {record.Number}
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-xs text-neutral-600 font-extrabold flex items-center space-x-1.5">
                                <div className="h-6 w-6 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center border border-neutral-200 uppercase font-black text-[10px]">
                                  {record.Name ? record.Name.charAt(0) : '?'}
                                </div>
                                <span className={record.Status === 'Success' ? 'text-indigo-600 font-extrabold' : 'text-neutral-500 font-medium'}>
                                  {record.Name}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeBg}`}>
                                  {icon}
                                  {stateLabel}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-xs text-neutral-400 font-mono">
                                {record.Timestamp}
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              {isProcessing ? (
                                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                              ) : (
                                <Hash className="h-8 w-8 text-neutral-300" />
                              )}
                              <p className="text-sm font-bold text-neutral-500">
                                {isProcessing 
                                  ? 'Fetching values from directory live stream...' 
                                  : 'No results matched the active search filters.'}
                              </p>
                              <p className="text-xs text-neutral-400 font-medium font-sans">
                                Paste numbers and initiate execution to trace caller registers.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {/* Footer stats line */}
              <div className="bg-neutral-50 px-6 py-3.5 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Showing {filteredRecords.length} of {records.length} records processed
                </span>
                {records.length > 0 && (
                  <button 
                    onClick={() => { setRecords([]); setProcessedCount(0); setEta(0); setProgress(0); }}
                    className="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                  >
                    Clear Results List
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Footer information section */}
      <footer className="bg-white border-t border-neutral-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-neutral-400 font-medium text-xs">
          <span>Eyecon Pro Directory Extractor Panel © 2026. All Rights Reserved.</span>
          <div className="flex items-center space-x-6 mt-3 sm:mt-0 font-sans">
            <span className="hover:text-neutral-600 transition cursor-pointer">Security Protocol Specs</span>
            <span className="hover:text-neutral-600 transition cursor-pointer font-sans" onClick={() => {
              setShowAdminView(true);
              setIsAdminAuthenticated(false);
              setAdminError('');
              setAdminPassword('');
            }}>Owner Dashboard Console</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
