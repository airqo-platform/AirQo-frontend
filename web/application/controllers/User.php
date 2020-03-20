<?php 
class User extends CI_Controller
{
     public function index()
     {
          redirect('');
     }

     //load user places page
     public function UserPlaces()
     {
          $data['navigation'] = 'User Places';
          $data['title']      = 'User Places';
          $data['user']       = $this->session->userdata['loggedin']['adminname'];
          
          $this->load->view('admin/includes/header', $data);
          $this->load->view('admin/includes/menu', $data);
          $this->load->view('admin/user/user-places', $data);
     }

     //Load datatable serverside for user places
     public function LoadUserPlacesTable()
     {
          $table 		= 'tbl_user_places';
          $primaryKey 	= 'aup_id';
          $whereAll	     = "aup_status != 'deleted'";
          

		$columns 		= array(
			array(
					'db' => 'aup_no',
					'dt' => 0,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'aup_node_id',
					'dt' => 1,
					'formatter' => function($d, $row){
                              $node = $this->AdminModel->get_app_nodes($d);
                              if($node != null) {
                                   return $node['an_name'];
                              }
                              return '';
					}
                    ),
               array(
					'db' => 'aup_user_id',
					'dt' => 2,
					'formatter' => function($d, $row){
                              $user = $this->UserModel->get_user($d);
                              if($user != null) {
                                   return $user['au_name'];
                              }
                              return '';
					}
                    ),
               
			array(
					'db' => 'aup_added',
					'dt' => 3,
					'formatter' => function($d, $row){
                              return date('F j, Y', strtotime($d));
					}
                    )
		);

		// SQL server connection information
		$sql_details = array(
			'user' => $this->db->username,
			'pass' => $this->db->password,
			'db'   => $this->db->database,
			'host' => $this->db->hostname
		);

		$whereResult = '';

		echo json_encode(
			SSP::complex ( $_POST, $sql_details, $table, $primaryKey, $columns, $whereResult, $whereAll)
		);
     }

     //load daily report subscriptions page
     public function ReportSubscription()
     {
          $data['navigation'] = 'Daily Reports Subscription';
          $data['title']      = 'Daily Reports Subscription';
          $data['user']       = $this->session->userdata['loggedin']['adminname'];
          
          $this->load->view('admin/includes/header', $data);
          $this->load->view('admin/includes/menu', $data);
          $this->load->view('admin/user/report-subscriptions', $data);
     }

     //Load report subscriptions table serverside
     public function LoadReportSubscriptionTable()
     {
          $table 		= 'tbl_daily_report_subscriptions';
          $primaryKey 	= 'adrs_id';
          $whereAll	     = "adrs_status != 'deleted'";
          

		$columns 		= array(
			array(
					'db' => 'adrs_no',
					'dt' => 0,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'adrs_node_id',
					'dt' => 1,
					'formatter' => function($d, $row){
                              $node = $this->AdminModel->get_app_nodes($d);
                              if($node != null) {
                                   return $node['an_name'];
                              }
                              return '';
					}
                    ),
               array(
					'db' => 'adrs_user_id',
					'dt' => 2,
					'formatter' => function($d, $row){
                              $user = $this->UserModel->get_user($d);
                              if($user != null) {
                                   return $user['au_name'];
                              }
                              return '';
					}
                    ),
               
			array(
					'db' => 'adrs_last_notification',
					'dt' => 3,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    ),
               
               array(
					'db' => 'adrs_subscribed',
					'dt' => 4,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    )
		);

		// SQL server connection information
		$sql_details = array(
			'user' => $this->db->username,
			'pass' => $this->db->password,
			'db'   => $this->db->database,
			'host' => $this->db->hostname
		);

		$whereResult = '';

		echo json_encode(
			SSP::complex ( $_POST, $sql_details, $table, $primaryKey, $columns, $whereResult, $whereAll)
		);
     }
     
     //load daily report subscriptions page
     public function ThresholdAlertSubscriptions()
     {
          $data['navigation'] = 'Threshold Alerts';
          $data['title']      = 'Threshold Alerts';
          $data['user']       = $this->session->userdata['loggedin']['adminname'];
          
          $this->load->view('admin/includes/header', $data);
          $this->load->view('admin/includes/menu', $data);
          $this->load->view('admin/user/threshold-alert-subscriptions', $data);
     }

