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
		this.Sensors = {};
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
        var graphicsTempCheck = Sensors["nouveau-pci-0100"]; //["PCI adapter"].temp1.value;
		if (typeof graphicsTempCheck !== 'undefined'){
		
		// graphicsTemp
        var graphicsTemp = document.createElement("div");
        graphicsTemp.classList.add("small", "bright", "graphicsTemp");
		//console.log(Sensors['coretemp-isa-0000']['ISA adapter']['Core 0'].high);
        graphicsTemp.innerHTML = this.config.videoCard +  " temp @ " + Sensors["nouveau-pci-0100"]["PCI adapter"].temp1.value + "&deg;C";
        wrapper.appendChild(graphicsTemp);
		
        }

        for (var i = 0, len = Stats.cpu.threads.length; i < len; i++) {

            var Element = document.createElement("div");
            Element.classList.add("small", "bright", "usage");
            Element.innerHTML = Stats.cpu.threads[i].name + " &nbsp  @  &nbsp " 
								+ Number(Math.round(Stats.cpu.threads[i].usage+'e2')+'e-2') + "%";
            wrapper.appendChild(Element);
        }
        
        
        
        
		// Check if cpu core0 has temp sensor
        var core0TempCheck = Sensors["coretemp-isa-0000"];
		if (typeof core0TempCheck !== 'undefined'){
		
		// core0Temp
        var core0Temp = document.createElement("div");
        core0Temp.classList.add("small", "bright", "core0Temp");
        core0Temp.innerHTML = Sensors['coretemp-isa-0000']['ISA adapter']['Core 0'].name + " &nbsp  @  &nbsp "
						 + Sensors["coretemp-isa-0000"]["ISA adapter"]["Core 0"].value + "&deg;C";
        wrapper.appendChild(core0Temp);
        }
        
        
        
		// Check if cpu core1 has temp sensor
        var core1TempCheck = Sensors["coretemp-isa-0000"];
		if (typeof core1TempCheck !== 'undefined'){
		
		// core1Temp
        var core1Temp = document.createElement("div");
        core1Temp.classList.add("small", "bright", "core1Temp");
        core1Temp.innerHTML = Sensors['coretemp-isa-0000']['ISA adapter']['Core 1'].name + " &nbsp  @  &nbsp "
						 + Sensors["coretemp-isa-0000"]["ISA adapter"]["Core 1"].value + "&deg;C";
        wrapper.appendChild(core1Temp);
        }
        
        
        // Check if cpu core2 has temp sensor
        var core2TempCheck = Sensors["coretemp-isa-0000"];
		if (typeof core2TempCheck !== 'undefined'){
		
		// core2Temp
        var core2Temp = document.createElement("div");
        core2Temp.classList.add("small", "bright", "core2Temp");
        core2Temp.innerHTML = Sensors['coretemp-isa-0000']['ISA adapter']['Core 2'].name + " &nbsp  @  &nbsp "
						 + Sensors["coretemp-isa-0000"]["ISA adapter"]["Core 2"].value + "&deg;C";
        wrapper.appendChild(core2Temp);
        }
		
        
        
        // Check if cpu core3 has temp sensor
        var core3TempCheck = Sensors["coretemp-isa-0000"];
		if (typeof core3TempCheck !== 'undefined'){
		
		// core3Temp
        var core3Temp = document.createElement("div");
        core3Temp.classList.add("small", "bright", "core3Temp");
        core3Temp.innerHTML = Sensors['coretemp-isa-0000']['ISA adapter']['Core 3'].name + " &nbsp  @  &nbsp "
						 + Sensors["coretemp-isa-0000"]["ISA adapter"]["Core 3"].value + "&deg;C";
        wrapper.appendChild(core3Temp);
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
//		console.log(this.Stats); // for checking in dev console
    },
	
	processSensors: function(data) {
        this.Sensors = data; 
//		console.log(this.Sensors); // for checking in dev console
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
        this.updateDom(this.config.initialLoadDelay);
    },
});