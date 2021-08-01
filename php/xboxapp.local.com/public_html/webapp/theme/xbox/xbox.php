<?php

/**
 * $Theme Name: XBox Theme
 * $Theme Description: Theme for the XBox Voting Application.
 * $Theme Version: 1.0
 * $Theme Author: Victor
 * $Theme URI: http://victorholt.me
 */
namespace XBoxApp\Theme\XBox;

// Our light-weight framework tools.
use XBoxApp\Framework\ThemeProvider;
use XBoxApp\Framework\RouteProvider;
use XBoxApp\Framework\Request; // I really should have made this a proper singleton...

// Santize our inputs and handle service/database calls with models. NO Little Bobby Tables here!
// I'll just leave this here: http://bobby-tables.com/
use XBoxApp\Framework\Models\GameModel;
use XBoxApp\Framework\Models\UserModel;

class XBox extends \XBoxApp\Framework\Theme
{
	/**
	 * The constructor.
	 */
	public function __construct()
	{
		$this->name = 'xbox';

		// There really should be a static method like, UserModel::checkUser. This simply checks/adds
		// the user to the system. It will clear out any invalid cookies from when someone clicks the
		// 'clear all games' link.
		$model = new UserModel();
	}
	/**
	 * This method initializes the theme before the view is rendered.
	 */
	public function init()
	{
		// Set the available routes for this theme.		

		// Our index route.
		RouteProvider::add('/', function($route) {
			// Get the users.
			$model = new GameModel();
			$games = $model->fetch(array('owned' => 0));

			// The 'owned' parameter is just a setting to let us know which page we're viewing.
			ThemeProvider::theme()->render('index', array('games' => $games, 'owned' => 0));
		});

		// Our owned games route.
		RouteProvider::add('/owned', function($route) {
			$model = new GameModel();
			$games = $model->fetch(array('owned' => 1), 'title ASC');

			// The 'owned' parameter is just a setting to let us know which page we're viewing.
			ThemeProvider::theme()->render('index', array('games' => $games, 'owned' => 1));
		});

		// Our clear games route.
		RouteProvider::add('/clear', function($route) {
			// Clear out the list.
			$model = new GameModel();
			$model->clear();

			// Clear out the users so they can vote again! Yeah!
			$userModel = new UserModel();
			$userModel->clear();

			// Redirect to the index page.
			RouteProvider::redirect('/', 301);
		});

		// AJAX ROUTES //

		// Add a game.
		RouteProvider::add('/addgame', function($route) {

			// Make sure we have a post, otherwise we're just wasting our time ya know!
			if (Request::hasPost()) {
				// Check if the current user has already added a game today.
				$userModel = new UserModel();
				$message = '';
				
				if (!$userModel->canVote($message)) {
					echo json_encode(array('success' => 2, 'message' => $message));
				} else {

					$model = new GameModel();
					$title = Request::post('title');

					// Add and send the results to the client.
					if (!empty($title) && $model->add($title)) {
						// Find that last game we inserted by the title.
						$game = $model->findGameByTitle($title);

						// Adding counts as a vote so update the user vote.
						$userModel->vote();

						// The html to send back of the game entry.
						ob_start();
						\XBoxApp\Framework\View::render('partials/gameentry.php', array('game'=>$game));
						$html = ob_get_contents();
						ob_end_clean();							

						echo json_encode(array('success'=>1, 'html'=>$html, 'gameId'=>$game['id']));
					} else {
						echo json_encode(array('success'=>0));
					}

				}
			} else {
				ThemeProvider::theme()->render('404');	
			}

		});

		// Vote for a game.
		RouteProvider::add('/votegame', function($route) {

			// Make sure we have a post, otherwise we're just wasting our time ya know!
			if (Request::hasPost()) {
				$model = new GameModel();
				$gameId = Request::post('id');

				// Check if the current user has already added a game today.
				$userModel = new UserModel();
				$message = '';

				// Vote on the game.
				if (!empty($gameId) && $userModel->canVote($message) && $model->vote($gameId)) {
					// Find the game by the id.
					$game = $model->findById($gameId);

					// Update the user vote.
					$userModel->vote();
					
					$jsonData = array(
						'title' => $game['title'],
						'id' => $game['id'],
						'service_game_id' => $game['service_game_id'],
						'useId' => (XBOXAPP_OFFLINE === true ? $game['id'] : $game['service_game_id']),
						'votes' => $game['votes'],
						'owned' => $game['owned'],
						'success' => 1
					);
					echo json_encode($jsonData);					
				} else {
					echo json_encode(array('success'=>0, 'message' => $message));
				}
			} else {
				ThemeProvider::theme()->render('404');	
			}

		});

		// Own a game.
		RouteProvider::add('/owngame', function($route) {

			// Make sure we have a post, otherwise we're just wasting our time ya know!
			if (Request::hasPost()) {
				$model = new GameModel();
				$gameId = Request::post('id');

				// Pwn this game!
				if (!empty($gameId) && $model->own($gameId)) {
					// Find the game by the id.
					$game = $model->findById($gameId);

					$jsonData = array(
						'title' => $game['title'],
						'id' => $game['id'],
						'service_game_id' => $game['service_game_id'],
						'useId' => (XBOXAPP_OFFLINE === true ? $game['id'] : $game['service_game_id']),
						'votes' => $game['votes'],
						'owned' => $game['owned'],
						'success' => 1
					);
					echo json_encode($jsonData);
				} else {
					echo json_encode(array('success'=>0));
				}
			} else {
				ThemeProvider::theme()->render('404');	
			}

		});

		// Simple method to render the game list.
		RouteProvider::add('/gamelist', function($route) {
			// Make sure we have a post, otherwise we're just wasting our time ya know!
			if (Request::hasPost()) {
				// Get the users.
				$model = new GameModel();
				$games = $model->fetch(array('owned' => 0));
				\XBoxApp\Framework\View::render('partials/gamelist', array('games' => $games, 'owned' => 0));

			} else {
				ThemeProvider::theme()->render('404');	
			}
		});
		
		// Set the error (404) page.
		RouteProvider::error(function() {
			ThemeProvider::theme()->render('404');
		});
	}
}

?>