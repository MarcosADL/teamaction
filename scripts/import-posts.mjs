// scripts/import-posts.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Executar:
//   node --env-file=.env.local scripts/import-posts.mjs

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const role = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !role) {
  console.error('[ERRO] Falta NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local');
  process.exit(1);
}

const supabase = createClient(url, role);

function toSlug(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const file = path.join(process.cwd(), 'data', 'posts.db.json'); // ajusta se estiver noutro sítio
  const raw = await fs.readFile(file, 'utf8');
  const rows = JSON.parse(raw);

  // Payload mínimo (compatível com o que a API está a expor agora)
  const payload = rows.map((r) => ({
    slug:    r.slug || toSlug(r.title),
    title:   r.title,
    excerpt: r.excerpt ?? null,
    content: r.content ?? null,
  }));

  const { data, error } = await supabase
    .from('posts')
    .upsert(payload, { onConflict: 'slug' })
    .select('id, slug, title');

  if (error) {
    console.error('[ERRO Supabase]', error.message);
    process.exit(1);
  }

  console.log(`Importados/atualizados: ${data?.length ?? 0}`);
  if (data && data.length) console.table(data);
}

main().catch((e) => {
  console.error('[ERRO Script]', e);
  process.exit(1);
});
