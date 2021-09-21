const {ChangeChecker} = require("./changeChecker");


class TimeSlotController {
    constructor() {
    }
    processMessage(message) {
        const buffer = message.toString('utf-8');

        const changeChecker = new ChangeChecker();

        changeChecker.checkChange(buffer)
    }
}
module.exports.TimeSlotController = TimeSlotController