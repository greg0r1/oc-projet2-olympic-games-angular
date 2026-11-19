import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

import { ChartItem } from '@models/chart-item.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) items!: ChartItem[];
  @Output() itemSelected: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private pieChart: Chart<"pie", number[], string> | undefined;

  ngOnChanges() {
    if (!this.pieChart) return;
    this.pieChart.data.labels = this.getLabels(this.items);
    this.pieChart.data.datasets[0].data = this.getValues(this.items);
    this.pieChart.update();
  }

  ngAfterViewInit() {
    this.buildPieChart();
  }

  ngOnDestroy() {
    this.pieChart?.destroy();
  }

  private buildPieChart() {
    this.pieChart = new Chart(this.canvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.getLabels(this.items),
        datasets: [{
          label: 'Medals',
          data: this.getValues(this.items),
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }],
      },
      options: {
        maintainAspectRatio: false,
        onClick: (e) => {
          if (e.native) {
            const points = this.pieChart?.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true);
            if (points?.length) {
              const firstPoint = points[0];
              this.itemSelected.emit(firstPoint.index);
            }
          }
        }
      }
    });
  }

  private getLabels(items: ChartItem[]): string[] {
    return items.map((chartItem: ChartItem): string => chartItem.label);
  }

  private getValues(items: ChartItem[]): number[] {
    return items.map((chartItem: ChartItem): number => chartItem.value);
  }
}