     //Load threshold alert subscriptions table serverside
     public function LoadThresholdSubscriptionTable()
     {
          $table 		= 'tbl_threshold_alert_subscriptions';
          $primaryKey 	= 'atas_id';
          $whereAll	     = "atas_status != 'deleted'";
          

		$columns 		= array(
			array(
					'db' => 'atas_no',
					'dt' => 0,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'atas_node_id',
					'dt' => 1,
					'formatter' => function($d, $row){
                              $node = $this->AdminModel->get_app_nodes($d);
                              if($node != null) {
                                   return $node['an_name'];
                              }
                              return '';
					}
                    ),
               array(
					'db' => 'atas_user_id',
					'dt' => 2,
					'formatter' => function($d, $row){
                              $user = $this->UserModel->get_user($d);
                              if($user != null) {
                                   return $user['au_name'];
                              }
                              return '';
					}
                    ),
               
			array(
					'db' => 'atas_last_notification',
					'dt' => 3,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    ),
               
               array(
					'db' => 'atas_subscribed',
					'dt' => 4,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    )
		);

		// SQL server connection information
		$sql_details = array(
			'user' => $this->db->username,
			'pass' => $this->db->password,
			'db'   => $this->db->database,
			'host' => $this->db->hostname
		);

		$whereResult = '';

		echo json_encode(
			SSP::complex ( $_POST, $sql_details, $table, $primaryKey, $columns, $whereResult, $whereAll)
		);
     }
     
     //load feedbacks page
     public function AppFeedback()
     {
          $data['navigation'] = 'App Feedback';
          $data['title']      = 'App Feedback';
          $data['user']       = $this->session->userdata['loggedin']['adminname'];
          
          $this->load->view('admin/includes/header', $data);
          $this->load->view('admin/includes/menu', $data);
          $this->load->view('admin/user/app-feedback', $data);
     }

     //Load threshold alert subscriptions table serverside
     public function LoadFeedbackTable()
     {
          $table 		= 'tbl_app_feedback';
          $primaryKey 	= 'aaf_id';
          $whereAll	     = "aaf_status != 'deleted'";
          

		$columns 		= array(
			array(
					'db' => 'aaf_no',
					'dt' => 0,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'aaf_user_id',
					'dt' => 1,
					'formatter' => function($d, $row){
                              $user = $this->UserModel->get_user($d);
                              if($user != null) {
                                   return $user['au_name'];
                              }
                              return '';
					}
                    ),
               
			array(
					'db' => 'aaf_subject',
					'dt' => 2,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ), 
               array(
					'db' => 'aaf_body',
					'dt' => 3,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'aaf_date',
					'dt' => 4,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    ),
               array(
					'db' => 'aaf_status',
					'dt' => 5,
					'formatter' => function($d, $row){
                              if($d == 'active') {
                                   return '<button class="btn btn-xs btn-success">Active</button>';
                              } else if($d == 'disabled') {
                                   return '<button class="btn btn-xs btn-warning">Disabled</button>';
                              }
					}
                    )
		);

		// SQL server connection information
		$sql_details = array(
			'user' => $this->db->username,
			'pass' => $this->db->password,
			'db'   => $this->db->database,
			'host' => $this->db->hostname
		);

		$whereResult = '';

		echo json_encode(
			SSP::complex ( $_POST, $sql_details, $table, $primaryKey, $columns, $whereResult, $whereAll)
		);
     }

     //aqi camera
     public function AQICamera()
     {
          $data['navigation'] = 'AQI Camera';
          $data['title']      = 'AQI Camera';
          $data['user']       = $this->session->userdata['loggedin']['adminname'];
          
          $this->load->view('admin/includes/header', $data);
          $this->load->view('admin/includes/menu', $data);
          $this->load->view('admin/user/aqi-camera', $data);
     }

