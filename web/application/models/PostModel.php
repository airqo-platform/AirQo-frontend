<?php
class PostModel extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
		$this->load->database();
	}

	/**
	 * Get post
	 */
	public function get_post($id = null)
	{
		$default_bio = "About the author or editor at the Hillary K Bainny.";
		$default_social = "thehkbainny";
		if ($id == null) {
			$query = $this->db->query("SELECT p.*, COALESCE(c.c_name, 'General') AS category, COALESCE(e.e_name, '') AS author, COALESCE(e.e_img, '') AS author_img,
      COALESCE(e.e_bio, '$default_bio') AS bio, COALESCE(e.e_facebook, '$default_social') AS fb, COALESCE(e.e_twitter, '$default_social') AS tw,
      COALESCE(e.e_instagram, '$default_social') AS inst, COALESCE(e.e_pinterest, '$default_social') AS pin
                                  FROM tbl_posts p
                                  LEFT JOIN tbl_categories c ON p.p_categories = c.c_id
                                  LEFT JOIN hkb_users e ON p.p_author = e.e_id
                                  WHERE p.p_status = 'published' ORDER BY p.p_updated DESC LIMIT 10");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT p.*, COALESCE(c.c_name, 'General') AS category, COALESCE(e.e_name, '') AS author, COALESCE(e.e_img, '') AS author_img,
    COALESCE(e.e_bio, '$default_bio') AS bio, COALESCE(e.e_facebook, '$default_social') AS fb, COALESCE(e.e_twitter, '$default_social') AS tw,
    COALESCE(e.e_instagram, '$default_social') AS inst, COALESCE(e.e_pinterest, '$default_social') AS pin
                              FROM tbl_posts p
                              LEFT JOIN tbl_categories c ON p.p_categories = c.c_id
                              LEFT JOIN hkb_users e ON p.p_author = e.e_id
                              WHERE p.p_id = '$id'");
		return $query->row_array();
	}

	public function get_post_id_by_slug($slug)
	{
		$query = $this->db->query("SELECT p_id
                                FROM tbl_posts
                                WHERE p_slug = '$slug' AND p_status = 'published' LIMIT 1");
		return $query->row_array();
	}

	public function get_home_random()
	{
		$default_bio = "About the author or editor at the Hillary K Bainny.";
		$default_social = "thehkbainny";
		$query = $this->db->query("SELECT p.*, COALESCE(c.c_name, 'General') AS category, COALESCE(e.e_name, '') AS author, COALESCE(e.e_img, '') AS author_img,
        COALESCE(e.e_bio, '$default_bio') AS bio, COALESCE(e.e_facebook, '$default_social') AS fb, COALESCE(e.e_twitter, '$default_social') AS tw,
        COALESCE(e.e_instagram, '$default_social') AS inst, COALESCE(e.e_pinterest, '$default_social') AS pin
                                    FROM tbl_posts p
                                    LEFT JOIN tbl_categories c ON p.p_categories = c.c_id
                                    LEFT JOIN hkb_users e ON p.p_author = e.e_id
                                    WHERE p.p_status = 'published' ORDER BY RAND() LIMIT 5");
		return $query->result_array();
	}

	public function get_suggestion()
	{
		$default_bio = "About the author or editor at the Hillary K Bainny.";
		$default_social = "thehkbainny";
		$query = $this->db->query("SELECT p.*, COALESCE(c.c_name, 'General') AS category, COALESCE(e.e_name, '') AS author, COALESCE(e.e_img, '') AS author_img,
        COALESCE(e.e_bio, '$default_bio') AS bio, COALESCE(e.e_facebook, '$default_social') AS fb, COALESCE(e.e_twitter, '$default_social') AS tw,
        COALESCE(e.e_instagram, '$default_social') AS inst, COALESCE(e.e_pinterest, '$default_social') AS pin
                                    FROM tbl_posts p
                                    LEFT JOIN tbl_categories c ON p.p_categories = c.c_id
                                    LEFT JOIN hkb_users e ON p.p_author = e.e_id
                                    WHERE p.p_status = 'published' ORDER BY RAND() LIMIT 45");
		return $query->result_array();
	}

	public function get_suggestion_cat($cat)
	{
		$default_bio = "About the author or editor at the Hillary K Bainny.";
		$default_social = "thehkbainny";
		$query = $this->db->query("SELECT p.*, COALESCE(c.c_name, 'General') AS category, COALESCE(e.e_name, '') AS author, COALESCE(e.e_img, '') AS author_img,
        COALESCE(e.e_bio, '$default_bio') AS bio, COALESCE(e.e_facebook, '$default_social') AS fb, COALESCE(e.e_twitter, '$default_social') AS tw,
        COALESCE(e.e_instagram, '$default_social') AS inst, COALESCE(e.e_pinterest, '$default_social') AS pin
                                    FROM tbl_posts p
                                    LEFT JOIN tbl_categories c ON p.p_categories = c.c_id
                                    LEFT JOIN hkb_users e ON p.p_author = e.e_id
                                    WHERE p.p_categories NOT LIKE '%$cat%' AND p.p_status = 'published' ORDER BY p.p_updated DESC LIMIT 45");
		return $query->result_array();
	}

	public function get_suggestion_author($author)
	{
		$default_bio = "About the author or editor at the Hillary K Bainny.";
		$default_social = "thehkbainny";
		$query = $this->db->query("SELECT p.*, COALESCE(c.c_name, 'General') AS category, COALESCE(e.e_name, '') AS author, COALESCE(e.e_img, '') AS author_img,
        COALESCE(e.e_bio, '$default_bio') AS bio, COALESCE(e.e_facebook, '$default_social') AS fb, COALESCE(e.e_twitter, '$default_social') AS tw,
        COALESCE(e.e_instagram, '$default_social') AS inst, COALESCE(e.e_pinterest, '$default_social') AS pin
                                    FROM tbl_posts p
                                    LEFT JOIN tbl_categories c ON p.p_categories = c.c_id
                                    LEFT JOIN hkb_users e ON p.p_author = e.e_id
                                    WHERE p.p_author != '$author' AND p.p_status = 'published' ORDER BY p.p_updated DESC LIMIT 45");
		return $query->result_array();
	}

	public function get_profile_posts($id = null)
	{
		$default_bio = "About the author or editor at the Hillary K Bainny.";
		$default_social = "thehkbainny";
		if ($id != null) {
			$query = $this->db->query("SELECT p.*, COALESCE(c.c_name, 'General') AS category, COALESCE(e.e_name, '') AS author, COALESCE(e.e_img, '') AS author_img,
            COALESCE(e.e_bio, '$default_bio') AS bio, COALESCE(e.e_facebook, '$default_social') AS fb, COALESCE(e.e_twitter, '$default_social') AS tw,
            COALESCE(e.e_instagram, '$default_social') AS inst, COALESCE(e.e_pinterest, '$default_social') AS pin
                                        FROM tbl_posts p
                                        LEFT JOIN tbl_categories c ON p.p_categories = c.c_id
                                        LEFT JOIN hkb_users e ON p.p_author = e.e_id
                                        WHERE p.p_status = 'published' AND p.p_author = '$id' ORDER BY p.p_updated DESC LIMIT 10");
			return $query->result_array();
		}
	}

	public function get_profile($id = null)
	{
		$default_bio = "About the author or editor at the Hillary K Bainny.";
		$default_social = "thehkbainny";
		if ($id != null) {
			$query = $this->db->query("SELECT COALESCE(e.e_name, '') AS author, COALESCE(e.e_img, '') AS author_img,
            COALESCE(e.e_bio, '$default_bio') AS bio, COALESCE(e.e_facebook, '$default_social') AS fb, COALESCE(e.e_twitter, '$default_social') AS tw,
            COALESCE(e.e_instagram, '$default_social') AS inst, COALESCE(e.e_pinterest, '$default_social') AS pin
                                        FROM hkb_users e
                                        WHERE e.e_id = '$id' LIMIT 1");
			return $query->result_array();
		}
	}

	public function get_post_hot_picks($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' ORDER BY p_views DESC LIMIT 5");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_id = '$id'");
		return $query->row_array();
	}

	public function get_related_posts($tags = null)
	{
		if ($tags != null && strlen($tags) > 0) {
			if (strpos($tags, ",") == true) {
				$tagsArray = explode(',', $tags);
				$query_array["related"] = array();
				foreach ($tagsArray as $tag) {
					$tag = trim($tag);
					$tag = str_replace("%20", " ", $tag);
					$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' AND p_tags LIKE '%$tag%' ORDER BY p_views DESC LIMIT 5");
					if ($query->num_rows < 1) {
						$get_related = $query->result_array();
						foreach ($get_related as $row) {
							$related["p_id"] = $row["p_id"];
							$related["p_slug"] = $row["p_slug"];
							$related["p_title"] = $row["p_title"];
							$related["p_img"] = $row["p_img"];
							array_push($query_array["related"], $related);
						}
					}
				}
				if ($query_array["related"] != null) {
					return $query_array["related"];
				} else {
					$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' ORDER BY p_views DESC LIMIT 5");
					return $query->result_array();
				}
			} else {
				$tags = trim($tags);
				$tags = str_replace("%20", " ", $tags);
				$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' AND p_tags LIKE '%$tags%' ORDER BY p_views DESC LIMIT 5");
				if ($query->num_rows < 1) {
					$query_array["related"] = array();
					$get_related = $query->result_array();
					foreach ($get_related as $row) {
						$related["p_id"] = $row["p_id"];
						$related["p_slug"] = $row["p_slug"];
						$related["p_title"] = $row["p_title"];
						$related["p_img"] = $row["p_img"];
						array_push($query_array["related"], $related);
					}
					return $query_array["related"];
				} else {
					$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' ORDER BY p_views DESC LIMIT 5");
					return $query->result_array();
				}
			}
		} else {
			$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' ORDER BY p_views DESC LIMIT 5");
			return $query->result_array();
		}
	}

	public function removeRepeatedArticles($array, $key)
	{
		$temp_array = array();
		$i = 0;
		$key_array = array();

		foreach ($array as $val) {
			if (!in_array($val[$key], $key_array)) {
				$key_array[$i] = $val[$key];
				$temp_array[$i] = $val;
			}
			$i++;
		}
		return $temp_array;
	}

	public function get_post_admin($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status != 'deleted' ORDER BY p_updated DESC");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_id = '$id'");
		return $query->row_array();
	}

	public function get_search_posts($key)
	{
		if ($key == null) {
			$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' ORDER BY p_updated DESC LIMIT 40");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT p.* FROM tbl_posts p WHERE (p.p_title LIKE '%$key%' OR p.p_tags LIKE '%$key%') AND p.p_status = 'published' ORDER BY p.p_updated DESC LIMIT 35");
		return $query->result_array();
	}

	public function get_search_posts_meta($key)
	{
		if ($key == null) {
			$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' ORDER BY p_updated DESC LIMIT 40");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT p.*
                                      FROM tbl_postmeta pm
                                      LEFT JOIN tbl_posts p ON p.p_id = pm.pm_post
                                      WHERE pm.pm_content LIKE '%$key%' AND p.p_status = 'published' ORDER BY p.p_updated DESC LIMIT 35");
		return $query->result_array();
	}

	public function get_post_by_category($cat)
	{
		if ($cat == null) {
			$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' ORDER BY p_updated DESC LIMIT 40");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_categories LIKE '%$cat%' AND p_status = 'published' ORDER BY p_updated DESC LIMIT 35");
		return $query->result_array();
	}

	public function get_post_by_tag($tag)
	{
		if ($tag == null) {
			$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_status = 'published' ORDER BY p_updated DESC LIMIT 40");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT * FROM tbl_posts WHERE p_tags LIKE '%$tag%' AND p_status = 'published' ORDER BY p_updated DESC LIMIT 35");
		return $query->result_array();
	}

	public function get_site_tags()
	{
		$query = $this->db->query("SELECT * FROM tbl_tags WHERE t_status = 'active' LIMIT 60");
		return $query->result_array();
	}

	/**
	 * Create post
	 */
	public function create_post($data)
	{
		return $this->db->insert('tbl_posts', $data);
	}

	/**
	 * Edit post
	 */
	public function edit_post($data, $id)
	{
		$this->db->where('p_id', $id);
		return $this->db->update('tbl_posts', $data);
	}

	/**
	 * Delete post
	 */
	public function delete_post($id)
	{
		$this->db->where('p_id', $id);
		return $this->db->update('tbl_posts', array('p_status' => 'deleted', 'p_updated' => date('Y-m-d h:i:s'), 'p_updated_by' => $this->session->userdata['hkb_logged_in']['HKB_IR_UID']));
	}

	/**
	 * Publish post
	 */
	public function publish_post($id)
	{
		$this->db->where('p_id', $id);
		return $this->db->update('tbl_posts', array('p_status' => 'published', 'p_updated' => date('Y-m-d h:i:s'), 'p_updated_by' => $this->session->userdata['hkb_logged_in']['HKB_IR_UID']));
	}

	/**
	 * Disable post
	 */
	public function disable_post($id)
	{
		$this->db->where('p_id', $id);
		return $this->db->update('tbl_posts', array('p_status' => 'disabled', 'p_updated' => date('Y-m-d h:i:s'), 'p_updated_by' => $this->session->userdata['hkb_logged_in']['HKB_IR_UID']));
	}

	/**
	 * Get Tags
	 */
	public function get_tag($id = null)
	{
		if ($id == null) {
			$query = $this->db->query("SELECT * FROM tbl_tags WHERE t_status = 'active'");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT * FROM tbl_tags WHERE t_id = '$id'");
		return $query->row_array();
	}

	/**
	 * Get Post Meta
	 */
	public function get_postmeta($post = null)
	{
		if ($post == null) {
			$query = $this->db->query("SELECT * FROM tbl_postmeta");
			return $query->result_array();
		}

		$query = $this->db->query("SELECT * FROM tbl_postmeta WHERE pm_post = '$post'");
		return $query->row_array();
	}

	// public function get_post_comments($post)
	// {
	// 	$query = $this->db->query("SELECT * FROM hkb_comments WHERE c_post = '$post' AND c_status = 'active'");
	// 	return $query->result_array();
	// }
}
