// using example: http://www.kevlindev.com/tutorials/basics/shapes/js_dom/
// DEPENDENCY:
// SVGPan.js
// HTML page with 
//     svg image: <embed src="Zurich.svg" type="image/svg+xml" class="map" id="svg_image_parent" />
//     function getSelectedShopName(shopId));
//     function getDescriptionForShop(shopId)

/**
 * @type Number default shift for SVG image ( depends on Horizontal screen size )
 */
var shiftDefaultX=155; //155;

/**
 * @type Number default shift for SVG image ( depends on Vertical screen size )
 */
var shiftDefaultY=244; // 244;
/**
 * koeficient of scale by X ( should by equals scaleDefaultX ) 
 * @type Number
 */
var scaleDefaultX=1.0;
/**
 * koeficient of scale by Y ( should by equals scaleDefaultY )
 * @type Number
 */
var scaleDefaultY=1.0;

/**
 * color of the marker of point ( circle over point )
 * @type String
 */
var markerColor="red";
/**
 * color of the marker of point ( circle over point ) during mouse pointer on it
 * @type String
 */
var markerColorSelected="purple";
/**
 * radius of the marker of point (how big marker will be )
 * @type Number
 */
var markerRadius=35;

/**
 * size of zoom for mark up the shop 
 * @type Number
 */
var zoomToShopSize=4;

/** correct position for zoom ( X )*/
var correctionX;
/** correct position for zoom ( Y )*/
var correctionY;

/**
 * set default parameters for image - "defaultShiftX", "defaultShiftY" and "defaultZoom"
 * @param {type} currentSvgWidth - width of image on HTML page
 * @param {type} currentSvgHeight - height of image on HTML page
 * @param {type} imageRealWidth - real width of image without zoom
 * @param {type} imageRealHeight - real height of image without zoom 
 * @returns {undefined}
 */
function calculateDefaultZoomPosition(currentSvgWidth, currentSvgHeight, imageRealWidth, imageRealHeight){
    // shiftDefaultX, shiftDefaultY
    var scaleDefault=currentSvgHeight/imageRealHeight;
    scaleDefaultY=scaleDefault;
    scaleDefaultX=scaleDefault;
    zoomToShopSize=scaleDefault+3;
    
    shiftDefaultX=currentSvgWidth/2;
    shiftDefaultY=currentSvgHeight/2;
    
    // magic numbers
    correctionX=currentSvgWidth/7*currentSvgHeight/currentSvgWidth;
    // magic numbers
    correctionY=20;
}

function defaultZoomPosition(svgDocument){
    set(svgDocument, scaleDefaultX, scaleDefaultY, shiftDefaultX, shiftDefaultY);
}

function set(svgDocument, scaleX, scaleY, positionX, positionY){
    var viewport=getSvgDocumentViewport(svgDocument);
    var stateNew=viewport.getCTM();
    stateNew.a=scaleX; // koef_x
    stateNew.b=0;
    stateNew.c=0;
    stateNew.d=scaleY; // koef_y
    stateNew.e=positionX;// x
    stateNew.f=positionY;
    setCTM(viewport, stateNew);    
}


/**
 * move view of SVG image to x,y point
 * @param {type} svgDocument
 * @param {type} x
 * @param {type} y
 * @returns {undefined} void
 */
function move(svgDocument, x, y){
    var viewport=getSvgDocumentViewport(svgDocument);
    var stateNew=viewport.getCTM(); 
    setCTM(viewport, stateNew.translate(x,y));
}

/**
 * change focus position and zoom 
 * @param {type} svgDocument
 * @param {type} x
 * @param {type} y
 * @param {type} zoomSize
 * @returns {undefined} void
 */
function zoom(svgDocument, x,y, zoomSize){
    var root = svgDocument.documentElement;
    var viewport=getSvgDocumentViewport(svgDocument);

    set(svgDocument, viewport.getCTM().d, viewport.getCTM().d, shiftDefaultX-zoomSize*correctionX,shiftDefaultY-zoomSize*correctionY);
    move(svgDocument, x*zoomSize,y*zoomSize);
    var k=root.createSVGMatrix().scale(zoomSize);
    setCTM(viewport, viewport.getCTM().multiply(k));
}

/**
 * move zoom to point 
 * @param {type} elementId
 * @returns {undefined}
 */
function zoomToShop(elementId){
    var svgDocument=getSvgDocument();
    defaultZoomPosition(svgDocument);
    
    var element=getSvgDocumentChild(svgDocument,elementId);
    var elementPosition=getPositionObject(element.getAttribute("transform"));
    
    //console.log("move/zoom to X:"+(-1)*elementPosition.x+"   Y:"+(-1)*elementPosition.y);
    zoom(svgDocument, (-1)*elementPosition.x, (-1)*elementPosition.y, zoomToShopSize);
}

