import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';

@Injectable()
export class RestProvider {

  show_skeleton: number     = 0;
  show_refresh: number      = 0;
  show_no_internet: number  = 0;

  constructor(public http: HttpClient, public toastCtrl: ToastController, private network: Network) { }
  
  // --------------------------------------------------------------------------------------------------------------------
  // Alert when there is a Network change
  // --------------------------------------------------------------------------------------------------------------------
  displayNetworkUpdate() {
    this.network.onConnect().subscribe(data => {
      this.showToast('You are now '+ data.type, 'bottom', 5);
      this.show_skeleton    = 0;
      this.show_refresh     = 1;
      this.show_no_internet = 0;
    }, error => console.error(error));
   
    this.network.onDisconnect().subscribe(data => {
      this.showToast('You are now '+ data.type, 'bottom', 5);
    }, error => console.error(error));
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fetch data from provided URL
  // --------------------------------------------------------------------------------------------------------------------
  public getData(api_url) {
    return new Promise(resolve => {
      this.http.get(api_url).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
        this.show_skeleton    = 0;
        this.show_refresh     = 0;
        this.show_no_internet = 0;
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Post provided data to provided URL
  // --------------------------------------------------------------------------------------------------------------------
  public postData(api_url, data) {
    return new Promise((resolve, reject) => {
      this.http.post(api_url, JSON.stringify(data))
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }

  
  // --------------------------------------------------------------------------------------------------------------------
  // Node Statuses classes, icons, images
  // --------------------------------------------------------------------------------------------------------------------
  public nodeStatus(value) {
      value = parseFloat(value);
    if(value > -1 && value <= 0){
      return { class: '', label: '', image: 'assets/icons/unavailable.png', marker: 'assets/markers/0.png', icon: 'assets/imgs/s-0-unavailable.png', background: 'assets/bg/0.png' };
    } else if(value < 12.1){
      return { class: 'good', label: 'Good', image: 'assets/icons/happiness.png', marker: 'assets/markers/1.png', icon: 'assets/imgs/st-1-good.png', background: 'assets/bg/1.png' };
    } else if (value >= 12.1 && value < 35.6) {
      return { class: 'moderate', label: 'Moderate', image: 'assets/icons/happiness.png', marker: 'assets/markers/2.png', icon: 'assets/imgs/st-2-moderate.png', background: 'assets/bg/2.png' };
    } else if (value > 35.6 && value < 55.3) {
      return { class: 'unhealthy-sensitive-groups', label: 'Unhealthy for Sensitive Groups', image: 'assets/icons/embarrased.png', marker: 'assets/markers/3.png', icon: 'assets/imgs/st-3-unhealthy-sensitive-people.png', background: 'assets/bg/3.png' };
    } else if (value > 55.4 && value < 150.3) {
      return { class: 'unhealthy', label: 'Unhealthy', image: 'assets/icons/sad.png', marker: 'assets/markers/4.png', icon: 'assets/imgs/st-4-unhealthy.png', background: 'assets/bg/4.png' };
    } else if (value > 150.4 && value < 250.4) {
      return { class: 'very-unhealthy', label: 'Very unhealthy', image: 'assets/icons/sad.png', marker: 'assets/markers/5.png', icon: 'assets/imgs/st-5-very-unhealthy.png', background: 'assets/bg/5.png' };
    } else if (value >= 250.5 && value < 500) {
      return { class: 'hazardous', label: 'Hazardous', image: 'assets/icons/sad.png', marker: 'assets/markers/6.png', icon: 'assets/imgs/st-6-hazardous.png', background: 'assets/bg/6.png' };
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Create a toast
  // --------------------------------------------------------------------------------------------------------------------
  public showToast(content: string, position: string, duration: number) {
    duration = duration * 1000;
    this.toastCtrl.create({ message: content, duration: duration, position: position }).present();
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

}