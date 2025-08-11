const { Cashfree } = require('../config/cashfree');
const crypto = require('crypto');

class PaymentService {
    async createPaymentSession(orderData) {
        try {
            const { orderId, amount, customerDetails } = orderData;

            const request = {
                order_id: orderId,
                order_amount: amount,
                order_currency: 'INR',
                customer_details: {
                    customer_id: customerDetails.customerId,
                    customer_name: customerDetails.name,
                    customer_email: customerDetails.email,
                    customer_phone: customerDetails.phone
                },
                order_meta: {
                    return_url: `${process.env.API_BASE_URL}/api/payments/callback`,
                    notify_url: `${process.env.API_BASE_URL}/api/webhooks/cashfree`
                }
            };

            const cashfree = new Cashfree();
            const response = await cashfree.PGCreateOrder('2023-08-01', request);
            return {
                success: true,
                sessionId: response.data.payment_session_id,
                orderId: response.data.order_id,
                paymentUrl: response.data.payment_links.web
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async verifyPayment(orderId) {
        try {
            const cashfree = new Cashfree();
            const response = await cashfree.PGOrderFetchPayments('2023-08-01', orderId);
            const payment = response.data[0];

            return {
                success: true,
                status: payment.payment_status,
                paymentId: payment.cf_payment_id,
                amount: payment.payment_amount,
                method: payment.payment_method
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async refundPayment(paymentId, refundAmount, reason = 'Customer request') {
        try {
            const request = {
                refund_amount: refundAmount,
                refund_id: `refund_${Date.now()}`,
                refund_note: reason
            };

            const cashfree = new Cashfree();
            const response = await cashfree.PGOrderCreateRefund('2023-08-01', paymentId, request);
            return {
                success: true,
                refundId: response.data.refund_id,
                status: response.data.refund_status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    verifyWebhookSignature(rawBody, signature) {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.CASHFREE_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        return signature === expectedSignature;
    }
}

module.exports = new PaymentService();