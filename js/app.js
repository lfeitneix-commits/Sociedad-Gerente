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

function renderAssistant() {
  const log = document.getElementById("assistant-log");
  const input = document.getElementById("assistant-input");
  const form = document.getElementById("assistant-form");
  const chipRow = document.getElementById("chip-row");

  const suggestions = [
    "¿Cuál es el AUM break-even?",
    "¿Cuándo recuperamos la inversión?",
    "¿Cuánto cuesta operar por mes?",
    "¿Cuál es el resultado del Año 1?",
    "¿Cuál es el principal costo?",
    "¿Qué pasa si el AUM es menor al proyectado?"
  ];
  chipRow.innerHTML = suggestions.map(s => `<button type="button" class="chip">${s}</button>`).join("");

  function pushMessage(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerHTML = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function ask(question) {
    pushMessage("user", question);
    const answer = answerQuestion(question);
    setTimeout(() => pushMessage("bot", answer), 150);
  }

  chipRow.addEventListener("click", (e) => {
    if (e.target.matches(".chip")) ask(e.target.textContent);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    ask(q);
    input.value = "";
  });

  pushMessage("bot", "Preguntame lo que quieras sobre el modelo financiero (AUM, costos, resultados, payback, empleados, proveedores). Respondo solo con datos de la planilla.");
}

function renderAll() {
  renderKpis();
  renderAumChart("chart-aum", MODEL);
  renderYearsChart("chart-years", MODEL);
  renderCostChart("chart-costs", MODEL);
  renderTimeline();
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  renderAssistant();
});
