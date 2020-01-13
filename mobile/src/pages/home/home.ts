import { SearchPage } from './../search/search';
import { FavoritesPage } from './../favorites/favorites';
import { AddPlacePage } from './../add-place/add-place';
import { MenuPage } from './../menu/menu';
import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, Platform, PopoverController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { HttpClient } from '@angular/common/http';
import { Device } from '@ionic-native/device';
import { NodePage } from '../node/node';
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  user: any = {};
  nearest_node: any = {};

  menu_popover: any;

  favorite_nodes: any = [];

  get_favorite_nodes_api  = 'https://test.airqo.net/Apis/airqoPlaceLatest';
  favorite_nodes_api_success: any
  
  get_nearest_node_api    = 'https://test.airqo.net/Apis/airqoNearest';
  nearest_node_api_success: any;


  constructor(private navCtrl: NavController, private storage: Storage, private http: HttpClient, private loadingCtrl: LoadingController, 
    private alertCtrl: AlertController, private toastCtrl: ToastController, private geolocation: Geolocation, private platform: Platform, 
    private device: Device, private popoverCtrl: PopoverController, private modalCtrl: ModalController, public api: ApiProvider) {
    this.getLocation();
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
  ionViewDidEnter() {}


  // --------------------------------------------------------------------------------------------------------------------
  // Get User's info
  // --------------------------------------------------------------------------------------------------------------------
  getUserInfo() {
    this.storage.get('user_data').then((val) => {
      if(val && val != null && val != '') {
        this.user = val;
        this.offlineLoadFavorites();
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - Load favorites list
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadFavorites() {
    this.storage.get('favorites').then((val) => {
      if(val && val != null && val != '' && val.length > 0) {
        this.favorite_nodes = val;
        if(this.api.isConnected()) {
          this.onlineLoadFavoritesNodesReadings(val);
        } else {
          this.offlineLoadFavoritesNodesReadings();
        }
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get Location
  // --------------------------------------------------------------------------------------------------------------------
  getLocation() {
    // this.platform.ready().then(() => {
    //   this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((pos) => {
    //     let params = {
          // api: this.api.api_key,
    //       lat: pos.coords.latitude,
    //       lng: pos.coords.longitude,
    //     };

    //     this.getNearestNodeReading(params);
    //   }).catch((error) => {
    //     console.log('Error getting location: ', error);
    //     this.toastCtrl.create({
    //       message: error.message,
    //       duration: 3000,
    //       position: 'bottom'
    //     }).present();
    //   });
    // });

    let params = {
      api: this.api.api_key,
      lat: 0.283670,
      lng: 32.600399,
    };

    this.getNearestNodeReading(params);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get Nearest Node Reading
  // --------------------------------------------------------------------------------------------------------------------
  getNearestNodeReading(params) {
    if(this.api.isConnected()){
      let loader = this.loadingCtrl.create({
        spinner: 'ios',
        enableBackdropDismiss: false,
        dismissOnPageChange: true,
        showBackdrop: true
      });
      
      loader.present().then(() => {
        this.http.post(this.get_nearest_node_api, params).subscribe((result: any) => {
          console.log(result);
          loader.dismiss();
  
          this.nearest_node_api_success = result.success;
          if (result.success == '100') {
            this.nearest_node       = result;
            this.nearest_node.date  = (new Date().toISOString());
            this.storage.set("nearest_node", this.nearest_node);
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
            duration: 2500,
            position: 'bottom'
          }).present();
        });
      });
    } else {
      this.storage.get('nearest_node').then((val) => {
        if(val && val != null && val != '' && val.length > 0) {
          this.nearest_node = val;
          this.nearest_node_api_success = "100";
        }
      });
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Load Favorites Nodes Readings from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineLoadFavoritesNodesReadings(favorite_nodes) {
    this.favorite_nodes = [];

    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });
    loader.present().then(() => {
      if(favorite_nodes.length > 0) {
        for(let i = 0; i < favorite_nodes.length; i++){
          let params = {
            api: this.api.api_key,
            channel: favorite_nodes[i].channel_id,
          };
  
          this.http.post(this.get_favorite_nodes_api, params).subscribe((result: any) => {
            console.log(result);
            console.log(result.nodes[0]);
            console.log(result.nodes[0].lastfeeds);

            if (result.success == '100') {
              let node = {
                channel_id: favorite_nodes[i].channel_id,
                name: favorite_nodes[i].name,
                location: favorite_nodes[i].location,
                refreshed: this.api.getCurrentDateTime(),
                feeds: result.nodes[0].lastfeeds
              };
              this.favorite_nodes.push(node);

              if(i == favorite_nodes.length) {
                this.storage.set("favorites_readings", this.favorite_nodes);
              }
            }
          });
        }
        loader.dismiss();
        if(this.favorite_nodes > favorite_nodes.length){
          this.favorite_nodes.length > 0? this.favorite_nodes_api_success = '100': this.favorite_nodes_api_success = null;
        }
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - Load favorites readings
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadFavoritesNodesReadings() {
    this.storage.get('favorites_readings').then((val) => {
      if(val && val != null && val != '' && val.length > 0) {
        this.favorite_nodes = val;
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Search Page
  // --------------------------------------------------------------------------------------------------------------------
  goToSearchPage() {
    this.modalCtrl.create(SearchPage).present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Favorites Page
  // --------------------------------------------------------------------------------------------------------------------
  goToFavoritesPage() {
    // if(this.user.uid)
    this.navCtrl.push(FavoritesPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Add Place/Node from favorites list
  // --------------------------------------------------------------------------------------------------------------------
  openAddFavorites() {
    this.modalCtrl.create(AddPlacePage).present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Stacked Menu
  // --------------------------------------------------------------------------------------------------------------------
  stackedMenu(event) {
    this.menu_popover = this.popoverCtrl.create(MenuPage).present({ev: event});
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Remove Menu Pop Over
  // --------------------------------------------------------------------------------------------------------------------
  removePopOver() {
    // this.menu_popover.hide();    
  }


  // --------------------------------------------------------------------------------------------------------------------
  // View Node Details
  // --------------------------------------------------------------------------------------------------------------------
  viewDetails(node) {
    this.navCtrl.push(NodePage, {
      node: node
    });
  }

}
