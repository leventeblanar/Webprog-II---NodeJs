const db = require('./db');

// Példakérdezés a helyszin tábla tartalmának lekérésére
db.query('SELECT * FROM helyszin', (err, results) => {
    if (err) {
        console.error('Hiba történt a lekérdezés során:', err);
        return;
    }
    console.log('Helyszínek:', results);
});
