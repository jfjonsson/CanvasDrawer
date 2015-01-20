$(function() {
    var cv = document.getElementById("paintView");
  	var ctx = cv.getContext("2d");
  	ctx.canvas.width  = window.innerWidth - 30;
  	ctx.canvas.height = window.innerHeight - 80; 

  	ctx.fillStyle="#EFEFEF";
  	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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


	$(".colorSelect").click( function ( event ) {
		drawing.color = this.getAttribute("data-toolColor");
	});
    console.log( "ready!" );

	var drawing = {
		canvasElements: [],
		color: "#282828",
		tool: "pen",
		drawElements: function() {
			for (var i = 0; i < canvasElements.length; ++i) {
				canvasElements[i].draw(/* TODO parameters */);
			};
		}

	};


	function rect() {
		this.draw = function draw() {
		
		}
	}

	function circle() {
		this.draw = function draw() {

		}
	}

	function line () {
		this.draw = function draw() {
		
		}
	}

	function text () {
		this.draw = function draw() {
		
		}
	}

	function pen () {
		this.draw = function draw() {
		
		}
	}

	function erase () {
		this.draw = function draw() {
		
		}
	}
});