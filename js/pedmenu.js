/* ================================================================= */
/* PEDMENU.JS - Správa vzhledu postavy a editoru obličeje             */
/* ================================================================= */

// Aktuální stav vzhledu postavy (výchozí hodnoty od startu)
let playerAppearance = {
    eyes: 1,
    nose: 1,
    mouth: 1,
    hair: 1,
    skin: 1,
    beard: 1,
    headShape: 1
};

document.addEventListener("DOMContentLoaded", () => {
    const changeAppearanceBtn = document.getElementById("btn-change-appearance");
    const pedMenuWindow = document.getElementById("pedmenu-window");
    const closePedMenuBtn = document.getElementById("close-pedmenu-btn");
    const cancelPedMenuBtn = document.getElementById("pedmenu-cancel");
    const savePedMenuBtn = document.getElementById("pedmenu-save");
    const randomizeBtn = document.getElementById("pedmenu-randomize");

    // 1. Hned při startu hry aplikujeme výchozí vzhled do okna hrdiny a HUDu
    applyAppearanceToGame();

    // Otevření okna editoru
    if (changeAppearanceBtn && pedMenuWindow) {
        changeAppearanceBtn.addEventListener("click", () => {
            pedMenuWindow.style.display = "block";
            updatePedMenuUI();
        });
    }

    // Zavření okna
    const closeMenu = () => {
        if (pedMenuWindow) pedMenuWindow.style.display = "none";
    };

    if (closePedMenuBtn) closePedMenuBtn.addEventListener("click", closeMenu);
    if (cancelPedMenuBtn) cancelPedMenuBtn.addEventListener("click", closeMenu);

    // Přepínání šipkami (prozatím pro oči)
    document.querySelectorAll(".pedmenu-next").forEach(button => {
        button.addEventListener("click", (e) => {
            const category = e.target.getAttribute("data-category");
            if (category === "eyes") {
                playerAppearance.eyes = playerAppearance.eyes < 4 ? playerAppearance.eyes + 1 : 1;
                updatePedMenuUI();
            }
        });
    });

    document.querySelectorAll(".pedmenu-prev").forEach(button => {
        button.addEventListener("click", (e) => {
            const category = e.target.getAttribute("data-category");
            if (category === "eyes") {
                playerAppearance.eyes = playerAppearance.eyes > 1 ? playerAppearance.eyes - 1 : 4;
                updatePedMenuUI();
            }
        });
    });

    // Randomizér - náhodný výběr
    if (randomizeBtn) {
        randomizeBtn.addEventListener("click", () => {
            playerAppearance.eyes = Math.floor(Math.random() * 4) + 1;
            updatePedMenuUI();
            console.log("Randomizér aplikován:", playerAppearance);
        });
    }

    // Uložení vzhledu a promítnutí do hry
    if (savePedMenuBtn) {
        savePedMenuBtn.addEventListener("click", () => {
            console.log("Ukládám nový vzhled postavy:", playerAppearance);
            applyAppearanceToGame();
            closeMenu();
        });
    }
});

// Aktualizace náhledu v samotném editoru
function updatePedMenuUI() {
    const eyesImg = document.getElementById("preview-eyes");
    const eyesLabel = document.getElementById("label-eyes");

    if (eyesImg) {
        eyesImg.src = `assets/pedmenu/eyes/eyes${playerAppearance.eyes}.png`;
    }
    if (eyesLabel) {
        eyesLabel.textContent = playerAppearance.eyes;
    }
}

// Funkce, která dynamicky propíše vzhled do okna hrdiny a do HUDu
function applyAppearanceToGame() {
    const eyesSrc = `assets/pedmenu/eyes/eyes${playerAppearance.eyes}.png`;

    // 1. Aktualizace v okně hrdiny
    const charWindowPortrait = document.getElementById("char-window-portrait-eyes");
    if (charWindowPortrait) {
        charWindowPortrait.src = eyesSrc;
    }

    // 2. Aktualizace ve spodním HUD panelu (#char-panel)
    const hudPortrait = document.getElementById("hud-portrait-eyes");
    if (hudPortrait) {
        hudPortrait.src = eyesSrc;
    }

    console.log("Portréty byly úspěšně aktualizovány ve hře.");
}