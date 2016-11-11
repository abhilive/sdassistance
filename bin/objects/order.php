<?php 
	class Order {
		// database connection and table name 
		private $conn; 
		private $order_table_name = "sdassistance_orders";
		private $order_items_table_name = "sdassistance_order_items";
		// object properties 

		private $orderId;
		public $issuedTo; 
		public $issuedBy;
		public $total;
		public $items;
		public $created_at;

		private $_order = array();
		private $_status = true;
		private $_message = 'Information has been saved successfully.';

		// constructor with $db as database connection 
		public function __construct($db) { 
			$this->conn = $db;
    	}

    	public function getCurrentOrderId() {
    		return $this->orderId;
    	}

    	public function getStatus() {
    		return $this->_status;
    	}

    	public function getMessage() {
    		return $this->_message;
    	}

    	public function getCreatedOrder() {
    		$response = '';
    		$json_params = $this->generateJson(array('id'=>'sda_oi.item_id','title'=>'sda_i.title','qty'=>'sda_oi.qty','price'=>'sda_oi.price','subtotal'=>'sda_oi.subtotal'));
		    
		    $query = "SELECT sda_o.order_id, sda_o.issuedTo, sda_o.issuedBy, sda_o.order_amt, sda_o.created_at, ".$json_params
		    . "FROM sdassistance_orders AS sda_o JOIN sdassistance_order_items AS sda_oi ON sda_o.order_id = sda_oi.order_id\n"
		    . "JOIN sdassistance_items AS sda_i ON sda_oi.item_id = sda_i.id WHERE sda_o.order_id = ".$this->getCurrentOrderId()."\n"
		    . "";
		    // prepare query statement
		    $stmt = $this->conn->prepare( $query );
		     
		    // execute query
		    $stmt->execute();

		    $num = $stmt->rowCount();

			// check if more than 0 record found
			if($num>0){
			     
			    $data = array();

			    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			        // extract row
			        // this will make $row['name'] to
			        // just $name only
			        
			        extract($row);

			        $data['id'] = $order_id ;
			        $data['issuedTo'] = $issuedTo ;
			        $data['issuedBy'] = $issuedBy ;
			        $data['total'] = $order_amt ;
			        $data['items'] = json_decode($items); // decode json data getting for items
			        $data['created_at'] = (strtotime($created_at)*1000);

			    	} //End While
			    } // End IF
			    return $data;
    	}

    	// create product
		function create(){
		    // query to insert record
			try {
				$query = "INSERT INTO 
			                " . $this->order_table_name . "
			            SET 
			                issuedTo=:issuedTo, issuedBy=:issuedBy, order_amt=:order_amt, created_at=:created_at";
			     
			    // prepare query
			    $stmt = $this->conn->prepare($query);
			 
			    // posted values - we don't need this
			    /*$this->name=htmlspecialchars(strip_tags($this->name));
			    $this->price=htmlspecialchars(strip_tags($this->price));
			    $this->description=htmlspecialchars(strip_tags($this->description));*/
			    // bind values
			    $stmt->bindParam(":issuedTo", $this->issuedTo, PDO::PARAM_STR, 100);
			    $stmt->bindParam(":issuedBy", $this->issuedBy, PDO::PARAM_STR, 100);
			    $stmt->bindParam(":order_amt", $this->total);
			    $stmt->bindParam(":created_at", $this->created_at);
			     
			    // execute query - to save order
		    	$stmt->execute();
		    	$this->orderId = $this->conn->lastInsertId(); // Set last order id
		    	$this->createItems(); //Insert Order Items
		    	//$stmt->errorInfo();  //Return error info

		    } catch(PDOException $e) {
		    	$this->_status = false;
			    $this->_message = $e->getMessage();
			    trigger_error('Error occured while trying to insert into the DB:' . $e->getMessage(), E_USER_ERROR);
			}

			$results = array ('status'=>$this->getStatus(),'message'=>$this->getMessage(),'order'=>$this->getCreatedOrder());
			return $results;
		}

		function createItems() {
			//loop through Items
			$count = 0;
		    foreach($this->items as $_item) {
		    	try {
		    	//Insert Query
		    	$query = "INSERT INTO 
			                " . $this->order_items_table_name . "
			            SET 
			                order_id=:order_id, item_id=:item_id, qty=:qty, price=:price, subtotal=:subtotal, created_at=:created_at";

				    // prepare query
				    $stmt = $this->conn->prepare($query);
				 
				    // bind values
				    $stmt->bindParam(":order_id", $this->getCurrentOrderId());
				    $stmt->bindParam(":item_id", $_item->id);
				    $stmt->bindParam(":qty", $_item->qty);
				    $stmt->bindParam(":price", $_item->price);
				    $stmt->bindParam(":subtotal", $_item->subtotal);
				    $stmt->bindParam(":created_at", $this->created_at);
				     
				    // execute query - to save order-item
				    $stmt->execute();

				} catch(PDOException $e) {
					$this->_status = false;
			    	$this->_message = $e->getMessage();
			    	trigger_error('Error occured while trying to insert into the DB:' . $e->getMessage(), E_USER_ERROR);
				} // End -Try Catch Block
		    }// End Foreach
		} //End Create Items

		// read orders
		function readAll() {

		    // select all query
		    //json query parameters
		    $json_params = $this->generateJson(array('id'=>'sda_oi.item_id','title'=>'sda_i.title','qty'=>'sda_oi.qty','price'=>'sda_oi.price','subtotal'=>'sda_oi.subtotal'));
		    //Below First Query works - But As standard Join I am using 2nd Query
		    /*$query = "SELECT sda_o.order_id, sda_o.issuedTo, sda_o.issuedBy, sda_o.order_amt, sda_o.created_at, ".$json_params
				    . "FROM sdassistance_orders AS sda_o\n"
				    . "JOIN sdassistance_order_items AS sda_oi\n"
				    . "WHERE sda_o.order_id = sda_oi.order_id GROUP BY sda_o.order_id\n"
				    . "LIMIT 0 , 30";*/
		    $query = "SELECT sda_o.order_id, sda_o.issuedTo, sda_o.issuedBy, sda_o.order_amt, sda_o.created_at, ".$json_params
		    . "FROM sdassistance_orders AS sda_o JOIN sdassistance_order_items AS sda_oi ON sda_o.order_id = sda_oi.order_id\n"
		    . "JOIN sdassistance_items AS sda_i ON sda_oi.item_id = sda_i.id GROUP BY sda_o.order_id ORDER BY sda_o.order_id DESC\n"
		    . "";
		    // prepare query statement
		    $stmt = $this->conn->prepare( $query );
		     
		    // execute query
		    $stmt->execute();
		     
		    return $stmt;
		}

		function generateJson($fields) {

			$str = "CONCAT('[',GROUP_CONCAT(CONCAT('{\"";
			$cnt = count($fields);
			$i = 0;
			foreach ($fields as $k=>$v) {
				$str.= $k . "\":','\"'," . $v;

				if ($i != $cnt - 1) {
					$str.= ",'\",\"";
				}
				$i++;
			}
			$str.= ",'\"}')),']') AS items ";
			return $str;
		}

	}