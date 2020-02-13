sap.ui.define([
	"com/eldorado/ewm/plCarregOffshore/controller/BaseController",
	'sap/ui/model/Filter', 
	'sap/ui/model/FilterOperator', 
	'sap/ui/model/json/JSONModel',
	'sap/ui/table/TablePersoController',
	'sap/m/MessageToast',
	"sap/m/MessageBox",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function(BaseController, Filter, FilterOperator, JSONModel, TablePersoController, MessageToast, MessageBox, Export, ExportTypeCSV) {
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
			// var Status = this.showStatusInit();
			// this.getView().setModel(Status);
		},
		
		showStatusInit: function() {
			var oTable = this.getView().byId("idTable"); 
			var aTemp1 = [];
			var aStatusData = [];
					
			for (var i = 0; i < oTable.length; i++) {
				var oLinha = oTable[i];
				if (oLinha.STATUS && jQuery.inArray(oLinha.STATUS, aTemp1) < 0) {
					aTemp1.push(oLinha.STATUS);
					aStatusData.push({Name: oLinha.STATUS});
				}
			}
			oTable.STATUS = aStatusData;
		},	
		
		_PersonTable: function(Table) {
			var oModel = this.getOwnerComponent().getModel("table");	
			var oProvider = {
				getPersData: function() {
					var oDeferred = new jQuery.Deferred();
					if (!this._oBundle) {
						this._oBundle = oModel.getData();
					}
					var oBundle = this._oBundle;
					oDeferred.resolve(oBundle);
					return oDeferred.promise();
				},
		
				setPersData: function(oBundle) {
					var oDeferred = new jQuery.Deferred();
					this._oBundle = oBundle;
					oDeferred.resolve();
					return oDeferred.promise();
				},
				
				delPersData: function() {
					var oDeferred = jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				}
			};
	
			this._oTPC = new TablePersoController({
				table: this.getView().byId("idTable"),
				persoService: oProvider
			});
		},
		
		onPerso: function() {
			this._oTPC.openDialog();
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
	    		oViewModel.setProperty('/busy', false);
			}.bind(this);

			var onError = function(oError) {
				MessageToast.show(this.getMsg("errorLgnum"));
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
			} else{ MessageToast.show(this.getMsg("errorLgnum")); }
		},
		
		handleSearchLgnum: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter( "Centro", FilterOperator.Contains, sValue );
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		handleCloseLgnum: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var aSelect = aContexts.map(function(oContext) { return oContext.getObject(); });
				if(aSelect[0].Centro !== this.getLgnum().Centro){
					this.setLgnum(aSelect[0]);
					this._addHead();
				}
			}
		},
		
		_addHead: function(){
			var aHtml = "<strong><em>" + this.getLgnum().Centro + ' - ' + this.getLgnum().Descricao + "</em></strong>";
			var oModelHtml = new JSONModel({HTMLPORTO: aHtml});
			this.getView().setModel(oModelHtml);
			
			if(this.getLgnum().Auth === false){
				MessageToast.show(this.getMsg("notAuthLgnum"));
				this.getView().byId("idTable").setVisible(false);
			}else{
				this.getView().byId("idTable").setVisible(true);
				// this.onClear();
				this.onSearch();
			}
		},
		
		onSearch: function(oEvent){
			var oTable = this.getOwnerComponent().getModel("table");
			var oViewModel = this.getView().getModel('view');
			oViewModel.setProperty('/busy', true);
			
			var oFilters = [];
			oFilters = this._loadFilters();

			var onSuccess = function(oResultData, oResponse) {
				oTable.setData(oResultData.results);
				oViewModel.setProperty('/busy', false);
			}.bind(this);

			var onError = function(oError) {
				MessageToast.show(this.getMsg("errorTable"));
				oTable.setData([]);
	    		oViewModel.setProperty('/busy', false);
			}.bind(this);
			
			var oModel = this.getOwnerComponent().getModel('DadosOffshore'); 
			oModel.read('/TableSet', { filters: oFilters, success: onSuccess, error: onError } );
			
			this._PersonTable();
		},
		
		onRefresh: function(oEvent){
			this.onSearch();
		},
		
		_loadFilters: function(){
			var oFilters	= [];
			var aFilterNum_pln	= this.getView().byId('filterNum_pln');
			var aFilterDocno	= this.getView().byId('filterDocno');
			var aFilterPl_veic	= this.getView().byId('filterPl_veic');
			var aFilterVagao	= this.getView().byId('filterVagao');
			var aFilterBl		= this.getView().byId('filterBl');
			var aFilterMatnr	= this.getView().byId('filterMatnr');
			var aFilterDtCarre	= this.getView().byId('filterDtCarre');
			
			oFilters.push(new Filter("WERKS", FilterOperator.EQ, this.getLgnum().Centro) );
			
			if(aFilterNum_pln.getValue()){
				oFilters.push(new Filter("NUM_PLN", FilterOperator.EQ, aFilterNum_pln.getValue() ));
			}
			
			if(aFilterDocno.getValue()){
				oFilters.push(new Filter("DOCNO", FilterOperator.EQ, aFilterDocno.getValue() ));
			}
			
			if(aFilterPl_veic.getValue()){
				oFilters.push(new Filter("PL_VEIC", FilterOperator.EQ, aFilterPl_veic.getValue() ));
			}
			
			if(aFilterVagao.getValue()){
				oFilters.push(new Filter("VAGAO", FilterOperator.EQ, aFilterVagao.getValue() ));
			}
			
			if(aFilterBl.getValue()){
				oFilters.push(new Filter("BL", FilterOperator.EQ, aFilterBl.getValue() ));
			}
			
			if(aFilterMatnr.getValue()){
				oFilters.push(new Filter("MATNR", FilterOperator.EQ, aFilterMatnr.getValue() ));
			}
			
			if(aFilterDtCarre.getDateValue()) {
				if(aFilterDtCarre.getFrom()){
					var dateIni	= aFilterDtCarre.getFrom().toISOString().slice(0, 10).replace(/-/g, '');
					var dateFim	= aFilterDtCarre.getTo().toISOString().slice(0, 10).replace(/-/g, '');
					oFilters.push( new Filter('DT_CARREG', FilterOperator.BT, dateIni, dateFim));	
				}
			}

			return oFilters;
		},
		
		//Search Help - Nº PL Carregamento 
		handleValueHelpNum_pln: function(oEvent){
			
			if (this._valueHelpDialogNum_pln) {
				this._valueHelpDialogNum_pln.destroy();
				this._valueHelpDialogNum_pln = undefined;
			}
			
			this._valueHelpDialogNum_pln = new sap.m.SelectDialog({
				noDataText:"-",
				rememberSelections:true,
				title:"{i18n>num_pln}",
				class:"sapUiSizeCompact",
				liveChange: this.handleSearchNum_pln.bind(this),
				search: this.handleSearchNum_pln.bind(this),
				confirm: this.handleOkNum_pln.bind(this),
		        items: {
		            path:"DadosOffshore>/Schp_Num_plnSet",
					filters: [
						new Filter("WERKS", FilterOperator.EQ, this.getLgnum().Centro)
					],
		            template: new sap.m.StandardListItem({
						id:"filterNum_pln",
						title:"{DadosOffshore>NUM_PLN}",
						iconDensityAware:false,
						iconInset:false,
						type:"Active" 
						
					})
            	}
			});
			this.getView().addDependent(this._valueHelpDialogNum_pln);
			
			var sValue = this.getView().byId('filterNum_pln').getValue();
			if(sValue !== ""){
				this._valueHelpDialogNum_pln.getBinding("items").filter([ new Filter( "NUM_PLN", sap.ui.model.FilterOperator.Contains, sValue ) ]);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._valueHelpDialogNum_pln);
		
			this._valueHelpDialogNum_pln.open();
		},

		//Event of search help 'Nº PL Carregamento'
		handleSearchNum_pln : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			oEvent.getSource().getBinding("items").filter([ new Filter( "NUM_PLN", sap.ui.model.FilterOperator.Contains, sValue ) ]);
		},

		// Event of OK search "Nº PL Carregamento"
		handleOkNum_pln: function(oEvent) {
			var aField = this.getView().byId('filterNum_pln');
			if(oEvent.getParameter("selectedItem")){
				var oSelectedItem = oEvent.getParameter("selectedItem");
				if(oSelectedItem){
					aField.setValue(oSelectedItem.getProperty("title"));
				}
				this.onSearch(); //Search "Nº PL Carregamento"
			}
		},
		
		//Search Help - Nº Documento 
		handleValueHelpDocno: function(oEvent){
			
			if (this.valueHelpDialogDocno) {
				this._valueHelpDialogDocno.destroy();
				this._valueHelpDialogDocno = undefined;
			}
			
			this._valueHelpDialogDocno = new sap.m.SelectDialog({
				noDataText:"-",
				rememberSelections:true,
				title:"{i18n>docno}",
				class:"sapUiSizeCompact",
				liveChange: this.handleSearchDocno.bind(this),
				search: this.handleSearchDocno.bind(this),
				confirm: this.handleOkDocno.bind(this),
		        items: {
		            path:"DadosOffshore>/Schp_DocnoSet",
					filters: [
						new Filter("WERKS", FilterOperator.EQ, this.getLgnum().Centro)
					],
		           template: new sap.m.StandardListItem({
						id:"filterDocno",
						title:"{DadosOffshore>DOCNO}",
						iconDensityAware:false,
						iconInset:false,
						type:"Active" 
					})
            	}
			});
			this.getView().addDependent(this._valueHelpDialogDocno);
			
			var sValue = this.getView().byId('filterDocno').getValue();
			if(sValue !== ""){
				this._valueHelpDialogDocno.getBinding("items").filter([ new Filter( "DOCNO", sap.ui.model.FilterOperator.Contains, sValue ) ]);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._valueHelpDialogDocno);
		
			this._valueHelpDialogDocno.open();
		},

		//Event of search help 'Nº Documento'
		handleSearchDocno : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			oEvent.getSource().getBinding("items").filter([ new Filter( "DOCNO", sap.ui.model.FilterOperator.Contains, sValue ) ]);
		},

		// Event of OK search "Nº Documento"
		handleOkDocno: function(oEvent) {
			var aField = this.getView().byId('filterDocno');
			if(oEvent.getParameter("selectedItem")){
				var oSelectedItem = oEvent.getParameter("selectedItem");
				if(oSelectedItem){
					aField.setValue(oSelectedItem.getProperty("title"));
				}
				this.onSearch(); //Search "Nº Documento"
			}
		},

		//Event of search help Placa do Veiculo'
		handleSearchPl_veic : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			oEvent.getSource().getBinding("items").filter([ new Filter( "PL_VEIC", sap.ui.model.FilterOperator.Contains, sValue ) ]);
		},
		
		//Event of search help 'Vagao'
		handleSearchVagao : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			oEvent.getSource().getBinding("items").filter([ new Filter( "VAGAO", sap.ui.model.FilterOperator.Contains, sValue ) ]);
		},
		
		//Search Help - BL 
		handleValueHelpBl: function(oEvent){
			
			if (this.valueHelpDialogBl) {
				this._valueHelpDialogBl.destroy();
				this._valueHelpDialogBl = undefined;
			}
			
			if (!this._valueHelpDialogBl) {
				this._valueHelpDialogBl = new sap.m.SelectDialog({
					noDataText:"-",
					rememberSelections:true,
					title:"{i18n>bl}",
					class:"sapUiSizeCompact",
					liveChange: this.handleSearchBl.bind(this),
					search: this.handleSearchBl.bind(this),
					confirm: this.handleOkBl.bind(this),
					items: {
		            path:"DadosOffshore>/Schp_BlSet",
					filters: [
						new Filter("WERKS", FilterOperator.EQ, this.getLgnum().Centro)
					],
		            template: new sap.m.StandardListItem({
						id:"filterBl",
						title:"{DadosOffshore>BL}",
						description:"{DadosOffshore>LGTYP}",
						iconDensityAware:false,
						iconInset:false,
						type:"Active" 
						})
            		}
				});
				this.getView().addDependent(this._valueHelpDialogBl);
				// toggle compact style
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._valueHelpDialogBl);
			}
			this._valueHelpDialogBl.open();
		},

		//Event of search help 'BL'
		handleSearchBl: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			oEvent.getSource().getBinding("items").filter([ new Filter( "BL", sap.ui.model.FilterOperator.Contains, sValue ) ]);
		},

		// Event of OK search "BL"
		handleOkBl: function(oEvent) {
			var aField = this.getView().byId('filterBl');
			if(oEvent.getParameter("selectedItem")){
				var oSelectedItem = oEvent.getParameter("selectedItem");
				if(oSelectedItem){
					aField.setValue(oSelectedItem.getProperty("title"));
				}
				this.onSearch(); //Search "Nº Documento"
			}
		},
		
		//Search Help - Material  
		handleValueHelpMatnr: function(oEvent){
			
			if (this.valueHelpDialogMatnr) {
				this._valueHelpDialogMatnr.destroy();
				this._valueHelpDialogMatnr = undefined;
			}
			
			if (!this._valueHelpDialogMatnr) {
				this._valueHelpDialogMatnr = new sap.m.SelectDialog({
					noDataText:"-",
					rememberSelections:true,
					title:"{i18n>matnr}",
					class:"sapUiSizeCompact",
					liveChange: this.handleSearchMatnr.bind(this),
					search: this.handleSearchMatnr.bind(this),
					confirm: this.handleOkMatnr.bind(this),
			        items: {
			            path:"DadosOffshore>/Schp_MatnrSet",
			            template: new sap.m.StandardListItem({
							id:"filterMatnr",
							title:"{DadosOffshore>MATNR}",
							description:"{DadosOffshore>MAKTX}",
							iconDensityAware:false,
							iconInset:false,
							type:"Active"
						})
	            	}
				});
				this.getView().addDependent(this._valueHelpDialogMatnr);
				// toggle compact style
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._valueHelpDialogMatnr);
			}
			this._valueHelpDialogMatnr.open();
		},

		//Event of search help 'Material'
		handleSearchMatnr : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			oEvent.getSource().getBinding("items").filter([ new Filter( "MATNR", sap.ui.model.FilterOperator.Contains, sValue ) ]);
		},

		// Event of OK search "Material"
		handleOkMatnr: function(oEvent) {
			var aField = this.getView().byId('filterMatnr');
			if(oEvent.getParameter("selectedItem")){
				var oSelectedItem = oEvent.getParameter("selectedItem");
				if(oSelectedItem){
					aField.setValue(oSelectedItem.getProperty("title"));
				}
				this.onSearch(); //Search "Nº Documento"
			}
		},
		
		//Event of search help 'Data de Carregamento'
		handleSearchDtCarre : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			oEvent.getSource().getBinding("items").filter([ new Filter( "DT_CARREG", sap.ui.model.FilterOperator.Contains, sValue ) ]);
		},
		
		//Metodo para buscar função do "i18n"
		getBundle: function(){
			return this.getOwnerComponent().getModel('i18n').getResourceBundle();
		},
		
		getMsg: function(msgId){
			var oBundle = this.getBundle(); 
			return oBundle.getText(msgId);
		},
		
		onCreateTarefa: function(oEvent){
			var oViewModel = this.getView().getModel('view');
			oViewModel.setProperty('/busy', true);
			
			var oTable = this.getView().byId("idTable");
			var aIndices = oTable.getSelectedIndices();
			var aEntry = [];
			
			if (aIndices.length < 1) {
                MessageBox.information(this.getMsg("no_line_sel"), { styleClass: "sapUiSizeCompact" } );
                oViewModel.setProperty('/busy', false);
            } else {
                for (var i = 0; i < aIndices.length; i++){
                	var sData = oTable.getModel("table").getProperty(oTable.getContextByIndex(aIndices[i]).sPath);
                	var oEntry = {};
                	oEntry.NUM_PLN	= sData.NUM_PLN;
                	oEntry.WERKS	= sData.WERKS;
                	oEntry.DOCNO    = sData.DOCNO; 
                	oEntry.ITEMNO   = sData.ITEMNO; 
                	oEntry.STATUS   = sData.STATUS; 
                	aEntry.push(oEntry);
                }
                if(aEntry.length > 0){
                	
					var onSuccess = function(oResultData, oResponse) {
						this.getView().byId("idTable").clearSelection();
						//MessageToast.show("{Sucess}");
						MessageToast.show(this.getMsg("taskOk"));
						oViewModel.setProperty('/busy', false);
					}.bind(this);
					
					var onError = function(oError) {
						var oResponse;
						if (oError.responseText) { oResponse = JSON.parse(oError.responseText); }
						if(oResponse.error.message.value){ 
							MessageToast.show(oResponse.error.message.value); 
						} else{
							MessageToast.show(this.getMsg("msg007"));
						}
						this.getView().byId("idTable").clearSelection();
						oViewModel.setProperty('/busy', false);
					}.bind(this);
					
					var oModel = this.getOwnerComponent().getModel('DadosOffshore'); 
					aEntry.forEach(function(entry){
						oModel.create("/TaskSet", entry, { success: onSuccess, error: onError } );
					});
                	
                }else{
                	MessageToast.show(this.getMsg("no_reg_criar"));
                	oViewModel.setProperty('/busy', false);
                }
        	}
		},
		
		onExport: sap.m.Table.prototype.exportData || function(oEvent) {
					
			var oTable = this.getView().byId("idTable").getColumns();
			var oModel = this.getView().getModel("table");
			var vFileName = "TESTE";
			var aColumns = [];
		
			for(var i=0; i < oTable.length; i++){
				
				if (oTable[i].getVisible() === true){
					
					var newColumn = {};
					var newTemplate = {};
					var sPath = null;
			
					if(oTable[i].getAggregation('template').getBindingInfo('text')){
						sPath = oTable[i].getAggregation('template').getBindingInfo('text').parts[0].path;
						newTemplate.content = "{"+sPath+"}";
					} else if(oTable[i].getAggregation('template').getAggregation('items')){
						var oItem = oTable[i].getAggregation('template').getAggregation('items');
						if(oItem[0].getBindingInfo('text')){
							sPath = oItem[0].getBindingInfo('text').parts[0].path;
							newTemplate.content = "{"+sPath+"}";
						}else if(oItem[0].getBindingInfo('selectedKey')){
							sPath = oItem[0].getBindingInfo('selectedKey').parts[0].path;
							newTemplate.content = "{"+sPath+"}";
						}else if(oItem[0].getBindingInfo('src')){
							sPath = oItem[0].getBindingInfo('src').parts[0].path;
							newTemplate.content = "{"+sPath+"}";
						}else if(oItem[0].getProperty('src')){
							sPath = oItem[0].getProperty('src');
							newTemplate.content = sPath;
						}
					} else if(oTable[i].getAggregation('template').getBindingInfo('selected')){
						sPath = oTable[i].getAggregation('template').getBindingInfo('selected').parts[0].path;
						newTemplate.content = "{"+sPath+"}";
					}
					//Coluna a inserir
					newColumn.name		= oTable[i].getLabel().getText();
					newColumn.template	= newTemplate;
					
					//ADD Coluna
					aColumns.push(newColumn);
				}
			}
			
			var oExport = new Export({
			  exportType : new ExportTypeCSV({
				separatorChar: ";",
				charset: "utf-8",
				fileExtension: "csv"
			  }),
			
			  models : oModel,
			  rows : { path : "/" }, 
			  columns : aColumns
		
			});
		
			//* download exported file
			oExport.saveFile(vFileName).always(function() {
			  this.destroy();
			}); 
		}
		
	});

});