     //Load threshold alert subscriptions table serverside
     public function LoadAQICameraTable()
     {
          $table 		= 'tbl_aqi_camera';
          $primaryKey 	= 'aac_id';
          $whereAll	     = null;
          

		$columns 		= array(
			array(
					'db' => 'aac_no',
					'dt' => 0,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'aac_node_id',
					'dt' => 1,
					'formatter' => function($d, $row){
                              $node = $this->AdminModel->get_app_nodes($d);
                              if($node != null) {
                                   return $node['an_name'];
                              }
                              return '';
					}
                    ),
               array(
					'db' => 'aac_user_id',
					'dt' => 2,
					'formatter' => function($d, $row){
                              $user = $this->UserModel->get_user($d);
                              if($user != null) {
                                   return $user['au_name'];
                              }
                              return '';
					}
                    ),
               
			array(
					'db' => 'aac_place_name',
					'dt' => 3,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    ), 
               array(
					'db' => 'aac_place_lng',
					'dt' => 4,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'aac_place_lat',
					'dt' => 4,
					'formatter' => function($d, $row){
                              return 'Lat: ' . $d . ' Lng: ' . $row['aac_place_lng'];
					}
                    ),
               array(
					'db' => 'aac_reading',
					'dt' => 5,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    ),
               array(
					'db' => 'aac_photo',
					'dt' => 6,
					'formatter' => function($d, $row){
                              return '<img src="'.$d.'" width="100"/>';
					}
                    ),
               array(
					'db' => 'aac_comment',
					'dt' => 7,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    ),
               array(
					'db' => 'aac_status',
					'dt' => 8,
					'formatter' => function($d, $row){
                              if($d == 'new') {
                                   return '<button class="btn btn-xs btn-warning">New</button>';
                              } else if($d == 'approved') {
                                   return '<button class="btn btn-xs btn-success">Approved</button>';
                              } else if($d == 'declined') {
                                   return '<button class="btn btn-xs btn-danger">Declined</button>';
                              }
					}
                    ),
               array(
					'db' => 'aac_id',
					'dt' => 9,
					'formatter' => function($d, $row){
                              $action_buttons = '';
                              if($row['aac_status'] == 'new') {
                                   $action_buttons .= '<button class="btn btn-xs btn-block btn-success open-approve" data-id="'.$row['aac_id'].'" data-name="this aqi camera" data-toggle="modal" data-target="#approveModal"><i class="fa fa-check"></i> Approve</button>';
                                   $action_buttons .= '<button class="btn btn-xs btn-block btn-danger open-decline" data-id="'.$row['aac_id'].'" data-name="this aci camera" data-toggle="modal" data-target="#declineModal"><i class="fa fa-close"></i> Decline</button>';
                              } else if($row['aac_status'] == 'approved') {
                                   $action_buttons .= '<button class="btn btn-xs btn-success">Approved</button>';
                              } else if($row['aac_status'] == 'declined') {
                                   $action_buttons .= '<button class="btn btn-xs btn-success">Approved</button>';
                              }

                              return $action_buttons;
					}
                    )
		);

		// SQL server connection information
		$sql_details = array(
			'user' => $this->db->username,
			'pass' => $this->db->password,
			'db'   => $this->db->database,
			'host' => $this->db->hostname
		);

		$whereResult = '';

		echo json_encode(
			SSP::complex ( $_POST, $sql_details, $table, $primaryKey, $columns, $whereResult, $whereAll)
		);
     }

     //approve aqi camera data
     public function ApproveAqi()
     {
          date_default_timezone_set('Africa/Kampala');
          $response = array();
          $this->form_validation->set_rules('aqi', 'AQI Data', 'trim|required');
          
          if ($this->form_validation->run() == FALSE) 
          {
               $response['success'] = 0;
               $response['message'] = validation_errors();

               echo json_encode($response);
          } 
          else 
          {
               $aqi = $this->input->post('aqi');
               $user_logged_in = $this->session->userdata['mylib_logged_in']['MYLIB_UID'];
               $condition = array(
                    'aac_id' => $aqi
               );

               $user_data = array(
                    'aac_status' => 'approved',
                    'aac_reviewed' => date('Y-m-d H:i:s'),
                    'aac_reviewed_by' => $user_logged_in
               );

               $activate = $this->UserModel->update_aqicamera($condition, $user_data);
               if($activate) {
                    $response['success'] = 1;
                    $response['message'] = 'Approved successfully';

                    echo json_encode($response);
               } else {
                    $response['success'] = 0;
                    $response['message'] = 'Sorry, unable to approve';

                    echo json_encode($response);
               }
          }
          
     }
     
