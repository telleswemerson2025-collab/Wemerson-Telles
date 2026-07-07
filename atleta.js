// =====================
// ATLETA.JS — Perfil atleta: feed, evolução, saúde, estudos, álbum, calendário, comprovantes
// =====================

function atualizarHabilidadesAtleta(key){
  const hab = HABILIDADES[key];
  if(!hab) return;
  Object.keys(HAB_LABELS||{}).forEach(k=>{
    const val = hab[k] || 70;
    const c = val>=75?'#0d3d1a':val>=50?'#b8860b':'#c0392b';
    const bar = document.getElementById('ev-bar-'+k);
    const valEl = document.getElementById('ev-val-'+k);
    if(bar){ bar.style.width=val+'%'; bar.style.background=c; }
    if(valEl){ valEl.textContent=val; valEl.style.color=c; }
  });
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

  // Adiciona aba Convocações (índice 7)
  const nav = document.getElementById('nav');
  const nt = document.createElement('div');
  nt.style.cssText='flex-shrink:0;padding:9px 11px;font-size:10px;font-weight:600;color:#bbb;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap';
  nt.textContent = 'Convocações';
  nt.className = 'nt';
  nt.onclick = function(){ goTab(7, cor); };
  nav.appendChild(nt);

  const scDiv = document.createElement('div');
  scDiv.id = 's-7';
  scDiv.className = 'scr';
  scDiv.style.cssText = 'padding:11px 13px;overflow-y:auto';
  scDiv.innerHTML = renderMuralConvocacoes(cor);
  sc.appendChild(scDiv);

  const bnav = document.getElementById('bnav');
  const bi = document.createElement('div');
  bi.className = 'bi';
  bi.innerHTML = `<i class="ti ti-clipboard-list" style="font-size:18px;color:#ccc"></i><span style="font-size:8px;color:#ccc">Convoc.</span>`;
  bi.onclick = function(){ goTab(7, cor); };
  bnav.appendChild(bi);

  injetarConvocacaoNoFeed(cor);
  aplicarFotoSalva();
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

// Gera relatório completo do atleta em janela de impressão (o navegador salva como PDF)
function baixarHistoricoPDF(){
  const a = ATLETA_DEFAULT;
  const catKey = (a.cat||'Sub-13').replace(/[^a-z0-9]/gi,'').toLowerCase();
  const ficKey = a.sig + catKey;
  const ficha = FICHAS[ficKey] || {};
  const histPres = (ficha.hist_presenca || []).slice(-30).reverse();
  const hab = HABILIDADES[ficKey] || {};
  const conquistas = getConquistas();
  const convs = JOGOS_AGENDADOS.filter(j => j.conv && j.conv.includes(a.sig));
  const convsPub = (typeof convocacoes_publicadas !== 'undefined' ? convocacoes_publicadas : [])
    .filter(c => (c.convocados||[]).some(x => x.sig === a.sig));
  const hoje = new Date().toLocaleDateString('pt-BR');
  const HAB_NOMES = {fin:'Finalização', dri:'Drible', vel:'Velocidade', pas:'Passe', mar:'Marcação', ati:'Atitude'};

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Histórico — ${a.nome}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#222;max-width:720px;margin:0 auto;padding:24px;font-size:13px}
    h1{color:#0d3d1a;border-bottom:3px solid #0d3d1a;padding-bottom:8px;font-size:22px}
    h2{color:#0d3d1a;font-size:15px;margin-top:22px;border-bottom:1px solid #ccc;padding-bottom:4px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th,td{border:1px solid #ddd;padding:6px 9px;text-align:left;font-size:12px}
    th{background:#eef3ee;color:#0d3d1a}
    .grid{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
    .card{border:1px solid #ddd;border-radius:8px;padding:10px 14px;min-width:100px;text-align:center}
    .card b{display:block;font-size:20px;color:#0d3d1a}
    .p{color:#1a5c26;font-weight:700}.f{color:#8b1a1a;font-weight:700}
    .rodape{margin-top:30px;font-size:10px;color:#888;text-align:center;border-top:1px solid #ccc;padding-top:8px}
    @media print{ body{padding:0} }
  </style></head><body>
  <h1>⚽ VOTORATY ACADEMY — Histórico do Atleta</h1>
  <p><b>${a.nome}</b> · ${a.pos} · ${a.cat} · Nível ${a.nivel}<br>Emitido em ${hoje}</p>

  <h2>Estatísticas gerais</h2>
  <div class="grid">
    <div class="card"><b>${STATS.treinos}</b>Treinos</div>
    <div class="card"><b>${calcPres()}%</b>Presença</div>
    <div class="card"><b>${STATS.gols}</b>Gols</div>
    <div class="card"><b>${STATS.xp}</b>XP</div>
    <div class="card"><b>${conquistas.length}</b>Conquistas</div>
  </div>

  <h2>Habilidades (avaliação do técnico)</h2>
  <table><tr><th>Habilidade</th><th>Nota (0-100)</th></tr>
  ${Object.entries(hab).map(([k,v])=>`<tr><td>${HAB_NOMES[k]||k}</td><td>${v}</td></tr>`).join('') || '<tr><td colspan="2">Sem avaliações registradas</td></tr>'}
  </table>

  <h2>Histórico de presença (últimas ${histPres.length} chamadas)</h2>
  <table><tr><th>Data</th><th>Status</th></tr>
  ${histPres.map(h=>`<tr><td>${h.data}</td><td class="${h.status==='P'?'p':'f'}">${h.status==='P'?'✓ Presente':h.status==='F'?'✗ Falta':'— Não marcado'}</td></tr>`).join('') || '<tr><td colspan="2">Nenhuma chamada registrada ainda</td></tr>'}
  </table>

  <h2>Convocações</h2>
  <table><tr><th>Jogo</th><th>Data</th><th>Local</th></tr>
  ${convs.map(c=>`<tr><td>vs ${c.adv||'—'}</td><td>${c.data||'—'}</td><td>${c.local||'—'}</td></tr>`).join('')}
  ${convsPub.map(c=>`<tr><td>${c.jogo}</td><td>${c.data}</td><td>${c.local}</td></tr>`).join('')}
  ${(convs.length+convsPub.length)===0 ? '<tr><td colspan="3">Nenhuma convocação registrada</td></tr>' : ''}
  </table>

  <h2>Conquistas desbloqueadas</h2>
  <table><tr><th>Conquista</th><th>Meta</th></tr>
  ${conquistas.map(c=>`<tr><td>${c.icon} ${c.titulo}</td><td>${c.meta}</td></tr>`).join('') || '<tr><td colspan="2">Nenhuma conquista ainda</td></tr>'}
  </table>

  ${ficha.cond || ficha.alergias ? `<h2>Informações de saúde</h2>
  <table>
  ${ficha.sangue ? `<tr><th>Tipo sanguíneo</th><td>${ficha.sangue}</td></tr>` : ''}
  ${ficha.alergias ? `<tr><th>Alergias</th><td>${ficha.alergias}</td></tr>` : ''}
  ${ficha.cond ? `<tr><th>Condições</th><td>${ficha.cond}</td></tr>` : ''}
  </table>` : ''}

  <div class="rodape">Votoraty Academy — Sistema de Gestão Esportiva · Documento gerado automaticamente em ${hoje}</div>
  <script>window.onload=function(){ setTimeout(function(){ window.print(); }, 300); }<\/script>
  </body></html>`;

  const w = window.open('', '_blank');
  if(!w){ showN('⚠️ Permita pop-ups para gerar o PDF.', true); return; }
  w.document.write(html);
  w.document.close();
  showN('📄 Relatório gerado! Escolha "Salvar como PDF" na impressão.');
}

function renderEvolucao(cor){
  const a=ATLETA_DEFAULT;
  const pres = calcPres();
  const conq = getConquistas().length;
  const nivel = ATLETA_DEFAULT.nivel; // mesmo nível exibido no header (consistência)
  const xpAtual = STATS.xp%1000;
  return `
  <!-- Input oculto para foto -->
  <input type="file" id="foto-input" accept="image/*" style="display:none" onchange="carregarFoto(event)">

  <button onclick="baixarHistoricoPDF()" style="width:100%;margin-bottom:12px;padding:12px;border-radius:12px;border:1.5px solid ${cor};background:#fff;color:${cor};font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
    📄 Baixar histórico em PDF
  </button>

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
      <button onclick="event.stopPropagation();baixarHistoricoPDF()"
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
  // Conta só os checks da tela ativa (Saúde e Estudos coexistem no DOM)
  const scr = document.querySelector('.scr.on') || document;
  const marcados = scr.querySelectorAll('.chk.on');
  if(marcados.length === 0){ showN('⚠️ Marque pelo menos um item antes de salvar.', true); return; }
  const xp = marcados.length * 10;
  STATS.xp += xp;
  atualizarStatsUI(); // já chama salvarLS()
  // Desmarca os itens salvos
  marcados.forEach(b => { b.classList.remove('on'); b.style.background=''; b.style.borderColor='#ddd'; });
  scr.querySelectorAll('.chk-lbl.done').forEach(l => l.classList.remove('done'));
  showN('✓ Check-in de '+tipo+' salvo! +'+xp+' XP conquistados!');
}

// montarNav e montarBnav definidas em utils.js

// _navHistory, _navCurrentIdx, _navCor definidos em utils.js

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
    // Se o item tem data-scr (bnav remapeado do diretor/professor-todos), compara com a TELA destino
    const alvo = t.dataset.scr !== undefined ? parseInt(t.dataset.scr) : i;
    const ativo = alvo === idx;
    t.classList.toggle('on', ativo);
    const ic = t.querySelector('i'); if(ic) ic.style.color = ativo?_navCor:'#ccc';
    const sp = t.querySelector('span'); if(sp) sp.style.color = ativo?_navCor:'#ccc';
  });
  _atualizarBtnVoltar();
}

function goBack(){
  if(_navHistory.length===0) return;
  const prev = _navHistory.pop();
  goTab(prev, _navCor, false);
}

// _resetNav e _atualizarBtnVoltar definidas em utils.js

// Sino do header: resume as pendências REAIS do usuário atual
function mostrarNotificacoes(){
  const avisos = [];
  // Convocações ainda sem resposta (perfil atleta)
  if(perfilAtual === 'atleta'){
    const pendentes = convocacoes_publicadas.filter(c =>
      !c.resultado && (c.convocados||[]).some(x => x.sig === ATLETA_DEFAULT.sig) && !(c.confirmacoes||{})[ATLETA_DEFAULT.sig]);
    if(pendentes.length) avisos.push('⚽ '+pendentes.length+' convocação(ões) aguardando sua confirmação');
    const catKey = (ATLETA_DEFAULT.cat||'Sub-13').replace(/[^a-z0-9]/gi,'').toLowerCase();
    const mens = MENSALIDADES_ATLETAS[ATLETA_DEFAULT.sig + catKey];
    if(mens && mens.status === 'atraso') avisos.push('💰 Mensalidade em atraso — fale com o financeiro');
  } else {
    const atrasos = Object.values(MENSALIDADES_ATLETAS).filter(m => m.status === 'atraso').length;
    if(atrasos) avisos.push('💰 '+atrasos+' mensalidade(s) em atraso');
    const jogosProx = JOGOS_AGENDADOS.filter(j => j.status === 'agendado').length;
    if(jogosProx) avisos.push('📅 '+jogosProx+' jogo(s) agendado(s)');
  }
  showN(avisos.length ? avisos.join(' · ') : '✓ Nenhuma notificação pendente!');
}

// Sinal sonoro de notificação (Web Audio — sem arquivo externo)
let _audioCtx = null;
function tocarSomNotificacao(err){
  if(localStorage.getItem('vot_som') === 'off') return; // usuário desativou
  try {
    if(!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(_audioCtx.state === 'suspended') _audioCtx.resume();
    const agora = _audioCtx.currentTime;
    // Sucesso: dois toques ascendentes (din-din). Erro: um tom grave.
    const notas = err ? [[220, 0, .18]] : [[660, 0, .09], [880, .11, .12]];
    notas.forEach(([freq, delay, dur]) => {
      const osc = _audioCtx.createOscillator();
      const gain = _audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, agora + delay);
      gain.gain.exponentialRampToValueAtTime(0.18, agora + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, agora + delay + dur);
      osc.connect(gain); gain.connect(_audioCtx.destination);
      osc.start(agora + delay); osc.stop(agora + delay + dur + 0.05);
    });
  } catch(e){}
}

function toggleSomNotificacao(){
  const off = localStorage.getItem('vot_som') === 'off';
  localStorage.setItem('vot_som', off ? 'on' : 'off');
  showN(off ? '🔔 Som de notificações ativado!' : '🔕 Som de notificações desativado.');
}

function showN(txt,err){
  const el=document.getElementById('notif-el');
  document.getElementById('notif-txt').textContent=txt;
  el.style.background=err?'#fce8e8':'#dcf0e0';
  el.style.borderColor=err?'#e8a0a0':'#8ec99a';
  el.style.color=err?'#8b1a1a':'#1a5c26';
  document.getElementById('notif-wrap').style.display='block';
  tocarSomNotificacao(err);
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
  chamadas={};golsV=2;offlineMode=false;_perfilAnterior=null;
  const mini = document.getElementById('header-mini-av');
  if(mini) mini.remove();
}

function cadastrarAtleta(){
  const nm=(document.getElementById('m-nome').value||'').trim();
  if(!nm){ showN('⚠️ Informe o nome do atleta.', true); return; }
  const pos = document.getElementById('m-pos')?.value || 'Meia';
  const catNome = document.getElementById('m-cat')?.value || 'Sub-13';
  const catKey = catNome.toLowerCase().replace(/[\s-]/g,'');
  const cat = CATS_DATA[catKey] || CATS_DATA['sub13'];
  // Gera sigla única a partir do nome
  const partes = nm.split(' ');
  let sig = (partes[0][0] + (partes[1]?.[0] || partes[0][1] || 'X')).toUpperCase();
  let n = 2;
  while(cat.atletas.find(a => a.sig === sig)){ sig = sig[0] + (n++); }
  cat.atletas.push({sig, nome: nm, pos, pres: 100, gols: 0, nivel: 5});
  salvarLS();
  fecharModal('modal-atleta');
  showN('✓ '+nm+' cadastrado no '+cat.nome+'! Acesso enviado ao responsável.');
  document.getElementById('m-nome').value='';
  // Re-renderiza a lista de atletas mantendo o usuário na aba Atletas
  if(perfilAtual === 'diretor'){ montarDiretor(CORES.diretor); goTab(1, CORES.diretor, false); }
  else if(perfilAtual && perfilAtual.startsWith('prof_')){
    const ck = perfilAtual.replace('prof_','');
    montarProfessor(ck, CATS_DATA[ck], CORES[ck]);
    goTab(4, CORES[ck], false); // aba Atletas do professor
  }
}

// abrirModal definida em utils.js

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

// JOGOS_AGENDADOS e JOGOS_RESULTADOS declarados em data.js

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

// fecharModal definida em utils.js

