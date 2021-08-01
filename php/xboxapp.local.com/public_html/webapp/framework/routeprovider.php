<?php

/**
 * This class handles any routing for the system. We do use
 * closures so be sure to have PHP 5.3+!
 *
 * This routing system is very similar to what you'll find in Laravel, AngularJS, CanJS, etc...
 * I feel it's more modern however by no means the only way or the best way to go!
 *
 * @author:	Victor Holt
 */
namespace XBoxApp\Framework;

class RouteProvider
{
	/** @var array The parameters in the current route. */
	public static $params = array();
	/** @var array The added route objects. */
	public static $routes = array();
	/** @var Closure The error callback when we can't find a route. */
	public static $error_callback = null;

	/**
	 * This method adds a route pattern.
	 */
	public static function add($pattern, $callback)
	{
		// Create a route for this pattern and add it to our array.
		$route = new Route($pattern, $callback);
		static::$routes[] = $route;
	}
	/** 
	 * This method handles the functionality when a route cannot be found.
	 */
	public static function error($callback = null)
	{		
		// If we don't have an empty callback we're attempting to set the callback, otherwise
		// we want to perform the action.
		if (!empty($callback)) {
			static::$error_callback = $callback;
		} else {
			// Set the default error callback if necessary.
			if (empty(static::$error_callback)) {
				static::$error_callback = function() {
					echo '404 - Sorry, the page you were looking for does not exists.';
				};
			}

			// Run the error.
			return call_user_func_array(static::$error_callback, array());
		}
	}
	/**
	 * This method finds the current route and executes the route if an object exists.
	 */
	public static function find()
	{
		// Check if we have any routes.
		if (empty(self::$routes)) return static::error();

		$uri = Request::uri();

		// Go through the routes and check the pattern.
		foreach (self::$routes as $route) {
			if ($route->isUri($uri)) {
				$route->go();
				return true;
			}
		}

		// Nothing was found...

		// Set the error before printing anything out.
		header("HTTP/1.1 404 Not Found");
		return static::error();
	}
	/**
	 * This method performs various redirect methods.
	 *
	 * @param string $redirect The uri we wish to redirect too.
	 * @param int $code The redirect code we are going to use (301, 404, etc).
	 */
	public static function redirect($redirect, $code = 0)
	{
		if ($code !== 404) {
			switch ($code) {
				case 200:
					header("HTTP/1.1 200 OK"); 
					break;
				case 301:
					header("HTTP/1.1 301 Moved Permanently"); 
					break;
				case 403:
					header("HTTP/1.1 403 Forbidden"); 
					break;
				case 500:
					header("HTTP/1.1 500 Internal Server Error"); 
					break;
				case 100:
					header('Refresh: 0; url='.$redirect);
					break;
				default:
					break;
			}

			header("Location: $redirect");
			header("Connection: close");
		} else {
			header("HTTP/1.1 404 Not Found");
			header("Location: $redirect");
		}

		exit;
	}
}

?>