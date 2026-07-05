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
    mensalidades: MENSALIDADES_ATLETAS,
    socios: SOCIOS,
    cats: CATS_DATA,
    presenca_hist: window.PRESENCA_HIST || {},
    arbitragem: window.ARBITRAGEM_STATUS || {},
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
    if(d.socios){ d.socios.forEach(s=>{ const idx=SOCIOS.findIndex(x=>x.id===s.id); if(idx>=0) Object.assign(SOCIOS[idx],s); else SOCIOS.push(s); }); }
    if(d.presenca_hist)   window.PRESENCA_HIST = d.presenca_hist;
    if(d.arbitragem)      window.ARBITRAGEM_STATUS = d.arbitragem;
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

