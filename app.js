// =====================
// APP.JS — Lógica principal do Votoraty
// =====================

// === FIREBASE CONFIG ===
// =====================
// FIREBASE CONFIG
// =====================
// Preencha com os dados do seu projeto Firebase:
// Firebase Console → Configurações do projeto → Seus apps → SDK Config
const FIREBASE_CONFIG = {
  apiKey:            "SUA_API_KEY",
  authDomain:        "SEU_PROJETO.firebaseapp.com",
  projectId:         "SEU_PROJETO",
  storageBucket:     "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID"
};

let _auth = null, _db = null, _listener = null;
(function initFirebase(){
  try {
    if(FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith('SUA_')){
      firebase.initializeApp(FIREBASE_CONFIG);
      _auth = firebase.auth();
      _db   = firebase.firestore();
      // Se já estava logado, entra direto
      _auth.onAuthStateChanged(async user => {
        if(user && !perfilAtual){
          const snap = await _db.collection('usuarios').doc(user.uid).get().catch(()=>null);
          if(snap && snap.exists){
            const role = snap.data().role;
            entrar(role);
          }
        }
      });
    }
  } catch(e){ console.warn('[Firebase] Não inicializado:', e.message); }
})();

async function loginFirebase(){
  const email = (document.getElementById('fb-email')||{}).value||'';
  const pass  = (document.getElementById('fb-pass')||{}).value||'';
  if(!_auth){ mostrarErroLogin('Firebase não configurado. Use o Modo Demo abaixo.'); return; }
  if(!email||!pass){ mostrarErroLogin('Preencha email e senha.'); return; }
  setLoginLoading(true);
  try {
    const cred = await _auth.signInWithEmailAndPassword(email.trim(), pass);
    const snap = await _db.collection('usuarios').doc(cred.user.uid).get();
    if(!snap.exists){ mostrarErroLogin('Usuário sem perfil cadastrado. Fale com o administrador.'); await _auth.signOut(); return; }
    const role = snap.data().role;
    // Carrega dados do Firestore antes de entrar
    await carregarFirestore();
    entrar(role);
  } catch(e){
    const msg = e.code==='auth/wrong-password'||e.code==='auth/user-not-found'||e.code==='auth/invalid-credential'
      ? 'Email ou senha incorretos.' : 'Erro ao conectar. Tente novamente.';
    mostrarErroLogin(msg);
  } finally { setLoginLoading(false); }
}

function mostrarErroLogin(msg){
  const el = document.getElementById('login-erro');
  if(el){ el.textContent=msg; el.style.display='block'; }
  setTimeout(()=>{ if(el) el.style.display='none'; }, 4000);
}
function setLoginLoading(on){
  const bt  = document.getElementById('btn-login-txt');
  const ld  = document.getElementById('btn-login-load');
  const btn = document.getElementById('btn-login');
  if(bt) bt.style.display = on?'none':'inline';
  if(ld) ld.style.display = on?'inline':'none';
  if(btn) btn.disabled = on;
}

// Salva no Firestore (assíncrono, sem bloquear a UI)
function salvarFirestore(){
  if(!_db) return;
  _db.collection('escola').doc('votoraty').set({
    stats: STATS,
    habilidades: HABILIDADES,
    fichas: FICHAS,
    jogos_agendados: JOGOS_AGENDADOS,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge:true }).catch(e=>console.warn('[Firestore] Erro ao salvar:', e));
}

// Carrega dados do Firestore
async function carregarFirestore(){
  if(!_db) return false;
  try {
    const doc = await _db.collection('escola').doc('votoraty').get();
    if(!doc.exists) return false;
    const d = doc.data();
    if(d.stats)           Object.assign(STATS, d.stats);
    if(d.habilidades)     Object.assign(HABILIDADES, d.habilidades);
    if(d.fichas)          Object.assign(FICHAS, d.fichas);
    if(d.jogos_agendados){ JOGOS_AGENDADOS.length=0; d.jogos_agendados.forEach(j=>JOGOS_AGENDADOS.push(j)); }
    return true;
  } catch(e){ return false; }
}

// Listener em tempo real para o atleta — atualiza habilidades e jogos ao vivo
function iniciarListenerAtleta(){
  if(!_db || _listener) return;
  _listener = _db.collection('escola').doc('votoraty').onSnapshot(doc=>{
    if(!doc.exists) return;
    const d = doc.data();
    if(d.habilidades){
      Object.assign(HABILIDADES, d.habilidades);
      const key = ATLETA_DEFAULT.sig + ATLETA_DEFAULT.cat.replace('-','').replace(' ','').toLowerCase();
      atualizarHabilidadesAtleta(key);
    }
    if(d.jogos_agendados){
      JOGOS_AGENDADOS.length=0; d.jogos_agendados.forEach(j=>JOGOS_AGENDADOS.push(j));
    }
  });
}

// === CSS VAR / ENTRAR / PERFIS ===
// =====================
// CSS VAR COLOR
// =====================
function setCor(cor){
  document.documentElement.style.setProperty('--color', cor);
  const sbar = document.getElementById('sbar');
  const hdr = document.getElementById('hdr');
  if(sbar) sbar.style.background = cor;
  if(hdr) hdr.style.background = cor;
  document.querySelectorAll('.btn-g').forEach(b=>b.style.background=cor);
  document.querySelectorAll('.toggle.on').forEach(t=>t.style.background=cor);
}

// =====================
// ENTRAR
// =====================
function entrar(perfil){
  perfilAtual = perfil;
  document.getElementById('tela-inicial').style.display='none';
  document.getElementById('app').style.display='flex';
  const dp = document.getElementById('desktop-panel');
  if(dp) dp.style.display='none';
  const cor = CORES[perfil.replace('prof_','')];
  setCor(cor);
  configurarPerfil(perfil, cor);
  // Listener em tempo real para atleta (dados sincronizados do professor)
  if(perfil === 'atleta') iniciarListenerAtleta();
}

function voltarInicio(){
  if(_perfilAnterior === 'diretor'){
    _perfilAnterior = null;
    entrar('diretor');
  } else {
    sair();
  }
}

function trocarCategoria(catKey){
  if(perfilAtual === 'diretor') _perfilAnterior = 'diretor';
  const cor = CORES[catKey] || '#0d3d1a';
  perfilAtual = 'prof_' + catKey;
  setCor(cor);
  const catData = CATS_DATA[catKey];
  document.getElementById('hdr-title').textContent = 'Prof. ' + catData.nome;
  document.getElementById('hdr-sub').textContent = 'Técnico · ' + catData.nome;
  document.getElementById('cat-pill').textContent = catData.emoji + ' ' + catData.nome;
  document.getElementById('sbar-mid').textContent = catData.nome + ' · Votoraty';
  montarProfessor(catKey, catData, cor);
}

function configurarPerfil(perfil, cor){
  const isProfDir = perfil !== 'atleta';
  const isDir = perfil === 'diretor';
  const catKey = perfil.replace('prof_','');
  const catData = CATS_DATA[catKey];

  // Header
  if(perfil === 'diretor'){
    document.getElementById('hdr-title').textContent = 'Votoraty Academy';
    document.getElementById('hdr-sub').textContent = 'Diretor · acesso total';
    document.getElementById('cat-pill').textContent = '👑 Todas as categorias';
    document.getElementById('sbar-mid').textContent = 'Admin · Votoraty';
  } else if(perfil === 'financeiro'){
    document.getElementById('hdr-title').textContent = 'Financeiro';
    document.getElementById('hdr-sub').textContent = 'Sócios, mensalidades e caixa';
    document.getElementById('cat-pill').textContent = '💰 Gestão financeira';
    document.getElementById('sbar-mid').textContent = 'Financeiro · Votoraty';
  } else if(perfil === 'atleta'){
    document.getElementById('hdr-title').textContent = ATLETA_DEFAULT.nome;
    document.getElementById('hdr-sub').textContent = ATLETA_DEFAULT.pos+' · '+ATLETA_DEFAULT.cat+' · Nível '+ATLETA_DEFAULT.nivel;
    document.getElementById('cat-pill').textContent = '🏃 '+ATLETA_DEFAULT.cat;
    document.getElementById('sbar-mid').textContent = 'Atleta · Votoraty';
  } else {
    document.getElementById('hdr-title').textContent = 'Prof. '+catData.nome;
    document.getElementById('hdr-sub').textContent = 'Técnico · '+catData.nome;
    document.getElementById('cat-pill').textContent = catData.emoji+' '+catData.nome;
    document.getElementById('sbar-mid').textContent = catData.nome+' · Votoraty';
  }

  // Mostra/esconde seletor de categoria
  const sw = document.getElementById('cat-switcher');
  if(sw) sw.style.display = (perfil !== 'atleta' && perfil !== 'diretor' && perfil !== 'financeiro') ? 'block' : 'none';

  // Montar nav e telas
  if(perfil === 'atleta') montarAtleta(cor);
  else if(perfil === 'diretor') montarDiretor(cor);
  else if(perfil === 'financeiro') montarFinanceiro(cor);
  else montarProfessor(catKey, catData, cor);
}

// =====================
// PROFESSOR
// =====================
function montarProfessor(catKey, cat, cor){
  const navItems = ['Chamada','Avaliação','Treino','Mensagem','Atletas','Jogos','Convocações'];
  const bnavItems = [
    {icon:'ti-users',label:'Chamada'},
    {icon:'ti-chart-bar',label:'Avaliar'},
    {icon:'ti-ball-football',label:'Treino'},
    {icon:'ti-message',label:'Mensagem'},
    {icon:'ti-list',label:'Atletas'},
    {icon:'ti-trophy',label:'Jogos'},
    {icon:'ti-flag',label:'Convocar'}
  ];
  montarNav(navItems, cor);
  montarBnav(bnavItems, cor);

  // Seletor de categoria
  const switcher = document.getElementById('cat-switcher');
  const pillsEl  = document.getElementById('cat-switcher-pills');
  if(switcher && pillsEl){
    switcher.style.display = 'block';
    pillsEl.innerHTML =
      `<button onclick="voltarInicio()" title="Voltar"
        style="padding:4px 10px;border-radius:20px;border:1.5px solid rgba(255,255,255,.5);
        background:rgba(255,255,255,.15);color:#fff;font-size:10px;font-weight:700;
        cursor:pointer;display:inline-flex;align-items:center;gap:4px;letter-spacing:.03em">
        <i class="ti ti-arrow-left" style="font-size:11px"></i> ${_perfilAnterior==='diretor'?'Diretor':'Início'}
      </button>` +
      Object.entries(CATS_DATA).map(([k, c]) => {
        const ativo = k === catKey;
        return `<button onclick="trocarCategoria('${k}')"
          style="padding:4px 10px;border-radius:20px;border:1.5px solid ${ativo?'rgba(255,255,255,.9)':'rgba(255,255,255,.25)'};
          background:${ativo?'rgba(255,255,255,.25)':'rgba(255,255,255,.08)'};
          color:${ativo?'#fff':'rgba(255,255,255,.65)'};font-size:10px;font-weight:${ativo?800:600};
          cursor:pointer;letter-spacing:.03em;transition:all .2s">${c.emoji} ${c.nome}</button>`;
      }).join('');
  }

  const sc = document.getElementById('screens');
  sc.innerHTML = `
  <div id="s-0" class="scr on" style="padding:11px 13px;overflow-y:auto">
    ${renderChamada(cat, cor)}
  </div>
  <div id="s-1" class="scr" style="padding:11px 13px;overflow-y:auto">
    ${renderAvaliacao(cat, cor)}
  </div>
  <div id="s-2" class="scr" style="padding:11px 13px;overflow-y:auto">
    ${renderTreino(cor)}
  </div>
  <div id="s-3" class="scr" style="padding:11px 13px;overflow-y:auto">
    ${renderMensagem(cat.nome, false, cor)}
  </div>
  <div id="s-4" class="scr" style="padding:11px 13px;overflow-y:auto">
    ${renderListaAtletas(cat, cor)}
  </div>
  <div id="s-5" class="scr" style="padding:11px 13px;overflow-y:auto">
    ${renderJogosProfessor(cat, cor)}
  </div>
  <div id="s-6" class="scr" style="padding:11px 13px;overflow-y:auto">
    ${renderConvocacoesProfessor(catKey, cat, cor)}
  </div>`;
  setCor(cor);
  chamadas={};
}

function renderJogosProfessor(cat, cor){
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-family:var(--font-display);font-size:20px;letter-spacing:.06em;color:var(--text)">Jogos — ${cat.nome}</span>
    <button class="btn-sm" onclick="abrirModal('modal-jogo')">+ Agendar</button>
  </div>

  <!-- JOGO AO VIVO -->
  <div class="lbl">Ao vivo</div>
  <div class="card" style="border-left:3px solid #c0392b;padding:14px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-size:10px;color:var(--text-3);font-weight:500">${cat.nome} · Camp. Municipal</span>
      <span class="tag tr">🔴 Ao vivo</span>
    </div>

    <!-- PLACAR -->
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:14px">
      <span style="font-size:13px;font-weight:700;flex:1;color:var(--text)">Votoraty</span>
      <div style="display:flex;align-items:center;gap:8px">
        <button onclick="ajustarPlacar('v',-1)" style="width:28px;height:28px;border-radius:50%;border:1.5px solid var(--border);background:#fff;font-size:16px;cursor:pointer;color:var(--text-2);font-weight:700;line-height:1">−</button>
        <span id="placar-v" style="font-family:var(--font-display);font-size:40px;color:var(--text);letter-spacing:.04em;min-width:32px;text-align:center">2</span>
        <span style="font-size:18px;color:var(--text-3)">×</span>
        <span id="placar-a" style="font-family:var(--font-display);font-size:40px;color:var(--text);letter-spacing:.04em;min-width:32px;text-align:center">1</span>
        <button onclick="ajustarPlacar('a',-1)" style="width:28px;height:28px;border-radius:50%;border:1.5px solid var(--border);background:#fff;font-size:16px;cursor:pointer;color:var(--text-2);font-weight:700;line-height:1">−</button>
      </div>
      <span style="font-size:13px;font-weight:700;flex:1;text-align:right;color:var(--text)">Rapid FC</span>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button onclick="ajustarPlacar('v',1)" style="flex:1;background:#0d3d1a;color:#fff;border:none;padding:8px;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer">⚽ + Gol Votoraty</button>
      <button onclick="ajustarPlacar('a',1)" style="flex:1;background:#fcebeb;color:#8b1a1a;border:none;padding:8px;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer">+ Gol adv.</button>
    </div>

    <!-- GOLS POR ATLETA -->
    <div class="lbl" style="margin-top:4px">Quem fez o gol?</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
      ${cat.atletas.map(a=>`
      <button onclick="registrarGolAtleta('${a.nome}','${a.sig}','${a.pos}','${cat.nome}','${cor}')"
        style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:20px;border:1.5px solid var(--border);background:#fff;cursor:pointer;font-size:10px;font-weight:600;color:var(--text);transition:all .15s"
        onmouseover="this.style.background='${cor}';this.style.color='#fff';this.style.borderColor='${cor}'"
        onmouseout="this.style.background='#fff';this.style.color='var(--text)';this.style.borderColor='var(--border)'">
        <div style="width:22px;height:22px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff">${a.sig}</div>
        ${a.nome.split(' ')[0]}
      </button>`).join('')}
    </div>

    <!-- TEMPO -->
    <div style="display:flex;gap:6px">
      <button onclick="showN('⏱️ Jogo encerrado! Resultado salvo e atletas notificados.')" style="flex:1;background:var(--surface);border:1px solid var(--border);color:var(--text-2);padding:8px;border-radius:9px;font-size:11px;font-weight:600;cursor:pointer">Encerrar jogo</button>
      <button onclick="showN('📢 Intervalo! Recado enviado aos atletas.')" style="flex:1;background:var(--surface);border:1px solid var(--border);color:var(--text-2);padding:8px;border-radius:9px;font-size:11px;font-weight:600;cursor:pointer">Intervalo</button>
    </div>
  </div>

  <!-- PRÓXIMOS JOGOS -->
  <div class="lbl">Próximos jogos</div>
  <div id="lista-jogos-agendados">${renderListaJogosAgendados()}</div>

  <!-- RESULTADOS ANTERIORES -->
  <div class="lbl">Últimos resultados</div>
  ${JOGOS_RESULTADOS.map(r=>{
    const win = r.resultado==='Vitória';
    return `<div class="card" style="border-left:3px solid ${win?'#1a5c26':'#8b1a1a'}">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:10px;color:var(--text-3);font-weight:500">${r.data} · ${r.cat}</span>
        <span class="tag ${win?'tg':'tr'}">${r.resultado}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <span style="font-size:12px;font-weight:700;flex:1;color:var(--text)">Votoraty</span>
        <span style="font-family:var(--font-display);font-size:28px;color:var(--text);letter-spacing:.04em">${r.gv}</span>
        <span style="font-size:14px;color:var(--text-3)">×</span>
        <span style="font-family:var(--font-display);font-size:28px;color:var(--text);letter-spacing:.04em">${r.ga}</span>
        <span style="font-size:12px;font-weight:700;flex:1;text-align:right;color:var(--text)">${r.adv}</span>
      </div>
    </div>`;
  }).join('')}`;
}

// =====================
// CONVOCAÇÕES — Professor
// =====================
function renderConvocacoesProfessor(catKey, cat, cor){
  const atletas = cat.atletas || [];
  const rows = atletas.map(a => {
    const key = a.sig + catKey;
    const convocado = FICHAS[key]?.convocado ?? false;
    return `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0ede8">
      <div class="av" style="width:32px;height:32px;font-size:11px;background:${cor}">${a.sig}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700">${a.nome}</div>
        <div style="font-size:9px;color:var(--text-3)">${a.pos} · ${a.pres}% presença</div>
      </div>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
        <input type="checkbox" id="chk-conv-${a.sig}" ${convocado?'checked':''} onchange="toggleConvocado('${a.sig}','${catKey}',this.checked)"
          style="width:18px;height:18px;accent-color:${cor};cursor:pointer">
        <span style="font-size:11px;font-weight:700;color:${convocado?cor:'#aaa'}" id="lbl-conv-${a.sig}">${convocado?'Convocado':'Disponível'}</span>
      </label>
    </div>`;
  });
  const convocados = atletas.filter(a => FICHAS[a.sig+catKey]?.convocado).length;
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <span style="font-family:var(--font-display);font-size:20px;letter-spacing:.06em;color:var(--text)">Convocar — ${cat.nome}</span>
    <span style="font-size:11px;font-weight:700;color:${cor}">${convocados}/${atletas.length} selecionados</span>
  </div>
  <div class="card" style="padding:4px 12px;margin-bottom:14px">
    ${rows.join('')}
  </div>
  <button class="btn-g" style="background:${cor}" onclick="salvarConvocacoesProfessor('${catKey}')">
    ✅ Confirmar convocação
  </button>`;
}

function toggleConvocado(sig, catKey, convocado){
  const key = sig + catKey;
  if(!FICHAS[key]) FICHAS[key] = {};
  FICHAS[key].convocado = convocado;
  const lbl = document.getElementById('lbl-conv-'+sig);
  if(lbl){ lbl.textContent = convocado ? 'Convocado' : 'Disponível'; }
}

function salvarConvocacoesProfessor(catKey){
  const cat = CATS_DATA[catKey];
  if(!cat) return;
  let count = 0;
  (cat.atletas||[]).forEach(a => {
    const chk = document.getElementById('chk-conv-'+a.sig);
    if(!FICHAS[a.sig+catKey]) FICHAS[a.sig+catKey] = {};
    FICHAS[a.sig+catKey].convocado = chk ? chk.checked : false;
    if(FICHAS[a.sig+catKey].convocado) count++;
  });
  salvarLS();
  showN('✅ Convocação salva! '+count+' atleta(s) convocado(s) para o próximo jogo.');
}


// === PROFESSOR — chamada, avaliação, treino, mensagem ===
// Controle do placar ao vivo
let placarV = 2, placarA = 1;
function ajustarPlacar(time, delta){
  if(time==='v') placarV = Math.max(0, placarV+delta);
  else placarA = Math.max(0, placarA+delta);
  const elV = document.getElementById('placar-v');
  const elA = document.getElementById('placar-a');
  if(elV) elV.textContent = placarV;
  if(elA) elA.textContent = placarA;
}

function registrarGolAtleta(nome, sig, pos, cat, cor){
  placarV++;
  const el = document.getElementById('placar-v');
  if(el) el.textContent = placarV;
  // Abre modal para confirmar quantos gols
  abrirLancarGol(nome, sig, pos, cat, cor);
  showN('⚽ Gol de '+nome+'! Placar: '+placarV+'×'+placarA);
}

