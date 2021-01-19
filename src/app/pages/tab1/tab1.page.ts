import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, DoCheck, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ViewDidEnter, ViewDidLeave, ViewWillEnter, ViewWillLeave } from '@ionic/angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { DataLocalService } from '../../services/data-local.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  slideOpts ={
    allowSlidePrev: false,
    allowSlideNext: false
  }


  constructor(private barcodeScanner: BarcodeScanner,
              private dataLocalService: DataLocalService) { 
               
               }

/** Ciclos de vida Ionic**/
  ionViewWillEnter(){
    this.scan();
  }
  //ionViewDidEnter(){console.log('Ionic cycle ionViewDidEnter ---- 14');}
  //ionViewWillLeave(){console.log('Ionic cycle ionViewWillLeave ---- 21');}
  //ionViewDidLeave(){console.log('Ionic cycle ionViewDidLeave --- 22');}



  scan(){
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      if (!barcodeData.cancelled) {
        this.dataLocalService.guardarRegistro(barcodeData.format, barcodeData.text);
      }
     }).catch(err => {
         console.log('Error', err);
         //para verificar resultado en la pc, como no esta cordova da error y permite ver en el log esta info. Eliminar para prod
        //  this.dataLocalService.guardarRegistro('QRCode', 'https://www.google.com.ec');
        //  this.dataLocalService.guardarRegistro('QRCode', 'geo:-2.0932894000170137,-79.6790064855469');
     });
  }




}
