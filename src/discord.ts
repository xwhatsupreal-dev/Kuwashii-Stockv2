export const DISCORD_WEBHOOK_URL_TOPUP = 'https://discord.com/api/webhooks/1510998209936228493/r0qW4fwsKMJoTq4mWlwqY_6yNMKHVOcnG-gtrkURlCA6s2dZFr2it-Vx3I-b_IjeWY92';
export const DISCORD_WEBHOOK_URL_PURCHASE = 'https://discord.com/api/webhooks/1511063935888134284/LoW99CKLEDuscJWdSCTpIOvP30EIdwYo1j8JUdp1RvWORA9392tHhygHwnBP-UC3VsHj';

export const sendDiscordTopupEmbed = async (username: string, amount: number, channel: string, totalBalance: number, isSuccess: boolean = true, mapName?: string) => {
  try {
    const embed = {
      title: isSuccess ? "💰 เติมเงินสำเร็จ" : "⚠️ การเติมเงินล้มเหลว",
      color: isSuccess ? 0x10b981 : 0xef4444, // emerald-500 : red-500
      fields: [
        { name: "👤 ชื่อผู้ใช้", value: `||${username}||`, inline: true },
        { name: "🗺️ โซนเกม", value: mapName || 'ASTD', inline: true },
        { name: "💸 ยอดเงิน", value: `฿${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, inline: true },
        { name: "💳 ช่องทาง", value: channel.toUpperCase(), inline: true },
        ...isSuccess ? [{ name: "💵 ยอดเงินคงเหลือ", value: `฿${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, inline: false }] : []
      ],
      footer: {
        text: "Kuwashii El Web App"
      },
      timestamp: new Date().toISOString()
    };

    fetch(DISCORD_WEBHOOK_URL_TOPUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch(e) {}
};

export const sendDiscordPurchaseEmbed = async (username: string, itemName: string, qty: number, remainingStock: number, drops: { name: string, isSalt?: boolean }[], mapName?: string) => {
  try {
    const rareDrops = drops.filter(d => !d.isSalt);
    const hasRare = rareDrops.length > 0;
    
    // Group drops by name and count occurrences
    const dropsSummary = drops.reduce((acc, drop) => {
       acc[drop.name] = (acc[drop.name] || 0) + 1;
       return acc;
    }, {} as Record<string, number>);

    const dropsFormatted = Object.entries(dropsSummary).map(([name, count]) => {
       const isRareObj = rareDrops.find(r => r.name === name);
       const prefix = isRareObj ? '✨ **' : '🧂 ';
       const suffix = isRareObj ? '**' : '';
       return `${prefix}${name} x${count}${suffix}`;
    }).join('\n');

    const embed = {
      title: "🛒 การซื้อ/สุ่มสินค้าใหม่",
      color: hasRare ? 0xf59e0b : 0x3b82f6, // amber-500 : blue-500
      fields: [
        { name: "👤 ชื่อผู้ใช้", value: `||${username}||`, inline: true },
        { name: "🗺️ โซนเกม", value: mapName || 'ASTD', inline: true },
        { name: "📦 สินค้า", value: itemName, inline: true },
        { name: "🔢 จำนวน", value: `${qty} สุ่ม`, inline: true },
        { name: "📉 สต๊อกคงเหลือ", value: `${remainingStock} ชิ้น`, inline: false },
        { name: "🎁 ผลที่ได้รับ", value: dropsFormatted || 'ไม่มี', inline: false }
      ],
      footer: {
        text: "Kuwashii El Web App"
      },
      timestamp: new Date().toISOString()
    };

    fetch(DISCORD_WEBHOOK_URL_PURCHASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch(e) {}
};
