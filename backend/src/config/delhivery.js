const axios = require('axios');

class DelhiveryAPI {
    constructor() {
        this.apiKey = process.env.DELHIVERY_API_KEY;
        this.baseURL = process.env.DELHIVERY_BASE_URL;
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Token ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createShipment(shipmentData) {
        try {
            const response = await this.client.post('/cmu/create.json', shipmentData);
            return response.data;
        } catch (error) {
            throw new Error(`Delhivery API Error: ${error.response?.data?.message || error.message}`);
        }
    }

    async trackShipment(waybill) {
        try {
            const response = await this.client.get(`/v1/packages/json/?waybill=${waybill}`);
            return response.data;
        } catch (error) {
            throw new Error(`Tracking Error: ${error.response?.data?.message || error.message}`);
        }
    }

    async cancelShipment(waybill) {
        try {
            const response = await this.client.post('/api/p/edit', {
                waybill,
                cancellation: true
            });
            return response.data;
        } catch (error) {
            throw new Error(`Cancellation Error: ${error.response?.data?.message || error.message}`);
        }
    }
}

module.exports = new DelhiveryAPI();