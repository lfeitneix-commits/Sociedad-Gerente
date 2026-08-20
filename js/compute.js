/*
 * Deriva el objeto MODEL (todos los KPIs, series de gráficos y textos del
 * dashboard) a partir de INPUTS (js/data.js). No hay ningún total "hardcodeado"
 * acá: todo se recalcula desde los datos crudos, así que si INPUTS cambia
 * (a mano o por sincronización con el Sheet) alcanza con volver a llamar a
 * computeModel(INPUTS) para que todo el dashboard se actualice.
 */

function yearOf(monthLabel) {
  const yy = monthLabel.split("-")[1];
  return 2000 + parseInt(yy, 10);
}

function fxForMonth(inputs, label) {
  const m = inputs.months.find(m => m.label === label);
  return m ? m.fx : null;
}

function computeYears(inputs) {
  const years = {};
  inputs.months.forEach(({ label }) => {
    const y = yearOf(label);
    years[y] = years[y] || { year: y, revenue_ars: 0, revenue_usd: 0, cost_ars: 0, cost_usd: 0, result_ars: 0, result_usd: 0, monthsWithCost: 0, monthsWithRevenue: 0, monthsInYear: 0 };
    years[y].monthsInYear += 1;
    if (inputs.monthly.costos_ars[label] !== undefined) {
      years[y].cost_ars += inputs.monthly.costos_ars[label];
      years[y].cost_usd += inputs.monthly.costos_usd[label] || 0;
      years[y].result_ars += inputs.monthly.resultado_neto_ars[label] || 0;
      years[y].result_usd += inputs.monthly.resultado_neto_usd[label] || 0;
      years[y].monthsWithCost += 1;
    }
    if (inputs.monthly.ingresos_ars[label] !== undefined) {
      years[y].revenue_ars += inputs.monthly.ingresos_ars[label];
      years[y].revenue_usd += inputs.monthly.ingresos_usd[label] || 0;
      years[y].monthsWithRevenue += 1;
    }
  });

  const sortedYears = Object.values(years).sort((a, b) => a.year - b.year);
  return sortedYears.map((y, i) => ({
    ...y,
    label: `Año ${i + 1}`,
    months: y.monthsWithCost < y.monthsInYear
      ? `${y.monthsWithCost} de ${y.monthsInYear} meses con datos en el modelo`
      : "año calendario completo"
  }));
}

// Detalle mensual completo (Financials tab): un renglón por cada mes que tenga al
// menos un dato en el modelo, con AUM/Ingresos/Costos/Resultado en USD.
function computeMonthlyTable(inputs) {
  return inputs.months
    .filter(m => inputs.monthly.costos_usd[m.label] !== undefined || inputs.monthly.ingresos_usd[m.label] !== undefined)
    .map(m => ({
      m: monthLabelToEs(m.label),
      fx: m.fx,
      aum_usd: inputs.monthly.aum_total_ars[m.label] !== undefined ? inputs.monthly.aum_total_ars[m.label] / m.fx : null,
      ingresos_usd: inputs.monthly.ingresos_usd[m.label] ?? null,
      costos_usd: inputs.monthly.costos_usd[m.label] ?? null,
      resultado_usd: inputs.monthly.resultado_neto_usd[m.label] ?? null
    }));
}

function computeAumSeries(inputs) {
  const points = inputs.months
    .filter(m => inputs.monthly.aum_total_ars[m.label] !== undefined)
    .map(m => ({ m: monthLabelToEs(m.label), usd: inputs.monthly.aum_total_ars[m.label] / m.fx }));

  const breakEvenUsd = inputs.breakEven.usd;
  const crossPoint = points.find(p => p.usd >= breakEvenUsd);

  return {
    breakEvenUsd,
    breakEvenCrossMonth: crossPoint ? crossPoint.m : null,
    points
  };
}

function computeCostBreakdown(inputs) {
  const allItems = [...inputs.costBreakdownItems].sort((a, b) => b.ars - a.ars);
  const total_ars = allItems.reduce((sum, i) => sum + i.ars, 0);
  return { total_ars, allItems };
}

