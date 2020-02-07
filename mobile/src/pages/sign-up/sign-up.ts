import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ApiProvider } from '../../providers/api/api';

import { SignInPage } from '../sign-in/sign-in';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
})
export class SignUpPage {

  user: any = {};

  password_type: string = 'password';
  password_icon: string = 'eye-off';

  sign_up_api    = 'https://airqo.net/Apis/airqoSignUp';

  constructor(public navCtrl: NavController, public navParams: NavParams, private loadingCtrl: LoadingController, private http: HttpClient,
    private alertCtrl: AlertController, private storage: Storage, private api: ApiProvider) {
  }

  
  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: 
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Show or Hide Password
  // --------------------------------------------------------------------------------------------------------------------
  hideShowPassword() {
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
    this.password_icon = this.password_icon === 'eye-off' ? 'eye' : 'eye-off';
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Check for valid Email Address
  // --------------------------------------------------------------------------------------------------------------------
  validateEmail(email) {
    var regex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    return regex.test(email);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Validate Credentials
  // --------------------------------------------------------------------------------------------------------------------
  validateCredentials() {
    if(Object.keys(this.user).length > 0) {
      this.user.email = this.user.email.toLowerCase();
      if(this.validateEmail(this.user.email)) {
        if(this.user.password){
          var strengthRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})");
          if(strengthRegex.test(this.user.password)) {
            let data = {
              name: this.user.name,
              email: this.user.email,
              password: this.user.password,
              api: this.api.api_key
            };
            this.submitSignUpInfo(data);
          } else {
            this.alertCtrl.create({
              title: 'Weak Password',
              message: 'Passwords should be at least 6 characters long and should contain a mixture of letters, numbers and other characters',
              buttons: ['Okay']
            }).present();
          }
        } else {
          this.alertCtrl.create({
            title: 'Invalid Password',
            message: 'Please input a password',
            buttons: ['Okay']
          }).present();
        }
      } else {
        this.alertCtrl.create({
          title: 'Invalid Email',
          message: 'Please enter a valid email address',
          buttons: ['Okay']
        }).present();
      }
    } else {
      this.alertCtrl.create({
        title: 'Invalid Submission',
        message: 'Please ensure you have added all the required information',
        buttons: ['Okay']
      }).present();
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Submit Registration Information
  // --------------------------------------------------------------------------------------------------------------------
  submitSignUpInfo(data) {
    let loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Please wait...',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    console.log(JSON.stringify(data));

    loader.present().then(() => {
      this.http.post(this.sign_up_api, data).subscribe((result: any) => {
        console.log(result);
        loader.dismiss();

        if(result.success == "100"){
          this.alertCtrl.create({
            title: result.title,
            message: result.message,
            buttons: [
              {
                text: 'Okay',
                handler: data => {
                  this.user = {
                    uid: result.id,
                    name: result.name,
                    email: result.email,
                    token: result.token,
                  };
        
                  this.storage.set('user_data', this.user).then(() => {
                    this.navCtrl.setRoot(SignInPage);
                  });
                }
              },
            ]
          }).present();
        } else {
          this.alertCtrl.create({
            title: result.title,
            message: result.message,
            buttons: ['Okay']
          }).present();
        }
      }, (err) => {
        loader.dismiss();
        this.alertCtrl.create({
          message: 'Please check your internet connection',
          buttons: ['Okay']
        }).present();
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Sign In Page
  // --------------------------------------------------------------------------------------------------------------------
  goToSignInPage() {
    this.navCtrl.push(SignInPage);
  }

}