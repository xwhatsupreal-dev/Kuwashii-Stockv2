import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";
import { startDiscordBot } from "./discordBot";

dotenv.config();

// Start the Discord Bot
startDiscordBot();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- Seed Data representing Premium Items from AOT Revolution ---
const SEED_ITEMS = [
  {
    id: "yeager_bloodline",
    name: "Yeager Bloodline (สายเลือดเยเกอร์)",
    category: "Bloodline",
    rarity: "Mythic",
    quantity: 3,
    initialQuantity: 5,
    price: 15000,
    description: "สายเลือดผู้สืบทอดพลังไททันจู่โจมและไททันบรรพบุรุษ มอบความแข็งแกร่งสูงสุด ความเร็วการเคลื่อนที่เร่งโมเมนตัม และสกิลกู้ชีพฟื้นฟูบาดแผลตัวเองอัตโนมัติเมื่อหัวใจวาย!",
    isPinned: true,
    isPopular: true,
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "ackerman_bloodline",
    name: "Ackerman Bloodline (สายเลือดอัคเคอร์แมน)",
    category: "Bloodline",
    rarity: "Mythic",
    quantity: 5,
    initialQuantity: 10,
    price: 12500,
    description: "สายเลือดสุดยอดมนุษย์ดัดแปลง เพิกเฉยสถานะควบคุม หลบการโจมตีกะทันหันอัตโนมัติ และสะสมแถบโมโหเพื่อเปิดขีดจำกัดความเร็วเดธสปินสับคอพายุน้ำแข็ง!",
    isPinned: true,
    isPopular: true,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "reiss_bloodline",
    name: "Reiss Bloodline (สายเลือดไรส์)",
    category: "Bloodline",
    rarity: "Legendary",
    quantity: 8,
    initialQuantity: 15,
    price: 6500,
    description: "สายเลือดแห่งราชวงศ์ที่แท้จริง บลูแปรพลังงานช่วยปลดล็อคโหมดไททันไร้ขีดจำกัด เพิ่มโบนัสทองที่ได้จากการเคลียร์ด่านเพิ่มขึ้นทันที 30% ให้กับทุกคนในตี้!",
    isPinned: false,
    isPopular: false,
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "attack_serum",
    name: "Attack Titan Serum (เซรั่มไททันจู่โจม)",
    category: "Serum",
    rarity: "Legendary",
    quantity: 12,
    initialQuantity: 20,
    price: 4500,
    description: "เซรั่มชีวภาพสำหรับปลดพลังไททันจู่โจม มอบพลังโกรธทลายเกราะ ร้องขู่คำรามเพิ่มพลังโจมตีประชิด เหมาะสำหรับเร่งดาเมจฟาร์มบอสและการถล่มเขตป้อมค่าย!",
    isPinned: false,
    isPopular: true,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "armored_serum",
    name: "Armored Titan Serum (เซรั่มไททันเกราะ)",
    category: "Serum",
    rarity: "Legendary",
    quantity: 6,
    initialQuantity: 12,
    price: 5200,
    description: "เซรั่มเปลี่ยนรูปไททันเกราะ ปรับแต่งเกล็ดหนาพิเศษทำให้ผู้ใช้ทนรับความเสียหายจากสิ่งกระตุ้นได้ถึง 90% ดันเจี้ยนหดหู่ไม่ระคายเคือง เหมาะสำหรับเล่นสายแท็กนิกพุ่งชนกวาดลาน!",
    isPinned: false,
    isPopular: false,
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "colossal_serum",
    name: "Colossal Titan Serum (เซรั่มไททันมหึมา)",
    category: "Serum",
    rarity: "Legendary",
    quantity: 4,
    initialQuantity: 6,
    price: 8000,
    description: "เซรั่มกลั่นบริสุทธิ์สูงระดับสูงเพื่อแปรรูปเป็นไททันยักษ์ขนาดใหญ่ ป้อนคลื่นช็อกระเบิดความร้อนมหาศาลเพื่อทำลายล้างผู้สั่นสะเทือนทางอากาศทั้งหมดในจังหวะแปลงพลังงาน!",
    isPinned: false,
    isPopular: true,
    imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "dual_blade_carbon_core",
    name: "Dual Blade Carbon Core (สกินดาบคาร์บอนแดงดำ)",
    category: "Skin",
    rarity: "Legendary",
    quantity: 15,
    initialQuantity: 25,
    price: 2500,
    description: "สกินยอดพรีเมียมจากคลังร้าน มีประกายความร้อนไฟสีแดงระเบิดสไลด์ทุกครั้งที่ฟันคอไททันเป็นรอยแผล ผลิตจากเหล็กอบความดันคาร์บอนสูงสุด ไม่เปราะ หักยากที่สุด!",
    isPinned: false,
    isPopular: false,
    imageUrl: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=400&q=85",
    updatedAt: new Date().toISOString()
  },
  {
    id: "odg_neo_steampunk",
    name: "ODG - Neo Steampunk (ตัวแก๊สเหล็กทองไอน้ำ)",
    category: "Skin",
    rarity: "Epic",
    quantity: 22,
    initialQuantity: 30,
    price: 1800,
    description: "สกินตัวถังเติมแก๊ส ODM Gear ดีไซน์แนวศตวรรษอุตสาหกรรมย้อนยุค สปินด้วยท่อไอน้ำสีทองวาววับและมลทินกลุ่มควันพ่นทองเหลืองแผ่ซ่านสุดวินเทจโดดเด่นสะทุดตากลางอากาศ!",
    isPinned: false,
    isPopular: false,
    imageUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "titan_heart",
    name: "Titan Heart Core (แกนหัวใจไททันแท้)",
    category: "Artifact",
    rarity: "Mythic",
    quantity: 2,
    initialQuantity: 5,
    price: 18000,
    description: "หัวใจโบราณขนาดเล็กที่ยังขยับเต้น มีพลังพิเศษช่วยลดการใช้ค่าแก๊ซ ODM Gear ลง 20% และแร่งอัตราการคืนค่าสปินความเร็วเหนือมนุษย์ในพริบตาเดียว ดรอปยากแรร์สุดขีด!",
    isPinned: false,
    isPopular: true,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "ancient_scroll",
    name: "Ancient Rune Scroll (คัมภีร์อักษรรูนสว่าง)",
    category: "Scroll/Key",
    rarity: "Legendary",
    quantity: 14,
    initialQuantity: 20,
    price: 3500,
    description: "ม้วนหนังสือสลักอักษรแสงสีรุ้งโบราณ ใช้ในเมนูการอัปเกรดความลึกลับเพื่อปลดขีดจำกัดเพิร์คสล๊อตด่านหลัก ช่วยเพิ่มค่าพลังกายสูงสุดและอัตราคิติคอล 7% ติดถาวร!",
    isPinned: false,
    isPopular: false,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "raid_key_shiganshina",
    name: "Shiganshina Raid Key (คีย์ลับเรดชิกันชิน่า)",
    category: "Scroll/Key",
    rarity: "Rare",
    quantity: 50,
    initialQuantity: 100,
    price: 500,
    description: "กุญแจทองคำใช้สำหรับไขประตูลับด่านเข้าศึกชิงเขตชิกันชิน่า (Raid Battle) ร่วมมือกับผู้เล่นอื่นเพื่อล่าอาวุธระดับตำนาน คุมคลัง และเก็บเหรียญดวงดาวทองคำ!",
    isPinned: false,
    isPopular: false,
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "relentless_fury",
    name: "Relentless Fury Perk (ขวดเพิร์กเดือดดาลต่อเนื่อง)",
    category: "Perk",
    rarity: "Legendary",
    quantity: 30,
    initialQuantity: 50,
    price: 1200,
    description: "น้ำยาเร่งประสาทสัมผัสเดือดดาล เมื่อเปิดใช้งานจะทำให้เพิร์กดาเมจเพิ่ิมระดับดาเมจไฟ 5% ต่อทุกๆ ฮิตที่ฟันสำเร็จ สะสมพายุคอมโบได้สูงสุด 10 ขั้นอย่างไม่จำกัดพลัง!",
    isPinned: false,
    isPopular: false,
    imageUrl: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=400&q=80",
    updatedAt: new Date().toISOString()
  }
];

