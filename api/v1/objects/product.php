<?php 
	class Product {
		// database connection and table name 
		private $conn; 
		private $table_name = "sdassistance_items"; 
		// object properties 
		public $id; 
		public $name;
		public $description;
		public $price;
		public $created; 
		// constructor with $db as database connection 
		public function __construct($db) { 
			$this->conn = $db;
    	}

    	// create product
		function create(){
		     
		    // query to insert record
		    $query = "INSERT INTO 
		                " . $this->table_name . "
		            SET 
		                name=:name, price=:price, description=:description, created=:created";
		     
		    // prepare query
		    $stmt = $this->conn->prepare($query);
		 
		    // posted values
		    $this->name=htmlspecialchars(strip_tags($this->name));
		    $this->price=htmlspecialchars(strip_tags($this->price));
		    $this->description=htmlspecialchars(strip_tags($this->description));
		 
		    // bind values
		    $stmt->bindParam(":name", $this->name);
		    $stmt->bindParam(":price", $this->price);
		    $stmt->bindParam(":description", $this->description);
		    $stmt->bindParam(":created", $this->created);
		     
		    // execute query
		    if($stmt->execute()){
		        return true;
		    }else{
		        echo "
		<pre>";
		            print_r($stmt->errorInfo());
		        echo "</pre>
		 
		";
		 
		        return false;
		    }
		}

		// read products
		function readAll() {
			try{
		    // select all query
	            $a = array();
	            $query = "SELECT 
		                id, title, name as item_type, price
		            FROM 
		                " . $this->table_name . "
		            JOIN 
		            	sdassistance_item_type ON sdassistance_item_type.type_id = ". $this->table_name .".type_id
		            ORDER BY 
		                id DESC";
	            $stmt = $this->conn->prepare( $query );
	            $stmt->execute($a);
	            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

	            if(count($rows)<=0){
	                $response["status"] = "warning";
	                $response["message"] = "No data found.";
	            }else{
	                $response["status"] = "success";
	                $response["message"] = "Data selected from database";
	            }
	            	
	                $response["data"] = $rows;
	                //$response["data"]["items"] = json_decode($rows["items"]);
	        }catch(PDOException $e){
	            $response["status"] = "error";
	            $response["message"] = 'Select Failed: ' .$e->getMessage();
	            $response["data"] = null;
	        }
	        return $response;
		}
	}