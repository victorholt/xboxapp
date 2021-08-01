<?php

// General Declartions for Security and Freshness.
header('Server: ');	// Some servers don't support this feature however some do!
header('X-Powered-By: ');

// I wanted to share this bit from: http://james.cridland.net/code/caching.html
// I just like the title... great snippet! You can feel the seriousness in that
// third line.
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT"); 
header("Cache-Control: no-store, no-cache, must-revalidate"); 
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Typically I use these two line:
// header('Cache-Control: no-cache, must-revalidate');
// header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
// But the above version just yells, DO NOT CACHE ME STUFF!

// Our webapp path so we can correctly discover files.
$webappPath = dirname(__FILE__).DIRECTORY_SEPARATOR.'webapp'.DIRECTORY_SEPARATOR;

// We're running an object-oriented "light" mvc framework which requires one line to startup.
// Since we're using namespaces we'll need to ensure we are running PHP 5.3+!
require_once('.'.DIRECTORY_SEPARATOR.'webapp'.DIRECTORY_SEPARATOR.'config.php');
require_once('.'.DIRECTORY_SEPARATOR.'webapp'.DIRECTORY_SEPARATOR.'application.php');

// Start the web application.
\XBoxApp\Application::startup();

?>