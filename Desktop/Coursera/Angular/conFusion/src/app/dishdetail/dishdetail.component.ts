import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { trigger,state,style,animate,transition } from '@angular/animations';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility',[
      state('shown', style({
        transform:'scale(1.0)',opacity:1
      })),
      state('hidden', style({
        transform:'scale(1.0)',opacity:0
      })),
      transition('*=>*',animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;
  dishForm: FormGroup;
  dishcopy: Dish;
  comment: Comment;
  visibility = 'shown';

  constructor(private dishService: DishService,
     private location: Location,
     private route: ActivatedRoute,
     private fb: FormBuilder,
     @Inject('BaseURL') private BaseURL) {

       this.createForm();
     }

  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params:Params) => {this.visibility ='hidden'; return this.dishService.getDish(params['id']); }))
    .subscribe(dish => {this.dish = dish ; this.dishcopy = dish ; this.setPrevNext(dish.id); this.visibility = 'shown'; },
    errmess => this.errMess = <any>errmess);

  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index -1)%this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index +1)%this.dishIds.length];


  }

  goBack() {
    this.location.back();
  }



  @ViewChild('dform') dishFormDirective; //resets the form completely

  //must be named formErrors as per documentation
  formErrors = {
    'comment':'',
    'author':'',
  };

  validationMessages = {
    'comment':{'required':'Comment is required'},
    'author':{'required':'Name is required','minlength':'Name must be at least 2 characters long'}
  }

  createForm(): void {
    this.dishForm = this.fb.group({
      rating: 5,
      comment:['',Validators.required],
      author:['',[Validators.required, Validators.minLength(2),Validators.maxLength(25)]],
      date: (new Date(Date.now())).toDateString()
    });

    this.dishForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); //(re)set form validation messages
  }

    onValueChanged(data?:any) {
        if(!this.dishForm) {return;}
        const form = this.dishForm;
        for (const field in this.formErrors) {
          if(this.formErrors.hasOwnProperty(field)) {
            // clear previous error message if any
            this.formErrors[field] = '';
            const control = form.get(field);
            if(control && control.dirty && !control.valid) {
              const messages = this.validationMessages[field];
              for (const key in control.errors) {
                if(control.errors.hasOwnProperty(key)) {
                  this.formErrors[field] += messages[key] + '';
                }
              }
            }
          }
        }
    }

  onSubmit() {
    this.comment = this.dishForm.value;
    console.log(this.comment);

    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
                    .subscribe(dish => {this.dish = dish; this.dishcopy = dish;},
                      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });

    this.dishForm.reset(
      {comment:'',author:'',date:''}
    );

    this.dishFormDirective.resetForm({rating:5,date:(new Date(Date.now())).toDateString()}); //makes the form pristine
  }

}
