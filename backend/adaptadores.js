const Stripe = require('stripe');

// Contrato (Interfaz base)
class PaymentGateway {
    async crearIntentoPago(monto, moneda) { throw new Error('Método no implementado'); }
}

// Implementación concreta: Stripe
class StripeAdapter extends PaymentGateway {
    constructor() {
        super();
        this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    }

    async crearIntentoPago(monto, moneda) {
        // Stripe procesa montos en centavos
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(monto * 100),
            currency: moneda,
            automatic_payment_methods: { enabled: true },
        });
        return { clientSecret: paymentIntent.client_secret, proveedor: 'stripe' };
    }
}

// Implementación concreta: PayPal (Fallback)
class PayPalAdapter extends PaymentGateway {
    async crearIntentoPago(monto, moneda) {
        // Simulación: aquí iría el SDK de PayPal
        console.log('[PayPal Adapter] Creando orden de pago simulada...');
        return { clientSecret: 'simulado_paypal_123', proveedor: 'paypal' };
    }
}

module.exports = { StripeAdapter, PayPalAdapter };