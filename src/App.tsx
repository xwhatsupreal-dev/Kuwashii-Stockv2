import React, { useState, useEffect, useRef } from "react";
import { FakeTurnstile } from './components/FakeTurnstile';
import { motion, AnimatePresence } from "motion/react";
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
  Edit3,
  Star,
  LogOut,
} from "lucide-react";

import {
  StockItem,
  CategoryFilter,
  SaleFormatFilter,
  StockStatusFilter,
} from "./types";
import { DEFAULT_PRESETS } from "./presets";
import { ItemCard } from "./components/ItemCard";
import { CategoryList } from "./components/CategoryList";
import { ItemCardSkeleton } from "./components/ItemCardSkeleton";
import { InquiryModal } from "./components/InquiryModal";
import { RandomBoxModal } from "./components/RandomBoxModal";
import { GachaResultModal } from "./components/GachaResultModal";
import { AdminModal } from "./components/AdminModal";
import { StockManagerModal } from "./components/StockManagerModal";
import { CustomerDatabaseModal } from "./components/CustomerDatabaseModal";
import { HistoryModal } from "./components/HistoryModal";
import { UserSettingsModal } from "./components/UserSettingsModal";
import { CouponManagerModal } from "./components/CouponManagerModal";
import { AnnouncementManagerModal } from "./components/AnnouncementManagerModal";
import { AnnouncementPopup } from "./components/AnnouncementPopup";
import { MarqueeAnnouncement } from "./components/MarqueeAnnouncement";
import Snowfall from "./components/Snowfall";
import { ShopHeader } from "./components/ShopHeader";
import { ShopBanner } from "./components/ShopBanner";
import jsQR from "jsqr";

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

import { sendDiscordTopupEmbed, sendDiscordPurchaseEmbed } from "./discord";
import { LiveActivities, LiveActivity } from "./components/LiveActivities";
import { supabase } from "./supabase";
import { fetchItems, fetchUser, getSystemConfig } from "./queries";

import { SalesChart } from "./components/SalesChart";
import { MobileDrawer } from './components/MobileDrawer';
import { Statement } from './components/Statement';

export const addLiveActivity = async (
  activity: Omit<LiveActivity, "id" | "timestamp">,
) => {
  try {
    const { error } = await supabase.from("activities").insert([
      {
        type: activity.type,
        username: activity.username,
        item_name: activity.itemName,
        quantity: activity.quantity,
        price: activity.price,
        remaining_stock: activity.remainingStock,
        game: activity.game,
        gacha_drops: activity.gachaDrops,
      },
    ]);

    // Clean up old activities (older than 7 hours)
    const sevenHoursAgo = new Date(
      Date.now() - 7 * 60 * 60 * 1000,
    ).toISOString();
    await supabase.from("activities").delete().lt("timestamp", sevenHoursAgo);

    if (!error) {
      window.dispatchEvent(new Event("sync-update"));
    }
  } catch (e) {}
};

const DiscordBanner = () => (
  <section className="mt-16 sm:mt-24 max-w-sm mx-auto mb-10">
    <iframe
      src="https://discord.com/widget?id=1510845435751829565&theme=dark"
      width="100%"
      height="500"
      allowtransparency="true"
      frameBorder="0"
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      className="rounded-2xl shadow-xl w-full"
    />
  </section>
);

