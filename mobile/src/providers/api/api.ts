import { ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';

@Injectable()
export class ApiProvider {

  api_key: any = "AQ_9ec70a070c75E6af14FCca86/0621d1D83";

  constructor(public network: Network, private toastCtrl: ToastController, private device: Device, private storage: Storage,) { }


  // --------------------------------------------------------------------------------------------------------------------
  // Check Network Connectivity
  // --------------------------------------------------------------------------------------------------------------------
  isConnected() {
    if(this.device.platform){
      if(this.network.type.toLowerCase() !== 'none'){
        return true;
      } else {
        return false;
      }
    } else {
      // return false;
      return true;
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Node Statuses classes, icons, images
  // --------------------------------------------------------------------------------------------------------------------
  public nodeStatus(value) {
    if(value) {
      // value = value.trim();
      value = parseFloat(value).toFixed(2);

      if(value > 0 && value < 12.1){
        return {
          color: "#45e50d",
          css_color: "green",
          font_color: "#222",
          label: 'Good',
          face: 'assets/faces/1-dark.png',
          dark_face: 'assets/faces/1-dark.png',
          marker: 'assets/markers/1.png',
          background: 'assets/bg/1.png'
        };
      
      } else if (value >= 12.1 && value < 35.6) {
        return {
          color: "#f8fe28",
          css_color: "yellow",
          font_color: "#222",
          label: 'Moderate',
          face: 'assets/faces/2-dark.png',
          dark_face: 'assets/faces/2-dark.png',
          marker: 'assets/markers/2.png',
          background: 'assets/bg/2.png'
        };
      
      } else if (value > 35.6 && value < 55.3) {
        return { 
          color: "#ee8310",
          css_color: "orange",
          font_color: "#ece9e9",
          label: 'Unhealthy for Sensitive Groups', 
          face: 'assets/faces/3.png',
          dark_face: 'assets/faces/3-dark.png',
          marker: 'assets/markers/3.png',
          background: 'assets/bg/3.png' 
        };
      
      } else if (value > 55.4 && value < 150.3) {
        return { 
          color: "#fe0000",
          css_color: "red",
          font_color: "#ece9e9",
          label: 'Unhealthy', 
          face: 'assets/faces/4.png',
          dark_face: 'assets/faces/4-dark.png',
          marker: 'assets/markers/4.png', 
          background: 'assets/bg/4.png' 
        };
      
      } else if (value > 150.4 && value < 250.4) {
        return { 
          color: "#8639c0",
          css_color: "purple",
          font_color: "#ece9e9",
          label: 'Very unhealthy', 
          face: 'assets/faces/5.png',
          dark_face: 'assets/faces/5-dark.png',
          marker: 'assets/markers/5.png', 
          background: 'assets/bg/5.png' 
        };
      
      } else if (value >= 250.5 && value <= 500.4) {
        return { 
          color: "#81202e",
          css_color: "maroon",
          font_color: "#ece9e9",
          label: 'Hazardous', 
          face: 'assets/faces/6.png',
          marker: 'assets/markers/6.png', 
          dark_face: 'assets/faces/6-dark.png',
          background: 'assets/bg/6.png' 
        };
      } else {
        return {
          color: "#7a7a7a",
          css_color: "grey",
          font_color: "",
          label: '',
          face: 'assets/faces/0.png',
          dark_face: 'assets/faces/0.png',
          marker: 'assets/markers/0.png',
          background: 'assets/bg/0.png'
        };
      }
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get date with ordinal e.g. 1st, 2nd, 3rd, 4th
  // --------------------------------------------------------------------------------------------------------------------
  public getCurrentDateTime() {
    let today = new Date();
    let date  = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time  = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date+' '+time;
  }


  // --------------------------------------------------------------------------------------------------------------------
  // ISO string date to readable format
  // --------------------------------------------------------------------------------------------------------------------
  public getReadableInternationalDateFormatFromISOString(date) {
    return new Date(date);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // SQL datetime to readable format
  // --------------------------------------------------------------------------------------------------------------------
  public getReadableInternationalDateFormatFromSQLFormat(date) {
    return new Date(date.replace(/-/g,"/"));
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get time from ISO date time
  // --------------------------------------------------------------------------------------------------------------------
  public getTimeFromISOStringDateTime(datetime) {
    let date = new Date(datetime);
    return this.convertNumberToTwoDigitString(date.getUTCHours()) + ":" + this.convertNumberToTwoDigitString(date.getUTCMinutes());
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Returns the given integer as a string and with 2 digits e.g. 7 --> "07"
  // --------------------------------------------------------------------------------------------------------------------
  convertNumberToTwoDigitString(n) {
    return n > 9 ? "" + n : "0" + n;
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Log Out
  // --------------------------------------------------------------------------------------------------------------------
  logOut(user): boolean {
    this.storage.set('user_data', null);
    this.storage.set('nearest_node', null);
    this.storage.set('favorites_readings', null);

    return true;
  }
}