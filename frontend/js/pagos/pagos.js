const STRIPE_TEST_CARDS = [
    { brand: 'Visa', number: '4242 4242 4242 4242', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Visa (débito)', number: '4000 0566 5566 5556', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Mastercard', number: '5555 5555 5555 4444', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Mastercard (serie 2)', number: '2223 0031 2200 3222', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Mastercard (débito)', number: '5200 8282 8282 8210', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Mastercard (prepaga)', number: '5105 1051 0510 5100', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'American Express', number: '3782 822463 10005', cvc: '4 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'American Express', number: '3714 496353 98431', cvc: '4 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Discover', number: '6011 1111 1111 1117', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Discover', number: '6011 0009 9013 9424', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Discover (débito)', number: '6011 9811 1111 1113', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Diners Club', number: '3056 9300 0902 0004', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'Diners Club (tarjeta de 14 dígitos)', number: '3622 720627 1667', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'BCcard y DinaCard', number: '6555 9000 0060 4105', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'JCB', number: '3566 0020 2036 0505', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'UnionPay', number: '6200 0000 0000 0005', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'UnionPay (débito)', number: '6200 0000 0000 0047', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' },
    { brand: 'UnionPay (tarjeta de 19 dígitos)', number: '6205 5000 0000 0000 004', cvc: '3 dígitos al azar', exp: 'Cualquier fecha futura' }
];

function renderTestCardsList() {
    const listEl = document.getElementById('testCardsList');
    const countEl = document.getElementById('testCardsCount');
    if (!listEl) return;
    if (countEl) countEl.textContent = STRIPE_TEST_CARDS.length;

    listEl.innerHTML = '';
    STRIPE_TEST_CARDS.forEach(card => {
        const item = document.createElement('div');
        item.className = 'test-card-item';

        const top = document.createElement('div');
        top.className = 'test-card-top';

        const brand = document.createElement('span');
        brand.className = 'test-card-brand';
        brand.textContent = card.brand;

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'test-card-copy';
        copyBtn.textContent = 'Copiar';
        copyBtn.addEventListener('click', async () => {
            const raw = card.number.replace(/\s+/g, '');
            try {
                await navigator.clipboard.writeText(raw);
                copyBtn.textContent = '✓ Copiada';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = 'Copiar';
                    copyBtn.classList.remove('copied');
                }, 1500);
            } catch {
                copyBtn.textContent = raw;
            }
        });

        top.append(brand, copyBtn);

        const num = document.createElement('div');
        num.className = 'test-card-num';
        num.textContent = card.number;

        const meta = document.createElement('div');
        meta.className = 'test-card-meta';
        meta.innerHTML = `<span>CVC: ${card.cvc}</span><span>Vence: ${card.exp}</span>`;

        item.append(top, num, meta);
        listEl.appendChild(item);
    });
}

export function initPagos(eventBus, context) {
    const modal = document.getElementById('paymentModal');
    const cancelBtn = document.getElementById('cancelPaymentBtn');
    const submitBtn = document.getElementById('submitPaymentBtn');
    const totalEl = document.getElementById('modalTotal');
    const errorEl = document.getElementById('payment-errors');
    const postalInput = document.getElementById('card-postal-code');

    renderTestCardsList();

    // Inicializar Stripe (Reemplaza con tu PUBLISHABLE KEY de Stripe, empieza con pk_test_)
    const stripe = window.Stripe('pk_test_51URNSjFFqQ9kTaKfjBuCo75nBKBz6wGRmj4PaxwBEadNG9YkUzujtr4MZOadM6hPIlMjgiVtgUfzRlrQ3VTMTcH500AN1YQnWC');
    const elements = stripe.elements();

    const elementStyle = {
        base: {
            color: '#f0e2c8',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            '::placeholder': { color: '#a08668' },
            iconColor: '#e8a83e'
        },
        invalid: {
            color: '#e8703e',
            iconColor: '#e8703e'
        }
    };

    // Crear campos separados con el estilo visual oscuro de Pupusa Lab
    const cardNumber = elements.create('cardNumber', { style: elementStyle, showIcon: true });
    const cardExpiry = elements.create('cardExpiry', { style: elementStyle });
    const cardCvc = elements.create('cardCvc', { style: elementStyle });

    cardNumber.mount('#card-number-element');
    cardExpiry.mount('#card-expiry-element');
    cardCvc.mount('#card-cvc-element');

    const handleCardChange = (event) => {
        errorEl.textContent = event.error ? event.error.message : '';
    };
    cardNumber.on('change', handleCardChange);
    cardExpiry.on('change', handleCardChange);
    cardCvc.on('change', handleCardChange);

    // Mostrar el modal cuando el usuario da clic en "Completar pedido"
    context.completeBtn.addEventListener('click', () => {
        const total = context.computeServedTotal();
        if (total <= 0) return;
        totalEl.textContent = `$${total.toFixed(2)}`;
        modal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        errorEl.textContent = '';
    });

    submitBtn.addEventListener('click', async () => {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';
        errorEl.textContent = '';

        try {
            const total = context.computeServedTotal();

            // 1. Obtener el clientSecret del Backend (Facade)
            const API_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
                ? 'http://localhost:3000'
                : 'https://pupusa-lab-backend.onrender.com';
            const res = await fetch(`${API_URL}/api/pagos/crear-intento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto: total, moneda: 'usd' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error de red');

            // 2. Confirmar la tarjeta con Stripe
            const postalCode = postalInput ? postalInput.value.trim() : '';
            const paymentMethod = { card: cardNumber };
            if (postalCode) {
                paymentMethod.billing_details = { address: { postal_code: postalCode } };
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: paymentMethod
            });

            if (error) {
                throw error;
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // 3. Notificar al sistema que el pago fue exitoso (Observer)
                modal.classList.remove('active');
                cardNumber.clear();
                cardExpiry.clear();
                cardCvc.clear();
                if (postalInput) postalInput.value = '';
                eventBus.emit('pago:exitoso', { total });
            }
        } catch (err) {
            errorEl.textContent = err.message;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar y Pagar';
        }
    });
}