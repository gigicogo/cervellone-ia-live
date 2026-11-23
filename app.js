/* Il Cervellone IA LIVE — frontend GitHub Pages · Comune di Genova */
const API='https://cervellone-ia-api.gigi-cogo.workers.dev';
const CATS=[{id:'scenario',label:'IA e suoi limiti',color:'#f4b632'},{id:'norme',label:'Norme e regole',color:'#f08d40'},{id:'privacy',label:'Privacy e rischi',color:'#ed6376'},{id:'metodo',label:'Metodi e prompt',color:'#22c6cc'},{id:'agenti',label:'Agenti IA',color:'#3cbd82'},{id:'governance',label:'Governance',color:'#a88ae9'},{id:'bonus',label:'Fuori programma',color:'#36a8ec'}];
const $=id=>document.getElementById(id);
const screen=id=>{document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current={role:null,room:null,token:null,me:null,state:null,lastQuestion:'',lastPhase:'',answer:null,order:[],received:false,spinCount:0};
let toastTimer;
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4300);}
async function request(path,method='GET',body){const h={'Content-Type':'application/json'};if(current.role==='admin'&&current.token)h['X-Admin-Token']=current.token;if(current.role==='player'&&current.token)h['X-Player-Token']=current.token;let response;try{response=await fetch(API+path,{method,headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});}catch{throw Error('Impossibile raggiungere Cloudflare. Controlla la connessione e l’indirizzo del Worker.');}const obj=await response.json().catch(()=>({error:'Risposta non valida dal server'}));if(!response.ok||obj.ok===false)throw Error(obj.error||`Errore HTTP ${response.status}`);return obj;}
function persist(){localStorage.setItem('cervellone-live-session',JSON.stringify({role:current.role,room:current.room,token:current.token,me:current.me}));}
function reset(){current={role:null,room:null,token:null,me:null,state:null,lastQuestion:'',lastPhase:'',answer:null,order:[],received:false,spinCount:0};}
function renderRank(target,players){$(target).innerHTML=(players||[]).length?(players||[]).map((p,i)=>`<div class="rank ${p.id===current.me?'mine':''}"><span class="pos">${['🥇','🥈','🥉'][i]||i+1}</span><span class="name">${esc(p.nickname)}${p.id===current.me?' (tu)':''}</span><span class="pts">${p.score} pt</span></div>`).join(''):'<p class="muted">Nessun partecipante ancora collegato.</p>';}
function renderLegend(){const h=CATS.map(c=>`<div class="legend-row"><span class="swatch" style="background:${c.color}"></span>${esc(c.label)}</div>`).join('');$('legend').innerHTML=h;}
function spinVisual(id){const i=CATS.findIndex(c=>c.id===id);if(i<0)return;current.spinCount++;const angle=360*current.spinCount*2-(i*360/7+360/14);$('wheel').style.transform=`rotate(${angle}deg)`;}
function asTime(ms){const v=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;}
function makeOptions(q,readonly=false){if(q.type==='order')return q.items.map((o,i)=>({v:o.index,text:o.text}));return (q.options||[]).map((text,i)=>({v:i,text}));}
function renderOptions(target,q,locked=false,correct=null){const el=$(target);el.innerHTML='';const opts=makeOptions(q);if(q.type==='order'&&!locked){$('question-hint').textContent='Clicca i passaggi nell’ordine corretto. Premi una tessera selezionata per ricominciare.';}else if(target==='options')$('question-hint').textContent='Scegli la risposta che ritieni corretta e conferma.';
 const selectedOrder=q.type==='order'&&Array.isArray(current.answer)?current.answer:[];
 opts.forEach((opt,i)=>{
  const b=document.createElement('button');b.type='button';b.className='option';b.disabled=locked;let marker=String.fromCharCode(65+i);
  if(q.type==='order'){const position=selectedOrder.indexOf(opt.v);if(position>=0){marker=String(position+1);b.classList.add('selected');}if(correct&&Array.isArray(correct)&&position>=0&&correct[position]===opt.v)b.classList.add('right');}
  else {if(current.answer===opt.v&&target==='options')b.classList.add('selected');if(correct!==null){if(correct===opt.v)b.classList.add('right');else if(current.answer===opt.v)b.classList.add('wrong');}}
  b.innerHTML=`<b>${marker}</b><span>${esc(opt.text)}</span>`;
  if(!locked)b.onclick=()=>{if(q.type==='order'){if(!Array.isArray(current.answer))current.answer=[];if(current.answer.includes(opt.v))current.answer=[];else current.answer.push(opt.v);}else current.answer=opt.v;renderOptions(target,q,false);$('send-btn').disabled=q.type==='order'?(current.answer?.length!==q.items.length):current.answer===null;};
  el.appendChild(b);
 });}
