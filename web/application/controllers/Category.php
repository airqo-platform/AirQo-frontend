<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Category extends CI_Controller
{

	public function index()
	{
		$data['title'] = 'All Categories';
		$data['categories'] = $this->CategoryModel->get_category_admin();

		$this->load->view('admin/includes/header', $data);
		$this->load->view('admin/includes/menu', $data);
		$this->load->view('admin/all-categories', $data);
	}

	/**
	 * Create Post
	 */

	public function CreateCategory()
	{
		$response = array();
		$this->form_validation->set_rules('category_name', 'Category Name', 'required');

		if ($this->form_validation->run() === FALSE) {

			$response['success'] = 0;
			$response['message'] = validation_errors();

			echo json_encode($response);
		} else {
			$set      = "abcdefghijklmnopqrstuvwxyz1234567890";
			$dataid   = substr(str_shuffle($set), 0, 25);
			$category_data = array(
				'c_id'         => $dataid,
				'c_name'       => $this->input->post('category_name'),
				// 'c_position'   => $this->input->post('category_position'),
				// 'c_parent'     => $this->input->post('category_parent'),
				'c_added'      => date('Y-m-d h:i:s'),
				'c_added_by'   => $this->session->userdata['loggedin']['adminname'],
				'c_updated'    => date('Y-m-d h:i:s'),
				'c_updated_by' => $this->session->userdata['loggedin']['adminname'],
				'c_status'     => 'active'
			);
			$create_category = $this->CategoryModel->create_category($category_data);
			if ($create_category) {
				$response['message'] = 'Successfully Created Category';
				$response['success'] = 1;

				echo json_encode($response);
			} else {
				$response['message'] = 'Unable to create category';
				$response['success'] = 0;

				echo json_encode($response);
			}
		}
	}

	/**
	 * Create Post
	 */

	public function EditCategory()
	{
		$response = array();
		$this->form_validation->set_rules('category_name', 'Category Name', 'required');
		$this->form_validation->set_rules('category_id', 'Category', 'required');

		if ($this->form_validation->run() === FALSE) {

			$response['success'] = 0;
			$response['message'] = validation_errors();

			echo json_encode($response);
		} else {
			$cat_id = $this->input->post('category_id');

			$category_data = array(
				'c_name'       => $this->input->post('category_name'),
				// 'c_position'   => $this->input->post('category_position'),
				// 'c_parent'     => $this->input->post('category_parent'),
				'c_updated'    => date('Y-m-d h:i:s'),
				'c_updated_by' => $this->session->userdata['loggedin']['adminname']
			);
			$create_category = $this->CategoryModel->edit_category($category_data, $cat_id);
			if ($create_category) {
				$response['message'] = 'Successfully Update Category';
				$response['success'] = 1;

				echo json_encode($response);
			} else {
				$response['message'] = 'Unable to update category';
				$response['success'] = 0;

				echo json_encode($response);
			}
		}
	}

	public function SingleCategory()
	{
		$response = array();

		if ($this->input->post('cat_id') == NULL) {
			$response['success'] = 0;
			$response['message'] = 'Category does not exist';

			echo json_encode($response);
		} else {
			$ad_id 	= $this->input->post('cat_id');
			$category = $this->CategoryModel->get_category($ad_id);
			if ($category) {
				$response['category_id']       = $category['c_id'];
				$response['category_name']     = $category['c_name'];
				

				$response['success'] 	= 1;
				$response['message'] 	= 'Successfully';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to view Category';

				echo json_encode($response);
			}
		}
	}


	/**
	 * Delete Category
	 */
	public function DeleteCategory()
	{
		$response = array();

		if ($this->input->post('cat_id') == NULL) {
			$response['success'] = 0;
			$response['message'] = 'Category does not exist';

			echo json_encode($response);
		} else {
			$ad_id 	= $this->input->post('cat_id');
			$deletePost = $this->CategoryModel->delete_category($ad_id);
			if ($deletePost) {
				$response['success'] 	= 1;
				$response['message'] 	= 'Successfully Deleted Category';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to Delete Category';

				echo json_encode($response);
			}
		}
	}

	/**
	 * Disable Category
	 */
	public function DisableCategory()
	{
		$response = array();

		if ($this->input->post('cat_id') == NULL) {
			$response['success'] = 0;
			$response['message'] = 'Category does not exist';

			echo json_encode($response);
		} else {
			$ad_id 	= $this->input->post('cat_id');
			$deletePost = $this->CategoryModel->disable_category($ad_id);
			if ($deletePost) {
				$response['success'] 	= 1;
				$response['message'] 	= 'Successfully Disable Category';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to Disable Category';

				echo json_encode($response);
			}
		}
	}

	/**
	 * Activate Category
	 */
	public function ActivateCategory()
	{
		$response = array();

		if ($this->input->post('cat_id') == NULL) {
			$response['success'] = 0;
			$response['message'] = 'Category does not exist';

			echo json_encode($response);
		} else {
			$ad_id 	= $this->input->post('cat_id');
			$deletePost = $this->CategoryModel->activate_category($ad_id);
			if ($deletePost) {
				$response['success'] 	= 1;
				$response['message'] 	= 'Successfully Activate Category';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to Activate Category';

				echo json_encode($response);
			}
		}
	}
}
