// 1. Inicializace mapy s 2D souřadnicovým systémem
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 2,
    zoom: -1
});

const tileSize = 1024;

// Seznam dlaždic: každá má své souřadnice [řádek, sloupec] a vlastní cestu k obrázku
const tiles = [
    { r: 0, c: 0, url: 'assets/images/map/map1.png' },     // Střed
    { r: -1, c: 0, url: 'assets/images/map/map1.png' },   // Nahoru (příklad názvu)
    { r: 1, c: 0, url: 'assets/images/map/map1.png' }, // Dolů
    { r: 0, c: -1, url: 'assets/images/map/map1.png' },// Vlevo
    { r: 0, c: 1, url: 'assets/images/map/map1.png' },// Vpravo
    { r: 0, c: 4, url: 'assets/images/map/map1.png' }   // Vzdálená vpravo
];

// Vykreslení všech dlaždic na mapu
tiles.forEach(tile => {
    const bounds = [
        [tile.r * tileSize, tile.c * tileSize],          // [minY, minX]
        [(tile.r + 1) * tileSize, (tile.c + 1) * tileSize] // [maxY, maxX]
    ];
    L.imageOverlay(tile.url, bounds).addTo(map);
});

// Výpočet celkových hranic pro počáteční zobrazení mapy
const rows = tiles.map(t => t.r);
const cols = tiles.map(t => t.c);

const minR = Math.min(...rows);
const maxR = Math.max(...rows);
const minC = Math.min(...cols);
const maxC = Math.max(...cols);

const totalBounds = [
    [minR * tileSize, minC * tileSize],
    [(maxR + 1) * tileSize, (maxC + 1) * tileSize]
];

map.fitBounds(totalBounds);