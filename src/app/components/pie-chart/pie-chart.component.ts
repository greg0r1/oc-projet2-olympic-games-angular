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
import Chart, { ChartEvent, InteractionItem } from 'chart.js/auto';
import { PIE_CHART_COLORS } from '@constants/chart-colors';

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

  get ariaLabel(): string {
    const details: string = this.items
      .map((item: ChartItem): string => `${item.label}: ${item.value}`)
      .join(', ');
    return `Total medals per country: ${details}`;
  }

  ngOnChanges(): void {
    if (!this.pieChart) return;
    this.pieChart.data.labels = this.getLabels(this.items);
    this.pieChart.data.datasets[0].data = this.getValues(this.items);
    this.pieChart.update();
  }

  ngAfterViewInit(): void {
    this.buildPieChart();
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
  }

  private buildPieChart(): void {
    this.pieChart = new Chart(this.canvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.getLabels(this.items),
        datasets: [{
          label: 'Medals',
          data: this.getValues(this.items),
          backgroundColor: PIE_CHART_COLORS,
          hoverOffset: 4
        }],
      },
      options: {
        maintainAspectRatio: false,
        onClick: (e: ChartEvent): void => {
          if (e.native) {
            const points: InteractionItem[] | undefined = this.pieChart?.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true);
            if (points?.length) {
              const firstPoint: InteractionItem = points[0];
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
