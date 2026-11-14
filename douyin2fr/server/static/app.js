"use strict";
const $ = (s, el = document) => el.querySelector(s);
const STATUS = {
  queued: "En attente d'analyse", analyzing: "Analyse…", analyzed: "Analysée — prête",
  queued_clean: "En attente de nettoyage", cleaning: "Nettoyage…", done: "Terminée",
  error: "Erreur", cancelled: "Annulée",
};
const RUNNING = new Set(["analyzing", "cleaning"]);
let token = new URLSearchParams(location.search).get("token") || localStorageGet("d2f_token") || "";
let jobs = [], selected = null, methods = {}, resolutions = {}, paused = false, renderedKey = "";

function localStorageGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function localStorageSet(k, v) { try { localStorage.setItem(k, v); } catch {} }

async function api(path, opts = {}) {
  opts.headers = Object.assign({}, opts.headers, token ? { "x-token": token } : {});
  const r = await fetch(path, opts);
  if (r.status === 401) {
    token = prompt("Jeton d'accès :") || "";
    localStorageSet("d2f_token", token);
    return api(path, opts);
  }
  if (!r.ok) {
    let msg = r.statusText;
    try { msg = (await r.json()).detail || msg; } catch {}
    throw new Error(msg);
  }
  return r.json();
}
const withTok = (u) => token ? u + (u.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token) : u;
const fmtT = (s) => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

async function init() {
  const cfg = await api("/api/config");
  methods = cfg.methods;
  const sel = $("#methodSel");
  for (const [k, v] of Object.entries(methods)) sel.add(new Option(v, k));
  sel.value = localStorageGet("d2f_method") || "temporal";
  sel.onchange = () => localStorageSet("d2f_method", sel.value);
  resolutions = cfg.resolutions;
  const rs = $("#resSel");
  for (const [k, v] of Object.entries(resolutions)) rs.add(new Option(v, k));
  rs.value = localStorageGet("d2f_res") || "auto";
  rs.onchange = () => localStorageSet("d2f_res", rs.value);
  const dv = cfg.device || {};
  $("#devState").textContent = dv.gpu ? "GPU" : `CPU · ${dv.cpu_threads || "?"} cœurs`;
  $("#maxDur").textContent = Math.round(cfg.max_duration_s / 60) + " min";
  $("#pauseBtn").onclick = async () => {
    const r = await api(`/api/queue/${paused ? "resume" : "pause"}`, { method: "POST" });
    paused = r.paused; renderQueue();
  };
  const drop = $("#drop"), input = $("#fileInput");
  input.onchange = () => upload(input.files);
  ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", ev => upload(ev.dataTransfer.files));
  poll();
  setInterval(poll, 1000);
}

function uploadXHR(fd, onProgress) {
  // XMLHttpRequest plutôt que fetch : seul moyen d'avoir la progression d'envoi (utile en 4G/5G).
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", "/api/jobs");
    if (token) x.setRequestHeader("x-token", token);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    x.onload = () => {
      let body = {};
      try { body = JSON.parse(x.responseText); } catch {}
      if (x.status === 401) { token = prompt("Jeton d'accès :") || ""; localStorageSet("d2f_token", token); return reject(new Error("Jeton requis, réessayez.")); }
      x.status < 300 ? resolve(body) : reject(new Error(body.detail || x.statusText || "Erreur réseau"));
    };
    x.onerror = () => reject(new Error("Connexion interrompue pendant l'envoi."));
    x.send(fd);
  });
}

async function upload(files) {
  if (!files || !files.length) return;
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  fd.append("method", $("#methodSel").value);
  fd.append("auto_clean", $("#autoClean").checked);
  fd.append("resolution", $("#resSel").value);
  const drop = $("#drop"), label = drop.querySelector("b"), bar = $("#upBar");
  const mb = [...files].reduce((a, f) => a + f.size, 0) / 1048576;
  drop.classList.add("busy"); bar.parentElement.classList.remove("hidden");
  try {
    const r = await uploadXHR(fd, (p) => {
      bar.style.width = (p * 100).toFixed(1) + "%";
      label.textContent = p < 1 ? `Envoi… ${Math.round(p * 100)} % (${mb.toFixed(0)} Mo)` : "Vérification de la vidéo…";
    });
    if (r.jobs && r.jobs.length) { selected = r.jobs[0].id; renderedKey = ""; showDetailOnMobile(); }
    if (r.errors && r.errors.length) alert("Vidéo(s) refusée(s) :\n" + r.errors.join("\n"));
  } catch (e) { alert("Import impossible : " + e.message); }
  drop.classList.remove("busy"); bar.parentElement.classList.add("hidden"); bar.style.width = "0";
  label.textContent = "Importer des vidéos";
  $("#fileInput").value = "";
  poll();
}

