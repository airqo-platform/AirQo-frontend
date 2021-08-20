import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home'
import { IntroPage } from '../intro/intro'
@Component({
  selector: 'page-loading',
  templateUrl: 'loading-page.html',
})
export class LoadingPage {

  sliderOptions = {
    pager: true,
    onlyExternal: true
    }

  constructor(private storage: Storage, private navCtrl: NavController) {
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {
    
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
  }


  ngOnInit(){
    this.storage.get('first_use').then((val) => {
      if(val && val != '') {
        this.goToHomePage();
      }
      else {
        this.goToIntroPage();
      }
    });
  }

  goToHomePage(){
    this.storage.set('first_use', '1');
    this.navCtrl.push(HomePage);
  }

  goToIntroPage(){
    this.storage.set('first_use', '1');
    this.navCtrl.push(IntroPage);
  }

}
