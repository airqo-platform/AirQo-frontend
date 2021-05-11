import { HomePage } from './../home/home';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
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

  @ViewChild('barCanvasHistory') barCanvasHistory: ElementRef;
  @ViewChild('barCanvasForecast') barCanvasForecast: ElementRef;
  
  barChartHistory: any;
  barChartForecast: any;
  
  user: any = {};

  node: any = {};
  background_image: any = '';
  class: any;
  node_data: any;

  is_favorite: boolean = false;

  graphs_segments: any = 'history';

  history_node_api = `${this.api.api_endpoint}/airqoPlace24Hours`;
  history_node_api_success: boolean = true;

  forecast_node_api = `${this.api.api_endpoint}/placeForecast`;
  forecast_node_api_success: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController, private http: HttpClient, private alertCtrl: AlertController, public api: ApiProvider,) {
      
      if(this.navParams.get("node")){
        this.node               = this.navParams.get("node");

        if(this.node.feeds){
          if(this.api.isISOFormat(this.node.feeds.created_at)){
            this.node.refreshed = null;
          }
        } else {
          this.node.feeds         = {};
          this.node.feeds.field1  = '0.00';
        }

        if(this.node.lat && this.node.lng){
        } else {
          this.node.lat  = this.node.feeds.field5;
          this.node.lng  = this.node.feeds.field6;
        }
      } else {
        this.navCtrl.setRoot(HomePage);
      }
  }
  
  
  // --------------------------------------------------------------------------------------------------------------------
  // Runs when the page has loaded. Fires only once
  // --------------------------------------------------------------------------------------------------------------------
  async ionViewDidLoad() {

    // this.offlineLoadHistoryNodeInfo();

    if(this.api.isConnected()){
      await this.onlineLoadHistoryNodeInfo();
    } else {
      this.api.offlineMessage();
      await this.offlineLoadHistoryNodeInfo();
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires every time page loads
  // --------------------------------------------------------------------------------------------------------------------
  async ionViewDidEnter() {
    this.isNodeFavorite(this.node);
    console.log(this.node);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When the ionSegment/Tabs change
  // --------------------------------------------------------------------------------------------------------------------
  onSegmentChange() {
    if(this.graphs_segments == 'history'){
      if(this.api.isConnected()){
        this.onlineLoadHistoryNodeInfo();
      } else {
        this.offlineLoadHistoryNodeInfo();
      }
    } else if(this.graphs_segments == 'forecast') {
      if(this.api.isConnected()){
        this.onlineLoadNodeForecastInfo();
      } else {
        this.offlineLoadForecastNodeInfo();
      }
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Load Node Info from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineLoadHistoryNodeInfo() {
    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: true,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    let params = {
      api: this.api.api_key,
      channel: this.node.channel_id
    };

    loader.present();

    this.http.post(this.history_node_api, params).subscribe((result: any) => {
      console.log(result);

      if(result.success == '100' && result.feed.hourly_results){
        if(result.feed.hourly_results.length > 0){
          this.history_node_api_success = true;
          this.node.refreshed     = result.feed.hourly_results[0].time;
          this.node.feeds.field1  = result.feed.hourly_results[0].pm2_5;

          this.offlineStoreHistoryStoreNodeInfo(result.feed.hourly_results, this.node);
          this.getHistoryGraphData(result.feed.hourly_results);
        }
        loader.dismiss();
      } else {
        loader.dismiss();

        this.toastCtrl.create({
          message: 'Up-to-date history information unavailable',
          duration: 3000,
          position: 'bottom',
          showCloseButton: true,
        }).present();

        this.offlineLoadHistoryNodeInfo();
      }
    }, (err) => {
      loader.dismiss();

      this.history_node_api_success = false;
      this.api.networkErrorMessage();

      this.offlineLoadHistoryNodeInfo();
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Load Node Forecast Info from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineLoadNodeForecastInfo() {

    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: true,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    let params = {
      api: this.api.api_key,
      lat: this.node.lat,
      lng: this.node.lng
    };

    loader.present();
    
    this.http.post(this.forecast_node_api, params).subscribe((result: any) => {
      console.log(result);

      if((result.success == '100') && result.formatted_results) {
        if(result.formatted_results.predictions.length > 0){
          this.forecast_node_api_success = true;
          console.log(result.formatted_results.predictions);
          
          // this.offlineStoreForecastStoreNodeInfo(result.formatted_results.predictions);
          this.getForecastGraphData(result.formatted_results.predictions);
        }
        loader.dismiss();
      } else {
        loader.dismiss();

        this.forecast_node_api_success = false;
        
        this.toastCtrl.create({
          message: 'Up-to-date forecast information unavailable',
          duration: 3000,
          position: 'bottom',
          showCloseButton: true,
        }).present();
      }
    }, (err) => {
      loader.dismiss();

      this.forecast_node_api_success = false;
      this.api.networkErrorMessage();
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Draw History Graph
  // --------------------------------------------------------------------------------------------------------------------
  getHistoryGraphData(graph_feeds) {
    if(graph_feeds.length > 0) {
      let x_data       = [];
      let y_data       = [];
      let bar_colors   = [];

      graph_feeds     = graph_feeds.slice(0, 48);
      graph_feeds.reverse();
      for(let i = 0; i < graph_feeds.length; i++) {
        y_data.push(parseFloat(graph_feeds[i].pm2_5));
        x_data.push(this.api.graphTime(graph_feeds[i].time));
        bar_colors.push(this.api.nodeStatus(graph_feeds[i].pm2_5, null).color);
      }

      this.barChartHistory = new Chart(this.barCanvasHistory.nativeElement, {
        type: 'bar',
        data: {
          labels: x_data,
          datasets: [{
            label: "PM2.5 (µg/m3)",
            data: y_data,
            backgroundColor: bar_colors,
            borderColor: bar_colors,
            borderWidth: 0
          }]
        },
        options: {
          tooltips: {
            "enabled": true
          },
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              ticks: {
                autoSkip: false,
                maxRotation: 90,
                minRotation: 90,
              },
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
                labelString: "PM2.5 (µg/m3)",
                fontColor: "#415c7b"
              }
            }]
          }
        }
      });
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Draw Forecast Graph
  // --------------------------------------------------------------------------------------------------------------------
  getForecastGraphData(graph_feeds) {
    if(graph_feeds.length > 0) {
      let x_data       = [];
    let y_data       = [];
    let bar_colors   = [];

    graph_feeds     = graph_feeds.slice(0, 24);
    for(let i = 0; i < graph_feeds.length; i++) {
      y_data.push(parseFloat(graph_feeds[i].prediction_value));
      x_data.push(this.api.graphTime(graph_feeds[i].prediction_time));
      bar_colors.push(this.api.nodeStatus(graph_feeds[i].prediction_value, null).color);
    }

    this.barChartForecast = new Chart(this.barCanvasForecast.nativeElement, {
      type: 'bar',
      data: {
        labels: x_data,
        datasets: [{
          label: "PM2.5 (µg/m3)",
          data: y_data,
          backgroundColor: bar_colors,
          borderColor: bar_colors,
          borderWidth: 0
        }]
      },
      options: {
        tooltips: {
          "enabled": true
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            ticks: {
              autoSkip : false,
            },
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
              labelString: "PM2.5 (µg/m3)",
              fontColor: "#415c7b"
            }
          }]
        }
      }
    });
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - store node history info offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineStoreHistoryStoreNodeInfo(history_array, node) {
    this.storage.get("history").then((val) => {
      let __node_history  = [];

      let history_data    = {
        channel_id: this.node.channel_id,
        node: node,
        history: history_array
      };

      if(val != null && val != '' && val && val.length > 0) {
        if(val.filter(item => item.channel_id === this.node.channel_id).length != 0){
          for(let i = 0; i < val.length; i++){
            if(val[i].channel_id == this.node.channel_id) {
              val[i].history = history_array;
              break;
            }
          }
        } else {
          val.push(history_data);
        }
        __node_history = val;
        this.storage.set('history', __node_history);
      } else {
        __node_history.push(history_data);
        this.storage.set('history', __node_history);
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - store node forecast info offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineStoreForecastStoreNodeInfo(forecast_array) {
    this.storage.get("forecast").then((val) => {
      let __node_forecast  = [];

      let forecast_data    = {
        channel_id: this.node.channel_id,
        forecast: forecast_array
      };

      if(val != null && val != '' && val && val.length > 0) {
        if(val.filter(item => item.channel_id === this.node.channel_id).length != 0){
          for(let i = 0; i < val.length; i++){
            if(val[i].channel_id == this.node.channel_id) {
              val[i].forecast = forecast_array;
              break;
            }
          }
        } else {
          val.push(forecast_data);
        }
        __node_forecast = val;
        this.storage.set('forecast', __node_forecast);
      } else {
        __node_forecast.push(forecast_data);
        this.storage.set('forecast', __node_forecast);
      }
    });
   }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - retrieve node history info offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadHistoryNodeInfo() {
    this.storage.get("history").then((val) => {
      if(val != null && val != '' && val) {
        for(let i = 0; i < val.length; i++){
          if(val[i].channel_id == this.node.channel_id) {
            this.node = val[i].node;
            this.getHistoryGraphData(val[i].history);
            break;
          }
        }
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - retrieve node forecast info offline
  // --------------------------------------------------------------------------------------------------------------------
  offlineLoadForecastNodeInfo() {
    this.storage.get("forecast").then((val) => {
      if(val != null && val != '' && val) {
        for(let i = 0; i < val.length; i++){
          if(val[i].channel_id == this.node.channel_id) {
            this.getForecastGraphData(val[i].forecast);
            break;
          }
        }
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Add Node to favorites list
  // --------------------------------------------------------------------------------------------------------------------
  addToFavoritesList(node) {
    if(this.is_favorite){
      this.alertCtrl.create({
        title: 'Remove from My Places',
        message: `Would you like to remove ${node.name} to your places?'`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'Yes',
            handler: () => {
              this.storage.get('favorites').then((val) => {
                let nodes = [];
                if(val && val != null && val != '' && val.length > 0) {
                  if(val.filter(item => item.channel_id === node.channel_id).length != 0){
                    this.is_favorite = false;
                    for(let i = 0; i < val.length; i++) {
                      if(val[i].channel_id == node.channel_id) {
                        val.splice(i, 1);
                        this.storage.set("favorites", val);

                        this.toastCtrl.create({
                          message: `${node.name} has been removed from your places`,
                          duration: 2000,
                          position: 'bottom'
                        }).present();
                      }
                    }
                  } else {
                    val.push(node);
                    this.storage.set('favorites', val);
                    this.is_favorite = true;

                    this.toastCtrl.create({
                      message: `${node.name} has been removed from your places`,
                      duration: 2000,
                      position: 'bottom'
                    }).present();
                  }
                } else {
                  nodes.push(node);
                  this.storage.set('favorites', nodes);
                  this.is_favorite = true;

                  this.toastCtrl.create({
                    message: `${node.name} has been added to your places`,
                    duration: 2000,
                    position: 'bottom'
                  }).present();
                }
              });
            }
          }
        ]
      }).present();
    }
    else{
      this.alertCtrl.create({
        title: 'Add To My Places',
        message: `Would you like to add ${node.name} to your places?'`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'yes',
            handler: () => {
              this.storage.get('favorites').then((val) => {
                let nodes = [];
                if(val && val != null && val != '' && val.length > 0) {
                  if(val.filter(item => item.channel_id === node.channel_id).length != 0){
                    this.is_favorite = false;
                    this.toastCtrl.create({
                      message: `${node.name} already among of your places`,
                      duration: 2000,
                      position: 'bottom'
                    }).present();
                  } else {
                    val.push(node);
                    this.storage.set('favorites', val);
                    this.is_favorite = true;

                    this.toastCtrl.create({
                      message: `${node.name} has been added to your places`,
                      duration: 2000,
                      position: 'bottom'
                    }).present();
                  }
                } else {
                  nodes.push(node);
                  this.storage.set('favorites', nodes);
                  this.is_favorite = true;

                  this.toastCtrl.create({
                    message: `Sorry, ${node.name} cannot be added to your places`,
                    duration: 2000,
                    position: 'bottom'
                  }).present();
                }
              });
            }
          }
        ]
      }).present();
    }

  }


  // --------------------------------------------------------------------------------------------------------------------
  // Check if node exists in favorites list
  // --------------------------------------------------------------------------------------------------------------------
  async isNodeFavorite(node) {
    if(node.channel_id) {
      await this.storage.get('favorites').then((val) => {
        if(val && val != null && val != '' && val.length > 0) {
          if(val.filter(item => item.channel_id === node.channel_id).length != 0){
            this.is_favorite =  true;
          } else {
            this.is_favorite =  false;
          }
        } else {
          this.is_favorite =  false;
        }
      });
    } else {
      this.is_favorite =  true;
    }
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