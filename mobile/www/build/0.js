webpackJsonp([0],{

/***/ 483:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KeyModalPageModule", function() { return KeyModalPageModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__key_modal__ = __webpack_require__(485);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var KeyModalPageModule = /** @class */ (function () {
    function KeyModalPageModule() {
    }
    KeyModalPageModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_2__key_modal__["a" /* KeyModalPage */],
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* IonicPageModule */].forChild(__WEBPACK_IMPORTED_MODULE_2__key_modal__["a" /* KeyModalPage */]),
            ],
        })
    ], KeyModalPageModule);
    return KeyModalPageModule;
}());

//# sourceMappingURL=key-modal.module.js.map

/***/ }),

/***/ 485:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return KeyModalPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var KeyModalPage = /** @class */ (function () {
    function KeyModalPage(navCtrl, navParams, viewCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
    }
    // --------------------------------------------------------------------------------------------------------------------
    // Close Color Key Modal
    // --------------------------------------------------------------------------------------------------------------------
    KeyModalPage.prototype.closeKeyModal = function () {
        this.viewCtrl.dismiss();
    };
    KeyModalPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-key-modal',template:/*ion-inline-start:"/Users/Aine/Documents/Ionic Projects/airqo/src/pages/key-modal/key-modal.html"*/'<ion-header>\n\n  <ion-navbar>\n    <ion-title>AirQo Key</ion-title>\n    <ion-buttons end>\n      <button (click)="closeKeyModal()" color="airqo_blue" ion-button icon-only round clear>\n        <ion-icon ios="ios-close"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n\n</ion-header>\n\n\n<ion-content>\n  <table text-wrap>\n  	<tbody>\n  		<tr class="heading">\n  			<!-- <th>PM2.5 concentration mapping</th> -->\n  			<th>&nbsp;&nbsp;Classification&nbsp;&nbsp;</th>\n  			<th>Health Implications/Precaution statement.</th>\n  		</tr>\n  		<tr class="good">\n  			<td class="td-images">\n          <img src="assets/icons/happiness.png" class="face"/><br />\n          <img src="assets/imgs/st-1-good.png" class="image-icon"/>\n        </td>\n  			<td class="td-text">\n          <span class="title">Good (0 - 12)</span><br/><br/>\n          Air quality is good for everyone.\n        </td>\n  		</tr>\n  		<tr class="moderate">\n        <td class="td-images">\n          <img src="assets/icons/happiness.png" class="face"/><br />\n          <img src="assets/imgs/st-2-moderate.png" class="image-icon"/>\n        </td>\n  			<td class="td-text">\n          <span class="title">Moderate (12.1 - 35.4)</span><br/><br/>\n          <b>Unusually sensitive people</b>: Consider reducing prolonged or heavy exertion.<br /><br />\n\n          <b>Everyone else</b>: Air pollution poses little or no risk.\n        </td>\n  		</tr>\n  		<tr class="unhealthy-sensitive-groups">\n        <td class="td-images">\n          <img src="assets/icons/embarrased.png" class="face"/><br />\n          <img src="assets/imgs/st-3-unhealthy-sensitive-people.png" class="image-icon"/>\n        </td>\n  			<td class="td-text">\n          <span class="title">Unhealthy for sensitive groups (35.6 - 55.4)</span><br/><br/>\n          <b>Sensitive groups</b>: Reduce prolonged or heavy exertion. It&#39;s OK to be active outside, but take more breaks and do less intense activities.<br /><br />\n\n          <b>People with asthma </b>should follow their asthma action plans and keep quick relief medicine handy.<br /><br />\n\n          <b>If you have heart disease</b>: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of<br />these, contact your heath care provider.\n        </td>\n  		</tr>\n  		<tr class="unhealthy">\n        <td class="td-images">\n          <img src="assets/icons/sad.png" class="face"/><br />\n          <img src="assets/imgs/st-4-unhealthy.png" class="image-icon"/>\n        </td>\n  			<td class="td-text">\n          <span class="title">Unhealthy (55.5 - 150.4)</span><br/><br/>\n          <b>Sensitive groups</b>: Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling.<br /><br />\n\n          <b>Everyone else</b>: Reduce prolonged or heavy exertion. Take more breaks during all outdoor activities.\n        </td>\n  		</tr>\n  		<tr class="very-unhealthy">\n        <td class="td-images">\n          <img src="assets/icons/sad.png" class="face"/><br />\n          <img src="assets/imgs/st-5-very-unhealthy.png" class="image-icon"/>\n        </td>\n  			<td class="td-text">\n          <span class="title">Very unhealthy (150.5 - 250.4)</span><br/><br/>\n          <b>Sensitive groups</b>: Avoid all physical activity outdoors. Move activities indoors or reschedule to a time when air quality is better.<br /><br />\n\n  			  <b>Everyone else</b>: Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling to a time when air quality is better.<br />\n          &nbsp;\n        </td>\n  		</tr>\n  		<tr class="hazardous">\n        <td class="td-images">\n          <img src="assets/icons/sad.png" class="face"/><br />\n          <img src="assets/imgs/st-6-hazardous.png" class="image-icon"/>\n        </td>\n  			<td class="td-text">\n          <span class="title">Hazardous (250.5 - 500.4)</span><br/><br/>\n          <b>Everyone</b>: Avoid all physical activity outdoors.<br /><br />\n          \n          <b>Sensitive groups</b>: Remain indoors and keep activity levels low. Follow tips for keeping particle levels low indoors.\n        </td>\n  		</tr>\n  	</tbody>\n  </table>\n\n</ion-content>\n'/*ion-inline-end:"/Users/Aine/Documents/Ionic Projects/airqo/src/pages/key-modal/key-modal.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* ViewController */]])
    ], KeyModalPage);
    return KeyModalPage;
}());

//# sourceMappingURL=key-modal.js.map

/***/ })

});
//# sourceMappingURL=0.js.map