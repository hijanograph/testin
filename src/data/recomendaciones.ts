// Recomendaciones de clientes y compañeros.
// Mientras el array esté vacío, la sección no se muestra en /sobre-mi.
//
// Formato:
// { quote: 'Texto de la recomendación.', name: 'Nombre Apellido', role: 'Cargo, Empresa' }
export interface Recomendacion {
  quote: string;
  name: string;
  role: string;
}

export const recomendaciones: Recomendacion[] = [];
