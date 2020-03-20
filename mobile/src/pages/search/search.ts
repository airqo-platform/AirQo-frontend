import { ApiProvider } from './../../providers/api/api';
import { NavController, NavParams, ToastController, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';

import { NodePage } from '../node/node';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  user: any = {};

  nodes: any = [];

  textInput = new FormControl('');

  search_nodes_api  = 'https://test-dot-airqo-frontend.appspot.com/Apis/airqoSearchPlaces';
  search_nodes_api_success: any
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController, private api: ApiProvider, private loadingCtrl: LoadingController, private http: HttpClient,
    private alertCtrl: AlertController,) {
      this.textInput
      .valueChanges
      .debounceTime(1000)
      .subscribe((value) => {
        this.onlineSearchNodes(value);
      });
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
  // Add Node to favorites list
  // --------------------------------------------------------------------------------------------------------------------
  addToFavoritesList(node, $event) {
    $event.stopPropagation();
    $event.preventDefault();

    this.alertCtrl.create({
      title: 'ADD TO FAVORITES',
      message: 'Add node to favorites?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Add',
          handler: () => {
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
        }
      ]
    }).present();
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
  // Online - Search Nodes from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineSearchNodes(search_key) {
    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    let params = {
      key: search_key,
      api: this.api.api_key
    };
    
    loader.present().then(() => {
      this.http.post(this.search_nodes_api, params).subscribe((result: any) => {
        console.log(result);
        loader.dismiss(); 

        this.search_nodes_api_success = result.success;
        if (result.success == '100') {
          this.nodes = result.nodes;
          this.offlineStoreNodes();
        } else {
          this.toastCtrl.create({
            message: result.message,
            duration: 2000,
            position: 'bottom'
          }).present();
        }
      }, (err) => {
        loader.dismiss();
        this.api.networkErrorMessage();
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
    this.storage.get("nodes").then((content) => {
      if(content != null && content != '' && content.length > 0) {
        this.nodes = content;
      }
    });
   }



  // --------------------------------------------------------------------------------------------------------------------
  // Load Search Items
  // --------------------------------------------------------------------------------------------------------------------
  searchList(search_term) {
   
  }


  // --------------------------------------------------------------------------------------------------------------------
  // View Node details
  // --------------------------------------------------------------------------------------------------------------------
  viewDetails(node) {
    this.navCtrl.push(NodePage, {
      node: node
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Close Modal
  // --------------------------------------------------------------------------------------------------------------------
  closeModal() {
    this.viewCtrl.dismiss();
  }
}
