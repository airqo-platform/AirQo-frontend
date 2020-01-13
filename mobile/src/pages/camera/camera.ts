import { NavController, NavParams, ToastController, ViewController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Component, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';
import { Geolocation } from '@ionic-native/geolocation';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';

@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {

  user: any = {};
  coordinates: any = {};
  ac_submission: any = {};

  nodes: any = [];
  favorite_nodes: any = [];

  aqi_camera_api = 'https://test.airqo.net/Apis/airqoAqiCamera';

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController, private http: HttpClient, 
    private alertCtrl: AlertController, private api: ApiProvider, private geolocation: Geolocation, private platform: Platform,
    private cameraPreview: CameraPreview, private zone: NgZone,) {
  }

  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.getUserInfo();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Start Camera Preview
  // --------------------------------------------------------------------------------------------------------------------
  startCamera(){
    const cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: 'rear',
      tapPhoto: true,
      previewDrag: true,
      toBack: true,
      alpha: 1
    };
    
    this.cameraPreview.startCamera(cameraPreviewOpts).then((res) => {
      console.log(res);
    }, (err) => {
      console.log(err);
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires everytime page loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((pos) => {
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
      });
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
  // Online - Submit
  // --------------------------------------------------------------------------------------------------------------------
  onlineAqiCamera(node) {
    if(this.api.isConnected()){
      let loader = this.loadingCtrl.create({
        spinner: 'ios',
        enableBackdropDismiss: false,
        dismissOnPageChange: true,
        showBackdrop: true
      });
  
      let params = {
        uid: this.user.uid,
        name: this.ac_submission.name,
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
        readidng: this.ac_submission.reading,
        comment: this.ac_submission.comment,
        photo: this.ac_submission.photo,
        api: this.api.api_key,
      };
      
      loader.present().then(() => {
        this.http.post(this.aqi_camera_api, params).subscribe((result: any) => {
          console.log(result);
          loader.dismiss(); 
  
          this.alertCtrl.create({
            title: result.title,
            message: result.message,
            buttons: ['Okay']
          }).present();
        }, (err) => {
          loader.dismiss();
          this.toastCtrl.create({
            message: 'Network Error',
            duration: 2500,
            position: 'bottom'
          }).present();
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
