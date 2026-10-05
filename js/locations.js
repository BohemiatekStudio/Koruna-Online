/* ================================================================= */
/* LOCATIONS.JS - Načítání lokací z JSONů a jejich vykreslení na mapu */
/* ================================================================= */

class LocationManager {
    constructor(mapInstance, playerMapInstance) {
        this.map = mapInstance;
        this.playerMap = playerMapInstance;
        this.locations = new Map(); // Uložení načtených lokací (id -> data)
        this.locationMarkers = new Map(); // ID -> Leaflet marker lokace
    }

    // Načtení všech JSON souborů s lokacemi
    async loadLocations() {
        const files = ['city.json', 'forest.json', 'cave.json'];

        for (const file of files) {
            try {
                const response = await fetch(`json/location/${file}`);
                if (!response.ok) throw new Error(`Chyba při načítání ${file}`);
                
                const data = await response.json();
                
                // Zpracování lokací v souboru
                data.locations.forEach(loc => {
                    this.locations.set(loc.id, loc);
                    this.renderLocationMarker(loc);
                });
            } catch (error) {
                console.error(`Nepodařilo se načíst lokaci ze souboru ${file}:`, error);
            }
        }

        // Po načtení lokací umístíme hráče do výchozí startovní lokace (město)
        this.initStartPlayerPosition();
    }

    // Vykreslení ikonky lokace na mapu
    renderLocationMarker(loc) {
        // Barva podle typu lokace
        let bgColor = '#7f8c8d'; // výchozí šedá
        if (loc.type === 'city') bgColor = '#e74c3c';       // červená
        else if (loc.type === 'forest') bgColor = '#27ae60'; // zelená
        else if (loc.type === 'cave') bgColor = '#8e44ad';   // fialová (jeskyně)
        else if (loc.type === 'mine') bgColor = '#d35400';   // oranžovo-hnědá (důl)

        const locIcon = L.divIcon({
            className: 'location-node-marker',
            html: `<div style="background-color: ${bgColor}; width: 12px; height: 12px; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.8); cursor: pointer;" title="${loc.name}"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        const marker = L.marker(loc.coords, { icon: locIcon }).addTo(this.map);
        
        // Popup s názvem lokace
        marker.bindPopup(`<b>${loc.name}</b><br><small>Typ: ${loc.type}</small><br><button onclick="window.locationManager.travelTo('${loc.id}')" style="margin-top: 5px; cursor: pointer;">Cestovat sem</button>`);

        this.locationMarkers.set(loc.id, marker);
    }

    // Umístění hráče do startovní lokace při spuštění hry
    initStartPlayerPosition() {
        const startLoc = this.locations.get('mesto');
        if (startLoc && this.playerMap) {
            this.playerMap.initPlayerAtLocation(startLoc.id, startLoc.coords, "Tvůj hrdina");
            this.playerMap.centerOnPlayer(startLoc.coords);
        }
    }

    // Metoda pro zahájení cestování
    travelTo(locationId) {
        const targetLoc = this.locations.get(locationId);
        if (!targetLoc) return;

        if (this.playerMap.currentLocationId === locationId) {
            alert("Už se v této lokaci nacházíš!");
            return;
        }

        console.log(`Zahájena cesta do: ${targetLoc.name}`);
        
        // Okamžitý přesun (později zde bude 10min timer)
        this.playerMap.initPlayerAtLocation(targetLoc.id, targetLoc.coords, "Tvůj hrdina");
        this.playerMap.centerOnPlayer(targetLoc.coords);
        
        alert(`Přicestoval jsi do: ${targetLoc.name}`);
    }
}

// Inicializace po spuštění stránky
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (typeof map !== 'undefined' && window.playerMap) {
            window.locationManager = new LocationManager(map, window.playerMap);
            window.locationManager.loadLocations();
        }
    }, 800);
});