const DATA_FILE = path.join(process.cwd(), "items_db.json");

import { createClient } from "@supabase/supabase-js";

// Helpers for encoding/decoding extra properties within description to bypass schema restrictions without altering Supabase table
function packExtraData(item: any): any {
  const packed = { ...item };
  const extra: any = {};
  
  if (packed.gachaPool !== undefined) { extra.gachaPool = packed.gachaPool; delete packed.gachaPool; }
  if (packed.game !== undefined) { extra.game = packed.game; delete packed.game; }
  if (packed.accountCredentials !== undefined) { extra.accountCredentials = packed.accountCredentials; delete packed.accountCredentials; }
  
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
        // If table doesn't exist or other error, fallback to seed
        console.warn("Supabase load error (Table might not exist):", error.message);
        return SEED_ITEMS;
      }
      
      if (!data || data.length === 0) {
        // Auto-seed Supabase if empty
        await saveItems(SEED_ITEMS);
        return SEED_ITEMS;
      }
      return data.map(unpackExtraData);
    }

    // Fallback to local JSON file
    if (!fs.existsSync(DATA_FILE)) {
      await fs.promises.writeFile(DATA_FILE, JSON.stringify(SEED_ITEMS, null, 2), "utf8");
      return SEED_ITEMS;
    }
    const raw = await fs.promises.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await fs.promises.writeFile(DATA_FILE, JSON.stringify(SEED_ITEMS, null, 2), "utf8");
      return SEED_ITEMS;
    }
    return parsed.map(unpackExtraData);
  } catch (err) {
    console.error("Error reading items list from database file/Supabase:", err);
    return SEED_ITEMS;
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
      // For a full reset, we upsert all items
      const { error } = await supabase.from('stock_items').upsert(packedList);
      if (error) {
        console.error("Supabase upsert error:", error.message);
      }
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
      if (error) {
        console.error("Supabase single upsert error:", error.message);
      }
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
      if (error) {
        console.error("Supabase delete error:", error.message);
      }
      return;
    }

    let itemsList = await loadItems();
    itemsList = itemsList.filter((it) => it.id !== id);
    await saveItems(itemsList);
  } catch (err) {
    console.error("Error deleting single item:", err);
  }
}


