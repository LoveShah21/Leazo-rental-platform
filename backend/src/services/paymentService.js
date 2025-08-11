const { Cashfree } = require('../config/cashfree');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const emailService = require('./emailService');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

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

    async getPaymentStatistics(startDate = null, endDate = null) {
        try {
            const stats = await Payment.getStatistics(startDate, endDate);
            return stats;
        } catch (err) {
            return {
                totalPayments: 0,
                totalAmount: 0,
                averageAmount: 0,
                gatewayBreakdown: [],
                error: err.message,
            };
        }
    }

    async generateInvoice({ bookingId }) {
        // Generate a simple PDF invoice and attach to booking documents
        const booking = await Booking.findById(bookingId)
            .populate('customer', 'firstName lastName email')
            .populate('product', 'name')
            .lean();
        if (!booking) throw new Error('Booking not found');

        const invoiceNumber = `INV-${booking.bookingNumber}`;
        const outDir = path.join(__dirname, '../../tmp');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const filePath = path.join(outDir, `${invoiceNumber}.pdf`);

        await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            doc.fontSize(20).text('Invoice', { align: 'right' });
            doc.moveDown();
            doc.fontSize(12).text(`Invoice #: ${invoiceNumber}`);
            doc.text(`Booking #: ${booking.bookingNumber}`);
            doc.text(`Customer: ${(booking.customer.firstName || '') + ' ' + (booking.customer.lastName || '')}`);
            doc.text(`Email: ${booking.customer.email}`);
            doc.text(`Product: ${booking.product?.name || ''}`);
            doc.text(`Period: ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`);
            doc.moveDown();
            doc.text(`Base Amount: ${booking.pricing.currency} ${booking.pricing.baseAmount}`);
            doc.text(`Taxes: ${booking.pricing.currency} ${booking.pricing.taxes}`);
            doc.text(`Deposit: ${booking.pricing.currency} ${booking.pricing.deposit}`);
            doc.text(`Total: ${booking.pricing.currency} ${booking.pricing.totalAmount}`);
            doc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        // Attach as email attachment
        return { success: true, filePath, invoiceNumber };
    }

    async handleSuccessfulPayment(bookingNumber, paymentInfo) {
        // Update booking and create Payment record if needed, send emails with invoice
        const booking = await Booking.findOne({ bookingNumber });
        if (!booking) throw new Error('Booking not found');

        booking.status = 'confirmed';
        booking.payment.status = 'completed';
        booking.payment.transactionId = paymentInfo.paymentId || paymentInfo.transactionId || 'TEST_TXN';
        booking.payment.paidAt = new Date();
        await booking.save();

        // Create Payment doc (simplified)
        const payment = new Payment({
            booking: booking._id,
            customer: booking.customer,
            amount: booking.pricing.totalAmount,
            currency: booking.pricing.currency,
            gateway: paymentInfo.gateway || 'cashfree',
            method: paymentInfo.method || 'card',
            status: 'completed',
            breakdown: {
                baseAmount: booking.pricing.baseAmount,
                taxes: booking.pricing.taxes,
                fees: 0,
                discount: 0,
                deposit: booking.pricing.deposit
            }
        });
        await payment.save();

        // Generate invoice
        const { filePath, invoiceNumber } = await this.generateInvoice({ bookingId: booking._id });

        // Load customer email
        const user = await User.findById(booking.customer).lean();
        const toEmail = user?.email;
        const customerName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

        // Send booking confirmation with invoice attached
        await emailService.sendBookingConfirmation({
            customerEmail: toEmail,
            customerName,
            bookingNumber: booking.bookingNumber,
            productName: booking.product?.toString() || 'Product',
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalAmount: booking.pricing.totalAmount,
            currency: booking.pricing.currency
        }, [
            { filename: `${invoiceNumber}.pdf`, path: filePath }
        ]);

        // Send payment receipt
        await emailService.sendPaymentReceipt({
            customerEmail: toEmail,
            customerName,
            paymentId: booking.payment.transactionId,
            amount: booking.pricing.totalAmount,
            currency: booking.pricing.currency,
            paymentDate: booking.payment.paidAt
        });

        return { success: true };
    }

    // Testing helper to simulate status changes without Cashfree
    async simulatePaymentStatus(bookingNumber, status = 'PAID') {
        if (status === 'PAID') {
            return this.handleSuccessfulPayment(bookingNumber, { paymentId: `SIM_${Date.now()}`, method: 'card', gateway: 'simulated' });
        }
        // Extend with other statuses as needed
        const booking = await Booking.findOne({ bookingNumber });
        if (!booking) throw new Error('Booking not found');
        if (status === 'FAILED') {
            booking.status = 'cancelled';
            booking.payment.status = 'failed';
            await booking.save();
            return { success: true };
        }
        if (status === 'REFUNDED') {
            booking.payment.status = 'refunded';
            booking.payment.refundedAt = new Date();
            await booking.save();
            return { success: true };
        }
        return { success: false, error: 'Unknown status' };
    }
}

module.exports = new PaymentService();