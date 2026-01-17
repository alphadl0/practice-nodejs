const express = require('express');
const app = express();
const router = require('./router/index');

app.use(express.json());
app.use(express.static('public'));

app.use('/api', router); 

app.listen(3000, () => {
    console.log("Sunucu 3000 portunda çalışıyor...");
});