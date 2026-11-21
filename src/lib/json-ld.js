/**
 * Serialize structured data for a <script type="application/ld+json"> tag.
 * Escapes characters that could close the script tag or start HTML comments,
 * so product text from the database can never inject markup.
 */
const BACKSLASH = String.fromCharCode(92);
const ESCAPES = [
  [/</g, BACKSLASH + "u003c"],
  [/>/g, BACKSLASH + "u003e"],
  [/&/g, BACKSLASH + "u0026"],
  [new RegExp(String.fromCharCode(0x2028), "g"), BACKSLASH + "u2028"],
  [new RegExp(String.fromCharCode(0x2029), "g"), BACKSLASH + "u2029"],
];

export function toJsonLd(data) {
  return ESCAPES.reduce((json, [pattern, replacement]) => json.replace(pattern, replacement), JSON.stringify(data));
}
