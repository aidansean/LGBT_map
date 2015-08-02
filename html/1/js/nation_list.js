function act_object(node, parent){
  this.parent = parent ;
  this.date   = node.getAttribute('date'  ) ;
  this.status = node.getAttribute('status') ;
  
  this.year  = parseInt(this.date.split('/')[0]) ;
  this.month = parseInt(this.date.split('/')[1]) ;
  this.day   = parseInt(this.date.split('/')[2]) ;
  
  this.nations = [] ;
  for(var i=0 ; i<node.childNodes.length ; ++i){
    if(node.childNodes[i].nodeName=='nation'){
      this.nations.push(node.childNodes[i].getAttribute('code')) ;
    }
  }
}

function status_object(node){
  this.type          = node.getAttribute('type'         ) ;
  this.fillColor     = node.getAttribute('fillColor'    ) ;
  this.fillOpacity   = node.getAttribute('fillOpacity'  ) ;
  this.strokeColor   = node.getAttribute('strokeColor'  ) ;
  this.strokeOpacity = node.getAttribute('strokeOpacity') ;
  this.strokeWeight  = node.getAttribute('strokeWeight' ) ;
  this.description   = node.getAttribute('description'  ) ;
  this.style_polygon = function(p){
    p.setOptions({fillColor    : this.fillColor    }) ;
    p.setOptions({fillOpacity  : this.fillOpacity  }) ;
  }
  this.style_polygon_border = function(p){
    p.setOptions({strokeColor  : this.strokeColor  }) ;
    p.setOptions({strokeOpacity: this.strokeOpacity}) ;
    p.setOptions({strokeWeight : this.strokeWeight }) ;
  }
  this.style_polygon_canvas = function(context){
    context.strokeStyle = this.strokeColor  ;
    context.fillStyle   = this.fillColor    ;
    context.lineWidth   = this.strokeWeight ;
  }
}

