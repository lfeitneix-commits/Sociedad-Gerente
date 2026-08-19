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
  const items = [...inputs.costBreakdownItems].sort((a, b) => b.ars - a.ars);
  const total_ars = items.reduce((sum, i) => sum + i.ars, 0);
  const topN = inputs.costBreakdownTopN ?? items.length;
  const top = items.slice(0, topN);
  const rest = items.slice(topN);
  const restSum = rest.reduce((sum, i) => sum + i.ars, 0);

  const finalItems = [...top];
  if (rest.length > 0) {
    finalItems.push({ label: `Otros (${rest.length} conceptos menores)`, ars: restSum });
  }
  return { total_ars, items: finalItems, allItems: items };
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
      date: paybackLabel ? `${paybackLabel.split("-")[0]}-20${paybackLabel.split("-")[1]}` : inputs.payback.sheetLabel,
      detail: "Mes en que el flujo de caja neto descontado, acumulado desde el inicio, se vuelve positivo (mismo cálculo que llega al VAN)."
    },
    periodsFromLaunch
  };
}

function computeRegulatory(inputs, initialInvestment) {
  const reg = inputs.regulatory;
  const capitalGapUsd = reg.capitalMinimoPrimerFci.usd - initialInvestment.usd;
  return {
    ...reg,
    capitalGap: {
      usd: capitalGapUsd,
      // true si el capital mínimo regulatorio (CNV) supera la inversión inicial estimada en el modelo financiero
      modelUnderstatesCapital: capitalGapUsd > 0,
      note: `El capital mínimo regulatorio (CNV, ${fmtUSD(reg.capitalMinimoPrimerFci.usd)}) es ${capitalGapUsd > 0 ? `${fmtUSD(capitalGapUsd)} mayor` : `${fmtUSD(-capitalGapUsd)} menor`} que la inversión inicial estimada en el modelo financiero (${fmtUSD(initialInvestment.usd)}). El modelo financiero cubre costos de puesta en marcha (inscripciones, legal, software) pero no incluye el patrimonio neto mínimo que exige la CNV para operar el primer fondo.`
    }
  };
}

function computeModel(inputs) {
  const years = computeYears(inputs);
  const aumSeries = computeAumSeries(inputs);
  const costBreakdown = computeCostBreakdown(inputs);
  const avgMonthlyCost = computeAvgMonthlyCost(inputs);
  const initialInvestment = computeInitialInvestment(inputs);
  const employees = computeEmployees(inputs);
  const providers = computeProviders(inputs);
  const payback = computePayback(inputs);
  const timeline = computeTimeline(inputs, aumSeries, payback.monthKey);
  const regulatory = computeRegulatory(inputs, initialInvestment);

  return {
    meta: inputs.meta,
    years,
    aumSeries,
    costBreakdown,
    funds: inputs.funds,
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
        note: `Calculado como el primer mes en que el flujo de caja neto descontado acumulado del modelo se vuelve positivo (la suma total de esa serie coincide con el VAN: ${fmtUSD(inputs.van.usd)}). ${inputs.payback.sheetNote}`
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
