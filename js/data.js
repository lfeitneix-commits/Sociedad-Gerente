/*
 * INPUTS: datos crudos del modelo financiero "Sociedad Gerente" (Neix).
 * Fuente: Google Sheet "Análisis SG" (escenario de captación 30% AUM Money
 * Market / 80% resto de los fondos).
 *
 * ESTE ARCHIVO ES EL QUE SE EDITA. No hay ningún KPI, ratio o total calculado
 * a mano acá: todo (resultado por año, costo mensual promedio, distribución
 * de costos, cruce del break-even, etc.) se recalcula en js/compute.js a
 * partir de estos números. Cambiá un valor acá (o presioná "Sincronizar con
 * Google Sheets" en el dashboard) y todo el dashboard se actualiza solo.
 *
 * Series mensuales: los objetos "monthly.*" están indexados por mes ("Sep-26",
 * "Ene-27", etc.). Un mes ausente en una serie significa que el modelo no
 * tiene ese dato para ese mes (ej.: no hay ingresos antes de ene-2027 porque
 * la Sociedad Gerente empieza a facturar ese mes).
 */

const INPUTS = {
  meta: {
    scenario: "Captación 30% del AUM (Money Market) / 80% del resto (RF $, RF USD, RV $)",
    horizon: "Julio 2026 – Diciembre 2028",
    launchNote: "El armado societario comienza en jul-2026; la Sociedad Gerente empieza a operar y facturar en enero de 2027.",
    sourceUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6-xExBC5V1-yZCi5VoyfkfmGTIOmyt169aoxnH6Gk3ifXKscTsi5rQROyxnY8dt1vg0zLx4YU8_MH/pubhtml",
    lastSynced: null // lo completa js/sync.js cuando la sincronización con el Sheet funciona
  },

  months: [
    { label: "Jul-26", fx: 1482.00 }, { label: "Aug-26", fx: 1513.00 }, { label: "Sep-26", fx: 1548.00 },
    { label: "Oct-26", fx: 1589.00 }, { label: "Nov-26", fx: 1621.00 }, { label: "Dec-26", fx: 1673.00 },
    { label: "Jan-27", fx: 1699.34 }, { label: "Feb-27", fx: 1726.10 }, { label: "Mar-27", fx: 1753.28 },
    { label: "Apr-27", fx: 1780.89 }, { label: "May-27", fx: 1808.94 }, { label: "Jun-27", fx: 1837.42 },
    { label: "Jul-27", fx: 1866.35 }, { label: "Aug-27", fx: 1895.74 }, { label: "Sep-27", fx: 1925.59 },
    { label: "Oct-27", fx: 1955.92 }, { label: "Nov-27", fx: 1986.72 }, { label: "Dec-27", fx: 2018.00 },
    { label: "Jan-28", fx: 2049.78 }, { label: "Feb-28", fx: 2082.05 }, { label: "Mar-28", fx: 2114.84 },
    { label: "Apr-28", fx: 2148.14 }, { label: "May-28", fx: 2181.97 }, { label: "Jun-28", fx: 2216.33 },
    { label: "Jul-28", fx: 2251.23 }, { label: "Aug-28", fx: 2286.68 }, { label: "Sep-28", fx: 2322.68 },
    { label: "Oct-28", fx: 2359.26 }, { label: "Nov-28", fx: 2396.41 }, { label: "Dec-28", fx: 2434.14 }
  ],

  // Todas las series están tomadas directo de filas del modelo (source: sheet).
  monthly: {
    costos_ars: {
      "Sep-26": 75500602.14, "Oct-26": 49882401.43, "Nov-26": 58761444.01, "Dec-26": 105423697.30,
      "Jan-27": 129624479.10, "Feb-27": 63952034.26, "Mar-27": 64585961.05, "Apr-27": 65226324.16,
      "May-27": 65873188.94, "Jun-27": 86601542.21, "Jul-27": 133486688.21, "Aug-27": 67853456.75,
      "Sep-27": 68526995.05, "Oct-27": 69207371.85, "Nov-27": 79828235.15, "Dec-27": 119918240.52,
      "Jan-28": 137590231.09, "Feb-28": 71998663.29, "Mar-28": 72714288.27, "Apr-28": 73437179.05,
      "May-28": 74167409.42, "Jun-28": 97567157.72, "Jul-28": 141950187.71, "Aug-28": 76402886.96,
      "Sep-28": 77163228.44, "Oct-28": 77931289.74, "Nov-28": 93085603.42, "Dec-28": 131569052.82
    },
    costos_usd: {
      "Sep-26": 48773.00, "Oct-26": 31392.32, "Nov-26": 36250.12, "Dec-26": 63014.76,
      "Jan-27": 76279.12, "Feb-27": 37049.94, "Mar-27": 36837.14, "Apr-27": 36625.64,
      "May-27": 36415.44, "Jun-27": 47132.13, "Jul-27": 71522.71, "Aug-27": 35792.54,
      "Sep-27": 35587.45, "Oct-27": 35383.60, "Nov-27": 40181.01, "Dec-27": 59424.30,
      "Jan-28": 67124.49, "Feb-28": 34580.59, "Mar-28": 34382.88, "Apr-28": 34186.38,
      "May-28": 33991.07, "Jun-28": 44022.01, "Jul-28": 63054.60, "Aug-28": 33412.20,
      "Sep-28": 33221.58, "Oct-28": 33032.11, "Nov-28": 38843.79, "Dec-28": 54051.45
    },
    resultado_neto_ars: {
      "Sep-26": -56625451.61, "Oct-26": -37411801.07, "Nov-26": -44071083.01, "Dec-26": -79067772.98,
      "Jan-27": -77999272.55, "Feb-27": -27222448.72, "Mar-27": -3668906.05, "Apr-27": -599931.55,
      "May-27": 2746970.65, "Jun-27": -8661782.80, "Jul-27": -39358187.64, "Aug-27": 13711217.24,
      "Sep-27": 18101327.35, "Oct-27": 22874810.85, "Nov-27": 21109279.17, "Dec-27": -891047.64,
      "Jan-28": -7061299.78, "Feb-28": 43144957.50, "Mar-28": 49840513.68, "Apr-28": 57104514.76,
      "May-28": 64983055.43, "Jun-28": 58795599.72, "Jul-28": 39692123.13, "Aug-28": 92824767.31,
      "Sep-28": 103701871.73, "Oct-28": 115486522.17, "Nov-28": 118906340.76, "Dec-28": 108228105.75
    },
    resultado_neto_usd: {
      "Sep-26": -36579.75, "Oct-26": -23544.24, "Nov-26": -27187.59, "Dec-26": -47261.07,
      "Jan-27": -45899.63, "Feb-27": -15771.04, "Mar-27": -2092.59, "Apr-27": -336.87,
      "May-27": 1518.56, "Jun-27": -4714.10, "Jul-27": -21088.28, "Aug-27": 7232.64,
      "Sep-27": 9400.38, "Oct-27": 11695.19, "Nov-27": 10625.21, "Dec-27": -441.55,
      "Jan-28": -3444.91, "Feb-28": 20722.30, "Mar-28": 23567.04, "Apr-28": 26583.22,
      "May-28": 29781.86, "Jun-28": 26528.40, "Jul-28": 17631.33, "Aug-28": 40593.76,
      "Sep-28": 44647.44, "Oct-28": 48950.35, "Nov-28": 49618.55, "Dec-28": 44462.48
    },
    ingresos_ars: {
      "Jan-27": 25625449.03, "Feb-27": 27655435.97, "Mar-27": 59694086.32, "Apr-27": 64426415.42,
      "May-27": 69535816.48, "Jun-27": 75052498.48, "Jul-27": 81009104.69, "Aug-27": 87440909.95,
      "Sep-27": 94386034.13, "Oct-27": 101885673.06, "Nov-27": 109984348.25, "Dec-27": 118730177.00,
      "Jan-28": 128175164.72, "Feb-28": 138375520.98, "Mar-28": 149392001.62, "Apr-28": 161290278.69,
      "May-28": 174141340.85, "Jun-28": 188021926.52, "Jul-28": 203014992.53, "Aug-28": 219210221.29,
      "Sep-28": 236704569.56, "Oct-28": 255602862.31, "Nov-28": 276018435.36, "Dec-28": 298073830.90
    },
    ingresos_usd: {
      "Jan-27": 15079.61, "Feb-27": 16021.89, "Mar-27": 34047.02, "Apr-27": 36176.48,
      "May-27": 38440.18, "Jun-27": 40846.66, "Jul-27": 43405.01, "Aug-27": 46124.88,
      "Sep-27": 49016.57, "Oct-27": 52091.02, "Nov-27": 55359.88, "Dec-27": 58835.57,
      "Jan-28": 62531.28, "Feb-28": 66461.06, "Mar-28": 70639.87, "Apr-28": 75083.64,
      "May-28": 79809.31, "Jun-28": 84834.93, "Jul-28": 90179.72, "Aug-28": 95864.14,
      "Sep-28": 101909.94, "Oct-28": 108340.34, "Nov-28": 115180.02, "Dec-28": 122455.27
    },
    aum_total_ars: {
      "Jan-27": 34210583200.10, "Feb-27": 36901279620.52, "Mar-27": 39804449260.15, "Apr-27": 42936942745.25,
      "May-27": 46316953279.66, "Jun-27": 49964124145.93, "Jul-27": 53899664859.60, "Aug-27": 58146476676.98,
      "Sep-27": 62729288213.90, "Oct-27": 67674801994.55, "Nov-27": 73011852816.24, "Dec-27": 78771578888.22,
      "Jan-28": 84987606780.87, "Feb-28": 91696251305.87, "Mar-28": 98936731539.94, "Apr-28": 106751404303.24,
      "May-28": 115186016511.12, "Jun-28": 124289977933.57, "Jul-28": 134116656022.48, "Aug-28": 144723694602.39,
      "Sep-28": 156173358367.81, "Oct-28": 168532905288.99, "Nov-28": 181874989200.38, "Dec-28": 196278095032.80
    }
  },

  breakEven: {
    ars: 88995208383.86,
    usd: 36391049.30,
    note: "AUM promedio que la Sociedad Gerente necesita gestionar para cubrir sus costos fijos y variables. Los costos variables se estiman en 0.002% del AUM."
  },

  // Payback: el modelo lo da como texto, no como celda numérica de meses. No se puede
  // derivar de forma confiable (el propio modelo tiene una inconsistencia entre este texto
  // y el flujo acumulado descontado), así que se deja como dato de entrada editable.
  payback: {
    label: "Noviembre 2028",
    note: "Texto literal del modelo: \"La inversión se recuperaría en noviembre del 2028\"."
  },

  van: { usd: 129707.78 },
  tir: { pct: 0.03 },
  discountRate: { pct: 0.087, note: "Tasa T-Bond 10 años (4.5%) + prima de riesgo (4.2%)." },
  feeAnnualAvg: { pct: 0.018 },

  // Conceptos no recurrentes de puesta en marcha (no hay una única celda de "inversión
  // inicial" en el modelo). Editá cualquier ítem y el total del KPI se recalcula solo.
  initialInvestmentItems: [
    { label: "Inscripción CNV", ars: 1560000.00 },
    { label: "Inscripción en IGJ", ars: 65000.00 },
    { label: "Alta CAFCI", ars: 910000.00 },
    { label: "Honorarios legales / escribanía (constitución)", ars: 24768000.00 },
    { label: "Implementación de software de gestión", ars: 30114000.00 }
  ],
  initialInvestmentCaveat: "El sheet no tiene una única celda de \"inversión inicial\"; esta cifra puede estar sobrestimada si escribanía y honorarios legales fueran la misma celda duplicada (el sheet los repite con idéntico valor).",

  employees: [
    { role: "Portfolio Manager", count: 2 },
    { role: "Back Office", count: 2 },
    { role: "Comercial", count: 1 }
  ],
  employeesCaveat: "El modelo no aclara la cantidad de personas del rol Comercial; se asume 1.",

  providers: [
    "CAFCI (Cámara Argentina de Fondos Comunes de Inversión)",
    "Estudio legal (honorarios legales de constitución)",
    "Proveedor de software de gestión",
    "Auditoría y sindicatura",
    "Calificadora de riesgo",
    "Escribanía",
    "CNV / IGJ (organismos de contralor)"
  ],

  salesChannel: {
    label: "Red de productores/colocadores + equipo comercial propio",
    note: "El modelo no define un \"canal de venta\" explícito. Solo hay una nota parcial: \"los productores manejan un %X del AUM en FCI de Neix\" y \"se asume que la Sociedad Gerente se llevará el 58% de ese fee\", además de un puesto de \"Sueldo Comercial\" en la dotación. Se interpreta como un modelo mixto. Dato incompleto en la fuente."
  },

  // Distribución de costos: estructura anual de referencia (ANEXO 1 de la hoja "Costos SG"),
  // en pesos. Editá cualquier "ars" y el total y los porcentajes se recalculan solos.
  costBreakdownItems: [
    { label: "Sueldo Portfolio Manager (2)", ars: 307808904.83 },
    { label: "Cargas sociales", ars: 189602999.96 },
    { label: "Sueldo Comercial", ars: 182135446.65 },
    { label: "Mantenimiento software de gestión", ars: 150309361.65 },
    { label: "Sueldo Back Office (2)", ars: 142065648.38 },
    { label: "Bonos", ars: 132600000.00 },
    { label: "Aguinaldo", ars: 54000437.38 },
    { label: "Otros costos regulatorios (CNV, IGJ, CAFCI alta, fiscalización, escribanía)", ars: 43057315.78 },
    { label: "Implementación software de gestión", ars: 30114000.00 },
    { label: "Honorarios legales", ars: 24768000.00 },
    { label: "Calificación de riesgo", ars: 17065978.57 },
    { label: "CAFCI (mensual)", ars: 4805554.26 }
  ],
  costBreakdownTopN: 6, // cuántas categorías se muestran individualmente; el resto va a "Otros"

  funds: [
    { name: "Money Market $", aum_projected_ars: 37605451141.76, fee_annual_pct: 0.0181, return_annual_pct: 0.3004 },
    { name: "Renta Fija $", aum_projected_ars: 4780009363.52, fee_annual_pct: 0.0210, return_annual_pct: 0.4280 },
    { name: "Renta Fija USD", aum_projected_ars: 7321523514.97, fee_annual_pct: 0.0140, return_annual_pct: 0.3423 },
    { name: "Renta Variable $", aum_projected_ars: 959285181.66, fee_annual_pct: 0.0290, return_annual_pct: 0.5283 }
  ],

  timeline: {
    start: { label: "Inicio", date: "Jul-2026", detail: "Constitución de la Sociedad Gerente e inicio de costos de puesta en marcha." }
    // el hito de break-even y el label de fecha se calculan en compute.js a partir de aum_total_ars vs. breakEven.usd
  }
};
