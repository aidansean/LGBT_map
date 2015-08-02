function start(){
  make_map() ;
  make_nations() ;
  
  current_nations.create_polygons() ;
  
  Get('submit_prev').addEventListener('click', prev_item) ;
  Get('submit_play').addEventListener('click', auto_play) ;
  Get('submit_next').addEventListener('click', next_item) ;
  
  document.addEventListener('keydown', keydown) ;
  
  current_nations.make_key() ;
  current_nations.update_map() ;
  update_act_description() ;
  auto_play() ;
  
  if(false){
    var string = [] ;
    string.push('<xml>') ;
    for(var code in nations){
      string.push(nations[code].make_slim_xml()) ;
    }
    string.push('<xml>') ;
    Get('textarea_xml').value = string.join('\n') ;
  }
}

function make_map(){
  map = new google.maps.Map(Get('div_map'), mapOptions) ;
  google.maps.event.addListener(map, 'click', map_click) ;
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

function reset_polygon_style(polygon){
  polygon.setOptions({fillColor     : default_fillColor    }) ;
  polygon.setOptions({fillOpacity   : default_fillOpacity  }) ;
  polygon.setOptions({strokeColor   : default_strokeColor  }) ;
  polygon.setOptions({strokeOpacity : default_strokeOpacity}) ;
  polygon.setOptions({strokeWeight  : default_strokeWeight }) ;
}

function Get(id){ return document.getElementById(id) ; }
function Create(type){ return document.createElement(type) ; }

function intersection_object(p1, p2, line, index, result){
  this.p1 = p1 ;
  this.p2 = p2 ;
  this.line = line ;
  this.index = index ;
  this.x = result[1] ;
  this.y = result[2] ;
}

function latlng_intersection(line, p1, p2){
  return line_intersections(line[0][0],line[0][1],line[1][0],line[1][1],p1.lat(),p1.lng(),p2.lat(),p2.lng()) ;
}

function stripe_polygon(points, code){
  var line_pairs = [] ;
  for(var i=0 ; i<lines.length ; i+=2){
    if(i==lines.length-1) continue ;
    line_pairs.push([lines[i],lines[i+1]]) ;
  }
  var output = [] ;
  
  var circleOptions = {
      strokeColor: '#ff0000', strokeOpacity: 1.0, fillOpacity: 0.0, map: map, center: points[0], radius: 5000} ;
  //var circle = new google.maps.Circle(circleOptions) ;
  
  for(var ip=0 ; ip<line_pairs.length ; ++ip){
    var points_out =  [] ;
    var pair = line_pairs[ip] ;
    var intersections = [] ;
    for(var il=0 ; il<pair.length ; ++il){
      var l = pair[il] ;
      for(var i=0 ; i<points.length ; ++i){
        var p2index = (i==points.length-1) ? 0 : i+1 ;
        var p1 = points[i] ;
        var p2 = points[p2index] ;
        var result = latlng_intersection(l, p1, p2) ;
        if(result[0]==1 && result[3]>1.0){
          //alert(result) ;
          intersections.push(new intersection_object(p1, p2, l, i, result)) ;
        }
      }
    }
    if(intersections.length==0) continue ;
    intersections.sort(function(a,b){ return a.index-b.index ;}) ;
    
    var on = false ;
    var intersection_index = 0 ;
    
    // Protect for the case when the first point is between the lines
    var between_lines = false ;
    var testPoint1 = new google.maps.LatLng(0,90) ;
    var testPoint2 = new google.maps.LatLng(90,9) ;
    var nCross = [0,0] ;
    var l1 = pair[0] ;
    var l2 = pair[1] ;
    var test1 = latlng_intersection(l1,points[0],testPoint1) ;
    var test2 = latlng_intersection(l2,points[0],testPoint1) ;
    var test3 = latlng_intersection(l1,points[0],testPoint2) ;
    var test4 = latlng_intersection(l2,points[0],testPoint2) ;
    if(test1[0]==1) nCross[0]++ ;
    if(test2[0]==1) nCross[0]++ ;
    if(test3[0]==1) nCross[1]++ ;
    if(test4[0]==1) nCross[1]++ ;
    
    if(nCross[0]==1 || nCross[1]==1){
      intersections.splice(0,0,intersections.pop()) ;
    }
    var offset = intersections[0].index ;
    
    for(var i=0 ; i<points.length ; ++i){
      var index = (i+offset-1)%points.length ;
      if(on) points_out.push(points[index]) ;
      if(intersection_index<intersections.length){
        if(index==intersections[intersection_index].index){
          var a = intersections[intersection_index] ;
          var lat = a.x ;
          var lng = a.y ;
          points_out.push(new google.maps.LatLng(lat,lng)) ;
          on = !on ;
          intersection_index++ ;
        }
      }
    }
    output.push(points_out) ;
  }
  return output ;
}

var tolerance = 1e-32 ;
function line_intersections(x1,y1,x2,y2,x3,y3,x4,y4,debug){
  if(debug==undefined) debug = 0 ;
  // First  line from (x1,y1) to (x2,y2)
  // Second line from (x3,y3) to (x4,y4)
  // We'll do this the expensive but intuitive way
  
  // return values:
  // [status,x,y]
  // Statuses: negative for error, positive for interserction
  // -1: line 1 is a point
  // -2: line 2 is a point
  // -3: parallel, no intersection
  // -4: non-parallel, no interserction
  //
  //  1: non-parallel, intersection
  //  2: non-parallel, touching
  //  3: non-parallel, meeting at a point
  // 11: parallel, intersection
  // 12: parallel, touching
  // 13: parallel, l1 contains l2
  // 14: parallel, l2 contains l1
  // 15: identical lines
  
  if(is_zero(x2-x1) && is_zero(y2-y1)) return [-1,0,0] ;
  if(is_zero(x4-x3) && is_zero(y4-y3)) return [-2,0,0] ;
  
  var x1_in = x1 ; var y1_in = y1 ;
  var x2_in = x2 ; var y2_in = y2 ;
  var x3_in = x3 ; var y3_in = y3 ;
  var x4_in = x4 ; var y4_in = y4 ;
  
  // First move such that (x1,y1) is the origin
  x1 -= x1_in ; y1 -= y1_in ;
  x2 -= x1_in ; y2 -= y1_in ;
  x3 -= x1_in ; y3 -= y1_in ;
  x4 -= x1_in ; y4 -= y1_in ;
  
  // Now rotate so that line 1 lies along the x axis
  var t1 = Math.atan2(y2_in-y1_in,x2_in-x1_in) ;
  var xy1 = rotate(x1,y1,t1) ;
  var xy2 = rotate(x2,y2,t1) ;
  var xy3 = rotate(x3,y3,t1) ;
  var xy4 = rotate(x4,y4,t1) ;
  
  x1 = xy1[0] ; y1 = xy1[1] ;
  x2 = xy2[0] ; y2 = xy2[1] ;
  x3 = xy3[0] ; y3 = xy3[1] ;
  x4 = xy4[0] ; y4 = xy4[1] ;
  
  // if y3 and y4 are on the same side of the line, then there is no intersection
  if(y3>tolerance && y4>tolerance){
    if(Math.abs(y3-y4)<tolerance){ return [-3,0,0] ; }
    else{ return [-4,0,0] ; }
  }
  if(y3<-tolerance && y4<-tolerance){
    if(Math.abs(y3-y4)<tolerance){ return [-3,0,0] ; }
    else{ return [-4,0,0] ; }
  }
  
  // if y3 and y4 are on the x-axis, check for overlap
  if(is_zero(y3-y4)){
    var xA = Math.min(x3,x4) ;
    var xB = Math.max(x3,x4) ;
    if(is_zero(xB)        ){ return [12,x1_in,y1_in] ; } // Touching parallel lines
    else if(is_zero(xA-x2)){ return [12,x2_in,y2_in] ; } // Touching parallel lines
    else if(xA>tolerance && xA-x2<-tolerance && xB>tolerance && xB-x2<tolerance){ return [13,0.5*(x4_in+x3_in),0.5*(y4_in+y3_in)] ; } // Return midpoint of inner line
    else if(xA<-tolerance && xB-x2>tolerance ){ return [14,0.5*(x2_in+x1_in),0.5*(y2_in+y1_in)] ; } // Return midpoint of inner line
    else if(xA<0 && xB>0  ){ return [11,x1_in,y1_in] ; } // Intersection
    else if(xA<x2 && xB>x2){ return [11,x2_in,y2_in] ; } // Intersection
    else if(is_zero(xA) && is_zero(xB-x2)){ return [15,x1_in,y1_in] ; } 
    else{ return [-3,0,0] ; } // No intersection
  }
  
  // line 2 crosses the x-axis
  // Find the point where the intersection occurs
  if(Math.abs(x3-x4)<tolerance){
    if(x3<-tolerance || x3>x2+tolerance) return [-4,0,0] ;
    // Check for touching
    if(is_zero(x3)){ 
      if(is_zero(y3)||is_zero(y4)){ return[3,x1_in,y1_in] ; } // Meeting
      else{ return[2,x1_in,y1_in] ; }// Touching
    }
    if(is_zero(x3-x2)){
      if(is_zero(y3)||is_zero(y4)){ return[3,x2_in,y2_in] ; } // Meeting
      else { return[2,x2_in,y2_in] ; }// Touching
    }
    if(is_zero(y3)){ return[2,x3_in,y3_in] ; } // Touching
    if(is_zero(y4)){ return[2,x4_in,y4_in] ; } // Touching
    // Otherwise transform (x3,0) back and we're done
    var xy = rotate(x3,0,-t1) ; // Rotate points back ;
    xy[0] += x1_in ; xy[1] += y1_in ;
    var x = xy[0] ;
    var y = xy[1] ;
    var d2 = 1e6 ;
    d2 = Math.min(d2, (x-x1)*(x-x1)+(y-y1)*(y-y1)) ;
    d2 = Math.min(d2, (x-x2)*(x-x2)+(y-y2)*(y-y2)) ;
    d2 = Math.min(d2, (x-x3)*(x-x3)+(y-y3)*(y-y3)) ;
    d2 = Math.min(d2, (x-x4)*(x-x4)+(y-y4)*(y-y4)) ;
    return [1,x,y,Math.sqrt(d2)] ; // Intersecting
  }
  else{
    // x0 is the root where l2 crosses the x axis
    var g  = (y4-y3)/(x4-x3) ; // Gradient
    var x0 = x3 - y3/g ;
    if(x0<-tolerance || x0>x2+tolerance) return [-4,0,0] ;
    if(is_zero(y3)   ){
      if(is_zero(x3)   ) return [3,x1_in,y1_in] ; // Meeting
      if(is_zero(x3-x2)) return [3,x2_in,y2_in] ; // Meeting
      return[2,x3_in,y3_in] ; // Touching
    }
    if(is_zero(y4)   ){
      if(is_zero(x4)   ) return [3,x1_in,y1_in] ; // Meeting
      if(is_zero(x4-x2)) return [3,x2_in,y2_in] ; // Meeting
      return[2,x4_in,y4_in] ; // Touching
    }
    if(is_zero(x0)   ){ return[3,x1_in,y1_in] ; } // Meeting
    if(is_zero(x0-x2)){ return[3,x2_in,y2_in] ; } // Meeting
    
    var xy = rotate(x0,0,-t1) ;
    xy[0] += x1_in ; xy[1] += y1_in ;
    var x = xy[0] ;
    var y = xy[1] ;
    var d2 = 1e6 ;
    d2 = Math.min(d2, (x-x1)*(x-x1)+(y-y1)*(y-y1)) ;
    d2 = Math.min(d2, (x-x2)*(x-x2)+(y-y2)*(y-y2)) ;
    d2 = Math.min(d2, (x-x3)*(x-x3)+(y-y3)*(y-y3)) ;
    d2 = Math.min(d2, (x-x4)*(x-x4)+(y-y4)*(y-y4)) ;
    return [1,x,y,Math.sqrt(d2)] ; // Intersecting
  }
}
function rotate(x,y,t){
  var x_out = x*Math.cos(t) + y*Math.sin(t) ;
  var y_out = y*Math.cos(t) - x*Math.sin(t) ;
  return [x_out,y_out] ;
}
function is_zero(x){
  return (Math.abs(x)<tolerance) ;
}

