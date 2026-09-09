import { createClient } from "@supabase/supabase-js";

/**
 * Public, anon-key Supabase client. READ-ONLY by contract.
 *
 * The anon key ships in the browser bundle, so RLS must deny every
 * insert/update/delete to the `anon` role. All mutations go through
 * `src/app/admin/actions.ts`, which uses the service-role client.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
