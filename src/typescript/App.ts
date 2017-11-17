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

		Process.exec('npm -v', (err:any, stdout:String, stderr:any) => {

			this.vHeader.$data.version = (err) ? '---' : stdout;

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
			el   : '#page-status',
			data : {
				packagelist : [ { name:'-',version:'-',isUpdate:false }
				]
			},
			methods : {
				onUpdate : (name:string) => {
					console.log(name);
				},
				onUninstall : (name:string) => {
					console.log(name);
				}
			}
		});

		this.setList();
		
	}

	private getHtml():string {

		let html : string = '<section class="page" id="page-status"><div class="wrap">';
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

		Process.exec('npm ls --global=true --depth=0 --json=true', (err:any, stdout:any, stderr:any) => {

			if (err) console.log(err);

			let list : any = JSON.parse(stdout).dependencies;
			var data : any = {};

			for (var key in list) {
				data[key] = {
					name     : key,
					version  : list[key].version,
					isUpdate : false
				};
			}

			this.setOuted(data);

		});

	}

	private setOuted(data:any) {

		Process.exec('npm outdated --global=true --json=true', (err:any, stdout:any, stderr:any) => {

			if (err) console.log(err);
			let list : any = JSON.parse(stdout);
			console.log(list);
			for (var key in list) {
				data[key].isUpdate = true;
			}
			this.vStatus.$data.packagelist = data;
			_modalwindow.hide();

		});

	}

}
