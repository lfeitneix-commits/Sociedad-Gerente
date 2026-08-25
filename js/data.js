/*
 * INPUTS: datos crudos del modelo financiero "Sociedad Gerente" (Neix).
 * Fuente: planilla "Análisis SG" (escenario de captación 70% AUM Money
 * Market / 90% resto de los fondos).
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
    scenario: "Captación 70% del AUM (Money Market) / 90% del resto (RF $, RF USD, RV $)",
    horizon: "Septiembre 2026 – Diciembre 2028",
    launchNote: "El armado societario comienza en sep-2026; la Sociedad Gerente empieza a operar y facturar en enero de 2027.",
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
      "Sep-26": 40136045.64, "Oct-26": 13916647.47, "Nov-26": 22220237.99, "Dec-26": 58732468.59,
      "Jan-27": 90125077.82, "Feb-27": 78931450.45, "Mar-27": 98956141.61, "Apr-27": 101521818.50,
      "May-27": 104197661.80, "Jun-27": 126029259.40, "Jul-27": 135684306.90, "Aug-27": 113857278.10,
      "Sep-27": 117569236.40, "Oct-27": 121481881.40, "Nov-27": 135541239.50, "Dec-27": 178189481.40,
      "Jan-28": 160524751.50, "Feb-28": 140729782.50, "Mar-28": 146649569.70, "Apr-28": 152960595.40,
      "May-28": 159691304.40, "Jun-28": 188365981.20, "Jul-28": 200836302.50, "Aug-28": 184767162.70,
      "Sep-28": 194770217.10, "Oct-28": 205555514.50, "Nov-28": 231566614.50, "Dec-28": 280575532.60
    },
    costos_usd: {
      "Sep-26": 25927.68, "Oct-26": 8758.12, "Nov-26": 13707.73, "Dec-26": 35106.08,
      "Jan-27": 53035.21, "Feb-27": 45728.11, "Mar-27": 56440.46, "Apr-27": 57006.15,
      "May-27": 57601.64, "Jun-27": 68590.32, "Jul-27": 72700.20, "Aug-27": 60059.45,
      "Sep-27": 61056.07, "Oct-27": 62109.96, "Nov-27": 68223.77, "Dec-27": 88300.04,
      "Jan-28": 78313.28, "Feb-28": 67591.80, "Mar-28": 69343.11, "Apr-28": 71206.01,
      "May-28": 73186.83, "Jun-28": 84990.17, "Jul-28": 89211.95, "Aug-28": 80801.63,
      "Sep-28": 83855.68, "Oct-28": 87127.17, "Nov-28": 96630.67, "Dec-28": 115266.58
    },
    resultado_neto_ars: {
      "Sep-26": -30102034.23, "Oct-26": -10437485.60, "Nov-26": -16665178.49, "Dec-26": -44049351.44,
      "Jan-27": -38446320.51, "Feb-27": -28514074.51, "Mar-27": -9610503.40, "Apr-27": -8124873.17,
      "May-27": -6540292.11, "Jun-27": -19131183.30, "Jul-27": -21634111.55, "Aug-27": -225751.69,
      "Sep-27": 2347196.53, "Oct-27": 4768197.30, "Nov-27": 621117.95, "Dec-27": -24924404.54,
      "Jan-28": -3739713.11, "Feb-28": 18316570.21, "Mar-28": 22706724.45, "Apr-28": 27449593.24,
      "May-28": 32571530.79, "Jun-28": 23055240.82, "Jul-28": 27207061.51, "Aug-28": 48668240.04,
      "Sep-28": 56208230.87, "Oct-28": 64412947.39, "Nov-28": 63992537.81, "Dec-28": 50001958.51
    },
    resultado_neto_usd: {
      "Sep-26": -19445.76, "Oct-26": -6568.59, "Nov-26": -10280.80, "Dec-26": -26329.56,
      "Jan-27": -22624.21, "Feb-27": -16519.33, "Mar-27": -5481.43, "Apr-27": -4562.25,
      "May-27": -3615.55, "Jun-27": -10411.98, "Jul-27": -11591.65, "Aug-27": -119.08,
      "Sep-27": 1218.95, "Oct-27": 2437.83, "Nov-27": 312.64, "Dec-27": -12351.04,
      "Jan-28": -1824.45, "Feb-28": 8797.36, "Mar-28": 10736.85, "Apr-28": 12778.30,
      "May-28": 14927.59, "Jun-28": 10402.46, "Jul-28": 12085.44, "Aug-28": 21283.40,
      "Sep-28": 24199.69, "Oct-28": 27302.20, "Nov-28": 26703.51, "Dec-28": 20541.90
    },
    // "Rdo Neto SG USD descontado": flujo mensual ya descontado a la tasa de VAN (fila del modelo).
    // Se usa para derivar el mes de recupero de la inversión: el primer mes en que la suma acumulada
    // de esta serie se vuelve positiva. Su suma total (Sep-26 a Dic-28) coincide con el VAN del
    // modelo — es la forma en que el propio Sheet calcula el VAN, así que reusarla para el recupero
    // es consistente con el resto del modelo (ver compute.js → computePayback).
    resultado_neto_usd_descontado: {
      "Sep-26": -19305.79, "Oct-26": -6474.37, "Nov-26": -10060.40, "Dec-26": -25579.64,
      "Jan-27": -21821.62, "Feb-27": -15818.63, "Mar-27": -5211.14, "Apr-27": -4306.07,
      "May-27": -3387.96, "Jun-27": -9686.36, "Jul-27": -10706.19, "Aug-27": -109.20,
      "Sep-27": 1109.69, "Oct-27": 2203.34, "Nov-27": 280.53, "Dec-27": -11002.90,
      "Jan-28": -1613.61, "Feb-28": 7724.69, "Mar-28": 9359.85, "Apr-28": 11059.30,
      "May-28": 12826.47, "Jun-28": 8873.93, "Jul-28": 10235.41, "Aug-28": 17895.60,
      "Sep-28": 20201.24, "Oct-28": 22627.08, "Nov-28": 21971.61, "Dec-28": 16780.19
    },
    ingresos_ars: {
      "Jan-27": 38863317.15, "Feb-27": 40912684.43, "Mar-27": 86142137.08, "Apr-27": 90688654.25,
      "May-27": 95477272.34, "Jun-27": 100521015.00, "Jul-27": 106838824.80, "Aug-27": 113556275.90,
      "Sep-27": 120698831.80, "Oct-27": 128293591.80, "Nov-27": 136369396.70, "Dec-27": 144956942.00,
      "Jan-28": 155538467.30, "Feb-28": 166896311.40, "Mar-28": 179087747.50, "Apr-28": 192174300.10,
      "May-28": 206222062.70, "Jun-28": 221302039.60, "Jul-28": 239703533.20, "Aug-28": 259641378.10,
      "Sep-28": 281244418.50, "Oct-28": 304652356.60, "Nov-28": 330016672.60, "Dec-28": 357501622.60
    },
    ingresos_usd: {
      "Jan-27": 22869.60, "Feb-27": 23702.34, "Mar-27": 49131.88, "Apr-27": 50923.15,
      "May-27": 52780.91, "Jun-27": 54707.68, "Jul-27": 57244.68, "Aug-27": 59900.68,
      "Sep-27": 62681.33, "Oct-27": 65592.57, "Nov-27": 68640.62, "Dec-27": 71831.98,
      "Jan-28": 75880.68, "Feb-28": 80159.45, "Mar-28": 84681.47, "Apr-28": 89460.72,
      "May-28": 94511.96, "Jun-28": 99850.82, "Jul-28": 106476.86, "Aug-28": 113545.33,
      "Sep-28": 121085.97, "Oct-28": 129130.56, "Nov-28": 137713.00, "Dec-28": 146869.51
    },
    aum_total_ars: {
      "Jan-27": 51707050519.00, "Feb-27": 54415193269.00, "Mar-27": 57266158019.00, "Apr-27": 60267537082.00,
      "May-27": 63427330054.00, "Jun-27": 66753965891.00, "Jul-27": 70923865849.00, "Aug-27": 75355571674.00,
      "Sep-27": 80065615239.00, "Oct-27": 85071579068.00, "Nov-27": 90392163583.00, "Dec-27": 96047258702.22,
      "Jan-28": 103018492632.00, "Feb-28": 110497715199.00, "Mar-28": 118522106414.00, "Apr-28": 127131580800.00,
      "May-28": 136368989589.00, "Jun-28": 146280337959.00, "Jul-28": 158377821814.00, "Aug-28": 171478990066.00,
      "Sep-28": 185667408510.00, "Oct-28": 201033627397.00, "Nov-28": 217675767656.00, "Dec-28": 235700156530.77
    }
  },

  // Break-even: cifra final del deck "Neix Asset Management — Proyección Interna, Agosto 2026"
  // (3ra versión, tabla "Indicadores y resultados del modelo"), reemplaza la del Sheet en vivo
  // ($87.775B ARS / $46.87M USD, celda no recalculada tras el último cambio de supuestos) por
  // el mismo criterio de versiones anteriores. El deck solo da el monto en pesos.
  //
  // El cruce con la curva de AUM se calcula en compute.js (computeAumSeries) comparando en
  // PESOS mes a mes contra este umbral — no convirtiendo a USD con el FX de un solo mes de
  // referencia, que da un mes de cruce distinto porque el FX cambia mes a mes. En pesos el AUM
  // supera el umbral por primera vez en sep-2027 (ago-27: $75.36MM ARS, todavía por debajo;
  // sep-27: $80.07MM ARS, ya por encima). El USD de acá (usd) es solo de referencia, derivado
  // con el FX oficial de ese mismo mes de cruce (sep-27, 1925.59).
  breakEven: {
    ars: 75774750000,
    usd: 39351351.77,
    note: "AUM promedio que la Sociedad Gerente necesita gestionar para cubrir sus costos fijos y variables. Los costos variables se estiman en 0.002% del AUM."
  },

  // Recupero de la inversión (ex "payback"): se calcula en compute.js como el primer mes en que
  // la suma acumulada de resultado_neto_usd_descontado se vuelve >= 0 — bajo este escenario esa
  // suma coincide con el VAN. Da Nov-2028, igual al deck ("27 meses desde inicio de actividades
  // operativas / 22 meses desde inicio de ingresos — Noviembre 2028"); el propio gráfico de
  // timeline del deck no se actualizó y todavía muestra "Abril 2028" de una versión anterior.
  // La celda de texto del Sheet ("Payback descontado en meses") tampoco se recalculó (quedó en
  // 20), así que tampoco hay un texto literal del Sheet que citar acá.
  payback: {
    sheetLabel: null,
    sheetNote: ""
  },

  // VAN = suma de resultado_neto_usd_descontado (todo el horizonte). El Sheet ya no trae una
  // celda de TIR separada en esta versión — se deja sin dato (null) en vez de arrastrar el 8%
  // de una versión anterior que ya no es válido para este escenario.
  van: { usd: 18065.04 },
  tir: { pct: null },
  discountRate: { pct: 0.087, note: "Tasa T-Bond 10 años (4.5%) + prima de riesgo (4.2%)." },
  feeAnnualAvg: { pct: 0.0180274 },

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
    "Tanoira",
    "Esco",
    "ARV",
    "Fix"
  ],

  salesChannel: {
    label: "Red de productores/colocadores + equipo comercial propio",
    note: "Al 08/26 los productores manejan el 81% del AUM en FCI de Neix. Se asume que la Sociedad Gerente se llevará el 53% de ese fee (el resto queda del lado de los productores) — de ahí sale la línea \"Comisiones Productores\" de la estructura de costos. Además hay un puesto de \"Sueldo Comercial\" en la dotación para el equipo propio. Modelo mixto: red externa de productores + comercial propio."
  },

  // Split productores/SG del fee, usado también por el Simulador (js/simulator.js) para
  // recalcular la comisión a productores cuando se ajustan los fees. pctAumEnProductores: qué
  // fracción del AUM total está en manos de la red de productores (vs. comercial propio).
  // pctComisionSobreFee: qué fracción del fee generado por ese AUM se queda el productor.
  productoresSplit: {
    pctAumEnProductores: 0.81,
    pctComisionSobreFee: 0.53
  },

  // % del AUM potencial de cada tipo de fondo que la Sociedad Gerente efectivamente capta
  // (ver meta.scenario). Los aum_projected_ars de "funds" ya están calculados con estos
  // porcentajes aplicados — el Simulador (js/simulator.js) los usa para volver a un AUM
  // "100% captado" de referencia y así poder mover la captación de cada grupo de fondos.
  captureScenario: {
    moneyMarketPct: 0.70,
    restoPct: 0.90
  },

  // Contexto (Resumen): tamaño de la industria de FCI y AUM que Neix gestiona HOY, y cómo se
  // distribuye por canal y por tipo de fondo. Fuente: deck interno "Neix Asset Management —
  // Proyección Interna, Agosto 2026".
  industryContext: {
    fechaReferencia: "jul-26",
    totalIndustriaArs: 108585000000,
    bancariasArs: 64721000000,
    bancariasPct: 0.598,
    independientesArs: 43577000000,
    independientesPct: 0.402,
    periodoFlujos: "ago-25 a jul-26",
    flujoNetoIndependientesPct: 0.20,
    flujoNetoBancariasPct: 0.13,
    neixAumArs: 50666000000,
    neixMarketSharePct: 0.0012
  },
  neixAumHoy: {
    totalArs: 50666000000,
    productoresPct: 0.81,
    fuerzaPropiaPct: 0.19,
    porTipoFondo: {
      moneyMarketPct: 0.74,
      rentaFijaPesosPct: 0.09,
      rentaFijaUsdPct: 0.14,
      rentaVariablePct: 0.02
    }
  },

  // Distribución de costos: estructura anual de referencia (ANEXO 1 de la hoja "Costos SG"),
  // en pesos. Editá cualquier "ars" y el total y los porcentajes se recalculan solos. El ítem
  // marcado "variable: true" es el único que escala con los ingresos (comisión a productores) —
  // el Simulador lo recalcula en vez de tratarlo como costo fijo.
  costBreakdownItems: [
    { label: "Comisiones a productores (81% del AUM, 53% del fee)", ars: 516584822.40, variable: true },
    { label: "Sueldo Portfolio Manager (2)", ars: 233610709.40 },
    { label: "Cargas sociales", ars: 137865486.22 },
    { label: "Sueldo Comercial", ars: 126933096.25 },
    { label: "Mantenimiento software de gestión (ESCO)", ars: 139434861.65 },
    { label: "Sueldo Back Office (2)", ars: 99007815.07 },
    { label: "Auditoría, sindicatura e impuestos anuales", ars: 56961984.08 },
    { label: "Bonos", ars: 38025000.00 },
    { label: "Aguinaldo", ars: 39269595.05 },
    { label: "Calificación de riesgo (revisión anual)", ars: 9933578.57 },
    { label: "CAFCI (mensual)", ars: 4457884.64 }
  ],

  // return_monthly_pct = devengamiento de cartera (rendimiento del fondo) por mes, sin cambios.
  // newMoney_monthly_pct = captación de dinero nuevo por mes: en esta versión del Sheet ya no es
  // un valor fijo del 5%, sino que escalona en 4 semestres (ene-27 a dic-28): 2.50% / 3.50% /
  // 4.50% / 5.50%, igual para los 4 fondos. Se muestra el promedio de los 4 semestres (4.00%)
  // como aproximación de una sola cifra — el detalle por semestre no se modela en el dashboard.
  // aumEndOfYear_ars = AUM de este fondo a Dic-27 (Año 1) y Dic-28 (Año 2), tomado de la serie
  // mensual de AUM por fondo de la hoja "Resultado económico" (misma fuente que aum_total_ars).
  // La suma de los 4 fondos en cada año coincide exactamente con aum_total_ars de ese mes.
  funds: [
    { name: "Money Market $", aum_projected_ars: 37605451141.76, fee_annual_pct: 0.0181, return_annual_pct: 0.3004, return_monthly_pct: 0.0250, newMoney_monthly_pct: 0.0400, aumEndOfYear_ars: { "2027": 63899862195, "2028": 152232268656 } },
    { name: "Renta Fija $", aum_projected_ars: 4780009363.52, fee_annual_pct: 0.0210, return_annual_pct: 0.4280, return_monthly_pct: 0.0357, newMoney_monthly_pct: 0.0400, aumEndOfYear_ars: { "2027": 12386969681, "2028": 33209921654 } },
    { name: "Renta Fija USD", aum_projected_ars: 7321523514.97, fee_annual_pct: 0.0140, return_annual_pct: 0.3423, return_monthly_pct: 0.0285, newMoney_monthly_pct: 0.0400, aumEndOfYear_ars: { "2027": 16920901376, "2028": 41911199166 } },
    { name: "Renta Variable $", aum_projected_ars: 959285181.66, fee_annual_pct: 0.0290, return_annual_pct: 0.5283, return_monthly_pct: 0.0440, newMoney_monthly_pct: 0.0400, aumEndOfYear_ars: { "2027": 2839525449, "2028": 8346767054 } }
  ],

  timeline: {
    start: { label: "Inicio", date: "Sep-2026", detail: "Constitución de la Sociedad Gerente e inicio de costos de puesta en marcha." }
    // el hito de break-even y el label de fecha se calculan en compute.js a partir de aum_total_ars vs. breakEven.usd
  },

  // Marco regulatorio: fuente "Neix Sociedad Gerente — Regulaciones Completas" (guía interna),
  // basada en RG CNV N° 1089/2025 y N° 1080/2025 y en los Estados Contables Intermedios de
  // Neix S.A. al 30/06/2026 (Nota 5 y Anexo II). Es información de contexto/riesgo, no forma
  // parte del modelo financiero del Sheet — por eso vive en su propio bloque.
  regulatory: {
    referenceDate: "30/6/2026",
    capitalMinimoPrimerFci: { uva: 150000, note: "Patrimonio neto mínimo exigido para operar el primer fondo. Ajusta automáticamente con inflación vía UVA." },
    capitalAdicionalPorFondo: { uva: 20000, note: "El capital mínimo de la Sociedad Gerente se incrementa en 20.000 UVA por cada fondo adicional que se administre." },
    categoriaRegulatoria: "Agente de Administración de Productos de Inversión Colectiva de Fondos Comunes de Inversión (CNV)",

    // Valor de la UVA implícito en la Nota 5 de los Estados Contables de Neix (patrimonio
    // mínimo declarado hoy: $1.120.057.648 para 555.350 UVA = 470.350 ALyC + 170.000×50%
    // ACyDI). No es la cotización pública de la UVA — es el valor que la propia contabilidad
    // de Neix ya aplica, y el que usa esta guía para pasar UVA a pesos de forma consistente.
    uvaRate: 2016.85,

    // Neix ya opera como ALyC Propio y ACyDI de FCI; al armar la Sociedad Gerente queda
    // inscripta simultáneamente en las 3 categorías ante la CNV. El capital de ALyC y ACyDI
    // no es plata nueva: ya está sostenido y acreditado hoy.
    categorias: {
      alyc: { uva: 470350, label: "ALyC Propio" },
      acydi: { uva: 170000, label: "ACyDI de FCI" }
    },

    // Balance real de Neix al 30/06/2026 (Nota 5 y Anexo II de los Estados Contables
    // Intermedios) — usado para medir si Neix ya cumple el capital consolidado de las 3
    // categorías, en vez de estimarlo.
    neixBalance: {
      fecha: "30/06/2026",
      patrimonioNetoMinimo_ars: 13735654270,
      contrapartidaLiquida_ars: 731587158,
      carteraInversionesFinancierasCorrientes_ars: 99938000000,
      note: "Fuente: Estados Contables Intermedios Neix S.A. al 30/06/2026 (Nota 5 y Anexo II)."
    },

    // Acumulación de categorías ante la CNV (Art. 20°, RG 1089/2025, y RG 1080/2025 —norma
    // general de acumulación). Aplican DOS reglas distintas sobre las 3 categorías (ALyC,
    // ACyDI, AG/Sociedad Gerente): la Regla A (patrimonio neto mínimo total: el más alto de
    // las 3 + 50% de cada una de las otras dos) y la Regla B (contrapartida líquida mínima:
    // 50% de cada categoría, sumados entre sí, incluida la más alta).
    capitalConsolidation: {
      note: "Al constituir la Sociedad Gerente, Neix queda inscripta simultáneamente en 3 categorías ante la CNV (ALyC, ACyDI y AG/Sociedad Gerente). La RG 1080/2025 exige cumplir dos reglas distintas: el patrimonio neto mínimo total (el más alto de las 3 categorías + 50% de cada una de las otras dos) y la contrapartida líquida mínima (50% de cada categoría, sumados entre sí)."
    },

    normasConstitucion: [
      "Segregación funcional y administrativa",
      "Autonomía de la Sociedad Gerente (mesas separadas)",
      "Estructura acorde a la licencia",
      "Los FCI bajo administración propia no podrían operar con la mesa de Neix",
      "Contar con personal idóneo",
      "Estados contables con apertura de ingresos netos del ejercicio por cada unidad operativa",
      "Responsable de cumplimiento regulatorio y control interno",
      "Evitar conflictos de intereses entre los clientes de la ALyC y los cuotapartistas de los FCI que administra"
    ],

    requisitosOperativos: [
      { titulo: "Inscripción en registro CNV — documentación", detalle: "Presentar vía TAD: estatuto inscripto, nómina de autoridades, declaraciones juradas, EECC con antigüedad máxima de 5 meses examinados por auditor independiente, informe de contador que acredite organización administrativa adecuada, Código de Protección al Inversor y declaración jurada de prevención de lavado de activos.", art: "Art. 1°, RG 1089/2025" },
      { titulo: "Registro de Idóneos CNV", detalle: "Previo al inicio de actividades, todo el personal que venda, promocione o asesore a inversores sobre cuotapartes debe inscribirse en el Registro de Idóneos de la CNV.", art: "Art. 4°, RG 1089/2025" },
      { titulo: "Inscripción simultánea ALyC + Sociedad Gerente", detalle: "Como Neix ya es ALyC, al sumar el rol de Sociedad Gerente también hay que cumplir los lineamientos de los Capítulos II y VII del Título VII de las Normas CNV — el mismo título que define el patrimonio mínimo de ALyC (470.350 UVA) que ya se ve reflejado en el balance de Neix.", art: "Art. 10°, RG 1089/2025" },
      { titulo: "Manual de procedimientos de control interno", detalle: "Debe estar a disposición permanente de la CNV, incluyendo el acceso y salvaguarda de los sistemas informáticos utilizados.", art: "Art. 1°, Sección I, RG 1089/2025" },
      { titulo: "Régimen informativo — AIF", detalle: "Remitir información a través de la Autopista de la Información Financiera (Sistema CNV-CAFCI), con plazos de implementación transitorios.", art: "Art. 11°, RG 1089/2025" },
      { titulo: "Sociedad Depositaria", detalle: "La custodia de activos debe estar a cargo de una entidad financiera regida por la Ley de Entidades Financieras. Sin Sociedad Depositaria aprobada por la CNV no se pueden aceptar suscripciones.", art: "Arts. 12° y 6° inc. 5, RG 1089/2025" },
      { titulo: "Documentación definitiva post-autorización", detalle: "Tras la autorización de la CNV, hay 30 días corridos para formalizar el reglamento de gestión (escritura pública o instrumento privado) y publicarlo en la AIF. La fecha de inicio de actividades debe informarse con 5 días hábiles de anticipación vía Hechos Relevantes.", art: "Art. 5°, RG 1089/2025" }
    ],

    funciones: {
      principales: "Administración discrecional del patrimonio del FCI, representación de cuotapartistas, contabilidad del fondo, publicaciones legales, sustitución de la Sociedad Depositaria en caso de cese, y liquidación conjunta.",
      adicionales: "Asesoramiento en inversiones, gestión de órdenes, administración de carteras con mandato expreso, colocación y distribución de cuotapartes propias y de otras gerentes. Puede inscribirse simultáneamente como Agente de Negociación y/o ALyC."
    },

    // Fuente: deck "Neix Asset Management — Proyección Interna, Agosto 2026", slides "Ventajas"/
    // "Desventajas de crear Neix Asset Management".
    ventajas: [
      "Mayor control sobre los fondos: gestión operativa y comercial totalmente propia",
      "Participación plena en los ingresos generados por el management fee",
      "Escalabilidad: al sumar fondos y crecer el AUM, los costos fijos se diluyen y mejora la rentabilidad",
      "Flexibilidad para innovar con estructuras de fondos propios",
      "Sin dependencia de terceros para aprobar o modificar fondos — time to market más ágil",
      "Aporte reputacional e institucional para Neix como ALyC",
      "Eficiencia de costos al aprovechar recursos humanos, tecnológicos y físicos ya existentes en Neix",
      "Incentivo a los FAs a vender y estabilizar sus ingresos"
    ],
    desventajas: [
      "Proceso de constitución más lento y más complejo",
      "Mayor exposición al riesgo — costos iniciales significativos",
      "Carga regulatoria y administrativa elevada",
      "Necesidad de desarrollar una estructura operativa y física específica",
      "Restricción para operar los FCI propios con la mesa de Neix",
      "Inflación de costos en USD",
      "Contexto macro de empresas con menor caja y apertura de los controles de capitales",
      "Mercado con alto número de fondos comunes competidores (ALyCs, bancos y SGRs)"
    ]
  },

  // Fuente: deck "Neix Asset Management — Proyección Interna, Agosto 2026", slide final "Pasos
  // a seguir". Son los próximos hitos de decisión del proyecto, no forman parte del modelo
  // financiero — por eso viven en su propio bloque, no dentro de "regulatory".
  pasosASeguir: [
    {
      titulo: "Validación comercial con referentes",
      detalle: "Reunión con referentes comerciales (Facu, Nica, Sole, Petra, Germán y Nico) para relevar feedback real del frente de venta antes de tomar una decisión."
    },
    {
      titulo: "Definición de equipo y liderazgo, si se avanza",
      detalle: "En caso de decidir avanzar con el proyecto, conformar el equipo de trabajo y designar un líder que conduzca su implementación."
    }
  ]
};
