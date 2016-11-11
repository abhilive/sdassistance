<?php 
	class Order {
		// database connection and table name 
		private $conn; 
		private $table_prefix = 'sdassistance_';
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

			        $data['order_id'] = $order_id ;
			        $data['issuedTo'] = $issuedTo ;
			        $data['issuedBy'] = $issuedBy ;
			        $data['order_amt'] = $order_amt ;
			        $data['items'] = json_decode($items); // decode json data getting for items
			        $data['created_at'] = (strtotime($created_at)*1000);

			    	} //End While
			    } // End IF
			    return $data;
    	}

    	function insert($table, $columnsArray, $requiredColumnsArray) {
	        $this->verifyRequiredParams($columnsArray, $requiredColumnsArray);
	        
	        try{
	            $a = array();
	            $c = "";
	            $v = "";
	            foreach ($columnsArray as $key => $value) {
	                $c .= $key. ", ";
	                $v .= ":".$key. ", ";
	                $a[":".$key] = $value;
	            }
	            $c = rtrim($c,', ');
	            $v = rtrim($v,', ');
	            $stmt =  $this->db->prepare("INSERT INTO $table($c) VALUES($v)");
	            $stmt->execute($a);
	            $affected_rows = $stmt->rowCount();
	            $lastInsertId = $this->db->lastInsertId();
	            $response["status"] = "success";
	            $response["message"] = $affected_rows." row inserted into database";
	            $response["data"] = $lastInsertId;
	        }catch(PDOException $e){
	            $response["status"] = "error";
	            $response["message"] = 'Insert Failed: ' .$e->getMessage();
	            $response["data"] = 0;
	        }
	        return $response;
	    }
    	// create product
		function create($table, $columnsArray, $requiredColumnsArray){
			$this->verifyRequiredParams($columnsArray, $requiredColumnsArray);
		    
			try {
				$table = $this->table_prefix.$table;
				$query = "INSERT INTO 
			                " . $table . "
			            SET 
			                issuedTo=:issuedTo, issuedBy=:issuedBy, order_amt=:order_amt, created_at=:created_at";
			     
			    // prepare query
			    $stmt = $this->conn->prepare($query);
			    // bind values
			    $current_date =  date('Y-m-d H:i:s');
			    $this->created_at = $current_date; // We are using it under order items.
			    $stmt->bindParam(":issuedTo", $columnsArray->issuedTo, PDO::PARAM_STR, 100);
			    $stmt->bindParam(":issuedBy", $columnsArray->issuedBy, PDO::PARAM_STR, 100);
			    $stmt->bindParam(":order_amt", $columnsArray->order_amt);
			    $stmt->bindParam(":created_at", $current_date);
			    
			    // execute query - to save order
		    	$stmt->execute();
		    	$affected_rows = $stmt->rowCount();
		    	$this->orderId = $this->conn->lastInsertId(); // Set last order id
		    	$this->createItems($columnsArray->orderItems); //Insert Order Items
		    	
		    	//$stmt->errorInfo();  //Return error info
		    	$response["status"] = "success";
	            $response["message"] = $affected_rows." row inserted into database";
	            $response["data"] = $this->getCreatedOrder();
		    } catch(PDOException $e) {
		    	$response["status"] = "error";
	            $response["message"] = 'Insert Failed: ' .$e->getMessage();
	            $response["data"] = 0;
			}
			return $response;
		}

		function verifyRequiredParams($inArray, $requiredColumns) {
	        $error = false;
	        $errorColumns = "";
	        foreach ($requiredColumns as $field) {
	        // strlen($inArray->$field);
	            if (!isset($inArray->$field) || strlen(trim($inArray->$field)) <= 0) {
	                $error = true;
	                $errorColumns .= $field . ', ';
	            }
	        }

	        if ($error) {
	            $response = array();
	            $response["status"] = "error";
	            $response["message"] = 'Required field(s) ' . rtrim($errorColumns, ', ') . ' is missing or empty';
	            echoResponse(200, $response);
	            exit;
	        }
	    }

		function createItems($items) {
		    foreach($items as $_item) {
		    	try {
		    	//Insert Query
		    	$query = "INSERT INTO 
			                " . $this->order_items_table_name . "
			            SET 
			                order_id=:order_id, item_id=:item_id, qty=:qty, price=:price, subtotal=:subtotal, created_at=:created_at";

				    // prepare query
				    $stmt = $this->conn->prepare($query);
				    // bind values
				    $current_order_id = $this->getCurrentOrderId();
				    $stmt->bindParam(":order_id", $current_order_id);
				    $stmt->bindParam(":item_id", $_item->id);
				    $stmt->bindParam(":qty", $_item->qty);
				    $stmt->bindParam(":price", $_item->price);
				    $stmt->bindParam(":subtotal", $_item->subtotal);
				    $stmt->bindParam(":created_at", $this->created_at);
				    // execute query - to save order-item
				    $stmt->execute();

				} catch(PDOException $e) {
					echo $e->getMessage();die;
				} // End -Try Catch Block
		    }// End Foreach
		} //End Create Items

		// read orders
		function readAll() {
			try{
		    // select all query
		    // json query parameters
		    	$json_params = $this->generateJson(array('id'=>'sda_oi.item_id','title'=>'sda_i.title','qty'=>'sda_oi.qty','price'=>'sda_oi.price','subtotal'=>'sda_oi.subtotal'));
	            $a = array();
	            $query = "SELECT sda_o.order_id, sda_o.issuedTo, sda_o.issuedBy, sda_o.order_amt, sda_o.created_at, ".$json_params
				    . "FROM sdassistance_orders AS sda_o JOIN sdassistance_order_items AS sda_oi ON sda_o.order_id = sda_oi.order_id\n"
				    . "JOIN sdassistance_items AS sda_i ON sda_oi.item_id = sda_i.id GROUP BY sda_o.order_id ORDER BY order_id DESC\n"
				    . "";
	            $stmt = $this->conn->prepare( $query );
	            $stmt->execute($a);
	            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
	            $result = array();
	            // Rewrite array becuase we want to access those items json in array format
	            // Currently we are preparing items as json format once I got the method to get as array format then I'll replace that
	            foreach ($rows as $_row) {
	            	$result[] = array(
	        						'order_id'=>$_row['order_id'],
	        						'issuedTo'=>$_row['issuedTo'],
	        						'issuedBy'=>$_row['issuedBy'],
	        						'order_amt'=>$_row['order_amt'],
	        						'created_at'=>(strtotime($_row['created_at'])*1000), // i multiply here with 1000 because angular uses microseconds
	        						'items'=> json_decode($_row['items'])
	        					);
	            }
	            if(count($rows)<=0){
	                $response["status"] = "warning";
	                $response["message"] = "No data found.";
	            }else{
	                $response["status"] = "success";
	                $response["message"] = "Data selected from database";
	            }
	            	
                $response["data"] = $result;
                //$response["data"]["items"] = json_decode($rows["items"]);
	        }catch(PDOException $e){
	            $response["status"] = "error";
	            $response["message"] = 'Select Failed: ' .$e->getMessage();
	            $response["data"] = null;
	        }
	        return $response;
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

		function delete($table, $where){
	        if(count($where)<=0){
	            $response["status"] = "warning";
	            $response["message"] = "Delete Failed: At least one condition is required";
	        }else{
	            try{
	                $a = array();
	                $w = "";
	                foreach ($where as $key => $value) {
	                    $w .= " and " .$key. " = :".$key;
	                    $a[":".$key] = $value;
	                }
	                $stmt =  $this->conn->prepare("DELETE FROM $this->order_table_name WHERE 1=1 ".$w);
	                $stmt->execute($a);
	                $affected_rows = $stmt->rowCount();
	                if($affected_rows<=0){
	                    $response["status"] = "warning";
	                    $response["message"] = "No row deleted";
	                }else{
	                    $response["status"] = "success";
	                    $response["message"] = $affected_rows." row(s) deleted from database";
	                }
	            }catch(PDOException $e){
	                $response["status"] = "error";
	                $response["message"] = 'Delete Failed: ' .$e->getMessage();
	            }
	        }
	        return $response;
	    }
	    /* return URL to Download Order CSV*/
	    function exportOrders($columnsArray) {
	    	try {
	    		$file_path = $_SERVER['DOCUMENT_ROOT'].'/sdassistance/file.csv';
	    		$file_download_path = 'http://172.10.55.66/sdassistance/file.csv';
				$fp = fopen($file_path, 'w');
				
				$month = $columnsArray->month;
	    		$year = $columnsArray->year;
	    		$strt_dt = date("Y-m-d H:i:s", mktime(0, 0, 0, $month, 1, $year));
	    		$end_dt = date("Y-m-d H:i:s", mktime(0, 0, 0, $month+1, 0, $year));
		    	// json query parameters
		    	$json_params = $this->generateJson(array('id'=>'sda_oi.item_id','title'=>'sda_i.title','qty'=>'sda_oi.qty','price'=>'sda_oi.price','subtotal'=>'sda_oi.subtotal'));
	            $a = array();
	            $query = "SELECT sda_o.order_id, sda_o.issuedTo, sda_o.issuedBy, sda_o.order_amt, sda_o.created_at, ".$json_params
				    . "FROM sdassistance_orders AS sda_o JOIN sdassistance_order_items AS sda_oi ON sda_o.order_id = sda_oi.order_id\n"
				    . "JOIN sdassistance_items AS sda_i ON sda_oi.item_id = sda_i.id \n"
				    . "WHERE sda_o.created_at >='$strt_dt' AND sda_o.created_at <='$end_dt' \n"
				    . "GROUP BY sda_o.order_id ORDER BY created_at ASC\n";
				// select * from hockey_stats where game_date between '2012-03-11 00:00:00' and '2012-05-11 23:59:00' order by game_date desc;
	            $stmt = $this->conn->prepare( $query );
	            $stmt->execute($a);
	            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
	            $result = array();
	            // Rewrite array becuase we want to access those items json in array format
	            // Currently we are preparing items as json format once I got the method to get as array format then I'll replace that
	            // Preparing header for CSV.
	            $result[] = array('Id','Created At','Issued To','Issued By','Order Total','Order Item','Qty','Price','Subtotal');
	            foreach ($rows as $_row) { //h:i:s a m/d/Y
	            	$created_at = date("D, j M Y, h:i:s a",strtotime($_row['created_at']));
	            	$items = json_decode($_row['items'],true);
	            	$count = 1;
	            	foreach($items as $_item) {
	            		if($count==1) {
		            		$result[] = array(
		            				$_row['order_id'],
		            				$created_at,
		            				$_row['issuedTo'],
		            				$_row['issuedBy'],
		            				$_row['order_amt'],
		            				$_item['title'],
		            				$_item['qty'],
		            				$_item['price'],
		            				$_item['subtotal']
		            			);
			            } else {
			            	$result[] = array(
		            				'',
		            				'',
		            				'',
		            				'',
		            				'',
		            				$_item['title'],
		            				$_item['qty'],
		            				$_item['price'],
		            				$_item['subtotal']
		            			);
			            } //End If
		            	$count++;
		            } //End Foreach - Items
	            }//End Foreach - Main
	            if(count($rows)<=0){
	                $response["status"] = "warning";
	                $response["message"] = "No data found.";
	            }else{
	            	foreach($result as $field) {
	            		fputcsv($fp, $field); // Put rows into CSV
	            	}
	            	fclose($fp);
	            	$response["file"] = $file_download_path;
	                $response["status"] = "success";
	                $response["message"] = "CVS generated successfully.";
	            }
	    	}catch(PDOException $e){
	    		$response["status"] = "error";
	    		$response["message"] = 'Select Failed: ' .$e->getMessage();
	    		$response["data"] = null;
	    	}
	    	return $response;
	    }

	}