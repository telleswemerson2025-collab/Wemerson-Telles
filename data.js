// =====================
// DATA.JS — Dados e constantes do app Votoraty
// =====================

// =====================
// DADOS
// =====================
const CORES = {diretor:'#3c3489',sub7:'#c45e10',sub9:'#0f8c6e',sub11:'#0d3d1a',sub13:'#0e3d6e',sub15:'#8a6200',atleta:'#0d3d1a',professor:'#0d3d1a',financeiro:'#b8860b'};
const CATS_DATA = {
  sub7:  {nome:'Sub-7',  emoji:'🌱', atletas:[
    {sig:'AS',nome:'Arthur Santos',pos:'Meia',pres:90,gols:3,nivel:3},
    {sig:'BL',nome:'Bruno Lima',pos:'Atacante',pres:85,gols:5,nivel:4},
    {sig:'CM',nome:'Carlos Mendes',pos:'Goleiro',pres:95,gols:0,nivel:4},
    {sig:'DT',nome:'Diego Torres',pos:'Lateral',pres:88,gols:1,nivel:3}]},
  sub9:  {nome:'Sub-9',  emoji:'🌿', atletas:[
    {sig:'EF',nome:'Eduardo Ferreira',pos:'Meia',pres:92,gols:5,nivel:5},
    {sig:'FA',nome:'Felipe Alves',pos:'Atacante',pres:78,gols:7,nivel:5},
    {sig:'KT',nome:'Gustavo Silva',pos:'Zagueiro',pres:96,gols:1,nivel:6},
    {sig:'HC',nome:'Henrique Costa',pos:'Lateral',pres:83,gols:2,nivel:4}]},
  sub11: {nome:'Sub-11', emoji:'⚽', atletas:[
    {sig:'LF',nome:'Lucas Ferreira',pos:'Goleiro',pres:88,gols:0,nivel:5},
    {sig:'IN',nome:'Igor Nunes',pos:'Meia',pres:91,gols:4,nivel:6},
    {sig:'JL',nome:'João Lima',pos:'Atacante',pres:76,gols:6,nivel:5},
    {sig:'KP',nome:'Kaique Pereira',pos:'Zagueiro',pres:94,gols:1,nivel:6}]},
  sub13: {nome:'Sub-13', emoji:'🔵', atletas:[
    {sig:'KT',nome:'Kauan Telles',pos:'Meia',pres:94,gols:14,nivel:8},
    {sig:'PA',nome:'Pedro Alves',pos:'Atacante',pres:72,gols:7,nivel:6},
    {sig:'MT',nome:'Mateus Torres',pos:'Zagueiro',pres:91,gols:2,nivel:7},
    {sig:'RC',nome:'Rafael Costa',pos:'Lateral',pres:65,gols:3,nivel:5},
    {sig:'TN',nome:'Thiago Nunes',pos:'Meia',pres:85,gols:5,nivel:6}]},
  sub15: {nome:'Sub-15', emoji:'⭐', atletas:[
    {sig:'MT',nome:'Mateus Torres',pos:'Zagueiro',pres:91,gols:5,nivel:7},
    {sig:'NF',nome:'Nathan Ferreira',pos:'Atacante',pres:88,gols:9,nivel:7},
    {sig:'OL',nome:'Oliver Lima',pos:'Meia',pres:93,gols:7,nivel:8},
    {sig:'PM',nome:'Pablo Mendes',pos:'Goleiro',pres:96,gols:0,nivel:6},
    {sig:'QR',nome:'Quirino Ribeiro',pos:'Lateral',pres:80,gols:3,nivel:5}]}
};
const ATLETA_DEFAULT = {sig:'KT',nome:'Kauan Telles',pos:'Meia',cat:'Sub-13',nivel:8,xp:720,gols:14,treinos:38,pres:94,conquistas:7};

// =====================
// STATS DINÂMICOS
// =====================
const STATS = {
  treinos: 38,        // incrementa a cada chamada salva
  presencas: 36,      // presenças confirmadas
  faltas: 2,          // faltas
  gols: 14,           // lançado manualmente
  xp: 720,
};

