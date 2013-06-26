

var dataset;
var MakeBarChart = MakeBarChart || {};

d3.json("data.json", function(d){
 	
 	dataset = d;

	MakeBarChart.Setup(dataset, "chartContainer", "test", "2010");
	
 	MakeBarChart.DrawBars("2010");
});

MakeBarChart.Setup = function(data, divId, yLabel, year) {
		var self = this;
		self.year = year;
		self.margin = {top: 20, right: 35, bottom: 120, left: 35};
		self.container = document.getElementById(divId);
		self.cHeight = self.container.scrollHeight - self.margin.top - self.margin.bottom;
		self.cWidth = self.container.scrollWidth - (self.margin.left + self.margin.right);
		self.barWidth = ((self.cWidth / 3) * .8) - 20;
		self.data = dataset;
		self.divId = divId;
		self.yLabel = yLabel;
		self.datasetMax = MakeBarChart.getDataSetMax(year);
		self.ordinalLabel = MakeBarChart.getOrdinalLabels(year);
		

		self.xScale = d3.scale.ordinal()
						 	  .domain(self.ordinalLabel)
						 	  .rangeRoundBands([0,self.cWidth], .1);
						 	  /*.rangeRoundBands([0, self.cWidth], .1); //([0,900])*/


		self.yScale = d3.scale.linear()	 					
	    				 	 .domain([0,self.datasetMax])
	    				 	 //.domain([self.datasetMax,0]);
	  	  				 	 .range([self.cHeight,0]); //([600,0])

		MakeBarChart.DrawingBoard();
    	MakeBarChart.DrawAxes();
    	MakeBarChart.DrawLegend();
}


MakeBarChart.DrawAxes = function(){
	var self = this;

	var xAxis = d3.svg.axis()
	   		 	.scale(self.xScale)
	    		.orient("bottom");


	var yAxis = d3.svg.axis()
			    .scale(self.yScale)
			    .orient("left")
			    .tickSize(self.cWidth)
			    .tickFormat(function(d){
			    	return d + "%"
			    	});

	
	d3.select(self.container).select('svg .container')
					.append("g")
					.attr("class","xAxis")
					.attr("width", self.cWidth-self.margin.left)
					.attr("transform", "translate(0," + self.cHeight + ")")
		      		.call(xAxis);
	

	d3.select(self.container).select('svg .container')
							 .append("g")
							 .attr("transform", "translate(" + self.cWidth + ",0)")
				    		 .attr("class", "yAxis")
				      		 .call(yAxis);

}



MakeBarChart.DrawLegend = function(){

	var self = this;
	
	var data = self.getDataRaces(self.year);
	var padding = 5;
	var w = (self.cWidth/data.length) - padding;
	var dimensions = [w, 30]; // width, height
	

	var legend = d3.select(self.container)
		          	.append("svg")
		          	.attr("class", "legend")
		          	.attr("width", self.cWidth)
		          	.attr("height", 70)
		          	.append("g")
		          	.attr("class", "legend-group");
		          	
		legend.selectAll('rect')
			.data(data)
			.enter().append('rect')
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
			.attr('class', 'legend-text')
}



MakeBarChart.DrawBars = function(year){

	var self = this;

	var indicator;
	var race_obj;
	var yearIn_dataset = self.data[year];
	var sortedData = {}; // THIS data will be what create our bars

	for(var ind_name in yearIn_dataset){
		indicator_data = yearIn_dataset[ind_name];
		sortedData[ind_name] = [];
		for(var race in indicator_data){
			sortedData[ind_name].push(indicator_data[race]);
		}
	}
	var i = 0;
	for(var s in sortedData){

			var indicatorBars = d3.select(self.container)
						  .select('svg .container')
						  .append('g')
						  .attr("class", "indicatorBars")
						  .attr('transform',"translate(" + self.xScale(i*(self.barWidth)) + ",0)")
						

			i++;

			var data = sortedData[s]; // this makes up the bar

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
	}
}



MakeBarChart.getDataSetMax = function(year){
	/*Expects dataset YEAR*/
	var self = this;
	var max = 0;
	var indicator;
	var race_obj;
	var yearIn_dataset = self.data[year]; /*all this is doing is going into the dataset dictionary */

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
	var yearIn_dataset = self.data[year]; /*all this is doing is going into the dataset dictionary */

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
	var yearIn_dataset = self.data[year];
	var ordinalLabels = [];

	for(var ind in yearIn_dataset){
			ordinalLabels.push(ind);
	}

	return ordinalLabels;
}




MakeBarChart.DrawingBoard = function(){
	var self = this;
	 
	d3.select(self.container)

	          	.append("svg")
	          	.attr("class", "svg")
				.attr("height", self.cHeight + self.margin.top + self.margin.bottom)
				.attr("width", self.cWidth + self.margin.left + self.margin.right)

			    .append("g")
			    .attr("class", "container")
			    .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
				//.attr("viewBox", "0 0 " + self.cWidth + " " + (self.cHeight))
	    		//.attr("preserveAspectRatio", "xMidYMid slice");

}





//Setup, drawBars... are members of the object MakeBarChart. var self = this just refers to the object

/*ENTER();
.enter() — To create new, data-bound elements, you must use enter(). This method looks at the DOM, and then at the data being handed to it. If there are more data values than corresponding DOM elements, then enter() creates a new placeholder element on which you may work your magic. It then hands off a reference to this new placeholder to the next step in the chain.


/*VIEWBOX
viewBox If you think of the document as a canvas, the view box is part of the canvas you want the viewer to see. Even though the page may cover the entire computer screen, the figure may only exist in a third of the whole. */

/* SCROLLWIDTH & HEiGHT
.scrollWidth & .scrollHeight properties returns the total width & heigth of an element's contents, in pixels. In this case they should return the width and height assigned to the #chart DOM W=900 H=600.*/


 /*SCALES
 With linear scales, we are just letting D3 handle the math of the normalization process. The input value is normalized according to the domain, and then the normalized value is scaled to the output range.

-D3 scales are functions whose parameters you define. Once they are created, you call the scale function, pass it a data value, and it nicely returns a scaled output value. You can define and use as many scales as you like.

-A scale’s input domain is the range of possible input data values.

-A scale’s output range is the range of possible output values, commonly used as display values in pixel units. The output range is completely up to you, as the information designer. If you decide the shortest apple-bar will be 10 pixels tall, and the tallest will be 350 pixels tall, then you could set an output range of 10 and 350.

-A scale is a mathematical relationship, with no direct visual output.think of scales and axes as two different, yet related, elements.*/

