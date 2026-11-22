import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild
} from '@angular/core';
import Chart from 'chart.js/auto';
import { CHART_PRIMARY_COLOR } from '@constants/chart-colors';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) labels!: number[];
  @Input({ required: true }) values!: number[];
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private lineChart: Chart<"line", number[], number> | undefined;

  get ariaLabel(): string {
    const details: string = this.labels
      .map((year: number, index: number): string => `${year}: ${this.values[index]}`)
      .join(', ');
    return `Medals per year: ${details}`;
  }

  ngOnChanges(): void {
    if (!this.lineChart) return;
    this.lineChart.data.labels = this.labels;
    this.lineChart.data.datasets[0].data = this.values;
    this.lineChart.update();
  }

  ngAfterViewInit(): void {
    this.buildLineChart();
  }

  ngOnDestroy(): void {
    this.lineChart?.destroy();
  }

  private buildLineChart(): void {
    this.lineChart = new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: "medals",
            data: this.values,
            backgroundColor: CHART_PRIMARY_COLOR,
            borderColor: CHART_PRIMARY_COLOR
          },
        ]
      },
      options: {
        maintainAspectRatio: false
      }
    });
  }
}
