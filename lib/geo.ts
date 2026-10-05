// Gazetteer España: ciudades y barrios con coordenadas aproximadas (centroides).
export interface Barrio { nombre: string; slug: string; lat: number; lng: number; factor: number }
export interface Ciudad { nombre: string; slug: string; provincia: string; lat: number; lng: number; alquilerM2: number; ventaM2: number; foto: string; barrios: Barrio[] }

const b = (nombre: string, lat: number, lng: number, factor = 1): Barrio => ({
  nombre, lat, lng, factor,
  slug: nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
});

// alquilerM2 / ventaM2: valores de referencia para generar datos demo (no son datos oficiales)
export const CIUDADES: Ciudad[] = [
  { nombre: "Madrid", slug: "madrid", provincia: "Madrid", lat: 40.4168, lng: -3.7038, alquilerM2: 21, ventaM2: 5200, foto: "madrid", barrios: [
    b("Malasaña", 40.4262, -3.7046, 1.15), b("Chamberí", 40.4342, -3.7037, 1.2), b("Salamanca", 40.4300, -3.6780, 1.45),
    b("Lavapiés", 40.4087, -3.7010, 0.95), b("Chueca", 40.4227, -3.6977, 1.2), b("Retiro", 40.4110, -3.6760, 1.25),
    b("Arganzuela", 40.3980, -3.6990, 0.95), b("Tetuán", 40.4600, -3.6980, 0.85), b("Carabanchel", 40.3830, -3.7400, 0.7),
    b("Chamartín", 40.4590, -3.6770, 1.3), b("La Latina", 40.4110, -3.7110, 1.05), b("Moncloa", 40.4350, -3.7190, 1.1) ] },
  { nombre: "Barcelona", slug: "barcelona", provincia: "Barcelona", lat: 41.3874, lng: 2.1686, alquilerM2: 22, ventaM2: 4800, foto: "barcelona", barrios: [
    b("Eixample", 41.3890, 2.1610, 1.2), b("Gràcia", 41.4030, 2.1560, 1.15), b("El Born", 41.3850, 2.1820, 1.2),
    b("Poblenou", 41.4030, 2.2000, 1.1), b("Sants", 41.3750, 2.1350, 0.9), b("Sant Gervasi", 41.4020, 2.1380, 1.35),
    b("Barceloneta", 41.3800, 2.1890, 1.1), b("Sant Antoni", 41.3780, 2.1610, 1.05), b("Horta", 41.4300, 2.1600, 0.8) ] },
  { nombre: "Valencia", slug: "valencia", provincia: "Valencia", lat: 39.4699, lng: -0.3763, alquilerM2: 14, ventaM2: 2600, foto: "valencia", barrios: [
    b("Ruzafa", 39.4620, -0.3740, 1.15), b("El Carmen", 39.4790, -0.3790, 1.1), b("Benimaclet", 39.4870, -0.3600, 0.95),
    b("El Cabanyal", 39.4690, -0.3300, 1.0), b("Campanar", 39.4810, -0.4000, 0.9), b("Eixample", 39.4660, -0.3700, 1.2) ] },
  { nombre: "Sevilla", slug: "sevilla", provincia: "Sevilla", lat: 37.3891, lng: -5.9845, alquilerM2: 12, ventaM2: 2400, foto: "sevilla", barrios: [
    b("Triana", 37.3840, -6.0030, 1.15), b("Nervión", 37.3830, -5.9720, 1.1), b("Casco Antiguo", 37.3900, -5.9930, 1.2),
    b("Los Remedios", 37.3750, -5.9980, 1.15), b("Macarena", 37.4040, -5.9880, 0.85) ] },
  { nombre: "Málaga", slug: "malaga", provincia: "Málaga", lat: 36.7213, lng: -4.4214, alquilerM2: 15, ventaM2: 3300, foto: "malaga", barrios: [
    b("Centro", 36.7210, -4.4200, 1.2), b("El Palo", 36.7220, -4.3650, 1.0), b("Teatinos", 36.7230, -4.4730, 0.9),
    b("La Malagueta", 36.7190, -4.4110, 1.35), b("Huelin", 36.7020, -4.4400, 0.9) ] },
  { nombre: "Bilbao", slug: "bilbao", provincia: "Bizkaia", lat: 43.2630, lng: -2.9350, alquilerM2: 15, ventaM2: 3400, foto: "bilbao", barrios: [
    b("Abando", 43.2620, -2.9330, 1.25), b("Casco Viejo", 43.2590, -2.9240, 1.05), b("Indautxu", 43.2600, -2.9430, 1.25),
    b("Deusto", 43.2710, -2.9460, 1.0), b("Santutxu", 43.2530, -2.9170, 0.85) ] },
  { nombre: "Donostia / San Sebastián", slug: "donostia", provincia: "Gipuzkoa", lat: 43.3183, lng: -1.9812, alquilerM2: 19, ventaM2: 6000, foto: "donostia", barrios: [
    b("Centro", 43.3200, -1.9830, 1.3), b("Gros", 43.3240, -1.9750, 1.15), b("Antiguo", 43.3110, -2.0020, 1.1),
    b("Amara", 43.3080, -1.9790, 0.95), b("Egia", 43.3180, -1.9700, 0.9) ] },
  { nombre: "Zaragoza", slug: "zaragoza", provincia: "Zaragoza", lat: 41.6488, lng: -0.8891, alquilerM2: 10, ventaM2: 1900, foto: "zaragoza", barrios: [
    b("Centro", 41.6500, -0.8800, 1.2), b("Delicias", 41.6480, -0.9100, 0.85), b("Actur", 41.6700, -0.8900, 0.95), b("Universidad", 41.6430, -0.9000, 1.05) ] },
  { nombre: "Palma", slug: "palma", provincia: "Illes Balears", lat: 39.5696, lng: 2.6502, alquilerM2: 17, ventaM2: 4200, foto: "palma", barrios: [
    b("Santa Catalina", 39.5720, 2.6370, 1.25), b("Son Espanyolet", 39.5770, 2.6330, 1.05), b("Casco Antiguo", 39.5700, 2.6500, 1.3), b("Portixol", 39.5600, 2.6780, 1.2) ] },
  { nombre: "Eibar", slug: "eibar", provincia: "Gipuzkoa", lat: 43.1844, lng: -2.4730, alquilerM2: 10, ventaM2: 2300, foto: "eibar", barrios: [
    b("Centro", 43.1844, -2.4730, 1.1), b("Amaña", 43.1810, -2.4800, 0.95), b("Urki", 43.1890, -2.4660, 0.9) ] },
  { nombre: "Elgoibar", slug: "elgoibar", provincia: "Gipuzkoa", lat: 43.2148, lng: -2.4138, alquilerM2: 9, ventaM2: 2100, foto: "elgoibar", barrios: [
    b("Centro", 43.2148, -2.4138, 1.05), b("San Roke", 43.2120, -2.4180, 0.95), b("Olaso", 43.2170, -2.4090, 1.0) ] },
];

export const ciudadPorSlug = (s?: string) => CIUDADES.find((c) => c.slug === s);
export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
