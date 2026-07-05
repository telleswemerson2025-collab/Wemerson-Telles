// =====================
// UTILS.JS — Utilitários, navegação, CRUD, inicialização
// =====================

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
  // 'professor' redireciona para a visão unificada de todos os subs
  if(perfil === 'professor'){
    montarProfessorTodos('#166024');
    return;
  }
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
  salvarLS();
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
  salvarLS();
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

// =====================
// ESTADO DE NAVEGAÇÃO (abas)
// =====================
let _navHistory = [];
let _navCurrentIdx = 0;
let _navCor = '#0d3d1a';

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

// =====================
// NAVEGAÇÃO — montarNav / montarBnav
// =====================
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

// =====================
// MODAIS
// =====================
function abrirModal(id){
  document.getElementById(id).classList.add('on');
  document.body.style.overflow='hidden';
  const sc = document.getElementById('screens');
  if(sc) sc.style.overflow='hidden';
  // Se for modal de jogo, popula a lista de convocação
  if(id === 'modal-jogo') popularConvJogo();
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

// Fechar modal clicando fora
document.addEventListener('DOMContentLoaded', function(){
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
});

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
// Professor acessa TODOS os subs via montarProfessorTodos (integrado em entrar())

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
    <div id="s-8" class="scr" style="padding:11px 13px;overflow-y:auto">${renderConvocacoesTodos(cor)}</div>`;

  // Mapeia bnav para telas
  document.querySelectorAll('#bnav .bi').forEach((b,i)=>{
    const mapa=[0,1,2,6,7,8];
    b.onclick=function(){goTab(mapa[i]||i,cor);};
  });

  setCor(cor);
}

function renderConvocacoesTodos(cor){
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
          <input type="checkbox" id="conv-${ficKey}" ${convocado?'checked':''} onchange="toggleConvocadoTodos('${ficKey}',this.checked)" style="accent-color:${cor};width:16px;height:16px">
          Convocar
        </label>
      </div>`;
    }).join('');
  }).join('');
  return `<div style="font-size:13px;font-weight:700;margin-bottom:4px;color:#1a1a1a">Convocar atletas para o próximo jogo</div>
  <div style="font-size:10px;color:#aaa;margin-bottom:12px">Selecione os atletas convocados para o próximo jogo</div>
  ${linhas}
  <button onclick="salvarConvocacoesTodos()" style="width:100%;margin-top:16px;padding:13px;border-radius:12px;border:none;background:${cor};color:#fff;font-size:13px;font-weight:700;cursor:pointer">Confirmar convocação</button>`;
}

function toggleConvocadoTodos(ficKey, val){
  if(!FICHAS[ficKey]) FICHAS[ficKey] = {};
  FICHAS[ficKey].convocado = val;
}

function salvarConvocacoesTodos(){
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
