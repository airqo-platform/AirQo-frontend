import { AddNodeSubscriptionPage } from './../add-node-subscription/add-node-subscription';
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';

import { NodePage } from '../node/node';
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-daily-reports',
  templateUrl: 'daily-reports.html',
})
export class DailyReportsPage {

  user: any = {};

  nodes: any = [];

  display_message: any;

  unsubscribe_api = 'https://airqo.net/Apis/airqoSubscribeDailyReports';

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController, private toastCtrl: ToastController, 
    private alertCtrl: AlertController, private storage: Storage, private loadingCtrl: LoadingController, private api: ApiProvider,
    private http: HttpClient, ) {
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
    this.offlineLoadSubscriptions();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page is about to enter and become the active page
  // --------------------------------------------------------------------------------------------------------------------
  ionViewWillEnter() {}


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
  // Offline - Load Subscriptions
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadSubscriptions() {
    this.storage.get('subscribed_nodes').then((val) => {
      if(val && val != null && val != '' && val.length > 0) {
        this.nodes = val;
      } else {
        this.display_message = "No Subscriptions";
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go to Node Details page
  // --------------------------------------------------------------------------------------------------------------------
  viewDetails(node) {
    this.navCtrl.push(NodePage, {
      node: node
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Add Node to subscription list
  // --------------------------------------------------------------------------------------------------------------------
  openAddSubscription() {
    this.modalCtrl.create(AddNodeSubscriptionPage).present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Remove Node from subscription list
  // --------------------------------------------------------------------------------------------------------------------
  removeSubscription(event: Event, node) {
    event.stopPropagation();

    this.alertCtrl.create({
      title: 'Remove!',
      message: 'Are you sure you would like to remove this node from your subscriptions?',
      buttons: [
        {
          text: 'No',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.onlineUnSubscribeNode(node);
          }
        }
      ]
    }).present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Unsubscribe node from daily report
  // --------------------------------------------------------------------------------------------------------------------
  onlineUnSubscribeNode(node) {
    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    let params = {
      user: this.user.uid,
      state: 'deleted',
      node: node.channel_id,
      api: this.api.api_key,
    };
    
    loader.present().then(() => {
      this.http.post(this.unsubscribe_api, params).subscribe((result: any) => {
        console.log(result);
        loader.dismiss(); 

        if (result.success == '100') {
          this.offlineUnSubscribeNode(node);
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
  // Offline - Unsubscribe node from daily report
  // --------------------------------------------------------------------------------------------------------------------
  offlineUnSubscribeNode(node) {
    this.storage.get('subscribed_nodes').then((val) => {
      if(val && val != null && val != '' && val.length > 0) {
        if(val.filter(item => item.channel_id === node.channel_id).length != 0){
          for(let i = 0; i < val.length; i++) {
            if(val[i].channel_id == node.channel_id) {
              val.splice(i, 1);
              this.storage.set("subscribed_nodes", val);
              this.nodes = val;

              this.toastCtrl.create({
                message: 'Removed',
                duration: 2000,
                position: 'bottom'
              }).present();
            }
          }
        }
      } else {
        this.toastCtrl.create({
          message: 'Unable to remove node',
          duration: 2000,
          position: 'bottom'
        }).present();
      }
    });
  }

}