import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from '../../providers/api/api';
import leaflet from 'leaflet';

import { NodePage } from '../node/node';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;

  user: any = {};

  nodes: any = [];

  nodes_list_api = `${this.api.api_endpoint}/airqoPlacesCached`;
  places_nodes_list_api_success: any;

  constructor(public navCtrl: NavController, private storage: Storage, private loadingCtrl: LoadingController,
    private http: HttpClient, private alertCtrl: AlertController, private api: ApiProvider, private elementRef: ElementRef) {
  }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: 
  // --------------------------------------------------------------------------------------------------------------------
  async ionViewDidLoad() {
    await this.loadMap();
    await this.loadNodes();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Fires everytime page loads
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidEnter() {}


  // --------------------------------------------------------------------------------------------------------------------
  // Load the map
  // --------------------------------------------------------------------------------------------------------------------
  loadMap() {
    this.map = leaflet.map("map").setView([0.283670, 32.600399], 6);
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Load Nodes from online
  // --------------------------------------------------------------------------------------------------------------------
  loadNodes() {
    if(this.api.isConnected()) {
      this.onlineLoadNodes();
    } else {
      this.api.offlineMessage();
      this.offlineLoadNodes();
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Online - Load Nodes from online
  // --------------------------------------------------------------------------------------------------------------------
  onlineLoadNodes() {
    let loader = this.loadingCtrl.create({
      spinner: 'ios',
      enableBackdropDismiss: true,
      dismissOnPageChange: true,
      showBackdrop: true
    });

    let params = {
      api: this.api.api_key
    };
    
    loader.present().then(() => {
      this.http.post(this.nodes_list_api, params).subscribe((result: any) => {
        console.log(result);
        loader.dismiss(); 

        this.places_nodes_list_api_success = result.success;
        if (result.success == '100') {
          this.nodes = result.nodes;
          this.offlineStoreNodes();
        } else {
          this.offlineLoadNodes();
          this.alertCtrl.create({
            title: result.title,
            message: result.message,
            buttons: ['Okay']
          }).present();
        }
      }, (err) => {
        loader.dismiss();

        this.offlineLoadNodes();
        this.api.networkErrorMessage();
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - store nodes offline
  // --------------------------------------------------------------------------------------------------------------------
  async offlineStoreNodes() {
    await this.addMarkers();
   await this.storage.set("nodes", this.nodes);
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Offline - retrieve nodes offline
  // --------------------------------------------------------------------------------------------------------------------
  async offlineLoadNodes() {
    await this.storage.get("nodes").then((val) => {
      if(val != null && val != '' && val.length > 0) {
        this.nodes = val;
        this.addMarkers();
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Add markers
  // --------------------------------------------------------------------------------------------------------------------
  addMarkers() {
    if(this.nodes != null && this.nodes != '' && this.nodes.length > 0) {

      for(let i = 0; i < this.nodes.length; i++) {
        try{
          if(this.nodes[i].lat && this.nodes[i].lng) {
            let airqo_marker = leaflet.divIcon({
              className: 'custom-airqo-icon',
              html: ''+
                  '<div style="background-color: '+ this.api.nodeStatus(this.nodes[i].field2, this.nodes[i].time).color +';" class="marker-pin"></div>'+
                  '<span class="marker-number" style="color: '+ this.api.nodeStatus(this.nodes[i].field2, this.nodes[i].time).font_color +';">'+ Math.round(this.nodes[i].field2) +'</span>',
              iconSize: [30, 42],
              iconAnchor: [15, 42],
              popupAnchor: [0, -30]
            });

            if( !this.nodes[i].time || this.nodes[i].time === "")
              continue

            let airqo_popup = ''+
                '<div class="marker-popup">'+
                '<a class="marker-popup-click" data-markerId="'+ this.nodes[i].channel_id +'">'+
                '<div class="top-section center">'+
                '<p class="title">'+ this.nodes[i].name + '</p>'+
                '<p class="sub-title grey">'+ this.nodes[i].location +'</p>'+
                '</div>'+
                '<div class="mid-section center" style="background-color: '+ this.api.nodeStatus(this.nodes[i].field2, this.nodes[i].time).color +';">'+
                '<div class="face bg-darker">'+
                '<img src="'+ this.api.nodeStatus(this.nodes[i].field2, this.nodes[i].time).face +'"/>'+
                '</div>'+
                '<div class="reading">'+
                '<p style="color: '+ this.api.nodeStatus(this.nodes[i].field2, this.nodes[i].time).font_color +';">'+
                this.nodes[i].field2.trim() +
                '<br/>PM<sub>2.5</sub>'+
                '</p>'+
                '</div>'+
                '<div class="label">'+
                '<p style="color: '+ this.api.nodeStatus(this.nodes[i].field2, this.nodes[i].time).font_color +';">'+ this.api.nodeStatus(this.nodes[i].field2, this.nodes[i].time).label +'</p>'+
                '</div>'+
                '</div>'+
                '<div class="bottom-section">'+
                '<p class="refresh-date grey">Last Refreshed: '+ this.api.ago(this.api.getReadableInternationalDateFormatFromISOString(this.nodes[i].time)) +'</p>'+
                '</div>'+
                '</a>'+
                '</div>'
            ;

            let airqo_popup_options = {
              className: 'custom',
              width: 400,
              height: 150,
              closeButton: false,
              autoClose: false
            };

            leaflet.marker([parseFloat(this.nodes[i].lat), parseFloat(this.nodes[i].lng)], { icon: airqo_marker }).addTo(this.map)
                .bindPopup(airqo_popup, airqo_popup_options).on('click', function(e) {

            })
                .on('popupopen', (res) => {
                  this.elementRef.nativeElement.querySelector(".marker-popup-click").addEventListener('click', (e) => {
                    console.log(e.target.getAttribute("data-markerId"));

                    console.log(this.nodes[i]);

                    let node = {
                      channel_id: this.nodes[i].channel_id,
                      name: this.nodes[i].name,
                      location: this.nodes[i].location,
                      lat: this.nodes[i].lat,
                      lng: this.nodes[i].lng,
                      refreshed: this.nodes[i].time,
                      field1: this.nodes[i].field2,
                      feeds: this.nodes[i].lastfeeds,
                    };

                    // this.navCtrl.push(NodePage, {node: this.api.nodeToStorage(node)});
                    this.viewDetails(this.api.nodeToStorage(node));
                  });
                });
          }
        }
        catch (e) {
          console.log('add Markers error');
          console.log(e);
        }

      }
    }
  }


  // --------------------------------------------------------------------------------------------------------------------
  // View Node Details
  // --------------------------------------------------------------------------------------------------------------------
  viewDetails(node) {
    this.navCtrl.push(NodePage, {
      node: node
    });
  }
}