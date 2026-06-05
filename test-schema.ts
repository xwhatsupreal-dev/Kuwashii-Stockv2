import { supabase } from './src/supabase';

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log(error, data);
}
test();
