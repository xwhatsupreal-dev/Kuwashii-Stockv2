import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DATA_FILE = path.join(process.cwd(), "items_db.json");

// Helpers for encoding/decoding extra properties within description to bypass schema restrictions without altering Supabase table
function packExtraData(item: any): any {
  const packed = { ...item };
  const extra: any = {};
  
  if (packed.gachaPool !== undefined) { extra.gachaPool = packed.gachaPool; delete packed.gachaPool; }
  if (packed.game !== undefined) { extra.game = packed.game; delete packed.game; }
  
  // Clean up any old markers
  if (packed.description) {
    packed.description = packed.description.replace(/<!--gachaPool:.*?-->/g, '').replace(/<!--extraData:.*?-->/g, '');
  }

  if (Object.keys(extra).length > 0) {
    packed.description = `${packed.description || ''}<!--extraData:${JSON.stringify(extra)}-->`;
  }
  
  return packed;
}

function unpackExtraData(item: any): any {
  if (!item.description) return item;
  
  const unpacked = { ...item };
  
  const oldMatch = unpacked.description.match(/<!--gachaPool:(.*?)-->/);
  if (oldMatch) {
    try {
      unpacked.gachaPool = JSON.parse(oldMatch[1]);
      unpacked.description = unpacked.description.replace(oldMatch[0], '');
    } catch { }
  }

  const match = unpacked.description.match(/<!--extraData:(.*?)-->/);
  if (match) {
    try {
      const extra = JSON.parse(match[1]);
      Object.assign(unpacked, extra);
      unpacked.description = unpacked.description.replace(match[0], '');
    } catch { }
  }
  
  return unpacked;
}

// Helper to loads items
async function loadItems(): Promise<any[]> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    // Use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('stock_items').select('*').order('updatedAt', { ascending: false });
      
      if (error) {
        console.warn("Supabase load error (Table might not exist):", error.message);
        return [];
      }
      
      if (!data) return [];
      return data.map(unpackExtraData);
    }

    // Fallback to local JSON file
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = await fs.promises.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(unpackExtraData);
  } catch (err) {
    console.error("Error reading items list from database file/Supabase:", err);
    return [];
  }
}

// Helper to save multiple items (used for full reset/seed)
async function saveItems(itemsList: any[]): Promise<void> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const packedList = itemsList.map(packExtraData);
    
    // Use Supabase if configured 
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('stock_items').upsert(packedList);
      if (error) console.error("Supabase upsert error:", error.message);
      return;
    }

    // Fallback to local JSON file
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(packedList, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing items database:", err);
  }
}

// Helper to save a single item
async function saveSingleItem(item: any): Promise<void> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const packedItem = packExtraData(item);
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('stock_items').upsert(packedItem);
      if (error) console.error("Supabase single upsert error:", error.message);
      return;
    }

    const itemsList = await loadItems();
    const index = itemsList.findIndex((it) => it.id === item.id);
    if (index >= 0) {
      itemsList[index] = { ...itemsList[index], ...packedItem, updatedAt: new Date().toISOString() };
    } else {
      itemsList.unshift({ ...packedItem, updatedAt: new Date().toISOString() });
    }
    await saveItems(itemsList);
  } catch (err) {
    console.error("Error saving single item:", err);
  }
}

// Helper to delete a single item
async function deleteSingleItem(id: string): Promise<void> {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('stock_items').delete().eq('id', id);
      if (error) console.error("Supabase delete error:", error.message);
      return;
    }

    let itemsList = await loadItems();
    itemsList = itemsList.filter((it) => it.id !== id);
    await saveItems(itemsList);
  } catch (err) {
    console.error("Error deleting single item:", err);
  }
}

// --- Stock Items CRUD APIs using local JSON file database ---
app.get("/api/items", async (req: express.Request, res: express.Response) => {
  try {
    const itemsList = await loadItems();
    res.json(itemsList);
  } catch (err: any) {
    console.error("Error in GET /api/items:", err);
    res.status(500).json({ error: "Failed to load items database" });
  }
});

app.post("/api/items", async (req: express.Request, res: express.Response) => {
  try {
    const updatedItem = req.body;
    if (!updatedItem || !updatedItem.id) {
      res.status(400).json({ error: "Item and item ID are required" });
       return;
    }
    await saveSingleItem(updatedItem);
    res.json({ success: true, item: updatedItem });
  } catch (err: any) {
    console.error("Error in POST /api/items:", err);
    res.status(500).json({ error: "Failed to save item to database" });
  }
});

