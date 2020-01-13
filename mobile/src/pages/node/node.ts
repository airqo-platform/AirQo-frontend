import { Component, ViewChild, ɵConsole } from '@angular/core';
import { NavController, NavParams, ToastController, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';
import { Chart } from 'chart.js';

@Component({
  selector: 'page-node',
  templateUrl: 'node.html',
})
export class NodePage {

  @ViewChild('barCanvas') barCanvas;
  barChart: any;
  
  user: any = {};

  node: any = {};
  class: any;
  node_data: any;

  x_data: any;
  y_data: any;
  bar_colors: any;

  single_node_api = 'https://test.airqo.net/Apis/airqoChannelFeed';
  single_node_api_success: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController, private http: HttpClient, 
    private alertCtrl: AlertController, public api: ApiProvider,) {
      this.node = this.navParams.get("node");
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
  ionViewDidEnter() {
    console.log(this.node);

    if(this.api.isConnected()){
      this.onlineLoadNodeInfo();
    } else {
      this.offlineLoadNodeInfo();
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
  onlineLoadNodeInfo() {
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
        console.log(result);
        loader.dismiss(); 

        this.single_node_api_success = result.success;
        if (result.success == '100') {
          this.node.refreshed = this.api.getCurrentDateTime();
          this.node.graph_feeds = result.lastfeeds.feeds;

          this.getGraphData();
          this.offlineStoreNodeInfo();
        } else {
          this.offlineLoadNodeInfo();
          this.alertCtrl.create({
            title: result.title,
            message: result.message,
            buttons: ['Okay']
          }).present();
        }
      }, (err) => {
        this.offlineLoadNodeInfo();
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
  offlineStoreNodeInfo() {
   this.storage.set("node", this.node);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - retrieve node info offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadNodeInfo() {
    this.storage.get("node").then((val) => {
      if(val != null && val != '' && val) {
        this.node = val;
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fetch Bar Graph Data
  // --------------------------------------------------------------------------------------------------------------------
  getGraphData() {
    let x_data       = [];
    let y_data       = [];
    let bar_colors   = [];

    for(let i = 0; i < this.node.graph_feeds.length; i++) {
      y_data.push(this.node.graph_feeds[i].field1.replace(/\s/g, ""));
      x_data.push(this.api.getTimeFromISOStringDateTime(this.node.graph_feeds[i].created_at));
      bar_colors.push(this.api.nodeStatus(this.node.graph_feeds[i].field1).color);
    }

    console.log("X - DATA: ");
    console.log(this.x_data);

    console.log("Y - DATA: ");
    console.log(this.y_data);

    console.log("COLORS - DATA: ");
    console.log(this.bar_colors);

    this.loadGraph(x_data, y_data, bar_colors);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Draw Bar Graph
  // --------------------------------------------------------------------------------------------------------------------
  loadGraph(x_data, y_data, bar_colors){
    this.barChart = new Chart(this.barCanvas.nativeElement, {
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
  // Go Back
  // --------------------------------------------------------------------------------------------------------------------
  goBack() {
    this.navCtrl.pop();
  }

}