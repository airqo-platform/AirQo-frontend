import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';

import { KeyPage } from './../key/key';
import { MapPage } from './../map/map';
import { SettingsPage } from './../settings/settings';
import { FavoritesPage } from './../favorites/favorites';

@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  user: any = {};

  login_status: boolean = false;

  sign_in_or_sign_up_label: string = 'Sign In';

  constructor(public navCtrl: NavController, public navParams: NavParams, private socialSharing: SocialSharing, private device: Device, 
    private actionSheetCtrl: ActionSheetController, private storage: Storage, private alertCtrl: AlertController) {
      this.getUserInfo();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires everytime page loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {}


  // --------------------------------------------------------------------------------------------------------------------
  // Get User's info
  // --------------------------------------------------------------------------------------------------------------------
  getUserInfo() {
    this.storage.get('user_data').then((val) => {
      if(val && val != null && val != '') {
        this.user = val;
        this.login_status = true;
        this.sign_in_or_sign_up_label = 'Sign Out';
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Favorites Page
  // --------------------------------------------------------------------------------------------------------------------
  goToFavoritesPage() {
    this.navCtrl.push(FavoritesPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Map Page
  // --------------------------------------------------------------------------------------------------------------------
  goToMapPage() {
    this.navCtrl.push(MapPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Key Page
  // --------------------------------------------------------------------------------------------------------------------
  goToKeyPage() {
    this.navCtrl.push(KeyPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Invite Friends
  // --------------------------------------------------------------------------------------------------------------------
  inviteFriends() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Share',
      buttons: [
        {
          text: 'WhatsApp',
          handler: () => {
            this.shareViaWhatsApp();
          }
        }, {
          text: 'Message',
          handler: () => {
            this.shareViaMessage();
          }
        }, {
          text: 'Other',
          handler: () => {
            this.shareViaOther();
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });
    actionSheet.present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Share via WhatsApp
  // --------------------------------------------------------------------------------------------------------------------
  shareViaWhatsApp() {
    let link: any;

    if(this.device.platform){
      if(this.device.platform.toLowerCase() == "android"){
        link = "https://play.google.com/store/apps/details?id=com.airqo.net&hl=en";
      } else {
        link = "https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8";
      }
    }

    this.socialSharing.shareViaWhatsApp("Check out the AirQo app", 'assets/logos/logo-blue.png', link).then((entries) => {
      // 
    }).catch((error) => {
      alert('Unable to Invite. ');
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Share via Message
  // --------------------------------------------------------------------------------------------------------------------
  shareViaMessage() {
    let link: any;

    if(this.device.platform){
      if(this.device.platform.toLowerCase() == "android"){
        link = "https://play.google.com/store/apps/details?id=com.airqo.net&hl=en";
      } else {
        link = "https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8";
      }
    }

    this.socialSharing.share("Check out the AirQo app", "AirQo", 'assets/logos/logo-blue.png', link).then((entries) => {
      // 
    }).catch((error) => {
      alert('Unable to Invite. ');
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Share via Other
  // --------------------------------------------------------------------------------------------------------------------
  shareViaOther() {
    let link: any;

    if(this.device.platform){
      if(this.device.platform.toLowerCase() == "android"){
        link = "https://play.google.com/store/apps/details?id=com.airqo.net&hl=en";
      } else {
        link = "https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8";
      }
    }

    this.socialSharing.share("Check out the AirQo app", "AirQo", null, link).then((entries) => {
      // 
    }).catch((error) => {
      alert('Unable to Invite.');
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Settings Page
  // --------------------------------------------------------------------------------------------------------------------
  goToSettings() {
    this.navCtrl.push(SettingsPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Sign Out
  // --------------------------------------------------------------------------------------------------------------------
  signOut() {
    this.alertCtrl.create({
      title: 'LOGOUT',
      message: 'Do you wish to proceed and sign out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Logout',
          handler: () => {
            this.user = {};
            this.storage.set('remember_me', null);
            this.storage.set('user_data', null).then(() => {
              this.sign_in_or_sign_up_label = 'Sign In';
              this.login_status = false;

              this.navCtrl.setRoot(HomePage);
            });
          }
        }
      ]
    }).present();
  }

}