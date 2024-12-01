class Szeleromu {
    constructor(nev, teljesitmeny) {
        this.nev = nev;
        this.teljesitmeny = teljesitmeny;
        this.energia = 0;
    }

    termelEnergiat(kattintasok) {
        this.energia += kattintasok * this.teljesitmeny * 0.1;
    }

    getEnergia() {
        return this.energia.toFixed(2);
    }
}

class Jatek {
    constructor(idotartam, szeleromu) {
        this.idotartam = idotartam;
        this.szeleromu = szeleromu;
        this.kattintasok = 0;
        this.timer = null;
        this.sebesseg = 2; // Kezdő forgási sebesség (másodperc per kör)
    }

    kattintas() {
        this.kattintasok++;
        this.szeleromu.termelEnergiat(1);
        this.sebesseg = Math.max(0.5, this.sebesseg - 0.2); // Forgás gyorsítása
        this.updateSebesseg();
    }

    lassit() {
        this.sebesseg = Math.min(2, this.sebesseg + 0.02); // Forgás lassítása
        this.updateSebesseg();
    }

    updateSebesseg() {
        const svgElem = document.querySelector("#turbin svg");
        svgElem.style.animationDuration = `${this.sebesseg}s`; // Animáció sebességének frissítése
        svgElem.style.animationPlayState = "running"; // Animáció folyamatosan játszódik
    }

    inditJatekot(updateCallback, finishCallback) {
        let idoHatravan = this.idotartam;
        this.timer = setInterval(() => {
            idoHatravan--;
            updateCallback(idoHatravan);
            this.lassit(); // Lassítás minden másodpercben
            if (idoHatravan <= 0) {
                clearInterval(this.timer);
                finishCallback(this.szeleromu.getEnergia());
            }
        }, 1000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const turbinElem = document.querySelector("#turbin svg");
    const startButton = document.getElementById("startButton");
    const statusElem = document.getElementById("status");

    const szeleromu = new Szeleromu("Windy 3000", 0.5);
    let jatek = null;

    startButton.addEventListener("click", () => {
        jatek = new Jatek(10, szeleromu);
        turbinElem.classList.add("rotating");
        jatek.inditJatekot(
            (idoHatravan) => {
                statusElem.textContent = `Hátralévő idő: ${idoHatravan} másodperc`;
            },
            (energia) => {
                statusElem.textContent = `Játék vége! Összes energiatermelés: ${energia} kWh`;
                turbinElem.classList.remove("rotating");
            }
        );
        statusElem.textContent = "Játék elkezdődött!";
    });

    document.getElementById("turbinContainer").addEventListener("click", () => {
        if (jatek) {
            jatek.kattintas();
        }
    });
});
