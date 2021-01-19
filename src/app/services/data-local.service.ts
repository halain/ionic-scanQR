import { Injectable, OnInit } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';

import { NavController } from '@ionic/angular';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService implements OnInit {

  guardados: Registro[] = [];
  path: string = '';
  fileName: string = 'registros.csv';

  constructor(private storage: Storage,
              private navCtrl: NavController,
              private iab: InAppBrowser,
              private file: File,
              private emailComposer: EmailComposer,
              private platform: Platform
              ) { 
    this.cargarRegistros();
  }

  ngOnInit(){
    
  }

  async guardarRegistro(formato: string, texto: string){
    
    await this.cargarRegistros();

    const nuevoRegistro = new Registro(formato, texto);
    this.guardados.unshift(nuevoRegistro);
    //console.log(this.guardados);
    this.storage.set('registros', this.guardados);
    this.abrirRegistro(nuevoRegistro);
  }

  async cargarRegistros(){
    this.guardados = await this.storage.get('registros') || [];
  }


  abrirRegistro(registro: Registro){

    this.navCtrl.navigateForward('/tabs/tab2');

    switch (registro.type) {
      case 'http':
        this.iab.create( registro.text, '_system' );
        break;
      
      case 'geo':
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
        break;  
    
      default:
        break;
    }

  }

  enviarCorreo(){
    
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';
    arrTemp.push(titulos);

    this.guardados.forEach(registro => {
      const line = `${ registro.type }, ${ registro.formato }, ${ registro.created }, ${ registro.text.replace(',', ' ') }\n`; 
      arrTemp.push(line);
    });
    //console.log(arrTemp.join(''));
    this.crearArchivoFisico(arrTemp.join(''));
  }


  crearArchivoFisico(texto: string){

    /** Path para escribir el archivo en dependencia de la plataforma**/
    if (this.platform.is('android')) {
      this.path = this.file.externalDataDirectory; // PATH  file:///storage/emulated/0/Android/data/com.halain.scannerqr/files/
      // externalDataDirectory copy files in andorid phone in internal memory =>  Android/data/com.halain.scannerqr/files/file_name
     
      //this.path = this.file.dataDirectory; // PATH  file:///data/user/0/com.halain.scannerqr/files/
      //dataDirectory copy files in andorid phone in internal memory  =>  Android/data/com.halain.scannerqr/cache/email_composer/file_name

    } else { //ios
      this.path = this.file.dataDirectory;
    }
        

    //verificar si el archivo existe en el directorio
    this.file.checkFile( this.path, this.fileName)
      .then( existe => { //existe el archivo, escribir en él
        //console.log('Existe el archivo ? ', existe);
        return this.escribirEnArchivo(texto);
      }).catch( error => {//no existe el archivo, crearlo
        //console.log('No existe el archivo', error);
        //intentando crear el archivo
        return this.file.createFile( this.path, this.fileName, false)
          .then( creado => { //se creo el archivo 
              return this.escribirEnArchivo(texto);
          }). catch( err => { //no se pudo crear el archivo
            //console.log('Error creando archivo ', err);
          });
      });

  }


  async escribirEnArchivo(texto: string){

    /** guardar e archivo en el correo **/
    await this.file.writeExistingFile( this.path, this.fileName, texto); 
              // .then( creado => { //se guardo el archivo
              //    console.log('Archivo guardado', creado);
              // }).catch( err => { //no se pudo guardar el archivo
              //      console.log('Error guardando archivo ', err);
              // });
   
    //console.log('applicationStorageDirectory ', this.file.applicationStorageDirectory); // file:///data/user/0/com.halain.scannerqr/
    this.path = this.path.replace(this.file.applicationStorageDirectory, 'app://');
  
    //path al archivo fisico creado para adjuntar al email
    let archivo = `${this.path}/${this.fileName}`;   
   
    //console.log('ARCHIVO ', archivo);
    

    /** Envio de correo **/

    /** obtener una lista de todos los clientes de correo electrónico instalados **/
    this.emailComposer.getClients().then((apps: []) => {
      // Returns an array of configured email clients for the device
      console.log('Lista de clientes de correo configurados en el dispositivo',apps);
    });


    /** Verificar si el cliente de correo especificado esta instalado en el dispositivo, sino se pasa el cliente devuelve trues si encuentra algun cliente de correo config.  **/
    //  this.emailComposer.hasClient('gmail).then( (isValid: boolean) => {
    this.emailComposer.hasClient().then( (isValid: boolean)=> {
      console.log('Cliente de correo configurado ', isValid);
      if (isValid) { 
      // Now we know we have a valid email client configured
      // Not specifying an app will return true if at least one email client is configured
      console.log('Existe un clienet de correo configurado en el dispositivo');
      }
    });

    /** Varificar si una cuenta de correo esta configurada correctamente en el dispositivo**/
    this.emailComposer.hasAccount().then((isValid: boolean) => {
      if (isValid) {
      // Now we know we have a valid email account configured
        console.log('Existe una cuenta de correo configurada en el dispositivo ');
      }
    });


    /** Verificar si el envio de correo es soportado por el dispositivo. App es el cliente, sino se pasa verifica cualqiuer cuenta **/
    //this.emailComposer.isAvailable('gmail').then( (available: boolean) => {
    this.emailComposer.isAvailable().then( (available: boolean) => {
      if(available) {
      // Now we know we can send an email, calls hasClient and hasAccount
      // Not specifying an app will return true if at least one email client is configured
        console.log('Se puede enviar correo en el dispositivo');     
      }
    });

    let email = {
      to: 'halain80@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
      // 'file://img/logo.png',
      // 'res://icon.png',
      // 'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
      // 'file://README.pdf'
      // 'app://files/'+this.fileName
        archivo
      ],
      subject: 'Se adjunta archivo csv creado',
      body: 'Aqui va el archivo csv creado con los scannerqr <strong>ScannQRapp</strong>',
      isHtml: true
    }
  
    // Send a text message using default options
    this.emailComposer.open(email);
  
  }


}