function computeAvgMonthlyCost(inputs) {
  // Promedio sobre los meses de operación plena (excluye el año de arranque, sin
  // facturación, para que el promedio refleje el "costo de régimen" del negocio).
  const startupYear = Math.min(...inputs.months.map(m => yearOf(m.label)));
  const entries = Object.entries(inputs.monthly.costos_ars).filter(([label]) => yearOf(label) !== startupYear);
  const usdEntries = Object.entries(inputs.monthly.costos_usd).filter(([label]) => yearOf(label) !== startupYear);
  const ars = entries.reduce((s, [, v]) => s + v, 0) / entries.length;
  const usd = usdEntries.reduce((s, [, v]) => s + v, 0) / usdEntries.length;
  return {
    ars, usd,
    calc: `Promedio de "Costos totales" mensuales excluyendo ${startupYear} (año de arranque, sin facturación) — ${entries.length} meses de operación plena.`
  };
}

function computeInitialInvestment(inputs) {
  const ars = inputs.initialInvestmentItems.reduce((s, i) => s + i.ars, 0);
  // Convierte a USD con el tipo de cambio promedio de los meses de arranque (año más temprano del modelo).
  const startupYear = Math.min(...inputs.months.map(m => yearOf(m.label)));
  const startupMonths = inputs.months.filter(m => yearOf(m.label) === startupYear && inputs.monthly.costos_ars[m.label] !== undefined);
  const avgFx = startupMonths.reduce((s, m) => s + m.fx, 0) / (startupMonths.length || 1);
  const usd = ars / avgFx;
  const itemList = inputs.initialInvestmentItems.map(i => i.label).join(", ");
  return {
    ars, usd,
    calc: `Suma de conceptos no recurrentes de puesta en marcha: ${itemList}. ${inputs.initialInvestmentCaveat}`
  };
}

function computeEmployees(inputs) {
  const total = inputs.employees.reduce((s, e) => s + e.count, 0);
  return {
    total,
    breakdown: inputs.employees,
    calc: `Suma de dotaciones del modelo (${inputs.employees.map(e => `${e.count} ${e.role}`).join(", ")}). ${inputs.employeesCaveat}`
  };
}

function computeProviders(inputs) {
  return {
    total: inputs.providers.length,
    list: inputs.providers,
    calc: "Conteo de proveedores/entidades externas nombradas en la hoja de costos del modelo."
  };
}

// Payback = primer mes en que la suma acumulada de "resultado_neto_usd_descontado" (en
// orden cronológico) se vuelve >= 0. Es la misma serie con la que el modelo llega al VAN
// (la suma de todos los meses coincide con kpis.van.usd), así que este cálculo es
// consistente con el resto del modelo aunque la celda de texto del Sheet no se recalcule.
function computePayback(inputs) {
  let cum = 0;
  for (const m of inputs.months) {
    const v = inputs.monthly.resultado_neto_usd_descontado[m.label];
    if (v === undefined) continue;
    cum += v;
    if (cum >= 0) return { monthKey: m.label, cumUsd: cum };
  }
  return { monthKey: null, cumUsd: cum };
}

function computeTimeline(inputs, aumSeries, paybackKey) {
  const crossLabel = aumSeries.breakEvenCrossMonth; // ya en español, ej. "Nov-27"
  const paybackLabel = paybackKey ? monthLabelToEs(paybackKey) : null;
  const launchKey = "Jan-27";
  const startKey = "Jul-26";

  function monthsBetween(aLabel, bLabel) {
    const idxA = inputs.months.findIndex(m => m.label === aLabel);
    const idxB = inputs.months.findIndex(m => m.label === bLabel);
    if (idxA < 0 || idxB < 0) return null;
    return idxB - idxA;
  }

  let periodsFromLaunch = "";
  if (paybackKey) {
    const sinceLaunch = monthsBetween(launchKey, paybackKey);
    const sinceStart = monthsBetween(startKey, paybackKey);
    if (sinceLaunch !== null && sinceStart !== null) {
      periodsFromLaunch = `~${sinceLaunch} meses desde el inicio de facturación (ene-2027) / ~${sinceStart} meses desde la constitución (jul-2026)`;
    }
  }

  return {
    start: inputs.timeline.start,
    breakEven: {
      label: "Break-even de AUM",
      date: crossLabel ? `${crossLabel.split("-")[0]}-20${crossLabel.split("-")[1]}` : "—",
      detail: `El AUM gestionado supera por primera vez el umbral de equilibrio (${fmtUSD(aumSeries.breakEvenUsd)}).`
    },
    payback: {
      label: "Payback",
      date: paybackLabel ? `${paybackLabel.split("-")[0]}-20${paybackLabel.split("-")[1]}` : "> Dic-2028",
      detail: paybackLabel
        ? "Mes en que el flujo de caja neto descontado, acumulado desde el inicio, se vuelve positivo."
        : "El flujo de caja neto descontado, acumulado desde el inicio, no llega a cruzar cero dentro del horizonte modelado (jul-2026 a dic-2028): la inversión no se recupera en ese período."
    },
    periodsFromLaunch
  };
}