// Lazy-initialization utility for Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in the settings.");
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
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
      }
    });

    // Populate actual history using sendMessage sequence or standard structure
    // Since we want to send the message in context of the configured history:
    // We can translate client's messages history into Gemini Chat history
    // For simplicity, we can load history directly in ai.chats.create if it was defined,
    // or manually query ai.models.generateContent with standard prompt structure!
    // Let's call the chat history sequentially to rebuild it, or translate it into an array of Contents
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

// --- Stock Items CRUD APIs using local JSON file database ---

// Get all items (initial loading)
app.get("/api/items", async (req: express.Request, res: express.Response) => {
  try {
    const itemsList = await loadItems();
    res.json(itemsList);
  } catch (err: any) {
    console.error("Error in GET /api/items:", err);
    res.status(500).json({ error: "Failed to load items database" });
  }
});

// Create or update a single item
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

// Delete a single item
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

// Bulk reset database
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
    if (data.status === 'success') {
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
              // slip_time might be like "2024-05-30 18:20:00"
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
               let reason = dVal || tVal ? `D:${dVal} T:${tVal}` : `No Date/Time from API: ${stringData.substring(0, 100)}`;
               return res.json({ status: 'error', message: `ไม่สามารถตรวจสอบเวลาบนสลิปได้ (${reason}) プロดติดต่อแอดมิน` });
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

// Simple in-memory IP lock for registration spam prevention
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

// Configure Vite integration or static file serving
const setupServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

setupServer();
