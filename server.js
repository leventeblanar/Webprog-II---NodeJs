const express = require('express');
const app = express();
const path = require('path');
const db = require('./db'); // A db.js importálása az adatbáziskapcsolathoz

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, 'public')));

// Body-parser konfigurálása az űrlap adatok feldolgozásához
app.use(express.urlencoded({ extended: true }));

// EJS sablonmotor beállítása
app.set('view engine', 'ejs');

// Főoldal
app.get('/', (req, res) => {
    res.render('index');
});

// Útvonal: /database
app.get('/database', (req, res) => {
    const query = `
        SELECT 
            helyszin.nev AS helyszin_nev, 
            megye.nev AS megye_nev, 
            megye.regio, 
            torony.darab, 
            torony.teljesitmeny, 
            torony.kezdev 
        FROM 
            torony
        INNER JOIN 
            helyszin ON torony.helyszinid = helyszin.id
        INNER JOIN 
            megye ON helyszin.megyeid = megye.id;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Adatbázis lekérdezési hiba: ', err);
            res.status(500).send('Hiba történt az adatbázis adatok lekérésekor.');
            return;
        }
        res.render('adatbazis', { data: results }); // Az adatokat átadjuk az EJS sablonnak
    });
});

// POST /contact útvonal: űrlap adatok mentése
app.post('/contact', (req, res) => {
    const { nev, email, targy, uzenet } = req.body;

    if (!nev || !email || !targy || !uzenet) {
        console.error('Hiányzó űrlap adatok:', req.body);
        return res.status(400).json({ success: false, message: 'Hiányzó adatok az űrlapban.' });
    }

    const query = `INSERT INTO kapcsolat (nev, email, targy, uzenet) VALUES (?, ?, ?, ?)`;
    db.query(query, [nev, email, targy, uzenet], (err, result) => {
        if (err) {
            console.error('Adatbázis hiba az üzenet mentésekor: ', err);
            return res.status(500).json({ success: false, message: 'Hiba történt az üzenet mentése során.' });
        }
        return res.json({ success: true, message: 'Üzenet sikeresen elküldve!' });
    });
});

// Útvonal: /messages
app.get('/messages', (req, res) => {
    const query = `
        SELECT 
            id, nev, email, targy, uzenet, DATE_FORMAT(datum, '%Y-%m-%d %H:%i:%s') AS datum 
        FROM kapcsolat
        ORDER BY datum DESC; -- Fordított időrend
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Adatbázis lekérdezési hiba az üzeneteknél: ', err);
            res.status(500).send('Hiba történt az üzenetek lekérése során.');
            return;
        }
        res.render('uzenetek', { messages: results }); // Átadjuk az adatokat az EJS sablonnak
    });
});

// Útvonal: /crud - CRUD funkciók megvalósítása
app.get('/crud', (req, res) => {
    const helyszinQuery = `SELECT id, nev FROM helyszin ORDER BY nev ASC;`;
    const toronyQuery = `SELECT torony.*, helyszin.nev AS helyszin_nev 
                         FROM torony 
                         INNER JOIN helyszin ON torony.helyszinid = helyszin.id
                         ORDER BY torony.id DESC;`;

    // Futtassuk le az adatbázis lekérdezéseket párhuzamosan
    db.query(helyszinQuery, (helyszinErr, helyszinek) => {
        if (helyszinErr) {
            console.error('Hiba a helyszínek lekérdezésénél:', helyszinErr);
            return res.status(500).send('Hiba történt a helyszínek lekérésekor.');
        }
        db.query(toronyQuery, (toronyErr, torony) => {
            if (toronyErr) {
                console.error('Hiba a tornyok lekérdezésénél:', toronyErr);
                return res.status(500).send('Hiba történt a tornyok lekérésekor.');
            }
            res.render('crud', { helyszinek, torony }); // Az EJS sablonnak átadjuk az adatokat
        });
    });
});

// Új torony hozzáadása
app.post('/crud/add', (req, res) => {
    const { darab, teljesitmeny, kezdev, helyszinid } = req.body;
    const query = `INSERT INTO torony (darab, teljesitmeny, kezdev, helyszinid) VALUES (?, ?, ?, ?)`;
    db.query(query, [darab, teljesitmeny, kezdev, helyszinid], (err, result) => {
        if (err) {
            console.error('Hiba az új rekord hozzáadásakor: ', err);
            res.status(500).send('Hiba történt az új adat hozzáadásakor.');
            return;
        }
        res.redirect('/crud');
    });
});

// Torony módosítása
app.post('/crud/update/:id', (req, res) => {
    const { id } = req.params;
    const { darab, teljesitmeny, kezdev, helyszinid } = req.body;

    if (!darab || !teljesitmeny || !kezdev || !helyszinid) {
        console.error('Hiányzó vagy hibás mezők a módosítási kérelemben:', req.body);
        return res.status(400).send('Hibás vagy hiányzó adatok a módosítási kérelemben.');
    }

    const query = `UPDATE torony SET darab = ?, teljesitmeny = ?, kezdev = ?, helyszinid = ? WHERE id = ?`;
    db.query(query, [darab, teljesitmeny, kezdev, helyszinid, id], (err, result) => {
        if (err) {
            console.error('Hiba torony módosításakor:', err);
            res.status(500).send('Hiba történt a torony módosításakor.');
            return;
        }
        console.log(`Torony (ID: ${id}) sikeresen módosítva.`);
        res.redirect('/crud');
    });
});


// Torony törlése
app.post('/crud/delete/:id', (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM torony WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Hiba torony törlésekor: ', err);
            res.status(500).send('Hiba történt a torony törlésekor.');
            return;
        }
        res.redirect('/crud');
    });
});

// OOP-JS játék oldal
app.get('/oop-js', (req, res) => {
    res.render('oop-js'); // Az oop-js.ejs fájlt jelenítjük meg
});

// Szerver indítása
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
