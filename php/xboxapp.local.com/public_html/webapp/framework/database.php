<?php
/**
 * This class is used more for an "offline-mode" for myself. It's also used
 * for testing before actually connecting to the SOAP service. Now isn't that
 * pretty niffty!
 *
 * For this implementation we're just using SQLite. No need to get our hands too
 * dirty with MySQL or Postgre since we're using this as just a "lite" backup.
 *
 * The main issue with this setup is that we don't allow for multiple connections
 * to database. That might be because this is a lazy implementation or perhaps it's
 * just not needed for what we're trying to accomplish. I'll let the code gurus 
 * decided the fate of that decision...
 *
 * Also note that this database class is highly geared for our application and thus
 * has methods that reflect that usage.
 *
 * TODO: Remember Victor, the requirement say that we must not cache games/current votes on the web server so
 *       be sure to replace this class once you're done having your fun. ~ self
 *
 * @author 	Victor Holt
 */
namespace XBoxApp\Application;
namespace XBoxApp\Framework;

class Database
{
	/** @var Database $_instance The instance for the Database object. */
	private static $_instance = null;		
	/** @var SQLite3 $_db The sqlite3 object for . */
	private $_db = null;

	/**
	 * The constructor for our database class. We'll just set this to private...
	 * don't want any confusion on the fact that you can't instantiate this object.
	 */
	private function __construct()
	{
	}
	/**
	 * This method returns to us an instance of the Database object.
	 */
	public static function instance()
	{		
		// Check if we need to create the instance of our Database.
		if (static::$_instance === null) {
			static::$_instance = new Database();
			static::$_instance->connect();		
		}		
		return static::$_instance;
	}
	/**
	 * This method handles connecting to our database.
	 */
	public static function connect()
	{
		// The path to our webapp directory.
		global $webappPath;
		// Our database path.
		$dbPath = $webappPath.'db'.DIRECTORY_SEPARATOR.'xboxapp.db';

		// Make sure that the SQLite3 class does indeed exists for us to use.
		if (!class_exists('\\SQLite3')) {
			\XBoxApp\Application::throwException('Sorry, but you do not have support for SQLite3!');
		}

		// Create our SQLite3 database driver.
		if (static::db() === null) {			
			// Check if we've ever created our database file before.
			if (!file_exists($dbPath)) {
				// Create our database SQLite3 instance.
				static::db(new \SQLite3($dbPath));

				// Go ahead and chmod so when I move this db over it doesn't cause me a headache...				
				chmod($dbPath, 0777);

				// Let's go ahead and create the tables since this is our first time opening up the database.
				// Since I am assuming a small database for now I will add no indexes other than the unique one.
				static::exec("CREATE TABLE games (id TEXT PRIMARY KEY ASC, service_game_id TEXT DEFAULT '', title TEXT, votes INTEGER, owned INTEGER DEFAULT 0, sync INTEGER DEFAULT 0, UNIQUE(title, service_game_id));");
				static::exec("CREATE INDEX voteindex on games (votes);");

				static::exec("CREATE TABLE users (id TEXT PRIMARY KEY ASC, last_vote NUMERIC NOT NULL DEFAULT '0000-00-00 00:00:00', creation_date NUMERIC NOT NULL DEFAULT '0000-00-00 00:00:00');");
			}	else {
				// Create our database SQLite3 instance.
				static::db(new \SQLite3($dbPath));
			}
		}
	}
	/**
	 * This method executes sql statements within our database. This method
	 * does not return any results.
	 *
	 * @param string $sql The sql statement to execute.
	 */
	public static function exec($sql)
	{
		// We'll attempt to gracefully catch any errors that may occur.
		try {
			static::db()->exec($sql);
		} catch (\Exception $e) {
			Application::throwException($e->getMessage()." <br />\nrunning query: $sql");
		}				
	}
	/**
	 * This method inserts data into a table.
	 *
	 * @param string $table The name of the table we are attempting to manipulate.
	 * @param array $data An associative array on the data we wish to execute with.
	 * @return string The id of the recently inserted row.
	 */
	public static function insert($table, $data)
	{	
		// Make sure our data is an array.
		if (!is_array($data)) {
			Application::throwException('Insert data must be in the form of an array!');
		}

		// Create the id for the insert data.
		$id = static::id();

		// Create the insert array.
		$sql = "INSERT INTO $table (id,".implode(',', array_keys($data)).") VALUES('$id', ";		
		// Add the values of sql.
		foreach ($data as $value) {
			$value = static::db()->escapeString($value);
			$sql .= "'$value',";
		}
		$sql = substr($sql, 0, strlen($sql)-1);
		$sql .= ');';

		//var_dump($sql);

		// Execute the sql statement.
		static::exec($sql);

		// Return the insert id.
		return $id;
	}
	/**
	 * This method updates data in a table.
	 *
	 * @param string $table The name of the table we are attempting to manipulate.
	 * @param string $id The id for the row we wish to update.
	 * @param array $data An associative array on the data we wish to execute with.
	 */
	public static function update($table, $id, $data)
	{
		// Make sure our data is an array.
		if (!is_array($data)) {
			Application::throwException('Update data must be in the form of an array!');
		}

		// Create the update query.
		$sql = "UPDATE $table SET ";
		foreach ($data as $key=>$value) {
			$value = static::db()->escapeString($value);
			$sql .= " $key = '$value',";
		}
		$sql = substr($sql, 0, strlen($sql)-1);
		$sql .= " WHERE id = '$id';";

		static::exec($sql);
	}
	/**
	 * This method deletes data in a table.
	 *
	 * @param string $table The name of the table we are attempting to manipulate.
	 * @param string $id The id for the row we wish to delete.
	 */
	public static function delete($table, $id)
	{
		// Make sure our data is an array.
		if (!is_array($data)) {
			Application::throwException('Delete data must be in the form of an array!');
		}

		$sql = "DELETE FROM $table WHERE id = '$id';";
		static::exec($sql);
	}
	/**
	 * This method fetches data from a table and returns a SQLite3Result object.
	 *
	 * @param string $table The name of the table we are attempting to manipulate.
	 * @param array $data An associative array on the data we wish to execute with.
	 * @return SQLite3Result
	 */
	public static function fetch($table, $data = array(), $sort = '')
	{
		// Make sure our data is an array.
		if (!is_array($data)) {
			Application::throwException('Fetch data must be in the form of an array!');
		}

		$sql = "SELECT * FROM $table WHERE ";
		foreach ($data as $key=>$value) {
			$value = static::db()->escapeString($value);
			$sql .= " $key = '$value' AND ";
		}

		if (!empty($data)) {
			$sql = substr($sql, 0, strlen($sql)-4);
		} else {
			$sql = substr($sql, 0, strlen($sql)-6); // Select all.
		}

		// Check if we have any sorting.
		if (!empty($sort)) $sql .= " ORDER BY $sort";

		$sql .= ';';
		return static::query($sql);
	}
	/**
	 * This method fetches a single entry from a table and returns a SQLite3Result object.
	 *
	 * @param string $table The name of the table we are attempting to manipulate.
	 * @param array $data An associative array on the data we wish to execute with.
	 */
	public static function fetchOne($table, $data)
	{
		// Make sure our data is an array.
		if (!is_array($data)) {
			Application::throwException('Fetch data must be in the form of an array!');
		}

		$sql = "SELECT * FROM $table WHERE ";
		foreach ($data as $key=>$value) {
			$value = static::db()->escapeString($value);
			$sql .= " $key = '$value' AND ";
		}
		$sql = substr($sql, 0, strlen($sql)-4);
		$sql .= ';';
		
		return static::db()->querySingle($sql, true);
	}
	/**
	 * This method truncates data from a table.
	 */
	public static function clear($table)
	{
		static::db()->exec("DELETE FROM $table;");
		static::db()->exec("VACUUM;");
	}
	/**
	 * This method runs a basic sql statement that does return a SQLiteResult.
	 *
	 * @param string $sql The sql string.
	 * @return SQLite3Result
	 */
	public static function query($sql)
	{
		$results = null;

		try {
			$results = static::db()->query($sql);			
		} catch(Exception $e) {
			Application::throwException($e->getMessage());
		}

		return $results;
	}
	/**
	 * This method closes the database connection if we have one.
	 */
	public static function close()
	{
		// Check if we have a connection.
		if (static::db() != null) {
			static::db()->close();
		}
	}
	/**
	 * This method handles generating an id. This is a very basic way to generate
	 * an alpha-numeric id for a database entry.
	 *
	 * @returns string
	 */
	public static function id()
	{
		return md5(uniqid() . Request::clientIp() . time());
	}
	/**
	 * This method returns the database driver.
	 *
	 * @param SQLite3 $sqliteInstance An optional parameter just in case we want to use a new instance for our driver.
	 */
	public static function db($sqliteInstance = null)
	{
		if (!empty($sqliteInstance)) {
			static::instance()->_db = $sqliteInstance;	
		}
		return static::instance()->_db;
	}
}
?>