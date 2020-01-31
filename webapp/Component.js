sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/m/BusyDialog",
	"com/eldorado/ewm/plCarregOffshore/model/models"
], function(UIComponent, Device, BusyDialog, models) {
	"use strict";

	return UIComponent.extend("com.eldorado.ewm.plCarregOffshore.Component", {

		metadata: {
			manifest: "json"
		},

		constructor: function(sId, mSettings) {
			UIComponent.call(this, "PlCarregOff", mSettings);
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			this.getRouter().initialize();
		}
	});
});