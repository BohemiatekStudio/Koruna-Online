// js/player.js - Správa postavy, atributů a výbavy

const player = {
    name: "Jan Zhoř",
    level: 1,
    title: "Nováček",
    freePoints: 0,

    resources: {
        hp: 100,
        maxHp: 100,
        energie: 50,
        maxEnergie: 50,
        xp: 0,
        maxXp: 100,
        karma: 0
    },

    baseStats: {
        str: 1,
        agi: 1,
        end: 1,
        cha: 1,
        dex: 1,
        luck: 1,
        wis: 1
    },

    // Výpočet statistik včetně bonusů z předmětů
    get stats() {
        let computed = { ...this.baseStats };
        for (const slotKey in this.equipment) {
            const item = this.equipment[slotKey];
            if (item && item.stats) {
                for (const [sKey, val] of Object.entries(item.stats)) {
                    if (computed[sKey] !== undefined && typeof val === 'number') {
                        computed[sKey] += val;
                    }
                }
            }
        }
        return computed;
    },

    equipment: {
        head: null, neck: null, shoulder: null, back: null,
        chest: null, shirt: null, tabard: null, wrist: null,
        hands: null, waist: null, legs: null, feet: null,
        ring1: null, ring2: null, trinket1: null, trinket2: null,
        main: null, off: null, ranged: null, mount: null, pet: null,
        bag1: null, bag2: null, bag3: null
    },

    get armor() {
        let totalArmor = 0;
        for (const slotKey in this.equipment) {
            const item = this.equipment[slotKey];
            if (item) {
                if (typeof item.armor === 'number') totalArmor += item.armor;
                if (item.stats && typeof item.stats.armor === 'number') totalArmor += item.stats.armor;
            }
        }
        return totalArmor;
    },

    getMaxHp() {
        return 100 + (this.stats.end - 1) * 10;
    },

    getFormattedMoney() {
        const total = typeof PlayerMoney !== "undefined" ? PlayerMoney.totalBronze : 15425;
        const g = Math.floor(total / 10000);
        const remainder = total % 10000;
        const s = Math.floor(remainder / 100);
        const b = remainder % 100;
        return `<span class="currency-gold">${g}</span> <span class="currency-silver">${s}</span> <span class="currency-bronze">${b}</span>`;
    },

    getDamage() {
        let bonusMin = 0;
        let bonusMax = 0;

        for (const slotKey in this.equipment) {
            const item = this.equipment[slotKey];
            if (item && item.stats) {
                for (const [sKey, val] of Object.entries(item.stats)) {
                    const key = sKey.toLowerCase();
                    if (typeof val === 'number') {
                        if (key === 'dmg') {
                            bonusMin += val;
                            bonusMax += val;
                        } else if (key === 'dmgmin') {
                            bonusMin += val;
                        } else if (key === 'dmgmax') {
                            bonusMax += val;
                        }
                    }
                }
            }
        }

        const currentStr = this.stats.str;
        // Základ 1-2 + bonus ze síly + bonusové rozsahy z předmětů (např. klacek dmgMin:1, dmgMax:3)
        const baseMin = 1 + (currentStr - 1) + bonusMin;
        const baseMax = 2 + (currentStr - 1) + bonusMax;
        return `${baseMin}-${baseMax}`;
    },

    addXP(amount) {
        this.resources.xp += amount;
        while (this.resources.xp >= this.resources.maxXp) {
            this.resources.xp -= this.resources.maxXp;
            this.level++;
            this.freePoints += 5;
            this.resources.maxXp = Math.floor(this.resources.maxXp * 1.25);
            
            this.resources.maxHp = this.getMaxHp();
            this.resources.hp = this.resources.maxHp;
            this.resources.energie = this.resources.maxEnergie;
        }
        renderPlayerStats();
    },

    addStatPoint(statName) {
        if (this.freePoints > 0 && this.baseStats[statName] !== undefined) {
            this.baseStats[statName]++;
            this.freePoints--;

            if (statName === 'end') {
                const oldMax = this.resources.maxHp;
                this.resources.maxHp = this.getMaxHp();
                this.resources.hp += (this.resources.maxHp - oldMax);
            }

            renderPlayerStats();
        }
    }
};

window.player = player;

document.addEventListener("DOMContentLoaded", () => {
    initCharacterWindow();
    renderPlayerStats();
    makeWindowDraggable();
});

function initCharacterWindow() {
    const charWindow = document.getElementById("character-window");
    const closeBtn = document.getElementById("close-char-btn");
    const charPanelBtn = document.getElementById("char-panel");
    const heroFuncBtn = document.getElementById("btn-hero-func");

    const toggleWindow = () => {
        if (!charWindow) return;
        const isHidden = charWindow.style.display === "none" || charWindow.style.display === "";
        charWindow.style.display = isHidden ? "block" : "none";
        if (isHidden) renderPlayerStats();
    };

    if (closeBtn) closeBtn.addEventListener("click", () => charWindow.style.display = "none");
    if (charPanelBtn) charPanelBtn.addEventListener("click", toggleWindow);
    if (heroFuncBtn) heroFuncBtn.addEventListener("click", toggleWindow);
}

