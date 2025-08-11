const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = null;
        this.templates = new Map();
        this.usesEthereal = false;
        this.init();
    }

    async init() {
        try {
            // Create transporter
            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    secure: (process.env.SMTP_PORT || '').toString() === '465',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });
            } else {
                // Fallback to ethereal for dev/testing
                const testAccount = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
                this.usesEthereal = true;
                logger.warn('Email: Using Ethereal test account because SMTP_* env vars are missing');
            }

            // Verify connection
            await this.transporter.verify();
            logger.info('📧 Email service initialized successfully');

            // Load email templates
            await this.loadTemplates();
        } catch (error) {
            logger.error('Email service initialization failed:', error);
            // Do not throw to avoid crashing app; email sending will fail until fixed
        }
    }

    async loadTemplates() {
        const templatesDir = path.join(__dirname, '../templates/emails');

        try {
            // Create templates directory if it doesn't exist
            await fs.mkdir(templatesDir, { recursive: true });

            const templateFiles = [
                'welcome.hbs',
                'booking-confirmation.hbs',
                'payment-receipt.hbs',
                'booking-reminder.hbs',
                'overdue-notification.hbs',
                'password-reset.hbs'
            ];

            for (const templateFile of templateFiles) {
                try {
                    const templatePath = path.join(templatesDir, templateFile);
                    const templateContent = await fs.readFile(templatePath, 'utf8');
                    const templateName = templateFile.replace('.hbs', '');
                    this.templates.set(templateName, handlebars.compile(templateContent));
                } catch (error) {
                    // If template doesn't exist, create a basic one
                    const templateName = templateFile.replace('.hbs', '');
                    this.templates.set(templateName, this.createDefaultTemplate(templateName));
                    logger.warn(`Using default template for ${templateName}`);
                }
            }

            logger.info(`Loaded ${this.templates.size} email templates`);
        } catch (error) {
            logger.error('Error loading email templates:', error);
        }
    }

    createDefaultTemplate(templateName) {
        const defaultTemplates = {
            'welcome': handlebars.compile(`
        <h1>Welcome to Rental Management!</h1>
        <p>Hi {{firstName}},</p>
        <p>Welcome to our rental platform. We're excited to have you on board!</p>
        <p>Your account has been created successfully.</p>
        <p>Best regards,<br>The Rental Management Team</p>
      `),
            'booking-confirmation': handlebars.compile(`
        <h1>Booking Confirmation</h1>
        <p>Hi {{customerName}},</p>
        <p>Your booking has been confirmed!</p>
        <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
        <p><strong>Product:</strong> {{productName}}</p>
        <p><strong>Dates:</strong> {{startDate}} to {{endDate}}</p>
        <p><strong>Total Amount:</strong> {{currency}} {{totalAmount}}</p>
        <p>Thank you for choosing us!</p>
      `),
            'payment-receipt': handlebars.compile(`
        <h1>Payment Receipt</h1>
        <p>Hi {{customerName}},</p>
        <p>We have received your payment.</p>
        <p><strong>Payment ID:</strong> {{paymentId}}</p>
        <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
        <p><strong>Date:</strong> {{paymentDate}}</p>
        <p>Thank you for your payment!</p>
      `),
            'booking-reminder': handlebars.compile(`
        <h1>Booking Reminder</h1>
        <p>Hi {{customerName}},</p>
        <p>This is a reminder about your upcoming booking.</p>
        <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
        <p><strong>Product:</strong> {{productName}}</p>
        <p><strong>Start Date:</strong> {{startDate}}</p>
        <p>Please make sure you're ready for pickup/delivery.</p>
      `),
            'overdue-notification': handlebars.compile(`
        <h1>Overdue Item Notification</h1>
        <p>Hi {{customerName}},</p>
        <p>Your rental item is overdue for return.</p>
        <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
        <p><strong>Product:</strong> {{productName}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><strong>Days Overdue:</strong> {{daysOverdue}}</p>
        <p>Please return the item as soon as possible to avoid additional charges.</p>
      `),
            'password-reset': handlebars.compile(`
        <h1>Password Reset Request</h1>
        <p>Hi {{firstName}},</p>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{{resetLink}}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `)
        };

        return defaultTemplates[templateName] || handlebars.compile('<p>{{message}}</p>');
    }

    async sendEmail(to, subject, templateName, data, attachments = []) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }

            const template = this.templates.get(templateName);
            if (!template) {
                throw new Error(`Template ${templateName} not found`);
            }

            const html = template(data);

            const mailOptions = {
                from: `${process.env.FROM_NAME || 'Leazo Rentals'} <${process.env.FROM_EMAIL || 'no-reply@example.com'}>`,
                to: to,
                subject: subject,
                html: html,
                attachments: attachments
            };

            const result = await this.transporter.sendMail(mailOptions);
            const info = { messageId: result.messageId };
            if (this.usesEthereal) {
                info.previewUrl = nodemailer.getTestMessageUrl(result);
            }
            logger.info(`Email sent successfully to ${to}`, info);

            return {
                success: true,
                messageId: result.messageId,
                ...(info.previewUrl ? { previewUrl: info.previewUrl } : {})
            };
        } catch (error) {
            logger.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    }

    async sendWelcomeEmail(userData) {
        const { email, firstName, lastName } = userData;

        return await this.sendEmail(
            email,
            'Welcome to Rental Management!',
            'welcome',
            {
                firstName,
                lastName,
                loginUrl: `${process.env.FRONTEND_URL}/login`
            }
        );
    }

    async sendBookingConfirmation(bookingData, attachments = []) {
        const {
            customerEmail,
            customerName,
            bookingNumber,
            productName,
            startDate,
            endDate,
            totalAmount,
            currency
        } = bookingData;

        return await this.sendEmail(
            customerEmail,
            `Booking Confirmation - ${bookingNumber}`,
            'booking-confirmation',
            {
                customerName,
                bookingNumber,
                productName,
                startDate: new Date(startDate).toLocaleDateString(),
                endDate: new Date(endDate).toLocaleDateString(),
                totalAmount,
                currency
            },
            attachments
        );
    }

    async sendPaymentReceipt(paymentData, attachments = []) {
        const {
            customerEmail,
            customerName,
            paymentId,
            amount,
            currency,
            paymentDate
        } = paymentData;

        return await this.sendEmail(
            customerEmail,
            `Payment Receipt - ${paymentId}`,
            'payment-receipt',
            {
                customerName,
                paymentId,
                amount,
                currency,
                paymentDate: new Date(paymentDate).toLocaleDateString()
            },
            attachments
        );
    }

    async sendBookingReminder(bookingData) {
        const {
            customerEmail,
            customerName,
            bookingNumber,
            productName,
            startDate
        } = bookingData;

        return await this.sendEmail(
            customerEmail,
            `Booking Reminder - ${bookingNumber}`,
            'booking-reminder',
            {
                customerName,
                bookingNumber,
                productName,
                startDate: new Date(startDate).toLocaleDateString()
            }
        );
    }

    async sendOverdueNotification(bookingData) {
        const {
            customerEmail,
            customerName,
            bookingNumber,
            productName,
            dueDate,
            daysOverdue
        } = bookingData;

        return await this.sendEmail(
            customerEmail,
            `Overdue Item - ${bookingNumber}`,
            'overdue-notification',
            {
                customerName,
                bookingNumber,
                productName,
                dueDate: new Date(dueDate).toLocaleDateString(),
                daysOverdue
            }
        );
    }

    async sendPasswordReset(userData) {
        const { email, firstName, resetToken } = userData;
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        return await this.sendEmail(
            email,
            'Password Reset Request',
            'password-reset',
            {
                firstName,
                resetLink
            }
        );
    }

    async sendBulkEmail(recipients, subject, templateName, data) {
        const results = [];

        for (const recipient of recipients) {
            try {
                const result = await this.sendEmail(
                    recipient.email,
                    subject,
                    templateName,
                    { ...data, ...recipient }
                );
                results.push({ email: recipient.email, success: true, messageId: result.messageId });
            } catch (error) {
                results.push({ email: recipient.email, success: false, error: error.message });
            }
        }

        return results;
    }

    async testConnection() {
        try {
            await this.transporter.verify();
            return { success: true, message: 'Email service is working' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;