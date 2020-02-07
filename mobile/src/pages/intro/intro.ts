import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Slides } from 'ionic-angular';


// import { HomePage } from '../home/home';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {

  @ViewChild(Slides) slides: Slides;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage) {
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    console.log('ionViewDidLoad IntroPage');
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Next Slide
  // --------------------------------------------------------------------------------------------------------------------
  nextSlide(slide) {
    this.slides.slideTo(slide, 500);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To HomePage
  // --------------------------------------------------------------------------------------------------------------------
  goToHomePage(){
    this.storage.set('view_intro_page', '0');
    this.navCtrl.push(TabsPage);
  }

}