// Conquistas — desbloqueadas por metas
const CONQUISTAS_DEF = [
  {id:'c1', icon:'⚽', titulo:'Primeiro Gol',     meta:'1 gol',        check:()=>STATS.gols>=1},
  {id:'c2', icon:'🎯', titulo:'Artilheiro',       meta:'10 gols',      check:()=>STATS.gols>=10},
  {id:'c3', icon:'🏆', titulo:'Hat-trick',        meta:'3 gols/jogo',  check:()=>STATS.gols>=3},
  {id:'c4', icon:'📅', titulo:'Presença Total',   meta:'10 treinos',   check:()=>STATS.treinos>=10},
  {id:'c5', icon:'🔥', titulo:'Dedicado',         meta:'30 treinos',   check:()=>STATS.treinos>=30},
  {id:'c6', icon:'⭐', titulo:'Elite',            meta:'50 treinos',   check:()=>STATS.treinos>=50},
  {id:'c7', icon:'💯', titulo:'100% Presença',    meta:'Sem faltas',   check:()=>STATS.faltas===0},
];

function getConquistas(){
  return CONQUISTAS_DEF.filter(c=>c.check());
}

function calcPres(){
  const total = STATS.treinos;
  if(total===0) return 0;
  return Math.round((STATS.presencas/total)*100);
}

function addTreino(presente){
  STATS.treinos++;
  if(presente) STATS.presencas++;
  else STATS.faltas++;
  STATS.xp += presente ? 20 : 0;
  atualizarStatsUI();
}

function addGolAtleta(qtd){
  STATS.gols += qtd;
  STATS.xp += qtd * 50;
  verificarConquistas();
  atualizarStatsUI();
}

function verificarConquistas(){
  const novas = getConquistas();
  const ant = parseInt(localStorage.getItem('vot_conq')||'0');
  if(novas.length > ant){
    const nova = novas[novas.length-1];
    showN('🏆 Conquista desbloqueada: '+nova.titulo+'!');
    localStorage.setItem('vot_conq', novas.length);
  }
}

function atualizarStatsUI(){
  salvarLS();
  // Atualiza stats na tela de evolução se visível
  const els = {
    'stat-gols': STATS.gols,
    'stat-treinos': STATS.treinos,
    'stat-pres': calcPres()+'%',
    'stat-conq': getConquistas().length,
    'stat-xp': STATS.xp,
  };
  Object.entries(els).forEach(([id,val])=>{
    const el = document.getElementById(id);
    if(el) el.textContent = val;
  });
  // Barra XP
  const xpBar = document.getElementById('xp-bar');
  if(xpBar) xpBar.style.width = Math.min((STATS.xp%1000)/10, 100)+'%';
}

// =====================
// FICHAS MÉDICAS
// =====================
const FICHAS = {};

// =====================
// PERSISTÊNCIA
// =====================
function salvarLS(){
  localStorage.setItem('vot_stats', JSON.stringify(STATS));
  localStorage.setItem('vot_habilidades', JSON.stringify(HABILIDADES));
  localStorage.setItem('vot_fichas', JSON.stringify(FICHAS));
  localStorage.setItem('vot_jogos_agendados', JSON.stringify(JOGOS_AGENDADOS));
  localStorage.setItem('vot_mensalidades', JSON.stringify(MENSALIDADES_ATLETAS));
  localStorage.setItem('vot_socios', JSON.stringify(SOCIOS));
  if(window.PRESENCA_HIST) localStorage.setItem('vot_presenca_hist', JSON.stringify(window.PRESENCA_HIST));
  if(window.ARBITRAGEM_STATUS) localStorage.setItem('vot_arbitragem', JSON.stringify(window.ARBITRAGEM_STATUS));
  salvarFirestore();
}

