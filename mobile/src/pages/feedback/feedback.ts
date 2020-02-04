import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';
import { HomePage } from '../home/home';
import { SignInPage } from '../sign-in/sign-in';

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {

  user: any = {};
  feedback: any = {};

  feedback_api    = 'https://airqo.net/Apis/airqoFeedback';

  constructor(private navCtrl: NavController, private storage: Storage, private http: HttpClient, private loadingCtrl: LoadingController, 
    private alertCtrl: AlertController, private toastCtrl: ToastController, public api: ApiProvider) {
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {}


  // --------------------------------------------------------------------------------------------------------------------
  // Fires everytime page loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {
    this.getUserInfo();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get User's info
  // --------------------------------------------------------------------------------------------------------------------
  getUserInfo() {
    this.storage.get('user_data').then((val) => {
      if(val && val != null && val != '') {
        this.user = val;
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Verify Feedback
  // --------------------------------------------------------------------------------------------------------------------
  verifyFeedback() {
    if(Object.keys(this.user).length > 0) {
      if(Object.keys(this.feedback).length > 0) {
        let params = {
          uid: this.user.uid,
          subject: this.feedback.subject,
          body: this.feedback.body,
          api: this.api.api_key
        };
        this.submitFeedback(params);
      } else {
        this.alertCtrl.create({
          title: 'Invalid Submission',
          message: 'Please ensure you have added all the required information',
          buttons: ['Okay']
        }).present();
      }
    } else {
      this.navCtrl.push(SignInPage);
    }
  }

  // --------------------------------------------------------------------------------------------------------------------
  // Submit Feedback
  // --------------------------------------------------------------------------------------------------------------------
  submitFeedback(params) {
    let loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Please wait...',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    loader.present().then(() => {
      this.http.post(this.feedback_api, params).subscribe((result: any) => {
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
                  this.navCtrl.setRoot(HomePage);
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
        this.toastCtrl.create({
          message: 'Network Error',
          duration: 3000,
          position: 'bottom'
        }).present();
      });
    });
  }

}
