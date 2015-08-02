<?php
$title = 'Same sex marriage in Europe' ;
$js_scripts  = array() ;
$js_scripts[] = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD92hg1tP-8tcUZFm7M56vqk0TZayfo-l0&sensor=false' ;
$js_scripts[] = 'js/settings.js'         ;
$js_scripts[] = 'js/xml.js'              ;
$js_scripts[] = 'js/nation_list.js'      ;
$js_scripts[] = 'js/functions_canvas.js' ;
$js_scripts[] = 'js/controls.js'         ;
$js_scripts[] = 'js/data.js'             ;
$js_scripts[] = 'js/maps.js'             ;
$stylesheets = array('style.css') ;
$fb_image = 'screenshot3.jpg' ;
include($_SERVER['FILE_PREFIX'] . '/_core/preamble.php') ;
?>
  <div class="right">
    <div class="blurb center">
      <p>This page has a map of Europe showing the legal recognition of same sex unions and marriage by nation.</p>
      <div class="center">
        <input type="submit" id="submit_prev" value="Back"/>
        <input type="submit" id="submit_play" value="Play"/>
        <input type="submit" id="submit_next" value="Forward"/>
      </div>
      <div id="div_canvas_wrapper">
        <canvas id="div_map" width="750" height="600"></canvas>
      </div>
      <table id="table_notes">
        <tbody>
          <tr>
            <th id="th_date">Date</th>
            <td id="td_date"></td>
          </tr>
          <tr>
            <th id="th_nations">Nations</th>
            <td id="td_nations"></td>
          </tr>
          <tr>
            <th id="th_action">Action</th>
            <td id="td_action"></td>
          </tr>
        </tbody>
      </table>
      <div id="div_keys_wrapper"></div>
      <p>Sources: Wikipedia (<a href="http://en.wikipedia.org/wiki/LGBT_rights_in_Europe">http://en.wikipedia.org/wiki/LGBT_rights_in_Europe</a>)<br />
      National borders: <a href="https://github.com/mledoze/countries">https://github.com/mledoze/countries</a></p>
    </div>
    <div style="display:none"><img src="images/screenshot3.jpg"/></div>
    <div id="div_hatches" style="display:none"></div>
  <div>

<?php foot() ; ?>
