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
  inputs.months.forEach(({ label, fx }) => {
    const y = yearOf(label);
    years[y] = years[y] || { year: y, revenue_ars: 0, revenue_usd: 0, cost_ars: 0, cost_usd: 0, result_ars: 0, result_usd: 0, monthsWithCost: 0, monthsWithRevenue: 0, monthsInYear: 0, aum_end_ars: null, aum_end_usd: null };
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
    // AUM proyectado al último mes con dato del año (el modelo recién tiene AUM propio
    // desde el lanzamiento de los fondos en ene-2027 — Año 1/2026 queda en null).
    if (inputs.monthly.aum_total_ars[label] !== undefined) {
      years[y].aum_end_ars = inputs.monthly.aum_total_ars[label];
      years[y].aum_end_usd = inputs.monthly.aum_total_ars[label] / fx;
    }
  });

  const sortedYears = Object.values(years).sort((a, b) => a.year - b.year);
  let cumArs = 0, cumUsd = 0;
  return sortedYears.map((y, i) => {
    cumArs += y.result_ars;
    cumUsd += y.result_usd;
    return {
      ...y,
      label: `Año ${i + 1}`,
      // Resultado acumulado desde el inicio del modelo hasta fin de este año (no solo el
      // resultado de este año) — es la cifra que usa "Resultado neto por año" en el dashboard,
      // consistente con la tabla "Indicadores y resultados del modelo" del deck de Neix.
      result_ars_cum: cumArs,
      result_usd_cum: cumUsd,
      months: y.monthsWithCost < y.monthsInYear
        ? `${y.monthsWithCost} de ${y.monthsInYear} meses con datos en el modelo`
        : "año calendario completo"
    };
  });
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

// costBreakdownItems es una fotografía anual (ANEXO 1 de la hoja "Costos SG") sin FX propio.
// Para pasarla a USD de forma consistente con el resto del modelo, se identifica a qué año
// del horizonte corresponde (comparando su total contra el costo anual de cada año) y se usa
// el FX implícito de ese año (cost_ars / cost_usd) para convertir cada concepto.
function computeCostBreakdown(inputs, years) {
  const allItems = [...inputs.costBreakdownItems].sort((a, b) => b.ars - a.ars);
  const total_ars = allItems.reduce((sum, i) => sum + i.ars, 0);
  const referenceYear = years.reduce((best, y) =>
    Math.abs(y.cost_ars - total_ars) < Math.abs(best.cost_ars - total_ars) ? y : best
  );
  const fx = referenceYear.cost_ars / referenceYear.cost_usd;
  const items = allItems.map(i => ({ ...i, usd: i.ars / fx }));
  const total_usd = total_ars / fx;
  return { total_ars, total_usd, allItems: items, referenceYear: { label: referenceYear.label, year: referenceYear.year }, fx };
}

// Base para el Simulador (tab "Simulador"): separa la estructura de costos entre el único
// concepto variable (comisión a productores, que escala con los ingresos) y el resto, que se
// trata como fijo. Usa el AUM y fee proyectados de cada fondo EXACTAMENTE como figuran en
// "Fondos & supuestos" (inputs.funds, sin reescalar) — el simulador solo mueve fee% y el split
// de productores, no el AUM, y el AUM que muestra tiene que coincidir con esa pestaña.
//
// Nota: aum_projected_ars es una foto fija (no reconstruye la rampa mensual real del año de
// referencia), así que Σ(aum_fondo × fee_fondo) da un ingreso anual algo menor al ingreso real
// de ese año (ver nota en la propia pestaña Simulador) — se prioriza que el AUM mostrado sea
// consistente con el resto del dashboard antes que "cuadrar" el ingreso total.
function computeSimulatorBase(inputs, costBreakdown) {
  const variableItem = costBreakdown.allItems.find(i => i.variable);
  const fixedCosts_ars = costBreakdown.total_ars - (variableItem ? variableItem.ars : 0);
  return {
    funds: inputs.funds.map(f => ({ name: f.name, aum_ars: f.aum_projected_ars, fee_pct: f.fee_annual_pct })),
    productoresSplit: inputs.productoresSplit,
    fixedCosts_ars,
    fixedCosts_usd: fixedCosts_ars / costBreakdown.fx,
    referenceYear: costBreakdown.referenceYear,
    fx: costBreakdown.fx
  };
}

