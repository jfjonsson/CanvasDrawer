$(document).ready(function() {
	//Load list of possible canvasessss
	drawing.loadList();
});


var cnvs = document.getElementById("paintView");
	var cntxt = cnvs.getContext("2d");
	cntxt.canvas.width  = window.innerWidth - 30;
	cntxt.canvas.height = window.innerHeight - 80; 

	cntxt.fillStyle="#EFEFEF";
	cntxt.fillRect(0, 0, cntxt.canvas.width, cntxt.canvas.height);

$(".navbar-brand").click(function() {
	location.reload();
});

$(".newCanvas").click( function( event ) {
	drawing.clearDrawing();
	drawing.canvasStack.length = 0;
	drawing.canvasRedoStack.length = 0;
});

window.addEventListener("keydown", function(ev) {
	if(ev.keyCode === 8 && document.activeElement.type !== 'text') {
    	ev.preventDefault();
    	drawing.deleteElement();
	} else if((ev.keyCode == 13 || ev.keyCode == 27) && drawing.tool === "text") {
		drawing.placeText();
	} else if (ev.keyCode === 38) {
		//UP arrow
		drawing.moveElement(0, -10);
	} else if (ev.keyCode === 40) {
		//DOWN arrow
		drawing.moveElement(0, 10);
	} else if (ev.keyCode === 37) {
		//LEFT arrow
		drawing.moveElement(-10, 0);
	} else if (ev.keyCode === 39) {
		//RIGHT arrow
		drawing.moveElement(10, 0);
	}
});

function error(msg) {
	$("#errorMsg").text(msg);
	$(".alert-danger").removeClass("hidden");
}

var _global = {
	isDrawing: false,
	drawing_startx: 0,
	drawing_starty: 0	
};

$("#paintView").mousedown(function (ev) {
	console.log("mouse down");
	_global.drawing_startx = ev.pageX - this.offsetLeft;
	_global.drawing_starty = ev.pageY - this.offsetTop;
	if(drawing.tool === "select") {
		drawing.selectElement(_global.drawing_startx, _global.drawing_starty);
	} else if (drawing.tool === "pen") {
		drawing.canvasStack.push(new Pen(_global.drawing_startx, _global.drawing_starty));
	} else if (drawing.tool === "erase") {
		drawing.deleteElement(_global.drawing_startx, _global.drawing_starty);
	} else if (drawing.tool === "text" && _global.isDrawing !== true) {
		$("#textTool").removeClass("hidden");
		setTimeout(function(){$("#textBox").eq(0).focus();}, 500);
	}
	_global.isDrawing = true;
});

$("#paintView").mousemove(function (ev) {
	if(_global.isDrawing === true) {
		console.log("mouse move");
		var x = ev.pageX - this.offsetLeft,
		    y = ev.pageY - this.offsetTop;

		if(drawing.tool === "line") {
			lineHelper(x, y);
		} else if(drawing.tool === "circle") {
			circleHelper(x, y);
		} else if(drawing.tool === "rect") {
			rectHelper(x, y);
		} else if(drawing.tool === "select" && drawing.selectedId !== null) {
			var xdev = x - _global.drawing_startx,
			ydev = y - _global.drawing_starty;
			drawing.moveElement(xdev, ydev);
			_global.drawing_startx = ev.pageX - this.offsetLeft;
			_global.drawing_starty = ev.pageY - this.offsetTop;
		} else if(drawing.tool === "pen") {
			drawing.canvasStack[drawing.canvasStack.length - 1].addCords(x, y);
		} else if (drawing.tool === "erase") {
			drawing.deleteElement(x, y);
		}
	}
});

$("#paintView").mouseup(function (ev) {
	console.log("mouse up");
	var x = ev.pageX - this.offsetLeft;
	var y = ev.pageY - this.offsetTop;
	_global.isDrawing = false;

	if(drawing.tool === "line") {
		drawing.canvasStack.push(new Line(x, y));
	} else if(drawing.tool === "circle") {
		drawing.canvasStack.push(new Circle(x, y));
	} else if(drawing.tool === "rect") {
		drawing.canvasStack.push(new Rect(x, y));
	}
});

