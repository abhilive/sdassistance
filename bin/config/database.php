<?php
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'smartdata');
define('DB_HOST', 'localhost');
define('DB_NAME', 'db_sdassistance');
// define('DB_TABLE_PREFIX', 'sdassistance_'); //Ignore For Now

class Database{ // specify your own database credentials
		private $host = DB_HOST;
		private $db_name = DB_NAME;
		private $username = DB_USERNAME;
		private $password = DB_PASSWORD;
		//private $db_table_prefix = DB_TABLE_PREFIX; //Ignore For Now
		public $conn; // get the database connection

		public function getConnection(){ 
			$this->conn = null;
         
	        try {
	            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
	            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	        } catch(PDOException $exception) {
	            echo "Connection error: " . $exception->getMessage();
	        }
         
        return $this->conn;
    }
}
?>