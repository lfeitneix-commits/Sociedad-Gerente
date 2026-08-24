function derivedBadge(note) {
  return `<span class="derived-badge" title="${note.replace(/"/g, "&quot;")}">calc.</span>`;
}

const SVG_ATTRS = 'viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
  target: `<svg ${SVG_ATTRS}><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3.6"/><circle cx="10" cy="10" r="0.6" fill="currentColor"/></svg>`,
  calendar: `<svg ${SVG_ATTRS}><rect x="2.8" y="4" width="14.4" height="13" rx="2"/><path d="M2.8 8h14.4M6.5 2.5v3M13.5 2.5v3"/></svg>`,
  seed: `<svg ${SVG_ATTRS}><path d="M10 17V9"/><path d="M10 9c0-3.5-2.5-6-6.5-6.3C3.3 6.7 5.8 9.2 10 9Z"/><path d="M10 12c0-2.6 2-4.5 5-4.7.2 3-2 5.5-5 4.7Z"/></svg>`,
  clockCheck: `<svg ${SVG_ATTRS}><circle cx="9.5" cy="10.5" r="6.8"/><path d="M9.5 6.5v4l2.6 1.6"/><path d="M15 3.2l1.8 1.8"/></svg>`,
  people: `<svg ${SVG_ATTRS}><circle cx="7.2" cy="7" r="3"/><path d="M2 17c0-3 2.3-5 5.2-5s5.2 2 5.2 5"/><circle cx="14.5" cy="7.6" r="2.3"/><path d="M13 12.2c2.4.2 4 1.9 4 4.8"/></svg>`,
  building: `<svg ${SVG_ATTRS}><rect x="3.5" y="3" width="9" height="14" rx="1"/><path d="M12.5 8.5H16a1 1 0 0 1 1 1V17"/><path d="M6.3 6.5h3M6.3 9.5h3M6.3 12.5h3"/></svg>`,
  network: `<svg ${SVG_ATTRS}><circle cx="4.5" cy="5" r="2"/><circle cx="4.5" cy="15" r="2"/><circle cx="15.5" cy="10" r="2.3"/><path d="M6.3 5.9 13.4 9M6.3 14.1 13.4 11"/></svg>`,
  trendUp: `<svg ${SVG_ATTRS}><path d="M2.5 15.5 8 9l3.5 3.5L17.5 5"/><path d="M12.5 5h5v5"/></svg>`,
  trophy: `<svg ${SVG_ATTRS}><path d="M6 3.5h8v5a4 4 0 0 1-8 0v-5Z"/><path d="M6 5H3.8C3.8 7.5 4.8 9 6 9M14 5h2.2c0 2.5-1 4-2.2 4"/><path d="M10 12.5V15M7 17h6"/></svg>`
};
function kpiIcon(key) { return `<span class="kpi-icon">${ICONS[key]}</span>`; }

const VERDICT_ICON = { good: "✓", warning: "!", critical: "✕" };
const VERDICT_TAG = { good: "Conclusión", warning: "Conclusión — con salvedad", critical: "Conclusión" };

function renderVerdict() {
  const v = MODEL.verdict;
  const card = document.getElementById("verdict-card");
  card.className = `verdict-card status-${v.status}`;
  card.innerHTML = `
    <span class="verdict-icon">${VERDICT_ICON[v.status]}</span>
    <div class="verdict-body">
      <p class="verdict-tag">${VERDICT_TAG[v.status]}</p>
      <h2>${v.headline}</h2>
      <p>${v.detail}</p>
    </div>
  `;
}

// AUM break-even: en pesos (primario) con el USD como referencia — se reusa en Resumen y en
// el recap de Fondos & supuestos.
function breakEvenStatHtml(m) {
  return `
    <div class="hero-stat">
      <p class="hero-stat-label">AUM break-even</p>
      <div class="hero-stat-value">${fmtARS(m.kpis.breakEven.ars)}</div>
      <p class="hero-stat-sub">${fmtUSD(m.kpis.breakEven.usd)}</p>
    </div>
  `;
}

