export const NEGATIVE_TAGS = [
  "Se fue con el anticipo",
  "Abandono de obra",
  "Material de menor calidad",
  "Malos acabados",
  "No respetó garantía",
  "Cobros ocultos",
  "Impuntual",
] as const;

export const POSITIVE_TAGS = [
  "Entrega a tiempo",
  "Respetó presupuesto",
  "Excelente acabado",
  "Limpio para trabajar",
  "Cumplió garantía",
] as const;

export const COST_RANGES = [
  "Menos de $5,000",
  "$5,000 - $20,000",
  "$20,000 - $50,000",
  "Más de $50,000",
] as const;

export const SERVICE_CATEGORIES = [
  { name: "Cocinas integrales", slug: "cocinas-integrales", icon: "cooking" },
  { name: "Clósets", slug: "closets", icon: "cabinet" },
  { name: "Carpintería", slug: "carpinteria", icon: "hammer" },
  { name: "Herrería", slug: "herreria", icon: "anvil" },
  { name: "Plomería", slug: "plomeria", icon: "droplet" },
  { name: "Electricidad", slug: "electricidad", icon: "zap" },
  { name: "Albañilería", slug: "albanileria", icon: "brick" },
  { name: "Aluminio y cancelería", slug: "aluminio", icon: "panels" },
  { name: "Pintura", slug: "pintura", icon: "paint" },
  { name: "Impermeabilización", slug: "impermeabilizacion", icon: "umbrella" },
  { name: "Yeso y tablaroca", slug: "yeso-tablaroca", icon: "wall" },
  { name: "Pisos y azulejos", slug: "pisos-azulejos", icon: "grid" },
  { name: "Vidriería", slug: "vidrieria", icon: "glass" },
  { name: "Cancelería de PVC", slug: "canceleria-pvc", icon: "window" },
  { name: "Toldos y lonas", slug: "toldos-lonas", icon: "awning" },
  { name: "Persianas y cortinas", slug: "persianas-cortinas", icon: "blinds" },
  { name: "Aire acondicionado", slug: "aire-acondicionado", icon: "snowflake" },
  { name: "Calentadores y boiler", slug: "calentadores-boiler", icon: "flame" },
  { name: "Gas", slug: "gas", icon: "gas" },
  { name: "Tinacos y cisternas", slug: "tinacos-cisternas", icon: "tank" },
  { name: "Fumigación", slug: "fumigacion", icon: "bug" },
  { name: "Jardinería y paisajismo", slug: "jardineria", icon: "leaf" },
  { name: "Cerámica y mosaicos", slug: "ceramica-mosaicos", icon: "tiles" },
  { name: "Mármol y granito", slug: "marmol-granito", icon: "stone" },
  { name: "Soldadura", slug: "soldadura", icon: "weld" },
  { name: "Techumbres y lámina", slug: "techumbres-lamina", icon: "roof" },
  { name: "Cancelería de madera", slug: "canceleria-madera", icon: "door" },
  { name: "Puertas y portones", slug: "puertas-portones", icon: "gate" },
  { name: "Cerrajería", slug: "cerrajeria", icon: "key" },
  { name: "Alfombras y pisos vinílicos", slug: "alfombras-vinilicos", icon: "floor" },
  { name: "Tapicería", slug: "tapiceria", icon: "sofa" },
  { name: "Muebles a la medida", slug: "muebles-medida", icon: "furniture" },
  { name: "Baños y remodelación", slug: "banos-remodelacion", icon: "bath" },
  { name: "Drywall y plafones", slug: "drywall-plafones", icon: "ceiling" },
  { name: "Iluminación", slug: "iluminacion", icon: "bulb" },
  { name: "Domótica y automatización", slug: "domotica", icon: "home" },
  { name: "Paneles solares", slug: "paneles-solares", icon: "sun" },
  { name: "Cisternas y pozos", slug: "cisternas-pozos", icon: "well" },
  { name: "Riego por aspersión", slug: "riego-aspersion", icon: "sprinkler" },
  { name: "Pérgolas y terrazas", slug: "pergolas-terrazas", icon: "pergola" },
  { name: "Barandales y pasamanos", slug: "barandales", icon: "rail" },
  { name: "Escaleras", slug: "escaleras", icon: "stairs" },
  { name: "Chimeneas y asadores", slug: "chimeneas-asadores", icon: "fireplace" },
  { name: "Piscinas y spa", slug: "piscinas-spa", icon: "pool" },
  { name: "Limpieza profunda", slug: "limpieza-profunda", icon: "clean" },
  { name: "Mudanzas y acarreos", slug: "mudanzas", icon: "truck" },
  { name: "Arquitectura e interiorismo", slug: "arquitectura-interiorismo", icon: "blueprint" },
  { name: "Ingeniería estructural", slug: "ingenieria-estructural", icon: "structure" },
] as const;

export const MEDIA_LABELS = {
  DEFECT_EVIDENCE: "Foto del problema",
  COMPLETED_WORK: "Foto del trabajo terminado",
  CONTRACT_RECEIPT: "Contrato o nota",
  PROVIDER_REPLY_PROOF: "Foto de la respuesta del negocio",
} as const;

export const VERDICT_LABELS = {
  BUENO: "Lo recomiendan",
  REGULAR: "Regular",
  MALO: "No lo recomiendan",
} as const;

export const STATUS_LABELS = {
  PUBLISHED: "Publicada",
  PROVIDER_REPLIED: "El negocio respondió",
  RESOLVED_AFTER_ISSUE: "Ya lo resolvieron",
  UNDER_MODERATION: "En revisión",
} as const;

export const MEXICAN_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila de Zaragoza",
  "Colima",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "México",
  "Michoacán de Ocampo",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz de Ignacio de la Llave",
  "Yucatán",
  "Zacatecas",
] as const;

export const MAX_REVIEW_PHOTOS = 5;
export const MAX_REPLY_PHOTOS = 3;
export const EVIDENCE_BUCKET = "evidencias";
