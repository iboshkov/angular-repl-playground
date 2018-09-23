import { levels } from "../levels";
export class User {
  public static exercisesPerLevel = 3;
  constructor(
    public id: string,
    public username: string,
    public password: string,
    public name: string,
    public exp
  ) {}
}
