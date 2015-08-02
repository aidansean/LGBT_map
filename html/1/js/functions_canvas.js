mode = 'canvas' ;

function start(){
  canvas  = Get('div_map') ;
  context = canvas.getContext('2d') ;
  context.translate(0.5,0.5) ;
  
  make_nations() ;
  canvas_draw_base_map() ;
  
  Get('submit_prev').addEventListener('click', prev_item) ;
  Get('submit_play').addEventListener('click', auto_play) ;
  Get('submit_next').addEventListener('click', next_item) ;
  document.addEventListener('keydown', keydown) ;
  
  // Taken from http://www.sitepoint.com/html5-javascript-mouse-wheel/
  Get('div_canvas_wrapper').addEventListener('mousewheel'    , zoom_map, false);
  Get('div_canvas_wrapper').addEventListener('DOMMouseScroll', zoom_map, false) ; // Firefox, Y U NO standards compliant?
  
  Get('div_canvas_wrapper').addEventListener('mousedown', pan_map_start , false) ;
  Get('div_canvas_wrapper').addEventListener('mouseup'  , pan_map_end   , false) ;
  Get('div_canvas_wrapper').addEventListener('mouseout' , pan_map_cancel, false) ;
  
  update_act_description() ;
  window.setTimeout(auto_play,500) ;
  window.setTimeout(make_key,500) ;
  
  //make_hatch('rgb(255,  0,255)',   0, 20, context, 'marriage'  ) ;
  make_hatch('rgb(  0,  0,255)',  45, 20, context, 'civilUnion') ;
  make_hatch('rgb(255,  0,  0)', -45, 20, context, 'banned'    ) ;
  make_solid_hatch('rgb(255,  0,255)', context, 'marriage') ;
  
  make_solid_hatch('rgba(  0,  0, 50,0.5)', context, 'found'   ) ;
  make_solid_hatch('rgba(100,100,  0,0.5)', context, 'apply'   ) ;
  make_solid_hatch('rgba(  0,  0,150,0.5)', context, 'join'    ) ;
  make_solid_hatch('rgba(100,  0,  0,0.5)', context, 'veto'    ) ;
  make_solid_hatch('rgba(100,  0,150,0.5)', context, 'withdraw') ;
  make_solid_hatch('rgba(  0,200,200,0.5)', context, 'freeze'  ) ;
  make_solid_hatch('rgba(  0,  0,200,0.5)', context, 'leave'   ) ;
  make_solid_hatch('rgba(  0,  0,137,0.5)', context, 'eurozone') ;
}
function make_key(){ current_nations.make_key() ; } ;

var mousedown_xy = null ;

function get_mouse_xy(event){
  var x = event.pageX - Get('div_canvas_wrapper').offsetLeft ;
  var y = event.pageY - Get('div_canvas_wrapper').offsetTop  ;
  return [x,y] ;
}

function pan_map_start (event){ mousedown_xy = get_mouse_xy(event) ; }
function pan_map_cancel(event){ mousedown_xy = null ; }

function pan_map_end(event){
  if(null==mousedown_xy) return ;
  var mouseup_xy = get_mouse_xy(event) ;
  var dx = mouseup_xy[0]-mousedown_xy[0] ;
  var dy = mouseup_xy[1]-mousedown_xy[1] ;
  var deltaLat = lat2-lat1 ;
  var deltaLng = lng2-lng1 ;
  var dLat = deltaLat*dy/canvas.height ;
  var dLng = deltaLng*dx/canvas.width  ;
  
  lat1 += dLat ; lat2 += dLat ;
  lng1 -= dLng ; lng2 -= dLng ;
  
  canvas_draw_base_map() ;
  current_nations.update_map() ;
  mousedown_xy = null ;
}

function zoom_map(event){
  // Cross-browser wheel delta
  var event = window.event || event ; // old IE support
  var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail))) ;
  
  var deltaLat = lat2-lat1 ;
  var deltaLng = lng2-lng1 ;
  var cLat = 0.5*(lat1+lat2) ;
  var cLng = 0.5*(lng1+lng2) ;
  if(delta<0){
    deltaLat = 2*deltaLat ;
    deltaLng = 2*deltaLng ;
  }
  else{
    deltaLat = 0.5*deltaLat ;
    deltaLng = 0.5*deltaLng ;
  }
  deltaLat = Math.min(180,deltaLat) ;
  deltaLng = Math.min(360,deltaLng) ;
  
  //if(cLat+0.5*deltaLat>  90 || cLat-0.5*deltaLat< -90) cLat = 0 ;
  //if(cLng+0.5*deltaLng> 180 || cLng-0.5*deltaLng<-180) cLng = 0 ;
  
  lat1 = cLat - 0.5*deltaLat ;
  lat2 = cLat + 0.5*deltaLat ;
  lng1 = cLng - 0.5*deltaLng ;
  lng2 = cLng + 0.5*deltaLng ;
  
  canvas_draw_base_map() ;
  current_nations.update_map() ;
  return false ;
}

function canvas_draw_base_map(){
  context.fillStyle = 'rgb(255,255,255)' ;
  context.fillStyle = 'rgb(163,196,255)' ;
  context.fillRect(0,0,cw,ch) ;
  
  context.beginPath() ;
  context.lineWidth   = 1 ;
  context.strokeStyle = 'rgb(0,0,0)' ;
  context.fillStyle   = blank_nation_color ;
  for(var code in nations){
    var nation = nations[code] ;
    for(var k=0 ; k<nation.polygon_points_canvas.length ; ++k){
      var p = nation.polygon_points_canvas[k] ;
      var lat = p[p.length-1][0] ;
      var lng = p[p.length-1][1] ;
      var xy = xy_from_latlng(lat,lng) ;
      context.moveTo(xy[0],xy[1]) ;
      for(var l=0 ; l<p.length ; ++l){
        lat = p[l][0] ;
        lng = p[l][1] ;
        xy = xy_from_latlng(lat,lng) ;
        context.lineTo(xy[0],xy[1]) ;
      }
    }
  }
  context.closePath() ;
  context.fill() ;
  context.stroke() ;
}

