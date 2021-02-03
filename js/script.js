let gData;
let gRegions = [];
let gThresholds = {
  carriers: 0,
  deaths: 0
  /*,
  infected_distribution: 0,
  tests: 0*/
};


const LANG = $("html").attr("lang");
const RANDOMSTRING = Math.random().toString(36).substring(7);
const SCROLLBAR_WIDTH = window.innerWidth - $(window).width();
const COLORS = {
  default: "#3DC",
  men: "#5987A5",
  women: "#FEA",
  second: "#FEA",
  athensopen: "#5987A5",
  thessopen: "#3BA9B0",
  deaths: "#FB8",
  serious: "#FEA",
  infected_distribution: "#6F6587,#5987A5,#3BA9B0,#48C7A6,#86E18D,#D5F474".split(","), 
  infected_distribution_men: "#48C7A6,#3BA9B0,#5987A5,#6F6587".split(","), 
  predicted_deaths: "#3DC,#5987A5,#3BA9B0,#48C7A6,#86E18D,#D5F474".split(","), 
  pcrtests: "#3DC,#5987A5,#3BA9B0,#48C7A6,#86E18D,#D5F474".split(","),
  measures: "#90CFB5,#8FBDE0,#689AAB,#AADCD2,#3DC,#88BBAA,#BADDAD,#BBCDB3,#FAF28C,#DFEA8B,#F3EF89,#3BA9B0,#F4F4B2,#CCAC8E,#FBDEDE,#F8B2BC,#F59598,#EFA796,#FEBD7D,#CEB4D6,#B5B3DA".split(","),
  measures2: "#3DC,#FEA,#5987A5,#3BA9B0,#86E18D,#D5F474,#FB8,#EC2,#CAF0F8".split(","),
  dark: "#399",
  selected: "#EC2"
};
const LABELS = {
  gr: {
    change: "Τελευταία μεταβολή: ",
    total: "Σύνολο: ",
    daily_cases: "Ημερ. Κρ.: ",
    male: "Ανδ.",
    female: "Γυν.",
    months_pref: {
			'Jan': 'Ιαν',
			'Feb': 'Φεβρ',
			'Mar': 'Μαρτ',
			'Apr': 'Απρ',
			'May': 'Μαι',
			'Jun': 'Ιουν',
			'Jul': 'Ιουλ',
			'Aug': 'Αυγ',
			'Sep': 'Σεπτ',
			'Oct': 'Οκτ',
			'Nov': 'Νοε',
			'Dec': 'Δεκ'},
		months: ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"],
    transition: {
      carriers: ["Κρούσματα"],
      active: ["Ενεργά κρούσματα"],
      infected_distribution: ["Υπό διερ.η ή άγν. προέλευσης", "Σχετιζ. με ήδη γνωστό κρούσμα", "Σχετιζ. με ταξίδι εξωτερικού"],
      infected_distribution_men: ["0-17", "18-39", "40-64", "65+"],
      death_distribution_men: ["0-17", "18-39", "40-64", "65+"],
      intensive_distribution_men: ["0-17", "18-39", "40-64", "65+"],      
      infected_distribution_total: ["0-17", "18-39", "40-64", "65+"],
      death_distribution_total: ["0-17", "18-39", "40-64", "65+"],
      intensive_distribution_total: ["0-17", "18-39", "40-64", "65+"],      
      infected_distribution_women: ["0-17", "18-39", "40-64", "65+"],
      death_distribution_women: ["0-17", "18-39", "40-64", "65+"],
      intensive_distribution_women: ["0-17", "18-39", "40-64", "65+"],
      predicted_deaths: ["χαμηλότερο εύρος", "πρόβλεψη", "ανώτερο εύρος"],
      predicted_true_inf: ["Ημερ. ενημέρωση","Πραγμ. αριθμ."],
      serious: ["Κρίσιμη κατάσταση"],
      deaths: ["Θάνατοι"],
      tests: ["Δείγματα που ελέγχθ.", "Βρέθηκαν θετικοί"],
      agtests: ["Rapid Ag"],
      vaccinations: ["Εμβολιασμοί"],
      rt_repro: ["Βασικός αναπαραγωγικός αριθμός"],
      rj_repro: ["Αναπαραγωγικός αριθμός"],
      infection_fatality_rate: ["IIFR"],
      positivity_rate: ["Ποσοστό θετικότητας"]
      //reproduction_rj_infected: ""
    },
    unit: {
      carriers: "",
      active: "",
      infected_distribution: "",
      infected_distribution_men: "",
      death_distribution_men: "",
      intensive_distribution_men: "",
      infected_distribution_total: "",
			death_distribution_total: "",
			intensive_distribution_total: "",
			infected_distribution_women: "",
			death_distribution_women: "",
			intensive_distribution_women: "",
      predicted_deaths: "",
      predicted_true_inf: "",
      serious: "",
      deaths: "",
      tests: "",
      agtests: "",
      vaccinations: "",
      rt_repro: "",
      rj_repro: "",
      infection_fatality_rate: ["%"],
      positivity_rate: ["%"]
      //reproduction_rj_infected: "",
    },
    demography: {
      sum: "Σύνολο",
      men: "Άνδρες",
      women: "Γυναίκες",
      cases: "Κρούσμ.",
      deaths: "Θάνατοι",
      serious: "Διασωλην."
    },
    prefectures: {
    	increasing: "αυξητική",
    	decreasing: "καθοδική",
    	flat: "επίπεδη",
    	green: "Επίπεδο 1. Ετοιμότητας",
    	orange: "Επίπεδο 3. Αυξημένης Επιτήρησης",
    	yellow: "Επίπεδο Α. Επιτήρησης",
    	red: "Επίπεδο Β. Αυξημένου Κινδύνου",
    	grey: "Επίπεδο Γ. Συναγερμού",
    	lightgrey: "Δεν υπάρχουν δεδομένα",
    	danger: "Επικινδυνότητα",
    	latest_cases: "Τελευταίες 14 μέρες (νέα κρούσματα)",
    	new_unemployed: "Νέες αιτήσεις ανέργων",
    	total_unemployed: "Σύνολο ανέργων"
    },
    age: [
      "65+",
      "40-64",
      "18-39",
      "0-17"
    ],
    age2: [
      "65",
      "40_64",
      "18_39",
      "0_17"
    ]
  },
  en: {
    change: "Daily: ",
    total: "Total: ",
    daily_cases: "Daily Cases: ",
    male: "Male",
    female: "Fem.",
    months_pref: {
			'Jan': 'Jan',
			'Feb': 'Feb',
			'Mar': 'Mar',
			'Apr': 'Apr',
			'May': 'May',
			'Jun': 'Jun',
			'Jul': 'Jul',
			'Aug': 'Aug',
			'Sep': 'Sep',
			'Oct': 'Oct',
			'Nov': 'Nov',
			'Dec': 'Dec'},
		months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    transition: {
      carriers: ["Tested Positive"],
      active: ["Active Cases"],
      infected_distribution: ["Still under investigation or of unknown origin", "Related to an already known case", "Related to travel from abroad"],
      infected_distribution_men: ["0-17", "18-39", "40-64", "65+"],
      death_distribution_men: ["0-17", "18-39", "40-64", "65+"],
      intensive_distribution_men: ["0-17", "18-39", "40-64", "65+"],
      infected_distribution_total: ["0-17", "18-39", "40-64", "65+"],
      death_distribution_total: ["0-17", "18-39", "40-64", "65+"],
      intensive_distribution_total: ["0-17", "18-39", "40-64", "65+"],      
      infected_distribution_women: ["0-17", "18-39", "40-64", "65+"],
      death_distribution_women: ["0-17", "18-39", "40-64", "65+"],
      intensive_distribution_women: ["0-17", "18-39", "40-64", "65+"],
      demography_total2: ["","",""],
      predicted_deaths: ["lower range", "projected", "upper range"],
      predicted_true_inf: ["Daily report", "Spec. of newly infected"],
      serious: ["Serious"],
      deaths: ["Deaths"],
      tests: ["Tested", "Found Positive"],
      agtests: ["Rapid Ag"],
      vaccinations: ['Vaccinations'],
      rj_repro: ["Reproduction Number"],
      //reproduction_rj_infected: ["Num. of cases"],
      rt_repro: ["Effective Reproduction Number"],
      infection_fatality_rate: ["IIFR"],
      positivity_rate: ["Positivity Rate"]
    },
    unit: {
      carriers: "",
      active: "",
      demography_total2: "",
      infected_distribution: "",
      infected_distribution_men: "",
      death_distribution_men: "",
      intensive_distribution_men: "",
      infected_distribution_total: "",
			death_distribution_total: "",
			intensive_distribution_total: "",
			infected_distribution_women: "",
			death_distribution_women: "",
			intensive_distribution_women: "",
      predicted_deaths: "",
      predicted_true_inf: "",
      serious: "",
      deaths: "",
      tests: "",
      agtests: "",
      vaccinations: "",
      rt_repro: "",
      rj_repro: "",
      infection_fatality_rate: ["%"],
      positivity_rate: ["%"]
      //reproduction_rj_infected: ""
    },
    demography: {
      sum: "Sum",
      men: "Men",
      women: "Women",
      cases: "Cases",
      deaths: "Deaths",
      serious: "Serious"
    },
    prefectures: {
    	increasing: "increasing",
    	decreasing: "decreasing",
    	flat: "flat",
    	green: "Level 1. Readiness",
    	orange: "Level 3. Increased Surveillance",
    	yellow: "Level 1. Surveillance",
    	red: "Level 2. Increased Risk",
    	grey: "Level 3. Alert",
    	lightgrey: "No available data",
    	danger: "Risk Level",
    	latest_cases: "Last 14 days (new cases)",
    	new_unemployed: "New unemployment claims",
    	total_unemployed: "Total Unemployed"
    },
    age: [
      "65+",
      "40-64",
      "18-39",
      "0-17"
    ],
    age2: [
      "65",
      "40_64",
      "18_39",
      "0_17"
    ]
  }
};


