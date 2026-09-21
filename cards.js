(function(){
  const OFFICIAL = "https://game.gtimg.cn/images/amside/ide_timer/589094_oscard_new";
  const ICON = "https://game.gtimg.cn/images/osgame/cp/a20260707sfgw/card";
  const SNAPSHOT = "data/cards-snapshot.json";

  const NAVS = [
    {nav:1, key:"heroCards",   name:"英雄牌", cls:"cards-yx", shape:"desc-img2"},
    {nav:2, key:"talentCards", name:"天赋牌", cls:"cards-tf", shape:"desc-img"},
    {nav:3, key:"equipCards",  name:"装备牌", cls:"cards-zb", shape:"desc-img"},
    {nav:4, key:"effectCards", name:"效果牌", cls:"cards-xg", shape:"desc-img3"},
  ];
  const SHAPE_BY_TYPE = {1:"desc-img2", 2:"desc-img3", 5:"desc-img", 6:"desc-img", 9:"desc-img2"};
  const FACTIONS = [
    {id:321, name:"大河流域", icon:"Icon_DaHeLiuYu"},
    {id:320, name:"逐鹿",     icon:"Icon_ZhuLu"},
    {id:309, name:"三分之地", icon:"Icon_SanFenZhiDi"},
    {id:319, name:"河洛",     icon:"Icon_HeLuo"},
    {id:314, name:"日落海",   icon:"Icon_RiLuoHai"},
    {id:307, name:"无阵营",   icon:"wuzhenyin"},
  ];
  const KEYWORDS = [
    {id:5,   name:"败阵", icon:"baizhen",   mark:"英雄上阵期间若战斗失败，触发效果。"},
    {id:1,   name:"登场", icon:"dengchang", mark:"使用此卡牌后，触发效果。"},
    {id:16,  name:"复生", icon:"fusheng",   mark:"英雄在阵亡后会复活，并恢复50%生命值。"},
    {id:13,  name:"合成", icon:"hecheng",   mark:"英雄上阵期间若战斗胜利，触发效果。"},
    {id:3,   name:"开团", icon:"jiaofeng",  mark:"战斗开始时，触发效果。"},
    {id:4,   name:"凯旋", icon:"kaixuan",   mark:"英雄上阵期间若战斗胜利，触发效果。"},
    {id:100, name:"闪现", icon:"shanxian",  mark:"战斗开始时，英雄会跳跃至敌方战场的镜像位置。"},
    {id:200, name:"夺取", icon:"sheling",   mark:"使用此卡牌时，夺取周围1格随机1名己方英雄的等级(最多10级，不包含临时等级)。"},
    {id:321, name:"图腾", icon:"tuteng",    mark:"大河流域阵营专属单位，存活时提供特殊效果。"},
    {id:10,  name:"牺牲", icon:"xisheng",   mark:"英雄阵亡时，触发效果。"},
    {id:11,  name:"整备", icon:"zhengbei",  mark:"回合开始时，触发效果。"},
    {id:9,   name:"退场", icon:"tuichang",  mark:"场上的此英雄被出售时，触发效果。"},
  ];
  const tiers = n => Array.from({length:n}, (_,i)=>({id:i+1, name:(i+1)+"阶"}));
  const CATEGORIES = {
    1: [
      {row:1, name:"阵营",   list:FACTIONS,  get:c => [c.relationID]},
      {row:2, name:"关键词", list:KEYWORDS,  get:c => ((c.heroCard||{}).keywordDescriptionIDList||[]).filter(Boolean)},
      {row:3, name:"品阶",   list:tiers(5),  get:c => [c.quality]},
    ],
    2: [
      {row:1, name:"品阶", list:tiers(3), get:c => [c.quality]},
      {row:2, name:"解锁", list:[
        {id:1, name:"初始天赋", mark:"初始解锁"},
        {id:2, name:"天赋包一", mark:"万象大赛达到倔强青铜Ⅳ解锁"},
        {id:3, name:"天赋包二", mark:"万象大赛达到倔强青铜Ⅱ解锁"},
        {id:4, name:"天赋包三", mark:"万象大赛达到秩序白银Ⅴ解锁"},
      ], get:c => [(c.talentCard||{}).grpID]},
    ],
    3: [
      {row:1, name:"相关", list:[
        {id:16, name:"基础装备", mark:"使用以合成普通装备"},
        {id:4,  name:"普通装备", mark:"由基础装备合成的通用装备"},
        {id:5,  name:"特殊装备", mark:"达成特定条件产出的强力装备"},
        {id:15, name:"天赋装备", mark:"棋手升级概率可选择的装备"},
      ], get:c => [(c.equipCard||{}).atlasSubType]},
      {row:2, name:"类型", list:[
        {id:7, name:"防御装备"}, {id:2, name:"法术装备"}, {id:3, name:"通用装备"}, {id:1, name:"物理装备"},
      ], get:c => [(c.equipCard||{}).equipTypeID]},
    ],
    4: [
      {row:1, name:"品阶", list:tiers(6), get:c => [c.quality]},
      {row:2, name:"卡牌类型", list:[{id:0, name:"通用"}].concat(FACTIONS.map(f=>({id:f.id, name:f.name, icon:f.icon}))), get:c => [c.relationID]},
      {row:3, name:"解锁", list:[
        {id:1, name:"初始效果卡", mark:"初始解锁"},
        {id:2, name:"效果卡包一", mark:"万象大赛达到倔强青铜Ⅳ解锁"},
        {id:3, name:"效果卡包二", mark:"万象大赛达到秩序白银Ⅴ解锁"},
        {id:4, name:"效果卡包三"},
        {id:5, name:"效果卡包四"},
      ], get:c => [(c.effectCard||{}).grpID]},
    ],
  };
  const PROPS = [
    ["最大生命值", p=>p.HP], ["法力值", p=>p.initEnergy+"/"+p.energy],
    ["物理攻击力", p=>p.phyAttack], ["法术攻击力", p=>p.magAttack],
    ["物理防御", p=>p.phyDefense], ["法术防御", p=>p.magDefense],
    ["暴击率", p=>(p.criticalRate/100)+"%"], ["暴击效果", p=>((1+p.criticalEffect/10000)*100)+"%"],
    ["攻速", p=>p.attackSpeed/10000], ["攻击距离", p=>p.attackDistance],
  ];

  const $ = (sel, root) => (root||document).querySelector(sel);
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function rich(desc){
    return esc(desc)
      .replace(/&lt;color\s*=\s*([^&]+?)&gt;/gi, '<span style="color:$1">')
      .replace(/&lt;\/color\s*&gt;/gi, "</span>")
      .replace(/&lt;a href=\d+&gt;/gi, '<span class="kw">')
      .replace(/&lt;\/a&gt;/gi, "</span>")
      .replace(/&lt;(\/?b)&gt;/gi, "<$1>")
      .replace(/\n/g, "<br>");
  }

  const data = {};
  const state = {nav:1, row:{}, id:{}, cur:{}, q:""};
  try{ const s = JSON.parse(localStorage.getItem("wxq-cards")||"{}"); if (NAVS.some(n=>n.nav===s.nav)) state.nav = s.nav; }catch(e){}
  function save(){ try{ localStorage.setItem("wxq-cards", JSON.stringify({nav:state.nav})); }catch(e){} }

  const root = $("#gallery");
  root.innerHTML = `
    <div class="cards-head">
      <div class="cards-title"><b>卡牌图鉴</b><small>COMPENDIUM</small></div>
      <div class="cards-search"><input id="cardsSearch" type="search" placeholder="请输入你想搜索的卡牌名" autocomplete="off"><a id="cardsSearchBtn" aria-label="搜索"></a></div>
    </div>
    <div class="card-tab" id="cardTabs">${NAVS.map(n=>`<a data-nav="${n.nav}" title="${n.name}">${n.name}</a>`).join("")}</div>
    <div class="cards-body">
      <div class="cards-left">
        <div class="cards-l-top" id="cardsFilters"></div>
        <div class="cards-l-list" id="cardsList"><div class="cards-err">正在加载官方卡牌数据…</div></div>
      </div>
      <div class="cards-right" id="cardsRight"></div>
    </div>
    <div class="cards-note" id="cardsNote"></div>
    <div class="cards-src">数据与图片来自 <a href="https://wxq.qq.com/cp/a20260707sfgw/index.html#page4" target="_blank" rel="noopener">王者万象棋官网</a>,页面加载时实时读取</div>
    <div class="cards-lightbox" id="cardsLightbox"><img alt=""><p></p></div>`;

  const lb = $("#cardsLightbox");
  lb.addEventListener("click", ()=> lb.classList.remove("on"));
  function lightbox(src, name){ $("img", lb).src = src; $("p", lb).textContent = name||""; lb.classList.add("on"); }
  window.wxqLightbox = lightbox;

  // 空闲时后台预取图片,切 tab 时直接命中缓存
  const prefetchQ = []; let prefetching = 0; const seen = new Set();
  const saveData = navigator.connection && navigator.connection.saveData;
  function pump(){
    while (prefetching < 4 && prefetchQ.length){
      const u = prefetchQ.shift(); prefetching++;
      const im = new Image(); im.onload = im.onerror = () => { prefetching--; pump(); }; im.src = u;
    }
  }
  window.wxqPrefetch = function(urls){
    if (saveData) return;
    for (const u of urls) if (u && !seen.has(u)){ seen.add(u); prefetchQ.push(u); }
    const start = () => pump();
    if ("requestIdleCallback" in window) requestIdleCallback(start, {timeout:3000}); else setTimeout(start, 800);
  };
  function prefetchOtherTabs(){
    const urls = [];
    for (const n of NAVS){
      if (n.nav === state.nav) continue;
      const list = data[n.key] || [];
      if (list[0]) urls.push(list[0].cardImage);
      for (const c of list) urls.push(n.nav===1 ? `${ICON}/icon/hero_${c.id}.png` : (c.thumb||c.image));
    }
    window.wxqPrefetch(urls);
  }

  function fetchJSON(url, ms){
    const ctl = new AbortController(); const t = setTimeout(()=>ctl.abort(), ms||8000);
    return fetch(url, {signal:ctl.signal, cache:"no-cache"}).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); }).finally(()=>clearTimeout(t));
  }
  function load(){
    return Promise.all([1,2,4,8].map(n => fetchJSON(`${OFFICIAL}_${n}.js`)))
      .then(parts => { for (const p of parts) for (const k of Object.keys(p)) if (Array.isArray(p[k]) && p[k].length) data[k] = (data[k]||[]).concat(p[k]); })
      .catch(err => fetchJSON(SNAPSHOT, 15000).then(s => {
        for (const n of NAVS) data[n.key] = s[n.key]||[];
        $("#cardsNote").textContent = `官方数据暂时拉不到(${err.message}),当前显示 ${s.snapshotDate} 的快照。`;
      }));
  }

  function navInfo(){ return NAVS.find(n=>n.nav===state.nav); }
  function cards(){ return data[navInfo().key]||[]; }
  function byId(id){ return cards().find(c=>c.id===id); }
  function listImg(c, nav){
    if (nav===1) return `<img class="li-hero" loading="lazy" src="${ICON}/icon/hero_${c.id}.png" alt="" onerror="this.onerror=null;this.src='${esc(c.thumb||c.image)}'">`;
    const cls = "li-hero" + (nav===2 ? " tf_bg"+c.quality : "");
    return `<img class="${cls}" loading="lazy" src="${esc(c.thumb||c.image)}" alt="" onerror="this.onerror=null;this.src='img/card/cards-default.png'">`;
  }
  function qualityIcon(c, nav){ return (nav===1||nav===4) ? `<img class="li-icon" src="img/card/quality/${c.quality}.png" alt="">` : ""; }
  function item(c, nav){
    return `<div class="li-detail" data-id="${c.id}">${qualityIcon(c, nav)}${listImg(c, nav)}<p>${esc(c.name)}</p></div>`;
  }
  function group(title, iconName, mark, cardsHtml, gid){
    return `<div class="cards-l-li"${gid!=null?` data-gid="${gid}"`:""}><div class="li-ti">${iconName ? `<img src="img/card/icon/${iconName}.png" alt="">` : ""}<p>${esc(title)}</p>${mark ? `<span>${esc(mark)}</span>` : ""}</div><div class="li-cards">${cardsHtml}</div></div>`;
  }

  // 每个 tab 的分组列表只建一次,之后切筛选只显示/隐藏,图片不重刷
  const built = {};
  function buildRows(nav){
    if (built[nav]) return built[nav];
    const all = data[NAVS.find(n=>n.nav===nav).key] || [];
    const rows = {};
    for (const cat of CATEGORIES[nav]){
      const el = document.createElement("div");
      el.className = "cards-rows";
      el.innerHTML = cat.list.map(o => {
        const grp = all.filter(c => cat.get(c).includes(o.id));
        return grp.length ? group(o.name, o.icon, o.mark, grp.map(c => item(c, nav)).join(""), o.id) : "";
      }).join("") || '<div class="cards-err">该分类下没有卡牌</div>';
      rows[cat.row] = el;
    }
    return built[nav] = rows;
  }

  function renderTabs(){
    for (const a of $("#cardTabs").children) a.classList.toggle("on", +a.dataset.nav===state.nav);
    root.className = "cards-wrap " + navInfo().cls;
  }
  function renderFilters(){
    const cats = CATEGORIES[state.nav];
    const row = state.row[state.nav] || 1, id = state.id[state.nav];
    $("#cardsFilters").innerHTML = cats.map(cat => `
      <div class="cards-l-item"><p>${cat.name}</p><div class="cards-l-item2" data-row="${cat.row}">
        <a data-id="" class="${cat.row===row && id==null ? "on":""}">全部</a>
        ${cat.list.map(o => `<a data-id="${o.id}" class="${cat.row===row && id===o.id ? "on":""}" title="${esc(o.mark||"")}">${o.name}</a>`).join("")}
      </div></div>`).join("");
  }
  function markCurrent(){
    const cur = state.cur[state.nav];
    $("#cardsList").querySelectorAll(".li-detail").forEach(x => x.classList.toggle("on", +x.dataset.id===cur));
  }
  function renderList(){
    const box = $("#cardsList");
    const all = cards();
    if (!all.length){ box.innerHTML = '<div class="cards-err">没有数据</div>'; return; }
    if (state.q){
      const hit = all.filter(c => c.name.includes(state.q));
      box.innerHTML = hit.length
        ? group(`搜索「${state.q}」`, null, `${hit.length} 张`, hit.map(c => item(c, state.nav)).join(""))
        : `<div class="cards-err">没有叫「${esc(state.q)}」的卡牌</div>`;
      markCurrent();
      return;
    }
    const rowEl = buildRows(state.nav)[state.row[state.nav]||1];
    const only = state.id[state.nav];
    rowEl.querySelectorAll(".cards-l-li").forEach(g => { g.hidden = only != null && +g.dataset.gid !== only; });
    if (box.firstChild !== rowEl){ box.replaceChildren(rowEl); }
    box.scrollTop = 0;
    markCurrent();
  }

  function big(imgs, names){
    imgs = imgs.filter(Boolean);
    if (!imgs.length) return `<a class="r-big"><img src="img/card/card_img_default.png" alt=""></a>`;
    let html = `<a class="r-big" data-i="0" data-imgs='${esc(JSON.stringify(imgs))}' data-names='${esc(JSON.stringify(names||[]))}'><img src="${esc(imgs[0])}" alt=""></a>`;
    if (imgs.length > 1) html += `<div class="r-dots">${imgs.map((_,i)=>`<i class="${i?"":"on"}" data-i="${i}"></i>`).join("")}</div>`;
    return html;
  }
  function sources(c){
    if (c.sourceCards && c.sourceCards.length){
      return `<h2>相关</h2><div class="cards-r-descimg">${c.sourceCards.map(s => `<a class="${SHAPE_BY_TYPE[s.type]||"desc-img"}" data-img="${esc(s.cardImage)}" data-name="${esc(s.name)}" title="${esc(s.name)}"><img src="${esc(s.thumb||s.image)}" alt="" onerror="this.onerror=null;this.src='img/card/cards-default.png'"></a>`).join("")}</div>`;
    }
    return `<h2>相关</h2><div class="cards-r-desc">${esc(c.cardGetDesc||"")}</div>`;
  }
  function renderDetail(){
    const c = byId(state.cur[state.nav]);
    const R = $("#cardsRight");
    if (!c){ R.innerHTML = ""; return; }
    const preview = (x) => big([x.cardImage].concat((x.previewCards||[]).map(p=>p.cardImage)), [x.name].concat((x.previewCards||[]).map(p=>p.name)));
    if (state.nav === 1){
      const h = c.heroCard || {};
      const kw = (h.keywordDescription||[]).map(k => `<div class="cards-r-desc"><span>${esc(k.name.replace(/[^\w一-龥]/g,""))}：</span>${esc(k.desc)}</div>`).join("");
      const sk = h.skillList && h.skillList[0];
      let skill = '<div class="cards-r-desc">暂无技能数据</div>';
      if (sk){
        skill = `<div class="r-item2-top"><img src="${esc(sk.icon)}" alt=""><p>${esc(sk.name)}</p></div><p class="cards-r-desc2">${rich(sk.desc)}</p>`;
        const params = sk.enhanceSkill && sk.enhanceSkill.params;
        if (params) skill += params.map((p,i) => `<div class="r-item2-b"><b>${["Ⅰ","Ⅱ","Ⅲ"][i]||i+1}</b><span>${rich(p.desc)}</span></div>`).join("");
      }
      const props = h.properties ? PROPS.map(([n,f]) => `<div class="r-item3-li"><span>${n}</span><b>${f(h.properties)}</b></div>`).join("") : '<div class="cards-r-desc">暂无属性数据</div>';
      const aw = h.awakeingCard;
      const awake = aw ? preview(aw) + (aw.desc ? `<div class="cards-r-desc">${rich(aw.desc)}</div>` : "") : '<div class="cards-r-desc">暂无觉醒数据</div>';
      R.innerHTML = `
        <div class="cards-r-tab">${["说明","技能","属性","觉醒"].map((t,i)=>`<a data-t="${i}" class="${i?"":"on"}">${t}</a>`).join("")}</div>
        <div class="cards-r-item on">${preview(c)}<div class="cards-r-desc">${rich(c.desc)}</div>${kw}</div>
        <div class="cards-r-item">${skill}</div>
        <div class="cards-r-item">${props}</div>
        <div class="cards-r-item">${awake}</div>`;
    } else {
      R.innerHTML = `<div class="cards-r-tab"><a class="on">${esc(c.name)}</a></div>
        <div class="cards-r-item on">${preview(c)}<div class="cards-r-desc">${rich(c.desc)}</div>${sources(c)}</div>`;
    }
  }
  function render(){ renderTabs(); renderFilters(); renderList(); renderDetail(); }

  $("#cardTabs").addEventListener("click", e => {
    const a = e.target.closest("a[data-nav]"); if (!a) return;
    state.nav = +a.dataset.nav; state.q = ""; $("#cardsSearch").value = "";
    if (!state.cur[state.nav] && cards()[0]) state.cur[state.nav] = cards()[0].id;
    save(); render();
  });
  $("#cardsFilters").addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a) return;
    state.row[state.nav] = +a.parentNode.dataset.row;
    state.id[state.nav] = a.dataset.id === "" ? null : +a.dataset.id;
    state.q = ""; $("#cardsSearch").value = "";
    renderFilters(); renderList();
  });
  $("#cardsList").addEventListener("click", e => {
    const d = e.target.closest(".li-detail"); if (!d) return;
    state.cur[state.nav] = +d.dataset.id;
    markCurrent();
    renderDetail();
  });
  $("#cardsRight").addEventListener("click", e => {
    const t = e.target.closest(".cards-r-tab a[data-t]");
    if (t){
      const i = +t.dataset.t;
      $("#cardsRight").querySelectorAll(".cards-r-tab a").forEach((a,k)=>a.classList.toggle("on",k===i));
      $("#cardsRight").querySelectorAll(".cards-r-item").forEach((d,k)=>d.classList.toggle("on",k===i));
      return;
    }
    const s = e.target.closest("a[data-img]");
    if (s){ lightbox(s.dataset.img, s.dataset.name); return; }
    const dot = e.target.closest(".r-dots i");
    const bigEl = e.target.closest(".r-big");
    const el = dot ? dot.parentNode.previousElementSibling : bigEl;
    if (!el || !el.dataset.imgs) { if (bigEl) lightbox($("img", bigEl).src, ""); return; }
    const imgs = JSON.parse(el.dataset.imgs), names = JSON.parse(el.dataset.names||"[]");
    let i = dot ? +dot.dataset.i : (+el.dataset.i + 1) % imgs.length;
    if (imgs.length === 1 && !dot){ lightbox(imgs[0], names[0]); return; }
    el.dataset.i = i; $("img", el).src = imgs[i];
    const dots = el.nextElementSibling; if (dots) dots.querySelectorAll("i").forEach((d,k)=>d.classList.toggle("on",k===i));
  });
  const doSearch = () => { state.q = $("#cardsSearch").value.trim(); renderFilters(); renderList(); };
  $("#cardsSearch").addEventListener("input", doSearch);
  $("#cardsSearchBtn").addEventListener("click", doSearch);

  load().then(() => {
    for (const n of NAVS){ const l = data[n.key]||[]; if (l[0]) state.cur[n.nav] = l[0].id; }
    render();
    setTimeout(prefetchOtherTabs, 1200);
  }).catch(err => { $("#cardsList").innerHTML = `<div class="cards-err">卡牌数据加载失败:${esc(err.message)}</div>`; });
})();