function showDetailOnMobile() {
  if (window.matchMedia("(max-width: 860px)").matches) setTimeout(() => $("#detail").scrollIntoView({ behavior: "smooth" }), 150);
}

async function poll() {
  try {
    const r = await api("/api/jobs");
    jobs = r.jobs; paused = r.paused;
  } catch { return; }
  renderQueue(); renderList(); renderDetail();
}

function renderQueue() {
  const st = $("#queueState");
  st.textContent = paused ? "File en pause" : "File active";
  st.classList.toggle("paused", paused);
  $("#pauseBtn").textContent = paused ? "Reprendre" : "Mettre en pause";
}

function statusClass(s) { return s === "done" ? "st-done" : s === "error" ? "st-error" : RUNNING.has(s) ? "st-run" : ""; }

function renderList() {
  const ul = $("#jobList");
  $("#count").textContent = jobs.length ? `${jobs.length}` : "";
  ul.innerHTML = "";
  for (const j of jobs) {
    const li = document.createElement("li");
    li.className = "job" + (j.id === selected ? " sel" : "");
    const pct = RUNNING.has(j.status) ? Math.round(j.progress * 100) : j.status === "done" ? 100 : 0;
    li.innerHTML = `<div class="n"></div><div class="s"><span class="${statusClass(j.status)}">${STATUS[j.status] || j.status}</span><span>${RUNNING.has(j.status) ? pct + " %" : (j.info.duration ? fmtT(j.info.duration) : "")}</span></div>` +
      (RUNNING.has(j.status) ? `<div class="mini"><div style="width:${pct}%"></div></div>` : "");
    li.querySelector(".n").textContent = j.name;
    li.onclick = () => { selected = j.id; renderedKey = ""; renderList(); renderDetail(); showDetailOnMobile(); };
    ul.appendChild(li);
  }
}

function renderDetail() {
  const j = jobs.find(x => x.id === selected);
  const box = $("#detail");
  if (!j) { if (selected) { selected = null; location.reload(); } return; }
  const key = `${j.id}|${j.status}|${j.previews.length}`;
  if (key !== renderedKey) {
    renderedKey = key;
    box.innerHTML = "";
    box.appendChild($("#detailTpl").content.cloneNode(true));
    buildDetail(j);
  }
  updateProgress(j);
}

function buildDetail(j) {
  $(".d-name").textContent = j.name;
  const i = j.info || {};
  $(".d-meta").textContent = i.width ? `${i.width}×${i.height} · ${i.fps} i/s · ${fmtT(i.duration)} · ${i.audio ? "avec son" : "sans son"}` : "";
  const act = $(".d-actions");
  const btn = (label, cls, fn) => { const b = document.createElement("button"); b.className = "btn " + cls; b.textContent = label; b.onclick = fn; act.appendChild(b); return b; };

  if (["analyzed", "done", "cancelled", "error"].includes(j.status) && j.summary && j.summary.keyframes) {
    const sel = document.createElement("select");
    for (const [k, v] of Object.entries(methods)) sel.add(new Option(v, k));
    sel.value = j.method;
    act.appendChild(sel);
    const rsel = document.createElement("select");
    for (const [k, v] of Object.entries(resolutions)) rsel.add(new Option("Export : " + v, k));
    rsel.value = j.resolution || "auto";
    act.appendChild(rsel);
    btn(j.status === "done" ? "Relancer le nettoyage" : "Supprimer les sous-titres chinois", "primary", async () => {
      const fd = new FormData(); fd.append("method", sel.value); fd.append("resolution", rsel.value);
      try { await api(`/api/jobs/${j.id}/clean`, { method: "POST", body: fd }); poll(); } catch (e) { alert(e.message); }
    });
  }
  if (j.status === "done") {
    const a = document.createElement("a");
    a.className = "btn"; a.textContent = "⬇ Télécharger le MP4"; a.href = withTok(`/api/jobs/${j.id}/result?download=1`);
    act.appendChild(a);
  }
  if (RUNNING.has(j.status) || j.status.startsWith("queued")) btn("Annuler", "ghost", () => api(`/api/jobs/${j.id}/cancel`, { method: "POST" }).then(poll));
  btn("Supprimer", "ghost danger", async () => {
    if (!confirm("Supprimer cette vidéo et ses résultats ?")) return;
    await api(`/api/jobs/${j.id}`, { method: "DELETE" }); selected = null; renderedKey = ""; poll();
    $("#detail").innerHTML = "";
  });

  if (j.error) { const e = $(".err"); e.textContent = j.error; e.classList.remove("hidden"); }

  if (j.summary && j.summary.keyframes) {
    $(".analysis-card").classList.remove("hidden");
    const n = j.summary.lines.length;
    $(".a-sum").textContent = `${n} ligne(s) de texte chinois · présentes sur ${j.summary.frames_with_text} % des images`;
    const th = $(".thumbs");
    for (const p of j.previews) {
      const img = document.createElement("img");
      img.src = withTok(`/api/jobs/${j.id}/preview/${p}`); img.loading = "lazy";
      img.onclick = () => lightbox(img.src);
      th.appendChild(img);
    }
    const ul = $(".lines ul");
    for (const l of j.summary.lines) { const li = document.createElement("li"); li.textContent = `${fmtT(l.t)}  ${l.text}`; ul.appendChild(li); }
  }

  if (j.status === "done") {
    buildCompare(j);
    const s = j.stats || {};
    const tot = s.px_total || 0;
    const items = [
      ["Temps de nettoyage", (j.timings.clean_s || s.seconds || 0) + " s"],
      ["Moteur", s.method || ""],
      ["Export", s.output_size || ""],
    ];
    if (tot) {
      items.push(["Arrière-plan réel récupéré", Math.round(100 * s.px_direct / tot) + " %"]);
      items.push(["Propagé dans le temps", Math.round(100 * (tot - s.px_direct - s.px_model) / tot) + " %"]);
      items.push(["Créé par l'IA (LaMa)", (100 * s.px_model / tot).toFixed(1) + " %"]);
    }
    const box = $(".stats");
    for (const [k, v] of items) { const d = document.createElement("div"); d.className = "stat"; d.innerHTML = `<span class="small muted"></span><b></b>`; d.querySelector("span").textContent = k; d.querySelector("b").textContent = v; box.appendChild(d); }
    $(".stats-card").classList.remove("hidden");
  }
}

