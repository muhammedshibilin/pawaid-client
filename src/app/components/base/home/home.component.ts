import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ServiceShowcaseComponent } from './service-showcase/service-showcase.component';
import { FeatureHighlightComponent } from './feature-highlight/feature-highlight.component';
import { HappyPetsComponent } from './happy-pets/happy-pets.component';
import * as AOS from 'aos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    ServiceShowcaseComponent,
    FeatureHighlightComponent,
    HappyPetsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ngOnInit() {
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false,
      offset: 50
    });
  }
}
