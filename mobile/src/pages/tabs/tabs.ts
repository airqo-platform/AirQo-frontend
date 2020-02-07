import { Component } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';

import { HomePage } from '../home/home';
import { MapPage } from '../map/map';
import { NewsPage } from '../news/news';
import { AboutPage } from '../about/about';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = MapPage;
  tab3Root = NewsPage;
  tab4Root = AboutPage;

  show_button: boolean = true;

  constructor(public modalCtrl : ModalController, public viewCtrl: ViewController) {

  }


  // --------------------------------------------------------------------------------------------------------------------
  // Display Color Key Modal
  // --------------------------------------------------------------------------------------------------------------------
  showKey(){
    this.show_button = false; 
    const modal = this.modalCtrl.create('KeyModalPage');

    modal.onDidDismiss(data => {
      setTimeout(() => this.show_button = true, 330);
    });

    modal.present();
  }
  
}
