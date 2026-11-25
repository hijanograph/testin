export const esencial = [
  { label: 'Perfil', value: 'Diseñador gráfico y visual, especializado en branding, motion graphics y edición de vídeo' },
  { label: 'Ubicación', value: 'Málaga, España. Disponible en Málaga y alrededores o en remoto' },
  { label: 'Última experiencia', value: 'Diseñador visual en Batterylight (feb 2025 - feb 2026)' },
  { label: 'Formación', value: 'Máster en Diseño Visual (La X Gauss) y Grado en Comunicación Audiovisual (Universidad de Málaga)' },
];
export const introPorDefecto = {
  title: 'Me encantaría trabajar contigo',
  lead: 'Si has recibido este enlace, es porque tengo un interés real en la oferta.',
  body: 'He reunido aquí lo esencial para conocerme rápido: quién soy, dónde he trabajado, qué sé hacer y cómo contactar conmigo. Si necesitas algo más, escríbeme y te respondo enseguida.',
};

/* Texto principal según la categoría de la oferta (mecontratas#slug). */
const intro = (puesto: string, perfil: string) => ({
  title: `Me encantaría trabajar contigo como ${puesto}`,
  lead: introPorDefecto.lead,
  body: `He reunido aquí lo esencial de mi perfil como ${perfil}: dónde he trabajado, qué sé hacer y proyectos relacionados con tu oferta. Si necesitas algo más, escríbeme y te respondo enseguida.`,
});

export const introPorArea: Record<string, typeof introPorDefecto> = {
  branding: intro('diseñador de marca', 'diseñador de branding e identidad visual'),
  editorial: intro('diseñador editorial', 'diseñador editorial y de packaging'),
  'motion-graphics': intro('motion designer', 'diseñador de motion graphics'),
  'ux-ui': intro('diseñador UX/UI', 'diseñador UX/UI y web'),
  ilustracion: intro('ilustrador', 'ilustrador y diseñador visual'),
};
