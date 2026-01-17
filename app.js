const express = require('express');
const app = express();
const router = require('./router/index'); // index.js otomatik seçilir

app.use(express.json());

// Tüm API isteklerini router'a yönlendir
// Artık adresler: localhost:3000/api/events, localhost:3000/api/tickets vb. olur.
app.use('/api', router); 

app.listen(3000, () => {
    console.log("Sunucu 3000 portunda çalışıyor...");
});