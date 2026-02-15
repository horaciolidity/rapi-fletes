import { MercadoPagoConfig, Preference } from 'mercadopago';
import prisma from '../services/db.js';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

export const createPreference = async (req, res) => {
    try {
        const { tripId, price, title } = req.body;

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: tripId,
                        title: title || 'Servicio de Flete',
                        quantity: 1,
                        unit_price: Number(price),
                        currency_id: 'ARS',
                    }
                ],
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/payment/success`,
                    failure: `${process.env.FRONTEND_URL}/payment/failure`,
                    pending: `${process.env.FRONTEND_URL}/payment/pending`,
                },
                auto_return: 'approved',
                notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
                external_reference: tripId,
            }
        });

        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        res.status(500).json({ message: 'Error creating MP preference', error: error.message });
    }
};

export const webhook = async (req, res) => {
    try {
        const { query } = req;
        const topic = query.topic || query.type;

        if (topic === 'payment') {
            const paymentId = query.id || query['data.id'];

            // Here you would fetch payment details from MP and update trip status
            // For now, we simulation success
            console.log(`Payment received: ${paymentId}`);

            // Update logic would go here:
            // await prisma.trip.update({ where: { paymentId }, data: { paymentStatus: 'PAID' } })
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
};
