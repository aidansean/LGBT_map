var EU_blue = 'rgb(0,0,153)' ;
var blank_nation_color = 'rgb(178,178,178)' ;
blank_nation_color = 'rgb(179,220,171)' ;

var pause = true ;
var delay = 1000 ;

var default_fillColor     = 'rgb(255,255,255)' ;
var default_fillOpacity   = 0.0 ;
var default_strokeColor   = 'rgb(0,0,0)' ;
var default_strokeOpacity = 1.0 ;
var default_strokeWeight  = 0.0 ;

var dlng = 1.0 ;
var lines = [] ;
for(var lng=-179.5 ; lng<180.5 ; lng+=dlng){ lines.push([[-80,lng],[80,lng+45]]) ; }

var mode = 'google' ;
var canvas  = null ;
var context = null ;
