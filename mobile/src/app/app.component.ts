import { HomePage } from './../pages/home/home';
import { IntroPage } from './../pages/intro/intro';
import {Component, ViewChild} from '@angular/core';
import { Platform, AlertController, App, ToastController, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild('content') navCtrl: NavController

  rootPage: any = IntroPage;

  constructor(app: App, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage, device: Device, 
    alertCtrl: AlertController, toastCtrl: ToastController) {

    platform.ready().then(() => {

      toastCtrl.create({
        message: 'Please wait as app sets up...',
        duration: 5000,
        position: 'bottom',
      }).present();
      
      statusBar.styleDefault();
      statusBar.overlaysWebView(false);
      splashScreen.hide();

      if(device.platform){
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

      this.storage.get('intro_page').then((val) => {
        if(val && val != null && val != '') {
          // this.navCtrl.setRoot(HomePage);
        }
      });
    });
  }
}

