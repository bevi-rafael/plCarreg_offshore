sap.ui.define([
	"sap/ui/core/mvc/Controller", 
	"sap/ui/core/routing/History", 
	"com/eldorado/ewm/plCarregOffshore/util/Formatter", 
	"com/eldorado/ewm/plCarregOffshore/model/models"
], function(Controller, History, Formatter, Models) {
	"use strict";
	
	var Lgnum;
	
	return Controller.extend("com.eldorado.ewm.plCarregOffshore.controller.S0_App", {
		oFormatter: Formatter, 
		oGenericModel: Models,

		onInit: function(){
		},
		
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		}, 
		
		onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("mainScreen", {}, true /*no history*/);
			}
		},
		
		onNavMain: function (oEvent) {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash === undefined) {
				this.getRouter().navTo("mainScreen", {}, true /*no history*/);
			}
		},
		
		getBundle: function(){
			return this.getOwnerComponent().getModel('i18n').getResourceBundle();
		},
		
		getMsg: function(msgId){
			var oBundle = this.getBundle();
			return oBundle.getText(msgId);
		},
		
		getLgnum: function(){
			return Lgnum;
		},
		
		setLgnum: function(Val){
			Lgnum = Val;
		}
		
	});
	
});