import type { ReportLanguage } from './report-translations'

const en = {
  display: 'Display', separateSites: 'Separate sites', mergeSites: 'Merge all sites', sites: 'Sites', site: 'Site',
  period: 'Period', name: 'Name', category: 'Category', allSitesAverage: 'All sites average', all: 'All',
  average: 'Average', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', xAxis: 'X-axis',
  timePeriod: 'Time period', siteName: 'Site name', type: 'Type', bar: 'Bar', line: 'Line', pie: 'Pie',
  sort: 'Sort', noSorting: 'No sorting', highestFirst: 'Highest first', lowestFirst: 'Lowest first',
  export: 'Export', download: 'Download', viewBy: 'View by', month: 'Month', week: 'Week',
  selectPeriod: 'Select period', entirePeriod: 'Entire reporting period', selectedPeriod: 'Selected period',
  count: 'Count', withData: 'with data', previous: 'Previous', current: 'Current', unknown: 'Unknown',
  good: 'Good', moderate: 'Moderate', sensitiveGroups: 'Unhealthy for Sensitive Groups', unhealthy: 'Unhealthy',
  veryUnhealthy: 'Very Unhealthy', hazardous: 'Hazardous', date: 'Date', dailyAverage: 'Daily Average PM2.5 (ug/m3)',
  daysWithData: 'Days with data', missingDays: 'Missing days', missingData: 'Missing data',
  calendarExplanation: 'Values inside calendar cells are daily average calibrated PM₂.₅ concentrations in µg/m³. Missing days are counted between the first and last available dates shown for the year.',
}

export type ReportChartCopy = typeof en
const withEnglish = (copy: Partial<ReportChartCopy>): ReportChartCopy => ({ ...en, ...copy })

