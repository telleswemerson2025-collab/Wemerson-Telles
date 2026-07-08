// =====================
// DIRETOR.JS — Perfil diretor: dashboard, atletas, jogos, campeonatos, financeiro, avisos, config
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

  // bnav tem 5 itens mas há 7 telas — remapeia índices (Financ.→s-4, Config→s-6)
  document.querySelectorAll('#bnav .bi').forEach((b,i)=>{
    const mapa=[0,1,2,4,6];
    const alvo = mapa[i]!==undefined?mapa[i]:i;
    b.dataset.scr = alvo; // goTab usa isso para destacar o item certo
    b.onclick=function(){goTab(alvo,cor);};
  });

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
  <div id="s-4" class="scr" style="padding:11px 13px;overflow-y:auto">${renderFinResumoDiretor(cor)}</div>
  <div id="s-5" class="scr" style="padding:11px 13px;overflow-y:auto">${renderMensagem('todas as categorias',true,cor)}</div>
  <div id="s-6" class="scr" style="padding:11px 13px;overflow-y:auto">${renderConfig(cor)}</div>`;
  setCor(cor);
}

function renderDashboard(cor){
  // Calcula totais reais a partir dos dados
  const totalAtletas = Object.values(CATS_DATA).reduce((s,c)=>s+(c.atletas||[]).length,0);
  const numCats = Object.keys(CATS_DATA).length;
  const totalMens = Object.values(MENSALIDADES_ATLETAS).filter(m=>m.status==='pago').reduce((s,m)=>s+m.valor,0);
  const totalMensK = (totalMens/1000).toFixed(1);
  // Presença média geral (média das % de cada atleta em todas categorias)
  const todosAtletas = Object.values(CATS_DATA).flatMap(c=>c.atletas||[]);
  const presMedia = todosAtletas.length
    ? Math.round(todosAtletas.reduce((s,a)=>s+(a.pres||0),0)/todosAtletas.length)
    : 0;
  // Próximos jogos
  const proxJogos = JOGOS_AGENDADOS.slice(0,3);
  return `<div class="stat-grid">
    <div class="stat-c" style="background:#dcf0e0;border:1px solid #8ec99a"><div class="stat-v" style="color:#1a5c26">${totalAtletas}</div><div class="stat-l" style="color:#1a5c26">Atletas ativos</div><div style="font-size:9px;color:#3b7a40;margin-top:2px;font-weight:500">${numCats} categorias</div></div>
    <div class="stat-c" style="background:#dceaf8;border:1px solid #7eb3e8"><div class="stat-v" style="color:#0e3d6e">${numCats}</div><div class="stat-l" style="color:#0e3d6e">Categorias</div><div style="font-size:9px;color:#185fa5;margin-top:2px;font-weight:500">Sub-7 ao Sub-15</div></div>
    <div class="stat-c" style="background:#fdf3dc;border:1px solid #e8c97a"><div class="stat-v" style="color:#7a4010">R$${totalMensK}k</div><div class="stat-l" style="color:#7a4010">Mensalidades</div><div style="font-size:9px;color:#a05a10;margin-top:2px;font-weight:500">recebido</div></div>
    <div class="stat-c" style="background:#ece9fd;border:1px solid #afa9ec"><div class="stat-v" style="color:#3c2e9e">${presMedia}%</div><div class="stat-l" style="color:#3c2e9e">Presença média</div><div style="font-size:9px;color:#534ab7;margin-top:2px;font-weight:500">todas cats.</div></div>
  </div>
  ${proxJogos.length ? `<div class="lbl">Próximos jogos</div><div class="cw" style="padding:6px 14px">${proxJogos.map(j=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-size:12px;font-weight:700;color:var(--text)">vs ${j.adv}</div><div style="font-size:9px;color:var(--text-3);margin-top:1px;font-weight:500">${j.cat} · ${j.data} · ${j.hora} · ${j.local||'—'}</div></div><span class="tag tb">${j.status||'agendado'}</span></div>`).join('')}</div>` : ''}
  <div class="lbl">Alertas urgentes</div>
  <div class="alerta" style="background:#fce8e8;border:1px solid #e8a0a0">
    <div class="al-icon" style="background:#f5c5c5"><i class="ti ti-alert-triangle" style="font-size:14px;color:#8b1a1a"></i></div>
    <div style="flex:1"><div style="font-size:11px;font-weight:700;color:#8b1a1a">Pedro Alves — 4 faltas seguidas</div>
    <div style="font-size:10px;color:#b03030;margin-top:2px;font-weight:500">Sub-13 · pai ainda não respondeu</div>
    <button class="btn-sm" style="margin-top:6px" onclick="abrirMsgDireta('Pedro Alves','PA','Atacante','Sub-13','${cor}')">Enviar mensagem ao pai</button></div>
  </div>
  <div class="alerta" style="background:#fdf3dc;border:1px solid #e8c97a">
    <div class="al-icon" style="background:#fac775"><i class="ti ti-currency-dollar" style="font-size:14px;color:#7a4010"></i></div>
    <div><div style="font-size:11px;font-weight:700;color:#7a4010">${(() => {
      const atrasos = Object.entries(MENSALIDADES_ATLETAS).filter(([,m]) => m.status === 'atraso');
      return atrasos.length + ' mensalidade' + (atrasos.length===1?'':'s') + ' em atraso';
    })()}</div>
    <div style="font-size:10px;color:#a05a10;margin-top:2px;font-weight:500">${(() => {
      const nomes = Object.entries(MENSALIDADES_ATLETAS).filter(([,m]) => m.status === 'atraso').map(([id]) => {
        const mm = id.match(/^([A-Z]+)([a-z0-9]+)$/);
        const a = mm && CATS_DATA[mm[2]]?.atletas.find(x => x.sig === mm[1]);
        return a ? a.nome : id;
      });
      return nomes.length ? nomes.join(', ') : 'Nenhum atraso no momento 🎉';
    })()}</div>
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
    <span style="font-size:9px;color:var(--text-3);font-style:italic;text-align:right">Agendar e convocar:<br>pelo Professor</span>
  </div>
  <div class="lbl">Ao vivo</div>
  <div class="card" style="border-color:#e8a0a0;border-left:3px solid #c0392b">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:10px;color:var(--text-3);font-weight:500">Sub-13 · Camp. Municipal</span>
      <span class="tag tr">Ao vivo 34'</span>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin:8px 0">
      <span style="font-size:12px;font-weight:700;flex:1;color:var(--text)">Votoraty</span>
      <span style="font-family:var(--font-display);font-size:28px;color:var(--text);letter-spacing:.06em" id="gv">${golsV}</span>
      <span style="font-size:14px;color:var(--text-3)">×</span>
      <span style="font-family:var(--font-display);font-size:28px;color:var(--text);letter-spacing:.06em" id="ga">${golsA}</span>
      <span style="font-size:12px;font-weight:700;flex:1;text-align:right;color:var(--text)">Atlético Jr</span>
    </div>
    <div style="display:flex;gap:6px;margin-top:10px">
      <button class="btn-sm" onclick="addGol()">+ Gol Votoraty</button>
      <button class="btn-sm" onclick="addGolAdv()">+ Gol adv.</button>
      <button class="btn-sm" onclick="encerrarJogoDiretor('${cor}')">Encerrar</button>
    </div>
  </div>
  <div class="lbl">Próximos</div>
  ${JOGOS_AGENDADOS.filter(j=>j.status==='agendado').length === 0
    ? '<div class="card" style="text-align:center;color:var(--text-3);font-size:11px">Nenhum jogo agendado</div>'
    : JOGOS_AGENDADOS.filter(j=>j.status==='agendado').map(j=>`
  <div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:10px;color:var(--text-3);font-weight:500">${j.cat} · ${j.data} · ${j.hora}</span><span class="tag tb">agendado</span></div>
    <div style="display:flex;align-items:center;justify-content:center;gap:10px"><span style="font-size:12px;font-weight:700;flex:1;color:var(--text)">Votoraty</span><span style="font-size:13px;color:var(--text-3)">vs</span><span style="font-size:12px;font-weight:700;flex:1;text-align:right;color:var(--text)">${j.adv}</span></div>
    ${(j.conv&&j.conv.length) ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:9px;font-weight:700;color:var(--text-3);text-transform:uppercase;margin-bottom:4px">👥 ${j.conv.length} convocados (pelo professor)</div><div style="font-size:10px;color:var(--text-2);line-height:1.5">${j.conv.map(sig=>{const a=CATS_DATA[(j.cat||'').replace(/[^a-z0-9]/gi,'').toLowerCase()]?.atletas.find(x=>x.sig===sig);return a?a.nome.split(' ')[0]:sig;}).join(', ')}</div></div>` : '<div style="margin-top:6px;font-size:9px;color:var(--text-3);font-style:italic">Sem convocados ainda</div>'}
  </div>`).join('')}
  <div class="lbl">Últimos resultados</div>
  ${JOGOS_RESULTADOS.length === 0
    ? '<div class="card" style="text-align:center;color:var(--text-3);font-size:11px">Nenhum resultado registrado</div>'
    : JOGOS_RESULTADOS.slice(0,5).map(r=>`
  <div class="card" style="border-left:3px solid ${r.resultado==='Vitória'?'#1a5c26':r.resultado==='Derrota'?'#8b1a1a':'#b8860b'}"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:10px;color:var(--text-3);font-weight:500">${r.cat||''} · ${r.data||''}</span><span class="tag ${r.resultado==='Vitória'?'tg':r.resultado==='Derrota'?'tr':'ta'}">${r.resultado||''}</span></div>
    <div style="display:flex;align-items:center;justify-content:center;gap:10px"><span style="font-size:12px;font-weight:700;flex:1;color:var(--text)">Votoraty</span><span style="font-family:var(--font-display);font-size:22px;color:var(--text)">${r.placar || ((r.gv!=null&&r.ga!=null)?r.gv+'×'+r.ga:'')}</span><span style="font-size:12px;font-weight:700;flex:1;text-align:right;color:var(--text)">${r.adv||''}</span></div></div>`).join('')}`;
}

