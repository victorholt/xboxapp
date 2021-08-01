<?php
/**
 * This class handles storing/retrieving data from the database for games.
 *
 * I know this can be a bit redundant however this is mainly to make it easier
 * for the programmer to add/delete. This is more for the high-level usage.
 *
 * NOTE: I would not expect to have a 'sync' method in a "real-world" situation. This
 * 	  	 was mainly due to the fact that I was in a cabin (Monday-Tuesday) with no internet trying to
 *		   work on this project. However I thought it was quite a nice addition!
 *
 * @author 	Victor Holt
 */
namespace XBoxApp\Framework\Models;

class GameModel extends DbModel
{
	/**
	 * The constructor.
	 */
	public function __construct()
	{
		parent::__construct('games');
	}
	/**
	 * This method adds a game into the database.
	 *
	 * @param string $title The title of the game.
	 */
	public function add($title)
	{ 		
		// Make sure we have a name.
		if (empty($title)) return false;
		$title = htmlspecialchars(trim($title), ENT_COMPAT, 'UTF-8', false);

		// Check if we are using the service.
		if (XBOXAPP_OFFLINE !== true) {
			if (!$this->_serviceadd($title)) return false;
		} else {
			// Were we successful in adding this entry?
			if (!$this->_dbadd($title)) return false;
		}

		// Sync up our list with the database. We're NEVER caching results, only storing
		// them for ordering and 'offline' purposes. Results must always be synced and
		// show only the games from the web service... I hope this is acceptable!
		$this->sync();		

		return true;
	}
	/**
	 * This method performs the voting action for a game.
	 *
	 * @param string $id The game id (if NOT offline the Nerdery game id).
	 */
	public function vote($id)
	{
		// Find our game and perform the vote.
		$game = $this->findById($id);

		// Check if we own this game already.
		if (!empty($game) && $game['owned'] == 1) return false;

		// Check if we are using the service.
		if (XBOXAPP_OFFLINE === true) {			
			if (empty($game)) return false;
			$this->update($id, array('votes' => (int)(++$game['votes'])));
		} else {
			// Add a vote to the game.
			if (!ServiceApi::addVote($id)) return false;
		}

		// Sync up our database.
		$this->sync();		

		return true;
	}
	/**
	 * This method sets the game to the 'owned' status.
	 *
	 * @param string $id The game id (if NOT offline the Nerdery game id).
	 */
	public function own($id)
	{
		// Find our game and perform the vote.
		$game = $this->findById($id);

		// Check if we own this game already.
		if (!empty($game) && $game['owned'] == 1) return false;

		// Check if we are using the service.
		if (XBOXAPP_OFFLINE === true) {
			if (empty($game)) return false;
			$this->update($id, array('owned' => 1));
		} else {
			// Set the status to gotit.
			if (!ServiceApi::setGotIt($id)) return false;
		}

		// Sync up our database.
		$this->sync();

		return true;
	}
	/**
	 * This method returns to us a game given a title.
	 *
	 * @param string $title The title of the game we're searching for.
	 */
	public function findGameByTitle($title)
	{
		$title = htmlspecialchars(trim($title), ENT_COMPAT, 'UTF-8', false);
		$result = $this->fetchOne(array('title'=>$title));
		if (!empty($result)) {
			return $result;
		}

		// Nope..., not here bud!
		return null;
	}
	/**
	 * This method fetches data from a table and returns a SQLite3Result object.
	 *
	 * @param array $data An associative array on the data we wish to execute with.
	 */
	public function fetch($data = array(), $sort = 'votes DESC, title ASC')
	{
		// Make sure we're always getting the lastest games from the Nerdery service.
		$this->sync();

		return parent::fetch($data, $sort);
	}
	/**
	 * This method finds a game by the id. We need to overload this since we need to check XBOXAPP_OFFLINE.
	 *
	 * @param string $id The id of the row we wish to return.
	 */
	public function findById($id)
	{
		$result = null;
		if (XBOXAPP_OFFLINE === true) {
			$result = parent::findById($id);
		} else {
			$result = $this->fetchOne(array('service_game_id' => $id));
		}

		return $result;
	}
	/**
	 * This method truncates the data in the table and calls the clear game service method.
	 */
	public function clear()
	{
		parent::clear();

		// Clear from the service.
		if (XBOXAPP_OFFLINE !== true) {
			ServiceApi::clearGames();
		}
	}	
	/**
	 * This method allows us to add the game to the SQLite database.
	 *
	 * @param string $title The title of the game.
	 */
	private function _dbadd($title, $sync = 0, $serviceGameId = '', $votes = 1, $owned = 0)
	{
		// Check to see if we already have this entry.
		$result = $this->fetchOne(array('title' => $title));
		if (!empty($result)) return false;

		// Create the data array.
		$data = array(
			'title' => $title,
			'service_game_id' => $serviceGameId,
			'votes' => $votes,			
			'sync' => $sync,
			'owned' => $owned
		);

		// Insert the new game.
		$this->insert($data);

		return true;
	}
	/**
	 * This method allows us to add the game to the Nerdery database.
	 *
	 * @param string $title The title of the game.
	 */
	private function _serviceadd($title)
	{
		// Check to see if we already have this entry.
		$games = ServiceApi::getGames();
		if (!empty($games) && count($games)) {
			foreach ($games as $game) {
				if ($game->title == $title) return false;
			}
		}

		ServiceApi::addGame($title);
		return true;
	}
	/**
	 * This method performs a sync with the games database from the Nerdery service database.
	 *
	 * Using this method ensures we are always getting the latest games from the web service
	 * and that we are not just using cache results. I've mentioned this a few times already
	 * that I hope this is acceptable due to my first couple of days restraints. When offline
	 * mode is turned 'off' we use SQLite purely as a way to sort and do some Ajaxy stuff.
	 */
	private function sync()
	{	
		// Check if we're in offline mode.
		if (XBOXAPP_OFFLINE === true) return false;

		// If we were in offline mode I'd go ahead and add all the games that were not
		// added to the service by checking if sync = 0. This was mainly if I was working
		// without the internet or if for some reason the Nerdery service was down for some
		// period of time. I'm not sure how useful this will be but I've implemented for fun.
		$unsyncedGames = parent::fetch(array('sync' => 0));
		while ($game = $unsyncedGames->fetchArray())
		{
			ServiceApi::addGame($game['title']);

			// This doesn't work well with games the owning part... There's no elegant way to do it
			// other than grabbing the list and setting them to owned. boooo! This is for testing
			// mostly so I'll just skip it since this case will never really exist.

			// This goes also for the votes in offline mode... they don't transfer over in this implementation.
			// None of these issues would be hard to implement really...

			// Essentially, no votes or owned games will be synced, only the titles.
		}

		// Clear out our current games since they are at this point, invalid!		
		parent::clear();

		// Get the games from the service call and readd them to our sqlite3 database.
		$games = ServiceApi::getGames();
		if (!empty($games) && count($games)) {
			foreach ($games as $game) {
				$this->_dbadd($game->title, 1, $game->id, $game->votes, ($game->status === 'gotit' ? 1 : 0));
			}
		}

		return true;
	}	
}
?>