/* Magic Mirror
 * Module: MMM-PC-Stats
 *
 * By Mykle1
 *
 */
Module.register("MMM-PC-Stats", {

    defaults: {
        videoCard: "NVIDIA GeForce GTX660", // name of your video card
        useHeader: false,
        header: "",
        maxWidth: "300px",
        animationSpeed: 0,
        initialLoadDelay: 3250,
        retryDelay: 2500,
        updateInterval: 60 * 1000,


        coresArray: {
            "Core 0": [0],
            "Core 1": [1],
            "Core 2": [2],
            "Core 3": [3],
            "Core 4": [4],
            "Core 5": [5],
            "Core 6": [6],
            "Core 7": [7],
        }
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
        this.Sensors = {};
        this.Terminal = {};
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
        var Sensors = this.Sensors;
        var Terminal = this.Terminal;

        // Your total RAM and Free RAM
        var ram = document.createElement("div");
        ram.classList.add("small", "bright", "ram");
        ram.innerHTML = "Total RAM = " + Stats.ram.total + Stats.ram.unit + " &nbsp &nbsp " +
            " Free RAM = " + Stats.ram.free + Stats.ram.unit;
        wrapper.appendChild(ram);


        // Your CPU and CPU speed
        var yourCPU = document.createElement("div");
        yourCPU.classList.add("small", "bright", "yourCPU");
        yourCPU.innerHTML = Stats.cpu.name;
        wrapper.appendChild(yourCPU);



        // Check if Graphics cpu has temp sensor
        var graphicsTempCheck = Sensors["nouveau-pci-0100"];
        if (typeof graphicsTempCheck !== 'undefined') {

            // graphicsTemp
            var graphicsTemp = document.createElement("div");
            graphicsTemp.classList.add("small", "bright", "graphicsTemp");
            graphicsTemp.innerHTML = this.config.videoCard + " temp @ " + Sensors["nouveau-pci-0100"]["temp1"]["current"] ;
            wrapper.appendChild(graphicsTemp);

        }

        for (var i = 0, len = Stats.cpu.threads.length; i < len; i++) {

            var Element = document.createElement("div");
            Element.classList.add("small", "bright", "usage");
            Element.innerHTML = Stats.cpu.threads[i].name + " &nbsp  @  &nbsp " +
                Number(Math.round(Stats.cpu.threads[i].usage + 'e2') + 'e-2') + "%";
            wrapper.appendChild(Element);
        }
             
							// loop thru any available cores..
							// max cores - 8
								var adapter ='coretemp-isa-0000';
                for (var i = 0;i<8; i++) {
										let c="Core "+i;
										try {
											if(Sensors[adapter][c] !== "undefined"){
 		                	   var newElement = document.createElement("div");
    		            	   newElement.classList.add("small", "bright", "core"+i+"Temp");
        		        	   newElement.innerHTML = c + " &nbsp  @  &nbsp " + Sensors[adapter][c].current;
                  	  	 wrapper.appendChild(newElement);
											}
											else
												break;
										}
										catch(exception)
										{
											// catch the reference error for 'Core 4' etc..
												break;
										}
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
      //  		console.log(this.Stats); // for checking in dev console
    },

    processSensors: function(data) {
        this.Sensors = JSON.parse(data);
//        this.loaded = true;
//        		console.log(this.Sensors); // for checking in dev console
    },

    processTerminal: function(data) {
        this.Terminal = data;
//        this.loaded = true;
//        		console.log(this.Terminal); // for checking in dev console
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
        if (notification === "SENSORS_RESULT") {
            this.processSensors(payload);
            this.updateDom(this.config.fadeSpeed);
        }
        if (notification === "TERMINAL_RESULT") {
            this.processTerminal(payload);
            this.updateDom(this.config.fadeSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
