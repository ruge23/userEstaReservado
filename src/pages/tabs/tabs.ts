import { Component } from '@angular/core';

import { MapPage } from './../map/map';
import { ReservasPage } from '../reservas/reservas';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = MapPage;
  tab3Root = ReservasPage;

  constructor() {

  }
}
