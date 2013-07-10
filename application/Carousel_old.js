(function(window){

    /*
    *
    * 3D Carousel using Three.js and Tween.js
    *
    * @author: Nikos M. http://nikos-web-development.netai.net/
    * 
    * https://github.com/foo123/Carousel3
    *
    */

    // local references
    var THREE=window.THREE, TWEEN=window.TWEEN;
    
    var self=function(radius, imagesList , width, height) {
        
        // call super
        THREE.Object3D.call(this);
        
        var thiss=this;
        
        this.radius=radius;
        this.width=width;
        this.height=height;
        this.reflectionOpacity=0.2;
        this.reflectionHeightPer=0.4;
        
        this.images=imagesList;
        this.howMany=0;
        
        var l=this.images.length;
        this.anglePer=(l>0) ? 2*Math.PI/l : 0;
        
        for (var i=0; i<l; i++)
        {
            this.images[i].image=new Image();
            this.images[i].image.onload=function(){ buildCarousel(thiss); };
            this.images[i].image.src=this.images[i].url;
        }
    };
    
    // self is subclass of Object3D
    self.prototype=new THREE.Object3D;
    
    self.prototype.constructor=self;
    
    // bring an item to front
    self.prototype.rotateToItem=function(item, callback) {
        var angle, b, ang, thiss=this;
        
        // find shortest rotation angle (modulo)
        angle=(item.carouselAngle-Math.PI/2)%(2*Math.PI);
        b=this.rotation.y%(2*Math.PI);
        
        if (b>0) b=-2*Math.PI+b;
        
        this.rotation.y=b;
        
        if (angle<b) angle+=2*Math.PI;
        
        if ((angle-b)>2*Math.PI-(angle-b))
            ang=b+(-(2*Math.PI-(angle-b)));
        else
            ang=b+(angle-b);
        
        // tween it
        new TWEEN.Tween(this.rotation)
            .to({y:ang},800)
            .easing(TWEEN.Easing.Exponential.EaseInOut)
            .onComplete(function(){
                if (callback)
                    callback.call(thiss);
            })
            .start();
    };

    // <private> build the carousel when everything is loaded
    function buildCarousel(scope) {
        
        scope.howMany++;
        
        if (scope.howMany==scope.images.length)
        {
            var size, height, text3d, textMaterial, text, textcontainer,
                texture, plane, canvas, cntx, gradient, texture2, material, reflectionPlane, 
                w=scope.width, h=scope.height, reflectH=scope.reflectionHeightPer*h, r=scope.radius, anglePer=scope.anglePer, aa
                ;
                
            for (var i=0, l=scope.images.length; i<l; i++)
            {
                // text caption
                if (scope.images[i].caption)
                {
                    size=(0.4)*(w/scope.images[i].caption.length);
                    height=2;
                    text3d = new THREE.TextGeometry( scope.images[i].caption,{size: size, height: height, curveSegments: 2, font:'helvetiker'});
                    textMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, overdraw: true } );
                    text = new THREE.Mesh( text3d, textMaterial );
                    text.doubleSided = false;
                    textcontainer=new THREE.Object3D();
                    textcontainer.add(text);
                }
                
                // image plane
                texture=new THREE.Texture(scope.images[i].image); //THREE.ImageUtils.loadTexture(scope.images[i].url);
                plane = new THREE.Mesh( new THREE.PlaneGeometry( w, h, 3, 3 ), new THREE.MeshBasicMaterial( { map: texture, overdraw: true } ) );
                aa=i*anglePer;
                plane.rotation.y = -aa-Math.PI/2;
                plane.position = new THREE.Vector3( r*Math.cos(aa), 0, r*Math.sin(aa) );
                plane.doubleSided = true;
                plane.carouselAngle=aa;//plane.rotation.y;
                plane.scale.x=-1;
                
                if (scope.images[i].caption)
                {
                    // position text caption, relative to image plane
                    textcontainer.position.x=plane.position.x;
                    textcontainer.position.y=plane.position.y-size-0.5*h-5;
                    textcontainer.position.z=plane.position.z;
                    textcontainer.rotation.y=plane.rotation.y;
                    text.scale.x=plane.scale.x;
                    text.position.x=w*0.5;
                }
                
                // reflection
                /*
                    There are different ways for creating reflections. One possible approach is to add another copy of the object turned upside-down and place semi-transparent plane between these two copies:
                    http://mrdoob.github.com/three.js/examples/webgl_geometry_text.html
                */
                canvas = document.createElement( 'canvas' );
                canvas.width = w;
                canvas.height = reflectH;

                cntx = canvas.getContext( '2d' );
                cntx.save();
                cntx.globalAlpha=scope.reflectionOpacity;
                cntx.translate(0, h-1);
                cntx.scale(1, -1);				
                cntx.drawImage(scope.images[i].image, 0, 0, w, h /*,0,0,scope.w, scope.reflectionHeightPer*scope.h*/);				
                cntx.restore();
                cntx.globalCompositeOperation = "destination-out";
                
                gradient = cntx.createLinearGradient(0, 0, 0, reflectH);
                //gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
                gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
                //gradient.addColorStop(0, "rgba(255, 255, 255, " + (scope.reflectionOpacity) + ")");
                gradient.addColorStop(0, "rgba(255, 255, 255, 0.0)");
                cntx.fillStyle = gradient;
                cntx.fillRect(0, 0, w, 2*reflectH);				
                
                texture2 = new THREE.Texture( canvas );
                texture2.needsUpdate = true;

                material = new THREE.MeshBasicMaterial( { map: texture2, transparent: true } );
                reflectionplane = new THREE.Mesh( new THREE.PlaneGeometry( w,  reflectH, 3, 3 ), material );
                reflectionplane.rotation.y = -aa-Math.PI/2;
                reflectionplane.position = new THREE.Vector3( r*Math.cos(aa), 0, r*Math.sin(aa) );
                reflectionplane.doubleSided = true;
                reflectionplane.carouselAngle=aa;
                reflectionplane.scale.x=-1;
                reflectionplane.position.y=textcontainer.position.y-10-3*size;
                
                // add them to the carousel
                scope.add( plane );
                scope.add( reflectionplane );
                if (scope.images[i].caption)
                {
                    scope.add( textcontainer );
                }
            }
        }
    };
    
    // export it
    window.Carousel=self;
    
})(window);
