import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';

import { RestProvider } from '../../providers/rest/rest';

import { Chart } from 'chart.js';

@Component({
  selector: 'page-node-details',
  templateUrl: 'node-details.html',
})
export class NodeDetailsPage {

  @ViewChild('barCanvas') barCanvas;
  barChart: any;
  
  api_url  = 'http://airqo.net/apis/ios/ver3.0/field.php';

  node: any = {};
  class: any;
  node_data: any;
  skeleton: number = 1;

  last_updateDate: String;

  x_data: any;
  y_data: any;
  bar_colors: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public restProvider: RestProvider,
    public modalCtrl: ModalController) { }
  
  
  // --------------------------------------------------------------------------------------------------------------------
  // Pick Parameters Passed Before View Loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewCanEnter() {
    if(this.navParams.get('node')){
      this.node = this.navParams.get('node');
    } else {
      this.navCtrl.pop();
    }
  }

    
  // --------------------------------------------------------------------------------------------------------------------
  // Pick Graph Data When View Loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {
    console.clear();
    console.log(this.node);

    if(this.node){
      this.getGraphData();
    } else {
      this.navCtrl.pop();
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fetch Bar Graph Data
  // --------------------------------------------------------------------------------------------------------------------
  getGraphData() {

    this.x_data       = [];
    this.y_data       = [];
    this.bar_colors   = [];
    this.node_data    = {'channel': this.node.channel_id, 'field': '2'};

    console.log(this.node.channel_id);
    console.log(this.node_data);

    this.restProvider.postData(this.api_url, this.node_data).then((result:any) => {

      this.last_updateDate = this.restProvider.convertDate(result.channel.updated_at);
      
      var field_reading;
      for(var i = 0; i < result.feeds.length; i++){

        var time        = this.restProvider.convertTime(result.feeds[i].created_at);
        field_reading   = parseFloat(result.feeds[i].field2);

        if(!field_reading || field_reading == null || field_reading == '' || field_reading == 'null' || field_reading == 'NaN'){
          field_reading = '0.00';
        }

        this.x_data.push(time);
        this.y_data.push(parseFloat(parseFloat(field_reading).toFixed(2)));

        if(field_reading <= 12 ){
          this.bar_colors.push("#abe261");
        } else if(field_reading >= 12.1 && field_reading <= 35.5){
          this.bar_colors.push("#fed74a");
        } else if(field_reading >= 35.6 && field_reading <= 55.4){
          this.bar_colors.push("#ffa563");
        } else if(field_reading >= 55.5 && field_reading <= 150.4){
          this.bar_colors.push("#ff7777");
        } else if(field_reading >= 150.5 && field_reading <= 250.4){
          this.bar_colors.push("#7c47b5");
        } else if(field_reading >= 250.5){
          this.bar_colors.push("#930b15");
        } else {
          this.bar_colors.push("#ffffff");
        }
      }

      setTimeout(() => {
        this.skeleton = 0;
        this.loadGraph(this.x_data, this.y_data, this.bar_colors);
      }, 500);

    }, (err) => {
      console.log(JSON.stringify(err));
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Draw Bar Graph
  // --------------------------------------------------------------------------------------------------------------------
  loadGraph(x_data, y_data, bar_colors){

    console.clear();
    console.log(y_data);
    console.log(x_data);
    console.log(bar_colors);

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