     //approve aqi camera data
     public function DeclineAqi()
     {
          date_default_timezone_set('Africa/Kampala');
          $response = array();
          $this->form_validation->set_rules('aqi', 'AQI Data', 'trim|required');
          
          if ($this->form_validation->run() == FALSE) 
          {
               $response['success'] = 0;
               $response['message'] = validation_errors();

               echo json_encode($response);
          } 
          else 
          {
               $aqi = $this->input->post('aqi');
               $user_logged_in = $this->session->userdata['mylib_logged_in']['MYLIB_UID'];
               $condition = array(
                    'aac_id' => $aqi
               );

               $user_data = array(
                    'aac_status' => 'declined',
                    'aac_reviewed' => date('Y-m-d H:i:s'),
                    'aac_reviewed_by' => $user_logged_in
               );

               $activate = $this->UserModel->update_aqicamera($condition, $user_data);
               if($activate) {
                    $response['success'] = 1;
                    $response['message'] = 'Declined successfully';

                    echo json_encode($response);
               } else {
                    $response['success'] = 0;
                    $response['message'] = 'Sorry, unable to approve';

                    echo json_encode($response);
               }
          }
          
     }

     //aqi camera
     public function GetInvolved()
     {
          $data['navigation'] = 'Get Involved';
          $data['title']      = 'Get Involved';
          $data['user']       = $this->session->userdata['loggedin']['adminname'];
          
          $this->load->view('admin/includes/header', $data);
          $this->load->view('admin/includes/menu', $data);
          $this->load->view('admin/user/get-involved', $data);
     }

     //Load threshold alert subscriptions table serverside
     public function LoadGetInvolvedTable()
     {
          $table 		= 'tbl_get_involved';
          $primaryKey 	= 'agv_id';
          $whereAll	     = "agv_status != 'deleted'";
          

		$columns 		= array(
			array(
					'db' => 'agv_no',
					'dt' => 0,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'agv_question',
					'dt' => 1,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'agv_question_image',
					'dt' => 2,
					'formatter' => function($d, $row){
                              return '<img src="'.$d.'" width="100" class="thumbnail"/>';
					}
                    ),
               
			array(
					'db' => 'agv_answer',
					'dt' => 3,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ), 
               array(
					'db' => 'agv_objective_a',
					'dt' => 4,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'agv_objective_b',
					'dt' => 5,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'agv_objective_c',
					'dt' => 6,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'agv_objective_d',
					'dt' => 7,
					'formatter' => function($d, $row){
                              return $d;
					}
                    ),
               array(
					'db' => 'agv_added',
					'dt' => 8,
					'formatter' => function($d, $row){
                              return date('F j, Y g:i a', strtotime($d));
					}
                    ),
               array(
					'db' => 'agv_status',
					'dt' => 9,
					'formatter' => function($d, $row){
                              if($d == 'active') {
                                   return '<button class="btn btn-xs btn-success">Active</button>';
                              } else if($d == 'disabled') {
                                   return '<button class="btn btn-xs btn-danger">Disabled</button>';
                              }
					}
                    ),
               array(
					'db' => 'agv_id',
					'dt' => 10,
					'formatter' => function($d, $row){
                              $action_buttons = '';
                              if($row['agv_status'] == 'active') {
                                   //disable, edit, delete
                                   $action_buttons .= '<button class="btn btn-xs btn-block btn-primary open-edit" data-id="'.$row['agv_id'].'" data-toggle="modal" data-target="#editUser"><i class="fa fa-edit"></i> Edit</button>';
                                   $action_buttons .= '<button class="btn btn-xs btn-block btn-warning open-disable" data-id="'.$row['agv_id'].'" data-name="this question" data-toggle="modal" data-target="#disableUser"><i class="fa fa-close"></i> Disable</button>';
                                   $action_buttons .= '<button class="btn btn-xs btn-block btn-danger open-delete" data-id="'.$row['agv_id'].'" data-name="this question" data-toggle="modal" data-target="#deleteUser"><i class="fa fa-trash"></i> Delete</button>';
                              } else if($row['agv_status'] == 'disabled') {
                                   //activate, delete
                                   $action_buttons .= '<button class="btn btn-xs btn-block btn-success open-activate" data-id="'.$row['agv_id'].'" data-name="this question" data-toggle="modal" data-target="#activateUser"><i class="fa fa-check"></i> Activate</button>';
                                   $action_buttons .= '<button class="btn btn-xs btn-block btn-danger open-delete" data-id="'.$row['agv_id'].'" data-name="this question" data-toggle="modal" data-target="#deleteUser"><i class="fa fa-trash"></i> Delete</button>';
                              }
                              return $action_buttons;
					}
                    )
		);

		// SQL server connection information
		$sql_details = array(
			'user' => $this->db->username,
			'pass' => $this->db->password,
			'db'   => $this->db->database,
			'host' => $this->db->hostname
		);

		$whereResult = '';

		echo json_encode(
			SSP::complex ( $_POST, $sql_details, $table, $primaryKey, $columns, $whereResult, $whereAll)
		);
     }