var hatch_patterns = [] ;
function make_solid_hatch(color, context, name){
  var canvas_tmp  = Create('canvas') ;
  canvas_tmp.id = 'canvas_hatch_' + name ;
  var context_tmp = canvas_tmp.getContext('2d') ;
  canvas_tmp.width  = 1 ;
  canvas_tmp.height = 1 ;
  context_tmp.fillStyle = color ;
  context_tmp.fillRect(0,0,1,1) ;
  Get('div_hatches').appendChild(canvas_tmp) ;
  
  var img = Create('img') ;
  img.id = 'img_hatch_' + name ;
  img.src = canvas_tmp.toDataURL() ;
  Get('div_hatches').appendChild(img) ;
  img.onload = function(){
    var name = this.id.split('_')[2] ;
    hatch_patterns[name] = context.createPattern(this,'repeat') ;
  }
}
function make_hatch(color, angle, stripe_width, context, name){
  var canvas_tmp  = Create('canvas') ;
  canvas_tmp.id = 'canvas_hatch_' + name ;
  var context_tmp = canvas_tmp.getContext('2d') ;
  if(Math.abs(angle)<1e-3 || Math.abs(angle-180)<1e-3){
    var w = 2*stripe_width ;
    var h = 1 ;
    canvas_tmp.width  = w ;
    canvas_tmp.height = h ;
    context_tmp.fillStyle = blank_nation_color ;
    context_tmp.fillRect(0,0,w,h) ;
    context_tmp.fillStyle = color ;
    context_tmp.fillRect(0,0,stripe_width,1) ;
  }
  else if(Math.abs(angle-90)<1e-3 || Math.abs(angle-270)<1e-3){
    var w = 1 ;
    var h = 2*stripe_width ;
    canvas_tmp.width  = w ;
    canvas_tmp.height = h ;
    context_tmp.fillStyle = blank_nation_color ;
    context_tmp.fillRect(0,0,w,h) ;
    context_tmp.fillStyle = color ;
    context_tmp.fillRect(0,0,1,stripe_width) ;
  }
  else{
    var a  = angle*Math.PI/180 ;
    var dx = stripe_width/Math.cos(a) ;
    var dy = Math.abs(stripe_width/Math.sin(a)) ;
    var w = 2*dx ;
    var h = Math.abs(2*dy) ;
    canvas_tmp.width  = w ;
    canvas_tmp.height = h ;
    context_tmp.fillStyle = blank_nation_color ;
    context_tmp.fillRect(0,0,w,h) ;
    
    var x1 = 0 ; var y1 = 0 ;
    var x2 = w ; var y2 = h ;
    var x3 = x2-dx ; var y3 = h ;
    var x4 = 0 ; var y4 = dy ;
    
    var x5 = dx ; var y5 =  0 ;
    var x6 =  w ; var y6 = dy ;
    var x7 =  w ; var y7 =  0 ;
    
    if(a<0){
      x1 = w - x1 ;
      x2 = w - x2 ;
      x3 = w - x3 ;
      x4 = w - x4 ;
      x5 = w - x5 ;
      x6 = w - x6 ;
      x7 = w - x7 ;
    }
    
    context_tmp.moveTo(x1,y1) ;
    context_tmp.lineTo(x2,y2) ;
    context_tmp.lineTo(x3,y3) ;
    context_tmp.lineTo(x4,y4) ;
    context_tmp.lineTo(x1,y1) ;
    
    context_tmp.moveTo(x5,y5) ;
    context_tmp.lineTo(x6,y6) ;
    context_tmp.lineTo(x7,y7) ;
    context_tmp.lineTo(x5,y5) ;
    
    context_tmp.fillStyle = color ;
    context_tmp.closePath() ;
    context_tmp.fill() ;
  }
  
  Get('div_hatches').appendChild(canvas_tmp) ;
  
  var img = Create('img') ;
  img.id = 'img_hatch_' + name ;
  img.src = canvas_tmp.toDataURL() ;
  Get('div_hatches').appendChild(img) ;
  img.onload = function(){
    var name = this.id.split('_')[2] ;
    hatch_patterns[name] = context.createPattern(this,'repeat') ;
  }
}

var nations = [] ;
function make_nations(){
  var nations_node = loadXMLDoc('xml/nations_new.xml') ;
  for(var i=0 ; i<nations_node.childNodes.length ; i++){
    var xml_node = nations_node.childNodes[i] ;
    if(xml_node.nodeName!='xml') continue ;
    for(var j=0 ; j<xml_node.childNodes.length ; j++){
      var node = xml_node.childNodes[j] ;
      if(node.nodeName!='nation') continue ;
      var nation = new nation_object(node) ;
      nations[nation.code] = nation ;
    }
  }
}

var cw = 750 ;
var ch = 600 ;

function xy_from_latlng(lat,lng){
  var x =    cw*(lng-lng1)/(lng2-lng1) ;
  var y = ch-ch*(lat-lat1)/(lat2-lat1) ;
  return [x,y] ;
}

function Get(id){ return document.getElementById(id) ; }
function Create(type){ return document.createElement(type) ; }


