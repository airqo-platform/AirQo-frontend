import { ForgotPasswordPage } from './../pages/forgot-password/forgot-password';
import { AddNodeSubscriptionPage } from './../pages/add-node-subscription/add-node-subscription';
import { FeedbackPage } from './../pages/feedback/feedback';
import { DailyReportsPage } from './../pages/daily-reports/daily-reports';
import { Network } from '@ionic-native/network';
import { AddPlacePage } from './../pages/add-place/add-place';
import { NodePage } from './../pages/node/node';
import { Geolocation } from '@ionic-native/geolocation';
import { SignUpPage } from './../pages/sign-up/sign-up';
import { SignInPage } from './../pages/sign-in/sign-in';
import { SettingsPage } from './../pages/settings/settings';
import { SearchPage } from './../pages/search/search';
import { MenuPage } from './../pages/menu/menu';
import { MapPage } from './../pages/map/map';
import { KeyPage } from './../pages/key/key';
import { IntroPage } from './../pages/intro/intro';
import { FavoritesPage } from './../pages/favorites/favorites';
import { CameraPage } from './../pages/camera/camera';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { SQLite } from '@ionic-native/sqlite';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ApiProvider } from '../providers/api/api';
import { AppRate } from '@ionic-native/app-rate';
import { CameraPreview } from '@ionic-native/camera-preview';
import { Camera } from '@ionic-native/camera';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    CameraPage,
    FavoritesPage,
    IntroPage,
    KeyPage,
    MapPage,
    MenuPage,
    NodePage,
    SearchPage,
    SettingsPage,
    SignInPage,
    SignUpPage,
    ForgotPasswordPage,
    AddPlacePage,
    DailyReportsPage,
    FeedbackPage,
    AddNodeSubscriptionPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    CameraPage,
    FavoritesPage,
    IntroPage,
    KeyPage,
    MapPage,
    MenuPage,
    NodePage,
    SearchPage,
    SettingsPage,
    SignInPage,
    SignUpPage,
    ForgotPasswordPage,
    AddPlacePage,
    DailyReportsPage,
    FeedbackPage,
    AddNodeSubscriptionPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    Device,
    SQLite,
    Geolocation,
    SocialSharing,
    ApiProvider,
    Network,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    AppRate,
  ]
})
export class AppModule {}
