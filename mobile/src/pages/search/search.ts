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

  search_nodes_api  = 'https://airqo.net/Apis/airqoSearchPlaces';
  search_nodes_api_success: any
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController, private api: ApiProvider, private loadingCtrl: LoadingController, private http: HttpClient,
    private alertCtrl: AlertController,) {
      this.textInput
      .valueChanges
      .debounceTime(500)
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
