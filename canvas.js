$(function() {
    console.log( "ready!" );
    var cv = document.getElementById("paintView");
  	var ctx = cv.getContext("2d");
  	ctx.canvas.width  = window.innerWidth - 30;
  	ctx.canvas.height = window.innerHeight - 30; 

  	var mouse = {x: 0, y: 0};
	var last_mouse = {x: 0, y: 0};

  	ctx.fillStyle="#EFEFEF";
  	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  	function clearCanvas() {
		ctx.clearRect ( 0 , 0 , ctx.canvas.width, ctx.canvas.height );
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	} 

	$(".newCanvas").click( function( event ) {
		console.log("clearing");
		clearCanvas();
	});


	$(".toolSelect").click( function ( event ) {
		console.log("Clicked " + this.innerHTML);
	});


	$(".colorSelect").click( function ( event ) {
		console.log("Clicked " + this.innerHTML);
	});

	cv.addEventListener('mousemove', function(e) {
		last_mouse.x = mouse.x;
		last_mouse.y = mouse.y;
		
		mouse.x = e.pageX - this.offsetLeft;
		mouse.y = e.pageY - this.offsetTop;
	}, false);

	ctx.lineWidth = 5;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	
	cv.addEventListener('mousedown', function(e) {
		cv.addEventListener('mousemove', onPaint, false);
	}, false);
	
	cv.addEventListener('mouseup', function() {
		cv.removeEventListener('mousemove', onPaint, false);
	}, false);
	
	var onPaint = function() {
		ctx.beginPath();
		ctx.moveTo(last_mouse.x, last_mouse.y);
		ctx.lineTo(mouse.x, mouse.y);
		ctx.closePath();
		ctx.stroke();
	};
});
