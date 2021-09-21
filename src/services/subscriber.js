const {MQTT} = require('./mqttConnector');

class Subscriber {
    constructor() {
    }
    connectToBroker() {
        MQTT.on('connect', function () {
            console.log('Connected to Broker');
        })
    }

    subscribeToTopic(topic) {
        MQTT.subscribe(topic, function () {
            console.log('Subscribed ' + topic)
        })
    }
}
module.exports.Subscriber = Subscriber

