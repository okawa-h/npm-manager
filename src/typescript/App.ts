import * as $ from 'jquery';
import Vue from 'vue';
import Process = require('child_process');

let _body   : Body;
let _header : Header;
let _modalwindow : Modalwindow;

$(() => {

	_body = new Body();

	_modalwindow = new Modalwindow();
	_modalwindow.show();

	_header = new Header();
	new PackageList();

});


class NpmConnect {

	static ENV_PATH : any = {
		env: {'PATH':'/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin:/opt/X11/bin'}
	}

	constructor() {
		
	}

	static getVersion(onloaded:(version:string)=>void):void {

		this.exec('-v',[],(result:string) => {

			onloaded(result);

		});

	}

	static getList(onloaded:(listdata:string)=>void,isGlobal:boolean=false):void {

		this.exec('ls',[

			{ key:'global',value:isGlobal },
			{ key:'depth' ,value:0 },
			{ key:'json'  ,value:true }

		],(result:string) => {

			onloaded(JSON.parse(result));

		});

	}

	static getOuted(onloaded:(listdata:string)=>void,isGlobal:boolean=false):void {

		Process.exec('npm outdated --global=' + isGlobal + ' --json=true', this.ENV_PATH, (err:any, stdout:any, stderr:any) => {

			onloaded(JSON.parse(stdout));

		});

		this.exec('outdated',[

			{ key:'global',value:isGlobal },
			{ key:'json'  ,value:true }
			
		],(result:string) => {

			onloaded(JSON.parse(result));

		});

	}

	static exec(command:string,param:{key:string,value:any}[],onloaded:any):void {

		let query : string = NpmConnect.paramToQuery(param);

		Process.exec(['npm',command,query].join(' '), this.ENV_PATH, (err:any, stdout:any, stderr:any) => {

			let result : any = (err || err != null) ? err : stdout;
			console.log(err);

			onloaded(result);

		});

	}

	static paramToQuery(param:{key:string,value:any}[]):string {

		let query : string[] = [];

		for (var i = 0; i < param.length; ++i) {
			let obj : {key:string,value:any} = param[i];
			query.push('--' + obj.key + '=' + obj.value);
		}

		return query.join(' ');

	}

}

class Body {

	$all : JQuery;
	
	constructor() {

		this.$all = $('#all');

	}
	
	public append($target:JQuery) {

		this.$all.append($target);

	}
}

class Header {

	$parent : JQuery;
	vHeader : Vue;

	constructor() {

		this.$parent = $(this.getHtml());
		_body.append(this.$parent);

		this.vHeader = new Vue({
			el   : '#header',
			data : { version:'loading' }
		});

		this.setVersion();
		
	}

	private getHtml():string {

		let html:string = '<header id="header">';
		html += '<div class="wrap">';
		html += '<div class="inner">';
		html += '<h1 class="title">npm manager</h1>';
		html += '<p class="version">Version: {{ version }}</p>';
		html += '</div></div></header>';
		return html;

	}

	private setVersion():void {

		NpmConnect.getVersion((version:string) => {

			this.vHeader.$data.version = version;

		});

	}

}

class Modalwindow {

	$parent : JQuery;

	constructor() {

		$('body').append(this.getHtml());
		this.$parent = $('#modalwindow');
		
	}

	private getHtml():string {

		let html = '<div id="modalwindow">';
		html += '<div class="background">';
		html += '<div class="content">';
		html += '<p class="load-spinner"></p>';
		html += '</div></div></div>';
		return html;

	}

	public show():void {

		this.$parent.show();

	}

	public hide():void {

		this.$parent.fadeOut(200);

	}

}

class PackageList {

	$parent : JQuery;
	vStatus : Vue;

	constructor() {

		this.$parent = $('<main id="main">' + this.getHtml() + '</div>');
		_body.append(this.$parent);
		
		this.vStatus = new Vue({
			el   : '.status-modulelist',
			data : {
				packagelist : [ { name:'-',version:'-',isUpdate:false } ]
			},
			methods : {
				onUpdate : (name:string) => {

					if (confirm('Can I update ' + name + '?')) {
						// code...
					}

				},
				onUninstall : (name:string) => {

					if (confirm('Can I delete ' + name + '?')) {
						// code...
					}

				}
			}
		});

		this.setList();
		
	}

	private getHtml():string {

		let html : string = '<section class="page"><div class="wrap">';
		html += '<ul class="status-modulelist">';
		html += '<li class="head">';
		html += '<p class="name">Package Name</p>';
		html += '<p class="version">Version</p>';
		html += '<p class="update">Update</p>';
		html += '<p class="uninstall">Uninstall</p>';
		html += '</li>';
		html += '<li v-for="package in packagelist">';
		html += '<p class="name">{{package.name}}</p>';
		html += '<p class="version">{{package.version}}</p>';
		html += '<p class="update"><button v-if="package.isUpdate" v-on:click="onUpdate(package.name)">update</button><span v-else>-</span></p>';
		html += '<p class="uninstall"><button v-on:click="onUninstall(package.name)">uninstall</button></p>';
		html += '</li>';
		html += '</ul>';
		html += '</div></section>';
		return html;

	}

	private setList():void {

		NpmConnect.getList((listdata:any) => {

			let list : any = listdata.dependencies;
			var data : any = {};

			for (var key in list) {
				data[key] = {
					name     : key,
					version  : list[key].version,
					isUpdate : false
				};
			}

			this.setOuted(data);

		},true);

	}

	private setOuted(data:any) {

		NpmConnect.getOuted((listdata:any) => {

			for (var key in listdata) {
				data[key].isUpdate = true;
			}
			this.vStatus.$data.packagelist = data;
			_modalwindow.hide();

		},true);

	}

}
