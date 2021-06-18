import { Component } from '@angular/core';
import { NavController, LoadingController, Platform, PopoverController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';

import { NodePage } from '../node/node';
import { SearchPage } from './../search/search';
import { FavoritesPage } from './../favorites/favorites';
import { AddPlacePage } from './../add-place/add-place';
import { MenuPage } from './../menu/menu';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  user: any = {};
  nearest_node: any = {};
  lastest_nearest_node_reading: any = '0';

  menu_popover: any;

  favorite_nodes: any = [];

  get_favorite_nodes_api  = `${this.api.api_endpoint}/airqoPlaceLatest`;
  favorite_nodes_api_success: any
  
  get_nearest_node_api    = `${this.api.api_endpoint}/airqoNearest`;
  nearest_node_api_success: any;

  get_coordinates_api    = `${this.api.external_api_endpoint}/get-info.php`;


  constructor(private navCtrl: NavController, private storage: Storage, private http: HttpClient, private loadingCtrl: LoadingController, 
    private geolocation: Geolocation, private platform: Platform, private popoverCtrl: PopoverController, private modalCtrl: ModalController, 
    public api: ApiProvider,) {
      
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  async ionViewDidLoad() {
    if(this.api.isConnected()){
      this.getLocation();
    }

     await this.offlineLoadFavorites(null);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires every time page loads
  // --------------------------------------------------------------------------------------------------------------------
  async ionViewDidEnter() {
    await this.offlineLoadFavorites(null);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - Load favorites list
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadFavorites(refresher) {

    this.storage.get('favorites').then((val) => {
      if(val && val != '' && val.length > 0) {

        this.favorite_nodes = val;

        console.log('logging favs')
        console.log(this.favorite_nodes);

        if(this.api.isConnected()) {
          this.onlineLoadFavoritesNodesReadings(val, refresher);
        } else {
          if(refresher){
            refresher.complete();
          }
          this.api.offlineMessage();
          this.offlineLoadFavoritesNodesReadings();
        }
      }
      else {
        this.openAddFavorites();
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

      let loader = this.loadingCtrl.create({
        spinner: 'ios',
        enableBackdropDismiss: false,
        dismissOnPageChange: true,
        showBackdrop: true
      });


      this.geolocation.getCurrentPosition(options).then((pos) => {
        let params = {
          api: this.api.api_key,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        loader.dismiss();

        this.getNearestNodeReading(params);
      }).catch((error) => {
        console.log('Error getting location: ', error);
        loader.dismiss();
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
        enableBackdropDismiss: true,
        dismissOnPageChange: true,
        showBackdrop: true
      });

      loader.present().then(() => {
        this.http.post(this.get_nearest_node_api, params).subscribe((result: any) => {
          console.log(result);
          loader.dismiss();
  
          this.nearest_node_api_success = result.success;
          if (result.success == '100') {

            let node = this.api.nodeToStorage({
              channel_id: result.channel_id,
              name: result.name,
              location: result.location,
              lat: result.lat,
              lng: result.lng,
              refreshed: result.lastfeeds.created_at,
              field1: result.lastfeeds.field1,
              feeds: result.lastfeeds,
            });

            this.nearest_node = node;
            this.lastest_nearest_node_reading = node.value;

            this.storage.set("nearest_node", this.nearest_node);

            console.log(this.nearest_node);
            console.log(this.lastest_nearest_node_reading);
          }
        }, (err) => {
          loader.dismiss();
          this.api.networkErrorMessage();
        });
      });
    } else {
      this.storage.get('nearest_node').then((val) => {
        if(val && val != '' && val.length > 0) {
          this.nearest_node = val;
          this.nearest_node_api_success = "100";
        }
      });
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Load Favorites Nodes Readings from online
  // --------------------------------------------------------------------------------------------------------------------
  async onlineLoadFavoritesNodesReadings(nodes, refresher) {

    if(nodes.length > 0) {

      nodes.forEach( (element) => {

        let params = {
          api: this.api.api_key,
          channel: element.channel_id,
        };

        try{
          this.http.post(this.get_favorite_nodes_api, params).subscribe((result: any) => {
            console.log(element.name);
            console.log(result);
            console.log(result.nodes[0].lastfeeds);

            if (result.success == '100') {

              let node = this.api.nodeToStorage({
                channel_id: element.channel_id,
                name: element.name,
                location: element.location,
                lat: element.lat,
                lng: element.lng,
                refreshed: result.nodes[0].lastfeeds.created_at,
                field1: result.nodes[0].lastfeeds.field1,
                feeds: result.nodes[0].lastfeeds,
              });

              const index = this.favorite_nodes.indexOf(element);
              if (index > -1) {

                this.favorite_nodes.splice(index, 1);
                this.favorite_nodes.push(node);
                this.updateOfflineNodesReadings();

              }

            }
          });
        }
        catch (e) {
          console.log(e);
        }

      });

      if(refresher){
        refresher.complete();
      }
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - Load favorites readings
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadFavoritesNodesReadings() {
    // this.favorite_nodes = [];

    this.storage.get('favorites').then((val) => {
      if(val && val != '' && val.length > 0) {

        this.favorite_nodes = val;

        console.log(this.favorite_nodes);
      }
    });
  }

  // --------------------------------------------------------------------------------------------------------------------
  // Update offline readings
  // --------------------------------------------------------------------------------------------------------------------
  updateOfflineNodesReadings() {
    this.storage.set("favorites", this.favorite_nodes);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Search Page
  // --------------------------------------------------------------------------------------------------------------------
  goToSearchPage() {
    let modal = this.modalCtrl.create(SearchPage);
    modal.onDidDismiss(() => {
      this.offlineLoadFavorites(null);
    });
    modal.present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To My places Page
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
      this.offlineLoadFavorites(null);
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
    console.log(node);
    this.navCtrl.push(NodePage, {
      node: node
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // View Node Details
  // --------------------------------------------------------------------------------------------------------------------
  viewLocationDetails() {
    console.log(this.nearest_node);
    // this.navCtrl.push(NodePage, {
    //   node: this.nearest_node
    // });
  }
}
