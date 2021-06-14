<?php
class CategoryModel extends CI_Model
{
     function __construct()
     {
          parent::__construct();
		$this->load->database();
     }

     /**
      * Get category
      */
     public function get_category($id = null)
     {
          if($id == NULL){
			$query = $this->db->query("SELECT * FROM tbl_categories WHERE c_status = 'active' ORDER BY c_position ASC");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT * FROM tbl_categories WHERE c_id = '$id'");
		return $query->row_array();
     }

     public function get_category_admin($id = null)
     {
          if($id == NULL){
      $query = $this->db->query("SELECT * FROM tbl_categories WHERE c_status != 'deleted'");
      return $query->result_array();
     }

     $query = $this->db->query("SELECT * FROM tbl_categories WHERE c_id = '$id'");
     return $query->row_array();
     }
     /**
      * Create category
      */
     public function create_category($data)
     {
          return $this->db->insert('tbl_categories', $data);
     }

     /**
      * Edit category
      */
     public function edit_category($data, $id)
     {
          $this->db->where('c_id', $id);
		return $this->db->update('tbl_categories', $data);
     }

     /**
      * Delete category
      */
     public function delete_category($id)
     {
          $this->db->where('c_id', $id);
		return $this->db->update('tbl_categories', array('c_status' => 'deleted'));
     }

     /**
      * Activate category
      */
     public function activate_category($id)
     {
          $this->db->where('c_id', $id);
		return $this->db->update('tbl_categories', array('c_status' => 'active'));
     }

     /**
      * Disable category
      */
     public function disable_category($id)
     {
          $this->db->where('c_id', $id);
		return $this->db->update('tbl_categories', array('c_status' => 'disabled'));
     }
}
?>
