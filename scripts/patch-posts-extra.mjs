// scripts/patch-posts-extra.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const role = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !role) {
  console.error('[ERRO] Falta NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local');
  process.exit(1);
}

const supabase = createClient(url, role);

// tenta selecionar uma coluna; se existir, não dá erro
async function colunaExiste(col) {
  const { error } = await supabase.from('posts').select(`id, ${col}`).limit(0);
  return !error;
}

function toDateISO(d) {
  if (!d) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(d)) ? d : null;
}

function mapStatus(s) {
  if (!s) return 'draft';
  const x = String(s).toLowerCase();
  if (x.startsWith('public')) return 'published'; // 'publicado', 'public', etc.
  if (x.startsWith('rascun')) return 'draft';
  return (x === 'published' || x === 'draft') ? x : 'draft';
}

async function main() {
  // detetar colunas disponíveis no PostgREST agora
  const possiveis = ['image_url','video_url','date','categories','tags','status','cover_image','published_at'];
  const visiveis = {};
  for (const c of possiveis) visiveis[c] = await colunaExiste(c);
  console.log('Colunas visíveis:', Object.keys(visiveis).filter(k => visiveis[k]).join(', ') || '(nenhuma extra)');

  const file = path.join(process.cwd(), 'data', 'posts.db.json');
  const raw = await fs.readFile(file, 'utf8');
  const rows = JSON.parse(raw);

  let atualizados = 0, saltos = 0, erros = 0;

  for (const r of rows) {
    const slug = r.slug || String(r.title || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    const patch = {};

    // mapear apenas o que a API expõe neste momento
    if (visiveis.image_url)   patch.image_url   = r.coverImage ?? null;
    if (visiveis.cover_image) patch.cover_image = r.coverImage ?? null;
    if (visiveis.video_url)   patch.video_url   = r.videoUrl ?? null;
    if (visiveis.date)        patch.date        = toDateISO(r.date);
    if (visiveis.published_at)patch.published_at= r.date ? (toDateISO(r.date) + 'T00:00:00Z') : null;
    if (visiveis.categories)  patch.categories  = Array.isArray(r.categories) ? r.categories : [];
    if (visiveis.tags)        patch.tags        = Array.isArray(r.tags) ? r.tags : [];
    if (visiveis.status)      patch.status      = mapStatus(r.status);

    // nada para atualizar → segue
    if (Object.keys(patch).length === 0) { saltos++; continue; }

    const { error } = await supabase.from('posts').update(patch).eq('slug', slug);
    if (error) {
      erros++;
      console.error(`[ERRO update slug=${slug}]`, error.message);
    } else {
      atualizados++;
    }
  }

  console.log(`Feito. Atualizados: ${atualizados} | Sem alterações: ${saltos} | Erros: ${erros}`);
}

main().catch(e => {
  console.error('[ERRO Script]', e);
  process.exit(1);
});
