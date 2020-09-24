<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Post extends CI_Controller
{

	public function index()
	{
		$data['title'] = 'All Posts';
		$data['posts'] = $this->PostModel->get_post_admin();

		$this->load->view('admin/includes/header', $data);
		$this->load->view('admin/includes/menu', $data);
		$this->load->view('admin/all-posts', $data);
	}

	/**
	 * Create Post
	 */

	public function CreatePost()
	{
		$data['title'] = 'Add Post';

		$this->form_validation->set_rules('post_title', 'Post Title', 'required');
		$this->form_validation->set_rules('post_image_caption', 'Image Caption', 'required');
		$this->form_validation->set_rules('post_content', 'Content', 'required');
		$this->form_validation->set_rules('post_excert', 'Excert', 'required');
		$this->form_validation->set_rules('post_category', 'Post Categories', 'required');

		if ($this->form_validation->run() === FALSE) {
			$this->session->set_flashdata("error", validation_errors());

			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/create-post', $data);
		} else {
			$set      = "abcdefghijklmnopqrstuvwxyz1234567890";
			$dataid   = substr(str_shuffle($set), 0, 25);
			$noSet    = "0123456789";
			$randomNo = substr(str_shuffle($noSet), 0, 3);
			$title    = $this->input->post('post_title');
			$slug     = "14221" . $randomNo . "-" . str_replace(" ", "-", preg_replace("/[^A-Za-z0-9 ]/", '', strtolower($title)));
		
			$post_data 		= array(
				'p_id' 	     => $dataid,
				'p_title' 	=> $this->input->post('post_title'),
				'p_slug' 	     => $slug,
				'p_excert'     => $this->input->post('post_excert'),
				'p_img' 		=> $this->input->post('post_image'),
				'p_img_caption'=> $this->input->post('post_image_caption'),
				'p_categories' => $this->input->post('post_category'),
				'p_added'	     => date('Y-m-d h:i:s'),
				'p_added_by' 	=> $this->session->userdata['loggedin']['adminname'],
				'p_updated'	     => date('Y-m-d h:i:s'),
				'p_updated_by' 	=> $this->session->userdata['loggedin']['adminname'],
				'p_status' 	=> 'draft'
			);

			$create = $this->PostModel->create_post($post_data);
			if ($create) {
				$pmid   = substr(str_shuffle($set), 0, 25);

				$postmeta_data = array(
					'pm_id' => $pmid,
					'pm_post' => $dataid,
					'pm_content' => $this->input->post('post_content')
				);
				$this->db->insert('tbl_postmeta', $postmeta_data);
				$this->session->set_flashdata("success", 'Successfully Created Post');
				// redirect('a-posts');
				echo '<script> document.location = "'.site_url('a-posts').'"; </script>';
			} else {
				$this->session->set_flashdata("error", 'Unable to Create Post');

				$this->load->view('root/lib/header', $data);
				$this->load->view('root/lib/menu', $data);
				$this->load->view('root/post/create-post', $data);
			}
		}
	}

	public function EditPost($post)
	{
		$data['title']      = 'Edit Post';
		$data['post']       = $this->PostModel->get_post_admin($post);
		$data['postmeta']   = $this->PostModel->get_postmeta($post);

		$this->form_validation->set_rules('post_title', 'Post Title', 'required');
		$this->form_validation->set_rules('post_image_caption', 'Image Caption', 'required');
		$this->form_validation->set_rules('post_content', 'Content', 'required');
		$this->form_validation->set_rules('post_excert', 'Excert', 'required');

		if ($this->form_validation->run() === FALSE) {
			$this->session->set_flashdata("error", validation_errors());

			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/edit-post', $data);
		} else {
			$noSet    = "0123456789";
			$randomNo = substr(str_shuffle($noSet), 0, 3);
			$title    = $this->input->post('post_title');
			$slug     = "14221" . $randomNo . "-" . str_replace(" ", "-", preg_replace("/[^A-Za-z0-9 ]/", '', strtolower($title)));

			$post_data 		= array(
				'p_title' 	=> $this->input->post('post_title'),
				'p_slug' 	     => $slug,
				'p_excert'     => $this->input->post('post_excert'),
				'p_author' 	=> $this->input->post('post_author'),
				'p_img' 		=> $this->input->post('post_image'),
				'p_img_caption' 	=> $this->input->post('post_image_caption'),
				'p_categories' => $this->input->post('post_category'),
				'p_tags'       => $this->input->post('post_tags'),
				'p_updated'	=> date('Y-m-d h:i:s'),
				'p_updated_by' => $this->session->userdata['loggedin']['adminname']
			);

			$create = $this->PostModel->edit_post($post_data, $post);
			if ($create) {
				$this->db->where('pm_post', $post);
				$postmeta_data = array(
					'pm_content' => $this->input->post('post_content')
				);
				$this->db->update('tbl_postmeta', $postmeta_data);
				$this->session->set_flashdata("success", 'Successfully Updated Post');
				// redirect('a-posts');
				echo '<script> document.location = "'.site_url('a-posts').'"; </script>';
			} else {
				$this->session->set_flashdata("error", 'Unable to Update Post');

				$this->load->view('admin/includes/header', $data);
				$this->load->view('admin/includes/menu', $data);
				$this->load->view('post/edit-post', $data);
			}
		}
	}

	/**
	 * Delete Post
	 */
	public function DeletePost()
	{
		$response = array();

		if ($this->input->post('delete_id') == NULL) {
			$response['success'] = 0;
			$response['message'] = 'Post does not exist';

			echo json_encode($response);
		} else {
			$ad_id 	= $this->input->post('delete_id');
			$deletePost = $this->PostModel->delete_post($ad_id);
			if ($deletePost) {
				$response['success'] 	= 1;
				$response['message'] 	= 'Successfully Deleted Post';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to Delete Post';

				echo json_encode($response);
			}
		}
	}

	/**
	 * Publish Post
	 */
	public function PublishPost()
	{
		$response = array();

		if ($this->input->post('post_id') == NULL) {
			$response['success'] = 0;
			$response['message'] = 'Post does not exist';

			echo json_encode($response);
		} else {
			$ad_id 	= $this->input->post('post_id');
			$publishPost = $this->PostModel->publish_post($ad_id);
			if ($publishPost) {
				$response['success'] 	= 1;
				$response['message'] 	= 'Successfully Published Post';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to Publish Post';

				echo json_encode($response);
			}
		}
	}

	/**
	 * Disable Post
	 */
	public function DisablePost()
	{
		$response = array();

		if ($this->input->post('post_id') == NULL) {
			$response['success'] = 0;
			$response['message'] = 'Post does not exist';

			echo json_encode($response);
		} else {
			$ad_id 	= $this->input->post('post_id');
			$disablePost = $this->PostModel->disable_post($ad_id);
			if ($disablePost) {
				$response['success'] 	= 1;
				$response['message'] 	= 'Successfully Disabled Post';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to Disable Post';

				echo json_encode($response);
			}
		}
	}
}
