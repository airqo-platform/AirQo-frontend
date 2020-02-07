import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { RestProvider } from '../../providers/rest/rest';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  data: any           = {};
  information: any    = [];
  
  api_url              = 'http://airqo.net/apis/ios/ver3.0/about.php';
  show_contact_button: boolean  = true;

  constructor(public navCtrl: NavController, public navParams: NavParams, public restProvider: RestProvider, 
    public storage: Storage, public modalCtrl: ModalController) { }

  
  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: get FAQs
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.restProvider.show_skeleton = 1;
    this.show_contact_button = true;
    this.getFAQs();
  }

  
  // --------------------------------------------------------------------------------------------------------------------
  // Get FAQs from URL
  // --------------------------------------------------------------------------------------------------------------------
  getFAQs() {
    this.restProvider.getData(this.api_url).then((data: any) => {
      if(data != null) {
        this.data         = data;
        this.information  = this.data.faqs;
        this.storage.set('about_list', this.data);

        setTimeout(() => {
          this.restProvider.show_skeleton = 0;
          this.show_contact_button        = false;
        }, 100);

      } else {
        this.storage.get('about_list').then((val) => {
          if(val != null) {
            this.data         = val;
            this.information  = this.data.faqs;
            
            setTimeout(() => {
              this.restProvider.show_skeleton = 0;
              this.show_contact_button        = false;
            }, 100);
          } else {
            this.restProvider.showToast('Please check your internet connection', 'center', 5);
          }
        });
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Toggle section
  // --------------------------------------------------------------------------------------------------------------------
  toggleSection(i) {
    this.information[i].open = !this.information[i].open;
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Display CONTACT INFORMATION modal
  // --------------------------------------------------------------------------------------------------------------------
  showContactInfo() {
    this.show_contact_button = true;
    var options = {
      enableBackdropDismiss: true,
      cssClass: 'always-modal'
    };
    var modal = this.modalCtrl.create('ContactModalPage', null, options);
    modal.onDidDismiss(data => {
      this.show_contact_button = false;
    });
    modal.present();
  }

}
