<?php
include_once($_SERVER['FILE_PREFIX']."/project_list/project_object.php") ;
$github_uri   = "https://github.com/aidansean/LGBT_maps" ;
$blogpost_uri = "http://aidansean.com/projects/?tag=LGBT_maps" ;
$project = new project_object("LGBT_maps", "LGBT map", "https://github.com/aidansean/LGBT_maps", "http://aidansean.com/projects/?tag=LGBT_maps", "LGBT_maps/images/project.jpg", "LGBT_maps/images/project_bw.jpg", "One of my more far reaching projects is the LGBT CERN group. It is a diverse group with people from across the world, and one of the issues that we care about is safety in different nations.  This project keeps track of progress in different nations.", "LGBT,Tools", "canvas,CSS,HTML,GoogleMaps,JavaScript,XML") ;
?>