import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, ModalController, AlertController, ToastController, Searchbar} from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AddPlacePage } from '../add-place/add-place';
import { NodePage } from '../node/node';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'page-favorites',
  templateUrl: 'favorites.html',
})
export class FavoritesPage {

  nodes: any = [];

  display_message: any;

  @ViewChild('mySearchbar') searchbar: Searchbar;

  textInput = new FormControl('');

  holding_array_nodes: any = [];
  temp_array_nodes: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController, private toastCtrl: ToastController, 
    private alertCtrl: AlertController, private storage: Storage,) {

    this.textInput
        .valueChanges
        .debounceTime(500)
        .subscribe((value) => {
          this.searchNodesList(value);
        });

  }

  // --------------------------------------------------------------------------------------------------------------------
  // Search Nodes List
  // --------------------------------------------------------------------------------------------------------------------
  searchNodesList(search_term) {
    this.nodes = this.holding_array_nodes;
    if (search_term && search_term.trim() != '') {
      this.nodes = this.temp_array_nodes = this.nodes.filter((item) => {
        return (item.name.toLowerCase().indexOf(search_term.toLowerCase()) > -1);
      });
    }
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
        this.holding_array_nodes = this.nodes;
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
      title: 'Confirm!',
      message: `Are you sure you would like to remove ${node.name} from your places?`,
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
                        message: `${node.name} has been removed from your places`,
                        duration: 2000,
                        position: 'bottom'
                      }).present();
                    }
                  }
                }
              } else {
                this.toastCtrl.create({
                  message: `Unable to remove ${node.name}`,
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
