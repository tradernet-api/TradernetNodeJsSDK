export class Frame {
  constructor(
    readonly event: string,
    readonly data: unknown,
    readonly raw: unknown = null,
  ) {}
}
