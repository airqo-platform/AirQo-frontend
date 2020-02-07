import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';

import { NodeDetailsPage } from '../node-details/node-details';
import { RestProvider } from '../../providers/rest/rest';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  class: any = {};
  nodes: any;
  search_nodes: any;

  api_url = 'http://airqo.net/apis/ios/ver3.0/nodes.php';

  last_refresh_date: string;
  last_refresh_date_words: string = '';
  last_refreshed: String;

  search_term: string = '';
  search_control: FormControl;
  searching: any = false;

  constructor(public navCtrl: NavController, public restProvider: RestProvider, public storage: Storage,
    public modalCtrl: ModalController) {

    this.restProvider.show_skeleton = 1;
    this.getNodeReadings();
    this.restProvider.displayNetworkUpdate();
    this.search_control = new FormControl();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: 
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.storage.get('node_list').then((val) => {
      if(val && val != null && val != '') {
        this.nodes = val;
        this.search_nodes = val;

        this.setFilteredItems();
        this.search_control.valueChanges.debounceTime(700).subscribe(search => {
          this.searching = false;
          this.setFilteredItems();
        });
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Once the array has been filtered, replace existing array
  // --------------------------------------------------------------------------------------------------------------------
  setFilteredItems() {
    this.nodes = this.filterItems(this.search_term);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Filter using the array of nodes using search_term
  // --------------------------------------------------------------------------------------------------------------------
  filterItems(search_term) {
    return this.search_nodes.filter((node) => {
      return (node.name.toLowerCase().indexOf(search_term.toLowerCase()) > -1);
    });
  }

  // --------------------------------------------------------------------------------------------------------------------
  // Everytime the view is entered
  // --------------------------------------------------------------------------------------------------------------------
  ionViewCanEnter() {
    if (this.restProvider.show_skeleton == 0) {
      this.restProvider.show_refresh = 1;
    } else {
      this.restProvider.show_refresh = 0;
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get nodes list
  // --------------------------------------------------------------------------------------------------------------------
  getNodeReadings() {
    var node_list: any;

    this.restProvider.getData(this.api_url).then(data => {
      if (data) {
        node_list = data;
        this.nodes = node_list.nodes;

        var new_last_refresh_date = new Date().toISOString();
        this.last_refresh_date = this.restProvider.convertDate(new_last_refresh_date);
        this.last_refresh_date_words = 'Last Refreshed on ' + this.last_refresh_date + ' EAT';

        this.storage.set('node_list', this.nodes);
        this.storage.set('last_refresh_date', new_last_refresh_date);

        setTimeout(() => {
          this.restProvider.show_skeleton = 0;
          this.restProvider.show_refresh = 1;
          this.class.nodes_content = "nodes-content-bg";
        }, 500);
        console.log(this.nodes);
      } else {
        this.storage.get('node_list').then((val) => {
          if(val && val != null && val != '') {
            this.nodes = val.nodes;
            this.restProvider.show_skeleton = 0;
            this.restProvider.show_refresh = 1;
          } else {
            this.restProvider.show_no_internet = 1;
            this.restProvider.show_skeleton = 0;
            this.restProvider.show_refresh = 0;
            this.restProvider.showToast('Please check your internet connection', 'center', 5);
          }
        });
      }

    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Display spinner
  // --------------------------------------------------------------------------------------------------------------------
  onSearchInput() {
    this.searching = true;
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Load the 'Pull to refresh'
  // --------------------------------------------------------------------------------------------------------------------
  doRefresh(refresher) {
    this.restProvider.show_refresh = 1;
    this.restProvider.show_skeleton = 0;
    this.getNodeReadings();

    setTimeout(() => {
      refresher.complete();
    }, 10000);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go to Node Details page
  // --------------------------------------------------------------------------------------------------------------------
  goToDetailsPage(node) {
    this.navCtrl.push(NodeDetailsPage, {
      node: node
    });
  }

}
