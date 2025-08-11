const delhiveryAPI = require('../config/delhivery');

class ShippingService {
    async createShipment(orderData) {
        try {
            const {
                orderId,
                customerDetails,
                shippingAddress,
                items,
                weight,
                dimensions
            } = orderData;

            const shipmentData = {
                shipments: [{
                    name: customerDetails.name,
                    add: shippingAddress.address,
                    pin: shippingAddress.pincode,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    country: shippingAddress.country || 'India',
                    phone: customerDetails.phone,
                    order: orderId,
                    payment_mode: 'Prepaid',
                    return_pin: '110001', // Your return pincode
                    return_city: 'Delhi',
                    return_phone: '9999999999',
                    return_add: 'Your return address',
                    return_state: 'Delhi',
                    return_country: 'India',
                    products_desc: items.map(item => item.name).join(', '),
                    hsn_code: '123456',
                    cod_amount: '0',
                    order_date: new Date().toISOString().split('T')[0],
                    total_amount: orderData.amount,
                    seller_add: 'Your business address',
                    seller_name: 'Your Business Name',
                    seller_inv: orderId,
                    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
                    waybill: '',
                    shipment_width: dimensions?.width || 10,
                    shipment_height: dimensions?.height || 10,
                    weight: weight || 0.5,
                    seller_gst_tin: 'Your GST Number',
                    shipping_mode: 'Surface',
                    address_type: 'home'
                }]
            };

            const result = await delhiveryAPI.createShipment(shipmentData);

            return {
                success: true,
                waybill: result.packages[0].waybill,
                status: result.packages[0].status,
                trackingUrl: `https://www.delhivery.com/track/package/${result.packages[0].waybill}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async trackShipment(waybill) {
        try {
            const result = await delhiveryAPI.trackShipment(waybill);
            const shipment = result.ShipmentData[0].Shipment;

            return {
                success: true,
                status: shipment.Status.Status,
                location: shipment.Status.StatusLocation,
                statusDate: shipment.Status.StatusDateTime,
                scans: shipment.Scans.map(scan => ({
                    location: scan.ScanDetail.ScannedLocation,
                    status: scan.ScanDetail.Scan,
                    date: scan.ScanDetail.ScanDateTime,
                    instructions: scan.ScanDetail.Instructions
                }))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async cancelShipment(waybill) {
        try {
            const result = await delhiveryAPI.cancelShipment(waybill);
            return {
                success: true,
                message: 'Shipment cancelled successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    calculateShippingCost(weight, distance, serviceType = 'standard') {
        // Basic shipping cost calculation
        const baseRate = serviceType === 'express' ? 100 : 50;
        const weightRate = weight * 20;
        const distanceRate = distance > 500 ? 30 : 15;

        return Math.ceil(baseRate + weightRate + distanceRate);
    }
}

module.exports = new ShippingService();