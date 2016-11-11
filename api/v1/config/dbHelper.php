<?php
require_once 'config.php'; // Database setting constants [DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD]

class dbHelper{ // specify your own database credentials
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