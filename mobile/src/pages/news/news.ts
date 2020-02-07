import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { RestProvider } from '../../providers/rest/rest';

import { NewsDetailsPage } from '../../pages/news-details/news-details';

@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {

  news: any;
  refresh: number = 0;

  api_url  = 'http://airqo.net/apis/ios/ver3.0/news.php';

  constructor(public navCtrl: NavController, public navParams: NavParams, public restProvider: RestProvider, 
    public storage: Storage) { }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads:
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.restProvider.show_skeleton = 1;
    this.getNews();
  }

  // --------------------------------------------------------------------------------------------------------------------
  // Everytime the view is entered
  // --------------------------------------------------------------------------------------------------------------------
  ionViewCanEnter() {
    if(this.restProvider.show_skeleton == 0) {
      this.restProvider.show_refresh = 1;
    } else {
      this.restProvider.show_refresh = 0;
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get news list
  // --------------------------------------------------------------------------------------------------------------------
  getNews() {
    this.restProvider.getData(this.api_url).then((data: any) => {
      if(data != null) {
        this.news = data.news;
        this.storage.set('news_list', this.news);

        setTimeout(() => {
          this.restProvider.show_skeleton = 0;
        }, 500);
      } else {
        this.storage.get('news_list').then((val) => {
          if(val != null) {
            this.news = val.news;
          } else {
            this.restProvider.showToast('Please check your internet connection', 'center', 5);
          }
        });
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Load the 'Pull to refresh'
  // --------------------------------------------------------------------------------------------------------------------
  doRefresh(refresher) {
    this.restProvider.show_refresh = 1;
    this.restProvider.show_skeleton= 0;
    this.getNews();

    setTimeout(() => {
      refresher.complete();
    }, 10000);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go to News Details page
  // --------------------------------------------------------------------------------------------------------------------
  goToDetailsPage(article){
    this.navCtrl.push(NewsDetailsPage, {
      article: article
    });
  }

}