function renderChamada(cat, cor){
  // Guarda meta para salvarChamada saber sig e catKey de cada atleta
  const catKey = Object.entries(CATS_DATA).find(([k,c])=>c===cat)?.[0] || 'sub13';
  window._chamadaMeta = { catKey, atletas: cat.atletas.map(a=>({sig:a.sig, nome:a.nome})) };

  let rows = cat.atletas.map((a,i)=>{
    const pc = a.pres>=85?'#27500a':a.pres>=70?'#854f0b':'#a32d2d';
    const fichaKey = a.sig + catKey;
    const temCondicaoMedica = FICHAS[fichaKey]?.ficha_medica?.condicoes;
    return `<div class="cr-item">
      <div class="av" style="width:32px;height:32px;font-size:11px;background:${cor}">${a.sig}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700">${a.nome}${temCondicaoMedica ? ` <span style="color:#e74c3c;cursor:help" title="Atenção: condição médica — ver ficha">⚕️</span>` : ''}</div>
        <div style="font-size:9px;color:#aaa">${a.pos} · <span style="color:${pc}">${a.pres}% presença</span></div>
      </div>
      <div style="display:flex;gap:4px">
        <button class="crb crb-p" onclick="marcC('c${i}','P',this,'${cor}')" id="cp-c${i}">P</button>
        <button class="crb crb-f" onclick="marcC('c${i}','F',this,'${cor}')" id="cf-c${i}">F</button>
      </div>
    </div>`;
  }).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <span style="font-size:12px;font-weight:700">Chamada — ${cat.nome}</span>
    <span style="font-size:10px;color:#aaa" id="cnt-c">0/${cat.atletas.length}</span>
  </div>
  <div style="background:#eee;border-radius:3px;height:4px;margin-bottom:10px"><div id="prog-c" style="height:4px;border-radius:3px;background:${cor};width:0;transition:width .3s"></div></div>
  ${rows}
  <button class="btn-g" style="background:${cor}" onclick="salvarChamada(${cat.atletas.length})">Salvar chamada e notificar pais</button>`;
}

function marcC(id,tipo,el,cor){
  chamadas[id]=tipo;
  document.getElementById('cp-'+id).classList.toggle('on',tipo==='P');
  document.getElementById('cp-'+id).style.background = tipo==='P'?cor:'#eaf3de';
  document.getElementById('cp-'+id).style.color = tipo==='P'?'#fff':'#27500a';
  document.getElementById('cf-'+id).classList.toggle('on',tipo==='F');
  const t=Object.keys(chamadas).length;
  const all=document.querySelectorAll('.cr-item').length;
  document.getElementById('cnt-c').textContent=t+'/'+all;
  document.getElementById('prog-c').style.width=(t/all*100)+'%';
}

// Histórico de presença acumulado (conecta chamada → financeiro)
if(!window.PRESENCA_HIST) window.PRESENCA_HIST = {};

// Status de arbitragem por categoria (conecta financeiro → professor)
if(!window.ARBITRAGEM_STATUS) window.ARBITRAGEM_STATUS = {
  sub7: [{sig:'AS',pago:true},{sig:'BL',pago:true},{sig:'DT',pago:false}],
  sub9: [{sig:'EF',pago:true},{sig:'FA',pago:false},{sig:'HC',pago:true}],
  sub11: [{sig:'LF',pago:true},{sig:'IN',pago:false},{sig:'JL',pago:true},{sig:'KP',pago:false}],
  sub13: [{sig:'KT',pago:true},{sig:'PA',pago:false},{sig:'RC',pago:true},{sig:'TN',pago:true}],
  sub15: [{sig:'MT',pago:true},{sig:'NF',pago:false},{sig:'OL',pago:true},{sig:'QR',pago:true}]
};

function salvarChamada(total){
  const p=Object.values(chamadas).filter(v=>v==='P').length;
  const f=Object.values(chamadas).filter(v=>v==='F').length;

  const algumPresente = p > 0;
  if(p+f > 0) addTreino(algumPresente);

  const hoje = new Date().toISOString().split('T')[0];
  const meta = window._chamadaMeta || {};
  const catAtiva = meta.catKey || 'sub13';

  // Salva totais no PRESENCA_HIST (para gráfico financeiro)
  if(!window.PRESENCA_HIST[catAtiva]) window.PRESENCA_HIST[catAtiva] = [];
  const hojeFormatado = new Date().toLocaleDateString('pt-BR');
  window.PRESENCA_HIST[catAtiva].push({data: hojeFormatado, presentes: p, faltas: f, total: total});
  // Mantém apenas os últimos 30 registros
  if(window.PRESENCA_HIST[catAtiva].length > 30) window.PRESENCA_HIST[catAtiva] = window.PRESENCA_HIST[catAtiva].slice(-30);

  // Salva histórico individual de cada atleta em FICHAS
  if(meta.atletas){
    meta.atletas.forEach((a, i) => {
      const chave = 'c'+i;
      const status = chamadas[chave] || 'N'; // P, F ou N (não marcado)
      const ficKey = a.sig + catAtiva;
      if(!FICHAS[ficKey]) FICHAS[ficKey] = {};
      if(!FICHAS[ficKey].hist_presenca) FICHAS[ficKey].hist_presenca = [];
      FICHAS[ficKey].hist_presenca.push({ data: hoje, status });
    });
  }

  salvarLS();
  showN('✓ Chamada salva! '+p+' presentes · '+f+' faltas · Pais notificados');
}

function renderAvaliacao(cat, cor){
  return cat.atletas.map((a,i)=>`
  <div style="border:1px solid #eee;border-radius:10px;margin-bottom:8px;overflow:hidden">
    <div style="display:flex;align-items:center;gap:9px;padding:9px 12px;cursor:pointer;background:#fff" onclick="togAv(${i})">
      <div class="av" style="width:30px;height:30px;font-size:10px;background:${cor}">${a.sig}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:700">${a.nome}</div><div style="font-size:9px;color:#aaa">${a.pos}</div></div>
      <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:6px;background:#fcebeb;color:#791f1f" id="avb-${i}">pendente</span>
    </div>
    <div id="avd-${i}" style="display:none;padding:10px 12px;border-top:1px solid #eee;background:#fafaf9">
      <div class="bav-row">
        <button class="bav" style="background:#eaf3de;color:#27500a" onclick="setAvB(${i},'Ótimo',this,'#eaf3de','#27500a')">⭐ Ótimo</button>
        <button class="bav" style="background:#e6f1fb;color:#0c447c" onclick="setAvB(${i},'Bem',this,'#e6f1fb','#0c447c')">👍 Bem</button>
        <button class="bav" style="background:#faeeda;color:#633806" onclick="setAvB(${i},'Atenção',this,'#faeeda','#633806')">⚠️ Atenção</button>
      </div>
      <div class="chips">
        <span class="chip" onclick="this.classList.toggle('on')" style="--color:${cor}">Boa finalização</span>
        <span class="chip" onclick="this.classList.toggle('on')">Passe melhorou</span>
        <span class="chip" onclick="this.classList.toggle('on')">Marcação fraca</span>
        <span class="chip" onclick="this.classList.toggle('on')">Ótima atitude</span>
        <span class="chip" onclick="this.classList.toggle('on')">Cansado</span>
        <span class="chip" onclick="this.classList.toggle('on')">Desatento</span>
        <span class="chip" onclick="this.classList.toggle('on')">Liderança</span>
        <span class="chip" onclick="this.classList.toggle('on')">Veloz hoje</span>
      </div>
      <textarea style="width:100%;font-size:11px;padding:6px 9px;border-radius:7px;border:1px solid #ddd;background:#fff;resize:none;height:44px;font-family:system-ui" placeholder="Nota livre (opcional)..."></textarea>
    </div>
  </div>`).join('')
  + `<button class="btn-g" onclick="salvarAvaliacoes()">Salvar avaliações</button>`;
}

function togAv(i){const d=document.getElementById('avd-'+i);d.style.display=d.style.display==='none'?'block':'none';}
function setAvB(i,txt,el,bg,cor){
  el.closest('.bav-row').querySelectorAll('.bav').forEach(b=>b.style.fontWeight='600');
  el.style.fontWeight='700';el.style.border='1.5px solid '+cor;
  const b=document.getElementById('avb-'+i);b.textContent=txt;b.style.background=bg;b.style.color=cor;
}

function renderTreino(cor){
  return `<div class="lbl">Tipo de treino</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
    ${[['tec','ti-ball-football','#eaf3de','#3b6d11','#27500a','Técnico'],
       ['tat','ti-chess','#e6f1fb','#185fa5','#0c447c','Tático'],
       ['fis','ti-run','#faeeda','#854f0b','#633806','Físico'],
       ['col','ti-users','#eeedfe','#534ab7','#3c3489','Coletivo'],
       ['gol','ti-hand-stop','#fbeaf0','#993556','#72243e','Goleiro'],
       ['pre','ti-trophy','#fcebeb','#a32d2d','#791f1f','Preparação']
    ].map(([k,ic,bg,ic_c,tc,nm])=>`
    <div id="tc-${k}" onclick="selTipoT(this,'${cor}')" style="border-radius:9px;padding:9px 5px;text-align:center;border:1.5px solid transparent;cursor:pointer;background:${bg};transition:all .15s">
      <i class="ti ${ic}" style="font-size:19px;color:${ic_c};display:block;margin-bottom:3px"></i>
      <span style="font-size:9px;font-weight:700;color:${tc}">${nm}</span>
    </div>`).join('')}
  </div>
  <div class="lbl">Intensidade</div>
  <div style="display:flex;gap:6px;margin-bottom:10px">
    <button class="bav" style="background:#e6f1fb;color:#0c447c" onclick="selIntT(this,'${cor}')">Leve</button>
    <button class="bav" style="background:#eaf3de;color:#27500a" onclick="selIntT(this,'${cor}')">Médio</button>
    <button class="bav" style="background:#fcebeb;color:#791f1f" onclick="selIntT(this,'${cor}')">Intenso</button>
  </div>
  <div class="lbl">Habilidades trabalhadas</div>
  <div class="chips">
    ${['Passe curto','Passe longo','Finalização','Drible','Domínio','Cabeceio','Marcação','Posicionamento','Velocidade','Bola parada','Transição','Trabalho em equipe'].map(h=>`<span class="chip" onclick="this.classList.toggle('on')">${h}</span>`).join('')}
  </div>
  <div class="lbl">Como foi o treino?</div>
  <div style="display:flex;gap:6px;margin-bottom:10px">
    <button class="bav" style="background:#eaf3de;color:#27500a" onclick="selIntT(this,'${cor}')">Ótimo</button>
    <button class="bav" style="background:#e6f1fb;color:#0c447c" onclick="selIntT(this,'${cor}')">Bom</button>
    <button class="bav" style="background:#faeeda;color:#633806" onclick="selIntT(this,'${cor}')">Regular</button>
  </div>
  <div class="field"><label>Observação (opcional)</label><textarea placeholder="Ex: Grupo focado. Evoluiu no passe curto..."></textarea></div>
  <button class="btn-g" style="background:${cor}" onclick="publicarTreino('${cor}')">Publicar treino</button>`;
}

function selTipoT(el,cor){
  document.querySelectorAll('[id^="tc-"]').forEach(c=>{c.style.transform='';c.style.border='1.5px solid transparent';});
  el.style.transform='scale(1.05)';el.style.border='1.5px solid '+cor;
}
function selIntT(el,cor){
  el.closest('div').querySelectorAll('.bav').forEach(b=>{b.style.border='1.5px solid transparent';b.style.fontWeight='600';});
  el.style.border='1.5px solid '+cor;el.style.fontWeight='700';
}

// =====================
// INJETAR NO FEED DO ATLETA
// =====================
function injetarFeed(cor, titulo, corpo, rodape){
  const feed = document.getElementById('feed-msgs');
  if(!feed) return;
  const item = document.createElement('div');
  item.className = 'card';
  item.style.cssText = 'border-left:3px solid '+cor+';margin-bottom:8px';
  item.innerHTML = `<div style="font-size:9px;font-weight:700;color:${cor};margin-bottom:3px">${titulo}</div>
    <div style="font-size:11px;color:var(--text);line-height:1.6">${corpo}</div>
    <div style="font-size:9px;color:var(--text-3);margin-top:4px">${rodape}</div>`;
  feed.insertBefore(item, feed.firstChild);
}

function salvarAvaliacoes(){
  const badges = document.querySelectorAll('[id^="avb-"]');
  const avs = [];
  badges.forEach(b=>{
    if(b.textContent !== 'pendente') avs.push(b.textContent);
  });
  const resumo = avs.length > 0 ? avs.join(' · ') : 'Sem avaliações preenchidas';
  const hoje = new Date().toISOString().split('T')[0];
  const meta = window._chamadaMeta || {};
  const catAtiva = meta.catKey || 'sub13';

  // Persiste avaliação individual por atleta em FICHAS
  if(meta && Array.isArray(meta.atletas) && meta.atletas.length > 0){
    meta.atletas.forEach((a, i) => {
      const badge = document.getElementById('avb-'+i);
      if(badge && badge.textContent !== 'pendente'){
        const ficKey = a.sig + catAtiva;
        if(!FICHAS[ficKey]) FICHAS[ficKey] = {};
        if(!FICHAS[ficKey].hist_avaliacoes) FICHAS[ficKey].hist_avaliacoes = [];
        const chips = [...document.querySelectorAll('#avd-'+i+' .chip.on')].map(c=>c.textContent);
        const nota = document.querySelector('#avd-'+i+' textarea')?.value?.trim() || '';
        FICHAS[ficKey].hist_avaliacoes.push({ data: hoje, conceito: badge.textContent, chips, nota });
      }
    });
    salvarLS();
  }

  injetarFeed('#185fa5','📋 AVALIAÇÃO DO TÉCNICO',
    'O técnico registrou avaliação do treino de hoje: <strong>'+resumo+'</strong>',
    'agora · avaliação');
  showN('✓ Avaliações salvas! Atletas notificados.');
}

function publicarTreino(cor){
  // Coleta tipo de treino selecionado
  const tipoEl = document.querySelector('[id^="tc-"][style*="scale"]');
  const tipo = tipoEl ? tipoEl.querySelector('span')?.textContent || 'Treino' : 'Treino';
  // Coleta intensidade selecionada
  const intEl = document.querySelector('.bav[style*="font-weight: 700"], .bav[style*="font-weight:700"]');
  const intens = intEl ? intEl.textContent.trim() : '';
  // Coleta habilidades selecionadas
  const chips = [...document.querySelectorAll('.chip.on')].map(c=>c.textContent).filter(t=>t.length<20);
  const habStr = chips.length > 0 ? chips.slice(0,3).join(', ') : 'variadas';
  const corpo = `<strong>${tipo}</strong>${intens?' · '+intens:''} · Habilidades trabalhadas: ${habStr}.`;
  injetarFeed(cor, '⚽ TREINO DE HOJE · Técnico', corpo, 'agora · publicado pelo técnico');
  showN('✓ Treino publicado! Atletas e pais notificados.');
}

function renderMensagem(catNome, isDir, cor){
  return `<div class="lbl">Mensagem para ${catNome}</div>
  ${isDir?`<div class="lbl" style="margin-bottom:5px">Para qual categoria</div>
  <div class="chips" id="dest-chips">
    <span class="chip on" onclick="selDest(this)">Todas</span>
    <span class="chip" onclick="selDest(this)">Sub-7</span>
    <span class="chip" onclick="selDest(this)">Sub-9</span>
    <span class="chip" onclick="selDest(this)">Sub-11</span>
    <span class="chip" onclick="selDest(this)">Sub-13</span>
    <span class="chip" onclick="selDest(this)">Sub-15</span>
  </div>`:''}
  <div class="lbl">Mensagens rápidas</div>
  <div class="chips">
    ${['Ótimo treino hoje! 👏','Treino confirmado para amanhã.','Jogo neste sábado — chegue 30min antes.','Não esqueçam de estudar hoje! 📚','Bebam bastante água! 💧','Tragam uniforme e chuteira.','Treino cancelado hoje por chuva.','Parabéns pelo jogo! 🏆'].map(m=>`<span class="chip" onclick="setMsgQ('${m}')">${m}</span>`).join('')}
  </div>
  <div class="field"><label>Tipo</label>
    <select><option>📢 Aviso geral</option><option>⚽ Sobre treino</option><option>🏆 Sobre jogo</option><option>📚 Estudos</option><option>💧 Saúde</option><option>💰 Financeiro</option><option>🎉 Parabéns</option><option>⚠️ Urgente</option></select>
  </div>
  <div class="field"><label>Mensagem</label><textarea id="msg-txt" placeholder="Escreva aqui..."></textarea></div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:9px">
    <input type="checkbox" id="cc-pais" style="width:14px;height:14px" checked>
    <label for="cc-pais" style="font-size:11px;color:#555">Enviar também para os pais</label>
  </div>
  <button class="btn-g" style="background:${cor}" onclick="enviarMsg()">Enviar mensagem</button>
  <div class="lbl" style="margin-top:10px">Último enviado</div>
  <div class="card" style="padding:9px 11px">
    <div style="font-size:10px;font-weight:700;color:${cor};margin-bottom:3px">${catNome}</div>
    <div style="font-size:11px;color:#333">Treino confirmado para sábado às 08h. Não faltem!</div>
    <div style="font-size:9px;color:#aaa;margin-top:4px">2h · 47 receberam</div>
  </div>`;
}

function setMsgD(txt){const el=document.getElementById('msg-d-txt');if(el)el.value=txt;}
function setMsgQ(txt){const el=document.getElementById('msg-txt');if(el)el.value=txt;}

// =====================
// HABILIDADES
// =====================
let habAtualKey = null;

function abrirHabilidades(nome, sig, pos, cat, catKey, cor){
  habAtualKey = sig+catKey;
  document.getElementById('hab-av').textContent = sig;
  document.getElementById('hab-av').style.background = cor;
  document.getElementById('hab-nome').textContent = nome;
  document.getElementById('hab-info').textContent = pos + ' · ' + cat;
  document.getElementById('hab-btn').style.background = cor;

  const vals = HABILIDADES[habAtualKey] || {fin:50,dri:50,vel:50,pas:50,mar:50,ati:50};

  document.getElementById('hab-sliders').innerHTML = Object.entries(HAB_LABELS).map(([k,label])=>{
    const val = vals[k] || 50;
    const c = val>=75?'#0d3d1a':val>=50?'#b8860b':'#c0392b';
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:12px;font-weight:600;color:var(--text)">${HAB_ICONS[k]} ${label}</span>
        <span id="hab-val-${k}" style="font-family:var(--font-display);font-size:20px;font-weight:400;color:${c};min-width:36px;text-align:right;letter-spacing:.04em">${val}</span>
      </div>
      <input type="range" min="0" max="100" value="${val}" id="hab-sl-${k}"
        oninput="atualizarSlider('${k}','${cor}')"
        style="width:100%;height:6px;border-radius:3px;accent-color:${cor};cursor:pointer">
      <div style="display:flex;justify-content:space-between;margin-top:3px">
        <span style="font-size:9px;color:var(--text-3)">Iniciante</span>
        <span style="font-size:9px;color:var(--text-3)">Elite</span>
      </div>
    </div>`;
  }).join('');

  abrirModal('modal-hab');
}

function atualizarSlider(k, cor){
  const val = parseInt(document.getElementById('hab-sl-'+k).value);
  const c = val>=75?'#0d3d1a':val>=50?'#b8860b':'#c0392b';
  const el = document.getElementById('hab-val-'+k);
  el.textContent = val;
  el.style.color = c;
}

function salvarHabilidades(){
  if(!habAtualKey) return;
  const novo = {};
  Object.keys(HAB_LABELS).forEach(k=>{
    novo[k] = parseInt(document.getElementById('hab-sl-'+k).value);
  });
  HABILIDADES[habAtualKey] = novo;
  salvarLS();
  fecharModal('modal-hab');
  const nome = document.getElementById('hab-nome').textContent;
  showN('✓ Habilidades de '+nome+' atualizadas!');
  // Atualiza barras na tela do atleta em tempo real
  atualizarHabilidadesAtleta(habAtualKey);
}

function atualizarHabilidadesAtleta(key){
  const hab = HABILIDADES[key];
  if(!hab) return;
  Object.keys(HAB_LABELS).forEach(k=>{
    const val = hab[k] || 70;
    const c = val>=75?'#0d3d1a':val>=50?'#b8860b':'#c0392b';
    const bar = document.getElementById('ev-bar-'+k);
    const valEl = document.getElementById('ev-val-'+k);
    if(bar){ bar.style.width=val+'%'; bar.style.background=c; }
    if(valEl){ valEl.textContent=val; valEl.style.color=c; }
  });
}

// =====================
// FOTO DO ATLETA
// =====================
let fotoAtleta = null;

function carregarFoto(event){
  const file = event.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){
    showN('⚠️ Selecione uma imagem válida.', true);
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e){
    fotoAtleta = e.target.result;
    // Atualiza o avatar na tela de evolução
    const av = document.getElementById('atleta-av');
    if(av){
      av.innerHTML = `<img src="${fotoAtleta}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    }
    // Atualiza o avatar no álbum de figurinhas
    document.querySelectorAll('.stk-foto').forEach(el=>{
      el.innerHTML = `<img src="${fotoAtleta}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    });
    // Esconde a dica
    const dica = document.getElementById('foto-dica');
    if(dica) dica.style.display = 'none';
    // Atualiza o header
    atualizarHeaderFoto();
    showN('✓ Foto atualizada! Aparece no perfil e nas figurinhas.');
  };
  reader.readAsDataURL(file);
}

function atualizarHeaderFoto(){
  // Só adiciona mini avatar se for perfil de atleta
  if(perfilAtual !== 'atleta') return;
  const pill = document.getElementById('cat-pill');
  if(pill && fotoAtleta){
    const existing = document.getElementById('header-mini-av');
    if(!existing){
      const mini = document.createElement('img');
      mini.id = 'header-mini-av';
      mini.src = fotoAtleta;
      mini.style.cssText = 'width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.4);margin-left:8px;vertical-align:middle';
      pill.parentElement.appendChild(mini);
    } else {
      existing.src = fotoAtleta;
    }
  }
}

function abrirFicha(nome, sig, pos, cat, catKey, cor){
  const key = sig+catKey;
  const ficha = FICHAS[key] || {};
  document.getElementById('ficha-av').textContent = sig;
  document.getElementById('ficha-av').style.background = cor;
  document.getElementById('ficha-nome').textContent = nome;
  document.getElementById('ficha-info').textContent = pos+' · '+cat;
  document.getElementById('ficha-btn').style.background = cor;
  if(ficha.sangue)  document.getElementById('ficha-sangue').value = ficha.sangue;
  if(ficha.plano)   document.getElementById('ficha-plano').value  = ficha.plano;
  if(ficha.alergias)document.getElementById('ficha-alergias').value = ficha.alergias;
  if(ficha.meds)    document.getElementById('ficha-meds').value   = ficha.meds;
  if(ficha.cond)    document.getElementById('ficha-cond').value   = ficha.cond;
  if(ficha.enome)   document.getElementById('ficha-emerg-nome').value = ficha.enome;
  if(ficha.ewpp)    document.getElementById('ficha-emerg-wpp').value  = ficha.ewpp;
  if(ficha.obs)     document.getElementById('ficha-obs').value    = ficha.obs;
  document.getElementById('ficha-nome').dataset.key = key;
  abrirModal('modal-ficha');
}

function salvarFicha(){
  const key = document.getElementById('ficha-nome').dataset.key;
  const nome = document.getElementById('ficha-nome').textContent;
  FICHAS[key] = {
    sangue:  document.getElementById('ficha-sangue').value,
    plano:   document.getElementById('ficha-plano').value,
    alergias:document.getElementById('ficha-alergias').value,
    meds:    document.getElementById('ficha-meds').value,
    cond:    document.getElementById('ficha-cond').value,
    enome:   document.getElementById('ficha-emerg-nome').value,
    ewpp:    document.getElementById('ficha-emerg-wpp').value,
    obs:     document.getElementById('ficha-obs').value,
  };
  salvarLS();
  fecharModal('modal-ficha');
  showN('✓ Ficha médica de '+nome+' salva!');
}


// === FEED / HABILIDADES / FOTOS / CALENDÁRIO ===
// =====================
// CALENDÁRIO
// =====================
const EVENTOS = [
  {tipo:'treino',data:'2025-06-03',hora:'08h',label:'Treino técnico',cat:'Sub-13'},
  {tipo:'treino',data:'2025-06-05',hora:'08h',label:'Treino tático', cat:'Sub-13'},
  {tipo:'jogo',  data:'2025-06-07',hora:'09h',label:'vs Rapid FC',   cat:'Sub-13'},
  {tipo:'treino',data:'2025-06-10',hora:'08h',label:'Treino físico', cat:'Sub-13'},
  {tipo:'treino',data:'2025-06-12',hora:'08h',label:'Treino técnico',cat:'Sub-13'},
  {tipo:'jogo',  data:'2025-06-14',hora:'09h',label:'vs União Sport',cat:'Sub-13'},
  {tipo:'treino',data:'2025-06-17',hora:'08h',label:'Treino coletivo',cat:'Sub-13'},
  {tipo:'treino',data:'2025-06-19',hora:'08h',label:'Treino tático', cat:'Sub-13'},
  {tipo:'treino',data:'2025-06-24',hora:'08h',label:'Treino físico', cat:'Sub-13'},
  {tipo:'treino',data:'2025-06-26',hora:'08h',label:'Treino técnico',cat:'Sub-13'},
  {tipo:'jogo',  data:'2025-06-28',hora:'09h',label:'vs Grêmio Jr',  cat:'Sub-13'},
];

