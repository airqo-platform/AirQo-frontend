
<?php
defined('BASEPATH') or exit('No direct script access allowed');

class ApisModel extends CI_Model
{
    public function __construct()
    {
        $this->load->database();
    }
    
    public function init()
    {
        header("Access-Control-Allow-Origin: *");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
            
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: origin, content-type, accept");
        header("Access-Control-Allow-Credentials: true");

        $postdata   = file_get_contents("php://input");
        $request    = new stdClass();
        $request    = json_decode($postdata);

        if(!empty($request)) {
            foreach ($request as $key => $value) {
                $_POST[$key] = $value;
            }
        }

        header('Content-Type: application/json');
        $response = array();
    }

    public function escape($value)
    {
        if (!empty($value)) {
            $escapedValue = $this->db->escape($value);
            $start        = substr($escapedValue, 0, 1);
            $end          = substr($escapedValue, -1);
            if (($start == "'") && ($end == "'")) {
                $escapedValue        = substr($escapedValue, 1);
                $escapedValue        = substr($escapedValue, 0, -1);
                return $escapedValue;
            } else {
                return $escapedValue;
            }
        } else {
            return null;
        }
    }

    public function validateAPI($key)
    {
        $this->db->select('*');
        $this->db->from('tbl_app_apis');
        $this->db->where('aa_api_key', $key);
        $this->db->where('aa_status', 'Active');
        $this->db->limit(1);
        $query = $this->db->get();
        if ($query->num_rows() > 0) {
            return $this->stateOk();
        } else {
            return $this->app_api_error("Wrong API configuration", "Please check your API key");
        }
    }

    public function api_error()
    {
        $message    = "Wrong API configuration";
        $debug      = "API key mismatch";
        return  $this->app_api_error($message, $debug);
    }

    public function app_api_error($message, $debug)
    {
        $response   = array();
        $state      = $this->stateError();
        $state_name = "error";
        $state_code = 381;
        return  $this->api_response($response, $state, $state_name, $state_code, $message, $debug);
    }

    public function api_response($response, $state, $state_name, $state_code, $message, $debug)
    {
        $this->init();
        $response["status"]      = $state;
        $response["$state_name"] = $state_code;
        $response["message"]     = $message;
        $response["debug"]       = $debug;
        return json_encode($response);
    }

    public function stateError()
    {
        return "Error";
    }

    public function stateOk()
    {
        return "Ok";
    }

