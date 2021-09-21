const {MQTT} = require('./mqttConnector');
const variables = require("../config/variables");
const {TimeSlotController} = require("../timeslot-handler/timeSlotController");
const {BookingProcessor} = require("../timeslot-handler/bookingProcessor");

class BrokerListener {
    constructor() {
    }
    listenForMessage() {
        MQTT.on('message', function (topic, message) {
            if (topic === variables.DENTIST_TOPIC) {
                const timeSlotController = new TimeSlotController();
                timeSlotController.processMessage(message);
            }
            if(topic === variables.BOOKING_TOPIC) {
                const bookingProcessor = new BookingProcessor();
                bookingProcessor.processMessage(message);
            }
        })
    }
}
module.exports.BrokerListener = BrokerListener
