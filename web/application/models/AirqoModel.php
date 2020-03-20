<?php
defined('BASEPATH') or exit('No direct script access allowed');

class AirqoModel extends CI_Model
{
	function construct()
	{
		$this->load->database();
	}
	// Log page visits
	public function add_page_visits($data = NULL)
	{
		if ($data != NULL) {
			return $this->db->insert('tbl_sitestats', $data);
		}
	}
	public function get_app_nodes($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_app_nodes WHERE an_active='1' AND an_deleted = '0'");
			return $query->result_array();
		}
		$query = $this->db->query("SELECT * FROM tbl_app_nodes WHERE an_channel_id = '$id'");
		return $query->row_array();
	}
	public function get_contact_details($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_contact");
			return $query->result_array();
		}
		$query = $this->db->query("SELECT * FROM tbl_contact WHERE con_id = '$id'");
		return $query->row_array();
	}
	public function get_project_details($slug = null)
	{
		if ($slug == null) {
			$query = $this->db->query("SELECT * FROM tbl_projects ORDER BY p_slug DESC");
			return $query->result_array();
		} else {
			$query = $this->db->query("SELECT * FROM tbl_projects WHERE p_slug = '$slug'");
			return $query->row_array();
		}
	}
	// homepage first two
	public function get_project_first($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_projects  ORDER BY p_id DESC LIMIT 1");
			return $query->result_array();
		}
		$query = $this->db->query("SELECT * FROM tbl_projects WHERE p_id = '$id'");
		return $query->row_array();
	}
	public function get_project_next4($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_projects ORDER BY p_id DESC LIMIT 4 OFFSET 1");
			return $query->result_array();
		}
		$query = $this->db->query("SELECT * FROM tbl_projects WHERE p_id = '$id'");
		return $query->row_array();
	}
	// team
	public function get_team_details($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_team WHERE team_status = '1' ORDER BY team_position ASC");
			return $query->result_array();
		}
		$query = $this->db->query("SELECT * FROM tbl_team WHERE team_id = '$id'");
		return $query->row_array();
	}
	// team

	// news
	public function get_news_details($slug = null)
	{
		if ($slug == null) {
			$query = $this->db->query("SELECT * FROM tbl_news ORDER BY news_id DESC");
			return $query->result_array();
		} else {
			$query = $this->db->query("SELECT * FROM tbl_news WHERE news_slug = '$slug'");
			return $query->row_array();
		}
	}
	// news
	// faqs
	public function get_faqs($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_faqs ORDER BY faq_id DESC");
			return $query->result_array();
		}
		$query = $this->db->query("SELECT * FROM tbl_faqs WHERE faq_id = '$id'");
		return $query->row_array();
	}
	// faqs
	// about
	public function get_about_details()
	{
		$query = $this->db->query("SELECT * FROM tbl_pages WHERE pg_title = 'About'");
		return $query->row_array();
	}
	// work with us
	public function get_partnerships()
	{
		$query = $this->db->query("SELECT * FROM tbl_pages WHERE pg_title = 'Partnerships'");
		return $query->row_array();
	}

	public function get_launch()
	{
		$query = $this->db->query("SELECT * FROM tbl_pages WHERE pg_title = 'Launch'");
		return $query->row_array();
	}


	// what we do
	public function get_about()
	{
		$query = $this->db->query("SELECT * FROM tbl_pages WHERE pg_title = 'About'");
		return $query->row_array();
	}

	// background
	public function get_background()
	{
		$query = $this->db->query("SELECT * FROM tbl_pages WHERE pg_title = 'Background'");
		return $query->row_array();
	}

	// vacancies
	public function get_careers()
	{
		$query = $this->db->query("SELECT * FROM tbl_pages WHERE pg_title = 'Careers'");
		return $query->row_array();
	}

	// how it works
	public function get_app_node_details($id)
	{
		$query = $this->db->query("SELECT * FROM tbl_app_nodes WHERE an_channel_id = '$id'");
		return $query->row_array();
	}
	public function get_HowItWorks_details()
	{
		$query = $this->db->query("SELECT * FROM tbl_pages WHERE pg_title = 'How_it_works'");
		return $query->row_array();
	}

	public function add_user_data($data)
	{

		return $this->db->insert('tbl_subscribers', $data);
	}

	public function nodestate($reading, $time)
	{
		$response = array();
		$node_color 	= '';
		$node_caption 	= '';
		$node_icon 	= '';
		$node_range 	= '';
		$node_description = '';
		if($reading >= 0 && $reading <= 12) {
			//GOOD
			$node_color 	= ($this->numberOfDays($time) > 2) ? '#808080' : '#00e400';
			$node_caption 	= 'Good';
			$node_icon 	= 'face_good.png';
			$node_range 	= '0 - 12';
			$node_description = 'Air quality is good for everyone';
		} else if($reading >= 12.1 && $reading <= 35.4){
			//Moderate
			$node_color 	= ($this->numberOfDays($time) > 2) ? '#808080' : '#ffff00';
			$node_caption 	= 'Moderate';
			$node_icon 	= 'face_moderate.png';
			$node_range 	= '12.1 - 35.4';
			$node_description = '<b>Unusually sensitive people:</b> Consider reducing prolonged or heavy exertion. <br/>
							<b>Everyone else:</b> Air pollution poses little or no risk';
		} else if($reading >= 35.6 && $reading <= 55.4){
			//Gentle Breeze
			$node_color 	= ($this->numberOfDays($time) > 2) ? '#808080' : '#ff7e00';
			$node_caption 	= 'Unhealthy For Sensitive Groups';
			$node_icon 	= 'face_unhealthy.png';
			$node_range 	= '35.6 - 55.4';
			$node_description = '<b>Sensitive Groups:</b> Reduce prolonged or heavy exertion. It\'s Ok to be active outside, but take more breaks and do less intense activities<br>
							<b>People with asthma:</b> Should follow their asthma action plans and keep relief medicine handy.<br/>
							<b>If you have heart disease:</b> Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider.';
		} else if($reading >= 55.5 && $reading <= 150.4){
			//Moderate Breeze
			$node_color 	= ($this->numberOfDays($time) > 2) ? '#808080' : '#ff0000';
			$node_caption 	= 'Unhealthy';
			$node_icon 	= 'face_unhealthy1.png';
			$node_range 	= '55.5 - 150.4';
			$node_description = '<b>Sensitive groups: </b> Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling.<br>
							<b>Everyone else: </b> Reduce prolonged or heavy exertion. Take more breaks during all outdoor activities.';
		} else if($reading >= 150.5 && $reading <= 250.4){
			//Fresh Breeze
			$node_color 	= ($this->numberOfDays($time) > 2) ? '#808080' : '#8f3f97';
			$node_caption 	= 'Very Unhealthy';
			$node_icon 	= 'face_vunhealthy.png';
			$node_range 	= '150.5 - 250.4';
			$node_description = '<b>Sensitive group: </b> Avoid all physical activity outdoors. Move activities indoors or reschedule to a time when air quality is better.<br>
							<b>Everyone else: </b> Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling to a time when the air quality is better.';
		} else if($reading >= 250.5 && $reading <= 500.4){
			//Strong Breeze
			$node_color 	= ($this->numberOfDays($time) > 2) ? '#808080' : '#7e0023';
			$node_caption 	= 'Hazardous';
			$node_icon 	= 'face_hazardous.png';
			$node_range 	= '250.5 - 500.4';
			$node_description = '<b>Everyone: </b> Avoid all physical activity outdoors.<br>
							<b>Sensitive groups: </b> Remain indoors and keep activity levels low. Follow tips for keeping particle levels low indoors.';
		}
		$response['node_color'] 	 = $node_color;
		$response['node_caption'] = $node_caption;
		$response['node_icon'] 	 = $node_icon;
		$response['node_range'] 	 = $node_range;
		$response['node_description'] = $node_description;
		
		return $response;
	}

	public function numberOfDays($date)
	{
		date_default_timezone_set('Africa/Kampala');
		$current_date = date('Y-m-d H:i:s');

		return round(strtotime($current_date) - strtotime($date)) / 86400;
	}
}
