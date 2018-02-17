/* Magic Mirror
 * Module: MMM-PC-Stats
 *https://www.npmjs.com/package/systeminformation
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
const request = require('pc-stats');
var lm_sensors = require('sensors.js');

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getStats: function(url) { 
		var stats = require('pc-stats')
		stats().then((statistics) => { 
    	 this.sendSocketNotification("STATS_RESULT", statistics);
		})
		this.getSensors();
    },
	
	getSensors: function(url) {
         var self= this;
		lm_sensors.sensors(function (data, error) {
			if (error) throw error; 
			var result = data;
			self.sendSocketNotification("SENSORS_RESULT", result);
	//		console.log(result); // for checking
			
		});
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_STATS') {
            this.getStats(payload);
        }
		if (notification === 'GET_SENSORS') {
            this.getSensors(payload);
        }
    }
});
