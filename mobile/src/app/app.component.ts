import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Storage } from '@ionic/storage';

import { TabsPage } from '../pages/tabs/tabs';
import { IntroPage } from '../pages/intro/intro';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public storage: Storage) {
    
    platform.ready().then(() => {

    // Platform and plugins are ready and available.
    statusBar.styleDefault();
    splashScreen.hide();

    // ***** USED FOR TESTING *****
    // this.storage.remove('node_list');
    // this.storage.remove('node_info');
    // this.storage.remove('about_list');
    // this.storage.remove('news_list');
    // this.storage.remove('last_refresh_date');
    // this.storage.remove('view_intro_page');

    // One Signal Notifications
    var notificationOpenedCallback = function(jsonData) {
      console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      if (jsonData.notification.payload.additionalData != null) {
      console.log("Here we access addtional data");
      if (jsonData.notification.payload.additionalData.openURL != null) {
        console.log("Here we access the openURL sent in the notification data");
      }
      }
    };
  
    // Implement One Signal notifications for AirQo
     window["plugins"].OneSignal
        .startInit("302cd33b-27ea-4035-8fd7-ba14eed9ff89")
        .inFocusDisplaying(window["plugins"].OneSignal.OSInFocusDisplayOption.Notification)
        .handleNotificationOpened(notificationOpenedCallback)
      .endInit();

      // Check to see if its the user's first time to use the app
      this.storage.get('view_intro_page').then((val) => {
        if(val == '0') {
          this.rootPage = TabsPage;
        } else {
          this.rootPage = IntroPage;
        }
      });
    });
  }
}
