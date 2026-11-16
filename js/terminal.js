/* ============================================================
 *  FIGGIE-OS — blog em terminal antigo
 *  Comandos digitados OU clicáveis (funciona no celular).
 * ============================================================ */
(function () {
  "use strict";

  /* ---------- textos editáveis ---------- */
  const SITE = "FIGGIE";
  const SOBRE_MD = `
Olá! Este é o **${SITE}**, um blog pessoal rodando num terminal dos anos 80.

Edite este texto em \`js/terminal.js\` (constante \`SOBRE_MD\`).
`;
  // Links da página "links" — [título, endereço]
  const LINKS = [
    ["Internet Archive", "https://archive.org"],
    ["Neocities", "https://neocities.org"],
    ["Space Jam (1996)", "https://www.spacejam.com/1996/"],
    ["Wikipédia", "https://pt.wikipedia.org"]
  ];
  const LOGO = String.raw`
  _____ ___ ____  ____ ___ _____
 |  ___|_ _/ ___|/ ___|_ _| ____|
 | |_   | | |  _| |  _ | ||  _|
 |  _|  | | |_| | |_| || || |___
 |_|   |___\____|\____|___|_____|`;

  /* ---------- elementos ---------- */
  const $ = (s) => document.querySelector(s);
  const out = $("#output"), screen = $("#screen"), input = $("#cmd"), mirror = $("#mirror");
  const promptLine = $("#prompt-line"), ps1 = $("#ps1"), where = $("#where");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  const posts = () => (window.FIGGIE_POSTS || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const fmtDate = (iso) => {
    const d = new Date(iso + "T12:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };
  const findPost = (arg) => {
    const list = posts();
    if (/^\d+$/.test(arg)) return list[Number(arg) - 1];
    return list.find((p) => p.slug === arg) || list.find((p) => p.slug.startsWith(arg));
  };

  /* ---------- saída ---------- */
  function line(text = "", cls = "") {
    const d = document.createElement("div");
    d.className = "line " + cls;
    d.textContent = text;
    out.appendChild(d);
    return d;
  }
  function html(markup, cls = "") {
    const d = document.createElement("div");
    d.className = cls;
    d.innerHTML = markup;
    out.appendChild(d);
    return d;
  }
  const cmdLink = (cmd, label) => `<button type="button" class="cmd-link" data-cmd="${esc(cmd)}">${esc(label || cmd)}</button>`;
  const clear = () => { out.innerHTML = ""; };
  const toBottom = () => { screen.scrollTop = screen.scrollHeight; };
  async function typeLine(text, cls = "", speed = 8) {
    const d = line("", cls);
    for (let i = 0; i < text.length; i++) {
      d.textContent += text[i];
      if (i % 3 === 0) await sleep(speed);
    }
    toBottom();
  }

  /* ---------- Markdown (com links numerados estilo navegador de texto) ---------- */
  function renderMarkdown(src) {
    const refs = [];
    const linkTag = (url, label) => {
      const internal = /^figgie:\/\//i.test(url);
      const external = /^(https?:|mailto:)/i.test(url);
      refs.push(url);
      const n = refs.length;
      const attrs = internal
        ? `href="${esc(url)}" data-internal="${esc(url)}"`
        : external ? `href="${esc(url)}" target="_blank" rel="noopener"` : `href="${esc(url)}"`;
      return `<a ${attrs}>${label}</a><span class="ref">[${n}]</span>`;
    };
    const inline = (t) => {
      let s = esc(t);
      const codes = [];
      s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
      s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy" style="max-height:1.2em">`);
      s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => linkTag(url.replace(/&amp;/g, "&"), label));
      s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      s = s.replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
      s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
      s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, pre, url) => pre + linkTag(url, url));
      return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
    };
    const block = (text) => {
      const lines = String(text || "").replace(/\r/g, "").split("\n");
      const o = [];
      let i = 0, m;
      const isSpecial = (l) => /^(#{1,4}\s|```|>|\s*[-*+]\s|\s*\d+[.)]\s|\s*!\[[^\]]*\]\([^)]+\)\s*$|\s*(---|\*\*\*)\s*$)/.test(l);
      while (i < lines.length) {
        const l = lines[i];
        if (!l.trim()) { i++; continue; }
        if (/^```/.test(l)) {
          const b = []; i++;
          while (i < lines.length && !/^```/.test(lines[i])) b.push(lines[i++]);
          i++; o.push(`<pre><code>${esc(b.join("\n"))}</code></pre>`); continue;
        }
        if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { const n = Math.min(m[1].length + 1, 4); o.push(`<h${n}>${inline(m[2])}</h${n}>`); i++; continue; }
        if (/^\s*(---|\*\*\*)\s*$/.test(l)) { o.push("<hr>"); i++; continue; }
        if ((m = l.match(/^\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
          o.push(`<figure><button type="button" class="frame" data-img="${esc(m[2])}" data-alt="${esc(m[1])}" aria-label="Ampliar imagem"><span class="tint"><img src="${esc(m[2])}" alt="${esc(m[1])}" loading="lazy"></span></button>${m[1] ? `<figcaption>${inline(m[1])}</figcaption>` : ""}</figure>`);
          i++; continue;
        }
        if (/^>\s?/.test(l)) {
          const b = [];
          while (i < lines.length && /^>\s?/.test(lines[i])) b.push(lines[i++].replace(/^>\s?/, ""));
          o.push(`<blockquote>${block(b.join("\n"))}</blockquote>`); continue;
        }
        if (/^\s*[-*+]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l)) {
          const ord = /^\s*\d+[.)]\s+/.test(l), re = ord ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;
          const items = [];
          while (i < lines.length && re.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(re, ""))}</li>`);
          o.push(ord ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`); continue;
        }
        const b = [];
        while (i < lines.length && lines[i].trim() && !isSpecial(lines[i])) b.push(lines[i++]);
        o.push(`<p>${inline(b.join(" "))}</p>`);
      }
      return o.join("\n");
    };
    return { html: block(src), refs };
  }

  function excerpt(body, n = 140) {
    const t = String(body || "").replace(/```[\s\S]*?```/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[#>*`~_]/g, "").replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
  }

  /* ---------- estado ---------- */
  let lastRefs = [];     // links numerados da página atual
  let currentSlug = null;
  const backStack = [];  // histórico de páginas (para "voltar")
  let currentPage = null;

  function setLocation(path, label) {
    const dir = "C:\\" + (label || "BLOG");
    ps1.textContent = dir + ">";
    where.textContent = dir;
    const target = path ? "#/" + path : "";
    if (location.hash !== target) history.replaceState(null, "", target || location.pathname + location.search);
  }

  /* página = limpa a tela e mostra conteúdo de cima para baixo */
  function showPage(cmd, renderFn) {
    if (currentPage && currentPage !== cmd) backStack.push(currentPage);
    currentPage = cmd;
    clear();
    renderFn();
    screen.scrollTop = 0;
  }

  function refsBlock(refs) {
    if (!refs.length) return "";
    return `<ol class="refs" aria-label="Links desta página">${refs.map((u, i) =>
      `<li value="${i + 1}">${esc(u)}</li>`).join("")}</ol>
      <div class="line dim">Dica: digite <b>link N</b> para abrir o link de número N.</div>`;
  }

  /* ---------- páginas ---------- */
  function pageHome() {
    showPage("inicio", () => {
      setLocation("", "BLOG");
      html(`<pre class="ascii" aria-label="${SITE}">${esc(LOGO)}</pre>`);
      line("");
      line(`${SITE}-OS v1.0  ·  blog pessoal  ·  ${posts().length} posts no disco`, "dim");
      html("<hr>");
      line("ÚLTIMOS POSTS", "hi");
      const list = posts().slice(0, 5);
      html(`<ul class="post-list">${list.map((p, i) =>
        `<li><span class="num">${String(i + 1).padStart(2, "0")}.</span> ${cmdLink("ler " + p.slug, p.title)} <span class="dim">— ${fmtDate(p.date)}</span></li>`).join("")}</ul>`);
      line("");
      html(`Comandos: ${cmdLink("posts")} · ${cmdLink("buscar")} · ${cmdLink("tags")} · ${cmdLink("links")} · ${cmdLink("sobre")} · ${cmdLink("ajuda")}`);
      line("");
      line("Digite um comando ou clique numa opção.", "dim");
    });
  }

  function pageList(filter = {}) {
    const all = posts();
    const q = (filter.q || "").toLowerCase();
    const list = all.filter((p) =>
      (!filter.tag || (p.tags || []).includes(filter.tag)) &&
      (!q || (p.title + " " + p.body + " " + (p.tags || []).join(" ")).toLowerCase().includes(q)));
    const key = filter.tag ? "tag " + filter.tag : q ? "buscar " + filter.q : "posts";
    showPage(key, () => {
      setLocation(filter.tag ? "tag/" + encodeURIComponent(filter.tag) : "posts", filter.tag ? "BLOG\\" + filter.tag.toUpperCase() : "BLOG\\POSTS");
      line(`C:\\BLOG> dir ${filter.tag ? "/tag:" + filter.tag : q ? '/busca:"' + filter.q + '"' : "*.txt"}`, "dim");
      line("");
      if (!list.length) { line("Arquivo não encontrado.", "err"); html(`<br>${cmdLink("posts", "ver todos os posts")}`); return; }
      html(`<ul class="post-list">${list.map((p) => {
        const n = all.indexOf(p) + 1;
        return `<li><span class="num">${String(n).padStart(2, "0")}.</span> ${cmdLink("ler " + p.slug, p.title)}
          <span class="dim">${fmtDate(p.date)} ${(p.tags || []).map((t) => "#" + esc(t)).join(" ")}</span>
          <span class="excerpt">${esc(excerpt(p.body))}</span></li>`;
      }).join("")}</ul>`);
      line("");
      line(`${list.length} arquivo(s)   ·   digite "ler N" ou clique no título`, "dim");
    });
  }

  async function pagePost(arg) {
    const p = findPost(String(arg || "").trim());
    if (!p) { line(`Post não encontrado: ${arg || "(vazio)"}`, "err"); html(`Veja a lista: ${cmdLink("posts")}`); toBottom(); return; }
    const all = posts(), idx = all.indexOf(p);
    const older = all[idx + 1], newer = all[idx - 1];
    const md = renderMarkdown(p.body);
    lastRefs = md.refs;
    currentSlug = p.slug;
    showPage("ler " + p.slug, () => {
      setLocation("blog/" + encodeURIComponent(p.slug), "BLOG\\" + p.slug.toUpperCase().slice(0, 24) + ".TXT");
      html(`<article class="post">
        <div class="dim">C:\\BLOG> type ${esc(p.slug)}.txt</div>
        <h1>${esc(p.title)}</h1>
        <div class="meta">${fmtDate(p.date)} ${(p.tags || []).map((t) => cmdLink("tag " + t, "#" + t)).join(" ")}</div>
        ${p.cover ? `<figure class="cover"><button type="button" class="frame" data-img="${esc(p.cover)}" data-alt="${esc(p.title)}" aria-label="Ampliar imagem"><span class="tint"><img src="${esc(p.cover)}" alt="" loading="lazy"></span></button></figure>` : ""}
        ${md.html}
        <hr>
        <nav class="post-nav">
          <span>${older ? "&lt; " + cmdLink("ler " + older.slug, older.title) : ""}</span>
          <span>${cmdLink("posts", "[todos os posts]")}</span>
          <span>${newer ? cmdLink("ler " + newer.slug, newer.title) + " &gt;" : ""}</span>
        </nav>
        ${refsBlock(md.refs)}
      </article>`);
    });
  }

  function pageLinks() {
    lastRefs = LINKS.map((l) => l[1]);
    showPage("links", () => {
      setLocation("links", "LINKS");
      html(`<div class="post"><h1>Links</h1>
        <p class="dim">Sites recomendados. Abrem numa aba nova do seu navegador.</p>
        <ol>${LINKS.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a> <span class="ref">${esc(u)}</span></li>`).join("")}</ol></div>`);
    });
  }

  function pageSobre() {
    const md = renderMarkdown(SOBRE_MD);
    lastRefs = md.refs;
    showPage("sobre", () => {
      setLocation("sobre", "SOBRE");
      html(`<div class="post"><h1>Sobre</h1>${md.html}${refsBlock(md.refs)}</div>`);
    });
  }

  /* navegador interno: endereços figgie:// */
  function openUrl(url) {
    url = String(url || "").trim();
    if (!url) { line("Uso: abrir figgie://blog/nome-do-post", "dim"); return; }
    if (/^(https?:|mailto:)/i.test(url)) { window.open(url, "_blank", "noopener"); line(`Abrindo ${url} numa nova aba...`, "dim"); return; }
    const path = url.replace(/^figgie:\/\//i, "").replace(/^\/+|\/+$/g, "");
    const [route, ...rest] = path.split("/");
    const arg = decodeURIComponent(rest.join("/"));
    switch ((route || "").toLowerCase()) {
      case "": case "home": case "inicio": return pageHome();
      case "blog": case "posts": return arg ? pagePost(arg) : pageList();
      case "tag": return pageList({ tag: arg });
      case "links": return pageLinks();
      case "sobre": return pageSobre();
      default: line(`Caminho não encontrado: ${url}`, "err"); toBottom();
    }
  }

  /* ---------- comandos ---------- */
  const COMMANDS = {
    ajuda: {
      desc: "mostra esta lista",
      run() {
        line("COMANDOS DISPONÍVEIS", "hi");
        const rows = [
          ["inicio", "tela inicial"],
          ["posts", "lista todos os posts (também: ls, dir)"],
          ["ler N | nome", "abre um post (também: cat, type)"],
          ["proximo / anterior", "post seguinte / anterior"],
          ["buscar texto", "procura nos posts"],
          ["tags / tag nome", "etiquetas / posts de uma etiqueta"],
          ["link N", "abre o link número N da página"],
          ["abrir figgie://...", "navegador interno (ex.: figgie://blog/bem-vindo)"],
          ["voltar", "página anterior"],
          ["links / sobre", "páginas fixas"],
          ["data", "data e hora"],
          ["limpar", "limpa a tela (também: cls, clear)"],
          ["reiniciar", "reinicia o sistema"]
        ];
        html(`<div>${rows.map(([c, d]) => `<div class="line">  ${cmdLink(c.split(" ")[0], c.padEnd(24, " "))} <span class="dim">${esc(d)}</span></div>`).join("")}</div>`);
        line("");
        line("Dica: ↑/↓ repete comandos, TAB completa.", "dim");
      }
    },
    inicio: { run: pageHome },
    posts: { run: () => pageList() },
    ler: {
      run(a) {
        if (!a) { line("Uso: ler N  (ou o nome do post)", "dim"); html(cmdLink("posts", "ver lista de posts")); return; }
        pagePost(a);
      }
    },
    proximo: {
      run() {
        const all = posts(), i = all.findIndex((p) => p.slug === currentSlug);
        const p = i < 0 ? all[0] : all[i - 1];
        p ? pagePost(p.slug) : line("Este já é o post mais recente.", "dim");
      }
    },
    anterior: {
      run() {
        const all = posts(), i = all.findIndex((p) => p.slug === currentSlug);
        const p = i < 0 ? all[0] : all[i + 1];
        p ? pagePost(p.slug) : line("Este já é o post mais antigo.", "dim");
      }
    },
    buscar: {
      run(a) {
        if (!a) { line("O que você quer buscar? Digite: buscar palavra", "dim"); input.value = "buscar "; syncMirror(); input.focus(); return; }
        pageList({ q: a });
      }
    },
    tags: {
      run() {
        const count = {};
        posts().forEach((p) => (p.tags || []).forEach((t) => (count[t] = (count[t] || 0) + 1)));
        const tags = Object.keys(count).sort();
        if (!tags.length) return line("Nenhuma etiqueta.", "dim");
        html(tags.map((t) => `${cmdLink("tag " + t, "#" + t)} <span class="dim">(${count[t]})</span>`).join("   "));
      }
    },
    tag: { run: (a) => (a ? pageList({ tag: a.replace(/^#/, "") }) : COMMANDS.tags.run()) },
    link: {
      run(a) {
        const u = lastRefs[Number(a) - 1];
        if (!u) return line(lastRefs.length ? `Use um número de 1 a ${lastRefs.length}.` : "Esta página não tem links.", "err");
        openUrl(u);
      }
    },
    abrir: { run: openUrl },
    voltar: {
      run() {
        const prev = backStack.pop();
        if (!prev) return line("Nada para voltar.", "dim");
        currentPage = null;
        run(prev, { silent: true, noBackPush: true });
      }
    },
    links: { run: pageLinks },
    sobre: { run: pageSobre },
    data: { run: () => line(new Date().toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "medium" })) },
    limpar: { run: () => { clear(); currentPage = null; } },
    eco: { run: (a) => line(a || "") },
    quem: { run: () => line("visitante@figgie") },
    reiniciar: { run: () => { store.set("figgie-boot", ""); try { sessionStorage.removeItem("figgie-boot"); } catch (e) {} location.hash = ""; location.reload(); } },
    sair: { run: () => line("Não há saída. Só mais um post. :)", "dim") }
  };
  const ALIASES = {
    help: "ajuda", "?": "ajuda", home: "inicio", ls: "posts", dir: "posts", cat: "ler", type: "ler", more: "ler",
    proxima: "proximo", "próximo": "proximo", next: "proximo", prev: "anterior", busca: "buscar", search: "buscar",
    find: "buscar", open: "abrir", cd: "abrir", back: "voltar", cls: "limpar", clear: "limpar", date: "data",
    hora: "data", time: "data", echo: "eco", whoami: "quem", reboot: "reiniciar", exit: "sair"
  };

  function run(raw, opts = {}) {
    const text = String(raw || "").trim();
    if (!text) return;
    if (!opts.silent) {
      line(`${ps1.textContent} ${text}`, "echo");
      cmdHistory.push(text); histIdx = cmdHistory.length;
    }
    const [name, ...rest] = text.split(/\s+/);
    const key = ALIASES[name.toLowerCase()] || name.toLowerCase();
    const cmd = COMMANDS[key];
    if (!cmd) {
      line(`'${name}' não é reconhecido como um comando interno.`, "err");
      html(`Digite ${cmdLink("ajuda")} para ver os comandos.`);
      toBottom();
      return;
    }
    const before = currentPage;
    cmd.run(rest.join(" "));
    if (currentPage === before) toBottom();
    if (viewer.hidden && matchMedia("(pointer:fine)").matches) input.focus({ preventScroll: true });
  }

  /* ---------- entrada do teclado ---------- */
  const cmdHistory = [];
  let histIdx = 0;
  function syncMirror() { mirror.textContent = input.value; }
  input.addEventListener("input", syncMirror);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { if (histIdx > 0) input.value = cmdHistory[--histIdx]; e.preventDefault(); syncMirror(); }
    else if (e.key === "ArrowDown") { histIdx = Math.min(cmdHistory.length, histIdx + 1); input.value = cmdHistory[histIdx] || ""; e.preventDefault(); syncMirror(); }
    else if (e.key === "Tab") { e.preventDefault(); complete(); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); clear(); }
  });
  function complete() {
    const v = input.value;
    const parts = v.split(/\s+/);
    let options;
    if (parts.length <= 1) options = Object.keys(COMMANDS).concat(Object.keys(ALIASES)).filter((c) => c.startsWith(v.toLowerCase()));
    else if (["ler", "cat", "type", "more"].includes(parts[0].toLowerCase())) options = posts().map((p) => p.slug).filter((s) => s.startsWith(parts[1]));
    else if (parts[0].toLowerCase() === "tag") options = [...new Set(posts().flatMap((p) => p.tags || []))].filter((s) => s.startsWith(parts[1]));
    if (!options || !options.length) return;
    if (options.length === 1) {
      parts[parts.length - 1] = options[0];
      input.value = parts.join(" ") + " ";
    } else line(options.join("   "), "dim");
    syncMirror(); toBottom();
  }
  promptLine.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = ""; syncMirror();
    run(v);
  });

  /* ---------- cliques: comandos, links internos, imagens ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cmd]");
    if (btn) { run(btn.dataset.cmd); return; }
    const a = e.target.closest("a[data-internal]");
    if (a) { e.preventDefault(); run("abrir " + a.dataset.internal); return; }
    const frame = e.target.closest("[data-img]");
    if (frame) { openViewer(frame.dataset.img, frame.dataset.alt); return; }
    // clicar na tela foca o prompt (sem abrir teclado no celular e sem atrapalhar seleção de texto)
    if (e.target.closest("#screen") && !window.getSelection().toString() && matchMedia("(pointer:fine)").matches) input.focus();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeViewer();
    const fkeys = { F1: "inicio", F2: "posts", F3: "buscar", F4: "links", F5: "sobre", F6: "ajuda" };
    if (fkeys[e.key]) { e.preventDefault(); run(fkeys[e.key]); }
  });

  /* ---------- visualizador de imagem ---------- */
  const viewer = $("#viewer");
  function openViewer(src, alt) {
    $("#viewer-img").src = src;
    $("#viewer-img").alt = alt || "";
    $("#viewer-name").textContent = src.split("/").pop();
    $("#viewer-cap").textContent = alt || "";
    viewer.hidden = false;
    $("#viewer-close").focus();
  }
  function closeViewer() { if (!viewer.hidden) { viewer.hidden = true; input.focus({ preventScroll: true }); } }
  $("#viewer-close").onclick = closeViewer;
  viewer.addEventListener("click", (e) => { if (e.target === viewer) closeViewer(); });

  /* ---------- relógio ---------- */
  const clock = $("#clock");
  function tick() {
    const d = new Date();
    clock.textContent = d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR");
    clock.dateTime = d.toISOString();
  }
  tick(); setInterval(tick, 1000);

  /* ---------- rotas pelo endereço (#/blog/slug) ---------- */
  function routeFromHash() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    if (!h) return false;
    openUrl("figgie://" + h);
    return true;
  }
  addEventListener("hashchange", () => {
    const h = location.hash.replace(/^#\/?/, "");
    const cur = currentPage && currentPage.startsWith("ler ") ? "blog/" + encodeURIComponent(currentPage.slice(4)) : null;
    if (h && h !== cur) routeFromHash();
  });

  /* ---------- boot ---------- */
  async function boot() {
    promptLine.classList.add("busy");
    let skip = false;
    const skipper = () => { skip = true; };
    addEventListener("keydown", skipper, { once: true });
    addEventListener("pointerdown", skipper, { once: true });
    const steps = [
      [`${SITE} BIOS v2.08  (C) 1986 Figgie Systems`, ""],
      ["Verificando memória... 640K OK", "dim"],
      ["Detectando unidades... A: C:", "dim"],
      ["Carregando FIGGIE-OS...", "dim"],
      [`Montando C:\\BLOG ... ${posts().length} posts encontrados`, "dim"],
      ["", ""]
    ];
    for (const [t, c] of steps) {
      if (skip) break;
      await typeLine(t, c, 6);
      await sleep(140);
    }
    removeEventListener("keydown", skipper);
    removeEventListener("pointerdown", skipper);
    try { sessionStorage.setItem("figgie-boot", "1"); } catch (e) {}
    promptLine.classList.remove("busy");
  }

  async function start() {
    let booted = false;
    try { booted = sessionStorage.getItem("figgie-boot") === "1"; } catch (e) {}
    if (!booted && !location.hash) await boot();
    if (!routeFromHash()) pageHome();
    if (matchMedia("(pointer:fine)").matches) input.focus({ preventScroll: true });
  }
  start();
})();