var Shape = Base.extend({
	constructor: function(x, y, color, type, toolWidth) {
		this.startx = _global.drawing_startx;
		this.starty = _global.drawing_starty;
		this.endx = x;
		this.endy = y;
		this.color = color;
		this.type = type;
		this.selected = false;
		this.width = toolWidth;
	},
	atPoint: function(x, y) {
		var xmn = Math.min(this.startx, this.endx) - 10,
		xmx = Math.max(this.startx, this.endx) + 10,
		ymn = Math.min(this.starty, this.endy) - 10,
		ymx = Math.max(this.starty, this.endy) + 10;
		return (x >= xmn) && (x <= xmx) 
		&& (y >= ymn) && (y <= ymx);
	},
	drawSelect: function() {
		cntxt.strokeStyle = drawing.selectColor;
		cntxt.beginPath();
		cntxt.rect(this.startx - 10, this.starty - 10, 
		this.endx - this.startx + 20, this.endy - this.starty + 20);
		cntxt.stroke();
	},
	moveSelected: function(x, y) {
		this.startx += x;
		this.starty += y;
		this.endx += x;
		this.endy += y;
	}
});


var Point = Base.extend({
	constructor: function(x, y) {
		this.x = x;
		this.y = y;
	}
});

var Pen = Shape.extend({
	constructor: function(x, y) {
		this.base(x, y, drawing.color, "pen", drawing.toolWidth);
		this.cords = [];
		this.cords.push(new Point(x, y));
		this.xmx = 0;
		this.xmn = 100000;
		this.ymx = 0;
		this.ymn = 100000;
	},
	draw: function(cntxt) {
		cntxt.strokeStyle = this.color;
		cntxt.lineWidth = this.width;
		cntxt.beginPath();
		cntxt.moveTo(this.cords[0].x, this.cords[0].y);
		for (var i = 1; i < this.cords.length; i++) {
				cntxt.lineTo(this.cords[i].x, this.cords[i].y);
		}
		cntxt.stroke();
	},
	drawSelect: function() {
		cntxt.strokeStyle = drawing.selectColor;
		cntxt.beginPath();
		cntxt.rect(this.xmn - 10, this.ymn - 10, 
			this.xmx - this.xmn + 20, this.ymx - this.ymn + 20);
		cntxt.stroke();
	},
	atPoint: function(x, y) {
		return (x >= this.xmn) && (x <= this.xmx) 
		&& (y >= this.ymn) && (y <= this.ymx);
	},
	addCords: function(x, y) {
		this.cords.push(new Point(x, y));
		drawing.drawElements();
		if(x + 10 > this.xmx) {
			this.xmx = x + 10;
		}
		if(x - 10 < this.xmn) {
			this.xmn = x - 10;
		}
		if(y + 10 > this.ymx) {
			this.ymx = y + 10;
		}
		if(y - 10 < this.ymn) {
			this.ymn = y - 10;
		}
	},
	moveSelected: function(x, y) {
		for (var i = 0; i < this.cords.length; i++) {
			this.cords[i].x += x;
			this.cords[i].y += y;
		};
		this.xmx += x;
		this.xmn += x;
		this.ymx += y;
		this.ymn += y;
	}
});

function lineHelper(x, y) {
	drawing.drawElements();
	cntxt.strokeStyle = drawing.color;
	cntxt.lineWidth = drawing.toolWidth;
	cntxt.beginPath();
	cntxt.moveTo(_global.drawing_startx, _global.drawing_starty);
	cntxt.lineTo(x, y);
	cntxt.stroke();
}

var Line = Shape.extend({
	constructor: function(x, y) {
		this.base( x, y, drawing.color, "line", drawing.toolWidth);
	},
	draw: function(cntxt) {
		cntxt.strokeStyle = this.color;
		cntxt.lineWidth = this.width;
		cntxt.beginPath();
		cntxt.moveTo(this.startx, this.starty);
		cntxt.lineTo(this.endx, this.endy);
		cntxt.stroke();
	}
});

function circleHelper(x, y){
	drawing.drawElements();
	cntxt.strokeStyle = drawing.color;
	cntxt.lineWidth = drawing.toolWidth;
	cntxt.beginPath();
	var dx = Math.abs(_global.drawing_startx - x);
	var dy = Math.abs(_global.drawing_starty - y);
	var radius = Math.sqrt(dx * dx + dy * dy);
	cntxt.arc(_global.drawing_startx, _global.drawing_starty,
		radius, 0, 2 * Math.PI, false);
	cntxt.stroke();
}

