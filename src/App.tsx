import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  Search,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Coins,
  Package,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  ChevronDown,
  X,
  FileDown,
  FileUp,
  ExternalLink,
  Github,
  TrendingUp,
  Inbox,
  CheckCircle,
  Check,
  Copy,
  Clock,
  MessageCircle,
  Flame,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Settings,
  Loader2,
  ChevronLeft,
  User,
  ShoppingCart,
  Database,
  ChevronRight,
  Menu,
  LogIn,
  UserPlus,
  Users,
  History,
  Wallet,
  Landmark,
  Ticket,
  Gift,
  Info,
  UploadCloud,
  Eye,
  EyeOff,
  Edit3
} from 'lucide-react';

import { StockItem, CategoryFilter, RarityFilter, StockStatusFilter } from './types';
import { DEFAULT_PRESETS } from './presets';
import { ItemCard } from './components/ItemCard';
import { ItemCardSkeleton } from './components/ItemCardSkeleton';
import { InquiryModal } from './components/InquiryModal';
import { RandomBoxModal } from './components/RandomBoxModal';
import { GachaResultModal } from './components/GachaResultModal';
import { AdminModal } from './components/AdminModal';
import { StockManagerModal } from './components/StockManagerModal';
import { CustomerDatabaseModal } from './components/CustomerDatabaseModal';
import { HistoryModal } from './components/HistoryModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { CouponManagerModal } from './components/CouponManagerModal';
import { AnnouncementManagerModal } from './components/AnnouncementManagerModal';
import { AnnouncementPopup } from './components/AnnouncementPopup';
import Snowfall from './components/Snowfall';
import jsQR from 'jsqr';

const readQRFromImage = (file: File): Promise<string | null> => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
             const canvas = document.createElement("canvas");
             canvas.width = img.width;
             canvas.height = img.height;
             const ctx = canvas.getContext("2d");
             if (!ctx) return resolve(null);
             ctx.drawImage(img, 0, 0);
             const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
             const code = jsQR(imageData.data, imageData.width, imageData.height);
             if (code) {
                 resolve(code.data);
             } else {
                 resolve(null);
             }
         };
         img.onerror = reject;
         img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
   });
};

