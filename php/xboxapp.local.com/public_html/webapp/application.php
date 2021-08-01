<?php
/**
 * This class handles method of the base framework. This is a class that acts as a singleton in which we
 * use static methods mostly. This class also handles the autoloading for the web application. We don't
 * necessarily have an "instance" variable, only static methods.
 *
 * @author 	Victor Holt
 */
namespace XBoxApp;

use XBoxApp\Framework\ThemeProvider;
use XBoxApp\Framework\Theme;
use XBoxApp\Framework\RouteProvider;
use XBoxApp\Framework\View;
use XBoxApp\Framework\Database;

class Application
{
	/** @var string $mode This variable tells us if we're in debug mode or production. **/
	public static $mode = XBOXAPP_MODE;

	/**
	 * This method handles starting up the framework and kicking off the autoloading process.	 
	 */
	public static function startup()
	{
		// Make sure we're compliant with the system requirements for this application.
		// Do however check which mode we're in, we don't want to give out information
		// on our production server!
		if (static::$mode === XBOXAPP_MODE_DEBUG) {			
			error_reporting(E_ALL | E_STRICT);
		} else {
			error_reporting(E_NONE);
		}

		// Register our autoloader.
		spl_autoload_register("\\XBoxApp\\Application::autoload");

		// Set our current theme for the framework.
		ThemeProvider::set(XBOXAPP_THEME);

		// Use our route provider to discover and execute our current uri.
		RouteProvider::find();

		// Close the database connection if we have one open.
		Database::close();
	}
	/**
	 * This method handles throwing exceptions in the framework. We are creating this function
	 * because we'll not want to throw any exceptions during production... instead we'll die
	 * in a graceful and manly manner like in the French and English wars.
	 *
	 * @param string $message The message we'd like to report when we throw the exception.
	 * @param string $type The type of message we want to throw... this is not being used at the moment.
	 */
	public static function throwException($message, $type = null)
	{
		if (static::$mode === XBOXAPP_MODE_DEBUG)
		{
			throw new \Exception($message);
		}
	}
	/**
	 * This method handles the autoloading of classes in the framework. There are many ways
	 * to handling including files and this is the one we're choosing for this project.
	 *
	 * @param string $className The name of the class that we're attempting to load.
	 */
	public static function autoload($className)
	{		
		// Our path to the framework.		
		global $webappPath;

		// We don't really need the 'XBoxApp' part of the path.
		$className = str_replace('\\XBoxApp\\', '', $className);
		$className = str_replace('XBoxApp\\', '', $className);

		$className = str_replace('\\', DIRECTORY_SEPARATOR, $className); // Just ensure that we're using the correct type of directory separator.
		$filePath = $webappPath.strtolower($className).'.php';

    // Check if we can load the filePath.
    if (!file_exists($filePath)) {
			return static::throwException('Failed to find file: '.$filePath.' for ('.$className.')');
    }

    require_once($filePath);
	}
}

?>