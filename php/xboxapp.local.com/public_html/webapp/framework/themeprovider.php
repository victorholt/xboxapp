<?php

/**
 * This class handles any theming for the framework. It's a simple 'theme' class
 * for doing general MVC-like theming. Inspired a bit by Wordpress. :)
 *
 * @author:	Victor Holt
 */
namespace XBoxApp\Framework;

// This class handles providing the a specific theme for use.
class ThemeProvider
{
	/** @var Theme The theme object currently being provided. */
	public static $theme = null;

	/**
	 * This method sets the theme we want to use.
	 */
	public static function set($themeName)
	{
		// Get the path to the theme
		$themePath = '\\XBoxApp\\Theme\\'.$themeName;		

		// Set the view path for discovery of different views in the theme.
		View::path($themePath);

		// Update the path to include the class.
		$themePath .= '\\'.$themeName;
		
		// Create the theme and set it as our theme object for the provider.
		$theme = new $themePath();
		$theme->name = $themeName;
		$theme->init();
		static::$theme = $theme;		
	}
	/**
	 * This method returns the theme we have created.
	 */
	public static function theme()
	{
		return static::$theme;
	}
}

?>