/* Shared questionnaire engine — Sahar. Reads window.QUESTIONNAIRE and renders the full page into #root. */
(function(){
  var Q = window.QUESTIONNAIRE;
  if(!Q){return;}
  document.documentElement.setAttribute("dir","rtl");
  document.documentElement.setAttribute("lang","he");

  var SCALE=[
    {v:"always",t:"כן, כל הזמן"},
    {v:"sometimes",t:"מדי פעם"},
    {v:"rarely",t:"כמעט ולא"},
    {v:"never",t:"אף פעם לא"}
  ];
  var LOGO="data:image/png;base64,"; // not used; logo via <img src="logo.png">

  var STORE_KEY=Q.storeKey;
  var state=load();
  function load(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||{};}catch(e){return {};}}
  function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){}}

  var root=document.getElementById("root");

  // ---- header ----
  var header=document.createElement("header");header.className="bar";
  header.innerHTML=''
    +'<div class="bar-inner">'
    +'  <a class="brand" href="index.html"><img src="logo.png" alt="לוגו סהר"><span class="brandmark">סהר</span></a>'
    +'  <h1>'+esc(Q.title)+'</h1>'
    +'  <button class="bar-btn primary" id="btnSummary">הצג סיכום</button>'
    +'  <button class="icon-btn" id="btnTheme" aria-label="מצב תצוגה בהיר/כהה">◐</button>'
    +'</div>';
  root.appendChild(header);

  var main=document.createElement("main");main.className="wrap";root.appendChild(main);

  // ---- intro ----
  var intro=document.createElement("section");intro.className="intro";
  intro.innerHTML=''
    +'<a class="back-link" href="index.html">→ כל השאלונים</a>'
    +'<h2>'+esc(Q.title)+'</h2>'
    +'<svg class="arc" viewBox="0 0 90 18" fill="none" aria-hidden="true"><path d="M3 15 C 25 3, 65 3, 87 15" stroke="#D4622E" stroke-width="5" stroke-linecap="round"/></svg>'
    +'<p class="lead">'+Q.lead+'</p>'
    +'<div class="name-box">'
    +'  <div class="fld"><label for="respName">השם שלי</label><input id="respName" type="text" autocomplete="name" placeholder="שם מלא"></div>'
    +'  <div class="fld"><label for="respDate">תאריך</label><input id="respDate" type="date"></div>'
    +'</div>'
    +'<div class="note-box">'
    +'  <p>לכל משפט מסמנים עד כמה הוא נכון לגביי. אפשר גם לסמן <strong>"אחרים מעירים לי על זה"</strong> ולהוסיף הערה — רק אם רוצים.</p>'
    +'  <div class="scale-legend"><span>כן, כל הזמן</span><span>מדי פעם</span><span>כמעט ולא</span><span>אף פעם לא</span></div>'
    +'  <p style="margin-top:.9rem;font-size:.92rem;color:var(--muted)">הערה שמישהו העיר לי היא <strong>מידע</strong> על איך ההתנהגות נקראה אצלו — לא הוכחה שצריך לשנות. אם זה חוזר עם אנשים שונים <em>וגם</em> מפריע לי — אולי שווה לדבר על זה. אם זה חוזר אבל לא מפריע לי — אפשר פשוט להסביר לסביבה. זו בחירה שלי.</p>'
    +'</div>';
  main.appendChild(intro);

  var appWrap=document.createElement("div");appWrap.id="app";main.appendChild(appWrap);

  // summary section
  var summaryEl=document.createElement("section");summaryEl.className="summary";summaryEl.id="summary";summaryEl.hidden=true;
  summaryEl.innerHTML=''
    +'<h2>הסיכום שלי</h2>'
    +'<p class="lead" style="font-size:1rem">תמונת מצב רגעית, להבאה לשיחה עם המטפל/ת.</p>'
    +'<div class="actions">'
    +'  <button class="bar-btn primary" id="btnDownload">שמירה כקובץ</button>'
    +'  <button class="bar-btn" id="btnPrint">הדפסה / PDF</button>'
    +'  <button class="bar-btn" id="btnCopy">העתקת הסיכום</button>'
    +'  <button class="bar-btn" id="btnCloseSum">סגירה</button>'
    +'</div><div id="summaryBody"></div>';
  main.appendChild(summaryEl);

  // submit-box
  var sub=document.createElement("section");sub.className="submit-box";
  sub.innerHTML=''
    +'<h2>סיום</h2>'
    +'<p>כשמסיימים, מציגים את הסיכום — ומשם אפשר לשמור אותו כקובץ למחשב, להדפיס או לשמור כ-PDF, או להעתיק. את הקובץ אפשר להביא או לשלוח למטפל/ת.</p>'
    +'<div class="actions"><button class="bar-btn primary" id="btnSummary2">הצג סיכום ושמירה</button></div>';
  main.appendChild(sub);

  var hint=document.createElement("p");hint.className="saved-hint";
  hint.textContent="התשובות נשמרות זמנית בדפדפן הזה, עד שמוחקים אותן או שומרים כקובץ.";
  main.appendChild(hint);

  // ---- theme ----
  try{var th=localStorage.getItem(STORE_KEY+"_theme");if(th)document.documentElement.setAttribute("data-theme",th);}catch(e){}
  document.getElementById("btnTheme").addEventListener("click",function(){
    var cur=document.documentElement.getAttribute("data-theme");
    var isDark=cur?cur==="dark":matchMedia("(prefers-color-scheme:dark)").matches;
    var next=isDark?"light":"dark";
    document.documentElement.setAttribute("data-theme",next);
    try{localStorage.setItem(STORE_KEY+"_theme",next);}catch(e){}
  });

  // ---- name + date ----
  var nameInput=document.getElementById("respName");
  var dateInput=document.getElementById("respDate");
  nameInput.value=state._name||"";
  if(state._date){dateInput.value=state._date;}
  else{var t=new Date();dateInput.value=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");state._date=dateInput.value;}
  nameInput.addEventListener("input",function(){state._name=nameInput.value;save();});
  dateInput.addEventListener("input",function(){state._date=dateInput.value;save();});

  // ---- render domains ----
  Q.domains.forEach(function(d,di){
    var sec=document.createElement("section");sec.className="domain";
    var html='<div class="domain-head"><span class="domain-num">'+(di+1)+'</span><h3>'+esc(d.title)+'</h3></div>';
    if(d.sub)html+='<p class="domain-sub">'+esc(d.sub)+'</p>';
    sec.innerHTML=html;
    d.items.forEach(function(it){
      if(it.head){var gh=document.createElement("div");gh.className="item-group";gh.textContent=it.head;sec.appendChild(gh);}
      var cur=state[it.id]||{};
      var box=document.createElement("div");box.className="item";
      var fs=document.createElement("fieldset");
      var lg=document.createElement("legend");lg.textContent=it.t;fs.appendChild(lg);
      var scale=document.createElement("div");scale.className="scale";
      SCALE.forEach(function(s){
        var inid=it.id+"_"+s.v;
        var inp=document.createElement("input");inp.type="radio";inp.name=it.id;inp.id=inid;inp.value=s.v;
        if(cur.scale===s.v)inp.checked=true;
        inp.addEventListener("change",function(){setField(it.id,"scale",s.v);});
        var lab=document.createElement("label");lab.setAttribute("for",inid);lab.textContent=s.t;
        scale.appendChild(inp);scale.appendChild(lab);
      });
      fs.appendChild(scale);
      var extra=document.createElement("div");extra.className="item-extra";
      var chkL=document.createElement("label");chkL.className="chk";
      var chk=document.createElement("input");chk.type="checkbox";chk.id=it.id+"_rem";
      if(cur.remark)chk.checked=true;
      chk.addEventListener("change",function(){setField(it.id,"remark",chk.checked);});
      chkL.appendChild(chk);chkL.appendChild(document.createTextNode("אחרים מעירים לי על זה"));
      var nf=document.createElement("div");nf.className="note-field";
      var ni=document.createElement("input");ni.type="text";ni.id=it.id+"_note";ni.placeholder="הערה (לא חובה)";
      ni.value=cur.note||"";
      ni.addEventListener("input",function(){setField(it.id,"note",ni.value);});
      nf.appendChild(ni);
      extra.appendChild(chkL);extra.appendChild(nf);
      fs.appendChild(extra);
      box.appendChild(fs);sec.appendChild(box);
    });
    var ref=document.createElement("div");ref.className="reflect";
    ref.innerHTML='<h4>לעצור ולהתבונן</h4><p class="r-sub">מתוך התחום הזה — '+esc(d.title)+'</p>';
    Q.reflect.forEach(function(r){
      var rid=d.id+"_"+r.id;
      var lab=document.createElement("label");lab.className="q";lab.setAttribute("for",rid);lab.textContent=r.q;
      var ta=document.createElement("textarea");ta.id=rid;ta.value=(state[rid]||"");
      ta.addEventListener("input",function(){state[rid]=ta.value;save();});
      ref.appendChild(lab);ref.appendChild(ta);
    });
    sec.appendChild(ref);
    appWrap.appendChild(sec);
  });

  function setField(itemId,key,val){if(!state[itemId])state[itemId]={};state[itemId][key]=val;save();}

  function scaleLabel(v){for(var i=0;i<SCALE.length;i++)if(SCALE[i].v===v)return SCALE[i].t;return "";}
  function isNotable(it,scale){if(!scale)return false;if(it.pole==="low")return scale==="never"||scale==="rarely";return scale==="always"||scale==="sometimes";}

  function buildSummary(){
    var body=document.getElementById("summaryBody");body.innerHTML="";
    Q.domains.forEach(function(d){
      var g=document.createElement("div");g.className="sum-group";
      g.innerHTML='<h3>'+esc(d.title)+'</h3>';
      var notable=d.items.filter(function(it){var c=state[it.id]||{};return isNotable(it,c.scale);});
      if(notable.length){
        var ul=document.createElement("ul");ul.className="sum-list";
        notable.forEach(function(it){var c=state[it.id]||{};
          var li=document.createElement("li");li.textContent=it.t;
          var tag=document.createElement("span");tag.className="tag";tag.textContent="· "+scaleLabel(c.scale);li.appendChild(tag);
          if(c.remark){var t2=document.createElement("span");t2.className="tag";t2.textContent="· מעירים לי";li.appendChild(t2);}
          if(c.note&&c.note.trim()){var mn=document.createElement("span");mn.className="mnote";mn.textContent="הערה: "+c.note.trim();li.appendChild(mn);}
          ul.appendChild(li);
        });
        g.appendChild(ul);
      }else{var p=document.createElement("p");p.className="none";p.textContent="לא בלטו פריטים מיוחדים בתחום הזה.";g.appendChild(p);}
      var dl=document.createElement("dl");dl.className="sum-r";var any=false;
      Q.reflect.forEach(function(r){var val=(state[d.id+"_"+r.id]||"").trim();if(val){any=true;
        var dt=document.createElement("dt");dt.textContent=r.q;var dd=document.createElement("dd");dd.textContent=val;dl.appendChild(dt);dl.appendChild(dd);}});
      if(any)g.appendChild(dl);
      body.appendChild(g);
    });
  }
  function summaryText(){
    var out=["הסיכום שלי — "+Q.title.replace(/\//g,"")];
    out.push("שם: "+(state._name||"")+"   תאריך: "+(state._date||""));out.push("");
    Q.domains.forEach(function(d){
      out.push("■ "+d.title);
      var notable=d.items.filter(function(it){var c=state[it.id]||{};return isNotable(it,c.scale);});
      if(notable.length){
        notable.forEach(function(it){var c=state[it.id]||{};
          out.push("  • "+it.t+" ["+scaleLabel(c.scale)+(c.remark?" · מעירים לי":"")+"]");
          if(c.note&&c.note.trim())out.push("      הערה: "+c.note.trim());
        });
      }else{out.push("  (לא בלטו פריטים מיוחדים)");}
      Q.reflect.forEach(function(r){var val=(state[d.id+"_"+r.id]||"").trim();if(val){out.push("  ↳ "+r.q);out.push("     "+val);}});
      out.push("");
    });
    return out.join("\n");
  }

  function showSummary(){buildSummary();summaryEl.hidden=false;summaryEl.scrollIntoView({behavior:"smooth",block:"start"});}
  document.getElementById("btnSummary").addEventListener("click",showSummary);
  document.getElementById("btnSummary2").addEventListener("click",showSummary);
  document.getElementById("btnCloseSum").addEventListener("click",function(){summaryEl.hidden=true;});
  document.getElementById("btnCopy").addEventListener("click",function(){
    var txt=summaryText();var btn=this;
    function ok(){btn.textContent="הועתק ✓";setTimeout(function(){btn.textContent="העתקת הסיכום";},1800);}
    function fallback(){var ta=document.createElement("textarea");ta.value=txt;ta.style.position="fixed";ta.style.opacity="0";
      document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand("copy");ok();}catch(e){btn.textContent="לא ניתן להעתיק";}document.body.removeChild(ta);}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(ok).catch(fallback);}else{fallback();}
  });
  document.getElementById("btnDownload").addEventListener("click",function(){
    var txt=summaryText();
    var nm=(state._name||"סיכום").trim().replace(/[\\\/:*?"<>|]/g,"-");
    var fn="סיכום שאלון - "+nm+(state._date?(" - "+state._date):"")+".txt";
    var blob=new Blob(["﻿"+txt],{type:"text/plain;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download=fn;document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(url);a.remove();},0);
  });
  document.getElementById("btnPrint").addEventListener("click",function(){window.print();});

  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
})();
