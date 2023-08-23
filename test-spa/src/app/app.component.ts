import { DataSource } from '@angular/cdk/collections';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, filter, Subscription, tap, takeUntil, Subject, Observable, map, debounce, timer, debounceTime } from 'rxjs';
import { combineLatest, combineLatestInit } from 'rxjs/internal/observable/combineLatest';
import { IItem } from './app.models';
import { ItemService } from './_service/item.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemService],

})
export class AppComponent implements OnInit, OnDestroy {
  public arraySizeInput: number = 10;
  public additionalArrayIdsInput: string = '';
  public timerInput: number = 300;
  public listItems$: BehaviorSubject<IItem[]>;
  private scroll$: BehaviorSubject<number>;
  private subscription: Subscription;
  private heightScroll!: number | null;

  constructor(private itemService: ItemService,
    private scrollDispatcher: ScrollDispatcher) {
    this.subscription = new Subscription();
    this.scroll$ = new BehaviorSubject<number>(0);
    this.listItems$ = new BehaviorSubject<IItem[]>([]);
    this.subscription.add(
    this.scrollDispatcher.scrolled().subscribe((x) => {
      if( x?.measureScrollOffset('top') && x?.measureScrollOffset('top') >= (x?.getElementRef().nativeElement.scrollHeight - x?.getElementRef().nativeElement.offsetHeight-100) && (!this.heightScroll || this.heightScroll!==x?.getElementRef().nativeElement.scrollHeight)) {
        this.heightScroll = x?.getElementRef().nativeElement.scrollHeight;
        this.scroll$.next(this.scroll$.value + 1);
        this.itemService.setScroll(this.scroll$.value);
      }
    })
    )
  }

  ngOnInit(): void {
    this.itemService.currentListItems$.pipe(
      filter(Boolean),
      tap((value)=> {
          this.listItems$.next(this.listItems$.value.concat(value))
      })
    ).subscribe()
  }

  ngOnDestroy(): void {
   this.subscription.unsubscribe()
  }

  public editArray(event: number): void {
    this.listItems$.next([]);
    this.scroll$.next(0);
    this.heightScroll = null;
    this.itemService.setTotal(event+ '');
  }

  public editTimer(event: number): void {
    this.itemService.setInterval(event);
  }

  public editArrayId(event: string[]): void {
    this.listItems$.next([]);
    this.scroll$.next(0);
    this.heightScroll = null;
    this.itemService.setFilter(event);
  }
}

