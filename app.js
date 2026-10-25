// Gerador de cardápio diário — Quebra Nozes Doceria
// Tudo roda no navegador: nenhum dado sai do aparelho.

const W = 1080, H = 1920;
const C = { bg: "#FCF9F0", wine: "#682126", olive: "#656853", ink: "#2B2723", rule: "#C4C1AE" };
const F = {
  title: '"GFS Didot", "Didot", serif',
  date: '"Bodoni Moda", "Bodoni 72", serif',
  sans: '"Nunito Sans", "Avenir Next", system-ui, sans-serif',
};
const KEY = "qn-cardapio-v1";

const $ = (s) => document.querySelector(s);
const cv = $("#cv"), ctx = cv.getContext("2d");
let data = null, base = "";
const logo = new Image();
logo.src = "logo.png";

// ---------- estado ----------
function save() { localStorage.setItem(KEY, JSON.stringify({ base, data })); }

async function load() {
  let def = null;
  try { def = await (await fetch("catalogo.json", { cache: "no-store" })).json(); } catch (e) { /* offline */ }
  const stored = JSON.parse(localStorage.getItem(KEY) || "null");
  const defStr = def ? JSON.stringify(def) : "";
  // Se o catálogo do GitHub mudou, ele passa a valer; senão mantém o que foi editado no aparelho.
  if (stored && (!def || stored.base === defStr)) { data = stored.data; base = stored.base; }
  else { data = def || { categorias: [] }; base = defStr; }
  save();
}

// ---------- data ----------
function todayISO() {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
function ddmm(iso) { const [, m, d] = iso.split("-"); return `${d}/${m}`; }

// ---------- editor ----------
function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k in e && typeof v !== "string") e[k] = v;
    else e.setAttribute(k, v);
  }
  kids.forEach((k) => e.append(k));
  return e;
}

function renderEditor() {
  const box = $("#cats"); box.innerHTML = "";
  data.categorias.forEach((cat, ci) => {
    const head = el("div", { class: "cat-head" },
      el("input", { class: "cat-name", type: "text", value: cat.nome, "aria-label": "Nome da categoria",
        oninput: (e) => { cat.nome = e.target.value.toUpperCase(); e.target.value = cat.nome; changed(); } }),
      el("input", { class: "tag", type: "text", value: cat.etiqueta || "", placeholder: "etiqueta (ex.: NOVIDADE)",
        oninput: (e) => { cat.etiqueta = e.target.value.toUpperCase(); e.target.value = cat.etiqueta; changed(); } }),
      el("button", { class: "icon", title: "Subir", onclick: () => move(data.categorias, ci, -1) }, "↑"),
      el("button", { class: "icon", title: "Descer", onclick: () => move(data.categorias, ci, 1) }, "↓"),
      el("button", { class: "icon", title: "Excluir categoria", onclick: () => {
        if (confirm(`Excluir a categoria ${cat.nome}?`)) { data.categorias.splice(ci, 1); renderEditor(); changed(); } } }, "✕"),
    );
    const list = el("div");
    cat.itens.forEach((it, ii) => {
      const row = el("div", { class: "item" + (it.ativo ? "" : " off") },
        el("input", { type: "checkbox", checked: !!it.ativo, "aria-label": "Disponível hoje",
          onchange: (e) => { it.ativo = e.target.checked; row.classList.toggle("off", !it.ativo); changed(); } }),
        el("input", { class: "name", type: "text", value: it.nome, oninput: (e) => { it.nome = e.target.value; changed(); } }),
        el("span", { class: "rs" }, "R$"),
        el("input", { type: "number", inputmode: "decimal", step: "0.5", min: "0", value: it.preco,
          oninput: (e) => { it.preco = e.target.value === "" ? "" : Number(e.target.value); changed(); } }),
        el("button", { class: "icon", title: "Excluir item", onclick: () => {
          if (confirm(`Excluir ${it.nome}?`)) { cat.itens.splice(ii, 1); renderEditor(); changed(); } } }, "✕"),
      );
      list.append(row);
    });
    const add = el("button", { class: "ghost", style: "margin-top:8px", onclick: () => {
      const nome = prompt(`Novo item em ${cat.nome}:`); if (!nome) return;
      const preco = Number(String(prompt("Preço (R$):", "12")).replace(",", "."));
      cat.itens.push({ nome: nome.trim(), preco: isNaN(preco) ? "" : preco, ativo: true }); renderEditor(); changed();
    } }, "+ item");
    box.append(el("div", { class: "cat" }, head, list, add));
  });
}

function move(arr, i, d) {
  const j = i + d; if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]]; renderEditor(); changed();
}

let t = null;
function changed() { save(); clearTimeout(t); t = setTimeout(draw, 60); }

// ---------- arte ----------
function price(p) {
  if (p === "" || p == null || isNaN(p)) return "";
  return "R$ " + (Number.isInteger(p) ? p : p.toFixed(2).replace(".", ","));
}

function fitText(text, font, size, maxW, weight = "400") {
  let s = size;
  ctx.font = `${weight} ${s}px ${font}`;
  while (ctx.measureText(text).width > maxW && s > 18) { s -= 1; ctx.font = `${weight} ${s}px ${font}`; }
  return s;
}