export default function App() {
  // --- Global Hub State ---
  const [appScreen, setAppScreen] = useState<'LOADING' | 'SELECT' | 'TRANSITION' | 'AOTR' | 'ASTD'>('LOADING');
  const [targetScreen, setTargetScreen] = useState<'AOTR' | 'ASTD' | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingVariant, setLoadingVariant] = useState(1);
  const [isAstdMenuOpen, setIsAstdMenuOpen] = useState(false);
  
  const [gachaResult, setGachaResult] = useState<{ drops: { name: string; color?: string; }[]; item: StockItem; } | null>(null);

  // --- States ---
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [isServerQuotaExceeded, setIsServerQuotaExceeded] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedRarity, setSelectedRarity] = useState<RarityFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<StockStatusFilter>('all');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('rarity-desc');
  const [syncCounter, setSyncCounter] = useState(0);

  // Sync Engine Listener
  useEffect(() => {
    const handleSync = () => {
      const savedItems = localStorage.getItem('AOTR_STOCK_ITEMS');
      if (savedItems) {
         try {
           const parsed = JSON.parse(savedItems);
           if (Array.isArray(parsed)) {
             setItems(current => {
               // Use a custom migrate check if needed, or just set it
               // To avoid deep dependency loops, we just set the parsed array
               // Since items were migrated when saved, they should be fine
               return parsed;
             });
           }
         } catch(e){}
      }
      setSyncCounter(c => c + 1);
    };
    window.addEventListener('sync-update', handleSync);
    return () => window.removeEventListener('sync-update', handleSync);
  }, []);

  // Loading Screen Timer
  useEffect(() => {
    if (appScreen === 'LOADING') {
      const timer = setTimeout(() => {
        setAppScreen('SELECT');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [appScreen]);


  // Transition Timer
  useEffect(() => {
    if (appScreen === 'TRANSITION' && targetScreen) {
      const timer = setTimeout(() => {
        setAppScreen(targetScreen);
        setTargetScreen(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appScreen, targetScreen]);

  // Loading Progress Number Effect
  useEffect(() => {

  if (appScreen === 'LOADING' || appScreen === 'TRANSITION') {
      setLoadingProgress(0);
      let p = 0;
      const duration = appScreen === 'LOADING' ? 3500 : 3000;
      const step = 30; // ms
      const increment = 100 / (duration / step);

      const interval = setInterval(() => {
        p += increment + (Math.random() * 2 - 0.5); // Add slight randomness
        if (p > 99) p = 99; // Cap at 99 until finished closely
        setLoadingProgress(Math.floor(p));
      }, step);

      const finishTimer = setTimeout(() => {
        setLoadingProgress(100);
        clearInterval(interval);
      }, duration - 200);

      return () => {
        clearInterval(interval);
        clearTimeout(finishTimer);
      };
    }
  }, [appScreen]);

  // User & Admin Authentications
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(() => {
    const saved = localStorage.getItem('KUWASHII_CURRENT_USER') || sessionStorage.getItem('KUWASHII_CURRENT_USER');
    if (saved) return JSON.parse(saved);
    return null;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('KUWASHII_IS_ADMIN') === 'true' || sessionStorage.getItem('KUWASHII_IS_ADMIN') === 'true';
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [showMockEmailModal, setShowMockEmailModal] = useState(false);
  const [mockEmailModalData, setMockEmailModalData] = useState<{email: string; username: string; password: string} | null>(null);
  const [rememberAuth, setRememberAuth] = useState(false);

  // --- Top Up State ---
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupModalStep, setTopupModalStep] = useState<'select' | 'angpao' | 'bank' | 'coupon' | 'success'>('select');
  const [topupSuccessMessage, setTopupSuccessMessage] = useState('');
  const [topupError, setTopupError] = useState('');
  const [topupCode, setTopupCode] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [showTopupTos, setShowTopupTos] = useState(false);
  const [selectedTopupChannel, setSelectedTopupChannel] = useState<'angpao' | 'bank' | 'coupon' | null>(null);

  const [isProcessingTopup, setIsProcessingTopup] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Modals controller
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStockManagerOpen, setIsStockManagerOpen] = useState(false);
  const [isCustomerDbOpen, setIsCustomerDbOpen] = useState(false);
  const [isCouponManagerOpen, setIsCouponManagerOpen] = useState(false);
  const [isAnnouncementManagerOpen, setIsAnnouncementManagerOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewingUserHistory, setViewingUserHistory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [inquiringItem, setInquiringItem] = useState<StockItem | null>(null);

  const [hideGlobalStats, setHideGlobalStats] = useState(() => {
    return localStorage.getItem('KUWASHII_HIDE_STATS') === 'true';
  });

  const toggleHideGlobalStats = () => {
    const newState = !hideGlobalStats;
    setHideGlobalStats(newState);
    localStorage.setItem('KUWASHII_HIDE_STATS', String(newState));
  };

  // Floating notifications/toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sound chime utility generator
  const playChime = (type: 'success' | 'warning' | 'info') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const freqs = { success: 523.25, warning: 329.63, info: 440.00 };
      osc.frequency.setValueAtTime(freqs[type] || 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      console.warn("Audio Context beep error:", e);
    }
  };

  // --- AI Chat Assistant States & Handlers ---
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: 'สวัสดีครับ! ยินดีต้อนรับสู่ **Kuwashii El AI Shop Assistant** 🔮\n\nผมเป็นผู้ช่วยอัจฉริยะประจำร้าน Kuwashii El ท่านสามารถพิมพ์ถามข้อมูลราคา, สต๊อกคงเหลือ, ความน่าใช้ หรือวิเคราะห์ประสิทธิภาพการคอมโบไอเทมต่าง ๆ ได้ทันที และพิเศษยิ่งกว่านั้น! ท่านสามารถคลิกปุ่ม **"คุยกับ AI เกี่ยวกับชิ้นนี้ 🔮"** ที่ตัวสินค้าด่านล่างเพื่อส่งข้อมูลตรงให้ผมช่วยประเมินความคุ้มค่าและความเทพของสายเลือดหรือเซรั่มตัวนั้น ๆ ได้ทันทีเลยครับ!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatSharedItem, setChatSharedItem] = useState<StockItem | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleShareToAI = (item: StockItem) => {
    setChatSharedItem(item);
    setChatInput(`ช่วยวิเคราะห์ความเทพ ประโยชน์ และความน่าซื้อของ ${item.name} (ระดับความหายาก: ${item.rarity}) ให้หน่อยครับว่าเอาไปใช้โรลเพลย์หรือทำคอมโบได้ดีแค่ไหน? ✨`);
    showToast(`แชร์ข้อมูลสินค้า "${item.name}" ไปยัง AI Chat เรียบร้อยแล้ว! 🔮`, 'success');
    
    // Scroll smoothly to the AI Chatbox section
    setTimeout(() => {
      const chatSection = document.getElementById('ai-chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    const updatedMessages = [...chatMessages, { role: 'user' as const, text: userMsg }];
    setChatMessages(updatedMessages);

    // Auto-scroll chat box container to bottom smoothly, without scrolling the main browser page
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 60);

    try {
      const apiHistory = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg,
          history: apiHistory,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            rarity: item.rarity,
            quantity: item.quantity,
            price: item.price,
            description: item.description || "",
            isPopular: item.isPopular
          })),
          sharedItem: chatSharedItem ? {
            id: chatSharedItem.id,
            name: chatSharedItem.name,
            category: chatSharedItem.category,
            rarity: chatSharedItem.rarity,
            quantity: chatSharedItem.quantity,
            price: chatSharedItem.price,
            description: chatSharedItem.description || "",
            isPopular: chatSharedItem.isPopular
          } : null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'ระบบประมวลผลคำตอบขัดข้องชั่วคราว');
      }

      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'model', text: data.answer }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        { role: 'model', text: `❌ **เกิดข้อผิดพลาด:** ${err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ปัญญาประดิษฐ์ในขณะนี้ กรุณาลองใหม่อีกครั้ง'}` }
      ]);
      showToast('เชื่อมต่อ AI ไม่สำเร็จ', 'error');
    } finally {
      setIsChatLoading(false);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 60);
    }
  };

  // Cleanup logic (Disabled auto-delete per user request)
  useEffect(() => {
    try {
      // Intentionally bypassed to preserve stats, revenue, and history!
    } catch (e) {
      console.warn("Error cleaning up old histories", e);
    }
  }, []);

  // Load and save localStorage / Server
  useEffect(() => {
    async function initStock() {
      // Helper to map obsolete "Equipment" category to new "Skin" category
      const migrateItems = (itemsList: any[]): StockItem[] => {
        return itemsList.map(item => {
          if (item && item.category === 'Equipment') {
            return { ...item, category: 'Skin' };
          }
          return item as StockItem;
        });
      };

      try {
        const saved = localStorage.getItem('AOTR_STOCK_ITEMS');
        if (saved) {
          try {
            const localItems = migrateItems(JSON.parse(saved));
            setItems(localItems);
          } catch (err) {
            setItems(migrateItems(DEFAULT_PRESETS));
            localStorage.setItem('AOTR_STOCK_ITEMS', JSON.stringify(migrateItems(DEFAULT_PRESETS)));
          }
        } else {
          setItems(migrateItems(DEFAULT_PRESETS));
          localStorage.setItem('AOTR_STOCK_ITEMS', JSON.stringify(migrateItems(DEFAULT_PRESETS)));
        }

        setIsServerQuotaExceeded(false);
      } catch (e: any) {
        console.warn("Error loading items from local cache", e);
        let quotaExceeded = false;
        
        // Parse custom JSON string error info or standard error message
        if (e && e.message) {
          const errMsgLower = String(e.message).toLowerCase();
          if (
            errMsgLower.includes("quota limit exceeded") ||
            errMsgLower.includes("quota exceeded") ||
            errMsgLower.includes("quota") ||
            errMsgLower.includes("free daily read units per project")
          ) {
            quotaExceeded = true;
          }
        }
        setIsServerQuotaExceeded(quotaExceeded);

        const saved = localStorage.getItem('AOTR_STOCK_ITEMS');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setItems(migrateItems(Array.isArray(parsed) ? parsed : []));
          } catch (err) {
            setItems(DEFAULT_PRESETS);
          }
        } else {
          setItems(DEFAULT_PRESETS);
        }
      } finally {
        setIsLoadingStock(false);
      }
    }
    initStock();
  }, []);

  const saveItemsToStorage = (newItems: StockItem[]) => {
    setItems(newItems);
    localStorage.setItem('AOTR_STOCK_ITEMS', JSON.stringify(newItems));
    window.dispatchEvent(new Event('sync-update'));
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tosAccepted) {
      showToast('กรุณายอมรับข้อกำหนดในการให้บริการก่อนดำเนินการต่อ', 'error');
      return;
    }
    if (topupModalStep !== 'bank' && !topupCode.trim()) {
      showToast('กรุณากรอกข้อมูลเพื่อเติมเงิน', 'error');
      return;
    }
    if (topupModalStep === 'bank' && !slipFile) {
      showToast('กรุณาอัปโหลดรูปภาพสลิปโอนเงิน', 'error');
      return;
    }
    
    if (!currentUser?.username) {
      showToast('กรุณาเข้าสู่ระบบก่อน', 'error');
      return;
    }
    
    const activeUsername = currentUser.username;
    const usersData = localStorage.getItem('KUWASHII_V2_USERS');
    let users: Record<string, any> = usersData ? JSON.parse(usersData) : {};
    
    // In case the user is old format or somehow not initialized
    let currentUserData = users[activeUsername];
    if (!currentUserData || typeof currentUserData === 'string') {
       currentUserData = { 
         username: activeUsername,
         balance: 0,
         joinDate: new Date().toISOString(),
         purchases: []
       };
    }

    if (topupModalStep === 'coupon') {
      const savedCoupons = localStorage.getItem('KUWASHII_COUPONS');
      let coupons: any[] = savedCoupons ? JSON.parse(savedCoupons) : [];
      let coupon = coupons.find(c => c.code.toLowerCase() === topupCode.trim().toLowerCase());

      if (coupon) {
         if (coupon.usedBy && coupon.usedBy.includes(activeUsername)) {
            showToast('คุณได้ใช้งานโค้ดนี้ไปแล้ว', 'error');
            return;
         }
         if (coupon.usedBy && coupon.usedBy.length >= coupon.maxUses) {
            showToast('โค้ดอ้างอิงนี้ถูกใช้งานจนครบกำหนดแล้ว', 'error');
            return;
         }
         if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
            showToast('โค้ดนี้หมดอายุการใช้งานแล้ว', 'error');
            return;
         }

         if (!coupon.usedBy) coupon.usedBy = [];
         coupon.usedBy.push(activeUsername);

         localStorage.setItem('KUWASHII_COUPONS', JSON.stringify(coupons));
         
         let freeKey = appScreen === 'ASTD' ? 'KUWASHII_GLOBAL_FREE_CREDITS_ASTD' : 'KUWASHII_GLOBAL_FREE_CREDITS_AOTR';
         const currentFree = parseFloat(localStorage.getItem(freeKey) || '0');
         localStorage.setItem(freeKey, (currentFree + coupon.amount).toString());

         users[activeUsername] = {
           ...currentUserData,
           balance: (currentUserData.balance || 0) + coupon.amount,
           topups: [
             ...(currentUserData.topups || []),
             {
               id: `topup-${Date.now()}`,
               amount: coupon.amount,
               date: new Date().toISOString(),
               method: 'Coupon',
               refCode: coupon.code,
               game: appScreen === 'ASTD' ? 'ASTD' : 'AOTR'
             }
           ]
         };
         
         localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(users));
         
         showToast(`ใช้คูปองสำเร็จ! ได้รับ ${coupon.amount.toLocaleString()} เครดิต`, 'success');
         setTopupSuccessMessage(`ใช้คูปองสำเร็จ! ได้รับ ${coupon.amount.toLocaleString()} เครดิต`);
         setTopupModalStep('success');
         setTopupCode('');
         if (currentUser) setCurrentUser({ ...currentUser });
      } else {
        showToast('ไม่พบโค้ดคูปองนี้ในระบบ', 'error');
      }
      return;
    }

    setIsProcessingTopup(true);
    // Angpao topup
    if (topupModalStep === 'angpao') {
      const receiveAngpao = async () => {
        try {
          setTopupError(''); // Clear earlier errors
          const res = await fetch('/api/topup/true-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gift_link: topupCode.trim() })
          });
          const data = await res.json();
          if (data.status === 'success') {
            const rawAmount = parseFloat(data.amount) || 0;
            const fee = Number((rawAmount * 0.029).toFixed(2));
            const amount = Number((rawAmount - fee).toFixed(2));
            const ownerName = data.owner_profile || 'ไม่ทราบชื่อ';
            
            let revKey = appScreen === 'ASTD' ? 'KUWASHII_GLOBAL_REVENUE_ASTD' : 'KUWASHII_GLOBAL_REVENUE_AOTR';
            const currentRevenue = parseFloat(localStorage.getItem(revKey) || '0');
            localStorage.setItem(revKey, (currentRevenue + amount).toString());

            users[activeUsername] = {
              ...currentUserData,
              balance: (currentUserData.balance || 0) + amount,
              topups: [
                ...(currentUserData.topups || []),
                {
                  id: `topup-${Date.now()}`,
                  amount: amount,
                  date: new Date().toISOString(),
                  method: 'TrueMoney (Angpao)',
                  refCode: topupCode.trim(),
                  game: appScreen === 'ASTD' ? 'ASTD' : 'AOTR'
                }
              ]
            };
            
            localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(users));

            const msg = `เติมเงินสำเร็จ! จำนวน ${amount.toLocaleString()} บาท\n(หักค่าธรรมเนียม ${fee})\nจากซองของ: ${ownerName}`;
            showToast(`เติมเงินสำเร็จ ${amount} บาท`, 'success');
            setTopupSuccessMessage(msg);
            setTopupModalStep('success');
            setTopupCode('');
            if (currentUser) setCurrentUser({ ...currentUser });
          } else {
            const errorMsg = data.info || data.message || data.msg || data.error || 'ซองขวัญไม่ถูกต้อง หรือถูกใช้งานไปแล้ว';
            setTopupError(`API แจ้งเตือน: ${errorMsg}`);
            showToast(errorMsg, 'error');
          }
        } catch (error: any) {
          console.error("Topup fetch error:", error);
          const catchErr = 'ระบบมีปัญหาในการตรวจสอบซองอั่งเปา: ' + (error?.message || 'ไม่ทราบสาเหตุ');
          setTopupError(catchErr);
          showToast(catchErr, 'error');
        } finally {
          setIsProcessingTopup(false);
        }
      };
      receiveAngpao();
      return;
    }

    if (topupModalStep === 'bank') {
      const processBankSlip = async () => {
        try {
          if (!slipFile) {
             showToast('กรุณาอัปโหลดสลิป', 'error');
             setIsProcessingTopup(false);
             return;
          }
          const qrcode_text = await readQRFromImage(slipFile);
          if (!qrcode_text) {
             const qrErr = 'ไม่พบ QR Code ในรูปภาพสลิป';
             setTopupError(qrErr);
             showToast(qrErr, 'error');
             setIsProcessingTopup(false);
             return;
          }

          const res = await fetch('/api/topup/bank', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ qrcode_text })
          });
          const data = await res.json();
          if (data.status === 'success') {
             const transactionId = data.transactionId;
             const amount = parseFloat(data.amount);
             
             // Check Receiver Name Verification
             const stringifiedData = JSON.stringify(data);
             const isNameMatch = stringifiedData.includes('นาย ธีรเทพ ท') || 
                                 stringifiedData.includes('นาย ธีรเทพ ทองเกตุ') || 
                                 stringifiedData.includes('ธีรเทพ ท') || 
                                 stringifiedData.includes('ธีรเทพ ทองเกตุ');

             if (!isNameMatch) {
                // Try to extract the name the API returned to show it
                let displayFoundName = data.receiver_name || data.receiverName || data.data?.receiver?.name || data.data?.receiver?.displayName || data.data?.receiver?.accountName;
                if (!displayFoundName) {
                   const foundNameMatch = stringifiedData.match(/"name"\s*:\s*"([^"]+)"/) || stringifiedData.match(/"receiver_name"\s*:\s*"([^"]+)"/);
                   if (foundNameMatch) displayFoundName = foundNameMatch[1];
                }
                const nameErr = `ชื่อผู้รับไม่ถูกต้อง: ${displayFoundName || 'ไม่ทราบชื่อ'}`;
                setTopupError(nameErr);
                showToast(nameErr, 'error');
                setIsProcessingTopup(false);
                return;
             }

             // Check if used locally in ALL users
             let isUsed = false;
             Object.values(users).forEach((u: any) => {
               if (u.topups?.some((t: any) => t.refCode === transactionId)) {
                  isUsed = true;
               }
             });

             if (isUsed) {
                const usedErr = 'สลิปนี้ถูกใช้งานไปแล้วในระบบของเรา';
                setTopupError(usedErr);
                showToast(usedErr, 'error');
                setIsProcessingTopup(false);
                return;
             }

             // --- Check Slip Time (within 5 minutes) ---
             let slipTime: number | null = null;
             let rawD = '';
             let rawT = '';
             try {
                const stringData = JSON.stringify(data);
                let dVal = data.date || data.transDate || data.data?.transDate || data.data?.date;
                let tVal = data.time || data.transTime || data.data?.transTime || data.data?.time;
                
                if (!dVal || !tVal) {
                   const dMatch = stringData.match(/"(?:transDate|date)"\s*:\s*"([^"]+)"/i);
                   const tMatch = stringData.match(/"(?:transTime|time)"\s*:\s*"([^"]+)"/i);
                   if (dMatch) dVal = dMatch[1];
                   if (tMatch) tVal = tMatch[1];
                }
                
                rawD = String(dVal || '');
                rawT = String(tVal || '');
                
                if (dVal && tVal) {
                   let cleanD = String(dVal).replace(/[-/]/g, '');
                   if (cleanD.length >= 8) {
                      cleanD = `${cleanD.substring(0,4)}-${cleanD.substring(4,6)}-${cleanD.substring(6,8)}`;
                   } else {
                      cleanD = String(dVal);
                   }
                   let cleanT = String(tVal).trim();
                   if (cleanT.length === 5) cleanT += ':00'; // e.g. "20:40" -> "20:40:00"
                   
                   slipTime = new Date(`${cleanD}T${cleanT}+07:00`).getTime();
                } else {
                   const tsMatch = stringData.match(/"(?:timestamp|created_at)"\s*:\s*"([^"]+)"/i);
                   if (tsMatch) {
                      slipTime = new Date(tsMatch[1]).getTime();
                   }
                }
             } catch(e) {
                console.error("Slip time parse error", e);
             }

             if (!slipTime || isNaN(slipTime)) {
                console.warn(`ไม่สามารถอ่านเวลาจากสลิปได้ (D:${rawD} T:${rawT})`);
             }

             if (slipTime && !isNaN(slipTime)) {
                const now = Date.now();
                // slipTime is in milliseconds. Compare with 'now'
                const diffMinutes = Math.floor((now - slipTime) / (1000 * 60));
                
                // Allow a small clock skew (e.g., -2 minutes) but reject if it's more than 10 minutes old
                if (diffMinutes > 10) {
                   const timeErr = `สลิปนี้หมดอายุแล้ว (โอนผ่านไปแล้ว ${diffMinutes} นาที) กรุณาติดต่อแอดมินเพื่อตรวจสอบ`;
                   setTopupError(timeErr);
                   showToast(timeErr, 'error');
                   setIsProcessingTopup(false);
                   return;
                }
                
                // Also reject if it's somehow in the future > 5 minutes (user changed device time? No, our 'now' is from server/client timezone)
                if (diffMinutes < -5) {
                   const timeErr = `เวลาในสลิปไม่ถูกต้อง (อนาคต) กรุณาติดต่อแอดมิน`;
                   setTopupError(timeErr);
                   showToast(timeErr, 'error');
                   setIsProcessingTopup(false);
                   return;
                }
             }
             // --- End Check Slip Time ---

             let revKey = appScreen === 'ASTD' ? 'KUWASHII_GLOBAL_REVENUE_ASTD' : 'KUWASHII_GLOBAL_REVENUE_AOTR';
             const currentRevenue = parseFloat(localStorage.getItem(revKey) || '0');
             localStorage.setItem(revKey, (currentRevenue + amount).toString());

             users[activeUsername] = {
                ...currentUserData,
                balance: (currentUserData.balance || 0) + amount,
                topups: [
                  ...(currentUserData.topups || []),
                  {
                    id: `topup-${Date.now()}`,
                    amount: amount,
                    date: new Date().toISOString(),
                    method: 'Bank Transfer',
                    refCode: transactionId,
                    game: appScreen === 'ASTD' ? 'ASTD' : 'AOTR'
                  }
                ]
             };
             localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(users));

             const bankMsg = `เติมเงินสำเร็จ! ได้รับ ${amount} เครดิต (อ้างอิง: ${transactionId})`;
             showToast(bankMsg, 'success');
             setTopupSuccessMessage(bankMsg);
             setTopupModalStep('success');
             setSlipFile(null);
             if (currentUser) setCurrentUser({ ...currentUser });
          } else {
             const errorMsg = data.message?.massage_th || data.message || 'รหัส QR จากสลิปไม่สามารถตรวจสอบได้';
             const finalErr = typeof errorMsg === 'string' ? errorMsg : 'สลิปไม่ถูกต้อง';
             setTopupError(`API แจ้งเตือน: ${finalErr}`);
             showToast(finalErr, 'error');
          }
        } catch (error: any) {
           console.error("Bank check error:", error);
           const catchErr = 'ระบบเครือข่ายมีปัญหา หรือเรียกใช้ API ไม่ได้';
           setTopupError(catchErr);
           showToast(catchErr, 'error');
        } finally {
           setIsProcessingTopup(false);
        }
      };
      processBankSlip();
      return;
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'forgot') {
      if (!authEmail.trim()) {
        setAuthError('กรุณากรอกอีเมลให้ครบถ้วน');
        return;
      }
    } else {
      if (!authUsername.trim() || !authPassword.trim() || (authMode === 'register' && (!authEmail.trim() || !authConfirmPassword.trim()))) {
        setAuthError(authMode === 'register' ? 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง' : 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
        return;
      }
      if (authMode === 'register' && authPassword !== authConfirmPassword) {
        setAuthError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }
    }

    if (authMode === 'login') {
      const storage = rememberAuth ? localStorage : sessionStorage;
      // remove from both to prevent ghost states
      localStorage.removeItem('KUWASHII_CURRENT_USER'); sessionStorage.removeItem('KUWASHII_CURRENT_USER');
      localStorage.removeItem('KUWASHII_IS_ADMIN'); sessionStorage.removeItem('KUWASHII_IS_ADMIN');

      if (authUsername.trim() === 'Kuwashii_admin' && authPassword === 'ZAZACI09') {
        setIsAdmin(true);
        setCurrentUser({ username: 'Kuwashii_admin' });
        storage.setItem('KUWASHII_IS_ADMIN', 'true');
        storage.setItem('KUWASHII_CURRENT_USER', JSON.stringify({ username: 'Kuwashii_admin' }));
        setShowAuthModal(false);
        setAuthUsername('');
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthError('');
        showToast('เข้าสู่ระบบผู้ดูแลเรียบร้อยแล้ว!', 'success');
        return;
      }

      // Check localStorage database
      const usersData = localStorage.getItem('KUWASHII_USERS');
      const usersDataV2 = localStorage.getItem('KUWASHII_V2_USERS');
      let users: Record<string, any> = usersData ? JSON.parse(usersData) : {};
      let v2Users: Record<string, any> = usersDataV2 ? JSON.parse(usersDataV2) : {};
      
      const usernameTrimmed = authUsername.trim();
      const userData = users[usernameTrimmed];
      const v2UserData = v2Users[usernameTrimmed];
      
      const isPasswordValid = (typeof userData === 'string' 
        ? userData === authPassword 
        : userData?.password === authPassword) || (v2UserData?.password === authPassword);

      if (isPasswordValid) {
        // Sync to V2 format if missing
        if (!v2Users[usernameTrimmed]) {
          v2Users[usernameTrimmed] = {
            username: usernameTrimmed,
            email: typeof userData !== 'string' ? userData?.email : undefined,
            password: authPassword,
            balance: 0,
            joinDate: typeof userData !== 'string' && userData?.createdAt ? userData.createdAt : new Date().toISOString(),
            purchases: []
          };
          localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(v2Users));
        }

        setCurrentUser({ username: usernameTrimmed });
        storage.setItem('KUWASHII_CURRENT_USER', JSON.stringify({ username: usernameTrimmed }));
        storage.setItem('KUWASHII_IS_ADMIN', 'false');
        setShowAuthModal(false);
        setAuthUsername('');
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthError('');
        showToast('เข้าสู่ระบบสำเร็จ!', 'success');
      } else {
        setAuthError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!');
      }
    } else if (authMode === 'forgot') {
      if (!authEmail.includes('@')) {
        setAuthError('รูปแบบอีเมลไม่ถูกต้อง');
        return;
      }
      const usersData = localStorage.getItem('KUWASHII_USERS');
      let users: Record<string, any> = usersData ? JSON.parse(usersData) : {};
      
      let foundUsername: string | null = null;
      for (const [username, data] of Object.entries(users)) {
        if (typeof data !== 'string' && data.email === authEmail.trim()) {
          foundUsername = username;
          break;
        }
      }

      if (!foundUsername) {
        setAuthError('ไม่พบบัญชีที่ผูกกับอีเมลนี้');
        return;
      }
      
      const tempPassword = Math.random().toString(36).slice(-8);
      users[foundUsername].password = tempPassword;
      localStorage.setItem('KUWASHII_USERS', JSON.stringify(users));
      
      setMockEmailModalData({
        email: authEmail.trim(),
        username: foundUsername,
        password: tempPassword
      });
      setShowMockEmailModal(true);
      
      setAuthMode('login');
      setAuthPassword('');
      setAuthEmail('');
      setAuthError('');
      showToast('ส่งอีเมลรีเซ็ตรหัสผ่านสำเร็จ! กรุณาเช็คอีเมลของคุณ', 'success');
    } else {
      // Register Mode
      if (!authEmail.includes('@')) {
        setAuthError('รูปแบบอีเมลไม่ถูกต้อง');
        return;
      }

      const usersData = localStorage.getItem('KUWASHII_USERS');
      const usersDataV2 = localStorage.getItem('KUWASHII_V2_USERS');
      let users: Record<string, any> = usersData ? JSON.parse(usersData) : {};
      let v2Users: Record<string, any> = usersDataV2 ? JSON.parse(usersDataV2) : {};
      
      const targetUsername = authUsername.trim();
      
      // Case-insensitive check for both databases
      const usernameExists = Object.keys(users).some(u => u.toLowerCase() === targetUsername.toLowerCase()) || 
                             Object.keys(v2Users).some(u => u.toLowerCase() === targetUsername.toLowerCase());

      if (usernameExists) {
        setAuthError('ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว!');
        return;
      }
      if (targetUsername.toLowerCase() === 'kuwashii_admin') {
         setAuthError('ไม่สามารถใช้ชื่อผู้ดูแลนี้ได้');
         return;
      }
      
      // Store object instead of string
      users[targetUsername] = {
        password: authPassword,
        email: authEmail.trim(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('KUWASHII_USERS', JSON.stringify(users));
      
      // Sync to V2 format
      v2Users[targetUsername] = {
        username: targetUsername,
        email: authEmail.trim(),
        password: authPassword,
        balance: 0,
        joinDate: new Date().toISOString(),
        purchases: []
      };
      localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(v2Users));
      
      const storage = rememberAuth ? localStorage : sessionStorage;
      localStorage.removeItem('KUWASHII_CURRENT_USER'); sessionStorage.removeItem('KUWASHII_CURRENT_USER');
      localStorage.removeItem('KUWASHII_IS_ADMIN'); sessionStorage.removeItem('KUWASHII_IS_ADMIN');

      // Auto login after register
      setCurrentUser({ username: authUsername.trim() });
      storage.setItem('KUWASHII_CURRENT_USER', JSON.stringify({ username: authUsername.trim() }));
      storage.setItem('KUWASHII_IS_ADMIN', 'false');
      setShowAuthModal(false);
      setAuthUsername('');
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setAuthError('');
      showToast('สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!', 'success');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem('KUWASHII_IS_ADMIN');
    localStorage.removeItem('KUWASHII_CURRENT_USER');
    sessionStorage.removeItem('KUWASHII_IS_ADMIN');
    sessionStorage.removeItem('KUWASHII_CURRENT_USER');
    showToast('ออกจากระบบแล้ว', 'info');
  };

  const handleChangePassword = (newPass: string) => {
    if (!currentUser) return;
    const usersStr = localStorage.getItem('KUWASHII_V2_USERS');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      if (users[currentUser.username]) {
        users[currentUser.username].password = newPass;
        localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(users));
        showToast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
      }
    }
    
    // Also update legacy DB just in case
    const legacyStr = localStorage.getItem('KUWASHII_USERS');
    if (legacyStr) {
      const legacy = JSON.parse(legacyStr);
      if (legacy[currentUser.username]) {
        if (typeof legacy[currentUser.username] === 'string') {
           legacy[currentUser.username] = newPass;
        } else {
           legacy[currentUser.username].password = newPass;
        }
        localStorage.setItem('KUWASHII_USERS', JSON.stringify(legacy));
      }
    }
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    const username = currentUser.username;
    
    // 1. Remove from V2 Users
    const usersStr = localStorage.getItem('KUWASHII_V2_USERS');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      if (users[username]) {
        delete users[username];
        localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(users));
      }
    }

    // 2. Remove from legacy users
    const legacyStr = localStorage.getItem('KUWASHII_USERS');
    if (legacyStr) {
      const legacy = JSON.parse(legacyStr);
      if (legacy[username]) {
        delete legacy[username];
        localStorage.setItem('KUWASHII_USERS', JSON.stringify(legacy));
      }
    }

    handleLogout();
    showToast('ลบบัญชีและข้อมูลทั้งหมดเรียบร้อยแล้ว', 'info');
  };

  // --- Add/Edit/Delete controllers ---
  const handleSaveItem = async (itemData: Omit<StockItem, 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    
    // Fetch latest to prevent race condition
    let currentItems = items;
    const liveData = localStorage.getItem('AOTR_STOCK_ITEMS');
    if (liveData) {
      try {
        currentItems = JSON.parse(liveData);
      } catch(e) {}
    }

    const existingIndex = currentItems.findIndex((it) => it.id === itemData.id);

    let finalItem: StockItem;
    if (existingIndex >= 0) {
      finalItem = {
        ...currentItems[existingIndex],
        ...itemData,
        updatedAt: timestamp,
      } as StockItem;
      showToast(`บันทึกไอเทม ${itemData.name} สำเร็จ!`);
    } else {
      finalItem = {
        ...itemData,
        updatedAt: timestamp,
      } as StockItem;
      showToast(`เพิ่มไอเทม ${itemData.name} ลงระบบเรียบร้อย`);
    }

    // Update state to render instantly
    const updatedList = existingIndex >= 0
      ? currentItems.map((it) => (it.id === itemData.id ? finalItem : it))
      : [finalItem, ...currentItems];

    saveItemsToStorage(updatedList);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    // Fetch latest to prevent race condition
    let currentItems = items;
    const liveData = localStorage.getItem('AOTR_STOCK_ITEMS');
    if (liveData) {
      try {
        currentItems = JSON.parse(liveData);
      } catch(e) {}
    }

    const itemToDelete = currentItems.find((it) => it.id === id);
    if (!itemToDelete) return;

    if (confirm(`คุณมั่นใจหรือไม่ที่จะลบ "${itemToDelete.name}" ออกจากคลังสต๊อกสินค้า?`)) {
      const remainingItems = currentItems.filter((it) => it.id !== id);
      saveItemsToStorage(remainingItems);
      showToast('ลบสินค้าออกจากระบบและฐานข้อมูลเรียบร้อย', 'info');
    }
  };

  const handleBuyItem = (item: StockItem, purchaseQty: number = 1) => {
    if (!currentUser) {
      showToast('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ!', 'error');
      setShowAuthModal(true);
      return;
    }
    if (isAdmin) {
      showToast('ผู้ดูแลระบบไม่สามารถสั่งซื้อสินค้าตัวเองได้', 'info');
      return;
    }

    const usersDataV2 = localStorage.getItem('KUWASHII_V2_USERS');
    if (!usersDataV2) {
      showToast('ไม่พบข้อมูลฐานลูกค้า เกิดข้อผิดพลาดโปรดเข้าสู่ระบบใหม่', 'error');
      return;
    }
    
    const parsedUsers = JSON.parse(usersDataV2);
    const user = parsedUsers[currentUser.username];
    
    if (!user) {
      showToast('ไม่พบบัญชีส่วนตัวในฐานข้อมูล V2 (โปรดออกจากระบบและเข้าใหม่)', 'error');
      return;
    }

    if (purchaseQty > item.quantity) {
      showToast('ขออภัย สินค้าในสต๊อกมีไม่เพียงพอ', 'error');
      return;
    }

    const totalPrice = item.price * purchaseQty;
    if (user.balance < totalPrice) {
      showToast(`ยอดเครดิตในระบบไม่เพียงพอ! (ขาดอีก ${totalPrice - (user.balance || 0)} ฿)`, 'error');
      return;
    }

    setIsProcessingPurchase(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      // Re-fetch users to prevent race conditions during the delay
      const liveUsersData = localStorage.getItem('KUWASHII_V2_USERS');
      if (!liveUsersData) {
         showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า โปรดลองอีกครั้ง', 'error');
         setIsProcessingPurchase(false);
         return;
      }
      const liveParsed = JSON.parse(liveUsersData);
      const liveUser = liveParsed[currentUser.username];
      
      if (!liveUser || liveUser.balance < totalPrice) {
         showToast('ยอดเงินไม่เพียงพอ หรือข้อมูลไม่ถูกต้อง', 'error');
         setIsProcessingPurchase(false);
         return;
      }

      // Read LIVE items to ensure stock is still enough and accurately evaluate gacha drops
      const liveItemsData = localStorage.getItem('AOTR_STOCK_ITEMS');
      let liveItemQty = item.quantity;
      if (liveItemsData) {
        try {
          const fetchedItems = JSON.parse(liveItemsData);
          const found = fetchedItems.find((it: any) => it.id === item.id);
          if (found) liveItemQty = found.quantity;
        } catch(e) {}
      }

      if (purchaseQty > liveItemQty) {
         showToast('ขออภัย สินค้าในสต๊อกถูกซื้อไปหมดหรือมีไม่เพียงพอแล้ว', 'error');
         setIsProcessingPurchase(false);
         return;
      }

      // Perform Gacha Roll based on CURRENT LIVE stock
      let drops: { name: string; color?: string; isSalt?: boolean }[] = [];
      if (item.gachaPool && item.gachaPool.length > 0) {
        for (let i = 0; i < purchaseQty; i++) {
          const currentOpenStock = liveItemQty - i;
          
          let dropped = null;
          
          const guaranteedReward = item.gachaPool.find(r => 
            (r.guaranteedAtStock !== undefined && r.guaranteedAtStock === currentOpenStock) ||
            (r.guaranteedAtStocks && r.guaranteedAtStocks.includes(currentOpenStock))
          );
          
          if (guaranteedReward) {
            dropped = guaranteedReward;
          }
          
          if (dropped) {
            drops.push({ name: dropped.name, color: dropped.color });
          } else {
            drops.push({ name: 'เกลือ', color: '#6b7280', isSalt: true });
          }
        }
      }

      // Process Purchase
      liveUser.balance -= totalPrice;
      if (!liveUser.purchases) liveUser.purchases = [];
      liveUser.purchases.push({
        id: `PUR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        itemId: item.id,
        itemName: item.name,
        price: totalPrice,
        date: new Date().toISOString(),
        gachaDrops: drops.length > 0 ? drops : undefined
      });

      localStorage.setItem('KUWASHII_V2_USERS', JSON.stringify(liveParsed));
      
      // Reduce Stock (pass true to skip the toast inside the helper if we had one)
      handleQuickQuantityChange(item.id, -purchaseQty, true);
      
      setInquiringItem(null);
      setIsProcessingPurchase(false);
      
      if (drops.length > 0) {
        setGachaResult({ item, drops });
      } else {
        setGachaResult({ 
          item, 
          drops: [{ 
            name: `${item.name} x${purchaseQty}`, 
            color: '#10B981', 
            isSalt: false 
          }] 
        });
      }
    }, 1500);
  };

  const handleQuickQuantityChange = async (id: string, delta: number, silent: boolean = false) => {
    setItems((prevItems) => {
      // Fetch latest from localStorage to prevent race conditions or stale state
      let currentItems = prevItems;
      const liveData = localStorage.getItem('AOTR_STOCK_ITEMS');
      if (liveData) {
        try {
          currentItems = JSON.parse(liveData);
        } catch(e) {}
      }

      const target = currentItems.find((it) => it.id === id);
      if (!target) return prevItems; // fallback if not found

      const nextQty = Math.max(0, target.quantity + delta);
      const updated: StockItem = {
        ...target,
        quantity: nextQty,
        initialQuantity: target.initialQuantity !== undefined 
          ? Math.max(target.initialQuantity, nextQty)
          : nextQty,
        updatedAt: new Date().toISOString(),
      };

      const newItems = currentItems.map((it) => (it.id === id ? updated : it));
      localStorage.setItem('AOTR_STOCK_ITEMS', JSON.stringify(newItems));
      window.dispatchEvent(new Event('sync-update'));
      
      if (!silent) {
        setTimeout(() => {
          showToast('อัปเดตจำนวนสต็อกเรียบร้อย!', 'success');
          if (nextQty <= 5 && nextQty < target.quantity) {
            playChime('warning');
          } else if (nextQty > target.quantity) {
            playChime('success');
          } else {
            playChime('info');
          }
        }, 0);
      }
      return newItems;
    });
  };

  const handleTogglePin = async (id: string) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;

    const updated: StockItem = {
      ...target,
      isPinned: !target.isPinned,
      updatedAt: new Date().toISOString(),
    };

    const newItems = items.map((it) => (it.id === id ? updated : it));
    saveItemsToStorage(newItems);
    if (updated.isPinned) {
      showToast(`ปักหมุดไอเทม ${updated.name} แล้ว!`, 'success');
    } else {
      showToast(`ยกเลิกการปักหมุดไอเทม ${updated.name} แล้ว`, 'info');
    }
  };

  const handleResetPresets = async () => {
    if (confirm('คุณต้องการรีเซ็ตสินค้าในสต๊อกกลับไปเป็นค่าเริ่มต้นจากเกม AOT Revolution หรือไม่? (ข้อมูลที่แก้ไขจะหายไป)')) {
      saveItemsToStorage(DEFAULT_PRESETS);
      showToast('คืนค่าสต๊อคเริ่มต้นในระบบเรียบร้อย!', 'info');
    }
  };

  const handleClearStockToZero = async () => {
    if (confirm('⚠️ คุณแน่ใจหรือไม่ที่จะรีเซ็ตทุกไอเทมในคลังสินค้าปัจจุบันให้เหลือจำนวนสต๊อกเป็น 0 ชิ้น? (ข้อมูลราคาและไอเทมจะอยู่ครบ แต่สต๊อกจะกลายเป็น 0 ทั้งหมด)')) {
      const updatedList = items.map((it) => ({
        ...it,
        quantity: 0,
        updatedAt: new Date().toISOString()
      }));
      saveItemsToStorage(updatedList);
      showToast('เซ็ตจำนวนสินค้าในสต๊อกทั้งหมดเหลือ 0 ชิ้น เรียบร้อย!', 'success');
    }
  };

  const handleDeleteAllProducts = async () => {
    if (confirm('⚠️⚠️⚠️ คุณแน่ใจหรือไม่ที่จะลบสินค้าทั้งหมดออกจากระบบร้านค้าและคลาวด์เซิร์ฟเวอร์? (ข้อมูลสินค้าทั้งหมดและรูปภาพจะถูกล้างออกและแสดงผลเป็นหน้าว่างเปล่า มีสินค้า 0 รายการ)')) {
      saveItemsToStorage([]);
      showToast('ลบข้อมูลสินค้าทั้งหมดเรียบร้อยแล้ว!', 'info');
    }
  };

  const getLatestUpdatedRelativeTime = (list: StockItem[]): string => {
    if (!list || list.length === 0) return 'ไม่มีบันทึกข้อมูล';
    try {
      const timestamps = list.map(it => new Date(it.updatedAt).getTime()).filter(t => !isNaN(t));
      if (timestamps.length === 0) return 'ไม่มีบันทึกข้อมูล';
      const latestTime = Math.max(...timestamps);
      const date = new Date(latestTime);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 15) return 'เมื่อสักครู่นี้';
      if (diffSec < 60) return 'เมื่อไม่กี่วินาทีก่อน';
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
      if (diffDays === 1) return 'เมื่อวานนี้';
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
      
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      });
    } catch (e) {
      return 'ไม่ระบุเวลา';
    }
  };

  // Import / Export database functions
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aotr_stock_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('ส่งออกไฟล์ข้อมูลเรียบร้อยแล้ว', 'success');
    } catch (e) {
      showToast('ส่งออกผิดพลาด', 'error');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          const isValid = importedData.every(it => it.id && it.name && typeof it.price === 'number');
          if (isValid) {
            saveItemsToStorage(importedData as StockItem[]);
            showToast('นำเข้าคลังสต๊อกสำเร็จและอัปเดตระบบแล้ว!', 'success');
          } else {
            showToast('ฟอร์แมตข้อมูลในไฟล์ JSON ไม่ถูกต้อง', 'error');
          }
        }
      } catch (err) {
        showToast('อ่านไฟล์ JSON ล้มเหลว', 'error');
      }
    };
    reader.readAsText(file);
  };

  // --- Filtering & Sorting Compute ---
  const filteredItems = items.filter((item) => {
    const isASTDItem = item.game === 'ASTD';
    const matchesGame = appScreen === 'ASTD' ? isASTDItem : !isASTDItem;

    if (!matchesGame) return false;

    const searchStr = (search || '').toLowerCase();
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchStr) ||
      (item.description || '').toLowerCase().includes(searchStr) ||
      (item.category || '').toLowerCase().includes(searchStr);

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity;

    let matchesStatus = true;
    if (selectedStatus === 'in-stock') {
      matchesStatus = item.quantity > 5;
    } else if (selectedStatus === 'low-stock') {
      matchesStatus = item.quantity > 0 && item.quantity <= 5;
    } else if (selectedStatus === 'out-of-stock') {
      matchesStatus = item.quantity === 0;
    }

    const matchesPopular = !showPopularOnly || !!item.isPopular;

    return matchesSearch && matchesCategory && matchesRarity && matchesStatus && matchesPopular;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    // 1. Stock Status Prioritization: In-stock items (quantity > 0) go up, Out-of-stock items (quantity === 0) go down
    const aHasStock = a.quantity > 0 ? 1 : 0;
    const bHasStock = b.quantity > 0 ? 1 : 0;
    if (aHasStock !== bHasStock) {
      return bHasStock - aHasStock; // 1 comes before 0 (in-stock first)
    }

    // 2. Pin Status: Pinned items (isPinned === true) go up, Unpinned items go down
    const aPinned = a.isPinned ? 1 : 0;
    const bPinned = b.isPinned ? 1 : 0;
    if (aPinned !== bPinned) {
      return bPinned - aPinned; // 1 comes before 0 (pinned first)
    }

    // 2.5 Category Grouping: When viewing 'All' categories, group items of the same category together
    if (selectedCategory === 'all') {
      const categoryOrder = appScreen === 'ASTD' 
        ? ['สุ่มตัวละคร - ออสตา', 'Starter Accounts', 'High Level / PvP', 'Rare Units', 'Gems / Currency', 'Rank Boosting', 'Bundle Offers', 'Gifts / Codes', 'Other Services', 'Other']
        : ['Serum', 'Bloodline', 'Skin', 'Artifact', 'Scroll/Key', 'Perk', 'Other'];
      const indexA = categoryOrder.indexOf(a.category);
      const indexB = categoryOrder.indexOf(b.category);
      if (indexA !== -1 && indexB !== -1 && indexA !== indexB) {
        return indexA - indexB; // Keeps category order unified
      }
    }

    // 3. User sub-sort criteria
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock-desc':
        return b.quantity - a.quantity;
      case 'stock-asc':
        return a.quantity - b.quantity;
      case 'rarity-desc': {
        const rarityWeights = { Mythic: 5, Legendary: 4, Epic: 3, Rare: 2, Common: 1 };
        return rarityWeights[b.rarity] - rarityWeights[a.rarity];
      }
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });


  const renderModals = () => (
    <>
      {/* Processing Purchase / Topup Overlay */}
      <AnimatePresence>
        {(isProcessingPurchase || isProcessingTopup) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-widest mb-2 font-display">ระบบกำลังทำรายการ...</h3>
              <p className="text-xs text-zinc-400 font-mono">กรุณารอสักครู่ (Do not close)</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mock Email Modal */}
      <AnimatePresence>
        {showMockEmailModal && mockEmailModalData && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowMockEmailModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative z-10"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">จำลองการส่งอีเมล</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  เนื่องจากระบบนี้เป็นแอปพลิเคชันเวอร์ชันทดสอบที่ไม่มีเซิร์ฟเวอร์ส่งอีเมลจริง ระบบจึงแสดงรหัสผ่านฉุกเฉินให้ท่านทราบบนหน้าจอดังนี้
                </p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 space-y-3 mb-6">
                <div>
                   <span className="text-zinc-500">ผู้รับ:</span> {mockEmailModalData.email}
                </div>
                <div>
                   <span className="text-zinc-500">หัวข้อ:</span> [Kuwashii] รีเซ็ตรหัสผ่านบัญชี {mockEmailModalData.username}
                </div>
                <div className="pt-3 border-t border-zinc-800/50">
                  รหัสผ่านใหม่ของคุณคือ: 
                  <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-2 rounded-lg mt-2 text-center text-sm font-bold tracking-widest">
                    {mockEmailModalData.password}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMockEmailModal(false)}
                className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold opacity-90 hover:opacity-100 flex justify-center items-center transition-all"
              >
                รับทราบและปิด
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative max-w-sm w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl z-10"
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-900 transition-colors"
                onClick={() => setShowAuthModal(false)}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2 mb-5">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-500">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    {authMode === 'login' ? 'เข้าสู่ระบบบัญชีของคุณ' : authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : 'สมัครสมาชิกใหม่'}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    ระบบตัวแทนใช้งานและผู้ดูแลคลังสินค้า
                  </p>
                </div>
              </div>

              {authMode !== 'forgot' && (
                <div className="flex gap-2 w-full p-1 bg-zinc-900/50 rounded-xl mb-5 border border-zinc-800">
                  <button
                     type="button"
                     onClick={() => { setAuthMode('login'); setAuthError(''); }}
                     className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${authMode === 'login' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >เข้าสู่ระบบ</button>
                  <button
                     type="button"
                     onClick={() => { setAuthMode('register'); setAuthError(''); }}
                     className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${authMode === 'register' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >สมัครสมาชิก</button>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4 font-sans">
                <div className="space-y-3">
                  {authMode !== 'forgot' && (
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        ชื่อผู้ใช้งาน (Username)
                      </label>
                      <input
                        type="text"
                        value={authUsername}
                        onChange={(e) => {
                          setAuthUsername(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="เช่น Kuwashii_member"
                        required={authMode !== 'forgot'}
                        autoFocus={authMode !== 'forgot'}
                        autoComplete="username"
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-medium"
                      />
                    </div>
                  )}
                  
                  {(authMode === 'register' || authMode === 'forgot') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1 mt-3">
                        อีเมล (Email) <span className="text-emerald-500">*จำเป็น</span>
                      </label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => {
                          setAuthEmail(e.target.value);
                          setAuthError('');
                        }}
                        placeholder={authMode === 'forgot' ? "อีเมลที่ใช้สมัครบัญชี" : "สำหรับใช้รีเซ็ตรหัสผ่านหากลืม"}
                        required
                        autoComplete="email"
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-medium"
                      />
                    </motion.div>
                  )}

                  {authMode !== 'forgot' && (
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        รหัสผ่าน (Password)
                      </label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => {
                          setAuthPassword(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="ป้อนรหัสผ่าน..."
                        required={authMode !== 'forgot'}
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-mono tracking-wider font-semibold"
                      />
                      {authMode === 'login' && (
                        <label className="flex items-center gap-2 mt-3 cursor-pointer group w-fit text-[11px] text-zinc-400">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={rememberAuth}
                              onChange={(e) => setRememberAuth(e.target.checked)}
                              className="appearance-none w-3.5 h-3.5 rounded border border-zinc-700 bg-zinc-900 checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer"
                            />
                            <Check className={`w-2.5 h-2.5 text-white absolute pointer-events-none transition-opacity ${rememberAuth ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                          <span className="group-hover:text-zinc-300 transition-colors">จดจำการเข้าสู่ระบบไว้</span>
                        </label>
                      )}
                    </div>
                  )}

                  {authMode === 'register' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1 mt-3">
                        ยืนยันรหัสผ่าน (Confirm Password) <span className="text-emerald-500">*จำเป็น</span>
                      </label>
                      <input
                        type="password"
                        value={authConfirmPassword}
                        onChange={(e) => {
                          setAuthConfirmPassword(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="ยืนยันรหัสผ่านอีกครั้ง..."
                        required={authMode === 'register'}
                        autoComplete="new-password"
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-mono tracking-wider font-semibold"
                      />
                    </motion.div>
                  )}

                  {authMode === 'login' && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setAuthError('');
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium underline-offset-2 hover:underline cursor-pointer"
                      >
                        ลืมรหัสผ่าน? (รีเซ็ตด้วยอีเมล)
                      </button>
                    </div>
                  )}

                  {authError && (
                    <p className="text-[11px] text-red-500 text-center font-sans mt-2.5 flex items-center justify-center gap-1 leading-normal bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-900/35">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  {authMode === 'forgot' ? (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      className="w-1/2 py-2 px-4 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white bg-transparent text-xs font-semibold cursor-pointer transition-colors"
                    >
                      กลับไปหน้าเข้าสู่ระบบ
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(false)}
                      className="w-1/2 py-2 px-4 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white bg-transparent text-xs font-semibold cursor-pointer transition-colors"
                    >
                      ยกเลิก
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`w-1/2 py-2 px-4 rounded-xl ${authMode === 'login' ? 'bg-indigo-600 hover:bg-indigo-500' : authMode === 'forgot' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white border-none text-xs font-extrabold cursor-pointer transition-all active:scale-95`}
                  >
                    {authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : 'ลงทะเบียน'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Up Modal */}
      <AnimatePresence>
        {showTopupModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                 setShowTopupModal(false);
                 setTopupModalStep('select');
                 setTopupCode('');
                 setTosAccepted(false);
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-5 w-full max-w-sm relative z-10 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="text-center mb-5">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 mb-2">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  เลือกช่องทาง <span className="text-red-500">ชำระเงิน</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  ทำรายการผ่านช่องทางที่ท่านสะดวก
                </p>
              </div>

              {topupModalStep === 'select' ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedTopupChannel('angpao')}
                    disabled={!tosAccepted}
                    className={`w-full relative bg-zinc-900 border ${selectedTopupChannel === 'angpao' ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800/50'} rounded-2xl p-4 flex items-center gap-4 transition-all text-left group ${!tosAccepted ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    <div className="absolute -top-3 -right-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-md">
                      <Gift className="w-3 h-3" /> แนะนำ
                    </div>
                    <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-inner pt-1 pl-1 rotate-[-5deg] group-hover:rotate-[-2deg] transition-transform">
                      <Gift className="w-8 h-8 text-white/90 drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">ซองอั่งเปา</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">เติมเงินผ่านระบบซองอั่งเปา<br/>ของทรูมันนี่วอลเลท</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedTopupChannel('bank')}
                    disabled={!tosAccepted}
                    className={`w-full bg-zinc-900 border ${selectedTopupChannel === 'bank' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50'} rounded-2xl p-4 flex items-center gap-4 transition-all text-left ${!tosAccepted ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-inner">
                      <Landmark className="w-8 h-8 text-white/90 drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">ธนาคาร (K BANK)</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">โอนเงินผ่านบัญชีธนาคารกสิกรไทย<br/>รองรับทุกธนาคารชั้นนำ</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedTopupChannel('coupon')}
                    disabled={!tosAccepted}
                    className={`w-full bg-zinc-900 border ${selectedTopupChannel === 'coupon' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50'} rounded-2xl p-4 flex items-center gap-4 transition-all text-left ${!tosAccepted ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
                      <Ticket className="w-8 h-8 text-white/90 drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">คูปอง</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">เติมเงินผ่านรหัสคูปอง<br/>หรือโค้ดส่วนลดพิเศษ</p>
                    </div>
                  </button>

                  <div className="pt-4 border-t border-zinc-800/50 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={tosAccepted}
                          onChange={(e) => {
                            setTosAccepted(e.target.checked);
                            if (!e.target.checked) setSelectedTopupChannel(null);
                          }}
                          className="peer appearance-none w-5 h-5 border-2 border-zinc-700 rounded bg-zinc-900 checked:bg-red-500 checked:border-red-500 transition-all"
                        />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors select-none">
                        ยอมรับ <span className="text-red-500 font-medium hover:underline" onClick={(e) => { e.preventDefault(); setShowTopupTos(true); }}>ข้อกำหนดในการให้บริการ</span>
                      </span>
                    </label>

                    <button
                      onClick={() => {
                        if (!tosAccepted) {
                           showToast('กรุณายอมรับข้อกำหนดในการให้บริการก่อน', 'error');
                        } else if (!selectedTopupChannel) {
                           showToast('กรุณาเลือกช่องทางการชำระเงินที่ต้องการใช้', 'error');
                        } else {
                           setTopupModalStep(selectedTopupChannel);
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-zinc-300 hover:bg-white text-black text-sm font-bold opacity-80 hover:opacity-100 flex justify-center items-center gap-2 transition-all"
                    >
                       ถัดไป <span>→</span>
                    </button>
                  </div>
                </div>
              ) : topupModalStep === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">ทำรายการสำเร็จ!</h3>
                  <div className="text-emerald-300 text-sm mb-6 px-4 leading-relaxed font-mono tracking-wide flex flex-col gap-2">
                    {topupSuccessMessage ? (
                      topupSuccessMessage.split('\n').map((line, idx) => (
                        <p key={idx} className={line.includes('จากซองของ:') ? 'text-amber-400 font-bold bg-amber-500/10 py-1.5 px-2 rounded-lg' : ''}>
                           {line}
                        </p>
                      ))
                    ) : (
                      <p>ยอดเครดิตของคุณได้รับการอัปเดตเรียบร้อยแล้ว</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowTopupModal(false);
                      setTopupModalStep('select');
                      setTopupSuccessMessage('');
                      setTosAccepted(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold cursor-pointer transition-all shadow-lg"
                  >
                    ตกลง
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTopupSubmit} className="space-y-4">
                   <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <button 
                        type="button"
                        onClick={() => { setTopupModalStep('select'); setTopupCode(''); }}
                        className="text-zinc-500 hover:text-white"
                      >
                         <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h4 className="font-bold text-sm text-zinc-300">
                         {topupModalStep === 'angpao' ? 'กรอกลิ้งค์ซองอั่งเปา' : topupModalStep === 'bank' ? 'แจ้งสลิปโอนเงินเข้า K BANK' : 'กรอกโค้ดคูปอง'}
                      </h4>
                   </div>

                   {topupModalStep === 'angpao' && (
                     <div className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                       <p className="text-xs text-red-300 mb-2 leading-relaxed">
                         สร้างซองของขวัญจากแอป <strong className="text-red-400">TrueMoney Wallet</strong> แบ่งจำนวนเงินเท่ากัน และระบุจำนวนคนที่รับซองเป็น 1 คน
                       </p>
                       <p className="text-[10px] text-red-400/70">ยอดเงินจะถูกแปลงเป็นเครดิตตามมูลค่าในซอง (ขั้นต่ำ 10 บาท, ค่าธรรมเนียม 2.9%)</p>
                     </div>
                   )}

                   {topupModalStep === 'bank' && (
                     <div className="mb-2 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl flex flex-col items-center text-center">
                       <div className="flex flex-col items-center justify-center gap-1.5">
                          <p className="text-[10px] text-blue-300">กรุณาโอนเงินมาที่บัญชี (QR Code):</p>
                          <div className="flex items-center gap-2">
                             <p className="text-base md:text-lg font-bold text-white tracking-widest font-mono">213-3-81446-1</p>
                             <button type="button" onClick={() => { navigator.clipboard.writeText('2133814461'); showToast('คัดลอกเลขบัญชีแล้ว', 'success'); }} className="p-1 justify-center bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded transition-colors duration-200">
                                <Copy className="w-4 h-4" />
                             </button>
                          </div>
                          <p className="text-sm md:text-base font-semibold text-blue-400">นายธีรเทพ ทองเกตุ</p>
                       </div>
                       
                       <a href="https://img2.pic.in.th/1000098251.jpg" download target="_blank" rel="noreferrer" className="block w-full max-w-[150px] border-2 border-blue-500/30 rounded-lg overflow-hidden my-2 hover:opacity-90 transition-opacity">
                         <img src="https://img2.pic.in.th/1000098251.jpg" alt="Bank QR" className="w-full h-auto" />
                       </a>
                       
                       <div className="w-full space-y-2 mt-2">
                          <p className="text-xs text-blue-400/90 border-t border-blue-500/20 pt-2 leading-tight">
                            คลิกที่รูปเพื่อดูรูปใหญ่ หรือดาวน์โหลดเก็บไว้<br/>เมื่อโอนเสร็จสิ้น ให้อัปโหลด "ภาพสลิปโอนเงิน" ด้านล่าง
                          </p>
                          <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 text-xs md:text-sm text-red-500 font-bold leading-tight inline-block shadow-sm">
                             ⚠️ โปรดอัปโหลดสลิปภายใน 10 นาที หลังจากโอนเสร็จสิ้น
                          </div>
                       </div>
                     </div>
                   )}

                   {topupModalStep === 'coupon' && (
                     <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                       <p className="text-xs text-emerald-300 mb-2 leading-relaxed">
                         กรอกรหัสคูปองที่คุณได้รับจากโปรโมชั่นหรือกิจกรรม เพื่อแลกรับเครดิตเข้าสู่ระบบฟรี
                       </p>
                       <p className="text-[10px] text-emerald-400/70">คูปอง 1 รหัส สามารถใช้งานได้เพียง 1 ครั้งเท่านั้น</p>
                     </div>
                   )}

                   {topupError && (
                     <div className="mb-4 bg-red-500/20 border-2 border-red-500 text-red-200 text-xs p-3 rounded-lg text-center break-words shadow-sm shadow-red-500/10">
                       {topupError}
                     </div>
                   )}

                   <div>
                     {topupModalStep === 'bank' ? (
                       <label className="flex flex-col items-center justify-center w-full min-h-[5rem] py-2 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-colors bg-zinc-900 group">
                         <div className="flex flex-col items-center justify-center pt-2 pb-2 px-4 text-center">
                           <UploadCloud className="w-5 h-5 text-zinc-500 mb-1 group-hover:text-blue-400 transition-colors" />
                           <p className="text-[9px] text-zinc-400 font-mono break-all max-w-full">
                             {slipFile ? <img src={URL.createObjectURL(slipFile)} alt="slip" className="max-h-24 object-contain rounded" /> : "คลิกเพื่ออัปโหลดรูปภาพสลิป"}
                           </p>
                         </div>
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) setSlipFile(e.target.files[0]); }} />
                       </label>
                     ) : (
                       <input
                         type="text"
                         value={topupCode}
                         onChange={(e) => setTopupCode(e.target.value)}
                         placeholder={topupModalStep === 'angpao' ? "https://gift.truemoney.com/campaign/..." : "กรอกโค้ดที่นี่..."}
                         required
                         className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-all text-xs font-mono placeholder-zinc-600"
                       />
                     )}
                   </div>

                   <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessingTopup}
                      className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold flex justify-center items-center gap-2 transition-all shadow-lg"
                    >
                       {isProcessingTopup ? (
                         <>
                           <Loader2 className="w-5 h-5 animate-spin" /> กำลังดำเนินการ...
                         </>
                       ) : (
                         'ยืนยันการทำรายการ'
                       )}
                    </button>
                    {isProcessingTopup && (
                      <p className="text-center text-[10px] text-amber-400 mt-2 font-semibold animate-pulse tracking-wide font-sans">
                        ⚠️ ห้าม ปิด/ออก หน้านี้จนกว่าทำรายการสำเร็จ
                      </p>
                    )}
                   </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Topup Terms Modal */}
      <AnimatePresence>
        {showTopupTos && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowTopupTos(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative z-10"
            >
              <div className="text-center mb-6">
                 <h3 className="font-display text-lg font-bold text-white mb-2">ข้อกำหนดในการให้บริการ</h3>
                 <p className="text-xs text-zinc-400">กรุณาอ่านและทำความเข้าใจก่อนทำรายการ</p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 mb-6 space-y-3">
                 <p className="text-[11px] text-zinc-300 leading-relaxed text-center">
                    การทำรายการเติมเงินเข้าระบบทุกช่องทาง (ทั้งซองอั่งเปา, ธนาคาร, หรือคูปอง) <strong className="text-red-400">จะไม่สามารถขอคืนเงินได้ในทุกกรณี</strong>
                 </p>
                 <p className="text-[11px] text-zinc-400 leading-relaxed text-center">
                    เมื่อท่านทำการยืนยัน ถือว่าท่านยอมรับข้อตกลงนี้และเข้าใจว่ายอดเงินจะถูกเพิ่มเข้าเป็นเครดิตในระบบทันที
                 </p>
              </div>
              <button
                onClick={() => setShowTopupTos(false)}
                className="w-full py-3 px-4 rounded-xl bg-zinc-300 hover:bg-white text-black text-sm font-bold flex justify-center items-center transition-all"
              >
                 รับทราบและปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inquiry Summary & Clipboard tool modal */}
      {(inquiringItem?.gachaPool && inquiringItem.gachaPool.length > 0) ? (
        <RandomBoxModal
          item={inquiringItem}
          onClose={() => setInquiringItem(null)}
          onBuy={handleBuyItem}
        />
      ) : (
        <InquiryModal
          item={inquiringItem}
          onClose={() => setInquiringItem(null)}
          onBuy={appScreen === 'ASTD' ? handleBuyItem : undefined}
        />
      )}

      {/* Gacha Result Modal */}
      <GachaResultModal
        isOpen={!!gachaResult}
        onClose={() => {
          setGachaResult(null);
          setShowHistoryModal(true);
        }}
        result={gachaResult}
      />

      {/* Admin modal for Adding/Editing stock items */}
      <AdminModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        currentGame={appScreen === 'ASTD' ? 'ASTD' : 'AOTR'}
      />

      <StockManagerModal
        isOpen={isStockManagerOpen}
        onClose={() => setIsStockManagerOpen(false)}
        items={items.filter(it => appScreen === 'ASTD' ? it.game === 'ASTD' : it.game !== 'ASTD')}
        onEdit={(item) => {
          setEditingItem(item);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteItem}
        onAddNew={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
      />
      
      <CustomerDatabaseModal
        isOpen={isCustomerDbOpen}
        onClose={() => setIsCustomerDbOpen(false)}
        appScreen={appScreen}
        onViewUserHistory={(username) => {
          setViewingUserHistory(username);
        }}
      />

      <CouponManagerModal
        isOpen={isCouponManagerOpen}
        onClose={() => setIsCouponManagerOpen(false)}
      />

      <AnnouncementManagerModal
        isOpen={isAnnouncementManagerOpen}
        onClose={() => setIsAnnouncementManagerOpen(false)}
      />

      <UserSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        currentUser={currentUser}
        onChangePassword={handleChangePassword}
      />

      {(currentUser || viewingUserHistory) && (
        <HistoryModal
          isOpen={showHistoryModal || !!viewingUserHistory}
          onClose={() => { setShowHistoryModal(false); setViewingUserHistory(null); }}
          purchases={JSON.parse(localStorage.getItem('KUWASHII_V2_USERS') || '{}')[viewingUserHistory || currentUser?.username || '']?.purchases || []}
          topups={JSON.parse(localStorage.getItem('KUWASHII_V2_USERS') || '{}')[viewingUserHistory || currentUser?.username || '']?.topups || []}
        />
      )}
    
    </>
  );

  // Calculate high-level stats based on current game context
  const currentContextItems = appScreen === 'ASTD' 
       ? items.filter(it => it.game === 'ASTD') 
       : items.filter(it => it.game !== 'ASTD');
       
  const totalStockItems = currentContextItems.length;
  const inStockCount = currentContextItems.filter(it => it.quantity > 0).length;
  const totalStockUnits = currentContextItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalStockValue = currentContextItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  if (appScreen === 'LOADING' || appScreen === 'TRANSITION') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-mono">
        {/* Abstract CRT Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] z-50 pointer-events-none opacity-50" />
        
        {/* Dynamic Dark Gradients */}
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-emerald-900/10 rounded-full blur-[120px]" />
        
        <div className="z-10 flex flex-col items-center relative gap-8">
              <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={
                loadingProgress === 100 
                ? {
                    opacity: [1, 0, 1, 0, 0.5, 0],
                    scale: [1, 1.05, 0.95, 1.1, 0.9, 1.2],
                    filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'invert(0.8)', 'blur(4px)', 'none'],
                    x: [0, -10, 15, -20, 10, 0],
                    y: [0, 10, -10, 15, -5, 0],
                  }
                : { opacity: 1, scale: 1 }
              }
              transition={{ 
                duration: loadingProgress === 100 ? 0.2 : 0.8, 
                ease: loadingProgress === 100 ? "linear" : "easeInOut"
              }}
              className="relative flex flex-col items-center justify-center gap-6"
            >
              <img 
                src="https://s.imgz.io/2026/05/31/100009859524d3e1b8f0277601.gif" 
                alt="Loading" 
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain opacity-90 rounded-2xl drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              />
              
              <div className="flex flex-col items-center w-full max-w-[16rem]">
                 <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-white tracking-[0.2em] uppercase text-[10px] mb-3 opacity-80 animate-pulse">
                   {appScreen === 'LOADING' ? 'SYSTEM STARTUP...' : 'SECURING CONNECTION...'}
                 </div>
                 <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden shadow-inner">
                   <div 
                     className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300 ease-out"
                     style={{ width: `${loadingProgress}%` }}
                   />
                 </div>
              </div>
            </motion.div>
        </div>

        {/* Floating background coordinates */}
        <div className="absolute top-8 left-8 text-[9px] text-zinc-800 font-mono hidden md:block">
          SYS.LOC.::45.9921_12.0019
        </div>
        <div className="absolute bottom-8 right-8 text-[9px] text-zinc-800 font-mono hidden md:block">
          {`MEM::[0x${Math.floor(Math.random() * 1000000).toString(16).toUpperCase()}]`}
        </div>
      </div>
    );
  }

  if (appScreen === 'SELECT') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-50 z-0"
          style={{ backgroundImage: "url('https://s.imgz.io/2026/05/31/1000098494b68242f76bd7e2f7.gif')" }}
        />
        <div className="absolute inset-0 bg-zinc-950/60 z-0 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[30rem] bg-gradient-to-b from-purple-900/20 to-transparent filter blur-[80px] pointer-events-none z-0" />
        
        <div className="z-10 w-full max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-xl sm:text-2xl font-black text-white tracking-wide">
              เลือกเกมที่<span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">สนใจ</span>ได้เลย 🎮
            </h1>
            <p className="text-zinc-400 mt-2 text-[11px] sm:text-sm max-w-xl mx-auto">
              สวัสดีค้าบ 🙏 สนใจเกมไหนดูก่อนได้เลยน้า ร้านเรามีของให้เลือกเพียบ แถมมีระบบสุ่มกล่องด้วย ทักเข้ามาสอบถามได้ตลอดเลยค้าบผม!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* AOT Revolution */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => {
                setTargetScreen('AOTR');
                setAppScreen('TRANSITION');
              }}
              className="group relative rounded-3xl border border-zinc-800 bg-zinc-900/50 p-3 cursor-pointer hover:border-amber-500/50 transition-all duration-500 overflow-hidden shadow-xl shadow-black/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="aspect-video w-full rounded-2xl overflow-hidden relative mb-4">
                 <img src="https://img1.pic.in.th/images/1000098144.webp" alt="Attack on Titan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-50 group-hover:opacity-90" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent opacity-80" />
                 <div className="absolute bottom-4 left-4 z-20">
                   <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest backdrop-blur border border-amber-500/30">Attack on titan Revolution</span>
                 </div>
              </div>
              <div className="px-3 pb-3 relative z-10 text-left">
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">สินค้า ATOR โดย Kuwashii El</h3>
                <p className="text-sm text-zinc-500 mt-1 font-mono">Connect to the Paradis terminal.</p>
              </div>
            </motion.div>

            {/* ASTD */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                setTargetScreen('ASTD');
                setAppScreen('TRANSITION');
              }}
              className="group relative rounded-3xl border border-zinc-800 bg-zinc-900/50 p-3 cursor-pointer hover:border-emerald-500/50 transition-all duration-500 overflow-hidden shadow-xl shadow-black/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="aspect-video w-full rounded-2xl overflow-hidden relative mb-4">
                 <img src="https://img2.pic.in.th/1000098143.jpg" alt="All Star Tower Defense" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-50 group-hover:opacity-90" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent opacity-80" />
                 <div className="absolute bottom-4 left-4 z-20">
                   <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest backdrop-blur border border-emerald-500/30">All Star Tower Defense</span>
                 </div>
              </div>
              <div className="px-3 pb-3 relative z-10 text-left">
                <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">สินค้า ASTD โดย Dazz kar</h3>
                <p className="text-sm text-zinc-500 mt-1 font-mono">Connect to the Multiverse defense grid.</p>
              </div>
            </motion.div>
          </div>
        </div>
      {renderModals()}
      </div>
    );
  }

  if (appScreen === 'ASTD') {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white pb-20 sm:pb-0 relative overflow-x-hidden">
        <AnnouncementPopup appScreen={appScreen} />
        <Snowfall />

        {/* Dynamic Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -30, x: '-50%' }}
              style={{ zIndex: 9999 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold tracking-wide border backdrop-blur-md ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/30'
                  : toastMessage.type === 'error'
                  ? 'bg-red-950/90 text-red-400 border-red-500/30'
                  : 'bg-zinc-900/90 text-zinc-300 border-zinc-705'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : toastMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <Info className="w-4 h-4 text-blue-400" />
              )}
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Header Section */}
        <header className="relative border-b border-zinc-900 bg-zinc-950 py-7 overflow-hidden">
          {/* Background Atmosphere */}
          <div className="absolute top-0 right-0 w-[45rem] h-[24rem] bg-gradient-to-l from-indigo-600/5 to-transparent filter blur-[120px] pointer-events-none -z-10" />
          <div className="absolute top-0 left-0 w-[30rem] h-[20rem] bg-gradient-to-r from-blue-600/5 to-transparent filter blur-[100px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              
              {/* Title, Branding & Credits */}
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md animate-pulse shadow-md shadow-indigo-950">
                    Live Stock
                  </span>
                  <span className="text-zinc-600 text-xs font-mono">v1.2.0</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span>ALL STAR TOWER DEFENSE</span>
                  <span className="text-zinc-500 font-light">|</span>
                  <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">STOCK CHECKER</span>
                </h1>
                
                {/* Creator Tag line requested by User */}
                <div className="mt-2 text-sm text-zinc-400 flex flex-wrap items-center gap-2 font-mono">
                  <span className="text-zinc-600">•</span>
                  <span>Made by</span>
                  <span className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer font-bold relative group">
                    Kuwashii El (@_.texraxit)
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </span>
                  <span className="text-zinc-600 ml-2">•</span>
                  <span className="ml-1 text-zinc-300 italic">สินค้าโดย <span className="text-zinc-100 font-bold not-italic font-sans underline decoration-indigo-500/50 underline-offset-4">Dazz kar</span></span>
                </div>
              </div>

              {/* Top Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Chat now button */}
                <a
                  href="https://m.me/DazzRFkaz"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="py-2.5 px-4 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/5 hover:scale-[1.02] active:scale-95"
                  id="btn-nav-chat-astd"
                >
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>ทักแชททันที (Messenger)</span>
                </a>

                {currentUser ? (
                  <div className="flex flex-wrap items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl hidden sm:flex">
                    {/* User Tag */}
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 h-full font-sans ${isAdmin ? 'text-amber-400 bg-amber-500/10' : 'text-indigo-400 bg-indigo-500/10'}`}>
                      {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                      <span>{currentUser.username} {isAdmin && '(Admin)'}</span>
                    </span>
                    {!isAdmin && (
                      <>
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 h-full font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                          <Coins className="w-3.5 h-3.5" />
                          <span>เครดิต: ฿{Number(JSON.parse(localStorage.getItem('KUWASHII_V2_USERS') || '{}')[currentUser.username]?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowTopupModal(true)}
                          className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>เติมเงิน</span>
                        </button>
                      </>
                    )}

                    {/* Add Product Shortcut (Only Admins) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setIsFormOpen(true);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-white/5 active:scale-95"
                        id="btn-nav-add-astd"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ลงขายสินค้า</span>
                      </button>
                    )}

                    {/* History Button (User only) */}
                    {!isAdmin && (
                      <button
                        type="button"
                        onClick={() => setShowHistoryModal(true)}
                        className="py-1.5 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-500/20"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>ประวัติ</span>
                      </button>
                    )}

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                      id="btn-nav-logout-astd"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                    className="py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-extrabold transition-all duration-300 hidden sm:flex items-center gap-2 cursor-pointer shadow-xl shadow-black/30"
                    id="btn-nav-auth-astd"
                  >
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
                  </button>
                )}
                <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
                <button
                  type="button"
                  onClick={() => setAppScreen('SELECT')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-xl shadow-black/30"
                >
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span className="hidden md:inline">กลับหน้าเข้าสู่ระบบ (Hub)</span>
                  <span className="md:hidden">Hub</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAstdMenuOpen(!isAstdMenuOpen)}
                  className="py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all duration-300 flex items-center cursor-pointer shadow-xl shadow-black/30 relative"
                >
                  <Menu className="w-5 h-5 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isAstdMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAstdMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-16 right-4 sm:right-6 lg:right-8 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 sm:hidden border-b border-zinc-800/50 mb-2">
                         <div className="flex flex-col gap-2">
                           {currentUser ? (
                             <>
                               <div className="flex items-center gap-2 px-2 py-1.5 mb-1 bg-zinc-950/50 rounded-lg">
                                 {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-500" /> : <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                 <span className="text-sm font-semibold text-zinc-200">{currentUser.username}</span>
                                 {!isAdmin && (
                                   <span className="ml-auto text-xs font-mono text-emerald-400">฿{Number(JSON.parse(localStorage.getItem('KUWASHII_V2_USERS') || '{}')[currentUser.username]?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}</span>
                                 )}
                               </div>
                               {isAdmin && (
                                 <button 
                                   type="button"
                                   onClick={() => { setEditingItem(null); setIsFormOpen(true); setIsAstdMenuOpen(false); }}
                                   className="py-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                                 >
                                   <Plus className="w-4 h-4 text-indigo-400" /> ลงขายสินค้า
                                 </button>
                               )}
                               {!isAdmin && (
                                 <button 
                                   type="button"
                                   onClick={() => { setShowHistoryModal(true); setIsAstdMenuOpen(false); }}
                                   className="py-2 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-indigo-500/20"
                                 >
                                   <History className="w-4 h-4" /> ประวัติการทำรายการ
                                 </button>
                               )}
                               <button 
                                 type="button"
                                 onClick={() => { handleLogout(); setIsAstdMenuOpen(false); }}
                                 className="py-2 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                               >
                                 ออกจากระบบ
                               </button>
                             </>
                           ) : (
                             <button 
                               type="button"
                               onClick={() => { setShowAuthModal(true); setAuthMode('login'); setIsAstdMenuOpen(false); }}
                               className="py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                             >
                               <Shield className="w-4 h-4 text-indigo-500" /> เข้าสู่ระบบ / สมัครสมาชิก
                             </button>
                           )}
                         </div>
                      </div>
                      <div className="py-2 px-3">
                         <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-3">Menu</div>
                         <button className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-3">
                           <ShoppingCart className="w-4 h-4 text-indigo-400" /> ตะกร้าสินค้า
                         </button>
                         <button 
                           onClick={() => {
                             if (!currentUser) {
                               showToast('กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน', 'error');
                             } else {
                               setShowTopupModal(true);
                             }
                             setIsAstdMenuOpen(false);
                           }}
                           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-3"
                         >
                           <Wallet className="w-4 h-4 text-amber-400" /> เติมเงิน
                         </button>
                         <button 
                           onClick={() => {
                             if (!currentUser) {
                               showToast('กรุณาเข้าสู่ระบบก่อนดูประวัติการสั่งซื้อ', 'error');
                             } else {
                               setShowHistoryModal(true);
                             }
                             setIsAstdMenuOpen(false);
                           }}
                           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-3"
                         >
                           <RotateCcw className="w-4 h-4 text-emerald-400" /> ประวัติการสั่งซื้อ
                         </button>
                         <button 
                           onClick={() => {
                             if (!currentUser) return;
                             setIsAccountSettingsOpen(true);
                             setIsAstdMenuOpen(false);
                           }}
                           className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-3"
                         >
                           <Settings className="w-4 h-4 text-zinc-400" /> ตั้งค่าบัญชี
                         </button>
                      </div>
                    </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Statistics summary row - Real Data for ASTD */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
              <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">จำนวนสินค้าทั้งหมด</span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black text-white">{totalStockItems}</span>
                  <span className="text-xs text-zinc-500">รายการ</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">สินค้าสะสมในสต๊อก</span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black text-yellow-500">{totalStockUnits.toLocaleString()}</span>
                  <span className="text-xs text-zinc-500">ชิ้น</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl relative group">
                {isAdmin && (
                  <button onClick={toggleHideGlobalStats} className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {hideGlobalStats ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">จำนวนลูกค้าในเว็ป</span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black text-indigo-400">
                    {hideGlobalStats ? '***' : (() => {
                      try {
                        const usersStr = localStorage.getItem('KUWASHII_V2_USERS');
                        return usersStr ? Object.keys(JSON.parse(usersStr)).length : 0;
                      } catch(e) { return 0; }
                    })()}
                  </span>
                  <span className="text-xs text-zinc-500">บัญชี</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl relative group">
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => {
                       const currentRev = localStorage.getItem('KUWASHII_GLOBAL_REVENUE_ASTD') || '0';
                       const newVal = window.prompt("แก้ไขยอดการเติมเงินรวม ASTD", currentRev);
                       if (newVal !== null && !isNaN(parseFloat(newVal))) {
                          localStorage.setItem('KUWASHII_GLOBAL_REVENUE_ASTD', parseFloat(newVal).toString());
                          setSyncCounter(c => c + 1);
                          showToast('อัปเดตยอดเติมเงินรวม (ASTD) แล้ว', 'success');
                       }
                    }} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={toggleHideGlobalStats} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
                      {hideGlobalStats ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">ยอดการเติมเงินรวม</span>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-zinc-500 font-mono text-xs">฿</span>
                  <span className="font-mono text-2xl font-black text-white">
                    {hideGlobalStats ? '***' : (() => {
                      try {
                        let savedTotal = localStorage.getItem('KUWASHII_GLOBAL_REVENUE_ASTD');
                        let total = savedTotal !== null ? parseFloat(savedTotal) : null;
                        if ((total === null || total === 0) && localStorage.getItem('KUWASHII_V2_USERS')) {
                          const users = JSON.parse(localStorage.getItem('KUWASHII_V2_USERS') || '{}');
                          total = (Object.values(users) as any[]).reduce((acc: number, curr: any) => {
                            return acc + (curr.topups || []).reduce((sum: number, tx: any) => sum + (tx.method !== 'Coupon' && tx.game === 'ASTD' ? (tx.amount || 0) : 0), 0);
                          }, 0);
                          localStorage.setItem('KUWASHII_GLOBAL_REVENUE_ASTD', (total || 0).toString());
                        }
                        return (total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      } catch(e) { return "0.00"; }
                    })()}
                  </span>
                </div>
              </div>
              
              <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl relative group">
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => {
                       const currentRev = localStorage.getItem('KUWASHII_GLOBAL_FREE_CREDITS_ASTD') || '0';
                       const newVal = window.prompt("แก้ไขยอดเครดิตฟรีแจกแล้ว ASTD", currentRev);
                       if (newVal !== null && !isNaN(parseFloat(newVal))) {
                          localStorage.setItem('KUWASHII_GLOBAL_FREE_CREDITS_ASTD', parseFloat(newVal).toString());
                          setSyncCounter(c => c + 1);
                          showToast('อัปเดตยอดเครดิตฟรี (ASTD) แล้ว', 'success');
                       }
                    }} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={toggleHideGlobalStats} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
                      {hideGlobalStats ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">เครดิตฟรีแจกแล้ว</span>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-zinc-500 font-mono text-xs">C</span>
                  <span className="font-mono text-2xl font-black text-yellow-400">
                    {hideGlobalStats ? '***' : (() => {
                      try {
                        let savedTotal = localStorage.getItem('KUWASHII_GLOBAL_FREE_CREDITS_ASTD');
                        let total = savedTotal !== null ? parseFloat(savedTotal) : null;
                        if ((total === null || total === 0) && localStorage.getItem('KUWASHII_V2_USERS')) {
                          const users = JSON.parse(localStorage.getItem('KUWASHII_V2_USERS') || '{}');
                          total = (Object.values(users) as any[]).reduce((acc: number, curr: any) => {
                            return acc + (curr.topups || []).reduce((sum: number, tx: any) => sum + (tx.method === 'Coupon' && tx.game === 'ASTD' ? (tx.amount || 0) : 0), 0);
                          }, 0);
                          localStorage.setItem('KUWASHII_GLOBAL_FREE_CREDITS_ASTD', (total || 0).toString());
                        }
                        return (total || 0).toLocaleString();
                      } catch(e) { return "0"; }
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full">
          
          {/* Banner announcement board */}
          <div className="mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-950/20 via-zinc-900/50 to-zinc-900/20 border border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-zinc-300">บอร์ดข้อมูลร้านค้า ASTD</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 line-clamp-1 sm:line-clamp-none">สินค้าหายากจากเกม All Star Tower Defense การันตีคุณภาพและจัดส่งด่วนโดย Dazz kar</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex flex-1 sm:flex-none items-center justify-center sm:justify-start gap-1.5 sm:gap-2 bg-zinc-950/50 px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl border border-zinc-850">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-550/80" />
                <span className="text-[10px] sm:text-[11px] text-zinc-300">
                  อัปเดตล่าสุด: <strong className="text-indigo-400">{getLatestUpdatedRelativeTime(currentContextItems)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] sm:text-xs font-mono font-semibold text-emerald-400">สถานะ: พร้อมขาย</span>
              </div>
            </div>
          </div>
          
          {/* Category Cards Section (Recommended) */}
          <div className="mb-8">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-tight">หมวดหมู่แนะนำสำหรับคุณ</h2>
                <button 
                  className="bg-transparent border border-zinc-800 text-zinc-400 hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
                >
                   ดูเพิ่มเติม <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 shadow-xl transform transition-all hover:-translate-y-1 hover:bg-zinc-900 duration-300 group flex flex-col h-full">
                   <div className="relative h-24 sm:h-36 rounded-xl overflow-hidden mb-3 border border-zinc-800/50 shrink-0">
                      <img 
                        src="https://img1.pic.in.th/images/1000098143.jpg" 
                        alt="สุ่มตัวละคร - ออสตา" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-white font-black drop-shadow-md text-[10px] sm:text-xs uppercase tracking-wider">ALL STAR TOWER DEFENSE</div>
                   </div>
                   <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 font-sans leading-tight line-clamp-2">สุ่มตัวละคร - ออสตา</h3>
                   <p className="text-zinc-400 mb-3 text-[10px] sm:text-xs font-sans flex items-center gap-1.5 mt-auto">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                     มีสินค้า {items.filter(i => i.category === 'สุ่มตัวละคร - ออสตา' && i.game === 'ASTD').length} ชิ้น
                   </p>
                   <button 
                      onClick={() => setSelectedCategory('สุ่มตัวละคร - ออสตา')}
                      className="w-full bg-[#f40000] hover:bg-red-600 active:bg-red-700 text-white font-bold py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm shadow-md shadow-red-600/20 mt-auto"
                   >
                     ดูสินค้า
                   </button>
                </div>
             </div>
          </div>

          {/* Search and Filters Hub */}
          <section className="bg-zinc-900/20 border border-zinc-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาสินค้า ASTD..."
                  className="w-full bg-zinc-950 border border-zinc-850 py-2.5 sm:py-3 pl-10 pr-10 rounded-lg sm:rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-md transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between md:justify-start gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <span className="text-[10px] sm:text-xs text-zinc-500 font-sans flex-shrink-0">เรียงตาม:</span>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-[11px] sm:text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-sans appearance-none pr-8 sm:pr-8 font-medium">
                    <option value="rarity-desc">ความหายาก (หายากสุด-ทั่วไป)</option>
                    <option value="price-desc">ราคา (แพงสุด - ถูกสุด)</option>
                    <option value="price-asc">ราคา (ถูกสุด - แพงสุด)</option>
                    <option value="stock-desc">จำนวนคงเหลือ (มากสุด - น้อยสุด)</option>
                    <option value="stock-asc">จำนวนคงเหลือ (น้อยสุด - มากสุด)</option>
                    <option value="name-asc">ชื่อไอเทม (ก-ฮ / A-Z)</option>
                  </select>
                  <ChevronDown className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans block mb-1">หมวดหมู่ไอเทม (Item Categories)</span>
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
                {(['all', 'สุ่มตัวละคร - ออสตา', 'Starter Accounts', 'High Level / PvP', 'Rare Units', 'Gems / Currency', 'Rank Boosting', 'Bundle Offers', 'Gifts / Codes', 'Other Services', 'Other'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-extrabold' : 'bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-850 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? '📦 ทั้งหมดทุกหมวดหมู่' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-zinc-900">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">ความพร้อมคลัง (Stock Status)</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as const).map((st) => (
                    <button key={st} onClick={() => setSelectedStatus(st)} className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${selectedStatus === st ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'}`}>
                      {st === 'all' && 'ทั้งหมด'}
                      {st === 'in-stock' && 'มีสินค้า (>5)'}
                      {st === 'low-stock' && 'ใกล้หมด (1-5)'}
                      {st === 'out-of-stock' && 'หมด'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Admin Tools ASTD */}
          {isAdmin && (
            <section className="bg-zinc-900/50 border border-indigo-500/20 p-5 rounded-2xl mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 animate-pulse">
                     <SlidersHorizontal className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">แผงจัดการสต๊อก ASTD</h3>
                     <p className="text-xs text-zinc-400 mt-0.5">จัดการเพิ่ม หรือแก้ไขฐานข้อมูลคลังสินค้าได้แบบ Real-time</p>
                   </div>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                   <button onClick={() => setIsCustomerDbOpen(true)} className="py-2 px-4 rounded-xl bg-purple-500/20 text-purple-400 hover:text-white border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10">
                     <Users className="w-4 h-4" /> ระบบฐานลูกค้า (Customer DB)
                   </button>
                   <button onClick={() => setIsCouponManagerOpen(true)} className="py-2 px-4 rounded-xl bg-emerald-500/20 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10">
                     <Gift className="w-4 h-4" /> จัดการโค้ดคูปอง
                   </button>
                   <button onClick={() => setIsAnnouncementManagerOpen(true)} className="py-2 px-4 rounded-xl bg-amber-500/20 text-amber-400 hover:text-white border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10">
                     <Bell className="w-4 h-4" /> จัดการแจ้งเตือนต่างๆ
                   </button>
                   <button onClick={() => setIsStockManagerOpen(true)} className="py-2 px-4 rounded-xl bg-indigo-500/20 text-indigo-400 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
                     <Package className="w-4 h-4" /> ระบบผู้ดูแลสต๊อก
                   </button>
                   <button onClick={() => setIsFormOpen(true)} className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                     <Plus className="w-4 h-4" /> เพิ่มสินค้า ASTD
                   </button>
                 </div>
               </div>
            </section>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between gap-4 mb-5 text-xs text-zinc-500 font-sans">
            <span>เจอทั้งหมด: <strong className="text-zinc-300 font-bold">{sortedItems.length}</strong> รายการ</span>
            {(search || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedStatus('all'); }} className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer">
                <RotateCcw className="w-3 h-3" /> ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* Item Grid */}
          {isLoadingStock ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 8 }).map((_, idx) => <ItemCardSkeleton key={`astd-skel-${idx}`} />)}
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-24 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
              <Inbox className="w-16 h-16 text-indigo-500/50 mx-auto mb-6" />
              <h2 className="text-lg font-black text-white mb-2 uppercase tracking-wide">ไม่พบสินค้าในสต๊อก ASTD</h2>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {sortedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onEdit={(it) => { setEditingItem(it); setIsFormOpen(true); }}
                  onDelete={handleDeleteItem}
                  onQuickQuantityChange={handleQuickQuantityChange}
                  onInquire={() => setInquiringItem(item)}
                  onBuy={handleBuyItem}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          )}
        </main>
        
        {/* ASTD Custom Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 text-xs py-10 mt-12 bg-gradient-to-b from-transparent to-black/90 relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Left section info */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-display font-medium text-white text-sm">All Star Tower Defense Stock Checker</span>
                </div>
                <p className="text-zinc-500">
                  ระบบจัดการและเช็คจำนวนคงเหลือสต๊อกไอเทมและสเตตัสในเกม All Star Tower Defense แบบเรียลไทม์
                </p>
              </div>

              {/* Right section - signature citation requested explicitly */}
              <div className="text-center md:text-right space-y-1">
                <p className="text-zinc-600 uppercase tracking-widest text-[10px]">Development Credit</p>
                <p className="text-zinc-300 font-sans">
                  Made with passion by{' '}
                  <strong className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-bold font-mono">
                    Kuwashii El ( @_.texraxit )
                  </strong>
                </p>
                <p className="text-zinc-600 text-[10px]">
                  ลิขสิทธิ์ดีไซน์เป็นไปตามข้อตกลงและเกม All Star Tower Defense Roblox
                </p>
              </div>

            </div>
          </div>
        </footer>

        {renderModals()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      <AnnouncementPopup appScreen={appScreen} />
      <Snowfall />
      {/* Return to Hub floating button */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button 
          onClick={() => setAppScreen('SELECT')}
          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 p-3 rounded-full shadow-2xl transition-all duration-300 group flex items-center justify-center"
          title="Return to Game Hub"
        >
          <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Dynamic Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            style={{ zIndex: 9999 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold tracking-wide border backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/30'
                : toastMessage.type === 'error'
                ? 'bg-red-950/90 text-red-400 border-red-500/30'
                : 'bg-zinc-900/90 text-zinc-300 border-zinc-705'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <Info className="w-4 h-4 text-blue-400" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Section */}
      <header className="relative border-b border-zinc-900 bg-zinc-950 py-7 overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-[45rem] h-[24rem] bg-gradient-to-l from-red-600/5 to-transparent filter blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-0 left-0 w-[30rem] h-[20rem] bg-gradient-to-r from-amber-600/5 to-transparent filter blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            {/* Title, Branding & Credits */}
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="bg-red-600 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md animate-pulse shadow-md shadow-red-950">
                  Live Stock
                </span>
                <span className="text-zinc-600 text-xs font-mono">v1.4.1</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>AOT REVOLUTION</span>
                <span className="text-zinc-500 font-light">|</span>
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">STOCK CHECKER</span>
              </h1>
              
              {/* Creator Tag line requested by User */}
              <div className="mt-2 text-sm text-zinc-400 flex items-center gap-2 font-mono">
                <span className="text-zinc-600">•</span>
                <span>Made by</span>
                <span className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer font-bold relative group">
                  Kuwashii El (@_.texraxit)
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </span>
              </div>
            </div>

            {/* Admin toggle console */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Chat now button */}
              <a
                href="https://m.me/kuwashii"
                target="_blank"
                rel="noreferrer noopener"
                className="py-2.5 px-4 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/5 hover:scale-[1.02] active:scale-95"
                id="btn-nav-chat"
              >
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span>ทักแชททันที (Messenger)</span>
              </a>

              {currentUser ? (
                <div className="flex flex-wrap items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                  {/* User Tag */}
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 h-full font-sans ${isAdmin ? 'text-amber-400 bg-amber-500/10' : 'text-indigo-400 bg-indigo-500/10'}`}>
                    {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                    <span>{currentUser.username} {isAdmin && '(Admin)'}</span>
                  </span>
                  {/* In AOTR, no credits/topup/history should be shown */}
                  {/* Add Product Shortcut (Only Admins) */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(null);
                        setIsFormOpen(true);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-white/5 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      เพิ่มสินค้า AOTR
                    </button>
                  )}
                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    id="btn-nav-logout"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                  className="py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-xl shadow-black/30"
                  id="btn-nav-auth"
                >
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
                </button>
              )}
              <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
              <button
                type="button"
                onClick={() => setAppScreen('SELECT')}
                className="py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-xl shadow-black/30"
              >
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="hidden md:inline">กลับหน้าเข้าสู่ระบบ (Hub)</span>
                <span className="md:hidden">Hub</span>
              </button>
            </div>

          </div>

          {/* Statistics summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">จำนวนสินค้าทั้งหมด</span>
              <div className="mt-1.5 flex items-baseline gap-2">
                {isLoadingStock ? (
                  <div className="h-8 w-12 bg-zinc-850/80 animate-pulse rounded" />
                ) : (
                  <>
                    <span className="font-mono text-2xl font-black text-white">{totalStockItems}</span>
                    <span className="text-xs text-zinc-500">รายการ</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">จำนวนพร้อมส่งด่วน</span>
              <div className="mt-1.5 flex items-baseline gap-2">
                {isLoadingStock ? (
                  <div className="h-8 w-12 bg-zinc-850/80 animate-pulse rounded" />
                ) : (
                  <>
                    <span className="font-mono text-2xl font-black text-emerald-400">{inStockCount}</span>
                    <span className="text-xs text-zinc-500">ประเภทคลัง</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">สินค้าสะสมในสต๊อก</span>
              <div className="mt-1.5 flex items-baseline gap-2">
                {isLoadingStock ? (
                  <div className="h-8 w-12 bg-zinc-850/80 animate-pulse rounded" />
                ) : (
                  <>
                    <span className="font-mono text-2xl font-black text-yellow-500">{totalStockUnits}</span>
                    <span className="text-xs text-zinc-500">ชิ้น</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">มูลค่าสต๊อกประเมินทั้งหมด</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                {isLoadingStock ? (
                  <div className="h-8 w-24 bg-zinc-850/80 animate-pulse rounded" />
                ) : (
                  <>
                    <span className="text-zinc-500 font-mono text-xs">฿</span>
                    <span className="font-mono text-2xl font-black text-white">{totalStockValue.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full">


        
        {/* Banner announcement board */}
        <div className="mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-950/20 via-zinc-900/50 to-zinc-900/20 border border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-zinc-300">บอร์ดข้อมูลร้านค้า</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 line-clamp-1 sm:line-clamp-none">อัปเดตสต๊อกไอเทมเกม AOT Revolution ตลอด 24 ชม. สะดวก รวดเร็ว เชื่อถือได้ 100%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-1 sm:flex-none items-center justify-center sm:justify-start gap-1.5 sm:gap-2 bg-zinc-950/50 px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl border border-zinc-850">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-550/80" />
              <span className="text-[10px] sm:text-[11px] text-zinc-300">
                อัปเดตคลังล่าสุด: {isLoadingStock ? (
                  <span className="h-3 w-16 bg-zinc-900/80 animate-pulse rounded inline-block align-middle ml-1" />
                ) : (
                  <strong className="text-amber-400">{getLatestUpdatedRelativeTime(currentContextItems)}</strong>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] sm:text-xs font-mono font-semibold text-emerald-400">สถานะ: พร้อมขาย</span>
            </div>
          </div>
        </div>

        {/* Kuwashii AI Shop Assistant */}
        <section 
          id="ai-chat-section"
          className="mb-8 bg-gradient-to-br from-purple-950/15 via-zinc-950/90 to-zinc-950/95 border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          {/* Subtle top light flare */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none" />

          {/* Header Bar */}
          <div className="bg-zinc-950/80 px-4 py-4 border-b border-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-lg shadow-purple-500/5 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>ผู้ช่วยตอบแชทอัจฉริยะ (Kuwashii AI Assistant)</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-[9px] font-bold text-purple-300 tracking-wider uppercase border border-purple-500/30">
                    Live GPT
                  </span>
                </h2>
                <p className="text-[10px] text-zinc-500">
                  ถามวิเคราะห์คอมโบไอเทม, สอบถามราคาในสต็อกปัจจุบัน หรือวิเคราะห์เซรั่ม/บลัดไลน์ของตัวละครได้เรียลไทม์
                </p>
              </div>
            </div>

            {/* Clear Conversation Trigger */}
            <button
              type="button"
              onClick={() => {
                setChatMessages([
                  {
                    role: 'model',
                    text: 'รีเซ็ตห้องสนทนาเรียบร้อย! ✨ ต้องการถามคำถามอะไรต่อ บอกมาได้เลยครับ ยินดีให้บริการเสมียนร้าน!'
                  }
                ]);
                setChatSharedItem(null);
                showToast('ล้างประวัติการสนทนาเรียบร้อย');
              }}
              className="py-1 px-3 sm:py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-zinc-500" />
              <span>เริ่มใหม่</span>
            </button>
          </div>

          {/* Active Context / Shared Item Banner if selected */}
          {chatSharedItem && (
            <div className="bg-gradient-to-r from-purple-950/50 via-zinc-950 to-purple-950/20 border-b border-purple-500/15 py-2.5 px-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping shrink-0" />
                <span className="text-[10px] text-zinc-400">
                  แชร์สินค้าให้ AI แล้ว: 
                </span>
                <span className="bg-purple-500/15 text-purple-300 font-bold px-2 py-0.5 rounded text-[10px] border border-purple-500/25 flex items-center gap-1.5">
                  📁 {chatSharedItem.name} ({chatSharedItem.category}) — ฿{chatSharedItem.price.toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setChatSharedItem(null);
                  showToast('ยกเลิกการแชร์สินค้าพิเศษเรียบร้อย');
                }}
                className="text-zinc-500 hover:text-zinc-300 text-[10px] font-bold py-0.5 px-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-md transition-all cursor-pointer"
              >
                ยกเลิกการแชร์ ✖
              </button>
            </div>
          )}

          {/* Chat Window frame */}
          <div className="p-4 sm:p-5">
            {/* Scrollable conversation box */}
            <div ref={chatContainerRef} className="bg-zinc-950/70 border border-zinc-900/60 rounded-xl p-4 h-80 overflow-y-auto space-y-4 mb-3.5 backdrop-blur shadow-inner">
              {chatMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Character Avatar */}
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold leading-none ${
                        isUser 
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-350' 
                          : 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-500/40 text-white shadow-md shadow-purple-500/15'
                      }`}
                    >
                      {isUser ? 'U' : 'AI'}
                    </div>

                    {/* Chat Bubble card */}
                    <div className="flex-1 max-w-[85%]">
                      {/* Sub text label */}
                      <div className={`text-[9px] font-mono text-zinc-600 mb-1 ${isUser ? 'text-right' : ''}`}>
                        {isUser ? 'ผู้ใช้' : 'Kuwashii AI Shop Assistant'}
                      </div>

                      {/* Content bubble */}
                      <div 
                        className={`p-3 rounded-2xl ${
                          isUser 
                            ? 'bg-indigo-950/40 border border-indigo-505/20 rounded-tr-none text-zinc-200' 
                            : 'bg-gradient-to-r from-zinc-900 to-zinc-900/80 border border-zinc-800/85 rounded-tl-none shadow-md'
                        }`}
                      >
                        {/* Render simple formatting */}
                        {(() => {
                          return msg.text.split('\n').map((line, lIdx) => {
                            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                            let cleanLine = line;
                            if (isBullet) {
                              cleanLine = line.replace(/^[\s-*\s]+/, '');
                            }

                            // Parse bold elements **text**
                            const parts = [];
                            let lastIndex = 0;
                            const boldRegex = /\*\*([^*]+)\*\*/g;
                            let match;

                            while ((match = boldRegex.exec(cleanLine)) !== null) {
                              if (match.index > lastIndex) {
                                parts.push(cleanLine.substring(lastIndex, match.index));
                              }
                              parts.push(
                                <strong key={match.index} className="text-amber-400 font-extrabold font-sans">
                                  {match[1]}
                                </strong>
                              );
                              lastIndex = boldRegex.lastIndex;
                            }

                            if (lastIndex < cleanLine.length) {
                              parts.push(cleanLine.substring(lastIndex));
                            }

                            const finalElement = parts.length > 0 ? parts : cleanLine;

                            if (isBullet) {
                              return (
                                <div key={lIdx} className="flex items-start gap-1.5 ml-2 mr-1 my-1 font-sans text-xs text-zinc-300 leading-relaxed">
                                  <span className="text-purple-400 shrink-0 mt-1.5 text-[8px]">◆</span>
                                  <span>{finalElement}</span>
                                </div>
                              );
                            }

                            return (
                              <p key={lIdx} className="text-xs text-zinc-300 leading-relaxed font-sans mb-1.5">
                                {finalElement}
                              </p>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loader visual if call is ongoing */}
              {isChatLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-500/40 text-white shadow-md flex-shrink-0 animate-pulse">
                    AI
                  </div>
                  <div className="flex-1 max-w-[85%]">
                    <div className="text-[9px] font-mono text-zinc-650 mb-1">
                      Kuwashii AI Shop Assistant ค้นหาคอมโบ...
                    </div>
                    <div className="bg-zinc-900 border border-zinc-850 p-3.5 rounded-2xl rounded-tl-none inline-flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce duration-300 delay-0"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce duration-300 delay-150"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce duration-300 delay-300"></span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-sans animate-pulse">กำลังสแกนโครงข่ายวิจัยคลังสินค้า...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Anchor for automatic scroll down */}
              <div ref={chatEndRef} />
            </div>

            {/* Chat form control input and suggestions */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }} 
              className="space-y-3"
            >
              {/* Message Typing Panel */}
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    chatSharedItem 
                      ? `ถามเกี่ยวกับไอเทมวิเศษ "${chatSharedItem.name}"...`
                      : "พิมพ์ข้อความแชทเพื่อถาม AI เช่น ราคา, สรรพคุณ หรือ แนะนำไอเทม..."
                  }
                  className="flex-1 bg-zinc-950 border border-zinc-850 py-3 px-4 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                  disabled={isChatLoading}
                  id="chat-user-input"
                />
                
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className={`py-3 px-5 rounded-xl font-bold text-xs tracking-wide transition-all border shrink-0 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isChatLoading || !chatInput.trim()
                      ? 'bg-zinc-900 border-zinc-850 text-zinc-600 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 hover:border-purple-400 active:scale-[0.98] shadow-lg shadow-purple-600/10'
                  }`}
                  id="btn-send-chat"
                >
                  <span>ส่งข้อความ</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Micro Quick Suggestion Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px]">
                <span className="text-zinc-550 mr-1 font-medium select-none">หัวข้อแนะนำ:</span>
                {[
                  'มีสินค้าตัวไหนที่คนนิยมซื้อมากที่สุดในร้านบ้าง?',
                  'อธิบายความแตกต่างระหว่าง Serum กับ Bloodline สไตล์เกมเมอร์',
                  'ขอไอเทมแนะนำสำหรับปักหมุดประจำวันหน่อยครับ'
                ].map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setChatInput(sug)}
                    className="px-2.5 py-1 rounded-md border border-zinc-900 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-zinc-850 hover:bg-zinc-900 transition-all text-[9.5px] cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </section>

        {/* Search and Filters Hub */}
        <section className="bg-zinc-900/20 border border-zinc-900 p-5 sm:p-6 rounded-2xl mb-8 space-y-5">
          
          {/* Main search input and Sort dropdown row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Elegant Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อไอเทม, คุณสมบัติความเร็ว, ระดับระดับ หรือหมวดหมู่..."
                className="w-full bg-zinc-950 border border-zinc-850 py-3 pl-10 pr-10 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-zinc-500 font-sans flex-shrink-0">เรียงตาม:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 py-3 px-4 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer font-sans appearance-none pr-8 font-medium"
                >
                  <option value="rarity-desc">ความหายาก (หายากสุด-ทั่วไป)</option>
                  <option value="price-desc">ราคา (แพงสุด - ถูกสุด)</option>
                  <option value="price-asc">ราคา (ถูกสุด - แพงสุด)</option>
                  <option value="stock-desc">จำนวนคงเหลือ (มากสุด - น้อยสุด)</option>
                  <option value="stock-asc">จำนวนคงเหลือ (น้อยสุด - มากสุด)</option>
                  <option value="name-asc">ชื่อไอเทม (ก-ฮ / A-Z)</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Horizontal Swiping Category list */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans block mb-1">
              หมวดหมู่ไอเทม (Item Categories)
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {(['all', 'Serum', 'Bloodline', 'Skin', 'Artifact', 'Scroll/Key', 'Perk', 'Other'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-black shadow-lg shadow-white/5 font-extrabold'
                      : 'bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-850 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? '📦 ทั้งหมดทุกหมวดหมู่' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity & Status Filter tags row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-zinc-900">
            
            {/* Rarity Selector Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">ระดับแรร์ (Rarity Type)</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Common'] as const).map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => setSelectedRarity(rarity)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold tracking-normal transition-all cursor-pointer border ${
                      selectedRarity === rarity
                        ? rarity === 'Mythic'
                          ? 'bg-red-500/10 border-red-500 text-red-400'
                          : rarity === 'Legendary'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                          : rarity === 'Epic'
                          ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                          : rarity === 'Rare'
                          ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                          : rarity === 'Common'
                          ? 'bg-zinc-500/10 border-zinc-400 text-zinc-300'
                          : 'bg-white text-black border-white font-extrabold'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {rarity === 'all' ? '⭐ ทุกระดับความหายาก' : rarity}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability status selectors and Popular item filters */}
            <div className="space-y-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">ความพร้อมคลัง (Stock Status)</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        selectedStatus === st
                          ? 'bg-zinc-800 border-zinc-500 text-white'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {st === 'all' && 'ทั้งหมด'}
                      {st === 'in-stock' && 'มีสินค้า (>5)'}
                      {st === 'low-stock' && 'ใกล้หมด (1-5)'}
                      {st === 'out-of-stock' && 'หมด'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Popular Only switch */}
              <div className="space-y-2 sm:self-end">
                <button
                  type="button"
                  onClick={() => setShowPopularOnly(!showPopularOnly)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    showPopularOnly
                      ? 'bg-rose-500/15 border-rose-500 text-rose-450'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-rose-400'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${showPopularOnly ? 'fill-current text-rose-450 animate-bounce' : 'text-zinc-500'}`} />
                  <span>แสดงเฉพาะยอดนิยม</span>
                </button>
              </div>
            </div>

          </div>

        </section>

        {/* Admin Dashboard Control Center */}
        {isAdmin && (
          <section className="bg-zinc-900/50 border border-emerald-500/20 p-5 rounded-2xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 animate-pulse">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">แผงเครื่องมือแอดมินจัดการสต๊อกดิ๊ก</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">คุณสามารถอัปเดตสต็อก, รีเซ็ตข้อมูลดีฟอลต์ หรือ แบคอัพข้อมูลสต๊อกทั้งหมดได้ที่นี่</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                
                <button
                  type="button"
                  onClick={() => setIsAnnouncementManagerOpen(true)}
                  className="py-2 px-3 border border-amber-500/30 hover:border-amber-500/80 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" /> แจ้งเตือน Popup
                </button>

                <button
                  onClick={() => setIsCustomerDbOpen(true)}
                  className="py-2 px-3 border border-purple-500/30 hover:border-purple-500/80 bg-purple-950/20 hover:bg-purple-950/40 text-purple-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" /> ลูกค้า
                </button>

                <button
                  onClick={() => setIsCouponManagerOpen(true)}
                  className="py-2 px-3 border border-emerald-500/30 hover:border-emerald-500/80 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" /> คูปอง
                </button>

                {/* Stock Manager button */}
                <button
                  type="button"
                  onClick={() => setIsStockManagerOpen(true)}
                  className="py-2 px-3 border border-indigo-500/30 hover:border-indigo-500/80 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>ระบบผู้ดูแลสต๊อกทั้งหมด</span>
                </button>

                {/* Add product button AOTR */}
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="py-2 px-3 border border-blue-500/30 hover:border-blue-500/80 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มสินค้า AOTR</span>
                </button>

                {/* Delete all products button */}
                <button
                  type="button"
                  onClick={handleDeleteAllProducts}
                  className="py-2 px-3 border border-red-500/30 hover:border-red-650/80 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ลบสินค้าทั้งหมดในคลังออกทั้งหมด</span>
                </button>

                {/* Make all set to 0 stock button */}
                <button
                  type="button"
                  onClick={handleClearStockToZero}
                  className="py-2 px-3 border border-amber-500/30 hover:border-amber-600/80 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 animate-pulse" />
                  <span>เซ็ตจำนวนสต๊อกสินค้าทั้งหมดเหลือ 0 ชิ้น</span>
                </button>

                {/* Backup export */}
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>ส่งออก JSON Backup</span>
                </button>

                {/* Import backup */}
                <label className="py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                  <FileUp className="w-3.5 h-3.5" />
                  <span>นำเข้าไฟล์ JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>

              </div>
            </div>
          </section>
        )}

        {/* Search status summary display */}
        <div className="flex items-center justify-between gap-4 mb-5 text-xs text-zinc-500 font-sans">
          <span>
            ผลการค้นหาและตัวกรองที่เลือกเจอทั้งหมด: <strong className="text-zinc-300 font-bold">{sortedItems.length}</strong> รายการสินค้า
          </span>
          {(search || selectedCategory !== 'all' || selectedRarity !== 'all' || selectedStatus !== 'all' || showPopularOnly) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedRarity('all');
                setSelectedStatus('all');
                setShowPopularOnly(false);
              }}
              className="text-amber-500 hover:text-amber-400 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>

        {/* Item Grid Component */}
        {isLoadingStock ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ItemCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </div>
        ) : sortedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-zinc-900 bg-zinc-950/60 p-12 rounded-3xl text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-650 border border-zinc-805">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">ไม่พบสินค้าที่คุณต้องการในสต๊อกขณะนี้</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                ลองตรวจสอบชื่อสะกดไอเทมใหม่อีกครั้ง หรือเข้ากลุ่ม Discord สอบถามเพิ่มเติมได้โดยตรง
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedRarity('all');
                setSelectedStatus('all');
              }}
              className="py-2.5 px-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold border border-zinc-800 transition-all cursor-pointer"
            >
              ย้อนกลับไปดูสินค้าทั้งหมด
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onEdit={(it) => {
                    setEditingItem(it);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteItem}
                  onQuickQuantityChange={handleQuickQuantityChange}
                  onInquire={(it) => setInquiringItem(it)}
                  onTogglePin={handleTogglePin}
                  onShareToAI={handleShareToAI}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </main>

      {/* Modern, Highly styled Custom Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 text-xs py-10 mt-12 bg-gradient-to-b from-transparent to-black/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left section info */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-650" />
                <span className="font-display font-medium text-white text-sm">Attack on Titan Revolution Stock Checker</span>
              </div>
              <p className="text-zinc-500">
                ระบบจัดการและเช็คจำนวนคงเหลือสต๊อกไอเทม แรร์ไอเทม และสเตตัสในเกม AOT Revolution แบบเรียลไทม์
              </p>
            </div>

            {/* Right section - signature citation requested explicitly */}
            <div className="text-center md:text-right space-y-1">
              <p className="text-zinc-600 uppercase tracking-widest text-[10px]">Development Credit</p>
              <p className="text-zinc-300 font-sans">
                Made with passion by{' '}
                <strong className="text-amber-450 hover:text-amber-400 transition-colors cursor-pointer font-bold font-mono">
                  Kuwashii El ( @_.texraxit )
                </strong>
              </p>
              <p className="text-zinc-650 text-[10px]">
                ลิขสิทธิ์ดีไซน์เป็นไปตามข้อตกลงและเกม Attack on Titan Revolution Roblox
              </p>
            </div>

          </div>
        </div>
      </footer>
      
      {renderModals()}
    </div>
  );
}
