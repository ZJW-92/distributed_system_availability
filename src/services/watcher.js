const {Publisher} = require( "./publisher");
const fs = require("fs");

class Watcher {
    constructor() {
    }
    watch(file) {
        fs.watchFile(file, () => {
            let publisher = new Publisher();
            publisher.publishTimeSlots(file);
        })
    }
}

module.exports.Watcher = Watcher;
