<?php 
require_once __DIR__ . '/conn.php';

$devices = array();

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, DEVICES_DATA);
$result = curl_exec($ch);
curl_close($ch);

$json = json_decode($result);

if ($json) {
    
    $success = $json->success;
    
    if($success == true) {
        $devices = $json->devices;
        
        $sql_delete = "TRUNCATE tbl_app_nodes";
            
        if($mysqli->query($sql_delete)) {
            
            foreach($devices as $device) {
        
                $device_id          = $device->channelID;
                $device_name        = $device->siteName;
                $device_location    = $device->locationName;
                $device_lat         = number_format((float)$device->latitude, 8, '.', '');
                $device_lng         = number_format((float)$device->longitude, 8, '.', '');
                $device_type        = 'Commercial area';
                $delete_status      = '0';
                
                if($device->isActive == true){
                    $active_status = '1';
                    
                    $sql_insert = "INSERT INTO tbl_app_nodes (an_id, an_channel_id, an_name, an_lat, an_lng, an_map_address, an_type, an_active, an_deleted) VALUES (NULL, '$device_id', '$device_name', '$device_lat', '$device_lng', '$device_location', '$device_type', '$active_status', '$delete_status')";
                    $mysqli->query($sql_insert) or die($mysqli->error);
                }
            }
        }
    }
}
?>