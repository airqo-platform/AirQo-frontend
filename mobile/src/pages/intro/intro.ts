import { HomePage } from './../home/home';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Slides } from 'ionic-angular';

@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {

  @ViewChild(Slides) slides: Slides;

  constructor(private navCtrl: NavController, private storage: Storage) {
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
        this.storage.set('first_use', true);
      }
    });
  }


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
    this.storage.set('first_use', '1');
    this.navCtrl.push(HomePage);
  }

}
