<?php
/**
 * This class is the base class for all models in the framework. It contains basic
 * model functionality and variables.
 *
 * @author 	Victor Holt
 */
namespace XBoxApp\Framework\Models;

use XBoxApp\Framework\Database;

class DbModel
{
	/** @var string $_tableName The name of the table. */
	protected $_tableName = '';

	/**
	 * The constructor.
	 */
	public function __construct($tableName)
	{
		$this->_tableName = $tableName;
	}
	/**
	 * This method inserts data into a table.
	 *
	 * @param array $data An associative array on the data we wish to execute with.
	 * @return string The id of the recently inserted row.
	 */
	public function insert($data)
	{	
		return Database::insert($this->_tableName, $data);
	}
	/**
	 * This method updates data in a table.
	 *
	 * @param string $id The id for the row we wish to update.
	 * @param array $data An associative array on the data we wish to execute with.
	 */
	public function update($id, $data)
	{
		Database::update($this->_tableName, $id, $data);
	}
	/**
	 * This method deletes data in a table.
	 *
	 * @param string $id The id for the row we wish to delete.
	 */
	public function delete($id)
	{
		Database::delete($this->_tableName, $id);
	}
	/**
	 * This method fetches data from a table and returns a SQLite3Result object.
	 *
	 * @param array $data An associative array on the data we wish to execute with.
	 */
	public function fetch($data = array(), $sort = '')
	{
		return Database::fetch($this->_tableName, $data, $sort);
	}
	/**
	 * This method fetches a single result from a table and returns the SQLite3Result object.
	 *
	 * @param array $data An associative array on the data we wish to execute with.
	 */
	public function fetchOne($data = array())
	{
		return Database::fetchOne($this->_tableName, $data);
	}
	/**
	 * This method fetches data from a table and returns a SQLite3Result object.
	 *
	 * @param string $id The id of the row we wish to return.
	 */
	public function findById($id)
	{
		return $this->fetchOne(array('id' => $id));
	}
	/**
	 * A simple utility method that returns a current datetime for us.
	 */
	public function getDate()
	{
		return date('Y-m-d H:i:s', time());
	}
	/**
	 * This method truncates the data in the table.
	 */
	public function clear()
	{
		Database::clear($this->_tableName);
	}
}
?>