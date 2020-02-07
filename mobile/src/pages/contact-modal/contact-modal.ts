import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { RestProvider } from '../../providers/rest/rest';

@IonicPage()
@Component({
  selector: 'page-contact-modal',
  templateUrl: 'contact-modal.html',
})
export class ContactModalPage {

  contact: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, 
    public storage: Storage, public restProvider: RestProvider) { }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: check for about information
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.storage.get('about_list').then((val) => {
      if(val != null) {
        this.contact = {
          phone: val.c_phone,
          email: val.c_email,
          address: val.c_address,
          info: val.c_info
        };
        console.log("Received: ", this.contact);
      } else {
        this.restProvider.showToast('Please check your internet connection', 'center', 5);
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Close CONTACT INFORMATION modal
  // --------------------------------------------------------------------------------------------------------------------
  closeContactModal() {
    this.viewCtrl.dismiss();
}

}
