


var MakeBarChart = MakeBarChart || {};

d3.json("data.json", function(d){
 	
 	MakeBarChart.data = d;
/*----------DATA Independent-----Should only render ONCE---------------*/
	MakeBarChart.Setup("chartContainer");
	MakeBarChart.DrawingBoard();

/*----------DATA Dependent------Should be updated each time a new year is selected------------*/
	MakeBarChart.Update('2010');

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
				});


	legend.selectAll('text')
			.append("g")
			.attr("class", "g-text")
			.data(data)
			.enter()
			.append('text')
			.text(function(d){return d})
			.attr('class', 'legend-text');
}

MakeBarChart.SetScales = function(){
		
		var self = this;
		var padding = 200;

		self.xScale = d3.scale.linear()
						 	  .domain(self.ordinalLabel)
						 	  .range([padding, self.cWidth - padding *2]);


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

	
	var xText = d3.select(self.container).select('svg .container')
					.append("g")
					.attr("class","xAxis")
					.attr("width", self.cWidth-self.margin.left)
					.attr("transform", "translate(0," + self.cHeight + ")")
					/*.attr("transform", "translate(" + (((self.cWidth-self.margin.left)/3)) + "," + self.cHeight + ")")*/
					.call(self.xAxis);

		xText.selectAll("text")
				.data(self.ordinalLabel)
				.enter()
				.append("text")
				.text(function(d){
					return d[0];
				});




		      		//.call(self.xAxis);
	

	d3.select(self.container).select('svg .container')
							 .append("g")
							 .attr("transform", "translate(" + self.cWidth + ",0)")
				    		 .attr("class", "yAxis")
				      		 .call(self.yAxis);
}

MakeBarChart.DrawBars = function(){
	var self = this;
	var i = 0;
	for(var s in self.sortedData){
			
			var indicatorBars = d3.select(self.container)
						  .select('.graph .container')
						  .append('g')
						  .attr("class", "indicatorBars")
						  .attr('transform',"translate(" + self.xScale(i*(self.barWidth)) + ",0)")
						

			i++;

			var data = self.sortedData[s]; // this makes up the bar

			data.sort(function(a, b){
				return b.value - a.value
				});

			var Bars = indicatorBars.selectAll("indicatorBars")
						 .data(data, function(d) {
						 		return d.value;
						 	})
						 .enter()
						 .append("rect")
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
						 })
						 .on('mouseover', function(d){
						 		//console.log(d.value);
						 		var obj = d3.select(this);
						 		var currClass = obj.attr('class');
						 		obj.attr('class', currClass + ' selected');
						 		d3.selectAll('svg rect')
						 		.attr('opacity', .1)
						 })
						 .on('mouseout', function(d){
						 		var obj = d3.select(this);
						 		
						 		var currClass = obj.attr('class');
						 		obj.attr('class', currClass.replace(' selected', ''));
						 		d3.selectAll('svg rect').attr('opacity', .9)
						 })
	}//end for loop
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


