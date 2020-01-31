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
	    	
			this._requestOdataLgnum();
		},
		
		_requestOdataLgnum: function () {
			var oLgnum = this.getOwnerComponent().getModel("lgnum");
			var oViewModel = this.getView().getModel('view');

			var onSuccess = function(oResultData, oResponse) {
				oLgnum.setData(oResultData.results);
				
				var aDados = oResultData.results;
				var field = {}; field = aDados[0];
				for(var i=0; i < aDados.length; i++){
					if(aDados[i].Padrao === true){ field = aDados[i]; break; }
				}
				this.setLgnum(field);
				this._addHead();
				// this.onSearch();
	    		oViewModel.setProperty('/busy', false);
			}.bind(this);

			var onError = function(oError) {
				MessageToast.show(this.getMsg("msg001"));
	    		oViewModel.setProperty('/busy', false);
			}.bind(this);
			
			var oModel = this.getOwnerComponent().getModel('DadosOffshore'); 
			oModel.read('/WerksSet', { success: onSuccess, error: onError } );
		},
		
		onLgnumPress: function(oEvent) {
			var oLgnum = this.getOwnerComponent().getModel("lgnum");
			if(oLgnum.getData().length > 0){
				
				if (this._oDialogLgnum) {
					this._oDialogLgnum.destroy();
					this._oDialogLgnum = undefined;
				}
				
				if(!this._oDialogLgnum){
					this._oDialogLgnum = new sap.m.SelectDialog({
						noDataText:"-",
						title:"{i18n>werks}",
						class:"sapUiPopupWithPadding sapUiSizeCompact",
						liveChange: this.handleSearchLgnum.bind(this),
						search: this.handleSearchLgnum.bind(this),
						confirm: this.handleCloseLgnum.bind(this),
						cancel: this.handleCloseLgnum.bind(this),
				        items: {
				            path:"lgnum>/",
				            template: new sap.m.StandardListItem({
								id:"listLgnum",
								title:"{lgnum>Centro}",
								description:"{lgnum>Descricao}",
								iconDensityAware:false,
								iconInset:false,
								type:"Active"
							})
		            	}
					});
				}
				
				this.getView().addDependent(this._oDialogLgnum);
	
				// toggle compact style
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogLgnum);
				this._oDialogLgnum.open();
				
			} else{
				MessageToast.show(this.getMsg("msg001"));
			}
			
		},
		
		handleSearchLgnum: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter( "Centro", FilterOperator.Contains, sValue );
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		handleCloseLgnum: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oViewModel = this.getView().getModel('view');
			if (aContexts && aContexts.length) {
				oViewModel.setProperty('/busy', true);
				var aSelect = aContexts.map(function(oContext) { return oContext.getObject(); });
				this.setLgnum(aSelect[0]);
				this._addHead();
				// this.onClear();
				// this.onSearch();
			}
		},
		
		_addHead: function(){
			var aHtml = "<strong><em>" + this.getLgnum().Centro + ' - ' + this.getLgnum().Descricao + "</em></strong>";
			var oModelHtml = new JSONModel({HTMLPORTO: aHtml});
			this.getView().setModel(oModelHtml);
		}
		
	});

});