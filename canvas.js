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

	window.addEventListener("keydown", function(ev) {
		if(ev.keyCode === 8 && document.activeElement !== 'text') {
        	ev.preventDefault();
        	drawing.deleteElement();
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

	$(".toolSelect").click( function (ev) {
		drawing.tool = this.getAttribute("data-toolType");
	});

	$(".saveCanvas").click( function(ev) {
		//TODO: save canvas
	});

	$(".loadCanvas").click( function(ev) {
		//TODO: load canvas
	});

	$(".undo").click( function( ev ) {
		drawing.undo();
	});

	$(".redo").click( function( ev ) {
		drawing.redo();
	});


	$(".colorSelect").click( function ( ev ) {
		drawing.color = this.getAttribute("data-toolColor");
	});
    console.log( "ready!" );

	var drawing = {
		canvasStack: [],
		canvasRedoStack: [],
		selectedId: null,
		color: "#282828",
		selectColor: "#A0A0A0",
		tool: "pen",
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
				console.log("erasing cords");
				this.selectElement(x, y);
				this.deleteElement();
			} else if(this.selectedId !== null) {
				console.log("erasing");
				this.canvasRedoStack.push(this.canvasStack[this.selectedId]);
				this.canvasStack.splice(this.selectedId, 1);
				selectedId = null;
				this.drawElements();
			} 
		}
	};

	var isDrawing = false;
	var isDragging = false;

	var drawing_startx = 0;
	var drawing_starty = 0;

	$("#paintView").mousedown(function (ev) {
		console.log("mouse down");
		drawing_startx = ev.pageX - this.offsetLeft;
		drawing_starty = ev.pageY - this.offsetTop;
		isDrawing = true;
		if(drawing.tool === "select") {
			drawing.selectElement(drawing_startx, drawing_starty);
		} else if (drawing.tool === "pen") {
			drawing.canvasStack.push(new Pen(drawing_startx, drawing_starty));
		} else if (drawing.tool === "erase") {
			drawing.deleteElement(drawing_startx, drawing_starty);
		}
	});

	$("#paintView").mousemove(function (ev) {
		if(isDrawing === true) {
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
				var xdev = x - drawing_startx,
				ydev = y - drawing_starty;
				drawing.moveElement(xdev, ydev);
				drawing_startx = ev.pageX - this.offsetLeft;
				drawing_starty = ev.pageY - this.offsetTop;
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
		isDrawing = false;

		if(drawing.tool === "line") {
			drawing.canvasStack.push(new Line(x, y));
		} else if(drawing.tool === "circle") {
			drawing.canvasStack.push(new Circle(x, y));
		} else if(drawing.tool === "rect") {
			drawing.canvasStack.push(new Rect(x, y));
		}
	});

	var Shape = Base.extend({
		constructor: function(x, y, color, type) {
			this.startx = drawing_startx;
			this.starty = drawing_starty;
			this.endx = x;
			this.endy = y;
			this.color = color;
			this.type = type;
			this.selected = false;
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
			this.base(x, y, drawing.color, "pen");
			this.cords = [];
			this.cords.push(new Point(x, y));
			this.xmx = 0;
			this.xmn = 100000;
			this.ymx = 0;
			this.ymn = 100000;
		},
		draw: function(cntxt) {
			cntxt.strokeStyle = this.color;
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
		drawing.drawElements();
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



