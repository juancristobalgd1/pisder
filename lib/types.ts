export type Operacion = "alquilar" | "comprar";
export type Tipo = "piso" | "atico" | "estudio" | "duplex" | "chalet" | "casa" | "local" | "garaje" | "terreno" | "habitacion" | "oficina";
export type Fuente = "idealista" | "fotocasa" | "habitaclia" | "pisos.com" | "particular" | "agencia";

export interface Listing {
  id: string;
  operacion: Operacion;
  tipo: Tipo;
  titulo: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  provincia: string;
  lat: number;
  lng: number;
  precio: number;          // EUR (mensual si alquiler)
  gastosComunidad?: number; // EUR/mes
  m2: number;
  habitaciones: number;
  banos: number;
  planta?: string;
  extras: string[];        // terraza, ascensor, garaje, piscina, mascotas, amueblado, aire, exterior, trastero, calefaccion
  fotos: string[];
  descripcion: string;
  fuente: Fuente;
  fuentes: { nombre: Fuente; url: string; precio: number }[]; // misma vivienda en varios portales (deduplicada)
  anunciante: { tipo: "agencia" | "particular"; nombre: string; telefono: string; verificado: boolean };
  publicadoEn: string;     // ISO
  distPlaya?: number;
  real?: boolean;           // anuncio real importado de un feed de inmobiliaria
  ref?: string;       // km a la playa más cercana (ciudades de costa)
  eficiencia?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  destacada?: boolean;
}

export interface SearchFilters {
  q?: string;
  operacion: Operacion;
  provincia?: string;
  ciudad?: string;
  barrio?: string;
  tipos?: Tipo[];
  precioMin?: number;
  precioMax?: number;
  m2Min?: number;
  m2Max?: number;
  habMin?: number;
  banosMin?: number;
  extras?: string[];
  soloParticulares?: boolean;
  cercaPlayaKm?: number;
  orden?: "recientes" | "precio_asc" | "precio_desc" | "m2_desc" | "relevancia" | "precio_m2";
  bbox?: [number, number, number, number]; // sur, oeste, norte, este
  page?: number;
  perPage?: number;
}

export interface SearchResult {
  total: number;
  items: Listing[];
  filtros: SearchFilters;
  interpretacion: string[]; // chips "lo que entendió la IA"
  page: number;
  pages: number;
}