// Un único promedio mensual de costos para todo el dashboard: la misma estructura anual
// de referencia de costBreakdown (ANEXO 1 de la hoja "Costos SG"), dividida en 12 meses.
// Se reusa costBreakdown en vez de promediar la serie mensual completa para que este KPI
// (Resumen) y la fila "Promedio mensual" de la tabla de Costos siempre coincidan.
function computeAvgMonthlyCost(costBreakdown) {
  const { label, year } = costBreakdown.referenceYear;
  return {
    ars: costBreakdown.total_ars / 12,
    usd: costBreakdown.total_usd / 12,
    referenceYear: costBreakdown.referenceYear,
    calc: `Estructura anual de referencia (${label} · ${year}, ANEXO 1 "Costos SG") dividida en 12 meses.`
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
  const startKey = "Sep-26";

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
      periodsFromLaunch = `~${sinceLaunch} meses desde el inicio de facturación (ene-2027) / ~${sinceStart} meses desde la constitución (sep-2026)`;
    }
  }

  return {
    start: inputs.timeline.start,
    launch: {
      label: "Lanzamiento",
      date: "Ene-2027",
      detail: "Lanzamiento de Neix Asset Management e inicio de ingresos."
    },
    breakEven: {
      label: "Break-even de AUM",
      date: crossLabel ? `${crossLabel.split("-")[0]}-20${crossLabel.split("-")[1]}` : "—",
      detail: `El AUM gestionado supera por primera vez el umbral de equilibrio (${fmtUSD(aumSeries.breakEvenUsd)}).`
    },
    payback: {
      label: "Recupero de la inversión",
      date: paybackLabel ? `${paybackLabel.split("-")[0]}-20${paybackLabel.split("-")[1]}` : "> Dic-2028",
      detail: paybackLabel
        ? "Mes en que el flujo de caja neto descontado, acumulado desde el inicio, se vuelve positivo."
        : "El flujo de caja neto descontado, acumulado desde el inicio, no llega a cruzar cero dentro del horizonte modelado (sep-2026 a dic-2028): la inversión no se recupera en ese período."
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
      detail: `El proyecto genera resultados netos positivos y recupera la inversión en ${timeline.payback.date}, terminando ${lastYear.label} con un resultado acumulado de ${fmtUSD(lastYear.result_usd_cum)}.`
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
    detail: `Con los supuestos actuales el proyecto no recupera la inversión dentro del horizonte modelado (sep-2026 a dic-2028) y no genera valor económico neto suficiente para cubrir el costo de capital.`
  };
}

function computeModel(inputs) {
  const years = computeYears(inputs);
  const aumSeries = computeAumSeries(inputs);
  const monthlyTable = computeMonthlyTable(inputs);
  const costBreakdown = computeCostBreakdown(inputs, years);
  const avgMonthlyCost = computeAvgMonthlyCost(costBreakdown);
  const simulatorBase = computeSimulatorBase(inputs, costBreakdown);
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
    simulatorBase,
    verdict,
    regulatory,
    neixAumHoy: inputs.neixAumHoy,
    industryContext: inputs.industryContext,
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
          ? "Calculado como el primer mes en que el flujo de caja neto descontado acumulado del modelo se vuelve positivo (la suma total de esa serie coincide con el VAN)."
          : `El flujo de caja neto descontado acumulado nunca se vuelve positivo dentro del horizonte del modelo — termina en ${fmtUSD(payback.cumUsd)}.`
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
