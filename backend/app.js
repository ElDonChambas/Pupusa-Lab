require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pagosService = require('./pagos.service');

const app = express();
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json());

// Endpoint unificado para crear el pago (oculta la complejidad de los proveedores)
app.post('/api/pagos/crear-intento', async (req, res) => {
    try {
        const { monto, moneda } = req.body;
        if (!monto || monto <= 0) return res.status(400).json({ error: 'Monto inválido' });

        const resultado = await pagosService.procesarIntento(monto, moneda);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para escuchar Webhooks de Stripe (Opcional, para seguridad de backend)
app.post('/api/pagos/webhook', (req, res) => {
    console.log('[Webhook] Evento recibido.');
    res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});