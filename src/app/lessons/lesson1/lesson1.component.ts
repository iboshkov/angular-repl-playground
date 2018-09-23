import { Component, OnInit } from "@angular/core";
import { LessonsService } from "../lessons.service";

@Component({
  selector: "app-lesson1",
  templateUrl: "./lesson1.component.html",
  styleUrls: ["./lesson1.component.css"]
})
export class Lesson1Component implements OnInit {
  snippet1 = `function myFunction(p1, p2) {
  return p1 * p2; // The function returns the product of p1 and p2
}`;

  snippet2 = `var x = myFunction(4, 3); // Function is called, return value will end up in x

function myFunction(a, b) {
    return a * b;   // Function returns the product of a and b
}
x;
`;
  snippet3 = `function toCelsius(fahrenheit) {
    return (5/9) * (fahrenheit-32);
}
console.log(toCelsius(77));
`;

  returnExerciseSnippet = `var x = fullName("Aleksandar", "Aleksandrov"); // Function is called, return value will end up in x

function fullName(firstName, lastName) {
  // TODO: Implement this
}
x;
`;

  returnValidator(result) {
    console.log("Validate ", result);
    if (!result.isSuccess) {
      return false;
    }

    if (
      !result.context.fullName ||
      result.context.fullName("a", "b") !== "a b"
    ) {
      return false;
    }
    return true;
  }

  constructor(private lessonSvc: LessonsService) {}

  ngOnInit() {}
}
