


var MakeBarChart = MakeBarChart || {};

d3.json("data.json", function(d){
 	
 	MakeBarChart.data = d;

 	/*var needsUpdate;
 	var yes = true;
 	var no = false;*/

 	MakeBarChart.hasRun = false;

	if (MakeBarChart.hasRun == false){
		MakeBarChart.Setup('chartContainer');
		MakeBarChart.DrawingBoard();
	
		$(function(){//short hand of document.ready
			MakeBarChart.Update($('#yearSelector').val()); // Default Year when page loads
			$("#yearSelector").on('change', function(){
				// This updates the data when we select a new year
				var val = $(this).val();
				MakeBarChart.Update(val);
			});
		});
		MakeBarChart.hasRun = true;
	}//end if
	
});

MakeBarChart.Update = function(year){
	var self = this;
	self.CollectData(year);
	self.DrawLegend();
	self.SetScales();
	self.DrawAxes();
 	self.DrawBars();
}

MakeBarChart.Setup = function(divId) {
		var self = this;
		self.margin = {top: 20, right: 35, bottom: 120, left: 35};
		self.container = document.getElementById(divId);
		self.cHeight = self.container.scrollHeight - self.margin.top - self.margin.bottom;
		self.cWidth = self.container.scrollWidth - (self.margin.left + self.margin.right);
		self.barWidth = ((self.cWidth / 3) * .8) - 20;
		self.divId = divId;	
}

MakeBarChart.DrawingBoard = function(){
	var self = this;
	 
	d3.select(self.container)
	          	.append("svg")
	          	.attr("class", "graph")
				.attr("height", self.cHeight + self.margin.top + self.margin.bottom)
				.attr("width", self.cWidth + self.margin.left + self.margin.right)

			    .append("g")
			    .attr("class", "container")
			    .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

 	self.legend = d3.select(self.container)
		          	.append("svg")
		          	.attr("class", "legend")
		          	.attr("width", self.cWidth)
		          	.attr("height", 70)		    
		          	.append("g")
		          	.attr("class", "legend-group");		         
}

MakeBarChart.CollectData = function(year){
	var self = this;
	self.year = year;
	self.ordinalLabel = self.getOrdinalLabels(year);
	self.race_list = self.getDataRaces(year);
	self.datasetMax = self.getDataSetMax(year);
	self.sortedData = self.sortDataSet(year);
}

MakeBarChart.DrawLegend = function(){

	var self = this;
	
	var data = self.race_list;
	var padding = 10;
	var w = (self.cWidth/data.length) - padding;
	var dimensions = [w, 20]; // width, height
	var legHeight = 70;
	

	var legend = self.legend;

	legend.selectAll('rect')
			.data(data)
			.enter()
			.append('rect')
			.attr('class', function(d){
				return 'legend-item ' + d.toLowerCase()
				})
			.attr('width', dimensions[0])
			.attr('height', dimensions[1])
			.attr('x', function(d,i){
				return (dimensions[0] + padding) *i;
				})
			.on('mouseover', function(){
				var race_class = d3.select(this).attr("class").replace('legend-item ', '');
				d3.select(this).attr("stroke", "#444");
				d3.selectAll(".graph rect").attr('opacity', .05);
				d3.selectAll(".graph ." + race_class).attr('opacity', 1);


			})
			.on('mouseout', function(){
				d3.select(this).attr("stroke", "none");
				d3.selectAll(".graph rect").attr('opacity', 1);
			});

	legend.selectAll('text')
			.data(data)
			.enter()
			.append('text')
			.text(function(d){return d})
			.attr('class', 'legend-text')
			.attr('x', function(d,i){
				return (dimensions[0] + padding) *i;
				})
			.attr("transform", "translate(0," + (legHeight - 35)+ ")")
			.attr("font-size", "10px");
}

MakeBarChart.SetScales = function(){
		
		var self = this;
		self.xScale = d3.scale.ordinal()
						 	  .domain(self.ordinalLabel)
						 	  .rangeRoundBands([0,self.cWidth], .1);


		self.yScale = d3.scale.linear()	 					
	    				 	 .domain([0,self.datasetMax])
	  	  				 	 .range([self.cHeight,0]); //([600,0])
}

