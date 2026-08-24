/*
 * Simulador (tab "Simulador"): sensibilidad de AUM break-even / resultado neto ante cambios
 * en cuánto capta la Sociedad Gerente de cada tipo de fondo (hoy 70% Money Market / 90% el
 * resto) y en el split de comisión a productores. Es una vista aparte del modelo principal:
 * parte de MODEL.simulatorBase (AUM "100% captado" y fee fijo por fondo, costos fijos ex-
 * comisión productores) y recalcula todo en el cliente a medida que se mueven los sliders,
 * sin tocar INPUTS/MODEL. Es una aproximación anual (estructura de referencia de costBreakdown,
 * mismo año que "Costo promedio mensual"), no una réplica del detalle mensual del Sheet.
 */

let simState = null; // { captureMM, captureResto, pctAumEnProductores, pctComisionSobreFee }

function simDefaultState() {
  const base = MODEL.simulatorBase;
  return {
    captureMM: base.captureScenario.moneyMarketPct,
    captureResto: base.captureScenario.restoPct,
    pctAumEnProductores: base.productoresSplit.pctAumEnProductores,
    pctComisionSobreFee: base.productoresSplit.pctComisionSobreFee
  };
}

function simCompute(state) {
  const base = MODEL.simulatorBase;
  const fundsResult = base.funds.map(f => {
    const capturePct = f.group === "moneyMarket" ? state.captureMM : state.captureResto;
    const aum_ars = f.fullAum_ars * capturePct;
    const ingresos_ars = aum_ars * f.fee_pct;
    return { name: f.name, aum_ars, fee_pct: f.fee_pct, capturePct, ingresos_ars };
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
    aumTotal_ars, aumTotal_usd: aumTotal_ars / base.fx,
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

  const captureSliders = document.getElementById("sim-capture-sliders");
  captureSliders.innerHTML = `
    <div class="sim-row">
      <div class="sim-row-label">
        <span>Money Market $</span>
        <span class="sim-row-value" id="sim-capture-mm-value">${(simState.captureMM * 100).toFixed(0)}%</span>
      </div>
      <input type="range" class="sim-slider" id="sim-capture-mm" min="0" max="100" step="1" value="${(simState.captureMM * 100).toFixed(0)}">
    </div>
    <div class="sim-row">
      <div class="sim-row-label">
        <span>Resto de los fondos (RF $, RF USD, RV $)</span>
        <span class="sim-row-value" id="sim-capture-resto-value">${(simState.captureResto * 100).toFixed(0)}%</span>
      </div>
      <input type="range" class="sim-slider" id="sim-capture-resto" min="0" max="100" step="1" value="${(simState.captureResto * 100).toFixed(0)}">
    </div>
  `;

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

  document.getElementById("sim-capture-mm").addEventListener("input", (e) => {
    simState.captureMM = parseFloat(e.target.value) / 100;
    document.getElementById("sim-capture-mm-value").textContent = `${e.target.value}%`;
    simRenderResults();
  });
  document.getElementById("sim-capture-resto").addEventListener("input", (e) => {
    simState.captureResto = parseFloat(e.target.value) / 100;
    document.getElementById("sim-capture-resto-value").textContent = `${e.target.value}%`;
    simRenderResults();
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
      <p class="hero-stat-label">AUM total captado</p>
      <div class="hero-stat-value">${fmtUSD(r.aumTotal_usd)}</div>
      <p class="hero-stat-sub">${fmtARS(r.aumTotal_ars)}</p>
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

  // El break-even es el AUM al que el resultado neto pasa de negativo a positivo: por
  // construcción (resultado = feeNetoEfectivo · (aumTotal − breakEven)), el signo del
  // resultado SIEMPRE coincide con si el AUM captado está arriba o abajo de este número. Por
  // eso la comparación relevante es AUM captado vs. break-even (no break-even vs. break-even
  // del modelo base) — el break-even en sí varía poco entre escenarios porque depende de la
  // mezcla de fees entre fondos, no del nivel de AUM: subir o bajar la captación mueve el AUM
  // captado, no el umbral.
  let gapNote;
  if (r.breakEven_usd === null) {
    gapNote = `Con estos supuestos el fee neto no cubre costos fijos: no existe un AUM de equilibrio.`;
  } else {
    const gap_usd = r.aumTotal_usd - r.breakEven_usd;
    const gapPct = Math.abs(gap_usd / r.breakEven_usd * 100);
    gapNote = gap_usd >= 0
      ? `El AUM captado (${fmtUSD(r.aumTotal_usd)}) está <strong class="pos-text">${gapPct.toFixed(1)}% por encima</strong> del AUM de equilibrio (${fmtUSD(r.breakEven_usd)}) → resultado neto positivo.`
      : `El AUM captado (${fmtUSD(r.aumTotal_usd)}) está <strong class="neg-text">${gapPct.toFixed(1)}% por debajo</strong> del AUM de equilibrio (${fmtUSD(r.breakEven_usd)}) → resultado neto negativo.`;
  }
  document.getElementById("sim-vs-base").innerHTML =
    `${gapNote}<br>El fee de cada fondo queda fijo (el de "Fondos &amp; supuestos"); lo que cambia acá es cuánto capta la Sociedad Gerente del AUM potencial de cada grupo de fondos, y el resultado es <em>antes</em> de Impuesto a las Ganancias — por eso los ingresos y el resultado neto de este simulador no coinciden exactamente con Financials, aunque el AUM y el break-even sí son comparables.`;

  const table = document.getElementById("sim-fund-table");
  const rows = r.fundsResult.map(f => `
    <tr>
      <td>${f.name}</td>
      <td class="num">${(f.capturePct * 100).toFixed(0)}%</td>
      <td class="num">${fmtUSD(f.aum_ars / base.fx)}</td>
      <td class="num">${(f.fee_pct * 100).toFixed(2)}%</td>
      <td class="num">${fmtUSD(f.ingresos_ars / base.fx)}</td>
    </tr>
  `).join("");
  table.innerHTML = `
    <thead><tr><th>Fondo</th><th class="num">Captación</th><th class="num">AUM captado</th><th class="num">Fee</th><th class="num">Ingresos anuales</th></tr></thead>
    <tbody>${rows}
      <tr class="total-row"><td>Total</td><td></td><td class="num">${fmtUSD(r.aumTotal_usd)}</td><td></td><td class="num">${fmtUSD(r.ingresosTotal_usd)}</td></tr>
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
