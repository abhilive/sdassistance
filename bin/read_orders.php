<?php 
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8"); 
// include database and object files 
include_once 'config/database.php'; 
include_once 'objects/order.php'; 
// instantiate database and product object 
$database = new Database(); 
$db = $database->getConnection();
 
// initialize object
$order = new Order($db);
 
// query products
$stmt = $order->readAll();
$num = $stmt->rowCount();
 
// check if more than 0 record found
if($num>0){
     
    $data="";
    $x=1;
     
    // retrieve our table contents
    // fetch() is faster than fetchAll()
    // http://stackoverflow.com/questions/2770630/pdofetchall-vs-pdofetch-in-a-loop
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        // extract row
        // this will make $row['name'] to
        // just $name only
        
        extract($row);
         
        $data .= '{';
            $data .= '"id":"'  . $order_id . '",';
            $data .= '"issuedTo":"'   . $issuedTo . '",';
            $data .= '"issuedBy":"'   . $issuedBy . '",';
            $data .= '"total":"' . $order_amt . '",';
            $data .= '"items":' . $items . ',';
            $data .= '"created_at":"' .(strtotime($created_at)*1000). '"';
        $data .= '}'; 
         
        $data .= $x<$num ? ',' : ''; $x++; } } 

        // json format output 
        echo '{"records":[' . $data . ']}';
    ?>
