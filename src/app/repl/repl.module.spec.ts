import { ReplModule } from './repl.module';

describe('ReplModule', () => {
  let replModule: ReplModule;

  beforeEach(() => {
    replModule = new ReplModule();
  });

  it('should create an instance', () => {
    expect(replModule).toBeTruthy();
  });
});
