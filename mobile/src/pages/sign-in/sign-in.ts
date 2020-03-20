import { ForgotPasswordPage } from './../forgot-password/forgot-password';
import { HomePage } from './../home/home';
import { SignUpPage } from './../sign-up/sign-up';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html',
})
export class SignInPage {

  user: any = {};

  remember_me: string = 'yes';

  password_type: string = 'password';
  password_icon: string = 'eye-off';

  sign_in_api    = 'https://test-dot-airqo-frontend.appspot.com/Apis/airqoUserLogin';

  constructor(private navCtrl: NavController, private navParams: NavParams, private toastCtrl: ToastController, private http: HttpClient,
    private loadingCtrl: LoadingController, private storage: Storage, private alertCtrl: AlertController, private api: ApiProvider) {
  }

  
  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: 
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() { }


  // --------------------------------------------------------------------------------------------------------------------
  // Show or Hide Password
  // --------------------------------------------------------------------------------------------------------------------
  hideShowPassword() {
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
    this.password_icon = this.password_icon === 'eye-off' ? 'eye' : 'eye-off';
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Remember Me Checkbox Clicked
  // --------------------------------------------------------------------------------------------------------------------
  checkboxClicked(event, value) {
    if (event.checked) {
      this.remember_me = 'yes';
    } else {
      this.remember_me = 'no';
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Validate Credentials
  // --------------------------------------------------------------------------------------------------------------------
  validateCredentials() {
    if(Object.keys(this.user).length > 0) {

      if(this.remember_me == 'yes'){
        this.storage.set('remember_me', this.user);
      } else {
        this.storage.set('remember_me', null);
      }

      let params = {
        email: this.user.email,
        password: this.user.password,
        api: this.api.api_key
      };
      this.submitSignInInfo(params);
    } else {
      this.toastCtrl.create({
        message: 'Please enter Email and Password',
        duration: 3000,
        position: 'bottom'
      }).present();
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Submit Sign In Information
  // --------------------------------------------------------------------------------------------------------------------
  submitSignInInfo(data) {
    let loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Please wait...',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    loader.present().then(() => {
      this.http.post(this.sign_in_api, data).subscribe((result: any) => {
        console.log(result);
        loader.dismiss();
        if(result.success == "100"){
          this.user = {
            uid: result.id,
            name: result.name,
            email: result.email,
            token: result.token,
          };

          this.storage.set('user_data', this.user).then(() => {
            this.navCtrl.setRoot(HomePage);
          });
        } else {
          this.alertCtrl.create({
            title: result.title,
            message: result.message,
            buttons: ['Okay']
          }).present();
        }
      }, (err) => {
        loader.dismiss();
        this.api.networkErrorMessage();
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Sign Up Page
  // --------------------------------------------------------------------------------------------------------------------
  goToSignUpPage() {
    this.navCtrl.push(SignUpPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Forgot Password Page
  // --------------------------------------------------------------------------------------------------------------------
  goToForgotPasswordPage() {
    this.navCtrl.push(ForgotPasswordPage);
  }

}