var Circle = Shape.extend({
	constructor: function(x, y) {
		this.base( x, y, drawing.color, "circle", drawing.toolWidth);
	},
	draw: function(cntxt) {
		cntxt.strokeStyle = this.color;
		cntxt.lineWidth = this.width;
		cntxt.beginPath();
		var dx = Math.abs(this.startx - this.endx);
		var dy = Math.abs(this.starty - this.endy);
		var radius = Math.sqrt(dx * dx + dy * dy);
		cntxt.arc(this.startx, this.starty, radius, 0, 2 * Math.PI, false);
		cntxt.stroke();
	},
	drawSelect: function() {
		cntxt.strokeStyle = drawing.selectColor;
		cntxt.beginPath();
		var dx = (this.endx - this.startx),
		dy = (this.endy - this.starty),
		radius = Math.sqrt(dx * dx + dy * dy);
		cntxt.rect(this.startx - radius - 10, this.starty - radius - 10, radius * 2 + 20, radius * 2 + 20);
		cntxt.stroke();
	},
	atPoint: function(x, y) {
		var dx = (this.endx - this.startx),
			dy = (this.endy - this.starty),
			radius = Math.sqrt(dx * dx + dy * dy),
			xmn = this.startx - radius - 10,
			xmx = this.startx + radius + 10,
			ymn = this.starty - radius - 10,
			ymx = this.starty + radius + 10;
		return (x >= xmn) && (x <= xmx) && (y >= ymn) && (y <= ymx);
	}
});

function rectHelper(x, y){
	drawing.drawElements();
	cntxt.strokeStyle = drawing.color;
	cntxt.lineWidth = drawing.toolWidth;
	cntxt.beginPath();
	cntxt.rect(_global.drawing_startx, _global.drawing_starty, 
		x - _global.drawing_startx, y - _global.drawing_starty);
	cntxt.stroke();
}

var Rect = Shape.extend({
	constructor: function(x, y) {
		this.base( x, y, drawing.color, "rect", drawing.toolWidth);
	},
	draw: function(cntxt) {
		cntxt.strokeStyle = this.color;
		cntxt.lineWidth = this.width;
		cntxt.beginPath();
		cntxt.rect(this.startx, this.starty, this.endx - this.startx, this.endy - this.starty);
		cntxt.stroke();
	}
});

var Text = Shape.extend({
	constructor: function(x, y, textString) {
		this.base(x, y, drawing.color, "text", drawing.toolWidth);
		this.font = drawing.font;
		this.textString = textString;
	},
	draw: function(cntxt) {
		cntxt.fillStyle = this.color;
		cntxt.font = this.font;
		cntxt.fillText(this.textString, this.startx, this.starty);
	},
	atPoint: function(x, y) {
		return (x >= this.startx - 10) && (x <= this.startx + (this.textString.length * 15)) 
		&& (y >= this.starty - 40) && (y <= this.starty + 10);
	},
	drawSelect: function() {
		// NO select square drawn on string 
	}
});


$(".toolSelect").click( function (ev) {
	drawing.tool = this.getAttribute("data-toolType");
});

$(".colorSelect").click( function (ev) {
	drawing.color = this.getAttribute("data-toolColor");
});

$(".widthSelect").click( function(ev) {
	drawing.toolWidth = this.getAttribute("data-lineWidth");
});

$(".fontSelect").click( function(ev) {
	drawing.font = this.getAttribute("data-fontType");
});

$(".save").click( function(ev) {
	$("#canvasInfo").removeClass("hidden");
	setTimeout(function(){$("#canvasTitle").eq(0).focus();}, 500);
});

$("#saveCanvas").click( function(ev) {
	var title = $("#canvasTitle").val();
	if(title !== "") {
		drawing.save(title);
	} else {
		error("Canvas missing a title!");
	}
});

$(".undo").click( function(ev) {
	drawing.undo();
});

$(".redo").click( function(ev) {
	drawing.redo();
});

$("#placeText").click( function(ev) {
	drawing.placeText();
});

function loadCanvas(id) {
	drawing.loadID(id);
};

