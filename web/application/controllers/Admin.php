<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Admin Class controller 
 * 
 */
class Admin extends CI_Controller
{
	/**
	 * Load the login page
	 */
	public function index()
	{
		$data['title'] = "Admin Login";
		$this->form_validation->set_rules('username', 'username', 'trim|required|xss_clean');
		$this->form_validation->set_rules('password', 'password', 'trim|required|xss_clean');

		if ($this->form_validation->run() == FALSE) {
			$this->session->set_flashdata("error", validation_errors());
			$this->load->view("admin/index", $data);
		} else {
			//login submit
			$username = $this->input->post("username");
			$password = $this->input->post("password");
			$password = sha1($password);

			$result = $this->AdminModel->verify_user_details($username, $password);
			if ($result != null) {
				$sess_array = array(
					'adminid'          => trim($result->admin_id),
					'adminrole'        => trim($result->admin_role),
					'adminemail'       => trim($result->admin_email),
					'adminname'        => trim($result->admin_name),
					'adminimage'       => trim($result->admin_image),
					'adminphoneNumber' => trim($result->admin_phoneNumber),
					'adminusername'    => trim($result->admin_username),
					'loggedIn'          => 1
				);
				$this->session->set_userdata('loggedin', $sess_array);

				// redirect('a-dashboard');
				header('Location: a-dashboard');
			} else {
				$this->session->set_flashdata("error", "unable to login please contact administrator");
				$this->load->view("admin/index", $data);
			}
		}
	}

	public function LoginSubmit()
	{
		$response = array();
		$this->form_validation->set_rules('username', 'username', 'trim|required|xss_clean');
		$this->form_validation->set_rules('password', 'password', 'trim|required|xss_clean');

		if ($this->form_validation->run() == FALSE) {
			$response['success'] = 0;
			$response['message'] = validation_errors();

			echo json_encode($response);
		} else {
			//login submit
			$username = $this->input->post("username");
			$password = $this->input->post("password");
			$password = sha1($password);

			$result = $this->AdminModel->verify_user_details($username, $password);
			if ($result != null) {
				$sess_array = array(
					'adminid'          => trim($result->admin_id),
					'adminrole'        => trim($result->admin_role),
					'adminemail'       => trim($result->admin_email),
					'adminname'        => trim($result->admin_name),
					'adminimage'       => trim($result->admin_image),
					'adminphoneNumber' => trim($result->admin_phoneNumber),
					'adminusername'    => trim($result->admin_username),
					'loggedIn'          => 1
				);
				$this->session->set_userdata('loggedin', $sess_array);

				$response['success'] = 1;
				$response['message'] = "Login success";

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = "unable to login please contact administrator";

				echo json_encode($response);
			}
		}
	}


	/**
	 * Update user session
	 */
	public function updateSession()
	{
		$email      = $this->session->userdata['loggedin']['adminemail'];
		$password   = "";
		$result  = $this->AdminModel->update_user_details($email, $password);

		if ($result) {
			$sess_array = array(
				'adminid'          => $result->admin_id,
				'adminrole'        => $result->admin_role,
				'adminemail'       => $result->admin_email,
				'adminname'        => $result->admin_name,
				'adminimage'       => $result->admin_image,
				'adminpassword'    => $result->admin_password,
				'adminphoneNumber' => $result->admin_phoneNumber,
				'adminusername'    => $result->admin_username
			);
			$this->session->set_userdata('loggedin', $sess_array);
			return true;
		} else {
			$this->session->set_flashdata("error", "Something went wrong try logging out and then in again");
			return false;
		}
	}

	/**
	 * Register administrator
	 */
	public function registerAdministrator()
	{
		$response = array();

		$this->form_validation->set_rules('admin_name', 'Fullname', 'trim|required');
		$this->form_validation->set_rules('admin_phoneNumber', 'Phone number', 'trim|required|numeric|is_unique[admins.admin_phoneNumber]');

		if ($this->form_validation->run() === false) {
			$this->session->set_flashdata("error", "please Enter all fields");
		} else {
			$status = '1';
			$data = array(
				'admin_name'          =>  ucwords($this->input->post('admin_name')),
				'admin_username'      =>  $this->input->post('admin_username'),
				'admin_password'      =>  sha1($this->input->post('admin_password')),
				'admin_email'         =>  $this->input->post('admin_email'),
				'admin_phoneNumber'   =>  $this->input->post('admin_phoneNumber'),
				'admin_image'         =>  $this->input->post('admin_image'),
				'admin_role'          =>  $this->input->post('admin_role'),
				'admin_image'         =>  $this->input->post('imagelink'),
				'admin_status'        =>  $status
			);

			$send = $this->AdminModel->create_account($data);
			if ($send) {
				$response['success'] = 1;
				$response['message'] = 'Successfully created admin';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to create admin';

				echo json_encode($response);
			}
		}
	}

	public function updateAdministratorStatus()
	{
		$id = $this->uri->segment(3);
		$status                 =   '0';
		$data                  =   array(
			'admin_status'      =>  $status
		);
		$this->AdminModel->update_administrator_status($data, $id);
		// redirect('a-administrators');
		echo '<script> document.location = "' . site_url('a-administrators') . '"; </script>';
	}

	public function updateActiveStatus()
	{
		$id = $this->uri->segment(3);
		$status                 =   '1';
		$data                  =   array(
			'admin_status'      =>  $status
		);
		$this->AdminModel->update_administrator_status($data, $id);
		// redirect('a-administrators');
		echo '<script> document.location = "' . site_url('a-administrators') . '"; </script>';
	}
	/*subscribers --------------------------*/
	public function subscribers()
	{
		$data['navigation'] = 'sub';
		$data['data']       = 'total';
		$data['title']      = 'Subscribers';
		$data['user']       = $this->session->userdata['loggedin']['adminname'];
		$data['total']      = $this->AdminModel->get_total();
		$this->load->view('admin/includes/header', $data);
		$this->load->view('admin/includes/menu', $data);
		$this->load->view('admin/subscribers', $data);
	}

	/*faqs section ----------------------------------------------*/
	public function faqs()
	{
		$data['navigation'] = 'faqs';
		$data['data']       = 'total';
		$data['title']      = 'FAQS';
		$data['user']       = $this->session->userdata['loggedin']['adminname'];
		$data['total']      = $this->AdminModel->get_faqs_total();
		$this->load->view('admin/includes/header', $data);
		$this->load->view('admin/includes/menu', $data);
		$this->load->view('admin/faqs', $data);
	}


	// about information starts here ----------------------------------------------------
	public function about()
	{
		$data['navigation'] = 'about';
		$data['data']       = 'aboutInfo';
		$data['title']      = 'About Us';
		$data['user']       = $this->session->userdata['loggedin']['adminname'];
		$data['aboutInfo']  = $this->AdminModel->get_about_information();
		$this->load->view('admin/includes/header', $data);
		$this->load->view('admin/includes/menu', $data);
		$this->load->view('admin/about', $data);
	}

