/**
 * Service for handling payments. 
 * In a real-world app, this would integrate with Stripe or MercadoPago.
 */
export const paymentService = {
    processPayment: async (bookingId, amount, method) => {
        console.log(`Processing ${amount} via ${method} for booking ${bookingId}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            success: true,
            transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
            status: 'completed'
        };
    },

    getPaymentMethods: () => {
        return [
            { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: 'credit-card' },
            { id: 'transfer', name: 'Transferencia Bancaria', icon: 'bank' },
            { id: 'cash', name: 'Efectivo', icon: 'cash' },
            { id: 'mercadopago', name: 'Mercado Pago', icon: 'mp' }
        ];
    }
};
