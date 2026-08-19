/*
 * Asistente basado en reglas: responde preguntas de negocio usando EXCLUSIVAMENTE
 * los datos de MODEL (js/data.js), extraídos del Google Sheet. No hay llamada a
 * ningún servicio externo ni modelo de lenguaje: es un matcher de intenciones por
 * palabras clave sobre datos ya calculados, para poder correr 100% offline.
 */

function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s%]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pct(v, decimals = 1) { return `${(v * 100).toFixed(decimals)}%`; }

const INTENTS = [
  {
    key: "breakeven",
    keywords: ["break even", "breakeven", "equilibrio", "punto de equilibrio", "aum minimo", "aum necesario"],
    answer: (m) => `El **AUM de equilibrio (break-even)** es de ${fmtUSD(m.kpis.breakEven.usd)} (≈ ${fmtARS(m.kpis.breakEven.ars)}).\n${m.kpis.breakEven.note}\nEl modelo alcanza este nivel de AUM en ${m.timeline.breakEven.date}.`
  },
  {
    key: "payback",
    keywords: ["payback", "recuperamos la inversion", "recuperar la inversion", "cuando recuperamos", "recupero de la inversion", "cuando se recupera"],
    answer: (m) => `Según el modelo, **la inversión se recupera en ${m.kpis.payback.label}** (${m.kpis.payback.periodsFromLaunch}).\nEl AUM de equilibrio ya se había alcanzado antes, en ${m.timeline.breakEven.date}; el payback llega después porque hace falta compensar las pérdidas acumuladas de 2026 y 2027.`
  },
  {
    key: "costo_mensual",
    keywords: ["cuanto cuesta operar", "costo mensual", "costo promedio", "gasto mensual", "cuesta por mes", "cuanto sale operar"],
    answer: (m) => `El **costo mensual promedio** de operar la Sociedad Gerente es de ${fmtUSD(m.kpis.avgMonthlyCost.usd)} (≈ ${fmtARS(m.kpis.avgMonthlyCost.ars)}).\n${m.kpis.avgMonthlyCost.calc}`
  },
  {
    key: "resultado_1",
    keywords: ["resultado del ano 1", "resultado ano 1", "resultado 2026", "año 1"],
    answer: (m) => resultAnswer(m, 2026)
  },
  {
    key: "resultado_2",
    keywords: ["resultado del ano 2", "resultado ano 2", "resultado 2027", "año 2"],
    answer: (m) => resultAnswer(m, 2027)
  },
  {
    key: "resultado_3",
    keywords: ["resultado del ano 3", "resultado ano 3", "resultado 2028", "año 3"],
    answer: (m) => resultAnswer(m, 2028)
  },
  {
    key: "principal_costo",
    keywords: ["principal costo", "mayor costo", "mayor gasto", "principal gasto", "que es lo que mas cuesta", "costo mas grande"],
    answer: (m) => {
      const top = m.costBreakdown.items[0];
      const pctv = (top.ars / m.costBreakdown.total_ars) * 100;
      return `El **principal costo** es "${top.label}", con ${fmtARS(top.ars)} anuales (~${pctv.toFixed(0)}% del total). Los sueldos (Portfolio Manager, Back Office y Comercial) más cargas sociales concentran la mayor parte de la estructura de costos.`;
    }
  },
  {
    key: "sensibilidad_aum",
    keywords: ["que pasa si el aum es menor", "aum menor al proyectado", "si el aum baja", "sensibilidad", "escenario pesimista", "si no llegamos al aum"],
    answer: (m) => `El modelo no incluye una simulación explícita de escenarios alternativos de AUM. Lo que sí surge de sus propios datos: los ingresos son un % (fee) del AUM gestionado, mientras que la mayor parte de los costos (sueldos, cargas sociales, software) son fijos. Por eso, si el AUM real queda por debajo del break-even de ${fmtUSD(m.kpis.breakEven.usd)}, la Sociedad Gerente operaría con **resultado negativo estructural**, y tanto el break-even (hoy en ${m.timeline.breakEven.date}) como el payback (hoy en ${m.timeline.payback.date}) se correrían más adelante en el tiempo.`
  },
  {
    key: "inversion_inicial",
    keywords: ["inversion inicial", "cuanto hay que invertir", "capital inicial", "cuanto cuesta arrancar", "cuanto cuesta poner en marcha"],
    answer: (m) => `La **inversión inicial** estimada es de ${fmtUSD(m.kpis.initialInvestment.usd)} (≈ ${fmtARS(m.kpis.initialInvestment.ars)}).\n${m.kpis.initialInvestment.calc}`
  },
  {
    key: "empleados",
    keywords: ["empleados", "personal", "dotacion", "cuanta gente", "headcount", "gente necesaria"],
    answer: (m) => `Se estiman **${m.kpis.employees.total} empleados**: ${m.kpis.employees.breakdown.map(b => `${b.count} de ${b.role}`).join(", ")}.`
  },
  {
    key: "proveedores",
    keywords: ["proveedores", "vendors", "quien nos da servicio"],
    answer: (m) => `Se identifican **${m.kpis.providers.total} proveedores/contrapartes externas** clave:\n${m.kpis.providers.list.map(p => `• ${p}`).join("\n")}`
  },
  {
    key: "canal_venta",
    keywords: ["canal de venta", "como se vende", "distribucion", "como captamos aum", "canal comercial"],
    answer: (m) => `${m.kpis.salesChannel.label}.\n${m.kpis.salesChannel.calc}`
  },
  {
    key: "van_tir",
    keywords: ["van", "tir", "valor actual neto", "tasa interna de retorno"],
    answer: (m) => `**VAN**: ${fmtUSD(m.kpis.van.usd)}. **TIR**: ${pct(m.kpis.tir.pct)}. Tasa de descuento usada: ${pct(m.kpis.discountRate.pct)} anual (T-Bond 10 años + prima de riesgo). El modelo aclara que ambos indicadores reflejan un margen acotado porque el horizonte de proyección termina poco después del punto de recupero de la inversión.`
  },
  {
    key: "fee",
    keywords: ["fee", "comision", "cuanto cobramos", "fee promedio", "cuanto cobra la sociedad gerente"],
    answer: (m) => `El **fee anual promedio** de la Sociedad Gerente es de ${pct(m.kpis.feeAnnualAvg.pct)}. Por tipo de fondo: ${m.funds.map(f => `${f.name} ${pct(f.fee_annual_pct)}`).join(", ")}.`
  },
  {
    key: "aum_total",
    keywords: ["aum total", "cuanto aum", "cuanto gestionamos", "aum proyectado", "cuanto aum vamos a tener"],
    answer: (m) => {
      const last = m.aumSeries.points[m.aumSeries.points.length - 1];
      return `El AUM total proyectado crece de ${fmtUSD(m.aumSeries.points[0].usd)} en ${m.aumSeries.points[0].m} a ${fmtUSD(last.usd)} en ${last.m}. Supera el break-even (${fmtUSD(m.kpis.breakEven.usd)}) en ${m.timeline.breakEven.date}.`;
    }
  }
];