function renderPlayer(s){screen('play');$('participant-title').textContent='🎮 '+(s.me?.nickname||'PARTECIPANTE');$('room-chip').textContent='STANZA '+s.room;$('score-chip').textContent=(s.me?.score||0)+' PUNTI';renderRank('ranking-list',s.players);
 const active=s.status==='running';$('question-box').hidden=!active;$('phase-card').hidden=active;
 if(s.phase==='lobby'){$('phase-title').textContent='Aspettiamo il via!';$('phase-subtitle').textContent=`${s.players.length} partecipanti pronti. Il formatore avvierà la prima domanda.`;}
 if(s.phase==='finished')return renderEnd(s);
 if(!active)return;
 const q=s.question;if(!q)return;const key=q.id;
 if(key!==current.lastQuestion){current.lastQuestion=key;current.answer=null;current.received=false;current.lastPhase='';spinVisual(q.cat);}
 $('category-label').textContent=q.category;$('question-progress').textContent=`DOMANDA ${s.index+1} / ${s.total}`;$('question-text').textContent=q.q;
 const locked=s.phase!=='open'||Boolean(s.mine?.answered);
 if(s.mine?.answered){current.received=true;current.answer=s.mine.answer;}
 renderOptions('options',q,locked,s.phase==='reveal'?s.reveal?.answer:null);
 $('send-btn').hidden=locked;$('send-btn').disabled=q.type==='order'?(current.answer?.length!==q.items.length):current.answer===null;
 $('answer-note').hidden=false;
 if(s.phase==='reveal'){
  const mine=s.mine;const status=mine?.answered?(mine.correct?'✅ Risposta corretta! +'+mine.points+' punti.':'❌ Non corretta, questa volta.'):'⌛ Non hai risposto in tempo.';
  $('answer-note').innerHTML=`<strong>${esc(status)}</strong><p>${esc(s.reveal?.why||'')}</p><div class="small">Attendi che il formatore passi alla domanda successiva.</div>`;
  $('answer-note').className='notice '+(mine?.correct?'good':'bad');
 }else if(current.received){$('answer-note').textContent='✓ Risposta registrata. Attendi la soluzione e la prossima domanda.';$('answer-note').className='notice good';}
 else{$('answer-note').hidden=true;}
}
function renderAdmin(s){screen('admin');$('admin-room').textContent='STANZA '+s.room;$('big-code').textContent=s.room;$('admin-status').textContent=s.status==='lobby'?'SALA D’ATTESA':s.status==='running'?'IN CORSO':'FINITA';$('connected-count').textContent=s.players.length;renderRank('admin-ranking',s.players);
 $('begin-btn').hidden=s.status!=='lobby';$('finish-btn').hidden=s.status==='finished'||s.status==='lobby';$('admin-question').hidden=s.status!=='running';$('reveal-btn').hidden=s.phase!=='open';$('next-btn').hidden=s.phase!=='reveal';
 if(s.status==='finished')return renderEnd(s);
 $('admin-hint').textContent=s.status==='lobby'?`Attendi i partecipanti (${s.players.length} collegati), poi avvia la partita.`:s.phase==='open'?'Il timer scorre: puoi mostrare la soluzione prima della scadenza.':'Soluzione visibile: commenta, poi passa alla domanda successiva.';
 if(s.status==='running'&&s.question){const q=s.question;$('admin-category').textContent=q.category;$('admin-progress').textContent=`DOMANDA ${s.index+1}/${s.total}`;$('admin-question-text').textContent=q.q;$('received-count').textContent=`Risposte ricevute: ${s.answeredCount}/${s.players.length}`;
 $('admin-options').innerHTML=makeOptions(q).map((o,i)=>`<div class="option ${s.phase==='reveal'&&(q.type==='order'?false:s.reveal?.answer===o.v)?'right':''}"><b>${String.fromCharCode(65+i)}</b><span>${esc(o.text)}</span></div>`).join('');
 $('admin-reveal').hidden=s.phase!=='reveal';if(s.phase==='reveal'){
  const right=q.type==='order'?q.items.slice().sort((a,b)=>a.index-b.index).map(o=>o.text).join(' → '):(q.options[s.reveal.answer]||'');
  $('admin-reveal').innerHTML=`<strong>✅ Soluzione: ${esc(right)}</strong><p>${esc(s.reveal.why)}</p>`;}
 }
}
function renderStats(s){$('end-stats').innerHTML=(s.stats||[]).map(x=>{const pct=x.total?Math.round(x.correct*100/x.total):0;return `<div class="stat-row"><div class="stat-header"><span>${esc(x.label)}</span><strong>${x.correct}/${x.total}</strong></div><div class="stat-bar"><div style="width:${pct}%"></div></div></div>`;}).join('')||'<p class="muted">Report individuale non disponibile.</p>';}
function renderEnd(s){screen('end');renderRank('end-ranking',s.players);renderStats(s);$('save-report').hidden=current.role==='admin';}
function updateClock(){const s=current.state;if(!s||s.status!=='running'||!s.deadline)return;const remaining=s.deadline-(Date.now()-(s.serverNow?current.clockOffset:0));const t=asTime(remaining);$('question-timer').textContent=t;$('admin-timer').textContent=t;}
async function refresh(){if(!current.role||!current.room)return;try{const s=await request(`/api/games/${current.room}/state`);current.state=s;current.clockOffset=s.serverNow-Date.now();if(current.role==='admin')renderAdmin(s);else renderPlayer(s);updateClock();}catch(e){toast(e.message);if(/autorizzat|identificazion/i.test(e.message)){localStorage.removeItem('cervellone-live-session');reset();screen('home');}}}
async function action(name,body){try{await request(`/api/games/${current.room}/${name}`,'POST',body);await refresh();}catch(e){toast(e.message);}}
$('create-btn').onclick=async()=>{try{const d=await request('/api/games','POST',{total:Number($('total-in').value),seconds:Number($('seconds-in').value)});current.role='admin';current.room=d.room;current.token=d.adminToken;current.me=null;persist();await refresh();toast('Partita creata: condividi il codice '+d.room);}catch(e){toast(e.message);}};
$('join-btn').onclick=async()=>{let room=$('room-in').value.trim().toUpperCase();const nickname=$('nick-in').value.trim();if(room.length<6||nickname.length<2){toast('Inserisci un codice stanza e un nickname di almeno 2 caratteri.');return;}try{const d=await request(`/api/games/${encodeURIComponent(room)}/join`,'POST',{nickname});current.role='player';current.room=d.room;current.token=d.playerToken;current.me=d.playerId;persist();await refresh();}catch(e){toast(e.message);}};
$('send-btn').onclick=async()=>{const q=current.state?.question;if(!q||current.answer===null)return;$('send-btn').disabled=true;try{await request(`/api/games/${current.room}/answer`,'POST',{questionId:q.id,answer:current.answer});current.received=true;await refresh();}catch(e){toast(e.message);await refresh();}};
$('begin-btn').onclick=()=>action('start');$('reveal-btn').onclick=()=>action('reveal');$('next-btn').onclick=()=>action('next');$('finish-btn').onclick=()=>{if(confirm('Vuoi terminare la partita e mostrare la classifica finale?'))action('finish');};
$('copy-link').onclick=async()=>{const url=new URL(window.location.href);url.searchParams.set('room',current.room);const link=url.toString();try{await navigator.clipboard.writeText(link);toast('Link copiato. Invialo ai partecipanti.');}catch{prompt('Copia questo link:',link);}};
$('save-report').onclick=()=>{const s=current.state;if(!s)return;const lines=['Il Cervellone IA LIVE · Report individuale',`Partita: ${s.room}`,`Nickname: ${s.me?.nickname||''}`,`Punti: ${s.me?.score||0}`,'', 'Argomento;Risposte esatte;Risposte date',...(s.stats||[]).map(x=>`${x.label};${x.correct};${x.total}`)];const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`cervellone-report-${s.room}.csv`;a.click();URL.revokeObjectURL(a.href);};
const saved=(()=>{try{return JSON.parse(localStorage.getItem('cervellone-live-session')||'null');}catch{return null;}})();
if(saved?.role==='admin'&&saved.room&&saved.token){$('resume-admin').hidden=false;$('resume-admin').onclick=async()=>{current.role='admin';current.room=saved.room;current.token=saved.token;await refresh();};}
const inputRoom=new URLSearchParams(location.search).get('room');if(inputRoom)$('room-in').value=inputRoom.toUpperCase();
if(saved?.role==='player'&&saved.room&&saved.token){current.role='player';current.room=saved.room;current.token=saved.token;current.me=saved.me;refresh();}
else if(saved?.role==='admin'&&new URLSearchParams(location.search).has('regia')){current.role='admin';current.room=saved.room;current.token=saved.token;refresh();}
renderLegend();setInterval(()=>{if(current.role)refresh();},2600);setInterval(updateClock,230);
