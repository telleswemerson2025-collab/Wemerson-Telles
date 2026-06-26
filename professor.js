// =====================
// PROFESSOR.JS — Perfil professor: chamada, avaliação, treino, mensagem, atletas, jogos, convocações
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

// PRESENCA_HIST e ARBITRAGEM_STATUS inicializados em data.js

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
