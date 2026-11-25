export const servicios = [
  {
    title: 'Identidad visual y branding',
    areas: ['branding'],
    detail:
      'Construyo identidades de marca completas: investigación, concepto, logotipo, paleta, tipografía y un manual de identidad que permite a cualquiera aplicarlas con coherencia. También rediseño marcas que necesitan renovarse sin perder su historia.',
    items: ['Logotipo y sistema gráfico', 'Manual de identidad', 'Rebranding'],
  },
  {
    title: 'Diseño editorial y packaging',
    areas: ['editorial'],
    detail:
      'Diseño y maqueto catálogos, publicaciones, packaging, papelería corporativa y merchandising. Cuido los detalles de producción y me coordino con la imprenta cuando hace falta.',
    items: ['Catálogos y publicaciones', 'Packaging', 'Papelería y merchandising'],
  },
  {
    title: 'Motion graphics',
    areas: ['motion-graphics'],
    detail:
      'Animo identidades y piezas para vídeo, redes sociales y plataformas audiovisuales, para que el lenguaje visual de la marca se mantenga también en movimiento.',
    items: ['Animación de marca', 'Piezas para redes y vídeo', 'Formatos para plataformas'],
  },
  {
    title: 'UX/UI y web',
    areas: ['ux-ui'],
    detail:
      'Diseño interfaces y webs que llevan la identidad de la marca al entorno digital, cuidando el flujo de uso y, en tiendas online, una experiencia de compra agradable.',
    items: ['Diseño de interfaces', 'Webs en WordPress y HTML', 'Prototipado en Figma'],
  },
];

export const proceso = [
  {
    title: 'Briefing',
    text: 'Empiezo por entender a fondo la marca, sus objetivos y lo que necesita que el diseño haga por ella.',
  },
  {
    title: 'Auditoría e investigación',
    text: 'Reviso lo que ya existe y analizo a la competencia para detectar oportunidades reales de mejora.',
  },
  {
    title: 'Concepto',
    text: 'Traduzco lo aprendido en una propuesta conceptual clara, que validamos juntos antes de producir nada más.',
  },
  {
    title: 'Sistema y aplicaciones',
    text: 'Desarrollo la identidad visual y la aplico a todos los soportes: papelería, producto, espacios y entorno digital.',
  },
  {
    title: 'Entrega',
    text: 'Dejo los materiales organizados, en formatos editables y con las guías necesarias para que la marca siga funcionando sin mí.',
  },
];

export const introPorDefecto = {
  title: 'Diseño visual que trabaja para tu marca',
  lead: 'Soy Rafael Hijano, diseñador visual freelance en Málaga.',
  body: 'En esta página tienes lo que puedo hacer por tu proyecto, cómo trabajo y algunos ejemplos reales. Si encaja con lo que buscas, cuéntame tu caso y te respondo con una propuesta.',
};

/* Texto principal según la categoría con la que se entra (servicios#slug). */
export const introPorArea: Record<string, typeof introPorDefecto> = {
  branding: {
    title: 'Identidad de marca que se reconoce y se recuerda',
    lead: 'Soy Rafael Hijano, diseñador de identidad visual freelance en Málaga.',
    body: 'Creo y renuevo marcas desde la estrategia: investigación, concepto, logotipo, sistema gráfico y manual de identidad. Si tu marca necesita nacer o renovarse con coherencia, cuéntame tu caso y te respondo con una propuesta.',
  },
  editorial: {
    title: 'Diseño editorial y packaging con oficio',
    lead: 'Soy Rafael Hijano, diseñador editorial y de packaging freelance en Málaga.',
    body: 'Diseño y maqueto catálogos, publicaciones, packaging y papelería corporativa, cuidando los detalles de producción y coordinándome con la imprenta. Cuéntame qué necesitas imprimir y te respondo con una propuesta.',
  },
  'motion-graphics': {
    title: 'Motion graphics para que tu marca también se mueva',
    lead: 'Soy Rafael Hijano, diseñador de motion graphics freelance en Málaga.',
    body: 'Animo identidades y piezas para vídeo, redes sociales y plataformas audiovisuales, manteniendo el lenguaje visual de tu marca en movimiento. Cuéntame tu proyecto y te respondo con una propuesta.',
  },
  'ux-ui': {
    title: 'Interfaces y webs que llevan tu marca al entorno digital',
    lead: 'Soy Rafael Hijano, diseñador UX/UI y web freelance en Málaga.',
    body: 'Diseño interfaces y webs coherentes con la identidad de tu marca, cuidando el flujo de uso y, en tiendas online, una experiencia de compra agradable. Cuéntame tu caso y te respondo con una propuesta.',
  },
  ilustracion: {
    title: 'Ilustración con carácter para tu marca o tu proyecto',
    lead: 'Soy Rafael Hijano, ilustrador y diseñador visual freelance en Málaga.',
    body: 'Creo ilustraciones originales, también animadas, que dan una voz visual propia a marcas y proyectos. Cuéntame qué tienes en mente y te respondo con una propuesta.',
  },
};
