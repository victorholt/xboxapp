<?php

/**
 * The request handles basic requests functionality. This is more of a utility class
 * for gathering information about the post/get variables.
 *
 * @author:	Victor Holt
 */
namespace XBoxApp\Framework;

class Request
{
	/**
	 * This method returns the URI
	 */
	public static function uri()
	{
		return static::server('REQUEST_URI');
	}
	/**
	 * This method returns a server variable based upon the key given.
	 */
	public static function server($key)
	{
		if (isset($_SERVER[$key])) {
			return $_SERVER[$key];
		}

		return null;
	}
	/**
	 * This method returns a value in the post.
	 */
	public static function post($key, $default = null)
	{
		if (isset($_POST[$key])) {
			return $_POST[$key];
		}

		return $default;
	}
	/**
	 * This is just a simple method that returns whether or not we have variables in our $_POST variable.
	 */
	public static function hasPost()
	{
		return isset($_POST); // I think it might be safer to use isset than empty in this case... I need to think that over again TODO!
	}
	/**
	 * This is just a simple method that returns whether or not we have variables in our $_GET variable.
	 */
	public static function hasGet()
	{
		return isset($_GET);
	}
	/**
	 * This method returns a value in the get.
	 */
	public static function get($key, $default = null)
	{
		if (isset($_GET[$key])) {
			return $_GET[$key];
		}

		return $default;
	}
	/**
	 * This method returns a value in the request.
	 */
	public static function param($key, $default = null)
	{
		if (isset($_REQUEST[$key])) {
			return $_REQUEST[$key];
		}

		return $default;
	}
	/**
	 * This method returns the client ip.
	 */
	public static function clientIp($proxy = true)
	{
		if ($proxy && static::server('HTTP_CLIENT_IP') != null) {
    	$ip = static::server('HTTP_CLIENT_IP');
    } else if ($proxy && static::server('HTTP_X_FORWARDED_FOR') != null) {
      $ip = static::server('HTTP_X_FORWARDED_FOR');
    } else {
      $ip = static::server('REMOTE_ADDR');
    }

    return $ip;
	}
}

?>