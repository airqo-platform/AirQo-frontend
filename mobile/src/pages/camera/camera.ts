import { NavController, NavParams, ToastController, ViewController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';

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

  aqi_camera_api = 'https://airqo.net/Apis/airqoAqiCamera';

  get_coordinates_api    = 'https://buzentech.com/get-info.php';

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController, private http: HttpClient, 
    private alertCtrl: AlertController, public api: ApiProvider, private geolocation: Geolocation, private platform: Platform,
    private camera: Camera) {
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
  openCamera(){
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
     let base64Image          = 'data:image/jpeg;base64,' + imageData;
     this.ac_submission.photo   = imageData;
     this.ac_submission.preview = base64Image;
    }, (err) => {
      this.toastCtrl.create({
        message: 'Image not captured',
        duration: 2500,
        position: 'bottom'
      }).present();
    })
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
