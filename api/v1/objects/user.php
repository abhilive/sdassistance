<?php 
	class User {
		// database connection and table name 
		private $conn; 
		private $table_prefix = 'sdassistance_';
		private $user_table_name = "sdassistance_users";
		// object properties 

		private $_message = 'Information has been saved successfully.';

		// constructor with $db as database connection 
		public function __construct($db) { 
			$this->conn = $db;
    	}

    	public function authenticate($params) {
    		return $this->orderId;
    	}

	}