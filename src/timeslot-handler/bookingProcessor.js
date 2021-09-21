const fs = require("fs");
const {TimeSlotProcessor} = require("./timeSlotProcessor");
const {TimeSlotPerDateDataProcessor} = require("../timeslotsPerDate-handler/timeSlotPerDateDataProcessor");
const {Publisher} = require ("../services/publisher");

class BookingProcessor {
    constructor() {
        this.publisher = new Publisher();
    }
    processMessage(message) {
        const timeSlotProcessor = new TimeSlotProcessor();

        let availabilityResponse = timeSlotProcessor.checkAvailability(message);
        if (availabilityResponse.available) {
            timeSlotProcessor.takeTimeSlot(availabilityResponse);
            this.updateAvailabilityForDate(availabilityResponse);
        }
        this.publisher.publishBookingConfirmation(availabilityResponse);

    }

    updateAvailabilityForDate(booking) {
        const timeSlotPerDateDataProcessor = new TimeSlotPerDateDataProcessor();
        const availabilityDir = './availability-data/';
        let clinicsNumber = fs.readdirSync(availabilityDir).length;
        let date = booking.time.split(' ')[0];
        let availability =  timeSlotPerDateDataProcessor.getAvailabilityForClinicForDate(booking.dentistid, date);

        // when the last timeslot of clinic for a date has been taken it should check the availability for the other clinics for that date ans republish the current availability status
        if (!availability) {
            let availabilityForDate = timeSlotPerDateDataProcessor.getAvailabilityForAllClinicsForDate(clinicsNumber, date);
            this.publisher.publishAvailabilityForDate(date, JSON.stringify(availabilityForDate));
        }
    }
}
module.exports.BookingProcessor = BookingProcessor