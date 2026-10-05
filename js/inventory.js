// js/inventory.js - Správa inventáře, načítání itemů a batohů

const PlayerInventory = {
    slots: Array(20).fill(null),
    baseSlotsCount: 20,

    addItem(itemId) {
        const item = ItemManager.getItem(itemId);
        if (!item) return false;

        const emptyIndex = this.slots.findIndex(slot => slot === null);
        if (emptyIndex === -1) return false;

        this.slots[emptyIndex] = item;
        this.renderInventory();
        return true;
    },

    updateBagSlots() {
        let extraSlots = 0;
        if (window.player && window.player.equipment) {
            ['bag1', 'bag2', 'bag3'].forEach(bagSlot => {
                const bagItem = window.player.equipment[bagSlot];
                if (bagItem && bagItem.slots) {
                    extraSlots += bagItem.slots;
                }
            });
        }

        const totalNeeded = this.baseSlotsCount + extraSlots;
        
        if (this.slots.length < totalNeeded) {
            while (this.slots.length < totalNeeded) {
                this.slots.push(null);
            }
        } else if (this.slots.length > totalNeeded) {
            // Kontrola ořezávaných slotů – pokud v nich něco je, zachráníme to do volných míst
            for (let i = totalNeeded; i < this.slots.length; i++) {
                if (this.slots[i] !== null) {
                    const orphanedItem = this.slots[i];
                    // Najdeme první volný slot v platném rozsahu inventáře
                    const freeSpot = this.slots.findIndex((s, idx) => s === null && idx < totalNeeded);
                    if (freeSpot !== -1) {
                        this.slots[freeSpot] = orphanedItem;
                    } else {
                        console.warn("Inventář je plný, předmět ze zrušeného slotu nemá kam jít!", orphanedItem);
                    }
                }
            }
            this.slots = this.slots.slice(0, totalNeeded);
        }

        this.renderInventory();
    },

    renderInventory() {
        const grid = document.querySelector('.inventory-grid');
        if (!grid) return;

        const slotElements = grid.querySelectorAll('.slot');
        if (slotElements.length !== this.slots.length) {
            grid.innerHTML = '';
            for (let i = 0; i < this.slots.length; i++) {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'slot';
                slotDiv.dataset.type = 'inventory';
                slotDiv.dataset.index = i;
                grid.appendChild(slotDiv);
            }
        }

        const currentSlots = grid.querySelectorAll('.slot');
        currentSlots.forEach((el, index) => {
            const item = this.slots[index];
            
            el.setAttribute('draggable', item !== null);
            el.dataset.type = 'inventory';
            el.dataset.index = index;

            if (item) {
                el.innerHTML = `<img src="${item.icon}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;">`;
                el.style.borderColor = "#d4af37";
            } else {
                el.innerHTML = "";
                el.style.borderColor = "";
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await ItemManager.loadItems();
    
    PlayerInventory.addItem("chest_hadry");
    PlayerInventory.addItem("legs_hadry");
    PlayerInventory.addItem("falcon");
    PlayerInventory.addItem("horse1");
    PlayerInventory.addItem("bag5");
    PlayerInventory.addItem("mace_klacek");
    PlayerInventory.addItem("off_torch");

    if (typeof renderEquipmentUI === 'function') renderEquipmentUI();
    if (typeof renderPlayerStats === 'function') renderPlayerStats();

    const invWindow = document.getElementById('inventory-window');
    const invHeader = document.getElementById('inventory-header');
    const btnInventory = document.getElementById('btn-inventory-func');
    const closeBtn = document.getElementById('close-inv');

    if (!invWindow || !btnInventory) return;

    if (closeBtn) {
        closeBtn.onclick = () => {
            invWindow.style.display = 'none';
        };
    }

    btnInventory.onclick = () => {
        const isHidden = invWindow.style.display === 'none' || invWindow.style.display === '';
        invWindow.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden && typeof PlayerMoney !== "undefined") {
            PlayerMoney.updateUI();
        }
    };

    if (invHeader) {
        invHeader.onmousedown = (e) => {
            if (e.button !== 0) return;
            let startX = e.clientX - invWindow.offsetLeft;
            let startY = e.clientY - invWindow.offsetTop;

            const onMouseMove = (moveEvent) => {
                invWindow.style.left = (moveEvent.clientX - startX) + 'px';
                invWindow.style.top = (moveEvent.clientY - startY) + 'px';
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
    }
});