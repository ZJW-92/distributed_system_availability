const fs = require("fs");
const {Publisher} = require("../services/publisher")
const {TimeSlotPerDateDataProcessor} = require("./timeSlotPerDateDataProcessor")

class TimeSlotPerDateInitiator {
    constructor() {
        this.publisher = new Publisher();
        this.timeSlotPerDateDataProcessor = new TimeSlotPerDateDataProcessor();
    }

    initiateAvailabilityPerDay() {
        const availabilityDir = './availability-data/';
        let clinicsNumber = fs.readdirSync(availabilityDir).length;
        let dateObj = new Date(Date.now());
        let availabilityObject = {};

        let clinicOneData =  fs.readFileSync('./availability-data/availability-1.json');
        let availabilityDataLength = JSON.parse(clinicOneData).availability.length;

        for(let i = 0; i < availabilityDataLength; i++) {

            let repeatDate = dateObj.setDate(dateObj.getDate() + 1);
            let repeats = new Date(repeatDate)

            let date = repeats.toISOString().split('T')[0];

            let weekDay = repeats.getDay();

            //check if day is saturday or sunday
            if(weekDay !== 6 && weekDay !== 0) {
                 availabilityObject = this.timeSlotPerDateDataProcessor.getAvailabilityForAllClinicsForDate(clinicsNumber, date);
            } else {
                availabilityObject =  this.timeSlotPerDateDataProcessor.getUnavailableForAllClinics(clinicsNumber);
            }
            this.publisher.publishAvailabilityForDate(date, JSON.stringify(availabilityObject));
        }
    }
}

module.exports.TimeSlotPerDateInitiator = TimeSlotPerDateInitiator
