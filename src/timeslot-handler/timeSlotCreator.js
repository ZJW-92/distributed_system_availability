const Variables = require("../config/variables");
const {ClinicDataStore} = require("./clinicDataStore");

class TimeSlotCreator {
    constructor() {
    }

    createTimeslot(clinic, day) {
        const timeslotArray = [];
        let start = '';
        let close = '';

        //get openinghours depending on day
        if (day === Variables.MONDAY) {
            start = clinic.openinghours.monday.split('-')[0];
            close = clinic.openinghours.monday.split('-')[1];
        }
        if (day === Variables.TUESDAY) {
            start = clinic.openinghours.tuesday.split('-')[0];
            close = clinic.openinghours.tuesday.split('-')[1];
        }
        if (day === Variables.WEDNESDAY) {
            start = clinic.openinghours.wednesday.split('-')[0];
            close = clinic.openinghours.wednesday.split('-')[1];
        }
        if (day === Variables.THURSDAY) {
            start = clinic.openinghours.thursday.split('-')[0];
            close = clinic.openinghours.thursday.split('-')[1];
        }
        if (day === Variables.FRIDAY) {
            start = clinic.openinghours.friday.split('-')[0];
            close = clinic.openinghours.friday.split('-')[1];
        }

        //parse hour and minutes for opening

        let startHour = parseInt(start.split(':')[0]);
        let startMinute = '00';

        //parse hour for closing to calculate amount of timeslots

        let closeTime = close.split(':')[0];
        let timeSlots = (closeTime-startHour)*2;

        //assign temp variables to manipulate within for loop

        let tempHour = startHour;
        let tempMinute = startMinute;
        let startHalfHour = start.split(':')[1]
        let closeHalfHour = close.split(':')[1]

        // When starting hour equals ending hour, e.g. 9:00-9:30 push to timeslotArray and return its value
        // In case closing hour is not half an hour later this does not get executed (e.g. getting from
        // the API something wrong such as 9:00-9:00 or even 9:00-9:15 etc)
        if (timeSlots === 0 && closeHalfHour === '30') {
            if (startHalfHour === '00') {
                timeslotArray.push({
                    "time": start + ' - ' + close,
                    "availableDentists": clinic.dentists
                });
                return timeslotArray;
            } else {
                // In case of e.g. 9:30-9:30 it returns "9:00 - undefined:NaN", thus we return empty timeslotArray instead
                return timeslotArray;
            }
        }

        //for loop pushes to timearray on first iteration with only adding +30 minutes to endtime of timeslot
        //iterate as many times as there are supposed to be timeslots

        for (var i=0; i<timeSlots; i++){
            if(i === 0) {
                timeslotArray.push({
                    "time": startHour + ':' + tempMinute + ' - ' + (startHour) + ':' + (parseInt(tempMinute + 30)),
                    "availableDentists": clinic.dentists
                });
                // timeArray.push({[startHour + ':' + tempMinute + ' - ' + (startHour) + ':' + (parseInt(tempMinute+30))]: clinic.dentists})
            } else {
                tempMinute = parseInt(tempMinute) + 30;
                //check if hour needs to be added
                if (tempMinute === 60) {
                    tempMinute = '00';
                    tempHour += 1;
                }
                //create ending hours and minutes for the timeslots, always 30 minutes
                var endHour = tempHour;
                var endMinute = parseInt(tempMinute) + 30;

                if (endMinute === 60) {
                    endMinute = '00';
                    endHour += 1;
                }
                //push the timeslot for every iteration to the array, with the amount of dentists the clinic has
                timeslotArray.push({
                    "time": tempHour + ':' + tempMinute + ' - ' + endHour + ':' + endMinute,
                    "availableDentists": clinic.dentists
                });
                //timeArray.push({[tempHour + ':' + tempMinute + ' - ' + endHour + ':' + endMinute]: clinic.dentists})
            }
        }
        if (startHalfHour === '30') {
            timeslotArray.splice(0,1)
        }
        if (closeHalfHour === '30'){
            tempHour += 1
            tempMinute = '00'
            timeslotArray.push({
                "time": tempHour + ':' + tempMinute + ' - ' + endHour + ':' + (parseInt(endMinute + 30)),
                "availableDentists": clinic.dentists
            })
        }
        return timeslotArray;

    }

    populateAvailability(message) {
        const clinic = message;
        const clinicDataStore = new ClinicDataStore();

        clinic.availability = [];

        var dateObj = new Date(Date.now())

        for(var j = 0; j<365; j++) {

            var repeatDate = dateObj.setDate(dateObj.getDate() + 1);
            var repeats = new Date(repeatDate);

            var date = repeats.toISOString().split('T')[0];

            var day = repeats.getDay();

            //check if day is saturday or sunday
            if(day !== 6 && day !== 0) {
                clinic.availability.push({
                    "date": date,
                    "timeslots": this.createTimeslot(clinic, day)
                });
            }
        }
        clinicDataStore.saveClinic(clinic);
    }

    updateTimeslots(dentist, day, newHours) {
        // goes through availability array before any changes are made
        const clinicDataStore = new ClinicDataStore();
        for(let i = 0; i<dentist.availability.length; i++) {
            let date = dentist.availability[i].date;
            let dateObj = Date.parse(date);
            dateObj = new Date(dateObj);

            // make changes when the current availability object (availability[i]) is a weekday of where the opening hours change
            if (dateObj.toLocaleString('en-us', {weekday: 'long'}).toLowerCase() === day) {
                let newTimeslotArray = this.createTimeslot(newHours, dateObj.getDay())
                let oldTimeslotArray = dentist.availability[i].timeslots
                // update the timeslot array of the availability object according to the new opening hours
                dentist.availability[i] = ({
                    "date": date,
                    "timeslots": newTimeslotArray
                })

                // goes through the old timeslot array to update the available dentist to the value before the update
                for(let j = 0; j < oldTimeslotArray.length; j++){
                    let time = oldTimeslotArray[j].time;
                    let newTimeObject = dentist.availability[i].timeslots.find(obj => obj.time === time)

                    // only update the objects that exist in the update version. When opening hours are longer then the old opening hours keep the existing amount of dentist in the clinic.
                    if (newTimeObject !== undefined){
                        newTimeObject.availableDentists = oldTimeslotArray[j].availableDentists
                    }
                }
            }
        }
        dentist.openinghours[day] = newHours.openinghours[day];
        clinicDataStore.saveAvailability(dentist, dentist.id);
    }
}
module.exports.TimeSlotCreator = TimeSlotCreator