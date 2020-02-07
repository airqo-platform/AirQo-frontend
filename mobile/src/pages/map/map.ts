import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import * as $ from 'jquery';

import { NodeDetailsPage } from '../node-details/node-details';
import { RestProvider } from '../../providers/rest/rest';

declare var google;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;

  labels: string  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  labelIndex      = 0;

  last_refresh_date: any;

  markers: any = {};
  refresh_date: any;

  constructor(public navCtrl: NavController, public restProvider: RestProvider, public navParams: NavParams, 
    public storage: Storage){ }


  // --------------------------------------------------------------------------------------------------------------------
  // When the view loads: load the map, get the markers
  // --------------------------------------------------------------------------------------------------------------------
  ionViewDidLoad() {
    this.loadMap();
    this.getMarkers();
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Load the map
  // --------------------------------------------------------------------------------------------------------------------
  loadMap() {

    let latLng = new google.maps.LatLng(0.28367998, 32.59309769);

    let mapOptions = {
      center: latLng,
      // disableDefaultUI: true,
      zoom: 6,
      zoomControl : true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      panControl : true,
      mapTypeControl: false,
      overviewMapControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      scaleControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
  }

  
  // --------------------------------------------------------------------------------------------------------------------
  // Get Markers from Local Storage
  // --------------------------------------------------------------------------------------------------------------------
  getMarkers() {

    this.storage.get('last_refresh_date').then((val) => {
      if(val != null) {
        this.last_refresh_date   = this.restProvider.convertDate(val);
      } else {
        this.last_refresh_date   = 'Unavailable';
      }
    });

    this.storage.get('node_list').then((val) => {
      if(val != null) {
        this.markers = val;

        for (let i = 0; i < this.markers.length; i++) {
          this.addMarkerToMap(this.markers[i]);
        }
      } else {
        this.navCtrl.pop();
      }
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Drop Markers on the Map
  // --------------------------------------------------------------------------------------------------------------------
  addMarkerToMap(marker) {

    var channel   = marker.channel_id;
    var name      = marker.name;
    var image     = this.restProvider.nodeStatus(marker.reading).marker;
    var label     = this.restProvider.nodeStatus(marker.reading).label;
    var css_class = this.restProvider.nodeStatus(marker.reading).class;
    var value     = marker.reading;
    var lat       = marker.lat;
    var lng       = marker.lng;

    var icon = {
      url: image,
      scaledSize: new google.maps.Size(25, 40),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(0, 0),
    };

    var info_window = new google.maps.InfoWindow({
      // content: '<table class="marker"><tr><td><span class="title-marker-name">Area </span></td><td><span class="marker-name">'+ name +'</span></td></tr><tr><td><span class="title-marker-reading">Reading </span></td><td><span class="marker-reading">'+ value +'</span></td></tr><tr><td><span class="title-marker-label">Status </span></td><td><span class="marker-label '+ css_class +'">'+ label +'</span></td></tr><tr><td colspan="2" class="button-td"><button class="btn-view-node">View Node</button></td></tr></table>'
      content: '<table class="marker"><tr><td><span class="title-marker-name">Area </span></td><td><span class="marker-name">'+ name +'</span></td></tr><tr><td><span class="title-marker-reading">Reading </span></td><td><span class="marker-reading">'+ value +'</span></td></tr><tr><td><span class="title-marker-label">Status </span></td><td><span class="marker-label '+ css_class +'">'+ label +'</span></td></tr></table>'
    });

    var position        = new google.maps.LatLng(lat, lng);
    var location_marker = new google.maps.Marker({ position: position, title: name, animation: google.maps.Animation.DROP, icon: icon, infoWindow: info_window });
    
    location_marker.addListener('click', function() {
      info_window.open(this.map, location_marker);
    });

    location_marker.setMap(this.map);

    
    google.maps.event.addListener(info_window, 'domready', () => {
      $('.marker').click((e) => {
        this.navCtrl.push(NodeDetailsPage, {
          node: marker
        });
      });
    });
  }


  // --------------------------------------------------------------------------------------------------------------------
  // Go to Node Details page
  // --------------------------------------------------------------------------------------------------------------------
  goToDetailsPage(node){
    console.log("Go To The Clikced node..."+ node);
    this.navCtrl.push(NodeDetailsPage, {
      node: node
    });
  }

}
