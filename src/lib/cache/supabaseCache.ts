import { createServerSupabaseClient } from '@/lib/supabase/server';

interface CacheOptions {
  ttlMinutes: number;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const supabase = createServerSupabaseClient();
  
  const { data } = await supabase
    .from('api_cache')
    .select('data')
    .eq('cache_key', key)
    .gt('expires_at', new Date().toISOString())
    .single();

  return data?.data as T | null;
}

export async function getCachedWithoutExpiry<T>(key: string): Promise<T | null> {
  const supabase = createServerSupabaseClient();
  
  const { data } = await supabase
    .from('api_cache')
    .select('data')
    .eq('cache_key', key)
    .single();

  return data?.data as T | null;
}

export async function setCache<T>(key: string, data: T, options: CacheOptions): Promise<void> {
  const supabase = createServerSupabaseClient();
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + options.ttlMinutes);

  await supabase
    .from('api_cache')
    .upsert({
      cache_key: key,
      data,
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'cache_key' });
}

export async function setCachePermanent<T>(key: string, data: T): Promise<void> {
  const supabase = createServerSupabaseClient();
  
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 10);

  await supabase
    .from('api_cache')
    .upsert({
      cache_key: key,
      data,
      expires_at: farFuture.toISOString(),
    }, { onConflict: 'cache_key' });
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached) {
    console.log(`[Cache Hit] ${key}`);
    return cached;
  }

  console.log(`[Cache Miss] ${key}`);
  const data = await fetcher();
  await setCache(key, data, options);
  return data;
}