	public function aboutDetails($pg_id)
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'about';
			$data['data']       = 'aboutInfo';
			$data['title']      = 'Details';
			$data['user']       = $this->session->userdata['loggedin']['adminname'];
			$data['aboutDetails']  = $this->AdminModel->get_about_information($pg_id);
			$data['paged'] = $this->AdminModel->get_about($pg_id);
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/about-details', $data);
		} else {
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}


	public function addAboutInformation()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('pg_title', 'Title', 'required|trim');
			if ($this->form_validation->run() === false) {
				$data['navigation'] = 'about';
				$data['aboutInfo']  = $this->AdminModel->get_about_information();
				$data['title']      = 'About Information';
				$data['user']       = $this->session->userdata['loggedin']['adminname'];

				$this->load->view('admin/includes/header', $data);
				$this->load->view('admin/includes/menu', $data);
				$this->load->view('admin/about', $data);
			} else {
				$admin                     =   $this->session->userdata['loggedin']['adminname'];
				$status                    =   '1';
				$data                     =    array(
					'pg_title'              =>   ucwords($this->input->post('pg_title')),
					'pg_excerts'            =>   ucfirst($this->input->post('pg_excerts')),
					'pg_content'            =>   ucfirst($this->input->post('pg_content')),
					'pg_dateCreated'        =>   date('Y-m-d h:i:s'),
					'pg_addedBy'            =>   $admin,
					'pg_status'             =>   $status
				);

				$send = $this->AdminModel->add_about_information($data);
				if ($send) {
					$this->session->set_flashdata("msg", "Information saved succesfully.!");
					// redirect('Admin/about');
					echo '<script> document.location = "' . site_url('admin/about') . '"; </script>';
				} else {
					$this->session->set_flashdata("error", "Oops! something went wrong,Please Contact the sytem Developer.!");
					// redirect('Admin/about');
					echo '<script> document.location = "' . site_url('admin/about') . '"; </script>';
				}
			}
		} else {
			redirect('Admin/index');
		}
	}

	public function deleteAboutInformation()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$about_id   = $this->input->post('pg_id');
			$about      = $this->AdminModel->delete_about_information($about_id);
			echo $about;
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}
	public function editAboutDetails()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'about';
			$response = array();

			if ($this->input->post('pg_id') == null) {
				$response['success'] = 0;
				$response['message'] = 'about info does not exist';

				echo json_encode($response);
			} else {
				$about_id        = $this->input->post('pg_id');
				$about           = $this->AdminModel->get_about($about_id);

				$response['success']       = 1;
				$response['message']       = '';

				$response['id']            = $about['pg_id'];
				$response['pg_excerts']    = $about['pg_excerts'];
				$response['c_title']       = $about['pg_title'];
				$response['c_content']     = $about['pg_content'];
				echo json_encode($response);
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	// edit about info thru the modal in about.php
	public function editAbout()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('pg_title', 'Title', 'required|trim');
			if ($this->form_validation->run() === false) {
				$data['title'] = 'About Info';
				$data['navigation'] = 'about';
				$data['aboutInfo'] = $this->AdminModel->get_about_information();
				$this->load->view('admin/includes/header', $data);
				$this->load->view('admin/includes/menu', $data);
				$this->load->view('admin/about', $data);
			} else {
				$admin                       =   $this->session->userdata['loggedin']['adminname'];
				$status                      =   '1';
				$data                     =    array(
					'pg_title'              =>   ucwords($this->input->post('pg_title')),
					'pg_excerts'            =>   ucfirst($this->input->post('pg_excerts')),
					'pg_content'            =>   ucfirst($this->input->post('pg_content')),
					'pg_dateUpdated'        =>   date('Y-m-d h:i:s'),
					'pg_updatedBy'          =>   $admin,
					'pg_status'             =>   $status
				);
				$id   = $this->input->post('pg_id');
				$send = $this->AdminModel->update_about($data, $id);

				if ($send) {
					$this->session->set_flashdata("msg", "Information has been updated Succesfully.!!");
					// redirect('Admin/about');
					echo '<script> document.location = "' . site_url('admin/about') . '"; </script>';
				} else {
					$this->session->set_flashdata("error", "Oops! updating failed, Please Contact the sytem Developer.!");
					// redirect('Admin/about');
					echo '<script> document.location = "' . site_url('admin/about') . '"; </script>';
				}
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}


	// PROJECT SECTION STARTS HERE
	public function projects()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'projects';
			$data['title'] = 'projects';
			$data['projects'] = $this->AdminModel->list_projects();
			$data['user'] = $this->session->userdata['loggedin']['adminname'];

			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/projects', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function addProject()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('p_title', 'Project title', 'trim|required');

			if ($this->form_validation->run() === false) {
				$this->session->set_flashdata('error', validation_errors());
				// redirect('Admin/projects');
				echo '<script> document.location = "' . site_url('admin/projects') . '"; </script>';
			} else {
				$added_by = $this->session->userdata['loggedin']['adminname'];
				$uploaded_image = $_FILES['p_image']['tmp_name'];
				$image_name   = '';
				if ($uploaded_image != null) {
					$targ_w     = intval($this->input->post('dataWidth1'));
					$targ_h     = intval($this->input->post('dataHeight1'));
					$jpeg_quality   = 90;
					$src      = $uploaded_image;
					$imgtype        = $_FILES['p_image']['type'];
					if ($imgtype == 'image/jpeg') {
						$img_r         = imagecreatefromjpeg($src);
					} elseif ($imgtype == 'image/png') {
						$img_r         = imagecreatefrompng($src);
					} elseif ($imgtype == 'image/gif') {
						$img_r         = imagecreatefromgif($src);
					}
					$dst_r      = ImageCreateTrueColor($targ_w, $targ_h);
					imagecopyresampled($dst_r, $img_r, 0, 0, intval($this->input->post('dataX1')), intval($this->input->post('dataY1')), $targ_w, $targ_h, intval($this->input->post('dataWidth1')), intval($this->input->post('dataHeight1')));
					header('Content-type: image/jpeg');
					$image_name = "projects_" . date('YmdHis') . rand(0000, 9999) . ".jpg";
					imagejpeg($dst_r, './assets/images/projects/' . $image_name, $jpeg_quality);
				} else {
					$image_name = '';
				}
				$status                      = '1';
				$added_by                    =  $this->session->userdata['loggedin']['adminname'];
				// the slug usage
				$slug                        = url_title(ucwords($this->input->post('p_title')), 'dash', true);

				$data                        =  array(
					'p_title'                    => ucwords($this->input->post('p_title')),
					'p_excerts'                  => ucfirst($this->input->post('p_excerts')),
					'p_content'                  => ucfirst($this->input->post('p_content')),
					'p_author'                                => ucfirst($this->input->post('p_author')),
					'p_addedBy'                           => $added_by,
					'p_status'                      => $status,
					'p_image'                         => $image_name,
					'p_date'                     => date('Y-m-d h:i:s'),
					'p_slug'                     => $slug
				);
				$send = $this->AdminModel->add_project($data);

				if ($send) {
					$this->session->set_flashdata("msg", "You have succesfully created a new project.!");
					// redirect('Admin/projects');
					echo '<script> document.location = "' . site_url('admin/projects') . '"; </script>';
				} else {
					$this->session->set_flashdata("error", "Oops! something went wrong,Please Contact sytem Developer.!");
					// redirect('Admin/projects');
					echo '<script> document.location = "' . site_url('admin/projects') . '"; </script>';
				}
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}


	public function projectDetails($p_id)
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['title'] = 'Project Details';
			$data['navigation'] = 'projects';
			$data['user'] = $this->session->userdata['loggedin']['adminname'];

			$data['projectDetails'] = $this->AdminModel->list_projects($p_id);
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/project-details', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function editProjectDetails()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$response = array();
			if ($this->input->post('p_id') == null) {
				$response['success'] = 0;
				$response['message'] = 'project does not exist';
				echo json_encode($response);
			} else {
				$project_id    = $this->input->post('p_id');
				$project       = $this->AdminModel->get_project($project_id);

				$response['success']          = 1;
				$response['message']          = '';

				$response['id']               = $project['p_id'];
				$response['p_name']           = $project['p_title'];
				$response['p_excerts']        = $project['p_excerts'];
				$response['pjct_content']     = $project['p_content'];
				$response['pjct_image']       = $project['p_image'];
				echo json_encode($response);
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	// edit project  thru the modal in projects.php
	public function editProject()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('p_title', 'Project title', 'required|trim');
			if ($this->form_validation->run() === false) {
				$this->session->set_flashdata('error', validation_errors());
				// redirect('Admin/projects');
				echo '<script> document.location = "' . site_url('admin/projects') . '"; </script>';
			} else {
				$added_by = $this->session->userdata['loggedin']['adminname'];
				$uploaded_image = $_FILES['p_image']['tmp_name'];
				$image_name   = '';
				if ($uploaded_image != null) {
					$targ_w     = intval($this->input->post('dataWidth'));
					$targ_h     = intval($this->input->post('dataHeight'));
					$jpeg_quality   = 90;
					$src      = $uploaded_image;
					$imgtype        = $_FILES['p_image']['type'];
					if ($imgtype == 'image/jpeg') {
						$img_r         = imagecreatefromjpeg($src);
					} elseif ($imgtype == 'image/png') {
						$img_r         = imagecreatefrompng($src);
					} elseif ($imgtype == 'image/gif') {
						$img_r         = imagecreatefromgif($src);
					}
					$dst_r      = ImageCreateTrueColor($targ_w, $targ_h);
					imagecopyresampled($dst_r, $img_r, 0, 0, intval($this->input->post('dataX')), intval($this->input->post('dataY')), $targ_w, $targ_h, intval($this->input->post('dataWidth')), intval($this->input->post('dataHeight')));
					header('Content-type: image/jpeg');
					$image_name = "projects_" . date('YmdHis') . rand(0000, 9999) . ".jpg";
					imagejpeg($dst_r, './assets/images/projects/' . $image_name, $jpeg_quality);

					$status = '1';
					$updated_by = $this->session->userdata['loggedin']['adminname'];
					$data                        = array(
						'p_title'                    => ucwords($this->input->post('p_title')),
						'p_excerts'                  => ucfirst($this->input->post('p_excerts')),
						'p_content'                  => ucfirst($this->input->post('p_content')),
						'p_author'                   => ucfirst($this->input->post('p_author')),
						'p_updatedBy'                => $updated_by,
						'p_status'                   => $status,
						'p_image'                    => $image_name,
						'p_updateDate'               => date('Y-m-d h:i:s')

					);
					$id   = $this->input->post('p_id');
					$send = $this->AdminModel->update_project($data, $id);

					if ($send) {
						$this->session->set_flashdata("msg", "A Project has been updated Succesfully.!!");
						// redirect('Admin/projects');
						echo '<script> document.location = "' . site_url('admin/projects') . '"; </script>';
					} else {
						$this->session->set_flashdata("error", "Oops! something went wrong,Please Contact sytem Developer.!");
						// redirect('Admin/projects');
						echo '<script> document.location = "' . site_url('admin/projects') . '"; </script>';
					}
				} else {
					$targ_w     = intval($this->input->post('dataWidth'));
					$targ_h     = intval($this->input->post('dataHeight'));
					$jpeg_quality   = 90;
					$src      = $uploaded_image;
					$imgtype        = $_FILES['p_image']['type'];
					if ($imgtype == 'image/jpeg') {
						$img_r         = imagecreatefromjpeg($src);
					} elseif ($imgtype == 'image/png') {
						$img_r         = imagecreatefrompng($src);
					} elseif ($imgtype == 'image/gif') {
						$img_r         = imagecreatefromgif($src);
					}
					$dst_r      = ImageCreateTrueColor($targ_w, $targ_h);
					imagecopyresampled($dst_r, $img_r, 0, 0, intval($this->input->post('dataX')), intval($this->input->post('dataY')), $targ_w, $targ_h, intval($this->input->post('dataWidth')), intval($this->input->post('dataHeight')));
					header('Content-type: image/jpeg');
					$image_name = "projects_" . date('YmdHis') . rand(0000, 9999) . ".jpg";
					imagejpeg($dst_r, './assets/images/projects/' . $image_name, $jpeg_quality);


					$status = '1';
					$updated_by = $this->session->userdata['loggedin']['adminname'];
					$data                        = array(
						'p_title'                    => ucwords($this->input->post('p_title')),
						'p_excerts'                  => ucfirst($this->input->post('p_excerts')),
						'p_content'                  => ucfirst($this->input->post('p_content')),
						'p_author'                   => ucfirst($this->input->post('p_author')),
						'p_updatedBy'                => $updated_by,
						'p_status'                   => $status,
						'p_updateDate'               => date('Y-m-d h:i:s')

					);
					$id   = $this->input->post('p_id');
					$send = $this->AdminModel->update_project($data, $id);

					if ($send) {
						$this->session->set_flashdata("msg", "A Project has been updated Succesfully.!!");
						// redirect('Admin/projects');
						echo '<script> document.location = "' . site_url('admin/projects') . '"; </script>';
					} else {
						$this->session->set_flashdata("error", "Oops! something went wrong,Please Contact sytem Developer.!");
						// redirect('Admin/projects');
						echo '<script> document.location = "' . site_url('admin/projects') . '"; </script>';
					}
				}
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function deleteProject()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$p_id         = $this->input->post('p_id');
			$project      = $this->AdminModel->delete_project($p_id);
			echo $project;
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}
	// project section ends here

	// contact information starts
	public function contactInformation()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'contacts';
			$data['data'] = 'contactInfo';
			$data['title'] = 'Contacts';
			$data['user'] = $this->session->userdata['loggedin']['adminname'];
			$data['contactInfo'] = $this->AdminModel->get_contact_information();
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/contact-information', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function addContactInformation()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('con_address', 'company address', 'required|trim');
			$this->form_validation->set_rules('con_phoneline', 'phone Number', 'trim|required|numeric|is_unique[tbl_contact .con_phoneline]');

			if ($this->form_validation->run() === false) {
				$data['navigation'] = 'contacts';
				$data['contactInfo'] = $this->AdminModel->get_contact_information();
				$data['title'] = 'Contact Information';
				$data['user'] = $this->session->userdata['loggedin']['adminname'];

				$this->load->view('admin/includes/header', $data);
				$this->load->view('admin/includes/menu', $data);
				$this->load->view('admin/contact-information', $data);
			} else {
				$admin                     = $this->session->userdata['loggedin']['adminname'];
				$data                     =  array(
					'con_address'           => ucwords($this->input->post('con_address')),
					'con_info'              => ucfirst($this->input->post('con_info')),
					'con_date'              => date('Y-m-d h:i:s'),
					'con_addedBy'           => $admin,
					'con_phoneline'         => $this->input->post('con_phoneline'),
					'con_email'                    => $this->input->post('con_email')
				);

				if (!filter_var('con_email', FILTER_VALIDATE_EMAIL)) {
					$send = $this->AdminModel->add_contact_information($data);
					if ($send) {
						$this->session->set_flashdata("msg", "Information saved succesfully.!");
						// redirect('Admin/contactInformation');
						echo '<script> document.location = "' . site_url('admin/contactInformation') . '"; </script>';
					} else {
						$this->session->set_flashdata("error", "Oops! something went wrong,Please Contact sytem Developer.!");
						// redirect('Admin/contactInformation');
						echo '<script> document.location = "' . site_url('admin/contactInformation') . '"; </script>';
					}
				} else {
					echo "<script>alert('Invalid email , Please provide a valid email')</script>";
					echo "<script>window.open('contactInformation', '_self')</script>";
				}
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function deleteContactInformation()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$contact_id   = $this->input->post('con_id');
			$contact      = $this->AdminModel->delete_contact_information($contact_id);
			echo $contact;
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}
	public function editContactDetails()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'contacts';
			$response = array();

			if ($this->input->post('con_id') == null) {
				$response['success'] = 0;
				$response['message'] = 'contact info does not exist';

				echo json_encode($response);
			} else {
				$contact_id      = $this->input->post('con_id');
				$contact         = $this->AdminModel->get_contact($contact_id);

				$response['success']       = 1;
				$response['message']       = '';

				$response['id']            = $contact['con_id'];
				$response['c_phone']       = $contact['con_phoneline'];
				$response['c_address']     = $contact['con_address'];
				$response['c_email']       = $contact['con_email'];
				$response['c_infor']       = $contact['con_info'];
				echo json_encode($response);
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	// editcontacts thru the modal in contact-information.php
	public function editContact()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('con_address', 'Adrress', 'required|trim');
			if ($this->form_validation->run() === false) {
				$data['title'] = 'Contact Info';
				$data['navigation'] = 'contacts';
				$data['contactInfo'] = $this->AdminModel->get_contact_information();
				$this->load->view('admin/includes/header', $data);
				$this->load->view('admin/includes/menu', $data);
				$this->load->view('admin/contact-information', $data);
			} else {
				$admin                      = $this->session->userdata['loggedin']['adminname'];
				$data                     =  array(
					'con_address'           => ucwords($this->input->post('con_address')),
					'con_info'              => ucfirst($this->input->post('con_info')),
					'con_updateDate'        => date('Y-m-d h:i:s'),
					'con_updatedBy'         => $admin,
					'con_phoneline'         => $this->input->post('con_phoneline'),
					'con_email'             => $this->input->post('con_email')
				);
				$id   = $this->input->post('con_id');
				$send = $this->AdminModel->update_contact($data, $id);

				if ($send) {
					$this->session->set_flashdata("msg", "A contact has been updated Succesfully.!!");
					// redirect('Admin/contactInformation');
					echo '<script> document.location = "' . site_url('admin/contactInformation') . '"; </script>';
				} else {
					$this->session->set_flashdata("error", "Oops! updating failed, Please Contact sytem Developer.!");
					// redirect('Admin/contactInformation');
					echo '<script> document.location = "' . site_url('admin/contactInformation') . '"; </script>';
				}
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}
	// contact information ends here

	public function dashboard()
	{
		$data['navigation'] = 'dashboard';
		$data['title'] = 'Dashboard';
		$data['user'] = $this->session->userdata['loggedin']['adminname'];
		$this->load->view('admin/includes/header', $data);
		$this->load->view('admin/includes/menu', $data);
		$this->load->view('admin/dashboard', $data);
	}
	// news starts here-----------------------------------------------------------------------------------------

	public function news()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'news';
			$data['title']      = 'News Publications';
			$data['news']       = $this->AdminModel->list_news();
			$data['user']       = $this->session->userdata['loggedin']['adminname'];

			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/news', $data);
		} else {
			// redirect('/');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}
	public function newsDetails($news_id)
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation']        = 'news ';
			$data['title']             = 'News Details';
			$data['newsDetails']       = $this->AdminModel->list_news($news_id);
			$data['user']              = $this->session->userdata['loggedin']['adminname'];

			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/news-details', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function addnews()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('news_title', 'Title', 'trim|required');
			if ($this->form_validation->run() === false) {
				$this->session->set_flashdata('error', validation_errors());
				// redirect('Admin/news');
				echo '<script> document.location = "' . site_url('admin/news') . '"; </script>';
			} else {
				$added_by = $this->session->userdata['loggedin']['adminname'];
				$uploaded_image = $_FILES['news_image']['tmp_name'];
				$image_name   = '';
				if ($uploaded_image != null) {
					$targ_w     = intval($this->input->post('dataWidth1'));
					$targ_h     = intval($this->input->post('dataHeight1'));
					$jpeg_quality   = 90;
					$src      = $uploaded_image;
					$imgtype        = $_FILES['news_image']['type'];
					if ($imgtype == 'image/jpeg') {
						$img_r         = imagecreatefromjpeg($src);
					} elseif ($imgtype == 'image/png') {
						$img_r         = imagecreatefrompng($src);
					} elseif ($imgtype == 'image/gif') {
						$img_r         = imagecreatefromgif($src);
					}
					$dst_r      = ImageCreateTrueColor($targ_w, $targ_h);
					imagecopyresampled($dst_r, $img_r, 0, 0, intval($this->input->post('dataX1')), intval($this->input->post('dataY1')), $targ_w, $targ_h, intval($this->input->post('dataWidth1')), intval($this->input->post('dataHeight1')));
					header('Content-type: image/jpeg');
					$image_name = "news_" . date('YmdHis') . rand(0000, 9999) . ".jpg";
					imagejpeg($dst_r, './assets/images/news/' . $image_name, $jpeg_quality);
				} else {
					$image_name = '';
				}
				$pg_status                   = '1';
				// the slug usage
				$slug                        = url_title(ucwords($this->input->post('news_title')), '-', true);

				$data                        = array(
					'news_title'               => ucwords($this->input->post('news_title')),
					'news_excerts'             => ucfirst($this->input->post('news_excerts')),
					'news_content'             => ucfirst($this->input->post('news_content')),
					'news_status'                => $pg_status,
					'news_image'               => $image_name,
					'news_addedBy'             => $added_by,
					'news_slug'                => $slug,
					'news_date'                => date('Y-m-d h:i:s'),
					'news_dateAdded'             => date('Y-m-d h:i:s')
				);
				$send = $this->AdminModel->add_news($data);

				if ($send) {
					$this->session->set_flashdata("msg", "A news Article has been published succesfully.!!");
					// redirect('Admin/news');
					echo '<script> document.location = "' . site_url('admin/news') . '"; </script>';
				} else {
					$this->session->set_flashdata("error", "Oops! something went wrong,Please Contact sytem Developer.!");
					// redirect('Admin/news');
					echo '<script> document.location = "' . site_url('admin/news') . '"; </script>';
				}
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function editNewsDetails()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$response = array();
			if ($this->input->post('news_id') == null) {
				$response['success'] = 0;
				$response['message'] = 'News Article does not exist';
				echo json_encode($response);
			} else {
				$news_id    = $this->input->post('news_id');
				$news       = $this->AdminModel->get_news($news_id);

				$response['success']       = 1;
				$response['message']       = '';

				$response['id']              = $news['news_id'];
				$response['nws_title']       = $news['news_title'];
				$response['news_excerts']    = $news['news_excerts'];
				$response['nws_content']     = $news['news_content'];
				$response['nws_image']       = $news['news_image'];
				echo json_encode($response);
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	// edit news thru the modal in news.php
	public function editNews()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('news_title', 'News Title', 'required|trim');
			if ($this->form_validation->run() === false) {
				$this->session->set_flashdata('error', validation_errors());
				// redirect('Admin/news');
				echo '<script> document.location = "' . site_url('admin/news') . '"; </script>';
			} else {
				$updated_by = $this->session->userdata['loggedin']['adminname'];
				$uploaded_image = $_FILES['news_image']['tmp_name'];
				$image_name   = '';
				if ($uploaded_image != null) {
					$targ_w     = intval($this->input->post('dataWidth'));
					$targ_h     = intval($this->input->post('dataHeight'));
					$jpeg_quality   = 90;
					$src      = $uploaded_image;
					$imgtype        = $_FILES['news_image']['type'];
					if ($imgtype == 'image/jpeg') {
						$img_r         = imagecreatefromjpeg($src);
					} elseif ($imgtype == 'image/png') {
						$img_r         = imagecreatefrompng($src);
					} elseif ($imgtype == 'image/gif') {
						$img_r         = imagecreatefromgif($src);
					}
					$dst_r      = ImageCreateTrueColor($targ_w, $targ_h);
					imagecopyresampled($dst_r, $img_r, 0, 0, intval($this->input->post('dataX')), intval($this->input->post('dataY')), $targ_w, $targ_h, intval($this->input->post('dataWidth')), intval($this->input->post('dataHeight')));
					header('Content-type: image/jpeg');
					$image_name = "news_" . date('YmdHis') . rand(0000, 9999) . ".jpg";
					imagejpeg($dst_r, './assets/images/news/' . $image_name, $jpeg_quality);

					$status = '1';
					$data                        = array(
						'news_title'               => ucwords($this->input->post('news_title')),
						'news_excerts'             => ucfirst($this->input->post('news_excerts')),
						'news_content'             => ucfirst($this->input->post('news_content')),
						'news_status'              => $status,
						'news_image'               => $image_name,
						'news_updatedBy'           => $updated_by,
						'news_dateUpdated'         => date('Y-m-d h:i:s')
					);
					$id   = $this->input->post('news_id');
					$send = $this->AdminModel->update_news($data, $id);

					if ($send) {
						$this->session->set_flashdata("msg", "A News Article has been Updated Succesfully.!!");
						// redirect('Admin/news');
						echo '<script> document.location = "' . site_url('admin/news') . '"; </script>';
					} else {
						$this->session->set_flashdata("error", "Oops! something went wrong,Please Contact sytem Developer.!");
						// redirect('Admin/news');
						echo '<script> document.location = "' . site_url('admin/news') . '"; </script>';
					}
				} else {
					$targ_w     = intval($this->input->post('dataWidth'));
					$targ_h     = intval($this->input->post('dataHeight'));
					$jpeg_quality   = 90;
					$src      = $uploaded_image;
					$imgtype        = $_FILES['news_image']['type'];
					if ($imgtype == 'image/jpeg') {
						$img_r         = imagecreatefromjpeg($src);
					} elseif ($imgtype == 'image/png') {
						$img_r         = imagecreatefrompng($src);
					} elseif ($imgtype == 'image/gif') {
						$img_r         = imagecreatefromgif($src);
					}
					$dst_r      = ImageCreateTrueColor($targ_w, $targ_h);
					imagecopyresampled($dst_r, $img_r, 0, 0, intval($this->input->post('dataX')), intval($this->input->post('dataY')), $targ_w, $targ_h, intval($this->input->post('dataWidth')), intval($this->input->post('dataHeight')));
					header('Content-type: image/jpeg');
					$image_name = "news_" . date('YmdHis') . rand(0000, 9999) . ".jpg";
					imagejpeg($dst_r, './assets/images/news/' . $image_name, $jpeg_quality);


					$status                       = '1';
					$updated_by                   = $this->session->userdata['loggedin']['adminname'];
					$data                        = array(
						'news_title'               => ucwords($this->input->post('news_title')),
						'news_excerts'             => ucfirst($this->input->post('news_excerts')),
						'news_content'             => ucfirst($this->input->post('news_content')),
						'news_status'              => $status,
						/*  'news_image'               => $image_name,*/
						'news_updatedBy'           => $updated_by,
						'news_dateUpdated'         => date('Y-m-d h:i:s')
					);

					$id   = $this->input->post('news_id');
					$send = $this->AdminModel->update_news($data, $id);

					if ($send) {
						$this->session->set_flashdata("msg", "A News Article has been updated Succesfully.!!");
						// redirect('Admin/news');
						echo '<script> document.location = "' . site_url('admin/news') . '"; </script>';
					} else {
						$this->session->set_flashdata("error", "Oops! something went wrong,Please Contact sytem Developer.!");
						// redirect('Admin/news');
						echo '<script> document.location = "' . site_url('admin/news') . '"; </script>';
					}
				}
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function deleteNews()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$news_id      = $this->input->post('news_id');
			$news         = $this->AdminModel->delete_news($news_id);
			echo $news;
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}
	// news ends here -----------------------------------------------------------------------

	// TEAM SECTION STARTS HERE
	public function team()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'team';
			$data['title'] = 'Team Members';
			$data['team_members'] = $this->AdminModel->list_team_members();
			$data['user'] = $this->session->userdata['loggedin']['adminname'];

			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/team', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function addMember()
	{
		$response = array();
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('team_title', 'Title', 'trim|required');
			$this->form_validation->set_rules('team_name', 'Fullname', 'trim|required');

			if ($this->form_validation->run() === false) {
				$response['success'] = 0;
				$response['message'] = validation_errors();

				echo json_encode($response);
			} else {


				$status = '1';
				$added_by = $this->session->userdata['loggedin']['adminname'];
				$data                          = array(
					'team_position'             => $this->input->post('team_position'),
					'team_title'                => ucwords($this->input->post('team_title')),
					'team_name'                 => ucwords($this->input->post('team_name')),
					'team_phoneline'            => $this->input->post('team_phoneline'),
					'team_otherAddress'         => $this->input->post('team_otherAddress'),
					'team_facebook'             => $this->input->post('team_facebook'),
					'team_twitter'              => $this->input->post('team_twitter'),
					'team_emailAddress'         => $this->input->post('team_emailAddress'),
					'team_status'               => $status,
					'team_addedBy'              => $added_by,
					'team_createdDate'          => date('Y-m-d h:i:s'),
					'team_image'                => $this->input->post('imagelink')
				);
				$send = $this->AdminModel->add_member($data);

				if ($send) {
					$response['success'] = 1;
					$response['message'] = "Successfully Created Team Member";

					echo json_encode($response);
				} else {
					$response['success'] = 0;
					$response['message'] = "Unable to Create Team Member";

					echo json_encode($response);
				}
			}
		} else {
			$response['success'] = 0;
			$response['message'] = "Please login";

			echo json_encode($response);
		}
	}


	public function teamDetails($tm_id)
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['title'] = 'Team details';
			$data['navigation'] = 'team';
			$data['user'] = $this->session->userdata['loggedin']['adminname'];

			$data['memberDetails'] = $this->AdminModel->list_team_members($tm_id);
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/team-details', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function editTeamDetails()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$response = array();
			if ($this->input->post('team_id') == null) {
				$response['success'] = 0;
				$response['message'] = 'team member does not exist';
				echo json_encode($response);
			} else {
				$member_id  = $this->input->post('team_id');
				$team       = $this->AdminModel->get_member($member_id);

				$response['success']         = 1;
				$response['message']         = '';

				$response['id']              = $team['team_id'];
				$response['t_name']          = $team['team_name'];
				$response['t_contacts']      = $team['team_phoneline'];
				$response['t_otherAdress']   = $team['team_otherAddress'];
				$response['t_title']         = $team['team_title'];
				$response['t_facebook']      = $team['team_facebook'];
				$response['t_twitter']       = $team['team_twitter'];
				$response['t_email']         = $team['team_emailAddress'];
				$response['t_image']         = $team['team_image'];
				$response['t_position']      = $team['team_position'];
				echo json_encode($response);
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	// editteam thru the modal in team.php
	public function editTeam()
	{
		$response = array();
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('team_title', 'Title', 'required|trim');
			if ($this->form_validation->run() === false) {

				$response['success'] = 0;
				$response['message'] = validation_errors();

				echo json_encode($response);
			} else {
				$added_by = $this->session->userdata['loggedin']['adminname'];

				$status = '1';
				$data                          = array(
					'team_position'             => $this->input->post('team_position'),
					'team_title'                => ucwords($this->input->post('team_title')),
					'team_name'                 => ucwords($this->input->post('team_name')),
					'team_phoneline'            => $this->input->post('team_phoneline'),
					'team_otherAddress'         => $this->input->post('team_otherAddress'),
					'team_facebook'             => $this->input->post('team_facebook'),
					'team_twitter'              => $this->input->post('team_twitter'),
					'team_emailAddress'         => $this->input->post('team_emailAddress'),
					'team_status'               => $status,
					'team_updatedBy'            => $added_by,
					'team_updateDate'           => date('Y-m-d h:i:s'),
					'team_image'                => $this->input->post('imagelink')
				);
				$id   = $this->input->post('team_id');
				$send = $this->AdminModel->update_team($data, $id);

				if ($send) {
					$response['success'] = 1;
					$response['message'] = "Successfully Updated Team Member";

					echo json_encode($response);
				} else {
					$response['success'] = 0;
					$response['message'] = "Unable to Update Team Member";

					echo json_encode($response);
				}
			}
		} else {
			$response['success'] = 0;
			$response['message'] = "Please Login";

			echo json_encode($response);
		}
	}

	public function deleteTeamMember()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$team_id   = $this->input->post('team_id');
			$team      = $this->AdminModel->delete_team_member($team_id);
			echo $team;
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}
	// team section ends here

	public function siteVisitors()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'statistics';
			$data['title'] = 'Site Visitors';
			$data['user'] = $this->session->userdata['loggedin']['adminname'];
			$data['site_stats'] = $this->AdminModel->get_site_stats();
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/site-visitors', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function siteLogins()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'statistics';
			$data['title']  = 'Site Logins';
			$data['user']   = $this->session->userdata['loggedin']['adminname'];
			$data['logins'] = $this->AdminModel->get_logins();
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/site-logins', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function siteVistedPages()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['site_stats'] = $this->AdminModel->get_site_stats();
			$data['navigation'] = 'statistics';
			$data['title'] = 'Visited Pages';
			$data['user'] = $this->session->userdata['loggedin']['adminname'];

			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/site-visted-pages', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function administrators()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'admin';
			$data['title'] = 'Admins';
			$data['user'] = $this->session->userdata['loggedin']['adminname'];
			$data['administrator'] = $this->session->userdata['loggedin']['adminid'];

			$data['admin'] = $this->AdminModel->list_administrators();
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/administrators', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}
	/*start of the nodes section -------------------------------------------------------*/

	public function appNodes()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'nodes';
			$data['title'] = 'Airqo App Nodes';
			$data['user'] = $this->session->userdata['loggedin']['adminname'];
			$data['nodes'] = $this->AdminModel->list_nodes();
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/app-nodes', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function LoadNodesTable()
	{
		$table 		= 'tbl_app_nodes';
		$primaryKey 	= 'an_id';
		$whereAll	     = "an_deleted != ''";


		$columns 		= array(
			array(
				'db' => 'aac_no',
				'dt' => 0,
				'formatter' => function ($d, $row) {
					return $d;
				}
			),
			array(
				'db' => 'aac_node_id',
				'dt' => 1,
				'formatter' => function ($d, $row) {
					$node = $this->AdminModel->get_app_nodes($d);
					if ($node != null) {
						return $node['an_name'];
					}
					return '';
				}
			),
			array(
				'db' => 'aac_user_id',
				'dt' => 2,
				'formatter' => function ($d, $row) {
					$user = $this->UserModel->get_user($d);
					if ($user != null) {
						return $user['au_name'];
					}
					return '';
				}
			),

			array(
				'db' => 'aac_place_name',
				'dt' => 3,
				'formatter' => function ($d, $row) {
					return $d;
				}
			),
			array(
				'db' => 'aac_place_lng',
				'dt' => 4,
				'formatter' => function ($d, $row) {
					return $d;
				}
			),
			array(
				'db' => 'aac_place_lat',
				'dt' => 4,
				'formatter' => function ($d, $row) {
					return 'Lat: ' . $d . ' Lng: ' . $row['aac_place_lng'];
				}
			),
			array(
				'db' => 'aac_reading',
				'dt' => 5,
				'formatter' => function ($d, $row) {
					return $d;
				}
			),
			array(
				'db' => 'aac_photo',
				'dt' => 6,
				'formatter' => function ($d, $row) {
					return '<img src="' . $d . '" width="100"/>';
				}
			),
			array(
				'db' => 'acc_comment',
				'dt' => 7,
				'formatter' => function ($d, $row) {
					return date('F j, Y g:i a', strtotime($d));
				}
			),
			array(
				'db' => 'aac_status',
				'dt' => 8,
				'formatter' => function ($d, $row) {
					if ($d == 'new') {
						return '<button class="btn btn-xs btn-warning">New</button>';
					} else if ($d == 'approved') {
						return '<button class="btn btn-xs btn-success">Approved</button>';
					} else if ($d == 'declined') {
						return '<button class="btn btn-xs btn-danger">Declined</button>';
					}
				}
			),
			array(
				'db' => 'aac_id',
				'dt' => 9,
				'formatter' => function ($d, $row) {
					$action_buttons = '';
					if ($row['aac_status'] == 'new') {
						$action_buttons .= '<button class="btn btn-xs btn-block btn-success open-approve" data-id="' . $row['aac_id'] . '" data-name="this aqi camera" data-toggle="modal" data-target="#approveModal"><i class="fa fa-check"></i> Approve</button>';
						$action_buttons .= '<button class="btn btn-xs btn-block btn-danger open-decline" data-id="' . $row['aac_id'] . '" data-name="this aci camera" data-toggle="modal" data-target="#declineModal"><i class="fa fa-close"></i> Decline</button>';
					} else if ($row['aac_status'] == 'approved') {
						$action_buttons .= '<button class="btn btn-xs btn-success">Approved</button>';
					} else if ($row['aac_status'] == 'declined') {
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
			SSP::complex($_POST, $sql_details, $table, $primaryKey, $columns, $whereResult, $whereAll)
		);
	}

	public function appNodeDetails($an_id)
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation']  = 'nodes';
			$data['title']        = 'Airqo App Nodes';
			$data['user']         = $this->session->userdata['loggedin']['adminname'];
			$data['nodesDetails'] = $this->AdminModel->list_nodes($an_id);
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/app-node-details', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function deleteAppNode()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = 'nodes';
			$an_id              = $this->input->post('an_id');
			$node               = $this->AdminModel->delete_app_node($an_id);
			echo $node;
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function deactivatenode()
	{
		$response = array();

		if ($this->input->post('ap_id') == null) {
			$response['success'] = 0;
			$response['message'] = 'node does not exist';

			echo json_encode($response);
		} else {
			$a_id     = $this->input->post('ap_id');
			//Update sale status
			$update_sale         = $this->db->query("UPDATE tbl_app_nodes SET an_active = '0' WHERE an_id = '$a_id'");
			if ($update_sale) {
				$response['success']     = 1;
				$response['message']     = 'Successfully Deactivated Node';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to Deactivate Node';

				echo json_encode($response);
			}
		}
	}

	public function activatenode()
	{
		$response = array();

		if ($this->input->post('ap_id') == null) {
			$response['success'] = 0;
			$response['message'] = 'node does not exist';

			echo json_encode($response);
		} else {
			$a_id     = $this->input->post('ap_id');
			//Update sale status
			$update_sale         = $this->db->query("UPDATE tbl_app_nodes SET an_active = '1' WHERE an_id = '$a_id'");
			if ($update_sale) {
				$response['success']     = 1;
				$response['message']     = 'Successfully Activated Node';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Unable to Activate Node';

				echo json_encode($response);
			}
		}
	}


	public function createAppNode()
	{
		date_default_timezone_set('Africa/Kampala');
		$response = array();

		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('an_name', 'Node Name', 'trim|required|xss_clean');
			$this->form_validation->set_rules('an_channel_id', 'Channel ID', 'trim|required|xss_clean|is_unique[tbl_app_nodes.an_channel_id]', array('is_unique' => 'Channel ID already Exists'));

			if ($this->form_validation->run() == FALSE) {
				$response['success'] = 0;
				$response['message'] = validation_errors();

				echo json_encode($response);
			} else {
				$added_by            = $this->session->userdata['loggedin']['adminname'];
				$data                = array(
					'an_name'            => ucwords($this->input->post('an_name')),
					'time1'              => $this->input->post('time1'),
					'an_channel_id'      => $this->input->post('an_channel_id'),
					'time2'              => $this->input->post('time2'),
					'time3'              => $this->input->post('time3'),
					'an_map_address'     => $this->input->post('an_map_address'),
					'an_lat'             => $this->input->post('an_lat'),
					'an_lng'             => $this->input->post('an_lng'),
					'reading1'           => ucfirst($this->input->post('reading1')),
					'reading2'           => ucfirst($this->input->post('reading2')),
					'reading3'           => ucfirst($this->input->post('reading3')),
					'an_dateAdded'       => date('Y-m-d h:i:s'),
					'an_addedBy'         => $added_by
				);

				$create = $this->AdminModel->create_app_node($data);
				if ($create) {
					$response['success'] = 1;
					$response['message'] = 'Successfully Created Node';

					echo json_encode($response);
				} else {
					$response['success'] = 0;
					$response['message'] = 'Unable to Create Node';

					echo json_encode($response);
				}
			}
		} else {
			$response = array();
			$response['success'] = 0;
			$response['message'] = "Please login";

			echo json_encode($response);
		}
	}

	public function editAppNodesView($an_id)
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['title']        = 'Airqo App Nodes';
			$data['navigation']   = 'nodes';
			$data['appnodes']     = $this->AdminModel->get_app_nodes($an_id);
			$data['nodes']        = $this->AdminModel->list_nodes();
			$data['nodesDetails'] = $this->AdminModel->list_nodes($an_id);

			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/edit-app-nodes', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function editAppNodesDetails()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$response = array();

			if ($this->input->post('an_id') == null) {
				$response['success'] = 0;
				$response['message'] = 'Node does not exist';

				echo json_encode($response);
			} else {
				$an_id     = $this->input->post('an_id');
				$node      = $this->AdminModel->get_app_nodes($an_id);

				$response['success']       = 1;
				$response['message']       = '';

				$response['an_id']                 = $node['an_id'];
				$response['an_channel_id']         = $node['an_channel_id'];
				$response['a_name']                = $node['an_name'];
				$response['a_location']            = $node['an_map_address'];
				$response['a_reading1']            = $node['reading1'];
				$response['a_reading2']            = $node['reading2'];
				$response['a_reading3']            = $node['reading3'];
				$response['a_time1']               = $node['time1'];
				$response['a_time2']               = $node['time2'];
				$response['a_time3']               = $node['time3'];
				$response['a_lat']               	= $node['an_lat'];
				$response['a_lng']               	= $node['an_lng'];
				echo json_encode($response);
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function editAppNodes()
	{
		date_default_timezone_set('Africa/Kampala');
		$response = array();

		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$this->form_validation->set_rules('an_name', 'Node Name', 'trim|required|xss_clean');
			//$this->form_validation->set_rules('an_channel_id', 'Channel ID', 'trim|required|xss_clean|is_unique[tbl_app_nodes.an_channel_id]', array('is_unique' => 'Channel ID already Exists'));

			if ($this->form_validation->run() == FALSE) {
				$response['success'] = 0;
				$response['message'] = validation_errors();

				echo json_encode($response);
			} else {
				$added_by                = $this->session->userdata['loggedin']['adminname'];
				$data                    = array(
					'an_name'            => ucwords($this->input->post('an_name')),
					'an_channel_id'      => $this->input->post('an_channel_id'),
					'time1'              => $this->input->post('time1'),
					'time2'              => $this->input->post('time2'),
					'time3'              => $this->input->post('time3'),
					'an_map_address'     => $this->input->post('an_map_address'),
					'an_lat'             => $this->input->post('an_lat'),
					'an_lng'             => $this->input->post('an_lng'),
					'reading1'           => ucfirst($this->input->post('reading1')),
					'reading2'           => ucfirst($this->input->post('reading2')),
					'reading3'           => ucfirst($this->input->post('reading3')),
					'an_dateUpdated'     => date('Y-m-d h:i:s'),
					'an_updated_by'      => $added_by
				);

				$an_id   = $this->input->post('an_id');
				$create = $this->AdminModel->update_nodes($data, $an_id);
				if ($create) {
					$response['success'] = 1;
					$response['message'] = 'Successfully Updated Node';

					echo json_encode($response);
				} else {
					$response['success'] = 0;
					$response['message'] = 'Unable to Update Node';

					echo json_encode($response);
				}
			}
		} else {
			$response = array();
			$response['success'] = 0;
			$response['message'] = "Please login";

			echo json_encode($response);
		}
	}

	// END OF nodes EDIT

	public function editAccount()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['title'] = 'Login';
			$this->form_validation->set_rules('admin_name', 'Admin name', 'trim|required');
			$this->form_validation->set_rules('new_password', 'New Password', 'trim|min_length[3]');
			$this->form_validation->set_rules('confirm_password', 'Re-entered Password', 'trim|min_length[3]|matches[new_password]');

			if ($this->form_validation->run() === false) {
				$this->session->set_flashdata("error", " The system couldn't update your account because of the Invalid entries, please provide valid information");
				redirect('a-dashboard');
			} else {
				$id = $this->session->userdata['loggedin']['adminid'];
				$old = $this->AdminModel->get_old_password($id);
				$old_check = sha1($this->input->post('current_password'));

				if ($old['admin_password'] === $old_check) {
					$config                =  array(
						'upload_path'          => './assets/images/administrators',
						'allowed_types'        => '*',
						'max_size'             => '',
						'max_width'            => '',
						'max_height'           => '',
						'remove_spaces'        => 'true'
					);

					$img = "admin_image";
					$this->load->library('upload', $config);
					$this->upload->initialize($config);

					if (!$this->upload->do_upload($img)) {
						$file = $this->session->userdata['loggedin']['adminimage'];

						$status = '1';
						if (!$this->input->post('new_password')) {
							$prev_pass = $old['admin_password'];
							$update_data = array(
								'admin_name'        =>  ucwords($this->input->post('admin_name')),
								'admin_username'    =>  $this->input->post('admin_username'),
								'admin_password'    =>  $this->input->post('admin_password'),
								'admin_password'    =>  $prev_pass,
								'admin_email'       =>  $this->input->post('admin_email'),
								'admin_phoneNumber'   =>  $this->input->post('admin_phoneNumber'),
								'admin_image'       =>  $this->input->post('admin_image'),
								'admin_role'        =>  $this->input->post('admin_role'),
								'admin_image'       =>  $file,
								'admin_status'      =>  $status
							);
						} else {
							$update_data = array(
								'admin_name'        =>  ucwords($this->input->post('admin_name')),
								'admin_username'    =>  $this->input->post('admin_username'),
								'admin_password'    =>  $this->input->post('admin_password'),
								'admin_password'    =>  sha1($this->input->post('new_password')),
								'admin_email'       =>  $this->input->post('admin_email'),
								'admin_phoneNumber'   =>  $this->input->post('admin_phoneNumber'),
								'admin_image'       =>  $this->input->post('admin_image'),
								'admin_role'        =>  $this->input->post('admin_role'),
								'admin_image'       =>  $file,
								'admin_status'      =>  $status
							);
						}
						$id = $this->session->userdata['loggedin']['adminid'];
						$edited = $this->AdminModel->update_account($update_data, $id);
						if ($edited) {
							$this->session->set_flashdata("success", "Sucessful updated your account, you can now log in.!!");

							//   echo json_encode($response);
							// $this->session->sess_destroy();
							$this->session->unset_userdata('logged_in');
							// redirect('Admin/index');
							echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
						} else {
							$this->session->set_flashdata("error", "Oops! something went wrong, Couldn't Update Account.!");
							//   echo json_encode($response);
							// redirect('a-dashboard');
							echo '<script> document.location = "' . site_url('a-dashboard') . '"; </script>';
						}
					} else {
						$data['admin_image'] = $this->upload->data();
						$file = $data['admin_image']['file_name'];

						$status = '1';

						if (!$this->input->post('new_password')) {
							$prev_pass = $old['admin_password'];
							$update_data = array(
								'admin_name'        =>  ucwords($this->input->post('admin_name')),
								'admin_username'    =>  $this->input->post('admin_username'),
								'admin_password'    =>  $this->input->post('admin_password'),
								'admin_password'    =>  $prev_pass,
								'admin_email'       =>  $this->input->post('admin_email'),
								'admin_phoneNumber'   =>  $this->input->post('admin_phoneNumber'),
								'admin_image'       =>  $this->input->post('admin_image'),
								'admin_role'        =>  $this->input->post('admin_role'),
								'admin_image'       =>  $file,
								'admin_status'      =>  $status
							);
						} else {
							$update_data = array(
								'admin_name'        =>  ucwords($this->input->post('admin_name')),
								'admin_username'    =>  $this->input->post('admin_username'),
								'admin_password'    =>  $this->input->post('admin_password'),
								'admin_password'    =>  sha1($this->input->post('new_password')),
								'admin_email'       =>  $this->input->post('admin_email'),
								'admin_phoneNumber'   =>  $this->input->post('admin_phoneNumber'),
								'admin_image'       =>  $this->input->post('admin_image'),
								'admin_role'        =>  $this->input->post('admin_role'),
								'admin_image'       =>  $file,
								'admin_status'      =>  $status
							);
						}

						$id = $this->session->userdata['loggedin']['adminid'];
						$edited = $this->AdminModel->update_account($update_data, $id);
						if ($edited) {
							$this->session->set_flashdata("success", "Sucessful updated your account,<br> you can now log in.!!");

							//   echo json_encode($response);
							// $this->session->sess_destroy();
							$this->session->unset_userdata('logged_in');
							// redirect('Admin/index');
							echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
						} else {
							$this->session->set_flashdata("error", "Oops! something went wrong, Couldn't Update Account!");
							//   echo json_encode($response);
							// redirect('Admin/services');
							echo '<script> document.location = "' . site_url('admin/services') . '"; </script>';
						}
					}
				} else {
					$this->session->set_flashdata("error", "Sorry, the entered current password does not match the existing password!");
					// redirect('Admin/services');
					echo '<script> document.location = "' . site_url('admin/services') . '"; </script>';
				}
			}
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function logout()
	{
		$this->session->sess_destroy();
		echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
	}

	public function checkEmail()
	{
		// if (isset($this->session->userdata['loggedin']['adminname']))
		// {

		$response  = array();
		$postEmail = $this->input->post('email');
		if ($postEmail != null) {
			$check_query = $this->db->query("SELECT * FROM admins WHERE admin_email = '$postEmail' LIMIT 1");
			if ($check_query->num_rows() > 0) {
				$response['success'] = 1;
				$response['message'] = 'Proceed';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'Please Register, Your Email Doesnot Exist';

				echo json_encode($response);
			}
		} else {
			$response['success'] = 0;
			$response['message'] = 'Enter Email Please!';

			echo json_encode($response);
		}
		//  }
		//   else{
		//      redirect('Admin/index');
		//   }
	}


	public function SendForgotPasswordEmail()
	{
		// if (isset($this->session->userdata['loggedin']['adminname']))
		// {
		$response  = array();
		$chars     = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		$char      = substr(str_shuffle($chars), 0, 10);

		$email      = $this->input->post('email');
		$clean      = $this->security->xss_clean($email);
		$userInfo   = $this->AdminModel->getUserInfoByEmail($clean);

		$token = $this->AdminModel->insertToken($userInfo->admin_id);
		$qstring = $this->base64url_encode($token);
		$url = site_url() . 'admin/reset_password/token/' . $qstring;
		$link = '<a href="' . $url . '">' . $url . '</a>';

		$message = '';
		// $message .= '<strong>A password reset has been requested for this email account</strong><br>';
		// $message .= '<strong>Please click:</strong> ' . $link;
		$message .= '<a href="' . $url . '" style="background-color: #a90100; font-family: Arial Black, sans-serif; font-size: 22px; line-height: 1.1; text-align: center; text-decoration: none; display: block; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; transition: all 100ms ease-in; margin: 10px 5px; border: 18px solid #a90100;" class="button-a"> <span style="color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">RESET PASSWORD</span> </a>';

		if ($email != null) {
			$sendEmail = $this->send_forgotpassword_email_submission($email, $message);
			if ($sendEmail) {
				$response['success'] = 1;
				$response['message'] = 'Please Check your email address to reset password';

				echo json_encode($response);
			} else {
				$response['success'] = 0;
				$response['message'] = 'No Email To send to';

				echo json_encode($response);
			}
		} else {
			$response['success'] = 0;
			$response['message'] = 'No Email To send to';

			echo json_encode($response);
		}
	}


	public function send_forgotpassword_email_submission($c_email, $char)
	{
		require_once('mail/PHPMailerAutoload.php');
		$mail = new PHPMailer;
		$mail->SMTPDebug = 0;
		$mail->Host = "";
		$mail->Port = 465;
		$mail->SMTPAuth = true;
		$mail->Username = "";
		$mail->Password = "";
		$mail->setFrom('', 'AIRQO');
		$mail->Sender = '';
		$mail->addReplyTo('', 'AIRQO');

		$mail->addAddress($c_email, "User");
		$mail->Subject = 'AIRQO Admin Password Reset';
		$mail->msgHTML('

				<!DOCTYPE html>
				<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto; padding: 0;">

				<head>
				    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
				    <meta charset="utf-8">
				    <meta name="viewport" content="width=device-width">
				    <meta http-equiv="X-UA-Compatible" content="IE=edge">
				    <meta name="x-apple-disable-message-reformatting">
				    <style>
				        body {
				            margin: 0 auto !important;
				            padding: 0 !important;
				            height: 100% !important;
				            width: 100% !important;
				            background: #a1a1a1;
				        }

				        img {
				            -ms-interpolation-mode: bicubic;
				        }

				        .button-td:hover {
				            background: #555555 !important;
				            border-color: #555555 !important;
				        }

				        .button-a:hover {
				            background: #555555 !important;
				            border-color: #555555 !important;
				        }

				        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
				            .email-container {
				                min-width: 375px !important;
				            }
				        }

				        @media screen and (max-width: 480px) {
				            .fluid {
				                width: 100% !important;
				                max-width: 100% !important;
				                height: auto !important;
				                margin-left: auto !important;
				                margin-right: auto !important;
				            }
				            .stack-column {
				                display: block !important;
				                width: 100% !important;
				                max-width: 100% !important;
				                direction: ltr !important;
				            }
				            .stack-column-center {
				                display: block !important;
				                width: 100% !important;
				                max-width: 100% !important;
				                direction: ltr !important;
				            }
				            .stack-column-center {
				                text-align: center !important;
				            }
				            .center-on-narrow {
				                text-align: center !important;
				                display: block !important;
				                margin-left: auto !important;
				                margin-right: auto !important;
				                float: none !important;
				            }
				            table.center-on-narrow {
				                display: inline-block !important;
				            }
				            .email-container p {
				                font-size: 17px !important;
				                line-height: 22px !important;
				            }
				        }
				    </style>
				</head>
				<body width="60%" bgcolor="#FFFFFF" style="mso-line-height-rule: exactly; height: 100% !important; width: 60% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto; padding: 0;">
				    <center style="width: 100%; background-color: #FFFFFF; text-align: left; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				        <!-- Visually Hidden Preheader Text : BEGIN -->
				        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"></div>
				        <!-- Visually Hidden Preheader Text : END -->
				        <!-- Email Container : BEGIN -->
				        <div style="max-width: 680px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: auto;" class="email-container">

				            <!-- Email Header : BEGIN -->
				            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto;">
				                <!-- Depop Logo -->
				                <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                    <td style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px 0 0px;" align="center"> <img style="width: 100%; max-width: 330px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;" src="http://airqo.com/verification/logo.png" title="logo" class=""> </td>
				                </tr>
				                <!-- Main title -->

				                <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                    <td bgcolor="#ffffff" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 15px 20px;" align="center">
				                        <h1 style="font-family: Arial Black, HelveticaNeue-Bold, Arial Bold, Gadget, sans-serif; font-size: 40px; line-height: 1.2; color: #000000; font-weight: normal; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0;">Greetings from Airqo,</h1> </td>
				                </tr>
				                <!-- Main Image -->

				                <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                    <td style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;" align="center"> <img style="width: 100%; max-width: 600px; max-height:200px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;" src="http://airqo.com/assets/images/logo.png"> </td>
				                </tr>

				            </table>
				            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto;" class="email-container">
				                <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                    <td style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 40px;">
				                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto;">
				                            <!-- Subtitle -->
				                            <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                                <td bgcolor="#ffffff" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px 0;" align="center">
				                                    <h1 style="font-family: Arial Black, HelveticaNeue-Bold, Arial Bold, Gadget, sans-serif; font-size: 30px; line-height: 1.2; color: #000000; font-weight: normal; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0;">Forgot Password?</h1> </td>
				                            </tr>
				                            <!-- Text -->
				                            <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                                <td style="font-family: Arial; font-size: 16px; line-height: 1.2; color: #000000; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px 0;" align="left">
				                                    <p style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0;"> We have received a password reset request for your Airqo account associated with this email. Please click the reset button below to proceed or kindly ignore this email if you did not request this.</p>
				                                    <p style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0;">If you have not forgotten your password but would like to change it, please use the Change Password option.</p>
				                                    <br>
				                                    <b style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0;">*Please Note that this reset request expires after 3 days.</b>
				                                </td>
				                            </tr>
				                            <!-- button -->
				                            <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                                <td style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 10px 0 20px;">
				                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto;">
				                                        <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                                            <td style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; transition: all 100ms ease-in;" class="button-td" align="center" bgcolor="#a90100">
				                                                ' . $char . '
				                                            </td>
				                                        </tr>
				                                    </table>
				                                </td>
				                            </tr>
				                        </table>
				                    </td>
				                </tr>
				            </table>

				            <!-- Email Body : End -->
				            <!-- Email footer : Begin -->
				            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto;">
				                <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                    <td bgcolor="#000000" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 10px;">
				                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto;">
				                            <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
				                                <td style="font-family: Arial; font-size: 20px; line-height: 20px; color: #FFFFFF; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;" align="center">
				                                    <p style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><a style="font-color: #fff;" href="http://airqo.com">www.airqo.com</a>
				                                        <br>
				                                        <br style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">Kampala, Uganda</p>
				                                </td>
				                            </tr>
				                        </table>
				                    </td>
				                </tr>
				                <tr style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"> </tr>
				            </table>
				            <!-- Email footer : End -->
				        </div>
				    </center>
				</body>

				</html>

				');

		if (!$mail->send()) {
		}

		return true;
	}


	// public function PasswordReset()
	// {
	//   $response = array();

	//   $this->form_validation->set_rules('email', 'Email', 'required|valid_email');
	//   if($this->form_validation->run() == FALSE) {
	//       // $this->load->view('header');
	//       // $this->load->view('forgot');
	//       // $this->load->view('footer');
	//       $response['success'] = 0;
	//       $response['message'] = validation_errors();

	//       echo json_encode($response);

	//   }else{
	//       $email = $this->input->post('email');
	//       $clean = $this->security->xss_clean($email);
	//       $userInfo = $this->App_model->getUserInfoByEmail($clean);

	//       if(!$userInfo){
	//         $response['success'] = 0;
	//         $response['message'] = 'We cant find your email address';

	//         echo json_encode($response);

	//           // $this->session->set_flashdata('flash_message', 'We cant find your email address');
	//           // redirect(site_url().'main/login');
	//       }
	//       else
	//       {
	//          //build token

	//         $token = $this->App_model->insertToken($userInfo->admin_id);
	//         $qstring = $this->base64url_encode($token);
	//         $url = site_url() . 'app/reset_password/token/' . $qstring;
	//         $link = '<a href="' . $url . '">' . $url . '</a>';

	//         $message = '';
	//         // $message .= '<strong>A password reset has been requested for this email account</strong><br>';
	//         // $message .= '<strong>Please click:</strong> ' . $link;
	//         $message .= '<a href="'.$url.'" style="background-color: #a90100; font-family: Arial Black, sans-serif; font-size: 22px; line-height: 1.1; text-align: center; text-decoration: none; display: block; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; transition: all 100ms ease-in; margin: 10px 5px; border: 18px solid #a90100;" class="button-a"> <span style="color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">RESET PASSWORD</span> </a>';
	//         // echo $message; //send this through mail
	//         if($this->send_forgotpassword_email($email, $message))
	//         {
	//           $response['success'] = 1;
	//           $response['message'] = 'Please Check your email address to reset password';

	//           echo json_encode($response);
	//         }
	//         else
	//         {
	//           $response['success'] = 0;
	//           $response['message'] = 'Unable to send email';

	//           echo json_encode($response);
	//         }
	//       }

	//       // if($userInfo->status != $this->status[1]){ //if status is not approved
	//       //     $this->session->set_flashdata('flash_message', 'Your account is not in approved status');
	//       //     redirect(site_url().'main/login');
	//       // }

	//       // //build token

	//       // $token = $this->App_model->insertToken($userInfo->admin_id);
	//       // $qstring = $this->base64url_encode($token);
	//       // $url = site_url() . 'app/reset_password/token/' . $qstring;
	//       // $link = '<a href="' . $url . '">' . $url . '</a>';

	//       // $message = '';
	//       // $message .= '<strong>A password reset has been requested for this email account</strong><br>';
	//       // $message .= '<strong>Please click:</strong> ' . $link;
	//       // echo $message; //send this through mail
	//       // exit;

	//   }
	// }

	public function reset_password()
	{
		$token = $this->base64url_decode($this->uri->segment(4));
		$cleanToken = $this->security->xss_clean($token);

		$user_info = $this->AdminModel->isTokenValid($cleanToken); //either false or array();

		if (!$user_info) {
			$this->session->set_flashdata('flash_message', 'Token is invalid or expired');
			redirect(site_url() . 'admin/index');
		}
		$data = array(
			'firstName' => $user_info->admin_name,
			'user_id'   => $user_info->admin_id,
			'email'     => $user_info->admin_email,
			'token'     => $this->base64url_encode($token)
		);

		$this->form_validation->set_rules('password', 'Password', 'required|min_length[5]');
		$this->form_validation->set_rules('passconf', 'Password Confirmation', 'required|matches[password]');

		if ($this->form_validation->run() == false) {
			// $this->load->view('header');
			$this->load->view('admin/reset_password', $data);
			// $this->load->view('footer');
		} else {

			// $this->load->library('password');
			$post       = $this->input->post(null, true);
			$cleanPost  = $this->security->xss_clean($post);
			$hashed     = sha1($cleanPost['password']);
			$cleanPost['password']  = $hashed;
			$cleanPost['user_id']   = $user_info->admin_id;
			unset($cleanPost['passconf']);
			if (!$this->AdminModel->updatePassword($cleanPost)) {
				$this->session->set_flashdata('flash_message_error', 'There was a problem updating your password');
			} else {
				$this->session->set_flashdata('flash_message_success', 'Your password has been updated. You may now login');
			}
			// redirect(site_url() . 'admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function careers()
	{
		if (isset($this->session->userdata['loggedin']['adminname'])) {
			$data['navigation'] = '';
			$data['title'] = 'Careers';
			$data['user'] = $this->session->userdata['loggedin']['adminname'];
			$data['careers'] = $this->AdminModel->list_careers();
			$this->load->view('admin/includes/header', $data);
			$this->load->view('admin/includes/menu', $data);
			$this->load->view('admin/careers', $data);
		} else {
			// redirect('Admin/index');
			echo '<script> document.location = "' . site_url('admin/index') . '"; </script>';
		}
	}

	public function base64url_encode($data)
	{
		return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
	}
	public function base64url_decode($data)
	{
		return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
	}
}
