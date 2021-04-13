import { AddNodeSubscriptionPage } from './../pages/add-node-subscription/add-node-subscription';
import { FeedbackPage } from './../pages/feedback/feedback';
import { DailyReportsPage } from './../pages/daily-reports/daily-reports';
import { AddPlacePage } from './../pages/add-place/add-place';
import { NodePage } from './../pages/node/node';
import { Geolocation } from '@ionic-native/geolocation';
import { SettingsPage } from './../pages/settings/settings';
import { SearchPage } from './../pages/search/search';
import { MenuPage } from './../pages/menu/menu';
import { MapPage } from './../pages/map/map';
import { KeyPage } from './../pages/key/key';
import { IntroPage } from './../pages/intro/intro';
import { FavoritesPage } from './../pages/favorites/favorites';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ApiProvider } from '../providers/api/api';
import { AppRate } from '@ionic-native/app-rate';
import { Network } from '@ionic-native/network';
import { Device } from '@ionic-native/device';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    FavoritesPage,
    IntroPage,
    KeyPage,
    MapPage,
    MenuPage,
    NodePage,
    SearchPage,
    SettingsPage,
    AddPlacePage,
    DailyReportsPage,
    FeedbackPage,
    AddNodeSubscriptionPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '_mydb',
      driverOrder: ['indexeddb', 'sqlite', 'websql'],
    }),
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    FavoritesPage,
    IntroPage,
    KeyPage,
    MapPage,
    MenuPage,
    NodePage,
    SearchPage,
    SettingsPage,
    AddPlacePage,
    DailyReportsPage,
    FeedbackPage,
    AddNodeSubscriptionPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    SocialSharing,
    ApiProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    AppRate,
    Network,
    Device,
  ]
})
export class AppModule {}
