sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDefaultViewModel: function() {
			var oModel = new JSONModel({
				busy: false,
				busyDelay: 10
			});
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},
                               
		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});