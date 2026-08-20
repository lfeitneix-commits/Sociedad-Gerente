/*
 * Simulador (tab "Simulador"): sensibilidad de AUM break-even / resultado neto ante cambios
 * en el fee de cada fondo y en el split de comisión a productores. Es una vista aparte del
 * modelo principal: parte de MODEL.simulatorBase (AUM y fee proyectados por fondo, costos fijos
 * ex-comisión productores) y recalcula todo en el cliente a medida que se mueven los sliders,
 * sin tocar INPUTS/MODEL. Es una aproximación anual (estructura de referencia de costBreakdown,
 * mismo año que "Costo promedio mensual"), no una réplica del detalle mensual del Sheet.
 */

let simState = null; // { fees: [..por fondo..], pctAumEnProductores, pctComisionSobreFee }

function simDefaultState() {
  const base = MODEL.simulatorBase;
  return {
    fees: base.funds.map(f => f.fee_pct),
    pctAumEnProductores: base.productoresSplit.pctAumEnProductores,
    pctComisionSobreFee: base.productoresSplit.pctComisionSobreFee
  };
}

function simCompute(state) {
  const base = MODEL.simulatorBase;
  const fundsResult = base.funds.map((f, i) => {
    const fee_pct = state.fees[i];
    const ingresos_ars = f.aum_ars * fee_pct;
    return { name: f.name, aum_ars: f.aum_ars, fee_pct, ingresos_ars };
  });
  const ingresosTotal_ars = fundsResult.reduce((s, f) => s + f.ingresos_ars, 0);
  const aumTotal_ars = fundsResult.reduce((s, f) => s + f.aum_ars, 0);
  const comisionProductores_ars = ingresosTotal_ars * state.pctAumEnProductores * state.pctComisionSobreFee;
  const costosFijos_ars = base.fixedCosts_ars;
  const costosTotales_ars = costosFijos_ars + comisionProductores_ars;
  const resultado_ars = ingresosTotal_ars - costosTotales_ars;
  const feePromedioPonderado = aumTotal_ars > 0 ? ingresosTotal_ars / aumTotal_ars : 0;
  const feeNetoEfectivo = feePromedioPonderado * (1 - state.pctAumEnProductores * state.pctComisionSobreFee);
  const breakEven_ars = feeNetoEfectivo > 0 ? costosFijos_ars / feeNetoEfectivo : null;

  return {
    fundsResult,
    ingresosTotal_ars, ingresosTotal_usd: ingresosTotal_ars / base.fx,
    comisionProductores_ars, comisionProductores_usd: comisionProductores_ars / base.fx,
    costosFijos_ars, costosFijos_usd: costosFijos_ars / base.fx,
    resultado_ars, resultado_usd: resultado_ars / base.fx,
    feePromedioPonderado,
    breakEven_ars, breakEven_usd: breakEven_ars !== null ? breakEven_ars / base.fx : null
  };
}

function simRenderSliders() {
  const base = MODEL.simulatorBase;

  const fundSliders = document.getElementById("sim-fund-sliders");
  fundSliders.innerHTML = base.funds.map((f, i) => `
    <div class="sim-row">
      <div class="sim-row-label">
        <span>${f.name}</span>
        <span class="sim-row-value" id="sim-fee-value-${i}">${(simState.fees[i] * 100).toFixed(2)}%</span>
      </div>
      <input type="range" class="sim-slider" id="sim-fee-${i}" min="0" max="5" step="0.01" value="${(simState.fees[i] * 100).toFixed(2)}">
      <p class="sim-row-sub">AUM proyectado: ${fmtUSD(f.aum_ars / base.fx)}</p>
    </div>
  `).join("");

  const prodSliders = document.getElementById("sim-productores-sliders");
  prodSliders.innerHTML = `
    <div class="sim-row">
      <div class="sim-row-label">
        <span>% del AUM en manos de productores</span>
        <span class="sim-row-value" id="sim-pctaum-value">${(simState.pctAumEnProductores * 100).toFixed(0)}%</span>
      </div>
      <input type="range" class="sim-slider" id="sim-pctaum" min="0" max="100" step="1" value="${(simState.pctAumEnProductores * 100).toFixed(0)}">
    </div>
    <div class="sim-row">
      <div class="sim-row-label">
        <span>% de comisión sobre el fee de ese AUM</span>
        <span class="sim-row-value" id="sim-pctcom-value">${(simState.pctComisionSobreFee * 100).toFixed(0)}%</span>
      </div>
      <input type="range" class="sim-slider" id="sim-pctcom" min="0" max="100" step="1" value="${(simState.pctComisionSobreFee * 100).toFixed(0)}">
    </div>
  `;

  base.funds.forEach((f, i) => {
    document.getElementById(`sim-fee-${i}`).addEventListener("input", (e) => {
      simState.fees[i] = parseFloat(e.target.value) / 100;
      document.getElementById(`sim-fee-value-${i}`).textContent = `${parseFloat(e.target.value).toFixed(2)}%`;
      simRenderResults();
    });
  });
  document.getElementById("sim-pctaum").addEventListener("input", (e) => {
    simState.pctAumEnProductores = parseFloat(e.target.value) / 100;
    document.getElementById("sim-pctaum-value").textContent = `${e.target.value}%`;
    simRenderResults();
  });
  document.getElementById("sim-pctcom").addEventListener("input", (e) => {
    simState.pctComisionSobreFee = parseFloat(e.target.value) / 100;
    document.getElementById("sim-pctcom-value").textContent = `${e.target.value}%`;
    simRenderResults();
  });
}

