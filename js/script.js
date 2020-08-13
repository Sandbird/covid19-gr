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
const SCROLLBAR_WIDTH = window.innerWidth - $(window).width();
const COLORS = {
  default: "#3DC",
  men: "#5987A5",
  women: "#86E18D",
  second: "#FEA",
  athensopen: "#5987A5",
  thessopen: "#3BA9B0",
  deaths: "#FB8",
  serious: "#FEA",
  infected_distribution: "#6F6587,#5987A5,#3BA9B0,#48C7A6,#86E18D,#D5F474".split(","), 
  predicted_deaths: "#6F6587,#5987A5,#3BA9B0,#48C7A6,#86E18D,#D5F474".split(","), 
  pcrtests: "#3DC,#5987A5,#3BA9B0,#48C7A6,#86E18D,#D5F474".split(","),
  dark: "#399",
  selected: "#EC2"
};
const LABELS = {
  gr: {
    change: "Τελευταία μεταβολή: ",
    total: "Σύνολο: ",
    transition: {
      carriers: ["Κρούσματα"],
      active: ["Ενεργά κρούσματα"],
      infected_distribution: ["Υπό διερεύνηση ή άγνωστης προέλευσης", "Σχετιζόμενα με ήδη γνωστό κρούσμα", "Σχετιζόμενα με ταξίδι από το εξωτερικό"],
      predicted_deaths: ["χαμηλότερο εύρος", "πρόβλεψη", "ανώτερο εύρος"],
      serious: ["Κρίσιμη κατάσταση"],
      deaths: ["Θάνατοι"],
      tests: ["Δείγματα που έχουν ελεγχθεί", "Βρέθηκαν θετικοί"],
      pcrtests: [""],
      rt_repro: ["Βασικός αναπαραγωγικός αριθμός"],
      rj_repro: ["Αναπαραγωγικός αριθμός"],
      //reproduction_rj_infected: ""
    },
    unit: {
      carriers: "",
      active: "",
      infected_distribution: "",
      predicted_deaths: "",
      serious: "",
      deaths: "",
      tests: "",
      pcrtests: "",
      rt_repro: "",
      rj_repro: "",
      //reproduction_rj_infected: "",
    },
    demography: {
      cases: "Κρούσματα",
      deaths: "Θάνατοι",
      serious: "Διασωληνωμένοι"
    },
    age: [
      "65+",
      "40-64",
      "18-39",
      "0-17"
    ]
  },
  en: {
    change: "Daily: ",
    total: "Total: ",
    transition: {
      carriers: ["Tested Positive"],
      active: ["Active Cases"],
      infected_distribution: ["Still under investigation or of unknown origin", "Related to an already known case", "Related to travel from abroad"],
      predicted_deaths: ["lower range", "projected", "upper range"],
      serious: ["Serious"],
      deaths: ["Deaths"],
      tests: ["Tested", "Found Positive"],
      pcrtests: ["National Institute of Infectious Diseases","Quarantine Stations","Public Health Institute, Public Health Center","Private Testing Companies","Universities","Medical Institutions"],
      rj_repro: ["Reproduction Number"],
      //reproduction_rj_infected: ["Num. of cases"],
      rt_repro: ["Effective Reproduction Number"]
    },
    unit: {
      carriers: "",
      active: "",
      infected_distribution: "",
      predicted_deaths: "",
      serious: "",
      deaths: "",
      tests: "",
      pcrtests: "",
      rt_repro: "",
      rj_repro: "",
      //reproduction_rj_infected: ""
    },
    demography: {
      cases: "Cases",
      deaths: "Deaths",
      serious: "Serious"
    },
    age: [
      "65+",
      "40-64",
      "18-39",
      "0-17"
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
      	if(pref[thType] === "carriers" || pref[thType] === "deaths"){
        	values.push(getValuesTotal(pref[thType].values));
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
      let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      return dates[1] + " " + months[parseInt(dates[0]) - 1];
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
          if (ymd >= 20200328) ret = COLORS.second; //All flights to and from Germany and the Netherlands, excluding flights from Germany to Athens, suspended
          if (ymd >= 20200601) ret = COLORS.athensopen; //International flights to and from Athens International Airport resumed for EU+ countries, excluding flights between Greece and Italy, Spain, Sweden, the United Kingdom, and the Netherlands
          if (ymd >= 20200615) ret = COLORS.thessopen; //International flights to and from Thessaloniki Airport Makedonia resumed
          if (ymd >= 20200701) ret = COLORS.infected_distribution[j+4]; //International flights between Greece and Algeria, Australia, Canada, Georgia, Japan, Montenegro, Morocco, New Zealand, Rwanda, Serbia, South Korea, Thailand, Tunisia, and Uruguay resumed
        	if (ymd >= 20200715) ret = COLORS.infected_distribution[j+5]; //Borders opened to Serbian citizens, International flights between Greece and the United Kingdom resumed
        	if (ymd >= 20200720) ret = COLORS.deaths; //International flights between Greece and Sweeden resumed
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
      
      if (prefCode === "" && code === "tests") {
        ret = COLORS.pcrtests[j];
      }
      
      
      if (prefCode === "" && code === "predicted_deaths") {
        ret = COLORS.predicted_deaths[j];
      }

      if (prefCode === "" && code === "pcrtests") {
        ret = COLORS.pcrtests[j];
      }

      if (code === "rt_repro") {
        ret = "#242A3C";
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

      if ($box.attr("code") === "rj_repro") {
        valueTotal  = Math.round(rows[rows.length - 1][0] * 100) / 100;
        valueLatest = Math.round((rows[rows.length - 1][0] - rows[rows.length - 2][0]) * 100) / 100;
      }

      if ($box.attr("code") === "rt_repro") {
        valueTotal  = Math.round(rows[rows.length - 1][0] * 100) / 100;
        valueLatest = Math.round((rows[rows.length - 1][0] - rows[rows.length - 2][0]) * 100) / 100;
      }
      
      if ($box.attr("code") === "predicted_deaths") {
			var middle_column_sum = rows.reduce(function (r, a) {
			        a.forEach(function (b, i) {
			            r[i] = (r[i] || 0) + b;
			        });
			        return r;
			    }, []);
        valueTotal  = precisionRound(middle_column_sum[1], 1);
        valueLatest = Math.round((rows[rows.length - 1][1] - rows[rows.length - 2][1]) * 100) / 100;
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
    if (code == "rt_repro"){
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
	                if (!hasMovingAverage || i >= 1) {
	                  ret.push(ds.label + ": " + addCommas(ds.data[tooltipItem.index]) + " " + LABELS[LANG].unit[code]);
	                }
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

    

    for (let i = 0; i < rows[0].length; i++) {
      config.data.datasets.push({
        label: LABELS[LANG].transition[code][i],
        backgroundColor: [],
        data: []
      });
    
			
			//prefecture
			
      if (code === "rj_repro") {
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
      if (code === "rt_repro") {
        let ds = config.data.datasets[config.data.datasets.length- 1];
        ds.type = "line";
        ds.fill = false;
        ds.pointRadius = 2;
        ds.pointBorderColor = "#EC2";
        ds.borderColor = "#EC2";
      }
      
      if (code === "predicted_deaths") {
        let ds = config.data.datasets[config.data.datasets.length- 1];
				if(ds.label == "projected"){
	        ds.type = "line";
	        ds.fill = false;
	        ds.pointRadius = 2;
	        ds.pointBorderColor = "#FFA562";
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
        totalValues[j] += row[j];

        let value = row[j];

        if ((prevBarColor !== curBarColor) && (code !== "rj_repro")) {
          //value = 0;
        }

        if ((prevBarColor !== curBarColor) && (code !== "rt_repro")) {
          //value = 0;
        }        

        if (row[j] === "") {
          value = 0;
        }

        if (value < 0 && (switchValue === "total" || code === "carriers" || code === "infected_distribution" || code === "predicted_deaths" || code === "deaths" || code === "tests" || code === "pcrtests")) {
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

  const getValuesTotal = (values) => {
    let ret = 0;

    values.forEach(function(row, i){
      row.forEach(function(val, j){
        ret += val;
      });
    });

    return ret;
  }

  const getPrefColor = (prefCode) => {
    let type = $("#select-pref-type").val();
    let ret = "rgba(90, 90, 90, 0.6)";
    let value = getValuesTotal(gData["prefectures-data"][parseInt(prefCode) - 1][type].values);

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
          label: LABELS[LANG].demography.cases,
          backgroundColor: COLORS.default,
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
          label: LABELS[LANG].demography.serious,
          backgroundColor: COLORS.serious,
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
          label: LABELS[LANG].demography.cases,
          backgroundColor: COLORS.default,
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
          label: LABELS[LANG].demography.serious,
          backgroundColor: COLORS.serious,
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
          label: LABELS[LANG].demography.cases,
          backgroundColor: COLORS.default,
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
          label: LABELS[LANG].demography.serious,
          backgroundColor: COLORS.serious,
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
        value: getValuesTotal(pref[dataType].values),
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
        config.data.datasets[0].backgroundColor.push(getPrefColor(pref.code));
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
    $(".updated-demography-sum").text(gData.updated.demography[LANG]);
    $(".updated-demography-men").text(gData.updated.demography[LANG]);
    $(".updated-demography-women").text(gData.updated.demography[LANG]);
  }

  const loadData = () => {
  	$.getJSON("https://raw.githubusercontent.com/Sandbird/covid19-Greece/master/greece.json", function(data){
      gData = data;
      updateThresholds();
      drawTransitionBoxes();
      drawDemographyChart_sum();
      drawDemographyChart_men();
      drawDemographyChart_women();
      drawRegionChart("");   //disabled for now
      drawPrefectureCharts("1");
      showUpdateDate();
      updateAxisChartHeight();
      $("#cover-block").fadeOut();
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


$(function(){
  init();
});