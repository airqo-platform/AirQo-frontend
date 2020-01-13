import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

declare var google;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;

  user: any = {};
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController) {
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: 
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.getUserInfo();
    this.loadMap();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Load the map
  // --------------------------------------------------------------------------------------------------------------------
  loadMap() {
    let latLng = new google.maps.LatLng(0.28367998, 32.59309769);

    let mapOptions = {
      center: latLng,
      // disableDefaultUI: true,
      zoom: 6,
      zoomControl : true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      panControl : true,
      mapTypeControl: false,
      overviewMapControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      scaleControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
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
  // Load Nodes from online
  // --------------------------------------------------------------------------------------------------------------------
  loadNodes() {
    
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Load Search Items
  // --------------------------------------------------------------------------------------------------------------------
  searchList(search_term) {
   
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Add Node to favorites list
  // --------------------------------------------------------------------------------------------------------------------
  addToFavoritesList() {

  }


  // --------------------------------------------------------------------------------------------------------------------
  // Close Modal
  // --------------------------------------------------------------------------------------------------------------------
  closeModal() {
    this.viewCtrl.dismiss();
  }
}