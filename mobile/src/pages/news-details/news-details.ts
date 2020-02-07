import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-news-details',
  templateUrl: 'news-details.html',
})
export class NewsDetailsPage {

  article: any = {};
  current_year: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) { }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: display article information
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.current_year = (new Date()).getFullYear();

    if(this.navParams.get('article')){
      this.article = this.navParams.get('article');
    } else {
      this.navCtrl.pop();
    }
  }

}
