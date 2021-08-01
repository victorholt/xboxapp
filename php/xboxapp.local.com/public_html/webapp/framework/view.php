<?php

/**
 * This class handles rendering views for the system.
 *
 * @author:	Victor Holt
 * @date:		Oct. 26, 2012
 */
namespace XBoxApp\Framework;

class View
{
	/** @var string The path to the theme. */
	public static $themePath = '';	

	/**
	 * This method sets/returns the theme path.
	 */
	public static function path($themePath = null)
	{
		if (!empty($themePath)) {
			// Our path to the webapp directory.
			global $webappPath;

			// We don't really need the 'XBoxApp' part of the path.
			$themePath = str_replace('\\XBoxApp\\', '', $themePath);
			$themePath = str_replace('XBoxApp\\', '', $themePath);
			$themePath = $webappPath.$themePath.DIRECTORY_SEPARATOR;

			static::$themePath = strtolower($themePath);
		}
		return static::$themePath;
	}
	/**
	 * This method returns a filepath for a given file. It gives us a URL friendly path so we don't have
	 * our full directory path returned.
	 *
	 * @param string $fileName The name of the file we want to return the path for.
	 */
	public static function get($fileName)
	{
		// Our path to the webapp directory.
		global $webappPath;

		// Transform the path to the URL-friendly version.
		$path = static::path().$fileName;		
		$path = preg_replace("/^".str_replace(DIRECTORY_SEPARATOR, '\\'.DIRECTORY_SEPARATOR, $webappPath)."/i", "", $path);
		$path = '/webapp/'.str_replace(DIRECTORY_SEPARATOR, '/', $path);
		return $path;
	}
	/**
	 * This method renders a view in a particular theme.
	 */
	public static function render($fileName, $data = array())
	{
		// Find the path to the view.
		$path = static::path().$fileName;
		$path = str_replace('\\', DIRECTORY_SEPARATOR, $path); // Just in case you're wondering, on mac without doing this properly you can really mess things up in MAMP...

		// Extract any variables in the data array.
		if (!empty($data)) extract($data);

		// Attempt to render the view file.
		if (file_exists($path.'.php')) {
			include ($path.'.php');
		} else if (file_exists($path)) {
			include ($path);
		}
	}
}

?>