const copies: Record<ReportLanguage, ReportChartCopy> = {
  en,
  sw: withEnglish({
    display: 'Onyesho', separateSites: 'Vituo tofauti', mergeSites: 'Unganisha vituo vyote', sites: 'Vituo', site: 'Kituo', period: 'Kipindi', name: 'Jina', category: 'Aina', allSitesAverage: 'Wastani wa vituo vyote', all: 'Vyote', average: 'Wastani', daily: 'Kila siku', weekly: 'Kila wiki', monthly: 'Kila mwezi', xAxis: 'Mhimili wa X', timePeriod: 'Kipindi cha muda', siteName: 'Jina la kituo', type: 'Aina', bar: 'Nguzo', line: 'Mstari', pie: 'Duara', sort: 'Panga', noSorting: 'Bila kupanga', highestFirst: 'Kubwa kwanza', lowestFirst: 'Ndogo kwanza', export: 'Hamisha', download: 'Pakua', viewBy: 'Angalia kwa', month: 'Mwezi', week: 'Wiki', selectPeriod: 'Chagua kipindi', entirePeriod: 'Kipindi chote cha ripoti', selectedPeriod: 'Kipindi kilichochaguliwa', count: 'Idadi', withData: 'vyenye data', previous: 'Iliyopita', current: 'Ya sasa', unknown: 'Haijulikani', good: 'Nzuri', moderate: 'Wastani', sensitiveGroups: 'Hatari kwa Makundi Nyeti', unhealthy: 'Isiyo na Afya', veryUnhealthy: 'Isiyo na Afya Sana', hazardous: 'Hatari', date: 'Tarehe', dailyAverage: 'Wastani wa Kila Siku wa PM2.5 (ug/m3)', daysWithData: 'Siku zenye data', missingDays: 'Siku zinazokosekana', missingData: 'Data inayokosekana', calendarExplanation: 'Thamani kwenye kalenda ni wastani wa kila siku wa PM₂.₅ uliosahihishwa kwa µg/m³. Siku zinazokosekana huhesabiwa kati ya tarehe ya kwanza na ya mwisho yenye data.' }),
  es: withEnglish({
    display: 'Visualización', separateSites: 'Sitios separados', mergeSites: 'Combinar todos los sitios', sites: 'Sitios', site: 'Sitio', period: 'Periodo', name: 'Nombre', category: 'Categoría', allSitesAverage: 'Promedio de todos los sitios', all: 'Todos', average: 'Promedio', daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', xAxis: 'Eje X', timePeriod: 'Periodo de tiempo', siteName: 'Nombre del sitio', type: 'Tipo', bar: 'Barras', line: 'Línea', pie: 'Circular', sort: 'Ordenar', noSorting: 'Sin ordenar', highestFirst: 'Mayor primero', lowestFirst: 'Menor primero', export: 'Exportar', download: 'Descargar', viewBy: 'Ver por', month: 'Mes', week: 'Semana', selectPeriod: 'Seleccionar periodo', entirePeriod: 'Todo el periodo del informe', selectedPeriod: 'Periodo seleccionado', count: 'Cantidad', withData: 'con datos', previous: 'Anterior', current: 'Actual', unknown: 'Desconocido', good: 'Bueno', moderate: 'Moderado', sensitiveGroups: 'Insalubre para grupos sensibles', unhealthy: 'Insalubre', veryUnhealthy: 'Muy insalubre', hazardous: 'Peligroso', date: 'Fecha', dailyAverage: 'Promedio diario de PM2.5 (ug/m3)', daysWithData: 'Días con datos', missingDays: 'Días sin datos', missingData: 'Datos faltantes', calendarExplanation: 'Los valores del calendario son concentraciones medias diarias calibradas de PM₂.₅ en µg/m³. Los días faltantes se cuentan entre la primera y la última fecha disponible.' }),
  pt: withEnglish({
    display: 'Exibição', separateSites: 'Locais separados', mergeSites: 'Combinar todos os locais', sites: 'Locais', site: 'Local', period: 'Período', name: 'Nome', category: 'Categoria', allSitesAverage: 'Média de todos os locais', all: 'Todos', average: 'Média', daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal', xAxis: 'Eixo X', timePeriod: 'Período', siteName: 'Nome do local', type: 'Tipo', bar: 'Barras', line: 'Linha', pie: 'Circular', sort: 'Ordenar', noSorting: 'Sem ordenação', highestFirst: 'Maior primeiro', lowestFirst: 'Menor primeiro', export: 'Exportar', download: 'Baixar', viewBy: 'Ver por', month: 'Mês', week: 'Semana', selectPeriod: 'Selecionar período', entirePeriod: 'Período completo do relatório', selectedPeriod: 'Período selecionado', count: 'Contagem', withData: 'com dados', previous: 'Anterior', current: 'Atual', unknown: 'Desconhecido', good: 'Bom', moderate: 'Moderado', sensitiveGroups: 'Insalubre para grupos sensíveis', unhealthy: 'Insalubre', veryUnhealthy: 'Muito insalubre', hazardous: 'Perigoso', date: 'Data', dailyAverage: 'Média diária de PM2.5 (ug/m3)', daysWithData: 'Dias com dados', missingDays: 'Dias sem dados', missingData: 'Dados ausentes', calendarExplanation: 'Os valores no calendário são concentrações médias diárias calibradas de PM₂.₅ em µg/m³. Os dias ausentes são contados entre a primeira e a última data disponível.' }),
  fr: withEnglish({
    display: 'Affichage', separateSites: 'Sites séparés', mergeSites: 'Regrouper tous les sites', sites: 'Sites', site: 'Site', period: 'Période', name: 'Nom', category: 'Catégorie', allSitesAverage: 'Moyenne de tous les sites', all: 'Tous', average: 'Moyenne', daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel', xAxis: 'Axe X', timePeriod: 'Période', siteName: 'Nom du site', type: 'Type', bar: 'Barres', line: 'Courbe', pie: 'Secteurs', sort: 'Trier', noSorting: 'Sans tri', highestFirst: 'Plus élevé en premier', lowestFirst: 'Plus faible en premier', export: 'Exporter', download: 'Télécharger', viewBy: 'Afficher par', month: 'Mois', week: 'Semaine', selectPeriod: 'Sélectionner une période', entirePeriod: 'Toute la période du rapport', selectedPeriod: 'Période sélectionnée', count: 'Nombre', withData: 'avec données', previous: 'Précédent', current: 'Actuel', unknown: 'Inconnu', good: 'Bon', moderate: 'Modéré', sensitiveGroups: 'Mauvais pour les groupes sensibles', unhealthy: 'Mauvais', veryUnhealthy: 'Très mauvais', hazardous: 'Dangereux', date: 'Date', dailyAverage: 'Moyenne quotidienne de PM2.5 (ug/m3)', daysWithData: 'Jours avec données', missingDays: 'Jours manquants', missingData: 'Données manquantes', calendarExplanation: 'Les valeurs du calendrier sont les concentrations moyennes quotidiennes calibrées de PM₂.₅ en µg/m³. Les jours manquants sont comptés entre la première et la dernière date disponible.' }),
  lg: withEnglish({
    display: 'Endabika', separateSites: 'Ebifo ebyawukana', mergeSites: 'Gatta ebifo byonna', sites: 'Ebifo', site: 'Ekifo', period: 'Ekiseera', name: 'Erinnya', category: 'Ekika', allSitesAverage: 'Wakati w’ebifo byonna', all: 'Byonna', average: 'Wakati', daily: 'Buli lunaku', weekly: 'Buli wiiki', monthly: 'Buli mwezi', xAxis: 'Lukoloboze X', timePeriod: 'Ekiseera', siteName: 'Erinnya ly’ekifo', type: 'Ekika', bar: 'Emitendera', line: 'Olukoloboze', pie: 'Enkulungo', sort: 'Tegeka', noSorting: 'Totegeka', highestFirst: 'Ekisinga waggulu kisooke', lowestFirst: 'Ekisinga wansi kisooke', export: 'Fulumya', download: 'Wanula', viewBy: 'Laba nga', month: 'Mwezi', week: 'Wiiki', selectPeriod: 'Londa ekiseera', entirePeriod: 'Ekiseera kyonna eky’alipoota', selectedPeriod: 'Ekiseera ekirondeddwa', count: 'Omuwendo', withData: 'ebirina data', previous: 'Ekyayita', current: 'Ekiriwo', unknown: 'Tekimanyiddwa', good: 'Kirungi', moderate: 'Kya wakati', sensitiveGroups: 'Kibi eri Abantu Abateeseteese', unhealthy: 'Kibi eri Obulamu', veryUnhealthy: 'Kibi Nnyo eri Obulamu', hazardous: 'Kya Bulabe', date: 'Olunaku', dailyAverage: 'PM2.5 eya wakati eya buli lunaku (ug/m3)', daysWithData: 'Ennaku ezirina data', missingDays: 'Ennaku ezibula', missingData: 'Data ebula', calendarExplanation: 'Emiwendo mu kalenda ye PM₂.₅ eya wakati eya buli lunaku mu µg/m³. Ennaku ezibula zibalibwa wakati w’olunaku olusooka n’olusembayo oluliko data.' }),
  alz: withEnglish({
    display: 'Nyuthi', separateSites: 'Kabedo matung tung', mergeSites: 'Med kabedo zo', sites: 'Kabedo', site: 'Kabedo', period: 'Sawa', name: 'Nying', category: 'Kit', allSitesAverage: 'Kabedo zo rwom', all: 'Ceke', average: 'Idyere', daily: 'Kubang nindo', weekly: 'Kubang yenga', monthly: 'Dwi ku dwi', xAxis: 'X-axis', timePeriod: 'Kare mi kare', siteName: 'Nying kabedo', type: 'Kyeo', bar: 'Klap', line: 'Iatira', pie: 'Pie', sort: 'Yer', noSorting: 'Poko ope', highestFirst: 'Ma malu mir acel', lowestFirst: 'Ma piny loyo mir acel', export: 'Cwalo woko', download: 'Telo', viewBy: 'Nen ku', month: 'Dwi', week: 'Yenga', selectPeriod: 'Yer kare', entirePeriod: 'Kare mi ripot zo', selectedPeriod: 'Kare ma juyeru', count: 'Kwan', withData: 'ku lembe', previous: 'Mapodi', current: 'Makawoni', unknown: 'Ngeyire ngo', good: 'Ber', moderate: 'Idyere', sensitiveGroups: 'Ber ungo pi ju ma remo migi nyai', unhealthy: 'Ku yot kum', veryUnhealthy: 'Ku yot kum marac', hazardous: 'Peko', date: 'Nindo', dailyAverage: 'Piny ma romo kubang ceng PM2.5 (ug/m3)', daysWithData: 'Nindu ku lembe', missingDays: 'Nindu ma rwinyo', missingData: 'Lembe ma rwinyo', calendarExplanation: 'Piny ma nwangre i calendar cells utiye PM₂.₅ ma jupimo kubang ceng i µg/m3. Nindu ma rwinyo ju kwanu ikind nindo mir acel ku mir ajiki ma ju nyuthu pi oro.' }),
}

export const getReportChartCopy = (language: ReportLanguage) => copies[language]

export const getLocalizedCalendarLabels = (language: ReportLanguage) => {
  const locale = language === 'alz' ? 'alz-UG' : language
  const months = Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, month, 1))),
  )
  const weekdays = Array.from({ length: 7 }, (_, offset) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 1 + offset))),
  )
  return { months, weekdays }
}

