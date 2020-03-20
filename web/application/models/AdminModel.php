<?php
defined('BASEPATH') or exit('No direct script access allowed');

class AdminModel extends CI_Model
{

	function __construct()
	{
		$this->load->database();
	}
	
	public function get_total()
	{
		$query = $this->db->query('SELECT COUNT(*) AS total FROM tbl_subscribers');
		return $query->row_array();
	}
	public function get_user_messages()
	{
		$query = $this->db->query('SELECT * FROM tbl_subscribers');
		return $query->result_array();
	}

	// this function is for creating an account for the app
	public function create_account($data)
	{
		return $this->db->insert('admins', $data);
	}

	// Verifying whether the password and phone number are correct
	public function verify_user_details($email, $password)
	{
		// $this->db->select('*');
		// $this->db->from('admins');
		// $this->db->where('admin_username', $email);
		// $this->db->where('admin_status', '1');
		// $this->db->where('admin_password', sha1($password));
		// $this->db->limit(1);
		// $query = $this->db->get();

		// // Query and return the result row
		// if ($query->num_rows() > 0) {
		// 	return $query->row();
		// } else {
		// 	return NULL;
		// }

		$this->db->select('*');
		$this->db->from('admins');
		$this->db->where('admin_username', $email);
		$this->db->where('admin_status', '1');
		$this->db->where('admin_password', $password);
		// $this->db->where('u_status', '1');
		$this->db->limit(1);
		$query = $this->db->get();

		if ($query->num_rows() > 0) {
			return $query->row();
		} else {
			return NULL;
		}
	}

	public function update_user_details($email, $password)
	{
		$this->db->select('admin_id,admin_name, admin_username,admin_image, admin_email,admin_role, admin_password');
		$this->db->from('admins');
		$this->db->where('admin_email', $email);
		$this->db->where('admin_status', '1');
		$this->db->where('admin_password', sha1($password));
		$this->db->limit(1);

		$query = $this->db->get();

		// Query and return the result row
		if ($query->num_rows() > 0) {
			return $query->row();
		} else {
			return NULL;
		}
	}
	public function update_administrator_status($data, $id)
	{
		$this->db->where('admin_id', $id);
		return $this->db->update('admins', $data);
	}
	public function add_admins($data)
	{
		$this->db->insert('admins', $data);
	}
	public function list_administrators()
	{
		$this->db->order_by('admin_id', 'DESC');
		$query  = $this->db->get("admins");
		return $query->result_array();
	}

	public function delete_admin($id)
	{
		$this->db->where('admin_id', $id);
		$this->db->delete('admins');
		return true;
	}

	// update account
	public function update_account($update_data, $id)
	{
		$this->db->where('admin_id', $id);
		return $this->db->update('admins', $update_data);
	}
	public function get_old_password($id)
	{
		$query = $this->db->query("SELECT admin_password FROM admins WHERE admin_id = '$id' LIMIT 1");
		return $query->row_array();
	}

	// about information starts here, information picked from the tbl_pages

	public function add_about_information($data)
	{
		return $this->db->insert('tbl_pages', $data);
	}

	public function get_about_information($pg_id = null)
	{
		if ($pg_id == null) {
			$this->db->order_by('pg_id', 'DESC');
			$query  = $this->db->get('tbl_pages');
			return $query->result_array();
		}
		$query  = $this->db->query("SELECT * FROM tbl_pages WHERE pg_id = '$pg_id' ");
		return $query->result_array();
	}

	public function get_about($about_id)
	{
		$query = $this->db->query("SELECT * FROM tbl_pages WHERE pg_id = '$about_id'");
		return $query->row_array();
	}

	public function update_about($data, $id)
	{
		$this->db->where('pg_id', $id);
		return $this->db->update('tbl_pages', $data);
	}
	public function delete_about_information($about_id)
	{
		$this->db->where('pg_id', $about_id);
		if ($this->db->delete('tbl_pages')) {
			return '1';
		} else {
			return '0';
		}
	}

	// starts projects
	public function add_project($data)
	{
		return $this->db->insert('tbl_projects', $data);
	}

