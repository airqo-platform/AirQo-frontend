webpackJsonp([0],{

/***/ 110:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return KeyPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(8);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


/**
 * Generated class for the KeyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
var KeyPage = /** @class */ (function () {
    function KeyPage(navCtrl, navParams) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
    }
    KeyPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad KeyPage');
    };
    KeyPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-key',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\key\key.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>Key</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content>\n  <table text-wrap>\n  	<tbody>\n  		<tr class="heading" style="padding: 3rem !important;">\n  			<!-- <th>PM<sub>2.5</sub> concentration mapping</th> -->\n  			<th>&nbsp;&nbsp;Classification&nbsp;&nbsp;</th>\n  			<th>Health Implications/Precaution statement.</th>\n  		</tr>\n  		<tr class="bg-green">\n  			<td class="td-images">\n          <img src="assets/faces/1-dark.png" class="face"/><br />\n        </td>\n  			<td class="td-text black">\n          <span class="title black">Good (0 - 12)</span><br/><br/>\n          Air quality is good for everyone.\n        </td>\n  		</tr>\n  		<tr class="bg-yellow">\n        <td class="td-images">\n          <img src="assets/faces/2-dark.png" class="face"/><br />\n        </td>\n  			<td class="td-text ">\n          <span class="title black">Moderate (12.1 - 35.4)</span><br/><br/>\n          <b class="black">Unusually sensitive people</b>\n          <span class="black">: Consider reducing prolonged or heavy exertion.</span>\n          <br /><br />\n\n          <b class="black">Everyone else</b>\n          <span class="black">: Air pollution poses little or no risk.</span>\n        </td>\n  		</tr>\n  		<tr class="bg-orange">\n        <td class="td-images">\n          <img src="assets/faces/3.png" class="face"/><br />\n        </td>\n  			<td class="td-text">\n          <span class="title">Unhealthy for sensitive groups (35.6 - 55.4)</span><br/><br/>\n          <b>Sensitive groups</b>: Reduce prolonged or heavy exertion. It&#39;s OK to be active outside, but take more breaks and do less intense activities.<br /><br />\n\n          <b>People with asthma </b>should follow their asthma action plans and keep quick relief medicine handy.<br /><br />\n\n          <b>If you have heart disease</b>: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of<br />these, contact your heath care provider.\n        </td>\n  		</tr>\n  		<tr class="bg-red">\n        <td class="td-images">\n          <img src="assets/faces/4.png" class="face"/><br />\n        </td>\n  			<td class="td-text">\n          <span class="title">Unhealthy (55.5 - 150.4)</span><br/><br/>\n          <b>Sensitive groups</b>: Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling.<br /><br />\n\n          <b>Everyone else</b>: Reduce prolonged or heavy exertion. Take more breaks during all outdoor activities.\n        </td>\n  		</tr>\n  		<tr class="bg-purple">\n        <td class="td-images">\n          <img src="assets/faces/5.png" class="face"/><br />\n        </td>\n  			<td class="td-text">\n          <span class="title">Very unhealthy (150.5 - 250.4)</span><br/><br/>\n          <b>Sensitive groups</b>: Avoid all physical activity outdoors. Move activities indoors or reschedule to a time when air quality is better.<br /><br />\n\n  			  <b>Everyone else</b>: Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling to a time when air quality is better.<br />\n          &nbsp;\n        </td>\n  		</tr>\n  		<tr class="bg-maroon">\n        <td class="td-images">\n          <img src="assets/faces/6.png" class="face"/><br />\n        </td>\n  			<td class="td-text">\n          <span class="title">Hazardous (250.5 - 500.4)</span><br/><br/>\n          <b>Everyone</b>: Avoid all physical activity outdoors.<br /><br />\n          \n          <b>Sensitive groups</b>: Remain indoors and keep activity levels low. Follow tips for keeping particle levels low indoors.\n        </td>\n  		</tr>\n  	</tbody>\n  </table>\n\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\key\key.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* NavParams */]])
    ], KeyPage);
    return KeyPage;
}());

//# sourceMappingURL=key.js.map

/***/ }),

/***/ 111:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AddPlacePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_forms__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_debounceTime__ = __webpack_require__(344);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_debounceTime___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_debounceTime__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};







