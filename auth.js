// =====================
// AUTH.JS — Firebase e autenticação
// =====================

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
  apiKey:            "AIzaSyBf-n2LxXfYGh3Mz989Liq2mSs5C4zYfwg",
  authDomain:        "votoratyautomaticsystem.firebaseapp.com",
  projectId:         "votoratyautomaticsystem",
  storageBucket:     "votoratyautomaticsystem.firebasestorage.app",
  messagingSenderId: "73851236449",
  appId:             "1:73851236449:web:54b28cfc6cc27a31fa7a20"
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
          let role = (snap && snap.exists) ? snap.data().role : undefined;
          if(!roleValido(role)){
            role = ROLES_CONHECIDOS[(user.email||'').toLowerCase()];
            if(role){ try { await _db.collection('usuarios').doc(user.uid).set({role, email:user.email}, {merge:true}); } catch(e){} }
          }
          if(!roleValido(role)){ console.warn('[Auth] sem role para', user.email); return; }
          await carregarFirestore();
          entrar(role);
        }
      });
    }
  } catch(e){ console.warn('[Firebase] Não inicializado:', e.message); }
})();

// Cria usuário no Firebase Auth + papel no Firestore SEM derrubar a sessão atual
// (usa uma instância secundária do Firebase para não trocar o login de quem cria)
async function criarUsuarioSistema(email, senha, role){
  if(!_db || !_auth){ showN('⚠️ Firebase não configurado. Faça login real (não Modo Demo) para criar usuários.', true); return false; }
  email = (email||'').trim().toLowerCase();
  if(!email || !senha || senha.length < 6){ showN('⚠️ Informe e-mail e senha (mín. 6 caracteres).', true); return false; }
  if(!roleValido(role)){ showN('⚠️ Função inválida.', true); return false; }
  try {
    // App secundário isolado — não derruba a sessão de quem está criando
    let app2;
    try { app2 = firebase.app('criador'); } catch(e){ app2 = firebase.initializeApp(FIREBASE_CONFIG, 'criador'); }
    // 1) Cria a conta de login
    const cred = await app2.auth().createUserWithEmailAndPassword(email, senha);
    const uid = cred.user.uid;
    // 2) Grava o papel no Firestore (com o app secundário, já autenticado como o novo usuário)
    await app2.firestore().collection('usuarios').doc(uid).set({ role, email, criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
    // 3) VERIFICA se o papel foi realmente salvo (se não, o login falharia depois)
    const check = await app2.firestore().collection('usuarios').doc(uid).get();
    await app2.auth().signOut();
    if(!check.exists){ showN('⚠️ Conta criada, mas o perfil não salvou. Tente de novo.', true); return false; }
    showN('✓ Usuário criado! Login: '+email+' · Função: '+role+'. Já pode entrar.');
    return true;
  } catch(e){
    const msg = e.code === 'auth/email-already-in-use' ? 'Este e-mail JÁ está cadastrado. Use outro ou faça login com ele.'
              : e.code === 'auth/invalid-email' ? 'E-mail inválido (verifique se não tem espaços).'
              : e.code === 'auth/weak-password' ? 'Senha fraca — use 6+ caracteres.'
              : e.code === 'auth/operation-not-allowed' ? 'Ative E-mail/Senha no Firebase (Authentication).'
              : e.code === 'permission-denied' ? 'Sem permissão no Firestore. Verifique as regras (modo teste).'
              : 'Erro: ' + (e.code || e.message);
    showN('⚠️ ' + msg, true);
    return false;
  }
}

function criarUsuarioPeloForm(){
  const email = (document.getElementById('nu-email')||{}).value || '';
  const senha = (document.getElementById('nu-senha')||{}).value || '';
  const role  = (document.getElementById('nu-role')||{}).value || '';
  criarUsuarioSistema(email, senha, role).then(ok => {
    if(ok){
      document.getElementById('nu-email').value = '';
      document.getElementById('nu-senha').value = '';
    }
  });
}

// E-mails conhecidos → papel (usado para auto-corrigir documentos sem 'role')
const ROLES_CONHECIDOS = {
  'diretor@votoraty.com': 'diretor',
  'professor@votoraty.com': 'prof_sub13',
  'financeiro@votoraty.com': 'financeiro',
  'kauan@votoraty.com': 'atleta'
};

function roleValido(role){
  if(!role) return false;
  const validos = ['diretor','financeiro','atleta','professor'].concat(Object.keys(CATS_DATA).map(k=>'prof_'+k));
  return validos.includes(role);
}

async function loginFirebase(){
  const email = ((document.getElementById('fb-email')||{}).value||'').trim().toLowerCase();
  const pass  = (document.getElementById('fb-pass')||{}).value||'';
  if(!_auth){ mostrarErroLogin('Firebase não configurado. Use o Modo Demo abaixo.'); return; }
  if(!email||!pass){ mostrarErroLogin('Preencha email e senha.'); return; }
  setLoginLoading(true);
  try {
    const cred = await _auth.signInWithEmailAndPassword(email, pass);
    const snap = await _db.collection('usuarios').doc(cred.user.uid).get();
    let role = snap.exists ? snap.data().role : undefined;
    // Auto-correção: se o papel está faltando/errado, usa o mapa de e-mails conhecidos e conserta o documento
    if(!roleValido(role)){
      const inferido = ROLES_CONHECIDOS[email];
      if(inferido){
        role = inferido;
        try { await _db.collection('usuarios').doc(cred.user.uid).set({role, email}, {merge:true}); } catch(e){}
      } else {
        mostrarErroLogin('Perfil não configurado para este e-mail. Peça ao diretor para criar o acesso.');
        await _auth.signOut(); return;
      }
    }
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
    mensalidades: MENSALIDADES_ATLETAS,
    socios: SOCIOS,
    cats: CATS_DATA,
    despesas: DESPESAS_CLUBE,
    eventos: (typeof EVENTOS !== 'undefined') ? EVENTOS : [],
    perfil_atleta: ATLETA_DEFAULT,
    conv_pub: convocacoes_publicadas,
    presenca_hist: window.PRESENCA_HIST || {},
    arbitragem: window.ARBITRAGEM_STATUS || {},
    treinos: window.TREINOS_REG || [],
    mensagens: window.MENSAGENS_ENVIADAS || [],
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
    if(d.mensalidades)    Object.assign(MENSALIDADES_ATLETAS, d.mensalidades);
    if(d.cats){ Object.keys(d.cats).forEach(k=>{ if(CATS_DATA[k]) CATS_DATA[k].atletas = d.cats[k].atletas; else CATS_DATA[k] = d.cats[k]; }); }
    if(d.socios){ SOCIOS.length=0; d.socios.forEach(s=>SOCIOS.push(s)); }
    if(d.despesas){ DESPESAS_CLUBE.length=0; d.despesas.forEach(x=>DESPESAS_CLUBE.push(x)); }
    if(d.eventos && typeof EVENTOS !== 'undefined'){ EVENTOS.length=0; d.eventos.forEach(x=>EVENTOS.push(x)); }
    if(d.perfil_atleta) Object.assign(ATLETA_DEFAULT, d.perfil_atleta);
    if(d.conv_pub){ convocacoes_publicadas.length=0; d.conv_pub.forEach(c=>convocacoes_publicadas.push(c)); }
    if(d.presenca_hist)   window.PRESENCA_HIST = d.presenca_hist;
    if(d.arbitragem)      window.ARBITRAGEM_STATUS = d.arbitragem;
    if(d.treinos)         window.TREINOS_REG = d.treinos;
    if(d.mensagens)       window.MENSAGENS_ENVIADAS = d.mensagens;
    if(typeof sanearMensalidades === 'function') sanearMensalidades(); // remove chaves-fantasma vindas da nuvem
    return true;
  } catch(e){ return false; }
}

// ===== FIREBASE CLOUD MESSAGING (push com app fechado) =====
// Cole aqui a chave "Par de chaves da Web Push" (VAPID) do Firebase Console:
// Config. do projeto → Cloud Messaging → Configuração da Web → Certificados push da Web
const FCM_VAPID_KEY = "COLE_A_CHAVE_VAPID_AQUI";
let _messaging = null;

async function initFCM(role, email){
  try {
    if(!FCM_VAPID_KEY || FCM_VAPID_KEY.startsWith('COLE_')) return; // ainda não configurado
    if(!('serviceWorker' in navigator) || !firebase.messaging) return;
    if(!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if(perm !== 'granted') return;
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    if(!_messaging) _messaging = firebase.messaging();
    const token = await _messaging.getToken({ vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: swReg });
    if(!token) return;
    // Salva o token no Firestore para o servidor poder enviar push a este aparelho
    if(_db){
      await _db.collection('fcm_tokens').doc(token).set({
        token, role: role||'', email: email||'', atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge:true });
    }
    // Notificação recebida com o app ABERTO (primeiro plano)
    _messaging.onMessage(payload => {
      const n = payload.notification || {};
      if(typeof notificarSistema === 'function') notificarSistema(n.title || '🔔 Votoraty Academy', n.body || '');
      if(typeof showN === 'function' && n.body) showN('🔔 '+n.body);
    });
    console.log('[FCM] push ativado');
  } catch(e){ console.warn('[FCM] não ativado:', e.message); }
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
    // Convocações publicadas pelo professor chegam aqui em tempo real
    if(d.conv_pub){ convocacoes_publicadas.length=0; d.conv_pub.forEach(c=>convocacoes_publicadas.push(c)); }
    if(d.mensalidades) Object.assign(MENSALIDADES_ATLETAS, d.mensalidades);
    if(d.treinos)   window.TREINOS_REG = d.treinos;
    if(d.mensagens) window.MENSAGENS_ENVIADAS = d.mensagens;
    // Dispara sino/som/notificação se surgiu algo novo (ex.: nova convocação)
    if(typeof atualizarBadgeSino === 'function') atualizarBadgeSino();
  });
}