var drawing = {
	canvasStack: [],
	canvasRedoStack: [],
	selectedId: null,
	color: "#282828",
	selectColor: "#A0A0A0",
	tool: "pen",
	font: "30px Helvetica",
	toolWidth: 4,
	undo: function() {
		if(this.canvasStack.length > 0) {
			this.canvasRedoStack.push(this.canvasStack.pop());
			this.drawElements();
		}
	},
	redo: function() {
		if(this.canvasRedoStack.length > 0) {
			this.canvasStack.push(this.canvasRedoStack.pop());
			this.drawElements();
		}
	},
	save: function(title) {

		var stringifiedArray = JSON.stringify(this.canvasStack);

		var param = { "user": "jonj13", // You should use your own username!
			"name": title,
			"content": stringifiedArray,
			"template": true
		};

		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			url: "http://whiteboard.apphb.com/Home/Save",
			data: param,
			dataType: "jsonp",
			crossDomain: true,
			success: function (data) {
				$("#canvasId").text(data.ID);
				$(".alert-success").removeClass("hidden");
				$("#canvasTitle").val("");
				$("#canvasInfo").addClass("hidden");
			},
			error: function (xhr, err) {
				error("Too many canvas elements! (Pen to blame)");
				console.log("Shit went south!");
				$("#canvasTitle").val("");
				$("#canvasInfo").addClass("hidden");
			}
		});
	},
	loadList: function() {

		var param = {
			"user" : "jonj13",
			"template" : true
		};

		$.ajax({
			type: "GET",
			url: "http://whiteboard.apphb.com/Home/GetList",
			data: param,
			dataType: "jsonp",
			crossDomain: true,
			success: function (data) {
				for(var i = 0; i < data.length; i++) {
					$(".loadList").append('<li><a href="#" onclick="loadCanvas(' + data[i].ID + ')">' + data[i].WhiteboardTitle + '</a></li>');
				}
			},
			error: function (xhr, err) {
				console.log("Shit went north!");
			}
		});
	},
	loadID: function(id) {
		var param = {
			"id" : id
		};

		drawing.clearDrawing();
		drawing.canvasStack.length = 0;
		drawing.canvasRedoStack.length = 0;

		$.ajax({
			type: "GET",
			url: "http://whiteboard.apphb.com/Home/GetWhiteboard",
			data: param,
			dataType: "jsonp",
			crossDomain: true,
			success: function(data) {
				$(jQuery.parseJSON(data.WhiteboardContents)).each(function() {  
    				if(this.type === "pen") {
    					var newPen = this;
    					newPen.__proto__ = new Pen;
    					drawing.canvasStack.push(newPen);
    				} else if(this.type === "circle") {
    					var newCircle = this;
    					newCircle.__proto__ = new Circle;
    					drawing.canvasStack.push(newCircle);
    				} else if(this.type === "rect") {
    					var newRect = this;
    					newRect.__proto__ = new Rect;
    					drawing.canvasStack.push(newRect);
    				} else if(this.type === "text") {
    					var newText = this;
    					newText.__proto__ = new Text;
    					drawing.canvasStack.push(newText);
    				} else if(this.type === "line") {
    					var newLine = this;
    					newLine.__proto__ = new Line;
    					drawing.canvasStack.push(newLine);
    				}
				});
				drawing.drawElements();
			},
			error: function(xhr, err) {
				console.log("Shit went east!")
			}
		});
	},
	drawElements: function() {
		this.clearDrawing();
		for (var i = 0; i < this.canvasStack.length; ++i) {
			this.canvasStack[i].draw(cntxt);
		};
	},
	selectElement: function(x, y) {
		this.drawElements();
		for (var i = this.canvasStack.length - 1; i >= 0; i--) {
			if(this.canvasStack[i].atPoint(x, y)) {
				this.canvasStack[i].selected = true;
				this.canvasStack[i].drawSelect();
				this.selectedId = i;
				return;
			}
		};
		this.selectedId = null;
	},
	moveElement: function(x, y) {
		if(this.selectedId !== null) {
			this.canvasStack[this.selectedId].moveSelected(x, y);
			this.drawElements();
		}
	},
	deleteElement: function(x, y) {
		if (x !== undefined && y !== undefined){
			this.selectElement(x, y);
			this.deleteElement();
		} else if(this.selectedId !== null) {
			this.canvasRedoStack.push(this.canvasStack[this.selectedId]);
			this.canvasStack.splice(this.selectedId, 1);
			selectedId = null;
			this.drawElements();
		} 
	},
	clearDrawing: function() {
		cntxt.fillStyle="#EFEFEF";
		cntxt.clearRect ( 0 , 0 , cntxt.canvas.width, cntxt.canvas.height );
		cntxt.fillRect(0, 0, cntxt.canvas.width, cntxt.canvas.height);
	},
	placeText: function() {
		var textString = $("#textBox").val();
		this.canvasStack.push(new Text(_global.drawing_startx, _global.drawing_starty, textString));
		$("#textTool").addClass("hidden");
		$("#textBox").val("");
		this.drawElements();
		this.tool = "select";
	}
};