    public function base64url_encode($data)
	{
		return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
	}
	public function base64url_decode($data)
	{
		return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
    
    public function SendForgotPasswordEmail($email, $uid, $uname)
    {
        if ($email != null) {
            $token = $this->insertUserToken($uid);
            $qstring = $this->base64url_encode($token);
            $url = base_url(). '/user-reset-password/token/' . $qstring;
            $link = '<a href="' . $url . '">' . $url . '</a>';

            $message = '';
            $message .= '<a href="' . $url . '" style="background-color: #002d59; font-family: Arial Black, sans-serif; font-size: 22px; line-height: 1.1; text-align: center; text-decoration: none; display: block; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; transition: all 100ms ease-in; margin: 10px 5px; border: 18px solid #a90100;" class="button-a"> <span style="color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">RESET PASSWORD</span> </a>';
               
            if ($this->SendMailNotification("AirQo Password Reset Request", $email, $uname, $message)) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public function insertUserToken($user_id)
    {
        date_default_timezone_set('Africa/Kampala');
        $token    = substr(sha1(rand()), 0, 30);
        $date    = date('Y-m-d');
          
        $query = $this->db->query("INSERT INTO tbl_user_tokens (token, type, user_id, created) VALUES ('$token', 'email', '$user_id', '$date')");
        return $token . $user_id;
    }

    public function userLoginAttempt($email, $reset)
    {
        date_default_timezone_set('Africa/Kampala');
        $date    = date('Y-m-d H:i:s');
        if ($reset) {
            $query = $this->db->query("UPDATE tbl_users SET au_failed_attempts = 0, au_last_failed_attempt = '$date'
          WHERE au_email = '$email'");
        } else {
            $query = $this->db->query("UPDATE tbl_users SET 
          au_failed_attempts = au_failed_attempts + 1, 
          au_last_failed_attempt = '$date',
          au_bruteforce_lock = CASE WHEN au_failed_attempts >= 24  THEN 'Locked' ELSE au_bruteforce_lock END
          WHERE au_email = '$email'");
        }
        return true;
    }

    public function isUserLoginAllowed($email)
    {
        date_default_timezone_set('Africa/Kampala');
        $date    = date('Y-m-d H:i:s');
        $check_login = $this->db->query("SELECT la.au_failed_attempts, la.au_last_failed_attempt,
          la.au_bruteforce_lock
          FROM tbl_users la
          WHERE la.au_email = '$email' LIMIT 1");
        if ($check_login->num_rows() > 0) {
            $record = $check_login->row_array();
            $failed_attempts  = $record["au_failed_attempts"];
            $last_failed_attempt  = $record["au_last_failed_attempt"];
            $bruteforce_lock  = $record["au_bruteforce_lock"];
            if ($bruteforce_lock == "Active") {
                if ($failed_attempts < 6) {
                    if ($failed_attempts == 5) {
                        $minutesago = round((strtotime($date) - strtotime($last_failed_attempt))/60, 0);
                        if ($minutesago < 30) {
                            $timeleft = (30 - $minutesago);
                            return "You failed to login within 5 consecutive attempts, please try again in ".$timeleft." minutes";
                        } else {
                            return "Allowed";
                        }
                    } else {
                        return "Allowed";
                    }
                } elseif ($failed_attempts < 11) {
                    if ($failed_attempts == 10) {
                        $minutesago = round((strtotime($date) - strtotime($last_failed_attempt))/60, 0);
                        if ($minutesago < 60) {
                            $timeleft = (60 - $minutesago);
                            return "You failed to login within 10 consecutive attempts, please try again in ".$timeleft." minutes";
                        } else {
                            return "Allowed";
                        }
                    } else {
                        return "Allowed";
                    }
                } elseif ($failed_attempts < 16) {
                    if ($failed_attempts == 15) {
                        $minutesago = round((strtotime($date) - strtotime($last_failed_attempt))/60, 0);
                        if ($minutesago < 90) {
                            $timeleft = (90 - $minutesago);
                            return "You failed to login within 15 consecutive attempts, please try again in ".$timeleft." minutes";
                        } else {
                            return "Allowed";
                        }
                    } else {
                        return "Allowed";
                    }
                } elseif ($failed_attempts < 21) {
                    if ($failed_attempts == 20) {
                        $minutesago = round((strtotime($date) - strtotime($last_failed_attempt))/60, 0);
                        if ($minutesago < 120) {
                            $timeleft = (120 - $minutesago);
                            return "You failed to login within 20 consecutive attempts, please try again in ".$timeleft." minutes";
                        } else {
                            return "Allowed";
                        }
                    } else {
                        return "Allowed";
                    }
                } else {
                    return "Allowed";
                }
            } else {
                return "Your account is currently locked, please contact support to unlock your account.";
            }
        }
        return "Allowed";
    }
    
    public function SendMailNotification($Nsubject, $Nemail, $Nname, $NmailMessage)
     {
          date_default_timezone_set('Etc/UTC');
          require_once './mail/PHPMailerAutoload.php';
          $receiverBCC = "buzentech@airqo.net";
          if (!filter_var($Nemail, FILTER_VALIDATE_EMAIL)) {
               return false;
          } elseif (filter_var($Nemail, FILTER_VALIDATE_EMAIL)) {
               $mail = new PHPMailer;

               $mail->SMTPDebug = 0;

               $mail->Host = "ssl://mail.airqo.net";
               $mail->Port = 465;
               $mail->SMTPAuth = true;
               $mail->Username = "buzentech@airqo.net";
               $mail->Password = "airqo@buzentech";
               $mail->setFrom('noreply@airqo.net', 'Team @ AirQo');
               $mail->Sender = 'noreply@airqo.net';
               $mail->addReplyTo('noreply@airqo.net', 'Team @ AirQo');

               $mail->addAddress($Nemail, $Nname);
               $mail->Subject = $Nsubject;
               $mail->addBCC($receiverBCC);
                         
               $mail->msgHTML('
                            <td valign="top">
                            <table style="border-radius:4px;border:1px #dceaf5 solid" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tbody>
                                    <tr>
                                        <td colspan="3" height="6"></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table style="line-height:25px" cellspacing="0" cellpadding="0" border="0" align="center">
                                                <tbody>
                                                <tr>
                                                        <td colspan="3" height="30"></td>
                                                </tr>
                                                <tr>
                                                        <td width="36"></td>
                                                        <td style="color:#444444;border-collapse:collapse;font-size:11pt;font-family:proxima_nova,Open Sans,Lucida Grande,Segoe UI,Arial,Verdana,Lucida Sans Unicode,Tahoma,Sans Serif;max-width:454px" align="left" width="454" valign="top">
                                                            '.$NmailMessage.'
                                                        <td width="36"></td>
                                                </tr>
                                                <tr>
                                                        <td colspan="3" height="36"></td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                            </tbody>
                            </table>
                            <table cellspacing="0" cellpadding="0" border="0" align="center">
                            <tbody>
                                    <tr>
                                        <td height="10"></td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0;border-collapse:collapse">
                                            <table cellspacing="0" cellpadding="0" border="0" align="center">
                                                <tbody>
                                                <tr style="color:#a8b9c6;font-size:11px;font-family:proxima_nova,Open Sans,Lucida Grande,Segoe UI,Arial,Verdana,Lucida Sans Unicode,Tahoma,Sans Serif">
                                                        <td align="left" width="400"></td>
                                                        <td align="right" width="200">&copy; '. date("Y") .' AirQo</td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                            </tbody>
                            </table>
                        </td>
                ');

               if (!$mail->send()) {
                    return false;
               } else {
                    return true;
               }
          }
          return false;
     }
}

