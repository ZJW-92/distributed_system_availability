const {MQTT} = require("./mqttConnector")
const fs = require("fs")
const variables = require("../config/variables")

class Publisher {
    constructor() {
    }

    publishTimeSlots(file) {
        let data = fs.readFileSync(file)
        const clinic = data.toString('utf-8');
        let clinicId = JSON.parse(clinic).id;
        let availability = JSON.parse(clinic).availability

        MQTT.publish(variables.AVAILABILITY_TOPIC + "/" + clinicId, JSON.stringify(availability), {
            retain: true,
            qos: 1
        });
    }

    publishBookingConfirmation(booking) {
        delete booking.datePos
        delete booking.hourPos
        console.log(booking)
        MQTT.publish(variables.BOOKING_RESPONSE_TOPIC, JSON.stringify(booking), {qos: 1})
    }

    publishAvailabilityForDate(date, data) {
        MQTT.publish(variables.AVAILABILITY_DATE_TOPIC + '/' + date, data, {retain: true, qos: 0});
    }
}
module.exports.Publisher = Publisher;


