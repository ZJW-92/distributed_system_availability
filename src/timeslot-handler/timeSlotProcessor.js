const {ClinicDataStore} = require("./clinicDataStore")
const fs = require("fs")

class TimeSlotProcessor {
    constructor() {
    }

    checkAvailability(message) {
        let booking = JSON.parse(message);

        const file = "./availability-data/availability-" + booking.dentistid + ".json";
        const bookingHour = booking.time.split(" ")[1];
        const bookingDate = booking.time.split(" ")[0];


        let data = fs.readFileSync(file)
        const clinicAvailabilityArray = JSON.parse(data).availability
        let dateObject = clinicAvailabilityArray.find(obj => obj.date === bookingDate);
        booking.available = false;

        if (dateObject !== undefined) {
            // finds the time Object that corresponds to the booking time
            let timeObject = dateObject.timeslots.find(obj => obj.time.split(" -")[0] === bookingHour);

            // Only when timeObject has available dentist then set booking.availability to true
            if (timeObject !== undefined && timeObject.availableDentists > 0) {
                booking.available = true;
            }
        }
        return (booking);
    }

    takeTimeSlot(booking) {
        const clinicDataStore = new ClinicDataStore();
        const file = "./availability-data/availability-" + booking.dentistid + ".json";
        const bookingHour = booking.time.split(" ")[1];
        const bookingDate = booking.time.split(" ")[0];

        let data = fs.readFileSync(file);
        const jsonFile = JSON.parse(data);
        const availabilityArray = jsonFile.availability;
        let dateObject = availabilityArray.find(obj => obj.date === bookingDate);
        if (dateObject !== undefined) {

            // finds the time Object that corresponds to the booking time
            let timeObject = dateObject.timeslots.find(obj => obj.time.split(" -")[0] === bookingHour);

            // checks for available time slots at booking time
            if (timeObject !== undefined) {
                timeObject.availableDentists--;
                clinicDataStore.saveAvailability(jsonFile, booking.dentistid);
            }
        }
    }
}

module.exports.TimeSlotProcessor = TimeSlotProcessor