<?php
require_once __DIR__ . '/db_config.php';
$response = array();

  $sql_pick_nodes = "SELECT an_channel_id, an_name, an_map_address FROM tbl_app_nodes WHERE an_active = '1' AND an_deleted = '0'";
    $query_pick_nodes = $mysqli->query($sql_pick_nodes);
    if ($query_pick_nodes->num_rows > 0) {
        $response["nodes"] = array();
        while ($prow = $query_pick_nodes->fetch_array()) {
            //initialise values
            $channel_id = $prow["an_channel_id"];
						$channel_name = $prow["an_name"];
						$channel_address = $prow["an_map_address"];
						$valueHr = "";
						$valueDy = "";
						$valueLt = "";
						$now = date("Y-m-d H:i:s");
						$now = str_replace(' ', 'T', $now);

						//fetch all times
            $json_url = "https://thingspeak.com/channels/".$channel_id."/feeds.json?timezone=Africa%2FNairobi";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $json_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $data = curl_exec($ch);
            curl_close($ch);

            $count = 0;
            $date = "";
            $field = "";
            $json = json_decode($data, true);
            // usort($json['feeds'], function ($value1, $value2) {
            //     return  $value1["entry_id"]<$value2["entry_id"];
            // });

						//create geometry object to later be used
						$geometry = array();
						//add tyoe to geometry o
						$geometry["type"] = "Point";
						//initialise lat & lng
						$latitude = "";
						$longitude = "";
						//create and add data array into the geometry object
						$geometry["data"] = array();
						foreach ($json['feeds'] as $feed) {
								$combination = array();
								$created_at = $feed["created_at"];
								$field2 = $feed["field2"];
								if ($field2 > 500) {
										$field2 = 500;
								}
								if ($field2 < 0) {
										$field2 = 0;
								}
								$valueLt =$field2;
								$latitude = $feed["field5"];
								$longitude = $feed["field6"];
								array_push($combination, $created_at);
								array_push($combination, $field2);
								array_push($geometry["data"], $combination);
						}
						//create and add coordinates array into the geometry object
						$geometry["coordinates"] = array();
						array_push($geometry["coordinates"], $latitude);
						array_push($geometry["coordinates"], $longitude);
						array_push($geometry["coordinates"], 0);

						//fetch last hour average and note values
						$json_url_hr = "https://thingspeak.com/channels/".$channel_id."/field/2.json?timezone=Africa%2FNairobi&average=60";
            $ch_hr = curl_init();
            curl_setopt($ch_hr, CURLOPT_URL, $json_url_hr);
            curl_setopt($ch_hr, CURLOPT_RETURNTRANSFER, 1);
            $data_hr = curl_exec($ch_hr);
            curl_close($ch_hr);

            $count_hr = 0;
            $date_hr = "";
            $field_hr = "";
            $json_hr = json_decode($data_hr, true);
            // usort($json['feeds'], function ($value1, $value2) {
            //     return  $value1["entry_id"]<$value2["entry_id"];
            // });

            foreach ($json_hr['feeds'] as $feed_hr) {
                $date_hr= $feed_hr["created_at"];
                $field_hr= $feed_hr["field2"];
                if ($field_hr > 500) {
                    $field_hr = 500;
                }
                if ($field_hr < 0) {
                    $field_hr = 0;
                }
                if ($count_hr<1) {
                    if ($count_hr=="0") {
												$valueHr = $field_hr;
                    }
                }
                $count_hr++;
            }

						//fetch last 24 hours averagen and note values
						$json_url_dy = "https://thingspeak.com/channels/".$channel_id."/field/2.json?timezone=Africa%2FNairobi&average=1440";
            $ch_dy = curl_init();
            curl_setopt($ch_dy, CURLOPT_URL, $json_url_dy);
            curl_setopt($ch_dy, CURLOPT_RETURNTRANSFER, 1);
            $data_dy = curl_exec($ch_dy);
            curl_close($ch_dy);

            $count_dy = 0;
            $date_dy = "";
            $field_dy = "";
            $json_dy = json_decode($data_dy, true);
            // usort($json['feeds'], function ($value1_dy, $value2_dy) {
            //     return  $value1_dy["entry_id"]<$value2_dy["entry_id"];
            // });

            foreach ($json_dy['feeds'] as $feed_dy) {
                $date_dy = $feed_dy["created_at"];
                $field_dy = $feed_dy["field2"];
                if ($field_dy > 500) {
                    $field_dy = 500;
                }
                if ($field_dy < 0) {
                    $field_dy = 0;
                }
                if ($count_dy<1) {
                    if ($count_dy=="0") {
                        $valueDy = $field_dy;
                    }
                }
                $count_dy++;
            }

            $nodes = array();
            //add type to nodes array
            $nodes["type"] = "Feature";
            //create properties object
            $properties = array();
            $properties["id"] = $channel_id;
            $properties["name"] = $channel_name;
            $properties["desc"] = $channel_address;
            $properties["av_day"] = $valueDy;
            $properties["av_hour"] = $valueHr;
            $properties["latest"] = $valueLt;
            $properties["date"] = $now;
            //add properties object to nodes array
            $nodes["properties"] = $properties;
            //add geometry previously created object to nodes array
            $nodes["geometry"] = $geometry;
            //add this node to the nodes array
            array_push($response["nodes"], $nodes);
        }
        echo json_encode($response);
    } else {
        echo "No Nodes";
    }
?>
