<?php
/**
 * This class handles making calls to the Nerdery Service.
 * Since there should only ever be one instance of this object
 * we'll make it a singleton.
 *
 * @author 	Victor Holt
 */
namespace XBoxApp\Framework\Models;

class ServiceApi
{
	/** @var ServiceApi $_instance The service API instance. */
	private static $_instance = null;

	/** @var string $apiKey The api key for the service. */	
	private $_apiKey = '1e3770e6a35a899e14a13f34ddd1e481';

	/** @var SoapClient $client The SOAP client object. */	
	private $_client = null;

	/**
	 * The object constructor.
	 */
	private function __construct()
	{
		// Attempt to create the SoapClient object.
		try {
			$this->_client = @new \SoapClient('http://xbox.sierrabravo.net/v2/xbox.wsdl'); // @ never thought about using that... makes sense though.
		} catch (Exception $e) {
			$this->_client = null;
			Application::throwException($e->getMessage());
		}
	}
	/**
	 * This method returns to us an instance of the Database object.
	 */
	public static function instance()
	{		
		// Check if we need to create the instance of our Database.
		if (static::$_instance === null) {
			static::$_instance = new ServiceApi();
		}		
		return static::$_instance;
	}
	/**
	 * This method checks to verify that the apiKey provided is a valid key.
	 */
	public static function checkKey()
	{
		return static::client()->checkKey(static::key());
	}
	/**
	 * This method is used to retrieve a list of all games and the number of votes for each. This procedure 
	 * will return an array of game objects. A game object contains the id, title, status and votes for the 
	 * game.
	 */
	public static function getGames()
	{
		// Ensure we have our client object set.
		if (static::client() == false) return false;

		return static::client()->getGames(static::key());
	}
	/**
	 * This method is used to increment the vote counter for a specific game. The service does not provide 
	 * any restrictions on how many votes can be added for a title.
	 */
	public static function addVote($gameId)
	{
		// Ensure we have our client object set.
		if (static::client() == false) return false;

		return static::client()->addVote(static::key(), $gameId);
	}
	/**
	 * This method is used to add a new game title to the vote list. There are no restrictions on how many 
	 * titles can be added. The service will add the first vote for the title upon being added. The service will 
	 * provide no sanitization of input.
	 */
	public static function addGame($title)
	{
		// Ensure we have our client object set.
		if (static::client() == false) return false;

		return static::client()->addGame(static::key(), $title);
	}
	/**
	 * This method is used to set the status of a game to "gotit".
	 */
	public static function setGotIt($gameId)
	{
		// Ensure we have our client object set.
		if (static::client() == false) return false;

		return static::client()->setGotIt(static::key(), $gameId);
	}
	/**
	 * This method is used to clear all games and votes.
	 */
	public static function clearGames()
	{
		// Ensure we have our client object set.
		if (static::client() == false) return false;

		return static::client()->clearGames(static::key());
	}
	/**
	 * This method returns the client object.
	 */
	public static function client()
	{
		return static::instance()->_client;
	}
	/**
	 * This method returns the api key... or sets it if we ever needed to do that.
	 *
	 * @param string $apiKey Optional parameter if we wanted to set the api key to something else.
	 */
	public static function key($apiKey = null)
	{
		if (!empty($apiKey)) {
			static::instance()->_apiKey = $apiKey;	
		}
		return static::instance()->_apiKey;
	}
}
?>