function recuperoStatHtml(m) {
  const sub = m.kpis.payback.periodsFromLaunch
    ? m.kpis.payback.periodsFromLaunch.split(" / ")[0]
    : "No se recupera en el horizonte modelado";
  return `
    <div class="hero-stat">
      <p class="hero-stat-label">Recupero de la inversión</p>
      <div class="hero-stat-value">${m.kpis.payback.label}</div>
      <p class="hero-stat-sub">${sub}</p>
    </div>
  `;
}

// Los 2 números que abren la presentación — la "tapa" del business case.
function renderHeroStats() {
  const m = MODEL;
  document.getElementById("scenario-tag-text").textContent = m.meta.scenario;
  document.getElementById("scenario-inline").textContent = m.meta.scenario;
  document.getElementById("hero-stats").innerHTML = breakEvenStatHtml(m) + recuperoStatHtml(m);
}

// Resultado neto por año: pesos y dólares con el mismo peso visual (ninguno queda de "letra chica").
// Muestra el resultado ACUMULADO desde el inicio hasta fin de cada año (no el resultado de
// ese año solo), igual que "Resultado acumulado Año X" en el deck de Neix.
function resultTrioHtml(m) {
  return m.years.map(y => {
    const cls = y.result_usd_cum >= 0 ? "pos" : "neg";
    const arrow = y.result_usd_cum >= 0 ? "▲" : "▼";
    const aumLine = y.aum_end_usd != null
      ? `<div class="result-year-sub">AUM a fin de año: ${fmtUSD(y.aum_end_usd)} · ${fmtARS(y.aum_end_ars)}</div>`
      : `<div class="result-year-sub">AUM: sin fondos lanzados todavía</div>`;
    return `
    <div>
      <div class="result-year-label">${y.label} · ${y.year}</div>
      <div class="result-year-value ${cls}">${arrow} ${fmtUSD(y.result_usd_cum)}</div>
      <div class="result-year-value-secondary ${cls === "pos" ? "pos-text" : "neg-text"}">${fmtARS(y.result_ars_cum)}</div>
      ${aumLine}
    </div>
  `;
  }).join("");
}
function renderResultTrio(targetId = "result-trio") {
  document.getElementById(targetId).innerHTML = resultTrioHtml(MODEL);
}

// Indicadores de apoyo — quedan en segundo plano detrás de los números de arriba.
function renderKpis(targetId = "kpi-grid") {
  const m = MODEL;
  const grid = document.getElementById(targetId);

  const cards = [
    {
      icon: "calendar",
      label: "Costo promedio mensual",
      value: fmtUSD(m.kpis.avgMonthlyCost.usd),
      sub: fmtARS(m.kpis.avgMonthlyCost.ars) + ` · ${m.kpis.avgMonthlyCost.referenceYear.label} ${m.kpis.avgMonthlyCost.referenceYear.year}`,
      badge: m.kpis.avgMonthlyCost.calc
    },
    {
      icon: "seed",
      label: "Inversión inicial",
      value: fmtUSD(m.kpis.initialInvestment.usd),
      sub: fmtARS(m.kpis.initialInvestment.ars),
      badge: m.kpis.initialInvestment.calc
    },
    {
      icon: "people",
      label: "Empleados necesarios",
      value: `${m.kpis.employees.total}`,
      sub: m.kpis.employees.breakdown.map(b => `${b.count} ${b.role}`).join(" · "),
      badge: m.kpis.employees.calc
    },
    {
      icon: "building",
      label: "Proveedores",
      value: `${m.kpis.providers.total}`,
      sub: m.kpis.providers.list.join(", "),
      badge: m.kpis.providers.calc
    },
    {
      icon: "network",
      label: "Canal de venta",
      value: "Productores + comercial propio",
      sub: "Distribución mixta (dato parcial en el modelo)",
      badge: m.kpis.salesChannel.calc
    }
  ];

  grid.innerHTML = cards.map(c => `
    <div class="kpi-card">
      ${kpiIcon(c.icon)}
      <p class="kpi-label">${c.label} ${c.badge ? derivedBadge(c.badge) : ""}</p>
      <div class="kpi-value">${c.value}</div>
      <p class="kpi-sub">${c.sub}</p>
    </div>
  `).join("");
}

