import { Component, Input, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { pie, select, arc, interpolate, easeCubic } from 'd3';

@Component({
  selector: 'app-progress-chart',
  templateUrl: 'app-progress-chart.component.html'
})
export class AppProgressChartComponent implements OnChanges {
  @Input() percent: number;

  el: HTMLElement;
  ratio: number;
  line: any;
  chart: any;

  constructor(private elementRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.el) {
      this.el = this.elementRef.nativeElement.querySelector('.progress-chart');
      this.render();
    }

    this.ratio = this.percent / 100;
    this.animate();
  }

  render(): void {
    const w = 230;
    const h = 230;

    const outerRadius = w / 2;
    const innerRadius = 105;

    const svg = select(this.el)
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    const g = svg.append('g')
      .attr('transform', `translate(${w / 2}, ${(h / 2)})`);

    const a = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    this.line = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0);

    this.chart = g.append('path')
      .datum({ endAngle: 0 })
      .attr('d', this.line)
      .attr('fill', '#4083FF');
  }

  arcTween = (transition: any, newAngle: number) => {
    transition.attrTween('d', d => {
      const ipolate = interpolate(d.endAngle, newAngle);

      return (t) => {
        d.endAngle = ipolate(t);
        return this.line(d);
      };
    });
  }

  animate(): void {
    this.chart.transition()
      .duration(500)
      .ease(easeCubic)
      .call(this.arcTween, ((2 * Math.PI) * this.ratio))
  }

}
