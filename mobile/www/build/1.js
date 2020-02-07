webpackJsonp([1],{

/***/ 482:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ContactModalPageModule", function() { return ContactModalPageModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__contact_modal__ = __webpack_require__(484);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var ContactModalPageModule = /** @class */ (function () {
    function ContactModalPageModule() {
    }
    ContactModalPageModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_2__contact_modal__["a" /* ContactModalPage */],
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* IonicPageModule */].forChild(__WEBPACK_IMPORTED_MODULE_2__contact_modal__["a" /* ContactModalPage */]),
            ],
        })
    ], ContactModalPageModule);
    return ContactModalPageModule;
}());

//# sourceMappingURL=contact-modal.module.js.map

/***/ }),

/***/ 484:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ContactModalPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_storage__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_rest_rest__ = __webpack_require__(37);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var ContactModalPage = /** @class */ (function () {
    function ContactModalPage(navCtrl, navParams, viewCtrl, storage, restProvider) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
        this.storage = storage;
        this.restProvider = restProvider;
        this.contact = {};
    }
    // --------------------------------------------------------------------------------------------------------------------
    // When the view loads: check for about information
    // --------------------------------------------------------------------------------------------------------------------
    ContactModalPage.prototype.ionViewDidLoad = function () {
        var _this = this;
        this.storage.get('about_list').then(function (val) {
            if (val != null) {
                _this.contact = {
                    phone: val.c_phone,
                    email: val.c_email,
                    address: val.c_address,
                    info: val.c_info
                };
                console.log("Received: ", _this.contact);
            }
            else {
                _this.restProvider.showToast('Please check your internet connection', 'center', 5);
            }
        });
    };
    // --------------------------------------------------------------------------------------------------------------------
    // Close CONTACT INFORMATION modal
    // --------------------------------------------------------------------------------------------------------------------
    ContactModalPage.prototype.closeContactModal = function () {
        this.viewCtrl.dismiss();
    };
    ContactModalPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-contact-modal',template:/*ion-inline-start:"/Users/Aine/Documents/Ionic Projects/airqo/src/pages/contact-modal/contact-modal.html"*/'\n<ion-content padding>\n  <ion-fab right top edge>\n    <button mini ion-fab clear \n      color="airqo_blue" \n      class="pop-in" \n      (click)="closeContactModal()">\n        <ion-icon name="close" class="close-icon"></ion-icon>\n    </button>\n  </ion-fab>\n\n  <ion-list no-lines>\n    <ion-item text-wrap>\n      <ion-icon name="call" item-start></ion-icon>\n      <span class="item-text">{{ contact.phone }}</span>\n    </ion-item>\n    <ion-item text-wrap>\n      <ion-icon name="mail" item-start></ion-icon>\n      <span class="item-text">{{ contact.email }}</span>\n    </ion-item>\n    <ion-item text-wrap>\n      <ion-icon name="pin" item-start></ion-icon>\n      <span class="item-text">{{ contact.address }}</span>\n    </ion-item>\n  </ion-list>\n</ion-content>\n'/*ion-inline-end:"/Users/Aine/Documents/Ionic Projects/airqo/src/pages/contact-modal/contact-modal.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["k" /* ViewController */],
            __WEBPACK_IMPORTED_MODULE_2__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_3__providers_rest_rest__["a" /* RestProvider */]])
    ], ContactModalPage);
    return ContactModalPage;
}());

//# sourceMappingURL=contact-modal.js.map

/***/ })

});
//# sourceMappingURL=1.js.map