import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-key-modal',
  templateUrl: 'key-modal.html',
})
export class KeyModalPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) { }


  // --------------------------------------------------------------------------------------------------------------------
  // Close Color Key Modal
  // --------------------------------------------------------------------------------------------------------------------
  closeKeyModal() {
    this.viewCtrl.dismiss();
  }
}