// Datos de contexto (no forman parte del modelo financiero de la SG): tamaño de la industria de
// FCI y cómo se distribuye HOY el AUM que ya gestiona Neix.
function renderNeixAumHoy() {
  const n = MODEL.neixAumHoy;
  const ic = MODEL.industryContext;
  const el = document.getElementById("neix-aum-hoy");
  if (!el) return;

  let industryHtml = "";
  if (ic) {
    industryHtml = `<p>Del patrimonio total de la industria de FCI (<strong>${fmtARS(ic.totalIndustriaArs)}</strong> a ${ic.fechaReferencia}), las sociedades gerentes bancarias concentran el <strong>${(ic.bancariasPct * 100).toFixed(1)}%</strong> (${fmtARS(ic.bancariasArs)}) y las independientes el <strong>${(ic.independientesPct * 100).toFixed(1)}%</strong> (${fmtARS(ic.independientesArs)}). En los últimos 12 meses (${ic.periodoFlujos}), las independientes tuvieron suscripciones netas equivalentes al <strong>${(ic.flujoNetoIndependientesPct * 100).toFixed(0)}%</strong> de su patrimonio, contra solo el <strong>${(ic.flujoNetoBancariasPct * 100).toFixed(0)}%</strong> de las bancarias. El AUM de Neix representa una participación del <strong>${(ic.neixMarketSharePct * 100).toFixed(2)}%</strong> de la industria.</p>`;
  }

  let neixHtml = "";
  if (n) {
    const totalText = n.totalArs != null
      ? `<strong>${fmtARS(n.totalArs)}</strong> en FCI`
      : `<strong>AUM total: pendiente de confirmación</strong>`;
    const f = n.porTipoFondo;
    const porFondo = f
      ? ` Por tipo de fondo: <strong>${(f.moneyMarketPct * 100).toFixed(0)}%</strong> Money Market, <strong>${(f.rentaFijaPesosPct * 100).toFixed(0)}%</strong> Renta Fija $, <strong>${(f.rentaFijaUsdPct * 100).toFixed(0)}%</strong> Renta Fija USD y <strong>${(f.rentaVariablePct * 100).toFixed(0)}%</strong> Renta Variable $.`
      : "";
    neixHtml = `<p>Hoy Neix gestiona ${totalText}, del cual el <strong>${(n.productoresPct * 100).toFixed(0)}%</strong> corresponde a productores y el <strong>${(n.fuerzaPropiaPct * 100).toFixed(0)}%</strong> a fuerza de venta propia.${porFondo}</p>`;
  }

  el.innerHTML = industryHtml + neixHtml;
}

function renderTimeline() {
  const t = MODEL.timeline;
  const track = document.getElementById("timeline-track");
  const nodes = [
    { cls: "", ...t.start },
    { cls: "node-2", ...t.launch },
    { cls: "node-3", ...t.breakEven },
    { cls: "node-4", ...t.payback }
  ];
  track.innerHTML = `<div class="timeline-line"></div>` + nodes.map(n => `
    <div class="timeline-node ${n.cls}">
      <div class="t-date">${n.date}</div>
      <div class="t-label">${n.label}</div>
      <div class="t-detail">${n.detail}</div>
    </div>
  `).join("");
}

