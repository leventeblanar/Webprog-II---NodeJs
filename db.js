const mysql = require('mysql2');

// Adatbáziskapcsolat beállítása
const connection = mysql.createConnection({
    host: 'localhost',      // Adatbázis szerver IP címe
    port: 3308,                // Port
    user: 'root',          // Felhasználónév
    password: '',       // Jelszó
    database: 'szeleromuvek'   // Az adatbázis neve
});

// Kapcsolódás tesztelése
connection.connect((err) => {
    if (err) {
        console.error('Nem sikerült csatlakozni az adatbázishoz: ', err);
        return;
    }
    console.log('Sikeres kapcsolat az adatbázissal!');
});

// Exportálás más modulok számára
module.exports = connection;