app.delete("/api/items/:id", async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Item ID is required" });
       return;
    }
    await deleteSingleItem(id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/items:", err);
    res.status(500).json({ error: "Failed to delete item from database" });
  }
});

app.post("/api/items/reset", async (req: express.Request, res: express.Response) => {
  try {
    const itemsList = req.body;
    if (!Array.isArray(itemsList)) {
      res.status(400).json({ error: "Array of items is required" });
       return;
    }
    await saveItems(itemsList);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error in POST /api/items/reset:", err);
    res.status(500).json({ error: "Failed to reset items database" });
  }
});

// Lazy-initialization utility for Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI Assistant Chat API
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { message, history, items, sharedItem } = req.body;

    if (!message) {
       res.status(400).json({ error: "Message is required" });
       return;
    }

    const ai = getGeminiClient();

    // Context formatting
    const formattedItems = (items || [])
      .map(
        (item: any) =>
          `- ID: ${item.id}\n  ชื่อ: ${item.name}\n  หมวดหมู่: ${item.category}\n  ระดับความหายาก: ${item.rarity}\n  คงเหลือ: ${item.quantity} ชิ้น\n  ราคา: ฿${item.price.toLocaleString()}\n  คำอธิบาย: ${item.description || "ไม่มี"}\n  ยอดนิยม: ${item.isPopular ? "ใช่" : "ไม่ใช่"}`
      )
      .join("\n\n");

    let systemInstruction = `คุณคือ "Kuwashii AI Shop Assistant" ผู้ช่วยผู้เชี่ยวชาญ คอยให้คำแนะนำเกี่ยวกับไอเทมเกม ระดับความพรีเมียม และอุปกรณ์เสริมในคลังสินค้า Kuwashii El เท่านั้น
คุณมีหน้ารายละเอียดคลังสินค้าทั้งหมดของทางร้านเพื่อให้ข้อมูลราคา, ปริมาณ หรือความแร่จริงแก่ลูกค้าได้อย่างถูกต้องแม่นยำ 

กฎและวิธีตอบคำตอบของคุณ:
1. ตอบคำถามอย่างสุภาพและเป็นมิตร มีบุคลิกกระตือรือร้นและคล่องแคล่ว มีสำเนียงแบบเกมเมอร์ที่น่าเคารพ
2. ใช้ข้อมูลคลังสินค้าด้านล่างนี้ คอยอ้างอิงราคา จำนวน ชนิด หรือรายละเอียดสินค้าจริงอยู่เสมอ ห้ามเดาหรือหลอนข้อมูลขึ้นมาเอง!
3. หากลูกค้าถามหาสินค้าขายดี ยอดนิยม หรือ สินค้าหายากสูง (Legendary, Mythic) ให้สแกนดูจากคลังและเสนอตัวเด็ดๆ ทันที
4. ตอบกลับเป็นภาษาไทยที่อ่านง่าย มีเว้นวรรคสวยงามเป็นระเบียบ ใช้ Markdown จัดรูปแบบหัวข้อและตัวหนา (เช่น **ชื่อไอเทม**) ให้โดดเด่นน่าอ่านช้อปปิ้งออนไลน์
5. หากข้อมูลสต็อกเป็น 0 ชิ้น ให้แนะว่าชิ้นนั้นหมดคลังในขณะนี้ แต่สามารถจดคิวสอบถามหรือแนะนำไอเทมทางเลือกอื่นในระดับความใกล้เคียงกันได้

--- ข้อมูลสินค้าทั้งหมดในคลังร้าน Kuwashii El ปัจจุบัน: ---
${formattedItems || "ขณะนี้ไม่มีข้อมูลสินค้าในระบบคลัง"}
`;

    if (sharedItem) {
      systemInstruction += `\n\n--- พิเศษ: ลูกค้าได้กด "แชร์สินค้าเฉพาะตัว" นี้เข้ามาเพื่อให้คุณดูโดยตรง: ---
ชื่อสินค้า: ${sharedItem.name}
หมวดหมู่: ${sharedItem.category}
ระดับระดับความหายาก: ${sharedItem.rarity}
ราคาในคลัง: ฿${sharedItem.price.toLocaleString()}
จำนวนคงเหลือ: ${sharedItem.quantity} ชิ้น
คำอธิบายสินค้า: ${sharedItem.description || "ไม่มี"}
${sharedItem.isPopular ? "⭐ สินค้านี้จัดเป็นสินค้ายอดนิยมประจำร้าน!" : ""}

กรุณาให้ความสนใจและให้การวิเคราะห์ จุดเด่น ความคุ้มค่า หรือคำตอบพิเศษกับสินค้าชิ้นนี้เป็นสำคัญที่สุดและโยงเข้าความต้องการของลูกค้าอย่างดีที่สุด!`;
    }

    // Set up chat instance with history
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.parts?.[0]?.text || "" }]
    }));

    // Start with chat history and send the newest message
    const activeChat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
      }
    });

    const response = await activeChat.sendMessage({ message: message });
    const answer = response.text || "ขออภัยด้วยครับ มีปัญหาระบบอัจฉริยะขัดข้อง กรุณาลองถามใหม่อีกครั้ง";

    res.json({ answer });
  } catch (err: any) {
    console.error("Gemini API error in express:", err);
    res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อระบบอัจฉริยะ" });
  }
});

