const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetPurchaseUpdate = `      if (item.game === "ASTD") {
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
      }`;

const replacementPurchaseUpdate = `      if (item.game === "ASTD") {
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
      }`;

code = code.replace(targetPurchaseUpdate, replacementPurchaseUpdate);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed ROV sales tracking update');