MakeBarChart.DrawAxes = function(){
	var self = this;

	self.xAxis = d3.svg.axis()
	   		 	.scale(self.xScale)
	    		.orient("bottom");


	self.yAxis = d3.svg.axis()
			    .scale(self.yScale)
			    .orient("left")
			    .tickSize(self.cWidth)
			    .tickFormat(function(d){
			    	return d + "%"
			    	});

	if(self.hasRun==false){
		d3.select(self.container).select('svg .container')
						.append("g")
						.attr("class","xAxis")
						.attr("width", self.cWidth-self.margin.left)
						.attr("transform", "translate(0," + self.cHeight + ")")
						/*.attr("transform", "translate(" + (((self.cWidth-self.margin.left)/3)) + "," + self.cHeight + ")")*/
			      		.call(self.xAxis);
								

		d3.select(self.container).select('svg .container')
								 .append("g")
								 .attr("transform", "translate(" + self.cWidth + ",0)")
					    		 .attr("class", "yAxis")
					      		 .call(self.yAxis);

	}else{
		// hasRun is true
		d3.select(self.container).select('svg .container .yAxis').call(self.yAxis);
		d3.select(self.container).select('svg .container .xAxis').call(self.xAxis)
	}
}

MakeBarChart.DrawBars = function(){
	var self = this;
	var i = 0;
	var indicatorBars;

	for(var s in self.sortedData){
			if(self.hasRun == false){
				indicatorBars = d3.select(self.container)
						  .select('.graph .container')
						  .append('g')
						  .attr("class", "indicatorBars")
						  .attr("id", "ib_" + i)
						  .attr('transform',"translate(" + self.xScale(i*(self.barWidth)) + ",0)")
			}else{
				indicatorBars = d3.select(self.container).select('#ib_'+i);
				indicatorBars.selectAll('rect').remove();
			}

			i++;

			var data = self.sortedData[s]; // this makes up the bar

			data.sort(function(a, b){
				return b.value - a.value
				});

			var Bars = indicatorBars.selectAll("rect")
						 .data(data, function(d) {
						 		return d.value;
						 	})
						 .enter().append("rect")
						 .attr('width', self.barWidth)
						 .attr('class', function(d){
						 	return d.race.toLowerCase();
						 })
						 //.attr('opacity', .7)
						 .attr("y", function(d){
						 		return self.yScale(d.value);
						 		})
						 .attr('height', function(d){
						 		return self.cHeight - self.yScale(d.value);
						 });


	}//end for loop
}


/*-----------UTILITY ROUTINES-------------*/
MakeBarChart.mouseEvents = function(){
}

MakeBarChart.sortDataSet = function(year){
	var self = this;
	var sortedData = {}; // THIS data will be what create our bars
	var yearIn_dataset = self.data[year];

	for(var ind_name in yearIn_dataset){
		indicator_data = yearIn_dataset[ind_name];
		sortedData[ind_name] = [];
		for(var race in indicator_data){
			sortedData[ind_name].push(indicator_data[race]);
		}
	}
	
	return sortedData;
}

MakeBarChart.getDataSetMax = function(year){
	/*Expects dataset YEAR*/
	var self = this;
	var max = 0;
	var indicator;
	var race_obj;
	var yearIn_dataset = self.data[self.year];

	for(var ind in yearIn_dataset){
		indicator = yearIn_dataset[ind];
		for(var race in indicator){
			race_obj = indicator[race];
			if(parseFloat(race_obj.value) > max){
				max = parseFloat(race_obj.value);
			}
		}
	}
	return max;	
}

MakeBarChart.getDataRaces = function(year){
	/*Expects dataset YEAR*/
	var self = this;
	var filtered_races = {};
	var race_list = [];
	var yearIn_dataset = self.data[self.year]; /*all this is doing is going into the dataset dictionary */
	for(var ind in yearIn_dataset){

		indicator = yearIn_dataset[ind];
		for(var race in indicator){
			if(filtered_races.hasOwnProperty(race) == false){
				filtered_races[race] = null;
				race_list.push(race.replace(year,''));
			}
		}
	}
	return race_list;
}

MakeBarChart.getOrdinalLabels = function(year){
	var self = this;
	var yearIn_dataset = self.data[self.year];
	var ordinalLabels = [];

	for(var ind in yearIn_dataset){
			ordinalLabels.push(ind);
	}

	return ordinalLabels;
}


