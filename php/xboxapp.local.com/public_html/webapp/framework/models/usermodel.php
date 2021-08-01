<?php
/**
 * This class handles user-related methods.
 *
 * @author 	Victor Holt
 */
namespace XBoxApp\Framework\Models;

class UserModel extends DbModel
{
	/**
	 * The constructor.
	 */
	public function __construct()
	{
		parent::__construct('users');

		// Add the user to the database if they're not already in there.
		$this->_add();
	}
	/**
	 * This method sets the vote parameter for today.
	 */
	public function vote()
	{
		// Get the userId.
		$userId = $_COOKIE['xboxapp_user_id'];

		// Check if we can vote.
		if (empty($userId) || !$this->canVote()) return false;

		// Update the user's information.
		$data = array(
			'last_vote' => date('Y-m-d H:i:s', time())
		);
		$this->update($userId, $data);
	}
	/**
	 * This method checks if the current user can vote.
	 *
	 * @param string $message A reference to the message string so we can set the error message on the page.
	 */
	public function canVote(&$message = '')
	{
		// Check if we want to ignore this condition.
		if (IGNORE_USER_VOTES === true) return true;

		// Get the userId.
		$userId = isset($_COOKIE['xboxapp_user_id']) ? $_COOKIE['xboxapp_user_id'] : null;

		// Make sure we have a userId, otherwise something is seriously wrong!
		if (empty($userId)) return false;

		// Get the user information and check accordingly.
		$user = $this->findById($userId);
		if (empty($user)) return false;		// Wow..., so we have your id but we screwed up with it!

		$lastVote = strtotime($user['last_vote']);
		
		// Check if we're on a weekend day.
		// We'll check with numbers since that's a constant we can rely on!
		if (date('N', time()) == 6 || date('N', time()) == 7) {
			$message = 'Sorry, but the game voting application is closed on Saturday and Sunday.';
			return false;
		}

		// Check if we've already voted today.
		if (date('Y-m-d', time()) == date('Y-m-d', $lastVote)) {
			$message = "I'm sorry, but it seems you've either added or voted for a game today. Try again tomorrow!";
			return false;
		}

		// We're good, you're eligebaible vote! <Grammer/Spelling Nazi Better Not Try Me Right Now!>
		return true;
	}
	/**
	 * This method adds a user into the database.
	 *
	 * @param string $title The title of the game.
	 */
	private function _add()
	{ 
		// Check to see if the user has a cookie set already from us.
		$userId = isset($_COOKIE['xboxapp_user_id']) ? $_COOKIE['xboxapp_user_id'] : null;
		$user = null;

		if (!empty($userId)) $user = $this->findById($userId);

		// The reason for this sort of check is that there is a case where we can clear out
		// the user database when all games/votes have been cleared. In this case we will want
		// users to be allowed the opportunity to vote once again. 
		if (empty($user)) {
			// Delete any previous cookie.
			setcookie('xboxapp_user_id', '', time()-3600, '/');

			$data = array(
				'creation_date' => date('Y-m-d H:i:s', time())
			);
			$userId = $this->insert($data);

			// Save the cookie.
			setcookie('xboxapp_user_id', $userId, time()+512345600, '/');	// It's not going away so easily!
		}	

		return true;
	}
}
?>