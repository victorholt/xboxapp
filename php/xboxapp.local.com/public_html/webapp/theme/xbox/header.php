<!doctype html>
<html>
	<head>
		<title>XBox Game Voting - Nerdery Web Challenge</title>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="robots" content="noindex, nofollow" />

		<link rel="stylesheet" href="<?php echo \XBoxApp\Framework\View::get('css/style.css'); ?>" type="text/css" />

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	</head>

	<body>

		<div class="header">

			<div class="header-content">
				<h1 class="left"><a href="/">XBox Game Voting</a></h1>

				<div class="usermenu">
					<ul>
						<li>									
							<form name="AddGameForm" id="AddGameForm" method="post" action="" onsubmit="javascript: return doAddGame();">										
								<input type="text" name="gametitle" id="gametitle" placeholder="Game title you wish to add" />
								<a class="button" href="javascript: void(0);" onclick="javascript: doAddGame();"><span class="icon18">Z</span> Add Game</a>
							</form>
						</li>
					</ul>						
				</div>
				<div class="cls"></div>
			</div>
			
		</div>

		<div class="container">

			<div class="row">
				<div class="col span12">
					
					<div id="navmenu">
						<ul>
							<li><a href="/">Home</a></li>
							<li><a href="/owned">Owned Games</a></li>
							<li class="clearaction"><a href="/clear">Clear All Games</a></li>
						</ul>
						<div class="cls"></div>
					</div>

				</div>
			</div>

			<div class="row">
				<div class="col span12">

					<div id="pagemessage"></div>

				</div>
			</div>