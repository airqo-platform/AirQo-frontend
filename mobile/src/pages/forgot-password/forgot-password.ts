import { HomePage } from './../home/home';
import { SignUpPage } from './../sign-up/sign-up';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

  user: any = {};

  forgot_password_api    = `${this.api.api_endpoint}/ForgotPassword`;

  constructor(private navCtrl: NavController, private navParams: NavParams, private toastCtrl: ToastController, private http: HttpClient,
    private loadingCtrl: LoadingController, private storage: Storage, private alertCtrl: AlertController, private api: ApiProvider) {
  }

  
  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: 
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() { }


  // --------------------------------------------------------------------------------------------------------------------
  // Validate Credentials
  // --------------------------------------------------------------------------------------------------------------------
  validateCredentials() {
    if(Object.keys(this.user).length > 0) {

      let params = {
        email: this.user.email,
        api: this.api.api_key
      };
      this.submitSignInInfo(params);
    } else {
      this.toastCtrl.create({
        message: 'Please enter an Email',
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
      this.http.post(this.forgot_password_api, data).subscribe((result: any) => {
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
}
