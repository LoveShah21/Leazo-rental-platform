const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');

class ShiprocketService {
    constructor() {
        this.baseURL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';
        this.email = process.env.SHIPROCKET_EMAIL;
        this.password = process.env.SHIPROCKET_PASSWORD;
        this.token = null;
        this.tokenExpiry = null;
    }

    async authenticate() {
        try {
            // Check if we have a valid cached token
            const cachedToken = await cache.get('shiprocket:token');
            if (cachedToken && cachedToken.expires > Date.now()) {
                this.token = cachedToken.token;
                this.tokenExpiry = cachedToken.expires;
                return this.token;
            }

            const response = await axios.post(`${this.baseURL}/auth/login`, {
                email: this.email,
                password: this.password
            });

            if (response.data && response.data.token) {
                this.token = response.data.token;
                // Token is valid for 240 hours (10 days)
                this.tokenExpiry = Date.now() + (240 * 60 * 60 * 1000);

                // Cache the token
                await cache.set('shiprocket:token', {
                    token: this.token,
                    expires: this.tokenExpiry
                }, 240 * 60 * 60); // 240 hours in seconds

                logger.info('Shiprocket authentication successful');
                return this.token;
            }

            throw new Error('Authentication failed - no token received');
        } catch (error) {
            logger.error('Shiprocket authentication failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async makeRequest(method, endpoint, data = null, retryAuth = true) {
        try {
            // Ensure we have a valid token
            if (!this.token || (this.tokenExpiry && Date.now() >= this.tokenExpiry)) {
                await this.authenticate();
            }

            const config = {
                method,
                url: `${this.baseURL}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            // If authentication error and we haven't retried yet, try to re-authenticate
            if (error.response?.status === 401 && retryAuth) {
                logger.warn('Shiprocket token expired, re-authenticating...');
                await this.authenticate();
                return this.makeRequest(method, endpoint, data, false);
            }

            logger.error(`Shiprocket API error (${method} ${endpoint}):`, error.response?.data || error.message);
            throw error;
        }
    }

    async getPickupLocations() {
        try {
            const response = await this.makeRequest('GET', '/settings/company/pickup');
            return response.data || [];
        } catch (error) {
            logger.error('Failed to get pickup locations:', error);
            throw error;
        }
    }

    async createPickupLocation(locationData) {
        try {
            const {
                pickup_location,
                name,
                email,
                phone,
                address,
                address_2,
                city,
                state,
                country,
                pin_code
            } = locationData;

            const data = {
                pickup_location,
                name,
                email,
                phone,
                address,
                address_2,
                city,
                state,
                country,
                pin_code
            };

            const response = await this.makeRequest('POST', '/settings/company/addpickup', data);
            logger.info(`Pickup location created: ${pickup_location}`);
            return response;
        } catch (error) {
            logger.error('Failed to create pickup location:', error);
            throw error;
        }
    }

    async checkServiceability(pickupPincode, deliveryPincode, weight = 1) {
        try {
            const response = await this.makeRequest('GET',
                `/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}`
            );

            return {
                serviceable: response.status === 200,
                couriers: response.data?.available_courier_companies || []
            };
        } catch (error) {
            logger.error('Serviceability check failed:', error);
            return { serviceable: false, couriers: [] };
        }
    }

    async createOrder(orderData) {
        try {
            const {
                order_id,
                order_date,
                pickup_location,
                billing_customer_name,
                billing_last_name,
                billing_address,
                billing_address_2,
                billing_city,
                billing_pincode,
                billing_state,
                billing_country,
                billing_email,
                billing_phone,
                shipping_is_billing,
                shipping_customer_name,
                shipping_last_name,
                shipping_address,
                shipping_address_2,
                shipping_city,
                shipping_pincode,
                shipping_state,
                shipping_country,
                shipping_email,
                shipping_phone,
                order_items,
                payment_method,
                shipping_charges,
                giftwrap_charges,
                transaction_charges,
                total_discount,
                sub_total,
                length,
                breadth,
                height,
                weight
            } = orderData;

            const data = {
                order_id,
                order_date,
                pickup_location,
                billing_customer_name,
                billing_last_name,
                billing_address,
                billing_address_2: billing_address_2 || '',
                billing_city,
                billing_pincode,
                billing_state,
                billing_country,
                billing_email,
                billing_phone,
                shipping_is_billing: shipping_is_billing || true,
                shipping_customer_name: shipping_customer_name || billing_customer_name,
                shipping_last_name: shipping_last_name || billing_last_name,
                shipping_address: shipping_address || billing_address,
                shipping_address_2: shipping_address_2 || billing_address_2 || '',
                shipping_city: shipping_city || billing_city,
                shipping_pincode: shipping_pincode || billing_pincode,
                shipping_state: shipping_state || billing_state,
                shipping_country: shipping_country || billing_country,
                shipping_email: shipping_email || billing_email,
                shipping_phone: shipping_phone || billing_phone,
                order_items,
                payment_method: payment_method || 'Prepaid',
                shipping_charges: shipping_charges || 0,
                giftwrap_charges: giftwrap_charges || 0,
                transaction_charges: transaction_charges || 0,
                total_discount: total_discount || 0,
                sub_total,
                length: length || 10,
                breadth: breadth || 10,
                height: height || 10,
                weight: weight || 1
            };

            const response = await this.makeRequest('POST', '/orders/create/adhoc', data);

            if (response.status_code === 1) {
                logger.info(`Shiprocket order created: ${order_id}, Order ID: ${response.order_id}`);
                return {
                    success: true,
                    order_id: response.order_id,
                    shipment_id: response.shipment_id,
                    status: response.status,
                    onboarding_completed_now: response.onboarding_completed_now
                };
            }

            throw new Error(response.message || 'Order creation failed');
        } catch (error) {
            logger.error('Failed to create Shiprocket order:', error);
            throw error;
        }
    }

    async assignAWB(shipmentId, courierId) {
        try {
            const data = {
                shipment_id: shipmentId,
                courier_id: courierId
            };

            const response = await this.makeRequest('POST', '/courier/assign/awb', data);

            if (response.awb_assign_status === 1) {
                logger.info(`AWB assigned to shipment ${shipmentId}: ${response.response.data.awb_code}`);
                return {
                    success: true,
                    awb_code: response.response.data.awb_code,
                    courier_name: response.response.data.courier_name,
                    courier_id: response.response.data.courier_id
                };
            }

            throw new Error(response.message || 'AWB assignment failed');
        } catch (error) {
            logger.error('Failed to assign AWB:', error);
            throw error;
        }
    }

    async schedulePickup(pickupData) {
        try {
            const {
                shipment_id,
                pickup_date,
                pickup_time
            } = pickupData;

            const data = {
                shipment_id: Array.isArray(shipment_id) ? shipment_id : [shipment_id],
                pickup_date,
                pickup_time
            };

            const response = await this.makeRequest('POST', '/courier/generate/pickup', data);

            if (response.pickup_status === 1) {
                logger.info(`Pickup scheduled for shipments: ${shipment_id}`);
                return {
                    success: true,
                    pickup_token_number: response.pickup_token_number,
                    status: response.status,
                    others: response.others
                };
            }

            throw new Error(response.message || 'Pickup scheduling failed');
        } catch (error) {
            logger.error('Failed to schedule pickup:', error);
            throw error;
        }
    }

    async trackShipment(awbCode) {
        try {
            const response = await this.makeRequest('GET', `/courier/track/awb/${awbCode}`);

            if (response.status_code === 1) {
                const trackingData = response.tracking_data;
                return {
                    success: true,
                    awb_code: awbCode,
                    current_status: trackingData.track_status,
                    delivered: trackingData.delivered,
                    destination: trackingData.destination,
                    consignee_name: trackingData.consignee_name,
                    origin: trackingData.origin,
                    courier_name: trackingData.courier_name,
                    edd: trackingData.edd,
                    pod_details: trackingData.pod_details,
                    tracking_history: trackingData.shipment_track || []
                };
            }

            throw new Error(response.message || 'Tracking failed');
        } catch (error) {
            logger.error('Failed to track shipment:', error);
            throw error;
        }
    }

    async generateLabel(shipmentIds) {
        try {
            const data = {
                shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
            };

            const response = await this.makeRequest('POST', '/courier/generate/label', data);

            if (response.label_created === 1) {
                logger.info(`Labels generated for shipments: ${shipmentIds}`);
                return {
                    success: true,
                    label_url: response.label_url,
                    is_label_created: response.is_label_created
                };
            }

            throw new Error(response.message || 'Label generation failed');
        } catch (error) {
            logger.error('Failed to generate label:', error);
            throw error;
        }
    }

    async generateManifest(shipmentIds) {
        try {
            const data = {
                shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
            };

            const response = await this.makeRequest('POST', '/courier/generate/manifest', data);

            if (response.manifest_created === 1) {
                logger.info(`Manifest generated for shipments: ${shipmentIds}`);
                return {
                    success: true,
                    manifest_url: response.manifest_url,
                    is_manifest_created: response.is_manifest_created
                };
            }

            throw new Error(response.message || 'Manifest generation failed');
        } catch (error) {
            logger.error('Failed to generate manifest:', error);
            throw error;
        }
    }

    async generateInvoice(shipmentIds) {
        try {
            const data = {
                ids: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
            };

            const response = await this.makeRequest('POST', '/orders/print/invoice', data);

            if (response.invoice_created === 1) {
                logger.info(`Invoice generated for shipments: ${shipmentIds}`);
                return {
                    success: true,
                    invoice_url: response.invoice_url,
                    is_invoice_created: response.is_invoice_created
                };
            }

            throw new Error(response.message || 'Invoice generation failed');
        } catch (error) {
            logger.error('Failed to generate invoice:', error);
            throw error;
        }
    }

    async cancelShipment(awbCodes) {
        try {
            const data = {
                awbs: Array.isArray(awbCodes) ? awbCodes : [awbCodes]
            };

            const response = await this.makeRequest('POST', '/orders/cancel/shipment/awbs', data);

            logger.info(`Shipment cancellation requested for AWBs: ${awbCodes}`);
            return {
                success: true,
                message: response.message,
                status: response.status
            };
        } catch (error) {
            logger.error('Failed to cancel shipment:', error);
            throw error;
        }
    }

    async getShipmentDetails(shipmentId) {
        try {
            const response = await this.makeRequest('GET', `/orders/show/${shipmentId}`);

            if (response.status_code === 1) {
                return {
                    success: true,
                    data: response.data
                };
            }

            throw new Error(response.message || 'Failed to get shipment details');
        } catch (error) {
            logger.error('Failed to get shipment details:', error);
            throw error;
        }
    }

    async getNDRDetails(awbCode) {
        try {
            const response = await this.makeRequest('GET', `/courier/track/awb/${awbCode}`);

            if (response.status_code === 1) {
                const trackingData = response.tracking_data;
                const ndrEvents = trackingData.shipment_track?.filter(event =>
                    event.current_status?.toLowerCase().includes('ndr') ||
                    event.current_status?.toLowerCase().includes('non delivery')
                ) || [];

                return {
                    success: true,
                    has_ndr: ndrEvents.length > 0,
                    ndr_events: ndrEvents,
                    current_status: trackingData.track_status
                };
            }

            throw new Error(response.message || 'Failed to get NDR details');
        } catch (error) {
            logger.error('Failed to get NDR details:', error);
            throw error;
        }
    }

    verifyWebhookSignature(payload, signature, secret) {
        try {
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(JSON.stringify(payload))
                .digest('hex');

            return signature === expectedSignature;
        } catch (error) {
            logger.error('Webhook signature verification failed:', error);
            return false;
        }
    }

    async processWebhook(payload, signature) {
        try {
            const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;

            if (webhookSecret && !this.verifyWebhookSignature(payload, signature, webhookSecret)) {
                throw new Error('Invalid webhook signature');
            }

            const { awb, current_status, delivered, edd, courier_name } = payload;

            logger.info(`Shiprocket webhook received: AWB ${awb}, Status: ${current_status}`);

            return {
                success: true,
                awb_code: awb,
                status: current_status,
                delivered: delivered === 'true' || delivered === true,
                edd: edd,
                courier_name: courier_name,
                processed_at: new Date()
            };
        } catch (error) {
            logger.error('Webhook processing failed:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            await this.authenticate();
            const locations = await this.getPickupLocations();

            return {
                success: true,
                message: 'Shiprocket connection successful',
                pickup_locations_count: locations.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Create singleton instance
const shiprocketService = new ShiprocketService();

module.exports = shiprocketService;