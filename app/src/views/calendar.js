/*** Calender Views ***/
/**
*/
// define this module in Require.JS
define(function(require, exports, module) {
	/*****Load Files****/
		var Engine = require("famous/core/Engine");
		var Surface = require("famous/core/Surface");
		var View = require('famous/core/View');
		var ImageSurface = require('famous/surfaces/ImageSurface');
		var ContainerSurface = require('famous/surfaces/ContainerSurface');
		var StateModifier = require('famous/modifiers/StateModifier');
		var Modifier = require('famous/core/Modifier');
		var Transform = require('famous/core/Transform');
		var Transitionable = require('famous/transitions/Transitionable');
		var EventHandler = require('famous/core/EventHandler');
		var HeaderFooterLayout = require("famous/views/HeaderFooterLayout");
		var GridLayout = require("famous/views/GridLayout");
		var FlexibleLayout = require("famous/views/FlexibleLayout");
		var Easing = require('famous/transitions/Easing');
		var Lightbox = require('famous/views/Lightbox');
		var RenderController = require('famous/views/RenderController');
		var Timer = require('famous/utilities/Timer');
	/****End Loading Files****/
	
	/**** init ****/
		var NOW= new Date();
		var MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
		var MONTHS_CN = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
		var DAYS_EN = ["Sunday","Monday","Tuseday","Wednesday","Thurseday","Friday","Saturday"];
		var DAYS_CN = ["日","一","二","三","四","五","六"];

		var HEIGHT = window.innerHeight;
		var WIDTH = window.innerWidth;
		var FONT_INDEX = Math.min(HEIGHT/20,WIDTH/10);

		var GLOBAL = {
			HEADER_HEIGHT : Math.min(80,HEIGHT/7),
			THEME_COLOR: "#627699",
			FONT_COLOR_WEEKEND: "rgba(0,0,0,0.8)",
			DAY_CAL_TAGS_HEIGHT:20,
			DAY_CAL_TITLE_HEIGHT:60,
			STYLE :{
				fontFamily:" '黑体' ,'Open Sans', sans-serif, 'Rome Time'",
				// backgroundColor:"black"
			},
			MARGIN : {
				MONTH_BOX : {
					TOP:10,
					LEFT:10,
					BOTTOM:10,
					RIGHT:10
				}
			},
			LIGHTBOX_OPTIONS:{
				inOpacity: 1,
				outOpacity: 0,
				inTransform: Transform.translate(320,0, 0),
  			outTransform: Transform.translate(-320, 0, 1),
				inTransition: { duration: 400, curve: Easing.easeIn },
				outTransition: { duration: 400, curve: Easing.easeOut }
			}
		}

		var STYLES = {
			"title":{
				textAlign:"center",
				lineHeight: GLOBAL.HEADER_HEIGHT+"px",
				fontSize:"25px",
				color:"white",
			},
			"imageSurface":{
				height:"100%",
				width:"100%",
				lineHeight:"99%"
			},
			"monthBox":{
				color:GLOBAL.THEME_COLOR,
				textAlign:"center",
			},

			"monthBoxBG":{
				borderBottom:"solid 1px "+ GLOBAL.THEME_COLOR,
			},
			"monthBoxBottom":{

			},
			'dateBox':{
				textAlign: "center",
				fontSize:FONT_INDEX/2+"px"
			},

			'headerBgSurface':{
				backgroundColor:GLOBAL.THEME_COLOR
			},
			'weekdayTag':{
				backgroundColor:GLOBAL.THEME_COLOR,
				color:"grey",
				lineHeight:GLOBAL.DAY_CAL_TAGS_HEIGHT+"px",
				fontSize:GLOBAL.DAY_CAL_TAGS_HEIGHT/3+"px",
				textAlign:"center"
			},
			"weekendTag":{
				backgroundColor:GLOBAL.THEME_COLOR,
				color:"white",
				lineHeight:GLOBAL.DAY_CAL_TAGS_HEIGHT+"px",
				fontSize:GLOBAL.DAY_CAL_TAGS_HEIGHT/3+"px",
				textAlign:"center"
			}
		};

		var MODIFIERS = {
			GLOBAL : new Modifier({}),
			CENTER : new Modifier({
				align: [0.5, 0.5],
				origin: [0.5, 0.5]
			}),
			BG : new Modifier({
				transform: Transform.behind
			})
		};
	/**** end init ****/

	/**** MAIN LAYOUT ****/

		function createCalendar(){
			main = new ContainerSurface({
				properties:GLOBAL.STYLE
			});
			var layout = new HeaderFooterLayout({
				headerSize:GLOBAL.HEADER_HEIGHT,
				footerSize:0
			});
			main.add(MODIFIERS.GLOBAL).add(layout);

			layout.header.add(createHeader());

			lightbox = new Lightbox(lightboxOptions);
			layout.content.add(lightbox);

			return main;
		}

			var main = new ContainerSurface({
				properties:GLOBAL.STYLE
			});
			var layout = new HeaderFooterLayout({
				headerSize:GLOBAL.HEADER_HEIGHT,
				footerSize:0
			});
			main.add(MODIFIERS.GLOBAL).add(layout);

			layout.header.add(createHeader());

			var renderController = new RenderController({
				inTransition: { duration: 0, curve: Easing.outBack },
				outTransition: { duration: 0, curve: Easing.easeOut }
			});
			layout.content.add(renderController);
			renderController.show(createMonthCal(NOW));

			// var lightbox = new Lightbox();
			// layout.content.add(lightbox);

			// //testing
			// lightbox.setOptions({				
			// 	inTransition: { duration: 0, curve: Easing.outBack },
			// 	outTransition: { duration: 0, curve: Easing.easeOut }
			// });
			// lightbox.show(createMonthCal(NOW));
			

	/**** END MAIN LAYOUT ****/

	function createHeader(){
		var headerView = new View();

		//header background
		var headerBgSurface = new Surface({
		properties:STYLES['headerBgSurface']
		});

		var headerBgModifier = new Modifier({
		// positions the background behind the tab surface
		transform: Transform.behind
		});
		headerView.add(headerBgModifier).add(headerBgSurface);

		//left button
		var leftButton = new ImageSurface({
		content:"Left Button",
		properties:STYLES['ImageSurface']
		});

		//@todo switch pages
		leftButton.on('click',function(){
		});

		var leftButtonModifier = new Modifier({
		});

		headerView.add(leftButtonModifier).add(leftButton);

		//middle title
		var title = new Surface({
			//@todo should be changed
			content: "出发日期",
			size:[undefined,GLOBAL.HEADER_HEIGHT],
			properties:STYLES['title']
		});

		var titleModifier = new Modifier({});
		headerView.add(titleModifier).add(title);


		return headerView;
	}

	function createMonthCal(timeStamp){
		var monthsLayout = new GridLayout({dimensions:[3,5]});
		var boxArray = [];

		//copy TEMP timestamp
		var boxWidth = WIDTH/3;
		var boxHeight = (HEIGHT - GLOBAL.HEADER_HEIGHT) / 5;

		var tempTimeStemp = new Date();	
		tempTimeStemp.setFullYear(timeStamp.getFullYear());
		tempTimeStemp.setMonth(timeStamp.getMonth());
		tempTimeStemp.setDate(timeStamp.getDate());

		var nextYear = timeStamp.getFullYear() + 1;


		for (var i = 0; i < 15; i++){
			var box = new ContainerSurface({
				properties:(i < 12) ? STYLES['monthBoxBG'] : {}
			});

				switch (i % 3){
					case 0:
						var boxBGModifier = new Modifier({
							size:[GLOBAL.MARGIN.MONTH_BOX.LEFT,boxHeight+5],
							origin:[0,0]
						});

						var boxBG = new Surface({
							properties:{backgroundColor:"white"}
						});

						box.add(MODIFIERS.BG).add(boxBGModifier).add(boxBG);

					break;
					case 2:
						var boxBGModifier = new Modifier({
							size:[GLOBAL.MARGIN.MONTH_BOX.RIGHT,boxHeight+5],
							origin:[1,0]
						});

						var boxBG = new Surface({
							properties:{backgroundColor:"white"}
						});

						box.add(MODIFIERS.BG).add(boxBGModifier).add(boxBG);
					break;
				}
			//add content
			var boxSize = Math.min(boxHeight - GLOBAL.MARGIN.MONTH_BOX.TOP, boxWidth - GLOBAL.MARGIN.MONTH_BOX.LEFT);
			STYLES['monthBox'].lineHeight = boxSize+"px";

			var boxInnerModifier = new Modifier({
				size:[boxSize,boxSize],
				origin:[0.5,0.5],
				align:[0.5,0.5]
			});

			if (i==0){
				var yearBoxStyle = _copy(STYLES['monthBox']);
				yearBoxStyle.fontSize = boxSize/3.2 + "px";
				yearBoxStyle.backgroundColor = "#a7b5cf";
				yearBoxStyle.color = "black";

				box.add(boxInnerModifier).
					add(new Surface({
						content: tempTimeStemp.getFullYear(),
						properties:yearBoxStyle
					}));

			}else if(tempTimeStemp.getFullYear() === nextYear) {
				var yearBoxStyle = _copy(STYLES['monthBox']);
				yearBoxStyle.fontSize = boxSize/3.2 + "px";
				yearBoxStyle.backgroundColor = "#a7b5cf";
				yearBoxStyle.color = "black";
				yearBoxStyle.fontWeight = "ligtht";

				box.add(boxInnerModifier).
					add(new Surface({
						content: nextYear,
						properties:yearBoxStyle
					}));

				nextYear = false;

			}else{
				//just a month
				var monthBoxStyle = _copy(STYLES['monthBox']);
				monthBoxStyle.fontSize = Math.min(25,boxSize/3)+"px";

				box.add(boxInnerModifier).
					add(new Surface({
						content: (tempTimeStemp.getMonth()+1)+"月",
						properties:monthBoxStyle
					}));

				//box's own property
				//@todo can be a bug
				box.timeStamp = new Date();
				box.timeStamp.setFullYear(tempTimeStemp.getFullYear());
				box.timeStamp.setMonth(tempTimeStemp.getMonth());
				box.timeStamp.setDate(tempTimeStemp.getDate());

				//increate the time
				tempTimeStemp.setMonth(tempTimeStemp.getMonth() + 1);

				//set event
				box.on("click",function(){
					// lightbox.setOptions(GLOBAL.LIGHTBOX_OPTIONS);
					// lightbox.show(createDayCal(this.timeStamp));

					renderController.setOptions({				
						inTransition: { duration: 300, curve: Easing.outBack },
						outTransition: { duration: 300, curve: Easing.easeOut }
					});
					renderController.show(createDayCal(this.timeStamp));
				});
			}

			boxArray.push(box);
		}
		monthsLayout.sequenceFrom(boxArray);

		return monthsLayout;
	}

	function createDayCal(timeStamp){
		var content = new ContainerSurface({
		});

		var contentModifier = new Modifier({});

		var layout = new FlexibleLayout({
			ratio:[1,1,12],
			direction:1
		});

		//first line
			var tagsGrid = new GridLayout({dimensions:[7,1]});
			var tagsArray = [];
			tagsGrid.sequenceFrom(tagsArray);
			for (var i = 0; i < 7; i++){
				var dayBox= new Surface({
					content: DAYS_CN[i],
					properties: (i % 6 === 0)? STYLES['weekdayTag']: STYLES['weekendTag']
				});

				tagsArray.push(dayBox);
			}

			var tagsModifier = new Modifier({
				size:[undefined,GLOBAL.DAY_CAL_TAGS_HEIGHT]
			});

		//second line
			var daysCalTitle = new Surface({
				content:timeStamp.getFullYear() + "年" + (timeStamp.getMonth() + 1) + "月",
				properties:{
					lineHeight:GLOBAL.DAY_CAL_TITLE_HEIGHT+"px",
					textAlign:"center",
					color:GLOBAL.THEME_COLOR
				}
			});

			var titleModifier = new Modifier({
				size:[WIDTH,GLOBAL.DAY_CAL_TITLE_HEIGHT],
				transform:Transform.translate(0,GLOBAL.DAY_CAL_TAG_HEIGHT,0)
			});
			 
		//main
			var daysGrid = new GridLayout({dimensions:[6,7]});
			var daysArray = [];
			daysGrid.sequenceFrom(daysArray);

			//get started
			var tempTimeStamp = new Date();//for temporary reasons
			tempTimeStamp.setMonth(timeStamp.getMonth(),1);
			tempTimeStamp.setFullYear(tempTimeStamp.getFullYear());
			var firstDayInMonthIndex = tempTimeStamp.getDay();

			tempTimeStamp.setMonth(timeStamp.getMonth()-1,31);
			var prevMonthDays = tempTimeStamp.getDate() == 31 ? 31 : 31-tempTimeStamp.getDate();

			for (var i = 0; i < 42; i++){

				tempTimeStamp.setMonth(timeStamp.getMonth()-1,prevMonthDays + i - firstDayInMonthIndex + 1);

				if (tempTimeStamp.getMonth()== timeStamp.getMonth()){
					//default will be a button within the month
					//set up css
					var box = new View();

					var boxSurface = new Surface({
					content: tempTimeStamp.getDate(),
					size: [undefined, undefined],
					properties: STYLES['dateBox']
					});

					var boxSM = new Modifier(MODIFIERS['center']);

					box.add(boxSM).add(boxSurface);

					//box's own property
					//@todo can be a bug
					box.timeStamp = new Date();
					box.timeStamp.setFullYear(tempTimeStamp.getFullYear());
					box.timeStamp.setMonth(tempTimeStamp.getMonth());
					box.timeStamp.setDate(tempTimeStamp.getDate());

					//set up defaults events
					box.on("click",function(){
						var returnTimeStamp = this.timeStamp;
						main._eventOutput.emit("pickDate",returnTimeStamp);
						alert(returnTimeStamp);
					});

				}else{
					var box = new Surface();
				}

				daysArray.push(box);
			}

			var daysGridModifier = new Modifier({
				size:[WIDTH,HEIGHT-GLOBAL.DAY_CAL_TITLE_HEIGHT-GLOBAL.DAY_CAL_TAGS_HEIGHT],
				transform:Transform.translate(0,GLOBAL.DAY_CAL_TITLE_HEIGHT+GLOBAL.DAY_CAL_TAGS_HEIGHT,0)
			});

		content.add(tagsModifier).add(tagsGrid);
		content.add(titleModifier).add(daysCalTitle);
		content.add(daysGridModifier).add(daysGrid);

		return content;
	}

	function _copy(obj){
		var ret = {};
		for (x in obj){
			ret[x] = obj[x];
		}
		return ret;
	}

	//for test
	module.exports = main;
	//	module.exports = function(commander){
	// 	 commander.on("ENTER",function(data){
			// lightbox.show(createMonthCal(NOW));
	// 	 });

	// 	 return createCalendar;

	// };

});