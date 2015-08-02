function auto_play(){
  pause = !pause ;
  if(pause){
    Get('submit_play').value = 'Play' ;
  }
  else{
    Get('submit_play').value = 'Pause' ;
    heartbeat() ;
  }
}
function heartbeat(){
  if(pause) return ;
  var cn = current_nations ;
  cn.current_index = (cn.current_index==cn.acts.length-1) ? -1 : cn.current_index+1 ;
  cn.update_map() ;
  update_act_description() ;
  window.setTimeout(heartbeat, delay) ;
}

function keydown(event){
  var keyDownID = window.event ? event.keyCode : (event.keyCode != 0 ? event.keyCode : event.which) ;
  switch(keyDownID){
    case 37: // left
      prev_item() ;
      break ;
    case 38: // up
      var cn = current_nations ;
      cn.current_index = 0 ;
      cn.update_map() ;
      update_act_description() ;
      break ;
    case 39: // right
      next_item() ;
      break ;
    case 40: // down
      var cn = current_nations ;
      cn.current_index = cn.acts.length-1 ;
      cn.update_map() ;
      update_act_description() ;
      break ;
    case 32: // space
      event.preventDefault() ;
      auto_play() ;
  }
}

function next_item(){
  pause = true ;
  Get('submit_play').value = 'Play' ;
  var cn = current_nations ;
  cn.current_index = Math.min(cn.current_index+1, cn.acts.length-1) ;
  update_act_description() ;
  cn.update_map() ;
}
function prev_item(){
  pause = true ;
  Get('submit_play').value = 'Play' ;
  var cn = current_nations ;
  cn.current_index = Math.max(cn.current_index-1, -1) ;
  update_act_description() ;
  cn.update_map() ;
}

function map_click(event){
  return ;
}

function update_act_description(){
  var cn = current_nations ;
  if(cn.current_index<0){
    Get('td_date'   ).innerHTML = '' ;
    Get('td_nations').innerHTML = '' ;
    Get('td_action' ).innerHTML = '' ;
    return ;
  }
  var act = current_nations.acts[cn.current_index] ;
  var names = [] ;
  for(var i=0 ; i<act.nations.length ; ++i){
    names.push(nations[act.nations[i]].name_short) ;
  }
  var name = names.join(', ') ;
  Get('td_date'   ).innerHTML = act.date ;
  Get('td_nations').innerHTML = name ;
  Get('td_action' ).innerHTML = act.parent.statuses[act.status].description ;
}
