import { ServicesProvider } from './../../providers/services/services';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ConfirmReservaPage } from '../confirm-reserva/confirm-reserva';
import { Storage } from '@ionic/storage';
import { PerfilPage } from '../perfil/perfil';
import { InAppBrowser, InAppBrowserOptions, InAppBrowserEvent } from "@ionic-native/in-app-browser";
import { ConfirmPage } from '../confirm/confirm';

@Component({
  selector: 'page-int-evento',
  templateUrl: 'int-evento.html',
})
export class IntEventoPage {
  private win: any = window;
  options: InAppBrowserOptions = {
    location: "no", //Or 'no'
    hidden: "no", //Or  'yes'
    clearcache: "yes",
    clearsessioncache: "yes",
    zoom: "yes", //Android only ,shows browser zoom controls
    hardwareback: "yes",
    mediaPlaybackRequiresUserAction: "no",
    shouldPauseOnSuspend: "no", //Android only
    closebuttoncaption: "Close", //iOS only
    disallowoverscroll: "no", //iOS only
    toolbar: "yes", //iOS only
    enableViewportScale: "no", //iOS only
    allowInlineMediaPlayback: "no", //iOS only
    presentationstyle: "pagesheet", //iOS only
    fullscreen: "yes" //Windows only
  };

  nombreLocal: any;
  usuarioId: any;
  info: any = [];
  dataUser: any = [];
  imgSrc: any;
  url: string = "https://ctrlztest.com.ar/estareservado/"
  urlMP: any;
  valorEntrada: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private services: ServicesProvider,
    public loadingCtrl: LoadingController,
    private iab: InAppBrowser,
    private storage: Storage,
  ) {
    this.nombreLocal = this.navParams.data.localName;
    this.info = this.navParams.data.event;
    this.valorEntrada = this.info.precio;
    console.log('info', this.info);
  }

  getTrustImg() {
    if (this.imgSrc != 'assets/imgs/perfil-none.png') {
      let path = this.win.Ionic.WebView.convertFileSrc(this.imgSrc);
      console.log(path);
      return path;
    } else {
      return this.imgSrc;
    }
  }

  editarPerfil() {
    this.navCtrl.push(PerfilPage, { edit: true });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IntEventoPage');
  }

  ionViewWillEnter() {
    this.mostrarFotoPerfil();

  }

  mostrarFotoPerfil() {
    this.storage.get('datauser').then(user => {
      console.log('foto', user);
      let usuario = user[0];
      this.usuarioId = usuario.usuarioid;
      this.getDataUser(this.usuarioId);
      if (usuario.foto != "") {
        this.imgSrc = 'https://ctrlztest.com.ar/estareservado/' + usuario.foto;
      } else if (usuario.facabooid != null) {
        this.imgSrc = "https://graph.facebook.com/" + usuario.facabooid + "/picture?type=large"
      } else {
        this.imgSrc = "assets/imgs/perfil-none.png";
      }
    });
  }

  getDataUser(id) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Espere por favor...'
    });
    loading.present();
    this.services.getDataUser(id).subscribe(x => {
      this.dataUser = JSON.parse(x['_body'])['data'];
      loading.dismiss();
      console.log('xxxx', this.dataUser);
    })
  }

  dia(fecha) {
    var day = fecha.split("-").reverse();
    return day[0] + '/' + day[1] + '/' + day[2];
  }

  validarBtn(info) {
    let date = new Date();
    let dateEvento = new Date(info.fechaevento);
    if (date > dateEvento) {
      return false;
    } else {
      return true;
    }
  }

  mostrarDia(fecha) {
    var date = new Date(fecha);
    var dia = date.getDay() + 1 > 31 ? date.getDay() : date.getDay() + 1;
    var day;
    switch (dia) {
      case 7:
        day = "Domingo";
        break;
      case 1:
        day = "Lunes";
        break;
      case 2:
        day = "Martes";
        break;
      case 3:
        day = "Miércoles";
        break;
      case 4:
        day = "Jueves";
        break;
      case 5:
        day = "Viernes";
        break;
      case 6:
        day = "Sábado";
    }
    return day
  }

  goToReserva() {
    this.navCtrl.push(ConfirmReservaPage, this.info);
  }


  // ***********************************************************
  // ---------------- CIFRADO DE CHECKOUT
  // ***********************************************************

  web: string = "https://ctrlztest.com.ar/estareservado/mercadopago/?";

  priceParam: string = btoa("price=");
  priceAgain: string = "NgUhtRF";
  idParam: string = "ID";
  idNumber: string = "zLRTC";

  // var emailParam = btoa("email=");
  // let ecodeEmail = btoa("pepe@gmail.com");
  emailParam = btoa("email=");
  ecodeEmail = btoa(this.dataUser['email']);

  checkout() {
    // let money: string = btoa(JSON.stringify(this.valor));
    // let moneyAgain: string = btoa(JSON.stringify(this.valor));
    console.log('emial_comprador', this.dataUser['email']);
    console.log('emial_hash', this.ecodeEmail);
    let money: any = btoa(this.valorEntrada);
    let moneyAgain: any = btoa(this.valorEntrada);
    console.log('this.valorEntrada', this.valorEntrada);
    console.log('money', money);
    console.log('moneyAgain', moneyAgain);

    this.urlMP =
      this.web +
      this.priceParam +
      "LzY63" +
      money +
      "&" +
      this.priceAgain +
      "LzY63" +
      moneyAgain +
      "&" +
      this.idParam +
      "LzY63" +
      this.idNumber +
      "&" +
      this.emailParam +
      "LzY63" +
      this.ecodeEmail;

    let target = "_blank";
    console.log('URL_MP', this.urlMP);
    let browser = this.iab.create(this.urlMP, '_blank', this.options);
    browser.on('loadstart').subscribe((event: InAppBrowserEvent) => {
      var okUrl = 'https://ctrlztest.com.ar/estareservado/mercadopago/thankyou.php';
      if (event.url == okUrl) {
        browser.close();//This will close InAppBrowser Automatically when closeUrl Started
        this.services.crearReserva(this.usuarioId, this.info['id'], 1).subscribe(x => {
          this.navCtrl.push(ConfirmPage, true);
        });
      }
      var errorUrl = 'https://ctrlztest.com.ar/estareservado/mercadopago/errorpayment.php';
      if (event.url == errorUrl) {
        browser.close();//This will close InAppBrowser Automatically when closeUrl Started
        this.navCtrl.push(ConfirmPage, false);
      }
    });
  }
}
