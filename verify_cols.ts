import fs from 'fs';

const envFile = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf-8') : fs.readFileSync('.env', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
    // remove quotes if any
    if (supabaseKey.startsWith('"')) supabaseKey = supabaseKey.slice(1, -1);
    if (supabaseKey.startsWith("'")) supabaseKey = supabaseKey.slice(1, -1);
  }
});

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/purchases?select=*&limit=1`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  console.log(res.status, await res.text());
}
run();
