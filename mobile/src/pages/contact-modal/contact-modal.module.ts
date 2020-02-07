import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactModalPage } from './contact-modal';

@NgModule({
  declarations: [
    ContactModalPage,
  ],
  imports: [
    IonicPageModule.forChild(ContactModalPage),
  ],
})
export class ContactModalPageModule {}
