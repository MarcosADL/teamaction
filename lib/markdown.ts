// lib/markdown.ts
// Conversor de Markdown seguro (sem libs externas).
// - Escapa HTML (ex.: <script> aparece como texto)
// - Suporta: headings (#), bold (**), italic (*), inline code (`),
//   blocos de código (```), listas (- ou *), links [txt](url) e parágrafos.

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineMarkdown(s: string) {
  // links: [texto](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, href) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
  );

  // inline code: `code`
  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);

  // bold: **texto**
  s = s.replace(/\*\*([^*]+)\*\*/g, (_m, text) => `<strong>${text}</strong>`);

  // italic: *texto*
  // (evita capturar **bold**)
  s = s.replace(/\*(?!\*)([^*]+)\*/g, (_m, text) => `<em>${text}</em>`);

  return s;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) return "";

  // Normaliza e ESCAPA HTML já de início (segurança)
  let src = escapeHtml(markdown.replace(/\r\n/g, "\n"));

  // Trata blocos de código ``` ```
  // Mantemos um array de placeholders para não estragar parsing subsequente.
  const codeBlocks: string[] = [];
  src = src.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const index = codeBlocks.length;
    codeBlocks.push(`<pre><code>${code}</code></pre>`);
    return `@@CODE_BLOCK_${index}@@`;
  });

  // Render linha a linha para headings, listas e parágrafos
  const lines = src.split("\n");
  const out: string[] = [];
  let inList = false;
  let paraBuf: string[] = [];

  const flushPara = () => {
    if (paraBuf.length) {
      const content = inlineMarkdown(paraBuf.join(" "));
      out.push(`<p>${content}</p>`);
      paraBuf = [];
    }
  };

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // linha vazia -> fecha parágrafo/lista
    if (!line) {
      flushPara();
      closeList();
      continue;
    }

    // headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      closeList();
      const level = h[1].length;
      const content = inlineMarkdown(h[2]);
      out.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    // list item (- texto) ou (* texto)
    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) {
      flushPara();
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(li[1])}</li>`);
      continue;
    }

    // parágrafo normal (acumula até linha vazia)
    paraBuf.push(inlineMarkdown(line));
  }

  // fecha pendentes
  flushPara();
  closeList();

  let html = out.join("\n");

  // repõe blocos de código
  html = html.replace(/@@CODE_BLOCK_(\d+)@@/g, (_m, i) => codeBlocks[+i]);

  return html;
}
