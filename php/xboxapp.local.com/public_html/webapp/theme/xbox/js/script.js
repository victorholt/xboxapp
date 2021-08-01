/**
 * The global javascript file.
 */

// This method handles adding games to the database.
function doAddGame(title)
{
	$.ajax({
		type: 'POST',
		url: '/addgame',
		data: 'title='+$("#gametitle").val(),
		dataType: 'json',
		success: function(data) {
			if (data.success === 1) {
				displayMessage("You have successfully added your game!", "success");

				// Hide the no game message if it is there.
				$("#nogame-message").hide();

				// We should add the game to the list at the bottom.
				$("#gamelist ul").append(data.html);
				$("#gametitle").val('');

			} else if (data.success === 2) {
				displayMessage(data.message, "error");
				$("#gametitle").val('');
			} else {
				displayMessage("I'm sorry, but the game you attempted to add was invalid. Please try a different title!", "error");
				$("#gametitle").val('');
			}
		}, error: function(xhr, options, thrownError) {
			displayMessage("There seems to have been an issue with our server. Please try again!", "error");
			$("#gametitle").val('');
		}
	});

	return false;
}
// This method handles adding games to the database.
function doVoteGame(id)
{
	$.ajax({
		type: 'POST',
		url: '/votegame',
		data: 'id='+id,
		dataType: 'json',
		success: function(data) {
			if (data.success === 1) {
				displayMessage("You voted for the game '"+data.title+"'. Tomorrow you will be able to vote again!", "success");

				// Update the votes.
				$("#gamevotes-"+data.useId).html(data.votes);
				reorderList();		

			} else {
				displayMessage(data.message, "error");
				$("#gametitle").val('');
			}
		}, error: function(xhr, options, thrownError) {
			displayMessage("There seems to have been an issue with our server. Please try again!", "error");
			$("#gametitle").val('');
		}
	});

	return false;
}
// This method handles adding games to the database.
function doOwnGame(id)
{
	$.ajax({
		type: 'POST',
		url: '/owngame',
		data: 'id='+id,
		dataType: 'json',
		success: function(data) {
			if (data.success === 1) {
				displayMessage("You have successfully added '"+data.title+"' game to your list of owned games!", "success");

				// Remove this game from our list.
				$("#gameown-"+data.useId).html('Bye!');
				$("#game-"+data.useId).fadeOut(800);

			} else {
				displayMessage("Hey buddy, did you know that you already own this game?", "success");
				$("#gametitle").val('');
			}
		}, error: function(xhr, options, thrownError) {
			displayMessage("There seems to have been an issue with our server. Please try again!", "error");
			$("#gametitle").val('');
		}
	});

	return false;
}

// This method displays a common message to the user.
function displayMessage(message, className, delay)
{
	// Make sure our message is hidden initially.
	$("#pagemessage").hide();

	// Set the default values of the variables.
	if (!className) className = "info";
	if (!message) message = "The meaning of life is 42, that is all";
	if (!delay) delay = 10000;

	$("#pagemessage").attr('class', className);
	$("#pagemessage").html(message);

	$("#pagemessage").slideToggle(300);

	// Scroll to the top so we can see the message.
	$("html, body").animate({ scrollTop: 0 }, "slow");
}

// Quick way to disable the enter key for a form.
function disableEnterOnForm(formId)
{
	$('input[type=text]').keypress(function(e) {
		if (e.which == 13 && e.target.type != 'textarea') {
			e.preventDefault();
			$("#"+formId).submit();
		}
	});
}

// This function reorders the list items.
// This function is called when a user votes on an item.
function reorderList()
{
	// Basic Concept, although I think that implementation is a bit buggy:
	// http://stackoverflow.com/questions/8123525/using-jquery-to-re-order-and-animate-list-items

	// Note: We assume a couple of things here.
	// 1.) When we have our list it's already ordered by votes.
	// 2.) The user will only vote once and thus this only needs to be reshuffled only once.

	// ALSO BEWARE THAT THIS IS VERY VERY BUGGY and in the early stages. I just made this up
	// to be cool. It does however make the ordering somethings a bit janky...

	// Cycle through our list elements.
	$("#gamelist li").each(function() {
		var curItem = this;
		var curItemVotes = parseInt($(this).children('div.gameinfo').children('div.gamestats').children('div.gamevotes').html());

		var listHeight = $("div#gamelist ul").innerHeight();
		var elemHeight = $(curItem).height();
		var elemTop = $(curItem).position().top;
		var moveUp = listHeight - (listHeight - elemHeight)+3;
		var moveDown = elemHeight+3;
		var finished = false;

		// Go through the list again and find any items that should be above this list item.
		// Btw, we're going to be the cool guy and traverse in reverse!
		$($("#gamelist li").get().reverse()).each(function() {
			var votes = parseInt($(this).children('div.gameinfo').children('div.gamestats').children('div.gamevotes').html());

			// Skip if we're attempt to evaluate ourself.
			if ($(curItem).attr('id') != $(this).attr('id')) {
				
				if ( (votes > curItemVotes) && (elemTop < $(this).position().top) ) {
					var moveElemId = $(this).attr('id');
					var startMoving = false;
					
					// Every element needs to move down.
					$("#gamelist li").each(function() {
						if ($(curItem).attr('id') == $(this).attr('id')) startMoving = true;
						if (moveElemId == $(this).attr('id')) return false; // We're done!

						// Lets get'em moving!
						if (startMoving)
							$(this).animate({'top' : '+=' + moveDown}, 1000);
					});

					// Move our element to the correct position.
					$(this).animate({
						opacity: 0.25,
						top : '-= 100'
					}, 1000, function() {
						updateList(); // cheating to ensure quality...
					});

					// We're done...
					finished = true;
					return false;
				}
			}				
		});

		if (finished) return false;
	});
}

// This method simply updates the list html.
function updateList()
{
	$.ajax({
		type: 'POST',
		url: '/gamelist',
		dataType: 'html',
		success: function(data) {
			$('div.content.gamelistarea').html(data);
		}, error: function(xhr, options, thrownError) {
		}
	});

	return false;
} 

// Global startup method for the web application.
$(document).ready(function() {
	disableEnterOnForm('AddGameForm');

  // Enable Placeholder. Allows us to have placeholders in IE... even though I know you
  // guys are using Chrome, it's still a nice/useful snippet! :)
	//
  // Source: http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
	$('[placeholder]').focus(function() {
		var input = $(this);
		if (input.val() == input.attr('placeholder')) {
			input.val('');
			input.removeClass('placeholder');
		}
	}).blur(function() {
		var input = $(this);
		if (input.val() == '' || input.val() == input.attr('placeholder')) {
			input.addClass('placeholder');
			input.val(input.attr('placeholder'));
		}
	}).blur();
});