function updateProgress(j) {
  const w = $(".progress-wrap");
  if (!w) return;
  const show = RUNNING.has(j.status) || j.status.startsWith("queued");
  w.classList.toggle("hidden", !show);
  if (!show) return;
  const pct = RUNNING.has(j.status) ? j.progress * 100 : 0;
  $(".bar").style.width = pct.toFixed(1) + "%";
  $(".p-pct").textContent = RUNNING.has(j.status) ? pct.toFixed(1) + " %" : "";
  $(".p-stage").textContent = STATUS[j.status] + (j.message && RUNNING.has(j.status) ? " — " + j.message : "") + (paused && j.status.startsWith("queued") ? " (file en pause)" : "");
}

function buildCompare(j) {
  const card = $(".compare-card");
  card.classList.remove("hidden");
  const vb = $(".v-before"), va = $(".v-after"), cmp = $(".compare"), stage = $(".stage");
  vb.src = withTok(`/api/jobs/${j.id}/original`);
  va.src = withTok(`/api/jobs/${j.id}/result`);
  const clip = $(".before-clip"), handle = $(".handle");
  const setPos = (x) => {
    const r = stage.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (x - r.left) / r.width));
    clip.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    handle.style.left = p * 100 + "%";
  };
  let drag = false;
  stage.addEventListener("pointerdown", e => { if (cmp.classList.contains("split")) { drag = true; setPos(e.clientX); stage.setPointerCapture(e.pointerId); } });
  stage.addEventListener("pointermove", e => drag && setPos(e.clientX));
  stage.addEventListener("pointerup", () => drag = false);
  card.querySelectorAll(".seg button").forEach(b => b.onclick = () => {
    card.querySelectorAll(".seg button").forEach(x => x.classList.toggle("on", x === b));
    cmp.className = "compare " + b.dataset.v;
  });
  const play = $(".play"), seek = $(".seek"), time = $(".time"), sound = $(".sound");
  const sync = () => { if (Math.abs(vb.currentTime - va.currentTime) > 0.05) vb.currentTime = va.currentTime; };
  play.onclick = () => {
    if (va.paused) { sync(); va.play(); vb.play(); play.textContent = "❚❚ Pause"; }
    else { va.pause(); vb.pause(); sync(); play.textContent = "▶ Lecture"; }
  };
  va.ontimeupdate = () => {
    seek.value = va.duration ? (va.currentTime / va.duration) * 1000 : 0;
    time.textContent = fmtT(va.currentTime) + " / " + fmtT(va.duration);
    if (!va.paused) sync();
  };
  va.onended = () => { vb.pause(); play.textContent = "▶ Lecture"; };
  seek.oninput = () => { if (va.duration) { va.currentTime = vb.currentTime = (seek.value / 1000) * va.duration; } };
  sound.onchange = () => { va.muted = !sound.checked; };
}

function lightbox(src) {
  const d = document.createElement("div");
  d.className = "lightbox"; d.innerHTML = `<img alt="">`; d.querySelector("img").src = src;
  d.onclick = () => d.remove(); document.body.appendChild(d);
}

init();