/**
 * retrieve X and Y position from string: matrix(0.01054671,0,0,0.01054671,127.97544,183.17672)
 * @param {type} transformString
 * @returns {object[x,y]}
 */
function getPositionObject(transformString){
    // console.log("transform: "+transformString);
    transformString=transformString.substring(transformString.indexOf("("));
    transformString=transformString.substring(1, transformString.indexOf(")")-1);
    var elements=transformString.split(",");
    var returnValue={};
    returnValue.x=elements[elements.length-2];
    returnValue.y=elements[elements.length-1];
    return returnValue;
}

/**
 * part of SVGPan.js
 * Sets the current transform matrix of an element.
 */
function setCTM(element, matrix) {
	var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";
	element.setAttribute("transform", s);
}


/**
 *  
 * @param {type} svgDocument - svg Document - use this function - getSvgDocument
 * @param {type} childElementId - name of child element, which will use for 
 * @returns {createCircle.shape} - created element with id=childElementId+"_front"
 */
function createCircle(svgDocument, childElementId){
        var backElement=getSvgDocumentChild(svgDocument,childElementId);
        if(backElement==null){
            console.log("can't find element by name: "+childElementId);
            return null;
        }

        var NS="http://www.w3.org/2000/svg";
        var shape = svgDocument.createElementNS(NS, "circle");
        shape.setAttributeNS(null, "cx", backElement.getAttribute("sodipodi:cx")); 
        shape.setAttributeNS(null, "cy", backElement.getAttribute("sodipodi:cy")); 
        shape.setAttributeNS(null, "transform", backElement.getAttribute("transform"));
        shape.setAttributeNS(null, "r",  markerRadius);
        shape.setAttributeNS(null, "fill", markerColor);
        shape.setAttributeNS(null, "id", createNewNameForElement(backElement.getAttribute("id")));
  
        // add onclick listener
        $(shape).click(function(){
                // marker onclick
                showModalWindowWithDescription(backElement.getAttribute("id"));
        });
        $(shape).mouseover(function(event){
                // marker mouseover
                shape.setAttributeNS(null, "fill", markerColorSelected);
                showPanelWithDescription(event, backElement.getAttribute("id"));
        });
        $(shape).mouseout(function(event){
                // marker mouseout
                shape.setAttributeNS(null, "fill", markerColor);
                hidePanelWithDescription(event, backElement.getAttribute("id"));
        });
        var svgViewpoint=getSvgDocumentViewport(svgDocument);
        svgViewpoint.appendChild(shape);
        return shape;
}

function showPanelWithDescription(event, shopId){
    $("#shop_name").html(getSelectedShopName(shopId));
    $("#shop_name").css({top: event.pageY, left: event.pageX}); // , position:'fixed'
    $("#shop_name").show();
}

function hidePanelWithDescription(event, shopId){
    $("#shop_name").hide();
}

function showModalWindowWithDescription(shopId){
    $('#shop_description_popup').html(getDescriptionForShop(shopId));
    $('#shop_description_popup').bPopup();
}

/**
 * 
 * @param {type} originalName - original name of element
 * @returns {String}
 */
function createNewNameForElement(originalName){
    return originalName+"_front";
}

/**
 * 
 * @param {type} svgDocument
 * @param {string} removeElementId - element for remove from map
 * @returns {void} nothing
 */
function removeSvgChildElement(svgDocument, removeElementId){
        // find element by id 
        var elementForRemove=getSvgDocumentChild(svgDocument,removeElementId);
        if(elementForRemove!=null){
            // get Viewport of SVG document 
            var svgViewport=getSvgDocumentViewport(svgDocument);
            // remove child element from ViewPort 
            svgViewport.removeChild(elementForRemove);
        }
}


/**
 * 
 * @param {type} parentElement - element with child elements
 * @param {type} childId - id of one the children 
 * @returns {findChildById.nodes} - child element with id ( childId ), deep - one level only
 */
function findChildById(parentElement, childId){
        var nodes = parentElement.childNodes;
        for(i=0; i<nodes.length; i+=1) {
                if(nodes[i].id==childId){
                        return nodes[i];
                };
        }
        return null;
}

/**
 * find child element into SVG document ( into viewport element as child node ) 
 * @param {type} svgDocument
 * @param {type} childId
 * @returns {findChildById.nodes|unresolved}
 */
function getSvgDocumentChild(svgDocument, childId){
        var viewport=getSvgDocumentViewport(svgDocument);
        if(childId==null){
                return viewport;
        }else{
                return findChildById(viewport,childId);
        }
}


/**
 * @param {type} svgDocument
 * @returns {findChildById.nodes|unresolved} root of SVG image - viewport element
 */
function getSvgDocumentViewport(svgDocument){
        var parentElement=svgDocument.documentElement;
        return findChildById(parentElement, "viewport");
}

/**
 * @returns {unresolved} SVG document from HTML page
 */
function getSvgDocument(){
        return document.getElementById('svg_image_parent').getSVGDocument();
}