export default function App() {
  const [globalStats, setGlobalStats] = useState<any>({
    global_sales_astd: 0,
    global_rev_astd: 0,
    global_free_astd: 0,
    maintenance_mode: false,
  });
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  const isUnderMaintenance = globalStats?.maintenance_mode;

  // --- Global Hub State ---
  const [appScreen, setAppScreen] = useState<string>(window.location.pathname === "/shop" || window.location.search.includes("shop") ? "SHOP" : "STATEMENT");
  const [targetScreen, setTargetScreen] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  // User & Admin Authentications
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(
    () => {
      const saved =
        localStorage.getItem("KUWASHII_CURRENT_USER") ||
        sessionStorage.getItem("KUWASHII_CURRENT_USER");
      if (saved) return JSON.parse(saved);
      return null;
    },
  );
  const [isAdmin, setIsAdmin] = useState(() => {
    return (
      localStorage.getItem("KUWASHII_IS_ADMIN") === "true" ||
      sessionStorage.getItem("KUWASHII_IS_ADMIN") === "true"
    );
  });

  const [loadingVariant, setLoadingVariant] = useState(1);
  const [isAstdMenuOpen, setIsAstdMenuOpen] = useState(false);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    let lastActiveTime = Date.now();
    let intervalId: NodeJS.Timeout;

    const updateActivity = () => {
      // Only update if not already stale
      if (!isStale) {
        lastActiveTime = Date.now();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastActiveTime > IDLE_TIMEOUT) {
          setIsStale(true);
        } else {
          updateActivity();
        }
      }
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("scroll", updateActivity, { passive: true });
    window.addEventListener("touchstart", updateActivity, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    intervalId = setInterval(() => {
      if (
        document.visibilityState === "hidden" ||
        Date.now() - lastActiveTime > IDLE_TIMEOUT
      ) {
        if (Date.now() - lastActiveTime > IDLE_TIMEOUT) {
          setIsStale(true);
        }
      }
    }, 30000); // Check every 30s

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [isStale]);

  const [gachaResult, setGachaResult] = useState<{
    drops: { name: string; color?: string }[];
    item: StockItem;
  } | null>(null);

  // --- States ---
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [isServerQuotaExceeded, setIsServerQuotaExceeded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [selectedSaleFormat, setSelectedSaleFormat] = useState<SaleFormatFilter>("all");
  const [selectedStatus, setSelectedStatus] =
    useState<StockStatusFilter>("all");
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [syncCounter, setSyncCounter] = useState(0);

  // Sync Engine Listener
  useEffect(() => {
    let activeSyncId = 0;

    const handleSync = async () => {
      const syncId = ++activeSyncId;

      const dbItems = await fetchItems();
      if (syncId !== activeSyncId) return;
      if (dbItems) setItems(dbItems);

      const config = await getSystemConfig();
      if (syncId !== activeSyncId) return;
      if (config) {
        try {
          const { count, error } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });
          if (!error && count !== null) {
            config.user_count = count;
          }
        } catch (e) {}

        if (syncId !== activeSyncId) return;
        setGlobalStats(config);
        if (config.announcement_settings) {
          localStorage.setItem(
            "KUWASHII_ANNOUNCEMENT_SETTINGS",
            JSON.stringify(config.announcement_settings),
          );
          window.dispatchEvent(new Event("sync-announcement"));
        }
      }

      if (currentUser?.username) {
        const u = await fetchUser(currentUser.username);
        if (syncId !== activeSyncId) return;
        if (u) setCurrentUserData(u);
      }

      setSyncCounter((c) => c + 1);
    };

    // Initial fetch
    handleSync();

    const throttledHandleSync = () => {
      if ((window as any)._syncDebounce) clearTimeout((window as any)._syncDebounce);
      (window as any)._syncDebounce = setTimeout(() => {
        handleSync();
      }, 3000);
    };

    window.addEventListener("sync-update", handleSync);

    const realtimeChannel = supabase
      .channel("public-db-changes")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        throttledHandleSync();
      })
      .subscribe();

    return () => {
      window.removeEventListener("sync-update", handleSync);
      supabase.removeChannel(realtimeChannel);
    };
  }, [currentUser]);

  // Loading Screen Timer
  useEffect(() => {
    if (appScreen === "LOADING") {
      const timer = setTimeout(() => {
        let finalScreen = "SELECT";
        try {
          const stored = localStorage.getItem("KUWASHII_LAST_SCREEN");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (
              parsed.expiry > Date.now() &&
              ["ASTD", "AOTR", "ROV"].includes(parsed.screen)
            ) {
              finalScreen = parsed.screen;
            } else {
              localStorage.removeItem("KUWASHII_LAST_SCREEN");
            }
          }
        } catch (e) {}
        setAppScreen(finalScreen as any);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [appScreen]);

  // Save Last Screen Strategy
  useEffect(() => {
    if (["ASTD", "AOTR", "ROV"].includes(appScreen)) {
      const TH_OFFSET = 7 * 60 * 60 * 1000;
      const now = Date.now();
      const thTimeMs = now + TH_OFFSET;
      const daysSinceEpoch = Math.floor(thTimeMs / 86400000);
      const nextMidnightThMs = (daysSinceEpoch + 1) * 86400000;
      const expiry = nextMidnightThMs - TH_OFFSET;

      localStorage.setItem(
        "KUWASHII_LAST_SCREEN",
        JSON.stringify({
          screen: appScreen,
          expiry: expiry,
        })
      );
    }
  }, [appScreen]);

  // Transition Timer
  useEffect(() => {
    if (appScreen === "TRANSITION" && targetScreen) {
      const timer = setTimeout(() => {
        setAppScreen(targetScreen);
        setTargetScreen(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appScreen, targetScreen]);

  // Loading Progress Number Effect
  useEffect(() => {
    if (appScreen === "LOADING" || appScreen === "TRANSITION") {
      setLoadingProgress(0);
      let p = 0;
      const duration = appScreen === "LOADING" ? 3500 : 3000;
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

  // Modals controller
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<
    "login" | "register" | "forgot" | "forgot_verify_otp"
  >("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authOtpCode, setAuthOtpCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showAuthConfirmPassword, setShowAuthConfirmPassword] = useState(false);

  const [showMockEmailModal, setShowMockEmailModal] = useState(false);
  const [mockEmailModalData, setMockEmailModalData] = useState<{
    email: string;
    username: string;
    password: string;
  } | null>(null);
  const [rememberAuth, setRememberAuth] = useState(false);

  // --- Top Up State ---
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupModalStep, setTopupModalStep] = useState<
    "select" | "angpao" | "bank" | "coupon" | "success"
  >("select");
  const [topupSuccessMessage, setTopupSuccessMessage] = useState("");
  const [topupError, setTopupError] = useState("");
  const [topupCode, setTopupCode] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [showTopupTos, setShowTopupTos] = useState(false);
  const [selectedTopupChannel, setSelectedTopupChannel] = useState<
    "angpao" | "bank" | "coupon" | null
  >(null);

  const [isProcessingTopup, setIsProcessingTopup] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Modals controller
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStockManagerOpen, setIsStockManagerOpen] = useState(false);
  const [isCustomerDbOpen, setIsCustomerDbOpen] = useState(false);
  const [isCouponManagerOpen, setIsCouponManagerOpen] = useState(false);
  const [isAnnouncementManagerOpen, setIsAnnouncementManagerOpen] =
    useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewingUserHistory, setViewingUserHistory] = useState<string | null>(
    null,
  );
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [inquiringItem, setInquiringItem] = useState<StockItem | null>(null);

  const [hideGlobalStats, setHideGlobalStats] = useState(() => {
    return localStorage.getItem("KUWASHII_HIDE_STATS") === "true";
  });

  const toggleHideGlobalStats = () => {
    const newState = !hideGlobalStats;
    setHideGlobalStats(newState);
    localStorage.setItem("KUWASHII_HIDE_STATS", String(newState));
  };

  const toggleMaintenanceMode = async () => {
    if (
      confirm(
        `คุณต้องการ${globalStats?.maintenance_mode ? "เปิด" : "ปิด"}เว็บไซต์ใช่หรือไม่?`,
      )
    ) {
      await supabase
        .from("system_config")
        .upsert({
          id: "main",
          maintenance_mode: !globalStats?.maintenance_mode,
        });
      window.dispatchEvent(new Event("sync-update"));
      showToast(
        globalStats?.maintenance_mode
          ? "เปิดเว็บไซต์เรียบร้อยแล้ว"
          : "ปิดเว็บไซต์เรียบร้อยแล้ว",
        "info",
      );
    }
  };

  // Floating notifications/toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // Sound chime utility generator
  const playChime = (type: "success" | "warning" | "info") => {
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const freqs = { success: 523.25, warning: 329.63, info: 440.0 };
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
  
  
  
  
  
  

  // Cleanup logic (7 days retention)
  useEffect(() => {
    async function cleanupOldData() {
      try {
        const sevenDaysAgo = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
        await supabase.from("topups").delete().lt("created_at", sevenDaysAgo);
        await supabase
          .from("purchases")
          .delete()
          .lt("created_at", sevenDaysAgo);
      } catch (e) {
        console.warn("Error cleaning up old histories", e);
      }
    }
    cleanupOldData();
  }, []);

  // Load and save localStorage / Server
  useEffect(() => {
    async function initStock() {
      // Helper to map obsolete "Equipment" category to new "Skin" category
      const migrateItems = (itemsList: any[]): StockItem[] => {
        return itemsList.map((item) => {
          if (item && item.category === "Equipment") {
            return { ...item, category: "Skin" };
          }
          return item as StockItem;
        });
      };

      try {
        const dbItems = await fetchItems();
        if (dbItems && dbItems.length > 0) {
          setItems(migrateItems(dbItems));
        } else {
          setItems(migrateItems(DEFAULT_PRESETS));

          try {
            const inserts = DEFAULT_PRESETS.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              quantity: item.quantity,
              image: item.imageUrls ? JSON.stringify(item.imageUrls) : item.imageUrl,
              game: item.game,
              category: item.category,
              rarity: item.saleFormat,
              popular: item.isPopular,
              gacha_pool: { pool: item.gachaPool, isPinned: item.isPinned || false },
            }));
            await supabase.from("items").insert(inserts);
          } catch (e) {}
        }
        setIsServerQuotaExceeded(false);
      } catch (e: any) {
        console.warn("Error loading items from Supabase", e);
        setItems(migrateItems(DEFAULT_PRESETS));
      } finally {
        setIsLoadingStock(false);
      }
    }
    initStock();
  }, [syncCounter]);

  const saveItemsToStorage = async (newItems: StockItem[]) => {
    setItems(newItems);

    // Save to Supabase
    try {
      const updates = newItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        image: item.imageUrls ? JSON.stringify(item.imageUrls) : item.imageUrl,
        game: item.game,
        category: item.category,
        rarity: item.saleFormat,
        popular: item.isPopular,
        gacha_pool: {
          pool: item.gachaPool || null,
          initialQuantity: item.initialQuantity,
          piecesPerUnit: item.piecesPerUnit,
          accountCredentials: item.accountCredentials || null,
          isPinned: item.isPinned || false,
        },
        created_at: item.updatedAt || new Date().toISOString(),
      }));
      await supabase.from("items").upsert(updates);
    } catch (e) {
      console.error("Error saving items", e);
    }

    window.dispatchEvent(new Event("sync-update"));
  };

  const showToast = (
    text: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tosAccepted) {
      showToast("กรุณายอมรับข้อกำหนดในการให้บริการก่อนดำเนินการต่อ", "error");
      return;
    }
    if (topupModalStep !== "bank" && !topupCode.trim()) {
      showToast("กรุณากรอกข้อมูลเพื่อเติมเงิน", "error");
      return;
    }
    if (topupModalStep === "bank" && !slipFile) {
      showToast("กรุณาอัปโหลดรูปภาพสลิปโอนเงิน", "error");
      return;
    }

    if (!currentUser?.username) {
      showToast("กรุณาเข้าสู่ระบบก่อน", "error");
      return;
    }

    const activeUsername = currentUser.username.trim();
    const liveUser = await fetchUser(activeUsername);
    if (!liveUser) {
      showToast("เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า โปรดลองอีกครั้ง", "error");
      return;
    }

    if (topupModalStep === "coupon") {
      const savedCoupons = localStorage.getItem("KUWASHII_COUPONS");
      let coupons: any[] = savedCoupons ? JSON.parse(savedCoupons) : [];
      let coupon = coupons.find(
        (c) => c.code.toLowerCase() === topupCode.trim().toLowerCase(),
      );

      if (coupon) {
        if (coupon.usedBy && coupon.usedBy.includes(activeUsername)) {
          showToast("คุณได้ใช้งานโค้ดนี้ไปแล้ว", "error");
          return;
        }
        if (coupon.usedBy && coupon.usedBy.length >= coupon.maxUses) {
          showToast("โค้ดอ้างอิงนี้ถูกใช้งานจนครบกำหนดแล้ว", "error");
          return;
        }
        if (
          coupon.expiresAt &&
          new Date(coupon.expiresAt).getTime() < Date.now()
        ) {
          showToast("โค้ดนี้หมดอายุการใช้งานแล้ว", "error");
          return;
        }

        if (!coupon.usedBy) coupon.usedBy = [];
        coupon.usedBy.push(activeUsername);
        localStorage.setItem("KUWASHII_COUPONS", JSON.stringify(coupons));

            const configData = await getSystemConfig();
            


    if (appScreen === "SHOP") {
              const currentFree = configData
                ? Number(configData.global_free_astd || 0)
                : 0;
              await supabase
                .from("system_config")
                .upsert({
                  id: "main",
                  global_free_astd: currentFree + coupon.amount,
                });
            } else if (false) {
              // AOTR columns not reliably present, wrap in try/catch or assume it's fine for now,
              // but we are focused on ROV. Just skip ROV since it has no columns.
              const currentFree = configData
                ? Number(configData.global_free_credits_aotr || 0)
                : 0;
              await supabase
                .from("system_config")
                .upsert({
                  id: "main",
                  global_free_credits_aotr: currentFree + coupon.amount,
                });
            }

        const balanceField = false ? "balance_rov" : "balance";
        const userBalance = Number(liveUser[balanceField] || 0);
        const newBalance = userBalance + coupon.amount;
        await supabase
          .from("profiles")
          .update({ [balanceField]: newBalance })
          .eq("username", activeUsername);
        const { error: topupError } = await supabase.from("topups").insert([
          {
            username: activeUsername,
            amount: coupon.amount,
            method: `Coupon: ${coupon.code}`,
            game: appScreen,
          },
        ]);
        if (topupError) {
          await supabase.from("topups").insert([
            {
              username: activeUsername,
              amount: coupon.amount,
              method: `Coupon: ${coupon.code}`,
            },
          ]);
        }

        window.dispatchEvent(new Event("sync-update"));

        showToast(
          `ใช้คูปองสำเร็จ! ได้รับ ${coupon.amount.toLocaleString()} เครดิต`,
          "success",
        );
        setTopupSuccessMessage(
          `ใช้คูปองสำเร็จ! ได้รับ ${coupon.amount.toLocaleString()} เครดิต`,
        );
        setTopupModalStep("success");
        setTopupCode("");
        if (currentUser) setCurrentUser({ ...currentUser });
      } else {
        showToast("ไม่พบโค้ดคูปองนี้ในระบบ", "error");
      }
      return;
    }

    setIsProcessingTopup(true);
    // Angpao topup
    if (topupModalStep === "angpao") {
      const receiveAngpao = async () => {
        try {
          setTopupError(""); // Clear earlier errors
          const res = await fetch("/api/topup/true-wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gift_link: topupCode.trim(), game: appScreen }),
          });
          const data = await res.json();
          if (data.status === "success") {
            const rawAmount = parseFloat(data.amount) || 0;
            const fee = Number((rawAmount * 0.029).toFixed(2));
            const amount = Number((rawAmount - fee).toFixed(2));
            const ownerName = data.owner_profile || "ไม่ทราบชื่อ";

            const configData = await getSystemConfig();
            if (appScreen === "SHOP") {
              const currentRev = configData
                ? Number(configData.global_rev_astd || 0)
                : 0;
              await supabase
                .from("system_config")
                .upsert({ id: "main", global_rev_astd: currentRev + amount });
            } else if (false) {
              const currentRev = configData
                ? Number(configData.global_revenue_aotr || 0)
                : 0;
              await supabase
                .from("system_config")
                .upsert({
                  id: "main",
                  global_revenue_aotr: currentRev + amount,
                });
            }
            // If ROV, we do nothing to system_config because we don't track global_revenue_rov currently.

            const balanceField = false ? "balance_rov" : "balance";
            const userBalance = Number(liveUser[balanceField] || 0);
            const newBalance = userBalance + amount;
            await supabase
              .from("profiles")
              .update({ [balanceField]: newBalance })
              .eq("username", activeUsername);
            const { error: topupError } = await supabase.from("topups").insert([
              {
                username: activeUsername,
                amount: amount,
                method: `TrueMoney (Angpao) - ${topupCode.trim()}`,
                game: appScreen,
              },
            ]);
            if (topupError) {
              await supabase.from("topups").insert([
                {
                  username: activeUsername,
                  amount: amount,
                  method: `TrueMoney (Angpao) - ${topupCode.trim()}`,
                },
              ]);
            }

            window.dispatchEvent(new Event("sync-update"));

            const msg = `เติมเงินสำเร็จ! จำนวน ${amount.toLocaleString()} บาท\n(หักค่าธรรมเนียม ${fee})\nจากซองของ: ${ownerName}`;
            showToast(`เติมเงินสำเร็จ ${amount} บาท`, "success");
            setTopupSuccessMessage(msg);
            setTopupModalStep("success");
            setTopupCode("");
            if (currentUser) setCurrentUser({ ...currentUser });
            sendDiscordTopupEmbed(
              activeUsername,
              amount,
              "angpao",
              newBalance,
              true,
              appScreen
            );
          } else {
            let errorMsg =
              data.message || "ซองของขวัญไม่ถูกต้องหรือถูกใช้งานไปแล้ว";
            if (errorMsg.includes("ติดต่อผู้ดูแลระบบ")) {
              errorMsg += " ";
            }
            if (errorMsg.includes("http")) {
              errorMsg = errorMsg.replace(
                /https:\/\/discord\.gg\/[a-zA-Z0-9]+/g,
                "https://discord.gg/AQKtJpvyva",
              );
            }
            setTopupError(`API แจ้งเตือน: ${errorMsg}`);
            showToast(errorMsg, "error");
            sendDiscordTopupEmbed(
              activeUsername,
              0,
              "angpao",
              (liveUser[appScreen === 'ROV' ? 'balance_rov' : 'balance'] || 0),
              false,
              appScreen
            );
          }
        } catch (error: any) {
          console.error("Topup error:", error);
          const catchErr = "ระบบเครือข่ายมีปัญหา หรือเรียกใช้ API ไม่ได้";
          setTopupError(catchErr);
          showToast(catchErr, "error");
        } finally {
          setIsProcessingTopup(false);
        }
      };
      receiveAngpao();
      return;
    }

    if (topupModalStep === "bank") {
      if (!slipFile) {
        showToast("กรุณาแนบสลิปการโอนเงิน", "error");
        setIsProcessingTopup(false);
        return;
      }

      const processBankSlip = async () => {
        try {
          setTopupError("");
          
          const qrcode_text = await readQRFromImage(slipFile);
          if (!qrcode_text) {
            showToast("สลิปการโอนเงินไม่ถูกต้อง คิวอาร์โค้ดไม่สมบูรณ์ หรือไม่มีข้อมูล", "error");
            setIsProcessingTopup(false);
            return;
          }

          const checkRes = await fetch("/api/topup/bank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              qrcode_text,
            }),
          });
          const data = await checkRes.json();
          if (data.status === "success" || data.code === 200 || data.message === "เช็คสลิปสำเร็จ") {
            const slipData = data.data || data;
            const amount = parseFloat(slipData.amount?.amount || slipData.amount || data.amount) || 0;
            const receiverName = slipData.receiver?.name || slipData.receiver?.account_name || slipData.receiver_name || data.receiver_name || "ไม่ทราบชื่อ";
            const senderName = slipData.sender?.name || slipData.sender?.account_name || slipData.sender_name || data.sender_name || "ไม่ทราบชื่อ";
            const transRef = slipData.transRef || slipData.ref1 || data.transRef || data.ref1 || `UNKNOWN-${Date.now()}`;

            if (amount <= 0) {
              setTopupError("ไม่พบยอดเงินในสลิป หรือสลิปไม่สมบูรณ์");
              showToast("ไม่พบยอดเงินในสลิป หรือสลิปไม่สมบูรณ์", "error");
              setIsProcessingTopup(false);
              return;
            }

            const { data: existingTopup } = await supabase
              .from("topups")
              .select("id")
              .eq("method", `Slip: ${transRef}`)
              .single();

            if (existingTopup) {
              const errMsg = "สลิปนี้ถูกใช้งานไปแล้ว";
              setTopupError(errMsg);
              showToast(errMsg, "error");
              setIsProcessingTopup(false);
              sendDiscordTopupEmbed(
                activeUsername,
                0,
                "bank",
                (liveUser[appScreen === 'ROV' ? 'balance_rov' : 'balance'] || 0),
                false,
                appScreen
              );
              return;
            }

            const configData = await getSystemConfig();
            if (appScreen === "SHOP") {
              const currentRev = configData
                ? Number(configData.global_rev_astd || 0)
                : 0;
              await supabase
                .from("system_config")
                .upsert({ id: "main", global_rev_astd: currentRev + amount });
            } else if (false) {
              const currentRev = configData
                ? Number(configData.global_revenue_aotr || 0)
                : 0;
              await supabase
                .from("system_config")
                .upsert({
                  id: "main",
                  global_revenue_aotr: currentRev + amount,
                });
            }
            // If ROV, we do nothing to system_config because we don't track global_revenue_rov currently.

            const balanceField = false ? "balance_rov" : "balance";
            const userBalance = Number(liveUser[balanceField] || 0);
            const newBalance = userBalance + amount;
            await supabase
              .from("profiles")
              .update({ [balanceField]: newBalance })
              .eq("username", activeUsername);

            const { error: topupError } = await supabase.from("topups").insert([
              {
                username: activeUsername,
                amount: amount,
                method: `Slip: ${transRef}`,
                game: appScreen,
              },
            ]);
            if (topupError) {
              await supabase.from("topups").insert([
                {
                  username: activeUsername,
                  amount: amount,
                  method: `Slip: ${transRef}`,
                },
              ]);
            }

            window.dispatchEvent(new Event("sync-update"));

            const bankMsg = `เติมเงินด้วยสลิปสำเร็จ! จำนวน ${amount.toLocaleString()} บาท\nจาก: ${senderName}\nถึง: ${receiverName}`;
            showToast(bankMsg, "success");
            setTopupSuccessMessage(bankMsg);
            setTopupModalStep("success");
            setSlipFile(null);
            if (currentUser) setCurrentUser({ ...currentUser });
            sendDiscordTopupEmbed(
              activeUsername,
              amount,
              "bank",
              newBalance,
              true,
              appScreen
            );
          } else {
            let finalErr = data.message || "ข้อมูลสลิปไม่ถูกต้อง หรือเช็คไม่ได้";
            if (finalErr.includes("ติดต่อผู้ดูแลระบบ")) {
              finalErr += " ";
            }
            if (finalErr.includes("http")) {
              finalErr = finalErr.replace(
                /https:\/\/discord\.gg\/[a-zA-Z0-9]+/g,
                "https://discord.gg/AQKtJpvyva"
              );
            }
            setTopupError(`API แจ้งเตือน: ${finalErr}`);
            showToast(finalErr, "error");
            sendDiscordTopupEmbed(
              activeUsername,
              0,
              "bank",
              (liveUser[appScreen === 'ROV' ? 'balance_rov' : 'balance'] || 0),
              false,
              appScreen
            );
          }
        } catch (error: any) {
          console.error("Bank check error:", error);
          const catchErr = "ระบบเครือข่ายมีปัญหา หรือเรียกใช้ API ไม่ได้";
          setTopupError(catchErr);
          showToast(catchErr, "error");
        } finally {
          setIsProcessingTopup(false);
        }
      };
      processBankSlip();
      return;
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === "forgot") {
      if (!authEmail.trim()) {
        setAuthError("กรุณากรอกอีเมลให้ครบถ้วน");
        return;
      }
    } else if (authMode === "forgot_verify_otp") {
      if (!authEmail.trim() || !authOtpCode.trim() || !authPassword.trim()) {
        setAuthError("กรุณากรอกอีเมล รหัส OTP และรหัสผ่านใหม่ ให้ครบถ้วน");
        return;
      }
    } else {
      if (
        !authUsername.trim() ||
        !authPassword.trim() ||
        (authMode === "register" &&
          (!authEmail.trim() || !authConfirmPassword.trim()))
      ) {
        setAuthError(
          authMode === "register"
            ? "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง"
            : "กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน",
        );
        return;
      }
      if (authMode === "register" && authPassword !== authConfirmPassword) {
        setAuthError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
        return;
      }
    }

    if (authMode === "login") {
      const storage = rememberAuth ? localStorage : sessionStorage;
      localStorage.removeItem("KUWASHII_CURRENT_USER");
      sessionStorage.removeItem("KUWASHII_CURRENT_USER");
      localStorage.removeItem("KUWASHII_IS_ADMIN");
      sessionStorage.removeItem("KUWASHII_IS_ADMIN");

      if (
        authUsername.trim() === "Kuwashii_admin" &&
        authPassword === "ZAZACI09"
      ) {
        setIsAdmin(true);
        setCurrentUser({ username: "Kuwashii_admin" });
        storage.setItem("KUWASHII_IS_ADMIN", "true");
        storage.setItem(
          "KUWASHII_CURRENT_USER",
          JSON.stringify({ username: "Kuwashii_admin" }),
        );
        setShowAuthModal(false);
        setAuthUsername("");
        setAuthEmail("");
        setAuthPassword("");
        setAuthConfirmPassword("");
        setAuthError("");
        showToast("เข้าสู่ระบบผู้ดูแลเรียบร้อยแล้ว!", "success");
        return;
      }

      const usernameTrimmed = authUsername.trim();
      const user = await fetchUser(usernameTrimmed);

      if (user && user.password === authPassword) {
        setCurrentUser({ username: usernameTrimmed });
        storage.setItem(
          "KUWASHII_CURRENT_USER",
          JSON.stringify({ username: usernameTrimmed }),
        );
        storage.setItem("KUWASHII_IS_ADMIN", "false");

        setShowAuthModal(false);
        setAuthUsername("");
        setAuthEmail("");
        setAuthPassword("");
        setAuthConfirmPassword("");
        setAuthError("");
        showToast("เข้าสู่ระบบสำเร็จ!", "success");
      } else {
        setAuthError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!");
      }
    } else if (authMode === "forgot") {
      if (!authEmail.includes("@")) {
        setAuthError("รูปแบบอีเมลไม่ถูกต้อง");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", authEmail.trim())
        .limit(1)
        .single();

      if (!data) {
        setAuthError("ไม่พบบัญชีที่ผูกกับอีเมลนี้");
        return;
      }

      // Generate OTP and expire 15 mins
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expire = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await supabase
        .from("profiles")
        .update({ otp_code: otp, otp_expires_at: expire })
        .eq("username", data.username);

      try {
        const response = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toEmail: authEmail.trim(), otp }),
        });
        const resData = await response.json();
        if (resData.error) {
          throw new Error(resData.error);
        }
      } catch (err: any) {
        console.error("Failed to send OTP:", err);
        setAuthError(
          err.message || "เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง",
        );
        return;
      }

      setAuthMode("forgot_verify_otp");
      setAuthError("");
      showToast("รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว", "success");
    } else if (authMode === "forgot_verify_otp") {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", authEmail.trim())
        .limit(1)
        .single();
      if (!data) {
        setAuthError("ไม่พบบัญชีที่ผูกกับอีเมลนี้");
        return;
      }
      if (data.otp_code !== authOtpCode.trim()) {
        setAuthError("รหัส OTP ไม่ถูกต้อง");
        return;
      }
      if (new Date(data.otp_expires_at) < new Date()) {
        setAuthError("รหัส OTP หมดอายุแล้ว");
        return;
      }

      await supabase
        .from("profiles")
        .update({
          password: authPassword,
          otp_code: null,
          otp_expires_at: null,
        })
        .eq("username", data.username);

      setAuthMode("login");
      setAuthPassword("");
      setAuthOtpCode("");
      setAuthEmail("");
      setAuthError("");
      showToast("ตั้งรหัสผ่านใหม่สำเร็จแล้ว กรุณาเข้าสู่ระบบ", "success");
    } else {
      // Register Mode
      try {
        const lockRes = await fetch("/api/check-register-lock");
        const lockData = await lockRes.json();
        if (lockData.locked) {
          setAuthError(
            `กรุณารอ ${lockData.remaining} นาที ก่อนสมัครสมาชิกใหม่เพื่อป้องกันสแปม (ล็อค IP)`,
          );
          return;
        }
      } catch (e) {
        console.error("Lock check error", e);
      }

      if (!authEmail.includes("@")) {
        setAuthError("รูปแบบอีเมลไม่ถูกต้อง");
        return;
      }

      const targetUsername = authUsername.trim();

      if (targetUsername.toLowerCase() === "kuwashii_admin") {
        setAuthError("ไม่สามารถใช้ชื่อผู้ดูแลนี้ได้");
        return;
      }

      const existing = await fetchUser(targetUsername);

      if (existing) {
        setAuthError("ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว!");
        return;
      }

      try {
        const { data: existingEmail } = await supabase
          .from("profiles")
          .select("username")
          .eq("email", authEmail.trim())
          .limit(1)
          .single();
        if (existingEmail) {
          setAuthError("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น!");
          return;
        }
      } catch (e) {
        // Table might not have email column yet or other error, ignore and let insert fail if it's unique
      }

      let insertRes = await supabase.from("profiles").insert([
        {
          username: targetUsername,
          email: authEmail.trim(),
          password: authPassword,
          balance: 0,
          balance_rov: 0,
        },
      ]);

      if (insertRes.error && insertRes.error.message.includes("email")) {
        // Fallback for older schema without email column
        insertRes = await supabase.from("profiles").insert([
          {
            username: targetUsername,
            password: authPassword,
            balance: 0,
          balance_rov: 0,
          },
        ]);
      }

      if (insertRes.error) {
        setAuthError("เกิดข้อผิดพลาดในการสมัครสมาชิก โปรดลองอีกครั้ง");
        return;
      }

      const storage = rememberAuth ? localStorage : sessionStorage;
      localStorage.removeItem("KUWASHII_CURRENT_USER");
      sessionStorage.removeItem("KUWASHII_CURRENT_USER");
      localStorage.removeItem("KUWASHII_IS_ADMIN");
      sessionStorage.removeItem("KUWASHII_IS_ADMIN");

      setCurrentUser({ username: authUsername.trim() });
      storage.setItem(
        "KUWASHII_CURRENT_USER",
        JSON.stringify({ username: authUsername.trim() }),
      );
      storage.setItem("KUWASHII_IS_ADMIN", "false");

      setShowAuthModal(false);
      setAuthUsername("");
      setAuthEmail("");
      setAuthPassword("");
      setAuthConfirmPassword("");
      setAuthError("");

      addLiveActivity({
        type: "signup",
        username: authUsername.trim(),
        game: appScreen,
      });

      try {
        await fetch("/api/set-register-lock", { method: "POST" });
      } catch (e) {}
      showToast("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!", "success");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem("KUWASHII_IS_ADMIN");
    localStorage.removeItem("KUWASHII_CURRENT_USER");
    sessionStorage.removeItem("KUWASHII_IS_ADMIN");
    sessionStorage.removeItem("KUWASHII_CURRENT_USER");
    showToast("ออกจากระบบแล้ว", "info");
  };

  const handleChangePassword = async (newPass: string) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from("profiles")
      .update({ password: newPass })
      .eq("username", currentUser.username);
    if (!error) {
      showToast("เปลี่ยนรหัสผ่านสำเร็จ", "success");
    } else {
      showToast("เกิดข้อผิดพลาดเปลี่ยนรหัสผ่านไม่ได้", "error");
    }
  };

  const handleChangeUsername = async (newUsername: string) => {
    if (!currentUser) return false;
    const trimmedNew = newUsername.trim();
    if (trimmedNew.length < 3) {
      showToast("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร", "error");
      return false;
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", trimmedNew)
      .limit(1)
      .maybeSingle();
    if (existing) {
      showToast("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว", "error");
      return false;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username_last_changed")
      .eq("username", currentUser.username)
      .single();
    if (profile && profile.username_last_changed) {
      const lastChanged = new Date(profile.username_last_changed);
      const now = new Date();
      const diffDays =
        (now.getTime() - lastChanged.getTime()) / (1000 * 3600 * 24);
      if (diffDays < 7) {
        showToast(
          `เปลี่ยนชื่อได้อีกครั้งในอีก ${Math.ceil(7 - diffDays)} วัน`,
          "error",
        );
        return false;
      }
    }

    const oldUsername = currentUser.username;
    const { error } = await supabase
      .from("profiles")
      .update({
        username: trimmedNew,
        username_last_changed: new Date().toISOString(),
      })
      .eq("username", oldUsername);

    if (error) {
      showToast("เกิดข้อผิดพลาดในการเปลี่ยนชื่อ", "error");
      return false;
    }

    await Promise.all([
      supabase
        .from("purchases")
        .update({ username: trimmedNew })
        .eq("username", oldUsername),
      supabase
        .from("topups")
        .update({ username: trimmedNew })
        .eq("username", oldUsername),
      supabase
        .from("activities")
        .update({ username: trimmedNew })
        .eq("username", oldUsername),
      supabase
        .from("claimed_jackpots")
        .update({ username: trimmedNew })
        .eq("username", oldUsername),
    ]);

    const updatedUser = { ...currentUser, username: trimmedNew };
    setCurrentUser(updatedUser);
    localStorage.setItem("KUWASHII_CURRENT_USER", JSON.stringify(updatedUser));
    showToast("เปลี่ยนชื่อผู้ใช้สำเร็จ", "success");
    return true;
  };

  const handleChangeEmail = async (newEmail: string) => {
    if (!currentUser) return false;
    const trimmedEmail = newEmail.trim();
    if (!trimmedEmail.includes("@")) {
      showToast("รูปแบบอีเมลไม่ถูกต้อง", "error");
      return false;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ email: trimmedEmail })
      .eq("username", currentUser.username);
    if (error) {
      showToast("เกิดข้อผิดพลาดในการเปลี่ยนอีเมล", "error");
      return false;
    }
    showToast("เปลี่ยนอีเมลสำเร็จ", "success");
    return true;
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const username = currentUser.username;

    await supabase.from("profiles").delete().eq("username", username);
    await supabase.from("topups").delete().eq("username", username);
    await supabase.from("purchases").delete().eq("username", username);

    handleLogout();
    showToast("ลบบัญชีและข้อมูลทั้งหมดเรียบร้อยแล้ว", "info");
  };

  // --- Add/Edit/Delete controllers ---
  const handleSaveItem = async (itemData: Omit<StockItem, "updatedAt">) => {
    const timestamp = new Date().toISOString();

    // Fetch latest to prevent race condition
    let currentItems = (await fetchItems()) || items;

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
    const updatedList =
      existingIndex >= 0
        ? currentItems.map((it) => (it.id === itemData.id ? finalItem : it))
        : [finalItem, ...currentItems];

    await saveItemsToStorage(updatedList);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    // Fetch latest to prevent race condition
    let currentItems = (await fetchItems()) || items;

    const itemToDelete = currentItems.find((it) => it.id === id);
    if (!itemToDelete) return;

    if (
      confirm(
        `คุณมั่นใจหรือไม่ที่จะลบ "${itemToDelete.name}" ออกจากคลังสต๊อกสินค้า?`,
      )
    ) {
      const remainingItems = currentItems.filter((it) => it.id !== id);

      try {
        await supabase.from("items").delete().eq("id", id);
        setItems(remainingItems);
        window.dispatchEvent(new Event("sync-update"));
      } catch (e) {
        console.error("Error deleting item:", e);
      }

      // Cleanup Claimed Jackpots
      try {
        const stored = localStorage.getItem("KUWASHII_CLAIMED_JACKPOTS");
        if (stored) {
          const parsed = JSON.parse(stored);
          const filtered = parsed.filter((c: any) => c.itemId !== id);
          localStorage.setItem(
            "KUWASHII_CLAIMED_JACKPOTS",
            JSON.stringify(filtered),
          );
        }
      } catch (e) {}

      showToast("ลบสินค้าออกจากระบบและฐานข้อมูลเรียบร้อย", "info");
    }
  };

  const handleBuyItem = async (item: StockItem, purchaseQty: number = 1) => {
    if (!currentUser) {
      showToast("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ!", "error");
      setShowAuthModal(true);
      return;
    }
    if (isAdmin) {
      showToast("ผู้ดูแลระบบไม่สามารถสั่งซื้อสินค้าตัวเองได้", "info");
      return;
    }

    const user = await fetchUser(currentUser.username);

    if (!user) {
      showToast(
        "ไม่พบบัญชีส่วนตัวในฐานข้อมูล V2 (โปรดออกจากระบบและเข้าใหม่)",
        "error",
      );
      return;
    }

    if (purchaseQty > item.quantity) {
      showToast("ขออภัย สินค้าในสต๊อกมีไม่เพียงพอ", "error");
      return;
    }

    const totalPrice = item.price * purchaseQty;
    const balanceField = false ? "balance_rov" : "balance";
    const userBalance = Number(user[balanceField] || 0);
    if (userBalance < totalPrice) {
      showToast(
        `ยอดเครดิตในระบบไม่เพียงพอ! (ขาดอีก ${totalPrice - userBalance} ฿)`,
        "error",
      );
      return;
    }

    setIsProcessingPurchase(true);

    // Simulate payment processing delay
    setTimeout(async () => {
      // Re-fetch users to prevent race conditions during the delay
      const liveUser = await fetchUser(currentUser.username);

      const liveUserBalance = Number(liveUser[balanceField] || 0);
      if (!liveUser || liveUserBalance < totalPrice) {
        showToast("ยอดเงินไม่เพียงพอ หรือข้อมูลไม่ถูกต้อง", "error");
        setIsProcessingPurchase(false);
        return;
      }

      // Read LIVE items to ensure stock is still enough and accurately evaluate gacha drops
      const { data: dbItem } = await supabase
        .from("items")
        .select("quantity")
        .eq("id", item.id)
        .single();
      let liveItemQty = item.quantity;
      if (dbItem) {
        liveItemQty = dbItem.quantity;
      }

      if (purchaseQty > liveItemQty) {
        showToast(
          "ขออภัย สินค้าในสต๊อกถูกซื้อไปหมดหรือมีไม่เพียงพอแล้ว",
          "error",
        );
        setIsProcessingPurchase(false);
        return;
      }

      // Load claimed jackpots to prevent duplicate giving of the exact same stock trigger
      let claimedJackpots: any[] = [];
      let usingSupabaseClaims = false;
      try {
        const { data: dbClaims, error: claimsErr } = await supabase
          .from("claimed_jackpots")
          .select("*")
          .eq("item_id", item.id);
        if (!claimsErr && dbClaims) {
          claimedJackpots = dbClaims.map((c: any) => ({
            itemId: c.item_id,
            stockTrigger: c.stock_trigger,
          }));
          usingSupabaseClaims = true;
        } else {
          throw new Error("Fallback to local");
        }
      } catch (e) {
        try {
          const storedClaims = localStorage.getItem(
            "KUWASHII_CLAIMED_JACKPOTS",
          );
          if (storedClaims) {
            const parsed = JSON.parse(storedClaims);
            const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
            claimedJackpots = parsed.filter(
              (c: any) => new Date(c.timestamp).getTime() > threeDaysAgo,
            );
          }
        } catch (e) {}
      }

      // Perform Gacha Roll based on CURRENT LIVE stock
      let drops: { name: string; color?: string; isSalt?: boolean }[] = [];
      if (item.gachaPool && item.gachaPool.length > 0) {
        for (let i = 0; i < purchaseQty; i++) {
          const currentOpenStock = liveItemQty - i;

          let dropped = null;

          const guaranteedReward = item.gachaPool.find(
            (r) =>
              (r.guaranteedAtStock !== undefined &&
                r.guaranteedAtStock === currentOpenStock) ||
              (r.guaranteedAtStocks &&
                r.guaranteedAtStocks.includes(currentOpenStock)),
          );

          if (guaranteedReward) {
            // Check if ANYONE already claimed this specific stock trigger for this item
            const isClaimed = claimedJackpots.some(
              (c) =>
                c.itemId === item.id && c.stockTrigger === currentOpenStock,
            );
            if (!isClaimed) {
              dropped = guaranteedReward;
              if (usingSupabaseClaims) {
                // Perform atomic insert FIRST
                const { error: claimErr } = await supabase
                  .from("claimed_jackpots")
                  .insert([
                    {
                      item_id: item.id,
                      stock_trigger: currentOpenStock,
                      reward_name: dropped.name,
                      username: currentUser.username,
                    },
                  ]);

                if (claimErr && claimErr.code === "23505") {
                  // UNIQUE constraint violation
                  // Someone else beat us to this jackpot!
                  dropped = null; // Turn to salt
                } else {
                  const newClaim = {
                    itemId: item.id,
                    rewardName: dropped.name,
                    stockTrigger: currentOpenStock,
                    username: currentUser.username,
                    timestamp: new Date().toISOString(),
                  };
                  claimedJackpots.push(newClaim);
                }
              } else {
                const newClaim = {
                  itemId: item.id,
                  rewardName: dropped.name,
                  stockTrigger: currentOpenStock,
                  username: currentUser.username,
                  timestamp: new Date().toISOString(),
                };
                claimedJackpots.push(newClaim);
              }
            }
          }

          if (dropped) {
            drops.push({ name: dropped.name, color: dropped.color });
          } else {
            drops.push({ name: "เกลือ", color: "#6b7280", isSalt: true });
          }
        }
      }

      if (!usingSupabaseClaims) {
        // Update Claimed Jackpots Local Cache
        localStorage.setItem(
          "KUWASHII_CLAIMED_JACKPOTS",
          JSON.stringify(claimedJackpots),
        );
      }

      // Process Purchase
      const newBalance = liveUserBalance - totalPrice;
      await supabase
        .from("profiles")
        .update({ [balanceField]: newBalance })
        .eq("username", currentUser.username);

      let extractCreds: string[] | undefined = undefined;
      let nextAccCreds = item.accountCredentials;

      if (item.accountCredentials && item.accountCredentials.length > 0) {
        extractCreds = item.accountCredentials.slice(0, purchaseQty);
        nextAccCreds = item.accountCredentials.slice(purchaseQty);
        await supabase
          .from("items")
          .update({
            quantity: liveItemQty - purchaseQty,
            gacha_pool: {
              pool: item.gachaPool || null,
              initialQuantity: item.initialQuantity,
              piecesPerUnit: item.piecesPerUnit,
              accountCredentials: nextAccCreds,
            },
          })
          .eq("id", item.id);

        // Also update local immediately
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  quantity: liveItemQty - purchaseQty,
                  accountCredentials: nextAccCreds,
                }
              : it,
          ),
        );
      } else {
        handleQuickQuantityChange(item.id, -purchaseQty, true);
      }

      const { error: purchaseError } = await supabase.from("purchases").insert([
        {
          username: currentUser.username,
          item_id: item.id,
          item_name: item.name,
          price: totalPrice,
          quantity: purchaseQty,
          gacha_drops: drops.length > 0 ? drops : null,
          credential_data: extractCreds ? extractCreds.join("\n") : null,
          game: item.game || appScreen,
        },
      ]);
      if (purchaseError) {
        console.error("Error inserting purchase:", purchaseError);
        
        // Retry with basic schema if the new columns don't exist
        const { error: fallbackError } = await supabase.from("purchases").insert([
          {
            username: currentUser.username,
            item_id: item.id,
            item_name: item.name,
            price: totalPrice,
            quantity: purchaseQty,
          },
        ]);
        if (fallbackError) {
          console.error("Fallback purchase insert also failed:", fallbackError);
        }
      }

      if (item.game === "ASTD") {
        const configData = await getSystemConfig();
        const currentSales = configData
          ? Number(configData.global_sales_astd || 0)
          : 0;
        await supabase
          .from("system_config")
          .upsert({
            id: "main",
            global_sales_astd: currentSales + purchaseQty,
          });
      } else if (item.game === "ROV") {
        const configData = await getSystemConfig();
        const currentSales = configData
          ? Number(configData.global_sales_rov || 0)
          : 0;
        const { error } = await supabase
          .from("system_config")
          .upsert({
            id: "main",
            global_sales_rov: currentSales + purchaseQty,
          });
        // Error will pop up in console if column doesn't exist, but won't crash user app thanks to no strict throw.
        if (error) console.warn("Supabase update for ROV sales failed (likely missing column global_sales_rov)", error);
      }

      // Reduce Stock natively handled earlier for creds or via fallback

      const hasGuaranteed = drops.some((d) => !d.isSalt);
      if (!(isAdmin && hasGuaranteed)) {
        addLiveActivity({
          type: "purchase",
          username: currentUser.username,
          itemName: item.name,
          quantity: purchaseQty,
          price: totalPrice,
          remainingStock: liveItemQty - purchaseQty,
          game: item.game || "ASTD",
          gachaDrops: drops.length > 0 ? drops : undefined,
        });
      }

      const webhookDrops =
        drops.length > 0
          ? drops
          : [{ name: `${item.name} x${purchaseQty}`, isSalt: false }];
      sendDiscordPurchaseEmbed(
        currentUser.username,
        item.name,
        purchaseQty,
        liveItemQty - purchaseQty,
        webhookDrops,
        appScreen
      );

      setInquiringItem(null);
      setIsProcessingPurchase(false);
      window.dispatchEvent(new Event("sync-update"));

      if (drops.length > 0) {
        setGachaResult({
          item,
          drops,
          purchaseQty: purchaseQty,
          remainingStock: liveItemQty - purchaseQty,
        });
      } else {
        setGachaResult({
          item,
          purchaseQty: purchaseQty,
          remainingStock: liveItemQty - purchaseQty,
          drops: [
            {
              name: `${item.name} x${purchaseQty}`,
              color: "#10B981",
              isSalt: false,
            },
          ],
        });
      }
    }, 1500);
  };

  const handleQuickQuantityChange = async (
    id: string,
    delta: number,
    silent: boolean = false,
  ) => {
    const { data: dbItem } = await supabase
      .from("items")
      .select("quantity")
      .eq("id", id)
      .single();
    if (!dbItem) return;

    const nextQty = Math.max(0, dbItem.quantity + delta);
    const nowIso = new Date().toISOString();

    const { error } = await supabase
      .from("items")
      .update({ quantity: nextQty, created_at: nowIso })
      .eq("id", id);
    if (!error) {
      setItems(
        items.map((it) =>
          it.id === id ? { ...it, quantity: nextQty, updatedAt: nowIso } : it,
        ),
      );
      window.dispatchEvent(new Event("sync-update"));

      if (!silent) {
        showToast("อัปเดตจำนวนสต็อกเรียบร้อย!", "success");
        if (nextQty <= 5 && nextQty < dbItem.quantity) {
          playChime("warning");
        } else if (nextQty > dbItem.quantity) {
          playChime("success");
        } else {
          playChime("info");
        }
      }
    } else {
      showToast("เกิดข้อผิดพลาดในการอัปเดตจำนวนสต็อก", "error");
    }
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
      showToast(`ปักหมุดไอเทม ${updated.name} แล้ว!`, "success");
    } else {
      showToast(`ยกเลิกการปักหมุดไอเทม ${updated.name} แล้ว`, "info");
    }
  };

  const handleResetPresets = async () => {
    if (
      confirm(
        `คุณต้องการรีเซ็ตสินค้าในสต๊อกกลับไปเป็นค่าเริ่มต้นจากเกม ${appScreen} หรือไม่? (ข้อมูลที่แก้ไขจะหายไป)`,
      )
    ) {
      saveItemsToStorage(DEFAULT_PRESETS);
      showToast("คืนค่าสต๊อคเริ่มต้นในระบบเรียบร้อย!", "info");
    }
  };

  const handleClearStockToZero = async () => {
    if (
      confirm(
        "⚠️ คุณแน่ใจหรือไม่ที่จะรีเซ็ตทุกไอเทมในคลังสินค้าปัจจุบันให้เหลือจำนวนสต๊อกเป็น 0 ชิ้น? (ข้อมูลราคาและไอเทมจะอยู่ครบ แต่สต๊อกจะกลายเป็น 0 ทั้งหมด)",
      )
    ) {
      const updatedList = items.map((it) => ({
        ...it,
        quantity: 0,
        updatedAt: new Date().toISOString(),
      }));
      saveItemsToStorage(updatedList);
      showToast(
        "เซ็ตจำนวนสินค้าในสต๊อกทั้งหมดเหลือ 0 ชิ้น เรียบร้อย!",
        "success",
      );
    }
  };

  const handleDeleteAllProducts = async () => {
    if (
      confirm(
        "⚠️⚠️⚠️ คุณแน่ใจหรือไม่ที่จะลบสินค้าทั้งหมดออกจากระบบร้านค้าและคลาวด์เซิร์ฟเวอร์? (ข้อมูลสินค้าทั้งหมดและรูปภาพจะถูกล้างออกและแสดงผลเป็นหน้าว่างเปล่า มีสินค้า 0 รายการ)",
      )
    ) {
      saveItemsToStorage([]);
      showToast("ลบข้อมูลสินค้าทั้งหมดเรียบร้อยแล้ว!", "info");
    }
  };

  const getLatestUpdatedRelativeTime = (list: StockItem[]): string => {
    if (!list || list.length === 0) return "ไม่มีบันทึกข้อมูล";
    try {
      const timestamps = list
        .map((it) => new Date(it.updatedAt).getTime())
        .filter((t) => !isNaN(t));
      if (timestamps.length === 0) return "ไม่มีบันทึกข้อมูล";
      const latestTime = Math.max(...timestamps);
      const date = new Date(latestTime);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 15) return "เมื่อสักครู่นี้";
      if (diffSec < 60) return "เมื่อไม่กี่วินาทีก่อน";
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
      if (diffDays === 1) return "เมื่อวานนี้";
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;

      return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      });
    } catch (e) {
      return "ไม่ระบุเวลา";
    }
  };

  // Import / Export database functions
  const handleExportJSON = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(items, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `aotr_stock_export_${new Date().toISOString().split("T")[0]}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("ส่งออกไฟล์ข้อมูลเรียบร้อยแล้ว", "success");
    } catch (e) {
      showToast("ส่งออกผิดพลาด", "error");
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
          const isValid = importedData.every(
            (it) => it.id && it.name && typeof it.price === "number",
          );
          if (isValid) {
            saveItemsToStorage(importedData as StockItem[]);
            showToast("นำเข้าคลังสต๊อกสำเร็จและอัปเดตระบบแล้ว!", "success");
          } else {
            showToast("ฟอร์แมตข้อมูลในไฟล์ JSON ไม่ถูกต้อง", "error");
          }
        }
      } catch (err) {
        showToast("อ่านไฟล์ JSON ล้มเหลว", "error");
      }
    };
    reader.readAsText(file);
  };

  // --- Filtering & Sorting Compute ---
  const filteredItems = items.filter((item) => {
    const matchesGame = true;

    if (!matchesGame) return false;

    const searchStr = (search || "").toLowerCase();
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchStr) ||
      (item.description || "").toLowerCase().includes(searchStr) ||
      (item.category || "").toLowerCase().includes(searchStr);

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSaleFormat =
      selectedSaleFormat === "all" || item.saleFormat === selectedSaleFormat;

    let matchesStatus = true;
    if (selectedStatus === "in-stock") {
      matchesStatus = item.quantity > 5;
    } else if (selectedStatus === "low-stock") {
      matchesStatus = item.quantity > 0 && item.quantity <= 5;
    } else if (selectedStatus === "out-of-stock") {
      matchesStatus = item.quantity === 0;
    }

    const matchesPopular = !showPopularOnly || !!item.isPopular;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSaleFormat &&
      matchesStatus &&
      matchesPopular
    );
  });

  // Overload latest stock from LiveActivities (Plan 2) to prevent out-of-sync UI
  const getPatchedStockItems = () => {
    const liveActivitiesStr =
      localStorage.getItem("KUWASHII_LIVE_ACTIVITY") || "[]";
    const latestStockMap: Record<string, { qty: number; ts: number }> = {};
    try {
      const liveActivities = JSON.parse(liveActivitiesStr);
      liveActivities.forEach((a: any) => {
        if (
          a.type === "purchase" &&
          a.itemName &&
          a.remainingStock !== undefined
        ) {
          const aTime = new Date(a.timestamp).getTime();
          // Keep the absolutely most recent purchase activity for this item
          if (
            latestStockMap[a.itemName] === undefined ||
            aTime > latestStockMap[a.itemName].ts
          ) {
            latestStockMap[a.itemName] = { qty: a.remainingStock, ts: aTime };
          }
        }
      });
    } catch (e) {}

    return filteredItems.map((item) => {
      const patch = latestStockMap[item.name];
      if (patch) {
        const itemUpdateTs = item.updatedAt
          ? new Date(item.updatedAt).getTime()
          : 0;
        // If the purchase happened AFTER the last time the admin edited the item, use the patched stock
        if (patch.ts > itemUpdateTs && patch.qty < item.quantity) {
          return { ...item, quantity: patch.qty };
        }
      }
      return item;
    });
  };

  const patchedItems = getPatchedStockItems();

  const sortedItems = [...patchedItems].sort((a, b) => {
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
    if (selectedCategory === "all") {
      const categoryOrder =
        true ? [

              "Grow A Garden 2",
              "ALL STAR",
              "Coming Soon",
              "Other services",
              "VIP Codes"

]
          : false
            ? ["รหัส ROV"]
            : [
                "Serum",
                "Bloodline",
                "Skin",
                "Artifact",
                "Scroll/Key",
                "Perk",
                "Other",
              ];
      const indexA = categoryOrder.indexOf(a.category);
      const indexB = categoryOrder.indexOf(b.category);
      if (indexA !== -1 && indexB !== -1 && indexA !== indexB) {
        return indexA - indexB; // Keeps category order unified
      }
    }

    // 3. User sub-sort criteria
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "stock-desc":
        return b.quantity - a.quantity;
      case "stock-asc":
        return a.quantity - b.quantity;
      default: {
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const fallbackB = isNaN(timeB) ? 0 : timeB;
        const fallbackA = isNaN(timeA) ? 0 : timeA;
        return fallbackB - fallbackA;
      }
    }
  });

  const renderModals = () => (
    <>
      {renderStaleOverlay()}
      {/* Processing Purchase / Topup Overlay */}
      <AnimatePresence>
        {(isProcessingPurchase || isProcessingTopup) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900 "
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-zinc-950 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 tracking-widest mb-2 font-display">
                ระบบกำลังทำรายการ...
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                กรุณารอสักครู่ (Do not close)
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mock Email Modal Removed */}

      {/* Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
  
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-zinc-900 "
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative max-w-sm w-full rounded-2xl border border-zinc-800 bg-transparent p-6 shadow-2xl z-10"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 p-1 rounded-md hover:bg-zinc-900 transition-colors"
                onClick={() => setShowAuthModal(false)}
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="text-center space-y-2 mb-5">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-500">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-zinc-100">
                    {authMode === "login"
                      ? "เข้าสู่ระบบบัญชีของคุณ"
                      : authMode === "forgot"
                        ? "รีเซ็ตรหัสผ่าน"
                        : "สมัครสมาชิกใหม่"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    ระบบตัวแทนใช้งานและผู้ดูแลคลังสินค้า
                  </p>
                </div>
              </div>

              

              <form onSubmit={handleAuthSubmit} className="space-y-4 font-display tracking-tight">
                <div className="space-y-3">
                  {authMode !== "forgot" &&
                    authMode !== "forgot_verify_otp" && (
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                          ชื่อผู้ใช้งาน (Username)
                        </label>
                        <input
                          type="text"
                          value={authUsername}
                          onChange={(e) => {
                            setAuthUsername(e.target.value);
                            setAuthError("");
                          }}
                          placeholder="เช่น Kuwashii_member"
                          required={
                            authMode === "login" || authMode === "register"
                          }
                          autoFocus={
                            authMode === "login" || authMode === "register"
                          }
                          autoComplete="username"
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2.5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-medium"
                        />
                      </div>
                    )}

                  {(authMode === "register" ||
                    authMode === "forgot" ||
                    authMode === "forgot_verify_otp") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1 mt-3">
                        อีเมล (Email){" "}
                        <span className="text-emerald-500">*จำเป็น</span>
                      </label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => {
                          setAuthEmail(e.target.value);
                          setAuthError("");
                        }}
                        placeholder={
                          authMode === "forgot" ||
                          authMode === "forgot_verify_otp"
                            ? "อีเมลที่ใช้สมัครบัญชี"
                            : "สำหรับใช้รีเซ็ตรหัสผ่านหากลืม"
                        }
                        required
                        autoComplete="email"
                        readOnly={authMode === "forgot_verify_otp"}
                        className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2.5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-medium ${authMode === "forgot_verify_otp" ? "opacity-70 cursor-not-allowed" : ""}`}
                      />
                    </motion.div>
                  )}

                  {authMode === "forgot_verify_otp" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block mb-1 mt-3">
                        ข้อความถูกส่งแล้ว ใส่รหัสตามข้อความนั้น 6 หลัก
                      </label>
                      <input
                        type="text"
                        value={authOtpCode}
                        onChange={(e) => {
                          setAuthOtpCode(e.target.value);
                          setAuthError("");
                        }}
                        placeholder="123456"
                        required
                        className="w-full bg-zinc-900 border border-amber-500/50 text-amber-100 px-3.5 py-2.5 rounded-2xl focus:outline-none focus:border-amber-500 transition-all text-sm placeholder-zinc-600 font-mono tracking-widest font-bold text-center"
                        maxLength={6}
                      />
                    </motion.div>
                  )}

                  {authMode !== "forgot" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1 mt-3">
                        {authMode === "forgot_verify_otp"
                          ? "รหัสผ่านใหม่ (New Password)"
                          : "รหัสผ่าน (Password)"}
                      </label>
                      <div className="relative">
                        <input
                          type={showAuthPassword ? "text" : "password"}
                          value={authPassword}
                          onChange={(e) => {
                            setAuthPassword(e.target.value);
                            setAuthError("");
                          }}
                          placeholder={
                            authMode === "forgot_verify_otp"
                              ? "รหัสผ่านใหม่..."
                              : "ป้อนรหัสผ่าน..."
                          }
                          required={authMode !== "forgot"}
                          autoComplete={
                            authMode === "login"
                              ? "current-password"
                              : "new-password"
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2.5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-mono tracking-wider font-semibold pr-10"
                        />
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setShowAuthPassword(!showAuthPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors"
                        >
                          {showAuthPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                      {authMode === "login" && (
                        <label className="flex items-center gap-2 mt-3 cursor-pointer group w-fit text-[11px] text-zinc-500">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={rememberAuth}
                              onChange={(e) =>
                                setRememberAuth(e.target.checked)
                              }
                              className="appearance-none w-3.5 h-3.5 rounded border border-zinc-700 bg-zinc-900 checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer"
                            />
                            <Check
                              className={`w-2.5 h-2.5 text-zinc-100 absolute pointer-events-none transition-opacity ${rememberAuth ? "opacity-100" : "opacity-0"}`}
                            />
                          </div>
                          <span className="group-hover:text-zinc-400 transition-colors">
                            จดจำการเข้าสู่ระบบไว้
                          </span>
                        </label>
                      )}
                    </motion.div>
                  )}

                  {authMode === "register" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1 mt-3">
                        ยืนยันรหัสผ่าน (Confirm Password){" "}
                        <span className="text-emerald-500">*จำเป็น</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showAuthConfirmPassword ? "text" : "password"}
                          value={authConfirmPassword}
                          onChange={(e) => {
                            setAuthConfirmPassword(e.target.value);
                            setAuthError("");
                          }}
                          placeholder="ยืนยันรหัสผ่านอีกครั้ง..."
                          required={authMode === "register"}
                          autoComplete="new-password"
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2.5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-mono tracking-wider font-semibold pr-10"
                        />
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() =>
                            setShowAuthConfirmPassword(!showAuthConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors"
                        >
                          {showAuthConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {authMode === "login" && (
                    <div className="flex justify-end pt-1">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          setAuthMode("forgot");
                          setAuthError("");
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline-offset-2 hover:underline cursor-pointer"
                      >
                        ลืมรหัสผ่าน? (รีเซ็ตด้วยอีเมล)
                      </motion.button>
                    </div>
                  )}

                  {authError && (
                    <p className="text-[11px] text-red-500 text-center font-display tracking-tight mt-2.5 flex items-center justify-center gap-1 leading-normal bg-red-950/15 py-1.5 px-3 rounded-lg border border-red-900/35">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  {authMode === "forgot" || authMode === "forgot_verify_otp" ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setAuthError("");
                        setAuthOtpCode("");
                      }}
                      className="w-1/2 py-2 px-4 rounded-2xl border border-zinc-800 text-zinc-500 hover:text-zinc-100 bg-transparent text-xs font-semibold cursor-pointer transition-colors"
                    >
                      กลับไปหน้าเข้าสู่ระบบ
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowAuthModal(false)}
                      className="w-1/2 py-2 px-4 rounded-2xl border border-zinc-800 text-zinc-500 hover:text-zinc-100 bg-transparent text-xs font-semibold cursor-pointer transition-colors"
                    >
                      ยกเลิก
                    </motion.button>
                  )}
                  {authMode === "forgot_verify_otp" ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="w-1/2 py-2 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-zinc-100 border-none text-[11px] font-extrabold cursor-pointer transition-all active:scale-95 leading-tight"
                    >
                      ยืนยัน OTP และเปลี่ยนรหัสผ่าน
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className={`w-1/2 py-2 px-4 rounded-2xl ${authMode === "login" ? "bg-indigo-600 hover:bg-indigo-500" : authMode === "forgot" ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"} text-zinc-100 border-none text-xs font-extrabold cursor-pointer transition-all active:scale-95`}
                    >
                      {authMode === "forgot" ? "ขอรับรหัส OTP" : "เข้าสู่ระบบ"}
                    </motion.button>
                  )}
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
              className="absolute inset-0 bg-zinc-900 "
              onClick={() => {
                setShowTopupModal(false);
                setTopupModalStep("select");
                setTopupCode("");
                setTosAccepted(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-transparent border border-zinc-800 rounded-3xl shadow-2xl p-5 w-full max-w-sm relative z-10 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="text-center mb-5">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 mb-2">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-zinc-100 mb-1">
                  เลือกช่องทาง <span className="text-red-500">ชำระเงิน</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  ทำรายการผ่านช่องทางที่ท่านสะดวก
                </p>
              </div>
              <div className="mb-6 border-l-4 border-amber-500 bg-amber-500/10 rounded-r-xl p-4">
                <div className="flex gap-3">
                  <span className="text-xl leading-none">⚠️</span>
                  <div>
                    <h4 className="text-amber-500 font-bold text-sm mb-1">ข้อควรระวังก่อนทำรายการ</h4>
                    <p className="text-amber-500/80 text-[11px] leading-relaxed">
                      ระบบกระเป๋าเงินของคุณสามารถใช้งานได้ทุกบริการ<br/>
                      เครดิตที่ทำการเติมจะเข้าสู่กระเป๋าเกมนั้นๆ โดยตรง และ <b className="text-red-400">ไม่สามารถโอนย้ายข้ามเกมได้</b>
                    </p>
                  </div>
                </div>
              </div>

              {topupModalStep === "select" ? (
                <div className="space-y-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTopupChannel("angpao")}
                    disabled={!tosAccepted}
                    className={`w-full bg-zinc-900 border ${selectedTopupChannel === "angpao" ? "border-red-500 bg-red-500/10" : "border-zinc-800 hover:border-red-500/50 hover:bg-zinc-900"} rounded-2xl p-4 flex items-center gap-4 transition-all text-left group ${!tosAccepted ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                  >
                    <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-inner pt-1 pl-1 rotate-[-5deg] group-hover:rotate-[-2deg] transition-transform">
                      <Gift className="w-8 h-8 text-zinc-100/90 drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-100 text-base">
                        เติมผ่านซองอั่งเปา
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        เติมเงินผ่านระบบซองอั่งเปา
                        <br />
                        ของทรูมันนี่วอลเลท
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTopupChannel("bank")}
                    disabled={!tosAccepted}
                    className={`w-full relative bg-zinc-900 border ${selectedTopupChannel === "bank" ? "border-blue-500 bg-blue-900/200/10" : "border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900"} rounded-2xl p-4 flex items-center gap-4 transition-all text-left ${!tosAccepted ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                  >
                    <div className="absolute -top-3 -right-3 bg-blue-900/200/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg  z-10">
                      <Star className="w-3 h-3" /> แนะนำ
                    </div>
                    <div className="w-14 h-14 bg-blue-900/200 rounded-2xl flex items-center justify-center shadow-inner">
                      <Landmark className="w-8 h-8 text-zinc-100/90 drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-100 text-base">
                        เติมผ่านธนาคาร (รองรับทุกธนาคาร)
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        โอนเงินมาที่บัญชีธนาคารกสิกรไทย
                        <br />
                        รองรับสลิปจากทุกธนาคารชั้นนำ
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTopupChannel("coupon")}
                    disabled={!tosAccepted}
                    className={`w-full bg-zinc-900 border ${selectedTopupChannel === "coupon" ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900"} rounded-2xl p-4 flex items-center gap-4 transition-all text-left ${!tosAccepted ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                  >
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                      <Ticket className="w-8 h-8 text-zinc-100/90 drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-100 text-base">คูปอง</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        เติมเงินผ่านรหัสคูปอง
                        <br />
                        หรือโค้ดส่วนลดพิเศษ
                      </p>
                    </div>
                  </motion.button>

                  <div className="pt-4 border-t border-zinc-800 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={tosAccepted}
                          onChange={(e) => {
                            setTosAccepted(e.target.checked);
                            if (!e.target.checked)
                              setSelectedTopupChannel(null);
                          }}
                          className="peer appearance-none w-5 h-5 border-2 border-zinc-700 rounded bg-zinc-900 checked:bg-red-500 checked:border-red-500 transition-all"
                        />
                        <svg
                          className="absolute w-3 h-3 text-zinc-100 pointer-events-none opacity-0 peer-checked:opacity-100"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors select-none">
                        ยอมรับ{" "}
                        <span
                          className="text-red-500 font-medium hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowTopupTos(true);
                          }}
                        >
                          ข้อกำหนดในการให้บริการ
                        </span>
                      </span>
                    </label>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!tosAccepted) {
                          showToast(
                            "กรุณายอมรับข้อกำหนดในการให้บริการก่อน",
                            "error",
                          );
                        } else if (!selectedTopupChannel) {
                          showToast(
                            "กรุณาเลือกช่องทางการชำระเงินที่ต้องการใช้",
                            "error",
                          );
                        } else {
                          setTopupModalStep(selectedTopupChannel);
                        }
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-zinc-300 hover:bg-zinc-200 text-black text-sm font-bold opacity-80 hover:opacity-100 flex justify-center items-center gap-2 transition-all"
                    >
                      ถัดไป <span>→</span>
                    </motion.button>
                  </div>
                </div>
              ) : topupModalStep === "success" ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-2">
                    ทำรายการสำเร็จ!
                  </h3>
                  <div className="text-emerald-300 text-sm mb-6 px-4 leading-relaxed font-mono tracking-wide flex flex-col gap-2">
                    {topupSuccessMessage ? (
                      topupSuccessMessage.split("\n").map((line, idx) => (
                        <p
                          key={idx}
                          className={
                            line.includes("จากซองของ:")
                              ? "text-amber-400 font-bold bg-amber-500/10 py-1.5 px-2 rounded-lg"
                              : ""
                          }
                        >
                          {line}
                        </p>
                      ))
                    ) : (
                      <p>ยอดเครดิตของคุณได้รับการอัปเดตเรียบร้อยแล้ว</p>
                    )}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowTopupModal(false);
                      setTopupModalStep("select");
                      setTopupSuccessMessage("");
                      setTosAccepted(false);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-zinc-100 text-sm font-extrabold cursor-pointer transition-all shadow-lg"
                  >
                    ตกลง
                  </motion.button>
                </div>
              ) : (
                <form onSubmit={handleTopupSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-zinc-900 shadow-sm border border-zinc-800">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setTopupModalStep("select");
                        setTopupCode("");
                      }}
                      className="text-zinc-500 hover:text-zinc-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <h4 className="font-bold text-sm text-zinc-400">
                      {topupModalStep === "angpao"
                        ? "กรอกลิ้งค์ซองอั่งเปา"
                        : topupModalStep === "bank"
                          ? "แจ้งสลิปโอนเงินเข้า K BANK"
                          : "กรอกโค้ดคูปอง"}
                    </h4>
                  </div>

                  {topupModalStep === "angpao" && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                      <p className="text-xs text-red-300 mb-2 leading-relaxed">
                        สร้างซองของขวัญจากแอป{" "}
                        <strong className="text-red-400">
                          TrueMoney Wallet
                        </strong>{" "}
                        แบ่งจำนวนเงินเท่ากัน และระบุจำนวนคนที่รับซองเป็น 1 คน
                      </p>
                      <p className="text-[11px] text-red-400/70">
                        ยอดเงินจะถูกแปลงเป็นเครดิตตามมูลค่าในซอง (ขั้นต่ำ 10
                        บาท, ค่าธรรมเนียม 2.9%)
                      </p>

                      <div className="mt-4 bg-zinc-900 shadow-sm border border-zinc-800 p-3 rounded-lg border border-[#5865F2]/20 flex flex-col gap-2">
                        <p className="text-[11px] text-zinc-400 leading-relaxed text-left">
                          หากลูกค้าเติมเงินไปแล้วไม่เข้า ให้เปิดทิกเก็ตใน{" "}
                          <strong className="text-[#5865F2]">Discord</strong>{" "}
                          ได้เลย พร้อมแนบลิงค์ซองอั่งเปาที่เติมไปด้วย
                        </p>
                        <a
                          href="https://discord.gg/AQKtJpvyva"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-[#5865F2] hover:bg-[#4752C4] shadow-md shadow-[#5865F2]/20 transition-colors py-2 rounded-lg text-zinc-100 text-xs font-bold flex items-center justify-center gap-2 mt-1"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 127.14 96.36"
                          >
                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91,65.69,84.69,65.69Z" />
                          </svg>
                          เข้าดิสคอร์ด
                        </a>
                      </div>
                    </div>
                  )}

                  {topupModalStep === "bank" && (
                    <div className="mb-2 bg-blue-900/200/10 border border-blue-500/20 p-2.5 rounded-2xl flex flex-col items-center text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <p className="text-[11px] text-blue-300">
                          {false ? "กรุณาโอนเงินมาที่ (กสิกร/QR Code):" : "กรุณาโอนเงินมาที่บัญชี (QR Code):"}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-base md:text-lg font-bold text-zinc-100 tracking-widest font-mono">
                            {false ? "184-8-29946-0" : "213-3-81446-1"}
                          </p>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => {
                              const textToCopy = false ? "1848299460" : "2133814461";
                              navigator.clipboard.writeText(textToCopy);
                              showToast(false ? "คัดลอกเลขบัญชีกสิกรแล้ว" : "คัดลอกเลขบัญชีแล้ว", "success");
                            }}
                            className="p-1 justify-center bg-blue-900/200/20 text-blue-400 hover:bg-blue-900/200/40 rounded transition-colors duration-200"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <p className="text-sm md:text-base font-semibold text-blue-400">
                          {false ? "ด.ช. รัชชานนท์ เรืองสวัสดิ์" : "นายธีรเทพ ทองเกตุ"}
                        </p>
                      </div>

                      <a
                        href={false ? "https://img2.pic.in.th/1000108463.jpg" : "https://img2.pic.in.th/1000098251.jpg"}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full max-w-[150px] border-2 border-blue-500/30 rounded-lg overflow-hidden my-2 hover:opacity-90 transition-opacity bg-zinc-900"
                      >
                        <img
                          src={false ? "https://img2.pic.in.th/1000108463.jpg" : "https://img2.pic.in.th/1000098251.jpg"}
                          alt="Bank QR"
                          className="w-full h-auto"
                        />
                      </a>

                      <div className="w-full space-y-2 mt-2">
                        <p className="text-xs text-blue-400/90 border-t border-blue-500/20 pt-2 leading-tight">
                          คลิกที่รูปเพื่อดูรูปใหญ่ หรือดาวน์โหลดเก็บไว้
                          <br />
                          เมื่อโอนเสร็จสิ้น ให้อัปโหลด "ภาพสลิปโอนเงิน" ด้านล่าง
                        </p>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 text-xs md:text-sm text-red-500 font-bold leading-tight inline-block shadow-sm">
                          ⚠️ โปรดอัปโหลดสลิปภายใน 5 นาที หลังจากโอนเสร็จสิ้น
                        </div>
                      </div>

                      <div className="w-full mt-3 bg-zinc-900 shadow-sm border border-zinc-800 p-3 rounded-lg border border-[#5865F2]/20 flex flex-col gap-2">
                        <p className="text-[11px] text-zinc-400 leading-relaxed text-left">
                          หากลูกค้าโอนเงินไปแล้วนำรูปมาอัพโหลดไม่ได้หรือเกินเวลา
                          ให้เปิดทิกเก็ตใน{" "}
                          <strong className="text-[#5865F2]">Discord</strong>{" "}
                          ได้เลย พร้อมแนบสลิปที่โอนไป
                        </p>
                        <a
                          href="https://discord.gg/AQKtJpvyva"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-[#5865F2] hover:bg-[#4752C4] shadow-md shadow-[#5865F2]/20 transition-colors py-2 rounded-lg text-zinc-100 text-xs font-bold flex items-center justify-center gap-2 mt-1"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 127.14 96.36"
                          >
                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91,65.69,84.69,65.69Z" />
                          </svg>
                          เข้าดิสคอร์ด
                        </a>
                      </div>
                    </div>
                  )}

                  {topupModalStep === "coupon" && (
                    <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                      <p className="text-xs text-emerald-300 mb-2 leading-relaxed">
                        กรอกรหัสคูปองที่คุณได้รับจากโปรโมชั่นหรือกิจกรรม
                        เพื่อแลกรับเครดิตเข้าสู่ระบบฟรี
                      </p>
                      <p className="text-[11px] text-emerald-400/70">
                        คูปอง 1 รหัส สามารถใช้งานได้เพียง 1 ครั้งเท่านั้น
                      </p>
                    </div>
                  )}

                  {topupError && (
                    <div className="mb-4 bg-red-500/20 border-2 border-red-500 text-red-200 text-xs p-3 rounded-lg text-center break-words shadow-sm shadow-red-500/10">
                      {topupError}
                    </div>
                  )}

                  <div>
                    {topupModalStep === "bank" ? (
                      <label className="flex flex-col items-center justify-center w-full min-h-[5rem] py-2 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-900/200/5 transition-colors bg-zinc-900 group">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2 px-4 text-center">
                          <UploadCloud className="w-5 h-5 text-zinc-500 mb-1 group-hover:text-blue-400 transition-colors" />
                          <p className="text-[9px] text-zinc-500 font-mono break-all max-w-full">
                            {slipFile ? (
                              <img
                                src={URL.createObjectURL(slipFile)}
                                alt="slip"
                                className="max-h-24 object-contain rounded"
                              />
                            ) : (
                              "คลิกเพื่ออัปโหลดรูปภาพสลิป"
                            )}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0])
                              setSlipFile(e.target.files[0]);
                          }}
                        />
                      </label>
                    ) : (
                      <input
                        type="text"
                        value={topupCode}
                        onChange={(e) => setTopupCode(e.target.value)}
                        placeholder={
                          topupModalStep === "angpao"
                            ? "https://gift.truemoney.com/campaign/..."
                            : "กรอกโค้ดที่นี่..."
                        }
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-3 rounded-2xl focus:outline-none focus:border-red-500 transition-all text-xs font-mono placeholder-zinc-600"
                      />
                    )}
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isProcessingTopup}
                      className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 text-sm font-extrabold flex justify-center items-center gap-2 transition-all shadow-lg"
                    >
                      {isProcessingTopup ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />{" "}
                          กำลังดำเนินการ...
                        </>
                      ) : (
                        "ยืนยันการทำรายการ"
                      )}
                    </motion.button>
                    {isProcessingTopup && (
                      <p className="text-center text-[11px] text-amber-400 mt-2 font-semibold animate-pulse tracking-wide font-display tracking-tight">
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
              className="absolute inset-0 bg-zinc-900 "
              onClick={() => setShowTopupTos(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-transparent border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative z-10"
            >
              <div className="text-center mb-6">
                <h3 className="font-display text-lg font-bold text-zinc-100 mb-2">
                  ข้อกำหนดในการให้บริการ
                </h3>
                <p className="text-xs text-zinc-500">
                  กรุณาอ่านและทำความเข้าใจก่อนทำรายการ
                </p>
              </div>
              <div className="bg-zinc-900 shadow-sm border border-zinc-800 p-4 rounded-2xl border border-zinc-800/80 mb-6 space-y-3">
                <p className="text-[11px] text-zinc-400 leading-relaxed text-center">
                  การทำรายการเติมเงินเข้าระบบทุกช่องทาง (ทั้งซองอั่งเปา, ธนาคาร,
                  หรือคูปอง){" "}
                  <strong className="text-red-400">
                    จะไม่สามารถขอคืนเงินได้ในทุกกรณี
                  </strong>
                </p>
                <p className="text-[11px] text-zinc-500 leading-relaxed text-center">
                  เมื่อท่านทำการยืนยัน
                  ถือว่าท่านยอมรับข้อตกลงนี้และเข้าใจว่ายอดเงินจะถูกเพิ่มเข้าเป็นเครดิตในระบบทันที
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTopupTos(false)}
                className="w-full py-3 px-4 rounded-2xl bg-zinc-300 hover:bg-zinc-200 text-black text-sm font-bold flex justify-center items-center transition-all"
              >
                รับทราบและปิดหน้าต่าง
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inquiry Summary & Clipboard tool modal */}
      {inquiringItem?.gachaPool && inquiringItem.gachaPool.length > 0 ? (
        <RandomBoxModal
          item={inquiringItem}
          onClose={() => setInquiringItem(null)}
          onBuy={handleBuyItem}
        />
      ) : (
        <InquiryModal
          item={inquiringItem}
          onClose={() => setInquiringItem(null)}
          onBuy={appScreen !== "AOTR" ? handleBuyItem : undefined}
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
        currentGame={appScreen as any}
      />

      <StockManagerModal
        isOpen={isStockManagerOpen}
        onClose={() => setIsStockManagerOpen(false)}
        items={items.filter((it) => it.game === appScreen)}
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
        onChangeUsername={handleChangeUsername}
        onChangeEmail={handleChangeEmail}
      />

      {(currentUser || viewingUserHistory) && (
        <HistoryModal
          isOpen={showHistoryModal || !!viewingUserHistory}
          onClose={() => {
            setShowHistoryModal(false);
            setViewingUserHistory(null);
          }}
          username={viewingUserHistory || currentUser?.username || ""}
        />
      )}
    </>
  );

  // Calculate high-level stats based on current game context
  const currentContextItems = items.filter((it) => it.game === appScreen);

  const totalStockItems = currentContextItems.length;
  const inStockCount = currentContextItems.filter(
    (it) => it.quantity > 0,
  ).length;
  const totalStockUnits = currentContextItems.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );
  const totalStockValue = currentContextItems.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0,
  );

  const renderStaleOverlay = () => {
    if (!isStale) return null;
    return (
      <div className="fixed inset-0 z-[99999] bg-zinc-900  flex flex-col items-center justify-center p-4 text-center select-none pointer-events-auto">
        <div className="bg-transparent border border-red-500/30 p-6 sm:p-8 rounded-2xl w-[90%] max-w-sm shadow-2xl shadow-red-500/10">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-black text-zinc-100 mb-2">
            เซสชั่นหมดอายุ
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 mb-6 leading-relaxed">
            ระบบตรวจพบว่าคุณไม่มีการเคลื่อนไหวเกิน 10 นาที
            <br />
            เพื่อรีเฟรชสต๊อกล่าสุด กรุณาโหลดหน้าเว็บใหม่
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="w-full py-3 sm:py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-zinc-100 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-red-500/25 transition-all outline-none"
          >
            รีเฟรชหน้าเว็บ (Refresh)
          </motion.button>
        </div>
      </div>
    );
  };

  const renderAppScreen = () => {
    if (
      isUnderMaintenance &&
      !isAdmin &&
      appScreen !== "LOADING" &&
      appScreen !== "TRANSITION"
    ) {
      return (
        <motion.div
          key="maintenance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] bg-zinc-900 flex flex-col items-center justify-center p-6 text-center select-none text-zinc-100 font-display tracking-tight"
        >
          <div className="max-w-md w-full bg-zinc-900 shadow-sm border border-zinc-800 p-8 rounded-3xl border border-amber-500/30 shadow-2xl  relative">
            <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg
                className="w-10 h-10 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-medium tracking-tighter glowing-text mb-3">
              ระบบอยู่ระหว่างการปรับปรุง 🛠️
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              ขณะนี้เว็บไซต์กำลังอยู่ในช่วงปรับปรุงระบบชั่วคราว
              กรุณาอดทนรอและระบบจะเปิดให้ใช้งานอีกครั้งโดยอัตโนมัติเมื่อเสร็จสิ้น!
              ขออภัยในความไม่สะดวกครับ
            </p>
            <div className="flex justify-center space-x-2 pb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAuthModal(true);
                setAuthMode("login");
              }}
              className="absolute bottom-4 right-4 text-[11px] text-zinc-700 hover:text-zinc-500 transition-colors"
            >
              Admin Login
            </motion.button>
          </div>
          {renderModals()}
        </motion.div>
      );
    }

    

    if (appScreen === "SELECT") {
      return (
        <motion.div
          key="select"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="min-h-[100vh] min-h-[100dvh] bg-transparent flex flex-col items-center p-6 sm:p-10 relative w-full overflow-y-auto text-zinc-100"
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-50 z-0"
            style={{
              backgroundImage:
                "url('https://s.imgz.io/2026/05/31/1000098494b68242f76bd7e2f7.gif')",
            }}
          />
          <div className="absolute inset-0 bg-transparent/60 z-0 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[30rem] bg-gradient-to-b from-purple-900/20 to-transparent filter blur-3xl pointer-events-none z-0" />

          <div className="z-10 w-full max-w-5xl relative m-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="font-display text-xl sm:text-3xl font-display font-medium tracking-tighter glowing-text text-zinc-100 tracking-wide">
                เลือกเกมที่
                <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  สนใจ
                </span>
                ได้เลย 🎮
              </h1>
              <p className="text-zinc-500 mt-2 text-[11px] sm:text-sm max-w-xl mx-auto">
                สวัสดีค้าบ 🙏 สนใจเกมไหนดูก่อนได้เลยน้า
                ร้านเรามีของให้เลือกเพียบ แถมมีระบบสุ่มกล่องด้วย
                ทักเข้ามาสอบถามได้ตลอดเลยค้าบผม!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* AOT Revolution */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  setTargetScreen("AOTR");
                  setAppScreen("TRANSITION");
                }}
                className="group relative rounded-3xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl  cursor-pointer hover:border-amber-500/50 transition-all duration-500 overflow-hidden shadow-xl shadow-black/40"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="aspect-video w-full rounded-2xl overflow-hidden relative mb-4">
                  <img
                    src="https://img2.pic.in.th/1000111145.png"
                    alt="Attack on Titan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-50 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-zinc-900" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[11px] font-black uppercase tracking-widest backdrop-blur border border-amber-500/30">
                      Attack on titan Revolution
                    </span>
                  </div>
                </div>
                <div className="px-3 pb-3 relative z-10 text-left">
                  <h3 className="text-xl font-black text-zinc-100 group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                    สินค้า ATOR โดย Kuwashii El
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 font-mono">
                    Connect to the Paradis terminal.
                  </p>
                </div>
              </motion.div>

              {/* ASTD */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  setTargetScreen("ASTD");
                  setAppScreen("TRANSITION");
                }}
                className="group relative rounded-3xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl  cursor-pointer hover:border-emerald-500/50 transition-all duration-500 overflow-hidden shadow-xl shadow-black/40"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="aspect-video w-full rounded-2xl overflow-hidden relative mb-4">
                  <img
                    src="https://img2.pic.in.th/1000098143.jpg"
                    alt="All Star Tower Defense"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-50 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-zinc-900" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-widest backdrop-blur border border-emerald-500/30">
                      All Star Tower Defense
                    </span>
                  </div>
                </div>
                <div className="px-3 pb-3 relative z-10 text-left">
                  <h3 className="text-xl font-black text-zinc-100 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                    
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 font-mono">
                    Connect to the Multiverse defense grid.
                  </p>
                </div>
              </motion.div>

              {/* ROV */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative rounded-3xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl  hover:bg-zinc-900 hover:border-emerald-500/50 cursor-pointer transition-all duration-500 overflow-hidden shadow-xl shadow-black/40 hover:-translate-y-1 hover:shadow-emerald-900/20"
                onClick={() => {
                  setTargetScreen("ROV");
                  setAppScreen("TRANSITION");
                }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                <div className="aspect-video w-full rounded-2xl overflow-hidden relative mb-4">
                  <img
                    src="https://img2.pic.in.th/1000099558.jpg"
                    alt="ROV"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-zinc-900" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-widest backdrop-blur border border-emerald-500/30">
                      ROV
                    </span>
                  </div>
                </div>
                <div className="px-3 pb-3 relative z-10 text-left">
                  <h3 className="text-xl font-black text-zinc-100 group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                    สินค้า ROV โดย sokay0419
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 font-mono">
                    Arena of Valor accounts and codes.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
          {renderModals()}
        </motion.div>
      );
    }

    if (appScreen === 'STATEMENT') {
      return (
        <motion.div
           key='statement'
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className='min-h-[100vh] min-h-[100dvh] flex flex-col bg-zinc-950 text-zinc-200 font-display tracking-tight w-full'
        >
          <ShopHeader toggleSidebar={() => setIsAstdMenuOpen(true)} onSearchToggle={() => {}} currentUser={currentUser} onLoginClick={() => { setShowAuthModal(true); setAuthMode('login'); }} />
          
          <main className='flex-grow w-full pt-20 pb-10'>
            <Statement currentUser={currentUser} onLoginClick={() => { setShowAuthModal(true); setAuthMode('login'); }} />
          </main>
          
          {renderModals()}
        </motion.div>
      );
    }


    if (appScreen === "SHOP") {
      return (
        <motion.div
          key="astd"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="min-h-[100vh] min-h-[100dvh] flex flex-col bg-transparent text-zinc-200 font-display tracking-tight selection:bg-indigo-500 selection:text-zinc-100 pb-20 sm:pb-0 relative w-full"
        >
        <ShopHeader toggleSidebar={() => setIsAstdMenuOpen(true)} onSearchToggle={() => {}} currentUser={currentUser} onLoginClick={() => { setShowAuthModal(true); setAuthMode("login"); }} />
          <MarqueeAnnouncement appScreen={appScreen} />
          <AnnouncementPopup appScreen={appScreen} />
          

          {/* Dynamic Floating Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -50, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -30, x: "-50%" }}
                style={{ zIndex: 9999 }}
                className={`fixed top-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold tracking-wide border  ${
                  toastMessage.type === "success"
                    ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/30"
                    : toastMessage.type === "error"
                      ? "bg-red-950/90 text-red-400 border-red-500/30"
                      : "bg-zinc-900 shadow-sm border border-zinc-800 text-zinc-400 border-zinc-705"
                }`}
              >
                {toastMessage.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : toastMessage.type === "error" ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400" />
                )}
                <span>{toastMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero Header Section */}
          <ShopBanner globalStats={globalStats} />

          {/* Main Container */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full">

            {/* Category Cards Section */}
            <CategoryList />

            
            {/* Admin Tools ASTD */}
            {isAdmin && (
              <section className="bg-zinc-900 shadow-sm border border-zinc-800 border border-indigo-500/20 p-5 rounded-2xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 animate-pulse">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                        แผงจัดการสต๊อก
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        จัดการเพิ่ม หรือแก้ไขฐานข้อมูลคลังสินค้าได้แบบ Real-time
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCustomerDbOpen(true)}
                      className="py-2 px-4 rounded-2xl bg-purple-500/20 text-purple-400 hover:text-zinc-100 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10"
                    >
                      <Users className="w-4 h-4" /> ระบบฐานลูกค้า (Customer DB)
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleMaintenanceMode}
                      className={`py-2 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${globalStats?.maintenance_mode ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"}`}
                    >
                      <AlertTriangle className="w-4 h-4" />{" "}
                      {globalStats?.maintenance_mode
                        ? "เปิดเว็บ"
                        : "ปิดเว็บซ่อมปรุง"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCouponManagerOpen(true)}
                      className="py-2 px-4 rounded-2xl bg-emerald-500/20 text-emerald-400 hover:text-zinc-100 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      <Gift className="w-4 h-4" /> จัดการโค้ดคูปอง
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAnnouncementManagerOpen(true)}
                      className="py-2 px-4 rounded-2xl bg-amber-500/20 text-amber-400 hover:text-zinc-100 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      <Bell className="w-4 h-4" /> จัดการแจ้งเตือนต่างๆ
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsStockManagerOpen(true)}
                      className="py-2 px-4 rounded-2xl bg-indigo-500/20 text-indigo-400 hover:text-zinc-100 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4" /> ระบบผู้ดูแลสต๊อก
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFormOpen(true)}
                      className="py-2 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-zinc-100 text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> เพิ่มสินค้า
                    </motion.button>
                  </div>
                </div>
              </section>
            )}

            {/* Recommended Products Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-100">
                สินค้าแนะนำ
              </h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium border border-zinc-800 rounded-full text-zinc-300 hover:bg-zinc-800"
              >
                ดูเพิ่มเติม <ChevronRight className="w-4 h-4 text-zinc-500" />
              </motion.button>
            </div>

            {/* Item Grid */}
            {isLoadingStock ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ItemCardSkeleton key={`astd-skel-${idx}`} />
                ))}
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <Inbox className="w-16 h-16 text-indigo-500/50 mx-auto mb-6" />
                <h2 className="text-lg font-black text-zinc-100 mb-2 uppercase tracking-wide">
                  ไม่พบสินค้าในสต๊อก
                </h2>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {sortedItems.map((item) => (
                    <ItemCard
                    appScreen={appScreen}
                      key={item.id}
                      item={item}
                      isAdmin={isAdmin}
                      onEdit={(it) => {
                        setEditingItem(it);
                        setIsFormOpen(true);
                      }}
                      onDelete={handleDeleteItem}
                      onQuickQuantityChange={handleQuickQuantityChange}
                      onInquire={() => setInquiringItem(item)}
                      onBuy={handleBuyItem}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            <DiscordBanner />
          </main>

          {/* Custom Footer */}
          <footer className="mt-auto py-8 relative z-10 border-t border-zinc-800 bg-transparent text-xs w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-zinc-600 uppercase tracking-widest text-[11px]">
                  Development Credit
                </p>
                <p className="text-zinc-400 font-display tracking-tight text-center">
                  Made with passion by{" "}
                  <strong className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-bold font-mono">
                    Kuwashii El ( @_.texraxit )
                  </strong>
                </p>
              </div>
                  <MobileDrawer
        isOpen={isAstdMenuOpen}
        onClose={() => setIsAstdMenuOpen(false)}
        currentUser={currentUser}
        onLoginClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
        onLogoutClick={handleLogout}
        setPage={setAppScreen}
        setShowTopupModal={setShowTopupModal}
      />
</div>
          </footer>

          {renderModals()}
        </motion.div>
      );
    }

    

    

    return null;
  }; // end renderAppScreen

  return <AnimatePresence mode="wait">{renderAppScreen()}</AnimatePresence>;
}
