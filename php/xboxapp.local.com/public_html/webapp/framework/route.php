<?php

/**
 * This class represents a route in the framework. These methods were
 * inspired by Laravel since they have great 'regex' matching 
 * methods. Some parts have been modified to fit our system.
 *
 * @author:	Victor Holt
 */
namespace XBoxApp\Framework;

/**
 * This class represents a specific route.
 */
class Route
{
	/** @var string The pattern for this route. */
	public $pattern = '';
	/** @var string The callback for this route. */
	public $callback = null;
	/** @var array The segments in the path. */
	public $segments = array();
	/** @var string The uri path evaluated. */
	public $path = '';
	/** @var array The wildcards available. */
	public $wildcards = array(
		'(:num)' => '([0-9]+)',
		'(:any)' => '([a-zA-Z0-9\.\-_%=]+)',
		'(:all)' => '(.*)'
	);
	/** @var array The optional wildcards available. */
	public $optional_wildcards = array(
		'(:num?)' => '([0-9]+)',
		'(:any?)' => '([a-zA-Z0-9\.\-_%=]+)',
		'(:all?)' => '(.*)',
	);


	/**
	 * The constructor.
	 */
	public function __construct($pattern, $callback)
	{
		$this->pattern = $pattern;
		$this->callback = $callback;
	}
	/**
	 * This method checks if a route is matched to a uri.
	 */
	public function isUri($uri)
	{ 
		// Make sure we have a uri.
		if (empty($uri)) $uri = '/';

		// Remove the query string from the uri.
		$parts = explode('?', $uri);
		$uri = count($parts) ? $parts[0] : $uri;

		// Check the pattern to see if it's an exact match.
		if ($uri == $this->pattern) {
			$this->path = $this->pattern;
			return true;
		} else {

			// Get each segment of the uri and attempt to match them with regex.
			$segments = explode('/', $uri);
			$pattern_segments = explode('/', $this->pattern);
			
			if (count($segments)) {
				$found = false;

				for ($i = 1; $i < count($pattern_segments); $i++) {					
					// Try to find a match for this segment within our string.
					if (!$this->matchPattern($pattern_segments[$i], $segments, $i)) {
						$found = false;
						break;
					} else {						
						$found = true;						
						//echo 'RETURING '.$found.' FOR '.$segment.' PATTERN: '.$this->pattern.'<br />';
					}
				}

				if ($found) return true;
			}

		}

		// No matches found.
		return false;
	}
	/**
	 * This method attempts to match a route segment from the uri.
	 */
	public function matchPattern(&$pattern_segment, $segments, $index)
	{		
		$segment = isset($segments[$index]) ? $segments[$index] : null;
		
		// If we don't have this index we should attempt to see if we allow optional wildcards.
		if ($segment !== null && preg_match("/^$segment$/", $pattern_segment)) {
			//echo 'attempting to match '.$pattern_segment.' with '.$segment.'<br />';
			$this->segment[] = $segment;
			return true;
		} else if ($segment !== null && isset($this->wildcards[$pattern_segment]) && preg_match("/^{$this->wildcards[$pattern_segment]}$/", $segment)) {
			//echo '2nd attempting to match '.$pattern_segment.' with '.$segment.'<br />';
			$this->segment[] = $segment;
			return true;
		} else if ($segment !== null && isset($this->optional_wildcards[$pattern_segment]) && preg_match("/^{$this->optional_wildcards[$pattern_segment]}$/", $segment)) {
			//echo '3rd attempting to match '.$pattern_segment.' with '.$segment.'<br />';
			$this->segment[] = $segment;
			return true;			
		} else if (isset($this->optional_wildcards[$pattern_segment])) {
			//echo 'Optionally and not provided '.$pattern_segment.'<br />';
			$this->segment[] = $segment;
			return true;
		} else {
			//echo 'failed at matching '.$pattern_segment.' with '.$segment.'<br />';
		}

		return false;
	}
	/**
	 * This method performs the routing 
	 */
	public function go()
	{ 
		// Perform the callback.
		if ($this->callback) {
			return call_user_func_array($this->callback, array($this));
		}

		return false;
	}
	/**
	 * This method returns the value of a segment.
	 */
	public function segment($num)
	{
		if (!empty($this->segment) && count($this->segment) > $num && isset($this->segment[$num])) {
			return $this->segment[$num];
		}

		return null;
	}
}

?>