// True Wallet Topup Proxy
app.post("/api/topup/true-wallet", async (req: express.Request, res: express.Response) => {
  try {
    const { gift_link, game } = req.body;
    
    // We send form data
    const params = new URLSearchParams();
    params.append('keyapi', '86eb4596fbb506a43b1b63b5911a5c78');
    params.append('phone', game === 'ROV' ? '0801965815' : '0801249138');
    params.append('gift_link', gift_link);
    
    // Attempt fetch
    const response = await fetch('https://www.planariashop.com/api/truewallet.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });
    
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error("TrueWallet Error:", err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Bank Slip Proxy
app.post("/api/topup/bank", async (req: express.Request, res: express.Response) => {
  try {
    const { qrcode_text } = req.body;
    
    // We send form data
    const params = new URLSearchParams();
    params.append('keyapi', '86eb4596fbb506a43b1b63b5911a5c78');
    params.append('qrcode_text', qrcode_text);
    
    // Attempt fetch
    const response = await fetch('https://www.planariashop.com/api/checkslip.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });
    
    const data = await response.json();
    
    // Server-side explicit time check (5 mins max)
    if (data.status === 'success' || data.code === 200 || data.message === "เช็คสลิปสำเร็จ") {
       try {
           let dVal = data.date || data.transDate || data.data?.transDate || data.data?.date;
           let tVal = data.time || data.transTime || data.data?.transTime || data.data?.time;
           let slipTimeStr = data.slip_time || data.data?.slip_time;
           
           const stringData = JSON.stringify(data);
           let slipTime: number | null = null;
           
           if (!dVal && !tVal && !slipTimeStr) {
              const dMatch = stringData.match(/"(?:transDate|date)"\s*:\s*"([^"]+)"/i);
              const tMatch = stringData.match(/"(?:transTime|time)"\s*:\s*"([^"]+)"/i);
              if (dMatch) dVal = dMatch[1];
              if (tMatch) tVal = tMatch[1];
              
              const stMatch = stringData.match(/"slip_time"\s*:\s*"([^"]+)"/i);
              if (stMatch) slipTimeStr = stMatch[1];
           }
           
           if (slipTimeStr) {
              const cleanSlipTimeStr = String(slipTimeStr).replace(' ', 'T');
              let dtStr = cleanSlipTimeStr;
              if (!dtStr.includes('+') && !dtStr.endsWith('Z')) {
                 dtStr += '+07:00';
              }
              slipTime = new Date(dtStr).getTime();
           } else if (dVal && String(dVal).includes('T')) {
              slipTime = new Date(dVal).getTime();
           } else if (dVal && tVal) {
              let cleanD = String(dVal).replace(/[-/]/g, '');
              if (cleanD.length >= 8) {
                  // Usually 20260530 -> 2026-05-30
                  cleanD = `${cleanD.substring(0,4)}-${cleanD.substring(4,6)}-${cleanD.substring(6,8)}`;
              } else {
                  cleanD = String(dVal);
              }
              
              let cleanT = String(tVal).trim().replace(/[-/:\s]/g, '');
              if (cleanT.length >= 6) {
                  cleanT = `${cleanT.substring(0,2)}:${cleanT.substring(2,4)}:${cleanT.substring(4,6)}`;
              } else if (cleanT.length >= 4) {
                  cleanT = `${cleanT.substring(0,2)}:${cleanT.substring(2,4)}:00`;
              }
              
              slipTime = new Date(`${cleanD}T${cleanT}+07:00`).getTime();
           } else {
              const tsMatch = stringData.match(/"(?:timestamp|created_at)"\s*:\s*"([^"]+)"/i);
              if (tsMatch) {
                 slipTime = new Date(tsMatch[1]).getTime();
              }
           }
           
           if (!slipTime || isNaN(slipTime)) {
               let reason = dVal || tVal ? `D:${dVal} T:${tVal}` : `No Date/Time from API`;
               return res.json({ status: 'error', message: `ไม่สามารถตรวจสอบเวลาบนสลิปได้ (${reason}) โปรดติดต่อแอดมิน` });
           }

           if (slipTime && !isNaN(slipTime)) {
               const now = Date.now();
               const diffMinutes = Math.floor((now - slipTime) / (1000 * 60));
               
               if (diffMinutes > 5) {
                   return res.json({ status: 'error', message: `สลิปหมดอายุการใช้งาน (โอนผ่านมาแล้ว ${diffMinutes} นาที)` });
               } else if (diffMinutes < -5) {
                   return res.json({ status: 'error', message: `เวลาในสลิปไม่ถูกต้อง (เวลาในอนาคต)` });
               }
           }
       } catch(e) {
           console.error("Server-side time check error:", e);
       }
    }
    
    res.json(data);
  } catch (err: any) {
    console.error("Bank Slip Error:", err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Simple in-memory IP lock for registration spam prevention (Note: Ephemeral in serverless)
const ipLocks = new Map<string, number>();

app.get("/api/check-register-lock", (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;
  const clientIp = ip.split(',')[0].trim();
  const lockTime = ipLocks.get(clientIp);
  
  if (lockTime && Date.now() < lockTime) {
    const remainingMinutes = Math.ceil((lockTime - Date.now()) / 60000);
    res.json({ locked: true, remaining: remainingMinutes });
  } else {
    res.json({ locked: false });
  }
});

app.post("/api/set-register-lock", (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;
  const clientIp = ip.split(',')[0].trim();
  
  // Lock for 60 minutes
  ipLocks.set(clientIp, Date.now() + 60 * 60 * 1000);
  
  // Cleanup old locks roughly
  if (ipLocks.size > 1000) {
    const now = Date.now();
    for (const [key, time] of ipLocks.entries()) {
      if (now > time) ipLocks.delete(key);
    }
  }
  
  res.json({ success: true });
});

app.post("/api/send-otp", async (req: express.Request, res: express.Response) => {
  try {
    const { toEmail, otp } = req.body;
    
    if (!toEmail || !otp) {
       res.status(400).json({ error: "Email and OTP are required" });
       return;
    }
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      // If environment variables are missing, simulate success for development, but ideally the user should set them.
      console.warn("SMTP credentials not set. Simulating OTP email send to " + toEmail);
      res.json({ success: true, simulated: true });
      return;
    }

    if (process.env.SMTP_USER === 'your_email@gmail.com' || process.env.SMTP_PASS === 'your_app_password') {
       res.status(500).json({ error: "โปรดตั้งค่า SMTP_USER และ SMTP_PASS ด้วยอีเมลและ 'App Password' ของจริง (ไม่ใช่รหัสของคุณ) ในเมนูตั้งค่า" });
       return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: parseInt(process.env.SMTP_PORT || "465", 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const fromName = process.env.SMTP_FROM_NAME || "Kuwashii Shop";
    
    const mailOptions = {
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน Kuwashii Shop",
      text: `รหัส OTP สำหรับรีเซ็ตรหัสผ่านของคุณคือ: ${otp}\nรหัสนี้จะหมดอายุใน 15 นาที`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333;">Kuwashii Shop</h2>
          <p>คุณได้ทำการขอรีเซ็ตรหัสผ่าน</p>
          <p>รหัส OTP ของคุณคือ: <strong style="font-size: 24px; color: #d97706;">${otp}</strong></p>
          <p style="color: #666; font-size: 14px;">รหัสนี้จะหมดอายุใน 15 นาที</p>
          <br>
          <p style="color: #999; font-size: 12px;">หากคุณไม่ได้ทำรายการนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error sending OTP email:", err);
    if (err.message && err.message.includes('535') && err.message.includes('Username and Password not accepted')) {
       res.status(500).json({ error: "เข้าสู่ระบบอีเมลไม่สำเร็จ คุณต้องใช้ Gmail 'App Password' (รหัสผ่านแอป 16 หลัก) ไม่ใช่รหัสผ่านอีเมลปกติ" });
    } else {
       res.status(500).json({ error: "เกิดข้อผิดพลาดในการส่งอีเมล: " + err.message });
    }
  }
});

// health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
