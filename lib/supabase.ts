import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vrgjesehjtacdtxjygew.supabase.co";
const supabaseKey = "sb_publishable_MWQFQ8mQqJmXa--EMA-AzQ_XfktXKBq";

export const supabase = createClient(supabaseUrl, supabaseKey);