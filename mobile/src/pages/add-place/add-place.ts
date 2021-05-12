import { FavoritesPage } from './../favorites/favorites';
import { NavController, NavParams, ToastController, ViewController, LoadingController, AlertController, Searchbar } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {

  @ViewChild('mySearchbar') searchbar: Searchbar;
  
  user: any = {};
  
  nodes: any = [];
  temp_array_nodes: any = [];
  holding_array_nodes: any = [];
  favorite_nodes: any = [];

  textInput = new FormControl('');

  get_places_nodes_list_api = `${this.api.api_endpoint}/airqoPlacesCached`;
  places_nodes_list_api_success: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController, private http: HttpClient, 
    private alertCtrl: AlertController, private api: ApiProvider,) {
      this.textInput
      .valueChanges
      .debounceTime(500)
      .subscribe((value) => {
        this.searchNodesList(value);
      });
  }

  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.onlineLoadNodes();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires every time page loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {
    
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Load Nodes from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineLoadNodes() {
    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: true,
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
          this.holding_array_nodes = this.nodes;
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
    this.storage.get("nodes").then((val) => {
      if(val != null && val != '' && val.length > 0) {
        this.nodes = val;
        this.holding_array_nodes = this.nodes;
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
  // Add Node to favorites list
  // --------------------------------------------------------------------------------------------------------------------
  addToFavoritesList(node) {
    console.log(node);

    let nodeToAdd = {
      channel_id: node.channel_id,
      name: node.name,
      time: node.time,
      location: node.location,
      lat: node.lat,
      lng: node.lng,
      refreshed: node.time,
      field1: node.field2,
    };

    this.storage.get('favorites').then((val) => {
      let nodes = [];
      if(val && val != '' && val.length > 0) {
        if(val.filter(item => item.channel_id === node.channel_id).length != 0){
          this.toastCtrl.create({
            message: `${ node.name } is already among your places`,
            duration: 2000,
            position: 'bottom'
          }).present();
          this.removeSingleNodeFromList(node);
        }
        else {

          // an_type: "Commercial area"
          // channel_id: "912223"
          // churl: "OTEyMjIz"
          // field2: "51.37"
          // lat: "0.34167400"
          // lng: "32.63530600"
          // location: "Banda Industrial Area, Kampala"
          // name: "Banda (Industrial), Kampala"
          // time: "2021-05-11T14:00:16Z"

          console.log(nodeToAdd);



          val.push(this.api.nodeToStorage(nodeToAdd));
          this.storage.set('favorites', val);
          this.removeSingleNodeFromList(node);

          this.searchbar.clearInput(null);

          this.alertCtrl.create({
            message: `${ node.name } has been added to your Places.`,
            buttons: [{
              text: 'Add Another',
              handler: () => { }
            },{
              text: 'Go To My Places',
              handler: () => {
                this.navCtrl.push(FavoritesPage);
              }
            }]
          }).present();
        }
      } else {

        nodes.push(this.api.nodeToStorage(nodeToAdd));
        this.storage.set('favorites', nodes);
        this.removeSingleNodeFromList(node);

        this.searchbar.clearInput(null);

        this.alertCtrl.create({
          message:  `${ node.name } has been added to your to your Places.`,
          buttons: [{
            text: 'Add Another',
            handler: () => { }
          },{
            text: 'Go To My Places',
            handler: () => {
              this.navCtrl.push(FavoritesPage);
            }
          }]
        }).present();
      }
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
  // Close Modal
  // --------------------------------------------------------------------------------------------------------------------
  closeModal() {
    this.storage.get('favorites').then((val) => {
      if(val && val != null && val != '' && val.length > 0) {
        this.viewCtrl.dismiss();
      } else {
        this.toastCtrl.create({
          message: 'Please add a place',
          duration: 2000,
          position: 'bottom'
        }).present();
      }
    });
  }
}