function carregarLS(){
  try {
    const st = localStorage.getItem('vot_stats');
    if(st){ const d=JSON.parse(st); Object.assign(STATS,d); }
    const hab = localStorage.getItem('vot_habilidades');
    if(hab){ Object.assign(HABILIDADES, JSON.parse(hab)); }
    const fic = localStorage.getItem('vot_fichas');
    if(fic){ Object.assign(FICHAS, JSON.parse(fic)); }
    const jog = localStorage.getItem('vot_jogos_agendados');
    if(jog){ JOGOS_AGENDADOS.length=0; JSON.parse(jog).forEach(j=>JOGOS_AGENDADOS.push(j)); }
    const mens = localStorage.getItem('vot_mensalidades');
    if(mens){ Object.assign(MENSALIDADES_ATLETAS, JSON.parse(mens)); }
    const soc = localStorage.getItem('vot_socios');
    if(soc){ const arr=JSON.parse(soc); arr.forEach(s=>{ const idx=SOCIOS.findIndex(x=>x.id===s.id); if(idx>=0) Object.assign(SOCIOS[idx],s); else SOCIOS.push(s); }); }
    const ph = localStorage.getItem('vot_presenca_hist');
    if(ph){ window.PRESENCA_HIST = JSON.parse(ph); }
    const arb = localStorage.getItem('vot_arbitragem');
    if(arb){ window.ARBITRAGEM_STATUS = JSON.parse(arb); }
  } catch(e){}
}

carregarLS();

// Mostra painel lateral no desktop ao carregar
window.addEventListener('DOMContentLoaded', function(){
  const dp = document.getElementById('desktop-panel');
  if(dp && window.innerWidth >= 900) dp.style.display='block';
});

let perfilAtual = null;
let _perfilAnterior = null;
let offline = false; // alias — usar offlineMode
let chamadas = {};

// Jogos — globais usados por professor.js e atleta.js
const JOGOS_AGENDADOS = [
  {id:'j001', adv:'União Sport', data:'2025-06-08', hora:'09:00', local:'Campo Estrela',     cat:'Sub-13', camp:'Camp. Municipal', fase:'Fase de grupos', unif:'Uniforme 1 (branco)', conv:['KT','PA','MT','RC','TN'], obs:'Chegue 30min antes.', status:'agendado'},
  {id:'j002', adv:'Grêmio Jr',   data:'2025-06-22', hora:'10:00', local:'Campo do Votoraty', cat:'Sub-13', camp:'Camp. Municipal', fase:'Quartas',         unif:'Uniforme 2 (azul)',  conv:['KT','PA','MT','RC','TN'], obs:'Uniforme azul obrigatório.', status:'agendado'},
];
const JOGOS_RESULTADOS = [
  {adv:'Atlético Jr', data:'18/05', gv:2, ga:1, resultado:'Vitória', cat:'Sub-13'},
  {adv:'Estrela FC',  data:'04/05', gv:3, ga:0, resultado:'Vitória', cat:'Sub-13'},
  {adv:'Rapid FC',    data:'20/04', gv:1, ga:2, resultado:'Derrota', cat:'Sub-13'},
];

// Presença e arbitragem — inicializados aqui, preenchidos pelo professor
if(!window.PRESENCA_HIST)      window.PRESENCA_HIST      = {};
if(!window.ARBITRAGEM_STATUS)  window.ARBITRAGEM_STATUS  = {
  sub7: [{sig:'AS',pago:true},{sig:'BL',pago:true},{sig:'DT',pago:false}],
  sub9: [{sig:'EF',pago:true},{sig:'FA',pago:false},{sig:'HC',pago:true}],
  sub11:[{sig:'LF',pago:true},{sig:'IN',pago:false},{sig:'JL',pago:true},{sig:'KP',pago:false}],
  sub13:[{sig:'KT',pago:true},{sig:'PA',pago:false},{sig:'MT',pago:true}],
  sub15:[{sig:'MT',pago:false},{sig:'NF',pago:true}],
};

