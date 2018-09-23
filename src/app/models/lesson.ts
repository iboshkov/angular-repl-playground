export class Lesson {
  constructor(public id: string, public done: boolean = false) {}
}

export class Exercise {
  constructor(public id: string, public exp = 100, public doneBy = []) {}
}