function renderCalendario(cor){
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diaHoje = hoje.getDate();
  const nomesMes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const nomeMes = nomesMes[mes];
  const primeiroDia = new Date(ano,mes,1).getDay();
  const diasNoMes = new Date(ano,mes+1,0).getDate();
  const evMap={};
  // Eventos fixos
  EVENTOS.forEach(e=>{
    const [ea,em,ed]=e.data.split('-');
    if(parseInt(ea)===ano && parseInt(em)-1===mes){
      const d=parseInt(ed);if(!evMap[d])evMap[d]=[];evMap[d].push(e);
    }
  });
  // Jogos agendados pelo professor
  JOGOS_AGENDADOS.forEach(j=>{
    const [ja,jm,jd]=j.data.split('-');
    if(parseInt(ja)===ano && parseInt(jm)-1===mes){
      const d=parseInt(jd);if(!evMap[d])evMap[d]=[];
      evMap[d].push({tipo:'jogo',data:j.data,hora:j.hora,label:'vs '+j.adv,cat:j.cat});
    }
  });
  const dias=['D','S','T','Q','Q','S','S'];
  const headers=dias.map(d=>`<div style="text-align:center;font-size:9px;font-weight:700;color:var(--text-3);padding:4px 0">${d}</div>`).join('');
  let cells='';
  for(let i=0;i<primeiroDia;i++) cells+=`<div></div>`;
  for(let d=1;d<=diasNoMes;d++){
    const eventos=evMap[d]||[];
    const isHoje=d===diaHoje;
    const temJogo=eventos.some(e=>e.tipo==='jogo');
    const temTreino=eventos.some(e=>e.tipo==='treino');
    const bg=isHoje?cor:'transparent';
    const tc=isHoje?'#fff':'var(--text)';
    let dots='';
    if(temTreino) dots+=`<div style="width:5px;height:5px;border-radius:50%;background:${isHoje?'rgba(255,255,255,.7)':cor};display:inline-block;margin:0 1px"></div>`;
    if(temJogo)   dots+=`<div style="width:5px;height:5px;border-radius:50%;background:${isHoje?'rgba(255,255,255,.7)':'#8b1a1a'};display:inline-block;margin:0 1px"></div>`;
    cells+=`<div style="text-align:center;cursor:pointer" onclick="verDiaCalendario(${d})">
      <div style="width:28px;height:28px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:11px;font-weight:${isHoje?'700':'500'};color:${tc}">${d}</div>
      <div style="height:8px;display:flex;justify-content:center;align-items:center;gap:1px;margin-top:1px">${dots}</div>
    </div>`;
  }
  const listaEventos=EVENTOS.map((e,ei)=>{
    const d=parseInt(e.data.split('-')[2]);
    const ic=e.tipo==='jogo'?'⚽':'🏃';
    const bg=e.tipo==='jogo'?'#fce8e8':'#dceaf8';
    return `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
      <div style="width:34px;height:34px;border-radius:9px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${ic}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:var(--text)">${e.label}</div>
        <div style="font-size:10px;color:var(--text-3);font-weight:500">${e.cat} · ${d} Jun · ${e.hora}</div>
      </div>
      <span class="tag ${e.tipo==='jogo'?'tr':'tb'}">${e.tipo==='jogo'?'Jogo':'Treino'}</span>
      <button onclick="abrirEditarEvento(${ei})" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 4px">✏️</button>
      <button onclick="deletarEvento(${ei})" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 4px">🗑️</button>
    </div>`;
  }).join('');

  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-family:var(--font-display);font-size:20px;letter-spacing:.06em;color:var(--text)">${nomeMes} ${ano}</span>
    <div style="display:flex;gap:8px;align-items:center">
      <div style="display:flex;align-items:center;gap:4px"><div style="width:8px;height:8px;border-radius:50%;background:${cor}"></div><span style="font-size:9px;color:var(--text-3);font-weight:600">Treino</span></div>
      <div style="display:flex;align-items:center;gap:4px"><div style="width:8px;height:8px;border-radius:50%;background:#8b1a1a"></div><span style="font-size:9px;color:var(--text-3);font-weight:600">Jogo</span></div>
      <button class="btn-sm" onclick="abrirEditarEvento(-1)">+ Evento</button>
    </div>
  </div>
  <div class="cw" style="padding:10px">
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:6px">${headers}</div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${cells}</div>
  </div>
  <div class="lbl" style="margin-top:4px">Eventos do mês (${EVENTOS.length})</div>
  <div class="cw" style="padding:6px 14px">${listaEventos}</div>`;
}

function renderComprovantes(cor){
  const sig = ATLETA_DEFAULT.sig;
  const catKey = ATLETA_DEFAULT.cat.replace('-','').replace(' ','').toLowerCase();
  const msgKey = sig + catKey;

  const pagamentosAtleta = [
    {id:'p1',tipo:'Mensalidade',categoria:ATLETA_DEFAULT.cat,valor:180,data:'05/06/2025',status:'pago'},
    {id:'p2',tipo:'Arbitragem',categoria:'Sub-13 vs Flamengo',valor:30,data:'15/06/2025',status:'pago'},
    {id:'p3',tipo:'Mensalidade',categoria:ATLETA_DEFAULT.cat,valor:180,data:'05/05/2025',status:'pago'},
  ];

  return `
  <div style="margin-bottom:16px;padding:12px;background:#d4f0dc;border-radius:12px;border-left:4px solid #1a5c26">
    <div style="font-size:12px;font-weight:700;color:#1a5c26">✓ Tudo em dia</div>
    <div style="font-size:11px;color:#1a5c26;margin-top:2px">Seus pagamentos estão em dia. Todos os comprovantes abaixo.</div>
  </div>

  <div class="lbl">Pagamentos recentes</div>
  ${pagamentosAtleta.map(p => `
  <div class="cw" style="padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
    <div style="flex:1">
      <div style="font-size:12px;font-weight:700;color:var(--text)">${p.tipo}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px">${p.categoria} · ${p.data}</div>
    </div>
    <div style="text-align:right;margin-right:12px">
      <div style="font-size:13px;font-weight:800;color:var(--text)">${fmtR$(p.valor)}</div>
      <span class="tag tg" style="margin-top:4px;display:inline-block">${p.status}</span>
    </div>
    <button class="btn-sm" onclick="gerarComprovanteAtleta('${p.id}','${p.tipo}','${p.categoria}',${p.valor},'${p.data}')">
      <i class="ti ti-download"></i> PDF
    </button>
  </div>
  `).join('')}

  <div class="lbl" style="margin-top:16px">Informações úteis</div>
  <div class="cw" style="padding:12px 14px;font-size:11px;color:var(--text-3);line-height:1.6">
    <div>📧 <strong>Email de confirmação:</strong> Você recebe um email com o comprovante em até 2h após o pagamento.</div>
    <div style="margin-top:8px">💳 <strong>Método de pagamento:</strong> Contacte o financeiro para opções de parcelamento.</div>
    <div style="margin-top:8px">❓ <strong>Dúvidas:</strong> Envie mensagem ao responsável pelo financeiro.</div>
  </div>`;
}

function gerarComprovanteAtleta(id, tipo, categoria, valor, data){
  const sig = ATLETA_DEFAULT.sig;
  const nome = ATLETA_DEFAULT.nome;
  const cat = ATLETA_DEFAULT.cat;

  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><title>Comprovante de Pagamento</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;padding:20px;color:#1a1a1a;max-width:600px;margin:0 auto;background:#f5f5f5}
    .comprovante{background:#fff;border-radius:8px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,.1)}
    .header{border-bottom:2px solid #0d3d1a;padding-bottom:16px;margin-bottom:20px}
    .logo{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.06em;color:#0d3d1a}
    .logo-sub{font-size:10px;color:#888;margin-top:2px}
    .titulo{font-size:18px;font-weight:700;color:#0d3d1a;margin:20px 0 10px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
    .info-box{background:#f9f9f9;padding:12px;border-radius:6px}
    .info-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.05em;font-weight:600}
    .info-valor{font-size:13px;font-weight:700;color:#1a1a1a;margin-top:4px}
    .table{width:100%;border-collapse:collapse;margin:20px 0}
    .table th{background:#f0ede8;padding:10px;text-align:left;font-size:10px;font-weight:700;color:#888}
    .table td{padding:12px 10px;border-bottom:1px solid #eee;font-size:12px}
    .table td.value{text-align:right;font-weight:700;color:#1a1a1a}
    .total-row td{background:#d4f0dc;font-weight:700;color:#1a5c26;padding:12px 10px}
    .footer{margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#888;text-align:center}
    .print-btn{background:#0d3d1a;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;margin-top:16px;width:100%}
    @media print{body{background:#fff}.print-btn{display:none}}
  </style></head><body>
  <div class="comprovante">
    <div class="header">
      <div class="logo">VOTORATY ACADEMY</div>
      <div class="logo-sub">Comprovante de Pagamento</div>
    </div>

    <div class="titulo">Recebimento Confirmado</div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Atleta</div>
        <div class="info-valor">${nome}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Categoria</div>
        <div class="info-valor">${cat}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Data do Pagamento</div>
        <div class="info-valor">${data}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Protocolo</div>
        <div class="info-valor">VP-${id.toUpperCase()}-2025</div>
      </div>
    </div>

    <table class="table">
      <thead><tr><th>Descrição</th><th class="value">Valor</th></tr></thead>
      <tbody>
        <tr><td>${tipo} — ${categoria}</td><td class="value">${fmtR$(valor)}</td></tr>
        <tr class="total-row"><td><strong>TOTAL</strong></td><td class="value"><strong>${fmtR$(valor)}</strong></td></tr>
      </tbody>
    </table>

    <div style="background:#fafaf9;padding:12px;border-radius:6px;margin:20px 0">
      <div style="font-size:11px;color:#666">
        <strong>Informação importante:</strong> Este comprovante é válido como recibo de pagamento.
        Guarde-o para sua segurança. Dúvidas? Contacte o financeiro em financeiro@votoraty.com.
      </div>
    </div>

    <div class="footer">
      Votoraty Academy · CNPJ 00.000.000/0001-00<br>
      Comprovante gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}<br>
      <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
    </div>
  </div>
  </body></html>`);
  win.document.close();
}

function verDiaCalendario(dia){
  const hoje2=new Date();const evMap={};
  [...EVENTOS,...JOGOS_AGENDADOS.map(j=>({tipo:'jogo',data:j.data,hora:j.hora,label:'vs '+j.adv,cat:j.cat}))].forEach(e=>{
    const [ea,em,ed]=e.data.split('-');
    if(parseInt(ea)===hoje2.getFullYear()&&parseInt(em)-1===hoje2.getMonth()){
      const d=parseInt(ed);if(!evMap[d])evMap[d]=[];evMap[d].push(e);
    }
  });
  const eventos=evMap[dia]||[];
  if(!eventos.length) showN('Nenhum evento neste dia.');
  else showN(dia+': '+eventos.map(e=>e.label).join(' · '));
}