// Acumulación de categorías ante la CNV (Art. 20°, RG 1089/2025, y RG 1080/2025 — norma
// general de acumulación) al operar simultáneamente como ALyC + ACyDI + Sociedad Gerente.
// Aplican DOS reglas distintas sobre las 3 categorías:
//   Regla A (patrimonio neto mínimo total) = 100% de la categoría más exigente + 50% de cada
//   una de las otras dos.
//   Regla B (contrapartida líquida mínima) = 50% de CADA categoría, sumados entre sí
//   (incluida la más exigente).
// El capital de ALyC y ACyDI ya lo sostiene Neix hoy — no es plata nueva para este proyecto.
function computeCapitalConsolidation(inputs) {
  const reg = inputs.regulatory;
  const uvaRate = reg.uvaRate;
  const numFondos = inputs.funds.length;
  const agUva = reg.capitalMinimoPrimerFci.uva + reg.capitalAdicionalPorFondo.uva * (numFondos - 1);

  const categorias = [
    { key: "alyc", uva: reg.categorias.alyc.uva },
    { key: "acydi", uva: reg.categorias.acydi.uva },
    { key: "ag", uva: agUva }
  ];
  const largest = categorias.reduce((a, b) => (b.uva > a.uva ? b : a));

  const patrimonioMinimo_uva = categorias.reduce((sum, c) => sum + (c.key === largest.key ? c.uva : c.uva * 0.5), 0);
  const contrapartidaLiquida_uva = categorias.reduce((sum, c) => sum + c.uva * 0.5, 0);

  return {
    agUva,
    largestCategory: largest.key,
    patrimonioMinimo: { uva: patrimonioMinimo_uva, ars: patrimonioMinimo_uva * uvaRate },
    contrapartidaLiquida: { uva: contrapartidaLiquida_uva, ars: contrapartidaLiquida_uva * uvaRate }
  };
}

function computeRegulatory(inputs) {
  const reg = inputs.regulatory;
  const consolidation = computeCapitalConsolidation(inputs);
  const balance = reg.neixBalance;
  const patrimonioSurplus_ars = balance.patrimonioNetoMinimo_ars - consolidation.patrimonioMinimo.ars;
  const contrapartidaGap_ars = consolidation.contrapartidaLiquida.ars - balance.contrapartidaLiquida_ars;
  const needsReclass = contrapartidaGap_ars > 0;

  return {
    ...reg,
    capitalConsolidation: { ...reg.capitalConsolidation, ...consolidation },
    capitalGap: {
      ars: contrapartidaGap_ars,
      patrimonioSurplus_ars,
      // true si a Neix le falta contrapartida líquida elegible para cubrir el consolidado de
      // las 3 categorías (esto es un tema de composición de cartera, no de capital nuevo)
      modelUnderstatesCapital: needsReclass,
      note: needsReclass
        ? `El patrimonio neto mínimo consolidado no es un problema: Neix ya sostiene ${fmtARS(balance.patrimonioNetoMinimo_ars)}, muy por encima de los ${fmtARS(consolidation.patrimonioMinimo.ars)} exigidos entre las 3 categorías (ALyC + ACyDI + Sociedad Gerente). El único ajuste real es de contrapartida líquida: se exigen ${fmtARS(consolidation.contrapartidaLiquida.ars)} y Neix tiene ${fmtARS(balance.contrapartidaLiquida_ars)} — faltan ${fmtARS(contrapartidaGap_ars)}, que se cubren reclasificando cartera de inversiones ya existente (Neix tiene ${fmtARS(balance.carteraInversionesFinancierasCorrientes_ars)} en inversiones financieras corrientes) hacia activos elegibles (títulos públicos, ON, acciones líderes). No hace falta capital fresco.`
        : `Neix ya cumple tanto el patrimonio neto mínimo consolidado (${fmtARS(balance.patrimonioNetoMinimo_ars)} vs. ${fmtARS(consolidation.patrimonioMinimo.ars)} exigidos) como la contrapartida líquida (${fmtARS(balance.contrapartidaLiquida_ars)} vs. ${fmtARS(consolidation.contrapartidaLiquida.ars)} exigidos) para operar simultáneamente como ALyC, ACyDI y Sociedad Gerente. No requiere capital nuevo ni reclasificar cartera.`
    }
  };
}