// Habilidades por atleta (chave: sig+cat)
const HABILIDADES = {
  'ASsub7':  {fin:55,dri:60,vel:65,pas:58,mar:50,ati:80},
  'BLsub7':  {fin:72,dri:68,vel:70,pas:55,mar:48,ati:75},
  'CMsub7':  {fin:20,dri:30,vel:55,pas:45,mar:70,ati:85},
  'DTsub7':  {fin:40,dri:50,vel:72,pas:60,mar:65,ati:78},
  'EFsub9':  {fin:65,dri:70,vel:68,pas:72,mar:55,ati:88},
  'FAsub9':  {fin:80,dri:75,vel:82,pas:58,mar:42,ati:70},
  'GSsub9':  {fin:35,dri:42,vel:58,pas:55,mar:85,ati:90},
  'HCsub9':  {fin:45,dri:55,vel:78,pas:65,mar:68,ati:82},
  'LFsub11': {fin:25,dri:35,vel:60,pas:48,mar:72,ati:88},
  'INsub11': {fin:70,dri:72,vel:68,pas:80,mar:58,ati:85},
  'JLsub11': {fin:82,dri:70,vel:75,pas:55,mar:45,ati:72},
  'KPsub11': {fin:38,dri:45,vel:62,pas:58,mar:82,ati:90},
  'KTsub13': {fin:88,dri:81,vel:75,pas:62,mar:54,ati:95},
  'PAsub13': {fin:78,dri:65,vel:80,pas:55,mar:48,ati:68},
  'MTsub13': {fin:40,dri:48,vel:65,pas:60,mar:85,ati:88},
  'RCsub13': {fin:52,dri:58,vel:72,pas:68,mar:62,ati:75},
  'TNsub13': {fin:68,dri:72,vel:65,pas:78,mar:60,ati:85},
  'MTsub15': {fin:55,dri:52,vel:68,pas:65,mar:88,ati:90},
  'NFsub15': {fin:85,dri:72,vel:82,pas:60,mar:50,ati:80},
  'OLsub15': {fin:72,dri:78,vel:70,pas:85,mar:65,ati:92},
  'PMsub15': {fin:22,dri:32,vel:58,pas:50,mar:75,ati:88},
  'QRsub15': {fin:48,dri:55,vel:80,pas:70,mar:72,ati:82},
};

const HAB_LABELS = {fin:'Finalização',dri:'Drible',vel:'Velocidade',pas:'Passe',mar:'Marcação',ati:'Atitude'};
const HAB_ICONS  = {fin:'⚽',dri:'🎯',vel:'⚡',pas:'↗️',mar:'🛡️',ati:'💪'};

// =====================
// DADOS FINANCEIROS
// =====================
const SOCIOS = [
  {id:'s1',nome:'Marcos Vinícius Telles',plano:'Sócio Patrimonial',valor:120,status:'pago',   venc:'05/06'},
  {id:'s2',nome:'Helena Costa Ribeiro',  plano:'Sócio Torcedor',   valor:60, status:'pago',   venc:'05/06'},
  {id:'s3',nome:'Roberto Almeida Silva', plano:'Sócio Patrimonial',valor:120,status:'atraso', venc:'05/06'},
  {id:'s4',nome:'Cláudia Ferreira Nunes',plano:'Sócio Torcedor',   valor:60, status:'pago',   venc:'05/06'},
  {id:'s5',nome:'Paulo Sérgio Mendes',   plano:'Sócio Benemérito', valor:250,status:'atraso', venc:'05/06'},
  {id:'s6',nome:'Juliana Pacheco Rocha', plano:'Sócio Torcedor',   valor:60, status:'pendente',venc:'10/06'},
];

