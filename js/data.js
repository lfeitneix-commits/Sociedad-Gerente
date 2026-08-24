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
      "Jan-27": 92648068.87, "Feb-27": 82067599.54, "Mar-27": 106594182.85, "Apr-27": 110678267.85,
      "May-27": 115039588.28, "Jun-27": 138739400.50, "Jul-27": 150030903.82, "Aug-27": 130008707.85,
      "Sep-27": 135709641.50, "Oct-27": 141812575.12, "Nov-27": 158282232.92, "Dec-27": 203581142.33,
      "Jan-28": 188207306.74, "Feb-28": 170905246.55, "Mar-28": 179537503.42, "Apr-28": 188799615.45,
      "May-28": 198740720.94, "Jun-28": 230907576.07, "Jul-28": 246226209.27, "Aug-28": 233189566.04,
      "Sep-28": 246420559.78, "Oct-28": 260641117.21, "Nov-28": 290307323.06, "Dec-28": 343204391.59
    },
    costos_usd: {
      "Sep-26": 25927.68, "Oct-26": 8758.12, "Nov-26": 13707.73, "Dec-26": 35106.08,
      "Jan-27": 54519.89, "Feb-27": 47545.01, "Mar-27": 60796.88, "Apr-27": 62147.64,
      "May-27": 63595.18, "Jun-27": 75507.70, "Jul-27": 80387.17, "Aug-27": 68579.30,
      "Sep-27": 70476.75, "Oct-27": 72504.41, "Nov-27": 79670.30, "Dec-27": 100882.63,
      "Jan-28": 91818.43, "Feb-28": 82084.92, "Mar-28": 84894.14, "Apr-28": 87889.74,
      "May-28": 91083.25, "Jun-28": 104184.81, "Jul-28": 109374.25, "Aug-28": 101977.53,
      "Sep-28": 106093.03, "Oct-28": 110475.87, "Nov-28": 121142.64, "Dec-28": 140995.89
    },
    resultado_neto_ars: {
      "Sep-26": -30102034.23, "Oct-26": -10437485.60, "Nov-26": -16665178.49, "Dec-26": -44049351.44,
      "Jan-27": -35930822.62, "Feb-27": -25387239.63, "Mar-27": -1995146.77, "Apr-27": 1004382.00,
      "May-27": 3984805.41, "Jun-27": -6458790.71, "Jul-27": -7330123.32, "Aug-27": 14819195.14,
      "Sep-27": 19071477.12, "Oct-27": 23687155.71, "Nov-27": 21741600.30, "Dec-27": 391844.39,
      "Jan-28": 22269917.91, "Feb-28": 43082642.22, "Mar-28": 49503039.31, "Apr-28": 56457143.90,
      "May-28": 63987308.97, "Jun-28": 58168319.83, "Jul-28": 64484787.46, "Aug-28": 90509685.76,
      "Sep-28": 100838915.39, "Oct-28": 112012015.07, "Nov-28": 114749955.82, "Dec-28": 104119098.92
    },
    resultado_neto_usd: {
      "Sep-26": -19445.76, "Oct-26": -6568.59, "Nov-26": -10280.80, "Dec-26": -26329.56,
      "Jan-27": -21143.93, "Feb-27": -14707.83, "Mar-27": -1137.95, "Apr-27": 563.98,
      "May-27": 2202.85, "Jun-27": -3515.14, "Jul-27": -3927.51, "Aug-27": 7817.09,
      "Sep-27": 9904.20, "Oct-27": 12110.52, "Nov-27": 10943.49, "Dec-27": 194.17,
      "Jan-28": 10864.56, "Feb-28": 20692.37, "Mar-28": 23407.47, "Apr-28": 26281.85,
      "May-28": 29325.51, "Jun-28": 26245.37, "Jul-28": 28644.29, "Aug-28": 39581.33,
      "Sep-28": 43414.83, "Oct-28": 47477.64, "Nov-28": 47884.13, "Dec-28": 42774.41
    },
    // "Rdo Neto SG USD descontado": flujo mensual ya descontado a la tasa de VAN (fila del modelo).
    // Se usa para derivar el mes de recupero de la inversión: el primer mes en que la suma acumulada
    // de esta serie se vuelve positiva. Su suma total (Sep-26 a Dic-28) coincide con el VAN del
    // modelo — es la forma en que el propio Sheet calcula el VAN, así que reusarla para el recupero
    // es consistente con el resto del modelo (ver compute.js → computePayback).
    resultado_neto_usd_descontado: {
      "Sep-26": -19305.79, "Oct-26": -6474.37, "Nov-26": -10060.40, "Dec-26": -25579.64,
      "Jan-27": -20393.86, "Feb-27": -14083.97, "Mar-27": -1081.84, "Apr-27": 532.31,
      "May-27": 2064.18, "Jun-27": -3270.17, "Jul-27": -3627.50, "Aug-27": 7168.00,
      "Sep-27": 9016.44, "Oct-27": 10945.63, "Nov-27": 9819.66, "Dec-27": 172.98,
      "Jan-28": 9609.00, "Feb-28": 18169.35, "Mar-28": 20405.45, "Apr-28": 22746.29,
      "May-28": 25197.81, "Jun-28": 22388.90, "Jul-28": 24259.44, "Aug-28": 33280.96,
      "Sep-28": 36241.50, "Oct-28": 39347.75, "Nov-28": 39398.99, "Dec-28": 34941.40
    },
    ingresos_ars: {
      "Jan-27": 44740305.37, "Feb-27": 48217946.71, "Mar-27": 103933987.16, "Apr-27": 112017443.84,
      "May-27": 120732167.44, "Jun-27": 130127679.55, "Jul-27": 140257406.07, "Aug-27": 151178986.63,
      "Sep-27": 162954608.82, "Oct-27": 175651368.99, "Nov-27": 189341661.92, "Dec-27": 204103601.51,
      "Jan-28": 220021475.19, "Feb-28": 237186234.58, "Mar-28": 255696025.43, "Apr-28": 275656759.91,
      "May-28": 297182734.74, "Jun-28": 320397298.88, "Jul-28": 345433574.59, "Aug-28": 372435236.44,
      "Sep-28": 401557352.69, "Oct-28": 432967294.25, "Nov-28": 466845716.62, "Dec-28": 503387620.70
    },
    ingresos_usd: {
      "Jan-27": 26327.98, "Feb-27": 27934.56, "Mar-27": 59279.61, "Apr-27": 62899.61,
      "May-27": 66742.10, "Jun-27": 70820.85, "Jul-27": 75150.49, "Aug-27": 79746.57,
      "Sep-27": 84625.61, "Oct-27": 89805.15, "Nov-27": 95303.85, "Dec-27": 101141.53,
      "Jan-28": 107339.23, "Feb-28": 113919.34, "Mar-28": 120905.63, "Apr-28": 128323.37,
      "May-28": 136199.41, "Jun-28": 144562.31, "Jul-28": 153442.38, "Aug-28": 162871.88,
      "Sep-28": 172885.08, "Oct-28": 183518.39, "Nov-28": 194810.53, "Dec-28": 206802.67
    },
    aum_total_ars: {
      "Jan-27": 59529069914.69, "Feb-27": 64134967079.22, "Mar-27": 69098364021.01, "Apr-27": 74447106698.95,
      "May-27": 80211218443.32, "Jun-27": 86423070939.69, "Jul-27": 93117568702.61, "Aug-27": 100332348108.85,
      "Sep-27": 108107992145.16, "Oct-27": 116488262117.67, "Nov-27": 125520347669.59, "Dec-27": 135255136561.53,
      "Jan-28": 145747505784.52, "Feb-28": 157056635701.79, "Mar-28": 169246349050.59, "Apr-28": 182385476781.95,
      "May-28": 196548252874.60, "Jun-28": 211814740430.14, "Jul-28": 228271291541.45, "Aug-28": 246011043626.01,
      "Sep-28": 265134455131.56, "Oct-28": 285749883754.70, "Nov-28": 307974210565.04, "Dec-28": 331933513700.03
    }
  },

  // Break-even (mes 8): cifra final del deck "Neix Asset Management — Proyección Interna,
  // Agosto 2026" (tabla "Indicadores y resultados del modelo"), reemplaza la del Sheet en vivo
  // por pedido explícito. El deck solo da el monto en pesos; el USD se deriva acá con el FX
  // oficial del mes 8 del modelo (Apr-27, 1780.89 — ver months en este archivo) ya que el deck
  // no trae un equivalente en dólares para este número puntual. Es consistente con la propia
  // timeline del deck: el AUM total cruza este umbral por primera vez en abr-2027 (mes 8).
  breakEven: {
    ars: 72656098425,
    usd: 40797634.01,
    note: "AUM promedio que la Sociedad Gerente necesita gestionar para cubrir sus costos fijos y variables. Los costos variables se estiman en 0.002% del AUM."
  },

  // Recupero de la inversión (ex "payback"): se calcula en compute.js como el primer mes en que
  // la suma acumulada de resultado_neto_usd_descontado se vuelve >= 0 — bajo este escenario esa
  // suma coincide con el VAN. La celda de texto del propio Sheet ("Payback descontado en meses")
  // está en blanco en este escenario, así que no hay un texto literal que citar acá.
  payback: {
    sheetLabel: null,
    sheetNote: ""
  },

  van: { usd: 261828.50 },
  tir: { pct: 0.08 },
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
    { label: "Comisiones a productores (81% del AUM, 53% del fee)", ars: 679692300.51, variable: true },
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

  // return_monthly_pct = devengamiento de cartera (rendimiento del fondo) por mes.
  // newMoney_monthly_pct = crecimiento por captación de dinero nuevo por mes (mismo supuesto,
  // 5.00%, para los 4 fondos). La suma de ambos es la "Tasa de crecimiento mensual" del AUM
  // proyectado (hoja "Supuestos").
  // aumEndOfYear_ars = AUM de este fondo a Dic-27 (Año 2) y Dic-28 (Año 3), tomado de la serie
  // mensual de AUM por fondo de la hoja "Resultado económico" (misma fuente que aum_total_ars).
  // La suma de los 4 fondos en cada año coincide exactamente con aum_total_ars de ese mes.
  funds: [
    { name: "Money Market $", aum_projected_ars: 37605451141.76, fee_annual_pct: 0.0181, return_annual_pct: 0.3004, return_monthly_pct: 0.0250, newMoney_monthly_pct: 0.0500, aumEndOfYear_ars: { "2027": 90057868189.23, "2028": 214577820004.66 } },
    { name: "Renta Fija $", aum_projected_ars: 4780009363.52, fee_annual_pct: 0.0210, return_annual_pct: 0.4280, return_monthly_pct: 0.0357, newMoney_monthly_pct: 0.0500, aumEndOfYear_ars: { "2027": 17398500587.60, "2028": 46651957176.46 } },
    { name: "Renta Fija USD", aum_projected_ars: 7321523514.97, fee_annual_pct: 0.0140, return_annual_pct: 0.3423, return_monthly_pct: 0.0285, newMoney_monthly_pct: 0.0500, aumEndOfYear_ars: { "2027": 23820871705.46, "2028": 59009270686.56 } },
    { name: "Renta Variable $", aum_projected_ars: 959285181.66, fee_annual_pct: 0.0290, return_annual_pct: 0.5283, return_monthly_pct: 0.0440, newMoney_monthly_pct: 0.0500, aumEndOfYear_ars: { "2027": 3977896079.25, "2028": 11694465832.36 } }
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

    ventajas: [
      "Mayor control sobre los fondos: gestión operativa y comercial totalmente propia",
      "Participación plena en los ingresos generados por el management fee",
      "Escalabilidad: al sumar fondos y crecer el AUM, los costos fijos se diluyen y mejora la rentabilidad",
      "Flexibilidad para innovar con estructuras de fondos propios",
      "Sin dependencia de terceros para aprobar o modificar fondos — time to market más ágil",
      "Aporte reputacional e institucional para Neix como ALyC",
      "Eficiencia de costos al aprovechar recursos humanos, tecnológicos y físicos ya existentes en Neix",
      "El patrimonio neto mínimo consolidado (ALyC + ACyDI + Sociedad Gerente) ya está cubierto de sobra con el balance actual de Neix — no requiere capital fresco"
    ],
    desventajas: [
      "Proceso de constitución más lento y más complejo",
      "Mayor exposición al riesgo — costos iniciales significativos",
      "Carga regulatoria y administrativa elevada",
      "Necesidad de desarrollar una estructura operativa y física específica",
      "Restricción para operar los FCI propios con la mesa de Neix"
    ]
  }
};
