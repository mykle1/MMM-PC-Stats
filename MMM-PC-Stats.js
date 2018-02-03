/* Magic Mirror
 * Module: MMM-PC-Stats
 *
 * By Mykle1
 *
 */
Module.register("MMM-PC-Stats", {

    defaults: {
        useHeader: false,
        header: "",
        maxWidth: "300px",
        animationSpeed: 0,
        initialLoadDelay: 3250,
        retryDelay: 2500,
        updateInterval: 60 * 1000
    },

    getStyles: function() {
        return ["MMM-PC-Stats.css"];
    },

    getScripts: function() {

        return ["moment.js"];
    },


    start: function() {
        Log.info("Starting module: " + this.name);
        this.Stats = {};
        this.scheduleUpdate();
    },


    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("Scanning CPU and RAM . . .");
            wrapper.classList.add("bright", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("small", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var Stats = this.Stats;

		// Your CPU and CPU speed
        var yourCPU = document.createElement("div");
        yourCPU.classList.add("small", "bright", "yourCPU");
        yourCPU.innerHTML = Stats.cpu.name;
        wrapper.appendChild(yourCPU);


		// Your total RAM and Free RAM
        var ram = document.createElement("div");
        ram.classList.add("small", "bright", "ram");
        ram.innerHTML = "Total RAM = " + Stats.ram.total + Stats.ram.unit + " &nbsp &nbsp " +
            				" Free RAM = " + Stats.ram.free + Stats.ram.unit;
        wrapper.appendChild(ram);

        for (var i = 0, len = Stats.cpu.threads.length; i < len; i++) {

            var Element = document.createElement("div");
            Element.classList.add("small", "bright", "cores");
            Element.innerHTML = Stats.cpu.threads[i].name + " &nbsp  @  &nbsp " 
								+ Number(Math.round(Stats.cpu.threads[i].usage+'e2')+'e-2') + "%";
            wrapper.appendChild(Element);
        }

        return wrapper;

    },


    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_STATS') {
            this.hide();
        } else if (notification === 'SHOW_STATS') {
            this.show(1000);
        }
    },

    processStats: function(data) {
        this.Stats = data;
        this.loaded = true;
	//	console.log(this.Stats); // for checking in dev console
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getStats();
        }, this.config.updateInterval);
        this.getStats(this.config.initialLoadDelay);
    },

    getStats: function() {
        this.sendSocketNotification('GET_STATS');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "STATS_RESULT") {
            this.processStats(payload);
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});