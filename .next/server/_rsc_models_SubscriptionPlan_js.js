"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_rsc_models_SubscriptionPlan_js";
exports.ids = ["_rsc_models_SubscriptionPlan_js"];
exports.modules = {

/***/ "(rsc)/./models/SubscriptionPlan.js":
/*!************************************!*\
  !*** ./models/SubscriptionPlan.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst subscriptionPlanSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    title: {\n        type: String,\n        required: true\n    },\n    duration: {\n        type: Number,\n        required: true\n    },\n    price: {\n        type: Number,\n        required: true,\n        default: 0\n    },\n    isActive: {\n        type: Boolean,\n        default: true\n    }\n}, {\n    timestamps: true\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).SubscriptionPlan || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"SubscriptionPlan\", subscriptionPlanSchema));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9tb2RlbHMvU3Vic2NyaXB0aW9uUGxhbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBK0I7QUFFL0IsTUFBTUMseUJBQXlCLElBQUlELHdEQUFlLENBQUM7SUFDakRHLE9BQU87UUFBRUMsTUFBTUM7UUFBUUMsVUFBVTtJQUFLO0lBQ3RDQyxVQUFVO1FBQUVILE1BQU1JO1FBQVFGLFVBQVU7SUFBSztJQUN6Q0csT0FBTztRQUFFTCxNQUFNSTtRQUFRRixVQUFVO1FBQU1JLFNBQVM7SUFBRTtJQUNsREMsVUFBVTtRQUFFUCxNQUFNUTtRQUFTRixTQUFTO0lBQUs7QUFDM0MsR0FBRztJQUFFRyxZQUFZO0FBQUs7QUFFdEIsaUVBQWViLHdEQUFlLENBQUNlLGdCQUFnQixJQUFJZixxREFBYyxDQUFDLG9CQUFvQkMsdUJBQXVCQSxFQUFBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGVyc2lhbi1wb3MvLi9tb2RlbHMvU3Vic2NyaXB0aW9uUGxhbi5qcz8wODkzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSdcblxuY29uc3Qgc3Vic2NyaXB0aW9uUGxhblNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICB0aXRsZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIGR1cmF0aW9uOiB7IHR5cGU6IE51bWJlciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgcHJpY2U6IHsgdHlwZTogTnVtYmVyLCByZXF1aXJlZDogdHJ1ZSwgZGVmYXVsdDogMCB9LFxuICBpc0FjdGl2ZTogeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiB0cnVlIH0sXG59LCB7IHRpbWVzdGFtcHM6IHRydWUgfSlcblxuZXhwb3J0IGRlZmF1bHQgbW9uZ29vc2UubW9kZWxzLlN1YnNjcmlwdGlvblBsYW4gfHwgbW9uZ29vc2UubW9kZWwoJ1N1YnNjcmlwdGlvblBsYW4nLCBzdWJzY3JpcHRpb25QbGFuU2NoZW1hKVxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwic3Vic2NyaXB0aW9uUGxhblNjaGVtYSIsIlNjaGVtYSIsInRpdGxlIiwidHlwZSIsIlN0cmluZyIsInJlcXVpcmVkIiwiZHVyYXRpb24iLCJOdW1iZXIiLCJwcmljZSIsImRlZmF1bHQiLCJpc0FjdGl2ZSIsIkJvb2xlYW4iLCJ0aW1lc3RhbXBzIiwibW9kZWxzIiwiU3Vic2NyaXB0aW9uUGxhbiIsIm1vZGVsIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./models/SubscriptionPlan.js\n");

/***/ })

};
;