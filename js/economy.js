// js/economy.js - Centrální správa měny

const PlayerMoney = {
    totalBronze: 15425, // Výchozí testovací obnos (např. 1g 54s 25b)

    add(amount) {
        this.totalBronze += amount;
        if (this.totalBronze < 0) this.totalBronze = 0;
        this.updateUI();
    },

    setTotalBronze(bronzeAmount) {
        this.totalBronze = Math.max(0, bronzeAmount);
        this.updateUI();
    },

    updateUI() {
        const g = Math.floor(this.totalBronze / 10000);
        const remainder = this.totalBronze % 10000;
        const s = Math.floor(remainder / 100);
        const b = remainder % 100;

        // 1. Inventář - čistá čísla bez písmen
        const invG = document.getElementById('inv-gold');
        const invS = document.getElementById('inv-silver');
        const invB = document.getElementById('inv-bronze');

        if (invG) invG.innerText = g;
        if (invS) invS.innerText = s;
        if (invB) invB.innerText = b;

        // 2. Spodní HUD panel
        const hudG = document.querySelector('.bottom-stat-hud .currency-gold');
        const hudS = document.querySelector('.bottom-stat-hud .currency-silver');
        
        if (hudG) hudG.innerText = `G: ${g}`;
        if (hudS) hudS.innerText = `S: ${s}`;

        // 3. Okno hrdiny (pokud existuje funkce renderPlayerStats, aktualizujeme i ji)
        if (typeof renderPlayerStats === "function") {
            renderPlayerStats();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PlayerMoney.updateUI();
});