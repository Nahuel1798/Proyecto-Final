const express = require('express');
const translate = require('node-google-translate-skidz');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/traducir', async(req, res) => {
    const texto = req.query.texto;
    if (!texto || texto.trim() === "") {
        return res.status(400).json({ error: "El texto para traducir no puede estar vacío" });
    }
    try {
        // Traduce el texto usando async/await
        const result = await new Promise((resolve, reject) => {
            translate({
                text: texto,
                source: 'en',
                target: 'es'
            }, function (result) {
                if (result && result.translation) {
                    resolve(result);
                } else {
                    reject(new Error('Error en la traducción'));
                }
            });
        });

        res.json({ textoTraducido: result.translation });
    } catch (error) {
        console.error('Error en la traducción:', error);
        res.status(500).json({ error: 'Hubo un problema al traducir el texto' });
    }
});
    

app.listen(port, () => {
    console.log(`server is running on:${port}`);
})