<?php
/**
 * This file is more of a "globals" file which contains any global variables, arrays, functions, etc.
 * that we may need to use throughout the framework.
 */

// Framework Definitions

define('XBOXAPP_MODE_DEBUG', 'debug');
define('XBOXAPP_MODE_PROD', 'production');
define('XBOXAPP_MODE', XBOXAPP_MODE_DEBUG);

define('XBOXAPP_THEME', 'XBox');

// Are we working offline and not with the Nerdery service?
define('XBOXAPP_OFFLINE', true);

// Allow us to submit multiple games/votes. This is for testing purposes.
define('IGNORE_USER_VOTES', true);

// End Framework Definitions

?>