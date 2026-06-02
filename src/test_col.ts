import { supabase } from './supabase';

async function run() {
  const { data, error } = await supabase.from('items').select('initial_quantity').limit(1);
  console.log(error ? 'Error: ' + error.message : 'Success');
}
run();
