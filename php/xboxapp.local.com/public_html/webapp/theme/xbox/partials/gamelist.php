<?php
// This file displays the list of games from the controller.
$gameRow = $games->fetchArray();
if (empty($games) || empty($gameRow)) {
?>

<div id="gamelist">
	<div id="nogame-message">
		<?php if (empty($owned)) {
			echo 'There are currently no games added to the list.';
		} else {
			echo 'There are no games that you currently own.';
		} ?>	
	</div>
	<ul>		
	</ul>
</div>

<?php	
} else { 
	// With the above check we may have offset the results array... Using sqlite we don't have a way
	// to check the num columns returned.
	$games->reset(); 
?>

<div id="gamelist">
	<ul>
		<?php while ($game = $games->fetchArray()) { 
			\XBoxApp\Framework\View::render('partials/gameentry.php', array('game'=>$game, 'owned' => $owned));
		} ?>
	</ul>
</div>
		
<?php } ?>