function nation_list(node){
  this.title         = node.getAttribute('title') ;
  this.current_index = parseInt(node.getAttribute('start_index')) ;
  this.statuses = [] ;
  this.nations  = [] ;
  this.acts     = [] ;
  this.polygons = [] ;
  this.polygons_border = [] ;
  this.sort_acts = function(){
    this.acts.sort( function(a,b){
      if(a.year !=b.year ) return a.year -b.year  ;
      if(a.month!=b.month) return a.month-b.month ;
      return a.day-b.day   ;
    } ) ;
  }
  for(var i=0 ; i<node.childNodes.length ; ++i){
    if(node.childNodes[i].nodeName=='statuses'){
      for(var j=0 ; j<node.childNodes[i].childNodes.length ; ++j){
        var child = node.childNodes[i].childNodes[j] ;
        if(child.nodeName=='status'){
          var status = new status_object(child) ;
          this.statuses[status.type] = status ;
        }
      }
    }
    else if(node.childNodes[i].nodeName=='acts'){
      for(var j=0 ; j<node.childNodes[i].childNodes.length ; ++j){
        var child = node.childNodes[i].childNodes[j] ;
        if(child.nodeName=='act'){
          var act = new act_object(child, this) ;
          this.acts.push(act) ;
          for(var k=0 ; k<act.nations.length ; ++k){
            var add_nation = true ;
            for(var l=0 ; l<this.nations.length ; ++l){
              if(act.nations[k]==this.nations[l]){
                add_nation = false ;
                break ;
              }
            }
            if(add_nation) this.nations.push(act.nations[k]) ;
          }
        }
      }
    }
  }
  this.sort_acts() ;
  this.create_polygons_old = function(){
    for(var code in this.polygons){
      var pols = this.polygons[code] ;
      for(var i=0 ; i<pols.length ; ++i){
        pols[i].setMap(null) ;
      }
      this.polygons[code] = [] ;
    }
    for(var i=0 ; i<this.nations.length ; ++i){
      var code = this.nations[i] ;
      this.polygons[code] = nations[code].get_polygons() ;
      for(var j=0 ; j<this.polygons[code].length ; ++j){
        reset_polygon_style(this.polygons[code][j]) ;
      }
    }
  }
  this.create_polygons = function(){
    for(var i=0 ; i<this.nations.length ; ++i){
      var code = this.nations[i] ;
      if(nations[code]==undefined) alert(code) ;
      //this.polygons[code]        = nations[code].get_polygons_striped() ;
      this.polygons[code]        = nations[code].get_polygons() ;
      this.polygons_border[code] = nations[code].get_polygons() ;
      for(var j=0 ; j<this.polygons[code].length ; ++j){
        reset_polygon_style(this.polygons[code][j]) ;
      }
      for(var j=0 ; j<this.polygons_border[code].length ; ++j){
        reset_polygon_style(this.polygons_border[code][j]) ;
      }
    }
  }
  
  this.update_map = function(){
    if(mode=='google'){
      for(var i=0 ; i<this.acts.length ; ++i){
        for(var j=0 ; j<this.acts[i].nations.length ; ++j){
          var code = this.acts[i].nations[j] ;
          for(var k=0 ; k<this.polygons[code].length ; ++k){
            reset_polygon_style(this.polygons[code][k]) ;
          }
          for(var k=0 ; k<this.polygons_border[code].length ; ++k){
            reset_polygon_style(this.polygons_border[code][k]) ;
          }
        }
      }
    
      for(var i=0 ; i<this.acts.length ; ++i){
        for(var j=0 ; j<this.acts[i].nations.length ; ++j){
          var code = this.acts[i].nations[j] ;
          for(var k=0 ; k<this.polygons[code].length ; ++k){
            var p = this.polygons[code][k] ;
            if(i<=this.current_index){
              this.statuses[this.acts[i].status].style_polygon(p) ;
            }
            p.setMap(map) ;
          }
          for(var k=0 ; k<this.polygons_border[code].length ; ++k){
            var p = this.polygons_border[code][k] ;
            if(i<=this.current_index){
              this.statuses[this.acts[i].status].style_polygon_border(p) ;
            }
            p.setMap(map) ;
          }
        }
      }
      
      for(var i=0 ; i<lines.length ; ++i){
        var lineCoordinates = [
          new google.maps.LatLng(lines[i][1][0], lines[i][1][1]),
          new google.maps.LatLng(lines[i][0][0], lines[i][0][1])
        ] ;
        var line = new google.maps.Polyline({ path: lineCoordinates, geodesic: true, strokeColor: '#0000cc', strokeOpacity: 1.0, strokeWeight: 1 }) ;
        //line.setMap(map);
      }
    }
    else if(mode=='canvas'){
      canvas_draw_base_map() ;
      context.beginPath() ;
      context.lineWidth   = 1 ;
      context.strokeStyle = 'rgb(0,0,0)' ;
      context.fillStyle   = blank_nation_color ;
      for(var i=0 ; i<this.nations.length ; ++i){
        var nation = nations[this.nations[i]] ;
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
      
      for(var i=0 ; i<=this.current_index ; ++i){
        for(var j=0 ; j<this.acts[i].nations.length ; ++j){
          context.beginPath() ;
          var code = this.acts[i].nations[j] ;
          var nation = nations[code] ;
          for(var k=0 ; k<nation.polygon_points_canvas.length ; ++k){
            if(i>this.current_index) continue ;
            
            var p = nation.polygon_points_canvas[k] ;
            this.statuses[this.acts[i].status].style_polygon_canvas(context) ;
            context.fillStyle = hatch_patterns[this.acts[i].status] ;
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
          context.closePath() ;
          context.fill() ;
          context.stroke() ;
        }
      }
    
      context.textAlign    = 'center' ;
      context.textBaseline = 'middle' ;
      for(var code in nations){
        var fontSize = 20 ;
        context.font = fontSize + 'px arial' ;
        
        var nation = nations[code] ;
        var name = nation.name_short ;
        var text_w = context.measureText(name).width ;
        var nation_width = xy_from_latlng(0,nation.lng_max)[0]-xy_from_latlng(0,nation.lng_min)[0] ;
        if(text_w>nation_width) continue ;
      
        //fontSize *= nation_width/(4*text_w) ;
        context.font = fontSize + 'px arial' ;
        var xy = xy_from_latlng(nation.mLat,nation.mLng) ;
        
        text_w = context.measureText(name).width ;
        context.fillStyle = 'rgba(255,255,255,0.8)' ;
        context.fillRect(xy[0]-0.5*text_w,xy[1]-0.5*fontSize,text_w,fontSize) ;
        
        context.fillStyle = 'rgb(0,0,0)' ;
        context.fillText(name, xy[0], xy[1]) ;
      }
    }
  }
  this.union = function(A,B){
    for(var i=0 ; i<A.acts.length ; ++i){ this.acts.push(A.acts[i]) ; }
    for(var i=0 ; i<B.acts.length ; ++i){ this.acts.push(B.acts[i]) ; }
    this.sort_acts() ;
  }
  this.intersection = function(A,B){
    var AB = [A,B] ;
    for(var i=0 ; i<AB.length ; ++i){
      for(var j=0 ; j<AB[i].nations.length ; ++j){
        var accept = false ;
        for(var k=0 ; k<AB[1-i].nations.length ; ++k){
          if(AB[1-i].nations[k]==AB[i].nations[j]){
            accept = true ;
            break ;
          }
        }
        if(accept) this.nations.push(AB[i].nations[j]) ;
      }
    }
    
    for(var i=0 ; i<AB.length ; i++){
      for(var j=0 ; j<AB[i].acts.length ; ++j){
        var accept = false ;
        for(var k=0 ; k<this.nations.length ; ++k){
          if(this.nations[k]==AB[i].acts[j].nation_code){
            accept = true ;
            break ;
          }
        }
        if(accept){
          this.acts.push(AB[i].acts[j]) ;
        }
      }
    }
  }
  this.make_key = function(){
    var table = Create('table') ;
    var thead = Create('thead') ;
    var tbody = Create('tbody') ;
    var tr, th, td ;
    
    tr = Create('tr') ;
    th = Create('th') ;
    th.innerHTML = 'Colour' ;
    th.className = 'key_color' ;
    tr.appendChild(th) ;
    
    th = Create('th') ;
    th.innerHTML = 'Meaning' ;
    th.className = 'key_meaning' ;
    tr.appendChild(th) ;
    
    thead.appendChild(tr) ;
    table.appendChild(thead) ;
    
    for(var type in this.statuses){
      var s = this.statuses[type] ;
      tr = Create('tr') ;
      td = Create('td') ;
      td.className = 'key_color' ;
      td.style.backgroundColor = s.fillColor.replace('rgb', 'rgba').replace(')', ','+s.fillOpacity+')') ;
      td.style.border          = s.strokeWeight + 'px solid ' + s.strokeColor ;
      if(mode=='canvas'){
        td.style.backgroundImage = 'url(' + Get('canvas_hatch_'+type).toDataURL() + ')' ;
      }
      tr.appendChild(td) ;
      
      td = Create('td') ;
      td.className = 'key_meaning' ;
      td.innerHTML = s.description ;
      tr.appendChild(td) ;
      tbody.appendChild(tr) ;
    }
    
    table.className = 'key' ;
    table.appendChild(tbody) ;
    Get('div_keys_wrapper').appendChild(table) ;
  }
}

function nation_object(node){
  this.code = node.getAttribute('code') ;
  this.name_short = node.getAttribute('name_short') ;
  this.name_long  = node.getAttribute('name_long' ) ;
  this.continents            = [] ;
  this.polygon_points        = [] ;
  this.polygon_points_canvas = [] ;
  this.mLat = 0 ;
  this.mLng = 0 ;
  this.lat_min =   90 ;
  this.lat_max =  -90 ;
  this.lng_min =  180 ;
  this.lng_max = -180 ;
  this.nPoints = 0 ;
  
  for(var i=0 ; i<node.childNodes.length ; i++){
    var child = node.childNodes[i] ;
    if(child.nodeName=='continent') this.continents.push(child.getAttribute('name')) ;
    if(child.nodeName!='path') continue ;
        
    var p1 = [] ;
    var pA = [] ;
    
    var points = child.getAttribute('points').split(';') ;
    for(var j=0 ; j<points.length ; ++j){
      var ll = points[j].split(',') ;
      var lat = parseFloat(ll[0]) ;
      var lng = parseFloat(ll[1]) ;
      p1.push(new google.maps.LatLng(lat ,lng)) ;
      pA.push([lat,lng]) ;
      this.nPoints++ ;
      this.mLat += lat ;
      this.mLng += lng ;
      this.lat_min = Math.min(this.lat_min,lat) ;
      this.lat_max = Math.max(this.lat_max,lat) ;
      this.lng_min = Math.min(this.lng_min,lng) ;
      this.lng_max = Math.max(this.lng_max,lng) ;
    }
    
    
    /*
    for(var j=0 ; j<child.childNodes.length ; ++j){
      var ll_node = child.childNodes[j] ;
      if(ll_node.nodeName!='point') continue ;
      var lat = parseFloat(ll_node.getAttribute('lat')) ;
      var lng = parseFloat(ll_node.getAttribute('lng')) ;
      p1.push(new google.maps.LatLng(lat ,lng)) ;
      pA.push([lat,lng]) ;
      this.nPoints++ ;
      this.mLat += lat ;
      this.mLng += lng ;
      this.lat_min = Math.min(this.lat_min,lat) ;
      this.lat_max = Math.max(this.lat_max,lat) ;
      this.lng_min = Math.min(this.lng_min,lng) ;
      this.lng_max = Math.max(this.lng_max,lng) ;
    }
    */
    
    this.polygon_points.push(p1) ;
    this.polygon_points_canvas.push(pA) ;
  }
  this.mLat /= this.nPoints ;
  this.mLng /= this.nPoints ;
  
  this.get_polygons = function(){
    var polygons = [] ;
    for(var i=0 ; i<this.polygon_points.length ; ++i){
      var poly = new google.maps.Polygon({
        path: this.polygon_points[i],
        geodesic: true
      }) ;
      polygons.push(poly) ;
    }
    return polygons ;
  }
  this.get_polygons_striped = function(angle){
    var polygons = [] ;
    for(var i=0 ; i<this.polygon_points.length ; ++i){
      var striped_points = stripe_polygon(this.polygon_points[i], this.code) ;
      for(var j=0 ; j<striped_points.length ; ++j){
        var poly = new google.maps.Polygon({
          path: striped_points[j],
          geodesic: true
        }) ;
        polygons.push(poly) ;
      }
    }
    return polygons ;
  }
  
  this.make_slim_xml = function(){
    var string = [] ;
    string.push('  <nation name_long="' + this.name_long + '" name_short="' + this.name_short + '" code="' + this.code + '">' ) ;
    for(var i=0 ; i<this.continents.length ; ++i){
      string.push('    <continent name="' + this.continents[i] + '"/>' ) ;
    }
    for(var i=0 ; i<this.polygon_points_canvas.length ; ++i){
      var path = this.polygon_points_canvas[i] ;
      var path_string = [] ;
      for(var j=0 ; j<path.length ; ++j){
        path_string.push(path[j][0] + ','+path[j][1]) ;
      }
      string.push('    <path points="' + path_string.join(';') + '"/>') ;
    }
    string.push('  </nation>') ;
    return string.join('\n') ;
  }
}
