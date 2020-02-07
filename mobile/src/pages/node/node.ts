import { HomePage } from './../home/home';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';
import { Chart } from 'chart.js';
import { KeyPage } from '../key/key';

@Component({
  selector: 'page-node',
  templateUrl: 'node.html',
})
export class NodePage {

  @ViewChild('barCanvasHistory') barCanvas;
  barChartHistory: any;

  @ViewChild('barCanvasForecast') barCanvas;
  barChartForecast: any;
  
  user: any = {};

  node: any = {};
  background_image: any = '';
  class: any;
  node_data: any;

  x_data: any;
  y_data: any;
  bar_colors: any;

  graphs_segments: any = 'history';

  single_node_api = 'https://airqo.net/Apis/airqoChannelFeed';
  single_node_api_success: any;

  forecast_node_api = 'https://airqo.net/Apis/placeForecast';
  forecast_node_api_success: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController, private http: HttpClient, private alertCtrl: AlertController, public api: ApiProvider,) {
      
      if(this.navParams.get("node")){
        this.node               = this.navParams.get("node");

        if(this.node.refreshed){
        } else if(this.node.date) {
          this.node.refreshed = this.node.date;
        } else {
          this.node.refreshed = '0000-00-00 00:00:00';
        }

        if(this.node.feeds){
        } else {
          this.node.feeds         = {};
          this.node.feeds.field1  = '0.00';
        }

        if(this.node.lat && this.node.lng){
        } else {
          this.node.lat  = this.node.feeds.field5;
          this.node.lng  = this.node.feeds.field6;
        }

        // console.log(this.node);
      } else {
        this.navCtrl.setRoot(HomePage);
      }
  }
  
  
  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.getUserInfo();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires everytime page loads
  // --------------------------------------------------------------------------------------------------------------------
  async ionViewDidEnter() {
    console.log(this.node);

    if(this.api.isConnected()){
      this.onlineLoadHistoryNodeInfo();
      // this.onlineLoadNodeForecastInfo();
    } else {
      // this.offlineLoadHistoryNodeInfo();
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Get User's info
  // --------------------------------------------------------------------------------------------------------------------
  getUserInfo() {
    this.storage.get('user_data').then((val) => {
      if(val && val != null && val != '') {
        this.user = val;
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Load Node Info from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineLoadHistoryNodeInfo() {
    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    let params = {
      api: this.api.api_key,
      channel: this.node.channel_id
    };
    
    loader.present().then(() => {
      this.http.post(this.single_node_api, params).subscribe((result: any) => {

        // console.log(result);
        loader.dismiss(); 

        this.single_node_api_success = result.success;
        if (result.success == '100') {
          this.node.refreshed     = this.api.getCurrentDateTime();
          this.node.feeds.field1  = result.lastfeeds.feeds[0].field1.trim();

          // console.log(result.lastfeeds.feeds);

          this.getHistoryGraphData(result.lastfeeds.feeds);
          this.offlineStoreHistoryNodeInfo();
        } else {
          this.offlineLoadHistoryNodeInfo();
          this.alertCtrl.create({
            title: result.title,
            message: result.message,
            buttons: ['Okay']
          }).present();
        }
      }, (err) => {
        this.offlineLoadHistoryNodeInfo();
        loader.dismiss();
        this.toastCtrl.create({
          message: 'Network Error',
          duration: 2500,
          position: 'bottom'
        }).present();
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Load Node Forecast Info from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineLoadNodeForecastInfo() {
    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: false,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    let params = {
      api: this.api.api_key,
      lat: this.node.lat,
      lng: this.node.lng
    };
    
    loader.present().then(() => {
      this.http.post(this.forecast_node_api, params).subscribe((result: any) => {

        console.log("------------------------------------------------------------------------------");
        console.log(result);
        loader.dismiss();

        // this.forecast_node_api_success = result.success;
        // if (result.success == '100') {
        //   this.node.refreshed     = this.api.getCurrentDateTime();
        //   this.node.feeds.field1  = result.lastfeeds.feeds[0].field1.trim();

        //   console.log(result.lastfeeds.feeds);

        //   this.getGraphData(result.lastfeeds.feeds);
        //   this.offlineStoreNodeInfo();
        // } else {
        //   this.offlineLoadNodeInfo();
        //   this.alertCtrl.create({
        //     title: result.title,
        //     message: result.message,
        //     buttons: ['Okay']
        //   }).present();
        // }
      }, (err) => {
        // this.offlineLoadNodeInfo();
        loader.dismiss();
        this.toastCtrl.create({
          message: 'Network Error',
          duration: 2500,
          position: 'bottom'
        }).present();
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - store node info offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineStoreHistoryNodeInfo() {
   this.storage.set("node", this.node);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - retrieve node info offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadHistoryNodeInfo() {
    this.storage.get("node").then((val) => {
      if(val != null && val != '' && val) {
        this.node = val;
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fetch Bar Graph Data
  // --------------------------------------------------------------------------------------------------------------------
  getHistoryGraphData(graph_feeds) {
    let x_data       = [];
    let y_data       = [];
    let bar_colors   = [];

    for(let i = 0; i < graph_feeds.length; i++) {
      y_data.push(parseFloat((graph_feeds[i].field1).trim()));
      x_data.push(this.api.getTimeFromISOStringDateTime(graph_feeds[i].created_at));
      bar_colors.push(this.api.nodeStatus(graph_feeds[i].field1).color);
    }

    // console.log("X - DATA: ");
    // console.log(x_data);

    // console.log("Y - DATA: ");
    // console.log(y_data);

    // console.log("COLORS - DATA: ");
    // console.log(bar_colors);

    this.loadHistoryGraph(x_data, y_data, bar_colors);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fetch Forecast Bar Graph Data
  // --------------------------------------------------------------------------------------------------------------------
  getForecasttGraphData(graph_feeds) {
    let x_data       = [];
    let y_data       = [];
    let bar_colors   = [];

    for(let i = 0; i < graph_feeds.length; i++) {
      y_data.push(parseFloat((graph_feeds[i].field1).trim()));
      x_data.push(this.api.getTimeFromISOStringDateTime(graph_feeds[i].created_at));
      bar_colors.push(this.api.nodeStatus(graph_feeds[i].field1).color);
    }

    // console.log("X - DATA: ");
    // console.log(x_data);

    // console.log("Y - DATA: ");
    // console.log(y_data);

    // console.log("COLORS - DATA: ");
    // console.log(bar_colors);

    this.loadHistoryGraph(x_data, y_data, bar_colors);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Draw Bar Graph
  // --------------------------------------------------------------------------------------------------------------------
  loadHistoryGraph(x_data, y_data, bar_colors){
    this.barChartHistory = new Chart(this.barCanvasHistory.nativeElement, {
      type: 'bar',
      data: {
        labels: x_data,
        datasets: [{
          label: 'µg/m3 (ppm)',
          data: y_data,
          backgroundColor: bar_colors,
          borderColor: bar_colors,
          borderWidth: 0
        }]
      },
      options: {
        tooltips: {
          "enabled": false
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
            },
            scaleLabel: {
              display: true,
              labelString: "Time",
              fontColor: "#415c7b"
            }
          }],
          yAxes: [{
            ticks: {
              display: true,
              beginAtZero: true,
              // stepSize: 1
            },
            gridLines: {
              display: true,
            },
            scaleLabel: {
              display: true,
              labelString: "µg/m3 (ppm)",
              fontColor: "#415c7b"
            }
          }]
        }
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Draw Forecast Bar Graph
  // --------------------------------------------------------------------------------------------------------------------
  loadForecastGraph(x_data, y_data, bar_colors){
    this.barChartForecast = new Chart(this.barCanvasForecast.nativeElement, {
      type: 'bar',
      data: {
        labels: x_data,
        datasets: [{
          label: 'µg/m3 (ppm)',
          data: y_data,
          backgroundColor: bar_colors,
          borderColor: bar_colors,
          borderWidth: 0
        }]
      },
      options: {
        tooltips: {
          "enabled": false
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
            },
            scaleLabel: {
              display: true,
              labelString: "Time",
              fontColor: "#415c7b"
            }
          }],
          yAxes: [{
            ticks: {
              display: true,
              beginAtZero: true,
              // stepSize: 1
            },
            gridLines: {
              display: true,
            },
            scaleLabel: {
              display: true,
              labelString: "µg/m3 (ppm)",
              fontColor: "#415c7b"
            }
          }]
        }
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go To Key Page
  // --------------------------------------------------------------------------------------------------------------------
  goToKeyPage() {
    this.navCtrl.push(KeyPage);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go Back
  // --------------------------------------------------------------------------------------------------------------------
  goBack() {
    this.navCtrl.pop();
  }

}