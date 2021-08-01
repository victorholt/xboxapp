<?php

/**
 * This class handles any theming for the framework. It's a simple 'theme' class
 * for doing general MVC-like theming. Inspired a bit by Wordpress. :)
 *
 * All themes in the framework extend from this class.
 *
 * @author:	Victor Holt
 */
namespace XBoxApp\Framework;

// This class handles theme specific functionality.
abstract class Theme
{
	/** @var string The name of the theme. */
	public $name = '';
	/** @var string The header file for the theme. */
	public $header = 'header';
	/** @var string The footer for the theme. */
	public $footer = 'footer';	

	/**
	 * This method initializes the theme before the view is rendered.
	 */
	abstract public function init();

	/**
	 * This method renders the view file and includes the header and footer files.
	 */
	public function render($view, $data = array())
	{
		View::render($this->header, $data);
		View::render($view, $data);
		View::render($this->footer, $data);
	}

}

?>