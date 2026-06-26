// =====================
// FINANCEIRO.JS — Perfil financeiro mobile: painel, sócios, mensalidades, cobranças, arbitragem
// =====================

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
