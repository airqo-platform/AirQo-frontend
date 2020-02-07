import { HomePage } from './../home/home';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Slides } from 'ionic-angular';

@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {

  @ViewChild(Slides) slides: Slides;

  constructor(private navCtrl: NavController, private navParams: NavParams, private storage: Storage) {
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() { }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Previous Slide
  // --------------------------------------------------------------------------------------------------------------------
  previousSlide() {
    this.slides.slidePrev(500);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Next Slide
  // --------------------------------------------------------------------------------------------------------------------
  nextSlide() {
    this.slides.slideNext(500);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To HomePage
  // --------------------------------------------------------------------------------------------------------------------
  goToHomePage(){
    this.storage.set('intro_page', '1');
    this.navCtrl.push(HomePage);
  }

}