     // create question
     public function CreateQuestion()
     {
          date_default_timezone_set('Africa/Kampala');
          $response = array();

          $this->form_validation->set_rules('question', 'Title', 'trim|required|xss_clean');
          
          if ($this->form_validation->run() == FALSE) 
          {
               $response['success'] = 0;
               $response['message'] = validation_errors();

               echo json_encode($response);
          } 
          else 
          {
               $question = $this->input->post('question');
               $imagelink = $this->input->post('imagelink');
               $answer = $this->input->post('answer');
               $obja = $this->input->post('choicea');
               $objb = $this->input->post('choiceb');
               $objc = $this->input->post('choicec');
               $objd = $this->input->post('choiced');
               $gen_id = md5(microtime(true).mt_Rand());
               $user_logged_in = $this->session->userdata['loggedin']['adminname'];

               $userData = array(
                    'agv_id' => $gen_id,
                    'agv_question' => $question,
                    'agv_question_image' => $imagelink,
                    'agv_answer' => $answer,
                    'agv_objective_a' => $obja,
                    'agv_objective_b' => $objb,
                    'agv_objective_c' => $objc,
                    'agv_objective_d' => $objd,
                    'agv_added' => date('Y-m-d H:i:s'),
                    'agv_added_by' => $user_logged_in,
                    'agv_status' => 'active'
               );

               $createuser = $this->UserModel->create_getinvolved($userData);
               if($createuser) 
               {
                    $response['success'] = 1;
                    $response['message'] = 'Added Successfully';

                    echo json_encode($response);
               }
               else 
               {
                    $response['success'] = 0;
                    $response['message'] = 'Sorry, unable to successfully create';

                    echo json_encode($response);
               }
          }
     }

     //Load single 
     public function LoadGetinvloved()
     {
          $response = array();

          $this->form_validation->set_rules('qid', 'Question', 'trim|required|xss_clean');
          
          if ($this->form_validation->run() == FALSE) 
          {
               $response['success'] = 0;
               $response['message'] = 'Missing Parameter(s)';
               
               echo json_encode($response);
          } 
          else 
          {
               $aid = $this->input->post('qid');
               $question = $this->UserModel->get_question($aid);

               $response['id']    = $question->agv_id;
               $response['question']  = $question->agv_question;
               $response['question_image'] = $question->agv_question_image;
               $response['answer'] = $question->agv_answer;
               $response['choicea'] = $question->agv_objective_a;
               $response['choiceb'] = $question->agv_objective_b;
               $response['choicec'] = $question->agv_objective_c;
               $response['choiced'] = $question->agv_objective_d;
               
               $response['success'] = 1;
               $response['message'] = 'Success';
               echo json_encode($response);
          }
     }
     