function renderCostTable() {
  const m = MODEL;
  const table = document.getElementById("cost-table");
  const rows = m.costBreakdown.allItems.map(i => `
    <tr>
      <td>${i.label}</td>
      <td class="num">${fmtUSD(i.usd)}<span class="ars-sub">${fmtARS(i.ars)}</span></td>
      <td class="pct">${(i.ars / m.costBreakdown.total_ars * 100).toFixed(1)}%</td>
    </tr>
  `).join("");
  const avg = m.kpis.avgMonthlyCost;
  table.innerHTML = `
    <thead><tr><th>Concepto</th><th class="num">Anual</th><th class="pct">%</th></tr></thead>
    <tbody>${rows}
      <tr class="total-row"><td>Total</td><td class="num">${fmtUSD(m.costBreakdown.total_usd)}<span class="ars-sub">${fmtARS(m.costBreakdown.total_ars)}</span></td><td class="pct">100%</td></tr>
      <tr class="total-row"><td>Promedio mensual (${avg.referenceYear.label} · ${avg.referenceYear.year})</td><td class="num">${fmtUSD(avg.usd)}<span class="ars-sub">${fmtARS(avg.ars)}</span></td><td class="pct"></td></tr>
    </tbody>
  `;
}

function renderInvestmentTable() {
  const m = MODEL;
  const table = document.getElementById("investment-table");
  const total = m.initialInvestmentItems.reduce((s, i) => s + i.ars, 0);
  const rows = m.initialInvestmentItems.map(i => `
    <tr>
      <td>${i.label}</td>
      <td class="num">${fmtARS(i.ars)}</td>
    </tr>
  `).join("");
  table.innerHTML = `
    <thead><tr><th>Concepto</th><th class="num">Monto</th></tr></thead>
    <tbody>${rows}
      <tr class="total-row"><td>Total</td><td class="num">${fmtARS(total)}</td></tr>
    </tbody>
  `;
}

function renderMonthlyTable() {
  const m = MODEL;
  const table = document.getElementById("monthly-table");
  const fmtOrDash = (v, fmt) => (v === null ? "—" : fmt(v));
  const rows = m.monthlyTable.map(r => `
    <tr>
      <td>${r.m}</td>
      <td class="num">${fmtOrDash(r.aum_usd, fmtUSD)}</td>
      <td class="num">${fmtOrDash(r.ingresos_usd, fmtUSD)}</td>
      <td class="num">${fmtOrDash(r.costos_usd, fmtUSD)}</td>
      <td class="num">${r.resultado_usd === null ? "—" : `<span class="${r.resultado_usd >= 0 ? "pos-text" : "neg-text"}">${fmtUSD(r.resultado_usd)}</span>`}</td>
    </tr>
  `).join("");
  table.innerHTML = `
    <thead><tr><th>Mes</th><th class="num">AUM total</th><th class="num">Ingresos</th><th class="num">Costos</th><th class="num">Resultado neto</th></tr></thead>
    <tbody>${rows}</tbody>
  `;
}