let golsV=2, golsA=1;
function addGol(){golsV++;const el=document.getElementById('gv');if(el)el.textContent=golsV;showN('✓ Gol do Votoraty! '+golsV+'×'+golsA);}
function addGolAdv(){golsA++;showN('Gol adversário registrado. '+golsV+'×'+golsA);}
function encerrarJogoDiretor(cor){
  const resultado = golsV > golsA ? 'Vitória' : golsV < golsA ? 'Derrota' : 'Empate';
  JOGOS_RESULTADOS.unshift({adv:'Atlético Jr', cat:'Sub-13', gv:golsV, ga:golsA, placar:golsV+'x'+golsA, resultado, data:new Date().toLocaleDateString('pt-BR')});
  salvarLS();
  showN('⏱️ Jogo encerrado! '+resultado+' '+golsV+'×'+golsA+' registrada.');
  golsV=0; golsA=0;
  // Re-renderiza a aba Jogos para mostrar o resultado
  const s2 = document.getElementById('s-2');
  if(s2) s2.innerHTML = renderJogos(cor||CORES.diretor);
}

// Campeonatos: lista padrão + criados pelo diretor (persistidos)
function _listaCampeonatos(){
  const base = [['tg','Camp. Municipal Sub-13','6 rodadas · Votoraty em 1º',80,'ativo'],
    ['tb','Camp. Regional Sub-11','4 rodadas · Votoraty em 2º',50,'ativo'],
    ['ta','Estadual Sub-15','Semifinal · fase final',90,'semifinal'],
    ['tp','Sub-7 Amistoso','Encerrado · Votoraty campeão',100,'campeão']];
  try {
    const extras = JSON.parse(localStorage.getItem('vot_campeonatos')||'[]');
    return extras.map(c => ['tb', c.nome, c.formato+' · '+c.times+' times', 5, 'novo']).concat(base);
  } catch(e){ return base; }
}
function criarCampeonato(){
  const nome = (document.getElementById('camp-nome')||{}).value || '';
  if(!nome.trim()){ showN('⚠️ Informe o nome do campeonato.', true); return; }
  const formato = (document.getElementById('camp-formato')||{}).value || 'Pontos corridos';
  const times = ((document.getElementById('camp-times')||{}).value || '').split('\n').filter(t=>t.trim()).length || 1;
  try {
    const arr = JSON.parse(localStorage.getItem('vot_campeonatos')||'[]');
    arr.unshift({nome: nome.trim(), formato, times, criadoEm: new Date().toLocaleDateString('pt-BR')});
    localStorage.setItem('vot_campeonatos', JSON.stringify(arr));
  } catch(e){}
  fecharModal('modal-camp');
  document.getElementById('camp-nome').value = '';
  showN('✓ Campeonato "'+nome.trim()+'" criado!');
  const s3 = document.getElementById('s-3');
  if(s3) s3.innerHTML = renderCamps(CORES.diretor);
}

