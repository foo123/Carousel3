var Carousel=function(rad,images,w,h)
{
    THREE.Object3D.call(this);
	this.images=images;
	this.rad=rad;
	this.howMany=0;
	this.reflectionOpacity=0.2;
	this.reflectionHeightPer=0.4;
	this.imgs=[];
	var thiss=this;
	this.w=w;
	this.h=h;
	for (var i=0;i<this.images.length;i++)
	{
		this.imgs[i]=new Image();
		this.imgs[i].onload=function(){thiss.buildCarousel(thiss);};
		this.imgs[i].src=this.images[i].url;
	}
	this.anglePer=2*Math.PI/this.images.length;
}
// Carousel is subclass of Object3D
Carousel.prototype=new THREE.Object3D;
Carousel.prototype.constructor=Carousel;
Carousel.prototype.buildCarousel=function(scope)
{
	scope.howMany++;
	if (scope.howMany==scope.images.length)
	{
		for (var i=0; i<scope.images.length;i++)
		{
			// text caption
			var size=(0.4)*(scope.w/scope.images[i].url.length);
			var height=2;
			var text3d = new THREE.TextGeometry( scope.images[i].url,{size: size, height: height, curveSegments: 2, font:'helvetiker'});
			var textMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, overdraw: true } );
			var text = new THREE.Mesh( text3d, textMaterial );
			text.doubleSided = false;
			var textcontainer=new THREE.Object3D();
			textcontainer.add(text);
			
			// image plane
			var texture=new THREE.Texture(scope.imgs[i]); //THREE.ImageUtils.loadTexture(scope.images[i].url);
			var plane = new THREE.Mesh( new THREE.PlaneGeometry( scope.w, scope.h, 3, 3 ), new THREE.MeshBasicMaterial( { map: texture, overdraw: true } ) );
			var aa=i*scope.anglePer;
			plane.rotation.y = -aa-Math.PI/2;
			plane.position = new THREE.Vector3( scope.rad*Math.cos(aa),0,scope.rad*Math.sin(aa) );
			plane.doubleSided = true;
			plane.carouselAngle=aa;//plane.rotation.y;
			plane.scale.x=-1;
			
			textcontainer.position.x=plane.position.x;
			textcontainer.position.y=plane.position.y-size-0.5*scope.h-5;
			textcontainer.position.z=plane.position.z;
			textcontainer.rotation.y=plane.rotation.y;
			text.scale.x=plane.scale.x;
			text.position.x=scope.w*0.5;
			
			// reflection
			/*
There are different ways for creating reflections. One possible approach is to add another copy of the object turned upside-down and place semi-transparent plane between these two copies:
http://mrdoob.github.com/three.js/examples/webgl_geometry_text.html
			*/
			var canvas = document.createElement( 'canvas' );
			canvas.width = scope.w;
			canvas.height = scope.reflectionHeightPer*scope.h;

			var cntx = canvas.getContext( '2d' );
			cntx.save();
			cntx.globalAlpha=scope.reflectionOpacity;
			cntx.translate(0, scope.h-1);
			cntx.scale(1, -1);				
			cntx.drawImage(scope.imgs[i], 0, 0, scope.w, scope.h /*,0,0,scope.w, scope.reflectionHeightPer*scope.h*/);				
			cntx.restore();
			cntx.globalCompositeOperation = "destination-out";
			var gradient = cntx.createLinearGradient(0, 0, 0, scope.reflectionHeightPer*scope.h);
			//gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
			gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
			//gradient.addColorStop(0, "rgba(255, 255, 255, " + (scope.reflectionOpacity) + ")");
			gradient.addColorStop(0, "rgba(255, 255, 255, 0.0)");
			cntx.fillStyle = gradient;
			cntx.fillRect(0, 0, scope.w, 2*scope.reflectionHeightPer*scope.h);				
			
			var texture2 = new THREE.Texture( canvas );
			texture2.needsUpdate = true;

			var material = new THREE.MeshBasicMaterial( { map: texture2, transparent: true } );
			var reflectionplane = new THREE.Mesh( new THREE.PlaneGeometry( scope.w,  scope.reflectionHeightPer*scope.h, 3, 3 ), material );
			reflectionplane.rotation.y = -aa-Math.PI/2;
			reflectionplane.position = new THREE.Vector3( this.rad*Math.cos(aa),0,this.rad*Math.sin(aa) );
			reflectionplane.doubleSided = true;
			reflectionplane.carouselAngle=aa;
			reflectionplane.scale.x=-1;
			reflectionplane.position.y=textcontainer.position.y-10-3*size;
			
			this.add( plane );
			this.add( reflectionplane );
			this.add( textcontainer );
		}
	}
};