function renderFunds() {
  const m = MODEL;
  const grid = document.getElementById("fund-grid");
  grid.innerHTML = m.funds.map(f => `
    <div class="fund-card">
      <h4>${f.name}</h4>
      <div class="fund-row"><span>AUM proyectado</span><span>${fmtARS(f.aum_projected_ars)}</span></div>
      <div class="fund-row"><span>Fee anual</span><span>${(f.fee_annual_pct * 100).toFixed(2)}%</span></div>
      <div class="fund-row"><span>Rendimiento anual</span><span>${(f.return_annual_pct * 100).toFixed(1)}%</span></div>
      <div class="fund-row fund-row-divider"><span>Crecimiento mensual del AUM</span><span>${((f.return_monthly_pct + f.newMoney_monthly_pct) * 100).toFixed(2)}%</span></div>
      <div class="fund-row fund-row-detail"><span>· devengamiento de cartera</span><span>${(f.return_monthly_pct * 100).toFixed(2)}%</span></div>
      <div class="fund-row fund-row-detail"><span>· new money</span><span>${(f.newMoney_monthly_pct * 100).toFixed(2)}%</span></div>
    </div>
  `).join("");

  const assumptions = document.getElementById("assumptions-grid");
  assumptions.innerHTML = `
    <div class="kpi-card">
      <p class="kpi-label">Fee anual promedio</p>
      <div class="kpi-value">${(m.kpis.feeAnnualAvg.pct * 100).toFixed(2)}%</div>
      <p class="kpi-sub">Promedio ponderado de los 4 fondos</p>
    </div>
    <div class="kpi-card">
      <p class="kpi-label">Tasa de descuento</p>
      <div class="kpi-value">${(m.kpis.discountRate.pct * 100).toFixed(1)}%</div>
      <p class="kpi-sub">${m.kpis.discountRate.note}</p>
    </div>
    <div class="kpi-card wide">
      <p class="kpi-label">Escenario de captación</p>
      <div class="kpi-value" style="font-size:16px">${m.meta.scenario}</div>
      <p class="kpi-sub">Horizonte del modelo: ${m.meta.horizon}. ${m.meta.launchNote}</p>
    </div>
  `;

  // Recap de KPIs del Resumen, para tener el respaldo numérico completo a mano en esta pestaña.
  document.getElementById("supuestos-breakeven").innerHTML = breakEvenStatHtml(m);
  renderResultTrio("supuestos-result-trio");
  renderKpis("supuestos-kpi-grid");
}

function renderRegulatory() {
  const r = MODEL.regulatory;

  document.getElementById("reg-categoria").textContent = r.categoriaRegulatoria;
  document.getElementById("reg-ref-date").textContent = r.referenceDate;

  const cc = r.capitalConsolidation;
  const gap = r.capitalGap;
  document.getElementById("reg-capital-grid").innerHTML = `
    <div class="kpi-card">
      <p class="kpi-label">Capital mínimo · primer FCI</p>
      <div class="kpi-value">${r.capitalMinimoPrimerFci.uva.toLocaleString("es-AR")} UVA</div>
      <p class="kpi-sub">≈ ${fmtARS(r.capitalMinimoPrimerFci.uva * r.uvaRate)}</p>
    </div>
    <div class="kpi-card">
      <p class="kpi-label">Por cada FCI adicional</p>
      <div class="kpi-value">+${r.capitalAdicionalPorFondo.uva.toLocaleString("es-AR")} UVA</div>
      <p class="kpi-sub">≈ +${fmtARS(r.capitalAdicionalPorFondo.uva * r.uvaRate)}</p>
    </div>
    <div class="kpi-card">
      <p class="kpi-label">Patrimonio neto mínimo (3 categorías) ${derivedBadge(cc.note)}</p>
      <div class="kpi-value">${fmtARS(cc.patrimonioMinimo.ars)}</div>
      <p class="kpi-sub">${cc.patrimonioMinimo.uva.toLocaleString("es-AR")} UVA · Neix tiene ${fmtARS(r.neixBalance.patrimonioNetoMinimo_ars)} <span class="pos-text">(sobra ${fmtARS(gap.patrimonioSurplus_ars)})</span></p>
    </div>
    <div class="kpi-card">
      <p class="kpi-label">Contrapartida líquida (3 categorías) ${derivedBadge(cc.note)}</p>
      <div class="kpi-value">${fmtARS(cc.contrapartidaLiquida.ars)}</div>
      <p class="kpi-sub">${cc.contrapartidaLiquida.uva.toLocaleString("es-AR")} UVA · Neix tiene ${fmtARS(r.neixBalance.contrapartidaLiquida_ars)} <span class="${gap.ars > 0 ? "neg-text" : "pos-text"}">(${gap.ars > 0 ? "falta" : "sobra"} ${fmtARS(Math.abs(gap.ars))})</span></p>
    </div>
  `;

  const alertCard = document.getElementById("reg-alert-card");
  alertCard.className = `alert-card ${gap.modelUnderstatesCapital ? "status-warning" : "status-good"}`;
  alertCard.innerHTML = gap.modelUnderstatesCapital
    ? `⚠ <strong>Ajuste de cartera pendiente:</strong> ${gap.note}`
    : `✓ <strong>Capital regulatorio cubierto:</strong> ${gap.note}`;

  document.getElementById("reg-ventajas").innerHTML = r.ventajas.map(v => `<li>${v}</li>`).join("");
  document.getElementById("reg-desventajas").innerHTML = r.desventajas.map(v => `<li>${v}</li>`).join("");

  document.getElementById("reg-requisitos").innerHTML = r.requisitosOperativos.map((req, i) => `
    <div class="req-item">
      <span class="req-num">${String(i + 1).padStart(2, "0")}</span>
      <div class="req-body">
        <h4>${req.titulo}</h4>
        <p>${req.detalle}<span class="req-art">${req.art}</span></p>
      </div>
    </div>
  `).join("");

  document.getElementById("reg-funciones-principales").textContent = r.funciones.principales;
  document.getElementById("reg-funciones-adicionales").textContent = r.funciones.adicionales;
}