const MENSALIDADES_ATLETAS = {
  'ASsub7':{valor:150,status:'pago',    venc:'05/06'},
  'BLsub7':{valor:150,status:'pago',    venc:'05/06'},
  'CMsub7':{valor:150,status:'pendente',venc:'10/06'},
  'DTsub7':{valor:150,status:'pago',    venc:'05/06'},
  'EFsub9':{valor:150,status:'pago',    venc:'05/06'},
  'FAsub9':{valor:150,status:'atraso',  venc:'05/06'},
  'GSsub9':{valor:150,status:'pago',    venc:'05/06'},
  'HCsub9':{valor:150,status:'pago',    venc:'05/06'},
  'LFsub11':{valor:180,status:'pago',   venc:'05/06'},
  'INsub11':{valor:180,status:'atraso', venc:'05/06'},
  'JLsub11':{valor:180,status:'pago',   venc:'05/06'},
  'KPsub11':{valor:180,status:'pago',   venc:'05/06'},
  'KTsub13':{valor:180,status:'pago',   venc:'05/06'},
  'PAsub13':{valor:180,status:'atraso', venc:'05/06'},
  'MTsub13':{valor:180,status:'pago',   venc:'05/06'},
  'RCsub13':{valor:180,status:'atraso', venc:'05/06'},
  'TNsub13':{valor:180,status:'pago',   venc:'05/06'},
  'MTsub15':{valor:200,status:'pago',   venc:'05/06'},
  'NFsub15':{valor:200,status:'pago',   venc:'05/06'},
  'OLsub15':{valor:200,status:'pendente',venc:'10/06'},
  'PMsub15':{valor:200,status:'pago',   venc:'05/06'},
  'QRsub15':{valor:200,status:'pago',   venc:'05/06'},
};

const DESPESAS_CLUBE = [
  {descricao:'Aluguel campo',valor:1200},
  {descricao:'Material esportivo',valor:450},
  {descricao:'Arbitragem',valor:300},
  {descricao:'Manutenção',valor:180},
];

const HISTORICO_MESES           = ['Jan','Fev','Mar','Abr','Mai','Jun'];
const HISTORICO_RECEITA_SOCIOS  = [580,610,590,640,600,620];
const HISTORICO_RECEITA_ATLETAS = [3150,3200,3100,3260,3180,3200];
const HISTORICO_DESPESAS        = [2400,2980,2510,3100,2700,3170];
const HISTORICO_INADIMPLENCIA   = [880,1040,760,1200,990,1060];
const CHART_INSTANCES = {};

// =====================
// CONVOCAÇÕES PUBLICADAS (mural público)
// =====================
// =====================
// MURAL DE CONVOCAÇÃO PÚBLICA
// Visible para todos os atletas no Feed
// =====================

// Dados de convocações publicadas (simula o banco de dados)
const convocacoes_publicadas = [
  {
    id: 'conv_001',
    jogo: 'Votoraty Academy vs Rapid FC',
    data: 'Sábado, 25 de maio de 2025',
    hora: '09h00',
    local: 'Campo do Votoraty',
    campeonato: 'Camp. Municipal Sub-13',
    fase: 'Fase de grupos',
    categoria: 'Sub-13',
    cor: '#185fa5',
    tecnico: 'Técnico André',
    observacao: 'Chegue 30 minutos antes. Uniforme 1 (branco). Tragam a chuteira de campo.',
    convocados: [
      {sig:'KT', nome:'Kauan Telles',    pos:'Meia'},
      {sig:'PA', nome:'Pedro Alves',      pos:'Atacante'},
      {sig:'MT', nome:'Mateus Torres',    pos:'Zagueiro'},
      {sig:'TN', nome:'Thiago Nunes',     pos:'Meia'},
      {sig:'RC', nome:'Rafael Costa',     pos:'Lateral'},
      {sig:'LF', nome:'Lucas Ferreira',   pos:'Goleiro'},
      {sig:'KP', nome:'Kaique Pereira',   pos:'Zagueiro'},
    ],
    reservas: [
      {sig:'IN', nome:'Igor Nunes',       pos:'Meia'},
      {sig:'JL', nome:'João Lima',        pos:'Atacante'},
    ]
  },
  {
    id: 'conv_002',
    jogo: 'Votoraty Academy vs Atlético Jr',
    data: 'Sexta, 18 de maio de 2025',
    hora: '18h30',
    local: 'Campo Atlético Jr',
    campeonato: 'Camp. Municipal Sub-13',
    fase: 'Fase de grupos',
    categoria: 'Sub-13',
    cor: '#185fa5',
    tecnico: 'Técnico André',
    observacao: 'Uniforme 2 (azul). Saída do clube às 17h no ônibus.',
    resultado: 'Vitória 2×1',
    convocados: [
      {sig:'KT', nome:'Kauan Telles',    pos:'Meia'},
      {sig:'PA', nome:'Pedro Alves',      pos:'Atacante'},
      {sig:'MT', nome:'Mateus Torres',    pos:'Zagueiro'},
      {sig:'TN', nome:'Thiago Nunes',     pos:'Meia'},
      {sig:'RC', nome:'Rafael Costa',     pos:'Lateral'},
    ],
    reservas: []
  }
];


