/*
 * INPUTS: datos crudos del modelo financiero "Sociedad Gerente" (Neix).
 * Fuente: planilla "Análisis SG" (escenario de captación 100% AUM Money
 * Market / 100% resto de los fondos).
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
    scenario: "Captación 100% del AUM (Money Market) / 100% del resto (RF $, RF USD, RV $)",
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
      "Sep-26": 40136045.64, "Oct-26": 13916647.47, "Nov-26": 22220237.99, "Dec-26": 58732468.59, "Jan-27": 95023876.70, "Feb-27": 83975838.16, "Mar-27": 109340141.60, "Apr-27": 115066722.40, "May-27": 118187831.30, "Jun-27": 140474639.00, "Jul-27": 150707568.20, "Aug-27": 129475246.20, "Sep-27": 136660619.60, "Oct-27": 141344291.60, "Nov-27": 156198058.30, "Dec-27": 199664062.70, "Jan-28": 182979658.30, "Feb-28": 164198694.40, "Mar-28": 171166100.80, "Apr-28": 181420116.20, "May-28": 189407838.30, "Jun-28": 219378927.50, "Jul-28": 233361987.70, "Aug-28": 218858756.60, "Sep-28": 230480073.10, "Oct-28": 245796704.10, "Nov-28": 273669492.20, "Dec-28": 324594076.80
    },
    costos_usd: {
      "Sep-26": 25927.68, "Oct-26": 8758.12, "Nov-26": 13707.73, "Dec-26": 35106.08, "Jan-27": 55917.97, "Feb-27": 48650.53, "Mar-27": 62363.06, "Apr-27": 64611.83, "May-27": 65335.56, "Jun-27": 76452.09, "Jul-27": 80749.73, "Aug-27": 68297.90, "Sep-27": 70970.61, "Oct-27": 72265.00, "Nov-27": 78621.24, "Dec-27": 98941.56, "Jan-28": 89268.08, "Feb-28": 78863.79, "Mar-28": 80935.73, "Apr-28": 84454.45, "May-28": 86805.97, "Jun-28": 98983.12, "Jul-28": 103659.93, "Aug-28": 95710.43, "Sep-28": 99230.07, "Oct-28": 104183.88, "Nov-28": 114199.83, "Dec-28": 133350.36
    },
    resultado_neto_ars: {
      "Sep-26": -30102034.23, "Oct-26": -10437485.60, "Nov-26": -16665178.49, "Dec-26": -44049351.44, "Jan-27": -36075793.27, "Feb-27": -26117815.74, "Mar-27": -4773860.90, "Apr-27": -1090840.17, "May-27": 511158.70, "Jun-27": -11437190.65, "Jul-27": -13747149.09, "Aug-27": 6825958.57, "Sep-27": 11697931.01, "Oct-27": 14523361.08, "Nov-27": 10577805.81, "Dec-27": -13262564.74, "Jan-28": 7013053.70, "Feb-28": 26209350.90, "Mar-28": 30459576.17, "Apr-28": 37157214.90, "May-28": 42150684.80, "Jun-28": 33529360.05, "Jul-28": 37595507.43, "Aug-28": 61173866.27, "Sep-28": 68843556.71, "Oct-28": 79265610.28, "Nov-28": 78968827.68, "Dec-28": 65036199.18
    },
    resultado_neto_usd: {
      "Sep-26": -19445.76, "Oct-26": -6568.59, "Nov-26": -10280.80, "Dec-26": -26329.56, "Jan-27": -21229.24, "Feb-27": -15131.08, "Mar-27": -2722.81, "Apr-27": -612.52, "May-27": 282.57, "Jun-27": -6224.59, "Jul-27": -7365.78, "Aug-27": 3600.68, "Sep-27": 6074.97, "Oct-27": 7425.35, "Nov-27": 5324.27, "Dec-27": -6572.13, "Jan-28": 3421.37, "Feb-28": 12588.22, "Mar-28": 14402.78, "Apr-28": 17297.38, "May-28": 19317.74, "Jun-28": 15128.35, "Jul-28": 16700.01, "Aug-28": 26752.31, "Sep-28": 29639.66, "Oct-28": 33597.68, "Nov-28": 32952.98, "Dec-28": 26718.30
    },
    // "Rdo Neto SG USD descontado": flujo mensual ya descontado a la tasa de VAN (fila del modelo).
    // Se usa para derivar el mes de recupero de la inversión: el primer mes en que la suma acumulada
    // de esta serie se vuelve positiva. Su suma total (Sep-26 a Dic-28) coincide con el VAN del
    // modelo — es la forma en que el propio Sheet calcula el VAN, así que reusarla para el recupero
    // es consistente con el resto del modelo (ver compute.js → computePayback).
    resultado_neto_usd_descontado: {
      "Sep-26": -19305.79, "Oct-26": -6474.37, "Nov-26": -10060.40, "Dec-26": -25579.64, "Jan-27": -20476.14, "Feb-27": -14489.27, "Mar-27": -2588.55, "Apr-27": -578.13, "May-27": 264.79, "Jun-27": -5790.79, "Jul-27": -6803.13, "Aug-27": 3301.69, "Sep-27": 5530.44, "Oct-27": 6711.12, "Nov-27": 4777.50, "Dec-27": -5854.77, "Jan-28": 3025.99, "Feb-28": 11053.33, "Mar-28": 12555.62, "Apr-28": 14970.45, "May-28": 16598.68, "Jun-28": 12905.40, "Jul-28": 14143.58, "Aug-28": 22494.00, "Sep-28": 24742.37, "Oct-28": 27844.54, "Nov-28": 27113.67, "Dec-28": 21825.54
    },
    ingresos_ars: {
      "Jan-27": 50274448.93, "Feb-27": 52662946.97, "Mar-27": 110330350.40, "Apr-27": 122239793.00, "May-27": 128065600.90, "Jun-27": 134169698.10, "Jul-27": 141833610.10, "Aug-27": 149936355.20, "Sep-27": 165169791.90, "Oct-27": 174560561.90, "Nov-27": 184486840.90, "Dec-27": 194979260.40, "Jan-28": 207844330.10, "Feb-28": 221564170.50, "Mar-28": 236195902.80, "Apr-28": 258467150.80, "May-28": 275442966.10, "Jun-28": 293542771.50, "Jul-28": 315467999.00, "Aug-28": 339053430.10, "Sep-28": 364426007.00, "Oct-28": 398389113.30, "Nov-28": 428089996.00, "Dec-28": 460037248.50
    },
    ingresos_usd: {
      "Jan-27": 29584.62, "Feb-27": 30509.73, "Mar-27": 62927.83, "Apr-27": 68639.63, "May-27": 70796.11, "Jun-27": 73020.68, "Jul-27": 75995.03, "Aug-27": 79091.08, "Sep-27": 85776.00, "Oct-27": 89247.45, "Nov-27": 92860.21, "Dec-27": 96620.05, "Jan-28": 101398.51, "Feb-28": 106416.14, "Mar-28": 111685.01, "Apr-28": 120321.28, "May-28": 126236.04, "Jun-28": 132445.63, "Jul-28": 140131.61, "Aug-28": 148273.49, "Sep-28": 156898.68, "Oct-28": 168862.01, "Nov-28": 178638.12, "Dec-28": 188993.39
    },
    // Incluye el AUM de los 4 fondos nombrados + "Fondos dedicados" (mandatos institucionales
    // nuevos, ver nota en "funds" más abajo) — por eso a partir de abr-27 supera la suma de los
    // 4 fondos de la pestaña "Fondos & supuestos".
    aum_total_ars: {
      "Jan-27": 66847369853.00, "Feb-27": 70008387252.00, "Mar-27": 73319118622.00, "Apr-27": 86786667984.00, "May-27": 90918477182.00, "Jun-27": 95247341985.00, "Jul-27": 100624902386.00, "Aug-27": 106306906494.00, "Sep-27": 122310637270.00, "Oct-27": 129154361532.00, "Nov-27": 136382386129.00, "Dec-27": 144016367323.00, "Jan-28": 153255841697.00, "Feb-28": 163095000910.00, "Mar-28": 173573143104.00, "Apr-28": 194732162138.00, "May-28": 207116720159.00, "Jun-28": 220299431715.00, "Jul-28": 236071928509.00, "Aug-28": 253001742614.00, "Sep-28": 271175337345.00, "Oct-28": 300685719477.00, "Nov-28": 322132938983.00, "Dec-28": 345149627188.00
    }
  },

  // Break-even: cifra final del deck "Neix Asset Management — Proyección Interna, Agosto 2026"
  // (4ta versión, tabla "Indicadores y resultados del modelo"), reemplaza la del Sheet en vivo
  // ($87.775MM ARS, celda "Break even (en pesos)" no recalculada tras el último cambio de
  // supuestos — mismo patrón que en versiones anteriores) por el mismo criterio de siempre. El
  // deck solo da el monto en pesos.
  //
  // El cruce con la curva de AUM se calcula en compute.js (computeAumSeries) comparando en
  // PESOS mes a mes contra este umbral — no convirtiendo a USD con el FX de un solo mes de
  // referencia, que da un mes de cruce distinto porque el FX cambia mes a mes. En pesos el AUM
  // supera el umbral por primera vez en ago-2027 (jul-27: $100.62MM ARS, todavía por debajo;
  // ago-27: $106.31MM ARS, ya por encima) — coincide con "Agosto 2027" del propio timeline del
  // deck. El USD de acá (usd) es solo de referencia, derivado con el FX oficial de ese mismo mes
  // de cruce (ago-27, 1895.74).
  breakEven: {
    ars: 103465904440,
    usd: 54578027.63,
    note: "AUM promedio que la Sociedad Gerente necesita gestionar para cubrir sus costos fijos y variables. Los costos variables se estiman en 0.002% del AUM."
  },

  // Recupero de la inversión (ex "payback"): se calcula en compute.js como el primer mes en que
  // la suma acumulada de resultado_neto_usd_descontado se vuelve >= 0 — bajo este escenario esa
  // suma coincide con el VAN. Da Ago-2028, igual al deck ("24 meses desde inicio de actividades
  // operativas / 19 meses desde inicio de ingresos — Agosto 2028"), y también coincide con su
  // propio gráfico de timeline. La celda de texto del Sheet ("Payback descontado en meses") no
  // se recalculó (quedó en 20), así que tampoco hay un texto literal del Sheet que citar acá.
  payback: {
    sheetLabel: null,
    sheetNote: ""
  },

  // VAN = suma de resultado_neto_usd_descontado (todo el horizonte). El Sheet ya no trae una
  // celda de TIR separada en esta versión — se deja sin dato (null) en vez de arrastrar el 8%
  // de una versión anterior que ya no es válido para este escenario.
  van: { usd: 111857.73 },
  tir: { pct: null },
  discountRate: { pct: 0.087, note: "Tasa T-Bond 10 años (4.5%) + prima de riesgo (4.2%)." },
  // El deck (pág. 5) dice que el fee por fondo subió (MM 2%, RF$ 2,50%, RFUSD 1,75%, RV 2,90%),
  // pero la fila "Fee Mensual SG%" de la hoja "Supuestos" —la que realmente alimenta Ingresos,
  // AUM y resultado en "Resultado económico"— no se recalculó: sigue dando los fees de la
  // versión anterior (MM 1,81%, RF$ 2,10%, RFUSD 1,40%, RV 2,90%), y por eso "Fee anual
  // promedio" también sigue en 1,80% (idéntico a la versión anterior) en vez de subir. Se
  // mantienen acá los fees que realmente están detrás de las series mensuales, no los del texto
  // del deck, para que todo el dashboard quede consistente entre sí (ver "funds" más abajo).
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
    moneyMarketPct: 1.0,
    restoPct: 1.0
  },

  // Contexto (Resumen): tamaño de la industria de FCI y AUM que Neix gestiona HOY, y cómo se
  // distribuye por canal y por tipo de fondo. Fuente: deck interno "Neix Asset Management —
  // Proyección Interna, Agosto 2026".
  // totalIndustriaArs/bancariasArs/independientesArs: el deck escribe "$108.585 millones" pero
  // eso trunca 3 ceros — la hoja "Industria - mensual 2026" (fuente: CAFCI) tiene la columna en
  // "Millones de Pesos" y el total de jul-26 es 108.585.000 en esa unidad, o sea $108.585
  // billones (millones de millones), no $108.585 mil millones. Corregido acá; bancarias/
  // independientes escalan igual (guardan el mismo 59.8%/40.2% del deck). neixAumArs NO se
  // escala — es la cifra propia de Neix, no sale de esa tabla de industria, y a esta escala
  // corregida su participación real da ~0.047% (recalculada; el deck dice "0.12%", que no
  // cierra ni con su propia cifra de industria sin corregir ni con la corregida — se prioriza
  // el cálculo propio, consistente con el resto del dashboard, sobre el texto suelto del deck).
  industryContext: {
    fechaReferencia: "jul-26",
    totalIndustriaArs: 108585000000000,
    bancariasArs: 64721000000000,
    bancariasPct: 0.598,
    independientesArs: 43577000000000,
    independientesPct: 0.402,
    periodoFlujos: "ago-25 a jul-26",
    flujoNetoIndependientesPct: 0.20,
    flujoNetoBancariasPct: 0.13,
    neixAumArs: 50666000000,
    neixMarketSharePct: 0.000467
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
    { label: "Comisiones a productores (81% del AUM, 53% del fee)", ars: 690618884.80, variable: true },
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

  // return_monthly_pct = devengamiento de cartera (rendimiento del fondo) por mes — bajaron
  // todos vs. la versión anterior (nueva hoja "Supuestos", que ahora liga inflación/FX al
  // relevamiento de expectativas de mercado del BCRA). fee_annual_pct sin cambios (ver nota en
  // feeAnnualAvg más arriba: el deck dice que subieron, pero la fórmula que realmente calcula
  // Ingresos en el Sheet no se recalculó). La captación de dinero nuevo (new money) escalona en
  // 4 semestres (ene-27 a dic-28), igual para los 4 fondos — ver newMoneySemesters más abajo.
  // aumEndOfYear_ars = AUM de este fondo a Dic-27 (Año 1) y Dic-28 (Año 2), tomado de la serie
  // mensual de AUM por fondo de la hoja "Resultado económico" (misma fuente que aum_total_ars).
  // Desde esta versión, la suma de estos 4 fondos YA NO coincide con aum_total_ars: el Sheet
  // suma además una línea nueva "Fondos dedicados" (mandatos institucionales, arrancan en
  // abr-27 con $10.000M ARS y fee anual 0,80%, no descriptos en el deck) que explica la
  // diferencia — a dic-28, por ejemplo, "Fondos dedicados" agrega $73.122MM ARS más.
  funds: [
    { name: "Money Market $", aum_projected_ars: 37605451141.76, fee_annual_pct: 0.0181, return_annual_pct: 0.2630, return_monthly_pct: 0.0219, aumEndOfYear_ars: { "2027": 86801760301, "2028": 199711980679 } },
    { name: "Renta Fija $", aum_projected_ars: 4780009363.52, fee_annual_pct: 0.0210, return_annual_pct: 0.3000, return_monthly_pct: 0.0250, aumEndOfYear_ars: { "2027": 11597015262, "2028": 27617949282 } },
    { name: "Renta Fija USD", aum_projected_ars: 7321523514.97, fee_annual_pct: 0.0140, return_annual_pct: 0.2500, return_monthly_pct: 0.0208, aumEndOfYear_ars: { "2027": 16605843936, "2028": 37745633607 } },
    { name: "Renta Variable $", aum_projected_ars: 959285181.66, fee_annual_pct: 0.0290, return_annual_pct: 0.4000, return_monthly_pct: 0.0333, aumEndOfYear_ars: { "2027": 2660943386, "2028": 6952250335 } }
  ],

  // Tasa mensual de captación de dinero nuevo (new money), igual para los 4 fondos, escalonada
  // en 4 semestres desde el lanzamiento (ene-27) hasta fin del horizonte (dic-28). Fuente: hoja
  // "Supuestos" del Sheet, fila "Tasa NM 1S/2S/3S/4S".
  newMoneySemesters: [
    { label: "1S · ene-jun 2027", pct: 0.025 },
    { label: "2S · jul-dic 2027", pct: 0.035 },
    { label: "3S · ene-jun 2028", pct: 0.045 },
    { label: "4S · jul-dic 2028", pct: 0.055 }
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
  ],

  // Fuente: deck "Neix Asset Management — Proyección Interna, Agosto 2026", slide "Supuestos
  // para este modelo" (páginas 4-5), sin el punto 01 (AUM/escenario de captación, que se
  // muestra aparte en Resumen). Son supuestos descriptivos del modelo, no datos que alimenten
  // un cálculo — por eso viven como texto plano, no como números en compute.js.
  otrosSupuestos: [
    {
      titulo: "Crecimiento del AUM",
      detalle: "El AUM de cada fondo varía en función del devengamiento de cartera (rendimiento propio de los activos, estimado a partir de datos reales de CAFCI de los últimos 12 meses) y de la evolución esperada de las suscripciones netas (New Money), que escalona en 4 semestres — ver el detalle en cada tarjeta de fondo."
    },
    {
      titulo: "Período de proyección",
      detalle: "El modelo financiero realiza proyecciones mensuales desde septiembre de 2026 hasta diciembre de 2028."
    },
    {
      titulo: "Inicio de actividades",
      detalle: "Se estima que el inicio de actividades operativas será el 1° de septiembre de 2026. Los ingresos comienzan a generarse recién a partir del 1° de enero de 2027."
    },
    {
      titulo: "Cantidad de fondos",
      detalle: "Neix Asset Management iniciará sus operaciones administrando cuatro fondos: Money Market, Renta Fija en pesos, Renta Fija en dólares y Renta Variable en pesos."
    },
    {
      titulo: "Fondos dedicados (mandatos institucionales)",
      detalle: "El modelo suma, además de los cuatro fondos, una línea de \"Fondos dedicados\" que arranca en abril de 2027 con $10.000M ARS y crece con altas periódicas de nuevos mandatos, con un fee anual del 0,80%. No está descripta en el deck; sale de la hoja de cálculo del modelo y ya está incluida en el AUM total y en los ingresos proyectados."
    },
    {
      titulo: "Fee de la Sociedad Gerente",
      detalle: "El fee por tipo de fondo se calculó como el que hoy cobran las Sociedades Gerentes que administran los fondos donde ya están invertidos los clientes de Neix. El 1.80% de la proyección es el promedio ponderado por el AUM de cada fondo, dando mayor peso a los segmentos con más volumen."
    }
  ]
};
