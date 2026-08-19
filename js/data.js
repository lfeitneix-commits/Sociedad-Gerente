/*
 * Datos del modelo financiero "Sociedad Gerente" (Neix).
 * Fuente: Google Sheet "Análisis SG" (escenario de captación 30% AUM Money Market / 80% resto).
 * Cada valor trae `source: "sheet"` (celda directa del modelo) o `source: "derived"`
 * (calculado a partir de celdas del modelo; el campo `calc` explica cómo).
 * Todas las cifras están en pesos (ARS) y dólares (USD) según corresponda.
 */

const MODEL = {
  meta: {
    scenario: "Captación 30% del AUM (Money Market) / 80% del resto (RF $, RF USD, RV $)",
    horizon: "Julio 2026 – Diciembre 2028",
    launchNote: "El armado societario comienza en jul-2026; la Sociedad Gerente empieza a operar y facturar en enero de 2027.",
    currency_note: "Las cifras se muestran primero en USD (moneda de análisis del propio modelo: VAN y TIR están en USD) y en pesos como referencia."
  },

  kpis: {
    breakEven: {
      usd: 36391049.30,
      ars: 88995208383.86,
      source: "sheet",
      note: "AUM promedio que la Sociedad Gerente necesita gestionar para cubrir sus costos fijos y variables. Los costos variables se estiman en 0.002% del AUM."
    },
    avgMonthlyCost: {
      usd: 43839,
      ars: 89177571,
      source: "derived",
      calc: "Promedio de \"Costos totales\" mensuales durante 2027–2028 (24 meses de operación plena; excluye la rampa de arranque jul–dic 2026)."
    },
    initialInvestment: {
      usd: 36300,
      ars: 57417000,
      source: "derived",
      calc: "Suma de conceptos no recurrentes de puesta en marcha identificados en el modelo: Inscripción CNV ($1.56M), Inscripción IGJ ($0.07M), alta CAFCI ($0.91M), honorarios legales/escribanía de constitución ($24.77M) e implementación del software de gestión ($30.11M). El modelo no tiene una única celda de \"inversión inicial\"; esta cifra puede estar subestimada si escribanía y honorarios legales fueran conceptos separados y no una duplicación de la misma celda (el sheet los repite con el mismo valor)."
    },
    payback: {
      label: "Noviembre 2028",
      periodsFromLaunch: "~23 meses desde el inicio de facturación (ene-2027) / ~28 meses desde la constitución (jul-2026)",
      source: "sheet",
      note: "Texto literal del modelo: \"La inversión se recuperaría en noviembre del 2028\"."
    },
    van: { usd: 129707.78, source: "sheet" },
    tir: { pct: 0.03, source: "sheet" },
    discountRate: { pct: 0.087, source: "sheet", note: "Tasa T-Bond 10 años (4.5%) + prima de riesgo (4.2%)." },
    feeAnnualAvg: { pct: 0.018, source: "sheet" },
    employees: {
      total: 5,
      source: "derived",
      calc: "Suma de dotaciones explícitas en el modelo: Portfolio Manager (2), Back Office (2) y Comercial (1, sin cantidad aclarada — se asume 1).",
      breakdown: [
        { role: "Portfolio Manager", count: 2 },
        { role: "Back Office", count: 2 },
        { role: "Comercial", count: 1 }
      ]
    },
    providers: {
      total: 7,
      source: "derived",
      calc: "Conteo de proveedores/entidades externas nombradas en la hoja de costos. CNV e IGJ son organismos regulatorios de inscripción obligatoria, no proveedores comerciales, pero se incluyen como contrapartes externas con costo asociado.",
      list: [
        "CAFCI (Cámara Argentina de Fondos Comunes de Inversión)",
        "Estudio legal (honorarios legales de constitución)",
        "Proveedor de software de gestión",
        "Auditoría y sindicatura",
        "Calificadora de riesgo",
        "Escribanía",
        "CNV / IGJ (organismos de contralor)"
      ]
    },
    salesChannel: {
      label: "Red de productores/colocadores + equipo comercial propio",
      source: "derived",
      calc: "El modelo no define un \"canal de venta\" explícito. Solo se encontró una nota parcial: \"los productores manejan un %X del AUM en FCI de Neix\" y \"se asume que la Sociedad Gerente se llevará el 58% de ese fee\", además de un puesto de \"Sueldo Comercial\" en la dotación. Se interpreta como un modelo mixto: distribución a través de productores/colocadores externos (que ceden 58% del fee) más un equipo comercial interno. Dato incompleto en la fuente."
    }
  },

  // Resultado anual (USD y ARS). Ingresos y Costos son "Ingresos/Costos totales SG";
  // Resultado = Resultado Neto SG (después de Impuesto a las Ganancias).
  years: [
    {
      year: 2026,
      label: "Año 1",
      months: "jul–dic (sin facturación; solo costos de arranque)",
      revenue_usd: 0, revenue_ars: 0,
      cost_usd: 179430.20, cost_ars: 289568144.88,
      result_usd: -134572.65, result_ars: -217176108.67,
      source: "derived", calc: "Suma de meses sep–dic 2026 (jul y ago no tienen datos en el modelo)."
    },
    {
      year: 2027,
      label: "Año 2",
      months: "ene–dic (primer año de operación)",
      revenue_usd: 485444.77, revenue_ars: 915425948.78,
      cost_usd: 548231.02, cost_ars: 1014684517.25,
      result_usd: -49872.08, result_ars: -79857971.69,
      source: "derived", calc: "Suma de los 12 meses de 2027."
    },
    {
      year: 2028,
      label: "Año 3",
      months: "ene–dic",
      revenue_usd: 1073289.52, revenue_ars: 2428021145.33,
      cost_usd: 503903.15, cost_ars: 1125577177.93,
      result_usd: 369641.82, result_ars: 845647072.16,
      source: "derived", calc: "Suma de los 12 meses de 2028."
    }
  ],

  // AUM total mensual en USD (AUM Total $ / tipo de cambio oficial del mes). Directo desde ene-2027
  // (antes de esa fecha el modelo no calcula "AUM Total": se asume que el fondo se implementa en enero 2027).
  aumSeries: {
    source: "derived",
    calc: "AUM Total (fila del modelo, en pesos) dividido por el tipo de cambio oficial de cada mes (también fila del modelo).",
    breakEvenUsd: 36391049.30,
    breakEvenCrossMonth: "Nov-27",
    points: [
      { m: "Ene-27", usd: 20131688 },
      { m: "Feb-27", usd: 21378414 },
      { m: "Mar-27", usd: 22702848 },
      { m: "Abr-27", usd: 24109823 },
      { m: "May-27", usd: 25604472 },
      { m: "Jun-27", usd: 27192544 },
      { m: "Jul-27", usd: 28879720 },
      { m: "Ago-27", usd: 30672179 },
      { m: "Sep-27", usd: 32576659 },
      { m: "Oct-27", usd: 34599985 },
      { m: "Nov-27", usd: 36749946 },
      { m: "Dic-27", usd: 39034479 },
      { m: "Ene-28", usd: 41461819 },
      { m: "Feb-28", usd: 44041330 },
      { m: "Mar-28", usd: 46782136 },
      { m: "Abr-28", usd: 49694808 },
      { m: "May-28", usd: 52789918 },
      { m: "Jun-28", usd: 56079184 },
      { m: "Jul-28", usd: 59574835 },
      { m: "Ago-28", usd: 63289876 },
      { m: "Sep-28", usd: 67238431 },
      { m: "Oct-28", usd: 71434647 },
      { m: "Nov-28", usd: 75894771 },
      { m: "Dic-28", usd: 80635500 }
    ]
  },

  // Distribución de costos (estructura anual de referencia, en pesos, ANEXO 1 del modelo).
  // Se usa ARS porque la proporción entre conceptos no cambia según el tipo de cambio.
  costBreakdown: {
    source: "sheet",
    calc: "ANEXO 1 de la hoja \"Costos SG\": costos fijos anuales de referencia. Se muestran las 6 categorías más grandes; \"Otros\" agrupa 6 conceptos menores (aguinaldo, inscripciones CNV/IGJ, CAFCI, fiscalización, calificación de riesgo).",
    total_ars: 1278333647.46,
    items: [
      { label: "Sueldo Portfolio Manager (2)", ars: 307808904.83 },
      { label: "Cargas sociales", ars: 189602999.96 },
      { label: "Sueldo Comercial", ars: 182135446.65 },
      { label: "Mantenimiento software de gestión", ars: 150309361.65 },
      { label: "Sueldo Back Office (2)", ars: 142065648.38 },
      { label: "Bonos", ars: 132600000.00 },
      { label: "Otros (7 conceptos menores)", ars: 173811286.00 }
    ]
  },

  funds: {
    source: "sheet",
    calc: "Tabla \"Tipo de fondo\" de la hoja Supuestos. Se asume el lanzamiento de 4 fondos en enero 2027.",
    items: [
      { name: "Money Market $", aum_projected_ars: 37605451141.76, fee_annual_pct: 0.0181, return_annual_pct: 0.3004 },
      { name: "Renta Fija $", aum_projected_ars: 4780009363.52, fee_annual_pct: 0.0210, return_annual_pct: 0.4280 },
      { name: "Renta Fija USD", aum_projected_ars: 7321523514.97, fee_annual_pct: 0.0140, return_annual_pct: 0.3423 },
      { name: "Renta Variable $", aum_projected_ars: 959285181.66, fee_annual_pct: 0.0290, return_annual_pct: 0.5283 }
    ]
  },

  timeline: {
    start: { label: "Inicio", date: "Jul-2026", detail: "Constitución de la Sociedad Gerente e inicio de costos de puesta en marcha." },
    breakEven: { label: "Break-even de AUM", date: "Nov-2027", detail: "El AUM gestionado supera por primera vez el umbral de equilibrio (US$ 36.4M)." },
    payback: { label: "Payback", date: "Nov-2028", detail: "Punto en el que el resultado acumulado descontado recupera la inversión, según el modelo." }
  }
};
