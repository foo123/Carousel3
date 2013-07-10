(function(window){
    
    /**
     * Provides requestAnimationFrame in a cross browser way.
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     */

    if ( !window.requestAnimationFrame ) {

        window.requestAnimationFrame = ( function() {

            return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

                window.setTimeout( callback, 1000 / 60 );

            };

        } )();

    }
    
    var container,
        camera, scene, renderer, projector,
        updatecamera=false, carouselupdate=true,

        carousel,
        targetRotationY = 0, targetRotationOnMouseDownY = 0, targetRotationX = 0, targetRotationOnMouseDownX = 0,

        mouse={x:0,y:0}, prevmouse={x:0,y:0},
        mouseX = 0, mouseXOnMouseDown = 0, mouseY = 0, mouseYOnMouseDown = 0,
        windowHalfX = 0.5 * window.innerWidth,
        windowHalfY = 0.5 * window.innerHeight
        ;
    
    function onDblClick( e )
    {
        e.preventDefault();
        dblclick=true;
        carouselupdate=false;
        
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        projector.unprojectVector( vector, camera );

        //var ray = new THREE.Ray( camera.position, vector.sub( camera.position ).normalize() );
        // newer three.js uses raycaster instead iof ray, to intersect
        var rayCaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

        var intersects = rayCaster.intersectObjects( carousel.children );

        if ( intersects.length > 0 )
            carousel.rotateToItem(intersects[0].object, function() {
                targetRotationY=this.rotation.y;
                carouselupdate=true;
            });

    }
    
    function onDocumentMouseDown( e ) 
    {
        e.preventDefault();

        container.addEventListener( 'mousemove', onDocumentMouseMove, false );
        container.addEventListener( 'mouseup', onDocumentMouseUp, false );
        container.addEventListener( 'mouseout', onDocumentMouseOut, false );

        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        prevmouse={x:mouse.x,y:mouse.y};
        mouseXOnMouseDown = e.clientX - windowHalfX;
        mouseYOnMouseDown = e.clientY - windowHalfY;
        targetRotationOnMouseDownY = targetRotationY;
        targetRotationOnMouseDownX = targetRotationX;
    }
    
    function onDocumentMouseMove( e ) 
    {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

        targetRotationY = targetRotationOnMouseDownY + ( mouseX - mouseXOnMouseDown ) * 0.02;
        targetRotationX = targetRotationOnMouseDownX + ( mouseY - mouseYOnMouseDown ) * 0.02;
        updatecamera=true;
    }

    function onDocumentMouseUp( e ) 
    {
        container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        container.removeEventListener( 'mouseup', onDocumentMouseUp, false );
        container.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    }

    function onDocumentMouseOut( e ) 
    {
        container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        container.removeEventListener( 'mouseup', onDocumentMouseUp, false );
        container.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    }

    function onDocumentTouchStart( e ) 
    {

        if ( e.touches.length == 1 ) 
        {

            e.preventDefault();

            mouse.x = ( e.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( e.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
            prevmouse={x:mouse.x,y:mouse.y};
            mouseXOnMouseDown = e.clientX - windowHalfX;
            mouseYOnMouseDown = e.clientY - windowHalfY;
            targetRotationOnMouseDownY = targetRotationY;
            targetRotationOnMouseDownX = targetRotationX;

        }
    }

    function onDocumentTouchMove( e ) 
    {

        if ( e.touches.length == 1 ) 
        {

            e.preventDefault();

            mouse.x = ( e.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( e.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
            prevmouse={x:mouse.x,y:mouse.y};
            mouseXOnMouseDown = e.clientX - windowHalfX;
            mouseYOnMouseDown = e.clientY - windowHalfY;
            targetRotationOnMouseDownY = targetRotationY;
            targetRotationOnMouseDownX = targetRotationX;
            updatecamera=true;
        }
    }

    //

    function animate() 
    {
        requestAnimationFrame( animate );
        render();
    }
    
    function render() 
    {
        if (carouselupdate)
            carousel.rotation.y += ( targetRotationY - carousel.rotation.y ) * 0.05;
        if (updatecamera && Math.abs(mouse.y-prevmouse.y)>Math.abs(mouse.x-prevmouse.x))
            camera.position.z +=  (mouse.y-prevmouse.y)*20;
        renderer.render( scene, camera );
        updatecamera=false;
        //carouselupdate=true;
        TWEEN.update();
    }
    
    
    // main Application Object
    var self={
    
        init: function(images)  {
            var w,h;
            
            container=document.getElementById('container');
            w=window.innerWidth;
            h=window.innerHeight;
            container.style.width=w+"px";
            container.style.height=h+"px";
            container.style.marginTop=0.5*(window.innerHeight-h)+'px';
            
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera( 70, w / h, 1, 1000 );
            camera.position.z = 500;
            scene.add( camera );
            projector = new THREE.Projector();
            renderer = new THREE.CanvasRenderer();
            renderer.setSize( w, h );

            // Carousel
            carousel=new Carousel(200, images, 150, 100);
            scene.add( carousel );

            container.appendChild( renderer.domElement );

            container.addEventListener( 'dblclick', onDblClick, false );
            container.addEventListener( 'mousedown', onDocumentMouseDown, false );
            container.addEventListener( 'touchstart', onDocumentTouchStart, false );
            container.addEventListener( 'touchmove', onDocumentTouchMove, false );
            
            animate();
        },
        
        animate : animate
    };


    
    // export it
    window.CarouselApplication=self;
})(window);
