/* Magic Mirror
 * Module: MMM-PC-Stats
 *https://www.npmjs.com/package/systeminformation
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
const exec = require('child_process').exec;
const request = require('pc-stats');
var lm_sensors = require('sensors.js');
const path=require('path');
const converter=require(path.resolve(__dirname,"converter.js"));
const BIN='/usr/bin/sensors -u';

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getStats: function(url) {
		var stats = require('pc-stats')
		stats().then((statistics) => {
      var result = statistics.cpu.threads;
         //   console.log(result);
    	 this.sendSocketNotification("STATS_RESULT", statistics);
		})
		this.getSensors();
    },

	getSensors: function(url) {
    var self= this;
		exec(BIN, (error, stdout, stderr) => {
    	if ( error ) {
      	throw error;
    	} 
			else {
      	const out = stdout.toString();

      	if ( out.length > 5 ) {
      	  self.sendSocketNotification("SENSORS_RESULT", converter.convertToJson(out));
      	}
			}
    })
  },

/*    getTerminal: function(url) {
      var self= this;
//      exec("sensors", (err, stdout, stderr) => console.log(stdout));
      exec("sensors").stdout.on('data', function(stdout) {
      //console.log(JsonConvert.SerializeObject(stdout));

      var str = stdout

      var pattern = [
        "(fan[0-9]):[\\s]+([0-9]+ RPM)",
        "(temp[0-9]):[\\s]+(\\+[0-9\\.]+°C)",
        "(Core [0-9]):[\\s]+(\\+[0-9\\.]+°C)", // for cpu cores. WORKING!

      ]
      for (i = 0; i < pattern.length; i++) {
        var rx = new RegExp(pattern[i], "g")
        var found
        do {
          found = rx.exec(str)
          if (found) console.log(found[1], found[2])
        } while(found)
      }

      // create array
      var data = [];
      // set vars
      var data  = rx.exec(str) ;
      
      // Make each into an object so they can be put into a rotation
      fan1  =  {fan1};
      fan2 = {fan2};
      fan3 = {fan3};
      temp1 = {temp1};
      temp1 = {temp1};
      temp2 = {temp2};
      temp3 = {temp3};
      Core_0 = {Core_0};
      Core_0 = {Core_0};
      Core_0 = {Core_0};
      Core_0 = {Core_0};

      data.push(fan1,fan2,fan3,temp1,temp1,temp2,temp3,Core_0,Core_1,Core_2,Core_3,); // push the data
//      console.log(response.statusCode + data); // for checking

      self.sendSocketNotification('TERMINAL_RESULT', data); // sends pattern, not result, not array, not objects
   });

},*/


    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_STATS') {
            this.getStats(payload);
        }
		if (notification === 'GET_SENSORS') {
            this.getSensors(payload);
        }
    if (notification === 'GET_TERMINAL') {
                this.getTERMINAL(payload);
    }
  }
});

// nouveau nouveau-pci-0100 is the GPU, GPU fans and tempUnits

// coretemp-isa-0000 are the cores of your CPU, temps and threshold

// f71858fg-isa-0a00 is the motherboard sensors and fans


// var str =
//`nouveau-pci-0100↵Adapter: PCI adapter
// fan1: 1170 RPM
// temp1: +43.0°C  (high = +95.0°C, hyst =  +3.0°C) (crit = +105.0°C, hyst =  +5.0°C) (emerg = +135.0°C, hyst =  +5.0°C)

// coretemp-isa-0000↵Adapter: ISA adapter↵Core 0: +46.0°C  (high = +83.0°C, crit = +99.0°C)
//                                        Core 1: +41.0°C  (high = +83.0°C, crit = +99.0°C)
//                                        Core 2: +46.0°C  (high = +83.0°C, crit = +99.0°C)
//                                        Core 3: +38.0°C  (high = +83.0°C, crit = +99.0°C)

// f71858fg-isa-0a00↵Adapter: ISA adapter↵+3.3V: +3.31 V  ↵3VSB: +3.30 V  ↵Vbat: +3.20 V
// fan1: 1910 RPM
// fan2: 1069 RPM
// fan3: 0 RPM  ALARM
// temp1: +34.5°C  (high = +70.0°C, hyst = +60.0°C)
// temp2: +29.5°C  (high = +100.0°C, hyst = +85.0°C)
// temp3: +36.4°C  (high = +100.0°C, hyst = +85.0°C)↵↵`