function renderPlayerStats() {
    const titleElem = document.getElementById("char-window-title");
    if (titleElem) {
        titleElem.textContent = `${player.name} Úroveň ${player.level} (${player.title})`;
    }

    const statsContainer = document.getElementById("char-detailed-stats");
    if (statsContainer) {
        const btn = (stat) => player.freePoints > 0 
            ? `<button onclick="player.addStatPoint('${stat}')" style="cursor:pointer; padding: 0 4px; font-weight:bold; background:#333; color:#ffdf00; border:1px solid #777;">+</button>` 
            : '';

        const currentStats = player.stats;

        statsContainer.innerHTML = `
            <div class="stat-group-title" style="color:#ffdf00; font-weight:bold; border-bottom:1px solid #444; margin-bottom:4px;">STAV POSTAVY</div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Zdraví (HP):</span> <strong>${player.resources.hp} / ${player.resources.maxHp}</strong></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Energie:</span> <strong>${player.resources.energie} / ${player.resources.maxEnergie}</strong></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Zkušenosti:</span> <strong>${player.resources.xp} / ${player.resources.maxXp} XP</strong></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Víra (Karma):</span> <strong>${player.resources.karma}</strong></div>

            <div class="stat-group-title" style="color:#ffdf00; font-weight:bold; border-bottom:1px solid #444; margin:8px 0 4px 0;">BOJ</div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Poškození:</span> <strong>${player.getDamage()}</strong></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Zbroj:</span> <strong>${player.armor}</strong></div>

            <div class="stat-group-title" style="color:#ffdf00; font-weight:bold; border-bottom:1px solid #444; margin:8px 0 4px 0;">
                ATRIBUTY <span style="font-size:11px; color:#aaa;">(Volné: ${player.freePoints})</span>
            </div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Síla (STR):</span> <span><strong>${currentStats.str}</strong> ${btn('str')}</span></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Obratnost (AGI):</span> <span><strong>${currentStats.agi}</strong> ${btn('agi')}</span></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Výdrž (END):</span> <span><strong>${currentStats.end}</strong> ${btn('end')}</span></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Charisma (CHA):</span> <span><strong>${currentStats.cha}</strong> ${btn('cha')}</span></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Zručnost (DEX):</span> <span><strong>${currentStats.dex}</strong> ${btn('dex')}</span></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Štěstí (LUCK):</span> <span><strong>${currentStats.luck}</strong> ${btn('luck')}</span></div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Moudrost (WIS):</span> <span><strong>${currentStats.wis}</strong> ${btn('wis')}</span></div>

            <div class="stat-group-title" style="color:#ffdf00; font-weight:bold; border-bottom:1px solid #444; margin:8px 0 4px 0;">EKONOMIKA</div>
            <div class="stat-row" style="display:flex; justify-content:space-between;"><span>Měna:</span> <span>${player.getFormattedMoney()}</span></div>
        `;
    }

    const statPanel = document.getElementById("stat-panel");
    if (statPanel) {
        const currentStats = player.stats;
        statPanel.innerHTML = `
            <div class="bottom-stat-hud">
                <div class="hud-title-row">
                    ${player.title} ${player.name} Lvl ${player.level}
                </div>
                <div class="hud-content-columns">
                    <div class="hud-left-side">
                        <div class="hud-resource-row"><span>Životy:</span> <span class="stat-hp">${player.resources.hp}/${player.resources.maxHp}</span></div>
                        <div class="hud-resource-row"><span>Energie:</span> <span class="stat-en">${player.resources.energie}/${player.resources.maxEnergie}</span></div>
                        <div class="hud-resource-row"><span>Zbroj:</span> <span class="stat-armor">${player.armor}</span></div>
                        <div class="hud-resource-row"><span>Poškození:</span> <span class="stat-dmg">${player.getDamage()}</span></div>
                        <div class="hud-resource-row"><span>Karma:</span> <span class="stat-karma">${player.resources.karma}</span></div>
                        <div class="hud-economy-row">
                            ${player.getFormattedMoney()}
                        </div>
                    </div>
                    <div class="hud-right-side">
                        <div class="hud-stats-grid">
                            <div class="hud-stat-item">Síla: <span>${currentStats.str}</span></div>
                            <div class="hud-stat-item">Obratnost: <span>${currentStats.agi}</span></div>
                            <div class="hud-stat-item">Výdrž: <span>${currentStats.end}</span></div>
                            <div class="hud-stat-item">Charizma: <span>${currentStats.cha}</span></div>
                            <div class="hud-stat-item">Zručnost: <span>${currentStats.dex}</span></div>
                            <div class="hud-stat-item">Štěstí: <span>${currentStats.luck}</span></div>
                            <div class="hud-stat-item">Moudrost: <span>${currentStats.wis}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function makeWindowDraggable() {
    const windowElem = document.getElementById("character-window");
    const headerElem = document.getElementById("character-window-header");

    if (!windowElem || !headerElem) return;

    headerElem.onmousedown = (e) => {
        if (e.button !== 0) return;
        let startX = e.clientX - windowElem.offsetLeft;
        let startY = e.clientY - windowElem.offsetTop;

        const onMouseMove = (moveEvent) => {
            windowElem.style.left = (moveEvent.clientX - startX) + "px";
            windowElem.style.top = (moveEvent.clientY - startY) + "px";
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
}