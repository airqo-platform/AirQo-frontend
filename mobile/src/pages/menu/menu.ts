import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Storage } from '@ionic/storage';

import { KeyPage } from './../key/key';
import { MapPage } from './../map/map';
import { SignInPage } from './../sign-in/sign-in';
import { SettingsPage } from './../settings/settings';
import { CameraPage } from './../camera/camera';
import { FavoritesPage } from './../favorites/favorites';

@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  user: any = {};

  login_status: boolean = false;

  sign_in_or_sign_up_label: string = 'Sign In';

  constructor(public navCtrl: NavController, public navParams: NavParams, private socialSharing: SocialSharing, 
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
    this.socialSharing.shareViaWhatsApp("Check out AirQo app via www.airqo.net.", 'assets/logos/logo-blue.png', 'www.airqo.net').then((entries) => {
      // 
    }).catch((error) => {
      alert('Unable to Invite. ');
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Share via Message
  // --------------------------------------------------------------------------------------------------------------------
  shareViaMessage() {
    this.socialSharing.share("Check out AirQo app via www.airqo.net.", "AirQo", 'assets/logos/logo-blue.png', 'www.airqo.net').then((entries) => {
      // 
    }).catch((error) => {
      alert('Unable to Invite. ');
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Share via Other
  // --------------------------------------------------------------------------------------------------------------------
  shareViaOther() {
    this.socialSharing.share("Check out AirQo app via www.airqo.net.", "AirQo", null, null).then((entries) => {
      // 
    }).catch((error) => {
      alert('Unable to Invite.');
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Camera Page
  // --------------------------------------------------------------------------------------------------------------------
  goToCameraPage() {
    this.navCtrl.push(CameraPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Settings Page
  // --------------------------------------------------------------------------------------------------------------------
  goToSettings() {
    this.navCtrl.push(SettingsPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Check if user is signed in
  // --------------------------------------------------------------------------------------------------------------------
  checkSessionStatus() {
    if(Object.keys(this.user).length > 0) {
      this.signOut();
    } else {
      this.navCtrl.push(SignInPage);
    }
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
            });
          }
        }
      ]
    }).present();
  }

}