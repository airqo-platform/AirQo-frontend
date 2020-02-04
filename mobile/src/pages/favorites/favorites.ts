import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AddPlacePage } from '../add-place/add-place';
import { NodePage } from '../node/node';

@Component({
  selector: 'page-favorites',
  templateUrl: 'favorites.html',
})
export class FavoritesPage {

  nodes: any = [];

  display_message: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController, private toastCtrl: ToastController, 
    private alertCtrl: AlertController, private storage: Storage,) {
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {}


  // --------------------------------------------------------------------------------------------------------------------
  // Fires everytime page loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {
    this.offlineLoadFavorites();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - Load favorites list
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadFavorites() {
    this.storage.get('favorites').then((val) => {
      if(val && val != null && val != '' && val.length > 0) {
        this.nodes = val;
      } else {
        this.display_message = "No Favorites";
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
  // Remove Place/Node from favorites list
  // --------------------------------------------------------------------------------------------------------------------
  removeFavorite(event: Event, node) {
    event.stopPropagation();

    this.alertCtrl.create({
      title: 'Remove!',
      message: 'Are you sure you would like to remove this place from your favorites?',
      buttons: [
        {
          text: 'No',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.get('favorites').then((val) => {
              if(val && val != null && val != '' && val.length > 0) {
                if(val.filter(item => item.channel_id === node.channel_id).length != 0){
                  for(let i = 0; i < val.length; i++) {
                    if(val[i].channel_id == node.channel_id) {
                      val.splice(i, 1);
                      this.storage.set("favorites", val);
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
      ]
    }).present();
  }

}
