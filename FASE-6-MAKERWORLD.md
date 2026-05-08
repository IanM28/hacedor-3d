# FASE 6 — Feature: Explorador de Modelos Externos
# Hacedor 3D — Especificacion Funcional

Esta feature NO forma parte del desarrollo inicial.
Agregar al CLAUDE.md como FASE 6 una vez que las Fases 1 a 5 esten completas y en produccion.

---

## Concepto

Agregar una seccion dentro del sitio de Hacedor 3D llamada "Mas Modelos" o "Explorar Modelos".

Esta seccion permite al usuario:
1. Descubrir modelos 3D en plataformas externas (MakerWorld, Printables)
2. Guardar links de modelos que le interesan
3. Enviar esos links directamente por WhatsApp para solicitar presupuesto

El usuario nunca sale del flujo de Hacedor 3D para hacer una consulta.
La experiencia es: encuentro el modelo → pego el link → mando a WhatsApp → listo.

---

## Plataformas externas soportadas

### MakerWorld (makerworld.com)
- NO tiene API publica oficial
- Opcion: boton "Explorar en MakerWorld" que abre makerworld.com en nueva pestana
- El usuario copia el link del modelo que le interesa y lo pega en el box

### Printables (printables.com)
- Tiene documentacion de API mas accesible
- Opcion A: iframe embed (limitado por politica del sitio)
- Opcion B: link directo + box de links igual que MakerWorld
- Opcion C (recomendada para MVP): misma logica que MakerWorld, link directo

### Conclusion para MVP
Ambas plataformas usan el mismo flujo: el usuario busca en la plataforma externa,
copia el link del modelo y lo pega en el box de Hacedor 3D para armar su consulta.

---

## Diseno de la pagina /modelos-externos

```
+-------------------------------------------------------+
|  EXPLORA MODELOS EN PLATAFORMAS EXTERNAS              |
|                                                       |
|  Encontra el modelo que queres, copia el link         |
|  y pedinos presupuesto directamente por WhatsApp.     |
|                                                       |
|  [ Explorar en MakerWorld ]  [ Explorar en Printables]|
|  (abre en nueva pestana)      (abre en nueva pestana) |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|  ARMA TU CONSULTA                                     |
|                                                       |
|  Pega los links de los modelos que te interesan:      |
|                                                       |
|  [  https://makerworld.com/...               ] [x]   |
|  [  https://makerworld.com/...               ] [x]   |
|  [  https://printables.com/...               ] [x]   |
|  [ + Agregar otro modelo ]                            |
|                                                       |
|  Tu nombre: [___________________________]             |
|  Comentario opcional: [_________________]             |
|  (material, color, cantidad, etc.)                    |
|                                                       |
|  [ Enviar consulta por WhatsApp ]                     |
|                                                       |
+-------------------------------------------------------+
```

---

## Logica del componente ModelQuoteBox

### Estado interno

```typescript
interface ModelLink {
  id: string       // uuid local para el key de React
  url: string
  isValid: boolean
}

interface QuoteFormState {
  links: ModelLink[]
  name: string
  comment: string
}
```

### Validacion de links

Aceptar solo URLs que contengan:
- makerworld.com
- printables.com
- thingiverse.com (opcional, agregar si se quiere ampliar)

Mostrar error inline si el link no coincide con ninguna plataforma valida.

### Construccion del mensaje de WhatsApp

Ejemplo con 3 links:

```
Hola! Soy [nombre]. Quiero presupuesto para imprimir los siguientes modelos:

1. https://makerworld.com/en/models/123456
2. https://makerworld.com/en/models/789012
3. https://printables.com/model/456789

Comentario: quiero en PLA negro, 3 unidades de cada uno.
```

Funcion buildQuoteMessage:

```typescript
function buildQuoteMessage(state: QuoteFormState): string {
  const linkLines = state.links
    .filter(l => l.isValid && l.url.trim() !== '')
    .map((l, i) => `${i + 1}. ${l.url.trim()}`)
    .join('\n')

  const comment = state.comment.trim()
    ? `\nComentario: ${state.comment.trim()}`
    : ''

  return (
    `Hola! Soy ${state.name.trim()}. ` +
    `Quiero presupuesto para imprimir los siguientes modelos:\n\n` +
    linkLines +
    comment
  )
}

function buildWhatsAppUrl(message: string): string {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
```

### Comportamiento del boton enviar

1. Validar que haya al menos 1 link valido
2. Validar que el nombre no este vacio
3. Construir el mensaje
4. Abrir wa.me en nueva pestana (window.open)
5. Mostrar toast: "Consulta enviada. Te respondemos a la brevedad."

---

## Componentes a crear

### Pagina: ExternalModelsPage (/modelos-externos)

```
frontend/src/pages/ExternalModels/
  index.tsx          Pagina principal
  ModelLinkInput.tsx Input individual de un link con boton eliminar
  ModelQuoteBox.tsx  Box completo con lista de links + form + boton WA
  platformLinks.ts   Constantes con URLs de plataformas externas
```

### platformLinks.ts

```typescript
export const PLATFORMS = [
  {
    name: 'MakerWorld',
    url: 'https://makerworld.com/en/search',
    domain: 'makerworld.com',
    label: 'Explorar en MakerWorld',
  },
  {
    name: 'Printables',
    url: 'https://www.printables.com/model',
    domain: 'printables.com',
    label: 'Explorar en Printables',
  },
]

export const VALID_DOMAINS = PLATFORMS.map(p => p.domain)

export function isValidModelUrl(url: string): boolean {
  return VALID_DOMAINS.some(domain => url.includes(domain))
}
```

---

## Entrada desde otras partes del sitio

Agregar en el Header y en el Footer un link a /modelos-externos.
Texto sugerido: "Mas modelos" o "Pedir presupuesto personalizado"

Agregar al final de la pagina del Catalogo un banner:

```
+--------------------------------------------------+
|  No encontraste lo que buscas?                   |
|  Explora miles de modelos en MakerWorld y        |
|  Printables y pedinos presupuesto.               |
|                                                  |
|  [ Ver modelos externos ]                        |
+--------------------------------------------------+
```

---

## Diseno visual

Seguir el design system del CLAUDE.md exactamente.

El boton "Explorar en MakerWorld" y "Explorar en Printables":
- Estilo: outline / borde --color-border-light
- No usar el verde del logo para estos — son acciones secundarias
- Icono: ExternalLink de Lucide

El boton "Enviar consulta por WhatsApp":
- Fondo #25D366 (verde WhatsApp), icono MessageCircle de Lucide
- Es el CTA principal de esta pagina

Los inputs de links:
- Fondo --color-surface
- Border --color-border
- Focus: border --color-accent
- Error: border --color-red + mensaje inline

---

## Limitaciones conocidas y decisiones tomadas

- No hay preview del modelo al pegar el link (no hay API publica de MakerWorld)
- El usuario es responsable de pegar el link correcto
- No hay backend involucrado en esta feature — es 100% frontend + WhatsApp link
- Si en el futuro MakerWorld lanza API publica, se puede agregar preview de thumbnail

---

## Prompt para Claude Code cuando llegue esta fase

Copiar al inicio de la sesion:

  Lee el archivo CLAUDE.md en la raiz del proyecto.
  Vamos a implementar la FASE 6 segun el documento FASE-6-MAKERWORLD.md.
  La tarea de hoy es: [componente especifico, ej: "crear ModelQuoteBox con validacion de links"].
  Antes de escribir codigo, confirmame que archivos vas a crear o modificar.