export const translateAqiCategory = (category: string, language: ReportLanguage) => {
  const copy = copies[language]
  const labels: Record<string, string> = {
    Good: copy.good,
    Moderate: copy.moderate,
    'Sensitive Groups': copy.sensitiveGroups,
    'Unhealthy for Sensitive Groups': copy.sensitiveGroups,
    Unhealthy: copy.unhealthy,
    'Very Unhealthy': copy.veryUnhealthy,
    Hazardous: copy.hazardous,
    Unknown: copy.unknown,
  }
  return labels[category] || category
}

const siteCategoryLabels: Record<ReportLanguage, Record<string, string>> = {
  en: {
    'Urban Commercial': 'Urban Commercial',
    'Background Site': 'Background Site',
    'Urban Background': 'Urban Background',
    Background: 'Background',
    Urban: 'Urban',
    Industrial: 'Industrial',
    Rural: 'Rural',
    Uncategorized: 'Uncategorized',
  },
  sw: {
    'Urban Commercial': 'Biashara ya mjini',
    'Background Site': 'Kituo cha mandharinyuma',
    'Urban Background': 'Mandharinyuma ya mjini',
    Background: 'Mandharinyuma',
    Urban: 'Mjini',
    Industrial: 'Viwandani',
    Rural: 'Vijijini',
    Uncategorized: 'Haijaainishwa',
  },
  es: {
    'Urban Commercial': 'Comercial urbano',
    'Background Site': 'Sitio de fondo',
    'Urban Background': 'Fondo urbano',
    Background: 'Fondo',
    Urban: 'Urbano',
    Industrial: 'Industrial',
    Rural: 'Rural',
    Uncategorized: 'Sin categoría',
  },
  pt: {
    'Urban Commercial': 'Urbano comercial',
    'Background Site': 'Local de fundo',
    'Urban Background': 'Fundo urbano',
    Background: 'Fundo',
    Urban: 'Urbano',
    Industrial: 'Industrial',
    Rural: 'Rural',
    Uncategorized: 'Sem categoria',
  },
  fr: {
    'Urban Commercial': 'Commercial urbain',
    'Background Site': 'Site de fond',
    'Urban Background': 'Fond urbain',
    Background: 'Fond',
    Urban: 'Urbain',
    Industrial: 'Industriel',
    Rural: 'Rural',
    Uncategorized: 'Non catégorisé',
  },
  lg: {
    'Urban Commercial': 'Eky’obusuubuzi mu kibuga',
    'Background Site': 'Ekifo eky’emabega',
    'Urban Background': 'Emabega w’ekibuga',
    Background: 'Emabega',
    Urban: 'Mu kibuga',
    Industrial: 'Amakolero',
    Rural: 'Mu byalo',
    Uncategorized: 'Tekinnateekebwa mu kika',
  },
  alz: {
    'Urban Commercial': 'Urban Commercial',
    'Background Site': 'Kabedo mi ngeye',
    'Urban Background': 'Kabedo mi adhura',
    Background: 'Ingei lembe eni',
    Urban: 'Taun',
    Industrial: 'Tic mi yiku piny',
    Rural: 'Caro',
    Uncategorized: 'mbe ku kare.',
  },
}

export const translateSiteCategory = (category: string, language: ReportLanguage) =>
  siteCategoryLabels[language][category] || category
