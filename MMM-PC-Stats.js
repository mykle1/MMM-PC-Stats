/* Magic Mirror
 * Module: MMM-PC-Stats
 *
 * By Mykle1
 *
 */
Module.register("MMM-PC-Stats", {

    // Module config defaults.
    defaults: {
        useHeader: false,    // true if you want a header      
        header: "",          // Any text you want. useHeader must be true
        maxWidth: "300px",
        animationSpeed: 0,
        initialLoadDelay: 1250,
        retryDelay: 2500,
        updateInterval: 60 * 1000, // Every minute

    },

    getStyles: function() {
        return ["MMM-PC-Stats.css"];
    },

    getScripts: function() {
		
        return ["moment.js"];
    },

		
	start: function() {
        Log.info("Starting module: " + this.name);

        //  Set locale.
        this.Stats = {};
        this.scheduleUpdate();
    },
	

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("Show me the money . . .");
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("small", "bright", "light", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var Stats = this.Stats;
		

        var top = document.createElement("div");
        top.classList.add("list-row");


 //       // timestamp
 //       var timestamp = document.createElement("div");
 //       timestamp.classList.add("xsmall", "bright", "timestamp");
 //       timestamp.innerHTML = "Rate as of " + moment.unix(LICE.timestamp).format('h:mm a') + " today";
//        wrapper.appendChild(timestamp);
		
		
		
		// cpu
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cpu");
        source.innerHTML = Stats.cpu.name;
        wrapper.appendChild(source);
		
		
		
		// total ram
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "totalRam");
        source.innerHTML = "Total RAM = " + Stats.ram.total + Stats.ram.unit + " &nbsp &nbsp &nbsp "
						+ " Free RAM = " + Stats.ram.free + Stats.ram.unit;
        wrapper.appendChild(source);
		
		
		
		// cores
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cores");
        source.innerHTML = Stats.cpu.threads[0].name + " &nbsp @ &nbsp " +  Number(Math.round(Stats.cpu.threads[0].usage+'e2')+'e-2') + "%";
        wrapper.appendChild(source);
		
		
				// cores
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cores");
        source.innerHTML = Stats.cpu.threads[1].name + " &nbsp @ &nbsp " +  Number(Math.round(Stats.cpu.threads[1].usage+'e2')+'e-2') + "%";
        wrapper.appendChild(source);
		

		// cores
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cores");
        source.innerHTML = Stats.cpu.threads[2].name + " &nbsp @ &nbsp " +  Number(Math.round(Stats.cpu.threads[2].usage+'e2')+'e-2') + "%";
        wrapper.appendChild(source);
		
		
				// cores
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cores");
        source.innerHTML = Stats.cpu.threads[3].name + " &nbsp @ &nbsp " +  Number(Math.round(Stats.cpu.threads[3].usage+'e2')+'e-2') + "%";
        wrapper.appendChild(source);
		

		// cores
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cores");
        source.innerHTML = Stats.cpu.threads[4].name + " &nbsp @ &nbsp " +  Number(Math.round(Stats.cpu.threads[4].usage+'e2')+'e-2') + "%";
        wrapper.appendChild(source);
		
		
				// cores
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cores");
        source.innerHTML = Stats.cpu.threads[5].name + " &nbsp @ &nbsp " +  Number(Math.round(Stats.cpu.threads[5].usage+'e2')+'e-2') + "%";
        wrapper.appendChild(source);
		

		// cores
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cores");
        source.innerHTML = Stats.cpu.threads[6].name + " &nbsp @ &nbsp " +  Number(Math.round(Stats.cpu.threads[6].usage+'e2')+'e-2') + "%";
        wrapper.appendChild(source);
		
		
				// cores
        var source = document.createElement("div");
        source.classList.add("xsmall", "bright", "cores");
        source.innerHTML = Stats.cpu.threads[7].name + " &nbsp @ &nbsp " +  Number(Math.round(Stats.cpu.threads[7].usage+'e2')+'e-2') + "%";
        wrapper.appendChild(source);
		

		

/*	
		// this gets the key from the key/pair of the element (hasOwnProperty)
		for (var Key in LICE.quotes) {
		if (LICE.quotes.hasOwnProperty(Key)) {
	
		
	//// Learned this on jsfiddle. HOORAY!
	//// This dynamically creates the div/tags for each element of LICE.quotes
		var symbols = LICE.quotes;
		for (var c in symbols) {
		
			var newElement = document.createElement("div");
			newElement.classList.add("xsmall", "bright", "symbol");
			newElement.innerHTML += Key + ' = '+ LICE.quotes[Key]; // + " = " + symbols[c];
			}
		}
			wrapper.appendChild(newElement);
			
	} // <-- closes key/pair loop
*/		
        return wrapper;
		
    }, // closes getDom
    
    
    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_STATS') {
            this.hide();
        }  else if (notification === 'SHOW_STATS') {
            this.show(1000);
        }
            
    },


    processStats: function(data) {
        this.Stats = data;
		console.log(this.Stats);
        this.loaded = true;
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
