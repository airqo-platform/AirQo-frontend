import { NavController, NavParams, ToastController, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {

  user: any = {};
  
  nodes: any = [];
  favorite_nodes: any = [];

  get_places_nodes_list_api = 'https://test.airqo.net/Apis/airqoPlaces';
  places_nodes_list_api_success: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController, private http: HttpClient, 
    private alertCtrl: AlertController, private api: ApiProvider,) {
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
    if(this.api.isConnected()){
      this.onlineLoadNodes();
    } else {
      this.offlineLoadNodes();
    }
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
  // Online - Load Nodes from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineLoadNodes() {
    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    let params = {
      api: this.api.api_key
    };
    
    loader.present().then(() => {
      this.http.post(this.get_places_nodes_list_api, params).subscribe((result: any) => {
        console.log(result);
        loader.dismiss(); 

        this.places_nodes_list_api_success = result.success;
        if (result.success == '100') {
          this.nodes = result.nodes;
          this.offlineStoreNodes();
        } else {
          this.offlineLoadNodes();
          this.alertCtrl.create({
            title: result.title,
            message: result.message,
            buttons: ['Okay']
          }).present();
        }
      }, (err) => {
        this.offlineLoadNodes();
        loader.dismiss();
        this.toastCtrl.create({
          message: 'Network Error',
          duration: 2500,
          position: 'bottom'
        }).present();
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - store nodes offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineStoreNodes() {
   this.storage.set("nodes", this.nodes);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - retrieve nodes offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadNodes() {
    this.storage.get("nodes").then((val) => {
      if(val != null && val != '' && val.length > 0) {
        this.nodes = val;
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
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Remove single node from list
  // --------------------------------------------------------------------------------------------------------------------
  removeSingleNodeFromList(node) {
    if(this.nodes.filter(item => item.channel_id === node.channel_id).length != 0){
      for(let i = 0; i < this.nodes.length; i++) {
        if(this.nodes[i].channel_id == node.channel_id) {
          this.nodes.splice(i, 1);
        }
      }
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // TODO: Remove array of favorites nodes from list
  // --------------------------------------------------------------------------------------------------------------------
  removeMultipleNodesFromList() {
    this.nodes = this.nodes.filter((item) => !this.favorite_nodes.includes(item));
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Add Node to favorites list
  // --------------------------------------------------------------------------------------------------------------------
  addToFavoritesList(node) {
    this.storage.get('favorites').then((val) => {
      let nodes = [];
      if(val && val != null && val != '' && val.length > 0) {
        if(val.filter(item => item.channel_id === node.channel_id).length != 0){
          this.toastCtrl.create({
            message: 'Place already added',
            duration: 2000,
            position: 'bottom'
          }).present();
          this.removeSingleNodeFromList(node);
        } else {
          val.push(node);
          this.storage.set('favorites', val);
          this.removeSingleNodeFromList(node);

          this.toastCtrl.create({
            message: 'Added',
            duration: 2000,
            position: 'bottom'
          }).present();
        }
      } else {
        nodes.push(node);
        this.storage.set('favorites', nodes);
        this.removeSingleNodeFromList(node);

        this.toastCtrl.create({
          message: 'Added',
          duration: 2000,
          position: 'bottom'
        }).present();
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Close Modal
  // --------------------------------------------------------------------------------------------------------------------
  closeModal() {
    this.viewCtrl.dismiss();
  }
}
