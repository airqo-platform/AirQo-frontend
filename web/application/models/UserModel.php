<?php 
class UserModel extends CI_Model
{
     function __construct()
	{
		$this->load->database();
     }
     
     //get user details
     public function get_user($uid = null)
     {
          if($uid == null) {
               $query = $this->db->query("SELECT * FROM tbl_users");
               return $query->result_array();
          }
          $query = $this->db->query("SELECT * FROM tbl_users WHERE au_id = '$uid'");
          return $query->row_array();
     }

     //update aqi data
     public function update_aqicamera($where, $object)
     {
          $this->db->where($where);
          return $this->db->update('tbl_aqi_camera', $object);
     }

     //get question
     public function get_question($id) {

		$this->db->from('tbl_get_involved');
		$this->db->where('agv_id', $id);
		return $this->db->get()->row();
     }

     //add to get involved table
     public function create_getinvolved($object)
     {
          return  $this->db->insert('tbl_get_involved', $object);
     }

     //update get involved table
     public function update_getinvolved($where, $object)
     {
          $this->db->where($where);
          return $this->db->update('tbl_get_involved', $object);
     }
}

?>