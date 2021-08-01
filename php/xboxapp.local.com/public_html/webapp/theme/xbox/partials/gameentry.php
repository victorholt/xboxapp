<li id="game-<?php echo (XBOXAPP_OFFLINE !== true ? $game['service_game_id'] : $game['id']); ?>">
	<div class="gameinfo">

		<div class="gamestats">	
			<div class="gamevotes" id="gamevotes-<?php echo (XBOXAPP_OFFLINE !== true ? $game['service_game_id'] : $game['id']); ?>"><?php echo $game['votes']; ?></div>
		</div>
		<div class="gametitle">
			<?php echo htmlentities(stripslashes(htmlspecialchars_decode($game['title'], ENT_COMPAT))); ?>

			<?php if (empty($owned)) { ?>
			<div class="gameactions">
				<a id="gamevote-<?php echo (XBOXAPP_OFFLINE !== true ? $game['service_game_id'] : $game['id']); ?>" href="javascript:void(0)" class="left" onclick="javascript: doVoteGame('<?php echo (XBOXAPP_OFFLINE !== true ? $game['service_game_id'] : $game['id']); ?>');">Vote</a>
				<a id="gameown-<?php echo (XBOXAPP_OFFLINE !== true ? $game['service_game_id'] : $game['id']); ?>" href="javascript:void(0)" class="right" onclick="javascript: doOwnGame('<?php echo (XBOXAPP_OFFLINE !== true ? $game['service_game_id'] : $game['id']); ?>');">Own</a>
				<div class="gameactions-bg"></div>
			</div>
			<?php } ?>
		<div>				

		<div class="cls"></div>
	</div>
</li>