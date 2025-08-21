// Script Node.js pour corriger/ajouter les propriétés dans les fichiers GeoJSON
// Usage : node fix-geojson.js <fichier> <niveau>
// niveau = region | department | arrondissement

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const level = process.argv[3];

if (!filePath || !level) {
  console.error('Usage : node fix-geojson.js <fichier> <niveau>');
  process.exit(1);
}

const raw = fs.readFileSync(filePath, 'utf8');
const geojson = JSON.parse(raw);

geojson.features = geojson.features.map((feature, idx) => {
  // Ajout des propriétés selon le niveau
  if (level === 'region') {
    feature.properties.region_id = feature.properties.region_id || String(idx + 1).padStart(2, '0');
    feature.properties.name = feature.properties.name || `Région ${feature.properties.region_id}`;
  }
  if (level === 'department') {
    feature.properties.department_id = feature.properties.department_id || String(idx + 1).padStart(4, '0');
    feature.properties.region_id = feature.properties.region_id || feature.properties.region || '01';
    feature.properties.name = feature.properties.name || `Département ${feature.properties.department_id}`;
  }
  if (level === 'arrondissement') {
    feature.properties.arrondissement_id = feature.properties.arrondissement_id || String(idx + 1).padStart(6, '0');
    feature.properties.department_id = feature.properties.department_id || feature.properties.departement || '0101';
    feature.properties.name = feature.properties.name || `Arrondissement ${feature.properties.arrondissement_id}`;
  }
  return feature;
});

const outPath = path.join(path.dirname(filePath), 'fixed_' + path.basename(filePath));
fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2), 'utf8');
console.log('Fichier corrigé sauvegardé sous :', outPath);
