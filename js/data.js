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
      "Jan-27": -71415131.09, "Feb-27": -20144277.17, "Mar-27": 10779659.02, "Apr-27": 14709806.53,
      "May-27": 18979321.61, "Jun-27": 9562860.08, "Jul-27": -19031775.24, "Aug-27": 34106016.72,
      "Sep-27": 37167386.86, "Oct-27": 43127511.74, "Nov-27": 43130315.22, "Dec-27": 26408359.22,
      "Jan-28": 22693365.49, "Feb-28": 72377483.16, "Mar-28": 81266453.18, "Apr-28": 90888447.26,
      "May-28": 101301909.00, "Jun-28": 97839577.93, "Jul-28": 81665701.17, "Aug-28": 137947762.82,
      "Sep-28": 152210596.01, "Oct-28": 167635017.73, "Nov-28": 174967711.76, "Dec-28": 168495948.29
    },
    resultado_neto_usd: {
      "Sep-26": -36579.75, "Oct-26": -23544.24, "Nov-26": -27187.59, "Dec-26": -47261.07,
      "Jan-27": -42025.11, "Feb-27": -11670.38, "Mar-27": 6148.27, "Apr-27": 8259.80,
      "May-27": 10491.98, "Jun-27": 5204.50, "Jul-27": -10197.30, "Aug-27": 17990.85,
      "Sep-27": 19301.77, "Oct-27": 22049.77, "Nov-27": 21709.35, "Dec-27": 13086.40,
      "Jan-28": 11071.14, "Feb-28": 34762.54, "Mar-28": 38426.77, "Apr-28": 42310.27,
      "May-28": 46426.86, "Jun-28": 44144.93, "Jul-28": 36276.09, "Aug-28": 60326.76,
      "Sep-28": 65532.21, "Oct-28": 71054.11, "Nov-28": 73012.46, "Dec-28": 69221.83
    },
    // "Rdo Neto SG USD descontado": flujo mensual ya descontado a la tasa de VAN (fila del modelo).
    // Se usa para derivar el mes de payback: el primer mes en que la suma acumulada de esta serie
    // se vuelve positiva. Su suma total (Jul-26 a Dic-28) coincide con el VAN del modelo — es la
    // forma en que el propio Sheet calcula el VAN, así que reusarla para el payback es consistente
    // con el resto del modelo.
    resultado_neto_usd_descontado: {
      "Sep-26": -36316.45, "Oct-26": -23206.53, "Nov-26": -26604.73, "Dec-26": -45914.99,
      "Jan-27": -40534.28, "Feb-27": -11175.35, "Mar-27": 5845.10, "Apr-27": 7795.99,
      "May-27": 9831.55, "Jun-27": 4841.80, "Jul-27": -9418.36, "Aug-27": 16496.97,
      "Sep-27": 17571.65, "Oct-27": 19928.85, "Nov-27": 19479.95, "Dec-27": 11657.99,
      "Jan-28": 9791.71, "Feb-28": 30523.93, "Mar-28": 33498.52, "Apr-28": 36618.48,
      "May-28": 39892.06, "Jun-28": 37658.30, "Jul-28": 30722.97, "Aug-28": 50724.22,
      "Sep-28": 54704.48, "Oct-28": 58887.08, "Nov-28": 60074.55, "Dec-28": 56545.67
    },
    ingresos_ars: {
      "Jan-27": 34404304.32, "Feb-27": 37092998.03, "Mar-27": 79985473.94, "Apr-27": 86240333.49,
      "May-27": 92986505.53, "Jun-27": 100262770.90, "Jul-27": 108110987.89, "Aug-27": 116576337.77,
      "Sep-27": 125707590.22, "Oct-27": 135557389.92, "Nov-27": 146182566.26, "Dec-27": 157644467.97,
      "Jan-28": 170009324.65, "Feb-28": 183348637.38, "Mar-28": 197739600.85, "Apr-28": 213265559.45,
      "May-28": 230016500.18, "Jun-28": 248089585.30, "Jul-28": 267589727.98, "Aug-28": 288630214.39,
      "Sep-28": 311333376.14, "Oct-28": 335831317.01, "Nov-28": 362266698.45, "Dec-28": 390793588.66
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
      "Jan-27": 45820052890.90, "Feb-27": 49381846520.45, "Mar-27": 53221474696.47, "Apr-27": 57360692323.48,
      "May-27": 61822964867.91, "Jun-27": 66633603470.35, "Jul-27": 71819910782.66, "Aug-27": 77411338385.81,
      "Sep-27": 83439656712.95, "Oct-27": 89939138476.65, "Nov-27": 96946756679.04, "Dec-27": 104502398370.86,
      "Jan-28": 112649095418.69, "Feb-28": 121433273641.15, "Mar-28": 130905021784.44, "Apr-28": 141118381925.75,
      "May-28": 152131663021.24, "Jun-28": 164007779453.50, "Jul-28": 176814616583.12, "Aug-28": 190625425470.43,
      "Sep-28": 205519249108.65, "Oct-28": 221581382698.41, "Nov-28": 238903870698.10, "Dec-28": 257586043605.56
    }
  },

  breakEven: {
    ars: 88995208383.86,
    usd: 36391049.30,
    note: "AUM promedio que la Sociedad Gerente necesita gestionar para cubrir sus costos fijos y variables. Los costos variables se estiman en 0.002% del AUM."
  },

  // Payback: la celda del modelo trae un texto fijo ("se recuperaría en noviembre del
  // 2028") que quedó desactualizado la última vez que cambió el escenario de captación
  // — con los números actuales el propio flujo de caja del modelo (resultado_neto_usd_descontado)
  // ya da vuelta antes que eso. Por eso el payback se CALCULA en compute.js como el primer
  // mes en que la suma acumulada de esa serie es >= 0 (coincide con cómo el modelo llega al
  // VAN), en vez de repetir el texto de la celda. sheetLabel queda solo de referencia.
  payback: {
    sheetLabel: "Noviembre 2028",
    sheetNote: "Texto literal del modelo: \"La inversión se recuperaría en noviembre del 2028\" — no recalculado tras el último cambio de escenario de captación."
  },

  van: { usd: 419921.13 },
  tir: { pct: 0.08 },
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
    "Tanoira",
    "Esco",
    "ARV",
    "Fix"
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
    { label: "Otros costos regulatorios (CNV, IGJ, CAFCI alta, fiscalización, escribanía)", ars: 48203479.67 },
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