function injetarConvocacaoNoFeed(cor){
  setTimeout(()=>{
    const feed = document.getElementById('feed-msgs');
    if(!feed) return;
    const conv = convocacoes_publicadas[0];
    const item = document.createElement('div');
    item.style.cssText='background:linear-gradient(160deg,#e6f4ec,#d4edd9);border:1.5px solid #97c459;border-radius:11px;padding:12px 13px;margin-bottom:9px';
    item.innerHTML=`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div style="width:34px;height:34px;border-radius:9px;background:#166024;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🏆</div>
        <div>
          <div style="font-size:12px;font-weight:700;color:#173404">VOCÊ FOI CONVOCADO!</div>
          <div style="font-size:10px;color:#3b6d11">${conv.tecnico} · ${conv.categoria}</div>
        </div>
        <span style="margin-left:auto;font-size:9px;font-weight:700;padding:2px 7px;border-radius:6px;background:#166024;color:#fff">novo</span>
      </div>
      <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:3px">${conv.jogo}</div>
      <div style="font-size:10px;color:#3b6d11;margin-bottom:5px">${conv.data} · ${conv.hora} · ${conv.local}</div>
      <div style="font-size:11px;color:#173404;line-height:1.5;background:rgba(22,96,36,.08);padding:6px 9px;border-radius:7px;margin-bottom:8px">
        📋 <strong>${conv.convocados.length} convocados:</strong> ${conv.convocados.map(c=>c.nome.split(' ')[0]).join(', ')}
      </div>
      <div style="font-size:10px;color:#3b6d11;font-style:italic">"${conv.observacao}"</div>
      <div style="font-size:9px;color:#3b6d11;margin-top:6px;text-align:right">agora · automático</div>`;
    feed.insertBefore(item, feed.firstChild);
  }, 200);
}

