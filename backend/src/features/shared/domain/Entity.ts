export abstract class Entity<T> {
  protected readonly _id: T;
  protected readonly _createdAt: Date;

  constructor(id: T, createdAt: Date = new Date()) {
    this._id = id;
    this._createdAt = createdAt;
  }

  get id(): T {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  equals(other: Entity<T>): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }
    return this._id === other._id;
  }
}
