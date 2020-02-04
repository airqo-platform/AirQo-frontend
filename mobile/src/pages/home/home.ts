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
  lastest_nearest_node_reading: any = '0';

  menu_popover: any;

  favorite_nodes: any = [];

  get_favorite_nodes_api  = 'https://airqo.net/Apis/airqoPlaceLatest';
  favorite_nodes_api_success: any
  
  get_nearest_node_api    = 'https://airqo.net/Apis/airqoNearest';
  nearest_node_api_success: any;

  get_coordinates_api    = 'https://buzentech.com/get-info.php';


  constructor(private navCtrl: NavController, private storage: Storage, private http: HttpClient, private loadingCtrl: LoadingController, 
    private alertCtrl: AlertController, private toastCtrl: ToastController, private geolocation: Geolocation, private platform: Platform, 
    private device: Device, private popoverCtrl: PopoverController, private modalCtrl: ModalController, public api: ApiProvider) {
      
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires everytime page loads
  // --------------------------------------------------------------------------------------------------------------------
  async ionViewDidEnter() {
    await this.getUserInfo();
    this.getLocation();
  }


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
  async offlineLoadFavorites() {
    await this.storage.get('favorites').then((val) => {
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
    let options = {
      timeout: 20000, 
      enableHighAccuracy: true
    };

    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition(options).then((pos) => {
        let params = {
          api: this.api.api_key,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        this.getNearestNodeReading(params);
      }).catch((error) => {
        console.log('Error getting location: ', error);
        this.toastCtrl.create({
          message: error.message,
          duration: 5000,
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
        let params = {
          api: this.api.api_key,
          lat: result.message.lat,
          lng: result.message.lon,
        };
  
        this.getNearestNodeReading(params);
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get Nearest Node Reading
  // --------------------------------------------------------------------------------------------------------------------
  getNearestNodeReading(params) {
    if(this.api.isConnected()){
      console.info(params);

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
            this.nearest_node                   = result;
            this.lastest_nearest_node_reading   = this.nearest_node.lastfeeds.field1;
            this.nearest_node.date              = (new Date().toISOString());
            this.storage.set("nearest_node", this.nearest_node);

            console.log(this.nearest_node);
            console.log(this.lastest_nearest_node_reading);
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
  async onlineLoadFavoritesNodesReadings(favorite_nodes) {
    this.favorite_nodes = [];

    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    await loader.present().then(() => {
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
                feeds: result.nodes[0].lastfeeds,
              };
              this.favorite_nodes.push(node);

              this.storage.get('favorites_readings').then((val) => {
                if(val && val != null && val != '' && val.length > 0) {
                  val = this.favorite_nodes;
                  this.storage.set("favorites_readings", val);
                }
              });
            }
          });
        }
        loader.dismiss();
        if(this.favorite_nodes.length > favorite_nodes.length){
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
        console.log("----------------------------------------------------------------------------------------");
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
    this.navCtrl.push(FavoritesPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Add Place/Node from favorites list
  // --------------------------------------------------------------------------------------------------------------------
  openAddFavorites() {
    let modal = this.modalCtrl.create(AddPlacePage);
    modal.onDidDismiss(() => {
      this.offlineLoadFavorites();
    });
    modal.present();
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