function renderMuralConvocacoes(cor){
  return `
  <div style="font-size:13px;font-weight:700;margin-bottom:4px;color:#1a1a1a">Convocações oficiais</div>
  <div style="font-size:11px;color:#aaa;margin-bottom:12px">Lista pública — todos os atletas podem ver</div>

  ${convocacoes_publicadas.map((conv,idx)=>`
  <div style="border:1.5px solid ${conv.resultado?'#97c459':conv.cor};border-radius:14px;overflow:hidden;margin-bottom:12px">

    <!-- Header da convocação -->
    <div style="background:${conv.resultado?'#eaf3de':conv.cor};padding:12px 14px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:13px;font-weight:700;color:${conv.resultado?'#173404':'#fff'}">${conv.jogo}</div>
          <div style="font-size:10px;color:${conv.resultado?'#3b6d11':'rgba(255,255,255,.8)'};margin-top:2px">${conv.data} · ${conv.hora}</div>
          <div style="font-size:10px;color:${conv.resultado?'#3b6d11':'rgba(255,255,255,.75)'}">📍 ${conv.local}</div>
        </div>
        ${conv.resultado
          ? `<span style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:8px;background:#166024;color:#fff;flex-shrink:0">${conv.resultado}</span>`
          : `<span style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:8px;background:rgba(255,255,255,.25);color:#fff;flex-shrink:0">${conv.categoria}</span>`
        }
      </div>
      <div style="font-size:10px;color:${conv.resultado?'#3b6d11':'rgba(255,255,255,.7)'};margin-top:4px">${conv.campeonato} · ${conv.fase}</div>
    </div>

    <!-- Lista de convocados -->
    <div style="padding:12px 14px;background:#fff">

      <div style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">
        ${conv.convocados.length} Convocados
      </div>

      <div style="display:flex;flex-direction:column;gap:0">
        ${conv.convocados.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #f5f4f0">
          <div style="width:22px;height:22px;border-radius:50%;background:${conv.cor};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0">${i+1}</div>
          <div style="width:30px;height:30px;border-radius:50%;background:${conv.cor}22;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${conv.cor};flex-shrink:0">${a.sig}</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700;color:#1a1a1a">${a.nome}</div>
            <div style="font-size:10px;color:#aaa">${a.pos}</div>
          </div>
          <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:6px;background:${conv.cor}18;color:${conv.cor}">${a.pos}</span>
        </div>`).join('')}
      </div>

      ${conv.reservas && conv.reservas.length>0 ? `
      <div style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.05em;margin-top:10px;margin-bottom:6px">
        ${conv.reservas.length} Reservas
      </div>
      ${conv.reservas.map((a,i)=>`
      <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #f5f4f0;opacity:.7">
        <div style="width:22px;height:22px;border-radius:50%;background:#f0eeea;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#888;flex-shrink:0">R${i+1}</div>
        <div style="width:30px;height:30px;border-radius:50%;background:#f0eeea;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#888;flex-shrink:0">${a.sig}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:600;color:#555">${a.nome}</div>
          <div style="font-size:10px;color:#aaa">${a.pos}</div>
        </div>
        <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:6px;background:#f5f4f0;color:#888">Reserva</span>
      </div>`).join('')}` : ''}

      <!-- Observação do técnico -->
      <div style="background:#fffaf0;border:1px solid #e8c97a;border-radius:8px;padding:8px 10px;margin-top:10px">
        <div style="font-size:10px;font-weight:700;color:#854f0b;margin-bottom:3px">📋 Recado do ${conv.tecnico}</div>
        <div style="font-size:11px;color:#633806;line-height:1.5">${conv.observacao}</div>
      </div>

      <!-- Confirmação de presença -->
      ${!conv.resultado ? `
      <div style="display:flex;gap:7px;margin-top:10px">
        <button onclick="confirmarPresenca(this,'sim','${conv.cor}')" style="flex:1;background:#eaf3de;color:#27500a;border:none;padding:9px;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer">✓ Confirmar presença</button>
        <button onclick="confirmarPresenca(this,'nao','${conv.cor}')" style="flex:1;background:#fcebeb;color:#791f1f;border:none;padding:9px;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer">✗ Não poderei ir</button>
      </div>` : `
      <div style="background:#eaf3de;border-radius:8px;padding:8px 10px;margin-top:10px;text-align:center;font-size:11px;font-weight:700;color:#27500a">
        ✓ Jogo encerrado · ${conv.resultado}
      </div>`}

    </div>
  </div>`).join('')}

  <!-- BOTÃO VER TODAS -->
  <div style="text-align:center;padding:8px 0">
    <button onclick="showN('Carregando histórico completo de convocações...')" style="background:none;border:1px solid #ddd;color:#666;padding:8px 20px;border-radius:9px;font-size:11px;font-weight:600;cursor:pointer">
      Ver histórico completo
    </button>
  </div>`;
}

function confirmarPresenca(btn, tipo, cor){
  const row = btn.parentElement;
  if(tipo==='sim'){
    row.innerHTML=`<div style="background:#eaf3de;border-radius:8px;padding:9px;text-align:center;font-size:11px;font-weight:700;color:#27500a;width:100%">✓ Presença confirmada! Técnico foi notificado.</div>`;
    showN('✓ Presença confirmada! Técnico André foi notificado.');
  } else {
    row.innerHTML=`<div style="background:#faeeda;border-radius:8px;padding:9px;text-align:center;font-size:11px;font-weight:700;color:#633806;width:100%">⚠️ Ausência informada. Técnico foi notificado.</div>`;
    showN('⚠️ Ausência informada ao Técnico André.');
  }
}