	public function list_projects($p_id = null)
	{
		if ($p_id == null) {
			$this->db->order_by('p_id', 'DESC');
			$query  = $this->db->get('tbl_projects');
			return $query->result_array();
		}
		$query  = $this->db->query("SELECT * FROM tbl_projects WHERE p_id = '$p_id' ");
		return $query->result_array();
	}
	public function update_project($data, $id)
	{
		$this->db->where('p_id', $id);
		return $this->db->update('tbl_projects', $data);
	}
	public function delete_project($p_id)
	{
		$this->db->where('p_id', $p_id);
		if ($this->db->delete('tbl_projects')) {
			return '1';
		} else {
			return '0';
		}
	}
	public function get_project($project_id)
	{
		$query = $this->db->query("SELECT * FROM tbl_projects WHERE p_id = '$project_id'");
		return $query->row_array();
	}

	// contact information starts here
	public function add_contact_information($data)
	{
		return $this->db->insert('tbl_contact', $data);
	}
	public function get_contact_information()
	{
		$query  = $this->db->query("SELECT * FROM tbl_contact");
		return $query->result_array();
	}
	public function get_contact($contact_id)
	{
		$query = $this->db->query("SELECT * FROM tbl_contact WHERE con_id = '$contact_id'");
		return $query->row_array();
	}

	public function update_contact($data, $id)
	{
		$this->db->where('con_id', $id);
		return $this->db->update('tbl_contact', $data);
	}
	public function delete_contact_information($contact_id)
	{
		$this->db->where('con_id', $contact_id);
		if ($this->db->delete('tbl_contact')) {
			return '1';
		} else {
			return '0';
		}
	}

	// partners starts here------------------------------------------------------------
	public function add_news($data)
	{
		return $this->db->insert('tbl_news', $data);
	}

	public function list_news($news_id = null)
	{
		if ($news_id == null) {
			$this->db->order_by('news_id', 'DESC');
			$query  = $this->db->get('tbl_news');
			return $query->result_array();
		}
		$query  = $this->db->query("SELECT * FROM tbl_news WHERE news_id = '$news_id' ");
		return $query->result_array();
	}
	public function update_news($data, $id)
	{
		$this->db->where('news_id', $id);
		return $this->db->update('tbl_news', $data);
	}
	public function delete_news($news_id)
	{
		$this->db->where('news_id', $news_id);
		if ($this->db->delete('tbl_news')) {
			return '1';
		} else {
			return '0';
		}
	}
	public function get_news($news_id)
	{
		$query = $this->db->query("SELECT * FROM tbl_news WHERE news_id = '$news_id'");
		return $query->row_array();
	}
	// starts team
	public function add_member($data)
	{
		return $this->db->insert('tbl_team', $data);
	}

	public function list_team_members($team_id = null)
	{
		if ($team_id == null) {
			$this->db->where('team_status', '1');
			$this->db->order_by('team_id', 'DESC');
			$query  = $this->db->get('tbl_team');
			return $query->result_array();
		}
		$query  = $this->db->query("SELECT * FROM tbl_team WHERE team_id = '$team_id' ");
		return $query->result_array();
	}
	public function update_team($data, $id)
	{
		$this->db->where('team_id', $id);
		return $this->db->update('tbl_team', $data);
	}
	public function delete_team_member($team_id)
	{
		$this->db->where('team_id', $team_id);
		if ($this->db->delete('tbl_team')) {
			return '1';
		} else {
			return '0';
		}
	}
	public function get_member($member_id)
	{
		$query = $this->db->query("SELECT * FROM tbl_team WHERE team_id = '$member_id'");
		return $query->row_array();
	}
	public function get_site_stats()
	{
		$this->db->order_by('ss_id', 'DESC');
		$query  = $this->db->get("tbl_sitestats");
		return $query->result_array();
	}
	public function get_logins()
	{
		$query  = $this->db->query("SELECT * FROM tbl_logins");
		return $query->result_array();
	}
	/*nodes section starts here --------------------------------*/
	public function check_channel_id()
	{
		$query = null;
		$id    = $this->input->post('an_channel_id');
		$query = $this->db->get_where(
			'tbl_app_nodes',
			array(
				'an_channel_id' => $id
			)
		);

		$count = $query->num_rows();

		if ($count === 0) {
			// $data = array(
			//     'an_channel_id' => $id
			// );
			return true;
		}
		return false;
	}
	public function create_app_node($data)
	{
		return $this->db->insert('tbl_app_nodes', $data);
	}

