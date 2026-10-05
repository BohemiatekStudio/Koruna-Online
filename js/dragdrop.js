// js/dragdrop.js - Správa pro Drag & Drop, tooltipy a české názvy slotů

const DragDropManager = {
    init() {
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => this.handleDrop(e));
        this.initTooltip();
    },

    handleDragStart(e) {
        const slot = e.target.closest('.slot');
        if (!slot) return;

        const sourceType = slot.dataset.type;
        const sourceKey = sourceType === 'inventory' ? slot.dataset.index : slot.dataset.slot;

        let item = sourceType === 'inventory' 
            ? PlayerInventory.slots[sourceKey] 
            : (window.player && window.player.equipment ? window.player.equipment[sourceKey] : null);

        if (!item) {
            e.preventDefault();
            return;
        }

        e.dataTransfer.setData('text/plain', JSON.stringify({ sourceType, sourceKey }));
    },

    handleDrop(e) {
        e.preventDefault();
        const targetSlot = e.target.closest('.slot');
        if (!targetSlot) return;

        const rawData = e.dataTransfer.getData('text/plain');
        if (!rawData) return;

        const { sourceType, sourceKey } = JSON.parse(rawData);
        const targetType = targetSlot.dataset.type;
        const targetKey = targetType === 'inventory' ? targetSlot.dataset.index : targetSlot.dataset.slot;

        let sourceItem = sourceType === 'inventory' 
            ? PlayerInventory.slots[sourceKey] 
            : (window.player && window.player.equipment ? window.player.equipment[sourceKey] : null);

        if (!sourceItem) return;

        if (targetType === 'equipment') {
            const itemSlotType = (sourceItem.slot || sourceItem.type || '').toLowerCase();
            const itemName = (sourceItem.name || '').toLowerCase();

            if (itemSlotType) {
                // Meče, sekery, palcáty nebo obecné zbraně patří POUZE do Hlavní (mainhand)
                if (['mace', 'sword', 'axe', 'weapon'].includes(itemSlotType)) {
                    if (targetKey !== 'mainhand') return;
                }
                // Pochodeň (torch) patří POUZE do Vedlejší (offhand)
                else if (itemSlotType === 'torch' || itemName.includes('torch')) {
                    if (targetKey !== 'offhand') return;
                }
                else if ((itemSlotType === 'bag' || itemSlotType === 'misc') && targetKey.startsWith('bag')) {
                    // Batohy do bag slotů
                } else if (itemSlotType === 'pet' && targetKey === 'pet') {
                    // Povolení pro mazlíčka
                } else if (itemSlotType === 'mount' && targetKey === 'mount') {
                    // Povolení pro mounta
                } else if (itemSlotType !== targetKey) {
                    return;
                }
            }
        }

        if (!window.player) window.player = {};
        if (!window.player.equipment) window.player.equipment = {};

        let targetItem = targetType === 'inventory' 
            ? PlayerInventory.slots[targetKey] 
            : window.player.equipment[targetKey];

        if (targetType === 'equipment' && targetItem) {
            const targetItemSlotType = (targetItem.slot || targetItem.type || '').toLowerCase();
            const targetItemName = (targetItem.name || '').toLowerCase();

            if (targetItemSlotType) {
                if (['mace', 'sword', 'axe', 'weapon'].includes(targetItemSlotType)) {
                    if (targetKey !== 'mainhand') return;
                }
                else if (targetItemSlotType === 'torch' || targetItemName.includes('torch')) {
                    if (targetKey !== 'offhand') return;
                }
                else if ((targetItemSlotType === 'bag' || targetItemSlotType === 'misc') && targetKey.startsWith('bag')) {
                    // V pořádku
                } else if (targetItemSlotType === 'pet' && targetKey === 'pet') {
                    // V pořádku
                } else if (targetItemSlotType === 'mount' && targetKey === 'mount') {
                    // V pořádku
                } else if (targetItemSlotType !== targetKey) {
                    return;
                }
            }
        }

        if (targetType === 'inventory') {
            PlayerInventory.slots[targetKey] = sourceItem;
        } else {
            window.player.equipment[targetKey] = sourceItem;
        }

        if (sourceType === 'inventory') {
            PlayerInventory.slots[sourceKey] = targetItem;
        } else {
            window.player.equipment[sourceKey] = targetItem;
        }

        if (typeof PlayerInventory.updateBagSlots === 'function') {
            PlayerInventory.updateBagSlots();
        }
        PlayerInventory.renderInventory();
        renderEquipmentUI();
        if (typeof renderPlayerStats === 'function') {
            renderPlayerStats();
        }
    },

    initTooltip() {
        const tooltip = document.getElementById('item-tooltip');
        if (!tooltip) return;

        document.addEventListener('mouseover', (e) => {
            const slot = e.target.closest('.slot');
            if (!slot) {
                tooltip.style.display = 'none';
                return;
            }

            const sourceType = slot.dataset.type;
            const sourceKey = sourceType === 'inventory' ? slot.dataset.index : slot.dataset.slot;

            let item = null;
            if (sourceType === 'inventory') {
                if (typeof PlayerInventory !== 'undefined' && PlayerInventory.slots) {
                    item = PlayerInventory.slots[sourceKey];
                }
            } else if (window.player && window.player.equipment) {
                item = window.player.equipment[sourceKey];
            }

            if (!item) {
                tooltip.style.display = 'none';
                return;
            }

            let statsHtml = '';
            if (item.armor) statsHtml += `<div>Zbroj: +${item.armor}</div>`;
            if (item.slots) statsHtml += `<div>Počet slotů: +${item.slots}</div>`;

            let dmgMinVal = null;
            let dmgMaxVal = null;

            if (item.stats) {
                for (const [key, val] of Object.entries(item.stats)) {
                    const lowerKey = key.toLowerCase();

                    if (lowerKey === 'dmgmin') {
                        dmgMinVal = val;
                        continue;
                    }
                    if (lowerKey === 'dmgmax') {
                        dmgMaxVal = val;
                        continue;
                    }

                    let statName = key.toUpperCase();
                    if (lowerKey === 'strength' || lowerKey === 'str') statName = 'Síla';
                    else if (lowerKey === 'agility' || lowerKey === 'agi' || lowerKey === 'dexterity' || lowerKey === 'dex') statName = 'Obratnost';
                    else if (lowerKey === 'stamina' || lowerKey === 'sta') statName = 'Odolnost';
                    else if (lowerKey === 'intellect' || lowerKey === 'int') statName = 'Intelekt';
                    else if (lowerKey === 'luck') statName = 'Štěstí';
                    else if (lowerKey === 'dmg') statName = 'Poškození';

                    statsHtml += `<div>${statName}: +${val}</div>`;
                }
            }

            // Sloučení DMGMIN a DMGMAX do jednoho řádku
            if (dmgMinVal !== null || dmgMaxVal !== null) {
                const minStr = dmgMinVal !== null ? `+${dmgMinVal}` : '+0';
                const maxStr = dmgMaxVal !== null ? `+${dmgMaxVal}` : '+0';
                statsHtml += `<div>Poškození: ${minStr}/${maxStr}</div>`;
            }

            let priceHtml = '';
            if (item.price !== undefined) {
                const total = item.price;
                const g = Math.floor(total / 10000);
                const remainder = total % 10000;
                const s = Math.floor(remainder / 100);
                const b = remainder % 100;
                
                let priceFormatted = '';
                if (g > 0) priceFormatted += `<span class="currency-gold">${g}</span> `;
                if (s > 0) priceFormatted += `<span class="currency-silver">${s}</span> `;
                priceFormatted += `<span class="currency-bronze">${b}</span>`;

                priceHtml = `<div class="tooltip-price">Cena: ${priceFormatted}</div>`;
            }

            const typeTranslations = {
                'head': 'Hlava', 'neck': 'Krk', 'shoulders': 'Ramena', 'back': 'Záda',
                'chest': 'Hrudník', 'shirt': 'Košile', 'tabard': 'Tabard', 'wrists': 'Zápěstí',
                'hands': 'Rukavice', 'waist': 'Pás', 'legs': 'Nohy', 'feet': 'Boty',
                'ring1': 'Prsten', 'ring2': 'Prsten', 'ring': 'Prsten',
                'trinket1': 'Trinket', 'trinket2': 'Trinket', 'trinket': 'Trinket',
                'mainhand': 'Hlavní', 'offhand': 'Vedlejší', 'ranged': 'Střelná',
                'mount': 'Mount', 'pet': 'Mazlíček',
                'bag1': 'Batoh', 'bag2': 'Batoh', 'bag3': 'Batoh', 'bag': 'Batoh',
                'misc': 'Různé', 'weapon': 'Zbraň', 'armor': 'Brnění',
                'torch': 'Pochodeň', 'mace': 'Palcát', 'sword': 'Meč', 'axe': 'Sekera'
            };

            const rawType = (item.slot || item.type || '').toLowerCase();
            const translatedType = typeTranslations[rawType] || item.type || 'Předmět';
            const itemDesc = item.description || item.flavor_text;

            tooltip.className = `rarity-${item.rarity || 'common'}`;
            tooltip.innerHTML = `
                <div class="tooltip-name">${item.name}</div>
                <div class="tooltip-type">Typ: ${translatedType}</div>
                ${itemDesc ? `<div class="tooltip-desc">"${itemDesc}"</div>` : ''}
                ${statsHtml ? `<div class="tooltip-stats">${statsHtml}</div>` : ''}
                ${priceHtml}
            `;
            tooltip.style.display = 'block';
        });

        document.addEventListener('mousemove', (e) => {
            if (tooltip.style.display === 'block') {
                tooltip.style.left = (e.clientX + 15) + 'px';
                tooltip.style.top = (e.clientY + 15) + 'px';
            }
        });

        document.addEventListener('mouseout', (e) => {
            const slot = e.target.closest('.slot');
            if (slot && !slot.contains(e.relatedTarget)) {
                tooltip.style.display = 'none';
            }
        });
    }
};

function renderEquipmentUI() {
    if (!window.player || !window.player.equipment) return;

    const equipmentSlots = document.querySelectorAll('#character-window .slot[data-type="equipment"]');
    equipmentSlots.forEach(slotEl => {
        const slotName = slotEl.dataset.slot;
        const item = window.player.equipment[slotName];

        slotEl.setAttribute('draggable', item !== null && item !== undefined);

        if (item) {
            const iconHtml = item.icon 
                ? `<img src="${item.icon}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;">`
                : `<span style="font-size: 10px; color: #fff; text-align: center; display: flex; align-items: center; justify-content: center; height: 100%;">${item.name}</span>`;
            slotEl.innerHTML = iconHtml;
        } else {
            slotEl.innerHTML = slotEl.getAttribute('data-slot-name') || '';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    DragDropManager.init();
    document.querySelectorAll('#character-window .slot[data-type="equipment"]').forEach(el => {
        el.setAttribute('data-slot-name', el.innerHTML);
    });
});