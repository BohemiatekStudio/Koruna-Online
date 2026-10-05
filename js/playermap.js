/* ================================================================= */
/* PLAYERMAP.JS - Správa pozice hráče a ostatních hráčů na mapě (Node-based) */
/* ================================================================= */

class PlayerMap {
    constructor(mapInstance) {
        this.map = mapInstance;
        this.playerMarker = null;
        this.otherPlayersMarkers = new Map(); // ID hráče -> Marker
        
        // Aktuální ID lokace, kde se hráč nachází
        this.currentLocationId = null;
        
        // Stav hráče: 'idle' (v klidu) nebo 'traveling' (na cestě)
        this.playerState = 'idle'; 
    }

    // Inicializace/Vykreslení značky hráče na souřadnicích konkrétní lokace
    initPlayerAtLocation(locationId, coords, playerName = "Tvůj hrdina") {
        if (!this.map) return;

        this.currentLocationId = locationId;

        // Vytvoření HTML ikony pro hráče
        const playerIcon = L.divIcon({
            className: 'hero-map-marker',
            html: '<div style="background-color: #d4af37; width: 16px; height: 16px; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background: #2c1e12; border-radius: 50%;"></div></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        if (this.playerMarker) {
            this.playerMarker.setLatLng(coords);
        } else {
            this.playerMarker = L.marker(coords, { icon: playerIcon }).addTo(this.map);
        }

        this.updatePlayerPopup(playerName);
    }

    // Aktualizace obsahu popup okna u hráče (např. při cestování nebo změně stavu)
    updatePlayerPopup(playerName) {
        if (!this.playerMarker) return;

        let popupContent = `<b>${playerName}</b><br>Lokace: ${this.currentLocationId}`;
        
        if (this.playerState === 'traveling') {
            popupContent = `<b>${playerName}</b><br><span style="color: #e67e22;">Cestuje do nové lokace... (zranitelný)</span>`;
        }

        this.playerMarker.bindPopup(popupContent);
    }

    // Nastavení stavu hráče (např. spuštění 10minutového cestování)
    setPlayerTraveling(isTraveling, playerName = "Tvůj hrdina") {
        this.playerState = isTraveling ? 'traveling' : 'idle';
        
        if (this.playerMarker) {
            // Změna vzhledu ikony při cestování (např. zprůhlednění nebo jiná barva)
            const opacity = isTraveling ? 0.6 : 1.0;
            this.playerMarker.setOpacity(opacity);
        }
        
        this.updatePlayerPopup(playerName);
    }

    // Střed mapy na aktuální lokaci hráče
    centerOnPlayer(coords) {
        if (this.map && coords) {
            this.map.setView(coords, this.map.getZoom());
        }
    }

    // Zobrazení/aktualizace jiného hráče ve stejné lokaci
    updateOtherPlayer(playerId, coords, playerName, detailsCallback) {
        let marker = this.otherPlayersMarkers.get(playerId);

        const otherIcon = L.divIcon({
            className: 'other-player-marker',
            html: '<div style="background-color: #3498db; width: 14px; height: 14px; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.8);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        if (marker) {
            marker.setLatLng(coords);
        } else {
            marker = L.marker(coords, { icon: otherIcon }).addTo(this.map);
            
            // Po kliknutí na jiného hráče se může otevřít jeho profil
            marker.on('click', () => {
                if (typeof detailsCallback === 'function') {
                    detailsCallback(playerId, playerName);
                }
            });

            marker.bindPopup(`<b>Hráč:</b> ${playerName}<br><small>Klikni pro profil</small>`);
            this.otherPlayersMarkers.set(playerId, marker);
        }
    }

    // Odstranění jiného hráče z mapy (odešel / odpojil se)
    removeOtherPlayer(playerId) {
        const marker = this.otherPlayersMarkers.get(playerId);
        if (marker) {
            this.map.removeLayer(marker);
            this.otherPlayersMarkers.delete(playerId);
        }
    }
}

// Inicializace po načtení mapy
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (typeof map !== 'undefined') {
            window.playerMap = new PlayerMap(map);
        }
    }, 500);
});