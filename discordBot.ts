import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function startDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.log("Discord bot skipped (DISCORD_BOT_TOKEN not provided in .env)");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
    ]
  });

  client.once('ready', async () => {
    console.log(`🤖 Discord Bot connected as ${client.user?.tag}`);

    // Register slash commands globally or for a specific guild (global can take an hour to propagate)
    try {
      await client.application?.commands.set([
        {
          name: 'menu',
          description: 'เปิดแผงควบคุมระบบ Kuwashii Shop'
        },
        {
          name: 'give',
          description: 'เพิ่มหรือลดยอดเงินของผู้ใช้งาน',
          options: [
            {
              name: 'username',
              type: 3, // String
              description: 'ชื่อผู้ใช้งาน (Username)',
              required: true
            },
            {
              name: 'amount',
              type: 10, // Number
              description: 'จำนวนเงิน (ใส่ - เพื่อลด)',
              required: true
            }
          ]
        }
      ]);
      console.log("✅ Application (Slash) Commands registered!");
    } catch (err) {
      console.warn("Failed to register commands:", err);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    const supabase = getSupabase();

    // Check Admin Role across all interactions
    const adminRole = process.env.DISCORD_ADMIN_ROLE_ID || "1511343665128276181";
    if (adminRole && interaction.inGuild()) {
      const memberRoles = (interaction.member as any)?.roles;
      let hasRole = false;
      if (memberRoles) {
        if (Array.isArray(memberRoles)) {
          hasRole = memberRoles.includes(adminRole);
        } else if (memberRoles.cache) {
          hasRole = memberRoles.cache.has(adminRole);
        }
      }
      if (!hasRole) {
        if (interaction.isRepliable()) {
          return interaction.reply({ content: '❌ คุณไม่มีสิทธิ์ใช้งานคำสั่งนี้ (ต้องการยศแอดมิน)', ephemeral: true });
        }
        return;
      }
    }

    if (interaction.isChatInputCommand()) {
      const adminChannel = process.env.DISCORD_ADMIN_CHANNEL_ID;
      if (adminChannel && interaction.channelId !== adminChannel) {
         return interaction.reply({ content: '❌ คุณไม่สามารถใช้คำสั่งในช่องแชทนี้ได้', ephemeral: true });
      }

      if (!supabase) {
        return interaction.reply({ content: '❌ ยังไม่ได้ตั้งค่า Supabase API Key ในเซิร์ฟเวอร์', ephemeral: true });
      }

      if (interaction.commandName === 'menu') {
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('admin_select')
              .setPlaceholder('เลือกระบบที่ต้องการจัดการ')
              .addOptions([
                { label: 'จัดการผู้เล่น (เพิ่ม-ลดเครดิต)', value: 'manage_user', description: 'แก้ไขยอดเงินในระบบของผู้ใช้' },
                { label: 'เพิ่มสินค้า (เหมือง/แมพ)', value: 'add_item', description: 'เพิ่มสินค้าใหม่ๆ ลงในร้านค้า' }
              ]),
          );

        await interaction.reply({ 
          content: '**แผงควบคุมระบบ Kuwashii Shop**\nกรุณาเลือกเมนูที่ต้องการ:', 
          components: [row] 
        });
      }

      if (interaction.commandName === 'give') {
        const username = interaction.options.getString('username', true);
        const amount = interaction.options.getNumber('amount', true);

        try {
          const { data, error } = await supabase.from('profiles').select('balance').eq('username', username).single();
          if (error || !data) {
              return interaction.reply({ content: `❌ ไม่พบผู้ใช้งานชื่อ **${username}** ในระบบ`, ephemeral: true });
          }
          const newBalance = Number(data.balance) + amount;
          await supabase.from('profiles').update({ balance: newBalance }).eq('username', username);
          await interaction.reply({ content: `✅ เพิ่มยอดเงินให้ **${username}** จำนวน ${amount} บาท\nยอดคงเหลือปัจจุบัน: ${newBalance} บาท` });
        } catch(e: any) {
          await interaction.reply({ content: `❌ เกิดข้อผิดพลาด: ${e.message}`, ephemeral: true });
        }
      }
      return;
    }

    if (!interaction.isStringSelectMenu() && !interaction.isModalSubmit() && !interaction.isButton()) return;


    if (interaction.isStringSelectMenu() && interaction.customId === 'admin_select') {
      const choice = interaction.values[0];

      if (choice === 'manage_user') {
        const modal = new ModalBuilder()
          .setCustomId('user_modal')
          .setTitle('จัดการผู้เล่น');
        
        const usernameInput = new TextInputBuilder()
          .setCustomId('username')
          .setLabel("ชื่อผู้ใช้งาน (Username)")
          .setStyle(TextInputStyle.Short);
        
        const amountInput = new TextInputBuilder()
          .setCustomId('amount')
          .setLabel("จำนวนเงินที่ต้องการเพิ่ม/ลด (ใส่ - เพื่อลด)")
          .setStyle(TextInputStyle.Short);

        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(amountInput)
        );

        await interaction.showModal(modal);
      } else if (choice === 'add_item') {
        // ให้เลือกแมพก่อน
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select_game')
              .setPlaceholder('เลือกแมพ/เกม ของสินค้าที่จะเพิ่ม')
              .addOptions([
                { label: 'Anime Vanguards', value: 'Anime Vanguards' },
                { label: 'Anime Defenders', value: 'Anime Defenders' },
                { label: 'Blox Fruits', value: 'Blox Fruits' },
                { label: 'อื่นๆ (General)', value: 'General' },
              ]),
          );
        
        await interaction.reply({ content: 'เมนูเพิ่มสินค้า: โปรดเลือกแมพก่อน', components: [row], ephemeral: true });
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'select_game') {
      const game = interaction.values[0];
      const modal = new ModalBuilder()
        .setCustomId(`item_modal_${game}`)
        .setTitle(`เพิ่มสินค้า: ${game}`);
        
      const nameInput = new TextInputBuilder()
        .setCustomId('item_name')
        .setLabel("ชื่อสินค้า")
        .setStyle(TextInputStyle.Short);
      
      const priceInput = new TextInputBuilder()
        .setCustomId('item_price')
        .setLabel("ราคา (บาท)")
        .setStyle(TextInputStyle.Short);

      const qtyInput = new TextInputBuilder()
        .setCustomId('item_qty')
        .setLabel("จำนวนชิ้นในสต็อก")
        .setStyle(TextInputStyle.Short);

      const imageInput = new TextInputBuilder()
        .setCustomId('item_image')
        .setLabel("ลิงก์รูปภาพ (URL)")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(priceInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(qtyInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput)
      );

      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
      if (!supabase) return;

      if (interaction.customId === 'user_modal') {
        const username = interaction.fields.getTextInputValue('username');
        const amount = parseFloat(interaction.fields.getTextInputValue('amount'));

        if (isNaN(amount)) {
          return interaction.reply({ content: '❌ จำนวนเงินไม่ถูกต้อง', ephemeral: true });
        }

        try {
          const { data, error } = await supabase.from('profiles').select('balance').eq('username', username).single();
          if (error || !data) {
             return interaction.reply({ content: `❌ ไม่พบผู้ใช้งานชื่อ **${username}** ในระบบ`, ephemeral: true });
          }
          const newBalance = Number(data.balance) + amount;
          await supabase.from('profiles').update({ balance: newBalance }).eq('username', username);
          await interaction.reply({ content: `✅ ปรับยอดเงินผู้ค้า **${username}** แล้ว\nจำนวนที่แก้ไข: ${amount} บาท\nยอดคงเหลือ: ${newBalance} บาท` });
        } catch (e: any) {
          await interaction.reply({ content: `❌ เกิดข้อผิดพลาด: ${e.message}`, ephemeral: true });
        }
      } 
      else if (interaction.customId.startsWith('item_modal_')) {
        const game = interaction.customId.replace('item_modal_', '');
        const name = interaction.fields.getTextInputValue('item_name');
        const price = parseFloat(interaction.fields.getTextInputValue('item_price'));
        const qty = parseInt(interaction.fields.getTextInputValue('item_qty'), 10);
        const image = interaction.fields.getTextInputValue('item_image') || 'https://via.placeholder.com/150';

        if (isNaN(price) || isNaN(qty)) {
          return interaction.reply({ content: '❌ ราคาและจำนวนต้องเป็นตัวเลขเท่านั้น', ephemeral: true });
        }

        const id = 'item_' + Date.now().toString();

        try {
          const newItem = {
            id,
            name,
            price,
            quantity: qty,
            image,
            game,
            category: 'general',
            rarity: 'Common'
          };
          
          const { error } = await supabase.from('items').insert([newItem]);
          if (error) throw error;

          await interaction.reply({ content: `✅ เพิ่มสินค้าใหม่สำเร็จ!\n**ชื่อ:** ${name}\n**ราคา:** ${price} บาท\n**สต็อก:** ${qty} ชิ้น\n**แมพ:** ${game}` });
        } catch (e: any) {
          await interaction.reply({ content: `❌ เกิดข้อผิดพลาดในการเพิ่มสินค้า: ${e.message}`, ephemeral: true });
        }
      }
    }
  });

  client.login(token).catch(err => {
    console.error("Failed to start Discord bot:", err.message);
  });
}