function renderCamps(cor){
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <span style="font-size:13px;font-weight:700">Campeonatos</span>
    <button class="btn-sm" onclick="abrirModal('modal-camp')">+ Criar</button>
  </div>
  <div class="cw" style="padding:6px 12px">
    ${_listaCampeonatos().map(([tg,nm,sub,pct,st])=>`
    <div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid #f0eeea">
      <div style="width:30px;height:30px;border-radius:8px;background:#f9f9f7;border:1px solid #eee;display:flex;align-items:center;justify-content:center"><i class="ti ti-trophy" style="font-size:15px;color:#c8940a"></i></div>
      <div style="flex:1"><div style="font-size:12px;font-weight:700">${nm}</div><div style="font-size:9px;color:#aaa">${sub}</div><div class="prog" style="margin-top:4px"><div class="prog-f" style="width:${pct}%;background:${cor}"></div></div></div>
      <span class="tag ${tg}">${st}</span>
    </div>`).join('')}
  </div>`;
}

// renderFinanceiro removida — financeiro está em financeiro.js (montarFinanceiro)

function renderConfig(cor){
  return `<div class="lbl">Dados do clube</div>
  <div class="cw" style="padding:8px 14px">
    ${(()=>{
      let clube = {nome:'Votoraty Academy', cats:'Sub-7, Sub-9, Sub-11, Sub-13, Sub-15', dias:'Ter, Qui, Sáb', mens:'R$ 180,00 / mês'};
      try { Object.assign(clube, JSON.parse(localStorage.getItem('vot_clube')||'{}')); } catch(e){}
      return [['Nome do clube', clube.nome, 'nome'],['Categorias', clube.cats, 'cats'],['Dias de treino', clube.dias, 'dias'],['Mensalidade', clube.mens, 'mens']].map(([l,v,k])=>`
    <div class="config-row"><div><div style="font-size:12px;font-weight:700;color:var(--text)">${l}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">${v}</div></div><button class="btn-sm" onclick="editarDadoClube('${k}','${l}')">Editar</button></div>`).join('');
    })()}
  </div>
  <div class="lbl">👥 Criar acesso de usuário</div>
  <div class="cw" style="padding:12px 14px">
    <div style="font-size:10px;color:var(--text-3);margin-bottom:10px;font-weight:500">Cadastre e-mail, senha e função — o acesso é criado na hora, sem precisar do console do Firebase.</div>
    <div class="field"><label>E-mail</label><input type="email" id="nu-email" placeholder="atleta@votoraty.com"></div>
    <div class="field"><label>Senha (mín. 6 caracteres)</label><input type="text" id="nu-senha" placeholder="senha123"></div>
    <div class="field"><label>Função</label>
      <select id="nu-role">
        <option value="atleta">Atleta</option>
        <option value="prof_sub7">Professor Sub-7</option>
        <option value="prof_sub9">Professor Sub-9</option>
        <option value="prof_sub11">Professor Sub-11</option>
        <option value="prof_sub13">Professor Sub-13</option>
        <option value="prof_sub15">Professor Sub-15</option>
        <option value="professor">Professor (todos os subs)</option>
        <option value="financeiro">Financeiro</option>
        <option value="diretor">Diretor</option>
      </select>
    </div>
    <button class="btn-g" style="background:${cor}" onclick="criarUsuarioPeloForm()">➕ Criar usuário</button>
  </div>
  <div class="lbl">Notificações</div>
  <div class="cw" style="padding:8px 14px">
    <div class="config-row">
      <div><div style="font-size:12px;font-weight:700;color:var(--text)">🔔 Som de notificações</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">Toca um sinal sonoro a cada aviso do app</div></div>
      <div class="toggle ${localStorage.getItem('vot_som')==='off'?'':'on'}" onclick="toggleSomNotificacao();this.classList.toggle('on');this.style.background=this.classList.contains('on')?'${cor}':'var(--border)'" style="${localStorage.getItem('vot_som')==='off'?'':'background:'+cor}"><div class="toggle-k"></div></div>
    </div>
  </div>
  <div class="lbl">Automações</div>
  <div class="cw" style="padding:8px 14px">
    ${[['Lembrete saúde diário','Todos os dias às 07h'],['Lembrete de estudos','Todos os dias às 07h'],['Alerta de faltas','Após 2 faltas seguidas'],['Cobrança automática','5 dias após vencimento'],['Relatório mensal','Todo dia 1º do mês'],['Figurinha anual','Todo 01 de dezembro']].map(([l,s])=>`
    <div class="config-row"><div><div style="font-size:12px;font-weight:700;color:var(--text)">${l}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">${s}</div></div><div class="toggle ${_autoOn(l)?'on':''}" onclick="toggleAutomacao(this,'${l}','${cor}')" style="${_autoOn(l)?'background:'+cor:''}"><div class="toggle-k"></div></div></div>`).join('')}
  </div>
  <div class="lbl">Exportar dados</div>
  <div class="cw" style="padding:8px 14px">
    <div class="config-row"><div><div style="font-size:12px;font-weight:700;color:var(--text)">Relatório geral PDF</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">Toda a temporada</div></div><button class="btn-sm" onclick="exportarRelatorioGeral()">Exportar</button></div>
    <div class="config-row"><div><div style="font-size:12px;font-weight:700;color:var(--text)">Lista de atletas (CSV/Excel)</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">Planilha completa</div></div><button class="btn-sm" onclick="exportarAtletasCSV()">Exportar</button></div>
    <div class="config-row"><div><div style="font-size:12px;font-weight:700;color:var(--text)">Backup completo</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;font-weight:500">Todos os dados (JSON)</div></div><button class="btn-sm" onclick="exportarBackup()">Exportar</button></div>
  </div>`;
}

// ===== Config: helpers reais =====
function _autoOn(nome){
  try { const a = JSON.parse(localStorage.getItem('vot_automacoes')||'{}'); return a[nome] !== false; } catch(e){ return true; }
}
function toggleAutomacao(el, nome, cor){
  el.classList.toggle('on');
  el.style.background = el.classList.contains('on') ? cor : 'var(--border)';
  try {
    const a = JSON.parse(localStorage.getItem('vot_automacoes')||'{}');
    a[nome] = el.classList.contains('on');
    localStorage.setItem('vot_automacoes', JSON.stringify(a));
  } catch(e){}
}
function editarDadoClube(k, label){
  let clube = {nome:'Votoraty Academy', cats:'Sub-7, Sub-9, Sub-11, Sub-13, Sub-15', dias:'Ter, Qui, Sáb', mens:'R$ 180,00 / mês'};
  try { Object.assign(clube, JSON.parse(localStorage.getItem('vot_clube')||'{}')); } catch(e){}
  const novo = prompt(label + ':', clube[k]);
  if(novo === null || !novo.trim()) return;
  clube[k] = novo.trim();
  localStorage.setItem('vot_clube', JSON.stringify(clube));
  showN('✓ ' + label + ' atualizado!');
  const s6 = document.getElementById('s-6');
  if(s6) s6.innerHTML = renderConfig(CORES.diretor);
}
function _baixarArquivo(nome, conteudo, tipo){
  const blob = new Blob([conteudo], {type: tipo});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
}
function exportarBackup(){
  const dados = {
    exportadoEm: new Date().toISOString(),
    cats: CATS_DATA, mensalidades: MENSALIDADES_ATLETAS, socios: SOCIOS,
    despesas: DESPESAS_CLUBE, jogos: JOGOS_AGENDADOS, resultados: JOGOS_RESULTADOS,
    fichas: FICHAS, habilidades: HABILIDADES, presenca: window.PRESENCA_HIST||{},
    arbitragem: window.ARBITRAGEM_STATUS||{}, convocacoes: convocacoes_publicadas, stats: STATS
  };
  _baixarArquivo('votoraty-backup-'+new Date().toISOString().split('T')[0]+'.json', JSON.stringify(dados, null, 2), 'application/json');
  showN('✓ Backup completo baixado!');
}
function exportarAtletasCSV(){
  let csv = 'Categoria;Sigla;Nome;Posição;Presença %;Gols;Nível\n';
  Object.entries(CATS_DATA).forEach(([k,c]) => c.atletas.forEach(a => {
    csv += `${c.nome};${a.sig};${a.nome};${a.pos};${a.pres};${a.gols};${a.nivel}\n`;
  }));
  _baixarArquivo('votoraty-atletas.csv', '﻿'+csv, 'text/csv;charset=utf-8');
  showN('✓ Lista de atletas exportada (abre no Excel)!');
}
function exportarRelatorioGeral(){
  const totalAtl = Object.values(CATS_DATA).reduce((s,c)=>s+c.atletas.length,0);
  const totalRec = Object.values(MENSALIDADES_ATLETAS).filter(m=>m.status==='pago').reduce((s,m)=>s+m.valor,0);
  const totalAtr = Object.values(MENSALIDADES_ATLETAS).filter(m=>m.status==='atraso').reduce((s,m)=>s+m.valor,0);
  const w = window.open('', '_blank');
  if(!w){ showN('⚠️ Permita pop-ups para gerar o PDF.', true); return; }
  w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório Geral — Votoraty</title>
  <style>body{font-family:Arial;max-width:720px;margin:0 auto;padding:24px;color:#222;font-size:13px}h1{color:#0d3d1a;border-bottom:3px solid #0d3d1a;padding-bottom:8px}h2{color:#0d3d1a;font-size:15px;margin-top:20px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #ddd;padding:6px 9px;text-align:left;font-size:12px}th{background:#eef3ee}</style></head><body>
  <h1>⚽ VOTORATY ACADEMY — Relatório Geral</h1>
  <p>Emitido em ${new Date().toLocaleDateString('pt-BR')}</p>
  <h2>Resumo</h2>
  <table><tr><th>Total de atletas</th><td>${totalAtl}</td></tr><tr><th>Recebido (mensalidades)</th><td>R$ ${totalRec.toFixed(2)}</td></tr><tr><th>Em atraso</th><td>R$ ${totalAtr.toFixed(2)}</td></tr><tr><th>Jogos agendados</th><td>${JOGOS_AGENDADOS.filter(j=>j.status==='agendado').length}</td></tr><tr><th>Resultados registrados</th><td>${JOGOS_RESULTADOS.length}</td></tr></table>
  <h2>Atletas por categoria</h2>
  ${Object.entries(CATS_DATA).map(([k,c])=>`<h3 style="color:#0d3d1a;font-size:13px">${c.emoji} ${c.nome} — ${c.atletas.length} atletas</h3>
  <table><tr><th>Nome</th><th>Posição</th><th>Presença</th><th>Gols</th><th>Nível</th></tr>
  ${c.atletas.map(a=>`<tr><td>${a.nome}</td><td>${a.pos}</td><td>${a.pres}%</td><td>${a.gols}</td><td>${a.nivel}</td></tr>`).join('')}</table>`).join('')}
  <script>window.onload=function(){setTimeout(function(){window.print();},300);}<\/script></body></html>`);
  w.document.close();
  showN('📄 Relatório gerado! Escolha "Salvar como PDF".');
}

