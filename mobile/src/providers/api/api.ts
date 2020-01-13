import { ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';

@Injectable()
export class ApiProvider {

  api_key: any = "<AIRQO_CONNECTION_API_KEY>";

  constructor(public network: Network, private toastCtrl: ToastController, private device: Device, private storage: Storage,) { }


  // --------------------------------------------------------------------------------------------------------------------
  // Check Network Connectivity
  // --------------------------------------------------------------------------------------------------------------------
  isConnected() {
    if(this.device.platform){
      if(this.network.type.toLowerCase() == 'none'){
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Node Statuses classes, icons, images
  // --------------------------------------------------------------------------------------------------------------------
  public nodeStatus(value) {
    if(value) {
      value = parseFloat(value).toFixed(2);

      if(value <= 0){
        return {
          color: "#5d6355",
          label: '',
          face: 'assets/faces/0.png',
          marker: 'assets/markers/0.png',
          background: 'assets/bg/0.png'
        };
      
      } else if(value > 0 && value < 12.1){
        return {
          color: "#45e50d",
          label: 'Good',
          face: 'assets/faces/1.png',
          marker: 'assets/markers/1.png',
          background: 'assets/bg/1.png'
        };
      
      } else if (value >= 12.1 && value < 35.6) {
        return { 
          color: "#f8fe28",
          label: 'Moderate',
          face: 'assets/faces/2.png',
          marker: 'assets/markers/2.png',
          background: 'assets/bg/2.png'
        };
      
      } else if (value > 35.6 && value < 55.3) {
        return { 
          color: "#ee8310",
          label: 'Unhealthy for Sensitive Groups', 
          face: 'assets/faces/3.png',
          marker: 'assets/markers/3.png',
          background: 'assets/bg/3.png' 
        };
      
      } else if (value > 55.4 && value < 150.3) {
        return { 
          color: "#fe0000",
          label: 'Unhealthy', 
          face: 'assets/faces/4.png',
          marker: 'assets/markers/4.png', 
          background: 'assets/bg/4.png' 
        };
      
      } else if (value > 150.4 && value < 250.4) {
        return { 
          color: "#8639c0",
          label: 'Very unhealthy', 
          face: 'assets/faces/5.png',
          marker: 'assets/markers/5.png', 
          background: 'assets/bg/5.png' 
        };
      
      } else if (value >= 250.5 && value < 500) {
        return { 
          color: "#81202e",
          label: 'Hazardous', 
          face: 'assets/faces/6.png',
          marker: 'assets/markers/6.png', 
          background: 'assets/bg/6.png' 
        };
      }
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get date with ordinal e.g. 1st, 2nd, 3rd, 4th
  // --------------------------------------------------------------------------------------------------------------------
  public getCurrentDateTime() {
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date+' '+time;
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get date with ordinal e.g. 1st, 2nd, 3rd, 4th
  // --------------------------------------------------------------------------------------------------------------------
  public getDateWithOrdinal(date) {
    return date;
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Convert date from ISO string to readable format
  // --------------------------------------------------------------------------------------------------------------------
  public convertDate(date) {

    var minutes;
    var hours;

    var month = new Array(12);
    month[0]  = "Jan";
    month[1]  = "Feb";
    month[2]  = "Mar";
    month[3]  = "Apr";
    month[4]  = "May";
    month[5]  = "Jun";
    month[6]  = "Jul";
    month[7]  = "Aug";
    month[8]  = "Sep";
    month[9]  = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";

    var d = new Date(date);
    hours = d.getUTCHours() + 3;
    switch(hours){
      case 0:
        hours = '00';
        break;
      case 1:
        hours = '01';
        break;
      case 2:
        hours = '02';
        break;
      case 3:
        hours = '03';
        break;
      case 4:
        hours = '04';
        break;
      case 5:
        hours = '05';
        break;
      case 6:
        hours = '06';
        break;
      case 7:
        hours = '07';
        break;
      case 8:
        hours = '08';
        break;
      case 9:
        hours = '09';
        break;
      case 24:
        hours = '00';
        break;
      case 25:
        hours = '01';
        break;
      case 26:
        hours = '02';
        break;
      case 27:
        hours = '03';
        break;
    }

    minutes = d.getUTCMinutes();
    switch(minutes) {
      case 0:
        minutes = '00';
        break;
      case 1:
        minutes = '01';
        break;
      case 2:
        minutes = '02';
        break;
      case 3:
        minutes = '03';
        break;
      case 4:
        minutes = '04';
        break;
      case 5:
        minutes = '05';
        break;
      case 6:
        minutes = '06';
        break;
      case 7:
        minutes = '07';
        break;
      case 8:
        minutes = '08';
        break;
      case 9:
        minutes = '09';
        break;
    }

    var converted_date = d.getUTCDate() +"-"+ month[d.getUTCMonth()] +"-"+ d.getUTCFullYear() +" at "+ hours +":"+ minutes +" hrs";
    return converted_date;
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Convert time from ISO string to readable format
  // --------------------------------------------------------------------------------------------------------------------
  public convertTime(time) {

    var minutes;
    var hours;
    var d = new Date(time);

    hours = d.getUTCHours();
    hours += 3;
    switch(hours) {
      case 0:
        hours = '00';
        break;
      case 1:
        hours = '01';
        break;
      case 2:
        hours = '02';
        break;
      case 3:
        hours = '03';
        break;
      case 4:
        hours = '04';
        break;
      case 5:
        hours = '05';
        break;
      case 6:
        hours = '06';
        break;
      case 7:
        hours = '07';
        break;
      case 8:
        hours = '08';
        break;
      case 9:
        hours = '09';
        break;
      case 24:
        hours = '00';
        break;
      case 25:
        hours = '01';
        break;
      case 26:
        hours = '02';
        break;
      case 27:
        hours = '03';
        break;
    }

    minutes = d.getUTCMinutes();
    switch(minutes) {
      case 0:
        minutes = '00';
        break;
      case 1:
        minutes = '01';
        break;
      case 2:
        minutes = '02';
        break;
      case 3:
        minutes = '03';
        break;
      case 4:
        minutes = '04';
        break;
      case 5:
        minutes = '05';
        break;
      case 6:
        minutes = '06';
        break;
      case 7:
        minutes = '07';
        break;
      case 8:
        minutes = '08';
        break;
      case 9:
        minutes = '09';
        break;
    }

    var converted_time = hours +":"+ minutes;
    return converted_time;
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