// =====================
// RELATÓRIO PDF
// =====================
function gerarRelatorio(nome, sig, catKey, cor){
  const hab=HABILIDADES[sig+catKey]||{fin:70,dri:65,vel:70,pas:60,mar:55,ati:85};
  const ficha=FICHAS[sig+catKey]||{};
  const pres=calcPres();
  const conq=getConquistas();
  const catNome=CATS_DATA[catKey]?.nome||'Sub-13';

  const habRows=Object.entries(HAB_LABELS).map(([k,label])=>{
    const val=hab[k]||60;
    const c=val>=75?'#0d3d1a':val>=50?'#b8860b':'#c0392b';
    const pct=val+'%';
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:11px;color:#555;width:90px">${label}</span>
      <div style="flex:1;background:#eee;border-radius:3px;height:6px"><div style="width:${pct};height:6px;border-radius:3px;background:${c}"></div></div>
      <span style="font-size:11px;font-weight:700;color:${c};width:28px;text-align:right">${val}</span>
    </div>`;
  }).join('');

  const win=window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><title>Relatório — ${nome}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;padding:28px;color:#1a1a1a;max-width:620px;margin:0 auto}
    .hdr{background:${cor};color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:20px;display:flex;align-items:center;gap:16px}
    .av{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0}
    h1{font-size:20px;font-weight:700}p.sub{font-size:11px;opacity:.75;margin-top:3px}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px}
    .stat{background:#f5f4f0;border-radius:8px;padding:12px;text-align:center}
    .stat-v{font-size:22px;font-weight:700;color:${cor}}
    .stat-l{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-top:2px}
    .section{margin-bottom:18px}
    .section h2{font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.08em;border-bottom:1.5px solid #eee;padding-bottom:6px;margin-bottom:12px}
    .conq{display:flex;flex-wrap:wrap;gap:6px}
    .conq-chip{background:#dcf0e0;color:#1a5c26;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700}
    .fr{display:flex;gap:8px;margin-bottom:5px}
    .fl{font-size:11px;font-weight:700;color:#777;width:130px;flex-shrink:0}
    .fv{font-size:11px;color:#1a1a1a}
    .footer{margin-top:24px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:14px}
    .print-btn{background:${cor};color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;margin-top:10px}
    @media print{.print-btn{display:none}}
  </style></head><body>
  <div class="hdr">
    <div class="av">${sig}</div>
    <div><h1>${nome}</h1><p class="sub">${catNome} · Votoraty Academy · Junho 2025</p></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-v">${STATS.gols}</div><div class="stat-l">Gols</div></div>
    <div class="stat"><div class="stat-v">${STATS.treinos}</div><div class="stat-l">Treinos</div></div>
    <div class="stat"><div class="stat-v">${pres}%</div><div class="stat-l">Presença</div></div>
    <div class="stat"><div class="stat-v">${conq.length}</div><div class="stat-l">Conquistas</div></div>
  </div>
  <div class="section"><h2>Habilidades técnicas</h2>${habRows}</div>
  <div class="section"><h2>Conquistas</h2>
    <div class="conq">${conq.map(c=>`<span class="conq-chip">${c.icon} ${c.titulo}</span>`).join('')||'<span style="font-size:11px;color:#aaa">Nenhuma ainda</span>'}</div>
  </div>
  ${ficha.sangue?`<div class="section"><h2>Ficha médica</h2>
    <div class="fr"><span class="fl">Tipo sanguíneo</span><span class="fv">${ficha.sangue}</span></div>
    <div class="fr"><span class="fl">Alergias</span><span class="fv">${ficha.alergias||'Nenhuma'}</span></div>
    <div class="fr"><span class="fl">Medicamentos</span><span class="fv">${ficha.meds||'Nenhum'}</span></div>
    <div class="fr"><span class="fl">Condições</span><span class="fv">${ficha.cond||'Nenhuma'}</span></div>
    <div class="fr"><span class="fl">Emergência</span><span class="fv">${ficha.enome||'—'} · ${ficha.ewpp||'—'}</span></div>
  </div>`:''}
  <div class="section"><h2>Avaliação do técnico</h2>
    <p style="font-size:12px;color:#333;line-height:1.7;background:#fffaf0;border-left:3px solid #b8860b;padding:10px 12px;border-radius:6px">
      <strong>Técnico André:</strong> ${nome.split(' ')[0]} demonstra grande dedicação. Finalização e atitude são seus pontos fortes. Foco no passe e marcação para o próximo mês.
    </p>
  </div>
  <div class="footer">
    Votoraty Academy · Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} · Documento oficial
    <br><button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  </div>
  </body></html>`);
  win.document.close();
}

// =====================
// LANÇAR GOL
// =====================
let golsModal = 0;
let golNomeAtual = '';

function abrirLancarGol(nome, sig, pos, cat, cor){
  golsModal = 0;
  golNomeAtual = nome;
  document.getElementById('gol-av').textContent = sig;
  document.getElementById('gol-av').style.background = cor;
  document.getElementById('gol-nome').textContent = nome;
  document.getElementById('gol-info').textContent = pos+' · '+cat;
  document.getElementById('gol-btn').style.background = cor;
  document.getElementById('gol-count').textContent = '0';
  document.getElementById('gol-total-antes').textContent = STATS.gols;
  abrirModal('modal-gol');
}

function ajustarGol(delta){
  golsModal = Math.max(0, golsModal + delta);
  document.getElementById('gol-count').textContent = golsModal;
}

function confirmarGols(){
  if(golsModal === 0){showN('⚠️ Nenhum gol para lançar.',true);return;}
  addGolAtleta(golsModal);
  fecharModal('modal-gol');
  showN('✓ '+golsModal+' gol(s) lançado(s) para '+golNomeAtual+'! Total: '+STATS.gols);
}

function abrirMsgDireta(nome, sig, pos, cat, cor){
  document.getElementById('msg-d-av').textContent = sig;
  document.getElementById('msg-d-av').style.background = cor;
  document.getElementById('msg-d-nome').textContent = nome;
  document.getElementById('msg-d-info').textContent = pos + ' · ' + cat;
  document.getElementById('msg-d-txt').value = '';
  document.getElementById('msg-d-btn').style.background = cor;
  abrirModal('modal-msg-direta');
}

function enviarMsgDireta(){
  const txt = document.getElementById('msg-d-txt').value.trim();
  const nome = document.getElementById('msg-d-nome').textContent;
  const pais = document.getElementById('msg-d-pais').checked;
  if(!txt){showN('⚠️ Escreva a mensagem antes de enviar.',true);return;}
  fecharModal('modal-msg-direta');
  showN('✓ Mensagem enviada para '+nome+(pais?' e seus pais!':'!'));
  // Injeta no feed do atleta se visível
  const feed = document.getElementById('feed-msgs');
  if(feed){
    const cor = document.getElementById('msg-d-av').style.background;
    const item = document.createElement('div');
    item.className='card';
    item.style.cssText='border-left:3px solid '+cor+';margin-bottom:8px;background:#f0fff4';
    item.innerHTML=`<div style="font-size:9px;font-weight:700;color:${cor};margin-bottom:3px">✉️ MENSAGEM PRIVADA · Técnico</div>
    <div style="font-size:11px;color:var(--text);line-height:1.6">${txt}</div>
    <div style="font-size:9px;color:var(--text-3);margin-top:4px">agora · privado</div>`;
    feed.insertBefore(item, feed.firstChild);
  }
}
function selDest(el){document.querySelectorAll('#dest-chips .chip').forEach(c=>c.classList.remove('on'));el.classList.add('on');}
function enviarMsg(){
  const txt=document.getElementById('msg-txt');
  if(!txt||!txt.value.trim()){showN('⚠️ Escreva a mensagem antes de enviar.',true);return;}
  showN('✓ Mensagem enviada! Atletas e pais notificados.');
  txt.value='';
}

function renderListaAtletas(cat, cor){
  const catKey = Object.entries(CATS_DATA).find(([k,c])=>c.nome===cat.nome)?.[0]||'sub13';
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <span style="font-family:var(--font-display);font-size:18px;letter-spacing:.06em;color:var(--text)">Atletas — ${cat.nome}</span>
    <button class="btn-sm" onclick="abrirModal('modal-atleta')">+ Novo</button>
  </div>
  <div class="cw" style="padding:6px 14px">
    ${cat.atletas.map(a=>{
      const pc=a.pres>=85?'#1a5c26':a.pres>=70?'#7a4010':'#8b1a1a';
      const _fk=a.sig+catKey;
      const temFicha=typeof FICHAS!=='undefined'&&FICHAS[_fk]&&FICHAS[_fk].sangue;
      const fichaBg=temFicha?'#dcf0e0':'#fce8e8';
      const fichaC=temFicha?'#1a5c26':'#8b1a1a';
      return `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <div class="av" style="width:34px;height:34px;font-size:11px;background:${cor}">${a.sig}</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700;color:var(--text)">${a.nome}</div>
            <div style="font-size:9px;color:var(--text-3);font-weight:500">${a.pos} · ${a.gols} gols · Nível ${a.nivel}</div>
            <div class="prog"><div class="prog-f" style="width:${a.pres}%;background:${pc}"></div></div>
          </div>
          <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;color:${pc};background:${pc}18">${a.pres}%</span>
        </div>
        <div style="display:flex;gap:5px;padding-left:44px">
          <button onclick="abrirHabilidades('${a.nome}','${a.sig}','${a.pos}','${cat.nome}','${catKey}','${cor}')" style="flex:1;background:${cor}18;color:${cor};border:1px solid ${cor}33;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">⭐ Hab</button>
          <button onclick="abrirFicha('${a.nome}','${a.sig}','${a.pos}','${cat.nome}','${catKey}','${cor}')" style="flex:1;background:${fichaBg};color:${fichaC};border:none;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">🏥 Ficha</button>
          <button onclick="gerarRelatorio('${a.nome}','${a.sig}','${catKey}','${cor}')" style="flex:1;background:#fdf3dc;color:#7a4010;border:none;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">📊 PDF</button>
          <button onclick="abrirMsgDireta('${a.nome}','${a.sig}','${a.pos}','${cat.nome}','${cor}')" style="flex:1;background:${cor};color:#fff;border:none;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">✉️ Msg</button>
          <button onclick="abrirEditarAtleta('${a.sig}','${catKey}')" style="flex:1;background:#f0ede8;border:1px solid #e8e4dc;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">✏️</button>
          <button onclick="deletarAtleta('${a.sig}','${catKey}')" style="flex:1;background:#fce8e8;border:none;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer;color:#8b1a1a">🗑️</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}


// === DIRETOR / FINANCEIRO / ATLETA ===
// =====================
// DIRETOR
// =====================
function montarDiretor(cor){
  const navItems = ['Dashboard','Atletas','Jogos','Campeonatos','Financeiro','Avisos','Config'];
  const bnavItems = [
    {icon:'ti-layout-dashboard',label:'Dashboard'},
    {icon:'ti-users',label:'Atletas'},
    {icon:'ti-ball-football',label:'Jogos'},
    {icon:'ti-currency-dollar',label:'Financ.'},
    {icon:'ti-settings',label:'Config'}
  ];
  montarNav(navItems, cor);
  montarBnav(bnavItems, cor);

  // Botão voltar ao Dashboard — inserido no bnav como item extra
  const bnav = document.getElementById('bnav');
  if(bnav){
    const btnHome = document.createElement('div');
    btnHome.onclick = () => goTab(0, cor);
    btnHome.title = 'Voltar ao Dashboard';
    btnHome.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 4px;border-radius:10px;cursor:pointer;background:'+cor+'12;border:1.5px solid '+cor+'33;margin-left:4px';
    btnHome.innerHTML = `<i class="ti ti-home-2" style="font-size:18px;color:${cor}"></i><span style="font-size:9px;font-weight:700;color:${cor}">Dashboard</span>`;
    bnav.appendChild(btnHome);
  }

  const sc = document.getElementById('screens');
  sc.innerHTML = `
  <div id="s-0" class="scr on" style="padding:11px 13px;overflow-y:auto">${renderDashboard(cor)}</div>
  <div id="s-1" class="scr" style="padding:11px 13px;overflow-y:auto">${renderDirAtletas(cor)}</div>
  <div id="s-2" class="scr" style="padding:11px 13px;overflow-y:auto">${renderJogos(cor)}</div>
  <div id="s-3" class="scr" style="padding:11px 13px;overflow-y:auto">${renderCamps(cor)}</div>
  <div id="s-4" class="scr" style="padding:11px 13px;overflow-y:auto">${renderFinanceiro(cor)}</div>
  <div id="s-5" class="scr" style="padding:11px 13px;overflow-y:auto">${renderMensagem('todas as categorias',true,cor)}</div>
  <div id="s-6" class="scr" style="padding:11px 13px;overflow-y:auto">${renderConfig(cor)}</div>`;
  setCor(cor);
}

function renderDashboard(cor){
  return `<div class="stat-grid">
    <div class="stat-c" style="background:#dcf0e0;border:1px solid #8ec99a"><div class="stat-v" style="color:#1a5c26">47</div><div class="stat-l" style="color:#1a5c26">Atletas ativos</div><div style="font-size:9px;color:#3b7a40;margin-top:2px;font-weight:500">Sub-7 ao Sub-15</div></div>
    <div class="stat-c" style="background:#dceaf8;border:1px solid #7eb3e8"><div class="stat-v" style="color:#0e3d6e">3</div><div class="stat-l" style="color:#0e3d6e">Camps. ativos</div><div style="font-size:9px;color:#185fa5;margin-top:2px;font-weight:500">em andamento</div></div>
    <div class="stat-c" style="background:#fdf3dc;border:1px solid #e8c97a"><div class="stat-v" style="color:#7a4010">R$4.2k</div><div class="stat-l" style="color:#7a4010">Mensalidades</div><div style="font-size:9px;color:#a05a10;margin-top:2px;font-weight:500">maio 2025</div></div>
    <div class="stat-c" style="background:#ece9fd;border:1px solid #afa9ec"><div class="stat-v" style="color:#3c2e9e">94%</div><div class="stat-l" style="color:#3c2e9e">Presença média</div><div style="font-size:9px;color:#534ab7;margin-top:2px;font-weight:500">esta semana</div></div>
  </div>
  <div class="lbl">Alertas urgentes</div>
  <div class="alerta" style="background:#fce8e8;border:1px solid #e8a0a0">
    <div class="al-icon" style="background:#f5c5c5"><i class="ti ti-alert-triangle" style="font-size:14px;color:#8b1a1a"></i></div>
    <div style="flex:1"><div style="font-size:11px;font-weight:700;color:#8b1a1a">Pedro Alves — 4 faltas seguidas</div>
    <div style="font-size:10px;color:#b03030;margin-top:2px;font-weight:500">Sub-13 · pai ainda não respondeu</div>
    <button class="btn-sm" style="margin-top:6px" onclick="showN('Mensagem enviada ao pai do Pedro!')">Enviar mensagem ao pai</button></div>
  </div>
  <div class="alerta" style="background:#fdf3dc;border:1px solid #e8c97a">
    <div class="al-icon" style="background:#fac775"><i class="ti ti-currency-dollar" style="font-size:14px;color:#7a4010"></i></div>
    <div><div style="font-size:11px;font-weight:700;color:#7a4010">3 mensalidades em atraso</div>
    <div style="font-size:10px;color:#a05a10;margin-top:2px;font-weight:500">Rafael Costa, João Silva, Marcos Lima</div>
    <button class="btn-sm" style="margin-top:6px" onclick="showN('Cobrança automática enviada!')">Enviar cobrança</button></div>
  </div>
  <div class="lbl">Categorias — acesso rápido</div>
  <div class="cw" style="padding:6px 14px">
    ${Object.entries(CATS_DATA).map(([k,c])=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="width:36px;height:36px;border-radius:10px;background:${CORES[k]};display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 8px rgba(0,0,0,.15)">${c.emoji}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:700;color:var(--text)">${c.nome}</div><div style="font-size:9px;color:var(--text-3);margin-top:1px;font-weight:500">${c.atletas.length} atletas · ${c.atletas.reduce((s,a)=>s+a.gols,0)} gols</div></div>
      <button onclick="_perfilAnterior='diretor';entrar('prof_${k}')" style="background:${CORES[k]};color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15);letter-spacing:.02em">Acessar</button>
    </div>`).join('')}
  </div>`;
}

function renderDirAtletas(cor){
  const total = Object.values(CATS_DATA).reduce((s,c)=>s+(c.atletas||[]).length,0);
  const cats = Object.entries(CATS_DATA);
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-family:var(--font-display);font-size:20px;letter-spacing:.06em;color:var(--text)">Atletas (${total})</span>
    <button class="btn-sm" onclick="abrirModal('modal-atleta')">+ Novo</button>
  </div>
  ${cats.map(([k,c])=>{
    const catCor = CORES[k] || cor;
    const presMedia = c.atletas.length ? Math.round(c.atletas.reduce((s,a)=>s+a.pres,0)/c.atletas.length) : 0;
    const totalGols = c.atletas.reduce((s,a)=>s+a.gols,0);
    return `
    <div class="cw" style="padding:0;margin-bottom:10px;overflow:hidden;border:1.5px solid ${catCor}33">
      <!-- Cabeçalho da categoria -->
      <div onclick="toggleCat('cat-${k}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:${catCor}12;cursor:pointer;border-bottom:1px solid ${catCor}22">
        <div style="width:36px;height:36px;border-radius:10px;background:${catCor};display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;box-shadow:0 2px 8px ${catCor}44">${c.emoji}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:800;color:${catCor}">${c.nome}</div>
          <div style="font-size:9px;color:var(--text-3);margin-top:1px;font-weight:500">${c.atletas.length} atletas · ${totalGols} gols · ${presMedia}% presença</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button onclick="event.stopPropagation();_perfilAnterior='diretor';entrar('prof_${k}')" style="background:${catCor};color:#fff;border:none;padding:5px 10px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">Ver aulas</button>
          <i class="ti ti-chevron-down" id="chevron-${k}" style="font-size:14px;color:${catCor};transition:transform .25s"></i>
        </div>
      </div>
      <!-- Lista de atletas -->
      <div id="cat-${k}" style="padding:0 14px">
        ${c.atletas.map(a=>{
          const pc=a.pres>=85?'#1a5c26':a.pres>=70?'#7a4010':'#8b1a1a';
          return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
            <div class="av" style="width:34px;height:34px;font-size:11px;background:${catCor}">${a.sig}</div>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:700;color:var(--text)">${a.nome}</div>
              <div style="font-size:9px;color:var(--text-3);font-weight:500">${a.pos} · ${a.gols} gols</div>
              <div class="prog"><div class="prog-f" style="width:${a.pres}%;background:${pc}"></div></div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
              <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;color:${pc};background:${pc}18">${a.pres}%</span>
              <div style="display:flex;gap:3px">
                <button onclick="abrirMsgDireta('${a.nome}','${a.sig}','${a.pos}','${c.nome}','${catCor}')" style="background:${catCor};color:#fff;border:none;padding:3px 7px;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer">✉️</button>
                <button onclick="abrirEditarAtleta('${a.sig}','${k}')" style="background:#f0ede8;border:1px solid #e8e4dc;padding:3px 6px;border-radius:6px;font-size:9px;cursor:pointer">✏️</button>
                <button onclick="deletarAtleta('${a.sig}','${k}')" style="background:#fce8e8;border:none;padding:3px 6px;border-radius:6px;font-size:9px;cursor:pointer;color:#8b1a1a">🗑️</button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('')}`;
}

function toggleCat(id){
  const el = document.getElementById(id);
  const catKey = id.replace('cat-','');
  const chev = document.getElementById('chevron-'+catKey);
  if(!el) return;
  const aberto = el.style.display !== 'none';
  el.style.display = aberto ? 'none' : 'block';
  if(chev) chev.style.transform = aberto ? 'rotate(-90deg)' : 'rotate(0deg)';
}

function renderJogos(cor){
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-family:var(--font-display);font-size:20px;letter-spacing:.06em;color:var(--text)">Jogos</span>
    <button class="btn-sm" onclick="abrirModal('modal-jogo')">+ Agendar</button>
  </div>
  <div class="lbl">Ao vivo</div>
  <div class="card" style="border-color:#e8a0a0;border-left:3px solid #c0392b">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:10px;color:var(--text-3);font-weight:500">Sub-13 · Camp. Municipal</span>
      <span class="tag tr">Ao vivo 34'</span>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin:8px 0">
      <span style="font-size:12px;font-weight:700;flex:1;color:var(--text)">Votoraty</span>
      <span style="font-family:var(--font-display);font-size:28px;color:var(--text);letter-spacing:.06em" id="gv">2</span>
      <span style="font-size:14px;color:var(--text-3)">×</span>
      <span style="font-family:var(--font-display);font-size:28px;color:var(--text);letter-spacing:.06em">1</span>
      <span style="font-size:12px;font-weight:700;flex:1;text-align:right;color:var(--text)">Atlético Jr</span>
    </div>
    <div style="display:flex;gap:6px;margin-top:10px">
      <button class="btn-sm" onclick="addGol()">+ Gol Votoraty</button>
      <button class="btn-sm" onclick="showN('Gol adversário registrado.')">+ Gol adv.</button>
      <button class="btn-sm" onclick="showN('Jogo encerrado! Resultado salvo.')">Encerrar</button>
    </div>
  </div>
  <div class="lbl">Próximos</div>
  <div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:10px;color:var(--text-3);font-weight:500">Sub-13 · Sáb 25/05 · 09h</span><span class="tag tb">agendado</span></div>
    <div style="display:flex;align-items:center;justify-content:center;gap:10px"><span style="font-size:12px;font-weight:700;flex:1;color:var(--text)">Votoraty</span><span style="font-size:13px;color:var(--text-3)">vs</span><span style="font-size:12px;font-weight:700;flex:1;text-align:right;color:var(--text)">Rapid FC</span></div></div>
  <div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:10px;color:var(--text-3);font-weight:500">Sub-15 · Dom 01/06 · 10h</span><span class="tag ta">final</span></div>
    <div style="display:flex;align-items:center;justify-content:center;gap:10px"><span style="font-size:12px;font-weight:700;flex:1;color:var(--text)">Votoraty</span><span style="font-size:13px;color:var(--text-3)">vs</span><span style="font-size:12px;font-weight:700;flex:1;text-align:right;color:var(--text)">Estrela FC</span></div></div>
  <div class="lbl">Últimos resultados</div>
  <div class="card" style="border-left:3px solid #1a5c26"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:10px;color:var(--text-3);font-weight:500">Sub-11 · 15/05</span><span class="tag tg">Vitória</span></div>
    <div style="display:flex;align-items:center;justify-content:center;gap:10px"><span style="font-size:12px;font-weight:700;flex:1;color:var(--text)">Votoraty</span><span style="font-family:var(--font-display);font-size:28px;color:var(--text)">3</span><span style="font-size:14px;color:var(--text-3)">×</span><span style="font-family:var(--font-display);font-size:28px;color:var(--text)">0</span><span style="font-size:12px;font-weight:700;flex:1;text-align:right;color:var(--text)">Estrela FC</span></div></div>`;
}

let golsV=2;
function addGol(){golsV++;const el=document.getElementById('gv');if(el)el.textContent=golsV;showN('✓ Gol do Votoraty! '+golsV+'×1');}

function renderCamps(cor){
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <span style="font-size:13px;font-weight:700">Campeonatos</span>
    <button class="btn-sm" onclick="abrirModal('modal-camp')">+ Criar</button>
  </div>
  <div class="cw" style="padding:6px 12px">
    ${[['tg','Camp. Municipal Sub-13','6 rodadas · Votoraty em 1º',80,'ativo'],
       ['tb','Camp. Regional Sub-11','4 rodadas · Votoraty em 2º',50,'ativo'],
       ['ta','Estadual Sub-15','Semifinal · fase final',90,'semifinal'],
       ['tp','Sub-7 Amistoso','Encerrado · Votoraty campeão',100,'campeão']
    ].map(([tg,nm,sub,pct,st])=>`
    <div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid #f0eeea">
      <div style="width:30px;height:30px;border-radius:8px;background:#f9f9f7;border:1px solid #eee;display:flex;align-items:center;justify-content:center"><i class="ti ti-trophy" style="font-size:15px;color:#c8940a"></i></div>
      <div style="flex:1"><div style="font-size:12px;font-weight:700">${nm}</div><div style="font-size:9px;color:#aaa">${sub}</div><div class="prog" style="margin-top:4px"><div class="prog-f" style="width:${pct}%;background:${cor}"></div></div></div>
      <span class="tag ${tg}">${st}</span>
    </div>`).join('')}
  </div>`;
}

function renderFinanceiro(cor){
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-family:var(--font-display);font-size:20px;letter-spacing:.06em;color:var(--text)">Financeiro</span>
    <button class="btn-sm" onclick="abrirModal('modal-fin')">+ Lançamento</button>
  </div>
  <div class="stat-grid">
    <div class="stat-c" style="background:#dcf0e0;border:1px solid #8ec99a"><div class="stat-v" style="color:#1a5c26">R$4.2k</div><div class="stat-l" style="color:#1a5c26">Recebido</div></div>
    <div class="stat-c" style="background:#fce8e8;border:1px solid #e8a0a0"><div class="stat-v" style="color:#8b1a1a">R$840</div><div class="stat-l" style="color:#8b1a1a">Em atraso</div></div>
  </div>
  <div class="lbl">Mensalidades — maio 2025</div>
  <div class="cw" style="padding:6px 14px">
    ${[['Kauan Telles','Sub-13','✓ pago','#1a5c26',false],
       ['Mateus Torres','Sub-15','✓ pago','#1a5c26',false],
       ['Lucas Ferreira','Sub-11','✓ pago','#1a5c26',false],
       ['Pedro Alves','Sub-13','✗ atraso','#8b1a1a',true],
       ['Rafael Costa','Sub-13','✗ atraso','#8b1a1a',true]
    ].map(([nm,cat,st,cor2,btn])=>`
    <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);gap:10px">
      <div style="flex:1"><div style="font-size:12px;font-weight:700;color:var(--text)">${nm}</div><div style="font-size:9px;color:var(--text-3);margin-top:1px;font-weight:500">${cat} · venc. 01/05</div></div>
      <div style="text-align:right">
        <span style="font-size:12px;font-weight:700;color:${cor2}">${st} R$180</span>
        ${btn?`<div><button class="btn-sm" style="margin-top:4px" onclick="showN('Cobrança enviada para o pai!')">Cobrar</button></div>`:''}
      </div>
    </div>`).join('')}
  </div>
  <button class="btn-g" style="background:${cor}" onclick="showN('✓ Cobrança enviada para todos em atraso!')">Cobrar todos os inadimplentes</button>
  <div class="lbl" style="margin-top:12px">Saldo do mês</div>
  <div style="background:#dcf0e0;border:1px solid #8ec99a;border-radius:var(--radius);padding:14px;display:flex;justify-content:space-between;align-items:center;box-shadow:var(--shadow)">
    <span style="font-size:12px;font-weight:700;color:#1a5c26">Receitas − Despesas</span>
    <span style="font-family:var(--font-display);font-size:24px;color:#1a5c26;letter-spacing:.06em">+ R$2.550</span>
  </div>`;
}

function renderConfig(cor){
  return `<div class="lbl">Dados do clube</div>
  <div class="cw" style="padding:8px 14px">
    ${[['Nome do clube','Votoraty Academy'],['Categorias','Sub-7, Sub-9, Sub-11, Sub-13, Sub-15'],['Dias de treino','Ter, Qui, Sáb'],['Mensalidade','R$ 180,00 / mês']].map(([l,v])=>`
    <div class="config-row"><div><div style="font-size:12px;font-weight:700;color:var(--text)">${l}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">${v}</div></div><button class="btn-sm" onclick="showN('Dados atualizados!')">Editar</button></div>`).join('')}
  </div>
  <div class="lbl">Automações</div>
  <div class="cw" style="padding:8px 14px">
    ${[['Lembrete saúde diário','Todos os dias às 07h'],['Lembrete de estudos','Todos os dias às 07h'],['Alerta de faltas','Após 2 faltas seguidas'],['Cobrança automática','5 dias após vencimento'],['Relatório mensal','Todo dia 1º do mês'],['Figurinha anual','Todo 01 de dezembro']].map(([l,s])=>`
    <div class="config-row"><div><div style="font-size:12px;font-weight:700;color:var(--text)">${l}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">${s}</div></div><div class="toggle on" onclick="this.classList.toggle('on');this.style.background=this.classList.contains('on')?'${cor}':'var(--border)'"><div class="toggle-k"></div></div></div>`).join('')}
  </div>
  <div class="lbl">Exportar dados</div>
  <div class="cw" style="padding:8px 14px">
    ${[['Relatório geral PDF','Toda a temporada'],['Lista de atletas Excel','Planilha completa'],['Backup completo','Todos os dados']].map(([l,s])=>`
    <div class="config-row"><div><div style="font-size:12px;font-weight:700;color:var(--text)">${l}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">${s}</div></div><button class="btn-sm" onclick="showN('Exportado com sucesso!')">Exportar</button></div>`).join('')}
  </div>`;
}

// =====================
// FINANCEIRO — helpers
// =====================
function fmtR$(v){ return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function iniciais(nome){ return nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
function tagHtml(status){
  const cfg = {pago:{bg:'#dcf0e0',c:'#1a5c26',txt:'✓ Pago'},atraso:{bg:'#fde8e8',c:'#8b1a1a',txt:'Em atraso'},pendente:{bg:'#eae8fd',c:'#3c2e9e',txt:'A vencer'}};
  const s = cfg[status]||{bg:'#f0eeea',c:'#555',txt:status};
  return `<span style="display:inline-block;padding:3px 9px;border-radius:12px;font-size:9px;font-weight:700;background:${s.bg};color:${s.c}">${s.txt}</span>`;
}
function listarTodosAtletas(){
  return Object.entries(CATS_DATA).flatMap(([catKey,cat])=>
    (cat.atletas||[]).map(a=>({...a, catKey, catNome:cat.nome, catEmoji:cat.emoji, chave:a.sig+catKey}))
  );
}
function listarPendentes(){
  const pend = [];
  SOCIOS.forEach(s=>{ if(s.status!=='pago') pend.push({nome:s.nome,tipo:'Sócio · '+s.plano,venc:s.venc,valor:s.valor,status:s.status}); });
  listarTodosAtletas().forEach(a=>{
    const m = MENSALIDADES_ATLETAS[a.chave];
    if(m && m.status!=='pago') pend.push({nome:a.nome,tipo:'Atleta · '+a.catNome,venc:m.venc,valor:m.valor,status:m.status});
  });
  return pend;
}
function finCalcs(){
  const atletasFlat = listarTodosAtletas();
  let recSoc=0,atSoc=0,penSoc=0;
  SOCIOS.forEach(s=>{ if(s.status==='pago') recSoc+=s.valor; else if(s.status==='atraso') atSoc+=s.valor; else penSoc+=s.valor; });
  let recAtl=0,atAtl=0,penAtl=0;
  atletasFlat.forEach(a=>{ const m=MENSALIDADES_ATLETAS[a.chave]; if(!m)return; if(m.status==='pago') recAtl+=m.valor; else if(m.status==='atraso') atAtl+=m.valor; else penAtl+=m.valor; });
  const despesas = DESPESAS_CLUBE.reduce((s,d)=>s+d.valor,0);
  const recebido = recSoc+recAtl, emAtraso = atSoc+atAtl, pendente = penSoc+penAtl;
  return {recebido,emAtraso,pendente,despesas,saldo:recebido-despesas};
}
function destruirGrafico(id){ if(CHART_INSTANCES[id]){ CHART_INSTANCES[id].destroy(); delete CHART_INSTANCES[id]; } }
function chartOpcoesBase({stacked,currency,suffix,yMax,singleSeries}={}){
  return {
    responsive:true,maintainAspectRatio:false,
    plugins:{
      legend:{display:!singleSeries,position:'bottom',labels:{font:{size:10,family:"'DM Sans',sans-serif"},boxWidth:10,padding:12}},
      tooltip:{callbacks:{label:(ctx)=>` ${currency?fmtR$(ctx.parsed.y):ctx.parsed.y+(suffix||'')}`}}
    },
    scales:{
      x:{stacked:!!stacked,grid:{display:false},ticks:{font:{size:10,family:"'DM Sans',sans-serif"},color:'#aaa89f'}},
      y:{stacked:!!stacked,max:yMax,grid:{color:'#e8e4dc'},ticks:{font:{size:10,family:"'DM Sans',sans-serif"},color:'#aaa89f',callback:v=>currency?'R$ '+v:v+(suffix||'')}}
    }
  };
}
function marcarSocioPago(id){
  const s=SOCIOS.find(x=>x.id===id);
  if(s){ s.status = s.status==='pago' ? 'atraso' : 'pago'; }
  salvarLS();
  showN(s?.status==='pago' ? '✓ Sócio marcado como pago!' : '↩ Sócio marcado como em atraso');
  montarFinanceiro('#b8860b');
}

function marcarAtletaPago(chave){
  if(MENSALIDADES_ATLETAS[chave]){
    const atual = MENSALIDADES_ATLETAS[chave].status;
    MENSALIDADES_ATLETAS[chave].status = atual==='pago' ? 'atraso' : 'pago';

    // CONEXÃO: Atualiza status de arbitragem visível para o professor
    const match = chave.match(/^([A-Z]+)(.+)$/);
    if(match){
      const sig = match[1], catKey = match[2];
      if(window.ARBITRAGEM_STATUS?.[catKey]){
        const entrada = window.ARBITRAGEM_STATUS[catKey].find(a=>a.sig===sig);
        if(entrada) entrada.pago = MENSALIDADES_ATLETAS[chave].status === 'pago';
      }
    }
  }
  salvarLS();
  showN(MENSALIDADES_ATLETAS[chave]?.status==='pago' ? '✓ Atleta marcado como pago! Professor notificado.' : '↩ Atleta marcado como em atraso');
  montarFinanceiro('#b8860b');
}
function cobrarTodosSocios(){ showN('📲 Cobrança enviada para sócios inadimplentes!'); }
function cobrarTodosAtletas(){ showN('📲 Cobrança enviada para atletas em atraso!'); }

function cobrarCatArb(catKey){
  if(!window.ARBITRAGEM_STATUS?.[catKey]) return;
  const pendentes = window.ARBITRAGEM_STATUS[catKey].filter(a => !a.pago);
  window.ARBITRAGEM_STATUS[catKey].forEach(a => a.pago = true);
  salvarLS();
  const sc = document.querySelector('#s-3');
  if(sc) sc.innerHTML = renderFinCobrancas();
  showN('📲 Cobrança enviada para '+pendentes.length+' atleta(s) do '+(CATS_DATA[catKey]?.nome||catKey)+'!');
}

function cobrarArbIndividual(sig, catKey){
  if(!window.ARBITRAGEM_STATUS?.[catKey]) return;
  const entrada = window.ARBITRAGEM_STATUS[catKey].find(a => a.sig === sig);
  if(!entrada || entrada.pago) return;
  showN('📲 Cobrança enviada para '+sig+' ('+(CATS_DATA[catKey]?.nome||catKey)+') — R$ 30,00. Use "Confirmar" quando receber.');
}

// CONEXÃO FINANCEIRO → PROFESSOR: confirmar pagamento de arbitragem
function confirmarPagamentoArbitragem(sig, catKey){
  if(!window.ARBITRAGEM_STATUS) window.ARBITRAGEM_STATUS = {};
  if(!window.ARBITRAGEM_STATUS[catKey]) window.ARBITRAGEM_STATUS[catKey] = [];
  const entrada = window.ARBITRAGEM_STATUS[catKey].find(a => a.sig === sig);
  if(entrada){
    entrada.pago = !entrada.pago;
    showN(entrada.pago ? '✓ Arbitragem confirmada! Professor notificado.' : '↩ Arbitragem revertida');
  } else {
    window.ARBITRAGEM_STATUS[catKey].push({sig, pago: true});
    showN('✓ Arbitragem confirmada! Professor notificado.');
  }
  salvarLS();
  montarFinanceiro('#b8860b');
}
function filtrarFinCatDesktop(cat,el){
  document.querySelectorAll('#chips-cat-fin .chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('#tbl-mensalidades tbody tr').forEach(tr=>{
    tr.style.display=(cat==='todas'||tr.dataset.cat===cat)?'':'none';
  });
}
function filtrarTabela(q,tblId){
  document.querySelectorAll('#'+tblId+' tbody tr').forEach(tr=>{
    tr.style.display=(tr.dataset.search||'').includes(q.toLowerCase())?'':'none';
  });
}

// Gráficos
function desenharGraficoReceitas(id){
  const el=document.getElementById(id); if(!el)return; destruirGrafico(id);
  CHART_INSTANCES[id]=new Chart(el.getContext('2d'),{type:'bar',data:{labels:HISTORICO_MESES,datasets:[
    {label:'Sócios',data:HISTORICO_RECEITA_SOCIOS,backgroundColor:'#b8860b',borderRadius:5,maxBarThickness:20},
    {label:'Atletas',data:HISTORICO_RECEITA_ATLETAS,backgroundColor:'#0d3d1a',borderRadius:5,maxBarThickness:20}
  ]},options:chartOpcoesBase({stacked:true,currency:true})});
}
function desenharGraficoInadimplencia(id){
  const el=document.getElementById(id); if(!el)return; destruirGrafico(id);
  CHART_INSTANCES[id]=new Chart(el.getContext('2d'),{type:'line',data:{labels:HISTORICO_MESES,datasets:[{
    label:'Em atraso',data:HISTORICO_INADIMPLENCIA,borderColor:'#8b1a1a',backgroundColor:'rgba(139,26,26,.08)',
    fill:true,tension:.35,pointBackgroundColor:'#8b1a1a',pointRadius:4,borderWidth:2.5
  }]},options:chartOpcoesBase({currency:true,singleSeries:true})});
}
function desenharGraficoSocios(id){
  const el=document.getElementById(id); if(!el)return; destruirGrafico(id);
  const pago=SOCIOS.filter(s=>s.status==='pago').length;
  const atraso=SOCIOS.filter(s=>s.status==='atraso').length;
  const pend=SOCIOS.filter(s=>s.status==='pendente').length;
  CHART_INSTANCES[id]=new Chart(el.getContext('2d'),{type:'doughnut',data:{labels:['Pago','Em atraso','A vencer'],datasets:[{data:[pago,atraso,pend],backgroundColor:['#1a5c26','#8b1a1a','#b8860b'],borderWidth:2,borderColor:'#fff'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
}
function desenharGraficoMensalidadesCat(id){
  const el=document.getElementById(id); if(!el)return; destruirGrafico(id);
  const cats=Object.entries(CATS_DATA);
  const labels=cats.map(([,c])=>c.nome);
  const pago=cats.map(([k,c])=>(c.atletas||[]).filter(a=>MENSALIDADES_ATLETAS[a.sig+k]?.status==='pago').reduce((s,a)=>s+(MENSALIDADES_ATLETAS[a.sig+k]?.valor||0),0));
  const atraso=cats.map(([k,c])=>(c.atletas||[]).filter(a=>MENSALIDADES_ATLETAS[a.sig+k]?.status==='atraso').reduce((s,a)=>s+(MENSALIDADES_ATLETAS[a.sig+k]?.valor||0),0));
  const pend=cats.map(([k,c])=>(c.atletas||[]).filter(a=>MENSALIDADES_ATLETAS[a.sig+k]?.status==='pendente').reduce((s,a)=>s+(MENSALIDADES_ATLETAS[a.sig+k]?.valor||0),0));
  CHART_INSTANCES[id]=new Chart(el.getContext('2d'),{type:'bar',data:{labels,datasets:[
    {label:'Pago',data:pago,backgroundColor:'#1a5c26',borderRadius:4,maxBarThickness:18},
    {label:'Atraso',data:atraso,backgroundColor:'#8b1a1a',borderRadius:4,maxBarThickness:18},
    {label:'Pendente',data:pend,backgroundColor:'#b8860b',borderRadius:4,maxBarThickness:18}
  ]},options:chartOpcoesBase({stacked:true,currency:true})});
}

// Render views
function renderFinPainel(){
  const c=finCalcs();
  const atletasFlat=listarTodosAtletas();

  // CORRIGIDO: Dados de presença — lê do histórico real da chamada se disponível
  const totalAtletasPorCat = {sub7:4,sub9:4,sub11:4,sub13:8,sub15:5};
  const BASE_PRESENCA = {
    sub7:[4,3,4,4,3,4], sub9:[3,4,3,4,4,3],
    sub11:[4,4,3,4,3,4], sub13:[7,6,8,7,8,8], sub15:[4,5,4,5,5,4]
  };
  // Injeta dados reais das chamadas salvas no histórico
  const HISTORICO_PRESENCA = { labels:['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Atual'] };
  Object.keys(BASE_PRESENCA).forEach(cat => {
    const hist = window.PRESENCA_HIST?.[cat] || [];
    const base = [...BASE_PRESENCA[cat]];
    if(hist.length > 0) base[base.length-1] = hist[hist.length-1].presentes;
    HISTORICO_PRESENCA[cat] = base;
  });
  const totalGeral = Object.values(totalAtletasPorCat).reduce((s,v)=>s+v,0);

  // Presença mais recente (última semana)
  const presAtual = Object.entries(HISTORICO_PRESENCA)
    .filter(([k])=>k!=='labels')
    .reduce((s,[,v])=>s+v[v.length-1],0);
  const presAnterior = Object.entries(HISTORICO_PRESENCA)
    .filter(([k])=>k!=='labels')
    .reduce((s,[,v])=>s+(v.length>=2?v[v.length-2]:0),0);
  const presTrend = presAtual >= presAnterior ? '↑' : '↓';
  const presTrendColor = presAtual >= presAnterior ? '#1a5c26' : '#8b1a1a';

  const _hpFluxo = HISTORICO_PRESENCA; // captura para os dois timeouts
  setTimeout(()=>{
    desenharGraficoReceitas('chart-receitas');
    desenharGraficoInadimplencia('chart-inadimplencia');
  },0);
  setTimeout(()=>{
    // Gráfico de fluxo de atletas — timeout separado
    destruirGrafico('chart-fluxo-atletas');
    const ctx = document.getElementById('chart-fluxo-atletas')?.getContext('2d');
    if(ctx){
      CHART_INSTANCES['chart-fluxo-atletas'] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: HISTORICO_PRESENCA.labels,
          datasets: [
            {label:'Sub-7', data:HISTORICO_PRESENCA.sub7, borderColor:'#c45e10',backgroundColor:'transparent',borderWidth:2,tension:.4,pointRadius:3},
            {label:'Sub-9', data:HISTORICO_PRESENCA.sub9, borderColor:'#0f8c6e',backgroundColor:'transparent',borderWidth:2,tension:.4,pointRadius:3},
            {label:'Sub-11',data:HISTORICO_PRESENCA.sub11,borderColor:'#0d3d1a',backgroundColor:'transparent',borderWidth:2,tension:.4,pointRadius:3},
            {label:'Sub-13',data:HISTORICO_PRESENCA.sub13,borderColor:'#0e3d6e',backgroundColor:'transparent',borderWidth:2,tension:.4,pointRadius:3},
            {label:'Sub-15',data:HISTORICO_PRESENCA.sub15,borderColor:'#8a6200',backgroundColor:'transparent',borderWidth:2,tension:.4,pointRadius:3},
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:8,font:{size:9}}}},
          scales:{y:{beginAtZero:true,ticks:{stepSize:2},title:{display:true,text:'Atletas presentes',font:{size:9}}}}
        }
      });
      CHART_INSTANCES['chart-fluxo-atletas'].resize();
    }
  },50);

  return `
  <div class="fin-grid" style="margin-bottom:10px">
    <div class="fin-card">
      <div class="fin-card-head"><div class="fin-card-ic" style="background:#1a5c26"><i class="ti ti-users"></i></div><h4>Receita — Sócios</h4></div>
      <div class="fin-mini-row"><span class="k">Em dia</span><span class="v" style="color:#1a5c26">${fmtR$(SOCIOS.filter(s=>s.status==='pago').reduce((s,x)=>s+x.valor,0))}</span></div>
      <div class="fin-mini-row"><span class="k">Em atraso</span><span class="v" style="color:#8b1a1a">${fmtR$(SOCIOS.filter(s=>s.status==='atraso').reduce((s,x)=>s+x.valor,0))}</span></div>
      <div class="fin-mini-row"><span class="k">A vencer</span><span class="v" style="color:#b8860b">${fmtR$(SOCIOS.filter(s=>s.status==='pendente').reduce((s,x)=>s+x.valor,0))}</span></div>
      <div class="fin-mini-row total"><span class="k">Total sócios</span><span class="v">${SOCIOS.length}</span></div>
    </div>
    <div class="fin-card">
      <div class="fin-card-head"><div class="fin-card-ic" style="background:#0e3d6e"><i class="ti ti-ball-football"></i></div><h4>Receita — Atletas</h4></div>
      ${(()=>{const af=atletasFlat;
        const pago=af.filter(a=>MENSALIDADES_ATLETAS[a.chave]?.status==='pago').reduce((s,a)=>s+(MENSALIDADES_ATLETAS[a.chave]?.valor||0),0);
        const atraso=af.filter(a=>MENSALIDADES_ATLETAS[a.chave]?.status==='atraso').reduce((s,a)=>s+(MENSALIDADES_ATLETAS[a.chave]?.valor||0),0);
        const pend=af.filter(a=>MENSALIDADES_ATLETAS[a.chave]?.status==='pendente').reduce((s,a)=>s+(MENSALIDADES_ATLETAS[a.chave]?.valor||0),0);
        return `<div class="fin-mini-row"><span class="k">Em dia</span><span class="v" style="color:#1a5c26">${fmtR$(pago)}</span></div>
        <div class="fin-mini-row"><span class="k">Em atraso</span><span class="v" style="color:#8b1a1a">${fmtR$(atraso)}</span></div>
        <div class="fin-mini-row"><span class="k">A vencer</span><span class="v" style="color:#b8860b">${fmtR$(pend)}</span></div>
        <div class="fin-mini-row total"><span class="k">Total atletas</span><span class="v">${af.length}</span></div>`;})()}
    </div>
  </div>
  <div class="fin-side-kpi" style="--color:#b8860b">
    <div class="kpi-row"><span class="kpi-lbl">Recebido no mês</span><span class="kpi-val">${fmtR$(c.recebido)}</span></div>
    <hr>
    <div class="kpi-row"><span class="kpi-lbl">Em atraso</span><span class="kpi-val">${fmtR$(c.emAtraso)}</span></div>
    <hr>
    <div class="kpi-row"><span class="kpi-lbl">Saldo do mês</span><span class="kpi-val">${c.saldo>=0?'+':'-'} ${fmtR$(Math.abs(c.saldo))}</span></div>
  </div>

  <!-- FLUXO DE ATLETAS POR CHAMADA -->
  <div class="chart-card" style="margin-top:10px">
    <div class="chart-card-head">
      <h4>Fluxo de atletas — presença por treino</h4>
      <span style="color:${presTrendColor};font-weight:700">${presTrend} ${presAtual}/${totalGeral} hoje</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:10px">
      ${Object.entries(totalAtletasPorCat).map(([cat, total])=>{
        const hist = HISTORICO_PRESENCA[cat];
        const presente = hist[hist.length-1];
        const pct = Math.round((presente/total)*100);
        const cor2 = pct>=80?'#1a5c26':pct>=60?'#b8860b':'#8b1a1a';
        const catNome = CATS_DATA[cat]?.nome || cat;
        return `<div style="text-align:center;background:#f8f7f4;border-radius:8px;padding:8px 4px">
          <div style="font-size:16px;font-weight:800;color:${cor2}">${presente}<span style="font-size:9px;color:#aaa">/${total}</span></div>
          <div style="font-size:8px;color:var(--text-3);font-weight:700;margin-top:2px">${catNome}</div>
          <div style="background:#e8e4dc;border-radius:3px;height:3px;margin-top:4px"><div style="width:${pct}%;height:3px;border-radius:3px;background:${cor2}"></div></div>
        </div>`;
      }).join('')}
    </div>
    <div class="chart-wrap" style="height:200px"><canvas id="chart-fluxo-atletas"></canvas></div>
  </div>

  <div class="chart-card">
    <div class="chart-card-head"><h4>Receita por origem — últimos 6 meses</h4><span>Sócios vs. atletas</span></div>
    <div class="chart-wrap"><canvas id="chart-receitas"></canvas></div>
  </div>
  <div class="chart-card">
    <div class="chart-card-head"><h4>Inadimplência — evolução mensal</h4><span>Valor em atraso</span></div>
    <div class="chart-wrap"><canvas id="chart-inadimplencia"></canvas></div>
  </div>
  <div class="lbl">Despesas do clube</div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <span style="font-size:11px;color:var(--text-3);font-weight:600">${DESPESAS_CLUBE.length} itens · Total ${fmtR$(DESPESAS_CLUBE.reduce((s,d)=>s+d.valor,0))}</span>
    <button class="btn-sm" onclick="abrirEditarDespesa(-1)">+ Nova</button>
  </div>
  <div class="cw" style="padding:6px 14px;margin-bottom:10px">
    ${DESPESAS_CLUBE.map((d,i)=>`
    <div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);gap:8px">
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:var(--text)">${d.descricao}</div>
      </div>
      <span style="font-size:12px;font-weight:700;color:#8b1a1a">${fmtR$(d.valor)}</span>
      <button class="btn-sm" onclick="abrirEditarDespesa(${i})">✏️</button>
      <button class="btn-sm" onclick="deletarDespesa(${i})" style="background:#fce8e8;color:#8b1a1a;border-color:#e8a0a0">🗑️</button>
    </div>`).join('')}
  </div>
  <div class="lbl">Pendências recentes</div>
  <div class="card" style="padding:2px">
    <table style="font-size:11px">
      <thead><tr><th>Nome</th><th>Tipo</th><th>Venc.</th><th>Valor</th><th>Status</th></tr></thead>
      <tbody>
        ${listarPendentes().slice(0,5).map(p=>`<tr>
          <td style="padding:8px"><span style="font-weight:700">${p.nome}</span></td>
          <td style="padding:8px">${p.tipo}</td>
          <td style="padding:8px">${p.venc}</td>
          <td style="padding:8px">${fmtR$(p.valor)}</td>
          <td style="padding:8px">${tagHtml(p.status)}</td>
        </tr>`).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:20px">Nenhuma pendência 🎉</td></tr>`}
      </tbody>
    </table>
  </div>`;
}

function renderFinSocios(){
  setTimeout(()=>desenharGraficoSocios('chart-socios-status'),0);
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <span style="font-family:var(--font-display);font-size:18px;letter-spacing:.06em;color:var(--text)">Sócios</span>
    <button class="btn-sm" onclick="abrirEditarSocio(null)">+ Novo Sócio</button>
  </div>
  <div class="chart-card">
    <div class="chart-card-head"><h4>Status dos sócios</h4><span>${SOCIOS.length} ativos</span></div>
    <div class="chart-wrap" style="height:160px"><canvas id="chart-socios-status"></canvas></div>
  </div>
  <div class="fin-card">
    <div class="fin-card-head"><div class="fin-card-ic" style="background:#b8860b"><i class="ti ti-crown"></i></div><h4>Planos do quadro social</h4></div>
    ${['Sócio Torcedor','Sócio Patrimonial','Sócio Benemérito'].map(p=>{
      const lista=SOCIOS.filter(s=>s.plano===p);
      return `<div class="fin-mini-row"><span class="k">${p} (${lista.length})</span><span class="v">${fmtR$(lista.reduce((s,x)=>s+x.valor,0))}</span></div>`;
    }).join('')}
    <div class="fin-mini-row total"><span class="k">Total mensal</span><span class="v">${fmtR$(SOCIOS.reduce((s,x)=>s+x.valor,0))}</span></div>
  </div>
  <div class="search-mini"><i class="ti ti-search" style="color:var(--text-3);font-size:14px"></i><input placeholder="Buscar sócio..." oninput="filtrarTabela(this.value,'tbl-socios')"></div>
  <div class="card" style="padding:2px">
    <table id="tbl-socios" style="font-size:11px">
      <thead><tr><th>Sócio</th><th>Plano</th><th>Valor</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${SOCIOS.map(s=>`<tr data-search="${s.nome.toLowerCase()}">
          <td style="padding:9px 8px"><div class="av-row"><div class="av" style="width:28px;height:28px;font-size:10px">${iniciais(s.nome)}</div><span style="font-weight:700">${s.nome}</span></div></td>
          <td style="padding:9px 8px">${s.plano}</td>
          <td style="padding:9px 8px">${fmtR$(s.valor)}</td>
          <td style="padding:9px 8px">${tagHtml(s.status)}</td>
          <td style="padding:9px 8px;white-space:nowrap">
            <button class="btn-sm" onclick="abrirEditarSocio('${s.id}')" style="margin-right:4px">✏️</button>
            <button class="btn-sm" onclick="deletarSocio('${s.id}')" style="background:#fce8e8;color:#8b1a1a;border-color:#e8a0a0">🗑️</button>
            ${s.status!=='pago'?`<br><button class="btn-sm" style="margin-top:4px" onclick="marcarSocioPago('${s.id}')">Marcar pago</button>`:''}
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  <button class="btn-g" style="margin-top:8px;background:#b8860b" onclick="cobrarTodosSocios()">📲 Cobrar inadimplentes</button>`;
}

function renderFinMensalidades(){
  const atletasFlat=listarTodosAtletas();
  setTimeout(()=>desenharGraficoMensalidadesCat('chart-mensalidades-cat'),0);
  return `
  <div class="chart-card">
    <div class="chart-card-head"><h4>Mensalidade por categoria</h4><span>Pago · atraso · pendente</span></div>
    <div class="chart-wrap"><canvas id="chart-mensalidades-cat"></canvas></div>
  </div>
  <div class="chips" id="chips-cat-fin">
    <span class="chip on" onclick="filtrarFinCatDesktop('todas',this)">Todas</span>
    ${Object.entries(CATS_DATA).map(([k,cd])=>`<span class="chip" onclick="filtrarFinCatDesktop('${k}',this)">${cd.emoji} ${cd.nome}</span>`).join('')}
  </div>
  <div class="card" style="padding:2px">
    <table id="tbl-mensalidades" style="font-size:11px">
      <thead><tr><th>Atleta</th><th>Cat.</th><th>Valor</th><th>Venc.</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${atletasFlat.map(a=>{
          const m=MENSALIDADES_ATLETAS[a.chave]||{valor:0,status:'pendente',venc:'—'};
          return `<tr data-cat="${a.catKey}">
            <td style="padding:8px"><div class="av-row"><div class="av" style="width:26px;height:26px;font-size:9px">${a.sig}</div><span style="font-weight:700">${a.nome}</span></div></td>
            <td style="padding:8px">${a.catEmoji} ${a.catNome}</td>
            <td style="padding:8px">${fmtR$(m.valor)}</td>
            <td style="padding:8px">${m.venc}</td>
            <td style="padding:8px">${tagHtml(m.status)}</td>
            <td style="padding:8px;white-space:nowrap">
              <button class="btn-sm" onclick="abrirEditarMensalidade('${a.chave}','${a.nome}')" style="margin-bottom:3px">✏️</button>
              ${m.status!=='pago'?`<br><button class="btn-sm" onclick="marcarAtletaPago('${a.chave}')">Pago</button>`:''}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  <button class="btn-g" style="margin-top:8px;background:#b8860b" onclick="cobrarTodosAtletas()">📲 Cobrar atletas em atraso</button>`;
}

function renderFinCobrancas(){
  const pend=listarPendentes();
  const totalAtraso=pend.filter(p=>p.status==='atraso').reduce((s,p)=>s+p.valor,0);
  const totalPend=pend.filter(p=>p.status==='pendente').reduce((s,p)=>s+p.valor,0);
  return `
  <div class="fin-side-kpi" style="--color:#8b1a1a">
    <div class="kpi-row"><span class="kpi-lbl">Em atraso</span><span class="kpi-val">${fmtR$(totalAtraso)}</span></div>
    <hr>
    <div class="kpi-row"><span class="kpi-lbl">A vencer</span><span class="kpi-val">${fmtR$(totalPend)}</span></div>
    <hr>
    <div class="kpi-row"><span class="kpi-lbl">Total pendências</span><span class="kpi-val">${pend.length}</span></div>
  </div>
  <div class="card" style="padding:2px">
    <table style="font-size:11px">
      <thead><tr><th>Nome</th><th>Tipo</th><th>Venc.</th><th>Valor</th><th>Status</th></tr></thead>
      <tbody>
        ${pend.length===0?`<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:24px">Nenhuma pendência 🎉</td></tr>`:
        pend.map(p=>`<tr>
          <td style="padding:9px 8px;font-weight:700">${p.nome}</td>
          <td style="padding:9px 8px">${p.tipo}</td>
          <td style="padding:9px 8px">${p.venc}</td>
          <td style="padding:9px 8px">${fmtR$(p.valor)}</td>
          <td style="padding:9px 8px">${tagHtml(p.status)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  ${pend.length>0?`<button class="btn-g" style="margin-top:8px;background:#8b1a1a" onclick="showN('Cobranças enviadas em massa!')">📲 Cobrar todos em massa</button>`:''}

  <!-- CONEXÃO FINANCEIRO → PROFESSOR: Arbitragem por categoria -->
  <div class="lbl" style="margin-top:12px">Arbitragem — Confirmar pagamentos (→ Professor)</div>
  ${(() => {
    const arbStatus = window.ARBITRAGEM_STATUS || {};
    const cats = Object.entries(arbStatus).filter(([,atletas])=>atletas.length>0);
    if(cats.length === 0) return '<div class="cw" style="padding:16px;text-align:center;font-size:11px;color:var(--text-3)">Nenhuma cobrança de arbitragem pendente</div>';
    return cats.map(([catKey, atletas]) => {
      const catNome = CATS_DATA[catKey]?.nome || catKey;
      const catEmoji = CATS_DATA[catKey]?.emoji || '⚽';
      const catCor = CORES[catKey] || '#0d3d1a';
      const pagos = atletas.filter(a=>a.pago).length;
      const pendentes = atletas.length - pagos;
      return `
      <div style="border:1.5px solid ${catCor}33;border-radius:12px;margin-bottom:10px;overflow:hidden">
        <!-- Cabeçalho categoria -->
        <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:${catCor}12;border-bottom:1px solid ${catCor}22">
          <div style="width:32px;height:32px;border-radius:9px;background:${catCor};display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">${catEmoji}</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:800;color:${catCor}">${catNome}</div>
            <div style="font-size:9px;color:var(--text-3)">${pagos} pagos · ${pendentes} pendentes</div>
          </div>
          ${pendentes > 0 ? `<button onclick="cobrarCatArb('${catKey}')" style="font-size:9px;font-weight:800;padding:4px 10px;border-radius:20px;border:none;cursor:pointer;background:${catCor};color:#fff">Cobrar todos</button>` : `<span style="font-size:9px;font-weight:700;color:#1a5c26">✓ Tudo pago</span>`}
        </div>
        <!-- Atletas -->
        <div style="padding:0 12px">
          ${atletas.map(a => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0ede8">
            <div class="av" style="width:28px;height:28px;font-size:9px;background:${catCor}">${a.sig}</div>
            <div style="flex:1">
              <div style="font-size:11px;font-weight:700">${a.sig}</div>
              <div style="font-size:9px;color:var(--text-3)">R$ 30,00 · Arbitragem · ${a.pago?'<span style=\"color:#1a5c26;font-weight:700\">✓ Pago</span>':'<span style=\"color:#b85c00\">Pendente</span>'}</div>
            </div>
            <div style="display:flex;gap:5px;flex-shrink:0">
              ${!a.pago ? `<button onclick="cobrarArbIndividual('${a.sig}','${catKey}')"
                style="font-size:8px;font-weight:800;padding:3px 8px;border-radius:20px;border:none;cursor:pointer;background:#e67e22;color:#fff">
                📲
              </button>` : ''}
              <button onclick="confirmarPagamentoArbitragem('${a.sig}','${catKey}')"
                style="font-size:8px;font-weight:800;padding:3px 8px;border-radius:20px;border:none;cursor:pointer;${a.pago?'background:#dcf0e0;color:#1a5c26':'background:#fde8e8;color:#8b1a1a'}">
                ${a.pago ? '✓ Pago' : 'Confirmar'}
              </button>
            </div>
          </div>`).join('')}
        </div>
      </div>`;
    }).join('');
  })()}`;
}

// =====================
// FINANCEIRO — montar
// =====================
function montarFinanceiro(cor){
  const navItems = ['Painel','Sócios','Mensalidades','Cobranças'];
  const bnavItems = [
    {icon:'ti-chart-pie',   label:'Painel'},
    {icon:'ti-users',       label:'Sócios'},
    {icon:'ti-currency-dollar',label:'Mensalidades'},
    {icon:'ti-alert-circle',label:'Cobranças'}
  ];
  montarNav(navItems, cor);
  montarBnav(bnavItems, cor);
  const sc = document.getElementById('screens');
  sc.innerHTML = `
  <div id="s-0" class="scr on" style="padding:11px 13px;overflow-y:auto">${renderFinPainel()}</div>
  <div id="s-1" class="scr" style="padding:11px 13px;overflow-y:auto">${renderFinSocios()}</div>
  <div id="s-2" class="scr" style="padding:11px 13px;overflow-y:auto">${renderFinMensalidades()}</div>
  <div id="s-3" class="scr" style="padding:11px 13px;overflow-y:auto">${renderFinCobrancas()}</div>`;
  setCor(cor);
}

// =====================
// ATLETA
// =====================
function montarAtleta(cor){
  const navItems = ['Feed','Evolução','Saúde','Estudos','Álbum','Calendário','Comprovantes'];
  const bnavItems = [
    {icon:'ti-home',label:'Feed'},
    {icon:'ti-chart-bar',label:'Evolução'},
    {icon:'ti-heart',label:'Saúde'},
    {icon:'ti-book',label:'Estudos'},
    {icon:'ti-stack',label:'Álbum'},
    {icon:'ti-calendar',label:'Agenda'},
    {icon:'ti-receipt',label:'Pagtos'}
  ];
  montarNav(navItems, cor);
  montarBnav(bnavItems, cor);
  const sc = document.getElementById('screens');
  sc.innerHTML = `
  <div id="s-0" class="scr on" style="padding:11px 13px;overflow-y:auto">${renderFeed(cor)}</div>
  <div id="s-1" class="scr" style="padding:11px 13px;overflow-y:auto">${renderEvolucao(cor)}</div>
  <div id="s-2" class="scr" style="padding:11px 13px;overflow-y:auto">${renderSaude(cor)}</div>
  <div id="s-3" class="scr" style="padding:11px 13px;overflow-y:auto">${renderEstudos(cor)}</div>
  <div id="s-4" class="scr" style="padding:11px 13px;overflow-y:auto">${renderAlbum(cor)}</div>
  <div id="s-5" class="scr" style="padding:11px 13px;overflow-y:auto">${renderCalendario(cor)}</div>
  <div id="s-6" class="scr" style="padding:11px 13px;overflow-y:auto">${renderComprovantes(cor)}</div>`;
  setCor(cor);
}

function renderFeed(cor){
  return `<div id="feed-msgs">
  ${[
    ['#185fa5','⚽ TREINO DE HOJE · Técnico André','Treino técnico com intensidade média. Habilidades: passe curto, finalização, drible. Balanço: ótimo!','agora · automático'],
    ['#c8940a','💧 SAÚDE · lembrete automático','Beba pelo menos 2 litros hoje. Leve garrafinha pro treino. Corpo hidratado rende mais!','07h00 · automático'],
    ['#185fa5','📚 ESTUDOS · lembrete automático','Atleta bom dentro e fora do campo! Separa 30 min pra estudar. "O estudo dura mais que o futebol." — Pelé','07h00 · automático'],
    ['#27500a','⭐ CONQUISTA DESBLOQUEADA','Kauan Telles desbloqueou a figurinha Épica #004 — Hat-trick! Parabéns!','3h · automático'],
  ].map(([bc,titulo,corpo,footer])=>`
  <div class="card" style="border-left:3px solid ${bc};margin-bottom:8px">
    <div style="font-size:9px;font-weight:700;color:${bc};margin-bottom:3px">${titulo}</div>
    <div style="font-size:11px;color:#333;line-height:1.6">${corpo}</div>
    <div style="font-size:9px;color:#aaa;margin-top:4px">${footer}</div>
  </div>`).join('')}
  <div class="card" id="msg-privada" style="display:none;border-left:3px solid ${cor}">
    <div style="font-size:9px;font-weight:700;color:${cor};margin-bottom:3px">✉️ MENSAGEM PRIVADA · Técnico André</div>
    <div style="font-size:11px;color:#333;line-height:1.6" id="msg-priv-txt"></div>
    <div style="font-size:9px;color:#aaa;margin-top:4px">agora · privado</div>
  </div>
  </div>`;
}

function renderEvolucao(cor){
  const a=ATLETA_DEFAULT;
  const pres = calcPres();
  const conq = getConquistas().length;
  const nivel = Math.floor(STATS.xp/1000)+1;
  const xpAtual = STATS.xp%1000;
  return `
  <!-- Input oculto para foto -->
  <input type="file" id="foto-input" accept="image/*" style="display:none" onchange="carregarFoto(event)">

  <div style="background:${cor};border-radius:var(--radius);padding:16px;margin-bottom:12px;position:relative;overflow:hidden;box-shadow:var(--shadow-md)">
    <div style="position:absolute;right:-10px;top:-10px;font-size:80px;opacity:.06;pointer-events:none">⚽</div>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">

      <!-- AVATAR COM FOTO -->
      <div onclick="document.getElementById('foto-input').click()" style="position:relative;cursor:pointer;flex-shrink:0">
        <div id="atleta-av" style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;overflow:hidden;letter-spacing:.03em">${a.sig}</div>
        <div style="position:absolute;bottom:0;right:0;width:20px;height:20px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.2)">
          <i class="ti ti-camera" style="font-size:11px;color:${cor}"></i>
        </div>
      </div>

      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div style="font-family:var(--font-display);font-size:18px;color:#fff;letter-spacing:.08em">${a.nome}</div>
          <button onclick="abrirEditarPerfil()" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);color:#fff;font-size:10px;padding:3px 8px;border-radius:8px;cursor:pointer;font-weight:600">✏️ Editar</button>
          ${(()=>{ const catKeyAtl = a.cat.toLowerCase().replace('-','').replace(' ',''); const mens = MENSALIDADES_ATLETAS[a.sig+catKeyAtl]; return (mens && mens.status !== 'pago') ? '<span style="background:#e74c3c;color:#fff;border-radius:12px;padding:2px 10px;font-size:10px;font-weight:800">⚠ Mensalidade em atraso</span>' : ''; })()}
        </div>
        <div style="font-size:10px;color:rgba(255,255,255,.65);margin-top:1px;font-weight:500">${a.pos} · ${a.cat} · Nível ${nivel}</div>
        <div style="background:rgba(255,255,255,.15);border-radius:4px;height:4px;margin-top:6px;overflow:hidden">
          <div id="xp-bar" style="width:${xpAtual/10}%;height:4px;border-radius:4px;background:rgba(255,255,255,.7);transition:width .5s"></div>
        </div>
        <div style="font-size:9px;color:rgba(255,255,255,.5);margin-top:2px;font-weight:500"><span id="stat-xp">${STATS.xp}</span>/1000 XP → Nível ${nivel+1}</div>
      </div>
      <div style="text-align:center;background:rgba(255,255,255,.12);padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.15)">
        <div style="font-size:22px;line-height:1">🔥</div>
        <div style="font-family:var(--font-display);font-size:16px;color:#fff;letter-spacing:.06em">${STATS.treinos}</div>
        <div style="font-size:8px;color:rgba(255,255,255,.5);font-weight:600;text-transform:uppercase;letter-spacing:.06em">treinos</div>
      </div>
    </div>

    <!-- DICA foto -->
    <div id="foto-dica" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border-radius:8px;padding:6px 10px;cursor:pointer" onclick="document.getElementById('foto-input').click()">
      <i class="ti ti-camera" style="font-size:13px;color:rgba(255,255,255,.7)"></i>
      <span style="font-size:10px;color:rgba(255,255,255,.7);font-weight:500">Toque para adicionar sua foto de perfil</span>
    </div>
  </div>
  <div class="stat-grid">
    <div class="stat-c" style="background:#dcf0e0;border:1px solid #8ec99a"><div class="stat-v" style="color:#1a5c26" id="stat-gols">${STATS.gols}</div><div class="stat-l" style="color:#1a5c26">Gols 2025</div></div>
    <div class="stat-c" style="background:#dceaf8;border:1px solid #7eb3e8"><div class="stat-v" style="color:#0e3d6e" id="stat-treinos">${STATS.treinos}</div><div class="stat-l" style="color:#0e3d6e">Treinos</div></div>
    <div class="stat-c" style="background:#fdf3dc;border:1px solid #e8c97a"><div class="stat-v" style="color:#7a4010" id="stat-pres">${pres}%</div><div class="stat-l" style="color:#7a4010">Presença</div></div>
    <div class="stat-c" style="background:#ece9fd;border:1px solid #afa9ec"><div class="stat-v" style="color:#3c2e9e" id="stat-conq">${conq}</div><div class="stat-l" style="color:#3c2e9e">Conquistas</div></div>
  </div>

  <div class="lbl">Foco desta semana</div>
  <div style="background:#fdf3dc;border:1px solid #e8c97a;border-left:3px solid #b8860b;border-radius:var(--radius-sm);padding:10px 12px;font-size:11px;color:#7a4010;line-height:1.6;margin-bottom:12px"><strong style="font-weight:700">Técnico André:</strong> Foque no passe curto e na marcação. Sua finalização está excelente!</div>

  <div class="lbl">Habilidades</div>
  <div class="cw" style="padding:12px 14px" id="ev-hab-container">
    ${Object.entries(HAB_LABELS).map(([k,label])=>{
      const val = (HABILIDADES['KTsub13']||{})[k] || 70;
      const c = val>=75?'#0d3d1a':val>=50?'#b8860b':'#c0392b';
      return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:10px;color:var(--text-2);width:76px;font-weight:500">${label}</span>
        <div style="flex:1;background:var(--border);border-radius:4px;height:5px;overflow:hidden"><div id="ev-bar-${k}" style="width:${val}%;height:5px;border-radius:4px;background:${c};transition:width .6s ease"></div></div>
        <span id="ev-val-${k}" style="font-size:10px;font-weight:700;color:${c};width:24px;text-align:right">${val}</span>
      </div>`;
    }).join('')}
  </div>

  <div class="lbl">Conquistas</div>
  <div class="cw" style="padding:10px 14px">
    ${CONQUISTAS_DEF.map(c=>{
      const desbloqueada = c.check();
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);opacity:${desbloqueada?1:0.4}">
        <div style="width:34px;height:34px;border-radius:9px;background:${desbloqueada?'#dcf0e0':'var(--surface)'};border:1px solid ${desbloqueada?'#8ec99a':'var(--border)'};display:flex;align-items:center;justify-content:center;font-size:16px">${c.icon}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700;color:${desbloqueada?'var(--text)':'var(--text-3)'}">${c.titulo}</div>
          <div style="font-size:10px;color:var(--text-3);font-weight:500">${c.meta}</div>
        </div>
        ${desbloqueada?'<span class="tag tg">✓</span>':'<span class="tag" style="background:var(--surface);color:var(--text-3)">🔒</span>'}
      </div>`;
    }).join('')}
  </div>

  ${(()=>{
    const sig = a.sig;
    const catKey = (a.cat||'Sub-13').replace(/[^a-z0-9]/gi,'').toLowerCase().replace('sub','sub');
    const ficKey = sig + catKey;
    const hist = (FICHAS[ficKey]||{}).hist_presenca || [];
    if(hist.length === 0) return '';
    const ultimos = hist.slice(-10).reverse();
    return `<div class="lbl">Histórico de presença (chamada)</div>
  <div class="cw" style="padding:10px 14px">
    ${ultimos.map(h=>{
      const cor2 = h.status==='P'?'#dcf0e0':h.status==='F'?'#fde8e8':'#f0f0f0';
      const tc2  = h.status==='P'?'#1a5c26':h.status==='F'?'#8b1a1a':'#888';
      const icon = h.status==='P'?'✓':h.status==='F'?'✗':'–';
      return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">
        <div style="width:26px;height:26px;border-radius:7px;background:${cor2};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${tc2}">${icon}</div>
        <span style="font-size:11px;color:var(--text);font-weight:500">${h.data}</span>
        <span style="font-size:10px;color:${tc2};font-weight:600;margin-left:auto">${h.status==='P'?'Presente':h.status==='F'?'Falta':'Não marcado'}</span>
      </div>`;
    }).join('')}
  </div>`;
  })()}

  ${(()=>{
    const convs = JOGOS_AGENDADOS.filter(j=>j.conv&&j.conv.includes(a.sig));
    if(convs.length===0) return '';
    return `<div class="lbl">Histórico de convocações</div>
  <div class="cw" style="padding:10px 14px">
    ${convs.slice(-8).reverse().map(c=>`
    <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">
      <div style="width:26px;height:26px;border-radius:7px;background:#dceaf8;display:flex;align-items:center;justify-content:center;font-size:13px">⚽</div>
      <div style="flex:1">
        <div style="font-size:11px;font-weight:700;color:var(--text)">vs ${c.adv||'Adversário'}</div>
        <div style="font-size:9px;color:var(--text-3)">${c.data||''} ${c.hora||''} · ${c.cat||''}</div>
      </div>
      <span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:6px;background:#dceaf8;color:#0e3d6e">Convocado</span>
    </div>`).join('')}
  </div>`;
  })()}

  ${(()=>{
    const sig = a.sig;
    const catKey = (a.cat||'Sub-13').replace(/[^a-z0-9]/gi,'').toLowerCase();
    const ficKey = sig + catKey;
    const avs = (FICHAS[ficKey]||{}).hist_avaliacoes || [];
    if(avs.length === 0) return '';
    return `<div class="lbl">Avaliações do técnico</div>
  <div class="cw" style="padding:10px 14px">
    ${avs.slice(-6).reverse().map(av=>{
      const cor2 = av.conceito==='Ótimo'?'#dcf0e0':av.conceito==='Bem'?'#dceaf8':av.conceito==='Atenção'?'#faeeda':'#f0f0f0';
      const tc2  = av.conceito==='Ótimo'?'#1a5c26':av.conceito==='Bem'?'#0e3d6e':av.conceito==='Atenção'?'#633806':'#888';
      return `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;background:${cor2};color:${tc2}">${av.conceito}</span>
          <span style="font-size:10px;color:var(--text-3)">${av.data}</span>
        </div>
        ${av.chips&&av.chips.length?`<div style="font-size:10px;color:var(--text-2)">${av.chips.join(' · ')}</div>`:''}
        ${av.nota?`<div style="font-size:10px;color:var(--text-3);margin-top:2px;font-style:italic">"${av.nota}"</div>`:''}
      </div>`;
    }).join('')}
  </div>`;
  })()}`;
}

function renderSaude(cor){
  return `<div style="background:#e6f4ec;border:1px solid #97c459;border-radius:12px;padding:12px;margin-bottom:10px">
    <div style="font-size:26px;margin-bottom:5px">💧</div>
    <div style="font-size:9px;font-weight:700;color:#3b6d11;margin-bottom:3px;text-transform:uppercase;letter-spacing:.05em">HIDRATAÇÃO · lembrete do dia</div>
    <div style="font-size:13px;font-weight:700;color:#27500a;margin-bottom:5px">Beba água antes, durante e depois!</div>
    <div style="font-size:11px;color:#166024;line-height:1.6">Beba pelo menos 2 litros hoje. Leve garrafinha pro treino. Corpo hidratado rende mais no campo e na escola!</div>
    <div style="font-size:10px;background:rgba(22,96,36,.1);color:#27500a;padding:6px 8px;border-radius:7px;margin-top:8px"><strong>Dica:</strong> Garrafinha de 500ml → esvazie 4 vezes ao longo do dia.</div>
  </div>
  <div class="lbl">Check-in de saúde de hoje</div>
  <div class="cw" style="padding:6px 11px">
    ${[['Bebi 2 litros de água',10],['Comi fruta hoje',10],['Dormi 8 horas',10],['Me alonguei',5],['Evitei refrigerante e salgadinho',10]].map(([l,x])=>`
    <div class="check-item" onclick="togChk(this,'${cor}')">
      <div class="chk"><i class="ti ti-check" style="font-size:10px;color:#fff"></i></div>
      <span class="chk-lbl">${l}</span>
      <span class="xp-tag">+${x} XP</span>
    </div>`).join('')}
  </div>
  <button class="btn-g" style="background:${cor}" onclick="salvarCheckin('saude')">Confirmar check-in de saúde</button>`;
}

function renderEstudos(cor){
  return `<div style="background:#e6f1fb;border:1px solid #85b7eb;border-radius:12px;padding:12px;margin-bottom:10px">
    <div style="font-size:26px;margin-bottom:5px">📚</div>
    <div style="font-size:9px;font-weight:700;color:#185fa5;margin-bottom:3px;text-transform:uppercase;letter-spacing:.05em">ESTUDOS · lembrete do dia</div>
    <div style="font-size:13px;font-weight:700;color:#0c447c;margin-bottom:5px">Atleta bom dentro e fora do campo!</div>
    <div style="font-size:11px;color:#042c53;line-height:1.6">Os maiores jogadores sabem que futebol tem prazo — o conhecimento é para sempre. Estuda hoje, é treino também!</div>
    <div style="font-size:11px;font-style:italic;color:#185fa5;margin-top:8px;padding:7px 9px;border-radius:7px;background:rgba(24,95,165,.08);border-left:2px solid #85b7eb">"Futebol me deu muito, mas o estudo me dará muito mais." — Pelé</div>
  </div>
  <div class="lbl">Check-in de estudos de hoje</div>
  <div class="cw" style="padding:6px 11px">
    ${[['Fui à escola hoje',15],['Fiz o dever de casa',15],['Estudei 30 minutos',15],['Li alguma coisa hoje',10],['Não faltei à escola sem motivo',15]].map(([l,x])=>`
    <div class="check-item" onclick="togChk(this,'#185fa5')">
      <div class="chk"><i class="ti ti-check" style="font-size:10px;color:#fff"></i></div>
      <span class="chk-lbl">${l}</span>
      <span class="xp-tag">+${x} XP</span>
    </div>`).join('')}
  </div>
  <button class="btn-g" style="background:#185fa5" onclick="salvarCheckin('estudos')">Confirmar check-in de estudos</button>`;
}

function mkCard(tp,bg,st,ev,nome,zoom){
  const rings = {
    'Comum':    {ring:'rgba(180,180,200,.7)', star:'rgba(220,220,240,.95)', shadow:'rgba(100,100,140,.5)'},
    'Rara':     {ring:'rgba(60,140,255,.8)',  star:'rgba(120,190,255,.95)', shadow:'rgba(20,60,200,.55)'},
    'Épica':    {ring:'rgba(170,70,255,.8)',  star:'rgba(200,120,255,.95)', shadow:'rgba(90,10,200,.55)'},
    'Lendária': {ring:'rgba(255,210,0,.9)',   star:'rgba(255,215,0,1)',     shadow:'rgba(200,148,10,.65)'},
  };
  const r = rings[tp] || rings['Comum'];

  // Escudo SVG do Votoraty como marca d'água
  const escudo = `<div style="position:absolute;bottom:30%;left:50%;transform:translateX(-50%);width:65%;aspect-ratio:1;opacity:.07;pointer-events:none;z-index:1">
    <svg viewBox="0 0 100 110" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 2 L95 20 L95 60 Q95 90 50 108 Q5 90 5 60 L5 20 Z"/>
      <path d="M50 12 L85 27 L85 60 Q85 85 50 100 Q15 85 15 60 L15 27 Z" fill="rgba(0,0,0,.3)"/>
      <text x="50" y="62" text-anchor="middle" font-size="22" font-weight="900" fill="white" font-family="Impact,Arial">VFC</text>
    </svg>
  </div>`;

  const temFoto = typeof fotoAtleta!=='undefined' && fotoAtleta;
  const fotoSection = temFoto
    ? `<div style="position:absolute;inset:0;z-index:0"><img src="${fotoAtleta}" style="width:100%;height:100%;object-fit:cover;object-position:top center"></div>
       <div style="position:absolute;inset:0;z-index:1;background:linear-gradient(to bottom,rgba(0,0,0,.05) 0%,rgba(0,0,0,.0) 40%,rgba(0,0,0,.55) 75%,rgba(0,0,0,.85) 100%)"></div>`
    : `<div style="position:absolute;inset:0;z-index:0;display:flex;align-items:center;justify-content:center">
         <svg viewBox="0 0 60 72" fill="${r.ring}" width="52%" opacity=".7"><circle cx="30" cy="20" r="14"/><path d="M2 72c0-15.5 12.5-28 28-28s28 12.5 28 28"/></svg>
       </div>`;

  const onclick = zoom ? `onclick="abrirZoom('${tp}','${bg}','${st}','${ev}')"` : '';

  return `<div class="stk-card" style="background:${bg};border:2.5px solid ${r.ring};box-shadow:0 6px 24px ${r.shadow};position:relative;overflow:hidden" ${onclick}>
    ${fotoSection}
    ${escudo}
    <div class="stk-diagonal"></div>

    <!-- Topo: raridade + estrelas -->
    <div style="position:relative;z-index:3;display:flex;justify-content:space-between;align-items:flex-start;padding:7px 7px 0">
      <div style="font-size:7px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:2px 7px;border-radius:10px;background:rgba(0,0,0,.45);color:#fff;border:1px solid rgba(255,255,255,.2)">${tp}</div>
      <div style="font-size:10px;color:${r.star};text-shadow:0 1px 4px rgba(0,0,0,.6)">${st}</div>
    </div>

    <!-- Espaço central (foto ocupa) -->
    <div style="flex:1"></div>

    <!-- Rodapé -->
    <div style="position:relative;z-index:3;padding:6px 8px 7px">
      <div style="font-size:15px;font-weight:900;color:#fff;letter-spacing:.06em;font-family:Impact,'Arial Narrow',sans-serif;text-shadow:0 2px 6px rgba(0,0,0,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.1;margin-bottom:3px">${nome.toUpperCase()}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:11px;letter-spacing:1px;color:${r.star};text-shadow:0 1px 4px rgba(0,0,0,.5)">${st}</span>
        <span style="font-size:8px;font-weight:700;color:rgba(255,255,255,.9);background:rgba(0,0,0,.4);padding:2px 6px;border-radius:6px;white-space:nowrap">${ev}</span>
      </div>
    </div>
  </div>`;
}

function abrirZoom(tp, bg, st, ev){
  const rings = {
    'Comum':    {ring:'rgba(180,180,200,.7)', star:'rgba(220,220,240,.95)'},
    'Rara':     {ring:'rgba(60,140,255,.8)',  star:'rgba(120,190,255,.95)'},
    'Épica':    {ring:'rgba(170,70,255,.8)',  star:'rgba(200,120,255,.95)'},
    'Lendária': {ring:'rgba(255,210,0,.9)',   star:'rgba(255,215,0,1)'},
  };
  const r = rings[tp] || rings['Comum'];
  const hab = HABILIDADES['KTsub13']||{fin:88,dri:81,vel:75,pas:62,mar:54,ati:95};
  const temFoto = typeof fotoAtleta!=='undefined' && fotoAtleta;

  document.getElementById('stk-zoom').classList.add('on');
  document.getElementById('stk-zoom-card').style.cssText = '';
  document.getElementById('stk-zoom-card').innerHTML = `
    <div style="background:${bg};border-radius:20px;overflow:hidden;position:relative;border:2.5px solid ${r.ring}">

      <!-- Foto de fundo preenchendo -->
      ${temFoto
        ? `<div style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:0"><img src="${fotoAtleta}" style="width:100%;height:100%;object-fit:cover;object-position:top center"></div>
           <div style="position:absolute;inset:0;z-index:1;background:linear-gradient(to bottom,rgba(0,0,0,.08) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.6) 72%,rgba(0,0,0,.92) 100%)"></div>`
        : `<div style="position:absolute;inset:0;z-index:0;display:flex;align-items:center;justify-content:center;padding-bottom:60px">
             <svg viewBox="0 0 60 72" fill="${r.ring}" width="55%" opacity=".6"><circle cx="30" cy="20" r="14"/><path d="M2 72c0-15.5 12.5-28 28-28s28 12.5 28 28"/></svg>
           </div>`}

      <!-- Escudo VFC marca d'água -->
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) translateY(-20px);width:60%;aspect-ratio:1;opacity:.07;z-index:1;pointer-events:none">
        <svg viewBox="0 0 100 110" fill="white"><path d="M50 2 L95 20 L95 60 Q95 90 50 108 Q5 90 5 60 L5 20 Z"/><path d="M50 12 L85 27 L85 60 Q85 85 50 100 Q15 85 15 60 L15 27 Z" fill="rgba(0,0,0,.3)"/><text x="50" y="62" text-anchor="middle" font-size="22" font-weight="900" fill="white" font-family="Impact,Arial">VFC</text></svg>
      </div>

      <!-- Topo -->
      <div style="position:relative;z-index:3;display:flex;justify-content:space-between;align-items:flex-start;padding:14px 14px 0">
        <div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:3px 10px;border-radius:12px;background:rgba(0,0,0,.5);color:#fff;border:1px solid ${r.ring}">${tp}</div>
        <div style="font-size:14px;color:${r.star};text-shadow:0 1px 4px rgba(0,0,0,.7)">${st}</div>
      </div>

      <!-- Espaço foto -->
      <div style="height:150px"></div>

      <!-- Nome + conquista -->
      <div style="position:relative;z-index:3;padding:10px 14px 8px">
        <div style="font-family:Impact,'Arial Narrow',sans-serif;font-size:24px;letter-spacing:.08em;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.7)">KAUAN TELLES</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:5px">
          <span style="font-size:16px;color:${r.star};text-shadow:0 1px 4px rgba(0,0,0,.6)">${st}</span>
          <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:8px;background:rgba(0,0,0,.45);color:rgba(255,255,255,.95);border:1px solid rgba(255,255,255,.15)">${ev}</span>
        </div>
      </div>

      <!-- 6 Atributos -->
      <div style="display:grid;grid-template-columns:repeat(6,1fr);background:rgba(0,0,0,.55);border-top:1px solid ${r.ring}33;position:relative;z-index:3">
        ${[['FIN',hab.fin],['DRI',hab.dri],['VEL',hab.vel],['PAS',hab.pas],['MAR',hab.mar],['ATI',hab.ati]].map(([l,v])=>`
        <div style="padding:9px 2px;text-align:center;border-right:1px solid rgba(255,255,255,.08)">
          <div style="font-size:15px;font-weight:700;color:${r.star};line-height:1">${v}</div>
          <div style="font-size:7px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.05em;margin-top:2px">${l}</div>
        </div>`).join('')}
      </div>
    </div>
  `;
}

function fecharZoom(){
  document.getElementById('stk-zoom').classList.remove('on');
}

function renderAlbum(cor){
  const cards = [
    {tp:'Comum',    bg:'linear-gradient(155deg,#5a5a70,#8a8aa0)', st:'★☆☆☆☆', ev:'1º gol'},
    {tp:'Épica',    bg:'linear-gradient(155deg,#3a1a6a,#7a3aaa)', st:'★★★☆☆', ev:'Hat-trick'},
    {tp:'Épica',    bg:'linear-gradient(155deg,#3a1a6a,#7a3aaa)', st:'★★★☆☆', ev:'Artilheiro'},
    {tp:'Rara',     bg:'linear-gradient(155deg,#1a3a7a,#3a6abe)', st:'★★☆☆☆', ev:'MVP da final'},
    {tp:'Rara',     bg:'linear-gradient(155deg,#1a3a7a,#3a6abe)', st:'★★☆☆☆', ev:'5 gols'},
    {tp:'Lendária', bg:'linear-gradient(155deg,#7a5200,#c8940a,#f5c842)', st:'★★★★★', ev:'14 gols'},
  ];

  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.06em;color:var(--text)">Álbum — ${ATLETA_DEFAULT.nome}</div>
      <div style="font-size:10px;color:var(--text-3);font-weight:500">6 figurinhas · 1 lendária</div>
    </div>
    <span class="tag ta">Sub-13 · 2025</span>
  </div>

  <div class="stk-grid">
    ${cards.map(c=>mkCard(c.tp,c.bg,c.st,c.ev,'K. Telles',true)).join('')}
  </div>

  <div style="border:2px dashed var(--border);border-radius:14px;padding:18px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80px;margin-bottom:12px;opacity:.5">
    <i class="ti ti-lock" style="font-size:24px;color:var(--text-3)"></i>
    <div style="font-size:10px;color:var(--text-3);margin-top:6px;text-align:center;font-weight:500">Marque 20 gols para desbloquear</div>
  </div>

  <div style="border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(200,148,10,.4);cursor:pointer;margin-bottom:4px"
    onclick="abrirZoom('Lendária','linear-gradient(155deg,#7a5200,#c8940a,#f5c842)','★★★★★','14 gols')">
    <div style="background:linear-gradient(160deg,#6a4a00,#c8940a);padding:12px 14px;display:flex;align-items:center;gap:10px">
      <div style="width:36px;height:36px;border-radius:8px;background:#1a1a2e;border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">⚽</div>
      <div style="flex:1">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;color:#fff;letter-spacing:.08em">FIGURINHA ANUAL 2025</div>
        <div style="font-size:9px;color:rgba(255,255,255,.7)">Edição limitada · Sub-13 · Votoraty Academy</div>
      </div>
      <div style="font-size:16px;color:rgba(255,215,0,.95);letter-spacing:2px">★★★★★</div>
    </div>
    <div style="background:linear-gradient(160deg,#3a2000,#5a3500);padding:12px 14px;display:flex;align-items:center;gap:12px">
      <div class="stk-foto" style="width:52px;height:52px;border-radius:50%;border:2.5px solid #c8940a;background:rgba(200,148,10,.2);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#c8940a;flex-shrink:0;overflow:hidden">KT</div>
      <div style="flex:1">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:#fff;letter-spacing:.06em">KAUAN TELLES</div>
        <div style="font-size:10px;color:rgba(255,255,255,.6);margin:2px 0 6px">14 gols · 38 treinos · Artilheiro · Sub-13</div>
        <div style="display:flex;gap:10px">
          ${[['FIN',88],['DRI',81],['VEL',75],['PAS',62]].map(([l,v])=>`
          <div style="text-align:center"><div style="font-size:14px;font-weight:700;color:#c8940a">${v}</div><div style="font-size:7px;color:rgba(255,255,255,.5);text-transform:uppercase">${l}</div></div>`).join('')}
        </div>
      </div>
      <button onclick="event.stopPropagation();showN('✓ PDF gerado! Pronto para imprimir.')"
        style="background:#c8940a;color:#fff;border:none;padding:8px 14px;border-radius:10px;font-size:10px;font-weight:700;cursor:pointer;flex-shrink:0">PDF</button>
    </div>
  </div>`;
}

// =====================
// UTILITÁRIOS UI
// =====================
function togChk(el,cor){
  const b=el.querySelector('.chk');
  const l=el.querySelector('.chk-lbl');
  const on=b.classList.toggle('on');
  if(on){b.style.background=cor;b.style.borderColor=cor;}
  else{b.style.background='';b.style.borderColor='#ddd';}
  l.classList.toggle('done',on);
}

function salvarCheckin(tipo){
  const sel=document.querySelectorAll('.chk.on').length;
  showN('✓ Check-in de '+tipo+' salvo! +'+sel*10+' XP conquistados!');
}

function montarNav(items, cor){
  _resetNav(cor);
  const nav = document.getElementById('nav');
  nav.setAttribute('role','navigation');
  nav.setAttribute('aria-label','Navegação principal');
  nav.innerHTML = items.map((nm,i)=>
    `<div class="nt${i===0?' on':''}" onclick="goTab(${i},'${cor}')" style="${i===0?'color:'+cor+';border-bottom-color:'+cor:''}" role="button" aria-label="Ir para ${nm}"${i===0?' aria-current="page"':''} tabindex="0">${nm}</div>`
  ).join('');
}

function montarBnav(items, cor){
  const bnav = document.getElementById('bnav');
  bnav.setAttribute('role','navigation');
  bnav.setAttribute('aria-label','Navegação inferior');
  bnav.innerHTML = items.map((it,i)=>
    `<div class="bi${i===0?' on':''}" onclick="goTab(${i},'${cor}')" role="button" aria-label="Ir para ${it.label}"${i===0?' aria-current="page"':''} tabindex="0">
      <i class="ti ${it.icon}" style="color:${i===0?cor:'#ccc'}" aria-hidden="true"></i>
      <span style="color:${i===0?cor:'#ccc'}">${it.label}</span>
    </div>`
  ).join('');
}

let _navHistory = [];
let _navCurrentIdx = 0;
let _navCor = '#0d3d1a';

function goTab(idx, cor, _push=true){
  if(_push && idx !== _navCurrentIdx) _navHistory.push(_navCurrentIdx);
  _navCurrentIdx = idx;
  if(cor) _navCor = cor;
  document.querySelectorAll('[id^="s-"]').forEach((s,i)=>s.classList.toggle('on',i===idx));
  document.querySelectorAll('#nav .nt').forEach((t,i)=>{
    t.classList.toggle('on',i===idx);
    t.style.color=i===idx?_navCor:'#bbb';
    t.style.borderBottomColor=i===idx?_navCor:'transparent';
  });
  document.querySelectorAll('#bnav .bi').forEach((t,i)=>{
    t.classList.toggle('on',i===idx);
    t.querySelector('i').style.color=i===idx?_navCor:'#ccc';
    t.querySelector('span').style.color=i===idx?_navCor:'#ccc';
  });
  _atualizarBtnVoltar();
}

function goBack(){
  if(_navHistory.length===0) return;
  const prev = _navHistory.pop();
  goTab(prev, _navCor, false);
}

function _resetNav(cor){
  _navHistory = [];
  _navCurrentIdx = 0;
  _navCor = cor || '#0d3d1a';
  _atualizarBtnVoltar();
}

function _atualizarBtnVoltar(){
  const btn = document.getElementById('btn-voltar');
  if(!btn) return;
  if(_navHistory.length > 0){
    btn.style.display = 'flex';
    btn.style.background = _navCor + '22';
    btn.style.borderColor = _navCor + '55';
    btn.querySelector('i').style.color = _navCor;
  } else {
    btn.style.display = 'none';
  }
}

function showN(txt,err){
  const el=document.getElementById('notif-el');
  document.getElementById('notif-txt').textContent=txt;
  el.style.background=err?'#fce8e8':'#dcf0e0';
  el.style.borderColor=err?'#e8a0a0':'#8ec99a';
  el.style.color=err?'#8b1a1a':'#1a5c26';
  document.getElementById('notif-wrap').style.display='block';
  setTimeout(()=>document.getElementById('notif-wrap').style.display='none',3200);
}

let offlineMode=false;
function toggleOff(){
  offlineMode=!offlineMode;
  document.getElementById('offline-dot').style.display=offlineMode?'inline-block':'none';
  document.getElementById('btn-off').textContent=offlineMode?'Online':'Offline';
  showN(offlineMode?'📵 Modo offline. Dados salvos no celular.':'📶 Online! Sincronizando...');
}

// Detecta mudanças reais de conectividade
window.addEventListener('offline', ()=>{
  offlineMode = true;
  const dot = document.getElementById('offline-dot');
  if(dot){ dot.style.display='inline-block'; dot.textContent='OFFLINE'; }
  showN('⚠ Modo offline — dados salvos localmente');
});
window.addEventListener('online', ()=>{
  offlineMode = false;
  const dot = document.getElementById('offline-dot');
  if(dot) dot.style.display='none';
  const agora = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  showN('✓ Online — dados sincronizados às '+agora);
  if(typeof salvarFirestore === 'function') salvarFirestore();
});

function sair(){
  // Para o listener em tempo real do atleta
  if(_listener){ _listener(); _listener=null; }
  // Sign out do Firebase
  if(_auth) _auth.signOut().catch(()=>{});
  perfilAtual = null;
  document.getElementById('app').style.display='none';
  document.getElementById('tela-inicial').style.display='flex';
  const dp = document.getElementById('desktop-panel');
  if(dp && window.innerWidth >= 900) dp.style.display='block';
  chamadas={};golsV=2;offlineMode=false;
  const mini = document.getElementById('header-mini-av');
  if(mini) mini.remove();
}

function cadastrarAtleta(){
  const nm=document.getElementById('m-nome').value||'Novo Atleta';
  fecharModal('modal-atleta');
  showN('✓ '+nm+' cadastrado! Acesso enviado ao responsável.');
  document.getElementById('m-nome').value='';
}

function abrirModal(id){
  document.getElementById(id).classList.add('on');
  document.body.style.overflow='hidden';
  const sc = document.getElementById('screens');
  if(sc) sc.style.overflow='hidden';
  // Se for modal de jogo, popula a lista de convocação
  if(id === 'modal-jogo') popularConvJogo();
}

let unifSel = 1;
let jogoConvSel = {};

function popularConvJogo(){
  // Pega atletas da categoria selecionada
  const cat = document.getElementById('jogo-cat')?.value || 'Sub-13';
  const catKey = cat.toLowerCase().replace('-','');
  const atletas = CATS_DATA[catKey]?.atletas || CATS_DATA['sub13'].atletas;
  const cor = getComputedStyle(document.documentElement).getPropertyValue('--color').trim() || '#0d3d1a';

  jogoConvSel = {};
  atletas.forEach(a => jogoConvSel[a.sig] = true); // todos selecionados por padrão

  const lista = document.getElementById('jogo-conv-lista');
  if(!lista) return;
  lista.innerHTML = atletas.map(a=>`
    <button id="jconv-${a.sig}" onclick="toggleJconv('${a.sig}','${cor}')"
      style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:20px;border:1.5px solid ${cor};background:${cor};color:#fff;font-size:10px;font-weight:700;cursor:pointer;transition:all .15s">
      <div style="width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700">${a.sig}</div>
      ${a.nome.split(' ')[0]}
    </button>`).join('');
}

function toggleJconv(sig, cor){
  const btn = document.getElementById('jconv-'+sig);
  if(!btn) return;
  if(jogoConvSel[sig]){
    delete jogoConvSel[sig];
    btn.style.background = '#fff';
    btn.style.color = cor;
    btn.style.borderColor = cor;
  } else {
    jogoConvSel[sig] = true;
    btn.style.background = cor;
    btn.style.color = '#fff';
  }
}

function convTodos(sel){
  const cor = getComputedStyle(document.documentElement).getPropertyValue('--color').trim() || '#0d3d1a';
  document.querySelectorAll('[id^="jconv-"]').forEach(btn=>{
    const sig = btn.id.replace('jconv-','');
    if(sel){
      jogoConvSel[sig] = true;
      btn.style.background = cor; btn.style.color = '#fff'; btn.style.borderColor = cor;
    } else {
      delete jogoConvSel[sig];
      btn.style.background = '#fff'; btn.style.color = cor;
    }
  });
}

function selUnif(n){
  unifSel = n;
  const cor = getComputedStyle(document.documentElement).getPropertyValue('--color').trim() || '#0d3d1a';
  ['unif-1','unif-2'].forEach((id,i)=>{
    const btn = document.getElementById(id);
    if(!btn) return;
    if(i+1 === n){
      btn.style.background = cor; btn.style.color = '#fff'; btn.style.borderColor = cor; btn.style.fontWeight = '700';
    } else {
      btn.style.background = '#fff'; btn.style.color = 'var(--text-2)'; btn.style.borderColor = 'var(--border)'; btn.style.fontWeight = '600';
    }
  });
}

function toggleLocalCustom(){
  const sel = document.getElementById('jogo-local-tipo');
  const custom = document.getElementById('jogo-local-custom');
  if(sel && custom) custom.style.display = sel.value === 'outro' ? 'block' : 'none';
}

// Array global de jogos agendados
const JOGOS_AGENDADOS = [
  {id:'j001', adv:'União Sport', data:'2025-06-08', hora:'09:00', local:'Campo Estrela',    cat:'Sub-13', camp:'Camp. Municipal', fase:'Fase de grupos', unif:'Uniforme 1 (branco)', conv:['KT','PA','MT','RC','TN'], obs:'Chegue 30min antes.', status:'agendado'},
  {id:'j002', adv:'Grêmio Jr',   data:'2025-06-22', hora:'10:00', local:'Campo do Votoraty',cat:'Sub-13', camp:'Camp. Municipal', fase:'Quartas',         unif:'Uniforme 2 (azul)',  conv:['KT','PA','MT','RC','TN'], obs:'Uniforme azul obrigatório.', status:'agendado'},
];

const JOGOS_RESULTADOS = [
  {adv:'Atlético Jr', data:'18/05', gv:2, ga:1, resultado:'Vitória',  cat:'Sub-13'},
  {adv:'Estrela FC',  data:'04/05', gv:3, ga:0, resultado:'Vitória',  cat:'Sub-13'},
  {adv:'Rapid FC',    data:'20/04', gv:1, ga:2, resultado:'Derrota',  cat:'Sub-13'},
];

function agendarJogo(){
  const adv = document.getElementById('jogo-adv')?.value?.trim();
  if(!adv){ showN('⚠️ Informe o nome do adversário.',true); return; }
  const data = document.getElementById('jogo-data')?.value;
  if(!data){ showN('⚠️ Informe a data do jogo.',true); return; }
  const hora  = document.getElementById('jogo-hora')?.value || '09:00';
  const cat   = document.getElementById('jogo-cat')?.value || 'Sub-13';
  const localTipo = document.getElementById('jogo-local-tipo')?.value || 'Campo do Votoraty';
  const localCustom = document.getElementById('jogo-local-txt')?.value?.trim();
  const local = localTipo === 'outro' ? (localCustom || 'A definir') : localTipo;
  const camp  = document.getElementById('jogo-camp')?.value || 'Camp. Municipal';
  const fase  = document.getElementById('jogo-fase')?.value || 'Fase de grupos';
  const unif  = unifSel === 1 ? 'Uniforme 1 (branco)' : 'Uniforme 2 (azul)';
  const conv  = Object.keys(jogoConvSel);
  const obs   = document.getElementById('jogo-obs')?.value?.trim() || '';

  // Salva no array
  const novoJogo = {
    id: 'j'+Date.now(),
    adv, data, hora, local, cat, camp, fase, unif, conv, obs,
    status: 'agendado'
  };
  JOGOS_AGENDADOS.unshift(novoJogo);

  // Ordena por data
  JOGOS_AGENDADOS.sort((a,b)=>a.data.localeCompare(b.data));
  salvarLS();
  fecharModal('modal-jogo');
  showN('✓ Jogo vs '+adv+' agendado! '+conv.length+' atletas convocados e notificados.');

  // Atualiza a tela de jogos se estiver visível
  atualizarListaJogos();

  // Injeta no feed do atleta
  const [ano,mes,dia] = data.split('-');
  const meses=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const dataFmt = dia+'/'+meses[parseInt(mes)-1];
  injetarFeed('#8b1a1a','⚽ JOGO AGENDADO',
    'Você foi convocado para o jogo vs <strong>'+adv+'</strong> em '+dataFmt+' às '+hora.replace(':','h')+'. '+
    (obs ? '<br>📋 '+obs : ''),
    'agora · convocação oficial');

  // Limpa o formulário
  if(document.getElementById('jogo-adv')) document.getElementById('jogo-adv').value='';
  if(document.getElementById('jogo-data')) document.getElementById('jogo-data').value='';
  if(document.getElementById('jogo-obs')) document.getElementById('jogo-obs').value='';
}

function atualizarListaJogos(){
  const el = document.getElementById('lista-jogos-agendados');
  if(!el) return;
  el.innerHTML = renderListaJogosAgendados();
}

function renderListaJogosAgendados(){
  if(JOGOS_AGENDADOS.length === 0){
    return `<div style="text-align:center;padding:20px;color:var(--text-3);font-size:12px">Nenhum jogo agendado ainda.<br>Clique em "+ Agendar" para adicionar.</div>`;
  }
  return JOGOS_AGENDADOS.map(j=>{
    // Formata data para exibição
    const [ano,mes,dia] = j.data.split('-');
    const meses=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const dataFmt = dia+' '+meses[parseInt(mes)-1];
    const horaFmt = j.hora.replace(':','h');
    return `<div class="card" id="jogo-card-${j.id}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text-3)">${j.cat} · ${dataFmt} · ${horaFmt}</div>
          <div style="font-size:10px;color:var(--text-3);font-weight:500">📍 ${j.local} · ${j.camp} · ${j.fase}</div>
        </div>
        <span class="tag tb">agendado</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0">
        <span style="font-size:13px;font-weight:700;flex:1;color:var(--text)">Votoraty</span>
        <span style="font-size:13px;color:var(--text-3);font-weight:600">vs</span>
        <span style="font-size:13px;font-weight:700;flex:1;text-align:right;color:var(--text)">${j.adv}</span>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <span style="font-size:10px;font-weight:600;color:var(--text-3)">👕 ${j.unif}</span>
        <span style="font-size:10px;font-weight:600;color:var(--text-3)">·</span>
        <span style="font-size:10px;font-weight:600;color:var(--text-3)">👥 ${j.conv.length} convocados</span>
      </div>
      ${j.obs?`<div style="background:var(--surface);border-radius:7px;padding:7px 10px;font-size:10px;color:var(--text-2);margin-bottom:8px">📋 ${j.obs}</div>`:''}
      <div style="display:flex;gap:6px">
        <button onclick="iniciarJogoAoVivo('${j.id}')" style="flex:1;background:var(--color);color:#fff;border:none;padding:8px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer">🔴 Iniciar ao vivo</button>
        <button onclick="cancelarJogo('${j.id}')" style="background:var(--surface);border:1px solid var(--border);color:var(--text-3);padding:8px 10px;border-radius:8px;font-size:10px;font-weight:600;cursor:pointer">✕</button>
      </div>
    </div>`;
  }).join('');
}

function cancelarJogo(id){
  const idx = JOGOS_AGENDADOS.findIndex(j=>j.id===id);
  if(idx>=0){
    const adv = JOGOS_AGENDADOS[idx].adv;
    JOGOS_AGENDADOS.splice(idx,1);
    salvarLS();
    atualizarListaJogos();
    showN('Jogo vs '+adv+' removido.');
  }
}

function iniciarJogoAoVivo(id){
  const jogo = JOGOS_AGENDADOS.find(j=>j.id===id);
  if(!jogo) return;
  showN('🔴 Jogo vs '+jogo.adv+' iniciado ao vivo!');
  // Scroll para o placar ao vivo
  const placar = document.querySelector('[id="placar-v"]');
  if(placar) placar.closest('.card')?.scrollIntoView({behavior:'smooth'});
}

function fecharModal(id){
  document.getElementById(id).classList.remove('on');
  // Só restaura scroll se não houver outro modal aberto
  if(!document.querySelector('.modal-overlay.on')){
    document.body.style.overflow='';
    const sc = document.getElementById('screens');
    if(sc) sc.style.overflow='';
  }
}
document.querySelectorAll('.modal-overlay').forEach(m=>{
  m.addEventListener('click',e=>{
    if(e.target===m){
      m.classList.remove('on');
      if(!document.querySelector('.modal-overlay.on')){
        document.body.style.overflow='';
        const sc = document.getElementById('screens');
        if(sc) sc.style.overflow='';
      }
    }
  });
});

// =====================
// CRUD — SÓCIOS
// =====================
function abrirEditarSocio(id){
  const s = id ? SOCIOS.find(x=>x.id===id) : null;
  document.getElementById('med-socio-titulo').textContent = s ? 'Editar Sócio' : 'Novo Sócio';
  document.getElementById('med-socio-id').value = s ? s.id : '';
  document.getElementById('med-socio-nome').value = s ? s.nome : '';
  document.getElementById('med-socio-plano').value = s ? s.plano : 'Sócio Torcedor';
  document.getElementById('med-socio-valor').value = s ? s.valor : '';
  document.getElementById('med-socio-venc').value = s ? s.venc : '';
  document.getElementById('med-socio-status').value = s ? s.status : 'pago';
  abrirModal('modal-editar-socio');
}

function salvarSocio(id){
  const nome = document.getElementById('med-socio-nome').value.trim();
  if(!nome){showN('⚠️ Informe o nome do sócio.',true);return;}
  const dados = {
    nome,
    plano: document.getElementById('med-socio-plano').value,
    valor: parseFloat(document.getElementById('med-socio-valor').value)||0,
    venc: document.getElementById('med-socio-venc').value,
    status: document.getElementById('med-socio-status').value,
  };
  if(id){
    const idx = SOCIOS.findIndex(x=>x.id===id);
    if(idx>=0) Object.assign(SOCIOS[idx], dados);
    showN('✓ Sócio atualizado!');
  } else {
    dados.id = 's'+Date.now();
    SOCIOS.push(dados);
    showN('✓ Novo sócio cadastrado!');
  }
  salvarLS();
  fecharModal('modal-editar-socio');
  montarFinanceiro('#b8860b');
}

function deletarSocio(id){
  if(!confirm('Excluir este sócio?')) return;
  const idx = SOCIOS.findIndex(x=>x.id===id);
  if(idx>=0) SOCIOS.splice(idx,1);
  salvarLS();
  showN('Sócio removido.');
  montarFinanceiro('#b8860b');
}

// =====================
// CRUD — ATLETAS
// =====================
function abrirEditarAtleta(sig, catKey){
  const cat = CATS_DATA[catKey];
  const a = sig ? cat?.atletas.find(x=>x.sig===sig) : null;
  document.getElementById('med-atleta-titulo').textContent = a ? 'Editar Atleta' : 'Novo Atleta';
  document.getElementById('med-atleta-oldsig').value = a ? sig : '';
  document.getElementById('med-atleta-oldcat').value = catKey||'';
  document.getElementById('med-atleta-nome').value = a ? a.nome : '';
  document.getElementById('med-atleta-sig').value = a ? a.sig : '';
  document.getElementById('med-atleta-pos').value = a ? a.pos : 'Meia';
  document.getElementById('med-atleta-pres').value = a ? a.pres : '';
  document.getElementById('med-atleta-gols').value = a ? a.gols : '0';
  document.getElementById('med-atleta-nivel').value = a ? a.nivel : '5';
  document.getElementById('med-atleta-cat').value = catKey||'sub13';
  abrirModal('modal-editar-atleta');
}

function salvarAtleta(oldSig, oldCatKey){
  const nome = document.getElementById('med-atleta-nome').value.trim();
  if(!nome){showN('⚠️ Informe o nome.',true);return;}
  const sig = document.getElementById('med-atleta-sig').value.trim().toUpperCase().slice(0,2);
  if(!sig){showN('⚠️ Informe a sigla.',true);return;}
  const newCatKey = document.getElementById('med-atleta-cat').value;
  const dados = {
    sig,
    nome,
    pos: document.getElementById('med-atleta-pos').value,
    pres: parseInt(document.getElementById('med-atleta-pres').value)||85,
    gols: parseInt(document.getElementById('med-atleta-gols').value)||0,
    nivel: parseInt(document.getElementById('med-atleta-nivel').value)||5,
  };
  if(oldSig && oldCatKey){
    // Remove da categoria antiga
    const oldCat = CATS_DATA[oldCatKey];
    if(oldCat){
      const idx = oldCat.atletas.findIndex(x=>x.sig===oldSig);
      if(idx>=0){
        if(oldCatKey === newCatKey){
          Object.assign(oldCat.atletas[idx], dados);
        } else {
          oldCat.atletas.splice(idx,1);
          CATS_DATA[newCatKey].atletas.push(dados);
        }
      }
    }
    showN('✓ Atleta atualizado!');
  } else {
    CATS_DATA[newCatKey].atletas.push(dados);
    showN('✓ Atleta cadastrado!');
  }
  fecharModal('modal-editar-atleta');
  // Re-render current screen
  const cor = CORES[perfilAtual?.replace('prof_','')||'sub13']||'#0d3d1a';
  if(perfilAtual==='diretor') montarDiretor(CORES.diretor);
  else if(perfilAtual && perfilAtual.startsWith('prof_')){
    const catKey = perfilAtual.replace('prof_','');
    montarProfessor(catKey, CATS_DATA[catKey], CORES[catKey]);
  }
}

function deletarAtleta(sig, catKey){
  if(!sig||!catKey){fecharModal('modal-editar-atleta');return;}
  if(!confirm('Excluir este atleta?')) return;
  const cat = CATS_DATA[catKey];
  if(cat){
    const idx = cat.atletas.findIndex(x=>x.sig===sig);
    if(idx>=0) cat.atletas.splice(idx,1);
  }
  fecharModal('modal-editar-atleta');
  showN('Atleta removido.');
  if(perfilAtual==='diretor') montarDiretor(CORES.diretor);
  else if(perfilAtual && perfilAtual.startsWith('prof_')){
    const ck = perfilAtual.replace('prof_','');
    montarProfessor(ck, CATS_DATA[ck], CORES[ck]);
  }
}

// =====================
// CRUD — DESPESAS
// =====================
function abrirEditarDespesa(idx){
  const d = idx>=0 ? DESPESAS_CLUBE[idx] : null;
  document.getElementById('med-despesa-titulo').textContent = d ? 'Editar Despesa' : 'Nova Despesa';
  document.getElementById('med-despesa-idx').value = d ? idx : -1;
  document.getElementById('med-despesa-desc').value = d ? d.descricao : '';
  document.getElementById('med-despesa-valor').value = d ? d.valor : '';
  abrirModal('modal-editar-despesa');
}

function salvarDespesa(idx){
  const desc = document.getElementById('med-despesa-desc').value.trim();
  if(!desc){showN('⚠️ Informe a descrição.',true);return;}
  const valor = parseFloat(document.getElementById('med-despesa-valor').value)||0;
  if(idx>=0 && idx<DESPESAS_CLUBE.length){
    DESPESAS_CLUBE[idx] = {descricao:desc,valor};
    showN('✓ Despesa atualizada!');
  } else {
    DESPESAS_CLUBE.push({descricao:desc,valor});
    showN('✓ Despesa adicionada!');
  }
  salvarLS();
  fecharModal('modal-editar-despesa');
  montarFinanceiro('#b8860b');
}

function deletarDespesa(idx){
  if(!confirm('Excluir esta despesa?')) return;
  DESPESAS_CLUBE.splice(idx,1);
  salvarLS();
  showN('Despesa removida.');
  montarFinanceiro('#b8860b');
}

// =====================
// CRUD — MENSALIDADES
// =====================
function abrirEditarMensalidade(chave, nomeAtleta){
  const m = MENSALIDADES_ATLETAS[chave]||{valor:180,venc:'05/06',status:'pago'};
  document.getElementById('med-mens-chave').value = chave;
  document.getElementById('med-mens-info').textContent = nomeAtleta||chave;
  document.getElementById('med-mens-valor').value = m.valor;
  document.getElementById('med-mens-venc').value = m.venc;
  document.getElementById('med-mens-status').value = m.status;
  abrirModal('modal-editar-mensalidade');
}

function salvarMensalidade(chave){
  if(!chave){showN('⚠️ Erro: chave inválida.',true);return;}
  MENSALIDADES_ATLETAS[chave] = {
    valor: parseFloat(document.getElementById('med-mens-valor').value)||0,
    venc: document.getElementById('med-mens-venc').value,
    status: document.getElementById('med-mens-status').value,
  };
  salvarLS();
  fecharModal('modal-editar-mensalidade');
  showN('✓ Mensalidade atualizada!');
  montarFinanceiro('#b8860b');
}

// =====================
// CRUD — EVENTOS
// =====================
function abrirEditarEvento(idx){
  const e = idx>=0 ? EVENTOS[idx] : null;
  document.getElementById('med-evento-titulo').textContent = e ? 'Editar Evento' : 'Novo Evento';
  document.getElementById('med-evento-idx').value = idx;
  document.getElementById('med-evento-tipo').value = e ? e.tipo : 'treino';
  document.getElementById('med-evento-data').value = e ? e.data : '';
  document.getElementById('med-evento-hora').value = e ? e.hora : '08h';
  document.getElementById('med-evento-label').value = e ? e.label : '';
  document.getElementById('med-evento-cat').value = e ? e.cat : 'Sub-13';
  abrirModal('modal-evento');
}

function salvarEvento(idx){
  const label = document.getElementById('med-evento-label').value.trim();
  if(!label){showN('⚠️ Informe a descrição.',true);return;}
  const data = document.getElementById('med-evento-data').value;
  if(!data){showN('⚠️ Informe a data.',true);return;}
  const dados = {
    tipo: document.getElementById('med-evento-tipo').value,
    data,
    hora: document.getElementById('med-evento-hora').value||'08h',
    label,
    cat: document.getElementById('med-evento-cat').value,
  };
  if(idx>=0 && idx<EVENTOS.length){
    EVENTOS[idx] = dados;
    showN('✓ Evento atualizado!');
  } else {
    EVENTOS.push(dados);
    showN('✓ Evento adicionado!');
  }
  fecharModal('modal-evento');
  // Re-render calendário se visível
  const s5 = document.getElementById('s-5');
  if(s5 && s5.classList.contains('on')){
    const cor = getComputedStyle(document.documentElement).getPropertyValue('--color').trim()||'#0d3d1a';
    s5.innerHTML = renderCalendario(cor);
  }
}

function deletarEvento(idx){
  if(!confirm('Excluir este evento?')) return;
  EVENTOS.splice(idx,1);
  showN('Evento removido.');
  const s5 = document.getElementById('s-5');
  if(s5){
    const cor = getComputedStyle(document.documentElement).getPropertyValue('--color').trim()||'#0d3d1a';
    s5.innerHTML = renderCalendario(cor);
  }
}

// =====================
// CRUD — PERFIL ATLETA
// =====================
function abrirEditarPerfil(){
  document.getElementById('med-perfil-nome').value = ATLETA_DEFAULT.nome;
  document.getElementById('med-perfil-pos').value = ATLETA_DEFAULT.pos;
  document.getElementById('med-perfil-nivel').value = ATLETA_DEFAULT.nivel;
  document.getElementById('med-perfil-cat').value = ATLETA_DEFAULT.cat;
  abrirModal('modal-editar-perfil');
}

function salvarPerfil(){
  const nome = document.getElementById('med-perfil-nome').value.trim();
  if(!nome){showN('⚠️ Informe o nome.',true);return;}
  ATLETA_DEFAULT.nome = nome;
  ATLETA_DEFAULT.pos = document.getElementById('med-perfil-pos').value;
  ATLETA_DEFAULT.nivel = parseInt(document.getElementById('med-perfil-nivel').value)||ATLETA_DEFAULT.nivel;
  ATLETA_DEFAULT.cat = document.getElementById('med-perfil-cat').value;
  fecharModal('modal-editar-perfil');
  showN('✓ Perfil atualizado!');
  // Update header
  const cor = getComputedStyle(document.documentElement).getPropertyValue('--color').trim()||'#0d3d1a';
  document.getElementById('hdr-title').textContent = ATLETA_DEFAULT.nome;
  document.getElementById('hdr-sub').textContent = ATLETA_DEFAULT.pos+' · '+ATLETA_DEFAULT.cat+' · Nível '+ATLETA_DEFAULT.nivel;
  // Re-render evolução if visible
  const s1 = document.getElementById('s-1');
  if(s1 && s1.classList.contains('on')) s1.innerHTML = renderEvolucao(cor);
}

// === SERVICE WORKER REGISTRATION ===
// Service Worker — PWA offline
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js')
      .then(()=>console.log('SW registrado'))
      .catch(e=>console.log('SW erro:', e));
  });
}

// === NAVEGAÇÃO / MODAIS / INIT ===
// =====================
// CORREÇÃO: Professor acessa TODOS os subs
// A diferença entre Professor e Diretor agora é só:
// Diretor: vê financeiro, configurações, gestão de professores
// Professor: vê todos os atletas de todas as categorias, mas não vê financeiro/config
// =====================

// Sobrescreve a tela inicial para refletir a nova lógica
// Sobrescreve entrar() para tratar 'professor' como acesso a todos os subs
const _origEntrar = entrar;
entrar = function(perfil){
  if(perfil === 'professor'){
    montarProfessorTodos('#166024');
    return;
  }
  _origEntrar(perfil);
};

function montarProfessorTodos(cor){
  perfilAtual = 'professor';
  document.getElementById('tela-inicial').style.display='none';
  document.getElementById('app').style.display='flex';
  setCor(cor);

  document.getElementById('hdr-title').textContent = 'Área do Professor';
  document.getElementById('hdr-sub').textContent = 'Todos os subs · Votoraty Academy';
  document.getElementById('cat-pill').textContent = '🏫 Sub-7 ao Sub-15';
  document.getElementById('sbar-mid').textContent = 'Professor · Votoraty';
  document.getElementById('offline-dot').style.display='none';

  // Nav com abas por categoria + geral
  const navItems = ['Geral','Sub-7','Sub-9','Sub-11','Sub-13','Sub-15','Mensagem','Jogos','Convocações'];
  const bnavItems = [
    {icon:'ti-layout-dashboard',label:'Geral'},
    {icon:'ti-users',label:'Atletas'},
    {icon:'ti-ball-football',label:'Treino'},
    {icon:'ti-message',label:'Mensagem'},
    {icon:'ti-trophy',label:'Jogos'},
    {icon:'ti-flag',label:'Convocar'}
  ];
  montarNav(navItems, cor);
  montarBnav(bnavItems, cor);

  const sc = document.getElementById('screens');
  sc.innerHTML = `
    <div id="s-0" class="scr on" style="padding:11px 13px;overflow-y:auto">${renderProfGeral(cor)}</div>
    <div id="s-1" class="scr" style="padding:11px 13px;overflow-y:auto">${renderProfCat('sub7',cor)}</div>
    <div id="s-2" class="scr" style="padding:11px 13px;overflow-y:auto">${renderProfCat('sub9',cor)}</div>
    <div id="s-3" class="scr" style="padding:11px 13px;overflow-y:auto">${renderProfCat('sub11',cor)}</div>
    <div id="s-4" class="scr" style="padding:11px 13px;overflow-y:auto">${renderProfCat('sub13',cor)}</div>
    <div id="s-5" class="scr" style="padding:11px 13px;overflow-y:auto">${renderProfCat('sub15',cor)}</div>
    <div id="s-6" class="scr" style="padding:11px 13px;overflow-y:auto">${renderMensagemTodos(cor)}</div>
    <div id="s-7" class="scr" style="padding:11px 13px;overflow-y:auto">${renderJogosProfessor(CATS_DATA['sub13'], cor)}</div>
    <div id="s-8" class="scr" style="padding:11px 13px;overflow-y:auto">${renderConvocacoesProfessor(cor)}</div>`;

  // Mapeia bnav para telas
  document.querySelectorAll('#bnav .bi').forEach((b,i)=>{
    const mapa=[0,1,2,6,7,8];
    b.onclick=function(){goTab(mapa[i]||i,cor);};
  });

  setCor(cor);
}

function renderConvocacoesProfessor(cor){
  const cats = Object.entries(CATS_DATA);
  const linhas = cats.map(([catKey, cat])=>{
    return cat.atletas.map(a=>{
      const ficKey = a.sig + catKey;
      const convocado = FICHAS[ficKey]?.convocado || false;
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f0">
        <div style="width:32px;height:32px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">${a.sig}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700">${a.nome}</div>
          <div style="font-size:10px;color:#aaa">${a.pos} · ${cat.nome}</div>
        </div>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;font-weight:600;color:${cor}">
          <input type="checkbox" id="conv-${ficKey}" ${convocado?'checked':''} onchange="toggleConvocado('${ficKey}',this.checked)" style="accent-color:${cor};width:16px;height:16px">
          Convocar
        </label>
      </div>`;
    }).join('');
  }).join('');
  return `<div style="font-size:13px;font-weight:700;margin-bottom:4px;color:#1a1a1a">Convocar atletas para o próximo jogo</div>
  <div style="font-size:10px;color:#aaa;margin-bottom:12px">Selecione os atletas convocados para o próximo jogo</div>
  ${linhas}
  <button onclick="salvarConvocacoesProfessor()" style="width:100%;margin-top:16px;padding:13px;border-radius:12px;border:none;background:${cor};color:#fff;font-size:13px;font-weight:700;cursor:pointer">Confirmar convocação</button>`;
}

function toggleConvocado(ficKey, val){
  if(!FICHAS[ficKey]) FICHAS[ficKey] = {};
  FICHAS[ficKey].convocado = val;
}

function salvarConvocacoesProfessor(){
  salvarLS();
  const total = Object.values(FICHAS).filter(f=>f.convocado).length;
  showN('✓ Convocação salva! '+total+' atleta(s) convocado(s).');
}

function renderProfGeral(cor){
  const cats = Object.entries(CATS_DATA);
  return `
  <div style="font-size:13px;font-weight:700;margin-bottom:12px;color:#1a1a1a">Visão geral — todos os subs</div>

  ${cats.map(([k,c])=>`
  <div style="border:1px solid #eee;border-radius:11px;overflow:hidden;margin-bottom:9px">
    <div style="display:flex;align-items:center;gap:10px;padding:11px 13px;background:${CORES[k]}12;border-bottom:1px solid #eee">
      <div style="width:36px;height:36px;border-radius:9px;background:${CORES[k]};display:flex;align-items:center;justify-content:center;font-size:18px">${c.emoji}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:#1a1a1a">${c.nome}</div>
        <div style="font-size:10px;color:#aaa">${c.atletas.length} atletas · ${c.atletas.reduce((s,a)=>s+a.gols,0)} gols · ${Math.round(c.atletas.reduce((s,a)=>s+a.pres,0)/c.atletas.length)}% presença</div>
      </div>
      <button onclick="goTab(${['sub7','sub9','sub11','sub13','sub15'].indexOf(k)+1},'${cor}')" style="background:${CORES[k]};color:#fff;border:none;padding:5px 12px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer">Acessar</button>
    </div>
    <div style="padding:8px 13px;display:flex;gap:8px;flex-wrap:wrap">
      ${c.atletas.map(a=>{
        const pc=a.pres>=85?'#27500a':a.pres>=70?'#854f0b':'#a32d2d';
        return `<div style="display:flex;align-items:center;gap:5px">
          <div style="width:24px;height:24px;border-radius:50%;background:${CORES[k]};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff">${a.sig}</div>
          <span style="font-size:10px;color:${pc}">${a.pres}%</span>
        </div>`;
      }).join('')}
    </div>
  </div>`).join('')}

  <div style="background:#fff8e6;border:1px solid #e8c97a;border-radius:10px;padding:10px 12px;margin-top:4px">
    <div style="font-size:11px;font-weight:500;color:#854f0b;margin-bottom:3px">⚠️ Alertas em todas as categorias</div>
    <div style="font-size:11px;color:#633806;line-height:1.7">
      Pedro Alves (Sub-13) — 4 faltas seguidas<br>
      Rafael Costa (Sub-13) — presença 65%<br>
      João Lima (Sub-11) — presença 76%
    </div>
  </div>`;
}

function renderProfCat(catKey, cor){
  const cat = CATS_DATA[catKey];
  const catCor = CORES[catKey];
  if(!cat) return '<div style="padding:20px;text-align:center;color:#aaa">Carregando...</div>';

  return `
  <!-- SELETOR DE AÇÃO -->
  <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap">
    <button onclick="mostrarPainel('${catKey}','chamada','${catCor}')" style="flex:1;background:${catCor};color:#fff;border:none;padding:8px 6px;border-radius:9px;font-size:10px;font-weight:700;cursor:pointer">📋 Chamada</button>
    <button onclick="mostrarPainel('${catKey}','avaliacao','${catCor}')" style="flex:1;background:${catCor}22;color:${catCor};border:none;padding:8px 6px;border-radius:9px;font-size:10px;font-weight:700;cursor:pointer">⭐ Avaliar</button>
    <button onclick="mostrarPainel('${catKey}','treino','${catCor}')" style="flex:1;background:${catCor}22;color:${catCor};border:none;padding:8px 6px;border-radius:9px;font-size:10px;font-weight:700;cursor:pointer">⚽ Treino</button>
    <button onclick="mostrarPainel('${catKey}','convocar','${catCor}')" style="flex:1;background:${catCor}22;color:${catCor};border:none;padding:8px 6px;border-radius:9px;font-size:10px;font-weight:700;cursor:pointer">🏆 Convocar</button>
  </div>

  <!-- PAINEL DINÂMICO -->
  <div id="painel-${catKey}">
    <!-- CHAMADA padrão -->
    <div class="lbl">Chamada — ${cat.nome} · hoje</div>
    <div style="background:#eee;border-radius:3px;height:4px;margin-bottom:8px"><div id="prog-${catKey}" style="height:4px;border-radius:3px;background:${catCor};width:0;transition:width .3s"></div></div>
    ${cat.atletas.map((a,i)=>{
      const pc=a.pres>=85?'#27500a':a.pres>=70?'#854f0b':'#a32d2d';
      return `<div class="cr-item">
        <div class="av" style="width:30px;height:30px;font-size:10px;background:${catCor}">${a.sig}</div>
        <div style="flex:1"><div style="font-size:12px;font-weight:700">${a.nome}</div>
        <div style="font-size:9px;color:#aaa">${a.pos} · <span style="color:${pc}">${a.pres}%</span> · ${a.gols} gols</div></div>
        <div style="display:flex;gap:4px">
          <button class="crb crb-p" onclick="marcC('${catKey}${i}','P',this,'${catCor}')" id="cp-${catKey}${i}">P</button>
          <button class="crb crb-f" onclick="marcC('${catKey}${i}','F',this,'${catCor}')" id="cf-${catKey}${i}">F</button>
        </div>
      </div>`;
    }).join('')}
    <button style="background:${catCor};color:#fff;border:none;padding:11px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;width:100%;margin-top:5px" onclick="showN('✓ Chamada ${cat.nome} salva! Pais notificados.')">Salvar chamada</button>
  </div>

  <!-- ARBITRAGEM - STATUS DE PAGAMENTO -->
  <div class="lbl" style="margin-top:12px">Arbitragem — Status de pagamento</div>
  <div class="cw" style="padding:10px 14px">
    ${(() => {
      const statusAtual = window.ARBITRAGEM_STATUS?.[catKey] || [];
      const nomesPorSig = {
        'AS':'André Silva','BL':'Bruno Lima','CM':'Carlos Magno','DT':'Diego Torres',
        'EF':'Eduardo Franco','FA':'Felipe Alves','GS':'Gustavo Silva','HC':'Hugo Costa',
        'LF':'Leonardo Ferreira','IN':'Igor Neves','JL':'João Lima','KP':'Kevin Pereira',
        'KT':'Kauan Telles','PA':'Pedro Alves','MT':'Marcos Teixeira','RC':'Ricardo Cruz','TN':'Thiago Neves',
        'MT':'Matheus Teixeira','NF':'Neymar Ferreira','OL':'Otávio Lima','PM':'Paulo Marques','QR':'Quentin Rocha'
      };

      if(statusAtual.length === 0) return '<div style="font-size:11px;color:var(--text-3);text-align:center;padding:10px">Nenhum jogo agendado esta semana</div>';

      const pagos = statusAtual.filter(a => a.pago).length;

      return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border)">
          <div style="font-size:11px;color:var(--text-3);font-weight:700">R$ 30 por atleta</div>
          <div style="font-size:12px;font-weight:800;color:${pagos===statusAtual.length?'#1a5c26':'#b8860b'}">${pagos}/${statusAtual.length} pagos</div>
        </div>
        ${statusAtual.map(a => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f0ede8">
            <div class="av" style="width:30px;height:30px;font-size:10px;background:${catCor}">${a.sig}</div>
            <div style="flex:1">
              <div style="font-size:11px;font-weight:700;color:var(--text)">${nomesPorSig[a.sig] || a.sig}</div>
              <div style="font-size:9px;color:var(--text-3)">${cat.nome} vs Flamengo · 15 Jun</div>
            </div>
            <span style="font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;${a.pago?'background:#dcf0e0;color:#1a5c26':'background:#fde8e8;color:#8b1a1a'}">${a.pago?'✓ Pago':'Pendente'}</span>
          </div>
        `).join('')}
      `;
    })()}
  </div>

  <!-- LISTA DE ATLETAS -->
  <div class="lbl" style="margin-top:12px">Atletas — ${cat.nome}</div>
  <div class="cw" style="padding:6px 14px">
    ${cat.atletas.map(a=>{
      const pc=a.pres>=85?'#1a5c26':a.pres>=70?'#7a4010':'#8b1a1a';
      const _fk=a.sig+catKey;
      const temFicha=typeof FICHAS!=='undefined'&&FICHAS[_fk]&&FICHAS[_fk].sangue;
      const fichaBg=temFicha?'#dcf0e0':'#fce8e8';
      const fichaC=temFicha?'#1a5c26':'#8b1a1a';
      return `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <div class="av" style="width:34px;height:34px;font-size:11px;background:${catCor}">${a.sig}</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700;color:var(--text)">${a.nome}</div>
            <div style="font-size:9px;color:var(--text-3);font-weight:500">${a.pos} · Nível ${a.nivel} · ${a.gols} gols</div>
            <div class="prog"><div class="prog-f" style="width:${a.pres}%;background:${pc}"></div></div>
          </div>
          <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;color:${pc};background:${pc}18">${a.pres}%</span>
        </div>
        <div style="display:flex;gap:5px;padding-left:44px">
          <button onclick="abrirHabilidades('${a.nome}','${a.sig}','${a.pos}','${cat.nome}','${catKey}','${catCor}')" style="flex:1;background:${catCor}18;color:${catCor};border:1px solid ${catCor}33;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">⭐ Hab</button>
          <button onclick="abrirFicha('${a.nome}','${a.sig}','${a.pos}','${cat.nome}','${catKey}','${catCor}')" style="flex:1;background:${fichaBg};color:${fichaC};border:none;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">🏥 Ficha</button>
          <button onclick="gerarRelatorio('${a.nome}','${a.sig}','${catKey}','${catCor}')" style="flex:1;background:#fdf3dc;color:#7a4010;border:none;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">📊 PDF</button>
          <button onclick="abrirMsgDireta('${a.nome}','${a.sig}','${a.pos}','${cat.nome}','${catCor}')" style="flex:1;background:${catCor};color:#fff;border:none;padding:5px 4px;border-radius:7px;font-size:9px;font-weight:700;cursor:pointer">✉️ Msg</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function mostrarPainel(catKey, tipo, cor){
  const paineis = {
    chamada: `Chamada marcada para ${CATS_DATA[catKey].nome}`,
    avaliacao: `Avaliação do ${CATS_DATA[catKey].nome} aberta`,
    treino: `Registrar treino do ${CATS_DATA[catKey].nome}`,
    convocar: `Convocação do ${CATS_DATA[catKey].nome} aberta`
  };
  showN('✓ '+paineis[tipo]);
}

function renderMensagemTodos(cor){
  return `
  <div style="font-size:13px;font-weight:700;margin-bottom:4px;color:#1a1a1a">Enviar mensagem</div>
  <div style="font-size:11px;color:#aaa;margin-bottom:12px">O professor pode mandar para qualquer categoria</div>

  <div class="lbl">Para qual categoria</div>
  <div class="chips" id="prof-dest">
    <span class="chip on" onclick="selDestProf(this)" style="background:#eaf3de;color:#27500a;border-color:#97c459;font-weight:700">Todos os subs</span>
    ${Object.entries(CATS_DATA).map(([k,c])=>`<span class="chip" onclick="selDestProf(this)" style="--cor:${CORES[k]}">${c.emoji} ${c.nome}</span>`).join('')}
  </div>

  <div class="lbl">Mensagens rápidas</div>
  <div class="chips">
    <span class="chip" onclick="setMsgQ('Ótimo treino hoje! Parabéns a todos. 👏')">Ótimo treino</span>
    <span class="chip" onclick="setMsgQ('Treino confirmado para amanhã. Não faltem!')">Confirmar treino</span>
    <span class="chip" onclick="setMsgQ('Jogo neste sábado. Chegue 30min antes.')">Lembrete jogo</span>
    <span class="chip" onclick="setMsgQ('Não esqueçam de estudar hoje! 📚')">Estudar hoje</span>
    <span class="chip" onclick="setMsgQ('Hidratem bem antes do treino! 💧')">Hidratação</span>
    <span class="chip" onclick="setMsgQ('Treino cancelado hoje. Reagendado em breve.')">Cancelar treino</span>
    <span class="chip" onclick="setMsgQ('Parabéns pelo esforço de todos no jogo! 🏆')">Parabéns</span>
  </div>

  <div class="field"><label>Tipo</label>
    <select><option>📢 Aviso geral</option><option>⚽ Treino</option><option>🏆 Jogo</option><option>📚 Estudos</option><option>💧 Saúde</option><option>⚠️ Urgente</option></select>
  </div>
  <div class="field"><label>Mensagem</label>
    <textarea id="msg-txt" placeholder="Escreva aqui..."></textarea>
  </div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <input type="checkbox" id="cc-pais" style="width:14px;height:14px" checked>
    <label for="cc-pais" style="font-size:11px;color:#555">Enviar também para os pais</label>
  </div>
  <button class="btn-g" style="background:${cor}" onclick="enviarMsg()">Enviar mensagem</button>

  <div class="lbl" style="margin-top:12px">Últimos enviados</div>
  <div class="card" style="padding:9px 11px">
    ${[['Todos os subs','Treino confirmado para sábado. Não faltem!','1h'],
       ['Sub-13','Jogo sábado 09h. Uniforme 1.','3h'],
       ['Sub-11','Ótimo treino hoje! Parabéns.','1d']
    ].map(([dest,msg,time])=>`
    <div style="padding:7px 0;border-bottom:1px solid #f0eeea">
      <div style="display:flex;justify-content:space-between;margin-bottom:2px">
        <span style="font-size:10px;font-weight:700;color:${cor}">${dest}</span>
        <span style="font-size:9px;color:#aaa">${time}</span>
      </div>
      <div style="font-size:11px;color:#333">${msg}</div>
    </div>`).join('')}
  </div>`;
}

function selDestProf(el){
  document.querySelectorAll('#prof-dest .chip').forEach(c=>{
    c.style.background=''; c.style.color=''; c.style.borderColor=''; c.style.fontWeight='';
    c.classList.remove('on');
  });
  el.classList.add('on');
  el.style.background='#eaf3de'; el.style.color='#27500a';
  el.style.borderColor='#97c459'; el.style.fontWeight='700';
}
