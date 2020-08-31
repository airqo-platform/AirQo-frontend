import { HomePage } from './../pages/home/home';
import { IntroPage } from './../pages/intro/intro';
import { Component } from '@angular/core';
import { Platform, AlertController, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { OneSignal } from '@ionic-native/onesignal';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  
  constructor(app: App, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage, device: Device, 
    alertCtrl: AlertController, oneSignal: OneSignal) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();

      if(device.platform){
        let iosSettings = {};
        iosSettings["kOSSettingsKeyAutoPrompt"]     = true;
        iosSettings["kOSSettingsKeyInAppLaunchURL"] = false;
        oneSignal.startInit('302cd33b-27ea-4035-8fd7-ba14eed9ff89', '1093508119261').iOSSettings(iosSettings);

        oneSignal.inFocusDisplaying(oneSignal.OSInFocusDisplayOption.InAppAlert);
        oneSignal.handleNotificationOpened().subscribe(() => { });
        oneSignal.clearOneSignalNotifications();
        oneSignal.endInit();

        if(device.platform.toLowerCase() == "android"){
          platform.registerBackButtonAction(() => {
            let nav = app.getActiveNavs()[0];
            let activeView = nav.getActive();                
            
            if(activeView.name === 'HomePage') {
              if (nav.canGoBack()){
                nav.pop();
              } else {
                alertCtrl.create({
                  title: 'Exit App',
                  message: 'You are about to exit the app?',
                  buttons: [{
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {}
                  },{
                    text: 'Proceed',
                    handler: () => {
                      platform.exitApp();
                    }
                  }]
                }).present();
              }
            }
          });
        }
      }

      this.directUser();
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // See if user is first time user or not
  // --------------------------------------------------------------------------------------------------------------------
  directUser() {
    this.storage.get('intro_page').then((val) => {
      if(val && val != null && val != '') {
        this.rootPage = HomePage;
      } else {
        this.rootPage = IntroPage;
      }
    });
  }
}