const TAB_ORDER = ["resumen", "financials", "costos", "regulatorio", "fondos", "simulador"];
const TAB_TITLES = { resumen: "Resumen", financials: "Financials", costos: "Costos", regulatorio: "Regulatorio", fondos: "Fondos & supuestos", simulador: "Simulador" };

function goToTab(tab) {
  const items = document.querySelectorAll(".nav-item");
  const panels = document.querySelectorAll(".tab-panel");
  items.forEach(i => i.classList.toggle("active", i.dataset.tab === tab));
  panels.forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
  document.querySelector(".content").scrollTo({ top: 0, behavior: "instant" });
  window.scrollTo({ top: 0, behavior: "instant" });
  history.replaceState(null, "", `#${tab}`);
  updateDeckNav(tab);
}

function updateDeckNav(tab) {
  const idx = TAB_ORDER.indexOf(tab);
  document.getElementById("deck-step").textContent = `${idx + 1} / ${TAB_ORDER.length} · ${TAB_TITLES[tab]}`;
  const prevBtn = document.getElementById("deck-prev");
  const nextBtn = document.getElementById("deck-next");
  prevBtn.disabled = idx <= 0;
  const isLast = idx >= TAB_ORDER.length - 1;
  nextBtn.disabled = isLast;
  nextBtn.textContent = isLast ? "Fin de la presentación" : "Siguiente →";
  nextBtn.classList.toggle("deck-btn-primary", !isLast);
}

function initNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => goToTab(item.dataset.tab));
  });
  document.getElementById("deck-prev").addEventListener("click", () => {
    const idx = TAB_ORDER.indexOf(location.hash.replace("#", "") || "resumen");
    if (idx > 0) goToTab(TAB_ORDER[idx - 1]);
  });
  document.getElementById("deck-next").addEventListener("click", () => {
    const idx = TAB_ORDER.indexOf(location.hash.replace("#", "") || "resumen");
    if (idx < TAB_ORDER.length - 1) goToTab(TAB_ORDER[idx + 1]);
  });

  const initial = location.hash.replace("#", "");
  goToTab(TAB_ORDER.includes(initial) ? initial : "resumen");
}

function renderAll() {
  renderVerdict();
  renderHeroStats();
  renderResultTrio();
  renderKpis();
  renderNeixAumHoy();
  renderAumChart("chart-aum", MODEL);
  renderYearsChart("chart-years", MODEL);
  renderMonthlyTable();
  renderCostTable();
  renderInvestmentTable();
  renderFunds();
  renderRegulatory();
  renderTimeline();
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  initNav();
});
