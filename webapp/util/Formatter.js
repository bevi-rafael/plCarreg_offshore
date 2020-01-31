sap.ui.define([
	"com/eldorado/ewm/plCarregOffshore/model/models"
], function(models) {
	"use strict";
	
	return {
	
		formatDateHora : function(value) {
			if( value === '*') { return '*';}
			if(value){
				return value.toLocaleString("pt-BR");
			} else{ return ""; }
		},

		formatDate : function(value) {
			if( value === '*') { return '*';}
			var options = {year: 'numeric', month: 'numeric', day: 'numeric' };
			if(value){
				return value.toLocaleDateString('pt-BR', options);
			} 
			else{ return ""; }
		}

	};
	
}, true);