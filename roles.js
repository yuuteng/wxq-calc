(function(){
  const LORDS_URL = "https://game.gtimg.cn/images/amside/ide_timer/589094_oscard_new_16.js";
  const CMS_URL = "https://vasd-cms.qq.com/cms/osgamewsq/prod/api/v1/osgamewsqwsq_info_article_3019.json?ts=";
  const SNAPSHOT = "data/cards-snapshot.json";
  const DEFAULT_ICON = "img/role/list-con-nav-img.png";
  const DEFAULT_CARD = "img/role/list-con-info.png";

  const $ = (sel, root) => (root||document).querySelector(sel);
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const rich = d => esc(d)
    .replace(/&lt;color\s*=\s*([^&]+?)&gt;/gi, "<span>").replace(/&lt;\/color\s*&gt;/gi, "</span>")
    .replace(/&lt;a href=\d+&gt;/gi, '<span class="kw">').replace(/&lt;\/a&gt;/gi, "</span>")
    .replace(/&lt;(\/?b)&gt;/gi, "<$1>").replace(/\n/g, "<br>");

  const L = u => (u && window.wxqMirror && window.wxqMirror[u]) || u;
  const imgAttrs = (u, fb) => { const l = L(u); return `src="${esc(l)}" onerror="${l !== u ? `this.src='${esc(u)}';this.onerror=function(){this.onerror=null;this.src='${fb}'}` : `this.onerror=null;this.src='${fb}'`}"`; };

  const root = $("#roles");
  root.innerHTML = `
    <div class="roles-head"><b>棋手图鉴</b><small>LORDS</small></div>
    <div class="roles-nav" id="rolesNav"><div class="rp-empty">正在加载棋手数据…</div></div>
    <div class="roles-body" id="rolesBody"></div>
    <div class="roles-note" id="rolesNote"></div>`;

  const state = {cur:null, talent:0, card:0, more:false};
  let lords = [], cms = {};
  let audio = null;

  function fetchJSON(url, ms){
    const ctl = new AbortController(); const t = setTimeout(()=>ctl.abort(), ms||8000);
    return fetch(url, {signal:ctl.signal}).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); }).finally(()=>clearTimeout(t));
  }
  function load(){
    const lordsP = fetchJSON(LORDS_URL).then(d => d.lords||[]).catch(err =>
      fetchJSON(SNAPSHOT, 15000).then(s => { $("#rolesNote").textContent = `官方棋手数据暂时拉不到(${err.message}),当前显示 ${s.snapshotDate} 的快照。`; return s.lords||[]; }));
    const cmsP = fetchJSON(CMS_URL + Math.floor(Date.now()/10000)).then(d => d.data||[]).catch(()=>fetchJSON(SNAPSHOT, 15000).then(s => s.cms||[]).catch(()=>[]));
    return Promise.all([lordsP, cmsP]).then(([l, c]) => {
      lords = l;
      for (const r of c) cms[String(r.uid)] = r;
    });
  }

  const cur = () => lords.find(l => l.lordId === state.cur);
  const cmsOf = l => cms[String(l.lordId)] || {};
  const pick = (o, path) => path.split(".").reduce((a,k)=> a && a[k], o);

  function renderNav(){
    $("#rolesNav").innerHTML = lords.map(l =>
      `<a data-id="${l.lordId}" class="${l.lordId===state.cur?"on":""}"><i><img ${imgAttrs(l.avatar||l.icon, DEFAULT_ICON)} alt=""></i>${esc(l.name)}</a>`).join("");
  }
  function navIcons(list, idx, cls){
    return list.map((x,i) => `<a data-i="${i}" class="${i===idx?"on":""}${cls?" "+cls:""}"><i><img ${imgAttrs(x.icon||x.thumb||"", DEFAULT_ICON)} alt=""></i>${esc(x.name)}</a>`).join("");
  }
  function info(card){
    if (!card) return `<div class="rp-empty">暂无数据</div>`;
    return `<div class="rp-info"><img class="rp-card" src="${esc(card.cardImage||DEFAULT_CARD)}" alt="" data-name="${esc(card.name)}" onerror="this.onerror=null;this.src='${DEFAULT_CARD}'">
      <div class="rp-info-text"><p>${esc(card.name)}</p>${rich(card.desc)}</div></div>`;
  }
  function renderBody(){
    const l = cur(); if (!l){ $("#rolesBody").innerHTML = ""; return; }
    const c = cmsOf(l);
    const line = pick(c, "basicInfo.line_text") || "";
    const voice = pick(c, "basicInfo.lines.0.url") || "";
    const en = pick(c, "homepageInfo.en_name") || "";
    const talents = l.talent || [];
    const t = talents[state.talent] || talents[0];
    const related = l.relatedCards || [];
    const rc = related[state.card] || related[0];
    const MAX = 6;
    const showMore = related.length > MAX + 1;
    const visible = showMore ? related.slice(0, MAX) : related;
    $("#rolesBody").innerHTML = `
      <div class="roles-portrait">
        <img class="rp-img" ${imgAttrs(l.portraitV2||l.banShenImg||l.icon, esc(l.banShenImg||l.icon))} alt="">
        <h3>${esc(l.name)}</h3>${en ? `<div class="rp-en">${esc(en)}</div>` : ""}
        ${line ? `<div class="rp-line">${esc(line)}</div>` : ""}
        ${voice ? `<a class="rp-voice" data-voice="${esc(voice)}">▶ 听台词</a>` : ""}
      </div>
      <div class="roles-panels">
        <div class="rpanel">
          <div class="rpanel-ti"><span>能力介绍</span><img src="img/role/list-con-ti-img.png" alt=""></div>
          <div class="rpanel-box">
            ${talents.length ? `<div class="rp-nav" id="talentNav">${navIcons(talents, talents.indexOf(t))}</div>${info(t && t.cards && t.cards[0])}` : `<div class="rp-empty">暂无能力数据</div>`}
          </div>
        </div>
        <div class="rpanel">
          <div class="rpanel-ti"><span>关联卡牌</span><img src="img/role/list-con-ti-img2.png" alt=""></div>
          <div class="rpanel-box">
            ${related.length ? `<div class="rp-nav" id="cardNav">${navIcons(visible, related.indexOf(rc))}${showMore ? `<a class="rp-more"><i><img src="img/role/role_icon1_3.png" alt=""></i>更多</a>` : ""}
              ${showMore ? `<div class="rp-more-list ${state.more?"on":""}" id="cardMore">${navIcons(related, related.indexOf(rc))}<a class="rp-more-close"></a></div>` : ""}</div>${info(rc)}` : `<div class="rp-empty">暂无关联卡牌</div>`}
          </div>
        </div>
      </div>`;
  }
  function render(){ renderNav(); renderBody(); }

  $("#rolesNav").addEventListener("click", e => {
    const a = e.target.closest("a[data-id]"); if (!a) return;
    state.cur = +a.dataset.id; state.talent = 0; state.card = 0; state.more = false;
    stopVoice(); render();
  });
  $("#rolesBody").addEventListener("click", e => {
    const more = e.target.closest(".rp-more"); if (more){ state.more = true; renderBody(); return; }
    const close = e.target.closest(".rp-more-close"); if (close){ state.more = false; renderBody(); return; }
    const t = e.target.closest("#talentNav a[data-i]"); if (t){ state.talent = +t.dataset.i; renderBody(); return; }
    const c = e.target.closest("#cardNav a[data-i], #cardMore a[data-i]"); if (c){ state.card = +c.dataset.i; state.more = false; renderBody(); return; }
    const img = e.target.closest(".rp-card"); if (img && window.wxqLightbox){ window.wxqLightbox(img.src, img.dataset.name); return; }
    const v = e.target.closest(".rp-voice"); if (v){ toggleVoice(v); }
  });
  function stopVoice(){ if (audio){ audio.pause(); audio = null; } }
  function toggleVoice(el){
    if (audio){ stopVoice(); el.classList.remove("playing"); return; }
    audio = new Audio(el.dataset.voice); el.classList.add("playing");
    audio.onended = audio.onerror = () => { el.classList.remove("playing"); audio = null; };
    audio.play().catch(()=>{ el.classList.remove("playing"); audio = null; });
  }

  const mirrorReady = window.wxqMirror ? Promise.resolve() : fetch("data/mirror.json").then(r=>r.json()).then(m=>{ if(!window.wxqMirror) window.wxqMirror = m; }).catch(()=>{});
  Promise.all([load(), mirrorReady]).then(() => {
    if (!lords.length){ $("#rolesNav").innerHTML = '<div class="rp-empty">没有棋手数据</div>'; return; }
    state.cur = lords[0].lordId;
    render();
    if (window.wxqPrefetch){
      const urls = [];
      for (const l of lords){ urls.push(L(l.portraitV2||l.banShenImg)); for (const t of l.talent||[]) urls.push(L(t.icon)); }
      window.wxqPrefetch(urls.filter(Boolean));
    }
  }).catch(err => { $("#rolesNav").innerHTML = `<div class="rp-empty">棋手数据加载失败:${esc(err.message)}</div>`; });
})();
