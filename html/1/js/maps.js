var lat1 =  40 ; var lat2 =  63 ;
var lng1 =   0 ; var lng2 =  10 ;

//lat1 =  51 ; lat2 = 60 ;
//lng1 = -14 ; lng2 =  0 ;

lat1 =   35 ; lat2 =  70 ;
lng1 =  -20 ; lng2 =  45 ;

var map = null ;

var mapOptions = {
  center: new google.maps.LatLng(0.32*(lat1+2*lat2), 0.5*(lng1+lng2)),
  zoom: 4,
  disableDoubleClickZoom: true,
  minZoom: 4,
  maxZoom: 11
} ;

