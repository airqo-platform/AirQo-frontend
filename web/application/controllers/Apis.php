<?php
function request($url, $method = 'GET') {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);

    $headers = array();
    $headers[] = 'Content-Type: application/json';
    curl_setopt($url, CURLOPT_HTTPHEADER, $headers);
    $json = curl_exec($curl);
    curl_close($curl);
    return json_decode($json, true);
}

function utc_to_local($utc_date, $timezone = 'Africa/Kampala'){
    /* $utc_date must be in YYYY-mm-dd H:i:s format*/
    $userTimezone = new DateTimeZone($timezone);
    $gmtTimezone = new DateTimeZone('GMT');
    $myDateTime = new DateTime($utc_date, $gmtTimezone);
    $offset = $userTimezone->getOffset($myDateTime);
    return date("Y-m-d H:i:s", strtotime($utc_date)+$offset);
}


class Apis extends CI_Controller
{

    public function airqoPlaceLatest()
    {
        $this->ApisModel->init();
        $this->form_validation->set_rules('channel', 'Place channel', 'trim|required');
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $channel = $this->ApisModel->escape($this->input->post("channel"));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $response["nodes"] = array();
                $nodes = array();

                $json_url_lt = "https://data-manager-dot-airqo-250220.uc.r.appspot.com/api/v1/data/feeds/recent/".$channel;
                $ch_lt = curl_init();
                curl_setopt($ch_lt, CURLOPT_URL, $json_url_lt);
                curl_setopt($ch_lt, CURLOPT_RETURNTRANSFER, 1);
                $feeds_json = curl_exec($ch_lt);
                curl_close($ch_lt);
                $feeds_array = json_decode($feeds_json, true);
                $nodes["lastfeeds"] = $feeds_array;

                array_push($response["nodes"], $nodes);

                $state      = $this->ApisModel->stateOk();
                $state_name = "success";
                $state_code = 100;
                $message    = "Sucessful";
                $debug      = "API Config OK";
                echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
            } else {
                echo $validate;
            }
        }
    }

    public function airqoChannelFeed()
    {
        $this->ApisModel->init();
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        $this->form_validation->set_rules('channel', 'Channel', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $api = $this->ApisModel->escape($this->input->post("api"));
            $channel = $this->ApisModel->escape($this->input->post("channel"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $json_url_lt = "https://forecast-dot-airqo-250220.appspot.com/api/v1/forecast/feeds/".$channel;
                $ch_lt = curl_init();
                curl_setopt($ch_lt, CURLOPT_URL, $json_url_lt);
                curl_setopt($ch_lt, CURLOPT_RETURNTRANSFER, 1);
                $feeds_json = curl_exec($ch_lt);
                curl_close($ch_lt);
                $feeds_array = json_decode($feeds_json, true);
                         
                $response["lastfeeds"] = $feeds_array;
                $state      = $this->ApisModel->stateOk();
                $state_name = "success";
                $state_code = 100;
                $message    = "Sucessful";
                $debug      = "API Config OK";
                echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
            } else {
                echo $validate;
            }
        }
    }

    public function airqoPlaces()
    {
        $response = array();
        $this->ApisModel->init();
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $sql_pick_nodes = "SELECT n.an_channel_id, n.an_name, n.an_map_address, n.an_lat, n.an_lng
                                        FROM tbl_app_nodes n
                                        WHERE n.an_deleted = '0' 
                                        AND n.an_active = '1'
                                        ORDER BY n.an_name ASC";
                $query_pick_nodes = $this->db->query($sql_pick_nodes);
                if ($query_pick_nodes->num_rows() > 0) {
                    $response["nodes"] = array();
                    $pnodes = $query_pick_nodes->result_array();
                    foreach ($pnodes as $prow) {
                        $nodes = array();
                        $channel             = $prow["an_channel_id"];
                        $nodes["channel_id"] = $channel;
                        $nodes["name"]       = $prow["an_name"];
                        $nodes["location"]   = $prow["an_map_address"];
                        $nodes["lat"]        = $prow["an_lat"];
                        $nodes["lng"]        = $prow["an_lng"];

                        $json_url_lt = "https://data-manager-dot-airqo-250220.uc.r.appspot.com/api/v1/data/feeds/recent/".$channel;
                        $ch_lt = curl_init();
                        curl_setopt($ch_lt, CURLOPT_URL, $json_url_lt);
                        curl_setopt($ch_lt, CURLOPT_RETURNTRANSFER, 1);
                        $feeds_json = curl_exec($ch_lt);
                        curl_close($ch_lt);
                        $feeds_array = json_decode($feeds_json, true);

                        $nodes["lastfeeds"] = $feeds_array;

                        array_push($response["nodes"], $nodes);
                    }
                      
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 100;
                    $message    = "Sucessful";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                } else {
                    
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 109;
                    $message    = "No places found";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoPlacesCached()
    {
        $this->ApisModel->init(); 
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $sql_pick_nodes = "SELECT n.an_channel_id, n.an_name, n.an_map_address, n.an_lat, n.an_lng, n.reading, n.time, n.an_type
                                        FROM tbl_app_nodes n
                                        WHERE n.an_deleted = '0' 
                                        AND n.an_active = '1'
                                        ORDER BY n.an_name ASC";
                $query_pick_nodes = $this->db->query($sql_pick_nodes);
                if ($query_pick_nodes->num_rows() > 0) {
                    $response["nodes"] = array();
                    $pnodes = $query_pick_nodes->result_array();
                    foreach ($pnodes as $prow) {
                        $nodes = array();
                        $channel             = $prow["an_channel_id"];
                        $nodes["channel_id"] = $channel;
                        $nodes["name"]       = $prow["an_name"];
                        $nodes["location"]   = $prow["an_map_address"];
                        $nodes["lat"]        = $prow["an_lat"];
                        $nodes["lng"]        = $prow["an_lng"];
                        $nodes["field2"]     = $prow["reading"];
                        $nodes["time"]       = $prow["time"];
                        $nodes["an_type"]    = $prow["an_type"];
                        $nodes["churl"]      = $this->ApisModel->base64url_encode($channel);

                        array_push($response["nodes"], $nodes);
                    }
                      
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 100;
                    $message    = "Sucessful";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                } else {
                    
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 109;
                    $message    = "No places found";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }
    
    public function airqoUserPlaces()
    {
        $this->ApisModel->init();
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        $this->form_validation->set_rules('uid', 'User ID', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $api = $this->ApisModel->escape($this->input->post("api"));
            $uid = $this->ApisModel->escape($this->input->post("uid"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $sql_pick_nodes = "SELECT n.an_channel_id, n.an_name, n.an_map_address, n.an_lat, n.an_lng, 
                         COALESCE(drs.adrs_id, 'false') AS daily_reports, 
                         COALESCE(up.aup_id, 'false') AS user_place,
                         COALESCE(tas.atas_threshold, 'false') AS threshold_subscription
                         FROM tbl_app_nodes n 
                         LEFT JOIN tbl_daily_report_subscriptions drs ON drs.adrs_node_id = n.an_channel_id AND (drs.adrs_user_id = '$uid') AND (drs.adrs_status = 'active')
                         LEFT JOIN tbl_user_places up ON up.aup_node_id = n.an_channel_id AND (up.aup_user_id = '$uid') AND (up.aup_status = 'active')
                         LEFT JOIN tbl_threshold_alert_subscriptions tas ON tas.atas_node_id = n.an_channel_id AND (tas.atas_user_id = '$uid') AND (tas.atas_status = 'active')
                         WHERE n.an_deleted = '0' 
                         AND n.an_active = '1'
                         ORDER BY n.an_channel_id DESC";
                $query_pick_nodes = $this->db->query($sql_pick_nodes);
                if ($query_pick_nodes->num_rows() > 0) {
                    $response["nodes"] = array();
                    $pnodes = $query_pick_nodes->result_array();
                    foreach ($pnodes as $prow) {
                        $nodes = array();
                        $nodes["channel_id"]= $prow["an_channel_id"];
                        $nodes["name"] = $prow["an_name"];
                        $nodes["location"] = $prow["an_map_address"];
                        $nodes["lat"] = $prow["an_lat"];
                        $nodes["lng"] = $prow["an_lng"];
                        $nodes["daily_reports"] = (($prow["daily_reports"] != "false")? "true":"false");
                        $nodes["user_place"] = (($prow["user_place"] != "false")? "true":"false");
                        $nodes["threshold_subscription"] = $prow["threshold_subscription"];

                        array_push($response["nodes"], $nodes);
                    }
                              
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 100;
                    $message    = "Sucessful";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                } else {
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 109;
                    $message    = "No places found";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoSearchPlaces()
    {
        $this->ApisModel->init();
        $this->form_validation->set_rules('key', 'Search Key', 'trim|required');
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $api = $this->ApisModel->escape($this->input->post("api"));
            $key = $this->ApisModel->escape($this->input->post("key"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $sql_pick_nodes = "SELECT n.an_channel_id, n.an_name, n.an_map_address, n.an_lat, n.an_lng
                                        FROM tbl_app_nodes n
                                        WHERE (n.an_name LIKE '%$key%') OR (n.an_map_address LIKE '%$key%')
                                        AND n.an_deleted = '0' 
                                        AND n.an_active = '1'
                                        ORDER BY n.an_name ASC";
                $query_pick_nodes = $this->db->query($sql_pick_nodes);
                if ($query_pick_nodes->num_rows() > 0) {
                    $response["nodes"] = array();
                    $pnodes = $query_pick_nodes->result_array();
                    foreach ($pnodes as $prow) {
                        $nodes = array();
                        $channel             = $prow["an_channel_id"];
                        $nodes["channel_id"] = $channel;
                        $nodes["name"]       = $prow["an_name"];
                        $nodes["location"]   = $prow["an_map_address"];
                        $nodes["lat"]        = $prow["an_lat"];
                        $nodes["lng"]        = $prow["an_lng"];

                        array_push($response["nodes"], $nodes);
                    }
                      
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 100;
                    $message    = "Sucessful";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                } else {
                    
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 109;
                    $message    = "No places found";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }
    
    public function airqoSearchPlacesReading()
    {
        $this->ApisModel->init();
        $this->form_validation->set_rules('key', 'Search Key', 'trim|required');
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $api = $this->ApisModel->escape($this->input->post("api"));
            $key = $this->ApisModel->escape($this->input->post("key"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $sql_pick_nodes = "SELECT n.an_channel_id, n.an_name, n.an_map_address, n.an_lat, n.an_lng
                                        FROM tbl_app_nodes n
                                        WHERE (n.an_name LIKE '%$key%') OR (n.an_map_address LIKE '%$key%')
                                        AND n.an_deleted = '0' 
                                        AND n.an_active = '1'
                                        ORDER BY n.an_name ASC";
                $query_pick_nodes = $this->db->query($sql_pick_nodes);
                if ($query_pick_nodes->num_rows() > 0) {
                    $response["nodes"] = array();
                    $pnodes = $query_pick_nodes->result_array();
                    foreach ($pnodes as $prow) {
                        $nodes = array();
                        $channel             = $prow["an_channel_id"];
                        $nodes["channel_id"] = $channel;
                        $nodes["name"]       = $prow["an_name"];
                        $nodes["location"]   = $prow["an_map_address"];
                        $nodes["lat"]        = $prow["an_lat"];
                        $nodes["lng"]        = $prow["an_lng"];

                        $json_url_lt = "https://data-manager-dot-airqo-250220.uc.r.appspot.com/api/v1/data/feeds/recent/".$channel;
                        $ch_lt = curl_init();
                        curl_setopt($ch_lt, CURLOPT_URL, $json_url_lt);
                        curl_setopt($ch_lt, CURLOPT_RETURNTRANSFER, 1);
                        $feeds_json = curl_exec($ch_lt);
                        curl_close($ch_lt);
                        $feeds_array = json_decode($feeds_json, true);

                        $nodes["lastfeeds"] = $feeds_array;

                        array_push($response["nodes"], $nodes);
                    }
                      
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 100;
                    $message    = "Sucessful";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                } else {
                    
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 109;
                    $message    = "No places found";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoNearest()
    {
        $this->ApisModel->init();
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        $this->form_validation->set_rules('lat', 'Latitude', 'trim|required');
        $this->form_validation->set_rules('lng', 'Longitude', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $api = $this->ApisModel->escape($this->input->post("api"));
            $lat = $this->ApisModel->escape($this->input->post("lat"));
            $lng = $this->ApisModel->escape($this->input->post("lng"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $sql_pick_nodes = "SELECT n.*, (3956 * 2 * ASIN(SQRT(POWER(SIN(($lat - abs(n.an_lat)) * PI()/180 / 2),2) + COS($lat * PI()/180 ) * COS(abs(n.an_lat) * PI()/180) * POWER(SIN(($lng - n.an_lng) *  PI()/180 / 2), 2) ))) AS distance
                                                                                FROM tbl_app_nodes n
                                                                                WHERE n.an_deleted = '0' 
                                                                                AND n.an_active = '1'
                                                                                ORDER BY distance ASC LIMIT 1";

                $query_pick_nodes = $this->db->query($sql_pick_nodes);
                if ($query_pick_nodes->num_rows() > 0) {
                    $prow = $query_pick_nodes->row_array();
                              
                    $channel                 = $prow["an_channel_id"];
                    $response["channel_id"]  = $channel;
                    $response["name"]        = $prow["an_name"];
                    $response["location"]    = $prow["an_map_address"];
                    $response["lat"]         = $prow["an_lat"];
                    $response["lng"]         = $prow["an_lng"];

                    $json_url_lt = "https://data-manager-dot-airqo-250220.uc.r.appspot.com/api/v1/data/feeds/recent/".$channel;
                    $ch_lt = curl_init();
                    curl_setopt($ch_lt, CURLOPT_URL, $json_url_lt);
                    curl_setopt($ch_lt, CURLOPT_RETURNTRANSFER, 1);
                    $feeds_json = curl_exec($ch_lt);
                    curl_close($ch_lt);
                    $feeds_array = json_decode($feeds_json, true);
                         
                    $response["lastfeeds"] = $feeds_array;
                         
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 100;
                    $message    = "Sucessful";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                } else {
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 109;
                    $message    = "No place found";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }
               
    public function ForgotPassword()
    {
        $response = array();
        $this->ApisModel->init();
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        $this->form_validation->set_rules('email', 'Email Address', 'trim|required');
          
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $email = $this->ApisModel->escape($this->input->post('email'));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $result = $this->db->query("SELECT * FROM tbl_users 
                    WHERE au_email = '$email'  LIMIT 1");
                if ($result->num_rows() > 0) {
                    $record = $result->row_array();
                    $id  = $record["au_id"];
                    $name =  $record["au_name"];
                    $email =  $record["au_email"];
                    $status = $record["au_status"];
                         
                    if ($status == "active") {
                        if ($this->ApisModel->SendForgotPasswordEmail($email, $id, $name)) {
                            $state      = $this->ApisModel->stateOk();
                            $state_name = "success";
                            $state_code = 100;
                            $message    = "Sucessful";
                            $debug      = "API Config OK";
                            echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                        } else {
                            $state      = $this->ApisModel->stateOk();
                            $state_name = "success";
                            $state_code = 109;
                            $message    = "Unable to request password reset";
                            $debug      = "API Config OK";
                            echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                        }
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 106;
                        $message    = "Account disabled by the administrator";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                } else {
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 107;
                    $message    = "No account found with provided email";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoUserLogin()
    {
        $this->ApisModel->init();
        $this->form_validation->set_rules('email', 'Email', 'trim|required');
        $this->form_validation->set_rules('password', 'Password', 'trim|required');
          
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $email = $this->ApisModel->escape($this->input->post("email"));
            $user_password = $this->ApisModel->escape($this->input->post("password"));
            $user_pass = sha1($user_password);
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $loginState = $this->ApisModel->isUserLoginAllowed($email);
                if ($loginState == "Allowed") {
                    $result = $this->db->query("SELECT * FROM tbl_users
                    WHERE au_email = '$email' AND au_password = '$user_pass' LIMIT 1");
                    if ($result->num_rows() > 0) {
                        $record = $result->row_array();
                        $id = $record["au_id"];
                        $email = $record["au_email"];
                        $name = $record["au_name"];
                        $status = $record["au_status"];
                            
                        $token = md5(microtime(true).mt_Rand());
                        $update_token = $this->db->query("UPDATE tbl_tokens SET token = '$token' WHERE user_id = '$id' LIMIT 1");
                        if ($update_token) {
                        }
                       
                        if ($status == "active") {
                            $this->ApisModel->userLoginAttempt($email, true);
                            $response["id"] = $id;
                            $response["name"] = $name;
                            $response["email"] = $email;
                            $response["token"] = $token;
                            
                            $state      = $this->ApisModel->stateOk();
                            $state_name = "success";
                            $state_code = 100;
                            $message    = "Sucessful";
                            $debug      = "API Config OK";
                            echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                        } else {
                            $state      = $this->ApisModel->stateOk();
                            $state_name = "success";
                            $state_code = 107;
                            $message    = "This account was disabled by the AirQo. Please contact support.";
                            $debug      = "API Config OK";
                            echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                        }
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 107;
                        $message    = "Please check your email or password";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                } else {
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 107;
                    $message    = "".$loginState;
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }

    public function checkUserSession()
    {
        $this->ApisModel->init();
        $this->form_validation->set_rules('user', 'User', 'trim|required');
        $this->form_validation->set_rules('token', 'Token', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $user = $this->ApisModel->escape($this->input->post("user"));
            $token = $this->ApisModel->escape($this->input->post("token"));

            $check_session = $this->db->query("SELECT token 
               FROM tbl_tokens
               WHERE user_id = '$user'
               ORDER BY id DESC LIMIT 1");
            if ($check_session->num_rows() > 0) {
                $session = $check_session->row_array();
                $rtoken = $session["token"];
                if ($rtoken != $token) {
                    $response["success"] = 1;
                    $response["title"] = "Session changed";
                    $response["message"] = "New session found. Log user out.";
                    echo json_encode($response);
                    die();
                } else {
                    $response["success"] = 0;
                    $response["title"] = "Session the same";
                    $response["message"] = "Same session";
                    echo json_encode($response);
                    die();
                }
            } else {
                $response["success"] = 1;
                $response["title"] = "No token found";
                $response["message"] = "Logout, no previous token found";
                echo json_encode($response);
                die();
            }
        }
    }

    public function airqoSignUp()
    {
        $response = array();
        $this->ApisModel->init();
        $this->form_validation->set_rules('name', 'Name', 'trim|required');
        $this->form_validation->set_rules('email', 'Email', 'trim|required');
        $this->form_validation->set_rules('password', 'Password', 'trim|required');
          
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $name = $this->ApisModel->escape($this->input->post("name"));
            $email = $this->ApisModel->escape($this->input->post("email"));
            $password = $this->ApisModel->escape($this->input->post("password"));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $user_pass = sha1($password);
                $id = md5(microtime(true).mt_Rand());
                $result = $this->db->query("SELECT * FROM tbl_users
                WHERE au_email = '$email' LIMIT 1");
                if ($result->num_rows() > 0) {
                    $record = $result->row_array();
                    $status = $record["au_status"];
                    if($status == "active"){
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 107;
                        $message    = "Email already in use by an active account.";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 108;
                        $message    = "Email already in use by a disabled account";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                } else {
                    $token = md5(microtime(true).mt_Rand());
                    $signup = $this->db->query("INSERT INTO tbl_users 
                    (au_no, au_id, au_name, au_email, au_password, au_token, au_joined, au_last_login, au_status)
                    VALUES (NULL, '$id', '$name', '$email', '$user_pass', '$token', NOW(), NOW(), 'active')");
                    if($signup){
                        $response["id"] = $id;
                        $response["name"] = $name;
                        $response["email"] = $email;
                        
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 100;
                        $message    = "Sucessful";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 109;
                        $message    = "Unable to create user account. Please try again";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoAddFavoritePlace()
    {
        $response = array();
        $this->ApisModel->init();
        $this->form_validation->set_rules('user', 'User', 'trim|required');
        $this->form_validation->set_rules('node', 'Node', 'trim|required');
        $this->form_validation->set_rules('state', 'State', 'trim|required');
          
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $state = $this->ApisModel->escape($this->input->post("state"));
            $user = $this->ApisModel->escape($this->input->post("user"));
            $node = $this->ApisModel->escape($this->input->post("node"));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {

                $result = $this->db->query("SELECT * FROM tbl_user_places
                WHERE aup_node_id = '$node' AND aup_user_id = '$user' LIMIT 1");
                if ($result->num_rows() > 0) {
                    $update_subscription = $this->db->query("UPDATE tbl_user_places
                                                            SET aup_status = '$state'
                                                            WHERE aup_user_id = '$user' AND aup_node_id = '$node'");
                    if ($update_subscription) {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 100;
                        $message    = "Sucessful";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 107;
                        $message    = "Unable to update place subscription";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                } else {
                    $id = md5(microtime(true).mt_Rand());
                    $subscribe = $this->db->query("INSERT INTO tbl_user_places 
                                                (aup_no, aup_id, aup_user_id, aup_node_id, aup_added, aup_status)
                                                VALUES (NULL, '$id', '$user', '$node', '$now', '$state')");
                    if ($subscribe) {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 100;
                        $message    = "Sucessful";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 107;
                        $message    = "Unable to add place subscription";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoSubscribeDailyReports()
    {
        $response = array();
        $this->ApisModel->init();
        $this->form_validation->set_rules('user', 'User', 'trim|required');
        $this->form_validation->set_rules('node', 'Node', 'trim|required');
        $this->form_validation->set_rules('state', 'State', 'trim|required');
          
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $state = $this->ApisModel->escape($this->input->post("state"));
            $user = $this->ApisModel->escape($this->input->post("user"));
            $node = $this->ApisModel->escape($this->input->post("node"));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {

                $result = $this->db->query("SELECT * FROM tbl_daily_report_subscriptions
                                            WHERE adrs_node_id = '$node' AND adrs_user_id = '$user' LIMIT 1");
                if ($result->num_rows() > 0) {
                    $update_subscription = $this->db->query("UPDATE tbl_daily_report_subscriptions
                                                            SET adrs_status = '$state'
                                                            WHERE adrs_user_id = '$user' AND adrs_node_id = '$node'");
                    if ($update_subscription) {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 100;
                        $message    = "Sucessful";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 107;
                        $message    = "Unable to update daily report subscription";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                } else {
                    $id = md5(microtime(true).mt_Rand());
                    $subscribe = $this->db->query("INSERT INTO tbl_daily_report_subscriptions 
                                                    (adrs_no, adrs_id, adrs_user_id, adrs_node_id, adrs_subscribed, adrs_status)
                                                    VALUES (NULL, '$id', '$user', '$node', '$now', '$state')");
                    if ($subscribe) {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 100;
                        $message    = "Sucessful";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 107;
                        $message    = "Unable to add daily report subscription";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoSubscribeThreshold()
    {   
        $response = array();
        $this->ApisModel->init();
        $this->form_validation->set_rules('user', 'User', 'trim|required');
        $this->form_validation->set_rules('node', 'Node', 'trim|required');
        $this->form_validation->set_rules('state', 'State', 'trim|required');
        $this->form_validation->set_rules('threshold', 'Threshold', 'trim|required');
          
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $state = $this->ApisModel->escape($this->input->post("state"));
            $user = $this->ApisModel->escape($this->input->post("user"));
            $node = $this->ApisModel->escape($this->input->post("node"));
            $threshold = $this->ApisModel->escape($this->input->post("threshold"));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {

                $result = $this->db->query("SELECT * FROM tbl_threshold_alert_subscriptions
                                            WHERE atas_node_id = '$node' AND atas_user_id = '$user' LIMIT 1");
                if ($result->num_rows() > 0) {
                    $update_subscription = $this->db->query("UPDATE tbl_threshold_alert_subscriptions
                                                            SET atas_status = '$state', atas_threshold = '$threshold'
                                                            WHERE atas_user_id = '$user' AND atas_node_id = '$node'");
                    if ($update_subscription) {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 100;
                        $message    = "Sucessful";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 107;
                        $message    = "Unable to update threshold subscription";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                } else {
                    $id = md5(microtime(true).mt_Rand());
                    $subscribe = $this->db->query("INSERT INTO tbl_threshold_alert_subscriptions 
                                                    (atas_no, atas_id, atas_user_id, atas_node_id, atas_threshold, atas_subscribed, atas_status)
                                                    VALUES (NULL, '$id', '$user', '$node', '$threshold', '$now', '$state')");
                    if ($subscribe) {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 100;
                        $message    = "Sucessful";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    } else {
                        $state      = $this->ApisModel->stateOk();
                        $state_name = "success";
                        $state_code = 107;
                        $message    = "Unable to add threshold subscription";
                        $debug      = "API Config OK";
                        echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                    }
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoFeedback()
    {
        $response = array();
        $this->ApisModel->init();
        $this->form_validation->set_rules('uid', 'User', 'trim|required');
        $this->form_validation->set_rules('subject', 'Subject', 'trim|required');
        $this->form_validation->set_rules('body', 'Body', 'trim|required');
          
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $uid = $this->ApisModel->escape($this->input->post("uid"));
            $subject = $this->ApisModel->escape($this->input->post("subject"));
            $body = $this->ApisModel->escape($this->input->post("body"));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {

                $id = md5(microtime(true).mt_Rand());
                $feedback = $this->db->query("INSERT INTO tbl_app_feedback 
                (aaf_no, aaf_id, aaf_user_id, aaf_subject, aaf_body, aaf_date, aaf_status)
                VALUES (NULL, '$id', '$uid', '$subject', '$body', NOW(), 'active')");
                if($feedback){
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 100;
                    $message    = "Sucessful";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                } else {
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 107;
                    $message    = "Unable to submit feedback";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }

    public function airqoAqiCamera()
    {
        $response = array();  
        $this->ApisModel->init();
        //$this->form_validation->set_rules('uid', 'User', 'trim|required');
        $this->form_validation->set_rules('name', 'Place name', 'trim|required');
        $this->form_validation->set_rules('lat', 'Place latitude', 'trim|required');
        $this->form_validation->set_rules('lng', 'Place longitude', 'trim|required');
        $this->form_validation->set_rules('reading', 'Air quality index', 'trim|required');
        $this->form_validation->set_rules('comment', 'Comment', 'trim|required');
        $this->form_validation->set_rules('photo', 'Photo', 'trim|required');
	$this->form_validation->set_rules('api', 'Api', 'trim|required');
        
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
		$uid = '';
            //$uid = $this->ApisModel->escape($this->input->post("uid"));
            $name = $this->ApisModel->escape($this->input->post("name"));
            $lat = $this->ApisModel->escape($this->input->post("lat"));
            $lng = $this->ApisModel->escape($this->input->post("lng"));
            $reading = $this->ApisModel->escape($this->input->post("reading"));
            $comment = $this->ApisModel->escape($this->input->post("comment"));
            $photo = $this->ApisModel->escape($this->input->post("photo"));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {

               /* $id = md5(microtime(true).mt_Rand());
                $aqi_photo = 'aqi_camera_'.$id.'.jpg';
                $binary_aqi = base64_decode($photo);
                header('Content-Type: bitmap; charset=utf-8');
                $file_aqi = fopen('./assets/images/aqi/'.$aqi_photo, 'wb');
                fwrite($file_aqi, $binary_aqi);
                fclose($file_aqi);*/

                $aqi = $this->db->query("INSERT INTO tbl_aqi_camera 
                (aac_no, aac_id, aac_user_id, aac_place_name, aac_place_lat, aac_plate_lng, aac_reading, aac_comment, aac_photo, aac_submitted, aac_status)
                VALUES (NULL, '$id', '$uid', '$name', '$lat', '$lng', '$reading', '$comment', '$photo', NOW(), 'new')");
                if($aqi){
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 100;
                    $message    = "Sucessful";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                } else {
                    $state      = $this->ApisModel->stateOk();
                    $state_name = "success";
                    $state_code = 107;
                    $message    = "Unable to submit the Air quality index. Please try again.";
                    $debug      = "API Config OK";
                    echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
                }
            } else {
                echo $validate;
            }
        }
    }


    public function airqoPlacesJobUpdate()
    {
        $response = array();
        $this->ApisModel->init();
        $sql_pick_nodes = "SELECT n.an_channel_id, n.an_name, n.an_map_address, n.an_lat, n.an_lng
                                        FROM tbl_app_nodes n
                                        WHERE n.an_deleted = '0' 
                                        AND n.an_active = '1'
                                        ORDER BY n.an_channel_id";
        $query_pick_nodes = $this->db->query($sql_pick_nodes);
        if ($query_pick_nodes->num_rows() > 0) {
            $pnodes = $query_pick_nodes->result_array();
            $total = 0;
            $mr = "";
            foreach ($pnodes as $prow) {
                $channel = $prow["an_channel_id"];
                $json_url_lt = "https://data-manager-dot-airqo-250220.uc.r.appspot.com/api/v1/data/feeds/recent/".$channel;
                $json = file_get_contents($json_url_lt);
                $json = json_decode($json);
                if ($json) {
                    $date = $json->{'created_at'};
                    $reading = $json->{'field2'};
                    $reading = trim($reading);
                    $lat = $json->{'field5'};
                    $lng = $json->{'field6'};
                    $update_node = $this->db->query("UPDATE tbl_app_nodes SET time = '$date', reading = '$reading', an_dateUpdated = NOW()
                                                    WHERE an_channel_id = '$channel' LIMIT 1");
                    if($update_node){
                        $mr .= "" . $reading;
                    }

                }
                $total = $total + 1;
            }
                
            $state      = $this->ApisModel->stateOk();
            $state_name = "success";
            $state_code = 100;
            $message    = "Sucessful (".$total." places updated)";
            $debug      = "API Config OK";
            echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
        } else {
            $state      = $this->ApisModel->stateOk();
            $state_name = "success";
            $state_code = 109;
            $message    = "No places to update";
            $debug      = "API Config OK";
            echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
        }
    }


// public function placeForecast()
//     {   
//         $response = array();
//         $this->ApisModel->init();
//         $this->form_validation->set_rules('lat', 'Place latitude', 'trim|required');
//         $this->form_validation->set_rules('lng', 'Place longitude', 'trim|required');
//         $this->form_validation->set_rules('api', 'API', 'trim|required');
//         if ($this->form_validation->run() == false) {
//             echo $this->ApisModel->api_error();
//         } else {
//             $lat = $this->ApisModel->escape($this->input->post("lat"));
//             $lng = $this->ApisModel->escape($this->input->post("lng"));
//             $api = $this->ApisModel->escape($this->input->post("api"));
//             $validate = $this->ApisModel->validateAPI($api);
//             if ($validate == $this->ApisModel->stateOk()) {

//                 // $url = "https://ml-service-dot-airqo-250220.appspot.com/api/v1/predict/";
//                 $url = "http://34.78.78.202:30009/api/v1/predict/";
//                 $ch = curl_init($url);

//                 $lat = $this->ApisModel->escape($this->input->post("lat"));
//                 $lng = $this->ApisModel->escape($this->input->post("lng"));

//                 date_default_timezone_set('Africa/Kampala');
//                 $now  =  date("Y-m-d H:i:s");
//                 $time = strtotime($now);
//                 $time = $time - (60*60);
//                 $selected_datetime = date("Y-m-d H:i", $time);

//                 $data = array(
//                     'selected_datetime' => $selected_datetime,
//                     'latitude' => $lat,
//                     'longitude' => $lng
//                 );

//                 $payload = json_encode($data);
//                 curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
//                 $headers = array();
//                 curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
//                 curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
//                 curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
//                 curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//                 $result = curl_exec($ch);

//                 curl_close($ch);

//                 $response = json_decode($result, true);

//                 // $curl = curl_init();

//                 // curl_setopt_array($curl, array(
//                 //     CURLOPT_URL => "http://34.78.78.202:30009/api/v1/predict/",
//                 //     CURLOPT_RETURNTRANSFER => true,
//                 //     CURLOPT_ENCODING => "",
//                 //     CURLOPT_MAXREDIRS => 10,
//                 //     CURLOPT_TIMEOUT => 0,
//                 //     CURLOPT_FOLLOWLOCATION => true,
//                 //     CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
//                 //     CURLOPT_CUSTOMREQUEST => "POST",
//                 //     CURLOPT_POSTFIELDS => $data,
//                 //     CURLOPT_HTTPHEADER => array(
//                 //         "Content-Type: application/json"
//                 //     ),
//                 // ));

//                 // $result = curl_exec($curl);

//                 // curl_close($curl);
//                 // $response = json_decode($result, true);
                
//                 $state      = $this->ApisModel->stateOk();
//                 $state_name = "success";
//                 $state_code = 100;
//                 $message    = "Sucessful";
//                 $debug      = "API Config OK";
//                 echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
//             } else {
//                 echo $validate;
//             }
//         }
//     }

    public function placeForecast()
    {   
        $response = array();
        $this->ApisModel->init(); 
        $this->form_validation->set_rules('channel', 'Channel ID', 'trim|required');
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $channel = $this->ApisModel->escape($this->input->post("channel"));
            $api = $this->ApisModel->escape($this->input->post("api"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {

                date_default_timezone_set('Africa/Kampala');
                $now  =  date("Y-m-d H:i:s");
                $time = strtotime($now);
                // $time = $time - (60*60);
                // $selected_datetime = date("Y-m-d H:i", $time);
                $selected_time = time();

                $ch = curl_init();

                curl_setopt($ch, CURLOPT_URL, "http://34.78.78.202:31009/api/v2/predict/".$channel."/" . $selected_time);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');


                $headers = array();
                $headers[] = 'Content-Type: application/json';
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

                $result = curl_exec($ch);
                $response = json_decode($result, true);
                curl_close($ch);

                
                $state      = $this->ApisModel->stateOk();
                $state_name = "success";
                $state_code = 100;
                $message    = "Sucessful";
                $debug      = "API Config OK";
                echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
            } else {
                echo $validate;
            }
        }
    }


public function airqoPlace24Hours()
    {
        $response = array();  
        $this->ApisModel->init();
        $this->form_validation->set_rules('api', 'API', 'trim|required');
        $this->form_validation->set_rules('channel', 'Channel', 'trim|required');
        if ($this->form_validation->run() == false) {
            echo $this->ApisModel->api_error();
        } else {
            $api = $this->ApisModel->escape($this->input->post("api"));
            $channel = $this->ApisModel->escape($this->input->post("channel"));
            $validate = $this->ApisModel->validateAPI($api);
            if ($validate == $this->ApisModel->stateOk()) {
                $json_url_lt = "https://data-manager-dot-airqo-250220.appspot.com/api/v1/data/feeds/hourly/".$channel;
                $ch_lt = curl_init();
                curl_setopt($ch_lt, CURLOPT_URL, $json_url_lt);
                curl_setopt($ch_lt, CURLOPT_RETURNTRANSFER, 1);
                $feeds_json = curl_exec($ch_lt);
                curl_close($ch_lt);
                $feeds_array = json_decode($feeds_json, true);
                         
                $response["feed"] = $feeds_array;
                $state      = $this->ApisModel->stateOk();
                $state_name = "success";
                $state_code = 100;
                $message    = "Sucessful";
                $debug      = "API Config OK";
                echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
            } else {
                echo $validate;
            }
        }
    }

    // public function placeForecast()
    // {   
    //     $response = array();
    //     $this->ApisModel->init();
    //     $this->form_validation->set_rules('lat', 'Place latitude', 'trim|required');
    //     $this->form_validation->set_rules('lng', 'Place longitude', 'trim|required');
    //     $this->form_validation->set_rules('api', 'API', 'trim|required');
    //     if ($this->form_validation->run() == false) {
    //         echo $this->ApisModel->api_error();
    //     } else {
    //         $lat = $this->ApisModel->escape($this->input->post("lat"));
    //         $lng = $this->ApisModel->escape($this->input->post("lng"));
    //         $api = $this->ApisModel->escape($this->input->post("api"));
    //         $validate = $this->ApisModel->validateAPI($api);
    //         if ($validate == $this->ApisModel->stateOk()) {

    //             $url = "https://ml-service-dot-airqo-250220.appspot.com/api/v1/predict/";
    //             $ch = curl_init($url);

    //             $lat = $this->ApisModel->escape($this->input->post("lat"));
    //             $lng = $this->ApisModel->escape($this->input->post("lng"));

    //             date_default_timezone_set('Africa/Kampala');
    //             $now  =  date("Y-m-d H:i:s");
    //             $time = strtotime($now);
    //             $time = $time - (60*60);
    //             $selected_datetime = date("Y-m-d H:i", $time);

    //             $data = array(
    //                 'selected_datetime' => $selected_datetime,
    //                 'latitude' => $lat,
    //                 'longitude' => $lng
    //             );

    //             $payload = json_encode($data);
    //             curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    //             $headers = array();
    //             curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    //             curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    //             curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
    //             curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    //             $result = curl_exec($ch);

    //             curl_close($ch);

    //             $response = json_decode($result, true);
                
    //             $state      = $this->ApisModel->stateOk();
    //             $state_name = "success";
    //             $state_code = 100;
    //             $message    = "Sucessful";
    //             $debug      = "API Config OK";
    //             echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
    //         } else {
    //             echo $validate;
    //         }
    //     }
    // }

    // public function airqoPlace24Hours()
    // {
    //     $response = array();  
    //     $this->ApisModel->init();
    //     $this->form_validation->set_rules('api', 'API', 'trim|required');
    //     $this->form_validation->set_rules('channel', 'Channel', 'trim|required');
    //     if ($this->form_validation->run() == false) {
    //         echo $this->ApisModel->api_error();
    //     } else {
    //         $api = $this->ApisModel->escape($this->input->post("api"));
    //         $channel = $this->ApisModel->escape($this->input->post("channel"));
    //         $validate = $this->ApisModel->validateAPI($api);
    //         if ($validate == $this->ApisModel->stateOk()) {
    //             $json_url_lt = "https://data-manager-dot-airqo-250220.appspot.com/api/v1/data/feeds/hourly/".$channel;
    //             $ch_lt = curl_init();
    //             curl_setopt($ch_lt, CURLOPT_URL, $json_url_lt);
    //             curl_setopt($ch_lt, CURLOPT_RETURNTRANSFER, 1);
    //             $feeds_json = curl_exec($ch_lt);
    //             curl_close($ch_lt);
    //             $feeds_array = json_decode($feeds_json, true);
                         
    //             $response["feed"] = $feeds_array;
    //             $state      = $this->ApisModel->stateOk();
    //             $state_name = "success";
    //             $state_code = 100;
    //             $message    = "Sucessful";
    //             $debug      = "API Config OK";
    //             echo  $this->ApisModel->api_response($response, $state, $state_name, $state_code, $message, $debug);
    //         } else {
    //             echo $validate;
    //         }
    //     }
    // }
}

