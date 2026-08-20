/*
 * INPUTS: datos crudos del modelo financiero "Sociedad Gerente" (Neix).
 * Fuente: planilla "Análisis SG" (escenario de captación 50% AUM Money
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
    scenario: "Captación 50% del AUM (Money Market) / 80% del resto (RF $, RF USD, RV $)",
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
      "Jan-27": 144394246.90, "Feb-27": 79876058.32, "Mar-27": 98923725.01, "Apr-27": 102249299.30,
      "May-27": 105792295.80, "Jun-27": 129644349.80, "Jul-27": 179898735.30, "Aug-27": 117899678.60,
      "Sep-27": 122493263.50, "Oct-27": 127402159.30, "Nov-27": 142584410.80, "Dec-27": 187595010.60,
      "Jan-28": 210575234.20, "Feb-28": 150710233.30, "Mar-28": 157603898.90, "Apr-28": 164992083.70,
      "May-28": 172913492.90, "Jun-28": 204072016.70, "Jul-28": 256826457.90, "Aug-28": 200311838.00,
      "Sep-28": 210818646.80, "Oct-28": 222103674.10, "Nov-28": 248606697.10, "Dec-28": 299336740.40
    },
    costos_usd: {
      "Sep-26": 48773.00, "Oct-26": 31392.32, "Nov-26": 36250.12, "Dec-26": 63014.76,
      "Jan-27": 84970.57, "Feb-27": 46275.36, "Mar-27": 56421.97, "Apr-27": 57414.64,
      "May-27": 58483.17, "Jun-27": 70557.80, "Jul-27": 96390.48, "Aug-27": 62191.81,
      "Sep-27": 63613.22, "Oct-27": 65136.81, "Nov-27": 71768.90, "Dec-27": 92960.86,
      "Jan-28": 102730.81, "Feb-28": 72385.36, "Mar-28": 74522.86, "Apr-28": 76806.89,
      "May-28": 79246.58, "Jun-28": 92076.69, "Jul-28": 114082.90, "Aug-28": 87599.57,
      "Sep-28": 90765.11, "Oct-28": 94141.31, "Nov-28": 103741.35, "Dec-28": 122974.10
    },
    resultado_neto_ars: {
      "Sep-26": -56625451.61, "Oct-26": -37411801.07, "Nov-26": -44071083.01, "Dec-26": -79067772.98,
      "Jan-27": -82492456.97, "Feb-27": -32087295.21, "Mar-27": -14203688.31, "Apr-27": -12006724.38,
      "May-27": -9604342.68, "Jun-27": -22036184.14, "Jul-27": -53840810.57, "Aug-27": -992505.59,
      "Sep-27": 2410745.02, "Oct-27": 5708661.40, "Nov-27": 2698616.56, "Dec-27": -22462906.98,
      "Jan-28": -30424432.14, "Feb-28": 22846882.84, "Mar-28": 28094991.36, "Apr-28": 33791433.01,
      "May-28": 37116954.70, "Jun-28": 30812298.03, "Jul-28": 7534289.03, "Aug-28": 57406944.65,
      "Sep-28": 65334574.06, "Oct-28": 73922967.87, "Nov-28": 73879000.90, "Dec-28": 59446951.35
    },
    resultado_neto_usd: {
      "Sep-26": -36579.75, "Oct-26": -23544.24, "Nov-26": -27187.59, "Dec-26": -47261.07,
      "Jan-27": -48543.70, "Feb-27": -18589.44, "Mar-27": -8101.19, "Apr-27": -6741.97,
      "May-27": -5309.39, "Jun-27": -11993.00, "Jul-27": -28848.13, "Aug-27": -523.54,
      "Sep-27": 1251.95, "Oct-27": 2918.66, "Nov-27": 1358.33, "Dec-27": -11131.27,
      "Jan-28": -14842.80, "Feb-28": 10973.24, "Mar-28": 13284.69, "Apr-28": 15730.54,
      "May-28": 17010.77, "Jun-28": 13902.42, "Jul-28": 3346.75, "Aug-28": 25104.97,
      "Sep-28": 28128.92, "Oct-28": 31333.14, "Nov-28": 30829.04, "Dec-28": 24422.11
    },
    // "Rdo Neto SG USD descontado": flujo mensual ya descontado a la tasa de VAN (fila del modelo).
    // Se usa para derivar el mes de payback: el primer mes en que la suma acumulada de esta serie
    // se vuelve positiva. Su suma total (Jul-26 a Dic-28) coincide con el VAN del modelo — es la
    // forma en que el propio Sheet calcula el VAN, así que reusarla para el payback es consistente
    // con el resto del modelo. Bajo este escenario la suma nunca cruza cero: el modelo no recupera
    // la inversión dentro del horizonte modelado (ver compute.js → computePayback).
    resultado_neto_usd_descontado: {
      "Sep-26": -36316.45, "Oct-26": -23206.53, "Nov-26": -26604.73, "Dec-26": -45914.99,
      "Jan-27": -46821.63, "Feb-27": -17800.93, "Mar-27": -7701.72, "Apr-27": -6363.39,
      "May-27": -4975.18, "Jun-27": -11157.20, "Jul-27": -26644.50, "Aug-27": -480.07,
      "Sep-27": 1139.73, "Oct-27": 2637.92, "Nov-27": 1218.84, "Dec-27": -9916.27,
      "Jan-28": -13127.50, "Feb-28": 9635.27, "Mar-28": 11580.92, "Apr-28": 13614.39,
      "May-28": 14616.43, "Jun-28": 11859.61, "Jul-28": 2834.43, "Aug-28": 21108.88,
      "Sep-28": 23481.24, "Oct-28": 25967.77, "Nov-28": 25366.09, "Dec-28": 19949.84
    },
    ingresos_ars: {
      "Jan-27": 34404304.32, "Feb-27": 37092998.03, "Mar-27": 79985473.94, "Apr-27": 86240333.49,
      "May-27": 92986505.53, "Jun-27": 100262770.90, "Jul-27": 108110987.90, "Aug-27": 116576337.80,
      "Sep-27": 125707590.20, "Oct-27": 135557389.90, "Nov-27": 146182566.30, "Dec-27": 157644468.00,
      "Jan-28": 170009324.70, "Feb-28": 183348637.40, "Mar-28": 197739600.90, "Apr-28": 213265559.50,
      "May-28": 230016500.20, "Jun-28": 248089585.30, "Jul-28": 267589728.00, "Aug-28": 288630214.40,
      "Sep-28": 311333376.10, "Oct-28": 335831317.00, "Nov-28": 362266698.40, "Dec-28": 390793588.70
    },
    ingresos_usd: {
      "Jan-27": 20245.64, "Feb-27": 21489.44, "Mar-27": 45620.38, "Apr-27": 48425.35,
      "May-27": 51403.99, "Jun-27": 54567.13, "Jul-27": 57926.31, "Aug-27": 61493.75,
      "Sep-27": 65282.48, "Oct-27": 69306.33, "Nov-27": 73580.01, "Dec-27": 78119.16,
      "Jan-28": 82940.40, "Feb-28": 88061.41, "Mar-28": 93500.99, "Apr-28": 99279.10,
      "May-28": 105417.00, "Jun-28": 111937.28, "Jul-28": 118863.97, "Aug-28": 126222.61,
      "Sep-28": 134040.37, "Oct-28": 142346.14, "Nov-28": 151170.64, "Dec-28": 160546.58
    },
    aum_total_ars: {
      "Jan-27": 45820052891.00, "Feb-27": 49381846520.00, "Mar-27": 53221474696.00, "Apr-27": 57360692323.00,
      "May-27": 61822964868.00, "Jun-27": 66633603470.00, "Jul-27": 71819910783.00, "Aug-27": 77411338386.00,
      "Sep-27": 83439656713.00, "Oct-27": 89939138477.00, "Nov-27": 96946756679.00, "Dec-27": 104502398371.00,
      "Jan-28": 112649095419.00, "Feb-28": 121433273641.00, "Mar-28": 130905021784.00, "Apr-28": 141118381926.00,
      "May-28": 152131663021.00, "Jun-28": 164007779454.00, "Jul-28": 176814616583.00, "Aug-28": 190625425470.00,
      "Sep-28": 205519249109.00, "Oct-28": 221581382698.00, "Nov-28": 238903870698.00, "Dec-28": 257586043606.00
    }
  },

  breakEven: {
    ars: 100580783248.00,
    usd: 52351068.08,
    note: "AUM promedio que la Sociedad Gerente necesita gestionar para cubrir sus costos fijos y variables. Los costos variables se estiman en 0.002% del AUM."
  },

  // Payback: bajo este escenario el flujo de caja neto descontado acumulado (resultado_neto_usd_descontado)
  // NUNCA cruza cero dentro del horizonte del modelo (jul-2026 a dic-2028) — termina en -US$92K, el
  // mismo valor que el VAN. El propio Sheet trae de todos modos una celda de texto fijo ("se recuperaría
  // en noviembre del 2028") que quedó de un escenario anterior y ya no es consistente con sus propios
  // números — por eso el payback se CALCULA en compute.js a partir del flujo real en vez de repetir ese
  // texto. sheetLabel/sheetNote quedan solo de referencia histórica.
  payback: {
    sheetLabel: "Noviembre 2028",
    sheetNote: "Texto literal del modelo: \"La inversión se recuperaría en noviembre del 2028\" — inconsistente con el flujo de caja descontado del propio modelo, que no cruza cero dentro del horizonte proyectado."
  },

  van: { usd: -92019.73 },
  // TIR: la celda del modelo devuelve #NUM! (no converge) bajo este escenario. pct queda en null
  // y el dashboard muestra "N/D" en vez de forzar un porcentaje inexistente.
  tir: { pct: null, note: "El modelo no puede calcular la TIR bajo este escenario (la función converge a error #NUM! en la planilla)." },
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

  // Distribución de costos: estructura anual de referencia (ANEXO 1 de la hoja "Costos SG"),
  // en pesos. Editá cualquier "ars" y el total y los porcentajes se recalculan solos.
  costBreakdownItems: [
    { label: "Comisiones a productores (81% del AUM, 53% del fee)", ars: 524068716.10 },
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

  funds: [
    { name: "Money Market $", aum_projected_ars: 37605451141.76, fee_annual_pct: 0.0181, return_annual_pct: 0.3004 },
    { name: "Renta Fija $", aum_projected_ars: 4780009363.52, fee_annual_pct: 0.0210, return_annual_pct: 0.4280 },
    { name: "Renta Fija USD", aum_projected_ars: 7321523514.97, fee_annual_pct: 0.0140, return_annual_pct: 0.3423 },
    { name: "Renta Variable $", aum_projected_ars: 959285181.66, fee_annual_pct: 0.0290, return_annual_pct: 0.5283 }
  ],

  timeline: {
    start: { label: "Inicio", date: "Jul-2026", detail: "Constitución de la Sociedad Gerente e inicio de costos de puesta en marcha." }
    // el hito de break-even y el label de fecha se calculan en compute.js a partir de aum_total_ars vs. breakEven.usd
  },

  // Marco regulatorio: fuente "Neix Asset Management · Proyección Interna · Agosto 2026"
  // (deck interno, RG 1089/2025 de la CNV). Es información de contexto/riesgo, no forma
  // parte del modelo financiero del Sheet — por eso vive en su propio bloque.
  regulatory: {
    referenceDate: "23/7/2026",
    capitalMinimoPrimerFci: { uva: 150000, ars: 307203000.00, usd: 202191, note: "Patrimonio neto mínimo exigido para operar el primer fondo. Ajusta automáticamente con inflación vía UVA." },
    capitalAdicionalPorFondo: { uva: 20000, ars: 40960400.00, usd: 26959, note: "El capital mínimo se incrementa en 20.000 UVA por cada fondo adicional que se administre." },
    contrapartidaLiquida: { pct: 0.50, usd: 141534, note: "Al menos el 50% del capital mínimo debe estar invertido en activos elegibles según Anexo I, Cap. I, Tít. VI de las Normas CNV." },
    categoriaRegulatoria: "Agente de Administración de Productos de Inversión Colectiva de Fondos Comunes de Inversión (CNV)",

    // Neix ya opera como ALyC, y al armar la Sociedad Gerente queda inscripta simultáneamente
    // en 3 categorías ante la CNV: ALyC, ACyDI (distribución de FCI, habilitada por ser ALyC)
    // y AG (la Sociedad Gerente nueva). El capital mínimo consolidado no es la suma de las 3:
    // es el 100% de la categoría más exigente + el 50% de cada una de las otras dos
    // (Art. 20°, RG 1089/2025). Como el capital de ALyC ya lo sostiene Neix hoy (no es plata
    // nueva para este proyecto), lo relevante para el business case es el capital INCREMENTAL:
    // consolidado total menos lo que ya se tiene puesto como ALyC.
    capitalConsolidation: {
      alyc: { uva: 470350, ars: 963286207, usd: 634004, subcategoria: "ALyC general (no ALyC Integral Agro, que exige 1.175.000 UVA)" },
      acydi: { ars: 250000, usd: 165, note: "Monto fijo en pesos (no UVA): patrimonio neto mínimo no inferior a $250.000, acreditado con estados contables de antigüedad no mayor a 5 meses." },
      note: "Al constituir la Sociedad Gerente, Neix queda inscripta simultáneamente en 3 categorías ante la CNV (ALyC, ACyDI y AG/Sociedad Gerente). El capital mínimo consolidado es el 100% de la categoría más exigente más el 50% de cada una de las otras dos (Art. 20°, RG 1089/2025)."
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
      "Eficiencia de costos al aprovechar recursos humanos, tecnológicos y físicos ya existentes en Neix"
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
