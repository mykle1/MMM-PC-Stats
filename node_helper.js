/* Magic Mirror
 * Module: MMM-PC-Stats
 *https://www.npmjs.com/package/systeminformation
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');

const request = require('pc-stats');


module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getStats: function(url) {
    //    var self= this;
		var stats = require('pc-stats')
		stats().then((statistics) => {
    	 this.sendSocketNotification("STATS_RESULT", statistics);
		})
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_STATS') {
            this.getStats(payload);
        }
    }
});
