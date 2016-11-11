<?php 
// get database connection 
include_once 'config/database.php'; 
$database = new Database(); 
$db = $database->getConnection();
 
// instantiate product object
include_once 'objects/order.php';
$order = new Order($db);
 
// get posted data
$data = json_decode(file_get_contents("php://input")); 
// set product property values
$order->issuedTo = $data->issuedTo;
$order->issuedBy = $data->issuedBy;
$order->total = $data->total;
$order->items = $data->orderItems;
$order->created_at = date('Y-m-d H:i:s');
/*echo date('Y-m-d H:i:s', time());die;
$order->created_at = new DateTime();*/
     
// create the product
$result = $order->create();

//$result = array('status'=>true,'message'=>'Information has been saved successfully.','order'=>$data);
//$result = array('status'=>false, 'message'=>'Something went wrong !!');
// send response back.
echo json_encode($result);
?>