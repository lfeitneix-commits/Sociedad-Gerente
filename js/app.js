function derivedBadge(note) {
  return `<span class="derived-badge" title="${note.replace(/"/g, "&quot;")}">calc.</span>`;
}

function renderKpis() {
  const m = MODEL;
  const grid = document.getElementById("kpi-grid");

  const cards = [
    {
      label: "AUM break-even",
      value: fmtUSD(m.kpis.breakEven.usd),
      sub: fmtARS(m.kpis.breakEven.ars),
      badge: null
    },
    {
      label: "Costo promedio mensual",
      value: fmtUSD(m.kpis.avgMonthlyCost.usd),
      sub: fmtARS(m.kpis.avgMonthlyCost.ars) + " · operación plena",
      badge: m.kpis.avgMonthlyCost.calc
    },
    {
      label: "Inversión inicial",
      value: fmtUSD(m.kpis.initialInvestment.usd),
      sub: fmtARS(m.kpis.initialInvestment.ars),
      badge: m.kpis.initialInvestment.calc
    },
    {
      label: "Payback",
      value: m.kpis.payback.label,
      sub: m.kpis.payback.periodsFromLaunch,
      badge: null
    },
    {
      label: "Empleados necesarios",
      value: `${m.kpis.employees.total}`,
      sub: m.kpis.employees.breakdown.map(b => `${b.count} ${b.role}`).join(" · "),
      badge: m.kpis.employees.calc
    },
    {
      label: "Proveedores",
      value: `${m.kpis.providers.total}`,
      sub: m.kpis.providers.list.slice(0, 3).map(p => p.split(" (")[0]).join(", ") + "...",
      badge: m.kpis.providers.calc
    },
    {
      label: "Canal de venta",
      value: "Productores + comercial propio",
      sub: "Distribución mixta (dato parcial en el modelo)",
      badge: m.kpis.salesChannel.calc
    },
    {
      label: "VAN / TIR",
      value: `${fmtUSD(m.kpis.van.usd)}`,
      sub: `TIR ${(m.kpis.tir.pct * 100).toFixed(0)}% · tasa desc. ${(m.kpis.discountRate.pct * 100).toFixed(1)}%`,
      badge: null
    }
  ];

  grid.innerHTML = cards.map(c => `
    <div class="kpi-card">
      <p class="kpi-label">${c.label} ${c.badge ? derivedBadge(c.badge) : ""}</p>
      <div class="kpi-value">${c.value}</div>
      <p class="kpi-sub">${c.sub}</p>
    </div>
  `).join("");

  // Resultado por año — wide card with 3-way split
  const resultCard = document.createElement("div");
  resultCard.className = "kpi-card wide";
  resultCard.innerHTML = `
    <p class="kpi-label">Resultado neto por año ${derivedBadge("Suma de Resultado Neto SG mensual del modelo por año calendario. Los años con menos de 12 meses de datos lo indican en el detalle del gráfico.")}</p>
    <div class="result-trio">
      ${m.years.map(y => `
        <div>
          <div class="result-year-label">${y.label} · ${y.year}</div>
          <div class="result-year-value ${y.result_usd >= 0 ? "pos" : "neg"}">${y.result_usd >= 0 ? "▲" : "▼"} ${fmtUSD(y.result_usd)}</div>
          <div class="result-year-sub">${fmtARS(y.result_ars)}</div>
        </div>
      `).join("")}
    </div>
  `;
  grid.appendChild(resultCard);
}

