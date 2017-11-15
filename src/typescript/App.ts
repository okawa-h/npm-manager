import * as $ from 'jquery';
import Vue from 'vue';

import Process = require('child_process');
// /// <reference path="header.ts" />
// let Header = require('header');
// import Header = require("./Header");
// import * as Header from './Header.ts';

$(() => {

	Modalwindow.init();
	init();

});

let init = () => {

	$('#all').append('<header id="header"><div class="wrap"><div class="inner"><h1 class="title">npm manager</h1><p class="version">Version: {{ version }}</p></div></div></header>');

	let head : Vue = new Vue({
		el   : '#header',
		data : { version:'loading' }
	});

	Process.exec('npm -v', (err:any, stdout:String, stderr:any) => {

		head.$data.version = (err) ? '---' : stdout;

	});

	setPackagelist();

}

let setPackagelist = () => {

	let mainHtml : string = '<section class="page" id="page-status">';
	mainHtml += '<ul class="status-modulelist">';
	mainHtml += '<li class="head">';
	mainHtml += '<p class="name">Package Name</p>';
	mainHtml += '<p class="version">Version</p>';
	mainHtml += '<p class="update">Update</p>';
	mainHtml += '<p class="uninstall">Uninstall</p>';
	mainHtml += '</li>';
	mainHtml += '<li v-for="package in packagelist">';
	mainHtml += '<p class="name">{{package.name}}</p>';
	mainHtml += '<p class="version">{{package.version}}</p>';
	mainHtml += '<p class="update"><button v-if="package.isUpdate" v-on:click="onUpdate(package.name)">update</button><span v-else>-</span></p>';
	mainHtml += '<p class="uninstall"><button v-on:click="onUninstall(package.name)">uninstall</button></p>';
	mainHtml += '</li>';
	mainHtml += '</ul>';
	mainHtml += '</section>';

	$('#all').append('<main id="main"><div class="wrap">' + mainHtml + '</div></main>');
	let status : Vue = new Vue({
		el   : '#page-status',
		data : {
			packagelist : [
				{ name:'-',version:'-',isUpdate:false }
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

		setOuted(data);

	});

	let setOuted = (data:any) => {

		Process.exec('npm outdated --global=true --json=true', (err:any, stdout:any, stderr:any) => {

			if (err) console.log(err);
			let list : any = JSON.parse(stdout);
			for (var key in list) {
				data[key].isUpdate = true;
			}
			status.$data.packagelist = data;

		});

	}

}













class Modalwindow {

	greeting: string;

	constructor(message: string) {

		this.greeting = message;

	}

	private greet() {

		return "Hello, " + this.greeting;

	}

	public static init():void {

		// $('body').append('<div id="modalwindow"><div class="background"><section class="content"></section></div></div>');

	}

}
