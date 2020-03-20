import { ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';

@Injectable()
export class ApiProvider {

  offline_toast: any;

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
  // Offline Message
  // --------------------------------------------------------------------------------------------------------------------
  offlineMessage() {
    this.offline_toast = this.toastCtrl.create({
      message: 'You are offline',
      position: 'bottom',
      duration: 3000,
      showCloseButton: true,
    }).present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // online Message
  // --------------------------------------------------------------------------------------------------------------------
  onlineMessage() {
    this.offline_toast = this.toastCtrl.create({
      message: 'You are online',
      position: 'bottom',
      duration: 3000,
      showCloseButton: false,
    }).present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline Message
  // --------------------------------------------------------------------------------------------------------------------
  networkErrorMessage() {
    this.toastCtrl.create({
      message: 'Connectivity Error.',
      duration: 3500,
      position: 'bottom'
    }).present();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Check for string
  // --------------------------------------------------------------------------------------------------------------------
  public contains(str) {
    return str.includes("Nan");
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Node Statuses classes, icons, images
  // --------------------------------------------------------------------------------------------------------------------
  public nodeStatus(value, refresh_date) {
    let value_good = {
      color: "#45e50d",
      css_color: "green",
      standard_color: "dark",
      font_color: "#222",
      map_reading_color: "#000000",
      label: 'Good',
      face: 'assets/faces/1-dark.png',
      dark_face: 'assets/faces/1-dark.png',
      marker: 'assets/markers/1.png',
      background: 'assets/bg/1.png'
    };

    let value_moderate = {
      color: "#f8fe28",
      css_color: "yellow",
      standard_color: "dark",
      font_color: "#222",
      map_reading_color: "#000000",
      label: 'Moderate',
      face: 'assets/faces/2-dark.png',
      dark_face: 'assets/faces/2-dark.png',
      marker: 'assets/markers/2.png',
      background: 'assets/bg/2.png'
    };

    let value_unhealthy_for_sensitive_groups = {
      color: "#ee8310",
      css_color: "orange",
      standard_color: "orange",
      font_color: "#ece9e9",
      map_reading_color: "#ffffff",
      label: 'Unhealthy for Sensitive Groups', 
      face: 'assets/faces/3.png',
      dark_face: 'assets/faces/3-dark.png',
      marker: 'assets/markers/3.png',
      background: 'assets/bg/3.png' 
    };

    let value_unhealthy = { 
      color: "#fe0000",
      css_color: "red",
      standard_color: "red",
      font_color: "#ece9e9",
      map_reading_color: "#ffffff",
      label: 'Unhealthy', 
      face: 'assets/faces/4.png',
      dark_face: 'assets/faces/4-dark.png',
      marker: 'assets/markers/4.png', 
      background: 'assets/bg/4.png' 
    };

    let value_very_unhealthy = { 
      color: "#8639c0",
      css_color: "purple",
      standard_color: "purple",
      font_color: "#ece9e9",
      map_reading_color: "#ffffff",
      label: 'Very unhealthy', 
      face: 'assets/faces/5.png',
      dark_face: 'assets/faces/5-dark.png',
      marker: 'assets/markers/5.png', 
      background: 'assets/bg/5.png' 
    };

    let value_hazardous = { 
      color: "#81202e",
      css_color: "maroon",
      standard_color: "maroon",
      font_color: "#ece9e9",
      map_reading_color: "#ffffff",
      label: 'Hazardous', 
      face: 'assets/faces/6.png',
      marker: 'assets/markers/6.png', 
      dark_face: 'assets/faces/6-dark.png',
      background: 'assets/bg/6.png' 
    };

    let value_unavailable = {
      color: "#7a7a7a",
      css_color: "grey",
      standard_color: "grey",
      font_color: "",
      map_reading_color: "#ffffff",
      label: '',
      face: 'assets/faces/0.png',
      dark_face: 'assets/faces/0.png',
      marker: 'assets/markers/0.png',
      background: 'assets/bg/0.png'
    };

    if(value) {
      value = parseFloat(value).toFixed(2);

      if(value > 0 && value < 12.1){
        if(this.isOldRefreshDate(refresh_date)) {
          value_good.color             = "#7a7a7a";
          value_good.css_color         = "grey";
          value_good.standard_color    = "grey";
          value_good.font_color        = "#ece9e9";
          value_good.map_reading_color = "#ffffff";
          value_good.background        = 'assets/bg/0.png';
        }

        return value_good;
      } else if (value >= 12.1 && value < 35.6) {
        if(this.isOldRefreshDate(refresh_date)) {
          value_moderate.color             = "#7a7a7a";
          value_moderate.css_color         = "grey";
          value_moderate.standard_color    = "grey";
          value_moderate.font_color        = "#ece9e9";
          value_moderate.map_reading_color = "#ffffff";
          value_moderate.background        = 'assets/bg/0.png';
        }

        return value_moderate;
      } else if (value > 35.6 && value < 55.3) {
        if(this.isOldRefreshDate(refresh_date)) {
          value_unhealthy_for_sensitive_groups.color             = "#7a7a7a";
          value_unhealthy_for_sensitive_groups.css_color         = "grey";
          value_unhealthy_for_sensitive_groups.standard_color    = "grey";
          value_unhealthy_for_sensitive_groups.font_color        = "#ece9e9";
          value_unhealthy_for_sensitive_groups.map_reading_color = "#ffffff";
          value_unhealthy_for_sensitive_groups.background        = 'assets/bg/0.png';
        }

        return value_unhealthy_for_sensitive_groups;
      } else if (value > 55.4 && value < 150.3) {
        if(this.isOldRefreshDate(refresh_date)) {
          value_unhealthy.color             = "#7a7a7a";
          value_unhealthy.css_color         = "grey";
          value_unhealthy.standard_color    = "grey";
          value_unhealthy.font_color        = "#ece9e9";
          value_unhealthy.map_reading_color = "#ffffff";
          value_unhealthy.background        = 'assets/bg/0.png';
        }

        return value_unhealthy;
      } else if (value > 150.4 && value < 250.4) {
        if(this.isOldRefreshDate(refresh_date)) {
          value_very_unhealthy.color             = "#7a7a7a";
          value_very_unhealthy.css_color         = "grey";
          value_very_unhealthy.standard_color    = "grey";
          value_very_unhealthy.font_color        = "#ece9e9";
          value_very_unhealthy.map_reading_color = "#ffffff";
          value_very_unhealthy.background        = 'assets/bg/0.png';
        }

        return value_very_unhealthy;
      } else if (value >= 250.5 && value <= 500.4) {
        if(this.isOldRefreshDate(refresh_date)) {
          value_hazardous.color             = "#7a7a7a";
          value_hazardous.css_color         = "grey";
          value_hazardous.standard_color    = "grey";
          value_hazardous.font_color        = "#ece9e9";
          value_hazardous.map_reading_color = "#ffffff";
          value_hazardous.background        = 'assets/bg/0.png';
        }
        
        return value_hazardous;
      } else {
        return value_unavailable;
      }
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When was the last time a node was refreshed
  // --------------------------------------------------------------------------------------------------------------------
  public isOldRefreshDate(refresh_date): boolean {
    if(refresh_date) {
      let current_date  = new Date();
      if(this.isISOFormat(refresh_date)) {
        refresh_date = this.getReadableInternationalDateFormatFromISOString(refresh_date);
      } else {
        let temp_refresh_date = new Date(refresh_date).toISOString();

        if(this.isISOFormat(temp_refresh_date)) {
          refresh_date = this.getReadableInternationalDateFormatFromISOString(temp_refresh_date);  
        }        
      }
  
      let difference = this.dateDiffInDays(refresh_date, current_date);
  
      if(difference > 2) {
        return true;
      } else {
        return false;
      }
    } else if(refresh_date == null) {
      return false;
    } else {
      return true;
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Check if date is in ISO format
  // --------------------------------------------------------------------------------------------------------------------
  isISOFormat(a) {
    var regex = /^[+-]?\d{4}(-[01]\d(-[0-3]\d(T[0-2]\d:[0-5]\d:?([0-5]\d(\.\d+)?)?([+-][0-2]\d:[0-5]\d)?Z?)?)?)?$/;
    return regex.test(a);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get date difference in days
  // --------------------------------------------------------------------------------------------------------------------
  dateDiffInDays(a, b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Add ordinal to date e.g. 1st, 2nd, 3rd, 4th
  // --------------------------------------------------------------------------------------------------------------------
  public dateOrdinal(date) {
    if (date > 3 && date < 21) return `${date}th`;
    switch (date % 10) {
      case 1:  return `${date}st`;
      case 2:  return `${date}nd`;
      case 3:  return `${date}rd`;
      default: return `${date}th`;
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // ISO string date to readable format
  // --------------------------------------------------------------------------------------------------------------------
  public getReadableInternationalDateFormatFromISOString(date) {
    return new Date(date);
  }

  // --------------------------------------------------------------------------------------------------------------------
  // AirQo UTC DateTIme to Graph DateTime
  // --------------------------------------------------------------------------------------------------------------------
  public graphTime(api_date) {
    const months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let date    = new Date(api_date);
    
    let display_date  = this.dateOrdinal(date.getDate());
    let display_month = months_names[date.getMonth()];
    let display_hour  = date.toLocaleString('en-US', { hour: 'numeric', hour12: true });
    
    return `${display_date} ${display_month}, ${display_hour}`;
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Leading Zeroes for hours and minutes
  // --------------------------------------------------------------------------------------------------------------------
  leadingZeroes(value) { 
    if(value < 10) {
      return '0' + value;
    } else {
      return value;
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // SQL datetime to readable format
  // --------------------------------------------------------------------------------------------------------------------
  public getReadableInternationalDateFormatFromSQLFormat(date) {
    if(date){
      return new Date(date.replace(/-/g,"/"));
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Time since i.e. Ago
  // --------------------------------------------------------------------------------------------------------------------
  ago(date) {

    let minute = 60;
    let hour   = minute * 60;
    let day    = hour   * 24;
    let month  = day    * 30;
    let year   = day    * 365;

    let suffix = ' ago';

    let elapsed = Math.floor((Date.now() - date) / 1000);

    if (elapsed < minute) {
      return 'Just now';
    }
    
    let a = elapsed < hour  && [Math.floor(elapsed / minute), 'minute'] ||
              elapsed < day   && [Math.floor(elapsed / hour), 'hour']     ||
              elapsed < month && [Math.floor(elapsed / day), 'day']       ||
              elapsed < year  && [Math.floor(elapsed / month), 'month']   ||
              [Math.floor(elapsed / year), 'year'];

    return a[0] + ' ' + a[1] + (a[0] === 1 ? '' : 's') + suffix;
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