function resultAnswer(m, year) {
  const y = m.years.find(x => x.year === year);
  const sign = y.result_usd >= 0 ? "positivo" : "negativo";
  return `El **resultado neto del ${y.label} (${y.year})** es ${fmtUSD(y.result_usd)} (≈ ${fmtARS(y.result_ars)}) — es decir, ${sign}.\nIngresos: ${fmtUSD(y.revenue_usd)} · Costos: ${fmtUSD(y.cost_usd)}.`;
}

function answerQuestion(question) {
  const q = normalize(question);
  if (!q) return "Escribí una pregunta sobre el modelo (AUM, costos, resultados, payback, empleados, proveedores...).";

  let best = null, bestScore = 0;
  for (const intent of INTENTS) {
    const score = intent.keywords.reduce((acc, kw) => acc + (q.includes(kw) ? kw.split(" ").length : 0), 0);
    if (score > bestScore) { bestScore = score; best = intent; }
  }
  if (best) return best.answer(MODEL);

  return "No tengo esa información en el modelo. Probá preguntando, por ejemplo: \"¿Cuál es el AUM break-even?\", \"¿Cuándo recuperamos la inversión?\", \"¿Cuánto cuesta operar por mes?\", \"¿Cuál es el resultado del Año 1?\", \"¿Cuál es el principal costo?\" o \"¿Qué pasa si el AUM es menor al proyectado?\".";
}