     // update question
     public function EditQuestion()
     {
          date_default_timezone_set('Africa/Kampala');
          $response = array();

          $this->form_validation->set_rules('question', 'Question', 'trim|required|xss_clean');
          
          if ($this->form_validation->run() == FALSE) 
          {
               $response['success'] = 0;
               $response['message'] = validation_errors();

               echo json_encode($response);
          } 
          else 
          {
               $qid = $this->input->post('qid');
               $question = $this->input->post('question');
               $imagelink = $this->input->post('imagelink');
               $answer = $this->input->post('answer');
               $obja = $this->input->post('choicea');
               $objb = $this->input->post('choiceb');
               $objc = $this->input->post('choicec');
               $objd = $this->input->post('choiced');

               $user_logged_in = $this->session->userdata['loggedin']['adminname'];
               $condition = array(
                    'agv_id' => $this->input->post('qid')
               );
               $userData = array(
                    'agv_question' => $question,
                    'agv_question_image' => $imagelink,
                    'agv_answer' => $answer,
                    'agv_objective_a' => $obja,
                    'agv_objective_b' => $objb,
                    'agv_objective_c' => $objc,
                    'agv_objective_d' => $objd,
                    'agv_updated' => date('Y-m-d H:i:s'),
                    'agv_updated_by' => $user_logged_in
               );

               $createuser = $this->UserModel->update_getinvolved($condition, $userData);
               if($createuser) 
               {
                    $response['success'] = 1;
                    $response['message'] = 'Added Successfully';

                    echo json_encode($response);
               }
               else 
               {
                    $response['success'] = 0;
                    $response['message'] = 'Sorry, unable to successfully create';

                    echo json_encode($response);
               }
          }
     }

     public function ActivateQuestion()
     {
          date_default_timezone_set('Africa/Kampala');
          $response = array();
          $this->form_validation->set_rules('qid', 'Question', 'trim|required');
          
          if ($this->form_validation->run() == FALSE) 
          {
               $response['success'] = 0;
               $response['message'] = validation_errors();

               echo json_encode($response);
          } 
          else 
          {
               $bid = $this->input->post('qid');
               $user_logged_in = $this->session->userdata['loggedin']['adminname'];
               $condition = array(
                    'agv_id' => $bid
               );

               $user_data = array(
                    'agv_status' => 'active',
                    'agv_added' => date('Y-m-d H:i:s'),
                    'agv_updated_by' => $user_logged_in
               );

               $activate = $this->UserModel->update_getinvolved($condition, $user_data);
               if($activate) {
                    $response['success'] = 1;
                    $response['message'] = 'Activated Successfully';

                    echo json_encode($response);
               } else {
                    $response['success'] = 0;
                    $response['message'] = 'Sorry, unable to activate';

                    echo json_encode($response);
               }
          }
          
     }
     
     public function DeleteQuestion()
     {
          date_default_timezone_set('Africa/Kampala');
          $response = array();
          $this->form_validation->set_rules('qid', 'Question', 'trim|required');
          
          if ($this->form_validation->run() == FALSE) 
          {
               $response['success'] = 0;
               $response['message'] = validation_errors();

               echo json_encode($response);
          } 
          else 
          {
               $bid = $this->input->post('qid');
               $user_logged_in = $this->session->userdata['loggedin']['adminname'];
               $condition = array(
                    'agv_id' => $bid
               );

               $user_data = array(
                    'agv_status' => 'deleted',
                    'agv_added' => date('Y-m-d H:i:s'),
                    'agv_updated_by' => $user_logged_in
               );

               $activate = $this->UserModel->update_getinvolved($condition, $user_data);
               if($activate) {
                    $response['success'] = 1;
                    $response['message'] = 'Successfully Deleted Book';

                    echo json_encode($response);
               } else {
                    $response['success'] = 0;
                    $response['message'] = 'Sorry, unable to delete Book';

                    echo json_encode($response);
               }
          }
          
     }
     
     public function DisableQuestion()
     {
          date_default_timezone_set('Africa/Kampala');
          $response = array();
          $this->form_validation->set_rules('qid', 'Question', 'trim|required');
          
          if ($this->form_validation->run() == FALSE) 
          {
               $response['success'] = 0;
               $response['message'] = validation_errors();

               echo json_encode($response);
          } 
          else 
          {
               $bid = $this->input->post('qid');
               $user_logged_in = $this->session->userdata['loggedin']['adminname'];
               $condition = array(
                    'agv_id' => $bid
               );

               $user_data = array(
                    'agv_status' => 'disabled',
                    'agv_added' => date('Y-m-d H:i:s'),
                    'agv_updated_by' => $user_logged_in
               );

               $activate = $this->UserModel->update_getinvolved($condition, $user_data);
               if($activate) {
                    $response['success'] = 1;
                    $response['message'] = 'Diabled successfully';

                    echo json_encode($response);
               } else {
                    $response['success'] = 0;
                    $response['message'] = 'Sorry, unable to disable';

                    echo json_encode($response);
               }
          }  
     }
}

?>