function renderTimeline() {
  const t = MODEL.timeline;
  const track = document.getElementById("timeline-track");
  const nodes = [
    { cls: "", ...t.start },
    { cls: "node-2", ...t.breakEven },
    { cls: "node-3", ...t.payback }
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
      <td class="num">${fmtARS(i.ars)}</td>
      <td class="pct">${(i.ars / m.costBreakdown.total_ars * 100).toFixed(1)}%</td>
    </tr>
  `).join("");
  table.innerHTML = `
    <thead><tr><th>Concepto</th><th class="num">Anual</th><th class="pct">%</th></tr></thead>
    <tbody>${rows}
      <tr class="total-row"><td>Total</td><td class="num">${fmtARS(m.costBreakdown.total_ars)}</td><td class="pct">100%</td></tr>
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

function renderFunds() {
  const m = MODEL;
  const grid = document.getElementById("fund-grid");
  grid.innerHTML = m.funds.map(f => `
    <div class="fund-card">
      <h4>${f.name}</h4>
      <div class="fund-row"><span>AUM proyectado</span><span>${fmtARS(f.aum_projected_ars)}</span></div>
      <div class="fund-row"><span>Fee anual</span><span>${(f.fee_annual_pct * 100).toFixed(2)}%</span></div>
      <div class="fund-row"><span>Rendimiento anual</span><span>${(f.return_annual_pct * 100).toFixed(1)}%</span></div>
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
      <p class="kpi-label">Tasa de descuento (VAN)</p>
      <div class="kpi-value">${(m.kpis.discountRate.pct * 100).toFixed(1)}%</div>
      <p class="kpi-sub">${m.kpis.discountRate.note}</p>
    </div>
    <div class="kpi-card wide">
      <p class="kpi-label">Escenario de captación</p>
      <div class="kpi-value" style="font-size:16px">${m.meta.scenario}</div>
      <p class="kpi-sub">Horizonte del modelo: ${m.meta.horizon}. ${m.meta.launchNote}</p>
    </div>
  `;
}

function renderRegulatory() {
  const r = MODEL.regulatory;

  document.getElementById("reg-categoria").textContent = r.categoriaRegulatoria;
  document.getElementById("reg-ref-date").textContent = r.referenceDate;

  document.getElementById("reg-capital-grid").innerHTML = `
    <div class="kpi-card">
      <p class="kpi-label">Capital mínimo · primer FCI</p>
      <div class="kpi-value">${r.capitalMinimoPrimerFci.uva.toLocaleString("es-AR")} UVA</div>
      <p class="kpi-sub">${fmtARS(r.capitalMinimoPrimerFci.ars)} · ≈ ${fmtUSD(r.capitalMinimoPrimerFci.usd)}</p>
    </div>
    <div class="kpi-card">
      <p class="kpi-label">Por cada FCI adicional</p>
      <div class="kpi-value">+${r.capitalAdicionalPorFondo.uva.toLocaleString("es-AR")} UVA</div>
      <p class="kpi-sub">+${fmtARS(r.capitalAdicionalPorFondo.ars)} · ≈ ${fmtUSD(r.capitalAdicionalPorFondo.usd)}</p>
    </div>
    <div class="kpi-card">
      <p class="kpi-label">Contrapartida líquida</p>
      <div class="kpi-value">${(r.contrapartidaLiquida.pct * 100).toFixed(0)}%</div>
      <p class="kpi-sub">del patrimonio neto mínimo · ≈ ${fmtUSD(r.contrapartidaLiquida.usd)}</p>
    </div>
  `;

  document.getElementById("reg-alert-card").innerHTML = `⚠ <strong>Brecha de capital regulatorio:</strong> ${r.capitalGap.note}`;

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

function initNav() {
  const items = document.querySelectorAll(".nav-item");
  const panels = document.querySelectorAll(".tab-panel");
  items.forEach(item => {
    item.addEventListener("click", () => {
      const tab = item.dataset.tab;
      items.forEach(i => i.classList.toggle("active", i === item));
      panels.forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
      document.querySelector(".content").scrollTo({ top: 0, behavior: "instant" });
      history.replaceState(null, "", `#${tab}`);
    });
  });
  const initial = location.hash.replace("#", "");
  const initialItem = initial && document.querySelector(`.nav-item[data-tab="${initial}"]`);
  if (initialItem) initialItem.click();
}

function renderAll() {
  renderKpis();
  renderAumChart("chart-aum", MODEL);
  renderYearsChart("chart-years", MODEL);
  renderCostChart("chart-costs", MODEL);
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
