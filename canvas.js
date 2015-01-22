$(function() {
    var cnvs = document.getElementById("paintView");
  	var cntxt = cnvs.getContext("2d");
  	cntxt.canvas.width  = window.innerWidth - 30;
  	cntxt.canvas.height = window.innerHeight - 80; 

  	cntxt.fillStyle="#EFEFEF";
  	cntxt.fillRect(0, 0, cntxt.canvas.width, cntxt.canvas.height);

  	function clearCanvas() {
		ctx.clearRect ( 0 , 0 , ctx.canvas.width, ctx.canvas.height );
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
		color: "#282828",
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
				console.log("Drawing elem " + i);
				console.log(this.canvasStack[i].color);
				this.canvasStack[i].draw(cntxt);
			};
		}

	};

	var isDrawing = false;

	var drawing_startx = 0;
	var drawing_starty = 0;

	$("#paintView").mousedown(function (ev) {
		cntxt.strokeStyle = drawing.color;
		drawing_startx = ev.pageX - this.offsetLeft;
		drawing_starty = ev.pageY - this.offsetTop;
		isDrawing = true;
	});

	$("#paintView").mousemove(function (ev) {
		if(isDrawing === true) {
			console.log("mouse move");
			drawing.drawElements();
			var x = ev.pageX - this.offsetLeft;
			var y = ev.pageY - this.offsetTop;

			if(drawing.tool === "line") {
				lineHelper(x, y);
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
		}
	});

	function lineHelper(x, y) {
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

	var Rect = Shape.extend({
		constr: function(x, y, color) {
			this.base( x, y, color, "rect");
		},
		draw: function(cntxt) {

		}
	});



});



