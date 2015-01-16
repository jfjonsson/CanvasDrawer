$(function() {
    console.log( "ready!" );
    var cv = document.getElementById("paintView");
  	var ctx = cv.getContext("2d");
  	ctx.canvas.width  = window.innerWidth - 30;
  	ctx.canvas.height = window.innerHeight - 30; 

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
});
