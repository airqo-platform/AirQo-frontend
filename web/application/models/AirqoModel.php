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
			$query = $this->db->query("SELECT * FROM tbl_team WHERE team_status = '1' ORDER BY team_order ASC");
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

	public function nodestate($reading)
	{
		$response = array();
		$node_color 	= '';
		$node_caption 	= '';
		if($reading >= 0 && $reading <= 12) {
			//GOOD
			$node_color 	= 'rgb(35,155,86)';
			$node_caption 	= 'Good';
		} else if($reading >= 12.1 && $reading <= 35.4){
			//Moderate
			$node_color 	= 'rgb(249,220,9)';
			$node_caption 	= 'Moderate';
		} else if($reading >= 35.6 && $reading <= 55.4){
			//Gentle Breeze
			$node_color 	= 'rgb(243,156,18)';
			$node_caption 	= 'Unhealthy';
		} else if($reading >= 55.5 && $reading <= 150.4){
			//Moderate Breeze
			$node_color 	= 'rgb(243,22,55)';
			$node_caption 	= 'Unhealthy';
		} else if($reading >= 150.5 && $reading <= 250.4){
			//Fresh Breeze
			$node_color 	= 'rgb(124,71,181)';
			$node_caption 	= 'Very Unhealthy';
		} else if($reading >= 250.5 && $reading <= 500.4){
			//Strong Breeze
			$node_color 	= 'rgb(147,11,21)';
			$node_caption 	= 'Hazardous';
		}
		$response['node_color'] 	 = $node_color;
		$response['node_caption'] = $node_caption;
		
		return $response;
	}
}
