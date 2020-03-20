import { FIREBAASE_CONFIG } from './../../app/firebase.config';
import { NavController, NavParams, ToastController, ViewController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { storage, initializeApp } from 'firebase';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {

  user: any = {};
  coordinates: any = {};
  ac_submission: any = {
    name: '',
    reading: '0',
    comment: '',
    photo: '',
    photo_preview: '',
  };

  nodes: any = [];
  favorite_nodes: any = [];

  aqi_camera_api = 'https://test-dot-airqo-frontend.appspot.com/Apis/airqoAqiCamera';

  get_coordinates_api    = 'https://buzentech.com/get-info.php';

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController, private http: HttpClient, 
    private alertCtrl: AlertController, public api: ApiProvider, private geolocation: Geolocation, private platform: Platform,
    private camera: Camera) {
      initializeApp(FIREBAASE_CONFIG);
  }

  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.getUserInfo();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires everytime page loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {
    let options = {
      timeout: 20000, 
      enableHighAccuracy: true
    };

    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition(options).then((pos) => {
        this.coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      }).catch((error) => {
        console.log('Error getting location: ', error);
        this.toastCtrl.create({
          message: error.message,
          duration: 3000,
          position: 'bottom'
        }).present();

        this.getCoordinatesByIP();
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get Coordinates By IP Address
  // --------------------------------------------------------------------------------------------------------------------
  getCoordinatesByIP() {
    this.http.get(this.get_coordinates_api).subscribe((result: any) => {
      console.log(result);
      if(result.success == '1'){
          this.coordinates.lat = result.message.lat;
          this.coordinates.lng = result.message.lon;
      }
    });
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
  // Open Camera
  // --------------------------------------------------------------------------------------------------------------------
  async openCamera(){
    try {
      let options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true
      }
      
      const result    = await this.camera.getPicture(options);
      const image     = `data:image/jpeg;base64,${result}`;
      let image_name  = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const pictures  = storage().ref(`app-aqi/${image_name}`);
      pictures.putString(image, 'data_url');

      this.ac_submission.preview  = image;
      this.ac_submission.image    = `https://firebasestorage.googleapis.com/v0/b/airqo-frontend-media.appspot.com/o/app-aqi%2F${image_name}?alt=media&token=ad20f42b-0d9d-4c21-81c0-eccfd875ed91`;
    } catch (e) {
      this.toastCtrl.create({
        message: 'Unable to open camera',
        duration: 2500,
        position: 'bottom'
      }).present();
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Submit AQI Camera Info
  // --------------------------------------------------------------------------------------------------------------------
  onlineAqiCameraSubmit(node) {
    if(this.api.isConnected()){
      let loader = this.loadingCtrl.create({
        spinner: 'ios',
        enableBackdropDismiss: false,
        dismissOnPageChange: true,
        showBackdrop: true
      });

      let params = {
        uid: this.ac_submission.email,
        name: this.ac_submission.name,
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
        reading: this.ac_submission.reading,
        comment: this.ac_submission.comment,
        photo: this.ac_submission.photo,
        api: this.api.api_key,
      };

      // let params = {
      //   name: this.ac_submission.email,
      //   lat: this.coordinates.lat,
      //   lng: this.coordinates.lng,
      //   reading: this.ac_submission.reading,
      //   comment: this.ac_submission.comment,
      //   photo: 'https://firebasestorage.googleapis.com/v0/b/airqo-frontend-media.appspot.com/o/app-aqi%2F1582535133583-g2vnz?alt=media&token=2e190c2d-f737-468c-a3d4-e06fa9713b10',
      //   api: this.api.api_key,
      // };

      console.log(params);
      
      loader.present().then(() => {
        this.http.post(this.aqi_camera_api, params).subscribe((result: any) => {
          console.log(result);
          loader.dismiss(); 
  
          if (result.success == '100') {
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
          this.api.networkErrorMessage();
        });
      });
    } else {
      this.toastCtrl.create({
        message: 'Offline',
        duration: 2500,
        position: 'bottom'
      }).present();
    }
  }
}
