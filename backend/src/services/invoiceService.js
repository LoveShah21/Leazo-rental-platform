const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class InvoiceService {
    constructor() {
        this.invoicesDir = path.join(__dirname, '../temp/invoices');
        this.ensureInvoicesDirectory();
    }

    ensureInvoicesDirectory() {
        if (!fs.existsSync(this.invoicesDir)) {
            fs.mkdirSync(this.invoicesDir, { recursive: true });
        }
    }

    /**
     * Generate invoice PDF for a booking
     */
    async generateInvoicePDF(bookingData) {
        try {
            const {
                bookingNumber,
                customer,
                product,
                location,
                quantity,
                startDate,
                endDate,
                pricing,
                createdAt
            } = bookingData;

            const fileName = `invoice-${bookingNumber}.pdf`;
            const filePath = path.join(this.invoicesDir, fileName);

            // Create PDF document
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Company Header
            doc.fontSize(20)
                .text('RENTAL INVOICE', 50, 50, { align: 'center' })
                .fontSize(12)
                .text('Leazo Rental Platform', 50, 80, { align: 'center' })
                .text('Your trusted rental partner', 50, 95, { align: 'center' });

            // Invoice Details
            doc.fontSize(14)
                .text('Invoice Details', 50, 130)
                .fontSize(10)
                .text(`Invoice Number: ${bookingNumber}`, 50, 150)
                .text(`Invoice Date: ${new Date(createdAt).toLocaleDateString()}`, 50, 165)
                .text(`Rental Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 50, 180);

            // Customer Information
            doc.fontSize(14)
                .text('Bill To:', 50, 210)
                .fontSize(10)
                .text(`${customer.firstName} ${customer.lastName}`, 50, 230)
                .text(`${customer.email}`, 50, 245);

            if (customer.phone) {
                doc.text(`${customer.phone}`, 50, 260);
            }

            // Product Information
            doc.fontSize(14)
                .text('Rental Details:', 300, 210)
                .fontSize(10)
                .text(`Product: ${product.name}`, 300, 230)
                .text(`Location: ${location.name}`, 300, 245)
                .text(`Quantity: ${quantity}`, 300, 260);

            // Table Header
            const tableTop = 320;
            doc.fontSize(12)
                .text('Description', 50, tableTop)
                .text('Qty', 200, tableTop)
                .text('Rate', 250, tableTop)
                .text('Amount', 350, tableTop)
                .text('Total', 450, tableTop);

            // Draw line under header
            doc.moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();

            // Calculate rental days
            const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
            const dailyRate = pricing.baseAmount / (quantity * rentalDays);

            // Table Content
            let yPosition = tableTop + 25;
            doc.fontSize(10)
                .text(`${product.name} - ${rentalDays} day(s)`, 50, yPosition)
                .text(quantity.toString(), 200, yPosition)
                .text(`${pricing.currency} ${dailyRate.toFixed(2)}`, 250, yPosition)
                .text(`${pricing.currency} ${pricing.baseAmount.toFixed(2)}`, 350, yPosition)
                .text(`${pricing.currency} ${pricing.baseAmount.toFixed(2)}`, 450, yPosition);

            yPosition += 20;

            // Deposit if applicable
            if (pricing.deposit > 0) {
                doc.text('Security Deposit', 50, yPosition)
                    .text('1', 200, yPosition)
                    .text(`${pricing.currency} ${pricing.deposit.toFixed(2)}`, 250, yPosition)
                    .text(`${pricing.currency} ${pricing.deposit.toFixed(2)}`, 350, yPosition)
                    .text(`${pricing.currency} ${pricing.deposit.toFixed(2)}`, 450, yPosition);
                yPosition += 20;
            }

            // Taxes if applicable
            if (pricing.taxes > 0) {
                doc.text('Taxes & Fees', 50, yPosition)
                    .text('1', 200, yPosition)
                    .text(`${pricing.currency} ${pricing.taxes.toFixed(2)}`, 250, yPosition)
                    .text(`${pricing.currency} ${pricing.taxes.toFixed(2)}`, 350, yPosition)
                    .text(`${pricing.currency} ${pricing.taxes.toFixed(2)}`, 450, yPosition);
                yPosition += 20;
            }

            // Additional fees if applicable
            if (pricing.fees > 0) {
                doc.text('Additional Fees', 50, yPosition)
                    .text('1', 200, yPosition)
                    .text(`${pricing.currency} ${pricing.fees.toFixed(2)}`, 250, yPosition)
                    .text(`${pricing.currency} ${pricing.fees.toFixed(2)}`, 350, yPosition)
                    .text(`${pricing.currency} ${pricing.fees.toFixed(2)}`, 450, yPosition);
                yPosition += 20;
            }

            // Discounts if applicable
            if (pricing.discounts > 0) {
                doc.text('Discount', 50, yPosition)
                    .text('1', 200, yPosition)
                    .text(`-${pricing.currency} ${pricing.discounts.toFixed(2)}`, 250, yPosition)
                    .text(`-${pricing.currency} ${pricing.discounts.toFixed(2)}`, 350, yPosition)
                    .text(`-${pricing.currency} ${pricing.discounts.toFixed(2)}`, 450, yPosition);
                yPosition += 20;
            }

            // Draw line before total
            yPosition += 10;
            doc.moveTo(350, yPosition)
                .lineTo(550, yPosition)
                .stroke();

            // Total
            yPosition += 15;
            doc.fontSize(12)
                .text('TOTAL:', 350, yPosition)
                .text(`${pricing.currency} ${pricing.totalAmount.toFixed(2)}`, 450, yPosition);

            // Terms and Conditions
            yPosition += 50;
            doc.fontSize(12)
                .text('Terms & Conditions:', 50, yPosition)
                .fontSize(9)
                .text('1. This is a computer-generated invoice and does not require a signature.', 50, yPosition + 20)
                .text('2. Security deposit will be refunded after successful return of the item.', 50, yPosition + 35)
                .text('3. Late return charges may apply as per rental agreement.', 50, yPosition + 50)
                .text('4. Customer is responsible for any damage to the rented item.', 50, yPosition + 65);

            // Footer
            doc.fontSize(8)
                .text('Thank you for choosing Leazo Rental Platform!', 50, 750, { align: 'center' })
                .text('For support, contact us at support@leazo.com', 50, 765, { align: 'center' });

            // Finalize PDF
            doc.end();

            // Wait for the PDF to be written
            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            logger.info(`Invoice PDF generated: ${fileName}`);

            return {
                filePath,
                fileName,
                success: true
            };

        } catch (error) {
            logger.error('Error generating invoice PDF:', error);
            throw error;
        }
    }

    /**
     * Generate booking confirmation PDF
     */
    async generateBookingConfirmationPDF(bookingData) {
        try {
            const {
                bookingNumber,
                customer,
                product,
                location,
                quantity,
                startDate,
                endDate,
                status,
                delivery,
                notes
            } = bookingData;

            const fileName = `booking-confirmation-${bookingNumber}.pdf`;
            const filePath = path.join(this.invoicesDir, fileName);

            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20)
                .text('BOOKING CONFIRMATION', 50, 50, { align: 'center' })
                .fontSize(12)
                .text('Leazo Rental Platform', 50, 80, { align: 'center' });

            // Booking Details
            doc.fontSize(14)
                .text('Booking Information', 50, 120)
                .fontSize(10)
                .text(`Booking Number: ${bookingNumber}`, 50, 140)
                .text(`Status: ${status.toUpperCase()}`, 50, 155)
                .text(`Booking Date: ${new Date().toLocaleDateString()}`, 50, 170);

            // Customer Information
            doc.fontSize(14)
                .text('Customer Details:', 50, 200)
                .fontSize(10)
                .text(`Name: ${customer.firstName} ${customer.lastName}`, 50, 220)
                .text(`Email: ${customer.email}`, 50, 235);

            if (customer.phone) {
                doc.text(`Phone: ${customer.phone}`, 50, 250);
            }

            // Rental Details
            doc.fontSize(14)
                .text('Rental Information:', 300, 200)
                .fontSize(10)
                .text(`Product: ${product.name}`, 300, 220)
                .text(`Location: ${location.name}`, 300, 235)
                .text(`Quantity: ${quantity}`, 300, 250)
                .text(`Start Date: ${new Date(startDate).toLocaleDateString()}`, 300, 265)
                .text(`End Date: ${new Date(endDate).toLocaleDateString()}`, 300, 280);

            // Delivery Information
            if (delivery) {
                let yPos = 320;
                doc.fontSize(14)
                    .text('Delivery Information:', 50, yPos)
                    .fontSize(10);

                yPos += 20;
                doc.text(`Type: ${delivery.type}`, 50, yPos);

                if (delivery.deliveryAddress) {
                    yPos += 15;
                    doc.text('Delivery Address:', 50, yPos);
                    yPos += 15;
                    doc.text(`${delivery.deliveryAddress.street}`, 70, yPos);
                    yPos += 15;
                    doc.text(`${delivery.deliveryAddress.city}, ${delivery.deliveryAddress.state} ${delivery.deliveryAddress.postalCode}`, 70, yPos);
                }

                if (delivery.contactPerson) {
                    yPos += 20;
                    doc.text('Contact Person:', 50, yPos);
                    yPos += 15;
                    doc.text(`${delivery.contactPerson.name} - ${delivery.contactPerson.phone}`, 70, yPos);
                }
            }

            // Notes
            if (notes && notes.customer) {
                doc.fontSize(14)
                    .text('Special Instructions:', 50, 450)
                    .fontSize(10)
                    .text(notes.customer, 50, 470, { width: 500 });
            }

            // Important Information
            doc.fontSize(12)
                .text('Important Information:', 50, 550)
                .fontSize(9)
                .text('• Please bring a valid ID for pickup', 50, 570)
                .text('• Security deposit may be required', 50, 585)
                .text('• Late return charges apply after the end date', 50, 600)
                .text('• Contact us immediately for any changes or issues', 50, 615);

            // Footer
            doc.fontSize(8)
                .text('Thank you for choosing Leazo Rental Platform!', 50, 750, { align: 'center' })
                .text('For support, contact us at support@leazo.com', 50, 765, { align: 'center' });

            doc.end();

            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            logger.info(`Booking confirmation PDF generated: ${fileName}`);

            return {
                filePath,
                fileName,
                success: true
            };

        } catch (error) {
            logger.error('Error generating booking confirmation PDF:', error);
            throw error;
        }
    }

    /**
     * Clean up old PDF files
     */
    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const files = fs.readdirSync(this.invoicesDir);
            const now = Date.now();
            let deletedCount = 0;

            for (const file of files) {
                const filePath = path.join(this.invoicesDir, file);
                const stats = fs.statSync(filePath);
                const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);

                if (ageHours > maxAgeHours) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            }

            logger.info(`Cleaned up ${deletedCount} old invoice files`);
            return deletedCount;

        } catch (error) {
            logger.error('Error cleaning up old invoice files:', error);
            return 0;
        }
    }
}

module.exports = new InvoiceService();