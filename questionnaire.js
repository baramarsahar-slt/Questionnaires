/* Shared questionnaire engine — Sahar. Bilingual (he/en). Reads window.QUESTIONNAIRE and renders into #root. */
(function(){
  var Q = window.QUESTIONNAIRE;
  if(!Q){return;}

  var LANG_KEY="sahar_lang";
  var lang="he";
  try{var sl=localStorage.getItem(LANG_KEY);if(sl==="en"||sl==="he")lang=sl;}catch(e){}
  var HAS_EN=!!Q.title_en;
  if(lang==="en"&&!HAS_EN)lang="he"; // untranslated page stays fully Hebrew

  var STR={
    he:{
      dir:"rtl",
      back:"→ כל השאלונים",
      summaryBtn:"הצג סיכום",
      nameLabel:"השם שלי", namePh:"שם מלא", dateLabel:"תאריך",
      remark:"אחרים מעירים לי על זה", notePh:"הערה (לא חובה)",
      reflectHead:"לעצור ולהתבונן", reflectSub:"מתוך התחום הזה — ",
      summaryTitle:"הסיכום שלי", summaryLead:"תמונת מצב רגעית, להבאה לשיחה עם המטפל/ת.",
      download:"שמירה כקובץ", print:"הדפסה / PDF", copy:"העתקת הסיכום", copied:"הועתק ✓",
      cantCopy:"לא ניתן להעתיק", close:"סגירה",
      submitTitle:"סיום",
      submitP:"כשמסיימים, מציגים את הסיכום — ומשם אפשר לשמור אותו כקובץ למחשב, להדפיס או לשמור כ-PDF, או להעתיק. את הקובץ אפשר להביא או לשלוח למטפל/ת.",
      showSave:"הצג סיכום ושמירה",
      savedHint:"התשובות נשמרות זמנית בדפדפן הזה, עד שמוחקים אותן או שומרים כקובץ.",
      langBtn:"English", themeAria:"מצב תצוגה בהיר/כהה",
      sumNone:"לא בלטו פריטים מיוחדים בתחום הזה.",
      sumName:"שם: ", sumDate:"   תאריך: ", noteOut:"הערה: ",
      fileBase:"סיכום שאלון", fileDefault:"סיכום",
      scale:["כן, כל הזמן","מדי פעם","כמעט ולא","אף פעם לא"],
      noteP1:"לכל משפט מסמנים עד כמה הוא נכון לגביי. אפשר גם לסמן \"אחרים מעירים לי על זה\" ולהוסיף הערה — רק אם רוצים.",
      noteP2:"הערה שמישהו העיר לי היא מידע על איך ההתנהגות נקראה אצלו — לא הוכחה שצריך לשנות. אם זה חוזר עם אנשים שונים וגם מפריע לי — אולי שווה לדבר על זה. אם זה חוזר אבל לא מפריע לי — אפשר פשוט להסביר לסביבה. זו בחירה שלי."
    },
    en:{
      dir:"ltr",
      back:"← All questionnaires",
      summaryBtn:"Show summary",
      nameLabel:"My name", namePh:"Full name", dateLabel:"Date",
      remark:"Others comment on this about me", notePh:"Note (optional)",
      reflectHead:"Pause and reflect", reflectSub:"From this area — ",
      summaryTitle:"My summary", summaryLead:"A snapshot to bring to the conversation with my therapist.",
      download:"Save as file", print:"Print / PDF", copy:"Copy summary", copied:"Copied ✓",
      cantCopy:"Couldn't copy", close:"Close",
      submitTitle:"Finishing",
      submitP:"When you're done, show the summary — from there you can save it as a file, print or save as PDF, or copy it. You can bring or send the file to your therapist.",
      showSave:"Show summary & save",
      savedHint:"Answers are saved only temporarily in this browser, until cleared or saved as a file.",
      langBtn:"עברית", themeAria:"Light / dark mode",
      sumNone:"Nothing stood out in this area.",
      sumName:"Name: ", sumDate:"   Date: ", noteOut:"Note: ",
      fileBase:"Questionnaire summary", fileDefault:"summary",
      scale:["Always","Often","Rarely","Never"],
      noteP1:"For each statement, mark how true it is for you. You can also check \"Others comment on this about me\" and add a note — only if you want to.",
      noteP2:"A comment someone made is information about how the behavior came across to them — not proof you need to change. If it recurs with different people and it also bothers you, it may be worth talking about. If it recurs but doesn't bother you, you can simply explain it to those around you. It's my choice."
    }
  };
  var S=STR[lang];

  document.documentElement.setAttribute("dir",S.dir);
  document.documentElement.setAttribute("lang",lang);

  function tr(obj,f){var v=(lang==="en"&&obj[f+"_en"]!=null)?obj[f+"_en"]:obj[f];return v;}

  var SCALE_V=["always","sometimes","rarely","never"];
  var SCALE_T = (lang==="en" ? (Q.scaleLabels_en||S.scale) : (Q.scaleLabels||S.scale));
  var SCALE=SCALE_V.map(function(v,i){return {v:v,t:SCALE_T[i]};});
  var ACCESSIBLE=(Q.variant==="accessible");
  if(ACCESSIBLE)document.documentElement.classList.add("accessible");

  var STORE_KEY=Q.storeKey;
  var state=load();
  function load(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||{};}catch(e){return {};}}
  function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){}}

  var root=document.getElementById("root");

  // ---- header ----
  var header=document.createElement("header");header.className="bar";
  header.innerHTML=''
    +'<div class="bar-inner">'
    +'  <a class="brand" href="index.html"><img src="logo.png" alt="Sahar"><span class="brandmark">סהר</span></a>'
    +'  <h1>'+esc(tr(Q,"title"))+'</h1>'
    +'  <button class="bar-btn" id="btnLang">'+S.langBtn+'</button>'
    +'  <button class="bar-btn primary" id="btnSummary">'+S.summaryBtn+'</button>'
    +'  <button class="icon-btn" id="btnTheme" aria-label="'+S.themeAria+'">◐</button>'
    +'</div>';
  root.appendChild(header);
  if(!HAS_EN){var _lb=document.getElementById("btnLang");if(_lb)_lb.hidden=true;}

  var main=document.createElement("main");main.className="wrap";root.appendChild(main);

  var noteHtml = (tr(Q,"help")) || (''
    +'<p>'+esc(S.noteP1)+'</p>'
    +'<div class="scale-legend">'+SCALE.map(function(s){return '<span>'+esc(s.t)+'</span>';}).join('')+'</div>'
    +'<p style="margin-top:.9rem;font-size:.92rem;color:var(--muted)">'+esc(S.noteP2)+'</p>');

  var intro=document.createElement("section");intro.className="intro";
  intro.innerHTML=''
    +'<a class="back-link" href="index.html">'+esc(S.back)+'</a>'
    +'<h2>'+esc(tr(Q,"title"))+'</h2>'
    +'<svg class="arc" viewBox="0 0 90 18" fill="none" aria-hidden="true"><path d="M3 15 C 25 3, 65 3, 87 15" stroke="#D4622E" stroke-width="5" stroke-linecap="round"/></svg>'
    +'<p class="lead">'+tr(Q,"lead")+'</p>'
    +'<div class="name-box">'
    +'  <div class="fld"><label for="respName">'+esc(S.nameLabel)+'</label><input id="respName" type="text" autocomplete="name" placeholder="'+esc(S.namePh)+'"></div>'
    +'  <div class="fld"><label for="respDate">'+esc(S.dateLabel)+'</label><input id="respDate" type="date"></div>'
    +'</div>'
    +'<div class="note-box">'+noteHtml+'</div>';
  main.appendChild(intro);

  var appWrap=document.createElement("div");appWrap.id="app";main.appendChild(appWrap);

  var summaryEl=document.createElement("section");summaryEl.className="summary";summaryEl.id="summary";summaryEl.hidden=true;
  summaryEl.innerHTML=''
    +'<h2>'+esc(S.summaryTitle)+'</h2>'
    +'<p class="lead" style="font-size:1rem">'+esc(S.summaryLead)+'</p>'
    +'<div class="actions">'
    +'  <button class="bar-btn primary" id="btnDownload">'+esc(S.download)+'</button>'
    +'  <button class="bar-btn" id="btnPrint">'+esc(S.print)+'</button>'
    +'  <button class="bar-btn" id="btnCopy">'+esc(S.copy)+'</button>'
    +'  <button class="bar-btn" id="btnCloseSum">'+esc(S.close)+'</button>'
    +'</div><div id="summaryBody"></div>';
  main.appendChild(summaryEl);

  var subSec=document.createElement("section");subSec.className="submit-box";
  subSec.innerHTML=''
    +'<h2>'+esc(S.submitTitle)+'</h2>'
    +'<p>'+esc(S.submitP)+'</p>'
    +'<div class="actions"><button class="bar-btn primary" id="btnSummary2">'+esc(S.showSave)+'</button></div>';
  main.appendChild(subSec);

  var hint=document.createElement("p");hint.className="saved-hint";hint.textContent=S.savedHint;main.appendChild(hint);

  // lang toggle
  document.getElementById("btnLang").addEventListener("click",function(){
    try{localStorage.setItem(LANG_KEY, lang==="he"?"en":"he");}catch(e){}
    location.reload();
  });

  // theme
  try{var th=localStorage.getItem(STORE_KEY+"_theme");if(th)document.documentElement.setAttribute("data-theme",th);}catch(e){}
  document.getElementById("btnTheme").addEventListener("click",function(){
    var cur=document.documentElement.getAttribute("data-theme");
    var isDark=cur?cur==="dark":matchMedia("(prefers-color-scheme:dark)").matches;
    var next=isDark?"light":"dark";
    document.documentElement.setAttribute("data-theme",next);
    try{localStorage.setItem(STORE_KEY+"_theme",next);}catch(e){}
  });

  // name + date
  var nameInput=document.getElementById("respName");
  var dateInput=document.getElementById("respDate");
  nameInput.value=state._name||"";
  if(state._date){dateInput.value=state._date;}
  else{var t=new Date();dateInput.value=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");state._date=dateInput.value;}
  nameInput.addEventListener("input",function(){state._name=nameInput.value;save();});
  dateInput.addEventListener("input",function(){state._date=dateInput.value;save();});

  // render domains
  Q.domains.forEach(function(d,di){
    var sec=document.createElement("section");sec.className="domain";
    var html='<div class="domain-head"><span class="domain-num">'+(di+1)+'</span><h3>'+esc(tr(d,"title"))+'</h3></div>';
    var dsub=tr(d,"sub"); if(dsub)html+='<p class="domain-sub">'+esc(dsub)+'</p>';
    sec.innerHTML=html;
    d.items.forEach(function(it){
      var head=tr(it,"head");
      if(head){var gh=document.createElement("div");gh.className="item-group";gh.textContent=head;sec.appendChild(gh);}
      var cur=state[it.id]||{};
      var box=document.createElement("div");box.className="item";
      var fs=document.createElement("fieldset");
      var lg=document.createElement("legend");lg.textContent=tr(it,"t");fs.appendChild(lg);
      var scale=document.createElement("div");
      if(ACCESSIBLE){
        scale.className="scale-track";
        var line=document.createElement("div");line.className="track-line";scale.appendChild(line);
        SCALE.forEach(function(s){
          var inid=it.id+"_"+s.v;
          var pt=document.createElement("div");pt.className="track-pt";
          var inp=document.createElement("input");inp.type="radio";inp.name=it.id;inp.id=inid;inp.value=s.v;
          if(cur.scale===s.v)inp.checked=true;
          inp.addEventListener("change",function(){setField(it.id,"scale",s.v);});
          var lab=document.createElement("label");lab.setAttribute("for",inid);
          var dot=document.createElement("span");dot.className="dot";
          var tx=document.createElement("span");tx.className="lbl";tx.textContent=s.t;
          lab.appendChild(dot);lab.appendChild(tx);
          pt.appendChild(inp);pt.appendChild(lab);scale.appendChild(pt);
        });
      } else {
        scale.className="scale";
        SCALE.forEach(function(s){
          var inid=it.id+"_"+s.v;
          var inp=document.createElement("input");inp.type="radio";inp.name=it.id;inp.id=inid;inp.value=s.v;
          if(cur.scale===s.v)inp.checked=true;
          inp.addEventListener("change",function(){setField(it.id,"scale",s.v);});
          var lab=document.createElement("label");lab.setAttribute("for",inid);lab.textContent=s.t;
          scale.appendChild(inp);scale.appendChild(lab);
        });
      }
      fs.appendChild(scale);
      var extra=document.createElement("div");extra.className="item-extra";
      var chkL=document.createElement("label");chkL.className="chk";
      var chk=document.createElement("input");chk.type="checkbox";chk.id=it.id+"_rem";
      if(cur.remark)chk.checked=true;
      chk.addEventListener("change",function(){setField(it.id,"remark",chk.checked);});
      chkL.appendChild(chk);chkL.appendChild(document.createTextNode(S.remark));
      var nf=document.createElement("div");nf.className="note-field";
      var ni=document.createElement("input");ni.type="text";ni.id=it.id+"_note";ni.placeholder=S.notePh;
      ni.value=cur.note||"";
      ni.addEventListener("input",function(){setField(it.id,"note",ni.value);});
      nf.appendChild(ni);
      extra.appendChild(chkL);extra.appendChild(nf);
      fs.appendChild(extra);
      box.appendChild(fs);sec.appendChild(box);
    });
    var ref=document.createElement("div");ref.className="reflect";
    ref.innerHTML='<h4>'+esc(S.reflectHead)+'</h4><p class="r-sub">'+esc(S.reflectSub+tr(d,"title"))+'</p>';
    Q.reflect.forEach(function(r){
      var rid=d.id+"_"+r.id;
      var lab=document.createElement("label");lab.className="q";lab.setAttribute("for",rid);lab.textContent=tr(r,"q");
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
      g.innerHTML='<h3>'+esc(tr(d,"title"))+'</h3>';
      var notable=d.items.filter(function(it){var c=state[it.id]||{};return isNotable(it,c.scale);});
      if(notable.length){
        var ul=document.createElement("ul");ul.className="sum-list";
        notable.forEach(function(it){var c=state[it.id]||{};
          var li=document.createElement("li");li.textContent=tr(it,"t");
          var tag=document.createElement("span");tag.className="tag";tag.textContent="· "+scaleLabel(c.scale);li.appendChild(tag);
          if(c.remark){var t2=document.createElement("span");t2.className="tag";t2.textContent="· "+S.remark;li.appendChild(t2);}
          if(c.note&&c.note.trim()){var mn=document.createElement("span");mn.className="mnote";mn.textContent=S.noteOut+c.note.trim();li.appendChild(mn);}
          ul.appendChild(li);
        });
        g.appendChild(ul);
      }else{var p=document.createElement("p");p.className="none";p.textContent=S.sumNone;g.appendChild(p);}
      var dl=document.createElement("dl");dl.className="sum-r";var any=false;
      Q.reflect.forEach(function(r){var val=(state[d.id+"_"+r.id]||"").trim();if(val){any=true;
        var dt=document.createElement("dt");dt.textContent=tr(r,"q");var dd=document.createElement("dd");dd.textContent=val;dl.appendChild(dt);dl.appendChild(dd);}});
      if(any)g.appendChild(dl);
      body.appendChild(g);
    });
  }
  function summaryText(){
    var out=[S.summaryTitle+" — "+String(tr(Q,"title")).replace(/\//g,"")];
    out.push(S.sumName+(state._name||"")+S.sumDate+(state._date||""));out.push("");
    Q.domains.forEach(function(d){
      out.push("■ "+tr(d,"title"));
      var notable=d.items.filter(function(it){var c=state[it.id]||{};return isNotable(it,c.scale);});
      if(notable.length){
        notable.forEach(function(it){var c=state[it.id]||{};
          out.push("  • "+tr(it,"t")+" ["+scaleLabel(c.scale)+(c.remark?(" · "+S.remark):"")+"]");
          if(c.note&&c.note.trim())out.push("      "+S.noteOut+c.note.trim());
        });
      }else{out.push("  ("+S.sumNone+")");}
      Q.reflect.forEach(function(r){var val=(state[d.id+"_"+r.id]||"").trim();if(val){out.push("  ↳ "+tr(r,"q"));out.push("     "+val);}});
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
    function ok(){btn.textContent=S.copied;setTimeout(function(){btn.textContent=S.copy;},1800);}
    function fallback(){var ta=document.createElement("textarea");ta.value=txt;ta.style.position="fixed";ta.style.opacity="0";
      document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand("copy");ok();}catch(e){btn.textContent=S.cantCopy;}document.body.removeChild(ta);}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(ok).catch(fallback);}else{fallback();}
  });
  document.getElementById("btnDownload").addEventListener("click",function(){
    var txt=summaryText();
    var nm=(state._name||S.fileDefault).trim().replace(/[\\\/:*?"<>|]/g,"-");
    var fn=S.fileBase+" - "+nm+(state._date?(" - "+state._date):"")+".txt";
    var blob=new Blob(["﻿"+txt],{type:"text/plain;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download=fn;document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(url);a.remove();},0);
  });
  document.getElementById("btnPrint").addEventListener("click",function(){window.print();});

  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
})();
