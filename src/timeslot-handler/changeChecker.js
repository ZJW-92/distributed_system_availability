const fs = require("fs");
const {Watcher} = require("../services/watcher");
const {Publisher} = require("../services/publisher");
const {TimeSlotCreator} = require("./timeSlotCreator");
const {TimeSlotPerDateInitiator} = require("../timeslotsPerDate-handler/timeSlotPerDateInitiator")

class ChangeChecker {
    constructor() {
    }
    checkChange(message) {
        const dentists = JSON.parse(message).dentists
        const timeSlotCreator = new TimeSlotCreator()
        const timeSlotPerDateInitiator = new TimeSlotPerDateInitiator();

        const publisher = new Publisher()
        const watcher = new Watcher()

        for(let i=1; i<=dentists.length; i++){
            let fileName = './availability-data/availability-' + dentists[i-1].id +'.json'
            try {
                if (fs.existsSync(fileName)) {
                    this.checkDentistCount(dentists[i-1], fileName)
                    this.checkDentistOpeningHours(dentists[i-1], fileName)
                    console.log(fileName)
                    publisher.publishTimeSlots(fileName)
                    watcher.watch(fileName)
                } else {
                    timeSlotCreator.populateAvailability(dentists[i-1])
                }
                if (i === dentists.length){
                    timeSlotPerDateInitiator.initiateAvailabilityPerDay()
                }
            } catch(err) {
                console.error(err)
            }
        }
    }
    checkDentistCount(dentists, fileName) {
        let data = fs.readFileSync(fileName);
        let existingDentists = JSON.parse(data);
        let difference = dentists.dentists - existingDentists.dentists
        if(difference !== 0) {
            existingDentists.dentists = dentists.dentists;

            // goes through every date object in availability array
            for(let i = 0; i < existingDentists.availability.length; i++) {
                // goes through every timeslot object in a date
                for(let j = 0; j< existingDentists.availability[i].timeslots.length; j++) {
                    if(difference < 0){
                        existingDentists.availability[i].timeslots[j].availableDentists -= Math.abs(difference)
                    }else {
                        existingDentists.availability[i].timeslots[j].availableDentists += difference
                    }
                }
            }
        }
        fs.writeFileSync(fileName, JSON.stringify(existingDentists));
    }
    checkDentistOpeningHours(dentist, fileName) {
        const timeSlotCreator = new TimeSlotCreator();
        let data = fs.readFileSync(fileName);
        let oldDentist = JSON.parse(data);
        for(let day in oldDentist.openinghours) {
            if(dentist.openinghours[day] !== oldDentist.openinghours[day]){
                timeSlotCreator.updateTimeslots(oldDentist, day, dentist)
            }
        }
    }
}
module.exports.ChangeChecker = ChangeChecker