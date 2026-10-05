// js/items.js - Načítání itemů ze složky json/items/

const ItemManager = {
    database: {},

    async loadItems() {
        try {
            const files = [
                'head.json', 'neck.json', 'shoulders.json', 'back.json',
                'chest.json', 'shirt.json', 'tabard.json', 'wrists.json',
                'hands.json', 'waist.json', 'legs.json', 'feet.json',
                'ring.json', 'trinket.json', 'bag.json', 'pet.json', 'mount.json',
                'sword.json', 'mace.json', 'axe.json', 'off.json', 'ranged.json'
            ];

            for (const file of files) {
                try {
                    const response = await fetch(`json/items/${file}`);
                    if (!response.ok) continue;
                    
                    const items = await response.json();
                    const itemsArray = Array.isArray(items) ? items : [items];
                    itemsArray.forEach(item => {
                        if (item.id) {
                            this.database[item.id] = item;
                        }
                    });
                } catch (e) {
                    // Ignoruje chybějící soubory
                }
            }
            console.log("Všechny itemy úspěšně načteny:", this.database);
        } catch (error) {
            console.error("Chyba při načítání předmětů:", error);
        }
    },

    getItem(id) {
        return this.database[id] || null;
    }
};