function computeVerdict(inputs, { van, regulatory, timeline, years }) {
  // VAN positivo es el criterio primario de viabilidad (regla estándar de evaluación de
  // proyectos), aunque por el momento no se muestran el VAN ni la TIR en el dashboard.
  const financiallyViable = van.usd > 0;
  const lastYear = years[years.length - 1];
  const capitalFlag = regulatory.capitalGap.modelUnderstatesCapital;

  if (financiallyViable && !capitalFlag) {
    return {
      status: "good",
      headline: "Viable",
      detail: `El proyecto genera resultados netos positivos y recupera la inversión en ${timeline.payback.date}, terminando ${lastYear.label} con un resultado neto de ${fmtUSD(lastYear.result_usd)}.`
    };
  }
  if (financiallyViable && capitalFlag) {
    return {
      status: "warning",
      headline: "Viable, con un ajuste de cartera pendiente",
      detail: `El proyecto es financieramente viable y recupera la inversión en ${timeline.payback.date}. El patrimonio regulatorio no es un obstáculo: el único pendiente es de contrapartida líquida ante la CNV, que se resuelve reclasificando cartera existente (ver Regulatorio) y no requiere capital nuevo.`
    };
  }
  return {
    status: "critical",
    headline: "No viable en este escenario",
    detail: `Con los supuestos actuales el proyecto no recupera la inversión dentro del horizonte modelado (jul-2026 a dic-2028) y no genera valor económico neto suficiente para cubrir el costo de capital.`
  };
}

function computeModel(inputs) {
  const years = computeYears(inputs);
  const aumSeries = computeAumSeries(inputs);
  const monthlyTable = computeMonthlyTable(inputs);
  const costBreakdown = computeCostBreakdown(inputs);
  const avgMonthlyCost = computeAvgMonthlyCost(inputs);
  const initialInvestment = computeInitialInvestment(inputs);
  const employees = computeEmployees(inputs);
  const providers = computeProviders(inputs);
  const payback = computePayback(inputs);
  const timeline = computeTimeline(inputs, aumSeries, payback.monthKey);
  const regulatory = computeRegulatory(inputs);
  const verdict = computeVerdict(inputs, { van: inputs.van, regulatory, timeline, years });

  return {
    meta: inputs.meta,
    years,
    aumSeries,
    monthlyTable,
    costBreakdown,
    funds: inputs.funds,
    verdict,
    regulatory,
    initialInvestmentItems: inputs.initialInvestmentItems,
    timeline,
    kpis: {
      breakEven: inputs.breakEven,
      avgMonthlyCost,
      initialInvestment,
      payback: {
        label: timeline.payback.date,
        periodsFromLaunch: timeline.periodsFromLaunch,
        note: payback.monthKey
          ? `Calculado como el primer mes en que el flujo de caja neto descontado acumulado del modelo se vuelve positivo. ${inputs.payback.sheetNote}`
          : `El flujo de caja neto descontado acumulado nunca se vuelve positivo dentro del horizonte del modelo — termina en ${fmtUSD(payback.cumUsd)}. ${inputs.payback.sheetNote}`
      },
      van: inputs.van,
      tir: inputs.tir,
      discountRate: inputs.discountRate,
      feeAnnualAvg: inputs.feeAnnualAvg,
      employees,
      providers,
      salesChannel: { label: inputs.salesChannel.label, calc: inputs.salesChannel.note }
    }
  };
}

let MODEL = computeModel(INPUTS);