const init = () => {
  const addCommas = (num) => {
    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }

  const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  const updateThresholds = () => {
    const median = (values) => {
      let sorted = values.sort((a, b) => a - b);
      let is = [Math.floor(values.length / 2), Math.ceil(values.length / 2)];
      return (sorted[is[0]] + sorted[is[1]]) / 2;
    }

    for (thType in gThresholds) {
      let values = [];
      gData["prefectures-data"].forEach(function(pref, i){
      	if(pref[thType] === "carriers" || pref[thType] === "deaths" || pref[thType] === "vaccinations"){
        	values.push(getValuesTotal(pref[thType].values), pref.code);
      	}
      });

      gThresholds[thType] = median(values);
    }
  }

  const drawTransitionBoxes = () => {
    $(".transition.nationwide").each(function(){
      drawTransitionChart($(this), $(this).attr("code"), $(this).attr("pref"), true);
      moveToRight($(this));
    });
  }

  const updateAxisChartHeight = () => {
    $(".transition").each(function(){
      $(this).find(".axis-chart").css("height", "calc(100% - " + SCROLLBAR_WIDTH + "px)");
      $(this).find(".axis-cover").css("height", "calc(100% - " + SCROLLBAR_WIDTH + "px)");
    });
  }

  const drawLastDate = ($box, config) => {
    const getDateWithMonthName = (dateString) => {
      let dates = dateString.split("/");
      return dates[1] + " " + LABELS[LANG].months[parseInt(dates[0]) - 1];
    }

    let $updated = $box.find("h5.updated");
    if (!$updated.hasClass("show")) {
      let lastDate = config.data.labels[config.data.labels.length - 1];
      let updatedDate = {
        gr: "Στις " + getDateWithMonthName(lastDate), //lastDate.replace("/", "μήνας") + "Από τις",
        en: "As of " + getDateWithMonthName(lastDate)
      };

      $updated.text(updatedDate[LANG]);
      $updated.addClass("show");
    }
  }

  const drawTransitionChart = ($box, code, prefCode, hasDuration = false) => {

    const getBarColor = (code, prefCode, from, i, j) => {
      let ret = COLORS.default;
      let ymd = getDateValue(from, i, true);

      if (prefCode === "") {
        if (code === "carriers") {
        	if (ymd < 20200328) ret = COLORS.measures[j];
          if (ymd >= 20200328) ret = COLORS.measures[j+1]; //All flights to and from Germany and the Netherlands, excluding flights from Germany to Athens, suspended
          if (ymd >= 20200601) ret = COLORS.measures[j+3]; //International flights to and from Athens International Airport resumed for EU+ countries, excluding flights between Greece and Italy, Spain, Sweden, the United Kingdom, and the Netherlands
          if (ymd >= 20200615) ret = COLORS.measures[j+5]; //International flights to and from Thessaloniki Airport Makedonia resumed
          if (ymd >= 20200701) ret = COLORS.measures[j+7]; //International flights between Greece and Algeria, Australia, Canada, Georgia, Japan, Montenegro, Morocco, New Zealand, Rwanda, Serbia, South Korea, Thailand, Tunisia, and Uruguay resumed
        	if (ymd >= 20200715) ret = COLORS.measures[j+9]; //Borders opened to Serbian citizens, International flights between Greece and the United Kingdom resumed
        	if (ymd >= 20200720) ret = COLORS.measures[j+2]; //International flights between Greece and Sweeden resumed
        	if (ymd >= 20200815) ret = COLORS.measures[j+6]; //International flights between Albania, NM, Turkey
        	if (ymd >= 20200914) ret = COLORS.measures[j+4]; //Schools reopen
        	if (ymd >= 20201107) ret = COLORS.measures[j+11]; //2nd Lockdown
        }

        if (code === "active") {
        }

        if (code === "deaths") {
          //if (ymd <= 20200422) ret = COLORS.second;
        }
/*
        if (code === "infected_distribution") {
          if (ymd <= 20200508) ret = COLORS.second;
          if (ymd <= 20200422) ret = COLORS.default;
        }

        if (code === "tests") {
          if (ymd < 20200617) ret = COLORS.second;
        }
*/
      }

      if (prefCode === "3") {
        if (code === "carriers" || code === "deaths") {
        	if (ymd >= 20200615) ret = COLORS.athensopen; //International flights to and from Thessaloniki Airport Makedonia resumed
        }
      }

      if (prefCode === "1") {
        if (code === "carriers" || code === "deaths") {
          if (ymd >= 20200601) ret = COLORS.athensopen; //International flights to and from Athens International Airport resumed for EU+ countries, excluding flights between Greece and Italy, Spain, Sweden, the United Kingdom, and the Netherlands
        }
      }
			/*
      if (prefCode === "22") {
        if (code === "tests") {
          if (ymd < 20200622) ret = COLORS.second;
        }
      }
      */
      
      if (prefCode === "" && code === "infected_distribution") {
        ret = COLORS.infected_distribution[j];
      }
      
      if (prefCode === "" && (code === "infected_distribution_men" || code === "death_distribution_men" || code === "intensive_distribution_men" || code === "infected_distribution_total" || code === "death_distribution_total" || code === "intensive_distribution_total" || code === "infected_distribution_women" || code === "death_distribution_women" || code === "intensive_distribution_women")) {
        ret = COLORS.infected_distribution_men[j];
      }
      
      if (prefCode === "" && code === "tests") {
        ret = COLORS.pcrtests[j];
      }
      
      if (prefCode === "" && code === "predicted_true_inf") {
        ret = COLORS.pcrtests[j];
      }
      
      
      if (prefCode === "" && code === "predicted_deaths") {
        ret = COLORS.predicted_deaths[j];
      }

      if (prefCode === "" && code === "agtests") {
        ret = COLORS.pcrtests[j];
      }
      
      if (prefCode === "" && code === "vaccinations") {
        ret = COLORS.pcrtests[j];
      }

      if (code === "rt_repro") {
				const today = new Date()
				const year = today.getFullYear()
				const month = `${today.getMonth() + 1}`.padStart(2, "0")
				const day = `${today.getDate()}`.padStart(2, "0")
				const stringDate = [year, month, day].join("");
      	if (ymd <= stringDate) {
       		ret = COLORS.default;
      	}else{
       		ret = "#242A3C";
      	}
      }
      
      return ret;
    }

    const getDateValue = (from, i, isYmd) => {
      let dt = new Date(from[0], from[1] - 1, from[2]);
          dt.setDate(dt.getDate() + i);

      let ret = "";
      let cy = dt.getFullYear();
      let cm = dt.getMonth() + 1;
      let cd = dt.getDate();

      if (isYmd) {
        let ymd = (parseInt(cy) * 10000) + (parseInt(cm) * 100) + parseInt(cd);
        ret = ymd;

      } else {
        if (LANG === "gr") {
          ret = cm + "/" + cd;
        }

        if (LANG === "en") {
          ret = cm + "/" + cd;
        }
      }

      return ret;
    }

		function precisionRound(number, precision) {
		  var factor = Math.pow(10, precision);
		  return Math.round(number * factor) / factor;
		}

    const drawLatestValue = ($box, rows) => {
      let valueTotal  = 0;
      let valueLatest = 0;

      for (let i = 0; i < rows.length; i++) {   		
        for (let j = 0; j < rows[0].length; j++) {
          valueTotal += rows[i][j];
          if (i === rows.length - 1) valueLatest += rows[i][j];
        }
      }
      
     if ($box.attr("code") === "tests") {
			var middle_column_sum = rows.reduce(function (r, a) {
			        a.forEach(function (b, i) {
			            r[i] = (r[i] || 0) + b;
			        });
			        return r;
			    }, []);
       let lastItem = rows[rows.length - 1];
       valueTotal  = precisionRound(middle_column_sum[0], 1);
       valueLatest = valueLatest - lastItem[1];
      }
      
     if ($box.attr("code") === "predicted_true_inf" || $box.attr("code") === "predicted_deaths") {
			var middle_column_sum = rows.reduce(function (r, a) {
			        a.forEach(function (b, i) {
			            r[i] = (r[i] || 0) + b;
			        });
			        return r;
			    }, []);
       let lastItem = rows[rows.length - 1];
       valueTotal  = precisionRound(middle_column_sum[1], 1);
       valueLatest = valueLatest - lastItem[1];
      } 
            
      /*
      if ($box.attr("code") === "carriers" && prefCode == 16) {
        valueTotal  = Math.round(rows[rows.length - 1][0] * 100) / 100;
        valueLatest = Math.round(rows[rows.length - 1][0] * 100) / 100;
      }
      */

      if ($box.attr("code") === "rj_repro" || $box.attr("code") === "rt_repro" || $box.attr("code") === "infection_fatality_rate" || $box.attr("code") === "positivity_rate") {
        valueTotal  = Math.round(rows[rows.length - 1][0] * 1000) / 1000;
        valueLatest = Math.round((rows[rows.length - 1][0] - rows[rows.length - 2][0]) * 1000) / 1000;
      }
      
            
      var about_sign = "";
      if ($box.attr("code") === "active") {
      	about_sign = "~";
      }
      
      valueTotal  = addCommas(valueTotal);
      valueLatest = addCommas(valueLatest);

      if (valueLatest.charAt(0) !== "-") valueLatest = "+" + valueLatest;

      let $latest = $box.find(".latest");
          $latest.find(".value").text(about_sign+valueTotal);
          $latest.find(".unit").text(LABELS[LANG].unit[$box.attr("code")]);
	      	$latest.find(".type").text(LABELS[LANG].total);        //capitalize($box.find(".switch[value=total]").text())
          $latest.find(".change").text(LABELS[LANG].change + valueLatest);
    }

    const drawAxisChart = ($box, mainConfigData, isStacked) => {
      let $chart = $box.find(".axis-chart").empty().html("<canvas></canvas>");
      let $canvas = $chart.find("canvas")[0];

      let axisConfig = {
        type: "bar",
        data: mainConfigData,
        options: {
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          title: {
            display: false
          },
          scales: {
            xAxes: [{
              stacked: isStacked,
              drawBorder: false,
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: "rgba(255,255,255,0.0)",
                maxRotation: 0,
                minRotation: 0
              }
            }],
            yAxes: [{
              id: "axisScale",
              location: "bottom",
              stacked: isStacked,
              gridLines: {
                drawBorder: false,
                display: false
              },
              ticks: {
                beginAtZero: true,
                fontColor: "rgba(255,255,255,0.7)",
                callback: function(value, index, values) {
                  if (Math.floor(value) === value) {
                    return addCommas(value.toString());
                  }
                }
              }
            }]
          }
        }
      };

      axisConfig.data.datasets.forEach(function(dataset, i){
        dataset.backgroundColor = "transparent";
        dataset.borderColor = "transparent";
        dataset.pointBorderColor = "transparent";
      });

      axisConfig.data.labels.forEach(function(label, i){
        label = "";
      });

      window.myChart = new Chart($canvas.getContext('2d'), axisConfig);

      let axisMax = window.myChart.scales.axisScale.max;
      let axisMin = window.myChart.scales.axisScale.min;
      let axisMaxLength = Math.max(axisMax.toString().length, axisMin.toString().length);
      let axisCoverWidth = 0;
      switch(axisMaxLength) {
        case 1: axisCoverWidth = 36; break;
        case 2: axisCoverWidth = 40; break;
        case 3: axisCoverWidth = 48; break;
        case 4: axisCoverWidth = 54; break;
        case 5: axisCoverWidth = 66; break;
        case 6: axisCoverWidth = 72; break;
        case 7: axisCoverWidth = 78; break;
      }

      $box.find(".axis-cover").width(axisCoverWidth.toString() + "px");
    }


    let $chart = $box.find(".main-chart").empty().html("<canvas></canvas>");
    let $canvas = $chart.find("canvas")[0];
    let switchValue = $box.find(".switch.selected").attr("value");
    let hasMovingAverage = ($box.find(".checkbox.moving-average").hasClass("on")) ? true: false;
    let root = gData.transition[code];
    //    	if (code === "carriers" || code === "deaths" || code === "reproduction_rj") {
    if (prefCode !== "") { 
    	root = gData["prefectures-data"][parseInt(prefCode) - 1][code];  //disabled for now
    }
    
    if(typeof root !== "undefined"){
    let from = root.from;
    let rows = root.values;
    
    drawLatestValue($box, rows);

		var disableBeginAtZero = true;
    if (code == "rt_repro" || code == "infection_fatality_rate" || code == "positivity_rate"){
      disableBeginAtZero = false;
  	}

    let config = {
      type: "bar",
      data: {
        labels: [],
        datasets: []
      },
      options: {
        maintainAspectRatio: false,
        animation: {
          duration: (hasDuration) ? 1000: 0
        },
        legend: {
          display: false
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: false,
          callbacks: {
            title: function(tooltipItem){
              let dateTime = tooltipItem[0].xLabel.trim();
              if (LANG === "gr") dateTime = "Στις " + dateTime; //dateTime.replace("/","μήνας") + "Από τις";
              if (LANG === "en") dateTime = "As of " + dateTime;
              let suffix = $box.find(".switch.selected").text();
              return dateTime + " " + suffix;
            },
            label: function(tooltipItem, data){
              let ret = [];
              let total = 0;
              data.datasets.forEach(function(ds, i){
              	if(code == 'reproduction_rj_infected'){
              		root_rj = gData.transition['reproduction_rj']['values'];
	                if (!hasMovingAverage || i >= 1) {
	                	var rpnum = (typeof root_rj[tooltipItem.index] !== 'undefined') ? root_rj[tooltipItem.index] : 'n/a';
	                  ret.push(ds.label + ": " + addCommas(ds.data[tooltipItem.index]) + " | " + LABELS[LANG].unit[code] + LABELS[LANG].transition['reproduction_rj'] + ": " + rpnum);
	                  total += ds.data[tooltipItem.index];
	                }
              	}else if(code == 'predicted_deaths'){
	                	//dont show prediction text for real values
	                	root_pd = gData.transition['predicted_deaths']['values'];
	                	var rparr = root_pd[tooltipItem.index];
	                	if(rparr[0] == 0 && rparr[2] == 0){
	                		if(ds.label == "πρόβλεψη" || ds.label == "projected"){
	                			ret.push(LABELS[LANG].transition['deaths'] + ": " + addCommas(ds.data[tooltipItem.index]));
	                		}
	                	}
	                	else{
	                		if(ds.label == "πρόβλεψη" || ds.label == "projected"){
	                			var cutval = parseFloat(addCommas(ds.data[tooltipItem.index])).toFixed(2);
	                		}else{
	                			var cutval = addCommas(ds.data[tooltipItem.index]);
	                		}
	                		ret.push(ds.label + ": " + cutval + " " + LABELS[LANG].unit[code]);
	                	}
              	}else if(code == 'infection_fatality_rate' || code == 'positivity_rate'){
	                  ret.push(ds.label + ": " + addCommas(ds.data[tooltipItem.index]) + LABELS[LANG].unit[code]);
	                  total += ds.data[tooltipItem.index];
              	} else{
	                if (!hasMovingAverage || i >= 1) {
	                  ret.push(ds.label + ": " + addCommas(ds.data[tooltipItem.index]) + " " + LABELS[LANG].unit[code]);
	                  total += ds.data[tooltipItem.index];
	                }
              	}
              	
              });
              ret.reverse();
              let showTotalLength = (hasMovingAverage) ? 3: 2;
              if(!code == 'predicted_deaths'){
	              if (data.datasets.length >= showTotalLength) {
	                ret.push(LABELS[LANG].total + ": " + addCommas(total) + " " + LABELS[LANG].unit[code]);
	              }
            	}
              return ret;
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: true,
            gridLines: {
              display: false,
              zeroLineColor: "rgba(255,255,0,0.7)"
            },
            ticks: {
              fontColor: "rgba(255,255,255,0.7)",
              maxRotation: 0,
              minRotation: 0,
              callback: (label) => {
                return " " + label + " ";
              }
            }
          }],
          yAxes: [{
            location: "bottom",
            stacked: true,
            gridLines: {
              display: true,
              zeroLineColor: "rgba(255,255,255,0.7)",
              borderDash: [3, 1],
              color: "rgba(255, 255, 255, 0.3)"
            },
            ticks: {
              beginAtZero: disableBeginAtZero,
              fontColor: "transparent"
            }
          }]
        },
        layout: {
          padding: {
            left: 10
          }
        }
      }
    };
    
    if(code == 'predicted_true_inf'){
			config.options.scales.xAxes= [
				{	
					stacked: true,
					gridLines: {
						drawOnChartArea:false,
						tickMarkLength: 10,
						color: "rgba(255, 255, 255, 0.3)"
						},
					ticks: {
							autoSkip: true,
              fontColor: "rgba(255,255,255,0.7)",
              maxRotation: 0,
              minRotation: 0,
              callback: (label) => {
                return " " + label + " ";
              }
            }
				}];
			config.options.scales.yAxes= [{	
					stacked: false,
					gridLines: {
						display:true,
            zeroLineColor: "rgba(255,255,255,0.7)",
            borderDash: [3, 1],
            color: "rgba(255, 255, 255, 0.3)"
						},
					ticks: {
						fontColor: "transparent",
						userCallback: function(value, index, values) {
							value = value.toString();
							value = value.split(/(?=(?:...)*$)/);
							value = value.join(',');
							return value; },
					},
			}];	
    }
    

		if(code == 'infected_distribution' || code == 'infected_distribution_men' || code == 'death_distribution_men' || code == 'intensive_distribution_men'|| code === "infected_distribution_total" || code === "death_distribution_total" || code === "intensive_distribution_total" || code === "infected_distribution_women" || code === "death_distribution_women" || code === "intensive_distribution_women"){
			config.options.tooltips.caretSize=0;
			config.options.tooltips.titleFontSize=12;
			config.options.tooltips.bodyFontSize=11;
			config.options.tooltips.bodySpacing=0;
			config.options.tooltips.titleSpacing=0;
			config.options.tooltips.xPadding=10;
			config.options.tooltips.yPadding=10;
			config.options.tooltips.cornerRadius=2;
			config.options.tooltips.titleMarginBottom=2;
		} 
		
/*
		if (code === "predicted_deaths") {
			config.options.scales.xAxes= [
				{	
					stacked: true,
					gridLines: {
						drawOnChartArea:false,
						tickMarkLength: 10,
						color: "rgba(255, 255, 255, 0.3)"
						},
					ticks: {
							autoSkip: true,
              fontColor: "rgba(255,255,255,0.7)",
              maxRotation: 0,
              minRotation: 0,
              callback: (label) => {
                return " " + label + " ";
              }
            }
				}];
			config.options.scales.yAxes= [{	
					stacked: false,
					gridLines: {
						display:true,
            zeroLineColor: "rgba(255,255,255,0.7)",
            borderDash: [3, 1],
            color: "rgba(255, 255, 255, 0.3)"
						},
					ticks: {
						fontColor: "transparent",
						userCallback: function(value, index, values) {
							value = value.toString();
							value = value.split(/(?=(?:...)*$)/);
							value = value.join(',');
							return value; },
					},
			}];			
		};
*/

    for (let i = 0; i < rows[0].length; i++) {
      config.data.datasets.push({
        label: LABELS[LANG].transition[code][i],
        backgroundColor: [],
        data: []
      });
    
			
			//prefecture
			
      if (code === "rj_repro" || code === "rt_repro" || code === "infection_fatality_rate" || code === "positivity_rate") {
        let ds = config.data.datasets[config.data.datasets.length - 1];
        ds.type = "line";
        ds.fill = false;
      	ds.pointRadius = 2;
        ds.pointBorderColor = "#EC2";
        ds.borderColor = "#EC2";
      }
/*
      if (code === "reproduction_rj_infected") {
        let ds = config.data.datasets[config.data.datasets.length - 1];
      }
*/
     
      if (code === "predicted_deaths") {
        let ds = config.data.datasets[config.data.datasets.length- 1];
				if(ds.label == "πρόβλεψη" || ds.label == "projected"){
	        ds.type = "line";
	        ds.fill = false;
	        ds.pointRadius = 2;
	        ds.pointBorderColor = "#EC2";
	        ds.borderColor = "#EC2";
      	}
      }
    

    }

    let prevBarColor = "";
    let totalValues = [];
    for (let i = 0; i < rows[0].length; i++) {totalValues.push(0);}
    rows.forEach(function(row, i){

      let curBarColor = getBarColor(code, prefCode, from, i, 0);
      config.data.labels.push(getDateValue(from, i, false));

      for (let j = 0; j < rows[0].length; j++) {
      	//if(prefCode == 16 && code == "carriers"){
        //	totalValues[j] = row[j];
      	//}else{
        	totalValues[j] += row[j];
      	//}

        let value = row[j];

        if ((prevBarColor !== curBarColor) && (code !== "rj_repro")) {
          //value = 0;
        }
        
        if ((prevBarColor !== curBarColor) && (code !== "infection_fatality_rate" || code !== "positivity_rate")) {
          //value = 0;
        }

        if (row[j] === "") {
          value = 0;
        }

        if (value < 0 && (switchValue === "total" || code === "carriers" || code === "infected_distribution" || code === "infected_distribution_men" || code === "death_distribution_men" || code === "predicted_deaths" || code === "deaths" || code === "tests" || code === "agtests" || code === "vaccinations")) {
          value = 0;
        }

        if (switchValue === "total") {
          value = totalValues[j];
        }

       config.data.datasets[j].data.push(value); 
       config.data.datasets[j].backgroundColor.push(getBarColor(code, prefCode, from, i, j));
      }

      prevBarColor = curBarColor;
    });

    $chart.width(Math.max(config.data.labels.length * 8, $chart.width()));

    if (hasMovingAverage) {
      let days = 7;
      let dataset = {
        type: "line",
        label: LABELS[LANG].movingAverage,
        fill: false,
        borderColor: "#FBA",
        borderWidth: 3,
        pointRadius: 0,
        data: []
      };

      for (let i = 0; i < config.data.datasets[0].data.length; i++) {
        let value = null;
        if (i >= days) {
          value = 0;
          for (let j = 0; j < days; j++) {
            config.data.datasets.forEach(function(dataset, dsi){
              value += parseInt(dataset.data[i - j]);
            });
          }
          value = value / days;
        }

        dataset.data.push(value);
      }

      config.data.datasets.unshift(dataset);
    }

    drawLastDate($box, config);
    drawAxisChart($box, $.extend(true, {}, config.data), true);

    window.myChart = new Chart($canvas.getContext('2d'), config);
  	}
  }

  const moveToRight = ($box) => {
    let $chart = $box.find(".main-chart");
    let $wrapper = $box.find(".main-chart-wrapper");
    $wrapper.animate({scrollLeft: $chart.width()}, 0);
  }

  const getValuesTotal = (values, code) => {
    let ret = 0;
    let prefcode = code;
    values.forEach(function(row, i){
      row.forEach(function(val, j){
      	//if(prefcode != 16){
        	ret += val;
      	//}else{
      	//	ret = val;
      	//}
      });
    });

    return ret;
  }

  const getPrefColor = (pref) => {
    let type = $("#select-pref-type").val();
    let ret = "rgba(90, 90, 90, 0.6)";
    let value = getValuesTotal(gData["prefectures-data"][parseInt(pref.code) - 1][type].values, pref.code);

    if (value >= 1) {
      ret = COLORS.dark;
      if (gThresholds[type] === 0) ret = COLORS.default;
    }

    if (value >= gThresholds[type] && gThresholds[type] >= 1) ret = COLORS.default;
    return ret;
  }
	
  const drawDemographyChart_sum = () => {
    $wrapper = $("#demography-chart").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];

    let config = {
      type: "horizontalBar",
      data: {
        labels: [],
        datasets: [{
          label: LABELS[LANG].demography.serious,
          backgroundColor: COLORS.serious,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.deaths,
          backgroundColor: COLORS.deaths,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.cases,
          backgroundColor: COLORS.default,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        }]
      },
      options: {
        aspectRatio: 0.9,
        responsive: true,
        legend: {
          display: true,
          labels: {
            fontColor: "rgba(255, 255, 255, 0.7)"
          }
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: true,
          callbacks: {
            title: function(tooltipItem){
              let suffix = {
                gr: "",
                en: "cases"
              };
              let age = tooltipItem[0].yLabel;
              let total = 0;
              tooltipItem.forEach(function(item, i){
                total += item.xLabel;
              });

              return age + ": " + total + " " + suffix[LANG];
            },
            label: function(tooltipItem, data){
              let suffix = {
                gr: "",
                en: " cases"
              };
              return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.value + suffix[LANG];
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: true,
            position: "top",
            gridLines: {
              color: "rgba(255,255,255,0.2)",
              zeroLineColor: "rgba(255,255,255,0.2)",
              borderDash: [3, 1]
            },
            ticks: {
              suggestedMin: 0,
              fontColor: "rgba(255,255,255,0.7)",
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }],
          yAxes: [{
            stacked: true,
            barPercentage: 0.5,
            gridLines: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              fontColor: "rgba(255,255,255,0.7)"
            }
          }]
        }
      }
    };

    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 2.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 2.3;

    gData.demography_sum.forEach(function(age, index){
      config.data.labels.push(LABELS[LANG].age[index]);
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });

    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }
  
  const drawDemographyChart_men = () => {
    $wrapper = $("#demography-chart-men").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];

    let config = {
      type: "horizontalBar",
      data: {
        labels: [],
        datasets: [{
          label: LABELS[LANG].demography.serious,
          backgroundColor: COLORS.serious,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.deaths,
          backgroundColor: COLORS.deaths,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.cases,
          backgroundColor: COLORS.default,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        }]
      },
      options: {
        aspectRatio: 0.9,
        responsive: true,
        legend: {
          display: true,
          labels: {
            fontColor: "rgba(255, 255, 255, 0.7)"
          }
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: true,
          callbacks: {
            title: function(tooltipItem){
              let suffix = {
                gr: "",
                en: "cases"
              };
              let age = tooltipItem[0].yLabel;
              let total = 0;
              tooltipItem.forEach(function(item, i){
                total += item.xLabel;
              });

              return age + ": " + total + " " + suffix[LANG];
            },
            label: function(tooltipItem, data){
              let suffix = {
                gr: "",
                en: " cases"
              };
              return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.value + suffix[LANG];
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: true,
            position: "top",
            gridLines: {
              color: "rgba(255,255,255,0.2)",
              zeroLineColor: "rgba(255,255,255,0.2)",
              borderDash: [3, 1]
            },
            ticks: {
              suggestedMin: 0,
              fontColor: "rgba(255,255,255,0.7)",
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }],
          yAxes: [{
            stacked: true,
            barPercentage: 0.5,
            gridLines: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              fontColor: "rgba(255,255,255,0.7)"
            }
          }]
        }
      }
    };

    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 2.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 2.3;

    gData.demography_men.forEach(function(age, index){
      config.data.labels.push(LABELS[LANG].age[index]);
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });

    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }
  
  const drawDemographyChart_women = () => {
    $wrapper = $("#demography-chart-women").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];

    let config = {
      type: "horizontalBar",
      data: {
        labels: [],
        datasets: [{
          label: LABELS[LANG].demography.serious,
          backgroundColor: COLORS.serious,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.deaths,
          backgroundColor: COLORS.deaths,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.cases,
          backgroundColor: COLORS.default,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        }]
      },
      options: {
        aspectRatio: 0.9,
        responsive: true,
        legend: {
          display: true,
          labels: {
            fontColor: "rgba(255, 255, 255, 0.7)"
          }
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: true,
          callbacks: {
            title: function(tooltipItem){
              let suffix = {
                gr: "",
                en: "cases"
              };
              let age = tooltipItem[0].yLabel;
              let total = 0;
              tooltipItem.forEach(function(item, i){
                total += item.xLabel;
              });

              return age + ": " + total + " " + suffix[LANG];
            },
            label: function(tooltipItem, data){
              let suffix = {
                gr: "",
                en: " cases"
              };
              return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.value + suffix[LANG];
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: true,
            position: "top",
            gridLines: {
              color: "rgba(255,255,255,0.2)",
              zeroLineColor: "rgba(255,255,255,0.2)",
              borderDash: [3, 1]
            },
            ticks: {
              suggestedMin: 0,
              fontColor: "rgba(255,255,255,0.7)",
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }],
          yAxes: [{
            stacked: true,
            barPercentage: 0.5,
            gridLines: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              fontColor: "rgba(255,255,255,0.7)"
            }
          }]
        }
      }
    };

    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 2.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 2.3;

    gData.demography_women.forEach(function(age, index){
      config.data.labels.push(LABELS[LANG].age[index]);
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });

    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }
  
	const replacechars = function(c){
			var d = c.split("-");
	    return LABELS[LANG].months_pref[d[0]] + "-" +d[1] || c;
	};
  
  const drawDemographyChart_group_cases = () => {
    $wrapper = $("#demography-chart-group-cases").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];
    
    let config = {
      navigation: {
          buttonOptions: {
              enabled: false
          }
      },
	    credits: {
	        enabled: false
	    },
      chart: {
          type: 'column'
      },
      title: {
          text: ''
      },
      xAxis: {
          categories: []
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Κρούσματα'
          }
      },
      tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
      },
      plotOptions: {
          column: {
              pointPadding: 0.2,
              borderWidth: 0
          }
      },
      series: []
    };
    
    
    var categories_renamed = {};
		gData.demography_group_cases.categories.forEach(function(cat, index){
			categories_renamed[index] = replacechars(cat);
		});
    config.xAxis.categories = categories_renamed;
    //config.xAxis.categories = gData.demography_group_cases.categories;
    gData.demography_group_cases.age_groups.forEach(function(age, i){
    	var age = age.replace("Male", LABELS[LANG].male);
    	age = age.replace("Female", LABELS[LANG].female);
    	
      config.series.push({
        name: age,
        data: gData.demography_group_cases.cases[i]
      });
    });
    //console.log(config)
    /*
    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 2.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 2.3;

    gData.demography_women.forEach(function(age, index){
      config.data.labels.push(LABELS[LANG].age[index]);
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });
		*/
    $('#demography-chart-group-cases').highcharts(config);
	}
	
  const drawDemographyChart_group_deaths = () => {
    $wrapper = $("#demography-chart-group-deaths").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];
    
    let config = {
      navigation: {
          buttonOptions: {
              enabled: false
          }
      },
	    credits: {
	        enabled: false
	    },
      chart: {
          type: 'column'
      },
      title: {
          text: ''
      },
      xAxis: {
          categories: []
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Θάνατοι'
          }
      },
      tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
      },
      plotOptions: {
          column: {
              pointPadding: 0.2,
              borderWidth: 0
          }
      },
      series: []
    };    
    
    var categories_renamed = {};
		gData.demography_group_deaths.categories.forEach(function(cat, index){
			categories_renamed[index] = replacechars(cat);
		});
    config.xAxis.categories = categories_renamed;
    //config.xAxis.categories = gData.demography_group_cases.categories;
    gData.demography_group_deaths.age_groups.forEach(function(age, i){
    	var age = age.replace("Male", LABELS[LANG].male);
    	age = age.replace("Female", LABELS[LANG].female);
    	
      config.series.push({
        name: age,
        data: gData.demography_group_deaths.deaths[i]
      });
    });
    //console.log(config)
    /*
    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 2.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 2.3;

    gData.demography_women.forEach(function(age, index){
      config.data.labels.push(LABELS[LANG].age[index]);
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });
		*/
    $('#demography-chart-group-deaths').highcharts(config);
	}
	
  const drawDemographyChart_group_intensive = () => {
    $wrapper = $("#demography-chart-group-intensive").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];
    
    let config = {
      navigation: {
          buttonOptions: {
              enabled: false
          }
      },
	    credits: {
	        enabled: false
	    },
      chart: {
          type: 'column'
      },
      title: {
          text: ''
      },
      xAxis: {
          categories: []
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Νοσηλείες'
          }
      },
      tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
      },
      plotOptions: {
          column: {
              pointPadding: 0.2,
              borderWidth: 0
          }
      },
      series: []
    };
    
    
    var categories_renamed = {};
		gData.demography_group_intensive.categories.forEach(function(cat, index){
			categories_renamed[index] = replacechars(cat);
		});
    config.xAxis.categories = categories_renamed;
    //config.xAxis.categories = gData.demography_group_cases.categories;
    gData.demography_group_intensive.age_groups.forEach(function(age, i){
    	var age = age.replace("Male", LABELS[LANG].male);
    	age = age.replace("Female", LABELS[LANG].female);
    	
      config.series.push({
        name: age,
        data: gData.demography_group_intensive.intensive[i]
      });
    });

    $('#demography-chart-group-intensive').highcharts(config);
	}
	
  const getMonthValue = (from, i) => {
  	//2020, 1, 1
    let date = new Date(from[0], from[1]-1, from[2]);  //January is 0. December is 11.
    
    var d = date.getDate();
    date.setMonth(date.getMonth() + i);
    if (date.getDate() != d) {
      date.setDate(0);
    }
  
    let ret = "";
    let cy = date.getFullYear().toString().substr(-2);
    let cm = date.getMonth();

    if (LANG === "gr") {
      ret = LABELS[LANG].months[cm].substr(0, 3) + "-" + cy;
    }

    if (LANG === "en") {
      ret = LABELS[LANG].months[cm].substr(0, 3) + "-" + cy;
    }
    return ret;
  }
  
  const drawUnemployment = (prefCode) => {
    let $wrapper = $("#unemployment-chart").empty().html('<canvas></canvas>');
    let $canvas = $wrapper.find("canvas")[0];
    let dataType = $("#select-unemp-type").val();
    if(typeof dataType !== "undefined"){
    }else{
    	dataType = 1;
    }

    var config = {
      type: "bar",
	    data: {
	        labels: [],
	        datasets: [
	            {
	                type: 'line',
	                label: LABELS[LANG].prefectures.new_unemployed,
	                data: [],
	                borderColor: '#0CBF12',
	                backgroundColor: 'rgba(0, 0, 0, 0)',
	                yAxisID: 'newunemployed',
	            },
	            {
	                label: LABELS[LANG].prefectures.total_unemployed,
	                data: [],
	                borderColor: 'rgba(0, 0, 0, 0)',
	                backgroundColor: '#C5042D',
	                yAxisID: 'totalunemployed',
	            }
	        ]
	    },
	    options: {
	    		maintainAspectRatio: false,
	        responsive: true,
	        legend: {
	          display: true,
	          labels: {
	            fontColor: "rgba(255, 255, 255, 0.7)"
	          }
	        },
	        animation: {
	          duration: 1000
	        },
	        scales: {
		          xAxes: [{
		            gridLines: {
		              color: "rgba(255,255,255,0.2)",
		              zeroLineColor: "rgba(255,255,255,0.2)",
		              borderDash: [3, 1]
		            },
		            ticks: {
		              suggestedMin: 0,
		              fontColor: "rgba(255,255,255,0.7)",
		            }
		          }],
	            yAxes: [
	                {
	                    id: "newunemployed",
	                    ticks: {
	                    	fontColor: "rgba(255,255,255,0.7)",
	                      beginAtZero: true,
	                    },
					            gridLines: {
					              color: "rgba(255,255,255,0.2)",
					              zeroLineColor: "rgba(255,255,255,0.2)",
					              borderDash: [3, 1]
					            },
	                    scaleLabel: {
	                        display: true,
	                        labelString: LABELS[LANG].prefectures.new_unemployed
	                      }
	                },
	                {
	                    id: "totalunemployed",
	                    position: 'right',
	                    ticks: {
	                    		fontColor: "rgba(255,255,255,0.7)",
	                        beginAtZero: true,
	                    },
	                    scaleLabel: {
	                        display: true,
	                        labelString: LABELS[LANG].prefectures.total_unemployed
	                    }
	                },
	            ]
	        },
	    }
    };


 
    let prefs = [];
    //Create labels. Just take the 1st From date and incr. months by size
    var startdate = gData["regions-unemployment"][0].new_claims.from;
    var sizemonths = gData["regions-unemployment"][0].new_claims.values.length;
    var labels = [];
    for (var i = 0; i < sizemonths; i++) {
	  	config.data.labels.push(getMonthValue(startdate, i));
  	};    

    gData["regions-unemployment"].forEach(function(pref, i){
    	if(pref.code == dataType){
      prefs.push({
        name: gData["regions-unemployment"][i][LANG],
        new_claims: pref.new_claims,
        total_unemployed: pref.total_unemployed,
        code: (i).toString()
      });
    	}
    });
    prefs.forEach(function(pref, i){
      config.data.datasets[0].data = pref.new_claims.values;
      config.data.datasets[1].data = pref.total_unemployed.values;
    });
    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 1.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 1.3;
    //if (prefCode !== "") config.options.animation.duration = 0;

    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }
  
  const drawGreeceMap = () => {
    $("#greece-map").empty();
   
		// Prepare demo data
		// Data is joined to map using value of 'hc-key' property by default.
		// See API docs for 'joinBy' for more info on linking data and map.
		var data = [
		    ['gr-at', [1,"Attica"]],
		    ['gr-gc', [2,"Central Greece"]],
		    ['gr-mc', [3,"Central Macedonia"]],
		    ['gr-cr', [4,"Crete"]],
		    ['gr-mt', [5,"Eastern Macedonia and Thrace"]],
		    ['gr-ep', [6,"Epirus"]],
		    ['gr-ii', [7,"Ionian Islands"]],
		    ['gr-ma', [8,"Mount Athos"]],
		    ['gr-an', [9,"North Aegean"]],
		    ['gr-pp', [10,"Peloponnese"]],
		    ['gr-as', [11,"South Aegean"]],
		    ['gr-ts', [12,"Thessaly"]],
		    ['gr-gw', [13,"Western Greece"]],
		    ['gr-mw', [14,"Western Macedonia"]]
		];

		// Create the chart
		Highcharts.mapChart('greece-map', {
        navigation: {
            buttonOptions: {
                enabled: false
            }
        },        
        legend: {
            enabled: false
        },
		    credits: {
		        enabled: false
		    },			
		    chart: {
		        map: 'countries/gr/gr-all'
		    },
		    title: {
		        text: ''
		    },
		    subtitle: {
		        text: ''
		    },
		    mapNavigation: {
		        enabled: false
		    },
				tooltip: {
				     formatter: function () {
				     			var arrayinfo = this.point.value;
				     			var prefvalue;
				     			var tooltip = '';
		              gData["prefectures-data"].forEach(function(pref, i){
		                if (pref.gr === arrayinfo[1] || pref.en === arrayinfo[1]) {
		                	prefvalue = pref.value;
		                  //if ($("#select-prefecture").val() !== pref.code) {
		                  //  drawPrefectureCharts(pref.code);
		                  //}
											//console.log(newobj);
		                  //console.log(  indexOf(newobj, pref[LANG])  );
		                  tooltip += '<span style="color:' + COLORS.selected + '">' + pref[LANG] + '</span>' + '<br>'+LABELS[LANG].transition.carriers+' : ' + prefvalue;
		                }
		              });
				          //return this.point.value[1] + tooltip;
				          return tooltip;
				     }
				},
		    series: [{
		    	 	stickyTracking: true,
				    data: data.map(elem => {
				    	var prefvalue;
				    	var grad = ['#33ddcc', '#48C7A6', '#3BA9B0', '#5987A5', '#6F6587'];
				    	gData["prefectures-data"].forEach(function(pref, i){
				    		if (pref.gr === elem[1][1] || pref.en === elem[1][1]) {
				    			prefvalue = pref.value100k;
				    			if (prefvalue > 0 && prefvalue <= 200) {
				    				elem.push(grad[0]);
				    			} else if (prefvalue > 200 && prefvalue <= 400) {
				      			elem.push(grad[1]);
				      		} else if (prefvalue > 400 && prefvalue <= 600) {
				      			elem.push(grad[2]);
				      		} else if (prefvalue > 600 && prefvalue <= 800) {
				      			elem.push(grad[3]);
				      		} else if (prefvalue > 800) {
				      			elem.push(grad[4]);
				      		}
				    		}
				    	});			      
				      return elem;
				    }),
				    keys: ['hc-key', 'value', 'color'],
		        name: '',
            borderColor: 'black',
            borderWidth: 0.1,
		        states: {
		            hover: {
		                color: '#eecc22'
		            }
		        },
		        dataLabels: {
		            enabled: false,
		            format: '{point.name}'
		        },
						point: {
	            events: {
	                mouseOver: function (e) {
						        drawRegionChart(e.target.value[0]);
						        drawPrefectureCharts(e.target.value[0]);
	                }
	            }
          	}
		    }]
		});

  }
  
	//krousmata kata fulo
  const drawDemographyChart_radar = () => {
    $wrapper = $("#demography-chart-radar").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];
		var color = Chart.helpers.color;
		window.chartColors = {
			red: 'rgb(255, 99, 132)',
			orange: 'rgb(255, 159, 64)',
			yellow: 'rgb(255, 205, 86)',
			green: 'rgb(75, 192, 192)',
			blue: 'rgb(54, 162, 235)',
			purple: 'rgb(153, 102, 255)',
			grey: 'rgb(201, 203, 207)'
		};


    let config = {
      type: "radar",
      data: {
        labels: ['65+', '40-64', '18-39', '0-17'],
        datasets: [{
        	hidden: true,
          label: LABELS[LANG].demography.sum,
          backgroundColor: color(COLORS.default).alpha(0.8).rgbString(),
          pointBackgroundColor: COLORS.default,
          data: []
        },{
          label: LABELS[LANG].demography.men,
          backgroundColor: color(COLORS.men).alpha(0.8).rgbString(),
          pointBackgroundColor: COLORS.men,
          data: []
        },{
          label: LABELS[LANG].demography.women,
          backgroundColor: color(COLORS.women).alpha(0.8).rgbString(),
          pointBackgroundColor: COLORS.women,
          data: []
        }]
      },
			options: {
        responsive: true,
        legend: {
        	position: 'top',
          display: true,
          labels: {
						fontColor: "rgba(255, 255, 255, 1)",
          }
        },
				title: {
					display: false,
				},
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data){
              let suffix = {
                gr: "",
                en: ""
              };
              return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.yLabel + suffix[LANG];
            }
          }
        },
				scale: {
			    angleLines: {
			        color: "rgba(255, 255, 255, 0.2)"
			    },
			    pointLabels:{
			       fontColor:"white",
			    },
          gridLines: {
          	color: "rgba(255, 255, 255, 0.2)",
          	circular: false,
            zeroLineColor: "rgba(255,255,255,0.6)",
            borderDash: [3, 1]
          },
					ticks: {
						//display: false,
						fontColor: "rgba(255, 255, 255, 0.2)",
						backdropColor: "rgba(255, 255, 255, 0.0)",
						beginAtZero: true,
					}
				}
			}
    };

    gData.demography_cases.forEach(function(age, index){
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });
    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }
  
	//krousmata kata fulo
  const drawDemographyChart_cases = () => {
    $wrapper = $("#demography-chart-cases").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];

    let config = {
      type: "horizontalBar",
      data: {
        labels: [],
        datasets: [{
        	hidden: true,
          label: LABELS[LANG].demography.sum,
          backgroundColor: COLORS.default,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.men,
          backgroundColor: COLORS.men,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.women,
          backgroundColor: "#BBCDB3",
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        }]
      },
      options: {
        aspectRatio: 0.9,
        responsive: true,
        legend: {
          display: true,
          labels: {
            fontColor: "rgba(255, 255, 255, 0.7)"
          }
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: true,
          callbacks: {
            title: function(tooltipItem){
              let suffix = {
                gr: "",
                en: "cases"
              };
              let age = tooltipItem[0].yLabel;
              let total = 0;
              tooltipItem.forEach(function(item, i){
                total += item.xLabel;
              });

              return age + ": " + total + " " + suffix[LANG];
            },
            label: function(tooltipItem, data){
              let suffix = {
                gr: "",
                en: " cases"
              };
              return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.value + suffix[LANG];
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: false,
            position: "top",
            gridLines: {
              color: "rgba(255,255,255,0.2)",
              zeroLineColor: "rgba(255,255,255,0.2)",
              borderDash: [3, 1]
            },
            ticks: {
              suggestedMin: 0,
              fontColor: "rgba(255,255,255,0.7)",
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }],
          yAxes: [{
            stacked: false,
            barPercentage: 1,
            gridLines: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              fontColor: "rgba(255,255,255,0.7)"
            }
          }]
        }
      }
    };

    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 2.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 2.3;

    gData.demography_cases.forEach(function(age, index){
      config.data.labels.push(LABELS[LANG].age[index]);
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });

    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }
  
  const drawDemographyChart_deaths = () => {
    $wrapper = $("#demography-chart-deaths").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];

    let config = {
      type: "horizontalBar",
      data: {
        labels: [],
        datasets: [{
        	hidden: true,
          label: LABELS[LANG].demography.sum,
          backgroundColor: COLORS.default,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.men,
          backgroundColor: COLORS.men,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.women,
          backgroundColor: "#BBCDB3",
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        }]
      },
      options: {
        aspectRatio: 0.9,
        responsive: true,
        legend: {
          display: true,
          labels: {
            fontColor: "rgba(255, 255, 255, 0.7)"
          }
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: true,
          callbacks: {
            title: function(tooltipItem){
              let suffix = {
                gr: "",
                en: "cases"
              };
              let age = tooltipItem[0].yLabel;
              let total = 0;
              tooltipItem.forEach(function(item, i){
                total += item.xLabel;
              });

              return age + ": " + total + " " + suffix[LANG];
            },
            label: function(tooltipItem, data){
              let suffix = {
                gr: "",
                en: " cases"
              };
              return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.value + suffix[LANG];
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: false,
            position: "top",
            gridLines: {
              color: "rgba(255,255,255,0.2)",
              zeroLineColor: "rgba(255,255,255,0.2)",
              borderDash: [3, 1]
            },
            ticks: {
              suggestedMin: 0,
              fontColor: "rgba(255,255,255,0.7)",
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }],
          yAxes: [{
            stacked: false,
            barPercentage: 1,
            gridLines: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              fontColor: "rgba(255,255,255,0.7)"
            }
          }]
        }
      }
    };

    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 2.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 2.3;

    gData.demography_deaths.forEach(function(age, index){
      config.data.labels.push(LABELS[LANG].age[index]);
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });

    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }

  const drawDemographyChart_serious = () => {
    $wrapper = $("#demography-chart-serious").empty().html('<canvas></canvas>');
    $canvas = $wrapper.find("canvas")[0];

    let config = {
      type: "horizontalBar",
      data: {
        labels: [],
        datasets: [{
        	hidden: true,
          label: LABELS[LANG].demography.sum,
          backgroundColor: COLORS.default,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.men,
          backgroundColor: COLORS.men,
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        },{
          label: LABELS[LANG].demography.women,
          backgroundColor: "#BBCDB3",
          borderWidth: 0.5,
          borderColor: "#242a3c",
          data: []
        }]
      },
      options: {
        aspectRatio: 0.9,
        responsive: true,
        legend: {
          display: true,
          labels: {
            fontColor: "rgba(255, 255, 255, 0.7)"
          }
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: true,
          callbacks: {
            title: function(tooltipItem){
              let suffix = {
                gr: "",
                en: "cases"
              };
              let age = tooltipItem[0].yLabel;
              let total = 0;
              tooltipItem.forEach(function(item, i){
                total += item.xLabel;
              });

              return age + ": " + total + " " + suffix[LANG];
            },
            label: function(tooltipItem, data){
              let suffix = {
                gr: "",
                en: " cases"
              };
              return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.value + suffix[LANG];
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: false,
            position: "top",
            gridLines: {
              color: "rgba(255,255,255,0.2)",
              zeroLineColor: "rgba(255,255,255,0.2)",
              borderDash: [3, 1]
            },
            ticks: {
              suggestedMin: 0,
              fontColor: "rgba(255,255,255,0.7)",
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }],
          yAxes: [{
            stacked: false,
            barPercentage: 1,
            gridLines: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              fontColor: "rgba(255,255,255,0.7)"
            }
          }]
        }
      }
    };

    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 2.1;
    if ($wrapper.outerWidth() >= 600) config.options.aspectRatio = 2.3;
    gData.demography_serious.forEach(function(age, index){
      config.data.labels.push(LABELS[LANG].age[index]);
      for (let i = 0; i < 3; i++) {
        config.data.datasets[i].data.push(age[i]);
      }
    });

    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }
  
  const drawPrefectureDetails = () => {
		//This table shows a red, yellow, green scale so you can see progress by key measures by state. Covid+ is the number of positive Covid-19 test cases. ICU capacity is red &gt; 90%, yellow &gt; 70%, green &lt; 70%. Test target is based on a 500K/day goal. 
		//Increasing or decreasing describes the overall Covid+ trend. 
		//Covid+ % is red > 15%, yellow > 5%, green > 5%.
  	
  	gData["prefectures-details"].forEach(function(pref, i){
	  	var prefname = gData["prefectures-details"][i][LANG];
	  	var pref_twoweek = pref.twoweektrendlatest
	  	var newcasesperweekpop = pref.newcasesperweekpop;
	  	var intvalue = Math.floor( newcasesperweekpop );
	  	var twoweek_class, twoweek_text;
	  	var myvalues = pref.last14days_rolling.values;
	  	var map_color = pref.color;
	  	var titletxt = LABELS[LANG].prefectures[pref.color];
	  	var rjclass, rjtext = "";
	  	var rj_value = Array.isArray(pref.rj_value) ? pref.rj_value[1].slice(-1).pop() : "";
	  	var newcases = (pref.newcases > 0) ? "+" + pref.newcases : "";
	  	var newvacc = (pref.newvaccinations > 0) ? "+" + pref.newvaccinations : "";
	  	
	  	if(Array.isArray(pref.rj_value)){

	  		if(pref.rj_value[0][1] < pref.rj_value[1][1]){
	  			rjclass = "increasing";
	  			rjtext = LABELS[LANG].prefectures['increasing'];
	  		}else if (pref.rj_value[0][1] > pref.rj_value[1][1]){
	  			rjclass = "decreasing";
	  			rjtext = LABELS[LANG].prefectures['decreasing'];
	  		}else{
	  			rjclass = "flat";
	  			rjtext = LABELS[LANG].prefectures['flat'];
	  		}
	  	}

	  	if(pref_twoweek >= 0 && pref_twoweek <= 5 ){
	  		twoweek_class = "flat";
	  		twoweek_text = LABELS[LANG].prefectures['flat'];
	  	}else if (pref_twoweek > 5){
	  		twoweek_class = "increasing";
	  		twoweek_text = LABELS[LANG].prefectures['increasing'];
	  	}else{
	  		twoweek_class = "decreasing";	
	  		twoweek_text = LABELS[LANG].prefectures['decreasing'];
	  	}
	  	
			$('#tbodyid').append(`<tr>
				<td id="box_${i}" class="${map_color} personPopupTrigger" style="text-align:left!important" rel="${prefname},${titletxt},${map_color}">${prefname}</td>
				<td class="${twoweek_class} smallertext"><h4 class="m-0 font-weight-bold" style="color: inherit;">${pref.twoweektrendlatest}%</h4><span class="${twoweek_class}">${twoweek_text}</span></td>
				<td><span id="sparkline${i}"></span></td>
				<td><h4 class="m-0" style="color: inherit;">${pref.totalcases}</h4><div style="font-size: 10px; margin-top: -2px; color: #ffc108">${newcases}</div></td>
				<td><div class="progress"><div role="progressbar" aria-valuenow="${newcasesperweekpop}" aria-valuemin="0" aria-valuemax="200" class="progress-bar ${map_color}" style="width: ${intvalue}%;color: #fff!important;">${newcasesperweekpop}</div></div></td>
				<td class="${rjclass} smallertext"><h4 class="m-0 font-weight-bold" style="color: inherit;">${rj_value}</h4><span>${rjtext}</span></td>
				<td><h4 class="m-0" style="color: #3DC;">${pref.total_vaccinations}</h4><div style="font-size: 10px; margin-top: -2px; color: #8bc34a">${newvacc}</div></td>
				<td><h4 class="m-0" style="color: inherit;">${pref.population}</h4></td>
			</tr>`);
			
			$('#sparkline'+i).sparkline(myvalues, {
				type: "line",
				width: 100,
				height: 50,
				lineColor: "#0083CD",
				fillColor: "rgba(0,131,205,0.2)",
				minSpotColor: !0,
				maxSpotColor: !0
			});
		});
			
	  $("#search-nomous").on("keyup", function() {
	    var value = $(this).val().toLowerCase();
	    $("#tbodyid tr").filter(function() {
	      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
	    });
	  });
	  
		$("#prefectures").tablesorter({
			theme: 'blackice', 
			widgets: ["saveSort"],
	    widgetOptions: {
	      // enable/disable saveSort dynamically
	      saveSort: true
	    },
			sortList: [[4,1]] 
		});
			
		$("#pref-updated").text(gData.updated.lastprefecture[LANG]);
  }
  
	const initPopup = () => {
	    var hideDelay = 500;
	    var hideTimer = null;
	    var ajax = null;
	    var hideFunction = function()
	    {
	        if (hideTimer)
	            clearTimeout(hideTimer);
	        hideTimer = setTimeout(function()
	        {
	            currentPosition = { left: '0px', top: '0px' };
	            container.css('display', 'none');
	        }, hideDelay);
	    };

	    var currentPosition = { left: '0px', top: '0px' };
			var container = $(`<div class="root" id="PopupContainer">
			   <div class="StateTooltip" style="width: 350px;">
			      <div style="margin-bottom: 9px; border-bottom: 1px solid rgb(238, 238, 238);">
			         <div class="Row">
			            <div class="Col">
			               <div style="font-weight: bold; padding: 0px 0px 5px;">
			                  <div class="ColorDot ColorDotFlashing colorclass" style=""></div>
			                  <span id="prefect_name"></span>
			               </div>
			            </div>
	            <div class="Col">
	               <div id="closetab" style="font-size: 10px; color: #aaa; text-align: right; line-height: 20px;">X</div>
	            </div>
			         </div>
			      </div>
			      <div class="Row">
			        <div class="LabeledDataFrame">
			           <h3>${LABELS[LANG].prefectures.danger}</h3>
			           <div class="content">
			              <div class="color"><span id="dangerlevel"></span></div>
			           </div>
			        </div>
			      </div>
			      <div class="Row">
			         <div class="LabeledDataFrame" style="width:100%">
			          <h3>${LABELS[LANG].prefectures.latest_cases}</h3>
			            <div class="content">
			               <canvas style="width: 100% !important;height: auto !important;" id="myChart">
			            </div>
			         </div>
			      </div>
			   </div>
			</div>`);
			
	    const getDateValue = (from, i, isYmd) => {
	      let dt = new Date(from[0], from[1] - 1, from[2]);
	          dt.setDate(dt.getDate() + i);

	      let ret = "";
	      let cy = dt.getFullYear();
	      let cm = dt.getMonth() + 1;
	      let cd = dt.getDate();

	      if (isYmd) {
	        let ymd = (parseInt(cy) * 10000) + (parseInt(cm) * 100) + parseInt(cd);
	        ret = ymd;

	      } else {
	        if (LANG === "gr") {
	          ret = cm + "/" + cd;
	        }

	        if (LANG === "en") {
	          ret = cm + "/" + cd;
	        }
	      }

	      return ret;
	    }

	    // function to update our chart
	    function ajax_chart(chart, region_name) {
	        var data = {};
	        	gData["prefectures-details"].forEach(function(row, i){
	        		if(row[LANG] == region_name){
	        			chart.legend.display = false;
		            chart.data.datasets[0].data = gData["prefectures-details"][i].carriers.values;
		            gData["prefectures-details"][i].carriers.values.forEach(function(val, j){
		            	chart.data.labels.push(getDateValue(gData["prefectures-details"][i].carriers.from, j, false));
		          	});
		            //chart.data.datasets[0].data = gData["prefectures-details"][i].carriers.values;
		            chart.update(); // finally update our chart
	        		}
	        	});       	
	    }

	    $('.personPopupTrigger').on('mouseover', function()
	    {
	        if (!$(this).data('hoverIntentAttached'))
	        {
	            $(this).data('hoverIntentAttached', true);
	            $(this).hoverIntent
	            (
	                // hoverIntent mouseOver
	                function()
	                {
	                    if (hideTimer)
	                        clearTimeout(hideTimer);

	                    // format of 'rel' tag: prefect_name,personguid
	                    var settings = $(this).attr('rel').split(',');
	                    var prefect_name = settings[0];
	                    var dangerlevel = settings[1];
	                    var colorclass = settings[2];
	                    
	                    let chartData = {};

	                    // If no guid in url rel tag, don't popup blank
	                    if (dangerlevel == '')
	                        return;

	                    var pos = $(this).offset();
	                    var width = $(this).width();
	                    var reposition = { left: (pos.left + width) + 'px', top: pos.top - 5 + 'px' };

	                    // If the same popup is already shown, then don't requery
	                    if (currentPosition.left == reposition.left &&
	                        currentPosition.top == reposition.top)
	                        return;

	                    container.css({
	                        left: reposition.left,
	                        top: reposition.top
	                    });

	                    currentPosition = reposition;

	                    $('#prefect_name').html(prefect_name);
	                    $('#dangerlevel').html(dangerlevel);
	                    
	                    var colorarr = {'green':'#12ad2c', 'yellow':'#ffc300', 'orange':'#E5712A', 'red':'#c82d2d', 'lightgrey':'#ccc', 'grey':'#605f69'};

	                    $(".color").removeAttr('style').css({
												    'color': colorarr[colorclass], 
												    'font-weight': 'bold'
												});
	                    $(".colorclass").removeAttr('style').css({
												    'background-color': colorarr[colorclass]
												});

									   var ctx = $('#myChart');
									    var FontSize = "10"; //Chart.defaults.global.defaultFontSize
									    
									    var myChart = new Chart(ctx, {
									        type: 'bar',
									        data: {
									            labels: [],
									            datasets: [
									                {
									                		label: '',
									                    fill: false,
									                    lineTension: 0.1,
									                    backgroundColor: "rgba(75,192,192,0.4)",
									                    borderColor: "rgba(75,192,192,1)",
									                    borderCapStyle: 'butt',
									                    borderDash: [],
									                    borderDashOffset: 0.0,
									                    borderJoinStyle: 'miter',
									                    pointBorderColor: "rgba(75,192,192,1)",
									                    pointBackgroundColor: "#fff",
									                    pointBorderWidth: 1,
									                    pointHoverRadius: 5,
									                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
									                    pointHoverBorderColor: "rgba(220,220,220,1)",
									                    pointHoverBorderWidth: 2,
									                    pointRadius: 1,
									                    pointHitRadius: 10,
									                    data: [],
									                    spanGaps: false,
									                }
									            ]
									        },
									        options: {
									        	responsive: true,
									          legend: {
									            display: false
									          },
									          title: {
									            display: false
									          },
								            tooltips: {
								                mode: 'index',
								                intersect: false
								            },
								            scales: {
								                yAxes: [{
								                    ticks: {
								                        beginAtZero:true
								                    }
								                }]
								            },
														animation: {
										            duration: 500,
										            easing: "easeOutQuart",
										            onComplete: function () {
										                var ctx = this.chart.ctx;
										                ctx.font = Chart.helpers.fontString(FontSize, 'bold', Chart.defaults.global.defaultFontFamily);
										                ctx.textAlign = 'center';
										                ctx.textBaseline = 'bottom';

										                this.data.datasets.forEach(function (dataset) {
										                    for (var i = 0; i < dataset.data.length; i++) {
										                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
										                            scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
										                        ctx.fillStyle = '#444';
										                        var y_pos = model.y - 5;
										                        // Make sure data value does not get overflown and hidden
										                        // when the bar's value is too close to max value of scale
										                        // Note: The y value is reverse, it counts from top down
										                        if ((scale_max - model.y) / scale_max >= 0.85)
										                            y_pos = model.y + 20; 
										                        ctx.fillText(dataset.data[i], model.x, y_pos);
										                    }
										                });               
										            }
										        }
									        }
									    });

	                    container.css('display', 'block');
											ajax_chart(myChart, prefect_name);
	                   
	                },
	                // hoverIntent mouseOut
	                hideFunction
	            );
	            // Fire mouseover so hoverIntent can start doing its magic
	            $(this).trigger('mouseover');
	        }
	    });
	    
	    $('body').append(container);

	    // Allow mouse over of details without hiding details
	    $('#PopupContainer').mouseover(function()
	    {
	        if (hideTimer)
	            clearTimeout(hideTimer);
	    });

	    // Hide after mouseout
	    $('#PopupContainer').mouseout(hideFunction);
	    $('#closetab').mouseover(closetab);
	};

  const drawRegionChart = (prefCode) => {
    let $wrapper = $("#region-chart").empty().html('<canvas></canvas>');
    let $canvas = $wrapper.find("canvas")[0];
    let dataType = $("#select-pref-type").val();

    let config = {
      type: "horizontalBar",
      data: {
        labels: [],
        datasets: [{
          label: "",
          backgroundColor: [],
          data: []
        }]
      },
      options: {
        aspectRatio: 0.4,
        animation: {
          duration: 1000
        },
        responsive: true,
        legend: {
          display: false
        },
        title: {
          display: false
        },
        tooltips: {
          xPadding: 24,
          yPadding: 12,
          displayColors: true,
          callbacks: {
            title: function(tooltipItem){
              gData["prefectures-data"].forEach(function(pref, i){
                if (pref.gr === tooltipItem[0].yLabel || pref.en === tooltipItem[0].yLabel) {
                  if ($("#select-prefecture").val() !== pref.code) {
                    drawPrefectureCharts(pref.code);
                  }
                }
              });
              return tooltipItem[0].yLabel;
            },
            label: function(tooltipItem, data){
              let suffix = {
                gr: "",
                en: " cases"
              };
              return tooltipItem.xLabel + suffix[LANG];
            }
          }
        },
        scales: {
          xAxes: [{
            position: "top",
            gridLines: {
              color: "rgba(255,255,255,0.2)"
            },
            ticks: {
              suggestedMin: 0,
              fontColor: "rgba(255,255,255,0.7)",
              callback: function(value, index, values) {
                return addCommas(value);
              }
            }
          }],
          yAxes: [{
            gridLines: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              fontColor: "rgba(255,255,255,0.7)",
            }
          }]
        }
      }
    };

    if ($wrapper.outerWidth() >= 400) config.options.aspectRatio = 1.3;
    if (prefCode !== "") config.options.animation.duration = 0;

    let prefs = [];

    gData["prefectures-data"].forEach(function(pref, i){
      prefs.push({
        name: gData["prefectures-data"][i][LANG],
        value: getValuesTotal(pref[dataType].values, pref.code),
        code: (i + 1).toString()
      });
    });

    prefs.sort((a, b) => {
      if(a.value < b.value) return 1;
      if(a.value > b.value) return -1;
      return 0;
    });

    prefs.forEach(function(pref, i){
      config.data.labels.push(pref.name);
      config.data.datasets[0].data.push(pref.value);

      if (prefCode == pref.code) {
        config.data.datasets[0].backgroundColor.push(COLORS.selected);
      } else {
        config.data.datasets[0].backgroundColor.push(getPrefColor(pref));
      }
    });

    let ctx = $canvas.getContext('2d');
    window.myChart = new Chart(ctx, config);
  }

  const drawPrefectureCharts = (prefCode) => {
    $("#select-prefecture").val(prefCode);
    $(".transition.prefecture").each(function(){
      $(this).attr("pref", prefCode);
      $(this).find("h3").find("span").text(gData["prefectures-data"][parseInt(prefCode) - 1][LANG]);
      drawTransitionChart($(this), $(this).attr("code"), $(this).attr("pref"), true);
      moveToRight($(this));
    });
  }

  const showUpdateDate = () => {
    $(".updated-last").text(gData.updated.last[LANG]);
   // $(".updated-demography-radar").text(gData.updated.demography[LANG]);
    $(".updated-demography-cases").text(gData.updated.demography[LANG]);
    $(".updated-demography-deaths").text(gData.updated.demography[LANG]);
    $(".updated-demography-serious").text(gData.updated.demography[LANG]);
    $(".updated-demography-sum").text(gData.updated.demography[LANG]);
    $(".updated-demography-men").text(gData.updated.demography[LANG]);
    $(".updated-demography-women").text(gData.updated.demography[LANG]);
    $(".updated-unemployment").text(gData.updated.demography[LANG]);
  }
  
  const initMap = () => {
		let dataset = [];
		let maxsize;
		let mapsvg;
		let startday,
				endday;
		
		function mapChange(event, ui) {
			$.each(dataset, function( index, value ) {
				//var testdate = new Date(value.prefval[index][0]).getTime() / 1000;
	  		var region = mapsvg.getRegion(value.prefname);
				if(typeof region !== "undefined"){
					region.setFill('#'+value.prefval[ui.value][1]);
					region.setTooltip(value.prefname+'<br><sup>*</sup>'+LABELS[LANG].total+value.prefval[ui.value][2]+'<br>'+LABELS[LANG].daily_cases+value.prefval[ui.value][3]);
					
					var cat = (new Date(value.prefval[ui.value][0]).toDateString().split(' ').slice(1).join(' ')).split(' ');
					cat[0] = LABELS[LANG].months_pref[cat[0]];
					$("#date_txt").text(cat.join(' '));
				}
			});
		};
	  	
		gData.transition["mapepi"].forEach(function(pref, i){
		 var ar = [];
		 ar['prefname'] = gData.transition["mapepi"][i].en;
	   ar['prefval'] = gData.transition["mapepi"][i].percentage.values;
	   startday = (new Date(gData.transition["mapepi"][i].percentage.from).toDateString()).split(' ').slice(1);
	   startday[0] = LABELS[LANG].months_pref[startday[0]];
	   startday = startday.join(' ');
	   endday = (new Date(gData.transition["mapepi"][i].percentage.to).toDateString()).split(' ').slice(1);
	   endday[0] = LABELS[LANG].months_pref[endday[0]];
	   endday = endday.join(' ');
	   ar['start'] = gData.transition["mapepi"][i].percentage.from;
	   dataset.push(ar);
	   maxsize = ar['prefval'].length;
		});
		
		//////////////////
		var mapsvgobj = $("#mapsvg").mapSvg({width: "100%",height: "100%",colors: {baseDefault: "#000000",background: "#242A3C",selected: 0,hover: 20,directory: "#fafafa",status: {}},viewBox: [0,-1.8823751724135036,6843.8384,6761.240350344827],tooltips: {mode: "id",on: false,priority: "local",position: "bottom-right"}, source: "lib/mapsvg/maps/not-calibrated\\greece.svg",title: "Not-calibrated\\greece",responsive: true,afterLoad: function(
		) {
		  mapsvg = this;
		  $(".map").show();

		  $( "#slider" ).slider({
		    range: false,
		    min: 0,
		    max: maxsize - 1,
		    step: 1,
		    //values: [0],
		    slide: function( event, ui ) 
		    {
		    	mapChange(event, ui);
		    },
		    change: function(event, ui) {
		    	mapChange(event, ui);
		    },
		    create: function(event, ui){
		        $(this).slider('value', maxsize - 1);
		    }
		  });
		  
		  var pausebool = false;
		  var intv;
			var	$pause = $("#pause");				  
		  $pause.on("click", function() {
		    pausebool = (pausebool) ? false : true;
		    if (pausebool == false) {
		      clearInterval(intv);
		      $pause.html("Play");
		    }else{
			    intv = setInterval(function() {
			      var cv = $("#slider").slider("value");
				    var nextValue = (parseInt(cv) + 1);
			      $("#slider").slider("value", nextValue);
			      $("#sliderval").val(nextValue);
			      $pause.html("Pause");
			    }, 200);
		    }
		  });
		  $( "#date_txt" ).text(endday);
		}});
		/////////////////
  }

  const loadData = () => {
  	  $.getJSON("https://raw.githubusercontent.com/Sandbird/covid19-Greece/master/greece.json?version="+RANDOMSTRING, function(data){
      gData = data;
      updateThresholds();
      drawTransitionBoxes();
      //drawDemographyChart_radar();
      //drawDemographyChart_cases();
      //drawDemographyChart_deaths();
      drawDemographyChart_group_cases();
      drawDemographyChart_group_deaths();
      drawDemographyChart_group_intensive();
      drawUnemployment();
      //drawDemographyChart_serious();
      drawDemographyChart_sum();
      drawDemographyChart_men();
      drawDemographyChart_women();
      drawGreeceMap();
      drawRegionChart("");   //disabled for now
      drawPrefectureCharts("1");
      drawPrefectureDetails();
      showUpdateDate();
      updateAxisChartHeight();
      
      //Scroll death to current week
	    var leftPos = $('#predicted_scroller').scrollLeft();
	    var today = new Date();
	    var weekno = today.getWeek();
    	$("#predicted_scroller").animate({scrollLeft: leftPos - (weekno*4)}, 800);
      $("#cover-block").fadeOut();
      initPopup();
      initMap();
    })
  }

  const bindEvents = () => {
    $(".transition").find(".switch").on("click",function(){
      let $box = $(this).closest(".transition");
      $(this).siblings(".switch").removeClass("selected");
      $(this).addClass("selected");
      drawTransitionChart($box, $box.attr("code"), $box.attr("pref"), true);
    });

    $("#select-prefecture").on("change", function(){
      let prefCode = $(this).val();
      drawPrefectureCharts(prefCode);
    });

    $("#select-pref-type").on("change", function(){
      drawRegionChart("");
    });
    
    $("#select-unemp-type").on("change", function(){
     drawUnemployment();
    });

    $(".more").on("click",function(){
      $(this).closest("p.notes").addClass("show");
    });

    $(".checkboxes").find(".checkbox").on("click", function(){
      if ($(this).hasClass("on")) {
        $(this).removeClass("on");
      } else {
        $(this).addClass("on");
      }
      let $box = $(this).closest(".transition");
      drawTransitionChart($box, $box.attr("code"), $box.attr("pref"), false);
    });

    $('a[href^="#"]').click(function() {
      let href = $(this).attr("href");
      let position = $(href).offset().top;
      $('body,html').animate({scrollTop: position}, 400, 'swing');
      return false;
    });
  }
  loadData();
  bindEvents();
};

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
    var dayOfYear = ((today - onejan +1)/86400000);
    return Math.ceil(dayOfYear/7)
};


function isInt(value) {
    var er = /^-?[0-9]+$/;
    return er.test(value);
}

$(function(){
  init();
});
