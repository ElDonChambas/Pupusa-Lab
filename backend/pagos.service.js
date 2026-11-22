const { StripeAdapter, PayPalAdapter } = require('./adaptadores');

class PagosService {
    constructor() {
        this.proveedores = [];
        
        // Estrategia: Carga los proveedores activos según el archivo .env
        if (process.env.STRIPE_ENABLED === 'true') {
            this.proveedores.push(new StripeAdapter());
        }
        if (process.env.PAYPAL_ENABLED === 'true') {
            this.proveedores.push(new PayPalAdapter());
        }
    }

    // Chain of Responsibility: Fallback automático
    async procesarIntento(monto, moneda = 'usd') {
        let ultimoError = null;

        for (const proveedor of this.proveedores) {
            try {
                console.log(`[PagosService] Intentando crear pago con ${proveedor.constructor.name}...`);
                const resultado = await proveedor.crearIntentoPago(monto, moneda);
                return resultado; // Éxito, salimos del ciclo
            } catch (error) {
                console.error(`[PagosService] Fallo en ${proveedor.constructor.name}:`, error.message);
                ultimoError = error;
                // Al fallar, el bucle continúa hacia el siguiente proveedor (Fallback)
            }
        }

        // Si termina el bucle y todos fallaron:
        throw new Error('Todos los proveedores fallaron. ' + (ultimoError?.message || ''));
    }
}

module.exports = new PagosService();