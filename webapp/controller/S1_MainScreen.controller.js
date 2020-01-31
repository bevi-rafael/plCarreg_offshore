sap.ui.define([
	"com/eldorado/ewm/plCarregOffshore/controller/BaseController",
	'sap/ui/model/Filter', 
	'sap/ui/model/FilterOperator', 
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	"sap/m/MessageBox"
], function(BaseController, Filter, FilterOperator, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("com.eldorado.ewm.plCarregOffshore.controller.S1_MainScreen", {

		onInit: function() {
			this.getView().setModel( this.oGenericModel.createDefaultViewModel(), 'view');
			
			// call the base component's init function
			// BaseController.prototype.onInit.apply(this, arguments);
			
			this._oComponent	= this.getOwnerComponent();
			this._oBundle		= this._oComponent.getModel('i18n').getResourceBundle();
			
			var oViewModel = this.getView().getModel('view');
	    	oViewModel.setProperty('/busy', true);
	    	
			// this._requestOdataLgnum();
		},
		
		// _requestOdataLgnum: function () {
		// 	var oLgnum = this.getOwnerComponent().getModel("lgnum");
		// 	var oModel = this.getOwnerComponent().getModel('DadosPorto'); 
		// 	var aHtml, oModelHtml;
			
		// 	var onSuccess = function(oResultData, oResponse) {
		// 		this.setLgnum(oResultData.results[0]);
		// 		this.aLgnum = this.getLgnum();
		// 		oModel.read('/PortoSet', { success: onSuccessArray, error: onError } );
		// 	}.bind(this);
			
		// 	var onSuccessArray = function(oResultData, oResponse) {
		//     	oLgnum.setData(oResultData.results);

		// 		if(!this.aLgnum.IDPorto){ 
		// 			this.setLgnum(oLgnum.getData()[0]);
		// 			this.aLgnum = this.getLgnum();
		// 		}
		// 		if(this.aLgnum){
		// 			aHtml = "<strong><em>" + this.aLgnum.IDPorto + ' - ' + this.aLgnum.DescPorto + "</em></strong>";
		// 		}
					
		// 		oModelHtml = new JSONModel({HTMLPORTO: aHtml});
		// 		this.getView().setModel(oModelHtml);
		// 		this._requestPerfil(this.aLgnum.IDPorto);
		// 		this.onSearch();
		// 	}.bind(this);
			
		// 	var onError = function(oError) {
		// 		MessageToast.show(this.getMsg("msg001"));
		// 	}.bind(this);
			
		// 	oModel.read('/PortoUsuarioSet', { success: onSuccess, error: onError } );
		// },
		
		// _requestPerfil: function(Lgnum) {
		// 	var oViewModel = this.getView().getModel('view');
		// 	var oFilters = [];

		// 	var onSuccess = function(oResultData, oResponse) {
		// 		this.setLgnumUpd(true);
		// 		oViewModel.setProperty('/busy', false);
		// 	}.bind(this);
			
		// 	var onError = function(oError) {
		// 		oViewModel.setProperty('/busy', false);
		// 		MessageToast.show(this.getMsg("msg002"));
		// 	}.bind(this);
			
		// 	oFilters.push(new Filter("LGNUM", FilterOperator.EQ, Lgnum ));
		// 	oFilters.push(new Filter("TCODE", FilterOperator.EQ, 'ZTMF03' ));
		// 	var oModel = this.getOwnerComponent().getModel('DadosPorto'); 
		// 	oModel.read('/PerfilUsuarioSet', { filters: oFilters, success: onSuccess, error: onError } );
		// },
		
		// onLgnumPress: function(oEvent) {
			
		// 	if (this._oDialogLgnum) {
		// 		this._oDialogLgnum.destroy();
		// 		this._oDialogLgnum = undefined;
		// 	}
			
		// 	if(!this._oDialogLgnum){
		// 		this._oDialogLgnum = new sap.m.SelectDialog({
		// 			noDataText:"-",
		// 			title:"{i18n>lgnum}",
		// 			class:"sapUiPopupWithPadding sapUiSizeCompact",
		// 			liveChange: this.handleSearchLgnum.bind(this),
		// 			search: this.handleSearchLgnum.bind(this),
		// 			confirm: this.handleCloseLgnum.bind(this),
		// 			cancel: this.handleCloseLgnum.bind(this),
		// 	        items: {
		// 	            path:"DadosPorto>/PortoSet",
		// 	            template: new sap.m.StandardListItem({
		// 					id:"listLgnum",
		// 					title:"{DadosPorto>IDPorto}",
		// 					description:"{DadosPorto>DescPorto}",
		// 					iconDensityAware:false,
		// 					iconInset:false,
		// 					type:"Active"
		// 				})
	 //           	}
		// 		});
		// 	}
			
		// 	this.getView().addDependent(this._oDialogLgnum);

		// 	// toggle compact style
		// 	jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogLgnum);
		// 	this._oDialogLgnum.open();
		// },
		
		// handleSearchLgnum: function(oEvent) {
		// 	var sValue = oEvent.getParameter("value");
		// 	var oFilter = new Filter( "IDPorto", FilterOperator.Contains, sValue );
		// 	oEvent.getSource().getBinding("items").filter([oFilter]);
		// },

		// handleCloseLgnum: function(oEvent) {
		// 	var aContexts = oEvent.getParameter("selectedContexts");
		// 	var oViewModel = this.getView().getModel('view');
		// 	if (aContexts && aContexts.length) {
		// 		oViewModel.setProperty('/busy', true);
		// 		var aSelect = aContexts.map(function(oContext) { return oContext.getObject(); });
		// 		this.setLgnum(aSelect[0]);
		// 		this.aLgnum = this.getLgnum();
		// 		var aHtml = "<strong><em>" + this.aLgnum.IDPorto + ' - ' + this.aLgnum.DescPorto + "</em></strong>";
		// 		var oModelHtml = new JSONModel({HTMLPORTO: aHtml});
		// 		this.getView().setModel(oModelHtml);
		// 		this._requestPerfil(this.aLgnum.IDPorto);
		// 		this.onClear();
		// 		this.onSearch();
		// 	}
		// }
		
	});

});