function simRenderResults() {
  const r = simCompute(simState);
  const base = MODEL.simulatorBase;

  document.getElementById("sim-hero-stats").innerHTML = `
    <div class="hero-stat">
      <p class="hero-stat-label">AUM break-even (simulado)</p>
      <div class="hero-stat-value">${r.breakEven_usd !== null ? fmtUSD(r.breakEven_usd) : "N/D"}</div>
      <p class="hero-stat-sub">fee neto ponderado: ${(r.feePromedioPonderado * (1 - simState.pctAumEnProductores * simState.pctComisionSobreFee) * 100).toFixed(2)}%</p>
    </div>
    <div class="hero-stat">
      <p class="hero-stat-label">Fee promedio ponderado</p>
      <div class="hero-stat-value">${(r.feePromedioPonderado * 100).toFixed(2)}%</div>
      <p class="hero-stat-sub">ponderado por AUM de cada fondo</p>
    </div>
    <div class="hero-stat">
      <p class="hero-stat-label">Comisión a productores</p>
      <div class="hero-stat-value">${fmtUSD(r.comisionProductores_usd)}</div>
      <p class="hero-stat-sub">${fmtARS(r.comisionProductores_ars)}</p>
    </div>
    <div class="hero-stat">
      <p class="hero-stat-label">Resultado neto anual (estimado)</p>
      <div class="hero-stat-value ${r.resultado_usd >= 0 ? "pos-text" : "neg-text"}">${fmtUSD(r.resultado_usd)}</div>
      <p class="hero-stat-sub">antes de Impuesto a las Ganancias</p>
    </div>
  `;

  const baseBreakEven_usd = MODEL.kpis.breakEven.usd;
  const diffPct = r.breakEven_usd !== null ? ((r.breakEven_usd - baseBreakEven_usd) / baseBreakEven_usd * 100) : null;
  const breakEvenNote = diffPct !== null
    ? `vs. AUM break-even del modelo (${fmtUSD(baseBreakEven_usd)}): ${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(1)}% con estos supuestos.`
    : `Con estos supuestos el fee neto no cubre costos fijos: no existe un AUM de equilibrio.`;
  document.getElementById("sim-vs-base").innerHTML =
    `${breakEvenNote}<br>El AUM de cada fondo es el mismo de "Fondos &amp; supuestos" (foto fija, no la rampa mensual real) y el resultado es <em>antes</em> de Impuesto a las Ganancias — por eso los ingresos y el resultado neto de este simulador no coinciden exactamente con Financials, aunque el AUM y el break-even sí son comparables.`;

  const table = document.getElementById("sim-fund-table");
  const rows = r.fundsResult.map(f => `
    <tr>
      <td>${f.name}</td>
      <td class="num">${fmtUSD(f.aum_ars / base.fx)}</td>
      <td class="num">${(f.fee_pct * 100).toFixed(2)}%</td>
      <td class="num">${fmtUSD(f.ingresos_ars / base.fx)}</td>
    </tr>
  `).join("");
  table.innerHTML = `
    <thead><tr><th>Fondo</th><th class="num">AUM proyectado</th><th class="num">Fee</th><th class="num">Ingresos anuales</th></tr></thead>
    <tbody>${rows}
      <tr class="total-row"><td>Total</td><td class="num">${fmtUSD(r.fundsResult.reduce((s, f) => s + f.aum_ars, 0) / base.fx)}</td><td></td><td class="num">${fmtUSD(r.ingresosTotal_usd)}</td></tr>
    </tbody>
  `;
}

function initSimulator() {
  simState = simDefaultState();
  simRenderSliders();
  simRenderResults();

  document.getElementById("sim-reset-btn").addEventListener("click", () => {
    simState = simDefaultState();
    simRenderSliders();
    simRenderResults();
  });
}

document.addEventListener("DOMContentLoaded", initSimulator);