function draw() {
  const iso = $("#date").value || todayISO();
  const cats = data.categorias
    .map((c) => ({ ...c, itens: c.itens.filter((i) => i.ativo && i.nome.trim()) }))
    .filter((c) => c.itens.length);

  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // moldura histórica: topo, esquerda e base, aberta à direita
  ctx.strokeStyle = C.olive; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(W, 42); ctx.lineTo(48, 42); ctx.lineTo(48, 1878); ctx.lineTo(W, 1878); ctx.stroke();

  ctx.fillStyle = C.wine; ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.font = `400 92px ${F.title}`; ctx.fillText("CARDÁPIO", W / 2, 125);
  ctx.font = `400 58px ${F.date}`; ctx.fillText(ddmm(iso), W / 2, 238);

  // tabela com escala automática para caber qualquer quantidade de itens
  const top = 360, bottom = 1560, L = 100, R = 962;
  const rows = cats.reduce((n, c) => n + c.itens.length, 0);
  const baseH = cats.length * 74 + rows * 58 + Math.max(0, cats.length - 1) * 34;
  const k = Math.max(0.55, Math.min(1.2, (bottom - top) / Math.max(baseH, 1)));
  const head = 74 * k, row = 58 * k, gap = 34 * k;
  const used = cats.length * head + rows * row + Math.max(0, cats.length - 1) * gap;
  let y = top + Math.max(0, (bottom - top - used) / 2);

  for (const c of cats) {
    ctx.textAlign = "left"; ctx.fillStyle = C.wine; ctx.font = `400 ${32 * k}px ${F.title}`;
    ctx.fillText(c.nome, L, y);
    if (c.etiqueta) {
      const w = ctx.measureText(c.nome).width;
      ctx.fillStyle = C.olive; ctx.font = `600 ${19 * k}px ${F.sans}`;
      ctx.fillText(c.etiqueta.split("").join(String.fromCharCode(8202)), L + w + 18 * k, y + 9 * k);
    }
    ctx.textAlign = "right"; ctx.fillStyle = C.wine; ctx.font = `400 ${26 * k}px ${F.title}`;
    ctx.fillText("PREÇO", R, y + 3 * k);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(L, y + 52 * k + 0.5); ctx.lineTo(R, y + 52 * k + 0.5); ctx.stroke();
    let ry = y + head;
    for (const it of c.itens) {
      const p = price(it.preco);
      ctx.font = `400 ${32 * k}px ${F.sans}`; const pw = ctx.measureText(p).width;
      ctx.fillStyle = C.ink; ctx.textAlign = "left";
      const s = fitText(it.nome, F.sans, 32 * k, R - L - pw - 40);
      ctx.fillText(it.nome, L, ry + (32 * k - s) / 2);
      ctx.textAlign = "right"; ctx.font = `400 ${32 * k}px ${F.sans}`; ctx.fillText(p, R, ry);
      ry += row;
    }
    y = ry + gap;
  }

  if (!cats.length) {
    ctx.textAlign = "center"; ctx.fillStyle = "#9b958c"; ctx.font = `300 34px ${F.sans}`;
    ctx.fillText("marque os itens de hoje", W / 2, 900);
  }

  // assinatura: dois quebra-nozes + @
  if (logo.complete && logo.naturalWidth) {
    const lw = 190, lh = (logo.naturalHeight / logo.naturalWidth) * lw;
    ctx.drawImage(logo, (W - lw) / 2, 1605, lw, lh);
  }
  ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = `500 27px ${F.sans}`;
  ctx.fillText("@quebra_nozesdoceria", W / 2, 1838);

  $("#status").textContent = `${rows} ${rows === 1 ? "item" : "itens"} · ${ddmm(iso)}`;
}

// ---------- exportar ----------
function blob() { return new Promise((r) => cv.toBlob(r, "image/png")); }
function fileName() { return `cardapio-${$("#date").value || todayISO()}.png`; }

$("#download").onclick = async () => {
  draw();
  const b = await blob(), a = document.createElement("a");
  a.href = URL.createObjectURL(b); a.download = fileName(); a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};

if (navigator.canShare && navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] })) {
  $("#share").hidden = false;
  $("#share").onclick = async () => {
    draw();
    const f = new File([await blob()], fileName(), { type: "image/png" });
    try { await navigator.share({ files: [f] }); } catch (e) { /* cancelado */ }
  };
}

$("#addCat").onclick = () => {
  const nome = prompt("Nome da nova categoria (ex.: TORTAS):"); if (!nome) return;
  data.categorias.push({ nome: nome.trim().toUpperCase(), etiqueta: "", itens: [] }); renderEditor(); changed();
};
$("#selectAll").onclick = () => { data.categorias.forEach((c) => c.itens.forEach((i) => (i.ativo = true))); renderEditor(); changed(); };
$("#selectNone").onclick = () => { data.categorias.forEach((c) => c.itens.forEach((i) => (i.ativo = false))); renderEditor(); changed(); };
$("#exportJson").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = "catalogo.json"; a.click();
};
$("#importBtn").onclick = () => $("#importFile").click();
$("#importFile").onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try { const d = JSON.parse(await f.text()); if (!Array.isArray(d.categorias)) throw 0; data = d; renderEditor(); changed(); }
  catch { alert("Arquivo inválido."); }
};
$("#reset").onclick = async () => {
  if (!confirm("Descartar as alterações deste aparelho e voltar ao catálogo padrão?")) return;
  localStorage.removeItem(KEY); await load(); renderEditor(); draw();
};
$("#date").onchange = draw;

// ---------- início ----------
(async () => {
  $("#date").value = todayISO();
  await load();
  renderEditor();
  await Promise.all([
    document.fonts.load(`400 92px ${F.title}`),
    document.fonts.load(`400 58px ${F.date}`),
    document.fonts.load(`400 32px ${F.sans}`),
    document.fonts.load(`500 27px ${F.sans}`),
    document.fonts.load(`600 19px ${F.sans}`),
    new Promise((r) => (logo.complete ? r() : (logo.onload = logo.onerror = r))),
  ]).catch(() => {});
  draw();
})();
