$(function() {
    var cnvs = document.getElementById("paintView");
  	var cntxt = cnvs.getContext("2d");
  	cntxt.canvas.width  = window.innerWidth - 30;
  	cntxt.canvas.height = window.innerHeight - 80; 

  	cntxt.fillStyle="#EFEFEF";
  	cntxt.fillRect(0, 0, cntxt.canvas.width, cntxt.canvas.height);
  	cntxt.lineWidth = 4;

  	function clearCanvas() {
		cntxt.clearRect ( 0 , 0 , cntxt.canvas.width, cntxt.canvas.height );
		cntxt.fillRect(0, 0, cntxt.canvas.width, cntxt.canvas.height);
	}
	$(".navbar-brand").click(function() {
		location.reload();
	});

	$(".newCanvas").click( function( event ) {
		console.log("clearing");
		clearCanvas();
	});


	$(".toolSelect").click( function ( event ) {
		drawing.tool = this.getAttribute("data-toolType");
	});

	$(".saveCanvas").click( function( event ) {
		//TODO: save current canvas
	});

	$(".undo").click( function( event ) {
		drawing.undo();
	});

	$(".redo").click( function( event ) {
		drawing.redo();
	});


	$(".colorSelect").click( function ( event ) {
		drawing.color = this.getAttribute("data-toolColor");
	});
    console.log( "ready!" );

	var drawing = {
		canvasStack: [],
		canvasRedoStack: [],
		selectedId: null,
		color: "#282828",
		tool: "circle",
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
		drawElements: function() {
			clearCanvas();
			for (var i = 0; i < this.canvasStack.length; ++i) {
				//console.log("Drawing elem " + i);
				//console.log(this.canvasStack[i].color);
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
		}

	};

	var isDrawing = false;
	var isDragging = false;

	var drawing_startx = 0;
	var drawing_starty = 0;

	$("#paintView").mousedown(function (ev) {
		drawing_startx = ev.pageX - this.offsetLeft;
		drawing_starty = ev.pageY - this.offsetTop;
		isDrawing = true;
		if(drawing.tool === "select") {
			if(drawing.selectedId === null) {
				drawing.selectElement(drawing_startx, drawing_starty);
			} 
		}
	});

	$("#paintView").mousemove(function (ev) {
		if(isDrawing === true) {
			console.log("mouse move");
			drawing.drawElements();
			var x = ev.pageX - this.offsetLeft;
			var y = ev.pageY - this.offsetTop;

			if(drawing.tool === "line") {
				lineHelper(x, y);
			} else if(drawing.tool === "circle") {
				circleHelper(x, y);
			} else if(drawing.tool === "rect") {
				rectHelper(x, y);
			} else if(drawing.tool === "select" && drawing.selectedId != null) {
				selectHelper(x, y);
				drawing_startx = ev.pageX - this.offsetLeft;
				drawing_starty = ev.pageY - this.offsetTop;
			}
		}
	});

	$("#paintView").mouseup(function (ev) {
		console.log("mouse up");
		var x = ev.pageX - this.offsetLeft;
		var y = ev.pageY - this.offsetTop;
		isDrawing = false;

		if(drawing.tool === "line") {
			var newLine = new Line(x, y);
			drawing.canvasStack.push(newLine);
		} else if(drawing.tool === "circle") {
			var newCircle = new Circle(x, y);
			drawing.canvasStack.push(newCircle);
		} else if(drawing.tool === "rect") {
			var newRect = new Rect(x, y);
			drawing.canvasStack.push(newRect);
		} else if(drawing.tool === "select") {
			drawing.selectedId = null;
		}
	});

	function selectHelper(x, y) {
		var xdev = x - drawing_startx;
		var ydev = y - drawing_starty;
		console.log(drawing.selectedId);
		drawing.canvasStack[drawing.selectedId].startx += xdev;
		drawing.canvasStack[drawing.selectedId].starty += ydev;
		drawing.canvasStack[drawing.selectedId].endx += xdev;
		drawing.canvasStack[drawing.selectedId].endy += ydev;
	}

	var Shape = Base.extend({
		constructor: function(x, y, color, type) {
			this.startx = drawing_startx;
			this.starty = drawing_starty;
			this.endx = x;
			this.endy = y;
			this.color = color;
			this.type = type;
			this.selected = false;
			this.lineCords = [];
		},
		atPoint: function(x, y) {
			if(this.type === "circle") {
				var dx = (this.endx - this.startx),
				dy = (this.endy - this.starty),
				radius = Math.sqrt(dx * dx + dy * dy),
				xmn = this.startx - radius - 10,
				xmx = this.startx + radius + 10,
				ymn = this.starty - radius - 10,
				ymx = this.starty + radius + 10;
			} else {
				var xmn = Math.min(this.startx, this.endx) - 10,
				xmx = Math.max(this.startx, this.endx) + 10,
				ymn = Math.min(this.starty, this.endy) - 10,
				ymx = Math.max(this.starty, this.endy) + 10;
			}
			return (x >= xmn) && (x <= xmx) 
			&& (y >= ymn) && (y <= ymx);
		},
		drawSelect: function() {
			cntxt.strokeStyle = "#FF0000";
			cntxt.beginPath();
			if(this.type === "circle") {
				var dx = (this.endx - this.startx),
				dy = (this.endy - this.starty),
				radius = Math.sqrt(dx * dx + dy * dy);
				cntxt.rect(this.startx - radius - 10, this.starty - radius - 10, radius * 2 + 20, radius * 2 + 20);
			} else {
				cntxt.rect(this.startx - 10, this.starty - 10, 
				this.endx - this.startx + 20, this.endy - this.starty + 20);
			}
			cntxt.stroke();
		}
	});

	function penHelper(x, y) {

	}

	var Pen = Shape.extend({
		constructor: function() {

		},
		draw: function(cntxt) {

		}
	});

	function lineHelper(x, y) {
		cntxt.strokeStyle = drawing.color;
		cntxt.beginPath();
		cntxt.moveTo(drawing_startx, drawing_starty);
		cntxt.lineTo(x, y);
		cntxt.stroke();
	}

	var Line = Shape.extend({
		constructor: function(x, y) {
			console.log("Creating Line, x: " + x + ", y: " + y + ", color: " + drawing.color);
			this.base( x, y, drawing.color, "line");
		},
		draw: function(cntxt) {
			cntxt.strokeStyle = this.color;
			cntxt.beginPath();
			cntxt.moveTo(this.startx, this.starty);
			cntxt.lineTo(this.endx, this.endy);
			cntxt.stroke();

		}
	});

	function circleHelper(x, y){
		cntxt.strokeStyle = drawing.color;
		cntxt.beginPath();
		var dx = Math.abs(drawing_startx - x);
		var dy = Math.abs(drawing_starty - y);
		var radius = Math.sqrt(dx * dx + dy * dy);
		cntxt.arc(drawing_startx, drawing_starty,
			radius, 0, 2 * Math.PI, false);
		cntxt.stroke();
	}

	var Circle = Shape.extend({
		constructor: function(x, y) {
			console.log("Creating Circle, x: " + x + ", y: " + y + ", color: " + drawing.color);
			this.base( x, y, drawing.color, "circle");
		},
		draw: function(cntxt) {
			cntxt.strokeStyle = this.color;
			cntxt.beginPath();
			var dx = Math.abs(this.startx - this.endx);
			var dy = Math.abs(this.starty - this.endy);
			var radius = Math.sqrt(dx * dx + dy * dy);
			cntxt.arc(this.startx, this.starty, radius, 0, 2 * Math.PI, false);
			cntxt.stroke();
		}
	});

	function rectHelper(x, y){
		cntxt.strokeStyle = drawing.color;
		cntxt.beginPath();
		cntxt.rect(drawing_startx, drawing_starty, 
			x - drawing_startx, y - drawing_starty);
		cntxt.stroke();
	}

	var Rect = Shape.extend({
		constructor: function(x, y, color) {
			this.base( x, y, drawing.color, "rect");
		},
		draw: function(cntxt) {
			cntxt.strokeStyle = this.color;
			cntxt.beginPath();
			cntxt.rect(this.startx, this.starty, this.endx - this.startx, this.endy - this.starty);
			cntxt.stroke();
		}
	});



});