var AddPlacePage = /** @class */ (function () {
    function AddPlacePage(navCtrl, navParams, storage, toastCtrl, viewCtrl, loadingCtrl, http, alertCtrl, api) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.storage = storage;
        this.toastCtrl = toastCtrl;
        this.viewCtrl = viewCtrl;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.alertCtrl = alertCtrl;
        this.api = api;
        this.user = {};
        this.nodes = [];
        this.holding_array_nodes = [];
        this.favorite_nodes = [];
        this.textInput = new __WEBPACK_IMPORTED_MODULE_5__angular_forms__["a" /* FormControl */]('');
        this.get_places_nodes_list_api = this.api.api_endpoint + "/airqoPlacesCached";
        this.textInput
            .valueChanges
            .debounceTime(500)
            .subscribe(function (value) {
            _this.searchNodesList(value);
        });
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.ionViewDidLoad = function () {
        this.getUserInfo();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires every time page loads
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.ionViewDidEnter = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.onlineLoadNodes()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get User's info
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.getUserInfo = function () {
        var _this = this;
        this.storage.get('user_data').then(function (val) {
            if (val && val != null && val != '') {
                _this.user = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Load Nodes from online
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.onlineLoadNodes = function () {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'ios',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        var params = {
            api: this.api.api_key
        };
        loader.present().then(function () {
            _this.http.post(_this.get_places_nodes_list_api, params).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                _this.places_nodes_list_api_success = result.success;
                if (result.success == '100') {
                    _this.nodes = result.nodes;
                    _this.holding_array_nodes = _this.nodes;
                    _this.offlineStoreNodes();
                }
                else {
                    _this.offlineLoadNodes();
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                _this.offlineLoadNodes();
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - store nodes offline
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.offlineStoreNodes = function () {
        this.storage.set("nodes", this.nodes);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - retrieve nodes offline
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.offlineLoadNodes = function () {
        var _this = this;
        this.storage.get("nodes").then(function (val) {
            if (val != null && val != '' && val.length > 0) {
                _this.nodes = val;
                _this.holding_array_nodes = _this.nodes;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - Load favorites list
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.offlineLoadFavorites = function () {
        var _this = this;
        this.storage.get('favorites').then(function (val) {
            if (val && val != null && val != '' && val.length > 0) {
                _this.favorite_nodes = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Remove single node from list
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.removeSingleNodeFromList = function (node) {
        if (this.nodes.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].channel_id == node.channel_id) {
                    this.nodes.splice(i, 1);
                }
            }
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // TODO: Remove array of favorites nodes from list
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.removeMultipleNodesFromList = function () {
        var _this = this;
        this.nodes = this.nodes.filter(function (item) { return !_this.favorite_nodes.includes(item); });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Add Node to favorites list
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.addToFavoritesList = function (node) {
        var _this = this;
        this.storage.get('favorites').then(function (val) {
            var nodes = [];
            if (val && val != null && val != '' && val.length > 0) {
                if (val.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
                    _this.toastCtrl.create({
                        message: 'Place already added',
                        duration: 2000,
                        position: 'bottom'
                    }).present();
                    _this.removeSingleNodeFromList(node);
                }
                else {
                    val.push(node);
                    _this.storage.set('favorites', val);
                    _this.removeSingleNodeFromList(node);
                    _this.toastCtrl.create({
                        message: 'Added',
                        duration: 2000,
                        position: 'bottom'
                    }).present();
                }
            }
            else {
                nodes.push(node);
                _this.storage.set('favorites', nodes);
                _this.removeSingleNodeFromList(node);
                _this.toastCtrl.create({
                    message: 'Added',
                    duration: 2000,
                    position: 'bottom'
                }).present();
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Search Nodes List
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.searchNodesList = function (search_term) {
        this.nodes = this.holding_array_nodes;
        if (search_term && search_term.trim() != '') {
            this.nodes = this.nodes.filter(function (item) {
                return (item.name.toLowerCase().indexOf(search_term.toLowerCase()) > -1);
            });
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Close Modal
    // --------------------------------------------------------------------------------------------------------------------
    AddPlacePage.prototype.closeModal = function () {
        var _this = this;
        this.storage.get('favorites').then(function (val) {
            if (val && val != null && val != '' && val.length > 0) {
                _this.viewCtrl.dismiss();
            }
            else {
                _this.toastCtrl.create({
                    message: 'Please add a favorite place',
                    duration: 2000,
                    position: 'bottom'
                }).present();
            }
        });
    };
    AddPlacePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["m" /* Component */])({
            selector: 'page-add-place',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\add-place\add-place.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>Add Place</ion-title>\n    <ion-buttons end>\n      <button (click)="closeModal()" color="blue" ion-button icon-only round clear>\n        <ion-icon name="md-close"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n<ion-content padding>\n  <p class="title" *ngIf="places_nodes_list_api_success == \'100\'">Select or search a place to add to favorites</p>\n  <ion-searchbar type="text" color="light" placeholder="Search city or area" clearInput [formControl]="textInput"></ion-searchbar>\n  <ion-list *ngIf="places_nodes_list_api_success == \'100\'">\n    <ion-item *ngFor="let node of nodes" (click)="addToFavoritesList(node)">\n      <ion-icon name="pin" color="grey" item-start></ion-icon>\n      <div class="area-title">{{ node.name }}</div>\n      <div class="area-sub-title">{{ node.location }}</div>\n    </ion-item>\n  </ion-list>\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\add-place\add-place.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["n" /* ToastController */],
            __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["o" /* ViewController */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClient */],
            __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_4__providers_api_api__["a" /* ApiProvider */]])
    ], AddPlacePage);
    return AddPlacePage;
}());

//# sourceMappingURL=add-place.js.map

/***/ }),

/***/ 112:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SignInPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__forgot_password_forgot_password__ = __webpack_require__(125);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__home_home__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__sign_up_sign_up__ = __webpack_require__(349);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_api_api__ = __webpack_require__(16);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var SignInPage = /** @class */ (function () {
    function SignInPage(navCtrl, navParams, toastCtrl, http, loadingCtrl, storage, alertCtrl, api) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.toastCtrl = toastCtrl;
        this.http = http;
        this.loadingCtrl = loadingCtrl;
        this.storage = storage;
        this.alertCtrl = alertCtrl;
        this.api = api;
        this.user = {};
        this.remember_me = 'yes';
        this.password_type = 'password';
        this.password_icon = 'eye-off';
        this.sign_in_api = this.api.api_endpoint + "/airqoUserLogin";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // When the view loads: 
    // --------------------------------------------------------------------------------------------------------------------
    SignInPage.prototype.ionViewDidLoad = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Show or Hide Password
    // --------------------------------------------------------------------------------------------------------------------
    SignInPage.prototype.hideShowPassword = function () {
        this.password_type = this.password_type === 'text' ? 'password' : 'text';
        this.password_icon = this.password_icon === 'eye-off' ? 'eye' : 'eye-off';
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Remember Me Checkbox Clicked
    // --------------------------------------------------------------------------------------------------------------------
    SignInPage.prototype.checkboxClicked = function (event, value) {
        if (event.checked) {
            this.remember_me = 'yes';
        }
        else {
            this.remember_me = 'no';
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Validate Credentials
    // --------------------------------------------------------------------------------------------------------------------
    SignInPage.prototype.validateCredentials = function () {
        if (Object.keys(this.user).length > 0) {
            if (this.remember_me == 'yes') {
                this.storage.set('remember_me', this.user);
            }
            else {
                this.storage.set('remember_me', null);
            }
            var params = {
                email: this.user.email,
                password: this.user.password,
                api: this.api.api_key
            };
            this.submitSignInInfo(params);
        }
        else {
            this.toastCtrl.create({
                message: 'Please enter Email and Password',
                duration: 3000,
                position: 'bottom'
            }).present();
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Submit Sign In Information
    // --------------------------------------------------------------------------------------------------------------------
    SignInPage.prototype.submitSignInInfo = function (data) {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'dots',
            content: 'Please wait...',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        loader.present().then(function () {
            _this.http.post(_this.sign_in_api, data).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                if (result.success == "100") {
                    _this.user = {
                        uid: result.id,
                        name: result.name,
                        email: result.email,
                        token: result.token,
                    };
                    _this.storage.set('user_data', _this.user).then(function () {
                        _this.navCtrl.setRoot(__WEBPACK_IMPORTED_MODULE_1__home_home__["a" /* HomePage */]);
                    });
                }
                else {
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Sign Up Page
    // --------------------------------------------------------------------------------------------------------------------
    SignInPage.prototype.goToSignUpPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_2__sign_up_sign_up__["a" /* SignUpPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Forgot Password Page
    // --------------------------------------------------------------------------------------------------------------------
    SignInPage.prototype.goToForgotPasswordPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_0__forgot_password_forgot_password__["a" /* ForgotPasswordPage */]);
    };
    SignInPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_3__angular_core__["m" /* Component */])({
            selector: 'page-sign-in',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\sign-in\sign-in.html"*/'<ion-header>\n  <ion-navbar color="blue">\n    <ion-title>Sign In</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content>\n\n  <ion-card>\n    <ion-card-content>\n      \n      <div class="logo-section">\n        <img src="assets/logos/logo-blue-tagline.png"/>\n      </div>\n\n      <ion-list class="signin-form-section">\n\n        <ion-item>\n          <ion-label stacked>Email</ion-label>\n          <ion-input type="email" [(ngModel)]="user.email" placeholder="Email"></ion-input>\n        </ion-item>\n      \n        <ion-item>\n          <ion-label stacked>Password</ion-label>\n          <ion-input [type]="password_type" [(ngModel)]="user.password" placeholder="Password"></ion-input>\n          <button ion-button icon-only item-right clear color="dark" (click)="hideShowPassword()"><ion-icon item-end [name]="password_icon" class="password-icon"></ion-icon></button>\n        </ion-item>\n\n        <ion-grid class="user-preference">\n          <ion-row>\n            <ion-col col-6>\n              <ion-item>\n                <ion-label text-wrap>Remember me</ion-label>\n                <ion-checkbox color="blue" (ionChange)="checkboxClicked($event, \'\')"></ion-checkbox>\n              </ion-item>\n            </ion-col>\n            <ion-col col-6>\n              <ion-item (click)="goToForgotPasswordPage()">\n                <ion-label>Forgot Password?</ion-label>\n              </ion-item>\n            </ion-col>\n          </ion-row>\n        </ion-grid>\n\n        <button ion-button block color="blue" (click)="validateCredentials()">SIGN IN</button>\n\n        <p class="or-divider">OR</p>\n\n        <button ion-button block outline (click)="goToSignUpPage()">SIGN UP</button>\n      \n      </ion-list>\n\n    </ion-card-content>\n  </ion-card>\n\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\sign-in\sign-in.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_4_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["n" /* ToastController */], __WEBPACK_IMPORTED_MODULE_5__angular_common_http__["a" /* HttpClient */],
            __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_6__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_4_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_7__providers_api_api__["a" /* ApiProvider */]])
    ], SignInPage);
    return SignInPage;
}());

//# sourceMappingURL=sign-in.js.map

/***/ }),

/***/ 124:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 124;

/***/ }),

/***/ 125:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ForgotPasswordPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__home_home__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_api_api__ = __webpack_require__(16);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var ForgotPasswordPage = /** @class */ (function () {
    function ForgotPasswordPage(navCtrl, navParams, toastCtrl, http, loadingCtrl, storage, alertCtrl, api) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.toastCtrl = toastCtrl;
        this.http = http;
        this.loadingCtrl = loadingCtrl;
        this.storage = storage;
        this.alertCtrl = alertCtrl;
        this.api = api;
        this.user = {};
        this.forgot_password_api = this.api.api_endpoint + "/ForgotPassword";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // When the view loads: 
    // --------------------------------------------------------------------------------------------------------------------
    ForgotPasswordPage.prototype.ionViewDidLoad = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Validate Credentials
    // --------------------------------------------------------------------------------------------------------------------
    ForgotPasswordPage.prototype.validateCredentials = function () {
        if (Object.keys(this.user).length > 0) {
            var params = {
                email: this.user.email,
                api: this.api.api_key
            };
            this.submitSignInInfo(params);
        }
        else {
            this.toastCtrl.create({
                message: 'Please enter an Email',
                duration: 3000,
                position: 'bottom'
            }).present();
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Submit Sign In Information
    // --------------------------------------------------------------------------------------------------------------------
    ForgotPasswordPage.prototype.submitSignInInfo = function (data) {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'dots',
            content: 'Please wait...',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        loader.present().then(function () {
            _this.http.post(_this.forgot_password_api, data).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                if (result.success == "100") {
                    _this.user = {
                        uid: result.id,
                        name: result.name,
                        email: result.email,
                        token: result.token,
                    };
                    _this.storage.set('user_data', _this.user).then(function () {
                        _this.navCtrl.setRoot(__WEBPACK_IMPORTED_MODULE_0__home_home__["a" /* HomePage */]);
                    });
                }
                else {
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    ForgotPasswordPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["m" /* Component */])({
            selector: 'page-forgot-password',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\forgot-password\forgot-password.html"*/'<ion-header>\n  <ion-navbar color="blue">\n    <ion-title>Forgot Password</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content>\n\n  <ion-card>\n    <ion-card-content>\n      \n      <div class="logo-section">\n        <img src="assets/logos/logo-blue-tagline.png"/>\n      </div>\n\n      <ion-list class="signin-form-section">\n\n        <ion-item>\n          <ion-label stacked>Email</ion-label>\n          <ion-input type="email" [(ngModel)]="user.email" placeholder="Email"></ion-input>\n        </ion-item>\n      \n        <button ion-button block color="blue" (click)="validateCredentials()">SUBMIT</button>\n      \n      </ion-list>\n\n    </ion-card-content>\n  </ion-card>\n\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\forgot-password\forgot-password.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["n" /* ToastController */], __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClient */],
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_4__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_5__providers_api_api__["a" /* ApiProvider */]])
    ], ForgotPasswordPage);
    return ForgotPasswordPage;
}());

//# sourceMappingURL=forgot-password.js.map

/***/ }),

/***/ 16:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_native_network__ = __webpack_require__(209);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_device__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_storage__ = __webpack_require__(12);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var ApiProvider = /** @class */ (function () {
    function ApiProvider(network, toastCtrl, device, storage) {
        this.network = network;
        this.toastCtrl = toastCtrl;
        this.device = device;
        this.storage = storage;
        this.api_endpoint = "https://test-dot-airqo-frontend.appspot.com/Apis";
        this.external_api_endpoint = "https://buzentech.com";
        this.api_key = "AQ_9ec70a070c75E6af14FCca86/0621d1D83";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Check Network Connectivity
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.isConnected = function () {
        if (this.device.platform) {
            if (this.network.type.toLowerCase() !== 'none') {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            // return false;
            return true;
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline Message
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.offlineMessage = function () {
        this.offline_toast = this.toastCtrl.create({
            message: 'You are offline',
            position: 'bottom',
            duration: 3000,
            showCloseButton: true,
        }).present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // online Message
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.onlineMessage = function () {
        this.offline_toast = this.toastCtrl.create({
            message: 'You are online',
            position: 'bottom',
            duration: 3000,
            showCloseButton: false,
        }).present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline Message
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.networkErrorMessage = function () {
        this.toastCtrl.create({
            message: 'Connectivity Error.',
            duration: 3500,
            position: 'bottom'
        }).present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Check for string
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.contains = function (str) {
        return str.includes("Nan");
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Node Statuses classes, icons, images
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.nodeStatus = function (value, refresh_date) {
        var value_good = {
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
        var value_moderate = {
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
        var value_unhealthy_for_sensitive_groups = {
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
        var value_unhealthy = {
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
        var value_very_unhealthy = {
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
        var value_hazardous = {
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
        var value_unavailable = {
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
        if (value) {
            value = parseFloat(value).toFixed(2);
            if (value > 0 && value < 12.1) {
                if (this.isOldRefreshDate(refresh_date)) {
                    value_good.color = "#7a7a7a";
                    value_good.css_color = "grey";
                    value_good.standard_color = "grey";
                    value_good.font_color = "#ece9e9";
                    value_good.map_reading_color = "#ffffff";
                    value_good.background = 'assets/bg/0.png';
                }
                return value_good;
            }
            else if (value >= 12.1 && value < 35.6) {
                if (this.isOldRefreshDate(refresh_date)) {
                    value_moderate.color = "#7a7a7a";
                    value_moderate.css_color = "grey";
                    value_moderate.standard_color = "grey";
                    value_moderate.font_color = "#ece9e9";
                    value_moderate.map_reading_color = "#ffffff";
                    value_moderate.background = 'assets/bg/0.png';
                }
                return value_moderate;
            }
            else if (value > 35.6 && value < 55.3) {
                if (this.isOldRefreshDate(refresh_date)) {
                    value_unhealthy_for_sensitive_groups.color = "#7a7a7a";
                    value_unhealthy_for_sensitive_groups.css_color = "grey";
                    value_unhealthy_for_sensitive_groups.standard_color = "grey";
                    value_unhealthy_for_sensitive_groups.font_color = "#ece9e9";
                    value_unhealthy_for_sensitive_groups.map_reading_color = "#ffffff";
                    value_unhealthy_for_sensitive_groups.background = 'assets/bg/0.png';
                }
                return value_unhealthy_for_sensitive_groups;
            }
            else if (value > 55.4 && value < 150.3) {
                if (this.isOldRefreshDate(refresh_date)) {
                    value_unhealthy.color = "#7a7a7a";
                    value_unhealthy.css_color = "grey";
                    value_unhealthy.standard_color = "grey";
                    value_unhealthy.font_color = "#ece9e9";
                    value_unhealthy.map_reading_color = "#ffffff";
                    value_unhealthy.background = 'assets/bg/0.png';
                }
                return value_unhealthy;
            }
            else if (value > 150.4 && value < 250.4) {
                if (this.isOldRefreshDate(refresh_date)) {
                    value_very_unhealthy.color = "#7a7a7a";
                    value_very_unhealthy.css_color = "grey";
                    value_very_unhealthy.standard_color = "grey";
                    value_very_unhealthy.font_color = "#ece9e9";
                    value_very_unhealthy.map_reading_color = "#ffffff";
                    value_very_unhealthy.background = 'assets/bg/0.png';
                }
                return value_very_unhealthy;
            }
            else if (value >= 250.5 && value <= 500.4) {
                if (this.isOldRefreshDate(refresh_date)) {
                    value_hazardous.color = "#7a7a7a";
                    value_hazardous.css_color = "grey";
                    value_hazardous.standard_color = "grey";
                    value_hazardous.font_color = "#ece9e9";
                    value_hazardous.map_reading_color = "#ffffff";
                    value_hazardous.background = 'assets/bg/0.png';
                }
                return value_hazardous;
            }
            else {
                return value_unavailable;
            }
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // When was the last time a node was refreshed
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.isOldRefreshDate = function (refresh_date) {
        if (refresh_date) {
            var current_date = new Date();
            if (this.isISOFormat(refresh_date)) {
                refresh_date = this.getReadableInternationalDateFormatFromISOString(refresh_date);
            }
            else {
                var temp_refresh_date = new Date(refresh_date).toISOString();
                if (this.isISOFormat(temp_refresh_date)) {
                    refresh_date = this.getReadableInternationalDateFormatFromISOString(temp_refresh_date);
                }
            }
            var difference = this.dateDiffInDays(refresh_date, current_date);
            if (difference > 2) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (refresh_date == null) {
            return false;
        }
        else {
            return true;
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Check if date is in ISO format
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.isISOFormat = function (a) {
        var regex = /^[+-]?\d{4}(-[01]\d(-[0-3]\d(T[0-2]\d:[0-5]\d:?([0-5]\d(\.\d+)?)?([+-][0-2]\d:[0-5]\d)?Z?)?)?)?$/;
        return regex.test(a);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get date difference in days
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.dateDiffInDays = function (a, b) {
        var _MS_PER_DAY = 1000 * 60 * 60 * 24;
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Add ordinal to date e.g. 1st, 2nd, 3rd, 4th
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.dateOrdinal = function (date) {
        if (date > 3 && date < 21)
            return date + "th";
        switch (date % 10) {
            case 1: return date + "st";
            case 2: return date + "nd";
            case 3: return date + "rd";
            default: return date + "th";
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // ISO string date to readable format
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.getReadableInternationalDateFormatFromISOString = function (date) {
        // TODO: There's a need to check if the 'date' that is passed is in ISO format or regular format.
        return new Date(date);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // AirQo UTC DateTIme to Graph DateTime
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.graphTime = function (api_date) {
        var months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var date = new Date(api_date);
        var display_date = this.dateOrdinal(date.getDate());
        var display_month = months_names[date.getMonth()];
        var display_hour = date.toLocaleString('en-US', { hour: 'numeric', hour12: true });
        return display_date + " " + display_month + ", " + display_hour;
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Leading Zeroes for hours and minutes
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.leadingZeroes = function (value) {
        if (value < 10) {
            return '0' + value;
        }
        else {
            return value;
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // SQL datetime to readable format
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.getReadableInternationalDateFormatFromSQLFormat = function (date) {
        if (date) {
            return new Date(date.replace(/-/g, "/"));
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Time since i.e. Ago
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.ago = function (date) {
        var minute = 60;
        var hour = minute * 60;
        var day = hour * 24;
        var month = day * 30;
        var year = day * 365;
        var suffix = ' ago';
        var elapsed = Math.floor((Date.now() - date) / 1000);
        if (elapsed < minute) {
            return 'Just now';
        }
        var a = elapsed < hour && [Math.floor(elapsed / minute), 'minute'] ||
            elapsed < day && [Math.floor(elapsed / hour), 'hour'] ||
            elapsed < month && [Math.floor(elapsed / day), 'day'] ||
            elapsed < year && [Math.floor(elapsed / month), 'month'] ||
            [Math.floor(elapsed / year), 'year'];
        return a[0] + ' ' + a[1] + (a[0] === 1 ? '' : 's') + suffix;
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get time from ISO date time
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.getTimeFromISOStringDateTime = function (datetime) {
        var date = new Date(datetime);
        return this.convertNumberToTwoDigitString(date.getUTCHours()) + ":" + this.convertNumberToTwoDigitString(date.getUTCMinutes());
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Returns the given integer as a string and with 2 digits e.g. 7 --> "07"
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.convertNumberToTwoDigitString = function (n) {
        return n > 9 ? "" + n : "0" + n;
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Log Out
    // --------------------------------------------------------------------------------------------------------------------
    ApiProvider.prototype.logOut = function (user) {
        this.storage.set('user_data', null);
        this.storage.set('nearest_node', null);
        this.storage.set('favorites_readings', null);
        return true;
    };
    ApiProvider = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__ionic_native_network__["a" /* Network */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["n" /* ToastController */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_device__["a" /* Device */], __WEBPACK_IMPORTED_MODULE_4__ionic_storage__["b" /* Storage */]])
    ], ApiProvider);
    return ApiProvider;
}());

//# sourceMappingURL=api.js.map

/***/ }),

/***/ 167:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 167;

/***/ }),

/***/ 24:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_geolocation__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_device__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__node_node__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__search_search__ = __webpack_require__(343);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__favorites_favorites__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__add_place_add_place__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__menu_menu__ = __webpack_require__(346);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};












var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, storage, http, loadingCtrl, alertCtrl, toastCtrl, geolocation, platform, device, popoverCtrl, modalCtrl, api) {
        this.navCtrl = navCtrl;
        this.storage = storage;
        this.http = http;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
        this.toastCtrl = toastCtrl;
        this.geolocation = geolocation;
        this.platform = platform;
        this.device = device;
        this.popoverCtrl = popoverCtrl;
        this.modalCtrl = modalCtrl;
        this.api = api;
        this.user = {};
        this.nearest_node = {};
        this.lastest_nearest_node_reading = '0';
        this.favorite_nodes = [];
        this.get_favorite_nodes_api = this.api.api_endpoint + "/airqoPlaceLatest";
        this.get_nearest_node_api = this.api.api_endpoint + "/airqoNearest";
        this.get_coordinates_api = this.api.external_api_endpoint + "/get-info.php";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.ionViewDidLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.api.isConnected()) {
                            this.getLocation();
                        }
                        return [4 /*yield*/, this.offlineLoadFavorites(null)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires every time page loads
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.ionViewDidEnter = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - Load favorites list
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.offlineLoadFavorites = function (refresher) {
        var _this = this;
        this.storage.get('favorites').then(function (val) {
            if (val && val != null && val != '' && val.length > 0) {
                _this.favorite_nodes = val;
                if (_this.api.isConnected()) {
                    _this.onlineLoadFavoritesNodesReadings(val, refresher);
                }
                else {
                    if (refresher) {
                        refresher.complete();
                    }
                    _this.api.offlineMessage();
                    _this.offlineLoadFavoritesNodesReadings();
                }
            }
            else {
                _this.openAddFavorites();
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get Location
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.getLocation = function () {
        var _this = this;
        var options = {
            timeout: 20000,
            enableHighAccuracy: true
        };
        this.platform.ready().then(function () {
            var loader = _this.loadingCtrl.create({
                spinner: 'ios',
                enableBackdropDismiss: false,
                dismissOnPageChange: true,
                showBackdrop: true
            });
            _this.geolocation.getCurrentPosition(options).then(function (pos) {
                var params = {
                    api: _this.api.api_key,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                loader.dismiss();
                _this.getNearestNodeReading(params);
            }).catch(function (error) {
                console.log('Error getting location: ', error);
                loader.dismiss();
                _this.getCoordinatesByIP();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get Coordinates By IP Address
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.getCoordinatesByIP = function () {
        var _this = this;
        this.http.get(this.get_coordinates_api).subscribe(function (result) {
            console.log(result);
            if (result.success == '1') {
                var params = {
                    api: _this.api.api_key,
                    lat: result.message.lat,
                    lng: result.message.lon,
                };
                _this.getNearestNodeReading(params);
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get Nearest Node Reading
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.getNearestNodeReading = function (params) {
        var _this = this;
        if (this.api.isConnected()) {
            console.info(params);
            var loader_1 = this.loadingCtrl.create({
                spinner: 'ios',
                enableBackdropDismiss: false,
                dismissOnPageChange: true,
                showBackdrop: true
            });
            loader_1.present().then(function () {
                _this.http.post(_this.get_nearest_node_api, params).subscribe(function (result) {
                    console.log(result);
                    loader_1.dismiss();
                    _this.nearest_node_api_success = result.success;
                    if (result.success == '100') {
                        _this.nearest_node = result;
                        _this.lastest_nearest_node_reading = _this.nearest_node.lastfeeds.field1;
                        _this.nearest_node.date = (new Date().toISOString());
                        _this.storage.set("nearest_node", _this.nearest_node);
                        console.log(_this.nearest_node);
                        console.log(_this.lastest_nearest_node_reading);
                    }
                }, function (err) {
                    loader_1.dismiss();
                    _this.api.networkErrorMessage();
                });
            });
        }
        else {
            this.storage.get('nearest_node').then(function (val) {
                if (val && val != null && val != '' && val.length > 0) {
                    _this.nearest_node = val;
                    _this.nearest_node_api_success = "100";
                }
            });
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Load Favorites Nodes Readings from online
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.onlineLoadFavoritesNodesReadings = function (favorite_nodes, refresher) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _loop_1, this_1, i;
            return __generator(this, function (_a) {
                this.favorite_nodes = [];
                if (favorite_nodes.length > 0) {
                    _loop_1 = function (i) {
                        var params = {
                            api: this_1.api.api_key,
                            channel: favorite_nodes[i].channel_id,
                        };
                        this_1.http.post(this_1.get_favorite_nodes_api, params).subscribe(function (result) {
                            console.log(favorite_nodes[i].name);
                            console.log(result);
                            console.log(result.nodes[0].lastfeeds);
                            if (result.success == '100') {
                                var node = {
                                    channel_id: favorite_nodes[i].channel_id,
                                    name: favorite_nodes[i].name,
                                    location: favorite_nodes[i].location,
                                    refreshed: result.nodes[0].lastfeeds.created_at,
                                    field1: result.nodes[0].lastfeeds.field1,
                                    feeds: result.nodes[0].lastfeeds,
                                };
                                _this.favorite_nodes.push(node);
                                _this.storage.set("favorites_readings", _this.favorite_nodes);
                            }
                        });
                    };
                    this_1 = this;
                    for (i = 0; i < favorite_nodes.length; i++) {
                        _loop_1(i);
                    }
                    if (refresher) {
                        refresher.complete();
                    }
                    if (this.favorite_nodes.length > favorite_nodes.length) {
                        if (this.favorite_nodes.length > 0) {
                            this.favorite_nodes_api_success = '100';
                        }
                        else {
                            this.favorite_nodes_api_success = null;
                        }
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - Load favorites readings
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.offlineLoadFavoritesNodesReadings = function () {
        var _this = this;
        this.favorite_nodes = [];
        this.storage.get('favorites_readings').then(function (val) {
            if (val && val != null && val != '' && val.length > 0) {
                _this.favorite_nodes = val;
                console.log(_this.favorite_nodes);
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Search Page
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.goToSearchPage = function () {
        var _this = this;
        var modal = this.modalCtrl.create(__WEBPACK_IMPORTED_MODULE_8__search_search__["a" /* SearchPage */]);
        modal.onDidDismiss(function () {
            _this.offlineLoadFavorites(null);
        });
        modal.present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Favorites Page
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.goToFavoritesPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_9__favorites_favorites__["a" /* FavoritesPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Add Place/Node from favorites list
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.openAddFavorites = function () {
        var _this = this;
        var modal = this.modalCtrl.create(__WEBPACK_IMPORTED_MODULE_10__add_place_add_place__["a" /* AddPlacePage */]);
        modal.onDidDismiss(function () {
            _this.offlineLoadFavorites(null);
        });
        modal.present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Stacked Menu
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.stackedMenu = function (event) {
        this.menu_popover = this.popoverCtrl.create(__WEBPACK_IMPORTED_MODULE_11__menu_menu__["a" /* MenuPage */]).present({ ev: event });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Remove Menu Pop Over
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.removePopOver = function () {
        // this.menu_popover.hide();    
    };
    // --------------------------------------------------------------------------------------------------------------------
    // View Node Details
    // --------------------------------------------------------------------------------------------------------------------
    HomePage.prototype.viewDetails = function (node) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_7__node_node__["a" /* NodePage */], {
            node: node
        });
    };
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-home',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\home\home.html"*/'<ion-header class="title-centered">\n  <ion-navbar color="blue" hideBackButton="true">\n    <ion-title>\n			<img src="assets/logos/logo-white.png" class="nav-image"/>\n    </ion-title>\n    <ion-buttons end>\n      <button color="light" ion-button icon-only (click)="goToSearchPage()">\n        <ion-icon name="search"></ion-icon>\n      </button>\n      &nbsp;\n      &nbsp;\n      <button color="light" ion-button icon-only (click)="goToFavoritesPage()">\n        <ion-icon name="star-outline"></ion-icon>\n      </button>\n      &nbsp;\n      &nbsp;\n      <button color="light" ion-button icon-only (click)="stackedMenu($event)">\n        <ion-icon name="more"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n\n<ion-content>\n\n  <ion-refresher pullMin="65" (ionRefresh)="getLocation(); offlineLoadFavorites($event)">\n    <ion-refresher-content pullingIcon="arrow-round-down"\n    pullingText="Pull to refresh"\n    refreshingSpinner="dots"\n    refreshingText="Refreshing..."></ion-refresher-content>\n  </ion-refresher>\n\n  <!-- Current Location -->\n  <ion-card [hidden]="lastest_nearest_node_reading == \'0\' || lastest_nearest_node_reading == null" (click)="viewDetails(nearest_node)">\n    <ion-grid>\n      <ion-row class="header-section bg-grey">\n        <ion-col class="header-title white">\n          My Location\n        </ion-col>\n      </ion-row>\n      <ion-row class="area-section">\n        <ion-col col-1 class="area-type">\n          <ion-icon name="pin" color="grey" class="star-icon"></ion-icon>\n        </ion-col>\n        <ion-col col-11>\n        <div class="title black moderate-bold">{{ nearest_node.name }}</div>\n        <div class="sub-title grey">{{ nearest_node.location }}</div>\n        </ion-col>\n      </ion-row>\n    <ion-row class="readings-section" [style.backgroundColor]="api.nodeStatus(lastest_nearest_node_reading, nearest_node.date).color">\n        <ion-col col-3 class="face bg-darker">\n          <img [src]="api.nodeStatus(lastest_nearest_node_reading, nearest_node.date).face"/>\n        </ion-col>\n        <ion-col col-4 class="values">\n        <p class="number moderate-bold" [style.color]="api.nodeStatus(lastest_nearest_node_reading, nearest_node.date).font_color">{{ lastest_nearest_node_reading }}</p>\n          <p class="number-label moderate-bold" [style.color]="api.nodeStatus(lastest_nearest_node_reading, nearest_node.date).font_color">PM<sub>2.5</sub></p>\n        </ion-col>\n        <ion-col col-5 class="label">\n        <p text-wrap class="value-label moderate-bold" [style.color]="api.nodeStatus(lastest_nearest_node_reading, nearest_node.date).font_color">{{ api.nodeStatus(lastest_nearest_node_reading, nearest_node.date).label }}</p>\n        </ion-col>\n      </ion-row>\n      <ion-row class="footer-section">\n        <ion-col col-11 text-wrap class="date-section">\n          <span class="node-refresh-date">Last Refreshed: {{ api.ago(api.getReadableInternationalDateFormatFromISOString(nearest_node.date)) }}</span>\n        </ion-col>\n        <ion-col col-1 class="icon-section">\n          <ion-icon name="arrow-forward"></ion-icon>\n        </ion-col>\n      </ion-row>\n    </ion-grid>\n  </ion-card>\n  \n  <!-- Saved Locations -->\n  <ion-card>\n    <ion-grid class="saved-header">\n      <ion-row class="header-section bg-grey">\n        <ion-col col-11 class="header-title white">\n          Saved Locations\n        </ion-col>\n        <ion-col col-1>\n          <button ion-button small icon-only outline color="light" (click)="openAddFavorites()">\n            <ion-icon name="md-add" color="light"></ion-icon>\n          </button>\n        </ion-col>\n      </ion-row>\n    </ion-grid>\n    \n    <ng-container *ngFor="let node of favorite_nodes">\n      <hr/>\n      <ion-grid (click)="viewDetails(node)">\n        <ion-row nowrap class="area-section">\n          <ion-col col-1 class="area-type">\n            <ion-icon name="md-star" color="grey" class="star-icon"></ion-icon>\n          </ion-col>\n          <ion-col col-11>\n            <div class="title black moderate-bold">{{ node.name }}</div>\n          <div class="sub-title grey">{{ node.location }}</div>\n          </ion-col>\n        </ion-row>\n        <ion-row class="readings-section" [style.backgroundColor]="api.nodeStatus(node.field1, node.refreshed).color">\n          <ion-col col-3 class="face bg-darker">\n            <img [src]="api.nodeStatus(node.field1, node.refreshed).face"/>\n          </ion-col>\n          <ion-col col-4 class="values">\n            <p class="number moderate-bold" [style.color]="api.nodeStatus(node.field1, node.refreshed).font_color">{{ node.field1 }}</p>\n            <p class="number-label moderate-bold" [style.color]="api.nodeStatus(node.field1, node.refreshed).font_color">PM<sub>2.5</sub></p>\n          </ion-col>\n          <ion-col col-5 class="label">\n            <p text-wrap class="value-label moderate-bold" [style.color]="api.nodeStatus(node.field1, node.refreshed).font_color">{{ api.nodeStatus(node.field1, node.refreshed).label }}</p>\n          </ion-col>\n        </ion-row>\n        <ion-row class="footer-section">\n          <ion-col col-11 text-wrap class="date-section">\n            <span class="node-refresh-date">Last Refreshed: {{ api.ago(api.getReadableInternationalDateFormatFromISOString(node.refreshed)) }}</span>\n          </ion-col>\n          <ion-col col-1 class="icon-section">\n            <ion-icon name="arrow-forward"></ion-icon>\n          </ion-col>\n        </ion-row>\n      </ion-grid>\n    </ng-container>\n  </ion-card>\n      \n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\home\home.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_2__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_4__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* LoadingController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ToastController */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_geolocation__["a" /* Geolocation */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* Platform */],
            __WEBPACK_IMPORTED_MODULE_5__ionic_native_device__["a" /* Device */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["l" /* PopoverController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* ModalController */], __WEBPACK_IMPORTED_MODULE_6__providers_api_api__["a" /* ApiProvider */]])
    ], HomePage);
    return HomePage;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 343:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SearchPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_forms__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_debounceTime__ = __webpack_require__(344);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_debounceTime___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_debounceTime__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__node_node__ = __webpack_require__(40);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var SearchPage = /** @class */ (function () {
    function SearchPage(navCtrl, navParams, storage, toastCtrl, viewCtrl, api, loadingCtrl, http, alertCtrl) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.storage = storage;
        this.toastCtrl = toastCtrl;
        this.viewCtrl = viewCtrl;
        this.api = api;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.alertCtrl = alertCtrl;
        this.user = {};
        this.nodes = [];
        this.textInput = new __WEBPACK_IMPORTED_MODULE_5__angular_forms__["a" /* FormControl */]('');
        this.search_nodes_api = this.api.api_endpoint + "/airqoSearchPlaces";
        this.textInput
            .valueChanges
            .debounceTime(1000)
            .subscribe(function (value) {
            _this.onlineSearchNodes(value);
        });
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.ionViewDidLoad = function () {
        this.getUserInfo();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.ionViewDidEnter = function () {
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get User's info
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.getUserInfo = function () {
        var _this = this;
        this.storage.get('user_data').then(function (val) {
            if (val && val != null && val != '') {
                _this.user = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Add Node to favorites list
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.addToFavoritesList = function (node, $event) {
        var _this = this;
        $event.stopPropagation();
        $event.preventDefault();
        this.alertCtrl.create({
            title: 'ADD TO FAVORITES',
            message: 'Add node to favorites?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: function () { }
                },
                {
                    text: 'Add',
                    handler: function () {
                        _this.storage.get('favorites').then(function (val) {
                            var nodes = [];
                            if (val && val != null && val != '' && val.length > 0) {
                                if (val.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
                                    _this.toastCtrl.create({
                                        message: 'Place already added',
                                        duration: 2000,
                                        position: 'bottom'
                                    }).present();
                                    _this.removeSingleNodeFromList(node);
                                }
                                else {
                                    val.push(node);
                                    _this.storage.set('favorites', val);
                                    _this.removeSingleNodeFromList(node);
                                    _this.toastCtrl.create({
                                        message: 'Added',
                                        duration: 2000,
                                        position: 'bottom'
                                    }).present();
                                }
                            }
                            else {
                                nodes.push(node);
                                _this.storage.set('favorites', nodes);
                                _this.removeSingleNodeFromList(node);
                                _this.toastCtrl.create({
                                    message: 'Added',
                                    duration: 2000,
                                    position: 'bottom'
                                }).present();
                            }
                        });
                    }
                }
            ]
        }).present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Remove single node from list
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.removeSingleNodeFromList = function (node) {
        if (this.nodes.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].channel_id == node.channel_id) {
                    this.nodes.splice(i, 1);
                }
            }
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Search Nodes from online
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.onlineSearchNodes = function (search_key) {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'ios',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        var params = {
            key: search_key,
            api: this.api.api_key
        };
        loader.present().then(function () {
            _this.http.post(_this.search_nodes_api, params).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                _this.search_nodes_api_success = result.success;
                if (result.success == '100') {
                    _this.nodes = result.nodes;
                    _this.offlineStoreNodes();
                }
                else {
                    _this.toastCtrl.create({
                        message: result.message,
                        duration: 2000,
                        position: 'bottom'
                    }).present();
                }
            }, function (err) {
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - store nodes offline
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.offlineStoreNodes = function () {
        this.storage.set("nodes", this.nodes);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - retrieve nodes offline
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.offlineLoadNodes = function () {
        var _this = this;
        this.storage.get("nodes").then(function (content) {
            if (content != null && content != '' && content.length > 0) {
                _this.nodes = content;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Load Search Items
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.searchList = function (search_term) {
    };
    // --------------------------------------------------------------------------------------------------------------------
    // View Node details
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.viewDetails = function (node) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_7__node_node__["a" /* NodePage */], {
            node: node
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Close Modal
    // --------------------------------------------------------------------------------------------------------------------
    SearchPage.prototype.closeModal = function () {
        this.viewCtrl.dismiss();
    };
    SearchPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_3__angular_core__["m" /* Component */])({
            selector: 'page-search',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\search\search.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-buttons start>\n      <button (click)="closeModal()" color="blue" ion-button icon-only round clear>\n        <ion-icon name="arrow-back"></ion-icon>\n        Back\n      </button>\n    </ion-buttons>\n    <ion-searchbar type="text" color="light" placeholder="Search city or area" clearInput [formControl]="textInput"></ion-searchbar>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding (swipe)="closeModal()">\n  <!-- <p class="title">{{ nodes? nodes.length: \'0\' }}</p> -->\n  <ion-list>\n    <ion-item *ngFor="let node of nodes" (click)="viewDetails(node)">\n      <ion-icon name="pin" color="grey" item-start></ion-icon>\n      <div class="area-title">{{ node.name }}</div>\n      <div class="area-sub-title">{{ node.location }}</div>\n      <ion-icon name="md-star" color="primary" item-end (click)="addToFavoritesList(node, $event)"></ion-icon>\n    </ion-item>\n  </ion-list>\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\search\search.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_2__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ToastController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["o" /* ViewController */], __WEBPACK_IMPORTED_MODULE_0__providers_api_api__["a" /* ApiProvider */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_4__angular_common_http__["a" /* HttpClient */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* AlertController */]])
    ], SearchPage);
    return SearchPage;
}());

//# sourceMappingURL=search.js.map

/***/ }),

/***/ 346:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MenuPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__home_home__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_social_sharing__ = __webpack_require__(347);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_device__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__key_key__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__map_map__ = __webpack_require__(348);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__sign_in_sign_in__ = __webpack_require__(112);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__settings_settings__ = __webpack_require__(350);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__camera_camera__ = __webpack_require__(355);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__favorites_favorites__ = __webpack_require__(59);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};












var MenuPage = /** @class */ (function () {
    function MenuPage(navCtrl, navParams, socialSharing, device, actionSheetCtrl, storage, alertCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.socialSharing = socialSharing;
        this.device = device;
        this.actionSheetCtrl = actionSheetCtrl;
        this.storage = storage;
        this.alertCtrl = alertCtrl;
        this.user = {};
        this.login_status = false;
        this.sign_in_or_sign_up_label = 'Sign In';
        this.getUserInfo();
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.ionViewDidEnter = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Get User's info
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.getUserInfo = function () {
        var _this = this;
        this.storage.get('user_data').then(function (val) {
            if (val && val != null && val != '') {
                _this.user = val;
                _this.login_status = true;
                _this.sign_in_or_sign_up_label = 'Sign Out';
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Favorites Page
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.goToFavoritesPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_11__favorites_favorites__["a" /* FavoritesPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Map Page
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.goToMapPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_7__map_map__["a" /* MapPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Key Page
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.goToKeyPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_6__key_key__["a" /* KeyPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Invite Friends
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.inviteFriends = function () {
        var _this = this;
        var actionSheet = this.actionSheetCtrl.create({
            title: 'Share',
            buttons: [
                {
                    text: 'WhatsApp',
                    handler: function () {
                        _this.shareViaWhatsApp();
                    }
                }, {
                    text: 'Message',
                    handler: function () {
                        _this.shareViaMessage();
                    }
                }, {
                    text: 'Other',
                    handler: function () {
                        _this.shareViaOther();
                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: function () { }
                }
            ]
        });
        actionSheet.present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Share via WhatsApp
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.shareViaWhatsApp = function () {
        var link;
        if (this.device.platform) {
            if (this.device.platform.toLowerCase() == "android") {
                link = "https://play.google.com/store/apps/details?id=com.buzen.contract.airqoapp";
            }
            else {
                link = "https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8";
            }
        }
        this.socialSharing.shareViaWhatsApp("Check out the AirQo app", 'assets/logos/logo-blue.png', link).then(function (entries) {
            // 
        }).catch(function (error) {
            alert('Unable to Invite. ');
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Share via Message
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.shareViaMessage = function () {
        var link;
        if (this.device.platform) {
            if (this.device.platform.toLowerCase() == "android") {
                link = "https://play.google.com/store/apps/details?id=com.buzen.contract.airqoapp";
            }
            else {
                link = "https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8";
            }
        }
        this.socialSharing.share("Check out the AirQo app", "AirQo", 'assets/logos/logo-blue.png', link).then(function (entries) {
            // 
        }).catch(function (error) {
            alert('Unable to Invite. ');
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Share via Other
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.shareViaOther = function () {
        var link;
        if (this.device.platform) {
            if (this.device.platform.toLowerCase() == "android") {
                link = "https://play.google.com/store/apps/details?id=com.buzen.contract.airqoapp";
            }
            else {
                link = "https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8";
            }
        }
        this.socialSharing.share("Check out the AirQo app", "AirQo", null, link).then(function (entries) {
            // 
        }).catch(function (error) {
            alert('Unable to Invite.');
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Camera Page
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.goToCameraPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_10__camera_camera__["a" /* CameraPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Settings Page
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.goToSettings = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_9__settings_settings__["a" /* SettingsPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Check if user is signed in
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.checkSessionStatus = function () {
        if (Object.keys(this.user).length > 0) {
            this.signOut();
        }
        else {
            this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_8__sign_in_sign_in__["a" /* SignInPage */]);
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Sign Out
    // --------------------------------------------------------------------------------------------------------------------
    MenuPage.prototype.signOut = function () {
        var _this = this;
        this.alertCtrl.create({
            title: 'LOGOUT',
            message: 'Do you wish to proceed and sign out?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: function () { }
                },
                {
                    text: 'Logout',
                    handler: function () {
                        _this.user = {};
                        _this.storage.set('remember_me', null);
                        _this.storage.set('user_data', null).then(function () {
                            _this.sign_in_or_sign_up_label = 'Sign In';
                            _this.login_status = false;
                            _this.navCtrl.setRoot(__WEBPACK_IMPORTED_MODULE_0__home_home__["a" /* HomePage */]);
                        });
                    }
                }
            ]
        }).present();
    };
    MenuPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["m" /* Component */])({
            selector: 'page-menu',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\menu\menu.html"*/'<ion-content>\n  <ion-list>\n    <!-- <ion-item no-lines (click)="goToFavoritesPage()">\n      <ion-icon name="cloud-outline" item-start></ion-icon>\n      <span class="item">My Places</span>\n    </ion-item> -->\n    <ion-item no-lines (click)="goToMapPage()">\n      <ion-icon name="map" item-start></ion-icon>\n      <span class="item">Map</span>\n    </ion-item>\n    <ion-item no-lines (click)="goToKeyPage()">\n      <ion-icon name="key"item-start></ion-icon>\n      <span class="item">Key</span>\n    </ion-item>\n    <ion-item no-lines (click)="inviteFriends()">\n      <ion-icon name="add" item-start></ion-icon>\n      <span class="item">Invite Friends</span>\n    </ion-item>\n    <!-- <ion-item no-lines (click)="goToCameraPage()">\n      <ion-icon name="camera-outline" item-start></ion-icon>\n      <span class="item">AQI Camera</span>\n    </ion-item> -->\n    <ion-item no-lines (click)="goToSettings()">\n      <ion-icon name="settings" item-start></ion-icon>\n      <span class="item">Settings</span>\n    </ion-item>\n    <!-- <ion-item no-lines (click)="checkSessionStatus()">\n      <ion-icon name="log-in" item-start></ion-icon>\n      <span class="item">{{ sign_in_or_sign_up_label }}</span>\n    </ion-item> -->\n  </ion-list>\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\menu\menu.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_social_sharing__["a" /* SocialSharing */], __WEBPACK_IMPORTED_MODULE_5__ionic_native_device__["a" /* Device */],
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["a" /* ActionSheetController */], __WEBPACK_IMPORTED_MODULE_4__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* AlertController */]])
    ], MenuPage);
    return MenuPage;
}());

//# sourceMappingURL=menu.js.map

/***/ }),

/***/ 348:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MapPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_leaflet__ = __webpack_require__(444);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_leaflet___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_leaflet__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__node_node__ = __webpack_require__(40);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};







var MapPage = /** @class */ (function () {
    function MapPage(navCtrl, storage, toastCtrl, loadingCtrl, http, alertCtrl, api, elementRef) {
        this.navCtrl = navCtrl;
        this.storage = storage;
        this.toastCtrl = toastCtrl;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.alertCtrl = alertCtrl;
        this.api = api;
        this.elementRef = elementRef;
        this.user = {};
        this.nodes = [];
        this.nodes_list_api = this.api.api_endpoint + "/airqoPlacesCached";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // When the view loads: 
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.ionViewDidLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadMap()];
                    case 1:
                        _a.sent();
                        this.loadNodes();
                        return [2 /*return*/];
                }
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.ionViewDidEnter = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Load the map
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.loadMap = function () {
        this.map = __WEBPACK_IMPORTED_MODULE_5_leaflet___default.a.map("map").setView([0.283670, 32.600399], 6);
        __WEBPACK_IMPORTED_MODULE_5_leaflet___default.a.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Load Nodes from online
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.loadNodes = function () {
        if (this.api.isConnected()) {
            this.onlineLoadNodes();
        }
        else {
            this.api.offlineMessage();
            this.offlineLoadNodes();
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Load Nodes from online
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.onlineLoadNodes = function () {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'ios',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        var params = {
            api: this.api.api_key
        };
        loader.present().then(function () {
            _this.http.post(_this.nodes_list_api, params).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                _this.places_nodes_list_api_success = result.success;
                if (result.success == '100') {
                    _this.nodes = result.nodes;
                    _this.offlineStoreNodes();
                }
                else {
                    _this.offlineLoadNodes();
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                _this.offlineLoadNodes();
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - store nodes offline
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.offlineStoreNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.set("nodes", this.nodes)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.addMarkers()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - retrieve nodes offline
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.offlineLoadNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.get("nodes").then(function (val) {
                            if (val != null && val != '' && val.length > 0) {
                                _this.nodes = val;
                                _this.addMarkers();
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Add markers
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.addMarkers = function () {
        var _this = this;
        if (this.nodes != null && this.nodes != '' && this.nodes.length > 0) {
            var _loop_1 = function (i) {
                if (this_1.nodes[i].lat && this_1.nodes[i].lng) {
                    var airqo_marker = __WEBPACK_IMPORTED_MODULE_5_leaflet___default.a.divIcon({
                        className: 'custom-airqo-icon',
                        html: '' +
                            '<div style="background-color: ' + this_1.api.nodeStatus(this_1.nodes[i].field2, this_1.nodes[i].time).color + ';" class="marker-pin"></div>' +
                            '<span class="marker-number" style="color: ' + this_1.api.nodeStatus(this_1.nodes[i].field2, this_1.nodes[i].time).font_color + ';">' + Math.round(this_1.nodes[i].field2) + '</span>',
                        iconSize: [30, 42],
                        iconAnchor: [15, 42],
                        popupAnchor: [0, -30]
                    });
                    var airqo_popup = '' +
                        '<div class="marker-popup">' +
                        '<a class="marker-popup-click" data-markerId="' + this_1.nodes[i].channel_id + '">' +
                        '<div class="top-section center">' +
                        '<p class="title">' + this_1.nodes[i].name + '</p>' +
                        '<p class="sub-title grey">' + this_1.nodes[i].location + '</p>' +
                        '</div>' +
                        '<div class="mid-section center" style="background-color: ' + this_1.api.nodeStatus(this_1.nodes[i].field2, this_1.nodes[i].time).color + ';">' +
                        '<div class="face bg-darker">' +
                        '<img src="' + this_1.api.nodeStatus(this_1.nodes[i].field2, this_1.nodes[i].time).face + '"/>' +
                        '</div>' +
                        '<div class="reading">' +
                        '<p style="color: ' + this_1.api.nodeStatus(this_1.nodes[i].field2, this_1.nodes[i].time).font_color + ';">' +
                        this_1.nodes[i].field2.trim() +
                        '<br/>PM<sub>2.5</sub>' +
                        '</p>' +
                        '</div>' +
                        '<div class="label">' +
                        '<p style="color: ' + this_1.api.nodeStatus(this_1.nodes[i].field2, this_1.nodes[i].time).font_color + ';">' + this_1.api.nodeStatus(this_1.nodes[i].field2, this_1.nodes[i].time).label + '</p>' +
                        '</div>' +
                        '</div>' +
                        '<div class="bottom-section">' +
                        '<p class="refresh-date grey">Last Refreshed: ' + this_1.api.ago(this_1.api.getReadableInternationalDateFormatFromISOString(this_1.nodes[i].time)) + '</p>' +
                        '</div>' +
                        '</a>' +
                        '</div>';
                    var airqo_popup_options = {
                        className: 'custom',
                        width: 400,
                        height: 150,
                        closeButton: false,
                        autoClose: false
                    };
                    __WEBPACK_IMPORTED_MODULE_5_leaflet___default.a.marker([parseFloat(this_1.nodes[i].lat), parseFloat(this_1.nodes[i].lng)], { icon: airqo_marker }).addTo(this_1.map)
                        .bindPopup(airqo_popup, airqo_popup_options).on('click', function (e) {
                    })
                        .on('popupopen', function (res) {
                        _this.elementRef.nativeElement.querySelector(".marker-popup-click").addEventListener('click', function (e) {
                            console.log(e.target.getAttribute("data-markerId"));
                            _this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_6__node_node__["a" /* NodePage */], { node: _this.nodes[i] });
                        });
                    });
                }
            };
            var this_1 = this;
            for (var i = 0; i < this.nodes.length; i++) {
                _loop_1(i);
            }
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // View Node Details
    // --------------------------------------------------------------------------------------------------------------------
    MapPage.prototype.viewDetails = function (node) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_6__node_node__["a" /* NodePage */], {
            node: node
        });
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_8" /* ViewChild */])('map'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_0__angular_core__["t" /* ElementRef */])
    ], MapPage.prototype, "mapContainer", void 0);
    MapPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-map',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\map\map.html"*/'<ion-header>\n\n  <ion-navbar>\n    <ion-title>Map</ion-title>\n    <ion-buttons end>\n      <!-- <button (click)="closeModal()" color="blue" ion-button icon-only round clear>\n        <ion-icon name="md-close"></ion-icon>\n      </button> -->\n    </ion-buttons>\n  </ion-navbar>\n\n</ion-header>\n<ion-content>\n  <div #map id="map"></div>\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\map\map.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_2__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ToastController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* LoadingController */],
            __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_4__providers_api_api__["a" /* ApiProvider */], __WEBPACK_IMPORTED_MODULE_0__angular_core__["t" /* ElementRef */]])
    ], MapPage);
    return MapPage;
}());

//# sourceMappingURL=map.js.map

/***/ }),

/***/ 349:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SignUpPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__sign_in_sign_in__ = __webpack_require__(112);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var SignUpPage = /** @class */ (function () {
    function SignUpPage(navCtrl, navParams, loadingCtrl, http, alertCtrl, storage, api) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.alertCtrl = alertCtrl;
        this.storage = storage;
        this.api = api;
        this.user = {};
        this.password_type = 'password';
        this.password_icon = 'eye-off';
        this.sign_up_api = this.api.api_endpoint + "/airqoSignUp";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // When the view loads: 
    // --------------------------------------------------------------------------------------------------------------------
    SignUpPage.prototype.ionViewDidLoad = function () {
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Show or Hide Password
    // --------------------------------------------------------------------------------------------------------------------
    SignUpPage.prototype.hideShowPassword = function () {
        this.password_type = this.password_type === 'text' ? 'password' : 'text';
        this.password_icon = this.password_icon === 'eye-off' ? 'eye' : 'eye-off';
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Check for valid Email Address
    // --------------------------------------------------------------------------------------------------------------------
    SignUpPage.prototype.validateEmail = function (email) {
        var regex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
        return regex.test(email);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Validate Credentials
    // --------------------------------------------------------------------------------------------------------------------
    SignUpPage.prototype.validateCredentials = function () {
        if (Object.keys(this.user).length > 0) {
            this.user.email = this.user.email.toLowerCase();
            if (this.validateEmail(this.user.email)) {
                if (this.user.password) {
                    var strengthRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})");
                    if (strengthRegex.test(this.user.password)) {
                        var data = {
                            name: this.user.name,
                            email: this.user.email,
                            password: this.user.password,
                            api: this.api.api_key
                        };
                        this.submitSignUpInfo(data);
                    }
                    else {
                        this.alertCtrl.create({
                            title: 'Weak Password',
                            message: 'Passwords should be at least 6 characters long and should contain a mixture of letters, numbers and other characters',
                            buttons: ['Okay']
                        }).present();
                    }
                }
                else {
                    this.alertCtrl.create({
                        title: 'Invalid Password',
                        message: 'Please input a password',
                        buttons: ['Okay']
                    }).present();
                }
            }
            else {
                this.alertCtrl.create({
                    title: 'Invalid Email',
                    message: 'Please enter a valid email address',
                    buttons: ['Okay']
                }).present();
            }
        }
        else {
            this.alertCtrl.create({
                title: 'Invalid Submission',
                message: 'Please ensure you have added all the required information',
                buttons: ['Okay']
            }).present();
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Submit Registration Information
    // --------------------------------------------------------------------------------------------------------------------
    SignUpPage.prototype.submitSignUpInfo = function (data) {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'dots',
            content: 'Please wait...',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        console.log(JSON.stringify(data));
        loader.present().then(function () {
            _this.http.post(_this.sign_up_api, data).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                if (result.success == "100") {
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: [
                            {
                                text: 'Okay',
                                handler: function (data) {
                                    _this.user = {
                                        uid: result.id,
                                        name: result.name,
                                        email: result.email,
                                        token: result.token,
                                    };
                                    _this.storage.set('user_data', _this.user).then(function () {
                                        _this.navCtrl.setRoot(__WEBPACK_IMPORTED_MODULE_5__sign_in_sign_in__["a" /* SignInPage */]);
                                    });
                                }
                            },
                        ]
                    }).present();
                }
                else {
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                loader.dismiss();
                _this.alertCtrl.create({
                    message: 'Please check your internet connection',
                    buttons: ['Okay']
                }).present();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Sign In Page
    // --------------------------------------------------------------------------------------------------------------------
    SignUpPage.prototype.goToSignInPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_5__sign_in_sign_in__["a" /* SignInPage */]);
    };
    SignUpPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-sign-up',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\sign-up\sign-up.html"*/'<ion-header>\n  <ion-navbar color="blue">\n    <ion-title>Sign Up</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content>\n\n  <ion-card>\n    <ion-card-content>\n      \n      <div class="logo-section">\n        <img src="assets/logos/logo-blue-tagline.png"/>\n      </div>\n\n      <ion-list class="signin-form-section">\n\n        <ion-item>\n          <ion-label stacked>Name</ion-label>\n          <ion-input type="text" [(ngModel)]="user.name" placeholder="Name"></ion-input>\n        </ion-item>\n\n        <ion-item>\n          <ion-label stacked>Email</ion-label>\n          <ion-input type="email" [(ngModel)]="user.email" placeholder="Email"></ion-input>\n        </ion-item>\n      \n        <ion-item>\n          <ion-label stacked>Password</ion-label>\n          <ion-input [type]="password_type" [(ngModel)]="user.password" placeholder="Password"></ion-input>\n          <button ion-button icon-only item-right clear color="dark" (click)="hideShowPassword()"><ion-icon item-end [name]="password_icon" class="password-icon"></ion-icon></button>\n        </ion-item>\n\n        <button ion-button block color="blue" (click)="validateCredentials()">SIGN UP</button>\n\n        <p class="or-divider" (click)="goToSignInPage()">Already have an account?</p>\n      \n      </ion-list>\n\n    </ion-card-content>\n  </ion-card>\n\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\sign-up\sign-up.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_2__angular_common_http__["a" /* HttpClient */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_3__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_4__providers_api_api__["a" /* ApiProvider */]])
    ], SignUpPage);
    return SignUpPage;
}());

//# sourceMappingURL=sign-up.js.map

/***/ }),

/***/ 350:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SettingsPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_geolocation__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_device__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_app_rate__ = __webpack_require__(351);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__feedback_feedback__ = __webpack_require__(352);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__daily_reports_daily_reports__ = __webpack_require__(353);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__favorites_favorites__ = __webpack_require__(59);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};











var SettingsPage = /** @class */ (function () {
    function SettingsPage(navCtrl, storage, http, loadingCtrl, alertCtrl, toastCtrl, geolocation, platform, device, popoverCtrl, modalCtrl, api, appRate) {
        this.navCtrl = navCtrl;
        this.storage = storage;
        this.http = http;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
        this.toastCtrl = toastCtrl;
        this.geolocation = geolocation;
        this.platform = platform;
        this.device = device;
        this.popoverCtrl = popoverCtrl;
        this.modalCtrl = modalCtrl;
        this.api = api;
        this.appRate = appRate;
        this.user = {};
        this.persistent_notifications_state = false;
        this.getPersistentNotificationsStatus();
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.ionViewDidLoad = function () {
        this.getUserInfo();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.ionViewDidEnter = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Get User's info
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.getUserInfo = function () {
        var _this = this;
        this.storage.get('user_data').then(function (val) {
            if (val && val != null && val != '') {
                _this.user = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Store setting for persistent notifications
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.getPersistentNotificationsStatus = function () {
        var _this = this;
        this.storage.get('persistent_notifications').then(function (val) {
            if (val && val != null && val != '') {
                _this.persistent_notifications_state = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Favorites Page
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.goToFavoritesPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_10__favorites_favorites__["a" /* FavoritesPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Daily Reports Page
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.goToDailyReportsPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_9__daily_reports_daily_reports__["a" /* DailyReportsPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Feedback Page
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.goToFeedbackPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_8__feedback_feedback__["a" /* FeedbackPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Rate App
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.rateApp = function () {
        // https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8
        // https://play.google.com/store/apps/details?id=com.buzen.contract.airqoapp
        if (this.device.platform) {
            this.appRate.preferences.storeAppURL = {
                ios: 'id1337573091',
                android: 'market://details?id=com.buzen.contract.airqoapp',
            };
            this.appRate.promptForRating(true);
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Enable or Disable Persistent Notifications
    // --------------------------------------------------------------------------------------------------------------------
    SettingsPage.prototype.enableDisablePersistentNotifications = function () {
        this.storage.set("persistent_notifications", this.persistent_notifications_state);
    };
    SettingsPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-settings',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\settings\settings.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>Settings</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content>\n\n  <ion-item-group>\n    <ion-item-divider color="light">Places</ion-item-divider>\n    <ion-item (click)="goToFavoritesPage()">\n      Manage Favorites\n      <ion-icon name="arrow-forward" item-end></ion-icon>\n    </ion-item>\n  </ion-item-group>\n\n  <!-- <br/>\n  <br/>\n  <ion-item-group>\n    <ion-item-divider color="light">Notifications</ion-item-divider>\n    <ion-item (click)="goToDailyReportsPage()">\n      Daily Reports\n      <ion-icon name="arrow-forward" item-end></ion-icon>\n    </ion-item>\n    <ion-item>\n      Threshold Alerts\n      <ion-icon name="arrow-forward" item-end></ion-icon>\n    </ion-item>\n    <ion-item >\n      <ion-label>Notifications</ion-label>\n      <ion-toggle [(ngModel)]="persistent_notifications_state" (ionChange)="enableDisablePersistentNotifications()" [checked]="persistent_notifications_state"></ion-toggle>\n    </ion-item>\n  </ion-item-group> -->\n  \n  <br/>\n  <br/>\n  <ion-item-group>\n    <ion-item-divider color="light">Support</ion-item-divider>\n    <ion-item (click)="goToFeedbackPage()">\n      Send Us Feedback\n      <ion-icon name="arrow-forward" item-end></ion-icon>\n    </ion-item>\n    <ion-item (click)="rateApp()">\n      Rate Us\n      <ion-icon name="arrow-forward" item-end></ion-icon>\n    </ion-item>\n  </ion-item-group>\n\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\settings\settings.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_2__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_4__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* LoadingController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ToastController */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_geolocation__["a" /* Geolocation */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* Platform */],
            __WEBPACK_IMPORTED_MODULE_5__ionic_native_device__["a" /* Device */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["l" /* PopoverController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* ModalController */], __WEBPACK_IMPORTED_MODULE_7__providers_api_api__["a" /* ApiProvider */],
            __WEBPACK_IMPORTED_MODULE_6__ionic_native_app_rate__["a" /* AppRate */]])
    ], SettingsPage);
    return SettingsPage;
}());

//# sourceMappingURL=settings.js.map

/***/ }),

/***/ 352:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FeedbackPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__home_home__ = __webpack_require__(24);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var FeedbackPage = /** @class */ (function () {
    function FeedbackPage(navCtrl, storage, http, loadingCtrl, alertCtrl, toastCtrl, api) {
        this.navCtrl = navCtrl;
        this.storage = storage;
        this.http = http;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
        this.toastCtrl = toastCtrl;
        this.api = api;
        this.user = {};
        this.feedback = {};
        this.feedback_api = this.api.api_endpoint + "/airqoFeedback";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    FeedbackPage.prototype.ionViewDidLoad = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    FeedbackPage.prototype.ionViewDidEnter = function () {
        this.getUserInfo();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get User's info
    // --------------------------------------------------------------------------------------------------------------------
    FeedbackPage.prototype.getUserInfo = function () {
        var _this = this;
        this.storage.get('user_data').then(function (val) {
            if (val && val != null && val != '') {
                _this.user = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Validate Email Address
    // --------------------------------------------------------------------------------------------------------------------
    FeedbackPage.prototype.validateEmail = function (email) {
        var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailPattern.test(String(email).toLowerCase());
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Verify Feedback
    // --------------------------------------------------------------------------------------------------------------------
    FeedbackPage.prototype.verifyFeedback = function () {
        if (Object.keys(this.feedback).length > 0) {
            if (this.validateEmail(this.feedback.email)) {
                var params = {
                    email: this.feedback.email,
                    subject: this.feedback.subject,
                    body: this.feedback.body,
                    api: this.api.api_key
                };
                this.submitFeedback(params);
            }
            else {
                this.alertCtrl.create({
                    title: 'Invalid Email',
                    message: 'Please enter a valid email address',
                    buttons: ['Okay']
                }).present();
            }
        }
        else {
            this.alertCtrl.create({
                title: 'Invalid Submission',
                message: 'Please ensure you have added all the required information',
                buttons: ['Okay']
            }).present();
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Submit Feedback
    // --------------------------------------------------------------------------------------------------------------------
    FeedbackPage.prototype.submitFeedback = function (params) {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'dots',
            content: 'Please wait...',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        loader.present().then(function () {
            _this.http.post(_this.feedback_api, params).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                if (result.success == "100") {
                    _this.feedback.email = "";
                    _this.feedback.subject = "";
                    _this.feedback.body = "";
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: [
                            {
                                text: 'Okay',
                                handler: function (data) {
                                    _this.navCtrl.setRoot(__WEBPACK_IMPORTED_MODULE_5__home_home__["a" /* HomePage */]);
                                }
                            },
                        ]
                    }).present();
                }
                else {
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    FeedbackPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-feedback',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\feedback\feedback.html"*/'<!--\n  Generated template for the FeedbackPage page.\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n  Ionic pages and navigation.\n-->\n<ion-header>\n  <ion-navbar>\n    <ion-title>Feedback</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n  \n  <ion-list>\n\n    <ion-item>\n      <ion-label stacked>Email</ion-label>\n      <ion-input type="email" [(ngModel)]="feedback.email" placeholder="Email Address"></ion-input>\n    </ion-item>\n\n    <ion-item>\n      <ion-label stacked>Subject</ion-label>\n      <ion-input type="text" [(ngModel)]="feedback.subject" placeholder="Enter subject here"></ion-input>\n    </ion-item>\n  \n    <ion-item>\n      <ion-label stacked>Descriptions</ion-label>\n      <ion-textarea type="text" [(ngModel)]="feedback.body" autocomplete="on" autocorrect="on"  placeholder="Enter detailed description here"></ion-textarea>\n    </ion-item>\n\n    <button ion-button block (click)="verifyFeedback()">Submit</button>\n  \n  </ion-list>\n  \n\n</ion-content>\n'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\feedback\feedback.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_2__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* LoadingController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ToastController */], __WEBPACK_IMPORTED_MODULE_4__providers_api_api__["a" /* ApiProvider */]])
    ], FeedbackPage);
    return FeedbackPage;
}());

//# sourceMappingURL=feedback.js.map

/***/ }),

/***/ 353:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DailyReportsPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__add_node_subscription_add_node_subscription__ = __webpack_require__(354);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__node_node__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_api_api__ = __webpack_require__(16);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var DailyReportsPage = /** @class */ (function () {
    function DailyReportsPage(navCtrl, navParams, modalCtrl, toastCtrl, alertCtrl, storage, loadingCtrl, api, http) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.modalCtrl = modalCtrl;
        this.toastCtrl = toastCtrl;
        this.alertCtrl = alertCtrl;
        this.storage = storage;
        this.loadingCtrl = loadingCtrl;
        this.api = api;
        this.http = http;
        this.user = {};
        this.nodes = [];
        this.unsubscribe_api = this.api.api_endpoint + "/airqoSubscribeDailyReports";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.ionViewDidLoad = function () {
        this.getUserInfo();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.ionViewDidEnter = function () {
        this.offlineLoadSubscriptions();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page is about to enter and become the active page
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.ionViewWillEnter = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Get User's info
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.getUserInfo = function () {
        var _this = this;
        this.storage.get('user_data').then(function (val) {
            if (val && val != null && val != '') {
                _this.user = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - Load Subscriptions
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.offlineLoadSubscriptions = function () {
        var _this = this;
        this.storage.get('subscribed_nodes').then(function (val) {
            if (val && val != null && val != '' && val.length > 0) {
                _this.nodes = val;
            }
            else {
                _this.display_message = "No Subscriptions";
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go to Node Details page
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.viewDetails = function (node) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_5__node_node__["a" /* NodePage */], {
            node: node
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Add Node to subscription list
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.openAddSubscription = function () {
        this.modalCtrl.create(__WEBPACK_IMPORTED_MODULE_0__add_node_subscription_add_node_subscription__["a" /* AddNodeSubscriptionPage */]).present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Remove Node from subscription list
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.removeSubscription = function (event, node) {
        var _this = this;
        event.stopPropagation();
        this.alertCtrl.create({
            title: 'Remove!',
            message: 'Are you sure you would like to remove this node from your subscriptions?',
            buttons: [
                {
                    text: 'No',
                    handler: function () { }
                },
                {
                    text: 'Yes',
                    handler: function () {
                        _this.onlineUnSubscribeNode(node);
                    }
                }
            ]
        }).present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Unsubscribe node from daily report
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.onlineUnSubscribeNode = function (node) {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'ios',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        var params = {
            user: this.user.uid,
            state: 'deleted',
            node: node.channel_id,
            api: this.api.api_key,
        };
        loader.present().then(function () {
            _this.http.post(_this.unsubscribe_api, params).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                if (result.success == '100') {
                    _this.offlineUnSubscribeNode(node);
                }
                else {
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - Unsubscribe node from daily report
    // --------------------------------------------------------------------------------------------------------------------
    DailyReportsPage.prototype.offlineUnSubscribeNode = function (node) {
        var _this = this;
        this.storage.get('subscribed_nodes').then(function (val) {
            if (val && val != null && val != '' && val.length > 0) {
                if (val.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
                    for (var i = 0; i < val.length; i++) {
                        if (val[i].channel_id == node.channel_id) {
                            val.splice(i, 1);
                            _this.storage.set("subscribed_nodes", val);
                            _this.nodes = val;
                            _this.toastCtrl.create({
                                message: 'Removed',
                                duration: 2000,
                                position: 'bottom'
                            }).present();
                        }
                    }
                }
            }
            else {
                _this.toastCtrl.create({
                    message: 'Unable to remove node',
                    duration: 2000,
                    position: 'bottom'
                }).present();
            }
        });
    };
    DailyReportsPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["m" /* Component */])({
            selector: 'page-daily-reports',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\daily-reports\daily-reports.html"*/'<ion-header>\n  <ion-navbar color="blue">\n    <ion-title>Daily Reports</ion-title>\n    <ion-buttons end>\n      <button ion-button small icon-only (click)="openAddSubscription()">\n        <ion-icon name="md-add" color="light"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n  <p class="title" *ngIf="nodes.length <= 0">{{ display_message }}</p>\n  <ion-list>\n    <ion-item *ngFor="let node of nodes" (click)="viewDetails(node)">\n      <ion-icon name="pin" item-start></ion-icon>\n      <div class="area-title">{{ node.name }}</div>\n      <div class="area-sub-title">{{ node.location }}</div>\n      <ion-icon name="trash" item-end (click)="removeSubscription($event, node)"></ion-icon>\n    </ion-item>\n  </ion-list>\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\daily-reports\daily-reports.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["h" /* ModalController */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["n" /* ToastController */],
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_3__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_6__providers_api_api__["a" /* ApiProvider */],
            __WEBPACK_IMPORTED_MODULE_4__angular_common_http__["a" /* HttpClient */]])
    ], DailyReportsPage);
    return DailyReportsPage;
}());

//# sourceMappingURL=daily-reports.js.map

/***/ }),

/***/ 354:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AddNodeSubscriptionPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_api_api__ = __webpack_require__(16);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var AddNodeSubscriptionPage = /** @class */ (function () {
    function AddNodeSubscriptionPage(navCtrl, navParams, storage, toastCtrl, viewCtrl, loadingCtrl, http, alertCtrl, api) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.storage = storage;
        this.toastCtrl = toastCtrl;
        this.viewCtrl = viewCtrl;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.alertCtrl = alertCtrl;
        this.api = api;
        this.user = {};
        this.nodes = [];
        this.favorite_nodes = [];
        this.get_places_nodes_list_api = this.api.api_endpoint + "/airqoPlacesCached";
        this.subscribe_api = this.api.api_endpoint + "/airqoSubscribeDailyReports";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.ionViewDidLoad = function () {
        this.getUserInfo();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.ionViewDidEnter = function () {
        if (this.api.isConnected()) {
            this.onlineLoadNodes();
        }
        else {
            this.offlineLoadNodes();
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get User's info
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.getUserInfo = function () {
        var _this = this;
        this.storage.get('user_data').then(function (val) {
            if (val && val != null && val != '') {
                _this.user = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Subscribe node to daily report
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.onlineSubscribeNode = function (node) {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'ios',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        var params = {
            user: this.user.uid,
            state: 'active',
            node: node.channel_id,
            api: this.api.api_key,
        };
        loader.present().then(function () {
            _this.http.post(_this.subscribe_api, params).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                if (result.success == '100') {
                    _this.offlineStoreNodeSubscription(node);
                }
                else {
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Load Nodes from online
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.onlineLoadNodes = function () {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'ios',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        var params = {
            api: this.api.api_key
        };
        loader.present().then(function () {
            _this.http.post(_this.get_places_nodes_list_api, params).subscribe(function (result) {
                console.log(result);
                loader.dismiss();
                _this.places_nodes_list_api_success = result.success;
                if (result.success == '100') {
                    _this.nodes = result.nodes;
                    _this.offlineStoreNodes();
                }
                else {
                    _this.offlineLoadNodes();
                    _this.alertCtrl.create({
                        title: result.title,
                        message: result.message,
                        buttons: ['Okay']
                    }).present();
                }
            }, function (err) {
                _this.offlineLoadNodes();
                loader.dismiss();
                _this.api.networkErrorMessage();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - store nodes offline
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.offlineStoreNodes = function () {
        this.storage.set("nodes", this.nodes);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - retrieve nodes offline
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.offlineLoadNodes = function () {
        var _this = this;
        this.storage.get("nodes").then(function (val) {
            if (val != null && val != '' && val.length > 0) {
                _this.nodes = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - store subscribed node
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.offlineStoreNodeSubscription = function (node) {
        var _this = this;
        this.storage.get('subscribed_nodes').then(function (val) {
            var nodes = [];
            if (val && val != null && val != '' && val.length > 0) {
                if (val.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
                    _this.toastCtrl.create({
                        message: 'Node already added',
                        duration: 2000,
                        position: 'bottom'
                    }).present();
                    _this.removeSingleNodeFromList(node);
                }
                else {
                    val.push(node);
                    _this.storage.set('subscribed_nodes', val);
                    _this.removeSingleNodeFromList(node);
                    _this.toastCtrl.create({
                        message: 'Added',
                        duration: 2000,
                        position: 'bottom'
                    }).present();
                }
            }
            else {
                nodes.push(node);
                _this.storage.set('subscribed_nodes', nodes);
                _this.removeSingleNodeFromList(node);
                _this.toastCtrl.create({
                    message: 'Added',
                    duration: 2000,
                    position: 'bottom'
                }).present();
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Remove single node from list
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.removeSingleNodeFromList = function (node) {
        if (this.nodes.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].channel_id == node.channel_id) {
                    this.nodes.splice(i, 1);
                }
            }
        }
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Close Modal
    // --------------------------------------------------------------------------------------------------------------------
    AddNodeSubscriptionPage.prototype.closeModal = function () {
        this.viewCtrl.dismiss();
    };
    AddNodeSubscriptionPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["m" /* Component */])({
            selector: 'page-add-node-subscription',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\add-node-subscription\add-node-subscription.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>Subscribe</ion-title>\n    <ion-buttons end>\n      <button (click)="closeModal()" color="blue" ion-button icon-only round clear>\n        <ion-icon name="md-close"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n<ion-content padding>\n  <p class="title" *ngIf="places_nodes_list_api_success == \'100\'">Select a node to add to subscriptions</p>\n  <ion-list *ngIf="places_nodes_list_api_success == \'100\'">\n    <ion-item *ngFor="let node of nodes" (click)="onlineSubscribeNode(node)">\n      <ion-icon name="pin" color="grey" item-start></ion-icon>\n      <div class="area-title">{{ node.name }}</div>\n      <div class="area-sub-title">{{ node.location }}</div>\n    </ion-item>\n  </ion-list>\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\add-node-subscription\add-node-subscription.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["n" /* ToastController */],
            __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["o" /* ViewController */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClient */],
            __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_4__providers_api_api__["a" /* ApiProvider */]])
    ], AddNodeSubscriptionPage);
    return AddNodeSubscriptionPage;
}());

//# sourceMappingURL=add-node-subscription.js.map

/***/ }),

/***/ 355:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CameraPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_geolocation__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_camera__ = __webpack_require__(356);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__home_home__ = __webpack_require__(24);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};








var CameraPage = /** @class */ (function () {
    function CameraPage(navCtrl, navParams, storage, toastCtrl, viewCtrl, loadingCtrl, http, alertCtrl, api, geolocation, platform, camera) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.storage = storage;
        this.toastCtrl = toastCtrl;
        this.viewCtrl = viewCtrl;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.alertCtrl = alertCtrl;
        this.api = api;
        this.geolocation = geolocation;
        this.platform = platform;
        this.camera = camera;
        this.user = {};
        this.coordinates = {};
        this.ac_submission = {
            name: '',
            reading: '0',
            comment: '',
            photo: '',
            photo_preview: '',
        };
        this.nodes = [];
        this.favorite_nodes = [];
        this.aqi_camera_api = this.api.api_endpoint + "/airqoAqiCamera";
        this.get_coordinates_api = this.api.external_api_endpoint + "/get-info.php";
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    CameraPage.prototype.ionViewDidLoad = function () {
        this.getUserInfo();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    CameraPage.prototype.ionViewDidEnter = function () {
        var _this = this;
        var options = {
            timeout: 20000,
            enableHighAccuracy: true
        };
        this.platform.ready().then(function () {
            _this.geolocation.getCurrentPosition(options).then(function (pos) {
                _this.coordinates = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
            }).catch(function (error) {
                console.log('Error getting location: ', error);
                _this.toastCtrl.create({
                    message: error.message,
                    duration: 3000,
                    position: 'bottom'
                }).present();
                _this.getCoordinatesByIP();
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get Coordinates By IP Address
    // --------------------------------------------------------------------------------------------------------------------
    CameraPage.prototype.getCoordinatesByIP = function () {
        var _this = this;
        this.http.get(this.get_coordinates_api).subscribe(function (result) {
            console.log(result);
            if (result.success == '1') {
                _this.coordinates.lat = result.message.lat;
                _this.coordinates.lng = result.message.lon;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Get User's info
    // --------------------------------------------------------------------------------------------------------------------
    CameraPage.prototype.getUserInfo = function () {
        var _this = this;
        this.storage.get('user_data').then(function (val) {
            if (val && val != null && val != '') {
                _this.user = val;
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Open Camera
    // --------------------------------------------------------------------------------------------------------------------
    CameraPage.prototype.openCamera = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                try {
                    options = {
                        quality: 100,
                        destinationType: this.camera.DestinationType.DATA_URL,
                        encodingType: this.camera.EncodingType.JPEG,
                        mediaType: this.camera.MediaType.PICTURE,
                        correctOrientation: true
                    };
                    // const result    = await this.camera.getPicture(options);
                    // const image     = `data:image/jpeg;base64,${result}`;
                    // let image_name  = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    // const pictures  = storage().ref(`app-aqi/${image_name}`);
                    // pictures.putString(image, 'data_url');
                    // this.ac_submission.preview  = image;
                    // this.ac_submission.image    = `https://firebasestorage.googleapis.com/v0/b/airqo-frontend-media.appspot.com/o/app-aqi%2F${image_name}?alt=media&token=ad20f42b-0d9d-4c21-81c0-eccfd875ed91`;
                }
                catch (e) {
                    this.toastCtrl.create({
                        message: 'Unable to open camera',
                        duration: 2500,
                        position: 'bottom'
                    }).present();
                }
                return [2 /*return*/];
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Submit AQI Camera Info
    // --------------------------------------------------------------------------------------------------------------------
    CameraPage.prototype.onlineAqiCameraSubmit = function (node) {
        var _this = this;
        if (this.api.isConnected()) {
            var loader_1 = this.loadingCtrl.create({
                spinner: 'ios',
                enableBackdropDismiss: false,
                dismissOnPageChange: true,
                showBackdrop: true
            });
            var params_1 = {
                uid: this.ac_submission.email,
                name: this.ac_submission.name,
                lat: this.coordinates.lat,
                lng: this.coordinates.lng,
                reading: this.ac_submission.reading,
                comment: this.ac_submission.comment,
                photo: this.ac_submission.photo,
                api: this.api.api_key,
            };
            // let params = {
            //   name: this.ac_submission.email,
            //   lat: this.coordinates.lat,
            //   lng: this.coordinates.lng,
            //   reading: this.ac_submission.reading,
            //   comment: this.ac_submission.comment,
            //   photo: 'https://firebasestorage.googleapis.com/v0/b/airqo-frontend-media.appspot.com/o/app-aqi%2F1582535133583-g2vnz?alt=media&token=2e190c2d-f737-468c-a3d4-e06fa9713b10',
            //   api: this.api.api_key,
            // };
            console.log(params_1);
            loader_1.present().then(function () {
                _this.http.post(_this.aqi_camera_api, params_1).subscribe(function (result) {
                    console.log(result);
                    loader_1.dismiss();
                    if (result.success == '100') {
                        _this.alertCtrl.create({
                            title: result.title,
                            message: result.message,
                            buttons: [
                                {
                                    text: 'Okay',
                                    handler: function (data) {
                                        _this.navCtrl.setRoot(__WEBPACK_IMPORTED_MODULE_7__home_home__["a" /* HomePage */]);
                                    }
                                },
                            ]
                        }).present();
                    }
                    else {
                        _this.alertCtrl.create({
                            title: result.title,
                            message: result.message,
                            buttons: ['Okay']
                        }).present();
                    }
                }, function (err) {
                    loader_1.dismiss();
                    _this.api.networkErrorMessage();
                });
            });
        }
        else {
            this.toastCtrl.create({
                message: 'Offline',
                duration: 2500,
                position: 'bottom'
            }).present();
        }
    };
    CameraPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["m" /* Component */])({
            selector: 'page-camera',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\camera\camera.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>AQI Camera</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content>\n  <div class="picture-section">\n    <button class="btn-camera" (click)="openCamera()" [hidden]="ac_submission.preview">\n      <!-- <ion-icon name="camera"></ion-icon> -->\n      <p class="btn-label">\n        <!-- <ion-icon name="add"></ion-icon> -->\n        Add Image\n      </p>\n    </button>\n    <img [src]="ac_submission.preview" class="preview-image" *ngIf="ac_submission.preview" />\n  </div>\n\n  <ion-list>\n    <ion-item>\n      <ion-range min="1" max="500" pin="true" snaps="true" [color]="api.nodeStatus(ac_submission.reading).standard_color" [(ngModel)]="ac_submission.reading">\n        <ion-label range-left small>{{ ac_submission.reading }}</ion-label>\n        <img range-right [src]="api.nodeStatus(ac_submission.reading).dark_face" class="face" />\n      </ion-range>\n    </ion-item>\n\n    <ion-item>\n      <ion-label stacked>Email</ion-label>\n      <ion-input type="text" [(ngModel)]="ac_submission.email" placeholder="Enter email"></ion-input>\n    </ion-item>\n\n    <ion-item>\n      <ion-label stacked>Location</ion-label>\n      <ion-input type="text" [(ngModel)]="ac_submission.name" placeholder="Enter location"></ion-input>\n    </ion-item>\n\n    <ion-item>\n      <ion-label stacked>Comment</ion-label>\n      <ion-textarea type="text" [(ngModel)]="ac_submission.comment" placeholder="Enter Comment"></ion-textarea>\n    </ion-item>\n  </ion-list>\n  \n  <div padding>\n    <button ion-button block (click)="onlineAqiCameraSubmit()">Submit</button>\n  </div>\n\n\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\camera\camera.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["n" /* ToastController */],
            __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["o" /* ViewController */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClient */],
            __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_4__providers_api_api__["a" /* ApiProvider */], __WEBPACK_IMPORTED_MODULE_5__ionic_native_geolocation__["a" /* Geolocation */], __WEBPACK_IMPORTED_MODULE_0_ionic_angular__["k" /* Platform */],
            __WEBPACK_IMPORTED_MODULE_6__ionic_native_camera__["a" /* Camera */]])
    ], CameraPage);
    return CameraPage;
}());

//# sourceMappingURL=camera.js.map

/***/ }),

/***/ 357:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return IntroPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__home_home__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(8);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var IntroPage = /** @class */ (function () {
    function IntroPage(navCtrl, navParams, storage) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.storage = storage;
    }
    // --------------------------------------------------------------------------------------------------------------------
    // When the view loads
    // --------------------------------------------------------------------------------------------------------------------
    IntroPage.prototype.ionViewDidLoad = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Previous Slide
    // --------------------------------------------------------------------------------------------------------------------
    IntroPage.prototype.previousSlide = function () {
        this.slides.slidePrev(500);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Next Slide
    // --------------------------------------------------------------------------------------------------------------------
    IntroPage.prototype.nextSlide = function () {
        this.slides.slideNext(500);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To HomePage
    // --------------------------------------------------------------------------------------------------------------------
    IntroPage.prototype.goToHomePage = function () {
        this.storage.set('intro_page', '1');
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_0__home_home__["a" /* HomePage */]);
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["_8" /* ViewChild */])(__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["m" /* Slides */]),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["m" /* Slides */])
    ], IntroPage.prototype, "slides", void 0);
    IntroPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["m" /* Component */])({
            selector: 'page-intro',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\intro\intro.html"*/'<ion-slides>\n\n  <ion-slide class="bg-blue">\n    <ion-grid>\n      <ion-row text-center>\n        <ion-col>\n          <div class="logo-section">\n            <img src="assets/logos/logo-white-tagline.png"/>\n          </div>\n          <button (click)="nextSlide()" ion-button color="light" clear full class="btn-getting-started btn-border">\n            Get Started\n          </button>\n        </ion-col>\n      </ion-row>\n    </ion-grid>\n  </ion-slide>\n\n  <ion-slide class="bg-green">\n    <ion-grid>\n      <ion-row text-center>\n        <ion-col>\n          <div class="logo-section">\n            <img src="assets/logos/logo-white.png"/>\n          </div>\n          <p class="slide-sub-title">Know your air</p>\n          <!-- <button (click)="nextSlide()" ion-button color="light" clear full class="btn-getting-started grid-bottom">\n            Get Started\n          </button> -->\n        </ion-col>\n      </ion-row>\n    </ion-grid>\n    <!-- <div class="logo-section">\n      <img src="assets/logos/logo-white.png"/>\n    </div>\n    <p class="slide-sub-title">Understand the state of air quality around you in Kampala</p> -->\n\n    <ion-grid class="grid-bottom">\n      <ion-row>\n        <ion-col>\n          <button (click)="goToHomePage()" ion-button color="light" clear full>\n            Skip\n          </button>\n        </ion-col>\n        <ion-col>\n          <button (click)="nextSlide()" ion-button color="light" clear full>\n            Next\n          </button>\n        </ion-col>\n      </ion-row>\n    </ion-grid>\n  </ion-slide>\n\n  <ion-slide class="bg-yellow">\n    <div class="logo-section">\n      <img src="assets/logos/logo-white.png"/>\n    </div>\n    <p class="slide-sub-title">Fine-grained and Real-time Air Quality Data</p>\n\n    <ion-grid class="grid-bottom">\n      <ion-row>\n        <ion-col>\n          <button (click)="goToHomePage()" ion-button color="light" clear full>\n            Skip\n          </button>\n        </ion-col>\n        <ion-col>\n          <button (click)="nextSlide()" ion-button color="light" clear full>\n            Next\n          </button>\n        </ion-col>\n      </ion-row>\n    </ion-grid>\n  </ion-slide>\n\n  <ion-slide class="bg-black">\n    <div class="logo-section">\n      <img src="assets/logos/logo-white.png"/>\n    </div>\n    <p class="slide-sub-title">Know which places to avoid</p>\n\n    <ion-grid class="grid-bottom">\n      <ion-row>\n        <ion-col>\n          <button (click)="previousSlide()" ion-button color="light" clear full>\n            Back\n          </button>\n        </ion-col>\n        <ion-col>\n          <button (click)="goToHomePage()" ion-button color="light" clear full>\n            Done\n          </button>\n        </ion-col>\n      </ion-row>\n    </ion-grid>\n  </ion-slide>\n\n</ion-slides>\n'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\intro\intro.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1__ionic_storage__["b" /* Storage */]])
    ], IntroPage);
    return IntroPage;
}());

//# sourceMappingURL=intro.js.map

/***/ }),

/***/ 360:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(361);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(380);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 380:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__pages_forgot_password_forgot_password__ = __webpack_require__(125);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__pages_add_node_subscription_add_node_subscription__ = __webpack_require__(354);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__pages_feedback_feedback__ = __webpack_require__(352);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__pages_daily_reports_daily_reports__ = __webpack_require__(353);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_network__ = __webpack_require__(209);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_add_place_add_place__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__pages_node_node__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__ionic_native_geolocation__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__pages_sign_up_sign_up__ = __webpack_require__(349);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__pages_sign_in_sign_in__ = __webpack_require__(112);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__pages_settings_settings__ = __webpack_require__(350);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__pages_search_search__ = __webpack_require__(343);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__pages_menu_menu__ = __webpack_require__(346);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__pages_map_map__ = __webpack_require__(348);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__pages_key_key__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__pages_intro_intro__ = __webpack_require__(357);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__pages_favorites_favorites__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__pages_camera_camera__ = __webpack_require__(355);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__angular_platform_browser__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__ionic_native_splash_screen__ = __webpack_require__(358);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__ionic_native_status_bar__ = __webpack_require__(359);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__app_component__ = __webpack_require__(445);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__pages_home_home__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__ionic_native_device__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__ionic_native_sqlite__ = __webpack_require__(446);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__ionic_native_social_sharing__ = __webpack_require__(347);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_30__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__ionic_native_app_rate__ = __webpack_require__(351);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_32__ionic_native_camera__ = __webpack_require__(356);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

































var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_19__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_23__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_24__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_17__pages_camera_camera__["a" /* CameraPage */],
                __WEBPACK_IMPORTED_MODULE_16__pages_favorites_favorites__["a" /* FavoritesPage */],
                __WEBPACK_IMPORTED_MODULE_15__pages_intro_intro__["a" /* IntroPage */],
                __WEBPACK_IMPORTED_MODULE_14__pages_key_key__["a" /* KeyPage */],
                __WEBPACK_IMPORTED_MODULE_13__pages_map_map__["a" /* MapPage */],
                __WEBPACK_IMPORTED_MODULE_12__pages_menu_menu__["a" /* MenuPage */],
                __WEBPACK_IMPORTED_MODULE_6__pages_node_node__["a" /* NodePage */],
                __WEBPACK_IMPORTED_MODULE_11__pages_search_search__["a" /* SearchPage */],
                __WEBPACK_IMPORTED_MODULE_10__pages_settings_settings__["a" /* SettingsPage */],
                __WEBPACK_IMPORTED_MODULE_9__pages_sign_in_sign_in__["a" /* SignInPage */],
                __WEBPACK_IMPORTED_MODULE_8__pages_sign_up_sign_up__["a" /* SignUpPage */],
                __WEBPACK_IMPORTED_MODULE_0__pages_forgot_password_forgot_password__["a" /* ForgotPasswordPage */],
                __WEBPACK_IMPORTED_MODULE_5__pages_add_place_add_place__["a" /* AddPlacePage */],
                __WEBPACK_IMPORTED_MODULE_3__pages_daily_reports_daily_reports__["a" /* DailyReportsPage */],
                __WEBPACK_IMPORTED_MODULE_2__pages_feedback_feedback__["a" /* FeedbackPage */],
                __WEBPACK_IMPORTED_MODULE_1__pages_add_node_subscription_add_node_subscription__["a" /* AddNodeSubscriptionPage */],
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_18__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_20_ionic_angular__["f" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_23__app_component__["a" /* MyApp */], {}, {
                    links: []
                }),
                __WEBPACK_IMPORTED_MODULE_26__ionic_storage__["a" /* IonicStorageModule */].forRoot(),
                __WEBPACK_IMPORTED_MODULE_25__angular_common_http__["b" /* HttpClientModule */],
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_20_ionic_angular__["d" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_23__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_24__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_17__pages_camera_camera__["a" /* CameraPage */],
                __WEBPACK_IMPORTED_MODULE_16__pages_favorites_favorites__["a" /* FavoritesPage */],
                __WEBPACK_IMPORTED_MODULE_15__pages_intro_intro__["a" /* IntroPage */],
                __WEBPACK_IMPORTED_MODULE_14__pages_key_key__["a" /* KeyPage */],
                __WEBPACK_IMPORTED_MODULE_13__pages_map_map__["a" /* MapPage */],
                __WEBPACK_IMPORTED_MODULE_12__pages_menu_menu__["a" /* MenuPage */],
                __WEBPACK_IMPORTED_MODULE_6__pages_node_node__["a" /* NodePage */],
                __WEBPACK_IMPORTED_MODULE_11__pages_search_search__["a" /* SearchPage */],
                __WEBPACK_IMPORTED_MODULE_10__pages_settings_settings__["a" /* SettingsPage */],
                __WEBPACK_IMPORTED_MODULE_9__pages_sign_in_sign_in__["a" /* SignInPage */],
                __WEBPACK_IMPORTED_MODULE_8__pages_sign_up_sign_up__["a" /* SignUpPage */],
                __WEBPACK_IMPORTED_MODULE_0__pages_forgot_password_forgot_password__["a" /* ForgotPasswordPage */],
                __WEBPACK_IMPORTED_MODULE_5__pages_add_place_add_place__["a" /* AddPlacePage */],
                __WEBPACK_IMPORTED_MODULE_3__pages_daily_reports_daily_reports__["a" /* DailyReportsPage */],
                __WEBPACK_IMPORTED_MODULE_2__pages_feedback_feedback__["a" /* FeedbackPage */],
                __WEBPACK_IMPORTED_MODULE_1__pages_add_node_subscription_add_node_subscription__["a" /* AddNodeSubscriptionPage */],
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_22__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_21__ionic_native_splash_screen__["a" /* SplashScreen */],
                __WEBPACK_IMPORTED_MODULE_32__ionic_native_camera__["a" /* Camera */],
                __WEBPACK_IMPORTED_MODULE_27__ionic_native_device__["a" /* Device */],
                __WEBPACK_IMPORTED_MODULE_28__ionic_native_sqlite__["a" /* SQLite */],
                __WEBPACK_IMPORTED_MODULE_7__ionic_native_geolocation__["a" /* Geolocation */],
                __WEBPACK_IMPORTED_MODULE_29__ionic_native_social_sharing__["a" /* SocialSharing */],
                __WEBPACK_IMPORTED_MODULE_30__providers_api_api__["a" /* ApiProvider */],
                __WEBPACK_IMPORTED_MODULE_4__ionic_native_network__["a" /* Network */],
                { provide: __WEBPACK_IMPORTED_MODULE_19__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_20_ionic_angular__["e" /* IonicErrorHandler */] },
                __WEBPACK_IMPORTED_MODULE_30__providers_api_api__["a" /* ApiProvider */],
                __WEBPACK_IMPORTED_MODULE_31__ionic_native_app_rate__["a" /* AppRate */],
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 40:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NodePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__home_home__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_common_http__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__providers_api_api__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_chart_js__ = __webpack_require__(435);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_chart_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_chart_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__key_key__ = __webpack_require__(110);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};








var NodePage = /** @class */ (function () {
    function NodePage(navCtrl, navParams, storage, toastCtrl, loadingCtrl, http, alertCtrl, api) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.storage = storage;
        this.toastCtrl = toastCtrl;
        this.loadingCtrl = loadingCtrl;
        this.http = http;
        this.alertCtrl = alertCtrl;
        this.api = api;
        this.user = {};
        this.node = {};
        this.background_image = '';
        this.is_favorite = true;
        this.graphs_segments = 'history';
        this.history_node_api = this.api.api_endpoint + "/airqoPlace24Hours";
        this.history_node_api_success = true;
        this.forecast_node_api = this.api.api_endpoint + "/placeForecast";
        this.forecast_node_api_success = true;
        if (this.navParams.get("node")) {
            this.node = this.navParams.get("node");
            if (this.node.feeds) {
                if (this.api.isISOFormat(this.node.feeds.created_at)) {
                    this.node.refreshed = null;
                }
            }
            else {
                this.node.feeds = {};
                this.node.feeds.field1 = '0.00';
            }
            if (this.node.lat && this.node.lng) {
            }
            else {
                this.node.lat = this.node.feeds.field5;
                this.node.lng = this.node.feeds.field6;
            }
        }
        else {
            this.navCtrl.setRoot(__WEBPACK_IMPORTED_MODULE_0__home_home__["a" /* HomePage */]);
        }
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.ionViewDidLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.offlineLoadHistoryNodeInfo();
                        this.offlineLoadForecastNodeInfo();
                        if (!this.api.isConnected()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.onlineLoadHistoryNodeInfo()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.onlineLoadNodeForecastInfo()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        this.api.offlineMessage();
                        return [4 /*yield*/, this.offlineLoadHistoryNodeInfo()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.offlineLoadForecastNodeInfo()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.ionViewDidEnter = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.isNodeFavorite(this.node);
                console.log(this.node);
                return [2 /*return*/];
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Load Node Info from online
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.onlineLoadHistoryNodeInfo = function () {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'ios',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        var params = {
            api: this.api.api_key,
            channel: this.node.channel_id
        };
        this.storage.get("history").then(function (val) {
            if (val != null && val != '' && val && val.length > 0) {
                if (val.filter(function (item) { return item.channel_id === _this.node.channel_id; }).length != 0) {
                }
                else {
                    loader.present();
                }
            }
        });
        this.http.post(this.history_node_api, params).subscribe(function (result) {
            console.log(result);
            if (result.success == '100' && result.feed.hourly_results) {
                if (result.feed.hourly_results.length > 0) {
                    _this.history_node_api_success = true;
                    _this.node.refreshed = result.feed.hourly_results[0].time;
                    _this.node.feeds.field1 = result.feed.hourly_results[0].pm2_5;
                    _this.offlineStoreHistoryStoreNodeInfo(result.feed.hourly_results, _this.node);
                    _this.getHistoryGraphData(result.feed.hourly_results);
                }
                loader.dismiss();
            }
            else {
                _this.toastCtrl.create({
                    message: 'History information not available',
                    duration: 3000,
                    position: 'bottom',
                    showCloseButton: true,
                }).present();
                // this.storage.get("history").then((val) => {
                //   if(val && val != null && val != '' && val.length > 0) {
                //   } else {
                //     this.history_node_api_success = false;
                //     loader.dismiss();
                //     this.toastCtrl.create({
                //       message: 'History information not available',
                //       duration: 3500,
                //       position: 'bottom'
                //     }).present();
                //   }
                // });
            }
        }, function (err) {
            _this.history_node_api_success = false;
            _this.api.networkErrorMessage();
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Online - Load Node Forecast Info from online
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.onlineLoadNodeForecastInfo = function () {
        var _this = this;
        var loader = this.loadingCtrl.create({
            spinner: 'ios',
            enableBackdropDismiss: false,
            dismissOnPageChange: true,
            showBackdrop: true
        });
        var params = {
            api: this.api.api_key,
            lat: this.node.lat,
            lng: this.node.lng
        };
        this.storage.get("forecast").then(function (val) {
            if (val != null && val != '' && val && val.length > 0) {
                if (val.filter(function (item) { return item.channel_id === _this.node.channel_id; }).length != 0) {
                }
                else {
                    // loader.present();
                }
            }
        });
        this.http.post(this.forecast_node_api, params).subscribe(function (result) {
            console.log(result);
            if ((result.success == '100') && result.formatted_results) {
                if (result.formatted_results.predictions.length > 0) {
                    _this.forecast_node_api_success = true;
                    console.log(result.formatted_results.predictions);
                    _this.offlineStoreForecastStoreNodeInfo(result.formatted_results.predictions);
                    _this.getForecastGraphData(result.formatted_results.predictions);
                }
                loader.dismiss();
            }
            else {
                _this.forecast_node_api_success = false;
                loader.dismiss();
                _this.toastCtrl.create({
                    message: 'Forecast information not available',
                    duration: 3000,
                    position: 'bottom',
                    showCloseButton: true,
                }).present();
            }
        }, function (err) {
            _this.forecast_node_api_success = false;
            loader.dismiss();
            _this.api.networkErrorMessage();
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Draw History Graph
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.getHistoryGraphData = function (graph_feeds) {
        if (graph_feeds.length > 0) {
            var x_data = [];
            var y_data = [];
            var bar_colors = [];
            graph_feeds = graph_feeds.slice(0, 48);
            graph_feeds.reverse();
            for (var i = 0; i < graph_feeds.length; i++) {
                y_data.push(parseFloat(graph_feeds[i].pm2_5));
                x_data.push(this.api.graphTime(graph_feeds[i].time));
                bar_colors.push(this.api.nodeStatus(graph_feeds[i].pm2_5, null).color);
            }
            this.barChartHistory = new __WEBPACK_IMPORTED_MODULE_6_chart_js__["Chart"](this.barCanvasHistory.nativeElement, {
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
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Draw Forecast Graph
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.getForecastGraphData = function (graph_feeds) {
        if (graph_feeds.length > 0) {
            var x_data = [];
            var y_data = [];
            var bar_colors = [];
            graph_feeds = graph_feeds.slice(0, 24);
            for (var i = 0; i < graph_feeds.length; i++) {
                y_data.push(parseFloat(graph_feeds[i].prediction_value));
                x_data.push(this.api.graphTime(graph_feeds[i].prediction_time));
                bar_colors.push(this.api.nodeStatus(graph_feeds[i].prediction_value, null).color);
            }
            this.barChartForecast = new __WEBPACK_IMPORTED_MODULE_6_chart_js__["Chart"](this.barCanvasForecast.nativeElement, {
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
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - store node history info offline
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.offlineStoreHistoryStoreNodeInfo = function (history_array, node) {
        var _this = this;
        this.storage.get("history").then(function (val) {
            var __node_history = [];
            var history_data = {
                channel_id: _this.node.channel_id,
                node: node,
                history: history_array
            };
            if (val != null && val != '' && val && val.length > 0) {
                if (val.filter(function (item) { return item.channel_id === _this.node.channel_id; }).length != 0) {
                    for (var i = 0; i < val.length; i++) {
                        if (val[i].channel_id == _this.node.channel_id) {
                            val[i].history = history_array;
                            break;
                        }
                    }
                }
                else {
                    val.push(history_data);
                }
                __node_history = val;
                _this.storage.set('history', __node_history);
            }
            else {
                __node_history.push(history_data);
                _this.storage.set('history', __node_history);
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - store node forecast info offline
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.offlineStoreForecastStoreNodeInfo = function (forecast_array) {
        var _this = this;
        this.storage.get("forecast").then(function (val) {
            var __node_forecast = [];
            var forecast_data = {
                channel_id: _this.node.channel_id,
                forecast: forecast_array
            };
            if (val != null && val != '' && val && val.length > 0) {
                if (val.filter(function (item) { return item.channel_id === _this.node.channel_id; }).length != 0) {
                    for (var i = 0; i < val.length; i++) {
                        if (val[i].channel_id == _this.node.channel_id) {
                            val[i].forecast = forecast_array;
                            break;
                        }
                    }
                }
                else {
                    val.push(forecast_data);
                }
                __node_forecast = val;
                _this.storage.set('forecast', __node_forecast);
            }
            else {
                __node_forecast.push(forecast_data);
                _this.storage.set('forecast', __node_forecast);
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - retrieve node history info offline
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.offlineLoadHistoryNodeInfo = function () {
        var _this = this;
        this.storage.get("history").then(function (val) {
            if (val != null && val != '' && val) {
                for (var i = 0; i < val.length; i++) {
                    if (val[i].channel_id == _this.node.channel_id) {
                        _this.node = val[i].node;
                        _this.getHistoryGraphData(val[i].history);
                        break;
                    }
                }
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - retrieve node forecast info offline
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.offlineLoadForecastNodeInfo = function () {
        var _this = this;
        this.storage.get("forecast").then(function (val) {
            if (val != null && val != '' && val) {
                for (var i = 0; i < val.length; i++) {
                    if (val[i].channel_id == _this.node.channel_id) {
                        _this.getForecastGraphData(val[i].forecast);
                        break;
                    }
                }
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Add Node to favorites list
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.addToFavoritesList = function (node) {
        var _this = this;
        this.alertCtrl.create({
            title: 'ADD TO FAVORITES',
            message: 'Add node to favorites?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: function () { }
                },
                {
                    text: 'Add',
                    handler: function () {
                        _this.storage.get('favorites').then(function (val) {
                            var nodes = [];
                            if (val && val != null && val != '' && val.length > 0) {
                                if (val.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
                                    _this.is_favorite = false;
                                    _this.toastCtrl.create({
                                        message: 'Place already added',
                                        duration: 2000,
                                        position: 'bottom'
                                    }).present();
                                }
                                else {
                                    val.push(node);
                                    _this.storage.set('favorites', val);
                                    _this.is_favorite = true;
                                    _this.toastCtrl.create({
                                        message: 'Added',
                                        duration: 2000,
                                        position: 'bottom'
                                    }).present();
                                }
                            }
                            else {
                                nodes.push(node);
                                _this.storage.set('favorites', nodes);
                                _this.is_favorite = true;
                                _this.toastCtrl.create({
                                    message: 'Added',
                                    duration: 2000,
                                    position: 'bottom'
                                }).present();
                            }
                        });
                    }
                }
            ]
        }).present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Check if node exists in favorites list
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.isNodeFavorite = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!node.channel_id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.storage.get('favorites').then(function (val) {
                                if (val && val != null && val != '' && val.length > 0) {
                                    if (val.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
                                        _this.is_favorite = true;
                                    }
                                    else {
                                        _this.is_favorite = false;
                                    }
                                }
                                else {
                                    _this.is_favorite = false;
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.is_favorite = true;
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go To Key Page
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.goToKeyPage = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_7__key_key__["a" /* KeyPage */]);
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go Back
    // --------------------------------------------------------------------------------------------------------------------
    NodePage.prototype.goBack = function () {
        this.navCtrl.pop();
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["_8" /* ViewChild */])('barCanvasHistory'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_1__angular_core__["t" /* ElementRef */])
    ], NodePage.prototype, "barCanvasHistory", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["_8" /* ViewChild */])('barCanvasForecast'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_1__angular_core__["t" /* ElementRef */])
    ], NodePage.prototype, "barCanvasForecast", void 0);
    NodePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["m" /* Component */])({
            selector: 'page-node',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\node\node.html"*/'<ion-header>\n  <ion-navbar color="blue">\n    <ion-buttons end>\n      <button color="light" ion-button icon-only (click)="addToFavoritesList(node)">\n        <ion-icon name="md-star" color="white" item-end [hidden]="is_favorite"></ion-icon>\n        <span *ngIf="is_favorite">AIR QUALITY</span>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n\n<ion-content no-bounce [ngStyle] ="{\'background-image\' : \'url(\'+ api.nodeStatus(node.feeds.field1, node.refreshed).background +\')\'}">\n\n  <!-- <ion-refresher (ionRefresh)="onlineLoadHistoryNodeInfo(); onlineLoadNodeForecastInfo()">\n    <ion-refresher-content pullingIcon="arrow-round-down"\n    pullingText="Pull to refresh"\n    refreshingSpinner="dots"\n    refreshingText="Refreshing..."></ion-refresher-content>\n  </ion-refresher> -->\n    \n <div class="top-section">\n\n  <div class="place">\n    <p class="place-name">{{ node.name }}</p>\n    <p class="place-location">{{ node.location }}</p>\n  </div>\n\n  <ion-card class="node-card">\n    <ion-grid class="node bg-white">\n      <ion-row class="readings-section" [style.backgroundColor]="api.nodeStatus(node.feeds.field1, node.refreshed).color">\n        <ion-col col-3 class="face bg-darker">\n          <img [src]="api.nodeStatus(node.feeds.field1, node.refreshed).face"/>\n        </ion-col>\n        <ion-col col-4 class="values">\n          <p class="number moderate-bold" [style.color]="api.nodeStatus(node.feeds.field1, node.refreshed).font_color">{{ node.feeds.field1 }}</p>\n          <p class="number-label moderate-bold" [style.color]="api.nodeStatus(node.feeds.field1, node.refreshed).font_color">PM<sub>2.5</sub></p>\n        </ion-col>\n        <ion-col col-5 class="label">\n          <p text-wrap class="value-label moderate-bold" [style.color]="api.nodeStatus(node.feeds.field1, node.refreshed).font_color">{{ api.nodeStatus(node.feeds.field1, node.refreshed).label }}</p>\n        </ion-col>\n      </ion-row>\n      <ion-row class="footer-section">\n        <ion-col text-wrap class="date-section">\n          <span class="node-refresh-date" *ngIf="node.refreshed">\n            Last Refreshed: {{ api.ago(api.getReadableInternationalDateFormatFromSQLFormat(node.refreshed)) }}\n          </span>\n        </ion-col>\n      </ion-row>\n    </ion-grid>\n  </ion-card>\n\n  <!-- <ion-card class="key-card">\n    <div class="key">\n      <div text-wrap class="key-label bg-green white">Good</div>\n      <div text-wrap class="key-label bg-yellow dark-blue">Moderate</div>\n      <div text-wrap class="key-label bg-orange white">Unhealthy for sensitive groups</div>\n      <div text-wrap class="key-label bg-red white">Unhealthy</div>\n      <div text-wrap class="key-label bg-purple white">Very Unhealthy</div>\n      <div text-wrap class="key-label bg-maroon white">Hazardous</div>\n    </div>\n  </ion-card> -->\n </div>\n\n<div class="bottom-section bg-white">\n\n  <div class="graph-section" padding>\n    <ion-segment [color]="api.nodeStatus(node.feeds.field1, node.refreshed).standard_color" [(ngModel)]="graphs_segments">\n      <ion-segment-button value="history">\n        HISTORY\n      </ion-segment-button>\n      <ion-segment-button value="forecast">\n        FORECAST\n      </ion-segment-button>\n    </ion-segment>\n  </div>\n\n  <!-- <div>\n    <div class="bar-canvas" [hidden]="graphs_segments != \'history\'">\n      <canvas #barCanvasHistory></canvas>\n      <p class="no-data" *ngIf="history_node_api_success === false">NO HISTORY DATA</p>\n    </div>\n\n    <div class="bar-canvas" [hidden]="graphs_segments != \'forecast\'">\n      <canvas #barCanvasForecast></canvas>\n      <p class="no-data" *ngIf="forecast_node_api_success === false">NO FORECAST DATA</p>\n    </div>\n  </div> -->\n\n  <div class="scroll-chart">\n    <div class="chartAreaWrapper" [hidden]="graphs_segments != \'history\'">\n      <canvas #barCanvasHistory id="historyChart"></canvas>\n      <p class="no-data" *ngIf="history_node_api_success === false">NO HISTORY DATA</p>\n    </div>\n    <div class="chartAreaWrapper" [hidden]="graphs_segments != \'forecast\'">\n      <canvas #barCanvasForecast id="forecastChart"></canvas>\n      <p class="no-data" *ngIf="forecast_node_api_success === false">NO FORECAST DATA</p>\n    </div>\n  </div>\n\n</div>\n\n  <ion-fab right middle (click)="goToKeyPage()">\n    <button ion-fab color="green">KEY</button>\n  </ion-fab>\n\n\n</ion-content>\n'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\node\node.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_3__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["n" /* ToastController */],
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["g" /* LoadingController */], __WEBPACK_IMPORTED_MODULE_4__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_5__providers_api_api__["a" /* ApiProvider */]])
    ], NodePage);
    return NodePage;
}());

//# sourceMappingURL=node.js.map

/***/ }),

/***/ 437:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": 210,
	"./af.js": 210,
	"./ar": 211,
	"./ar-dz": 212,
	"./ar-dz.js": 212,
	"./ar-kw": 213,
	"./ar-kw.js": 213,
	"./ar-ly": 214,
	"./ar-ly.js": 214,
	"./ar-ma": 215,
	"./ar-ma.js": 215,
	"./ar-sa": 216,
	"./ar-sa.js": 216,
	"./ar-tn": 217,
	"./ar-tn.js": 217,
	"./ar.js": 211,
	"./az": 218,
	"./az.js": 218,
	"./be": 219,
	"./be.js": 219,
	"./bg": 220,
	"./bg.js": 220,
	"./bm": 221,
	"./bm.js": 221,
	"./bn": 222,
	"./bn.js": 222,
	"./bo": 223,
	"./bo.js": 223,
	"./br": 224,
	"./br.js": 224,
	"./bs": 225,
	"./bs.js": 225,
	"./ca": 226,
	"./ca.js": 226,
	"./cs": 227,
	"./cs.js": 227,
	"./cv": 228,
	"./cv.js": 228,
	"./cy": 229,
	"./cy.js": 229,
	"./da": 230,
	"./da.js": 230,
	"./de": 231,
	"./de-at": 232,
	"./de-at.js": 232,
	"./de-ch": 233,
	"./de-ch.js": 233,
	"./de.js": 231,
	"./dv": 234,
	"./dv.js": 234,
	"./el": 235,
	"./el.js": 235,
	"./en-au": 236,
	"./en-au.js": 236,
	"./en-ca": 237,
	"./en-ca.js": 237,
	"./en-gb": 238,
	"./en-gb.js": 238,
	"./en-ie": 239,
	"./en-ie.js": 239,
	"./en-il": 240,
	"./en-il.js": 240,
	"./en-in": 241,
	"./en-in.js": 241,
	"./en-nz": 242,
	"./en-nz.js": 242,
	"./en-sg": 243,
	"./en-sg.js": 243,
	"./eo": 244,
	"./eo.js": 244,
	"./es": 245,
	"./es-do": 246,
	"./es-do.js": 246,
	"./es-us": 247,
	"./es-us.js": 247,
	"./es.js": 245,
	"./et": 248,
	"./et.js": 248,
	"./eu": 249,
	"./eu.js": 249,
	"./fa": 250,
	"./fa.js": 250,
	"./fi": 251,
	"./fi.js": 251,
	"./fil": 252,
	"./fil.js": 252,
	"./fo": 253,
	"./fo.js": 253,
	"./fr": 254,
	"./fr-ca": 255,
	"./fr-ca.js": 255,
	"./fr-ch": 256,
	"./fr-ch.js": 256,
	"./fr.js": 254,
	"./fy": 257,
	"./fy.js": 257,
	"./ga": 258,
	"./ga.js": 258,
	"./gd": 259,
	"./gd.js": 259,
	"./gl": 260,
	"./gl.js": 260,
	"./gom-deva": 261,
	"./gom-deva.js": 261,
	"./gom-latn": 262,
	"./gom-latn.js": 262,
	"./gu": 263,
	"./gu.js": 263,
	"./he": 264,
	"./he.js": 264,
	"./hi": 265,
	"./hi.js": 265,
	"./hr": 266,
	"./hr.js": 266,
	"./hu": 267,
	"./hu.js": 267,
	"./hy-am": 268,
	"./hy-am.js": 268,
	"./id": 269,
	"./id.js": 269,
	"./is": 270,
	"./is.js": 270,
	"./it": 271,
	"./it-ch": 272,
	"./it-ch.js": 272,
	"./it.js": 271,
	"./ja": 273,
	"./ja.js": 273,
	"./jv": 274,
	"./jv.js": 274,
	"./ka": 275,
	"./ka.js": 275,
	"./kk": 276,
	"./kk.js": 276,
	"./km": 277,
	"./km.js": 277,
	"./kn": 278,
	"./kn.js": 278,
	"./ko": 279,
	"./ko.js": 279,
	"./ku": 280,
	"./ku.js": 280,
	"./ky": 281,
	"./ky.js": 281,
	"./lb": 282,
	"./lb.js": 282,
	"./lo": 283,
	"./lo.js": 283,
	"./lt": 284,
	"./lt.js": 284,
	"./lv": 285,
	"./lv.js": 285,
	"./me": 286,
	"./me.js": 286,
	"./mi": 287,
	"./mi.js": 287,
	"./mk": 288,
	"./mk.js": 288,
	"./ml": 289,
	"./ml.js": 289,
	"./mn": 290,
	"./mn.js": 290,
	"./mr": 291,
	"./mr.js": 291,
	"./ms": 292,
	"./ms-my": 293,
	"./ms-my.js": 293,
	"./ms.js": 292,
	"./mt": 294,
	"./mt.js": 294,
	"./my": 295,
	"./my.js": 295,
	"./nb": 296,
	"./nb.js": 296,
	"./ne": 297,
	"./ne.js": 297,
	"./nl": 298,
	"./nl-be": 299,
	"./nl-be.js": 299,
	"./nl.js": 298,
	"./nn": 300,
	"./nn.js": 300,
	"./oc-lnc": 301,
	"./oc-lnc.js": 301,
	"./pa-in": 302,
	"./pa-in.js": 302,
	"./pl": 303,
	"./pl.js": 303,
	"./pt": 304,
	"./pt-br": 305,
	"./pt-br.js": 305,
	"./pt.js": 304,
	"./ro": 306,
	"./ro.js": 306,
	"./ru": 307,
	"./ru.js": 307,
	"./sd": 308,
	"./sd.js": 308,
	"./se": 309,
	"./se.js": 309,
	"./si": 310,
	"./si.js": 310,
	"./sk": 311,
	"./sk.js": 311,
	"./sl": 312,
	"./sl.js": 312,
	"./sq": 313,
	"./sq.js": 313,
	"./sr": 314,
	"./sr-cyrl": 315,
	"./sr-cyrl.js": 315,
	"./sr.js": 314,
	"./ss": 316,
	"./ss.js": 316,
	"./sv": 317,
	"./sv.js": 317,
	"./sw": 318,
	"./sw.js": 318,
	"./ta": 319,
	"./ta.js": 319,
	"./te": 320,
	"./te.js": 320,
	"./tet": 321,
	"./tet.js": 321,
	"./tg": 322,
	"./tg.js": 322,
	"./th": 323,
	"./th.js": 323,
	"./tk": 324,
	"./tk.js": 324,
	"./tl-ph": 325,
	"./tl-ph.js": 325,
	"./tlh": 326,
	"./tlh.js": 326,
	"./tr": 327,
	"./tr.js": 327,
	"./tzl": 328,
	"./tzl.js": 328,
	"./tzm": 329,
	"./tzm-latn": 330,
	"./tzm-latn.js": 330,
	"./tzm.js": 329,
	"./ug-cn": 331,
	"./ug-cn.js": 331,
	"./uk": 332,
	"./uk.js": 332,
	"./ur": 333,
	"./ur.js": 333,
	"./uz": 334,
	"./uz-latn": 335,
	"./uz-latn.js": 335,
	"./uz.js": 334,
	"./vi": 336,
	"./vi.js": 336,
	"./x-pseudo": 337,
	"./x-pseudo.js": 337,
	"./yo": 338,
	"./yo.js": 338,
	"./zh-cn": 339,
	"./zh-cn.js": 339,
	"./zh-hk": 340,
	"./zh-hk.js": 340,
	"./zh-mo": 341,
	"./zh-mo.js": 341,
	"./zh-tw": 342,
	"./zh-tw.js": 342
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 437;

/***/ }),

/***/ 445:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__pages_home_home__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__pages_intro_intro__ = __webpack_require__(357);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_status_bar__ = __webpack_require__(359);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_splash_screen__ = __webpack_require__(358);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__ionic_native_device__ = __webpack_require__(39);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var MyApp = /** @class */ (function () {
    function MyApp(app, platform, statusBar, splashScreen, storage, device, alertCtrl) {
        this.storage = storage;
        this.rootPage = __WEBPACK_IMPORTED_MODULE_0__pages_home_home__["a" /* HomePage */];
        platform.ready().then(function () {
            statusBar.styleDefault();
            splashScreen.hide();
            // if(device.platform){
            //   if(device.platform.toLowerCase() == "android"){
            //     platform.registerBackButtonAction(() => {
            //       let nav = app.getActiveNavs()[0];
            //       let activeView = nav.getActive();                
            //       if(activeView.name === 'HomePage') {
            //         if (nav.canGoBack()){
            //           nav.pop();
            //         } else {
            //           alertCtrl.create({
            //             title: 'Exit App',
            //             message: 'You are about to exit the app?',
            //             buttons: [{
            //               text: 'Cancel',
            //               role: 'cancel',
            //               handler: () => {}
            //             },{
            //               text: 'Proceed',
            //               handler: () => {
            //                 platform.exitApp();
            //               }
            //             }]
            //           }).present();
            //         }
            //       }
            //     });
            //   }
            // }
            // this.directUser();
        });
    }
    // --------------------------------------------------------------------------------------------------------------------
    // See if user is first time user or not
    // --------------------------------------------------------------------------------------------------------------------
    MyApp.prototype.directUser = function () {
        var _this = this;
        this.storage.get('intro_page').then(function (val) {
            if (val && val != null && val != '') {
                _this.rootPage = __WEBPACK_IMPORTED_MODULE_0__pages_home_home__["a" /* HomePage */];
            }
            else {
                _this.rootPage = __WEBPACK_IMPORTED_MODULE_1__pages_intro_intro__["a" /* IntroPage */];
            }
        });
    };
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["m" /* Component */])({template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\app\app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\app\app.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["c" /* App */], __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["k" /* Platform */], __WEBPACK_IMPORTED_MODULE_4__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_5__ionic_native_splash_screen__["a" /* SplashScreen */], __WEBPACK_IMPORTED_MODULE_6__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_7__ionic_native_device__["a" /* Device */],
            __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["b" /* AlertController */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 59:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FavoritesPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_storage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__add_place_add_place__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__node_node__ = __webpack_require__(40);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var FavoritesPage = /** @class */ (function () {
    function FavoritesPage(navCtrl, navParams, modalCtrl, toastCtrl, alertCtrl, storage) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.modalCtrl = modalCtrl;
        this.toastCtrl = toastCtrl;
        this.alertCtrl = alertCtrl;
        this.storage = storage;
        this.nodes = [];
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Runs when the page has loaded. Fires only once
    // --------------------------------------------------------------------------------------------------------------------
    FavoritesPage.prototype.ionViewDidLoad = function () { };
    // --------------------------------------------------------------------------------------------------------------------
    // Fires everytime page loads
    // --------------------------------------------------------------------------------------------------------------------
    FavoritesPage.prototype.ionViewDidEnter = function () {
        this.offlineLoadFavorites();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Offline - Load favorites list
    // --------------------------------------------------------------------------------------------------------------------
    FavoritesPage.prototype.offlineLoadFavorites = function () {
        var _this = this;
        this.storage.get('favorites').then(function (val) {
            if (val && val != null && val != '' && val.length > 0) {
                _this.nodes = val;
            }
            else {
                _this.display_message = "No Favorites";
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Go to Node Details page
    // --------------------------------------------------------------------------------------------------------------------
    FavoritesPage.prototype.viewDetails = function (node) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_4__node_node__["a" /* NodePage */], {
            node: node
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Add Place/Node from favorites list
    // --------------------------------------------------------------------------------------------------------------------
    FavoritesPage.prototype.openAddFavorites = function () {
        var _this = this;
        var modal = this.modalCtrl.create(__WEBPACK_IMPORTED_MODULE_3__add_place_add_place__["a" /* AddPlacePage */]);
        modal.onDidDismiss(function () {
            _this.offlineLoadFavorites();
        });
        modal.present();
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Remove Place/Node from favorites list
    // --------------------------------------------------------------------------------------------------------------------
    FavoritesPage.prototype.removeFavorite = function (event, node) {
        var _this = this;
        event.stopPropagation();
        this.alertCtrl.create({
            title: 'Remove!',
            message: 'Are you sure you would like to remove this place from your favorites?',
            buttons: [
                {
                    text: 'No',
                    handler: function () { }
                },
                {
                    text: 'Yes',
                    handler: function () {
                        _this.storage.get('favorites').then(function (val) {
                            if (val && val != null && val != '' && val.length > 0) {
                                if (val.filter(function (item) { return item.channel_id === node.channel_id; }).length != 0) {
                                    for (var i = 0; i < val.length; i++) {
                                        if (val[i].channel_id == node.channel_id) {
                                            val.splice(i, 1);
                                            _this.storage.set("favorites", val);
                                            _this.nodes = val;
                                            _this.toastCtrl.create({
                                                message: 'Removed',
                                                duration: 2000,
                                                position: 'bottom'
                                            }).present();
                                        }
                                    }
                                }
                            }
                            else {
                                _this.toastCtrl.create({
                                    message: 'Unable to remove node',
                                    duration: 2000,
                                    position: 'bottom'
                                }).present();
                            }
                        });
                    }
                }
            ]
        }).present();
    };
    FavoritesPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-favorites',template:/*ion-inline-start:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\favorites\favorites.html"*/'<ion-header>\n  <ion-navbar color="blue">\n    <ion-title>My Places</ion-title>\n    <ion-buttons end>\n      <button ion-button small icon-only (click)="openAddFavorites()">\n        <ion-icon name="md-add" color="light"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n  <p class="title" *ngIf="nodes.length <= 0">{{ display_message }}</p>\n  <ion-list>\n    <ion-item *ngFor="let node of nodes" (click)="viewDetails(node)">\n      <ion-icon name="md-star" color="grey" item-start></ion-icon>\n      <div class="area-title">{{ node.name }}</div>\n      <div class="area-sub-title">{{ node.location }}</div>\n      <ion-icon name="trash" color="danger" item-end (click)="removeFavorite($event, node)"></ion-icon>\n    </ion-item>\n  </ion-list>\n</ion-content>'/*ion-inline-end:"C:\Users\Hp\Documents\Ionic Projects\airqo\src\pages\favorites\favorites.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["j" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* ModalController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["n" /* ToastController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["b" /* AlertController */], __WEBPACK_IMPORTED_MODULE_2__ionic_storage__["b" /* Storage */]])
    ], FavoritesPage);
    return FavoritesPage;
}());

//# sourceMappingURL=favorites.js.map

/***/ })

},[360]);
//# sourceMappingURL=main.js.map