	public function list_nodes($an_id = null)
	{
		if ($an_id == null) {
			$this->db->where('an_deleted !=', '1');
			$this->db->order_by('an_id', 'DESC');
			$query  = $this->db->get(' tbl_app_nodes');
			return $query->result_array();
		}
		$query  = $this->db->query("SELECT * FROM tbl_app_nodes WHERE an_id = '$an_id' ");
		return $query->result_array();
	}

	public function update_nodes($data, $an_id)
	{
		$this->db->where('an_id', $an_id);
		return $this->db->update('tbl_app_nodes', $data);
	}

	public function get_app_nodes($an_id)
	{
		$query = $this->db->query("SELECT * FROM tbl_app_nodes WHERE an_id = '$an_id'");
		return $query->row_array();
	}

	public function delete_app_node($an_id)
	{
		//$this->db->where('an_id', $an_id);
		//if ($this->db->update('tbl_app_nodes', array('an_deleted' => '1'))) {
		//	return '1';
		//} else {
		//	return '0';
		//}

		if ($this->db->delete('tbl_app_nodes', array('an_id' => $an_id))) {
			return '1';
		} else {
			return '0';
		}
	}
	public function get_faqs_total()
	{
		$query = $this->db->query('SELECT COUNT(*) AS total FROM tbl_faqs');
		return $query->row_array();
	}
	public function get_user_faqs()
	{
		$query = $this->db->query('SELECT * FROM tbl_faqs');
		return $query->result_array();
	}

	public function getUserInfoByEmail($email)
	{
		$q = $this->db->get_where('admins', array('admin_email' => $email), 1);
		if ($this->db->affected_rows() > 0) {
			$row = $q->row();
			return $row;
		} else {
			error_log('no user found getUserInfo(' . $email . ')');
			return false;
		}
	}

	public function insertToken($user_id)
	{
		date_default_timezone_set('Africa/Kampala');
		$token = substr(sha1(rand()), 0, 30);
		$date = date('Y-m-d');

		$string = array(
			'token'   => $token,
			'user_id' => $user_id,
			'created' => $date
		);
		$query = $this->db->insert_string('tbl_tokens', $string);
		$this->db->query($query);
		return $token . $user_id;
	}

	public function isTokenValid($token)
	{
		$tkn = substr($token, 0, 30);
		$uid = substr($token, 30);

		$q = $this->db->get_where('tbl_tokens', array(
			'tbl_tokens.token' => $tkn,
			'tbl_tokens.user_id' => $uid
		), 1);

		if ($this->db->affected_rows() > 0) {
			$row = $q->row();

			$created = $row->created;
			$createdTS = strtotime($created);
			$today = date('Y-m-d');
			$todayTS = strtotime($today);

			if ($createdTS != $todayTS) {
				return false;
			}

			$user_info = $this->getUserInfo($row->user_id);
			return $user_info;
		} else {
			return false;
		}
	}

	public function updatePassword($post)
	{
		$this->db->where('admin_id', $post['user_id']);
		$this->db->update('admins', array('admin_password' => $post['password']));
		$success = $this->db->affected_rows();

		if (!$success) {
			error_log('Unable to updatePassword(' . $post['user_id'] . ')');
			return false;
		}
		return true;
	}

	public function getUserInfo($id)
	{
		$q = $this->db->get_where('admins', array('admin_id' => $id), 1);
		if ($this->db->affected_rows() > 0) {
			$row = $q->row();
			return $row;
		} else {
			error_log('no user found getUserInfo(' . $id . ')');
			return false;
		}
	}
}
