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
      "Sep-26": 75500602.14, "Oct-26": 49882401.43, "Nov-26": 58761444.01, "Dec-26": 105423697.30,
      "Jan-27": 148831492.19, "Feb-27": 84651998.78, "Mar-27": 109204821.74, "Apr-27": 113315412.80,
      "May-27": 117703508.42, "Jun-27": 142465355.04, "Jul-27": 193699192.63, "Aug-27": 132754595.71,
      "Sep-27": 138483408.62, "Oct-27": 144614504.56, "Nov-27": 161112610.61, "Dec-27": 207539916.64,
      "Jan-28": 232045450.39, "Feb-28": 173822713.80, "Mar-28": 182484591.99, "Apr-28": 191776626.08,
      "May-28": 201747957.44, "Jun-28": 235113718.13, "Jul-28": 290244821.29, "Aug-28": 236289333.97,
      "Sep-28": 249551799.95, "Oct-28": 263804149.16, "Nov-28": 293502469.57, "Dec-28": 347673358.39
    },
    costos_usd: {
      "Sep-26": 48773.00, "Oct-26": 31392.32, "Nov-26": 36250.12, "Dec-26": 63014.76,
      "Jan-27": 87581.72, "Feb-27": 49042.25, "Mar-27": 62285.87, "Apr-27": 63628.44,
      "May-27": 65067.83, "Jun-27": 77535.52, "Jul-27": 103784.82, "Aug-27": 70027.75,
      "Sep-27": 71917.22, "Oct-27": 73936.96, "Nov-27": 81094.95, "Dec-27": 102844.36,
      "Jan-28": 113205.22, "Feb-28": 83486.16, "Mar-28": 86287.67, "Apr-28": 89275.60,
      "May-28": 92461.47, "Jun-28": 106082.61, "Jul-28": 128927.41, "Aug-28": 103333.10,
      "Sep-28": 107441.15, "Oct-28": 111816.56, "Nov-28": 122475.95, "Dec-28": 142831.84
    },
    resultado_neto_ars: {
      "Sep-26": -56625451.61, "Oct-26": -37411801.07, "Nov-26": -44071083.01, "Dec-26": -79067772.98,
      "Jan-27": -78068390.12, "Feb-27": -27325539.06, "Mar-27": -3953125.93, "Apr-27": -973476.72,
      "May-27": 2271494.26, "Jun-27": -9253256.62, "Jul-27": -40081339.93, "Aug-27": 12897073.64,
      "Sep-27": 17129840.14, "Oct-27": 21725805.10, "Nov-27": 19760335.91, "Dec-27": -2577236.35,
      "Jan-28": -9017981.40, "Feb-28": 41186288.51, "Mar-28": 47587431.74, "Apr-28": 54522086.99,
      "May-28": 62032605.25, "Jun-28": 55434327.49, "Jul-28": 35872689.65, "Aug-28": 88494836.61,
      "Sep-28": 98803609.28, "Oct-28": 109956044.31, "Nov-28": 112673110.58, "Dec-28": 101214270.50
    },
    resultado_neto_usd: {
      "Sep-26": -36579.75, "Oct-26": -23544.24, "Nov-26": -27187.59, "Dec-26": -47261.07,
      "Jan-27": -45940.30, "Feb-27": -15830.77, "Mar-27": -2254.70, "Apr-27": -546.62,
      "May-27": 1255.71, "Jun-27": -5036.00, "Jul-27": -21475.75, "Aug-27": 6803.18,
      "Sep-27": 8895.87, "Oct-27": 11107.74, "Nov-27": 9946.23, "Dec-27": -1277.12,
      "Jan-28": -4399.49, "Feb-28": 19781.56, "Mar-28": 22501.67, "Apr-28": 25381.05,
      "May-28": 28429.66, "Jun-28": 25011.80, "Jul-28": 15934.73, "Aug-28": 38700.21,
      "Sep-28": 42538.55, "Oct-28": 46606.19, "Nov-28": 47017.48, "Dec-28": 41581.04
    },
    // "Rdo Neto SG USD descontado": flujo mensual ya descontado a la tasa de VAN (fila del modelo).
    // Se usa para derivar el mes de recupero de la inversión: el primer mes en que la suma acumulada
    // de esta serie se vuelve positiva. Su suma total (Sep-26 a Dic-28) coincide con el VAN del
    // modelo — es la forma en que el propio Sheet calcula el VAN, así que reusarla para el recupero
    // es consistente con el resto del modelo (ver compute.js → computePayback).
    resultado_neto_usd_descontado: {
      "Sep-26": -36316.45, "Oct-26": -23206.53, "Nov-26": -26604.73, "Dec-26": -45914.99,
      "Jan-27": -44310.58, "Feb-27": -15159.27, "Mar-27": -2143.52, "Apr-27": -515.93,
      "May-27": 1176.67, "Jun-27": -4685.04, "Jul-27": -19835.27, "Aug-27": 6238.27,
      "Sep-27": 8098.49, "Oct-27": 10039.31, "Nov-27": 8924.82, "Dec-27": -1137.72,
      "Jan-28": -3891.07, "Feb-28": 17369.59, "Mar-28": 19615.82, "Apr-28": 21966.66,
      "May-28": 24428.05, "Jun-28": 21336.59, "Jul-28": 13495.45, "Aug-28": 32540.08,
      "Sep-28": 35510.01, "Oct-28": 38625.53, "Nov-28": 38685.92, "Dec-28": 33966.57
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

  breakEven: {
    ars: 100580783247.89,
    usd: 49103472.37,
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

  van: { usd: 108296.72 },
  tir: { pct: 0.03 },
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

  // Contexto (Resumen): AUM en FCI que Neix gestiona HOY, y cómo se distribuye por canal y por
  // tipo de fondo. Fuente: deck interno "Neix Asset Management — Proyección Interna, Agosto 2026".
  neixAumHoy: {
    totalArs: 47160000000,
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
    { label: "Sueldo Portfolio Manager (2)", ars: 235982581.10 },
    { label: "Cargas sociales", ars: 145359684.50 },
    { label: "Sueldo Comercial", ars: 139634663.30 },
    { label: "Mantenimiento software de gestión (ESCO)", ars: 139434861.70 },
    { label: "Bonos", ars: 132600000.00 },
    { label: "Sueldo Back Office (2)", ars: 108915037.40 },
    { label: "Auditoría, sindicatura e impuestos anuales", ars: 56961984.08 },
    { label: "Aguinaldo", ars: 41404241.96 },
    { label: "Calificación de riesgo (revisión anual)", ars: 9933578.57 },
    { label: "CAFCI (mensual)", ars: 4457884.64 }
  ],

  // return_monthly_pct = devengamiento de cartera (rendimiento del fondo) por mes.
  // newMoney_monthly_pct = crecimiento por captación de dinero nuevo por mes (mismo supuesto,
  // 5.00%, para los 4 fondos). La suma de ambos es la "Tasa de crecimiento mensual" del AUM
  // proyectado (hoja "Supuestos").
  funds: [
    { name: "Money Market $", aum_projected_ars: 37605451141.76, fee_annual_pct: 0.0181, return_annual_pct: 0.3004, return_monthly_pct: 0.0250, newMoney_monthly_pct: 0.0500 },
    { name: "Renta Fija $", aum_projected_ars: 4780009363.52, fee_annual_pct: 0.0210, return_annual_pct: 0.4280, return_monthly_pct: 0.0357, newMoney_monthly_pct: 0.0500 },
    { name: "Renta Fija USD", aum_projected_ars: 7321523514.97, fee_annual_pct: 0.0140, return_annual_pct: 0.3423, return_monthly_pct: 0.0285, newMoney_monthly_pct: 0.0500 },
    { name: "Renta Variable $", aum_projected_ars: 959285181.66, fee_annual_pct: 0.0290, return_annual_pct: 0.5283, return_monthly_pct: 0.0440, newMoney_monthly_pct: 0.0500 }
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