// Resumo financeiro embutido na aba Financeiro do diretor
// A gestão completa está em financeiro.js (montarFinanceiro)
function renderFinResumoDiretor(cor){
  const totalRec = Object.values(MENSALIDADES_ATLETAS).filter(m=>m.status==='pago').reduce((s,m)=>s+m.valor,0);
  const totalAtr = Object.values(MENSALIDADES_ATLETAS).filter(m=>m.status==='atraso').reduce((s,m)=>s+m.valor,0);
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-family:var(--font-display);font-size:20px;letter-spacing:.06em;color:var(--text)">Financeiro</span>
    <button class="btn-sm" onclick="_perfilAnterior='diretor';entrar('financeiro')">Gestão completa</button>
  </div>
  <div class="stat-grid">
    <div class="stat-c" style="background:#dcf0e0;border:1px solid #8ec99a"><div class="stat-v" style="color:#1a5c26">R$${(totalRec/1000).toFixed(1)}k</div><div class="stat-l" style="color:#1a5c26">Recebido</div></div>
    <div class="stat-c" style="background:#fce8e8;border:1px solid #e8a0a0"><div class="stat-v" style="color:#8b1a1a">R$${totalAtr}</div><div class="stat-l" style="color:#8b1a1a">Em atraso</div></div>
  </div>
  <div class="lbl">Mensalidades em atraso</div>
  <div class="cw" style="padding:6px 14px">
    ${Object.entries(MENSALIDADES_ATLETAS).filter(([,m])=>m.status==='atraso').map(([chave,m])=>{
      const catKey = chave.replace(/^[A-Z]+/,'');
      const cat = CATS_DATA[catKey];
      const atleta = cat?.atletas.find(a=>chave.startsWith(a.sig));
      const nome = atleta?.nome || chave;
      return '<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);gap:10px">'
        +'<div style="flex:1"><div style="font-size:12px;font-weight:700;color:var(--text)">'+nome+'</div>'
        +'<div style="font-size:9px;color:var(--text-3);margin-top:1px;font-weight:500">'+(cat?.nome||'')+' · venc. '+m.venc+'</div></div>'
        +'<div style="text-align:right">'
        +'<span style="font-size:12px;font-weight:700;color:#8b1a1a">✗ atraso R$'+m.valor+'</span>'
        +'<div><button class="btn-sm" style="margin-top:4px" onclick="showN(\'Cobrança enviada!\')">Cobrar</button></div>'
        +'</div></div>';
    }).join('')}
  </div>
  <button class="btn-g" style="background:${cor}" onclick="_perfilAnterior='diretor';entrar('financeiro')">Abrir gestão financeira completa</button>`;
}

