import { Query } from 'mongoose';

export class APIFeatures<T> {
  constructor(
    public query: Query<T[], T>,
    public queryString: Record<string, any>,
  ) {}

  search(fields: string[] = []) {
    if (this.queryString.search) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const searchWord = this.queryString.search;

      const orConditions = fields.map((f) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [f]: { $regex: searchWord, $options: 'i' },
      }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.query = this.query.find({ $or: orConditions }) as any;
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.query = this.query.find(JSON.parse(queryStr)) as any;
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
